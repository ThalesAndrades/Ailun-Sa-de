import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '../services/appointment-service';
import { AppointmentData } from '../types/rapidoc-types';

export interface UseAppointmentsReturn {
  appointments: AppointmentData[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  refreshAppointments: () => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  scheduleSpecialistAppointment: (
    beneficiaryUuid: string,
    specialtyUuid: string,
    availabilityUuid: string,
    referralUuid?: string
  ) => Promise<{ success: boolean; appointmentUrl?: string; error?: string }>;
}

export function useAppointments(beneficiaryUuid?: string): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!beneficiaryUuid) return;

    setLoading(true);
    setError(null);

    try {
      const result = await appointmentService.getAppointmentsByBeneficiary(beneficiaryUuid);
      
      if (result.success) {
        setAppointments(result.appointments || []);
      } else {
        setError(result.error || 'Erro ao carregar agendamentos');
      }
    } catch (err: any) {
      setError('Erro inesperado ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, [beneficiaryUuid]);

  const refreshAppointments = useCallback(async () => {
    if (!beneficiaryUuid) return;

    setRefreshing(true);
    setError(null);

    try {
      const result = await appointmentService.getAppointmentsByBeneficiary(beneficiaryUuid);
      
      if (result.success) {
        setAppointments(result.appointments || []);
      } else {
        setError(result.error || 'Erro ao atualizar agendamentos');
      }
    } catch (err: any) {
      setError('Erro inesperado ao atualizar agendamentos');
    } finally {
      setRefreshing(false);
    }
  }, [beneficiaryUuid]);

  const cancelAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    try {
      const result = await appointmentService.cancelAppointment(appointmentId);
      
      if (result.success) {
        // Atualizar lista local
        setAppointments(prev => prev.map(apt => 
          apt.uuid === appointmentId 
            ? { ...apt, status: 'cancelled' as const }
            : apt
        ));
        return true;
      } else {
        setError(result.error || 'Erro ao cancelar agendamento');
        return false;
      }
    } catch (err: any) {
      setError('Erro inesperado ao cancelar agendamento');
      return false;
    }
  }, []);

  const scheduleSpecialistAppointment = useCallback(async (
    beneficiaryUuid: string,
    specialtyUuid: string,
    availabilityUuid: string,
    referralUuid?: string
  ) => {
    try {
      const result = await appointmentService.scheduleSpecialistAppointment(
        beneficiaryUuid,
        specialtyUuid,
        availabilityUuid,
        referralUuid
      );

      if (result.success) {
        // Adicionar novo agendamento à lista local
        if (result.appointment) {
          setAppointments(prev => [result.appointment!, ...prev]);
        }
      }

      return result;
    } catch (err: any) {
      return {
        success: false,
        error: 'Erro inesperado ao agendar consulta'
      };
    }
  }, []);

  // Buscar agendamentos quando beneficiaryUuid muda
  useEffect(() => {
    if (beneficiaryUuid) {
      fetchAppointments();
    }
  }, [beneficiaryUuid, fetchAppointments]);

  return {
    appointments,
    loading,
    refreshing,
    error,
    fetchAppointments,
    refreshAppointments,
    cancelAppointment,
    scheduleSpecialistAppointment
  };
}