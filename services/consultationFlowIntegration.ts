/**
 * Integração dos Fluxos de Consulta Aprimorados
 * 
 * Este serviço integra os novos fluxos aprimorados com o app atual,
 * fornecendo uma API unificada para todas as funcionalidades de consulta.
 */

import {
  startImmediateConsultationEnhanced,
  scheduleSpecialistAppointmentEnhanced,
  cancelAppointmentEnhanced,
  listSpecialtiesEnhanced,
  checkAvailableSchedulesEnhanced,
  ConsultationResult,
} from './consultationFlowEnhanced';
import { 
  sendAppointmentConfirmation,
  scheduleAppointmentReminder,
  sendCancellationNotification 
} from './notifications';
import { 
  sendAppointmentConfirmationEmail,
  sendCancellationEmail 
} from './email';

export interface IntegratedConsultationService {
  requestDoctorNow: (
    beneficiaryUuid: string,
    beneficiaryName: string,
    beneficiaryEmail: string
  ) => Promise<ConsultationResult>;
  
  scheduleSpecialist: (
    beneficiaryUuid: string,
    beneficiaryName: string,
    beneficiaryEmail: string,
    specialtyUuid: string,
    specialtyName: string,
    professionalUuid: string,
    scheduleUuid: string,
    appointmentDate: Date,
    referralUuid?: string
  ) => Promise<ConsultationResult>;
  
  cancelAppointment: (
    beneficiaryUuid: string,
    beneficiaryName: string,
    beneficiaryEmail: string,
    appointmentUuid: string,
    specialtyName: string,
    appointmentDate: Date,
    confirmed?: boolean
  ) => Promise<ConsultationResult>;
  
  listActiveSpecialties: () => Promise<ConsultationResult>;
  
  getAvailableSchedules: (
    specialtyUuid: string,
    specialtyName: string
  ) => Promise<ConsultationResult>;
}

/**
 * Serviço integrado de consultas
 */
export const IntegratedConsultationService: IntegratedConsultationService = {
  
  /**
   * Solicitar médico imediato com feedback completo
   */
  async requestDoctorNow(
    beneficiaryUuid: string,
    beneficiaryName: string,
    beneficiaryEmail: string
  ): Promise<ConsultationResult> {
    return await startImmediateConsultationEnhanced(
      beneficiaryUuid,
      beneficiaryName,
      beneficiaryEmail
    );
  },

  /**
   * Agendar consulta com especialista
   */
  async scheduleSpecialist(
    beneficiaryUuid: string,
    beneficiaryName: string,
    beneficiaryEmail: string,
    specialtyUuid: string,
    specialtyName: string,
    professionalUuid: string,
    scheduleUuid: string,
    appointmentDate: Date,
    referralUuid?: string
  ): Promise<ConsultationResult> {
    return await scheduleSpecialistAppointmentEnhanced(
      beneficiaryUuid,
      beneficiaryName,
      beneficiaryEmail,
      specialtyUuid,
      specialtyName,
      professionalUuid,
      scheduleUuid,
      appointmentDate,
      referralUuid
    );
  },

  /**
   * Cancelar consulta agendada
   */
  async cancelAppointment(
    beneficiaryUuid: string,
    beneficiaryName: string,
    beneficiaryEmail: string,
    appointmentUuid: string,
    specialtyName: string,
    appointmentDate: Date,
    confirmed: boolean = false
  ): Promise<ConsultationResult> {
    return await cancelAppointmentEnhanced(
      beneficiaryUuid,
      beneficiaryName,
      beneficiaryEmail,
      appointmentUuid,
      specialtyName,
      appointmentDate,
      confirmed
    );
  },

  /**
   * Listar especialidades ativas
   */
  async listActiveSpecialties(): Promise<ConsultationResult> {
    return await listSpecialtiesEnhanced();
  },

  /**
   * Verificar horários disponíveis para especialidade
   */
  async getAvailableSchedules(
    specialtyUuid: string,
    specialtyName: string
  ): Promise<ConsultationResult> {
    return await checkAvailableSchedulesEnhanced(specialtyUuid, specialtyName);
  },
};

/**
 * Função auxiliar para processar resultado de consulta
 * e exibir feedback apropriado
 */
export function processConsultationResult(
  result: ConsultationResult,
  onSuccess?: (data: any) => void,
  onError?: (error: string) => void,
  onConfirmationRequired?: (message: string, callback: () => void) => void
): void {
  if (result.success) {
    onSuccess?.(result.data);
  } else if (result.requiresConfirmation && result.confirmationMessage) {
    onConfirmationRequired?.(result.confirmationMessage, () => {
      // Callback para confirmação
    });
  } else {
    onError?.(result.error || result.message);
  }
}

/**
 * Hook personalizado para usar o serviço integrado
 */
export function useIntegratedConsultation() {
  const [loading, setLoading] = React.useState(false);

  const executeAction = async <T,>(
    action: () => Promise<T>,
    onSuccess?: (result: T) => void,
    onError?: (error: string) => void
  ): Promise<T | null> => {
    setLoading(true);
    try {
      const result = await action();
      onSuccess?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Erro inesperado';
      onError?.(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    service: IntegratedConsultationService,
    executeAction,
  };
}