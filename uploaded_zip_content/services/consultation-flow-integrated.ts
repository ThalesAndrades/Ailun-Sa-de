/**
 * Serviço de Fluxo de Consultas Integrado
 * Coordena todos os fluxos de consulta usando os novos serviços modulares
 */

import { specialtyService } from './specialty-service';
import { availabilityService } from './availability-service';
import { appointmentService } from './appointment-service';
import { referralService } from './referral-service';
import { beneficiaryService } from './beneficiary-service';
import { SpecialtyData, AvailabilitySlot, AppointmentData } from '../types/rapidoc-types';

export class ConsultationFlowService {
  /**
   * Obtém intervalo de datas padrão (hoje + 7 dias)
   */
  getDefaultDateRange(): { dateInitial: string; dateFinal: string } {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return {
      dateInitial: this.formatDateToBrazilian(today),
      dateFinal: this.formatDateToBrazilian(nextWeek)
    };
  }

  /**
   * Fluxo completo de médico imediato
   */
  async startImmediateDoctorFlow(beneficiaryUuid: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      const result = await beneficiaryService.requestAppointmentUrl(beneficiaryUuid);
      
      if (result.success) {
        return {
          success: true,
          url: result.url
        };
      }

      return {
        success: false,
        error: result.error || 'Erro ao solicitar consulta imediata'
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Erro inesperado ao solicitar consulta imediata'
      };
    }
  }

  /**
   * Fluxo de especialistas
   */
  async getSpecialtiesList(): Promise<{
    success: boolean;
    data?: SpecialtyData[];
    error?: string;
  }> {
    try {
      const result = await specialtyService.getActiveSpecialties();
      
      if (result.success) {
        // Filtrar especialidades básicas (excluir nutrição e psicologia)
        const filteredSpecialties = result.specialties?.filter(s => 
          !s.name.toLowerCase().includes('nutrição') &&
          !s.name.toLowerCase().includes('psicologia') &&
          !s.name.toLowerCase().includes('nutri') &&
          !s.name.toLowerCase().includes('psico')
        ) || [];

        return {
          success: true,
          data: filteredSpecialties
        };
      }

      return {
        success: false,
        error: result.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Erro ao carregar especialidades'
      };
    }
  }

  /**
   * Verifica encaminhamento para especialidade
   */
  async checkSpecialtyReferral(beneficiaryUuid: string, specialtyUuid: string): Promise<{
    success: boolean;
    hasReferral?: boolean;
    referral?: any;
    error?: string;
  }> {
    try {
      const result = await referralService.getReferralsByBeneficiary(beneficiaryUuid);
      
      if (result.success) {
        const referral = result.referrals?.find(r => 
          r.specialtyUuid === specialtyUuid && r.status === 'active'
        );

        return {
          success: true,
          hasReferral: !!referral,
          referral
        };
      }

      return {
        success: false,
        error: result.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Erro ao verificar encaminhamento'
      };
    }
  }

  /**
   * Obtém disponibilidade para especialidade
   */
  async getSpecialtyAvailability(
    beneficiaryUuid: string,
    specialtyUuid: string,
    dateInitial: string,
    dateFinal: string
  ): Promise<{
    success: boolean;
    data?: AvailabilitySlot[];
    error?: string;
  }> {
    try {
      const result = await availabilityService.getAvailability({
        specialtyUuid,
        dateInitial,
        dateFinal,
        beneficiaryUuid
      });

      if (result.success) {
        return {
          success: true,
          data: result.availability || []
        };
      }

      return {
        success: false,
        error: result.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Erro ao carregar disponibilidade'
      };
    }
  }

  /**
   * Agenda consulta com especialista
   */
  async scheduleSpecialistAppointment(
    beneficiaryUuid: string,
    availabilityUuid: string,
    specialtyUuid: string,
    referralUuid?: string
  ): Promise<{
    success: boolean;
    appointment?: AppointmentData;
    appointmentUrl?: string;
    message?: string;
    error?: string;
  }> {
    try {
      const result = await appointmentService.scheduleSpecialistAppointment(
        beneficiaryUuid,
        specialtyUuid,
        availabilityUuid,
        referralUuid
      );

      if (result.success) {
        return {
          success: true,
          appointment: result.appointment,
          appointmentUrl: result.appointmentUrl,
          message: 'Agendamento realizado com sucesso!'
        };
      }

      return {
        success: false,
        error: result.error
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Erro ao agendar consulta'
      };
    }
  }

  /**
   * Fluxo de psicologia
   */
  async startPsychologyFlow(
    beneficiaryUuid: string,
    dateInitial: string,
    dateFinal: string
  ): Promise<{
    success: boolean;
    data?: {
      specialty?: SpecialtyData;
      availability?: AvailabilitySlot[];
      needsGeneralPractitioner?: boolean;
    };
    error?: string;
  }> {
    try {
      // Buscar especialidade de psicologia
      const specialtiesResult = await specialtyService.getActiveSpecialties();
      
      if (!specialtiesResult.success) {
        return {
          success: false,
          error: specialtiesResult.error
        };
      }

      const psychologySpecialty = specialtiesResult.specialties?.find(s => 
        s.name.toLowerCase().includes('psicolog') || 
        s.name.toLowerCase().includes('psico')
      );

      if (!psychologySpecialty) {
        return {
          success: false,
          error: 'Especialidade de Psicologia não encontrada'
        };
      }

      // Buscar disponibilidade
      const availabilityResult = await availabilityService.getAvailability({
        specialtyUuid: psychologySpecialty.uuid,
        dateInitial,
        dateFinal,
        beneficiaryUuid
      });

      return {
        success: true,
        data: {
          specialty: psychologySpecialty,
          availability: availabilityResult.availability || [],
          needsGeneralPractitioner: false // Psicologia geralmente não precisa de encaminhamento
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Erro no fluxo de psicologia'
      };
    }
  }

  /**
   * Fluxo de nutrição
   */
  async startNutritionistFlow(
    beneficiaryUuid: string,
    dateInitial: string,
    dateFinal: string
  ): Promise<{
    success: boolean;
    data?: {
      specialty?: SpecialtyData;
      availability?: AvailabilitySlot[];
      needsGeneralPractitioner?: boolean;
    };
    error?: string;
  }> {
    try {
      // Buscar especialidade de nutrição
      const specialtiesResult = await specialtyService.getActiveSpecialties();
      
      if (!specialtiesResult.success) {
        return {
          success: false,
          error: specialtiesResult.error
        };
      }

      const nutritionSpecialty = specialtiesResult.specialties?.find(s => 
        s.name.toLowerCase().includes('nutri') || 
        s.name.toLowerCase().includes('nutrição')
      );

      if (!nutritionSpecialty) {
        return {
          success: false,
          error: 'Especialidade de Nutrição não encontrada'
        };
      }

      // Buscar disponibilidade
      const availabilityResult = await availabilityService.getAvailability({
        specialtyUuid: nutritionSpecialty.uuid,
        dateInitial,
        dateFinal,
        beneficiaryUuid
      });

      return {
        success: true,
        data: {
          specialty: nutritionSpecialty,
          availability: availabilityResult.availability || [],
          needsGeneralPractitioner: true // Nutrição pode precisar de avaliação prévia
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Erro no fluxo de nutrição'
      };
    }
  }

  /**
   * Confirma agendamento de psicologia
   */
  async confirmPsychologyAppointment(
    beneficiaryUuid: string,
    availabilityUuid: string,
    specialtyUuid: string,
    referralUuid?: string
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    return this.scheduleSpecialistAppointment(
      beneficiaryUuid,
      availabilityUuid,
      specialtyUuid,
      referralUuid
    );
  }

  /**
   * Confirma agendamento de nutrição
   */
  async confirmNutritionistAppointment(
    beneficiaryUuid: string,
    availabilityUuid: string,
    specialtyUuid: string,
    referralUuid?: string
  ): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    return this.scheduleSpecialistAppointment(
      beneficiaryUuid,
      availabilityUuid,
      specialtyUuid,
      referralUuid
    );
  }

  private formatDateToBrazilian(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

// Instância singleton
export const consultationFlowService = new ConsultationFlowService();

// Exportar métodos individuais para compatibilidade
export const {
  getDefaultDateRange,
  startImmediateDoctorFlow,
  getSpecialtiesList,
  checkSpecialtyReferral,
  getSpecialtyAvailability,
  scheduleSpecialistAppointment,
  startPsychologyFlow,
  startNutritionistFlow,
  confirmPsychologyAppointment,
  confirmNutritionistAppointment
} = consultationFlowService;