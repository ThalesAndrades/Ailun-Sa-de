/**
 * Sistema de Log Inteligente para Produção
 * Controla logs baseado no ambiente e nível configurado
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  environment: 'development' | 'production' | 'test';
}

// Verificar se é ambiente de desenvolvimento
function isDev(): boolean {
  try {
    return typeof __DEV__ !== 'undefined' ? __DEV__ : false;
  } catch {
    return false;
  }
}

export class ProductionLogger {
  private config: LogConfig;
  private logQueue: Array<{ level: LogLevel; message: string; data?: any; timestamp: Date }> = [];
  private context: string;

  constructor(context: string = 'App') {
    this.context = context;
    this.config = {
      level: this.getLogLevel(),
      enableConsole: this.shouldEnableConsole(),
      enableRemote: this.shouldEnableRemote(),
      environment: this.getEnvironment(),
    };
  }

  private getLogLevel(): LogLevel {
    try {
      if (typeof process !== 'undefined' && process.env) {
        return (process.env.LOG_LEVEL as LogLevel) || 'warn';
      }
    } catch {}
    return isDev() ? 'debug' : 'warn';
  }

  private shouldEnableConsole(): boolean {
    try {
      if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV !== 'production' || process.env.DEBUG_MODE === 'true';
      }
    } catch {}
    return isDev();
  }

  private shouldEnableRemote(): boolean {
    try {
      if (typeof process !== 'undefined' && process.env) {
        return process.env.NODE_ENV === 'production' && process.env.ENABLE_CRASH_REPORTING === 'true';
      }
    } catch {}
    return false;
  }

  private getEnvironment(): 'development' | 'production' | 'test' {
    try {
      if (typeof process !== 'undefined' && process.env) {
        return (process.env.NODE_ENV as any) || 'development';
      }
    } catch {}
    return isDev() ? 'development' : 'production';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = ['debug', 'info', 'warn', 'error', 'silent'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const requestedLevelIndex = levels.indexOf(level);
    
    return requestedLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.context}] [${level.toUpperCase()}]`;
    
    if (data) {
      try {
        return `${prefix} ${message} ${JSON.stringify(data)}`;
      } catch {
        return `${prefix} ${message} [Unparseable data]`;
      }
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (!this.shouldLog('debug')) return;

    if (this.config.enableConsole && console.debug) {
      console.debug(this.formatMessage('debug', message, data));
    }

    this.logQueue.push({ level: 'debug', message, data, timestamp: new Date() });
  }

  info(message: string, data?: any): void {
    if (!this.shouldLog('info')) return;

    if (this.config.enableConsole && console.info) {
      console.info(this.formatMessage('info', message, data));
    }

    this.logQueue.push({ level: 'info', message, data, timestamp: new Date() });
  }

  warn(message: string, data?: any): void {
    if (!this.shouldLog('warn')) return;

    if (this.config.enableConsole && console.warn) {
      console.warn(this.formatMessage('warn', message, data));
    }

    this.logQueue.push({ level: 'warn', message, data, timestamp: new Date() });
  }

  error(message: string, error?: any): void {
    if (!this.shouldLog('error')) return;

    if (this.config.enableConsole && console.error) {
      console.error(this.formatMessage('error', message, error));
    }

    this.logQueue.push({ level: 'error', message, data: error, timestamp: new Date() });

    // Em produção, enviar erros críticos para serviço de monitoramento
    if (this.config.environment === 'production' && this.config.enableRemote) {
      this.sendToRemoteService('error', message, error);
    }
  }

  private async sendToRemoteService(level: LogLevel, message: string, data?: any): Promise<void> {
    try {
      // Implementar integração com Sentry, Crashlytics, ou outro serviço
      // Por enquanto, apenas armazenar localmente
      console.warn('Remote logging not implemented yet');
    } catch (error) {
      console.error('Failed to send log to remote service:', error);
    }
  }

  // Método para limpar logs antigos
  clearLogs(): void {
    this.logQueue = [];
  }

  // Método para obter logs (útil para debug)
  getLogs(level?: LogLevel): Array<any> {
    if (level) {
      return this.logQueue.filter(log => log.level === level);
    }
    return [...this.logQueue];
  }

  // Método para configurar nível de log dinamicamente
  setLogLevel(level: LogLevel): void {
    this.config.level = level;
  }
}

// Instância singleton
export const logger = new ProductionLogger('Global');

// Exports para compatibilidade
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
};

export default logger;