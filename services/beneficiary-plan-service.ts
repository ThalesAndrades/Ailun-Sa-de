/**
 * Serviço de Gerenciamento de Beneficiários e Planos
 * Integra o reconhecimento de beneficiários e associação de planos
 */

import { supabase } from './supabase';

export interface Beneficiary {
  id: string;
  user_id: string;
  beneficiary_uuid: string;
  cpf: string;
  full_name: string;
  birth_date: string;
  email: string;
  phone: string;
  service_type: 'G' | 'GS' | 'GSP';
  is_primary: boolean;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  user_id: string;
  beneficiary_id: string;
  plan_name: string;
  service_type: 'G' | 'GS' | 'GSP';
  include_clinical: boolean;
  include_specialists: boolean;
  include_psychology: boolean;
  include_nutrition: boolean;
  member_count: number;
  discount_percentage: number;
  base_price: number;
  total_price: number;
  asaas_customer_id?: string;
  asaas_subscription_id?: string;
  payment_method?: 'credit_card' | 'pix' | 'boleto';
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  status: 'active' | 'pending' | 'suspended' | 'cancelled' | 'expired';
  next_billing_date?: string;
  psychology_limit: number;
  nutrition_limit: number;
  psychology_used: number;
  nutrition_used: number;
  psychology_available?: number;
  nutrition_available?: number;
  created_at: string;
  updated_at: string;
}

export interface UserPlanView {
  plan_id: string;
  user_id: string;
  beneficiary_uuid: string;
  beneficiary_name: string;
  cpf: string;
  plan_name: string;
  service_type: 'G' | 'GS' | 'GSP';
  include_clinical: boolean;
  include_specialists: boolean;
  include_psychology: boolean;
  include_nutrition: boolean;
  member_count: number;
  discount_percentage: number;
  total_price: number;
  plan_status: string;
  next_billing_date?: string;
  psychology_limit: number;
  psychology_used: number;
  psychology_available: number;
  nutrition_limit: number;
  nutrition_used: number;
  nutrition_available: number;
  created_at: string;
  updated_at: string;
}

/**
 * Buscar beneficiário por CPF
 */
