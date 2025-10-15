/**
 * Utilitário de Retry para chamadas de API
 * Implementa lógica de retry com backoff exponencial
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryableStatuses?: number[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

/**
 * Executa uma função com retry automático em caso de falha
 * @param fn Função assíncrona a ser executada
 * @param options Opções de configuração do retry
 * @returns Resultado da função ou lança erro após esgot ar tentativas
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let delay = opts.initialDelay;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Não fazer retry se for o último attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Verificar se o erro é retryable
      const isRetryable = isRetryableError(error, opts.retryableStatuses);
      
      if (!isRetryable) {
        throw error;
      }

      // Aguardar antes de tentar novamente
      await sleep(delay);

      // Calcular próximo delay com backoff exponencial
      delay = Math.min(delay * opts.backoffMultiplier, opts.maxDelay);
    }
  }

  throw lastError;
}

/**
 * Verifica se um erro é retryable
 * @param error Erro a ser verificado
 * @param retryableStatuses Lista de status codes retryable
 * @returns true se o erro é retryable
 */
function isRetryableError(error: any, retryableStatuses: number[]): boolean {
  // Erros de rede são sempre retryable
  if (error.message?.includes('Network Error') || error.message?.includes('timeout') || error.message?.includes('Load failed')) {
    return true;
  }

  // Verificar status code
  if (error.response?.status) {
    return retryableStatuses.includes(error.response.status);
  }

  return false;
}

/**
 * Função auxiliar para aguardar um tempo determinado
 * @param ms Tempo em milissegundos
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Cria uma versão com retry de uma função assíncrona
 * @param fn Função assíncrona a ser envolvida
 * @param options Opções de configuração do retry
 * @returns Função envolvida com retry
 */
export function createRetryableFn<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: any[]) => {
    return withRetry(() => fn(...args), options);
  }) as T;
}

