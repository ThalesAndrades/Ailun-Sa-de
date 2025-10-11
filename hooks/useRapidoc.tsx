import { useState, useCallback, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase, ConsultationLog, ActiveSession, SystemNotification } from '../services/supabase';
import { useAuth } from './useAuth';

interface RapidocServiceResponse {
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

  const getUserProfile = useCallback(() => {
    if (!user) return undefined;
    
    return {
      name: profile?.full_name || 'Usuário',
      email: user.email || '',
      phone: profile?.phone
    };
  }, [user, profile]);

  // Buscar dados do usuário
  const loadUserData = useCallback(async () => {
    if (!user) return;

    try {
      // Buscar histórico de consultas
      const { data: historyData } = await supabase
        .from('consultation_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (historyData) {
        setConsultationHistory(historyData);
      }

      // Buscar sessões ativas
      const { data: sessionsData } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString());

      if (sessionsData) {
        setActiveSessions(sessionsData);
      }

      // Buscar notificações não lidas
      const { data: notificationsData } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('user_id', user.id)
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationsData) {
        setNotifications(notificationsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }, [user]);

  // Carregar dados quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  // Chamada para o orquestrador
  const callOrchestrator = useCallback(async (
    action: string,
    serviceType: 'doctor' | 'specialist' | 'psychologist' | 'nutritionist',
    specialty?: string
  ): Promise<RapidocServiceResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('orchestrator', {
        body: {
          action,
          serviceType,
          specialty,
          userProfile: getUserProfile()
        }
      });

      if (error) {
        console.error('Orchestrator Error:', error);
        return {
          success: false,
          error: error.message || 'Erro na comunicação com o serviço médico'
        };
      }

      return data;
    } catch (error) {
      console.error('Orchestrator Service Error:', error);
      return {
        success: false,
        error: 'Erro interno do serviço'
      };
    }
  }, [getUserProfile]);

  const handleServiceResponse = useCallback(async (
    response: RapidocServiceResponse, 
    serviceName: string
  ) => {
    if (!response.success) {
      showAlert('Erro no Serviço', response.error || `Não foi possível conectar ao serviço de ${serviceName}`);
      return;
    }

    // Recarregar dados após sucesso
    await loadUserData();

    if (response.consultationUrl) {
      // Abrir URL da consulta
      try {
        if (Platform.OS === 'web') {
          window.open(response.consultationUrl, '_blank');
        } else {
          await WebBrowser.openBrowserAsync(response.consultationUrl);
        }
      } catch (error) {
        showAlert('Erro', 'Não foi possível abrir a consulta');
      }
    } else {
      // Mostrar informações da consulta
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
      const response = await callOrchestrator('start_consultation', 'doctor');
      await handleServiceResponse(response, 'Médico Agora');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta médica');
    } finally {
      setLoading(false);
    }
  }, [user, callOrchestrator, handleServiceResponse, showAlert]);

  const requestSpecialist = useCallback(async (specialtyArea = 'Clínica Geral') => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callOrchestrator('start_consultation', 'specialist', specialtyArea);
      await handleServiceResponse(response, `Especialista em ${specialtyArea}`);
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta com especialista');
    } finally {
      setLoading(false);
    }
  }, [user, callOrchestrator, handleServiceResponse, showAlert]);

  const requestPsychologist = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callOrchestrator('start_consultation', 'psychologist');
      await handleServiceResponse(response, 'Psicólogo');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta psicológica');
    } finally {
      setLoading(false);
    }
  }, [user, callOrchestrator, handleServiceResponse, showAlert]);

  const requestNutritionist = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callOrchestrator('start_consultation', 'nutritionist');
      await handleServiceResponse(response, 'Nutricionista');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta nutricional');
    } finally {
      setLoading(false);
    }
  }, [user, callOrchestrator, handleServiceResponse, showAlert]);

  const cancelConsultation = useCallback(async (consultationId: string) => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await callOrchestrator('cancel_consultation', 'doctor');
      if (response.success) {
        showAlert('Sucesso', 'Consulta cancelada com sucesso');
        await loadUserData();
      } else {
        showAlert('Erro', response.error || 'Erro ao cancelar consulta');
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao cancelar consulta');
    } finally {
      setLoading(false);
    }
  }, [user, callOrchestrator, showAlert, loadUserData]);

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
  };
}