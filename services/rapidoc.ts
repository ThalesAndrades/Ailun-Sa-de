import { supabase } from './supabase';

/**
 * Serviço de Integração com RapiDoc TEMA API
 * Documentação: https://sandbox.rapidoc.tech/tema/api/
 */

import { RAPIDOC_CONFIG } from '../config/rapidoc.config';

const RAPIDOC_BASE_URL = RAPIDOC_CONFIG.baseUrl;
const RAPIDOC_CONTENT_TYPE = RAPIDOC_CONFIG.contentType;

// ==================== TIPOS ====================

export interface Beneficiary {
  uuid?: string;
  name: string;
  cpf: string;
  birthday: string; // yyyy-MM-dd
  phone?: string;
  email?: string;
  zipCode?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentType?: 'S' | 'A'; // S = recorrente, A = consulta
  serviceType?: 'G' | 'P' | 'GP' | 'GS' | 'GSP'; // G = clínico, P = psicologia, GP = clínico + psicologia, GS = clínico + especialista, GSP = clínico + especialistas + psicologia
  holder?: string;
  general?: string;
}

export interface Specialty {
  uuid: string;
  name: string;
  description?: string;
}

export interface Availability {
  uuid: string;
  date: string;
  time: string;
  professionalName?: string;
  specialtyUuid: string;
}

export interface MedicalReferral {
  uuid: string;
  beneficiaryUuid: string;
  specialtyUuid: string;
  specialtyName: string;
  referralDate: string;
  expirationDate?: string;
  status: 'active' | 'used' | 'expired';
}

export interface Appointment {
  uuid: string;
  beneficiaryUuid: string;
  availabilityUuid: string;
  specialtyUuid: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  professionalName?: string;
  beneficiaryMedicalReferralUuid?: string;
}

// ==================== HELPERS ====================

/**
 * Obter credenciais da API RapiDoc
 */
const getCredentials = () => {
  return {
    token: RAPIDOC_CONFIG.token,
    clientId: RAPIDOC_CONFIG.clientId,
  };
};

/**
 * Fazer requisição à API RapiDoc com logs detalhados
 */
