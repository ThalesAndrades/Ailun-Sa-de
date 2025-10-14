import { supabase } from './supabase';

/**
 * Serviço de Orquestração de Consultas
 * Integração com as Edge Functions do Supabase
 */

const ORCHESTRATOR_FUNCTION = 'orchestrator';
const TEMA_ORCHESTRATOR_FUNCTION = 'tema-orchestrator';

// ==================== CONSULTAS ====================

/**
 * Iniciar uma nova consulta
 */
export const startConsultation = async (
  serviceType: 'doctor' | 'specialist' | 'psychologist' | 'nutritionist',
  specialty?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke(ORCHESTRATOR_FUNCTION, {
      body: {
        action: 'start_consultation',
        serviceType,
        specialty,
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao iniciar consulta:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar fila de espera
 */
export const checkQueue = async () => {
  try {
    const { data, error } = await supabase.functions.invoke(ORCHESTRATOR_FUNCTION, {
      body: {
        action: 'check_queue',
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao verificar fila:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Obter sessões ativas
 */
export const getActiveSessions = async () => {
  try {
    const { data, error } = await supabase.functions.invoke(ORCHESTRATOR_FUNCTION, {
      body: {
        action: 'get_active_sessions',
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar sessões ativas:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Cancelar consulta
 */
export const cancelConsultation = async (consultationId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke(ORCHESTRATOR_FUNCTION, {
      body: {
        action: 'cancel_consultation',
        consultationId,
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao cancelar consulta:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Obter notificações do sistema
 */
export const getNotifications = async () => {
  try {
    const { data, error } = await supabase.functions.invoke(ORCHESTRATOR_FUNCTION, {
      body: {
        action: 'get_notifications',
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar notificações:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== ASSINATURAS (TEMA) ====================

/**
 * Criar assinatura via Asaas
 */
export const createSubscription = async (subscriptionData: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerDocument: string;
}) => {
  try {
    const { data, error } = await supabase.functions.invoke(TEMA_ORCHESTRATOR_FUNCTION, {
      body: {
        action: 'create_subscription',
        subscriptionData,
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao criar assinatura:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar status da assinatura
 */
export const checkSubscription = async () => {
  try {
    const { data, error } = await supabase.functions.invoke(TEMA_ORCHESTRATOR_FUNCTION, {
      body: {
        action: 'check_subscription',
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao verificar assinatura:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Cancelar assinatura
 */
export const cancelSubscription = async () => {
  try {
    const { data, error } = await supabase.functions.invoke(TEMA_ORCHESTRATOR_FUNCTION, {
      body: {
        action: 'cancel_subscription',
      },
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao cancelar assinatura:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== HELPERS ====================

/**
 * Marcar notificação como lida
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('system_notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao marcar notificação:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Obter histórico de consultas
 */
export const getConsultationHistory = async (limit: number = 10) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('consultation_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error.message);
    return { success: false, error: error.message };
  }
};

