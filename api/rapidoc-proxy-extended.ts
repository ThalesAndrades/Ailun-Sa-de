/**
 * Extensão do Proxy Rapidoc com endpoints adicionais
 * 
 * Implementa todos os endpoints documentados da API Rapidoc:
 * - Beneficiários (CRUD completo)
 * - Agendamentos
 * - Especialidades
 * - Encaminhamentos médicos
 * 
 * @author Manus AI
 * @date 2025-11-26
 */

import { RAPIDOC_CONFIG } from '../config/rapidoc.config';

export interface RapidocProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
  message?: string;
}

// ==========================================
// BENEFICIÁRIOS
// ==========================================

/**
 * Busca todos os beneficiários da API Rapidoc
 */
export async function fetchBeneficiaries(): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Buscando beneficiários...');
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Resposta recebida:', {
      success: data.success,
      count: data.beneficiaries?.length,
    });

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao buscar beneficiários:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Busca um beneficiário específico por CPF
 */
export async function fetchBeneficiaryByCPF(cpf: string): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Buscando beneficiário por CPF:', cpf);
    
    // Primeiro, buscar todos os beneficiários
    const allBeneficiariesResult = await fetchBeneficiaries();
    
    if (!allBeneficiariesResult.success || !allBeneficiariesResult.data) {
      return allBeneficiariesResult;
    }

    const beneficiaries = allBeneficiariesResult.data.beneficiaries || [];
    const beneficiary = beneficiaries.find((b: any) => b.cpf === cpf);

    if (!beneficiary) {
      return {
        success: false,
        error: 'CPF não encontrado no sistema.',
      };
    }

    return {
      success: true,
      data: beneficiary,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao buscar beneficiário por CPF:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Cria um novo beneficiário na API Rapidoc
 * 
 * @param beneficiaryData - Dados do beneficiário
 * Campos obrigatórios: name, cpf, birthday
 * Campos únicos: cpf, email
 */
export async function createBeneficiary(beneficiaryData: any): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Criando beneficiário...');
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries`, {
      method: 'POST',
      headers: RAPIDOC_CONFIG.HEADERS,
      body: JSON.stringify(beneficiaryData),
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Beneficiário criado:', data);

    return {
      success: true,
      data,
      status: response.status,
      message: 'Beneficiário criado com sucesso',
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao criar beneficiário:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Atualiza um beneficiário existente na API Rapidoc
 */
export async function updateBeneficiary(uuid: string, beneficiaryData: any): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Atualizando beneficiário:', uuid);
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries/${uuid}`, {
      method: 'PUT',
      headers: RAPIDOC_CONFIG.HEADERS,
      body: JSON.stringify(beneficiaryData),
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Beneficiário atualizado:', data);

    return {
      success: true,
      data,
      status: response.status,
      message: 'Beneficiário atualizado com sucesso',
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao atualizar beneficiário:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Inativa um beneficiário na API Rapidoc
 */
export async function deleteBeneficiary(uuid: string): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Inativando beneficiário:', uuid);
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries/${uuid}`, {
      method: 'DELETE',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Beneficiário inativado:', data);

    return {
      success: true,
      data,
      status: response.status,
      message: 'Beneficiário inativado com sucesso',
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao inativar beneficiário:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Solicita URL de consulta para webview
 */
export async function requestAppointmentUrl(uuid: string): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Solicitando URL de atendimento para:', uuid);
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries/${uuid}/request-appointment`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] URL de atendimento recebida');

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao solicitar URL de atendimento:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

// ==========================================
// ENCAMINHAMENTOS MÉDICOS
// ==========================================

/**
 * Busca todos os encaminhamentos médicos
 */
export async function fetchMedicalReferrals(): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Buscando encaminhamentos médicos...');
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiary-medical-referrals`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Encaminhamentos recebidos:', {
      success: data.success,
      count: data.referrals?.length,
    });

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao buscar encaminhamentos:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

// ==========================================
// ESPECIALIDADES
// ==========================================

/**
 * Busca todas as especialidades disponíveis
 */
export async function fetchSpecialties(): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Buscando especialidades...');
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/specialties`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Especialidades recebidas:', {
      success: data.success,
      count: data.specialties?.length,
    });

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao buscar especialidades:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Busca disponibilidade de horários para uma especialidade
 * 
 * @param params - Parâmetros da busca
 * @param params.specialtyUuid - UUID da especialidade
 * @param params.dateInitial - Data inicial (formato: dd/MM/yyyy)
 * @param params.dateFinal - Data final (formato: dd/MM/yyyy)
 * @param params.beneficiaryUuid - UUID do beneficiário
 */
