/**
 * Serviço de Agendamentos
 * Centraliza todas as operações de agendamento e integra com os demais serviços
 */

import { rapidocHttpClient, RapidocHttpClientError } from './http-client';
import { AppointmentRequest, AppointmentData } from '../types/rapidoc-types';
import { ApiResponse } from '../types/api-types';
import { specialtyService } from './specialty-service';
import { availabilityService } from './availability-service';
import { referralService } from './referral-service';

export class AppointmentService {
  private readonly ENDPOINTS = {
    APPOINTMENTS: '/appointments',
    APPOINTMENT_BY_ID: (id: string) => `/appointments/${id}`,
    CANCEL_APPOINTMENT: (id: string) => `/appointments/${id}`
  };

  /**
   * Cria um agendamento
   */
  async createAppointment(request: AppointmentRequest): Promise<{
    success: boolean;
    appointment?: AppointmentData;
    appointmentUrl?: string;
    error?: string;
  }> {
    try {
      // Validar parâmetros
      const validationError = this.validateAppointmentRequest(request);
      if (validationError) {
        return {
          success: false,
          error: validationError
        };
      }

      console.log('[AppointmentService] Criando agendamento:', request);

      const response = await rapidocHttpClient.post<ApiResponse>(
        this.ENDPOINTS.APPOINTMENTS,
        request
      );

      if (response.success) {
        console.log('[AppointmentService] Agendamento criado com sucesso');
        return {
          success: true,
          appointment: response.appointment,
          appointmentUrl: response.appointmentUrl || response.url
        };
      }

      return {
        success: false,
        error: response.message || 'Erro ao criar agendamento'
      };
    } catch (error: any) {
      console.error('[AppointmentService] Erro ao criar agendamento:', error);
      return {
        success: false,
        error: (error instanceof RapidocHttpClientError) ? error.message : 'Erro desconhecido ao criar agendamento'
      };
    }
  }

  /**
   * Busca agendamentos de um beneficiário
   */
  async getAppointmentsByBeneficiary(beneficiaryUuid: string): Promise<{
    success: boolean;
    appointments?: AppointmentData[];
    error?: string;
  }> {
    try {
      if (!this.isValidUuid(beneficiaryUuid)) {
        return {
          success: false,
          error: 'UUID do beneficiário inválido'
        };
      }

      const response = await rapidocHttpClient.get<ApiResponse>(
        `${this.ENDPOINTS.APPOINTMENTS}?beneficiaryUuid=${beneficiaryUuid}`
      );

      if (response.success) {
        const appointments = response.data || response.appointments || [];
        return {
          success: true,
          appointments: this.processAppointmentsData(appointments)
        };
      }

      return {
        success: false,
        error: response.message || 'Erro ao buscar agendamentos'
      };
    } catch (error: any) {
      console.error('[AppointmentService] Erro ao criar agendamento:', error);
      return {
        success: false,
        error: (error instanceof RapidocHttpClientError) ? error.message : 'Erro desconhecido ao criar agendamento'
      };
    }
  }

  /**
   * Busca um agendamento específico
   */
  async getAppointmentById(appointmentId: string): Promise<{
    success: boolean;
    appointment?: AppointmentData;
    error?: string;
  }> {
    try {
      if (!this.isValidUuid(appointmentId)) {
        return {
          success: false,
          error: 'ID do agendamento inválido'
        };
      }

      const response = await rapidocHttpClient.get<ApiResponse>(
        this.ENDPOINTS.APPOINTMENT_BY_ID(appointmentId)
      );

      if (response.success && response.appointment) {
        return {
          success: true,
          appointment: response.appointment
        };
      }

      return {
        success: false,
        error: response.message || 'Agendamento não encontrado'
      };
    } catch (error: any) {
      console.error('[AppointmentService] Erro ao criar agendamento:', error);
      return {
        success: false,
        error: (error instanceof RapidocHttpClientError) ? error.message : 'Erro desconhecido ao criar agendamento'
      };
    }
  }

  /**
   * Cancela um agendamento
   */
  async cancelAppointment(appointmentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.isValidUuid(appointmentId)) {
        return {
          success: false,
          error: 'ID do agendamento inválido'
        };
      }

      const response = await rapidocHttpClient.delete<ApiResponse>(
        this.ENDPOINTS.CANCEL_APPOINTMENT(appointmentId)
      );

      return {
        success: response.success,
        error: response.success ? undefined : response.message
      };
    } catch (error: any) {
      console.error('[AppointmentService] Erro ao criar agendamento:', error);
      return {
        success: false,
        error: (error instanceof RapidocHttpClientError) ? error.message : 'Erro desconhecido ao criar agendamento'
      };
    }
  }

  /**
   * Fluxo completo de agendamento de especialista
   */
  async scheduleSpecialistAppointment(
    beneficiaryUuid: string,
    specialtyUuid: string,
    availabilityUuid: string,
    referralUuid?: string
  ): Promise<{
    success: boolean;
    appointment?: AppointmentData;
    appointmentUrl?: string;  
    error?: string;
  }> {
    try {
      // Verificar se há encaminhamento necessário
      if (!referralUuid) {
        const referralCheck = await this.checkSpecialtyReferral(beneficiaryUuid, specialtyUuid);
        if (!referralCheck.success) {
          return {
            success: false,
            error: 'Encaminhamento médico necessário para esta especialidade'
          };
        }
        referralUuid = referralCheck.referral?.uuid;
      }

      // Criar agendamento
      return await this.createAppointment({
        beneficiaryUuid,
        availabilityUuid,
        specialtyUuid,
        beneficiaryMedicalReferralUuid: referralUuid,
        approveAdditionalPayment: true
      });
    } catch (error: any) {
      console.error('[AppointmentService] Erro ao criar agendamento:', error);
      return {
        success: false,
        error: (error instanceof RapidocHttpClientError) ? error.message : 'Erro desconhecido ao criar agendamento'
      };
    }
  }

  /**
   * Verifica se beneficiário tem encaminhamento para especialidade
   */
  private async checkSpecialtyReferral(beneficiaryUuid: string, specialtyUuid: string): Promise<{
    success: boolean;
    referral?: any;
    hasReferral?: boolean;
  }> {
    try {
      const referralsResult = await referralService.getReferralsByBeneficiary(beneficiaryUuid);
      
      if (!referralsResult.success) {
        return { success: false };
      }

      const referral = referralsResult.referrals?.find(r => 
        r.specialtyUuid === specialtyUuid && r.status === 'active'
      );

      return {
        success: true,
        hasReferral: !!referral,
        referral
      };
    } catch (error: any) {
      console.error('[AppointmentService] Erro ao verificar encaminhamento de especialidade:', error);
      return { success: false, error: (error instanceof RapidocHttpClientError) ? error.message : 'Erro desconhecido ao verificar encaminhamento' };
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
    return null;
  }

  private processAppointmentsData(appointments: AppointmentData[]): AppointmentData[] {
    return appointments.sort((a, b) => {
      // Ordenar por data (mais recentes primeiro)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  private isValidUuid(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
  }



// Instância singleton
export const appointmentService = new AppointmentService();

