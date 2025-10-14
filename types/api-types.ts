/**
 * Tipos TypeScript genéricos para respostas de API
 */

export interface ApiResponse<T = any> {
  message?: string;
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  // Adicione outros campos comuns de resposta de API aqui, se houver
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  code?: number;
}

