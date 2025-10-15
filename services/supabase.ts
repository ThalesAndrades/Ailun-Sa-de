/**
 * Supabase Client - AiLun Saúde
 * Cliente otimizado para integração completa com backend
 */

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração de ambiente
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Validação de configuração
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configurações do Supabase não encontradas. Verifique as variáveis de ambiente.');
}

// Storage adapter multiplataforma
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return Promise.resolve(window.localStorage.getItem(key));
        }
        return Promise.resolve(null);
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        }
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        }
        return Promise.resolve();
      },
    };
  } else {
    return AsyncStorage;
  }
};

// Cliente Supabase otimizado
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Não necessário para mobile
    flowType: 'pkce', // Mais seguro
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'ailun-saude-app/2.1.0',
    },
  },
});

// Helper para obter o cliente (compatibilidade)
export const getSupabaseClient = () => supabase;

// ==================== TIPOS DE DADOS ====================

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
  has_seen_onboarding?: boolean;
  avatar_url?: string;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  is_active_beneficiary?: boolean;
  plan_type?: string;
  plan_details?: any;
  created_at: string;
  updated_at: string;
}

export interface Beneficiary {
  id: string;
  user_id?: string;
  beneficiary_uuid: string;
  cpf: string;
  full_name: string;
  birth_date: string;
  email: string;
  phone: string;
  service_type: string;
  is_primary?: boolean;
  status: 'active' | 'inactive';
  has_active_plan?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  user_id: string;
  beneficiary_id?: string;
  plan_name: string;
  service_type: string;
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
  payment_method?: string;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  next_billing_date?: string;
  psychology_limit: number;
  nutrition_limit: number;
  psychology_used: number;
  nutrition_used: number;
  last_psychology_reset?: string;
  last_nutrition_reset?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ConsultationHistory {
  id: string;
  beneficiary_id: string;
  subscription_plan_id?: string;
  service_type: string;
  specialty?: string;
  professional_name?: string;
  professional_id?: string;
  session_id?: string;
  consultation_url?: string;
  status: 'pending' | 'scheduled' | 'active' | 'completed' | 'cancelled' | 'failed';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  rating?: number;
  feedback?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface SystemNotification {
  id: string;
  beneficiary_uuid: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
}

export interface ActiveSession {
  id: string;
  beneficiary_uuid: string;
  session_id: string;
  service_type: string;
  session_url?: string;
  status: 'active' | 'expired' | 'completed';
  expires_at: string;
  created_at: string;
}

export interface ConsultationQueue {
  id: string;
  beneficiary_uuid: string;
  service_type: string;
  specialty?: string;
  priority: number;
  status: 'waiting' | 'processing' | 'assigned' | 'cancelled';
  queue_position?: number;
  estimated_time?: number;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  event_type: string;
  user_id?: string;
  user_email?: string;
  event_data?: any;
  status: 'success' | 'error' | 'warning';
  error_message?: string;
  error_stack?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  platform?: string;
  metadata?: any;
  created_at: string;
}

// ==================== FUNÇÕES UTILITÁRIAS ====================

/**
 * Verificar se o Supabase está configurado corretamente
 */
export const checkSupabaseConfig = () => {
  return {
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
    url: supabaseUrl ? 'Configurado' : 'Faltando',
    anonKey: supabaseAnonKey ? 'Configurado' : 'Faltando',
    environment: process.env.NODE_ENV || 'development',
  };
};

/**
 * Testar conectividade com Supabase
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  error?: string;
  latency?: number;
}> => {
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    const latency = Date.now() - startTime;
    
    if (error) {
      return {
        success: false,
        error: error.message,
        latency,
      };
    }
    
    return {
      success: true,
      latency,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Obter informações da sessão atual
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erro ao obter sessão:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return null;
  }
};

/**
 * Obter usuário atual
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Erro ao obter usuário:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return null;
  }
};

/**
 * Realizar logout completo
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro no logout:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro no logout:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar se usuário está autenticado
 */
export const isUserAuthenticated = async (): Promise<boolean> => {
  try {
    const session = await getCurrentSession();
    return !!session?.user;
  } catch {
    return false;
  }
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

/**
 * Criar subscription para notificações do usuário
 */
export const createNotificationSubscription = (
  beneficiaryUuid: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`notifications:${beneficiaryUuid}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'system_notifications',
        filter: `beneficiary_uuid=eq.${beneficiaryUuid}`,
      },
      callback
    )
    .subscribe();
};

/**
 * Criar subscription para mudanças no perfil
 */
export const createProfileSubscription = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

/**
 * Criar subscription para consultas
 */
export const createConsultationSubscription = (
  beneficiaryUuid: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`consultations:${beneficiaryUuid}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'consultation_history',
        filter: `beneficiary_id=eq.${beneficiaryUuid}`,
      },
      callback
    )
    .subscribe();
};

// ==================== LOGGING FUNCTIONS ====================

/**
 * Registrar evento de auditoria
 */
export const logAuditEvent = async (
  eventType: string,
  eventData?: any,
  status: 'success' | 'error' | 'warning' = 'success',
  errorMessage?: string
) => {
  try {
    const user = await getCurrentUser();
    
    await supabase.from('audit_logs').insert({
      event_type: eventType,
      user_id: user?.id,
      user_email: user?.email,
      event_data: eventData,
      status,
      error_message: errorMessage,
      ip_address: '127.0.0.1', // Placeholder - seria obtido do contexto
      user_agent: 'AiLun Saúde Mobile App',
      device_type: Platform.OS,
      platform: 'mobile',
      metadata: {
        timestamp: new Date().toISOString(),
        version: '2.1.0',
      },
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
};

export default supabase;