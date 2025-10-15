/**
 * Configuração RapiDoc - AiLun Saúde
 * Configurações centralizadas para integração com API RapiDoc
 */

// Configurações de ambiente
const RAPIDOC_BASE_URL = process.env.RAPIDOC_BASE_URL || 'https://api.rapidoc.tech';
const RAPIDOC_CLIENT_ID = process.env.RAPIDOC_CLIENT_ID;
const RAPIDOC_TOKEN = process.env.RAPIDOC_TOKEN;

// Validação de configuração
const validateConfig = () => {
  const issues: string[] = [];
  
  if (!RAPIDOC_CLIENT_ID) {
    issues.push('RAPIDOC_CLIENT_ID não configurado');
  }
  
  if (!RAPIDOC_TOKEN) {
    issues.push('RAPIDOC_TOKEN não configurado');
  }
  
  if (!RAPIDOC_BASE_URL) {
    issues.push('RAPIDOC_BASE_URL não configurado');
  }
  
  return {
    isValid: issues.length === 0,
    issues,
  };
};

// Configuração principal
export const RAPIDOC_CONFIG = {
  // URLs base
  baseUrl: RAPIDOC_BASE_URL,
  apiPath: '/tema/api',
  
  // Autenticação
  clientId: RAPIDOC_CLIENT_ID!,
  token: RAPIDOC_TOKEN!,
  
  // Headers padrão
  defaultHeaders: {
    'Authorization': `Bearer ${RAPIDOC_TOKEN}`,
    'clientId': RAPIDOC_CLIENT_ID!,
    'Content-Type': 'application/vnd.rapidoc.tema-v2+json',
    'Accept': 'application/json',
    'User-Agent': 'AiLun-Saude/2.1.0',
  },
  
  // Timeouts (em ms)
  timeouts: {
    connection: 10000, // 10 segundos
    response: 30000,   // 30 segundos
    retry: 5000,       // 5 segundos entre tentativas
  },
  
  // Retry configuration
  retry: {
    maxAttempts: 3,
    backoffMultiplier: 2,
    initialDelay: 1000,
  },
  
  // Rate limiting
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000, // 1 minuto
  },
  
  // Endpoints mapeados
  endpoints: {
    // Beneficiários
    beneficiaries: '/tema/api/beneficiaries',
    beneficiaryByCpf: (cpf: string) => `/tema/api/beneficiaries/${cpf}`,
    beneficiaryByUuid: (uuid: string) => `/tema/api/beneficiaries/${uuid}`,
    deactivateBeneficiary: (uuid: string) => `/tema/api/beneficiaries/${uuid}`,
    reactivateBeneficiary: (uuid: string) => `/tema/api/beneficiaries/${uuid}/reactivate`,
    
    // Consultas
    requestAppointment: (uuid: string) => `/tema/api/beneficiaries/${uuid}/request-appointment`,
    beneficiaryAppointments: (uuid: string) => `/tema/api/beneficiaries/${uuid}/appointments`,
    beneficiaryMedicalReferrals: (uuid: string) => `/tema/api/beneficiaries/${uuid}/medical-referrals`,
    
    // Agendamentos
    specialties: '/tema/api/specialties',
    specialtyAvailability: '/tema/api/specialty-availability',
    appointments: '/tema/api/appointments',
    appointmentByUuid: (uuid: string) => `/tema/api/appointments/${uuid}`,
    cancelAppointment: (uuid: string) => `/tema/api/appointments/${uuid}`,
    
    // Encaminhamentos
    medicalReferrals: '/tema/api/beneficiary-medical-referrals',
    
    // Planos
    plans: '/tema/api/plans',
  },
  
  // Mapeamentos de tipo de serviço
  serviceTypeMappings: {
    // Sistema → RapiDoc
    toRapidoc: {
      'clinical': 'G',      // Clínico Geral
      'psychology': 'P',    // Psicologia
      'specialist': 'GS',   // Clínico + Especialista
      'nutrition': 'GS',    // Nutrição (tratada como especialista)
      'clinical_psychology': 'GP',  // Clínico + Psicologia
      'full': 'GSP',        // Clínico + Especialistas + Psicologia
    },
    
    // RapiDoc → Sistema
    fromRapidoc: {
      'G': ['clinical'],
      'P': ['psychology'],
      'GP': ['clinical', 'psychology'],
      'GS': ['clinical', 'specialist'],
      'GSP': ['clinical', 'specialist', 'psychology'],
    }
  },
  
  // Formatos de data
  dateFormats: {
    birthday: 'YYYY-MM-DD',        // Para cadastro de beneficiários
    appointment: 'DD/MM/YYYY',     // Para agendamentos
    datetime: 'DD/MM/YYYY HH:MM:SS', // Para timestamps
  },
  
  // Especialidades conhecidas (para cache/fallback)
  knownSpecialties: [
    { name: 'Pediatria', searchTerms: ['pediatria', 'pediatra'] },
    { name: 'Dermatologia', searchTerms: ['dermatologia', 'dermatologista'] },
    { name: 'Neurologia', searchTerms: ['neurologia', 'neurologista'] },
    { name: 'Ortopedia', searchTerms: ['ortopedia', 'ortopedista'] },
    { name: 'Endocrinologia', searchTerms: ['endocrinologia', 'endocrinologista'] },
    { name: 'Ginecologia e Obstetrícia', searchTerms: ['ginecologia', 'obstetricia', 'ginecologista'] },
    { name: 'Psiquiatria', searchTerms: ['psiquiatria', 'psiquiatra'] },
    { name: 'Urologia', searchTerms: ['urologia', 'urologista'] },
    { name: 'Nutrição', searchTerms: ['nutrição', 'nutricionista'] },
    { name: 'Psicologia', searchTerms: ['psicologia', 'psicologo', 'psicologa'] },
  ],
  
  // Configurações de desenvolvimento
  development: {
    enableLogging: process.env.NODE_ENV === 'development',
    logLevel: 'info', // 'debug' | 'info' | 'warn' | 'error'
    mockMode: false, // Para testes sem API real
  },
  
  // Configurações de produção
  production: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
  },
};

