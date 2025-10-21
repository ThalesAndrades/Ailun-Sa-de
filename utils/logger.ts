/**
 * Sistema de Logging Centralizado
 * Padroniza logs em toda a aplicação com níveis e formatação consistente
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogContext {
  service?: string;
  method?: string;
  userId?: string;
  requestId?: number;
  [key: string]: any;
}

class Logger {
  private level: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.INFO;
  private prefix: string = '[AiLun]';

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `${this.prefix} ${timestamp} [${level}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const fullContext = { 
      ...context, 
      error: error?.message,
      stack: error?.stack 
    };
    console.error(this.formatMessage('ERROR', message, fullContext));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    console.warn(this.formatMessage('WARN', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.info(this.formatMessage('INFO', message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.log(this.formatMessage('DEBUG', message, context));
  }

  // Métodos específicos para serviços
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.debug(`API Request: ${method} ${url}`, { 
      ...context, 
      type: 'api_request' 
    });
  }

  apiResponse(status: number, url: string, duration?: number, context?: LogContext): void {
    this.debug(`API Response: ${status} ${url}`, { 
      ...context, 
      status, 
      duration,
      type: 'api_response' 
    });
  }

  apiError(method: string, url: string, error: any, context?: LogContext): void {
    this.error(`API Error: ${method} ${url}`, error, { 
      ...context, 
      type: 'api_error',
      status: error.response?.status 
    });
  }

  cacheHit(key: string, context?: LogContext): void {
    this.debug(`Cache Hit: ${key}`, { 
      ...context, 
      type: 'cache_hit' 
    });
  }

  cacheMiss(key: string, context?: LogContext): void {
    this.debug(`Cache Miss: ${key}`, { 
      ...context, 
      type: 'cache_miss' 
    });
  }

  userAction(action: string, userId?: string, context?: LogContext): void {
    this.info(`User Action: ${action}`, { 
      ...context, 
      userId,
      type: 'user_action' 
    });
  }
}

// Instância singleton
export const logger = new Logger();

// Helpers para contextos específicos
export const createServiceLogger = (serviceName: string) => ({
  error: (message: string, error?: Error, context?: LogContext) =>
    logger.error(message, error, { ...context, service: serviceName }),
  
  warn: (message: string, context?: LogContext) =>
    logger.warn(message, { ...context, service: serviceName }),
  
  info: (message: string, context?: LogContext) =>
    logger.info(message, { ...context, service: serviceName }),
  
  debug: (message: string, context?: LogContext) =>
    logger.debug(message, { ...context, service: serviceName }),
  
  apiRequest: (method: string, url: string, context?: LogContext) =>
    logger.apiRequest(method, url, { ...context, service: serviceName }),
  
  apiResponse: (status: number, url: string, duration?: number, context?: LogContext) =>
    logger.apiResponse(status, url, duration, { ...context, service: serviceName }),
  
  apiError: (method: string, url: string, error: any, context?: LogContext) =>
    logger.apiError(method, url, error, { ...context, service: serviceName }),
  
  cacheHit: (key: string, context?: LogContext) =>
    logger.cacheHit(key, { ...context, service: serviceName }),
  
  cacheMiss: (key: string, context?: LogContext) =>
    logger.cacheMiss(key, { ...context, service: serviceName })
});