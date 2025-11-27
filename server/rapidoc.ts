import axios, { AxiosInstance } from 'axios';

/**
 * Cliente HTTP para integração com API Rapidoc
 * Suporta múltiplos formatos de variáveis de ambiente para compatibilidade
 */

interface RapidocConfig {
  baseURL: string;
  clientId: string;
  token: string;
}

function getRapidocConfig(): RapidocConfig {
  // Suporta tanto variáveis antigas quanto novas para compatibilidade
  const baseURL = process.env.RAPIDOC_BASE_URL || process.env.Url || 'https://api.rapidoc.tech/tema/api/';
  const clientId = process.env.RAPIDOC_CLIENT_ID || process.env.clientId || '';
  const token = process.env.RAPIDOC_TOKEN || process.env.Authorization || '';

  if (!baseURL || !clientId || !token) {
    console.warn('[Rapidoc] Missing credentials:', {
      hasBaseURL: !!baseURL,
      hasClientId: !!clientId,
      hasToken: !!token,
    });
  }

  return { baseURL, clientId, token };
}

class RapidocClient {
  private client: AxiosInstance;
  private config: RapidocConfig;

  constructor() {
    this.config = getRapidocConfig();
    
    this.client = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.config.token,
        'X-Client-Id': this.config.clientId,
      },
      timeout: 30000,
    });

    // Interceptor para logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[Rapidoc] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[Rapidoc] Request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log(`[Rapidoc] Response ${response.status} from ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[Rapidoc] Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  isConfigured(): boolean {
    return !!(this.config.baseURL && this.config.clientId && this.config.token);
  }

  // ============= BENEFICIÁRIOS =============

  async listBeneficiaries() {
    const response = await this.client.get('/beneficiaries');
    return response.data;
  }

  async getBeneficiaryByCpf(cpf: string) {
    const response = await this.client.get(`/beneficiaries/${cpf}`);
    return response.data;
  }

  async createBeneficiary(data: {
    cpf: string;
    name: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
  }) {
    const response = await this.client.post('/beneficiaries', data);
    return response.data;
  }

  async updateBeneficiary(uuid: string, data: {
    name?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
  }) {
    const response = await this.client.put(`/beneficiaries/${uuid}`, data);
    return response.data;
  }

  async inactivateBeneficiary(uuid: string) {
    const response = await this.client.delete(`/beneficiaries/${uuid}`);
    return response.data;
  }

  async requestAppointmentUrl(uuid: string) {
    const response = await this.client.get(`/beneficiaries/${uuid}/request-appointment`);
    return response.data;
  }

  // ============= ESPECIALIDADES =============

  async listSpecialties() {
    const response = await this.client.get('/specialties');
    return response.data;
  }

  async checkSpecialtyAvailability(specialtyId: string, date: string) {
    const response = await this.client.get('/specialty-availability', {
      params: { specialtyId, date },
    });
    return response.data;
  }

  // ============= AGENDAMENTOS =============

  async createAppointment(data: {
    beneficiaryUuid: string;
    specialtyId: string;
    date: string;
    time: string;
    notes?: string;
  }) {
    const response = await this.client.post('/appointments', data);
    return response.data;
  }

  async createAppointmentWithReferral(data: {
    beneficiaryUuid: string;
    specialtyId: string;
    date: string;
    time: string;
    referralCode: string;
    notes?: string;
  }) {
    const response = await this.client.post('/appointments', data);
    return response.data;
  }

  async listAppointments(beneficiaryUuid?: string) {
    const params = beneficiaryUuid ? { beneficiaryUuid } : {};
    const response = await this.client.get('/appointments', { params });
    return response.data;
  }

  async getAppointment(appointmentUuid: string) {
    const response = await this.client.get(`/appointments/${appointmentUuid}`);
    return response.data;
  }

  async confirmAppointment(appointmentUuid: string) {
    const response = await this.client.post(`/appointments/${appointmentUuid}/confirm`);
    return response.data;
  }

  async cancelAppointment(appointmentUuid: string, reason?: string) {
    const response = await this.client.post(`/appointments/${appointmentUuid}/cancel`, { reason });
    return response.data;
  }

  // ============= HEALTH CHECK =============

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Singleton instance
let rapidocClient: RapidocClient | null = null;

export function getRapidocClient(): RapidocClient {
  if (!rapidocClient) {
    rapidocClient = new RapidocClient();
  }
  return rapidocClient;
}
