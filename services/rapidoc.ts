/**
 * Serviço RapiDoc - Integração Oficial com API de Telemedicina
 * Endpoints e estruturas alinhadas com documentação oficial RapiDoc
 */

import { Platform } from 'react-native';
import { getSupabaseClient } from './supabase';
import { ProductionLogger } from '../utils/production-logger';
import { retryOperation } from '../utils/retry';
import { RAPIDOC_CONFIG } from '../config/rapidoc.config';

interface RapidocHeaders {
  'Authorization': string;
  'clientId': string;
  'Content-Type': string;
}

interface BeneficiaryCreateData {
  name: string;
  cpf: string;
  birthday: string; // YYYY-MM-DD format
  phone?: string;
  email?: string;
  zipCode?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentType?: 'S' | 'A'; // S = recorrente, A = consulta
  serviceType?: 'G' | 'P' | 'GP' | 'GS' | 'GSP'; // G=clínico, P=psicologia, GP=clínico+psicologia, GS=clínico+especialista, GSP=clínico+especialistas+psicologia
  holder?: string; // CPF do titular
  general?: string; // campo genérico
}

interface RapidocBeneficiary {
  uuid: string;
  name: string;
  cpf: string;
  birthday: string;
  phone?: string;
  email?: string;
  zipCode?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentType?: string;
  serviceType?: string;
  holder?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  client?: {
    name: string;
    uuid: string;
  };
}

interface RapidocSpecialty {
  name: string;
  uuid: string;
}

interface RapidocAvailability {
  uuid: string;
  date: string; // DD/MM/YYYY
  from: string; // HH:MM
  to: string; // HH:MM
}

interface RapidocAppointment {
  uuid: string;
  beneficiary: RapidocBeneficiary;
  specialty: RapidocSpecialty;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  professional?: {
    name: string;
    specialties: RapidocSpecialty[];
  };
  detail: {
    uuid: string;
    date: string; // DD/MM/YYYY
    from: string; // HH:MM
    to: string; // HH:MM
  };
  beneficiaryUrl?: string;
  beneficiaryMedicalReferral?: any;
}

interface RapidocMedicalReferral {
  uuid: string;
  beneficiary: RapidocBeneficiary;
  createdAt: string; // DD/MM/YYYY HH:MM:SS
  updatedAt: string; // DD/MM/YYYY HH:MM:SS
  status: 'PENDING' | 'SCHEDULED' | 'USED';
  urlPath: string;
}

interface ConsultationResponse {
  success: boolean;
  message?: string;
  url?: string;
  sessionId?: string;
  estimatedWaitTime?: number;
  queuePosition?: number;
  error?: string;
}

class RapidocService {
  private baseUrl: string;
  private clientId: string;
  private token: string;
  private logger = new ProductionLogger('RapidocService');

  constructor() {
    this.baseUrl = RAPIDOC_CONFIG.baseUrl;
    this.clientId = RAPIDOC_CONFIG.clientId;
    this.token = RAPIDOC_CONFIG.token;
  }

