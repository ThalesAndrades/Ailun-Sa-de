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

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('[RapidocConsultation] Erro ao parsear JSON da resposta:', jsonError);
        throw new Error(`Erro de comunicação com a API Rapidoc: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        const apiErrorMessage = data.message || data.error || 'Erro desconhecido da API Rapidoc';
        console.error(`[RapidocConsultation] Erro da API (${response.status}):`, apiErrorMessage);
        throw new Error(`Erro da API Rapidoc: ${apiErrorMessage} (Código: ${response.status})`);
      }

      if (!data.success) {
        const apiErrorMessage = data.message || data.error || 'Operação não bem-sucedida na API Rapidoc';
        console.error('[RapidocConsultation] Operação não bem-sucedida:', apiErrorMessage);
        throw new Error(`Operação Rapidoc falhou: ${apiErrorMessage}`);
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
      console.error('[RapidocConsultation] Erro geral na solicitação de consulta:', err);
      const errorMessage = err.message || 'Ocorreu um erro inesperado ao solicitar a consulta.';
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