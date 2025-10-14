/**
 * Serviço de Beneficiários Integrados
 * Gerencia beneficiários ativos sincronizados do sistema legado
 */

import { supabase } from './supabase';

export interface IntegratedBeneficiary {
  id: string;
  user_id: string;
  beneficiary_uuid: string;
  cpf: string;
  full_name: string;
  birth_date: string;
  email: string;
  phone: string;
  service_type: string;
  is_primary: boolean;
  status: string;
  has_active_plan: boolean;
  created_at: string;
  updated_at: string;
}

export interface BeneficiaryPlan {
  id: string;
  plan_name: string;
  service_type: string;
  include_clinical: boolean;
  include_specialists: boolean;
  include_psychology: boolean;
  include_nutrition: boolean;
  status: string;
  total_price: number;
  next_billing_date: string;
}

export class IntegratedBeneficiaryService {
  /**
   * Verifica se um CPF é um beneficiário integrado ativo
   */
  async checkActiveBeneficiary(cpf: string): Promise<{
    success: boolean;
    isActive?: boolean;
    beneficiary?: IntegratedBeneficiary;
    plan?: BeneficiaryPlan;
    error?: string;
  }> {
    try {
      const cleanCPF = cpf.replace(/\D/g, '');
      
      if (!cleanCPF || cleanCPF.length !== 11) {
        return {
          success: false,
          error: 'CPF inválido'
        };
      }

      // Buscar beneficiário por CPF
      const { data: beneficiary, error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('cpf', cleanCPF)
        .eq('status', 'active')
        .single();

      if (beneficiaryError && beneficiaryError.code !== 'PGRST116') {
        return {
          success: false,
          error: 'Erro ao consultar beneficiário'
        };
      }

      if (!beneficiary) {
        return {
          success: true,
          isActive: false
        };
      }

      // Buscar plano ativo do beneficiário
      let plan = null;
      if (beneficiary.has_active_plan) {
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('beneficiary_id', beneficiary.id)
          .eq('status', 'active')
          .single();

        if (!planError && planData) {
          plan = planData;
        }
      }

      return {
        success: true,
        isActive: true,
        beneficiary,
        plan
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro interno ao verificar beneficiário'
      };
    }
  }

  /**
   * Busca beneficiário por user_id
   */
  async getBeneficiaryByUserId(userId: string): Promise<{
    success: boolean;
    beneficiary?: IntegratedBeneficiary;
    plan?: BeneficiaryPlan;
    error?: string;
  }> {
    try {
      // Buscar beneficiário
      const { data: beneficiary, error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (beneficiaryError) {
        return {
          success: false,
          error: 'Beneficiário não encontrado'
        };
      }

      // Buscar plano ativo
      let plan = null;
      if (beneficiary.has_active_plan) {
        const { data: planData, error: planError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single();

        if (!planError && planData) {
          plan = planData;
        }
      }

      return {
        success: true,
        beneficiary,
        plan
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro interno'
      };
    }
  }

  /**
   * Lista todos os beneficiários ativos integrados
   */
  async listActiveBeneficiaries(): Promise<{
    success: boolean;
    beneficiaries?: IntegratedBeneficiary[];
    error?: string;
  }> {
    try {
      const { data: beneficiaries, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('status', 'active')
        .eq('has_active_plan', true)
        .order('created_at', { ascending: false });

      if (error) {
        return {
          success: false,
          error: 'Erro ao listar beneficiários'
        };
      }

      return {
        success: true,
        beneficiaries: beneficiaries || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro interno'
      };
    }
  }

  /**
   * Verifica se um usuário tem acesso a serviços específicos
   */
  async checkServiceAccess(userId: string, serviceType: 'clinical' | 'specialists' | 'psychology' | 'nutrition'): Promise<{
    success: boolean;
    hasAccess?: boolean;
    remaining?: number;
    error?: string;
  }> {
    try {
      const beneficiaryResult = await this.getBeneficiaryByUserId(userId);
      
      if (!beneficiaryResult.success || !beneficiaryResult.plan) {
        return {
          success: false,
          error: 'Usuário não possui plano ativo'
        };
      }

      const plan = beneficiaryResult.plan;

      switch (serviceType) {
        case 'clinical':
          return {
            success: true,
            hasAccess: plan.include_clinical,
            remaining: plan.include_clinical ? -1 : 0 // -1 = ilimitado
          };

        case 'specialists':
          return {
            success: true,
            hasAccess: plan.include_specialists,
            remaining: plan.include_specialists ? -1 : 0
          };

        case 'psychology':
          const psychologyRemaining = (plan.psychology_limit || 0) - (plan.psychology_used || 0);
          return {
            success: true,
            hasAccess: plan.include_psychology && psychologyRemaining > 0,
            remaining: psychologyRemaining
          };

        case 'nutrition':
          const nutritionRemaining = (plan.nutrition_limit || 0) - (plan.nutrition_used || 0);
          return {
            success: true,
            hasAccess: plan.include_nutrition && nutritionRemaining > 0,
            remaining: nutritionRemaining
          };

        default:
          return {
            success: false,
            error: 'Tipo de serviço inválido'
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro interno'
      };
    }
  }

  /**
   * Registra uso de um serviço limitado
   */
  async recordServiceUsage(userId: string, serviceType: 'psychology' | 'nutrition'): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const column = serviceType === 'psychology' ? 'psychology_used' : 'nutrition_used';
      
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          [column]: supabase.raw(`${column} + 1`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        return {
          success: false,
          error: 'Erro ao registrar uso do serviço'
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro interno'
      };
    }
  }
}

// Instância singleton
export const integratedBeneficiaryService = new IntegratedBeneficiaryService();