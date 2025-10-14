/**
 * Utilitário de Cache para otimização de chamadas de API
 * Implementa cache em memória com expiração automática
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Define um valor no cache com tempo de expiração
   * @param key Chave do cache
   * @param data Dados a serem armazenados
   * @param expiresIn Tempo de expiração em milissegundos
   */
  set<T>(key: string, data: T, expiresIn: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  /**
   * Obtém um valor do cache se ainda não expirou
   * @param key Chave do cache
   * @returns Dados armazenados ou null se expirado/não encontrado
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.expiresIn) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Remove um valor do cache
   * @param key Chave do cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove entradas expiradas do cache
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      const age = now - entry.timestamp;
      if (age > entry.expiresIn) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Obtém o tamanho atual do cache
   */
  size(): number {
    return this.cache.size;
  }
}

// Instância singleton do cache
export const cache = new CacheManager();

// Limpar cache expirado a cada 5 minutos
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

/**
 * Função auxiliar para criar chaves de cache consistentes
 * @param prefix Prefixo da chave (ex: 'specialty', 'availability')
 * @param params Parâmetros adicionais para compor a chave
 * @returns Chave de cache formatada
 */
export function createCacheKey(prefix: string, ...params: (string | number | boolean | undefined)[]): string {
  const filteredParams = params.filter(p => p !== undefined && p !== null);
  return `${prefix}:${filteredParams.join(':')}`;
}

