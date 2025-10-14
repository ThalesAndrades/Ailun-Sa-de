import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configurar comportamento padrão das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  beneficiaryUuid: string;
  title: string;
  message: string;
  type: 'appointment' | 'reminder' | 'cancellation' | 'confirmation' | 'referral' | 'general';
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface ScheduledNotification {
  id: string;
  trigger: Date;
  content: {
    title: string;
    body: string;
    data: Record<string, any>;
  };
}

/**
 * Registrar dispositivo para notificações push
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (!Device.isDevice) {
      console.log('Notificações push só funcionam em dispositivos físicos');
      return null;
    }

    // Verificar permissões existentes
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Solicitar permissão se necessário
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permissão para notificações negada');
      return null;
    }

    // Obter token do Expo Push Notification
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);

    // Configurar canal de notificação para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'AiLun Saúde',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });

      // Canal para lembretes de consulta
      await Notifications.setNotificationChannelAsync('reminders', {
        name: 'Lembretes de Consulta',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      });

      // Canal para confirmações
      await Notifications.setNotificationChannelAsync('confirmations', {
        name: 'Confirmações',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 150],
        lightColor: '#2196F3',
        sound: 'default',
      });
    }

    return token;
  } catch (error) {
    console.error('Erro ao registrar para notificações:', error);
    return null;
  }
}

/**
 * Enviar notificação local imediata
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, any>,
  channelId: string = 'default'
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: null, // Imediato
    });

    return notificationId;
  } catch (error) {
    console.error('Erro ao enviar notificação local:', error);
    throw error;
  }
}

/**
 * Agendar notificação local para data/hora específica
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  triggerDate: Date,
  data?: Record<string, any>,
  channelId: string = 'default'
): Promise<string> {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
      },
      trigger: triggerDate,
    });

    console.log(`Notificação agendada para ${triggerDate.toLocaleString()}: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('Erro ao agendar notificação:', error);
    throw error;
  }
}

/**
 * Cancelar notificação agendada
 */
export async function cancelScheduledNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Notificação ${notificationId} cancelada`);
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
    throw error;
  }
}

/**
 * Cancelar todas as notificações agendadas
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Todas as notificações agendadas foram canceladas');
  } catch (error) {
    console.error('Erro ao cancelar todas as notificações:', error);
    throw error;
  }
}

/**
 * Listar todas as notificações agendadas
 */
export async function getAllScheduledNotifications(): Promise<ScheduledNotification[]> {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications as ScheduledNotification[];
  } catch (error) {
    console.error('Erro ao listar notificações agendadas:', error);
    return [];
  }
}

/**
 * Salvar notificação no banco de dados
 */
export async function saveNotificationToDatabase(
  notificationData: NotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('system_notifications')
      .insert({
        beneficiary_uuid: notificationData.beneficiaryUuid,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        action_url: notificationData.actionUrl,
        read: false,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Erro ao salvar notificação no banco:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao salvar notificação:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('system_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Buscar notificações não lidas do beneficiário
 */
export async function getUnreadNotifications(
  beneficiaryUuid: string
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('system_notifications')
      .select('*')
      .eq('beneficiary_uuid', beneficiaryUuid)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Enviar notificação de confirmação de agendamento
 */
export async function sendAppointmentConfirmation(
  beneficiaryUuid: string,
  beneficiaryName: string,
  appointmentDate: Date,
  specialty: string,
  appointmentUuid: string
): Promise<void> {
  const title = '✅ Consulta Agendada!';
  const body = `Olá ${beneficiaryName}, sua consulta de ${specialty} foi agendada para ${appointmentDate.toLocaleString('pt-BR')}.`;

  // Enviar notificação local
  await sendLocalNotification(title, body, {
    type: 'confirmation',
    appointmentUuid,
  }, 'confirmations');

  // Salvar no banco
  await saveNotificationToDatabase({
    beneficiaryUuid,
    title,
    message: body,
    type: 'confirmation',
    data: { appointmentUuid, appointmentDate: appointmentDate.toISOString(), specialty },
  });
}

/**
 * Agendar lembrete de consulta (30 minutos antes)
 */
export async function scheduleAppointmentReminder(
  beneficiaryUuid: string,
  beneficiaryName: string,
  appointmentDate: Date,
  specialty: string,
  appointmentUuid: string
): Promise<string | null> {
  try {
    // Calcular 30 minutos antes
    const reminderDate = new Date(appointmentDate.getTime() - 30 * 60 * 1000);

    // Verificar se a data é futura
    if (reminderDate <= new Date()) {
      console.log('Data do lembrete já passou, não agendando');
      return null;
    }

    const title = '⏰ Lembrete de Consulta';
    const body = `Olá ${beneficiaryName}, sua consulta de ${specialty} começa em 30 minutos!`;

    // Agendar notificação local
    const notificationId = await scheduleLocalNotification(
      title,
      body,
      reminderDate,
      {
        type: 'reminder',
        appointmentUuid,
      },
      'reminders'
    );

    // Salvar lembrete no banco
    await supabase.from('consultation_reminders').insert({
      beneficiary_uuid: beneficiaryUuid,
      consultation_log_id: appointmentUuid,
      reminder_date: reminderDate.toISOString(),
      sent: false,
    });

    return notificationId;
  } catch (error) {
    console.error('Erro ao agendar lembrete:', error);
    return null;
  }
}

/**
 * Enviar notificação de cancelamento
 */
export async function sendCancellationNotification(
  beneficiaryUuid: string,
  beneficiaryName: string,
  specialty: string,
  appointmentDate: Date
): Promise<void> {
  const title = '❌ Consulta Cancelada';
  const body = `Olá ${beneficiaryName}, sua consulta de ${specialty} agendada para ${appointmentDate.toLocaleString('pt-BR')} foi cancelada.`;

  // Enviar notificação local
  await sendLocalNotification(title, body, {
    type: 'cancellation',
  }, 'default');

  // Salvar no banco
  await saveNotificationToDatabase({
    beneficiaryUuid,
    title,
    message: body,
    type: 'cancellation',
  });
}

/**
 * Enviar notificação de encaminhamento aprovado
 */
export async function sendReferralNotification(
  beneficiaryUuid: string,
  beneficiaryName: string,
  specialty: string
): Promise<void> {
  const title = '📋 Encaminhamento Aprovado';
  const body = `Olá ${beneficiaryName}, você recebeu um encaminhamento para ${specialty}. Agora você pode agendar sua consulta!`;

  // Enviar notificação local
  await sendLocalNotification(title, body, {
    type: 'referral',
    specialty,
  }, 'default');

  // Salvar no banco
  await saveNotificationToDatabase({
    beneficiaryUuid,
    title,
    message: body,
    type: 'referral',
    data: { specialty },
  });
}

/**
 * Limpar badge de notificações
 */
export async function clearNotificationBadge(): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(0);
  } catch (error) {
    console.error('Erro ao limpar badge:', error);
  }
}

/**
 * Definir badge de notificações
 */
export async function setNotificationBadge(count: number): Promise<void> {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Erro ao definir badge:', error);
  }
}

