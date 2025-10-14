/**
 * Sistema de Logging para Produção
 * Substitui console.log/console.error em produção por sistema controlado
 */

const IS_PRODUCTION = process.env.EXPO_PUBLIC_APP_ENV === 'production' || 
                     process.env.EXPO_PUBLIC_DISABLE_LOGS === 'true';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  source?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Limite de logs mantidos em memória

  private addLog(level: LogLevel, message: string, data?: any, source?: string) {
    const logEntry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      source
    };

    this.logs.push(logEntry);

    // Manter apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Em desenvolvimento, sempre mostrar no console
    if (!IS_PRODUCTION) {
      const timestamp = logEntry.timestamp.toISOString();
      const prefix = source ? `[${source}]` : '';
      
      switch (level) {
        case 'debug':
          console.log(`🐛 ${timestamp} ${prefix} ${message}`, data || '');
          break;
        case 'info':
          console.info(`ℹ️ ${timestamp} ${prefix} ${message}`, data || '');
          break;
        case 'warn':
          console.warn(`⚠️ ${timestamp} ${prefix} ${message}`, data || '');
          break;
        case 'error':
          console.error(`❌ ${timestamp} ${prefix} ${message}`, data || '');
          break;
      }
    }
  }

  debug(message: string, data?: any, source?: string) {
    this.addLog('debug', message, data, source);
  }

  info(message: string, data?: any, source?: string) {
    this.addLog('info', message, data, source);
  }

  warn(message: string, data?: any, source?: string) {
    this.addLog('warn', message, data, source);
  }

  error(message: string, data?: any, source?: string) {
    this.addLog('error', message, data, source);
    
    // Em produção, sempre mostrar erros críticos
    if (IS_PRODUCTION) {
      console.error(`[AiLun Saúde] ${message}`, data || '');
    }
  }

  // Obter logs para debug ou envio para serviços externos
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // Limpar logs
  clearLogs() {
    this.logs = [];
  }

  // Exportar logs como string para debug
  exportLogs(): string {
    return this.logs
      .map(log => {
        const timestamp = log.timestamp.toISOString();
        const data = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
        const source = log.source ? ` [${log.source}]` : '';
        return `${log.level.toUpperCase()} | ${timestamp}${source} | ${log.message}${data}`;
      })
      .join('\n');
  }
}

// Instância única do logger
export const logger = new Logger();

// Substituir console global em produção (opcional)
if (IS_PRODUCTION) {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (message: any, ...args: any[]) => {
    logger.info(String(message), args.length > 0 ? args : undefined);
  };

  console.warn = (message: any, ...args: any[]) => {
    logger.warn(String(message), args.length > 0 ? args : undefined);
  };

  console.error = (message: any, ...args: any[]) => {
    logger.error(String(message), args.length > 0 ? args : undefined);
  };

  // Manter console.info inalterado para logs de sistema essenciais
}

export default logger;