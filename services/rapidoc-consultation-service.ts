/**
 * Serviço de Consulta RapiDoc - Alinhado com Documentação Oficial
 * Implementa todos os endpoints de consulta conforme API RapiDoc
 */

import { useState, useEffect } from 'react';
import { rapidocService } from './rapidoc';
import type {
  RapidocBeneficiary,
  RapidocSpecialty,
  RapidocAvailability,
  RapidocAppointment,
  RapidocMedicalReferral,
  ConsultationResponse
} from './rapidoc';
import { ProductionLogger } from '../utils/production-logger';
import { showTemplateMessage } from '../utils/alertHelpers';

interface ConsultationRequest {
  beneficiaryUuid: string;
  serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition';
  specialty?: string;
  priority?: 'normal' | 'urgent';
  notes?: string;
}

interface ScheduleRequest {
  beneficiaryUuid: string;
  availabilityUuid: string;
  specialtyUuid: string;
  serviceType: 'specialist' | 'psychology' | 'nutrition';
  medicalReferralUuid?: string;
  approveAdditionalPayment?: boolean;
}

interface ConsultationResult {
  success: boolean;
  consultationId?: string;
  sessionUrl?: string;
  estimatedWaitTime?: number;
  queuePosition?: number;
  professionalInfo?: {
    name: string;
    specialty: string;
    crm?: string;
  };
  error?: string;
}

interface AvailabilityResult {
  success: boolean;
  availableSlots: RapidocAvailability[];
  error?: string;
}

class RapidocConsultationService {
  private logger = new ProductionLogger('RapidocConsultationService');

  /**
   * Solicitar consulta imediata (clínico geral)
   * Usa: GET /tema/api/beneficiaries/:uuid/request-appointment
   */
  async requestImmediateConsultation(beneficiaryUuid: string): Promise<ConsultationResult> {
    try {
      this.logger.info('Solicitando consulta imediata', { beneficiaryUuid });
      
      const result = await rapidocService.requestImmediateConsultation(beneficiaryUuid);
      
      if (result.success && result.url) {
        this.logger.info('Consulta imediata solicitada com sucesso');
        
        return {
          success: true,
          sessionUrl: result.url,
          consultationId: this.generateSessionId(result.url),
          estimatedWaitTime: 0, // Consulta imediata
        };
      }
      
      this.logger.error('Falha na solicitação de consulta imediata', { error: result.error });
      return {
        success: false,
        error: result.error || 'Não foi possível solicitar consulta no momento'
      };
      
    } catch (error: any) {
      this.logger.error('Erro na solicitação de consulta imediata', { error: error.message });
      return {
        success: false,
        error: 'Erro interno. Tente novamente.'
      };
    }
  }

  /**
   * Listar especialidades disponíveis
   * Usa: GET /tema/api/specialties
   */
  async getSpecialties(): Promise<{ success: boolean; specialties: RapidocSpecialty[]; error?: string }> {
    try {
      this.logger.info('Buscando especialidades disponíveis');
      
      const specialties = await rapidocService.getSpecialties();
      
      this.logger.info(`${specialties.length} especialidades encontradas`);

      return {
        success: true,
        specialties
      };
      
    } catch (error: any) {
      this.logger.error('Erro ao buscar especialidades', { error: error.message });
      return {
        success: false,
        specialties: [],
        error: 'Não foi possível carregar especialidades'
      };
    }
  }

  /**
   * Buscar disponibilidade de especialidade
   * Usa: GET /tema/api/specialty-availability
   */
  async getSpecialtyAvailability(
    specialtyUuid: string,
    beneficiaryUuid: string,
    dateRange?: {
      start: Date;
      end: Date;
    }
  ): Promise<AvailabilityResult> {
    try {
      this.logger.info('Buscando disponibilidade de especialidade', {
        specialtyUuid,
        beneficiaryUuid,
        dateRange
      });

      // Definir período padrão se não fornecido (próximos 15 dias)
      const startDate = dateRange?.start || new Date();
      const endDate = dateRange?.end || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
      
      const dateInitial = rapidocService.formatDateForRapidoc(startDate);
      const dateFinal = rapidocService.formatDateForRapidoc(endDate);

      const availableSlots = await rapidocService.getSpecialtyAvailability({
        specialtyUuid,
        beneficiaryUuid,
        dateInitial,
        dateFinal
      });

      this.logger.info(`${availableSlots.length} horários disponíveis encontrados`);

      return {
        success: true,
        availableSlots
      };
      
    } catch (error: any) {
      this.logger.error('Erro ao buscar disponibilidade', { error: error.message });
      return {
        success: false,
        availableSlots: [],
        error: 'Não foi possível carregar horários disponíveis'
      };
    }
  }

