/**
 * Serviço de Disponibilidade
 * Gerencia a consulta de horários disponíveis para agendamento na API RapiDoc
 */

import { rapidocHttpClient } from './http-client';
import { AvailabilitySlot, AvailabilityQuery, ApiResponse } from '../types/rapidoc-types';

export class AvailabilityService {
  private readonly ENDPOINTS = {
    AVAILABILITY: '/specialty-availability'
  };

  /**
   * Consulta disponibilidade de horários para uma especialidade
   */
  async getAvailability(query: AvailabilityQuery): Promise<{
    success: boolean;
    availability?: AvailabilitySlot[];
    error?: string;
  }> {
    try {
      // Validar parâmetros
      const validationError = this.validateAvailabilityQuery(query);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      const params = new URLSearchParams({
        specialtyUuid: query.specialtyUuid,
        dateInitial: query.dateInitial,
        dateFinal: query.dateFinal,
        beneficiaryUuid: query.beneficiaryUuid
      });

      console.log("[AvailabilityService] Buscando disponibilidade com params:", params.toString());

      const response = await rapidocHttpClient.get<ApiResponse<AvailabilitySlot[]>>(
        `${this.ENDPOINTS.AVAILABILITY}?${params.toString()}`
      );

      if (response.success) {
        const availability = response.data || response.availability || [];
        // Processar e ordenar horários
        const processedAvailability = this.processAvailabilityData(availability);
        console.log(`[AvailabilityService] ${processedAvailability.length} horários disponíveis encontrados.`);
        return {
          success: true,
          availability: processedAvailability
        };
      }

      return {
        success: false,
        error: response.message || 'Erro ao consultar disponibilidade'
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Obtém disponibilidade para uma data específica
   */
  async getAvailabilityForDate(
    specialtyUuid: string,
    date: string, // dd/MM/yyyy
    beneficiaryUuid: string
  ): Promise<{
    success: boolean;
    availability?: AvailabilitySlot[];
    error?: string;
  }> {
    return this.getAvailability({
      specialtyUuid,
      dateInitial: date,
      dateFinal: date,
      beneficiaryUuid
    });
  }

  /**
   * Obtém próximos horários disponíveis (próximos 7 dias)
   */
  async getNextAvailableSlots(
    specialtyUuid: string,
    beneficiaryUuid: string,
    limit: number = 10
  ): Promise<{
    success: boolean;
    availability?: AvailabilitySlot[];
    error?: string;
  }> {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const result = await this.getAvailability({
      specialtyUuid,
      dateInitial: this.formatDateToBrazilian(today),
      dateFinal: this.formatDateToBrazilian(nextWeek),
      beneficiaryUuid
    });

    if (result.success && result.availability) {
      // Filtrar apenas horários disponíveis e limitar quantidade
      const availableSlots = result.availability
        .filter(slot => slot.available)
        .slice(0, limit);
      return {
        success: true,
        availability: availableSlots
      };
    }
    return result;
  }

  private validateAvailabilityQuery(query: AvailabilityQuery): string | null {
    if (!query.specialtyUuid || !this.isValidUuid(query.specialtyUuid)) {
      return 'UUID da especialidade inválido';
    }
    if (!query.beneficiaryUuid || !this.isValidUuid(query.beneficiaryUuid)) {
      return 'UUID do beneficiário inválido';
    }
    if (!query.dateInitial || !this.isValidBrazilianDate(query.dateInitial)) {
      return 'Data inicial inválida (formato: dd/MM/yyyy)';
    }
    if (!query.dateFinal || !this.isValidBrazilianDate(query.dateFinal)) {
      return 'Data final inválida (formato: dd/MM/yyyy)';
    }
    // Verificar se data inicial não é posterior à final
    const initialDate = this.parseBrazilianDate(query.dateInitial);
    const finalDate = this.parseBrazilianDate(query.dateFinal);
    if (initialDate > finalDate) {
      return 'Data inicial não pode ser posterior à data final';
    }
    return null;
  }

  private processAvailabilityData(availability: AvailabilitySlot[]): AvailabilitySlot[] {
    return availability
      .sort((a, b) => {
        // Ordenar por data e depois por horário
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.time.localeCompare(b.time);
      });
  }

  private formatDateToBrazilian(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private isValidBrazilianDate(date: string): boolean {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(date);
  }

  private parseBrazilianDate(date: string): Date {
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day);
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
export const availabilityService = new AvailabilityService();

