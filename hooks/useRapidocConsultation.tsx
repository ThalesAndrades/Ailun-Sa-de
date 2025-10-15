/**
 * Hook para Consultas RapiDoc - Alinhado com Documentação Oficial
 * Gerencia estado de consultas e integrações com RapiDoc API
 */

import { useState, useCallback, useEffect } from 'react';
import { rapidocConsultationService } from '../services/rapidoc-consultation-service';
import type {
  ConsultationRequest,
  ScheduleRequest,
  ConsultationResult,
  AvailabilityResult
} from '../services/rapidoc-consultation-service';
import type {
  RapidocBeneficiary,
  RapidocSpecialty,
  RapidocAvailability,
  RapidocAppointment,
  RapidocMedicalReferral
} from '../services/rapidoc';
import { showTemplateMessage } from '../utils/alertHelpers';
import { ErrorMessages, SuccessMessages } from '../constants/ErrorMessages';

interface UseRapidocConsultationReturn {
  // Estado geral
  loading: boolean;
  error: string | null;
  
  // Dados
  specialties: RapidocSpecialty[];
  appointments: RapidocAppointment[];
  medicalReferrals: RapidocMedicalReferral[];
  availableSlots: RapidocAvailability[];
  
  // Ações de consulta
  requestImmediate: (beneficiaryUuid: string) => Promise<ConsultationResult>;
  scheduleAppointment: (request: ScheduleRequest) => Promise<ConsultationResult>;
  cancelAppointment: (appointmentUuid: string) => Promise<boolean>;
  
  // Ações de dados
  loadSpecialties: () => Promise<void>;
  loadAvailability: (specialtyUuid: string, beneficiaryUuid: string, dateRange?: { start: Date; end: Date }) => Promise<void>;
  loadAppointments: (beneficiaryUuid: string) => Promise<void>;
  loadMedicalReferrals: (beneficiaryUuid: string) => Promise<void>;
  
  // Utilitários
  getSpecialtyByType: (type: 'psychology' | 'nutrition') => Promise<RapidocSpecialty | null>;
  clearData: () => void;
  refreshAll: (beneficiaryUuid?: string) => Promise<void>;
  
  // Estado da integração
  healthStatus: {
    status: 'healthy' | 'degraded' | 'down';
    message: string;
    lastCheck?: Date;
  };
  checkIntegrationHealth: () => Promise<void>;
}