  private getHeaders(): RapidocHeaders {
    return {
      'Authorization': `Bearer ${this.token}`,
      'clientId': this.clientId,
      'Content-Type': 'application/vnd.rapidoc.tema-v2+json'
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };

    this.logger.info(`RapiDoc Request: ${options.method || 'GET'} ${url}`);
    if (options.body) {
      this.logger.debug('Request Body:', options.body);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = responseText;
      }

      this.logger.info(`RapiDoc Response (${response.status}):`, data);
      
      if (!response.ok) {
        this.logger.error(`RapiDoc Error (${response.status}): ${responseText}`);
        throw new Error(`RapiDoc API Error: ${response.status} - ${responseText}`);  }

      return data;
      
    } catch (error: any) {
      this.logger.error('RapiDoc Request Failed:', error);
      throw error;
    }
  }

  // ==================== BENEFICIÁRIOS ====================

  /**
   * POST /tema/api/beneficiaries
   * Adicionar beneficiários - espera array de objetos
   */
  async createBeneficiaries(beneficiaries: BeneficiaryCreateData[]): Promise<RapidocBeneficiary[]> {
    return retryOperation(async () => {
      // Converter datas para o formato esperado pela RapiDoc
      const formattedBeneficiaries = beneficiaries.map(b => ({
        ...b,
        birthday: this.formatBirthdayForRapidoc(b.birthday),
        cpf: b.cpf.replace(/\D/g, ''), // apenas números
        phone: b.phone?.replace(/\D/g, ''), // apenas números
        zipCode: b.zipCode?.replace(/\D/g, '') // apenas números
      }));

      const response = await this.makeRequest('/tema/api/beneficiaries', {
        method: 'POST',
        body: JSON.stringify(formattedBeneficiaries)
      });

      if (!response.success || !Array.isArray(response.beneficiaries)) {
        throw new Error(response.message || 'Falha ao criar beneficiários');
      }

      return response.beneficiaries;
    });
  }

  /**
   * Criar um único beneficiário (wrapper para createBeneficiaries)
   */
  async createBeneficiary(beneficiaryData: BeneficiaryCreateData): Promise<RapidocBeneficiary> {
    const beneficiaries = await this.createBeneficiaries([beneficiaryData]);
    return beneficiaries[0];
  }

  /**
   * GET /tema/api/beneficiaries/:cpf
   * Ler beneficiário por CPF
   */
  async getBeneficiaryByCPF(cpf: string): Promise<RapidocBeneficiary | null> {
    return retryOperation(async () => {
      try {
        const cleanCPF = cpf.replace(/\D/g, '');
        const response = await this.makeRequest(`/tema/api/beneficiaries/${cleanCPF}`);
        
        if (response.success && response.beneficiary) {
          return response.beneficiary;
        }
        
        return null;
      } catch (error: any) {
        if (error.message?.includes('404')) {
          return null; // Beneficiário não encontrado
        }
        throw error;
      }
    });
  }

  /**
   * GET /tema/api/beneficiaries
   * Recupera todos os beneficiários ativos
   */
  async getAllBeneficiaries(): Promise<RapidocBeneficiary[]> {
    return retryOperation(async () => {
      const response = await this.makeRequest('/tema/api/beneficiaries');
      
      if (response.success && Array.isArray(response.beneficiaries)) {
        return response.beneficiaries;
      }
      
      return [];
    });
  }

  /**
   * PUT /tema/api/beneficiaries/:uuid
   * Atualizar beneficiário
   */
  async updateBeneficiary(uuid: string, data: Partial<BeneficiaryCreateData>): Promise<RapidocBeneficiary> {
    return retryOperation(async () => {
      // Formatar dados conforme esperado
      const formattedData = { ...data };
      if (formattedData.birthday) {
        formattedData.birthday = this.formatBirthdayForRapidoc(formattedData.birthday);
      }
      if (formattedData.cpf) {
        formattedData.cpf = formattedData.cpf.replace(/\D/g, '');
      }
      if (formattedData.phone) {
        formattedData.phone = formattedData.phone.replace(/\D/g, '');
      }
      if (formattedData.zipCode) {
        formattedData.zipCode = formattedData.zipCode.replace(/\D/g, '');
      }

      const response = await this.makeRequest(`/tema/api/beneficiaries/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(formattedData)
      });

      if (!response.success) {
        throw new Error(response.message || 'Falha ao atualizar beneficiário');
      }

      return response.beneficiary;
    });
  }

  /**
   * DELETE /tema/api/beneficiaries/:uuid
   * Inativar beneficiário
   */
  async deactivateBeneficiary(uuid: string): Promise<boolean> {
    return retryOperation(async () => {
      const response = await this.makeRequest(`/tema/api/beneficiaries/${uuid}`, {
        method: 'DELETE'
      });
      
      return response.success === true;
    });
  }

  /**
   * PUT /tema/api/beneficiaries/:uuid/reactivate
   * Reativar beneficiário
   */
  async reactivateBeneficiary(uuid: string): Promise<boolean> {
    return retryOperation(async () => {
      const response = await this.makeRequest(`/tema/api/beneficiaries/${uuid}/reactivate`, {
        method: 'PUT'
      });
      
      return response.success === true;
    });
  }

  /**
   * GET /tema/api/beneficiaries/:uuid/request-appointment
   * Solicitar URL de consulta imediata
   */
  async requestImmediateConsultation(beneficiaryUuid: string): Promise<ConsultationResponse> {
    return retryOperation(async () => {
      try {
        const response = await this.makeRequest(`/tema/api/beneficiaries/${beneficiaryUuid}/request-appointment`);
        
        if (response.success && response.url) {
          return {
            success: true,
            url: response.url,
            message: response.message
          };
        }
        
        return {
          success: false,
          error: response.message || 'Falha ao solicitar consulta'
        };
      } catch (error: any) {
        this.logger.error('Erro na solicitação de consulta:', error);
        return {
          success: false,
          error: error.message || 'Erro na comunicação com RapiDoc'
        };
      }
    });
  }

  /**
   * GET /tema/api/beneficiaries/:uuid/appointments
   * Ler consultas do beneficiário
   */
  async getBeneficiaryAppointments(beneficiaryUuid: string): Promise<RapidocAppointment[]> {
    return retryOperation(async () => {
      const response = await this.makeRequest(`/tema/api/beneficiaries/${beneficiaryUuid}/appointments`);
      return Array.isArray(response) ? response : [];
    });
  }

  /**
   * GET /tema/api/beneficiaries/:uuid/medical-referrals
   * Ler encaminhamentos do beneficiário
   */
  async getBeneficiaryMedicalReferrals(beneficiaryUuid: string): Promise<RapidocMedicalReferral[]> {
    return retryOperation(async () => {
      const response = await this.makeRequest(`/tema/api/beneficiaries/${beneficiaryUuid}/medical-referrals`);
      return Array.isArray(response) ? response : [];
    });
  }

  /**
   * GET /tema/api/beneficiary-medical-referrals
   * Ler todos os encaminhamentos
   */
  async getAllMedicalReferrals(): Promise<RapidocMedicalReferral[]> {
    return retryOperation(async () => {
      const response = await this.makeRequest('/tema/api/beneficiary-medical-referrals');
      return Array.isArray(response) ? response : [];
    });
  }

  // ==================== AGENDAMENTOS ====================

  /**
   * GET /tema/api/specialties
   * Ler todas as especialidades
   */
  async getSpecialties(): Promise<RapidocSpecialty[]> {
    return retryOperation(async () => {
      const response = await this.makeRequest('/tema/api/specialties');
      return Array.isArray(response) ? response : [];
    });
  }

  /**
   * GET /tema/api/specialty-availability
   * Ler disponibilidade por especialidade
   */
  async getSpecialtyAvailability(params: {
    specialtyUuid: string;
    dateInitial: string; // formato DD/MM/YYYY
    dateFinal: string; // formato DD/MM/YYYY
    beneficiaryUuid: string;
  }): Promise<RapidocAvailability[]> {
    return retryOperation(async () => {
      const queryParams = new URLSearchParams({
        specialtyUuid: params.specialtyUuid,
        dateInitial: params.dateInitial,
        dateFinal: params.dateFinal,
        beneficiaryUuid: params.beneficiaryUuid
      });
      
      const response = await this.makeRequest(`/tema/api/specialty-availability?${queryParams}`);
      return Array.isArray(response) ? response : [];
    });
  }

  /**
   * POST /tema/api/appointments
   * Realizar agendamento (com ou sem encaminhamento)
   */
  async scheduleAppointment(params: {
    beneficiaryUuid: string;
    availabilityUuid: string;
    specialtyUuid: string;
    approveAdditionalPayment?: boolean;
    beneficiaryMedicalReferralUuid?: string; // Para agendamentos com encaminhamento
  }): Promise<RapidocAppointment> {
    return retryOperation(async () => {
      const payload: any = {
        beneficiaryUuid: params.beneficiaryUuid,
        availabilityUuid: params.availabilityUuid,
        specialtyUuid: params.specialtyUuid
      };

      // Adicionar aprovação de pagamento adicional se não há encaminhamento
      if (!params.beneficiaryMedicalReferralUuid) {
        payload.approveAdditionalPayment = params.approveAdditionalPayment ?? true;
      }

      // Adicionar encaminhamento se fornecido
      if (params.beneficiaryMedicalReferralUuid) {
        payload.beneficiaryMedicalReferralUuid = params.beneficiaryMedicalReferralUuid;
      }

      const response = await this.makeRequest('/tema/api/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return response;
    });
  }

  /**
   * GET /tema/api/appointments
   * Ler todos os agendamentos
   */
  async getAllAppointments(): Promise<RapidocAppointment[]> {
    return retryOperation(async () => {
      const response = await this.makeRequest('/tema/api/appointments');
      return Array.isArray(response) ? response : [];
    });
  }

  /**
   * GET /tema/api/appointments/:uuid
   * Ler agendamento por UUID
   */
  async getAppointment(appointmentUuid: string): Promise<RapidocAppointment> {
    return retryOperation(async () => {
      return await this.makeRequest(`/tema/api/appointments/${appointmentUuid}`);
    });
  }

  /**
   * DELETE /tema/api/appointments/:uuid
   * Cancelar agendamento
   */
  async cancelAppointment(appointmentUuid: string): Promise<boolean> {
    return retryOperation(async () => {
      await this.makeRequest(`/tema/api/appointments/${appointmentUuid}`, {
        method: 'DELETE'
      });
      return true; // RapiDoc DELETE não retorna body
    });
  }

  /**
   * GET /tema/api/plans
   * Ler planos disponíveis
   */
  async getPlans(): Promise<any[]> {
    return retryOperation(async () => {
      const response = await this.makeRequest('/tema/api/plans');
      return Array.isArray(response) ? response : [];
    });
  }

  // ==================== UTILITÁRIOS ====================

  /**
   * Formatação de data para RapiDoc (DD/MM/YYYY)
   */
  formatDateForRapidoc(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Converter data de YYYY-MM-DD para DD/MM/YYYY
   */
  formatBirthdayForRapidoc(dateString: string): string {
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateString; // Já está no formato correto
  }

  /**
   * Converter data de DD/MM/YYYY para YYYY-MM-DD
   */
  parseDateFromRapidoc(dateString: string): string {
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateString; // Já está no formato ISO
  }

  /**
   * Mapear tipos de serviço do sistema para RapiDoc
   */
  mapServiceType(serviceType: string): 'G' | 'P' | 'GP' | 'GS' | 'GSP' {
    const mapping: Record<string, 'G' | 'P' | 'GP' | 'GS' | 'GSP'> = {
      'clinical': 'G', // Clínico Geral
      'psychology': 'P', // Psicologia
      'specialist': 'GS', // Clínico + Especialista
      'nutrition': 'GS', // Nutrição é tratada como especialista
      'clinical_psychology': 'GP', // Clínico + Psicologia
      'clinical_specialist': 'GS', // Clínico + Especialista
      'full': 'GSP' // Clínico + Especialistas + Psicologia
    };
    
    return mapping[serviceType] || 'G';
  }

  /**
   * Mapear tipos de serviço do RapiDoc para o sistema
   */
  mapServiceTypeFromRapidoc(rapidocServiceType: string): string[] {
    const mapping: Record<string, string[]> = {
      'G': ['clinical'],
      'P': ['psychology'],
      'GP': ['clinical', 'psychology'],
      'GS': ['clinical', 'specialist'],
      'GSP': ['clinical', 'specialist', 'psychology']
    };
    
    return mapping[rapidocServiceType] || ['clinical'];
  }

  /**
   * Verificação de saúde da API
   */
  async checkHealth(): Promise<{ status: 'healthy' | 'degraded' | 'down'; message: string }> {
    try {
      await this.makeRequest('/tema/api/specialties');
      return { status: 'healthy', message: 'RapiDoc API operacional' };
    } catch (error: any) {
      this.logger.error('RapiDoc Health Check Failed:', error);
      return { 
        status: 'down', 
        message: `RapiDoc indisponível: ${error.message}` 
      };
    }
  }

  /**
   * Obter configuração atual
   */
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      clientId: this.clientId,
      hasToken: !!this.token
    };
  }
}

export const rapidocService = new RapidocService();
export default rapidocService;

export type {
  BeneficiaryCreateData,
  RapidocBeneficiary,
  RapidocSpecialty,
  RapidocAvailability,
  RapidocAppointment,
  RapidocMedicalReferral,
  ConsultationResponse
};

// ==================== FUNÇÕES PÚBLICAS (Legacy Support) ====================

/**
 * Busca beneficiário por CPF na RapiDoc (função pública para compatibilidade)
 */
export const getBeneficiaryByCPF = async (cpf: string) => {
  try {
    const beneficiary = await rapidocService.getBeneficiaryByCPF(cpf);
    
    if (beneficiary) {
      return {
        success: true,
        data: beneficiary,
      };
    }

    return {
      success: false,
      error: 'CPF não encontrado no sistema.',
    };

  } catch (error: any) {
    console.error('Erro na busca do beneficiário:', error);

    // Classificar tipos de erro
    if (error.message.includes('fetch') || error.message.includes('network')) {
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
 * Solicitar atendimento imediato (médico clínico geral)
 */
export const requestImmediateAppointment = async (beneficiaryUuid: string) => {
  try {
    const result = await rapidocService.requestImmediateConsultation(beneficiaryUuid);

    if (result.success) {
      return {
        success: true,
        data: {
          consultationUrl: result.url,
          message: result.message || 'Atendimento solicitado com sucesso',
        },
      };
    }

    return { success: false, error: result.error };
  } catch (error: any) {
    console.error('Erro ao solicitar atendimento:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Adicionar beneficiário na RapiDoc
 */
export const addBeneficiary = async (beneficiary: BeneficiaryCreateData) => {
  try {
    const result = await rapidocService.createBeneficiary(beneficiary);
    
    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error('Erro ao adicionar beneficiário:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Listar todas as especialidades disponíveis
 */
export const listSpecialties = async () => {
  try {
    const specialties = await rapidocService.getSpecialties();

    // Filtrar nutrição se necessário (conforme requisito)
    const filteredSpecialties = specialties.filter(
      (specialty: RapidocSpecialty) => !specialty.name.toLowerCase().includes('nutrição')
    );

    return {
      success: true,
      data: filteredSpecialties,
    };
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
    const specialties = await rapidocService.getSpecialties();

    const nutrition = specialties.find(
      (specialty: RapidocSpecialty) => specialty.name.toLowerCase().includes('nutrição')
    );

    if (nutrition) {
      return {
        success: true,
        data: nutrition,
      };
    }

    return { success: false, error: 'Especialidade de nutrição não encontrada' };
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
    const specialties = await rapidocService.getSpecialties();

    const psychology = specialties.find(
      (specialty: RapidocSpecialty) => specialty.name.toLowerCase().includes('psicologia')
    );

    if (psychology) {
      return {
        success: true,
        data: psychology,
      };
    }

    return { success: false, error: 'Especialidade de psicologia não encontrada' };
  } catch (error: any) {
    console.error('Erro ao buscar psicologia:', error.message);
    return { success: false, error: error.message };
  }
};