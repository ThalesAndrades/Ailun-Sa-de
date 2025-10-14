/**
 * Serviço de Gerenciamento de Planos de Assinatura
 * 
 * Este serviço gerencia a criação, atualização e consulta de planos de assinatura no Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import { auditService, AuditEventType, AuditEventStatus } from './audit-service';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Interface para dados do plano de assinatura
export interface SubscriptionPlanData {
  userId: string;
  beneficiaryId: string;
  serviceType: string; // 'G', 'GP', 'GS', 'GSP'
  includeSpecialists: boolean;
  includePsychology: boolean;
  includeNutrition: boolean;
  memberCount: number;
  monthlyPrice: number;
  discountPercentage: number;
  asaasCustomerId?: string;
  asaasSubscriptionId?: string;
  status?: 'active' | 'pending' | 'cancelled' | 'suspended';
  startDate?: string;
  nextBillingDate?: string;
}

// Interface para plano de assinatura
export interface SubscriptionPlan {
  id: string;
  user_id: string;
  beneficiary_id: string;
  service_type: string;
  include_specialists: boolean;
  include_psychology: boolean;
  include_nutrition: boolean;
  member_count: number;
  monthly_price: number;
  discount_percentage: number;
  asaas_customer_id?: string;
  asaas_subscription_id?: string;
  status: string;
  start_date: string;
  next_billing_date: string;
  created_at: string;
  updated_at: string;
}

/**
 * Criar um novo plano de assinatura
 */
export async function createSubscriptionPlan(
  data: SubscriptionPlanData
): Promise<{ success: boolean; plan?: SubscriptionPlan; error?: string }> {
  try {
    const now = new Date().toISOString();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const planData = {
      user_id: data.userId,
      beneficiary_id: data.beneficiaryId,
      service_type: data.serviceType,
      include_specialists: data.includeSpecialists,
      include_psychology: data.includePsychology,
      include_nutrition: data.includeNutrition,
      member_count: data.memberCount,
      monthly_price: data.monthlyPrice,
      discount_percentage: data.discountPercentage,
      asaas_customer_id: data.asaasCustomerId || null,
      asaas_subscription_id: data.asaasSubscriptionId || null,
      status: data.status || 'pending',
      start_date: data.startDate || now,
      next_billing_date: data.nextBillingDate || nextMonth.toISOString(),
      created_at: now,
      updated_at: now,
    };

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .insert(planData)
      .select()
      .single();

    if (error) {
      console.error('[createSubscriptionPlan] Erro:', error);
      return { success: false, error: error.message };
    }

    // Registrar evento de auditoria
    await auditService.logEvent({
      eventType: AuditEventType.PLAN_ASSIGNED,
      userId: data.userId,
      status: AuditEventStatus.SUCCESS,
      eventData: {
        planId: plan.id,
        serviceType: data.serviceType,
        memberCount: data.memberCount,
        monthlyPrice: data.monthlyPrice,
      },
    });

    return { success: true, plan };
  } catch (error: any) {
    console.error('[createSubscriptionPlan] Erro inesperado:', error);
    
    // Registrar evento de auditoria de falha
    await auditService.logEvent({
      eventType: AuditEventType.PLAN_ASSIGNED,
      userId: data.userId,
      status: AuditEventStatus.FAILURE,
      errorMessage: error.message,
      errorStack: error.stack,
    });

    return { success: false, error: error.message };
  }
}

/**
 * Atualizar um plano de assinatura existente
 */
export async function updateSubscriptionPlan(
  planId: string,
  updates: Partial<SubscriptionPlanData>
): Promise<{ success: boolean; plan?: SubscriptionPlan; error?: string }> {
  try {
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Remover campos que não devem ser atualizados diretamente
    delete updateData.userId;
    delete updateData.beneficiaryId;

    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .update(updateData)
      .eq('id', planId)
      .select()
      .single();

    if (error) {
      console.error('[updateSubscriptionPlan] Erro:', error);
      return { success: false, error: error.message };
    }

    // Registrar evento de auditoria
    await auditService.logEvent({
      eventType: AuditEventType.PLAN_UPDATED,
      userId: plan.user_id,
      status: AuditEventStatus.SUCCESS,
      eventData: {
        planId,
        updates,
      },
    });

    return { success: true, plan };
  } catch (error: any) {
    console.error('[updateSubscriptionPlan] Erro inesperado:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obter plano de assinatura ativo de um usuário
 */
export async function getActiveSubscriptionPlan(
  userId: string
): Promise<{ success: boolean; plan?: SubscriptionPlan; error?: string }> {
  try {
    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Nenhum plano encontrado
        return { success: true, plan: undefined };
      }
      console.error('[getActiveSubscriptionPlan] Erro:', error);
      return { success: false, error: error.message };
    }

    return { success: true, plan };
  } catch (error: any) {
    console.error('[getActiveSubscriptionPlan] Erro inesperado:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancelar um plano de assinatura
 */
export async function cancelSubscriptionPlan(
  planId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('subscription_plans')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', planId);

    if (error) {
      console.error('[cancelSubscriptionPlan] Erro:', error);
      return { success: false, error: error.message };
    }

    // Registrar evento de auditoria
    await auditService.logEvent({
      eventType: AuditEventType.PLAN_CANCELLED,
      userId,
      status: AuditEventStatus.SUCCESS,
      eventData: {
        planId,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('[cancelSubscriptionPlan] Erro inesperado:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obter histórico de planos de um usuário
 */
export async function getUserSubscriptionHistory(
  userId: string
): Promise<{ success: boolean; plans?: SubscriptionPlan[]; error?: string }> {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getUserSubscriptionHistory] Erro:', error);
      return { success: false, error: error.message };
    }

    return { success: true, plans: plans || [] };
  } catch (error: any) {
    console.error('[getUserSubscriptionHistory] Erro inesperado:', error);
    return { success: false, error: error.message };
  }
}

export default {
  createSubscriptionPlan,
  updateSubscriptionPlan,
  getActiveSubscriptionPlan,
  cancelSubscriptionPlan,
  getUserSubscriptionHistory,
};

