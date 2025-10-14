/**
 * Hook para gerenciar status do beneficiário e assinatura
 * Integra com os serviços mais recentes de beneficiário e Asaas
 */

import { useState, useEffect } from 'react';
import { 
  getBeneficiaryByCPF, 
  getActivePlanByBeneficiaryUUID,
  canUseService,
  UserPlanView 
} from '../services/beneficiary-plan-service';
import { checkSubscriptionStatus } from '../services/asaas';

export interface BeneficiaryStatus {
  beneficiary: any | null;
  plan: UserPlanView | null;
  subscriptionStatus: any | null;
  loading: boolean;
  canUse: (serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition') => Promise<{
    canUse: boolean;
    reason?: string;
    available?: number;
  }>;
  refresh: () => Promise<void>;
}

export function useBeneficiaryStatus(cpf?: string): BeneficiaryStatus {
  const [beneficiary, setBeneficiary] = useState<any | null>(null);
  const [plan, setPlan] = useState<UserPlanView | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadBeneficiaryData = async () => {
    if (!cpf) return;

    try {
      setLoading(true);
      
      // Buscar beneficiário por CPF
      const beneficiaryData = await getBeneficiaryByCPF(cpf);
      setBeneficiary(beneficiaryData);

      if (beneficiaryData?.beneficiary_uuid) {
        // Buscar plano ativo
        const planData = await getActivePlanByBeneficiaryUUID(beneficiaryData.beneficiary_uuid);
        setPlan(planData);

        // Verificar status da assinatura
        const subStatus = await checkSubscriptionStatus(beneficiaryData.beneficiary_uuid);
        setSubscriptionStatus(subStatus);
      } else {
        setPlan(null);
        setSubscriptionStatus(null);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do beneficiário:', error);
      setBeneficiary(null);
      setPlan(null);
      setSubscriptionStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const canUseServiceWrapper = async (
    serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition'
  ) => {
    if (!beneficiary?.beneficiary_uuid) {
      return {
        canUse: false,
        reason: 'Beneficiário não encontrado'
      };
    }

    // Verificar se a assinatura está ativa
    if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription) {
      return {
        canUse: false,
        reason: 'Assinatura inativa. Por favor, regularize seu pagamento.'
      };
    }

    return await canUseService(beneficiary.beneficiary_uuid, serviceType);
  };

  const refresh = async () => {
    await loadBeneficiaryData();
  };

  useEffect(() => {
    loadBeneficiaryData();
  }, [cpf]);

  return {
    beneficiary,
    plan,
    subscriptionStatus,
    loading,
    canUse: canUseServiceWrapper,
    refresh,
  };
}