export function useRapidocConsultation(): UseRapidocConsultationReturn {
  // Estado principal
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dados
  const [specialties, setSpecialties] = useState<RapidocSpecialty[]>([]);
  const [appointments, setAppointments] = useState<RapidocAppointment[]>([]);
  const [medicalReferrals, setMedicalReferrals] = useState<RapidocMedicalReferral[]>([]);
  const [availableSlots, setAvailableSlots] = useState<RapidocAvailability[]>([]);
  
  // Estado da integração
  const [healthStatus, setHealthStatus] = useState<{
    status: 'healthy' | 'degraded' | 'down';
    message: string;
    lastCheck?: Date;
  }>({ 
    status: 'healthy', 
    message: 'RapiDoc disponível' 
  });

  // Limpar erro automaticamente após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Verificar saúde da integração na inicialização
  useEffect(() => {
    checkIntegrationHealth();
  }, []);

  /**
   * Solicitar consulta imediata (clínico geral)
   */
  const requestImmediate = useCallback(async (beneficiaryUuid: string): Promise<ConsultationResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await rapidocConsultationService.requestImmediateConsultation(beneficiaryUuid);
      
      if (result.success) {
        showTemplateMessage({
          title: '🎥 Consulta Solicitada',
          message: 'Conectando você ao médico...',
          type: 'success'
        });
      } else {
        setError(result.error || 'Falha na solicitação de consulta');
        showTemplateMessage({
          title: '⚠️ Consulta Indisponível',
          message: result.error || ErrorMessages.CONSULTATION.REQUEST_FAILED,
          type: 'warning'
        });
      }
      
      return result;
      
    } catch (error: any) {
      const errorMessage = 'Erro na comunicação com o servidor';
      setError(errorMessage);
      showTemplateMessage({
        title: '❌ Erro na Solicitação',
        message: errorMessage,
        type: 'error'
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Agendar consulta com especialista
   */
  const scheduleAppointment = useCallback(async (request: ScheduleRequest): Promise<ConsultationResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await rapidocConsultationService.scheduleAppointment(request);
      
      if (result.success) {
        showTemplateMessage({
          title: '✅ Consulta Agendada',
          message: 'Seu agendamento foi confirmado!',
          type: 'success'
        });
        
        // Recarregar agendamentos
        await loadAppointments(request.beneficiaryUuid);
      } else {
        setError(result.error || 'Falha no agendamento');
        showTemplateMessage({
          title: '⚠️ Falha no Agendamento',
          message: result.error || ErrorMessages.CONSULTATION.SCHEDULE_FAILED,
          type: 'warning'
        });
      }
      
      return result;
      
    } catch (error: any) {
      const errorMessage = 'Erro no agendamento da consulta';
      setError(errorMessage);
      showTemplateMessage({
        title: '❌ Erro no Agendamento',
        message: errorMessage,
        type: 'error'
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancelar agendamento
   */
  const cancelAppointment = useCallback(async (appointmentUuid: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await rapidocConsultationService.cancelAppointment(appointmentUuid);
      
      if (result.success) {
        showTemplateMessage({
          title: '❌ Consulta Cancelada',
          message: 'Seu agendamento foi cancelado.',
          type: 'info'
        });
        
        // Remover agendamento da lista local
        setAppointments(prev => prev.filter(apt => apt.uuid !== appointmentUuid));
        
        return true;
      } else {
        setError(result.error || 'Falha no cancelamento');
        showTemplateMessage({
          title: '⚠️ Falha no Cancelamento',
          message: result.error || 'Não foi possível cancelar o agendamento',
          type: 'warning'
        });
        
        return false;
      }
      
    } catch (error: any) {
      const errorMessage = 'Erro no cancelamento';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carregar especialidades
   */
  const loadSpecialties = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await rapidocConsultationService.getSpecialties();
      
      if (result.success) {
        setSpecialties(result.specialties);
      } else {
        setError(result.error || 'Falha ao carregar especialidades');
      }
      
    } catch (error: any) {
      setError('Erro ao carregar especialidades');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carregar disponibilidade de especialidade
   */
  const loadAvailability = useCallback(async (
    specialtyUuid: string,
    beneficiaryUuid: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await rapidocConsultationService.getSpecialtyAvailability(
        specialtyUuid,
        beneficiaryUuid,
        dateRange
      );
      
      if (result.success) {
        setAvailableSlots(result.availableSlots);
      } else {
        setError(result.error || 'Falha ao carregar disponibilidade');
        setAvailableSlots([]);
      }
      
    } catch (error: any) {
      setError('Erro ao carregar disponibilidade');
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carregar agendamentos do beneficiário
   */
  const loadAppointments = useCallback(async (beneficiaryUuid: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await rapidocConsultationService.getBeneficiaryAppointments(beneficiaryUuid);
      
      if (result.success) {
        setAppointments(result.appointments);
      } else {
        setError(result.error || 'Falha ao carregar agendamentos');
        setAppointments([]);
      }
      
    } catch (error: any) {
      setError('Erro ao carregar agendamentos');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carregar encaminhamentos do beneficiário
   */
  const loadMedicalReferrals = useCallback(async (beneficiaryUuid: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await rapidocConsultationService.getBeneficiaryMedicalReferrals(beneficiaryUuid);
      
      if (result.success) {
        setMedicalReferrals(result.referrals);
      } else {
        setError(result.error || 'Falha ao carregar encaminhamentos');
        setMedicalReferrals([]);
      }
      
    } catch (error: any) {
      setError('Erro ao carregar encaminhamentos');
      setMedicalReferrals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar especialidade por tipo
   */
  const getSpecialtyByType = useCallback(async (type: 'psychology' | 'nutrition'): Promise<RapidocSpecialty | null> => {
    try {
      const result = await rapidocConsultationService.getSpecialtyByType(type);
      return result.success ? result.specialty || null : null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Limpar todos os dados
   */
  const clearData = useCallback(() => {
    setSpecialties([]);
    setAppointments([]);
    setMedicalReferrals([]);
    setAvailableSlots([]);
    setError(null);
  }, []);

  /**
   * Recarregar todos os dados
   */
  const refreshAll = useCallback(async (beneficiaryUuid?: string): Promise<void> => {
    setLoading(true);
    
    try {
      // Sempre carregar especialidades
      await loadSpecialties();
      
      // Se tiver beneficiário, carregar dados específicos
      if (beneficiaryUuid) {
        await Promise.all([
          loadAppointments(beneficiaryUuid),
          loadMedicalReferrals(beneficiaryUuid)
        ]);
      }
      
      // Verificar saúde da integração
      await checkIntegrationHealth();
      
    } catch (error: any) {
      setError('Erro ao recarregar dados');
    } finally {
      setLoading(false);
    }
  }, [loadSpecialties, loadAppointments, loadMedicalReferrals]);

  /**
   * Verificar saúde da integração
   */
  const checkIntegrationHealth = useCallback(async (): Promise<void> => {
    try {
      const health = await rapidocConsultationService.checkHealth();
      
      setHealthStatus({
        ...health,
        lastCheck: new Date()
      });
      
      // Se houve degradação, mostrar aviso
      if (health.status === 'degraded') {
        showTemplateMessage({
          title: '⚠️ Serviço Degradado',
          message: 'Alguns recursos podem estar limitados.',
          type: 'warning'
        });
      } else if (health.status === 'down') {
        showTemplateMessage({
          title: '❌ Serviço Indisponível',
          message: 'RapiDoc temporariamente indisponível.',
          type: 'error'
        });
      }
      
    } catch (error: any) {
      setHealthStatus({
        status: 'down',
        message: 'Erro na verificação de saúde',
        lastCheck: new Date()
      });
    }
  }, []);

  return {
    // Estado geral
    loading,
    error,
    
    // Dados
    specialties,
    appointments,
    medicalReferrals,
    availableSlots,
    
    // Ações de consulta
    requestImmediate,
    scheduleAppointment,
    cancelAppointment,
    
    // Ações de dados
    loadSpecialties,
    loadAvailability,
    loadAppointments,
    loadMedicalReferrals,
    
    // Utilitários
    getSpecialtyByType,
    clearData,
    refreshAll,
    
    // Estado da integração
    healthStatus,
    checkIntegrationHealth
  };
}

export type {
  ConsultationRequest,
  ScheduleRequest,
  ConsultationResult,
  AvailabilityResult
};