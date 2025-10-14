/**
 * Sistema Centralizado de Tratamento de Erros
 * Versão Produção - AiLun Saúde
 */

import { logger } from '../utils/logger';
import { ERROR_MESSAGES, IS_PRODUCTION } from '../constants/config';

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  GENERIC = 'GENERIC',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  code?: string | number;
  details?: any;
  timestamp: Date;
}

class ErrorHandler {
  /**
   * Processar e categorizar erros
   */
  static handleError(error: any, context?: string): AppError {
    const timestamp = new Date();
    let appError: AppError;

    // Categorizar o erro
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network')) {
      appError = {
        type: ErrorType.NETWORK,
        message: ERROR_MESSAGES.NETWORK,
        originalError: error,
        timestamp,
      };
    } else if (error?.status === 401 || error?.code === 'UNAUTHORIZED') {
      appError = {
        type: ErrorType.AUTHENTICATION,
        message: ERROR_MESSAGES.AUTHENTICATION,
        originalError: error,
        code: 401,
        timestamp,
      };
    } else if (error?.status === 403 || error?.code === 'FORBIDDEN') {
      appError = {
        type: ErrorType.FORBIDDEN,
        message: ERROR_MESSAGES.FORBIDDEN,
        originalError: error,
        code: 403,
        timestamp,
      };
    } else if (error?.status === 404 || error?.code === 'NOT_FOUND') {
      appError = {
        type: ErrorType.NOT_FOUND,
        message: ERROR_MESSAGES.NOT_FOUND,
        originalError: error,
        code: 404,
        timestamp,
      };
    } else if (error?.status >= 500 || error?.code === 'SERVER_ERROR') {
      appError = {
        type: ErrorType.SERVER,
        message: ERROR_MESSAGES.SERVER,
        originalError: error,
        code: error?.status || 500,
        timestamp,
      };
    } else if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
      appError = {
        type: ErrorType.TIMEOUT,
        message: ERROR_MESSAGES.TIMEOUT,
        originalError: error,
        timestamp,
      };
    } else if (error?.code === 'VALIDATION_ERROR' || error?.message?.includes('validation')) {
      appError = {
        type: ErrorType.VALIDATION,
        message: ERROR_MESSAGES.VALIDATION,
        originalError: error,
        timestamp,
      };
    } else {
      appError = {
        type: ErrorType.GENERIC,
        message: ERROR_MESSAGES.GENERIC,
        originalError: error,
        timestamp,
      };
    }

    // Adicionar detalhes se disponíveis
    if (error?.details) {
      appError.details = error.details;
    }

    // Log do erro
    const logContext = context ? `[${context}]` : '';
    logger.error(
      `${logContext} ${appError.type}: ${appError.message}`,
      {
        originalMessage: error?.message,
        stack: error?.stack,
        status: error?.status,
        code: error?.code,
        details: appError.details,
      },
      'ErrorHandler'
    );

    // Em produção, sanitizar informações sensíveis
    if (IS_PRODUCTION) {
      delete appError.details;
      delete (appError as any).originalError;
    }

    return appError;
  }

  /**
   * Tratar erros de rede/HTTP
   */
  static handleNetworkError(error: any, url?: string): AppError {
    let type = ErrorType.NETWORK;
    let message = ERROR_MESSAGES.NETWORK;

    // Verificar status HTTP específicos
    if (error?.response?.status) {
      const status = error.response.status;
      
      if (status === 401) {
        type = ErrorType.AUTHENTICATION;
        message = ERROR_MESSAGES.AUTHENTICATION;
      } else if (status === 403) {
        type = ErrorType.FORBIDDEN;
        message = ERROR_MESSAGES.FORBIDDEN;
      } else if (status === 404) {
        type = ErrorType.NOT_FOUND;
        message = ERROR_MESSAGES.NOT_FOUND;
      } else if (status >= 500) {
        type = ErrorType.SERVER;
        message = ERROR_MESSAGES.SERVER;
      }
    }

    return this.handleError({
      ...error,
      type,
      message,
      url,
    }, 'NetworkError');
  }

  /**
   * Tratar erros de validação
   */
  static handleValidationError(error: any, field?: string): AppError {
    return this.handleError({
      ...error,
      code: 'VALIDATION_ERROR',
      field,
    }, 'ValidationError');
  }

  /**
   * Tratar erros de autenticação
   */
  static handleAuthError(error: any): AppError {
    return this.handleError({
      ...error,
      code: 'UNAUTHORIZED',
    }, 'AuthError');
  }

  /**
   * Converter erro para mensagem amigável
   */
  static getErrorMessage(error: AppError | Error | any): string {
    if (error?.type && error?.message) {
      return error.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return ERROR_MESSAGES.GENERIC;
  }

  /**
   * Verificar se erro é recuperável
   */
  static isRecoverableError(error: AppError): boolean {
    return [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.SERVER,
    ].includes(error.type);
  }

  /**
   * Verificar se erro requer reautenticação
   */
  static requiresReauth(error: AppError): boolean {
    return [
      ErrorType.AUTHENTICATION,
      ErrorType.FORBIDDEN,
    ].includes(error.type);
  }
}

/**
 * Wrapper para try-catch com tratamento automático
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<{ success: true; data: T } | { success: false; error: AppError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const appError = ErrorHandler.handleError(error, context);
    return { success: false, error: appError };
  }
}

/**
 * Decorator para métodos com tratamento de erro automático
 */
export function handleErrors(context?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        const appError = ErrorHandler.handleError(error, context || propertyName);
        throw appError;
      }
    };
  };
}

export default ErrorHandler;