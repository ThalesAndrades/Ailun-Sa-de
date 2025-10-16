/**
 * Serviço de Tempo Real do Supabase
 * Implementa funcionalidades de atualização em tempo real
 */

import { supabase } from './supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeSubscriptionOptions {
  table: string;
  filter?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
}

class RealTimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Inscrever-se em mudanças de uma tabela específica
   */
  subscribeToTable(options: RealtimeSubscriptionOptions): string {
    const channelId = `${options.table}_${Date.now()}_${Math.random()}`;
    
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: options.table,
          filter: options.filter,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[RealTime] Mudança detectada:', {
            table: options.table,
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
          });

          switch (payload.eventType) {
            case 'INSERT':
              options.onInsert?.(payload);
              break;
            case 'UPDATE':
              options.onUpdate?.(payload);
              break;
            case 'DELETE':
              options.onDelete?.(payload);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log(`[RealTime] Status da inscrição ${channelId}:`, status);
      });

    this.channels.set(channelId, channel);
    return channelId;
  }

  /**
   * Cancelar inscrição em uma tabela
   */
  unsubscribe(channelId: string): void {
    const channel = this.channels.get(channelId);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelId);
      console.log(`[RealTime] Inscrição ${channelId} cancelada`);
    }
  }

  /**
   * Cancelar todas as inscrições
   */
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelId) => {
      supabase.removeChannel(channel);
      console.log(`[RealTime] Inscrição ${channelId} cancelada`);
    });
    this.channels.clear();
  }

  /**
   * Inscrever-se em mudanças de consultas para um beneficiário
   */
  subscribeToUserConsultations(
    beneficiaryUuid: string,
    callbacks: {
      onNewConsultation?: (consultation: any) => void;
      onConsultationUpdate?: (consultation: any) => void;
      onConsultationCancel?: (consultation: any) => void;
    }
  ): string {
    return this.subscribeToTable({
      table: 'consultation_history',
      filter: `beneficiary_id=eq.${beneficiaryUuid}`,
      onInsert: (payload) => {
        callbacks.onNewConsultation?.(payload.new);
      },
      onUpdate: (payload) => {
        callbacks.onConsultationUpdate?.(payload.new);
      },
      onDelete: (payload) => {
        callbacks.onConsultationCancel?.(payload.old);
      },
    });
  }

  /**
   * Inscrever-se em mudanças de notificações para um usuário
   */
  subscribeToUserNotifications(
    beneficiaryUuid: string,
    callbacks: {
      onNewNotification?: (notification: any) => void;
      onNotificationRead?: (notification: any) => void;
    }
  ): string {
    return this.subscribeToTable({
      table: 'system_notifications',
      filter: `beneficiary_uuid=eq.${beneficiaryUuid}`,
      onInsert: (payload) => {
        callbacks.onNewNotification?.(payload.new);
      },
      onUpdate: (payload) => {
        if (payload.new?.read && !payload.old?.read) {
          callbacks.onNotificationRead?.(payload.new);
        }
      },
    });
  }

  /**
   * Inscrever-se em mudanças de plano do usuário
   */
  subscribeToUserPlan(
    userId: string,
    callbacks: {
      onPlanUpdate?: (plan: any) => void;
      onPlanCancel?: (plan: any) => void;
    }
  ): string {
    return this.subscribeToTable({
      table: 'subscription_plans',
      filter: `user_id=eq.${userId}`,
      onUpdate: (payload) => {
        callbacks.onPlanUpdate?.(payload.new);
      },
      onDelete: (payload) => {
        callbacks.onPlanCancel?.(payload.old);
      },
    });
  }

  /**
   * Inscrever-se em mudanças de status de pagamento
   */
  subscribeToPaymentStatus(
    beneficiaryUuid: string,
    callbacks: {
      onPaymentConfirmed?: (payment: any) => void;
      onPaymentFailed?: (payment: any) => void;
    }
  ): string {
    return this.subscribeToTable({
      table: 'consultation_history',
      filter: `beneficiary_id=eq.${beneficiaryUuid}`,
      onUpdate: (payload) => {
        if (payload.new?.status === 'confirmed' && payload.old?.status !== 'confirmed') {
          callbacks.onPaymentConfirmed?.(payload.new);
        }
        if (payload.new?.status === 'failed' && payload.old?.status !== 'failed') {
          callbacks.onPaymentFailed?.(payload.new);
        }
      },
    });
  }

  /**
   * Verificar status da conexão em tempo real
   */
  getConnectionStatus(): string {
    return supabase.realtime.channels.length > 0 ? 'connected' : 'disconnected';
  }

  /**
   * Reconectar todos os canais
   */
  reconnectAll(): void {
    console.log('[RealTime] Reconectando todos os canais...');
    this.channels.forEach((channel) => {
      channel.subscribe();
    });
  }
}

export const realTimeService = new RealTimeService();
export default realTimeService;