/**
 * Serviço de Integração com API Rapidoc - Consultas
 * Gerencia solicitações de consultas imediatas e agendamentos
 */

import axios from 'axios';
import { RAPIDOC_CONFIG } from '../config/rapidoc.config';

const rapidocApi = axios.create({
  baseURL: RAPIDOC_CONFIG.BASE_URL,
  headers: {
    'Content-Type': RAPIDOC_CONFIG.CONTENT_TYPE,
    'Authorization': `Bearer ${RAPIDOC_CONFIG.TOKEN}`,
    'clientId': RAPIDOC_CONFIG.CLIENT_ID,
  },
  timeout: 30000,
});

export interface ImmediateConsultationRequest {
  beneficiaryUuid: string;
  serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition';
  specialty?: string;
  symptoms?: string;
  urgency?: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface ImmediateConsultationResponse {
  success: boolean;
  sessionId?: string;
  consultationUrl?: string;
  estimatedWaitTime?: number; // em minutos
  queuePosition?: number;
  professionalInfo?: {
    name?: string;
    specialty?: string;
    crm?: string;
  };
  error?: string;
  errorCode?: string;
}

export interface ScheduleConsultationRequest {
  beneficiaryUuid: string;
  serviceType: 'specialist' | 'psychology' | 'nutrition';
  specialty?: string;
  preferredDate?: string; // ISO 8601
  preferredTime?: string; // HH:mm
  notes?: string;
}

export interface ScheduleConsultationResponse {
  success: boolean;
  appointmentId?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  professionalInfo?: {
    name?: string;
    specialty?: string;
  };
  confirmationSent?: boolean;
  error?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  professionalName?: string;
  specialty?: string;
}

export interface AvailableSlotsResponse {
  success: boolean;
  slots?: AvailableSlot[];
  error?: string;
}

/**
 * Solicitar consulta imediata (Médico Agora)
 */
export async function requestImmediateConsultation(
  request: ImmediateConsultationRequest
): Promise<ImmediateConsultationResponse> {
  try {
    console.log('[requestImmediateConsultation] Solicitando consulta imediata:', request);

    // Endpoint correto para solicitar atendimento imediato
    const response = await rapidocApi.get(`/beneficiaries/${request.beneficiaryUuid}/request-appointment`, {
    });

    console.log('[requestImmediateConsultation] Resposta da API:', response.data);

    return {
      success: true,
      sessionId: response.data.session_id,
      consultationUrl: response.data.consultation_url,
      estimatedWaitTime: response.data.estimated_wait_time || 5,
      queuePosition: response.data.queue_position,
      professionalInfo: response.data.professional_info,
    };
  } catch (error: any) {
    console.error('[requestImmediateConsultation] Erro:', error);

    if (error.response) {
      return {
        success: false,
        error: error.response.data.message || 'Erro ao solicitar consulta',
        errorCode: error.response.data.code,
      };
    }

    return {
      success: false,
      error: 'Erro de conexão com o servidor',
    };
  }
}

/**
 * Verificar status da consulta imediata
 */
export async function checkConsultationStatus(
  sessionId: string
): Promise<{
  success: boolean;
  status?: 'waiting' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
  consultationUrl?: string;
  estimatedWaitTime?: number;
  professionalInfo?: any;
  error?: string;
}> {
  try {
    console.log('[checkConsultationStatus] Verificando status da sessão:', sessionId);

    const response = await rapidocApi.get(`/consultations/immediate/${sessionId}/status`);

    console.log('[checkConsultationStatus] Status:', response.data);

    return {
      success: true,
      status: response.data.status,
      consultationUrl: response.data.consultation_url,
      estimatedWaitTime: response.data.estimated_wait_time,
      professionalInfo: response.data.professional_info,
    };
  } catch (error: any) {
    console.error('[checkConsultationStatus] Erro:', error);

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao verificar status',
    };
  }
}

/**
 * Cancelar consulta imediata
 */
export async function cancelImmediateConsultation(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[cancelImmediateConsultation] Cancelando sessão:', sessionId);

    await rapidocApi.post(`/consultations/immediate/${sessionId}/cancel`);

    console.log('[cancelImmediateConsultation] Consulta cancelada com sucesso');

    return { success: true };
  } catch (error: any) {
    console.error('[cancelImmediateConsultation] Erro:', error);

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao cancelar consulta',
    };
  }
}

