/**
 * Hook Integrado do Sistema AiLun Saúde
 * Gerencia todas as integrações de forma unificada
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { integratedSystemService, SystemUser } from '../services/integrated-system-service';
import { ProductionLogger } from '../utils/production-logger';

interface UseIntegratedSystemReturn {
  // Estados do usuário
  systemUser: SystemUser | null;
  loading: boolean;
  error: string | null;
  
  // Funções principais
  refreshUserStatus: () => Promise<void>;
  syncBeneficiary: (userData: {
    full_name: string;
    email: string;
    cpf: string;
    phone: string;
    birth_date: string;
  }) => Promise<{ success: boolean; beneficiaryUuid?: string; error?: string }>;
  
  createSubscription: (subscriptionData: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    postalCode: string;
    address: string;
    addressNumber: string;
    complement?: string;
    province: string;
    billingType: 'CREDIT_CARD' | 'PIX';
    creditCard?: any;
  }) => Promise<{ success: boolean; subscription?: any; error?: string }>;
  
  requestConsultation: (serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition') => Promise<{
    success: boolean;
    consultationUrl?: string;
    sessionId?: string;
    error?: string;
  }>;
  
  // Status helpers
  isActiveBeneficiary: boolean;
  hasActiveSubscription: boolean;
  canUseService: (serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition') => boolean;
}

const logger = new ProductionLogger('useIntegratedSystem');

export const useIntegratedSystem = (): UseIntegratedSystemReturn => {
  const { user, loading: authLoading } = useAuth();
  const [systemUser, setSystemUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar status do usuário quando autenticado
  useEffect(() => {
    if (user && !authLoading) {
      refreshUserStatus();
    } else if (!user) {
      setSystemUser(null);
      setError(null);
    }
  }, [user, authLoading]);

  const refreshUserStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const result = await integratedSystemService.getUserCompleteStatus(user.id);

      if (result.success) {
        setSystemUser(result.user || null);
        logger.info('Status do usuário atualizado', {
          userId: user.id,
          isActiveBeneficiary: result.user?.beneficiary?.status === 'active',
          hasSubscription: !!result.user?.subscription
        });
      } else {
        setError(result.error || 'Erro ao carregar status do usuário');
        logger.error('Erro ao atualizar status', { error: result.error });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado';
      setError(errorMessage);
      logger.error('Erro inesperado ao carregar status', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const syncBeneficiary = async (userData: {
    full_name: string;
    email: string;
    cpf: string;
    phone: string;
    birth_date: string;
  }) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await integratedSystemService.syncBeneficiaryWithRapidoc(user.id, userData);

      if (result.success) {
        // Atualizar status após sincronização
        await refreshUserStatus();
        logger.info('Beneficiário sincronizado com sucesso', {
          userId: user.id,
          beneficiaryUuid: result.beneficiaryUuid
        });
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao sincronizar beneficiário';
      setError(errorMessage);
      logger.error('Erro na sincronização do beneficiário', { error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (subscriptionData: {
    name: string;
    email: string;
    cpf: string;
    phone: string;
    postalCode: string;
    address: string;
    addressNumber: string;
    complement?: string;
    province: string;
    billingType: 'CREDIT_CARD' | 'PIX';
    creditCard?: any;
  }) => {
    if (!user || !systemUser?.beneficiary) {
      return { success: false, error: 'Beneficiário não encontrado' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await integratedSystemService.createCompleteSubscription(
        user.id,
        systemUser.beneficiary.beneficiary_uuid,
        subscriptionData
      );

      if (result.success) {
        // Atualizar status após criação da assinatura
        await refreshUserStatus();
        logger.info('Assinatura criada com sucesso', {
          userId: user.id,
          subscriptionId: result.subscription?.id
        });
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao criar assinatura';
      setError(errorMessage);
      logger.error('Erro na criação da assinatura', { error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const requestConsultation = async (serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition') => {
    if (!systemUser?.beneficiary) {
      return { success: false, error: 'Beneficiário não encontrado' };
    }

    try {
      setLoading(true);
      setError(null);

      const result = await integratedSystemService.requestIntegratedConsultation(
        systemUser.beneficiary.beneficiary_uuid,
        serviceType
      );

      if (result.success) {
        logger.info('Consulta solicitada com sucesso', {
          beneficiaryUuid: systemUser.beneficiary.beneficiary_uuid,
          serviceType,
          sessionId: result.sessionId
        });
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao solicitar consulta';
      setError(errorMessage);
      logger.error('Erro na solicitação de consulta', { error: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Status helpers
  const isActiveBeneficiary = systemUser?.beneficiary?.status === 'active';
  const hasActiveSubscription = systemUser?.subscription?.status === 'active';

  const canUseService = (serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition'): boolean => {
    if (!hasActiveSubscription || !systemUser?.subscription?.services) {
      return false;
    }

    return systemUser.subscription.services[serviceType] || false;
  };

  return {
    // Estados
    systemUser,
    loading: loading || authLoading,
    error,
    
    // Funções
    refreshUserStatus,
    syncBeneficiary,
    createSubscription,
    requestConsultation,
    
    // Status helpers
    isActiveBeneficiary,
    hasActiveSubscription,
    canUseService,
  };
};

export default useIntegratedSystem;