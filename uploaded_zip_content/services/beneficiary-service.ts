/**
 * Serviço de Beneficiários
 * Gerencia operações relacionadas a beneficiários na API RapiDoc
 */

import { rapidocHttpClient } from './http-client';
import { BeneficiaryData, BeneficiaryResponse, ApiResponse } from '../types/rapidoc-types';

export class BeneficiaryService {
  private readonly ENDPOINTS = {
    BENEFICIARIES: '/beneficiaries',
    REQUEST_APPOINTMENT: (uuid: string) => `/beneficiaries/${uuid}/request-appointment`
  };

  /**
   * Cadastra um ou mais beneficiários na API Rapidoc
   */
  async createBeneficiaries(beneficiaries: BeneficiaryData[]): Promise<{
    success: boolean;
    beneficiaries?: BeneficiaryResponse[];
    error?: string;
  }> {
    try {
      // Validar dados antes de enviar
      const validationErrors = this.validateBeneficiaries(beneficiaries);
      if (validationErrors.length > 0) {
        return {
          success: false,
          error: `Dados inválidos: ${validationErrors.join(', ')}`
        };
      }

      const response = await rapidocHttpClient.post<ApiResponse<BeneficiaryResponse[]>>(
        this.ENDPOINTS.BENEFICIARIES,
        beneficiaries
      );

      if (response.success && response.beneficiaries) {
        return {
          success: true,
          beneficiaries: response.beneficiaries
        };
      }

      return {
        success: false,
        error: response.message || 'Erro desconhecido ao cadastrar beneficiários'
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Busca todos os beneficiários
   */
  async getAllBeneficiaries(): Promise<{
    success: boolean;
    beneficiaries?: BeneficiaryResponse[];
    error?: string;
  }> {
    try {
      const response = await rapidocHttpClient.get<ApiResponse>(
        this.ENDPOINTS.BENEFICIARIES
      );

      if (response.success && response.beneficiaries) {
        return {
          success: true,
          beneficiaries: response.beneficiaries
        };
      }

      return {
        success: false,
        error: response.message || 'Erro ao buscar beneficiários'
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Busca beneficiário por CPF
   */
  async getBeneficiaryByCPF(cpf: string): Promise<{
    success: boolean;
    beneficiary?: BeneficiaryResponse;
    error?: string;
  }> {
    try {
      // Validar CPF
      const cleanCPF = cpf.replace(/\D/g, '');
      if (!this.isValidCpf(cleanCPF)) {
        return {
          success: false,
          error: 'CPF inválido'
        };
      }

      // Buscar todos os beneficiários e filtrar por CPF
      const result = await this.getAllBeneficiaries();
      
      if (!result.success || !result.beneficiaries) {
        return {
          success: false,
          error: result.error || 'Erro ao buscar beneficiários'
        };
      }

      const beneficiary = result.beneficiaries.find(b => b.cpf === cleanCPF);

      if (!beneficiary) {
        return {
          success: false,
          error: 'CPF não encontrado'
        };
      }

      return {
        success: true,
        beneficiary
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Solicita URL de atendimento para um beneficiário
   */
  async requestAppointmentUrl(beneficiaryUuid: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      if (!beneficiaryUuid || !this.isValidUuid(beneficiaryUuid)) {
        return {
          success: false,
          error: 'UUID do beneficiário inválido'
        };
      }

      const response = await rapidocHttpClient.get<ApiResponse>(
        this.ENDPOINTS.REQUEST_APPOINTMENT(beneficiaryUuid)
      );

      if (response.success && response.url) {
        return {
          success: true,
          url: response.url
        };
      }

      return {
        success: false,
        error: response.message || 'Erro ao solicitar URL de atendimento'
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Inativa um beneficiário
   */
  async deactivateBeneficiary(beneficiaryUuid: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!beneficiaryUuid || !this.isValidUuid(beneficiaryUuid)) {
        return {
          success: false,
          error: 'UUID do beneficiário inválido'
        };
      }

      const response = await rapidocHttpClient.delete<ApiResponse>(
        `${this.ENDPOINTS.BENEFICIARIES}/${beneficiaryUuid}`
      );

      return {
        success: response.success,
        error: response.success ? undefined : response.message
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Valida dados de beneficiários antes do envio
   */
  private validateBeneficiaries(beneficiaries: BeneficiaryData[]): string[] {
    const errors: string[] = [];

    if (!Array.isArray(beneficiaries) || beneficiaries.length === 0) {
      errors.push('Lista de beneficiários não pode estar vazia');
      return errors;
    }

    beneficiaries.forEach((beneficiary, index) => {
      const prefix = `Beneficiário ${index + 1}:`;

      // Validações obrigatórias
      if (!beneficiary.name?.trim()) {
        errors.push(`${prefix} Nome é obrigatório`);
      }

      if (!beneficiary.cpf || !this.isValidCpf(beneficiary.cpf)) {
        errors.push(`${prefix} CPF inválido`);
      }

      if (!beneficiary.birthday || !this.isValidDate(beneficiary.birthday)) {
        errors.push(`${prefix} Data de nascimento inválida (formato: yyyy-MM-dd)`);
      }

      if (!beneficiary.email || !this.isValidEmail(beneficiary.email)) {
        errors.push(`${prefix} Email inválido`);
      }

      // Validações opcionais
      if (beneficiary.phone && !this.isValidPhone(beneficiary.phone)) {
        errors.push(`${prefix} Telefone inválido`);
      }

      if (beneficiary.zipCode && !this.isValidZipCode(beneficiary.zipCode)) {
        errors.push(`${prefix} CEP inválido`);
      }

      if (beneficiary.paymentType && !['S', 'A'].includes(beneficiary.paymentType)) {
        errors.push(`${prefix} Tipo de pagamento deve ser 'S' ou 'A'`);
      }

      if (beneficiary.serviceType && !['G', 'P', 'GP', 'GS', 'GSP'].includes(beneficiary.serviceType)) {
        errors.push(`${prefix} Tipo de serviço inválido`);
      }
    });

    return errors;
  }

  private isValidCpf(cpf: string): boolean {
    return /^\d{11}$/.test(cpf);
  }

  private isValidDate(date: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidPhone(phone: string): boolean {
    return /^\+?\d{10,15}$/.test(phone);
  }

  private isValidZipCode(zipCode: string): boolean {
    return /^\d{8}$/.test(zipCode);
  }

  private isValidUuid(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  }

  private extractErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'Erro desconhecido na comunicação com a API';
  }
}

// Instância singleton
export const beneficiaryService = new BeneficiaryService();

