import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import {
  createCompleteSubscription,
  checkSubscriptionStatus,
  cancelSubscription,
  getSubscriptionPayments,
} from '../services/asaas';

interface SubscriptionData {
  hasActiveSubscription: boolean;
  status: string;
  subscription?: any;
  nextPayment?: any;
  payments?: any[];
}

interface UseSubscriptionReturn {
  subscriptionData: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  createSubscription: (data: any) => Promise<any>;
  cancelSubscription: () => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
  getPaymentHistory: () => Promise<any[]>;
}

/**
 * Hook para gerenciar assinaturas do beneficiário
 */
export function useSubscription(beneficiaryUuid: string): UseSubscriptionReturn {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carregar dados da assinatura
   */
  const loadSubscription = async () => {
    if (!beneficiaryUuid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await checkSubscriptionStatus(beneficiaryUuid);
      setSubscriptionData(data);
    } catch (err: any) {
      logger.error('Erro ao carregar assinatura', err as Error);
      setError(err.message || 'Erro ao carregar assinatura');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Criar nova assinatura
   */
  const createSubscription = async (data: {
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
    creditCard?: {
      holderName: string;
      number: string;
      expiryMonth: string;
      expiryYear: string;
      ccv: string;
    };
  }) => {
    try {
      setLoading(true);
      setError(null);

      const result = await createCompleteSubscription({
        ...data,
        beneficiaryUuid,
      });

      if (result.success) {
        // Recarregar dados da assinatura
        await loadSubscription();
      } else {
        setError(result.error || 'Erro ao criar assinatura');
      }

      return result;
    } catch (err: any) {
      logger.error('Erro ao criar assinatura', err as Error);
      setError(err.message || 'Erro ao criar assinatura');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancelar assinatura
   */
  const handleCancelSubscription = async (): Promise<boolean> => {
    if (!subscriptionData?.subscription?.id) {
      setError('Nenhuma assinatura ativa para cancelar');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      await cancelSubscription(subscriptionData.subscription.id, beneficiaryUuid);
      
      // Recarregar dados
      await loadSubscription();
      
      return true;
    } catch (err: any) {
      logger.error('Erro ao cancelar assinatura', err as Error);
      setError(err.message || 'Erro ao cancelar assinatura');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Buscar histórico de pagamentos
   */
  const getPaymentHistory = async (): Promise<any[]> => {
    if (!subscriptionData?.subscription?.id) {
      return [];
    }

    try {
      const payments = await getSubscriptionPayments(subscriptionData.subscription.id);
      return payments;
    } catch (err: any) {
      logger.error('Erro ao buscar histórico de pagamentos', err as Error);
      setError(err.message || 'Erro ao buscar histórico');
      return [];
    }
  };

  /**
   * Atualizar dados da assinatura
   */
  const refreshSubscription = async () => {
    await loadSubscription();
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadSubscription();
  }, [beneficiaryUuid]);

  return {
    subscriptionData,
    loading,
    error,
    createSubscription,
    cancelSubscription: handleCancelSubscription,
    refreshSubscription,
    getPaymentHistory,
  };
}

/**
 * Formatar status da assinatura para exibição
 */
export function formatSubscriptionStatus(status: string): {
  text: string;
  color: string;
} {
  const statusMap: Record<string, { text: string; color: string }> = {
    ACTIVE: { text: 'Ativa', color: '#10b981' },
    INACTIVE: { text: 'Inativa', color: '#6b7280' },
    OVERDUE: { text: 'Vencida', color: '#ef4444' },
    CANCELED: { text: 'Cancelada', color: '#f59e0b' },
    REFUNDED: { text: 'Reembolsada', color: '#8b5cf6' },
    NO_SUBSCRIPTION: { text: 'Sem assinatura', color: '#6b7280' },
    ERROR: { text: 'Erro', color: '#ef4444' },
  };

  return statusMap[status] || { text: status, color: '#6b7280' };
}

/**
 * Formatar método de pagamento para exibição
 */
export function formatBillingType(billingType: string): string {
  const billingMap: Record<string, string> = {
    CREDIT_CARD: 'Cartão de Crédito',
    PIX: 'PIX',
    BOLETO: 'Boleto',
  };

  return billingMap[billingType] || billingType;
}

