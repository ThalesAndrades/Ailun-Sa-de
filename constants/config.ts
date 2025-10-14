/**
 * Configurações Centralizadas do AiLun Saúde
 */

// Detectar ambiente
export const IS_DEVELOPMENT = __DEV__;
export const IS_PRODUCTION = process.env.EXPO_PUBLIC_APP_ENV === 'production';
export const IS_STAGING = process.env.EXPO_PUBLIC_APP_ENV === 'staging';

// Configurações de API
export const API_CONFIG = {
  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  
  // RapiDoc
  RAPIDOC_BASE_URL: process.env.RAPIDOC_BASE_URL || 'https://api.rapidoc.tech',
  RAPIDOC_CLIENT_ID: process.env.RAPIDOC_CLIENT_ID!,
  RAPIDOC_TOKEN: process.env.RAPIDOC_TOKEN!,
  
  // Asaas
  ASAAS_API_KEY: process.env.ASAAS_API_KEY!,
  ASAAS_BASE_URL: 'https://api.asaas.com/v3',
  
  // Resend
  RESEND_API_KEY: process.env.RESEND_API_KEY!,
} as const;

// Configurações de comportamento
export const APP_CONFIG = {
  // Timeouts
  API_TIMEOUT: IS_PRODUCTION ? 30000 : 10000, // 30s produção, 10s dev
  CACHE_TIMEOUT: IS_PRODUCTION ? 300000 : 60000, // 5min produção, 1min dev
  
  // Retry
  MAX_RETRY_ATTEMPTS: IS_PRODUCTION ? 3 : 1,
  RETRY_DELAY: 1000,
  
  // Notificações
  NOTIFICATION_REFRESH_INTERVAL: 30000, // 30 segundos
  
  // Logs
  DISABLE_LOGS: process.env.EXPO_PUBLIC_DISABLE_LOGS === 'true' || IS_PRODUCTION,
  MAX_LOGS_IN_MEMORY: 1000,
  
  // Features
  ENABLE_ANALYTICS: IS_PRODUCTION,
  ENABLE_CRASH_REPORTING: IS_PRODUCTION,
  ENABLE_PERFORMANCE_MONITORING: IS_PRODUCTION,
  
  // Limites
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Validações
  VALIDATE_SCHEMAS: IS_DEVELOPMENT,
  STRICT_MODE: IS_DEVELOPMENT,
} as const;

// URLs e Endpoints
export const ENDPOINTS = {
  // RapiDoc
  RAPIDOC: {
    BENEFICIARIES: '/beneficiaries',
    APPOINTMENTS: '/appointments',
    SPECIALTIES: '/specialties',
    AVAILABILITY: '/availability',
  },
  
  // Supabase Edge Functions
  EDGE_FUNCTIONS: {
    ORCHESTRATOR: '/functions/v1/orchestrator',
    RAPIDOC_PROXY: '/functions/v1/rapidoc',
    TEMA_ORCHESTRATOR: '/functions/v1/tema-orchestrator',
  },
} as const;

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  TIMEOUT: 'Tempo limite excedido. Tente novamente.',
  AUTHENTICATION: 'Sessão expirada. Faça login novamente.',
  VALIDATION: 'Dados inválidos. Verifique as informações.',
  SERVER: 'Erro interno do servidor. Tente mais tarde.',
  NOT_FOUND: 'Recurso não encontrado.',
  FORBIDDEN: 'Acesso negado.',
  GENERIC: 'Erro inesperado. Tente novamente.',
} as const;

// Configurações de tema e UI
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#00B4DB',
    SECONDARY: '#0083B0',
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    ERROR: '#F44336',
    INFO: '#2196F3',
  },
  FONTS: {
    REGULAR: 'System',
    MEDIUM: 'System',
    BOLD: 'System',
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
  },
} as const;

// Validar configurações essenciais
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!API_CONFIG.SUPABASE_URL) {
    errors.push('EXPO_PUBLIC_SUPABASE_URL não configurada');
  }
  
  if (!API_CONFIG.SUPABASE_ANON_KEY) {
    errors.push('EXPO_PUBLIC_SUPABASE_ANON_KEY não configurada');
  }
  
  if (!API_CONFIG.RAPIDOC_CLIENT_ID) {
    errors.push('RAPIDOC_CLIENT_ID não configurada');
  }
  
  if (!API_CONFIG.RAPIDOC_TOKEN) {
    errors.push('RAPIDOC_TOKEN não configurada');
  }
  
  if (!API_CONFIG.ASAAS_API_KEY) {
    errors.push('ASAAS_API_KEY não configurada');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default {
  IS_DEVELOPMENT,
  IS_PRODUCTION,
  IS_STAGING,
  API_CONFIG,
  APP_CONFIG,
  ENDPOINTS,
  ERROR_MESSAGES,
  THEME_CONFIG,
  validateConfig,
};