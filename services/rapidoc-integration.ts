/**
 * Serviço de Integração Unificado com RapiDoc via Supabase Edge Functions
 * Todas as chamadas RapiDoc devem passar por esta camada
 */

import { supabase } from './supabase';
import { FunctionsHttpError } from '@supabase/supabase-js';

// ==================== TIPOS ====================

export interface Beneficiary {
  uuid?: string;
  name: string;
  cpf: string;
  birthDate: string;
  phone?: string;
  email?: string;
  serviceType?: string;
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

export interface Appointment {
  uuid: string;
  beneficiaryUuid: string;
  availabilityUuid: string;
  specialtyUuid: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  professionalName?: string;
}

export interface RapidocResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== HELPERS ====================

/**
 * Invoca a Edge Function do RapiDoc com tratamento de erro adequado
 */
async function invokeRapidocFunction<T>(
  action: string,
  params: Record<string, any> = {}
): Promise<RapidocResponse<T>> {
  try {
    console.log('[RapiDoc Integration] Invocando Edge Function:', action);
    console.log('[RapiDoc Integration] Parâmetros:', params);

    const { data, error } = await supabase.functions.invoke('rapidoc', {
      body: {
        action,
        ...params,
      },
    });

    // Tratamento de erro específico para FunctionsHttpError
    if (error) {
      if (error instanceof FunctionsHttpError) {
        try {
          const errorData = await error.context.json();
          console.error('[RapiDoc Integration] Erro HTTP:', errorData);
          return {
            success: false,
            error: errorData.error || error.message,
          };
        } catch {
          console.error('[RapiDoc Integration] Erro ao parsear erro:', error.message);
          return {
            success: false,
            error: error.message,
          };
        }
      }

      console.error('[RapiDoc Integration] Erro genérico:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    console.log('[RapiDoc Integration] Resposta recebida:', data);
    return data as RapidocResponse<T>;
  } catch (error: any) {
    console.error('[RapiDoc Integration] Erro na invocação:', error);
    return {
      success: false,
      error: error.message || 'Erro ao comunicar com o servidor',
    };
  }
}

// ==================== BENEFICIÁRIOS ====================

/**
 * Busca beneficiário por CPF
 */
export async function getBeneficiaryByCPF(cpf: string): Promise<RapidocResponse<Beneficiary>> {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (!cleanCPF || cleanCPF.length !== 11) {
    return {
      success: false,
      error: 'CPF inválido. Deve conter 11 dígitos.',
    };
  }

  // A API RapiDoc retorna a lista de beneficiários
  // Por isso usamos o endpoint de listar e filtramos
  try {
    const response = await invokeRapidocFunction<Beneficiary[]>('list-beneficiaries');
    
    if (!response.success || !response.data) {
      return {
        success: false,
        error: response.error || 'Erro ao buscar beneficiário',
      };
    }

    const beneficiary = response.data.find((b) => b.cpf.replace(/\D/g, '') === cleanCPF);

    if (!beneficiary) {
      return {
        success: false,
        error: 'CPF não encontrado no sistema',
      };
    }

    return {
      success: true,
      data: beneficiary,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao buscar beneficiário',
    };
  }
}

/**
 * Solicitar atendimento imediato (Clínico Geral)
 */
export async function requestImmediateAppointment(
  beneficiaryUuid: string
): Promise<RapidocResponse<{ consultationUrl: string }>> {
  if (!beneficiaryUuid) {
    return {
      success: false,
      error: 'UUID do beneficiário não fornecido',
    };
  }

  return invokeRapidocFunction('request-immediate-appointment', {
    beneficiaryUuid,
  });
}

// ==================== ESPECIALIDADES ====================

/**
 * Listar especialidades disponíveis
 */
export async function listSpecialties(): Promise<RapidocResponse<Specialty[]>> {
  return invokeRapidocFunction<Specialty[]>('list-specialties');
}

/**
 * Obter UUID da especialidade de Psicologia
 */
export async function getPsychologySpecialtyUuid(): Promise<RapidocResponse<Specialty>> {
  const response = await listSpecialties();

  if (!response.success || !response.data) {
    return {
      success: false,
      error: response.error || 'Erro ao buscar especialidades',
    };
  }

  const psychology = response.data.find((s) =>
    s.name.toLowerCase().includes('psicologia')
  );

  if (!psychology) {
    return {
      success: false,
      error: 'Especialidade de Psicologia não encontrada',
    };
  }

  return {
    success: true,
    data: psychology,
  };
}

/**
 * Obter UUID da especialidade de Nutrição
 */
export async function getNutritionSpecialtyUuid(): Promise<RapidocResponse<Specialty>> {
  const response = await listSpecialties();

  if (!response.success || !response.data) {
    return {
      success: false,
      error: response.error || 'Erro ao buscar especialidades',
    };
  }

  const nutrition = response.data.find((s) =>
    s.name.toLowerCase().includes('nutrição')
  );

  if (!nutrition) {
    return {
      success: false,
      error: 'Especialidade de Nutrição não encontrada',
    };
  }

  return {
    success: true,
    data: nutrition,
  };
}

// ==================== ENCAMINHAMENTOS ====================

/**
 * Verificar se beneficiário tem encaminhamento ativo
 */
export async function checkReferral(
  beneficiaryUuid: string,
  specialtyUuid: string
): Promise<RapidocResponse<{ hasReferral: boolean; referral: any | null }>> {
  if (!beneficiaryUuid || !specialtyUuid) {
    return {
      success: false,
      error: 'Parâmetros inválidos',
    };
  }

  return invokeRapidocFunction('check-referral', {
    beneficiaryUuid,
    specialtyUuid,
  });
}

// ==================== DISPONIBILIDADE ====================

/**
 * Listar horários disponíveis para especialidade
 */
export async function listAvailability(
  specialtyUuid: string,
  dateInitial: string,
  dateFinal: string,
  beneficiaryUuid: string
): Promise<RapidocResponse<Availability[]>> {
  if (!specialtyUuid || !dateInitial || !dateFinal || !beneficiaryUuid) {
    return {
      success: false,
      error: 'Parâmetros inválidos',
    };
  }

  return invokeRapidocFunction<Availability[]>('list-availability', {
    specialtyUuid,
    dateInitial,
    dateFinal,
    beneficiaryUuid,
  });
}

// ==================== AGENDAMENTOS ====================

/**
 * Realizar agendamento de consulta
 */
export async function scheduleAppointment(params: {
  beneficiaryUuid: string;
  availabilityUuid: string;
  specialtyUuid: string;
  referralUuid?: string;
  approveAdditionalPayment?: boolean;
}): Promise<RapidocResponse<Appointment>> {
  if (!params.beneficiaryUuid || !params.availabilityUuid || !params.specialtyUuid) {
    return {
      success: false,
      error: 'Parâmetros obrigatórios faltando',
    };
  }

  return invokeRapidocFunction<Appointment>('schedule-appointment', params);
}

/**
 * Listar agendamentos do beneficiário
 */
export async function listAppointments(): Promise<RapidocResponse<Appointment[]>> {
  return invokeRapidocFunction<Appointment[]>('list-appointments');
}

/**
 * Cancelar agendamento
 */
export async function cancelAppointment(appointmentUuid: string): Promise<RapidocResponse> {
  if (!appointmentUuid) {
    return {
      success: false,
      error: 'UUID do agendamento não fornecido',
    };
  }

  return invokeRapidocFunction('cancel-appointment', {
    availabilityUuid: appointmentUuid, // A Edge Function usa availabilityUuid para compatibilidade
  });
}

// ==================== EXPORTAÇÕES LEGACY (Compatibilidade) ====================

// Manter compatibilidade com código existente
export const addBeneficiary = async (beneficiary: Beneficiary) => {
  console.warn('[RapiDoc Integration] addBeneficiary não implementado via Edge Function');
  return {
    success: false,
    error: 'Funcionalidade não disponível',
  };
};

export const inactivateBeneficiary = async (beneficiaryUuid: string) => {
  console.warn('[RapiDoc Integration] inactivateBeneficiary não implementado via Edge Function');
  return {
    success: false,
    error: 'Funcionalidade não disponível',
  };
};

export const getAppointment = async (appointmentUuid: string) => {
  console.warn('[RapiDoc Integration] getAppointment não implementado - use listAppointments');
  return {
    success: false,
    error: 'Use listAppointments para obter todos os agendamentos',
  };
};