  /**
   * Agendar consulta com especialista
   * Usa: POST /tema/api/appointments
   */
  async scheduleAppointment(request: ScheduleRequest): Promise<ConsultationResult> {
    try {
      this.logger.info('Agendando consulta', request);
      
      // Verificar se tem encaminhamento médico se necessário
      let medicalReferral: RapidocMedicalReferral | null = null;
      
      if (request.serviceType !== 'clinical') {
        // Buscar encaminhamentos do beneficiário
        const referrals = await rapidocService.getBeneficiaryMedicalReferrals(request.beneficiaryUuid);
        
        medicalReferral = referrals.find(ref => 
          ref.status === 'PENDING' && 
          ref.uuid === request.medicalReferralUuid
        ) || null;
        
        this.logger.info('Encaminhamento encontrado', { 
          hasReferral: !!medicalReferral,
          referralId: medicalReferral?.uuid
        });
      }
      
      // Fazer agendamento
      const appointment = await rapidocService.scheduleAppointment({
        beneficiaryUuid: request.beneficiaryUuid,
        availabilityUuid: request.availabilityUuid,
        specialtyUuid: request.specialtyUuid,
        approveAdditionalPayment: request.approveAdditionalPayment ?? true,
        beneficiaryMedicalReferralUuid: medicalReferral?.uuid
      });
      
      this.logger.info('Agendamento realizado com sucesso', {
        appointmentId: appointment.uuid,
        status: appointment.status
      });
      
      return {
        success: true,
        consultationId: appointment.uuid,
        sessionUrl: appointment.beneficiaryUrl,
        professionalInfo: appointment.professional ? {
          name: appointment.professional.name,
          specialty: appointment.specialty.name,
        } : undefined
      };
      
    } catch (error: any) {
      this.logger.error('Erro no agendamento', { error: error.message });
      return {
        success: false,
        error: 'Não foi possível agendar a consulta'
      };
    }
  }

  /**
   * Buscar consultas/agendamentos do beneficiário
   * Usa: GET /tema/api/beneficiaries/:uuid/appointments
   */
  async getBeneficiaryAppointments(beneficiaryUuid: string): Promise<{
    success: boolean;
    appointments: RapidocAppointment[];
    error?: string;
  }> {
    try {
      this.logger.info('Buscando agendamentos do beneficiário', { beneficiaryUuid });
      
      const appointments = await rapidocService.getBeneficiaryAppointments(beneficiaryUuid);
      
      this.logger.info(`${appointments.length} agendamentos encontrados`);

      return {
        success: true,
        appointments
      };
      
    } catch (error: any) {
      this.logger.error('Erro ao buscar agendamentos', { error: error.message });
      return {
        success: false,
        appointments: [],
        error: 'Não foi possível carregar agendamentos'
      };
    }
  }

