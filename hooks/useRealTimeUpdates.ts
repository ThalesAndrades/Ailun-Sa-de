/**
 * Hook para atualizações em tempo real
 */

import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import realTimeService from '../services/real-time';
import { useCPFAuth } from './useCPFAuth';

export interface UseRealTimeUpdatesOptions {
  enableConsultations?: boolean;
  enableNotifications?: boolean;
  enablePlanUpdates?: boolean;
  enablePaymentStatus?: boolean;
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const { user, beneficiaryUuid } = useCPFAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const subscriptionsRef = useRef<string[]>([]);

  // Callbacks para diferentes tipos de atualizações
  const [consultationUpdates, setConsultationUpdates] = useState<any[]>([]);
  const [notificationUpdates, setNotificationUpdates] = useState<any[]>([]);
  const [planUpdates, setPlanUpdates] = useState<any[]>([]);
  const [paymentUpdates, setPaymentUpdates] = useState<any[]>([]);

  const setupSubscriptions = () => {
    if (!user || !beneficiaryUuid) return;

    console.log('[useRealTimeUpdates] Configurando inscrições para:', beneficiaryUuid);
    
    // Limpar inscrições existentes
    subscriptionsRef.current.forEach(id => realTimeService.unsubscribe(id));
    subscriptionsRef.current = [];

    try {
      // Inscrever-se em consultas
      if (options.enableConsultations) {
        const consultationSubscription = realTimeService.subscribeToUserConsultations(
          beneficiaryUuid,
          {
            onNewConsultation: (consultation) => {
              console.log('[useRealTimeUpdates] Nova consulta:', consultation);
              setConsultationUpdates(prev => [...prev, {
                type: 'new',
                data: consultation,
                timestamp: new Date()
              }]);
              setLastUpdate(new Date());
            },
            onConsultationUpdate: (consultation) => {
              console.log('[useRealTimeUpdates] Consulta atualizada:', consultation);
              setConsultationUpdates(prev => [...prev, {
                type: 'update',
                data: consultation,
                timestamp: new Date()
              }]);
              setLastUpdate(new Date());
            },
            onConsultationCancel: (consultation) => {
              console.log('[useRealTimeUpdates] Consulta cancelada:', consultation);
              setConsultationUpdates(prev => [...prev, {
                type: 'cancel',
                data: consultation,
                timestamp: new Date()
              }]);
              setLastUpdate(new Date());
            },
          }
        );
        subscriptionsRef.current.push(consultationSubscription);
      }

      // Inscrever-se em notificações
      if (options.enableNotifications) {
        const notificationSubscription = realTimeService.subscribeToUserNotifications(
          beneficiaryUuid,
          {
            onNewNotification: (notification) => {
              console.log('[useRealTimeUpdates] Nova notificação:', notification);
              setNotificationUpdates(prev => [...prev, {
                type: 'new',
                data: notification,
                timestamp: new Date()
              }]);
              setLastUpdate(new Date());
            },
            onNotificationRead: (notification) => {
              console.log('[useRealTimeUpdates] Notificação lida:', notification);
              setNotificationUpdates(prev => [...prev, {
                type: 'read',
                data: notification,
                timestamp: new Date()
              }]);
              setLastUpdate(new Date());
            },
          }
        );
        subscriptionsRef.current.push(notificationSubscription);
      }

      // Inscrever-se em atualizações de plano
      if (options.enablePlanUpdates && user.id) {
        const planSubscription = realTimeService.subscribeToUserPlan(
          user.id,
          {
            onPlanUpdate: (plan) => {
              console.log('[useRealTimeUpdates] Plano atualizado:', plan);
              setPlanUpdates(prev => [...prev, {
                type: 'update',
                data: plan,
                timestamp: new Date()
              }]);
              setLastUpdate(new Date());
            },
            onPlanCancel: (plan) => {
              console.log('[useRealTimeUpdates] Plano cancelado:', plan);
              setPlanUpdates(prev => [...prev, {
                type: 'cancel',
                data: plan,
                timestamp: new Date()
              }]);
              setLastUpdate(new Date());
            },
          }
        );
        subscriptionsRef.current.push(planSubscription);
      }

      // Inscrever-se em status de pagamento
      if (options.enablePaymentStatus) {
        const paymentSubscription = realTimeService.subscribeToPaymentStatus(
          beneficiaryUuid,
          {
            onPaymentConfirmed: (payment) => {
              console.log('[useRealTimeUpdates] Pagamento confirmado:', payment);
              setPaymentUpdates(prev => [...prev, {
                type: 'confirmed',
                data: payment,
                timestamp: new Date()
              }]);
              setLastUpdate(new Date());
            },
            onPaymentFailed: (payment) => {
              console.log('[useRealTimeUpdates] Pagamento falhou:', payment);
              setPaymentUpdates(prev => [...prev, {
                type: 'failed',
                data: payment,
                timestamp: new Date()
              }]);
              setLastUpdate(new Date());
            },
          }
        );
        subscriptionsRef.current.push(paymentSubscription);
      }

      setIsConnected(true);
      console.log(`[useRealTimeUpdates] ${subscriptionsRef.current.length} inscrições ativas`);

    } catch (error) {
      console.error('[useRealTimeUpdates] Erro ao configurar inscrições:', error);
      setIsConnected(false);
    }
  };

  // Gerenciar estado do app (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[useRealTimeUpdates] App ativo - reconectando...');
        realTimeService.reconnectAll();
        setIsConnected(true);
      } else if (nextAppState === 'background') {
        console.log('[useRealTimeUpdates] App em background');
        setIsConnected(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Configurar inscrições quando o usuário mudar
  useEffect(() => {
    setupSubscriptions();
    
    return () => {
      subscriptionsRef.current.forEach(id => realTimeService.unsubscribe(id));
      subscriptionsRef.current = [];
    };
  }, [user?.id, beneficiaryUuid, options]);

  // Limpar atualizações antigas (manter apenas as últimas 50)
  const clearOldUpdates = () => {
    setConsultationUpdates(prev => prev.slice(-50));
    setNotificationUpdates(prev => prev.slice(-50));
    setPlanUpdates(prev => prev.slice(-50));
    setPaymentUpdates(prev => prev.slice(-50));
  };

  // Reconectar manualmente
  const reconnect = () => {
    console.log('[useRealTimeUpdates] Reconectando manualmente...');
    realTimeService.reconnectAll();
    setupSubscriptions();
  };

  return {
    isConnected,
    lastUpdate,
    consultationUpdates,
    notificationUpdates,
    planUpdates,
    paymentUpdates,
    clearOldUpdates,
    reconnect,
    connectionStatus: realTimeService.getConnectionStatus(),
  };
}