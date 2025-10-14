/**
 * Serviço de Especialidades
 * Gerencia operações relacionadas a especialidades médicas na API RapiDoc
 */

import { rapidocHttpClient } from './http-client';
import { SpecialtyData, ApiResponse } from '../types/rapidoc-types';
import { withRetry } from '../utils/retry';
import { ErrorMessages } from '../constants/ErrorMessages';

export class SpecialtyService {
  private readonly ENDPOINTS = {
    SPECIALTIES: '/specialties'
  };

  private specialtiesCache: SpecialtyData[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtém todas as especialidades disponíveis
   */
  async getSpecialties(forceRefresh: boolean = false): Promise<{
    success: boolean;
    specialties?: SpecialtyData[];
    error?: string;
  }> {
    try {
      // Verificar cache
      if (!forceRefresh && this.isCacheValid()) {
        console.log('[SpecialtyService] Retornando especialidades do cache');
        return {
          success: true,
          specialties: this.specialtiesCache!
        };
      }

      console.log('[SpecialtyService] Buscando especialidades da API');
      const response = await withRetry(
        () => rapidocHttpClient.get<ApiResponse<SpecialtyData[]>>(this.ENDPOINTS.SPECIALTIES),
        { maxRetries: 2, initialDelay: 500 }
      );

      if (response.success) {
        const specialties = response.data || response.specialties || [];

        // Atualizar cache
        this.specialtiesCache = specialties;
        this.cacheTimestamp = Date.now();

        console.log(`[SpecialtyService] ${specialties.length} especialidades carregadas e armazenadas em cache`);

        return {
          success: true,
          specialties
        };
      }

      return {
        success: false,
        error: response.message || ErrorMessages.RAPIDOC.API_ERROR
      };
    } catch (error: any) {
      console.error('[SpecialtyService] Erro ao buscar especialidades:', error);
      return {
        success: false,
        error: error.message || ErrorMessages.RAPIDOC.API_ERROR
      };
    }
  }

  /**
   * Busca especialidade por UUID
   */
  async getSpecialtyByUuid(uuid: string): Promise<{
    success: boolean;
    specialty?: SpecialtyData;
    error?: string;
  }> {
    const result = await this.getSpecialties();

    if (!result.success) {
      return result;
    }

    const specialty = result.specialties?.find(s => s.uuid === uuid);

    if (specialty) {
      return {
        success: true,
        specialty
      };
    }

    return {
      success: false,
      error: ErrorMessages.CONSULTATION.SPECIALTY_NOT_FOUND
    };
  }

  /**
   * Busca especialidades por nome (busca parcial)
   */
  async searchSpecialtiesByName(searchTerm: string): Promise<{
    success: boolean;
    specialties?: SpecialtyData[];
    error?: string;
  }> {
    const result = await this.getSpecialties();

    if (!result.success) {
      return result;
    }

    const filteredSpecialties = result.specialties?.filter(specialty =>
      specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialty.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return {
      success: true,
      specialties: filteredSpecialties
    };
  }

  /**
   * Obtém apenas especialidades ativas
   */
  async getActiveSpecialties(): Promise<{
    success: boolean;
    specialties?: SpecialtyData[];
    error?: string;
  }> {
    const result = await this.getSpecialties();

    if (!result.success) {
      return result;
    }

    const activeSpecialties = result.specialties?.filter(s => s.active) || [];

    return {
      success: true,
      specialties: activeSpecialties
    };
  }

  /**
   * Limpa o cache de especialidades
   */
  clearCache(): void {
    console.log('[SpecialtyService] Cache limpo');
    this.specialtiesCache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Obtém informações sobre o cache
   */
  getCacheInfo(): {
    isValid: boolean;
    count: number;
    age: number;
  } {
    return {
      isValid: this.isCacheValid(),
      count: this.specialtiesCache?.length || 0,
      age: this.cacheTimestamp > 0 ? Date.now() - this.cacheTimestamp : 0
    };
  }

  private isCacheValid(): boolean {
    return this.specialtiesCache !== null &&
      (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }


}

// Instância singleton
export const specialtyService = new SpecialtyService();

