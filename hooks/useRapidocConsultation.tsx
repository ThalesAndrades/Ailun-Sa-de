import { useState, useCallback } from 'react';
import { useCPFAuth } from './useCPFAuth';
import { useBeneficiaryPlan } from './useBeneficiaryPlan';
import { RAPIDOC_CONFIG } from '../config/rapidoc.config';

export interface ConsultationRequest {
  serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition';
  specialty?: string;
  urgency?: 'immediate' | 'scheduled';
  preferredTime?: string;
  notes?: string;
}

export interface ConsultationResponse {
  success: boolean;
  sessionId?: string;
  consultationUrl?: string;
  message?: string;
  error?: string;
}

export function useRapidocConsultation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { beneficiaryUuid, user } = useCPFAuth();
  const { canUse, incrementUsage } = useBeneficiaryPlan(beneficiaryUuid);

  const requestConsultation = useCallback(async (
    request: ConsultationRequest
  ): Promise<ConsultationResponse> => {
    if (!beneficiaryUuid || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado'
      };
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar se pode usar o serviço
      const serviceCheck = await canUse(request.serviceType);
      if (!serviceCheck.canUse) {
        return {
          success: false,
          error: serviceCheck.reason || 'Serviço não disponível'
        };
      }

      // Fazer solicitação para RapiDoc
      const response = await fetch(`${RAPIDOC_CONFIG.baseUrl}consultations/request`, {
        method: 'POST',
        headers: RAPIDOC_CONFIG.headers,
        body: JSON.stringify({
          beneficiaryUuid,
          serviceType: request.serviceType,
          specialty: request.specialty,
          urgency: request.urgency || 'immediate',
          preferredTime: request.preferredTime,
          notes: request.notes,
          beneficiaryData: {
            name: user.name,
            cpf: user.cpf,
            email: user.email,
            phone: user.phone,
          }
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erro ao solicitar consulta');
      }

      // Se for serviço limitado (psicologia/nutrição), incrementar uso
      if (request.serviceType === 'psychology' || request.serviceType === 'nutrition') {
        await incrementUsage(request.serviceType);
      }

      return {
        success: true,
        sessionId: data.sessionId,
        consultationUrl: data.consultationUrl,
        message: data.message || 'Consulta solicitada com sucesso',
      };

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao solicitar consulta';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, [beneficiaryUuid, user, canUse, incrementUsage]);

  const requestImmediate = useCallback(async (
    serviceType: 'clinical' = 'clinical',
    notes?: string
  ): Promise<ConsultationResponse> => {
    return requestConsultation({
      serviceType,
      urgency: 'immediate',
      notes,
    });
  }, [requestConsultation]);

  const scheduleConsultation = useCallback(async (
    serviceType: 'specialist' | 'psychology' | 'nutrition',
    specialty: string,
    preferredTime: string,
    notes?: string
  ): Promise<ConsultationResponse> => {
    return requestConsultation({
      serviceType,
      specialty,
      urgency: 'scheduled',
      preferredTime,
      notes,
    });
  }, [requestConsultation]);

  return {
    loading,
    error,
    requestConsultation,
    requestImmediate,
    scheduleConsultation,
  };
}