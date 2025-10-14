import { supabase } from '../services/supabase';
import { RAPIDOC_CONFIG } from '../config/rapidoc.config';

/**
 * Verificar status de sincronização do sistema
 */
export async function checkSystemSyncStatus() {
  const status = {
    supabase: false,
    rapidoc: false,
    beneficiaries: 0,
    activePlans: 0,
    errors: [] as string[],
  };

  try {
    // Verificar conexão Supabase
    const { data: supabaseTest, error: supabaseError } = await supabase
      .from('beneficiaries')
      .select('count', { count: 'exact', head: true });

    if (supabaseError) {
      status.errors.push(`Supabase: ${supabaseError.message}`);
    } else {
      status.supabase = true;
      status.beneficiaries = supabaseTest?.count || 0;
    }

    // Verificar planos ativos
    const { data: plansTest, error: plansError } = await supabase
      .from('subscription_plans')
      .select('count', { count: 'exact', head: true })
      .eq('status', 'active');

    if (plansError) {
      status.errors.push(`Planos: ${plansError.message}`);
    } else {
      status.activePlans = plansTest?.count || 0;
    }

    // Verificar conexão RapiDoc
    try {
      const rapidocResponse = await fetch(`${RAPIDOC_CONFIG.baseUrl}beneficiaries`, {
        method: 'HEAD',
        headers: RAPIDOC_CONFIG.headers,
      });

      status.rapidoc = rapidocResponse.ok;
      if (!rapidocResponse.ok) {
        status.errors.push(`RapiDoc: Status ${rapidocResponse.status}`);
      }
    } catch (error: any) {
      status.errors.push(`RapiDoc: ${error.message}`);
    }

  } catch (error: any) {
    status.errors.push(`Sistema: ${error.message}`);
  }

  return status;
}

/**
 * Sincronizar beneficiário com RapiDoc
 */
export async function syncBeneficiaryWithRapidoc(
  beneficiaryUuid: string,
  beneficiaryData: {
    cpf: string;
    name: string;
    birthDate: string;
    email: string;
    phone: string;
    serviceType: 'G' | 'GS' | 'GSP';
  }
) {
  try {
    const response = await fetch(`${RAPIDOC_CONFIG.baseUrl}beneficiaries/${beneficiaryUuid}`, {
      method: 'PUT',
      headers: RAPIDOC_CONFIG.headers,
      body: JSON.stringify(beneficiaryData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erro na sincronização');
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verificar integridade dos dados
 */
export async function verifyDataIntegrity() {
  const issues = [];

  try {
    // Verificar beneficiários sem plano
    const { data: beneficiariesWithoutPlan } = await supabase
      .from('beneficiaries')
      .select('id, full_name, cpf')
      .not('id', 'in', `(
        SELECT beneficiary_id 
        FROM subscription_plans 
        WHERE status = 'active'
      )`);

    if (beneficiariesWithoutPlan?.length) {
      issues.push({
        type: 'missing_plans',
        count: beneficiariesWithoutPlan.length,
        description: 'Beneficiários sem plano ativo',
        items: beneficiariesWithoutPlan,
      });
    }

    // Verificar planos sem beneficiário
    const { data: orphanPlans } = await supabase
      .from('subscription_plans')
      .select('id, plan_name')
      .not('beneficiary_id', 'in', '(SELECT id FROM beneficiaries)');

    if (orphanPlans?.length) {
      issues.push({
        type: 'orphan_plans',
        count: orphanPlans.length,
        description: 'Planos sem beneficiário',
        items: orphanPlans,
      });
    }

    // Verificar service_type inconsistente
    const { data: inconsistentServiceTypes } = await supabase
      .from('beneficiaries')
      .select('id, full_name, service_type, subscription_plans(service_type)')
      .not('service_type', 'eq', 'subscription_plans.service_type');

    if (inconsistentServiceTypes?.length) {
      issues.push({
        type: 'inconsistent_service_types',
        count: inconsistentServiceTypes.length,
        description: 'Service types inconsistentes',
        items: inconsistentServiceTypes,
      });
    }

  } catch (error: any) {
    issues.push({
      type: 'error',
      description: `Erro na verificação: ${error.message}`,
    });
  }

  return issues;
}

/**
 * Corrigir inconsistências automáticas
 */
export async function autoFixDataIssues() {
  const fixes = [];

  try {
    // Criar planos para beneficiários sem plano
    const { data: beneficiariesWithoutPlan } = await supabase
      .from('beneficiaries')
      .select('*')
      .not('id', 'in', `(
        SELECT beneficiary_id 
        FROM subscription_plans 
        WHERE status = 'active'
      )`);

    for (const beneficiary of beneficiariesWithoutPlan || []) {
      const { error } = await supabase
        .from('subscription_plans')
        .insert({
          user_id: beneficiary.user_id,
          beneficiary_id: beneficiary.id,
          plan_name: 'Clínico + Especialistas',
          service_type: 'GS',
          include_clinical: true,
          include_specialists: true,
          include_psychology: false,
          include_nutrition: false,
          member_count: 1,
          discount_percentage: 0,
          base_price: 79.90,
          total_price: 79.90,
          billing_cycle: 'monthly',
          status: 'active',
          psychology_limit: 2,
          nutrition_limit: 1,
          psychology_used: 0,
          nutrition_used: 0,
        });

      if (error) {
        fixes.push({
          type: 'error',
          beneficiary: beneficiary.full_name,
          error: error.message,
        });
      } else {
        fixes.push({
          type: 'plan_created',
          beneficiary: beneficiary.full_name,
          success: true,
        });
      }
    }

    // Atualizar service_types para GS
    const { error: updateError } = await supabase
      .from('beneficiaries')
      .update({ service_type: 'GS' })
      .neq('service_type', 'GS');

    if (!updateError) {
      fixes.push({
        type: 'service_types_updated',
        success: true,
      });
    }

  } catch (error: any) {
    fixes.push({
      type: 'error',
      error: error.message,
    });
  }

  return fixes;
}