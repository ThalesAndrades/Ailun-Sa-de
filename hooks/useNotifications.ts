import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Subscription } from 'expo-modules-core';
import {
  registerForPushNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  clearNotificationBadge,
  setNotificationBadge,
} from '../services/notifications';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export function useNotifications(beneficiaryUuid?: string) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  // Registrar para notificações push
  useEffect(() => {
    // Só tentar registrar notificações push em plataformas nativas
    if (Platform.OS !== 'web') {
      registerForPushNotifications().then((token) => {
        setExpoPushToken(token);
      }).catch((error) => {
        console.log('[useNotifications] Erro ao registrar push notifications:', error);
        setExpoPushToken(null);
      });
    } else {
      console.log('[useNotifications] Web platform - push notifications desabilitadas');
      setExpoPushToken(null);
    }

    // Configurar listeners apenas para plataformas nativas
    if (Platform.OS !== 'web') {
      // Listener para notificações recebidas enquanto o app está aberto
      notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notificação recebida:', notification);
        // Atualizar lista de notificações
        if (beneficiaryUuid) {
          loadUnreadNotifications();
        }
      });

      // Listener para quando o usuário interage com a notificação
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Usuário interagiu com notificação:', response);
        const data = response.notification.request.content.data;
        
        // Aqui você pode navegar para a tela específica baseado no tipo
        if (data.type === 'appointment' || data.type === 'reminder') {
          // Navegar para tela de detalhes da consulta
          console.log('Navegar para consulta:', data.appointmentUuid);
        }
      });
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [beneficiaryUuid]);

  // Carregar notificações não lidas
  const loadUnreadNotifications = async () => {
    if (!beneficiaryUuid) return;

    setLoading(true);
    try {
      const result = await getUnreadNotifications(beneficiaryUuid);
      if (result.success && result.data) {
        setNotifications(result.data);
        setUnreadCount(result.data.length);
        await setNotificationBadge(result.data.length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (notificationId: string) => {
    try {
      const result = await markNotificationAsRead(notificationId);
      if (result.success) {
        // Atualizar lista local
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        await setNotificationBadge(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    try {
      for (const notification of notifications) {
        if (!notification.read) {
          await markNotificationAsRead(notification.id);
        }
      }
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      await clearNotificationBadge();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  // Limpar badge
  const clearBadge = async () => {
    await clearNotificationBadge();
    setUnreadCount(0);
  };

  // Carregar notificações ao montar o componente
  useEffect(() => {
    if (beneficiaryUuid) {
      loadUnreadNotifications();
    }
  }, [beneficiaryUuid]);

  return {
    expoPushToken,
    notifications,
    unreadCount,
    loading,
    loadUnreadNotifications,
    markAsRead,
    markAllAsRead,
    clearBadge,
  };
}