export async function fetchSpecialtyAvailability(params: {
  specialtyUuid: string;
  dateInitial: string;
  dateFinal: string;
  beneficiaryUuid: string;
}): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Buscando disponibilidade de especialidade:', params);
    
    const queryParams = new URLSearchParams({
      specialtyUuid: params.specialtyUuid,
      dateInitial: params.dateInitial,
      dateFinal: params.dateFinal,
      beneficiaryUuid: params.beneficiaryUuid,
    });

    const response = await fetch(
      `${RAPIDOC_CONFIG.BASE_URL}/specialty-availability?${queryParams}`,
      {
        method: 'GET',
        headers: RAPIDOC_CONFIG.HEADERS,
      }
    );

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Disponibilidade recebida:', {
      success: data.success,
      count: data.availabilities?.length,
    });

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao buscar disponibilidade:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

// ==========================================
// AGENDAMENTOS
// ==========================================

/**
 * Cria um novo agendamento SEM encaminhamento
 * 
 * @param appointmentData - Dados do agendamento
 * @param appointmentData.beneficiaryUuid - UUID do beneficiário
 * @param appointmentData.availabilityUuid - UUID da disponibilidade
 * @param appointmentData.specialtyUuid - UUID da especialidade
 * @param appointmentData.approveAdditionalPayment - Aceita cobrança adicional
 */
export async function createAppointmentWithoutReferral(appointmentData: {
  beneficiaryUuid: string;
  availabilityUuid: string;
  specialtyUuid: string;
  approveAdditionalPayment: boolean;
}): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Criando agendamento sem encaminhamento...');
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/appointments`, {
      method: 'POST',
      headers: RAPIDOC_CONFIG.HEADERS,
      body: JSON.stringify(appointmentData),
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Agendamento criado:', data);

    return {
      success: true,
      data,
      status: response.status,
      message: 'Agendamento criado com sucesso',
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao criar agendamento:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Cria um novo agendamento COM encaminhamento
 * 
 * @param appointmentData - Dados do agendamento
 * @param appointmentData.beneficiaryUuid - UUID do beneficiário
 * @param appointmentData.availabilityUuid - UUID da disponibilidade
 * @param appointmentData.specialtyUuid - UUID da especialidade
 * @param appointmentData.beneficiaryMedicalReferralUuid - UUID do encaminhamento
 */
export async function createAppointmentWithReferral(appointmentData: {
  beneficiaryUuid: string;
  availabilityUuid: string;
  specialtyUuid: string;
  beneficiaryMedicalReferralUuid: string;
}): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Criando agendamento com encaminhamento...');
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/appointments`, {
      method: 'POST',
      headers: RAPIDOC_CONFIG.HEADERS,
      body: JSON.stringify(appointmentData),
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Agendamento criado:', data);

    return {
      success: true,
      data,
      status: response.status,
      message: 'Agendamento criado com sucesso',
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao criar agendamento:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Busca todos os agendamentos
 */
export async function fetchAppointments(): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Buscando agendamentos...');
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/appointments`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Agendamentos recebidos:', {
      success: data.success,
      count: data.appointments?.length,
    });

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao buscar agendamentos:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Busca um agendamento específico por UUID
 */
export async function fetchAppointmentByUuid(uuid: string): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Buscando agendamento por UUID:', uuid);
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/appointments/${uuid}`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Agendamento encontrado');

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao buscar agendamento:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Cancela um agendamento específico
 */
export async function cancelAppointment(uuid: string): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Cancelando agendamento:', uuid);
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/appointments/${uuid}`, {
      method: 'DELETE',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Agendamento cancelado');

    return {
      success: true,
      data,
      status: response.status,
      message: 'Agendamento cancelado com sucesso',
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao cancelar agendamento:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

// ==========================================
// EXPORTS
// ==========================================

export default {
  // Beneficiários
  fetchBeneficiaries,
  fetchBeneficiaryByCPF,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  requestAppointmentUrl,
  
  // Encaminhamentos
  fetchMedicalReferrals,
  
  // Especialidades
  fetchSpecialties,
  fetchSpecialtyAvailability,
  
  // Agendamentos
  createAppointmentWithoutReferral,
  createAppointmentWithReferral,
  fetchAppointments,
  fetchAppointmentByUuid,
  cancelAppointment,
};
