/**
 * Serviço de Agendamentos
 * Gerencia operações relacionadas a agendamentos na API RapiDoc
 */

import { rapidocHttpClient } from './http-client';
import { AppointmentData, AppointmentRequest, ApiResponse } from '../types/rapidoc-types';

export class AppointmentService {
  private readonly ENDPOINTS = {
    APPOINTMENTS: '/appointments'
  };

  /**
   * Cria um novo agendamento
   */
  async createAppointment(request: AppointmentRequest): Promise<{
    success: boolean;
    appointment?: AppointmentData;
    error?: string;
  }> {
    try {
      const validationError = this.validateAppointmentRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      const response = await rapidocHttpClient.post<ApiResponse<AppointmentData>>(
        this.ENDPOINTS.APPOINTMENTS,
        request
      );

      if (response.success) {
        const appointment = response.appointment || response.data;
        return {
          success: true,
          appointment
        };
      }

      return {
        success: false,
        error: response.message || 'Erro ao criar agendamento'
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Lista todos os agendamentos
   */
  async getAppointments(): Promise<{
    success: boolean;
    appointments?: AppointmentData[];
    error?: string;
  }> {
    try {
      const response = await rapidocHttpClient.get<ApiResponse<AppointmentData[]>>(
        this.ENDPOINTS.APPOINTMENTS
      );

      if (response.success) {
        const appointments = response.data || [];
        return {
          success: true,
          appointments: this.processAppointmentsData(appointments)
        };
      }

      return {
        success: false,
        error: response.message || 'Erro ao carregar agendamentos'
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Obtém um agendamento específico por UUID
   */
  async getAppointmentByUuid(uuid: string): Promise<{
    success: boolean;
    appointment?: AppointmentData;
    error?: string;
  }> {
    try {
      if (!this.isValidUuid(uuid)) {
        return {
          success: false,
          error: 'UUID do agendamento inválido'
        };
      }

      const response = await rapidocHttpClient.get<ApiResponse<AppointmentData>>(
        `${this.ENDPOINTS.APPOINTMENTS}/${uuid}`
      );

      if (response.success) {
        const appointment = response.appointment || response.data;
        return {
          success: true,
          appointment
        };
      }

      return {
        success: false,
        error: response.message || 'Agendamento não encontrado'
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.extractErrorMessage(error)
      };
    }
  }

  /**
   * Cancela um agendamento
   */
  async cancelAppointment(uuid: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.isValidUuid(uuid)) {
        return {
          success: false,
          error: 'UUID do agendamento inválido'
        };
      }

      const response = await rapidocHttpClient.delete<ApiResponse>(
        `${this.ENDPOINTS.APPOINTMENTS}/${uuid}`
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

  private validateAppointmentRequest(request: AppointmentRequest): string | null {
    if (!request.beneficiaryUuid || !this.isValidUuid(request.beneficiaryUuid)) {
      return 'UUID do beneficiário inválido';
    }
    if (!request.availabilityUuid || !this.isValidUuid(request.availabilityUuid)) {
      return 'UUID da disponibilidade inválido';
    }
    if (!request.specialtyUuid || !this.isValidUuid(request.specialtyUuid)) {
      return 'UUID da especialidade inválido';
    }
    if (request.beneficiaryMedicalReferralUuid && !this.isValidUuid(request.beneficiaryMedicalReferralUuid)) {
      return 'UUID do encaminhamento médico inválido';
    }
    return null;
  }

  private processAppointmentsData(appointments: AppointmentData[]): AppointmentData[] {
    return appointments.sort((a, b) => {
      // Ordenar por data (mais recentes primeiro)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
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
export const appointmentService = new AppointmentService();