  /**
   * Cancelar agendamento
   * Usa: DELETE /tema/api/appointments/:uuid
   */
  async cancelAppointment(appointmentUuid: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      this.logger.info('Cancelando agendamento', { appointmentUuid });
      
      const success = await rapidocService.cancelAppointment(appointmentUuid);
      
      if (success) {
        this.logger.info('Agendamento cancelado com sucesso');
        return { success: true };
      }
      
      return {
        success: false,
        error: 'Não foi possível cancelar o agendamento'
      };
      
    } catch (error: any) {
      this.logger.error('Erro ao cancelar agendamento', { error: error.message });
      return {
        success: false,
        error: 'Erro interno ao cancelar agendamento'
      };
    }
  }

  /**
   * Buscar encaminhamentos do beneficiário
   * Usa: GET /tema/api/beneficiaries/:uuid/medical-referrals
   */
  async getBeneficiaryMedicalReferrals(beneficiaryUuid: string): Promise<{
    success: boolean;
    referrals: RapidocMedicalReferral[];
    error?: string;
  }> {
    try {
      this.logger.info('Buscando encaminhamentos', { beneficiaryUuid });
      
      const referrals = await rapidocService.getBeneficiaryMedicalReferrals(beneficiaryUuid);
      
      this.logger.info(`${referrals.length} encaminhamentos encontrados`);

      return {
        success: true,
        referrals
      };
      
    } catch (error: any) {
      this.logger.error('Erro ao buscar encaminhamentos', { error: error.message });
      return {
        success: false,
        referrals: [],
        error: 'Não foi possível carregar encaminhamentos'
      };
    }
  }

  /**
   * Verificar especialidade específica (psicologia ou nutrição)
   */
  async getSpecialtyByType(type: 'psychology' | 'nutrition'): Promise<{
    success: boolean;
    specialty?: RapidocSpecialty;
    error?: string;
  }> {
    try {
      const specialties = await rapidocService.getSpecialties();
      
      const searchTerms = {
        psychology: ['psicologia', 'psiquiatria'],
        nutrition: ['nutrição']
      };
      
      const specialty = specialties.find(s => {
        const name = s.name.toLowerCase();
        return searchTerms[type].some(term => name.includes(term));
      });
      
      if (specialty) {
        return {
          success: true,
          specialty
        };
      }
      
      return {
        success: false,
        error: `Especialidade de ${type} não encontrada`
      };
      
    } catch (error: any) {
      this.logger.error(`Erro ao buscar especialidade ${type}`, { error: error.message });
      return {
        success: false,
        error: 'Erro ao buscar especialidade'
      };
    }
  }

  /**
   * Verificar saúde da integração RapiDoc
   */
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    message: string;
    services?: {
      beneficiaries: boolean;
      specialties: boolean;
      appointments: boolean;
    };
  }> {
    try {
      this.logger.info('Verificando saúde da integração RapiDoc');
      
      // Testar diferentes endpoints
      const tests = {
        specialties: false,
        beneficiaries: false,
        appointments: false
      };
      
      // Teste 1: Especialidades
      try {
        await rapidocService.getSpecialties();
        tests.specialties = true;
      } catch (error) {
        this.logger.warn('Falha no teste de especialidades');
      }
      
      // Teste 2: Listar beneficiários (pode falhar por autorização)
      try {
        await rapidocService.getAllBeneficiaries();
        tests.beneficiaries = true;
      } catch (error) {
        this.logger.warn('Falha no teste de beneficiários');
      }
      
      // Teste 3: Listar agendamentos
      try {
        await rapidocService.getAllAppointments();
        tests.appointments = true;
      } catch (error) {
        this.logger.warn('Falha no teste de agendamentos');
      }
      
      const healthyServices = Object.values(tests).filter(Boolean).length;
      const totalServices = Object.keys(tests).length;
      
      let status: 'healthy' | 'degraded' | 'down';
      let message: string;
      
      if (healthyServices === totalServices) {
        status = 'healthy';
        message = 'RapiDoc integração operacional';
      } else if (healthyServices > 0) {
        status = 'degraded';
        message = `RapiDoc parcialmente operacional (${healthyServices}/${totalServices} serviços)`;
      } else {
        status = 'down';
        message = 'RapiDoc indisponível';
      }
      
      this.logger.info('Verificação de saúde concluída', { status, tests });
      
      return {
        status,
        message,
        services: tests
      };
      
    } catch (error: any) {
      this.logger.error('Erro na verificação de saúde', { error: error.message });
      return {
        status: 'down',
        message: 'Erro na verificação de saúde da API'
      };
    }
  }

  /**
   * Utilitário: Gerar ID de sessão a partir da URL
   */
  private generateSessionId(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathSegments = urlObj.pathname.split('/');
      return pathSegments[pathSegments.length - 1] || `session_${Date.now()}`;
    } catch {
      return `session_${Date.now()}`;
    }
  }

  /**
   * Utilitário: Mapear tipo de serviço para UUID de especialidade
   */
  async mapServiceToSpecialty(serviceType: string): Promise<string | null> {
    try {
      if (serviceType === 'clinical') {
        return null; // Clínico geral não precisa de especialidade
      }
      
      const specialtyResult = await this.getSpecialtyByType(serviceType as any);
      return specialtyResult.specialty?.uuid || null;
    } catch {
      return null;
    }
  }
}

export const rapidocConsultationService = new RapidocConsultationService();
export default rapidocConsultationService;

export type {
  ConsultationRequest,
  ScheduleRequest,
  ConsultationResult,
  AvailabilityResult
};