import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabaseClient } from './supabase';

// Configuração das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export interface NotificationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Registra para notificações push (apenas em dispositivos móveis)
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // Não tentar registrar push notifications na web
    if (Platform.OS === 'web') {
      console.log('Push notifications não são suportadas na web');
      return null;
    }

    // Verificar se as notificações são suportadas no device
    if (!Notifications.isAvailableAsync()) {
      console.log('Notificações não estão disponíveis neste dispositivo');
      return null;
    }

    // Pedir permissão
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações negada');
      return null;
    }

    // Obter token do Expo
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // Substitua pelo seu project ID
    })).data;

    console.log('Token de push registrado:', token);
    return token;

  } catch (error) {
    console.error('Erro ao registrar para notificações:', error);
    return null;
  }
}

/**
 * Busca notificações não lidas do usuário
 */
export async function getUnreadNotifications(beneficiaryUuid: string): Promise<NotificationResult<any[]>> {
  try {
    const { data, error } = await supabaseClient
      .from('system_notifications')
      .select('*')
      .eq('beneficiary_uuid', beneficiaryUuid)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return { success: false, error: 'Erro interno do sistema' };
  }
}

/**
 * Marca uma notificação como lida
 */
export async function markNotificationAsRead(notificationId: string): Promise<NotificationResult> {
  try {
    const { error } = await supabaseClient
      .from('system_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return { success: false, error: 'Erro interno do sistema' };
  }
}

/**
 * Define o badge de notificações (apenas em dispositivos móveis)
 */
export async function setNotificationBadge(count: number): Promise<void> {
  try {
    // Badge só funciona em dispositivos móveis
    if (Platform.OS === 'web') {
      return;
    }

    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Erro ao definir badge:', error);
  }
}

/**
 * Limpa o badge de notificações (apenas em dispositivos móveis)
 */
export async function clearNotificationBadge(): Promise<void> {
  try {
    // Badge só funciona em dispositivos móveis
    if (Platform.OS === 'web') {
      return;
    }

    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Erro ao limpar badge:', error);
  }
}

/**
 * Cria uma notificação local
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: any = {},
  trigger: any = null
): Promise<void> {
  try {
    // Notificações locais não funcionam bem na web
    if (Platform.OS === 'web') {
      console.log('Notificação local (web):', title, body);
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger,
    });
  } catch (error) {
    console.error('Erro ao agendar notificação local:', error);
  }
}

/**
 * Cancela todas as notificações pendentes
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Erro ao cancelar notificações:', error);
  }
}