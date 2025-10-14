/**
 * Hook para Integrações em Tempo Real
 * Gerencia estado de conectividade, sincronização automática e recuperação de falhas
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, NetInfo } from 'react-native';
import { useIntegrationOrchestrator } from '../services/integration-orchestrator';
import { useErrorRecovery } from '../services/error-recovery';
import { showTemplateMessage } from '../utils/alertHelpers';
import { SuccessMessages, InfoMessages } from '../constants/ErrorMessages';

interface IntegrationStatus {
  isOnline: boolean;
  isConnected: boolean;
  lastSync: Date | null;
  pendingOperations: number;
  health: {
    overall: 'healthy' | 'degraded' | 'down';
    rapidoc: 'healthy' | 'degraded' | 'down';
    supabase: 'healthy' | 'degraded' | 'down';
    asaas: 'healthy' | 'degraded' | 'down';
    resend: 'healthy' | 'degraded' | 'down';
  };
}

interface UseRealTimeIntegrationsReturn {
  status: IntegrationStatus;
  requestConsultation: (request: any) => Promise<any>;
  processPayment: (request: any) => Promise<any>;
  sendNotification: (userId: string, type: string, template: string, data: any) => Promise<any>;
  syncUserData: (userId: string) => Promise<any>;
  forceSync: () => Promise<void>;
  retryFailedOperations: () => Promise<void>;
  isLoading: boolean;
}

export function useRealTimeIntegrations(): UseRealTimeIntegrationsReturn {
  const orchestrator = useIntegrationOrchestrator();
  const errorRecovery = useErrorRecovery();
  
  const [status, setStatus] = useState<IntegrationStatus>({
    isOnline: true,
    isConnected: true,
    lastSync: null,
    pendingOperations: 0,
    health: {
      overall: 'healthy',
      rapidoc: 'healthy',
      supabase: 'healthy',
      asaas: 'healthy',
      resend: 'healthy',
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const healthCheckIntervalRef = useRef<NodeJS.Timeout>();
  const lastHealthCheckRef = useRef<Date>(new Date());

  // Verificar conectividade de rede
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOnline = status.isOnline;
      const isOnline = state.isConnected ?? true;
      
      setStatus(prev => ({ ...prev, isOnline }));
      
      // Se voltou online, processar fila offline
      if (!wasOnline && isOnline) {
        handleBackOnline();
      }
    });

    return unsubscribe;
  }, [status.isOnline]);

  // Verificar mudanças de estado do app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App voltou para foreground - verificar integrações
        checkIntegrationsHealth();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Configurar verificações periódicas
  useEffect(() => {
    // Verificação de saúde a cada 2 minutos
    healthCheckIntervalRef.current = setInterval(() => {
      checkIntegrationsHealth();
    }, 2 * 60 * 1000);

    // Sincronização a cada 5 minutos
    syncIntervalRef.current = setInterval(() => {
      if (status.isOnline && status.isConnected) {
        updatePendingOperations();
      }
    }, 5 * 60 * 1000);

    // Verificação inicial
    checkIntegrationsHealth();

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  const checkIntegrationsHealth = useCallback(async () => {
    try {
      const healthStatus = await orchestrator.checkHealth();
      const stats = errorRecovery.getStats();
      
      setStatus(prev => ({
        ...prev,
        health: healthStatus.services,
        isConnected: healthStatus.overall !== 'down',
        pendingOperations: stats.queueSize,
      }));

      lastHealthCheckRef.current = new Date();

      // Notificar sobre problemas de conectividade
      if (healthStatus.overall === 'down') {
        showTemplateMessage({
          title: '⚠️ Problemas de Conectividade',
          message: 'Alguns serviços estão indisponíveis. Trabalhamos em modo offline.',
          type: 'warning'
        });
      } else if (healthStatus.overall === 'degraded') {
        console.log('[RealTimeIntegrations] Serviços com performance reduzida');
      }
    } catch (error) {
      console.error('[RealTimeIntegrations] Erro na verificação de saúde:', error);
      setStatus(prev => ({ ...prev, isConnected: false }));
    }
  }, []);

  const handleBackOnline = useCallback(async () => {
    console.log('[RealTimeIntegrations] Dispositivo voltou online');
    
    try {
      setIsLoading(true);
      
      // Processar fila offline
      const result = await errorRecovery.processOfflineQueue();
      
      if (result.processed > 0) {
        showTemplateMessage({
          title: '🔄 Sincronização Concluída',
          message: `${result.successful} operações sincronizadas com sucesso.`,
          type: 'success'
        });
      }

      // Verificar saúde das integrações
      await checkIntegrationsHealth();
      
      setStatus(prev => ({ 
        ...prev, 
        lastSync: new Date(),
        pendingOperations: result.failed,
      }));
      
    } catch (error) {
      console.error('[RealTimeIntegrations] Erro ao processar volta online:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePendingOperations = useCallback(async () => {
    const stats = errorRecovery.getStats();
    setStatus(prev => ({ 
      ...prev, 
      pendingOperations: stats.queueSize 
    }));
  }, []);

  // Wrappers para operações com recuperação automática
  const requestConsultation = useCallback(async (request: any) => {
    setIsLoading(true);
    try {
      const result = await orchestrator.requestConsultation(request);
      if (result.success) {
        setStatus(prev => ({ ...prev, lastSync: new Date() }));
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const processPayment = useCallback(async (request: any) => {
    setIsLoading(true);
    try {
      const result = await orchestrator.processPayment(request);
      if (result.success) {
        setStatus(prev => ({ ...prev, lastSync: new Date() }));
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendNotification = useCallback(async (
    userId: string,
    type: string,
    template: string,
    data: any
  ) => {
    setIsLoading(true);
    try {
      const result = await orchestrator.sendNotification(userId, type as any, template, data);
      if (result.success) {
        setStatus(prev => ({ ...prev, lastSync: new Date() }));
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncUserData = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const result = await orchestrator.syncUserData(userId);
      setStatus(prev => ({ ...prev, lastSync: new Date() }));
      
      if (result.success) {
        showTemplateMessage({
          title: '✅ Dados Sincronizados',
          message: `Sincronizado com: ${result.syncedSystems.join(', ')}`,
          type: 'success'
        });
      } else if (result.errors.length > 0) {
        showTemplateMessage({
          title: '⚠️ Sincronização Parcial',
          message: `Alguns sistemas não foram sincronizados: ${result.errors.join(', ')}`,
          type: 'warning'
        });
      }
      
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forceSync = useCallback(async () => {
    await checkIntegrationsHealth();
    await updatePendingOperations();
    
    showTemplateMessage({
      title: '🔄 Sincronização Forçada',
      message: 'Estado das integrações atualizado.',
      type: 'info'
    });
  }, []);

  const retryFailedOperations = useCallback(async () => {
    if (!status.isOnline) {
      showTemplateMessage({
        title: '📱 Sem Conectividade',
        message: 'Verifique sua conexão com a internet e tente novamente.',
        type: 'warning'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await errorRecovery.processOfflineQueue();
      
      if (result.processed === 0) {
        showTemplateMessage({
          title: '✅ Nenhuma Operação Pendente',
          message: 'Todas as operações foram processadas.',
          type: 'success'
        });
      } else {
        showTemplateMessage({
          title: '🔄 Operações Reprocessadas',
          message: `${result.successful} de ${result.processed} operações foram processadas com sucesso.`,
          type: result.successful === result.processed ? 'success' : 'warning'
        });
      }
      
      await updatePendingOperations();
    } catch (error) {
      showTemplateMessage({
        title: '❌ Erro no Reprocessamento',
        message: 'Não foi possível processar as operações pendentes.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [status.isOnline]);

  return {
    status,
    requestConsultation,
    processPayment,
    sendNotification,
    syncUserData,
    forceSync,
    retryFailedOperations,
    isLoading,
  };
}

/**
 * Hook simplificado para verificar status das integrações
 */
export function useIntegrationStatus() {
  const { status } = useRealTimeIntegrations();
  
  return {
    isOnline: status.isOnline,
    isConnected: status.isConnected,
    hasProblems: status.health.overall !== 'healthy',
    pendingOperations: status.pendingOperations,
    lastSync: status.lastSync,
  };
}