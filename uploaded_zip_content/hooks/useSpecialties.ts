import { useState, useEffect, useCallback } from 'react';
import { specialtyService } from '../services/specialty-service';
import { SpecialtyData } from '../types/rapidoc-types';

export interface UseSpecialtiesReturn {
  specialties: SpecialtyData[];
  activeSpecialties: SpecialtyData[];
  loading: boolean;
  error: string | null;
  fetchSpecialties: (forceRefresh?: boolean) => Promise<void>;
  searchSpecialties: (searchTerm: string) => Promise<SpecialtyData[]>;
  getSpecialtyByUuid: (uuid: string) => SpecialtyData | undefined;
  clearCache: () => void;
}

export function useSpecialties(): UseSpecialtiesReturn {
  const [specialties, setSpecialties] = useState<SpecialtyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = useCallback(async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const result = await specialtyService.getSpecialties(forceRefresh);
      
      if (result.success) {
        setSpecialties(result.specialties || []);
      } else {
        setError(result.error || 'Erro ao carregar especialidades');
      }
    } catch (err: any) {
      setError('Erro inesperado ao carregar especialidades');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchSpecialties = useCallback(async (searchTerm: string): Promise<SpecialtyData[]> => {
    try {
      const result = await specialtyService.searchSpecialtiesByName(searchTerm);
      return result.success ? result.specialties || [] : [];
    } catch (err) {
      return [];
    }
  }, []);

  const getSpecialtyByUuid = useCallback((uuid: string): SpecialtyData | undefined => {
    return specialties.find(s => s.uuid === uuid);
  }, [specialties]);

  const clearCache = useCallback(() => {
    specialtyService.clearCache();
  }, []);

  // Carregar especialidades na inicialização
  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  // Calcular especialidades ativas
  const activeSpecialties = specialties.filter(s => s.active);

  return {
    specialties,
    activeSpecialties,
    loading,
    error,
    fetchSpecialties,
    searchSpecialties,
    getSpecialtyByUuid,
    clearCache
  };
}