const rapidocRequest = async (
  endpoint: string,
  method: 'GET' | 'POST' | 'DELETE' = 'GET',
  body?: any
) => {
  try {
    const { token, clientId } = getCredentials();
    const fullUrl = `${RAPIDOC_BASE_URL}${endpoint}`;

    console.log('🔗 [RapiDoc Request] Iniciando requisição');
    console.log('📍 URL completa:', fullUrl);
    console.log('🔧 Método:', method);
    console.log('🔐 Token presente:', !!token, token ? `(${token.length} chars)` : '(não encontrado)');
    console.log('🆔 Client ID:', clientId);
    console.log('📄 Content-Type:', RAPIDOC_CONTENT_TYPE);
    
    if (body) {
      console.log('📦 Body da requisição:', JSON.stringify(body, null, 2));
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'clientId': clientId,
      'Content-Type': RAPIDOC_CONTENT_TYPE,
    };

    console.log('📋 Headers da requisição:', JSON.stringify(headers, null, 2));

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    console.log('⏳ Enviando requisição...');
    const response = await fetch(fullUrl, options);

    console.log('📥 [RapiDoc Response] Resposta recebida');
    console.log('📊 Status:', response.status);
    console.log('✅ OK:', response.ok);
    console.log('📋 Headers da resposta:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

    // Ler o texto da resposta uma vez
    const responseText = await response.text();
    console.log('📄 Resposta bruta:', responseText);

    if (!response.ok) {
      console.error('❌ [RapiDoc Error] Erro HTTP:', response.status);
      console.error('📄 Texto do erro:', responseText);
      
      // Tentar parsear como JSON para obter mais detalhes
      try {
        const errorData = JSON.parse(responseText);
        console.error('🔍 Detalhes do erro (JSON):', JSON.stringify(errorData, null, 2));
      } catch (parseError) {
        console.error('⚠️ Não foi possível parsear erro como JSON');
      }
      
      throw new Error(`RapiDoc API Error: ${response.status} - ${responseText}`);
    }

    // Tentar parsear como JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Dados parseados com sucesso:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.error('📄 Resposta que causou erro:', responseText);
      throw new Error('Resposta da API não é um JSON válido');
    }

    return data;
  } catch (error: any) {
    console.error('💥 [RapiDoc Request] Erro na requisição:', error);
    console.error('🔍 Detalhes do erro:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    });
    throw error;
  }
};

// ==================== BENEFICIÁRIOS ====================

/**
 * Busca beneficiário por CPF na RapiDoc
 */
export const getBeneficiaryByCPF = async (cpf: string) => {
  try {
    console.log('🔍 [getBeneficiaryByCPF] Iniciando busca de beneficiário');
    console.log('📋 CPF recebido:', cpf);
    console.log('🧹 CPF limpo:', cpf.replace(/\D/g, ''));
    
    const cleanCPF = cpf.replace(/\D/g, '');
    
    if (!cleanCPF) {
      console.error('❌ CPF vazio após limpeza');
      return {
        success: false,
        error: 'CPF inválido ou vazio',
      };
    }

    if (cleanCPF.length !== 11) {
      console.error('❌ CPF com tamanho incorreto:', cleanCPF.length);
      return {
        success: false,
        error: `CPF deve ter 11 dígitos. Recebido: ${cleanCPF.length} dígitos`,
      };
    }

    console.log('🌐 Fazendo requisição para RapiDoc...');
    const response = await rapidocRequest(`/beneficiaries?cpf=${cleanCPF}`, 'GET');

    console.log('📊 [getBeneficiaryByCPF] Analisando resposta da API');
    console.log('✅ Response.success:', response.success);
    console.log('📄 Response.data:', response.data);
    console.log('📄 Response.message:', response.message);

    if (response.success) {
      // A API pode retornar uma lista, pegar o primeiro resultado
      const beneficiary = Array.isArray(response.data) ? response.data[0] : response.data;

      console.log('👤 Beneficiário processado:', beneficiary);

      if (!beneficiary) {
        console.log('❌ Nenhum beneficiário encontrado na resposta');
        return {
          success: false,
          error: 'CPF não encontrado no sistema.',
        };
      }

      console.log('✅ Beneficiário encontrado com sucesso');
      return {
        success: true,
        data: beneficiary,
      };
    }

    console.log('❌ Response.success = false');
    const errorMessage = response.message || 'Erro desconhecido ao buscar beneficiário';
    console.log('📄 Mensagem de erro:', errorMessage);
    
    // Verificar se é erro de "não encontrado" vs erro de sistema
    if (errorMessage.toLowerCase().includes('not found') || 
        errorMessage.toLowerCase().includes('não encontrado') ||
        errorMessage.toLowerCase().includes('inexistente')) {
      return { 
        success: false, 
        error: 'CPF não encontrado no sistema.' 
      };
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };

  } catch (error: any) {
    console.error('💥 [getBeneficiaryByCPF] Erro na busca do beneficiário:', error);
    console.error('🔍 Detalhes:', {
      message: error.message,
      name: error.name,
      cpf: cpf
    });

    // Classificar tipos de erro
    if (error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Erro de conexão. Verifique sua internet e tente novamente.',
      };
    }
    
    if (error.message.includes('timeout')) {
      return {
        success: false,
        error: 'Timeout na conexão. Tente novamente.',
      };
    }

    if (error.message.includes('404')) {
      return {
        success: false,
        error: 'CPF não encontrado no sistema.',
      };
    }

    if (error.message.includes('401') || error.message.includes('403')) {
      return {
        success: false,
        error: 'Erro de autenticação na API. Entre em contato com o suporte.',
      };
    }

    return {
      success: false,
      error: 'Erro interno do servidor. Tente novamente mais tarde.',
    };
  }
};

/**
 * Adicionar beneficiário na RapiDoc
 */
