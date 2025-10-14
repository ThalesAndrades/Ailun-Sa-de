import { useState, useCallback, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase, ConsultationLog, ActiveSession, SystemNotification } from '../services/supabase';
import { useAuth } from './useAuth';

interface TemaRapidocResponse {
  success: boolean;
  sessionId?: string;
  consultationUrl?: string;
  estimatedWaitTime?: number;
  professionalInfo?: {
    name: string;
    specialty: string;
    rating: number;
  };
  message?: string;
  error?: string;
  data?: any;
  requires_subscription?: boolean;
}

interface UseRapidocReturn {
  loading: boolean;
  requestDoctorNow: () => Promise<void>;
  requestSpecialist: (specialtyArea?: string) => Promise<void>;
  requestPsychologist: () => Promise<void>;
  requestNutritionist: () => Promise<void>;
  consultationHistory: ConsultationLog[];
  activeSessions: ActiveSession[];
  notifications: SystemNotification[];
  cancelConsultation: (consultationId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  checkSubscription: () => Promise<boolean>;
  createSubscription: (subscriptionData: any) => Promise<void>;
}

export function useRapidoc(): UseRapidocReturn {
  const [loading, setLoading] = useState(false);
  const [consultationHistory, setConsultationHistory] = useState<ConsultationLog[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const { user, profile } = useAuth();

  const showAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  // Load user data using tema-orchestrator
  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      // Get consultation history
      const { data: historyData } = await supabase
        .from('consultation_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyData) {
        setConsultationHistory(historyData);
      }

      // Get active sessions via tema-orchestrator
      const { data: sessionsResponse } = await supabase.functions.invoke('tema-orchestrator', {
        body: { action: 'get_active_sessions' }
      });

      if (sessionsResponse?.success && sessionsResponse.data) {
        setActiveSessions(sessionsResponse.data);
      }

      // Get notifications via tema-orchestrator
      const { data: notificationsResponse } = await supabase.functions.invoke('tema-orchestrator', {
        body: { action: 'get_notifications' }
      });

      if (notificationsResponse?.success && notificationsResponse.data) {
        setNotifications(notificationsResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }, [user]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  // Check subscription status
  const checkSubscription = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('tema-orchestrator', {
        body: { action: 'check_subscription' }
      });

      if (error) {
        console.error('Subscription check error:', error);
        return false;
      }

      return data?.subscribed || false;
    } catch (error) {
      console.error('Subscription check error:', error);
      return false;
    }
  }, [user]);

  // Create subscription via tema-orchestrator
  const createSubscription = useCallback(async (subscriptionData: any) => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para criar uma assinatura');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tema-orchestrator', {
        body: { 
          action: 'create_subscription',
          subscriptionData
        }
      });

      if (error) {
        showAlert('Erro', 'Não foi possível criar a assinatura');
        return;
      }

      if (!data.success) {
        showAlert('Erro', data.error || 'Erro ao criar assinatura');
        return;
      }

      showAlert('Sucesso', 'Assinatura criada com sucesso!');
      await loadUserData();
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao criar assinatura');
    } finally {
      setLoading(false);
    }
  }, [user, showAlert, loadUserData]);

  // Call tema-orchestrator for consultations
  const callTemaOrchestrator = useCallback(async (
    action: string,
    serviceType: 'doctor' | 'specialist' | 'psychologist' | 'nutritionist',
    specialty?: string
  ): Promise<TemaRapidocResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('tema-orchestrator', {
        body: {
          action,
          serviceType,
          specialty
        }
      });

      if (error) {
        console.error('Tema Orchestrator Error:', error);
        return {
          success: false,
          error: error.message || 'Erro na comunicação com o serviço médico'
        };
      }

      return data;
    } catch (error) {
      console.error('Tema Orchestrator Service Error:', error);
      return {
        success: false,
        error: 'Erro interno do serviço'
      };
    }
  }, []);

  const handleServiceResponse = useCallback(async (
    response: TemaRapidocResponse, 
    serviceName: string
  ) => {
    if (!response.success) {
      if (response.requires_subscription) {
        showAlert(
          'Assinatura Necessária', 
          'Você precisa de uma assinatura ativa para acessar os serviços médicos. Deseja assinar agora?'
        );
        return;
      }

      showAlert('Erro no Serviço', response.error || `Não foi possível conectar ao serviço de ${serviceName}`);
      return;
    }

    // Reload data after success
    await loadUserData();

    if (response.data?.session?.consultationUrl) {
      // Open consultation URL
      try {
        if (Platform.OS === 'web') {
          window.open(response.data.session.consultationUrl, '_blank');
        } else {
          await WebBrowser.openBrowserAsync(response.data.session.consultationUrl);
        }
      } catch (error) {
        showAlert('Erro', 'Não foi possível abrir a consulta');
      }
    } else {
      // Show consultation information
      const waitTimeText = response.estimatedWaitTime 
        ? `\n\nTempo estimado: ${response.estimatedWaitTime} minutos`
        : '';
      
      const professionalText = response.professionalInfo
        ? `\n\nProfissional: ${response.professionalInfo.name}\nEspecialidade: ${response.professionalInfo.specialty}\nAvaliação: ${response.professionalInfo.rating}/5`
        : '';

      const message = response.message || `Sua solicitação de ${serviceName} foi processada com sucesso!`;

      showAlert(
        'Consulta Solicitada',
        `${message}${waitTimeText}${professionalText}`
      );
    }
  }, [showAlert, loadUserData]);

  const requestDoctorNow = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callTemaOrchestrator('start_consultation', 'doctor');
      await handleServiceResponse(response, 'Médico Agora');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta médica');
    } finally {
      setLoading(false);
    }
  }, [user, callTemaOrchestrator, handleServiceResponse, showAlert]);

  const requestSpecialist = useCallback(async (specialtyArea = 'Clínica Geral') => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callTemaOrchestrator('start_consultation', 'specialist', specialtyArea);
      await handleServiceResponse(response, `Especialista em ${specialtyArea}`);
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta com especialista');
    } finally {
      setLoading(false);
    }
  }, [user, callTemaOrchestrator, handleServiceResponse, showAlert]);

  const requestPsychologist = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callTemaOrchestrator('start_consultation', 'psychologist');
      await handleServiceResponse(response, 'Psicólogo');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta psicológica');
    } finally {
      setLoading(false);
    }
  }, [user, callTemaOrchestrator, handleServiceResponse, showAlert]);

  const requestNutritionist = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callTemaOrchestrator('start_consultation', 'nutritionist');
      await handleServiceResponse(response, 'Nutricionista');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta nutricional');
    } finally {
      setLoading(false);
    }
  }, [user, callTemaOrchestrator, handleServiceResponse, showAlert]);

  const cancelConsultation = useCallback(async (consultationId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('consultation_logs')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', consultationId)
        .eq('user_id', user.id);

      if (error) {
        showAlert('Erro', 'Erro ao cancelar consulta');
      } else {
        showAlert('Sucesso', 'Consulta cancelada com sucesso');
        await loadUserData();
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao cancelar consulta');
    } finally {
      setLoading(false);
    }
  }, [user, showAlert, loadUserData]);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await supabase
        .from('system_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);
      
      await loadUserData();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, [loadUserData]);

  const refreshData = useCallback(async () => {
    await loadUserData();
  }, [loadUserData]);

  return {
    loading,
    requestDoctorNow,
    requestSpecialist,
    requestPsychologist,
    requestNutritionist,
    consultationHistory,
    activeSessions,
    notifications,
    cancelConsultation,
    markNotificationAsRead,
    refreshData,
    checkSubscription,
    createSubscription,
  };
}