/**
 * Buscar horários disponíveis para agendamento
 */
export async function getAvailableSlots(
  serviceType: 'specialist' | 'psychology' | 'nutrition',
  specialty?: string,
  startDate?: string
): Promise<AvailableSlotsResponse> {
  try {
    console.log('[getAvailableSlots] Buscando horários:', { serviceType, specialty, startDate });

    const params: any = {
      service_type: serviceType,
    };

    if (specialty) params.specialty = specialty;
    if (startDate) params.start_date = startDate;

    const response = await rapidocApi.get('/consultations/available-slots', { params });

    console.log('[getAvailableSlots] Horários encontrados:', response.data.slots?.length);

    return {
      success: true,
      slots: response.data.slots,
    };
  } catch (error: any) {
    console.error('[getAvailableSlots] Erro:', error);

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar horários',
    };
  }
}

/**
 * Agendar consulta
 */
export async function scheduleConsultation(
  request: ScheduleConsultationRequest
): Promise<ScheduleConsultationResponse> {
  try {
    console.log('[scheduleConsultation] Agendando consulta:', request);

    const response = await rapidocApi.post('/consultations/schedule', {
      beneficiary_uuid: request.beneficiaryUuid,
      service_type: request.serviceType,
      specialty: request.specialty,
      preferred_date: request.preferredDate,
      preferred_time: request.preferredTime,
      notes: request.notes,
    });

    console.log('[scheduleConsultation] Consulta agendada:', response.data);

    return {
      success: true,
      appointmentId: response.data.appointment_id,
      scheduledDate: response.data.scheduled_date,
      scheduledTime: response.data.scheduled_time,
      professionalInfo: response.data.professional_info,
      confirmationSent: response.data.confirmation_sent,
    };
  } catch (error: any) {
    console.error('[scheduleConsultation] Erro:', error);

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao agendar consulta',
    };
  }
}

/**
 * Buscar especialidades disponíveis
 */
export async function getAvailableSpecialties(): Promise<{
  success: boolean;
  specialties?: Array<{ id: string; name: string; category: string }>;
  error?: string;
}> {
  try {
    console.log('[getAvailableSpecialties] Buscando especialidades');

    const response = await rapidocApi.get('/consultations/specialties');

    console.log('[getAvailableSpecialties] Especialidades encontradas:', response.data.specialties?.length);

    return {
      success: true,
      specialties: response.data.specialties,
    };
  } catch (error: any) {
    console.error('[getAvailableSpecialties] Erro:', error);

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar especialidades',
    };
  }
}

/**
 * Finalizar consulta e enviar avaliação
 */
export async function completeConsultation(
  sessionId: string,
  rating: number,
  feedback?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[completeConsultation] Finalizando consulta:', sessionId);

    await rapidocApi.post(`/consultations/${sessionId}/complete`, {
      rating,
      feedback,
    });

    console.log('[completeConsultation] Consulta finalizada com sucesso');

    return { success: true };
  } catch (error: any) {
    console.error('[completeConsultation] Erro:', error);

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao finalizar consulta',
    };
  }
}

/**
 * Cancelar consulta (alias para cancelImmediateConsultation)
 */
export const cancelConsultation = cancelImmediateConsultation;

/**
 * Obter histórico de consultas do beneficiário
 */
export async function getConsultationHistory(
  beneficiaryUuid: string,
  limit: number = 10
): Promise<{
  success: boolean;
  consultations?: Array<any>;
  error?: string;
}> {
  try {
    console.log('[getConsultationHistory] Buscando histórico:', beneficiaryUuid);

    const response = await rapidocApi.get(`/consultations/history/${beneficiaryUuid}`, {
      params: { limit },
    });

    console.log('[getConsultationHistory] Consultas encontradas:', response.data.consultations?.length);

    return {
      success: true,
      consultations: response.data.consultations,
    };
  } catch (error: any) {
    console.error('[getConsultationHistory] Erro:', error);

    return {
      success: false,
      error: error.response?.data?.message || 'Erro ao buscar histórico',
    };
  }
}