// Validação da configuração
export const CONFIG_VALIDATION = validateConfig();

// Função para obter configuração com validação
export const getRapidocConfig = () => {
  if (!CONFIG_VALIDATION.isValid) {
    throw new Error(
      `Configuração RapiDoc inválida: ${CONFIG_VALIDATION.issues.join(', ')}`
    );
  }
  
  return RAPIDOC_CONFIG;
};

// Função para verificar se a configuração está pronta
export const isRapidocConfigured = (): boolean => {
  return CONFIG_VALIDATION.isValid;
};

// Função para obter informações de configuração (sem dados sensíveis)
export const getRapidocInfo = () => {
  return {
    configured: CONFIG_VALIDATION.isValid,
    baseUrl: RAPIDOC_CONFIG.baseUrl,
    hasClientId: !!RAPIDOC_CLIENT_ID,
    hasToken: !!RAPIDOC_TOKEN,
    environment: process.env.NODE_ENV || 'development',
    apiPath: RAPIDOC_CONFIG.apiPath,
    issues: CONFIG_VALIDATION.issues,
  };
};

// Utilitários para mapeamento de tipos
export const mapServiceTypeToRapidoc = (serviceType: string): string => {
  return RAPIDOC_CONFIG.serviceTypeMappings.toRapidoc[serviceType] || 'G';
};

export const mapServiceTypeFromRapidoc = (rapidocType: string): string[] => {
  return RAPIDOC_CONFIG.serviceTypeMappings.fromRapidoc[rapidocType] || ['clinical'];
};

// Utilitários para formatação de data
export const formatDateForRapidoc = (date: Date, format: keyof typeof RAPIDOC_CONFIG.dateFormats = 'appointment'): string => {
  const formatStr = RAPIDOC_CONFIG.dateFormats[format];
  
  if (format === 'appointment') {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } else if (format === 'birthday') {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }
  
  return date.toISOString().split('T')[0]; // fallback to ISO date
};

export const parseDateFromRapidoc = (dateString: string): Date => {
  if (dateString.includes('/')) {
    // DD/MM/YYYY format
    const [day, month, year] = dateString.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else if (dateString.includes('-')) {
    // YYYY-MM-DD format
    return new Date(dateString);
  }
  
  return new Date(dateString); // fallback
};

export default RAPIDOC_CONFIG;