export async function getBeneficiaryByCPF(cpf: string): Promise<{ success: boolean; data?: Beneficiary; error?: string }> {
  try {
    const cleanCPF = cpf.replace(/\D/g, '');
    
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('cpf', cleanCPF)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Beneficiário não encontrado.' };
      }
      console.error('[getBeneficiaryByCPF] Erro:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[getBeneficiaryByCPF] Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Buscar beneficiário por UUID da RapiDoc
 */
export async function getBeneficiaryByUUID(beneficiaryUuid: string): Promise<{ success: boolean; data?: Beneficiary; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('beneficiary_uuid', beneficiaryUuid)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Beneficiário não encontrado.' };
      }
      console.error('[getBeneficiaryByUUID] Erro:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[getBeneficiaryByUUID] Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Criar beneficiário no Supabase
 */
export async function createBeneficiary(data: {
  user_id: string;
  beneficiary_uuid: string;
  cpf: string;
  full_name: string;
  birth_date: string;
  email: string;
  phone: string;
  service_type: 'G' | 'GS' | 'GSP';
  is_primary?: boolean;
}): Promise<{ success: boolean; data?: Beneficiary; error?: string }> {
  try {
    const cleanCPF = data.cpf.replace(/\D/g, '');

    const { data: beneficiary, error } = await supabase
      .from('beneficiaries')
      .insert({
        user_id: data.user_id,
        beneficiary_uuid: data.beneficiary_uuid,
        cpf: cleanCPF,
        full_name: data.full_name,
        birth_date: data.birth_date,
        email: data.email,
        phone: data.phone.replace(/\D/g, ''),
        service_type: data.service_type,
        is_primary: data.is_primary !== undefined ? data.is_primary : true,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data: beneficiary };
  } catch (error: any) {
    console.error('[createBeneficiary] Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Buscar plano ativo do usuário
 */
export async function getActivePlan(userId: string): Promise<{ success: boolean; data?: UserPlanView; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('v_user_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('plan_status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Nenhum plano ativo encontrado.' };
      }
      console.error('[getActivePlan] Erro:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[getActivePlan] Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Buscar plano ativo por UUID do beneficiário
 */
export async function getActivePlanByBeneficiaryUUID(
  beneficiaryUuid: string
): Promise<{ success: boolean; data?: UserPlanView; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('v_user_plans')
      .select('*')
      .eq('beneficiary_uuid', beneficiaryUuid)
      .eq('plan_status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Nenhum plano ativo encontrado para o beneficiário.' };
      }
      console.error('[getActivePlanByBeneficiaryUUID] Erro:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('[getActivePlanByBeneficiaryUUID] Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Criar plano de assinatura
 */
export async function createSubscriptionPlan(data: {
  user_id: string;
  beneficiary_id: string;
  plan_name: string;
  service_type: 'G' | 'GS' | 'GSP';
  include_clinical: boolean;
  include_specialists: boolean;
  include_psychology: boolean;
  include_nutrition: boolean;
  member_count: number;
  discount_percentage: number;
  base_price: number;
  total_price: number;
  asaas_customer_id?: string;
  asaas_subscription_id?: string;
  payment_method?: 'credit_card' | 'pix' | 'boleto';
}): Promise<{ success: boolean; data?: SubscriptionPlan; error?: string }> {
  try {
    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert({
        user_id: data.user_id,
        beneficiary_id: data.beneficiary_id,
        plan_name: data.plan_name,
        service_type: data.service_type,
        include_clinical: data.include_clinical,
        include_specialists: data.include_specialists,
        include_psychology: data.include_psychology,
        include_nutrition: data.include_nutrition,
        member_count: data.member_count,
        discount_percentage: data.discount_percentage,
        base_price: data.base_price,
        total_price: data.total_price,
        asaas_customer_id: data.asaas_customer_id,
        asaas_subscription_id: data.asaas_subscription_id,
        payment_method: data.payment_method,
        billing_cycle: 'monthly',
        status: 'active',
        psychology_limit: 2,
        nutrition_limit: 1,
        psychology_used: 0,
        nutrition_used: 0,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data: plan };
  } catch (error: any) {
    console.error('[createSubscriptionPlan] Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar se o usuário pode usar um serviço
 */
export async function canUseService(
  beneficiaryUuid: string,
  serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition'
): Promise<{ canUse: boolean; reason?: string; available?: number }> {
  try {
    const plan = await getActivePlanByBeneficiaryUUID(beneficiaryUuid);

    if (!plan) {
      return { canUse: false, reason: 'Nenhum plano ativo encontrado' };
    }

    if (plan.plan_status !== 'active') {
      return { canUse: false, reason: 'Plano não está ativo' };
    }

    // Verificar serviço específico
    switch (serviceType) {
      case 'clinical':
        if (!plan.include_clinical) {
          return { canUse: false, reason: 'Serviço clínico não incluído no plano' };
        }
        return { canUse: true };

      case 'specialist':
        if (!plan.include_specialists) {
          return { canUse: false, reason: 'Especialistas não incluídos no plano' };
        }
        return { canUse: true };

      case 'psychology':
        if (!plan.include_psychology) {
          return { canUse: false, reason: 'Psicologia não incluída no plano' };
        }
        if (plan.psychology_available <= 0) {
          return { 
            canUse: false, 
            reason: 'Limite mensal de consultas de psicologia atingido',
            available: 0
          };
        }
        return { canUse: true, available: plan.psychology_available };

      case 'nutrition':
        if (!plan.include_nutrition) {
          return { canUse: false, reason: 'Nutrição não incluída no plano' };
        }
        if (plan.nutrition_available <= 0) {
          return { 
            canUse: false, 
            reason: 'Limite trimestral de consultas de nutrição atingido',
            available: 0
          };
        }
        return { canUse: true, available: plan.nutrition_available };

      default:
        return { canUse: false, reason: 'Tipo de serviço inválido' };
    }
  } catch (error) {
    console.error('[canUseService] Erro:', error);
    return { canUse: false, reason: 'Erro ao verificar serviço' };
  }
}

/**
 * Incrementar uso de serviço
 */
export async function incrementServiceUsage(
  beneficiaryUuid: string,
  serviceType: 'psychology' | 'nutrition'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('increment_service_usage', {
      p_beneficiary_uuid: beneficiaryUuid,
      p_service_type: serviceType,
    });

    if (error) {
      throw error;
    }

    if (!data) {
      return { success: false, error: 'Não foi possível incrementar o uso do serviço' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('[incrementServiceUsage] Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Registrar consulta no histórico
 */
export async function recordConsultation(data: {
  beneficiary_id: string;
  subscription_plan_id: string;
  service_type: 'clinical' | 'specialist' | 'psychology' | 'nutrition';
  specialty?: string;
  professional_name?: string;
  professional_id?: string;
  session_id?: string;
  consultation_url?: string;
  status?: 'pending' | 'active' | 'completed' | 'cancelled' | 'no_show';
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data: consultation, error } = await supabase
      .from('consultation_history')
      .insert({
        beneficiary_id: data.beneficiary_id,
        subscription_plan_id: data.subscription_plan_id,
        service_type: data.service_type,
        specialty: data.specialty,
        professional_name: data.professional_name,
        professional_id: data.professional_id,
        session_id: data.session_id,
        consultation_url: data.consultation_url,
        status: data.status || 'pending',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data: consultation };
  } catch (error: any) {
    console.error('[recordConsultation] Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Atualizar status da consulta
 */
export async function updateConsultationStatus(
  consultationId: string,
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'no_show',
  additionalData?: {
    started_at?: string;
    completed_at?: string;
    rating?: number;
    feedback?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = { status };

    if (additionalData) {
      if (additionalData.started_at) updateData.started_at = additionalData.started_at;
      if (additionalData.completed_at) updateData.completed_at = additionalData.completed_at;
      if (additionalData.rating) updateData.rating = additionalData.rating;
      if (additionalData.feedback) updateData.feedback = additionalData.feedback;
    }

    const { error } = await supabase
      .from('consultation_history')
      .update(updateData)
      .eq('id', consultationId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('[updateConsultationStatus] Erro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Buscar histórico de consultas do beneficiário
 */
export async function getConsultationHistory(
  beneficiaryId: string,
  limit: number = 10
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('consultation_history')
      .select('*')
      .eq('beneficiary_id', beneficiaryId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[getConsultationHistory] Erro:', error);
    return [];
  }
}

