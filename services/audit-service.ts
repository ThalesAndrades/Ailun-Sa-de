/**
 * Serviço de Auditoria para AiLun Saúde
 * 
 * Este serviço fornece funcionalidades para registrar eventos críticos do sistema,
 * permitindo rastreamento, análise e conformidade com requisitos de auditoria.
 */

import { createClient } from '@supabase/supabase-js';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Tipos de eventos auditáveis
export enum AuditEventType {
  // Autenticação
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  
  // Registro
  SIGNUP_STARTED = 'signup_started',
  SIGNUP_COMPLETED = 'signup_completed',
  SIGNUP_FAILED = 'signup_failed',
  
  // Beneficiários
  BENEFICIARY_CREATED = 'beneficiary_created',
  BENEFICIARY_UPDATED = 'beneficiary_updated',
  
  // Planos
  PLAN_ASSIGNED = 'plan_assigned',
  PLAN_UPDATED = 'plan_updated',
  PLAN_CANCELLED = 'plan_cancelled',
  
  // Consultas
  CONSULTATION_REQUESTED = 'consultation_requested',
  CONSULTATION_SCHEDULED = 'consultation_scheduled',
  CONSULTATION_CANCELLED = 'consultation_cancelled',
  CONSULTATION_COMPLETED = 'consultation_completed',
  
  // Pagamentos
  PAYMENT_INITIATED = 'payment_initiated',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  
  // Perfil
  PROFILE_UPDATED = 'profile_updated',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  
  // Dados
  DATA_EXPORT_REQUESTED = 'data_export_requested',
  DATA_DELETED = 'data_deleted',
}

// Status do evento
export enum AuditEventStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

// Interface para dados do evento de auditoria
export interface AuditEventData {
  eventType: AuditEventType;
  userId?: string;
  userEmail?: string;
  status: AuditEventStatus;
  eventData?: Record<string, any>;
  errorMessage?: string;
  errorStack?: string;
  metadata?: Record<string, any>;
}

// Interface para log de auditoria
export interface AuditLog {
  id: string;
  event_type: string;
  user_id?: string;
  user_email?: string;
  event_data: Record<string, any>;
  status: string;
  error_message?: string;
  error_stack?: string;
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  platform?: string;
  created_at: string;
  metadata: Record<string, any>;
}

class AuditService {
  private supabase;
  private deviceInfo: any = null;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || \'\';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || \'\';


    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeDeviceInfo();
  }

  /**
   * Inicializa informações do dispositivo
   */
  private async initializeDeviceInfo() {
    try {
      this.deviceInfo = {
        deviceType: Device.deviceType ? Device.DeviceType[Device.deviceType] : 'Unknown',
        platform: Platform.OS,
        osVersion: Platform.Version,
        modelName: Device.modelName,
        brand: Device.brand,
      };
    } catch (error) {
      console.warn('[AuditService] Erro ao obter informações do dispositivo:', error);
      this.deviceInfo = {
        deviceType: 'Unknown',
        platform: Platform.OS,
      };
    }
  }

  /**
   * Registra um evento de auditoria
   */
  async logEvent(data: AuditEventData): Promise<{ success: boolean; error?: string }> {
    try {
      const logEntry = {
        event_type: data.eventType,
        user_id: data.userId || null,
        user_email: data.userEmail || null,
        event_data: data.eventData || {},
        status: data.status,
        error_message: data.errorMessage || null,
        error_stack: data.errorStack || null,
        device_type: this.deviceInfo?.deviceType || null,
        platform: this.deviceInfo?.platform || null,
        user_agent: this.getUserAgent(),
        metadata: {
          ...data.metadata,
          ...this.deviceInfo,
        },
      };

      const { error } = await this.supabase
        .from('audit_logs')
        .insert(logEntry);

      if (error) {
        console.error('[AuditService] Erro ao registrar evento:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('[AuditService] Erro inesperado ao registrar evento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Registra um evento de sucesso
   */
  async logSuccess(
    eventType: AuditEventType,
    userId?: string,
    eventData?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      eventType,
      userId,
      status: AuditEventStatus.SUCCESS,
      eventData,
    });
  }

  /**
   * Registra um evento de falha
   */
  async logFailure(
    eventType: AuditEventType,
    error: Error,
    userId?: string,
    eventData?: Record<string, any>
  ): Promise<void> {
    await this.logEvent({
      eventType,
      userId,
      status: AuditEventStatus.FAILURE,
      errorMessage: error.message,
      errorStack: error.stack,
      eventData,
    });
  }

  /**
   * Obtém logs de auditoria de um usuário
   */
  async getUserAuditTrail(userId: string, limit: number = 100): Promise<AuditLog[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_user_audit_trail', {
          p_user_id: userId,
          p_limit: limit,
        });

      if (error) {
        console.error('[AuditService] Erro ao obter trilha de auditoria:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[AuditService] Erro inesperado ao obter trilha de auditoria:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas de auditoria
   */
  async getAuditStatistics(
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_audit_statistics', {
          p_start_date: startDate?.toISOString() || null,
          p_end_date: endDate?.toISOString() || null,
        });

      if (error) {
        console.error('[AuditService] Erro ao obter estatísticas:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[AuditService] Erro inesperado ao obter estatísticas:', error);
      return [];
    }
  }

  /**
   * Obtém o User Agent
   */
  private getUserAgent(): string {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent;
    }
    return `${Platform.OS}/${Platform.Version}`;
  }
}

// Exporta uma instância única do serviço
export const auditService = new AuditService();

// Exporta a classe para casos onde múltiplas instâncias são necessárias
export default AuditService;

