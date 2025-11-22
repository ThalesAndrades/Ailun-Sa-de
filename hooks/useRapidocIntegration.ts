/**
 * Hook para integração com RapiDoc
 * Gerencia todas as operações relacionadas à API RapiDoc via Edge Functions
 */

import { useState, useCallback } from 'react';
import * as RapidocService from '../services/rapidoc-integration';

export function useRapidocIntegration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==================== BENEFICIÁRIOS ====================

  const getBeneficiaryByCPF = useCallback(async (cpf: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await RapidocService.getBeneficiaryByCPF(cpf);
      
      if (!result.success) {
        setError(result.error || 'Erro ao buscar beneficiário');
        return null;
      }

      return result.data;
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestImmediateAppointment = useCallback(async (beneficiaryUuid: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await RapidocService.requestImmediateAppointment(beneficiaryUuid);
      
      if (!result.success) {
        setError(result.error || 'Erro ao solicitar atendimento');
        return null;
      }

      return result.data;
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== ESPECIALIDADES ====================

  const listSpecialties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await RapidocService.listSpecialties();
      
      if (!result.success) {
        setError(result.error || 'Erro ao listar especialidades');
        return [];
      }

      return result.data || [];
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPsychologySpecialty = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await RapidocService.getPsychologySpecialtyUuid();
      
      if (!result.success) {
        setError(result.error || 'Especialidade não encontrada');
        return null;
      }

      return result.data;
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNutritionSpecialty = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await RapidocService.getNutritionSpecialtyUuid();
      
      if (!result.success) {
        setError(result.error || 'Especialidade não encontrada');
        return null;
      }

      return result.data;
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== ENCAMINHAMENTOS ====================

  const checkReferral = useCallback(async (beneficiaryUuid: string, specialtyUuid: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await RapidocService.checkReferral(beneficiaryUuid, specialtyUuid);
      
      if (!result.success) {
        setError(result.error || 'Erro ao verificar encaminhamento');
        return { hasReferral: false, referral: null };
      }

      return result.data || { hasReferral: false, referral: null };
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      return { hasReferral: false, referral: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== DISPONIBILIDADE ====================

  const listAvailability = useCallback(
    async (
      specialtyUuid: string,
      dateInitial: string,
      dateFinal: string,
      beneficiaryUuid: string
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await RapidocService.listAvailability(
          specialtyUuid,
          dateInitial,
          dateFinal,
          beneficiaryUuid
        );
        
        if (!result.success) {
          setError(result.error || 'Erro ao listar disponibilidade');
          return [];
        }

        return result.data || [];
      } catch (err: any) {
        setError(err.message || 'Erro inesperado');
        return [];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ==================== AGENDAMENTOS ====================

  const scheduleAppointment = useCallback(
    async (params: {
      beneficiaryUuid: string;
      availabilityUuid: string;
      specialtyUuid: string;
      referralUuid?: string;
      approveAdditionalPayment?: boolean;
    }) => {
      setLoading(true);
      setError(null);

      try {
        const result = await RapidocService.scheduleAppointment(params);
        
        if (!result.success) {
          setError(result.error || 'Erro ao agendar consulta');
          return null;
        }

        return result.data;
      } catch (err: any) {
        setError(err.message || 'Erro inesperado');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const listAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await RapidocService.listAppointments();
      
      if (!result.success) {
        setError(result.error || 'Erro ao listar agendamentos');
        return [];
      }

      return result.data || [];
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelAppointment = useCallback(async (appointmentUuid: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await RapidocService.cancelAppointment(appointmentUuid);
      
      if (!result.success) {
        setError(result.error || 'Erro ao cancelar agendamento');
        return false;
      }

      return true;
    } catch (err: any) {
      setError(err.message || 'Erro inesperado');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Beneficiários
    getBeneficiaryByCPF,
    requestImmediateAppointment,
    // Especialidades
    listSpecialties,
    getPsychologySpecialty,
    getNutritionSpecialty,
    // Encaminhamentos
    checkReferral,
    // Disponibilidade
    listAvailability,
    // Agendamentos
    scheduleAppointment,
    listAppointments,
    cancelAppointment,
  };
}