export const addBeneficiary = async (beneficiary: Beneficiary) => {
  try {
    const response = await rapidocRequest('/beneficiaries', 'POST', [beneficiary]);
    
    if (response.success) {
      return {
        success: true,
        data: response.data[0], // Retorna o primeiro beneficiário com UUID
      };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao adicionar beneficiário:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Solicitar atendimento imediato (médico clínico geral)
 */
export const requestImmediateAppointment = async (beneficiaryUuid: string) => {
  try {
    const response = await rapidocRequest(
      `/beneficiaries/${beneficiaryUuid}/request-appointment`,
      'GET'
    );

    if (response.success) {
      return {
        success: true,
        data: {
          consultationUrl: response.data.url || response.data.appointmentUrl,
          message: 'Atendimento solicitado com sucesso',
        },
      };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao solicitar atendimento:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Inativar beneficiário
 */
export const inactivateBeneficiary = async (beneficiaryUuid: string) => {
  try {
    const response = await rapidocRequest(`/beneficiaries/${beneficiaryUuid}`, 'DELETE');
    
    return {
      success: response.success,
      message: response.message,
    };
  } catch (error: any) {
    console.error('Erro ao inativar beneficiário:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== ESPECIALIDADES ====================

/**
 * Listar todas as especialidades disponíveis
 */
export const listSpecialties = async () => {
  try {
    const response = await rapidocRequest('/specialties', 'GET');

    if (response.success) {
      // Filtrar nutrição se necessário (conforme requisito)
      const specialties = response.data.filter(
        (specialty: Specialty) => !specialty.name.toLowerCase().includes('nutrição')
      );

      return {
        success: true,
        data: specialties,
      };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao listar especialidades:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Obter UUID da especialidade de nutrição
 */
export const getNutritionSpecialtyUuid = async () => {
  try {
    const response = await rapidocRequest('/specialties', 'GET');

    if (response.success) {
      const nutrition = response.data.find(
        (specialty: Specialty) => specialty.name.toLowerCase().includes('nutrição')
      );

      if (nutrition) {
        return {
          success: true,
          data: nutrition,
        };
      }

      return { success: false, error: 'Especialidade de nutrição não encontrada' };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao buscar nutrição:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Obter UUID da especialidade de psicologia
 */
export const getPsychologySpecialtyUuid = async () => {
  try {
    const response = await rapidocRequest('/specialties', 'GET');

    if (response.success) {
      const psychology = response.data.find(
        (specialty: Specialty) => specialty.name.toLowerCase().includes('psicologia')
      );

      if (psychology) {
        return {
          success: true,
          data: psychology,
        };
      }

      return { success: false, error: 'Especialidade de psicologia não encontrada' };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao buscar psicologia:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== ENCAMINHAMENTOS ====================

/**
 * Listar encaminhamentos do beneficiário
 */
export const listMedicalReferrals = async (beneficiaryUuid?: string) => {
  try {
    const response = await rapidocRequest('/beneficiary-medical-referrals', 'GET');

    if (response.success) {
      let referrals = response.data;

      // Filtrar por beneficiário se especificado
      if (beneficiaryUuid) {
        referrals = referrals.filter(
          (referral: MedicalReferral) => referral.beneficiaryUuid === beneficiaryUuid
        );
      }

      return {
        success: true,
        data: referrals,
      };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao listar encaminhamentos:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar se beneficiário tem encaminhamento ativo para especialidade
 */
export const checkMedicalReferral = async (
  beneficiaryUuid: string,
  specialtyUuid: string
) => {
  try {
    const result = await listMedicalReferrals(beneficiaryUuid);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const activeReferral = result.data.find(
      (referral: MedicalReferral) =>
        referral.specialtyUuid === specialtyUuid &&
        referral.status === 'active'
    );

    return {
      success: true,
      hasReferral: !!activeReferral,
      referral: activeReferral || null,
    };
  } catch (error: any) {
    console.error('Erro ao verificar encaminhamento:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== DISPONIBILIDADE ====================

/**
 * Listar horários disponíveis para especialidade
 */
export const listAvailability = async (
  specialtyUuid: string,
  dateInitial: string, // dd/MM/yyyy
  dateFinal: string, // dd/MM/yyyy
  beneficiaryUuid: string
) => {
  try {
    const params = new URLSearchParams({
      specialtyUuid,
      dateInitial,
      dateFinal,
      beneficiaryUuid,
    });

    const response = await rapidocRequest(`/specialty-availability?${params}`, 'GET');

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao listar disponibilidade:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== AGENDAMENTOS ====================

/**
 * Realizar agendamento SEM encaminhamento
 */
export const scheduleAppointmentWithoutReferral = async (
  beneficiaryUuid: string,
  availabilityUuid: string,
  specialtyUuid: string,
  approveAdditionalPayment: boolean = true
) => {
  try {
    const body = {
      beneficiaryUuid,
      availabilityUuid,
      specialtyUuid,
      approveAdditionalPayment,
    };

    const response = await rapidocRequest('/appointments', 'POST', body);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Agendamento realizado com sucesso',
      };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao agendar sem encaminhamento:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Realizar agendamento COM encaminhamento
 */
export const scheduleAppointmentWithReferral = async (
  beneficiaryUuid: string,
  availabilityUuid: string,
  specialtyUuid: string,
  beneficiaryMedicalReferralUuid: string
) => {
  try {
    const body = {
      beneficiaryUuid,
      availabilityUuid,
      specialtyUuid,
      beneficiaryMedicalReferralUuid,
    };

    const response = await rapidocRequest('/appointments', 'POST', body);

    if (response.success) {
      return {
        success: true,
        data: response.data,
        message: 'Agendamento realizado com sucesso',
      };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao agendar com encaminhamento:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Listar agendamentos
 */
export const listAppointments = async () => {
  try {
    const response = await rapidocRequest('/appointments', 'GET');

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao listar agendamentos:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Obter agendamento por UUID
 */
export const getAppointment = async (appointmentUuid: string) => {
  try {
    const response = await rapidocRequest(`/appointments/${appointmentUuid}`, 'GET');

    if (response.success) {
      return {
        success: true,
        data: response.data,
      };
    }

    return { success: false, error: response.message };
  } catch (error: any) {
    console.error('Erro ao buscar agendamento:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Cancelar agendamento
 */
export const cancelAppointment = async (appointmentUuid: string) => {
  try {
    const response = await rapidocRequest(`/appointments/${appointmentUuid}`, 'DELETE');

    return {
      success: response.success,
      message: response.message || 'Agendamento cancelado com sucesso',
    };
  } catch (error: any) {
    console.error('Erro ao cancelar agendamento:', error.message);
    return { success: false, error: error.message };
  }
};