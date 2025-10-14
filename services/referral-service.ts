/**
 * Serviço de Encaminhamentos
 * Gerencia operações relacionadas a encaminhamentos médicos na API RapiDoc
 */

import { rapidocHttpClient } from './http-client';
import { MedicalReferral, ApiResponse } from '../types/rapidoc-types';

export class ReferralService {
  private readonly ENDPOINTS = {
    REFERRALS: '/beneficiary-medical-referrals'
  };

  private referralsCache: MedicalReferral[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

  /**
   * Obtém todos os encaminhamentos médicos
   */
  async getReferrals(forceRefresh: boolean = false): Promise<{
    success: boolean;
    referrals?: MedicalReferral[];
    error?: string;
  }> {
    try {
      // Verificar cache
      if (!forceRefresh && this.isCacheValid()) {
        // Retornando encaminhamentos do cache
        return {
          success: true,
          referrals: this.referralsCache!
        };
      }

      // Buscando encaminhamentos da API
      const response = await rapidocHttpClient.get<ApiResponse<MedicalReferral[]>>(
        this.ENDPOINTS.REFERRALS
      );

      if (response.success) {
        const referrals = response.data || response.referrals || [];
        // Atualizar cache
        this.referralsCache = referrals;
        this.cacheTimestamp = Date.now();

        // Encaminhamentos carregados e armazenados em cache

        return {
          success: true,
          referrals: this.processReferralsData(referrals)
        };
      }

      return {
        success: false,
        error: response.message || 'Erro ao carregar encaminhamentos'
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Obtém encaminhamentos por beneficiário
   */
  async getReferralsByBeneficiary(beneficiaryUuid: string): Promise<{
    success: boolean;
    referrals?: MedicalReferral[];
    error?: string;
  }> {
    if (!this.isValidUuid(beneficiaryUuid)) {
      return {
        success: false,
        error: 'UUID do beneficiário inválido'
      };
    }
    const result = await this.getReferrals();
    if (result.success && result.referrals) {
      const beneficiaryReferrals = result.referrals.filter(
        referral => referral.beneficiaryUuid === beneficiaryUuid &&
        referral.active
      );
      return {
        success: true,
        referrals: beneficiaryReferrals
      };
    }
    return result;
  }

  /**
   * Busca encaminhamento específico por UUID
   */
  async getReferralByUuid(uuid: string): Promise<{
    success: boolean;
    referral?: MedicalReferral;
    error?: string;
  }> {
    if (!this.isValidUuid(uuid)) {
      return {
        success: false,
        error: 'UUID do encaminhamento inválido'
      };
    }
    const result = await this.getReferrals();
    if (result.success && result.referrals) {
      const referral = result.referrals.find(r => r.uuid === uuid);
      if (referral) {
        return {
          success: true,
          referral
        };
      }
      return {
        success: false,
        error: 'Encaminhamento não encontrado'
      };
    }
    return result;
  }

  /**
   * Limpa o cache de encaminhamentos
   */
  clearCache(): void {
    // Cache limpo
    this.referralsCache = null;
    this.cacheTimestamp = 0;
  }

  private processReferralsData(referrals: MedicalReferral[]): MedicalReferral[] {
    return referrals
      .filter(referral => referral.active)
      .sort((a, b) => {
        // Ordenar por data de encaminhamento (mais recentes primeiro)
        return new Date(b.referralDate).getTime() - new Date(a.referralDate).getTime();
      });
  }

  private isCacheValid(): boolean {
    return this.referralsCache !== null &&
      (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
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
export const referralService = new ReferralService();

