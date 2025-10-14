/**
 * Sistema de Recuperação de Erros e Fallbacks
 * Implementa estratégias robustas para lidar com falhas de integração
 */

import { cache, createCacheKey } from '../utils/cache';
import { withRetry } from '../utils/retry';
import { ErrorMessages, SuccessMessages } from '../constants/ErrorMessages';

export interface ErrorRecoveryConfig {
  maxRetries: number;
  fallbackToCache: boolean;
  offlineMode: boolean;
  gracefulDegradation: boolean;
}

const DEFAULT_CONFIG: ErrorRecoveryConfig = {
  maxRetries: 3,
  fallbackToCache: true,
  offlineMode: true,
  gracefulDegradation: true,
};

export class ErrorRecoveryService {
  private config: ErrorRecoveryConfig;
  private offlineQueue: Array<{
    operation: () => Promise<any>;
    fallback: () => any;
    timestamp: number;
  }> = [];

  constructor(config: Partial<ErrorRecoveryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Executa operação com recuperação automática de erro
   */
  async executeWithRecovery<T>(
    operation: () => Promise<T>,
    fallback: (() => T) | (() => Promise<T>),
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<{ success: boolean; data?: T; error?: string; fromCache?: boolean }> {
    try {
      // Tentar operação principal
      const result = await withRetry(operation, {
        maxRetries: this.config.maxRetries,
        initialDelay: 1000,
        backoffMultiplier: 2,
      });

      // Cachear resultado se sucesso
      if (cacheKey && cacheTTL) {
        cache.set(cacheKey, result, cacheTTL);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('[ErrorRecovery] Operação falhou:', error);

      // Tentar cache primeiro
      if (this.config.fallbackToCache && cacheKey) {
        const cachedData = cache.get<T>(cacheKey);
        if (cachedData) {
          console.log('[ErrorRecovery] Usando dados do cache');
          return {
            success: true,
            data: cachedData,
            fromCache: true,
          };
        }
      }

      // Executar fallback
      try {
        const fallbackResult = await fallback();
        return {
          success: true,
          data: fallbackResult,
        };
      } catch (fallbackError: any) {
        console.error('[ErrorRecovery] Fallback também falhou:', fallbackError);

        // Adicionar à fila offline se configurado
        if (this.config.offlineMode) {
          this.addToOfflineQueue(operation, fallback);
        }

        return {
          success: false,
          error: this.getHumanReadableError(error),
        };
      }
    }
  }

  /**
   * Adiciona operação à fila offline
   */
  private addToOfflineQueue(
    operation: () => Promise<any>,
    fallback: () => any
  ) {
    this.offlineQueue.push({
      operation,
      fallback,
      timestamp: Date.now(),
    });

    // Limitar tamanho da fila
    if (this.offlineQueue.length > 50) {
      this.offlineQueue.shift();
    }
  }

  /**
   * Processa fila offline quando conectividade é restaurada
   */
  async processOfflineQueue(): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    let successful = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        await item.operation();
        successful++;
      } catch (error) {
        console.error('[ErrorRecovery] Falha ao processar item da fila offline:', error);
        failed++;
        // Re-adicionar à fila se ainda for relevante (menos de 1 hora)
        if (Date.now() - item.timestamp < 3600000) {
          this.offlineQueue.push(item);
        }
      }
    }

    return {
      processed: queue.length,
      successful,
      failed,
    };
  }

  /**
   * Converte erro técnico em mensagem humanizada
   */
  private getHumanReadableError(error: any): string {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('network') || message.includes('connection')) {
      return ErrorMessages.GENERAL.NETWORK_ERROR;
    }

    if (message.includes('timeout')) {
      return ErrorMessages.RAPIDOC.TIMEOUT;
    }

    if (message.includes('unauthorized') || message.includes('403')) {
      return ErrorMessages.AUTH.UNAUTHORIZED;
    }

    if (message.includes('not found') || message.includes('404')) {
      return ErrorMessages.GENERAL.NOT_FOUND;
    }

    if (message.includes('server') || message.includes('500')) {
      return ErrorMessages.GENERAL.SERVER_ERROR;
    }

    return ErrorMessages.GENERAL.UNKNOWN_ERROR;
  }

  /**
   * Verifica se há conectividade com os serviços
   */
  async checkConnectivity(): Promise<{
    rapidoc: boolean;
    supabase: boolean;
    asaas: boolean;
    resend: boolean;
  }> {
    const checks = {
      rapidoc: false,
      supabase: false,
      asaas: false,
      resend: false,
    };

    // Verificar RapiDoc
    try {
      const { rapidocHttpClient } = await import('./http-client');
      await rapidocHttpClient.get('/health', { timeout: 5000 });
      checks.rapidoc = true;
    } catch (error) {
      console.log('[ErrorRecovery] RapiDoc indisponível');
    }

    // Verificar Supabase
    try {
      const { supabase } = await import('./supabase');
      const { data } = await supabase.from('user_profiles').select('count').limit(1);
      checks.supabase = !!data;
    } catch (error) {
      console.log('[ErrorRecovery] Supabase indisponível');
    }

    // Verificar Asaas (via Edge Function)
    try {
      const { supabase } = await import('./supabase');
      await supabase.functions.invoke('asaas-webhook', { 
        body: { action: 'health_check' },
        headers: { 'Content-Type': 'application/json' }
      });
      checks.asaas = true;
    } catch (error) {
      console.log('[ErrorRecovery] Asaas indisponível');
    }

    // Para Resend, apenas marcar como true por enquanto
    checks.resend = true;

    return checks;
  }

  /**
   * Limpa cache e redefine estado
   */
  clearState(): void {
    cache.clear();
    this.offlineQueue = [];
  }

  /**
   * Obtém estatísticas do serviço
   */
  getStats(): {
    queueSize: number;
    cacheSize: number;
    oldestQueueItem: number | null;
  } {
    return {
      queueSize: this.offlineQueue.length,
      cacheSize: cache.size(),
      oldestQueueItem: this.offlineQueue.length > 0 
        ? Math.min(...this.offlineQueue.map(item => item.timestamp))
        : null,
    };
  }
}

// Instância singleton
export const errorRecovery = new ErrorRecoveryService();

/**
 * Hook para usar recovery service em componentes
 */
export function useErrorRecovery() {
  return {
    executeWithRecovery: errorRecovery.executeWithRecovery.bind(errorRecovery),
    processOfflineQueue: errorRecovery.processOfflineQueue.bind(errorRecovery),
    checkConnectivity: errorRecovery.checkConnectivity.bind(errorRecovery),
    getStats: errorRecovery.getStats.bind(errorRecovery),
    clearState: errorRecovery.clearState.bind(errorRecovery),
  };
}