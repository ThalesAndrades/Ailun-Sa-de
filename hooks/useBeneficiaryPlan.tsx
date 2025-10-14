import { useState, useEffect } from 'react';
import { 
  getBeneficiaryByUUID,
  getActivePlanByBeneficiaryUUID,
  canUseService,
  incrementServiceUsage,
  recordConsultation,
  updateConsultationStatus,
  getConsultationHistory,
  type Beneficiary,
  type UserPlanView
} from '../services/beneficiary-plan-service';

export interface UseBeneficiaryPlanReturn {
  beneficiary: Beneficiary | null;
  plan: UserPlanView | null;
  loading: boolean;
  error: string | null;
  canUse: (serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition') => Promise<{ canUse: boolean; reason?: string; available?: number }>;
  incrementUsage: (serviceType: 'psychology' | 'nutrition') => Promise<{ success: boolean; error?: string }>;
  recordConsult: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateConsultStatus: (consultationId: string, status: any, additionalData?: any) => Promise<{ success: boolean; error?: string }>;
  getHistory: (beneficiaryId: string, limit?: number) => Promise<any[]>;
  refreshData: () => Promise<void>;
}

export function useBeneficiaryPlan(beneficiaryUuid: string | null): UseBeneficiaryPlanReturn {
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  const [plan, setPlan] = useState<UserPlanView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!beneficiaryUuid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar beneficiário
      const beneficiaryDataResult = await getBeneficiaryByUUID(beneficiaryUuid);
      if (beneficiaryDataResult.error) {
        throw new Error(`Erro ao carregar dados do beneficiário: ${beneficiaryDataResult.error}`);
      }
      setBeneficiary(beneficiaryDataResult.data);

      // Buscar plano ativo
      const planDataResult = await getActivePlanByBeneficiaryUUID(beneficiaryUuid);
      if (planDataResult.error) {
        throw new Error(`Erro ao carregar plano ativo: ${planDataResult.error}`);
      }
      setPlan(planDataResult.data);

    } catch (err: any) {
      console.error('[useBeneficiaryPlan] Erro ao carregar dados:', err);
      setError(err.message || 'Ocorreu um erro inesperado ao carregar os dados do plano.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [beneficiaryUuid]);

  const canUse = async (serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition') => {
    if (!beneficiaryUuid) {
      return { canUse: false, reason: 'Beneficiário não identificado' };
    }
    return await canUseService(beneficiaryUuid, serviceType);
  };

  const incrementUsage = async (serviceType: 'psychology' | 'nutrition') => {
    if (!beneficiaryUuid) {
      return { success: false, error: 'Beneficiário não identificado' };
    }
    const result = await incrementServiceUsage(beneficiaryUuid, serviceType);
    if (result.success) {
      // Atualizar dados locais
      await loadData();
    }
    return result;
  };

  const recordConsult = async (data: any) => {
    return await recordConsultation(data);
  };

  const updateConsultStatus = async (consultationId: string, status: any, additionalData?: any) => {
    return await updateConsultationStatus(consultationId, status, additionalData);
  };

  const getHistory = async (beneficiaryId: string, limit?: number) => {
    return await getConsultationHistory(beneficiaryId, limit);
  };

  const refreshData = async () => {
    await loadData();
  };

  return {
    beneficiary,
    plan,
    loading,
    error,
    canUse,
    incrementUsage,
    recordConsult,
    updateConsultStatus,
    getHistory,
    refreshData,
  };
}