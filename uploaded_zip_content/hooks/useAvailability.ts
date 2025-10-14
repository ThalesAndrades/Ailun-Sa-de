import { useState, useCallback } from 'react';
import { availabilityService } from '../services/availability-service';
import { AvailabilitySlot, AvailabilityQuery } from '../types/rapidoc-types';

export interface UseAvailabilityReturn {
  availability: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
  getAvailability: (query: AvailabilityQuery) => Promise<void>;
  getAvailabilityForDate: (specialtyUuid: string, date: string, beneficiaryUuid: string) => Promise<void>;
  getNextAvailableSlots: (specialtyUuid: string, beneficiaryUuid: string, limit?: number) => Promise<void>;
  clearAvailability: () => void;
}

export function useAvailability(): UseAvailabilityReturn {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAvailability = useCallback(async (query: AvailabilityQuery) => {
    setLoading(true);
    setError(null);

    try {
      const result = await availabilityService.getAvailability(query);
      
      if (result.success) {
        setAvailability(result.availability || []);
      } else {
        setError(result.error || 'Erro ao carregar disponibilidade');
        setAvailability([]);
      }
    } catch (err: any) {
      setError('Erro inesperado ao carregar disponibilidade');
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAvailabilityForDate = useCallback(async (
    specialtyUuid: string,
    date: string,
    beneficiaryUuid: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await availabilityService.getAvailabilityForDate(specialtyUuid, date, beneficiaryUuid);
      
      if (result.success) {
        setAvailability(result.availability || []);
      } else {
        setError(result.error || 'Erro ao carregar disponibilidade');
        setAvailability([]);
      }
    } catch (err: any) {
      setError('Erro inesperado ao carregar disponibilidade');
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getNextAvailableSlots = useCallback(async (
    specialtyUuid: string,
    beneficiaryUuid: string,
    limit: number = 10
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await availabilityService.getNextAvailableSlots(specialtyUuid, beneficiaryUuid, limit);
      
      if (result.success) {
        setAvailability(result.availability || []);
      } else {
        setError(result.error || 'Erro ao carregar próximos horários');
        setAvailability([]);
      }
    } catch (err: any) {
      setError('Erro inesperado ao carregar próximos horários');
      setAvailability([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAvailability = useCallback(() => {
    setAvailability([]);
    setError(null);
  }, []);

  return {
    availability,
    loading,
    error,
    getAvailability,
    getAvailabilityForDate,
    getNextAvailableSlots,
    clearAvailability
  };
}