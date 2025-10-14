/**
 * Fluxos de Consulta Aprimorados - AiLun Saúde
 * 
 * Versão melhorada com:
 * - Tratamento de erros robusto
 * - Feedback detalhado para o usuário
 * - Confirmações antes de ações críticas
 * - Integração com notificações e emails
 * - Logs de auditoria
 */

import { RapidocService } from './rapidoc';
import {
  sendAppointmentConfirmation,
  scheduleAppointmentReminder,
  sendCancellationNotification,
  sendReferralNotification,
} from './notifications';
import {
  sendAppointmentConfirmationEmail,
  sendCancellationEmail,
} from './email';
import { supabase } from './supabase';

export interface ConsultationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface UserFeedback {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    url?: string;
    callback?: () => void;
  };
}

/**
 * Salvar log de consulta no banco de dados
 */
async function saveConsultationLog(
  beneficiaryUuid: string,
  serviceType: string,
  specialty: string | null,
  status: string,
  data: any
): Promise<void> {
  try {
    await supabase.from('consultation_logs').insert({
      beneficiary_uuid: beneficiaryUuid,
      service_type: serviceType,
      specialty,
      status,
      consultation_url: data.consultationUrl || null,
      appointment_uuid: data.appointmentUuid || null,
      scheduled_date: data.scheduledDate || null,
      metadata: data,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao salvar log de consulta:', error);
  }
}

/**
 * Fluxo: Médico Imediato
 * Aprimorado com confirmação e feedback
 */
export async function startImmediateConsultationEnhanced(
  beneficiaryUuid: string,
  beneficiaryName: string,
  beneficiaryEmail: string
): Promise<ConsultationResult> {
  try {
    // 1. Chamar API da RapiDoc
    const result = await RapidocService.requestImmediateConsultation(beneficiaryUuid);

    if (!result.success) {
      return {
        success: false,
        message: 'Não foi possível iniciar a consulta',
        error: result.error || 'Erro desconhecido',
      };
    }

    const consultationUrl = result.data?.consultationUrl;

    if (!consultationUrl) {
      return {
        success: false,
        message: 'Link da consulta não foi gerado',
        error: 'URL não retornada pela API',
      };
    }

    // 2. Salvar log
    await saveConsultationLog(beneficiaryUuid, 'immediate', null, 'active', {
      consultationUrl,
    });

    // 3. Enviar notificação
    await sendAppointmentConfirmation(
      beneficiaryUuid,
      beneficiaryName,
      new Date(),
      'Médico Imediato',
      'immediate-' + Date.now()
    );

    // 4. Retornar sucesso com feedback
    return {
      success: true,
      message: 'Consulta iniciada com sucesso!',
      data: {
        consultationUrl,
        feedback: {
          type: 'success',
          title: '✅ Consulta Iniciada!',
          message: `Olá ${beneficiaryName}, sua consulta com o médico está pronta. Clique no botão abaixo para entrar na sala de atendimento.`,
          action: {
            label: 'Entrar na Consulta',
            url: consultationUrl,
          },
        } as UserFeedback,
      },
    };
  } catch (error: any) {
    console.error('Erro no fluxo de médico imediato:', error);
    return {
      success: false,
      message: 'Erro ao processar sua solicitação',
      error: error.message,
    };
  }
}

/**
 * Fluxo: Agendar Especialista
 * Aprimorado com validações e confirmações
 */
export async function scheduleSpecialistAppointmentEnhanced(
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
  try {
    // 1. Validar se tem encaminhamento (se necessário)
    if (!referralUuid) {
      const referralCheck = await RapidocService.checkReferral(beneficiaryUuid, specialtyUuid);
      
      if (!referralCheck.success || !referralCheck.data?.hasReferral) {
        return {
          success: false,
          message: 'Encaminhamento necessário',
          requiresConfirmation: true,
          confirmationMessage: `Para agendar ${specialtyName}, você precisa de um encaminhamento médico. Deseja agendar uma consulta com o clínico geral primeiro?`,
          data: {
            feedback: {
              type: 'warning',
              title: '⚠️ Encaminhamento Necessário',
              message: `Para consultar com ${specialtyName}, você precisa passar pelo clínico geral primeiro para obter um encaminhamento.`,
              action: {
                label: 'Agendar Clínico Geral',
                callback: () => {
                  // Navegar para agendamento de clínico geral
                },
              },
            } as UserFeedback,
          },
        };
      }

      referralUuid = referralCheck.data.referralUuid;
    }

    // 2. Confirmar agendamento
    const result = await RapidocService.scheduleAppointment(
      beneficiaryUuid,
      specialtyUuid,
      professionalUuid,
      scheduleUuid,
      referralUuid
    );

    if (!result.success) {
      return {
        success: false,
        message: 'Não foi possível agendar a consulta',
        error: result.error || 'Erro ao agendar',
      };
    }

    const appointmentUuid = result.data?.appointmentUuid;

    // 3. Salvar log
    await saveConsultationLog(beneficiaryUuid, 'specialist', specialtyName, 'scheduled', {
      appointmentUuid,
      scheduledDate: appointmentDate.toISOString(),
      specialtyUuid,
      professionalUuid,
      referralUuid,
    });

    // 4. Enviar notificação
    await sendAppointmentConfirmation(
      beneficiaryUuid,
      beneficiaryName,
      appointmentDate,
      specialtyName,
      appointmentUuid
    );

    // 5. Agendar lembrete (30 min antes)
    await scheduleAppointmentReminder(
      beneficiaryUuid,
      beneficiaryName,
      appointmentDate,
      specialtyName,
      appointmentUuid
    );

    // 6. Enviar email de confirmação
    await sendAppointmentConfirmationEmail(
      beneficiaryEmail,
      beneficiaryName,
      specialtyName,
      appointmentDate,
      appointmentUuid
    );

    // 7. Retornar sucesso
    return {
      success: true,
      message: 'Consulta agendada com sucesso!',
      data: {
        appointmentUuid,
        appointmentDate,
        feedback: {
          type: 'success',
          title: '✅ Consulta Agendada!',
          message: `Sua consulta de ${specialtyName} foi agendada para ${appointmentDate.toLocaleString('pt-BR')}. Você receberá um lembrete 30 minutos antes.`,
          action: {
            label: 'Ver Minhas Consultas',
          },
        } as UserFeedback,
      },
    };
  } catch (error: any) {
    console.error('Erro no fluxo de agendamento:', error);
    return {
      success: false,
      message: 'Erro ao processar agendamento',
      error: error.message,
    };
  }
}

/**
 * Fluxo: Cancelar Consulta
 * Com confirmação obrigatória
 */
export async function cancelAppointmentEnhanced(
  beneficiaryUuid: string,
  beneficiaryName: string,
  beneficiaryEmail: string,
  appointmentUuid: string,
  specialtyName: string,
  appointmentDate: Date,
  confirmed: boolean = false
): Promise<ConsultationResult> {
  try {
    // 1. Solicitar confirmação se não foi confirmado
    if (!confirmed) {
      return {
        success: false,
        requiresConfirmation: true,
        confirmationMessage: `Tem certeza que deseja cancelar sua consulta de ${specialtyName} agendada para ${appointmentDate.toLocaleString('pt-BR')}?`,
        message: 'Confirmação necessária',
      };
    }

    // 2. Cancelar na RapiDoc
    const result = await RapidocService.cancelAppointment(appointmentUuid);

    if (!result.success) {
      return {
        success: false,
        message: 'Não foi possível cancelar a consulta',
        error: result.error || 'Erro ao cancelar',
      };
    }

    // 3. Atualizar log
    await supabase
      .from('consultation_logs')
      .update({ status: 'cancelled' })
      .eq('appointment_uuid', appointmentUuid);

    // 4. Cancelar lembrete agendado
    // (buscar notification_id no banco e cancelar)

    // 5. Enviar notificação de cancelamento
    await sendCancellationNotification(
      beneficiaryUuid,
      beneficiaryName,
      specialtyName,
      appointmentDate
    );

    // 6. Enviar email de cancelamento
    await sendCancellationEmail(
      beneficiaryEmail,
      beneficiaryName,
      specialtyName,
      appointmentDate
    );

    // 7. Retornar sucesso
    return {
      success: true,
      message: 'Consulta cancelada com sucesso',
      data: {
        feedback: {
          type: 'info',
          title: '✅ Consulta Cancelada',
          message: `Sua consulta de ${specialtyName} foi cancelada. Você pode agendar uma nova consulta a qualquer momento.`,
          action: {
            label: 'Agendar Nova Consulta',
          },
        } as UserFeedback,
      },
    };
  } catch (error: any) {
    console.error('Erro ao cancelar consulta:', error);
    return {
      success: false,
      message: 'Erro ao cancelar consulta',
      error: error.message,
    };
  }
}

/**
 * Fluxo: Listar Especialidades
 * Com tratamento de erros e feedback
 */
export async function listSpecialtiesEnhanced(): Promise<ConsultationResult> {
  try {
    const result = await RapidocService.listSpecialties();

    if (!result.success) {
      return {
        success: false,
        message: 'Não foi possível carregar as especialidades',
        error: result.error || 'Erro ao buscar especialidades',
      };
    }

    // Filtrar nutrição (tem botão separado)
    const specialties = (result.data || []).filter(
      (s: any) => !s.name.toLowerCase().includes('nutri')
    );

    return {
      success: true,
      message: 'Especialidades carregadas',
      data: {
        specialties,
        count: specialties.length,
      },
    };
  } catch (error: any) {
    console.error('Erro ao listar especialidades:', error);
    return {
      success: false,
      message: 'Erro ao carregar especialidades',
      error: error.message,
    };
  }
}

/**
 * Fluxo: Verificar Horários Disponíveis
 * Com validação e feedback
 */
export async function checkAvailableSchedulesEnhanced(
  specialtyUuid: string,
  specialtyName: string
): Promise<ConsultationResult> {
  try {
    const result = await RapidocService.getAvailableSchedules(specialtyUuid);

    if (!result.success) {
      return {
        success: false,
        message: 'Não foi possível carregar os horários',
        error: result.error || 'Erro ao buscar horários',
      };
    }

    const schedules = result.data || [];

    if (schedules.length === 0) {
      return {
        success: true,
        message: 'Nenhum horário disponível no momento',
        data: {
          schedules: [],
          feedback: {
            type: 'warning',
            title: '⚠️ Sem Horários Disponíveis',
            message: `Não há horários disponíveis para ${specialtyName} no momento. Tente novamente mais tarde ou escolha outra especialidade.`,
          } as UserFeedback,
        },
      };
    }

    return {
      success: true,
      message: `${schedules.length} horários disponíveis`,
      data: {
        schedules,
        count: schedules.length,
      },
    };
  } catch (error: any) {
    console.error('Erro ao verificar horários:', error);
    return {
      success: false,
      message: 'Erro ao carregar horários',
      error: error.message,
    };
  }
}

/**
 * Criar feedback personalizado para o usuário
 */
export function createUserFeedback(
  type: UserFeedback['type'],
  title: string,
  message: string,
  actionLabel?: string,
  actionCallback?: () => void
): UserFeedback {
  return {
    type,
    title,
    message,
    action: actionLabel
      ? {
          label: actionLabel,
          callback: actionCallback,
        }
      : undefined,
  };
}

/**
 * Validar dados antes de agendar
 */
export function validateAppointmentData(
  beneficiaryUuid: string,
  specialtyUuid: string,
  scheduleUuid: string,
  appointmentDate: Date
): { valid: boolean; error?: string } {
  if (!beneficiaryUuid || beneficiaryUuid.trim() === '') {
    return { valid: false, error: 'Beneficiário não identificado' };
  }

  if (!specialtyUuid || specialtyUuid.trim() === '') {
    return { valid: false, error: 'Especialidade não selecionada' };
  }

  if (!scheduleUuid || scheduleUuid.trim() === '') {
    return { valid: false, error: 'Horário não selecionado' };
  }

  if (appointmentDate <= new Date()) {
    return { valid: false, error: 'Data da consulta deve ser futura' };
  }

  return { valid: true };
}

