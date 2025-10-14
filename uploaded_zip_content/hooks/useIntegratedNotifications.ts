/**
 * Hook Integrado de Notificações
 * 
 * Combina o hook de notificações com o context para fornecer
 * uma interface unificada de notificações no app
 */

import { useEffect } from 'react';
import { useNotificationContext } from './useNotificationContext';
import { useCPFAuth } from './useCPFAuth';
import { MessageTemplates } from '../constants/messageTemplates';
import { showTemplateMessage } from '../utils/alertHelpers';

export interface IntegratedNotifications {
  // Estado das notificações
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  expoPushToken: string | null;
  
  // Ações básicas
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearBadge: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  
  // Ações de conveniência
  hasUnreadNotifications: boolean;
  getLatestNotification: () => any | null;
  getNotificationsByType: (type: string) => any[];
  
  // Auto-listeners
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
}

export function useIntegratedNotifications(): IntegratedNotifications {
  const {
    notifications,
    unreadCount,
    loading,
    expoPushToken,
    markAsRead,
    markAllAsRead,
    clearBadge,
    refreshNotifications,
  } = useNotificationContext();
  
  const { isAuthenticated, user } = useCPFAuth();

  // Auto-refresh quando usuário faz login
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshNotifications();
    }
  }, [isAuthenticated, user, refreshNotifications]);

  // Auto-refresh periódico (a cada 30 segundos)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshNotifications]);

  // Propriedades derivadas
  const hasUnreadNotifications = unreadCount > 0;

  const getLatestNotification = () => {
    if (notifications.length === 0) return null;
    return notifications[0]; // Já vem ordenado por data
  };

  const getNotificationsByType = (type: string) => {
    return notifications.filter(n => n.type === type);
  };

  // Auto-refresh controls
  let autoRefreshInterval: NodeJS.Timeout | null = null;

  const startAutoRefresh = (intervalMs: number = 10000) => {
    if (autoRefreshInterval) return; // Já está rodando

    autoRefreshInterval = setInterval(() => {
      if (isAuthenticated) {
        refreshNotifications();
      }
    }, intervalMs);
  };

  const stopAutoRefresh = () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  };

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, []);

  return {
    // Estado
    notifications,
    unreadCount,
    loading,
    expoPushToken,
    
    // Ações básicas
    markAsRead,
    markAllAsRead,
    clearBadge,
    refreshNotifications,
    
    // Propriedades derivadas
    hasUnreadNotifications,
    getLatestNotification,
    getNotificationsByType,
    
    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh,
  };
}

/**
 * Hook para mostrar notificações como alertas
 */
export function useNotificationAlerts() {
  const { getLatestNotification, markAsRead } = useIntegratedNotifications();

  const showLatestNotificationAsAlert = () => {
    const latest = getLatestNotification();
    if (!latest) return;

    showTemplateMessage({
      title: latest.title,
      message: latest.message,
      type: latest.type,
    }, [
      {
        text: 'Marcar como Lida',
        onPress: () => markAsRead(latest.id)
      },
      {
        text: 'OK',
        style: 'cancel'
      }
    ]);
  };

  const showAppointmentReminder = (specialty: string, timeMinutes: number) => {
    const template = MessageTemplates.notifications.reminder30min(specialty);
    showTemplateMessage(template);
  };

  const showAppointmentConfirmation = (specialty: string, date: string) => {
    const template = MessageTemplates.notifications.appointmentConfirmed(specialty, date);
    showTemplateMessage(template);
  };

  const showReferralApproval = (specialty: string) => {
    const template = MessageTemplates.notifications.referralApproved(specialty);
    showTemplateMessage(template);
  };

  return {
    showLatestNotificationAsAlert,
    showAppointmentReminder,
    showAppointmentConfirmation,
    showReferralApproval,
  };
}

/**
 * Hook para listeners de notificação em tempo real
 */
export function useNotificationListeners() {
  const { refreshNotifications } = useIntegratedNotifications();
  const { isAuthenticated } = useCPFAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Listener para notificações recebidas
    const handleNotificationReceived = (notification: any) => {
      console.log('Notificação recebida:', notification);
      refreshNotifications();
    };

    // Listener para quando usuário clica na notificação
    const handleNotificationResponse = (response: any) => {
      console.log('Usuário clicou na notificação:', response);
      const data = response.notification.request.content.data;
      
      // Aqui você pode navegar baseado no tipo da notificação
      if (data.type === 'appointment') {
        // Navegar para detalhes da consulta
        console.log('Navegar para consulta:', data.appointmentUuid);
      } else if (data.type === 'reminder') {
        // Mostrar lembrete
        console.log('Mostrar lembrete de consulta');
      }
      
      refreshNotifications();
    };

    // Registrar listeners (implementar com Expo Notifications se necessário)
    
    return () => {
      // Limpar listeners
    };
  }, [isAuthenticated, refreshNotifications]);

  return {
    // Métodos para registrar listeners customizados se necessário
  };
}