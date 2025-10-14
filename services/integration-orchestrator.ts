/**
 * Orquestrador de Integrações - AiLun Saúde
 * Coordena comunicação entre RapiDoc, Asaas, Resend e Supabase
 */

import { supabase } from './supabase';
import { rapidocHttpClient } from './http-client';
import { errorRecovery } from './error-recovery';
import { cache, createCacheKey } from '../utils/cache';
import { ErrorMessages, SuccessMessages } from '../constants/ErrorMessages';
import { auditService } from './audit-service';

export interface ConsultationRequest {
  beneficiaryUuid: string;
  serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition';
  specialty?: string;
  priority?: 'normal' | 'urgent';
  notes?: string;
  scheduledFor?: string; // ISO date for scheduled consultations
}

export interface ConsultationResponse {
  success: boolean;
  consultationId?: string;
  sessionUrl?: string;
  estimatedWaitTime?: number;
  queuePosition?: number;
  professionalInfo?: {
    name: string;
    specialty: string;
    crm?: string;
    photo?: string;
  };
  error?: string;
}

export interface PaymentRequest {
  customerId: string;
  planType: string;
  amount: number;
  billingType: 'BOLETO' | 'CREDIT_CARD' | 'PIX';
  cardData?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  invoiceUrl?: string;
  pixQrCode?: string;
  pixCode?: string;
  dueDate?: string;
  status?: string;
  error?: string;
}

export class IntegrationOrchestrator {
  private static instance: IntegrationOrchestrator;
  
  static getInstance(): IntegrationOrchestrator {
    if (!IntegrationOrchestrator.instance) {
      IntegrationOrchestrator.instance = new IntegrationOrchestrator();
    }
    return IntegrationOrchestrator.instance;
  }

  /**
   * Solicita consulta médica via RapiDoc
   */
  async requestConsultation(request: ConsultationRequest): Promise<ConsultationResponse> {
    const cacheKey = createCacheKey('consultation_request', request.beneficiaryUuid, request.serviceType);
    
    return await errorRecovery.executeWithRecovery(
      async () => {
        // Log da solicitação
        await auditService.log({
          event_type: 'consultation_request',
          user_id: request.beneficiaryUuid,
          event_data: {
            service_type: request.serviceType,
            specialty: request.specialty,
            priority: request.priority,
          },
          status: 'pending',
        });

        // Verificar plano ativo
        const planCheck = await this.verifyActivePlan(request.beneficiaryUuid, request.serviceType);
        if (!planCheck.isValid) {
          throw new Error(planCheck.reason || 'Plano inativo ou serviço não incluído');
        }

        // Chamar RapiDoc via Edge Function
        const { data, error } = await supabase.functions.invoke('tema-orchestrator', {
          body: {
            action: 'request_consultation',
            beneficiary_uuid: request.beneficiaryUuid,
            service_type: request.serviceType,
            specialty: request.specialty,
            priority: request.priority || 'normal',
            notes: request.notes,
            scheduled_for: request.scheduledFor,
          },
        });

        if (error) throw error;

        // Log de sucesso
        await auditService.log({
          event_type: 'consultation_request',
          user_id: request.beneficiaryUuid,
          event_data: {
            consultation_id: data.consultationId,
            service_type: request.serviceType,
            professional_info: data.professionalInfo,
          },
          status: 'success',
        });

        return {
          success: true,
          consultationId: data.consultationId,
          sessionUrl: data.sessionUrl,
          estimatedWaitTime: data.estimatedWaitTime,
          queuePosition: data.queuePosition,
          professionalInfo: data.professionalInfo,
        };
      },
      // Fallback para modo offline
      () => {
        return {
          success: false,
          error: ErrorMessages.RAPIDOC.API_ERROR,
        };
      },
      cacheKey,
      5 * 60 * 1000 // 5 minutos
    );
  }

  /**
   * Processa pagamento via Asaas
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return await errorRecovery.executeWithRecovery(
      async () => {
        // Log da tentativa de pagamento
        await auditService.log({
          event_type: 'payment_request',
          user_id: request.customerId,
          event_data: {
            plan_type: request.planType,
            amount: request.amount,
            billing_type: request.billingType,
          },
          status: 'pending',
        });

        // Processar via Edge Function
        const { data, error } = await supabase.functions.invoke('asaas-webhook', {
          body: {
            action: 'create_payment',
            customer_id: request.customerId,
            plan_type: request.planType,
            amount: request.amount,
            billing_type: request.billingType,
            card_data: request.cardData,
          },
        });

        if (error) throw error;

        // Log de sucesso
        await auditService.log({
          event_type: 'payment_request',
          user_id: request.customerId,
          event_data: {
            payment_id: data.paymentId,
            amount: request.amount,
            status: data.status,
          },
          status: 'success',
        });

        return {
          success: true,
          paymentId: data.paymentId,
          invoiceUrl: data.invoiceUrl,
          pixQrCode: data.pixQrCode,
          pixCode: data.pixCode,
          dueDate: data.dueDate,
          status: data.status,
        };
      },
      // Fallback para erro de pagamento
      () => {
        return {
          success: false,
          error: ErrorMessages.PAYMENT.PAYMENT_FAILED,
        };
      }
    );
  }

  /**
   * Envia notificação via Resend
   */
  async sendNotification(
    userId: string,
    type: 'email' | 'sms',
    template: string,
    data: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    return await errorRecovery.executeWithRecovery(
      async () => {
        const { data: result, error } = await supabase.functions.invoke('send-notification', {
          body: {
            user_id: userId,
            type,
            template,
            data,
          },
        });

        if (error) throw error;

        return {
          success: true,
          messageId: result.messageId,
        };
      },
      // Fallback - salvar notificação no sistema interno
      async () => {
        await supabase.from('system_notifications').insert({
          beneficiary_uuid: userId,
          title: data.subject || 'Notificação AiLun',
          message: data.message || 'Você tem uma nova notificação.',
          type: 'info',
          metadata: { template, fallback: true },
        });

        return {
          success: true,
          messageId: 'fallback_notification',
        };
      }
    );
  }

  /**
   * Verifica plano ativo e permissões
   */
  private async verifyActivePlan(
    beneficiaryUuid: string,
    serviceType: string
  ): Promise<{ isValid: boolean; reason?: string }> {
    try {
      const { getBeneficiaryByCPF, canUseService } = await import('./beneficiary-plan-service');
      const { checkSubscriptionStatus } = await import('./asaas');

      // Buscar beneficiário
      const { data: beneficiary } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('beneficiary_uuid', beneficiaryUuid)
        .single();

      if (!beneficiary) {
        return { isValid: false, reason: 'Beneficiário não encontrado' };
      }

      // Verificar status da assinatura
      const subscriptionStatus = await checkSubscriptionStatus(beneficiaryUuid);
      if (!subscriptionStatus.hasActiveSubscription) {
        return { isValid: false, reason: 'Assinatura inativa' };
      }

      // Verificar se o serviço está incluído no plano
      const serviceCheck = await canUseService(beneficiaryUuid, serviceType as any);
      if (!serviceCheck.canUse) {
        return { isValid: false, reason: serviceCheck.reason };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Erro ao verificar plano:', error);
      return { isValid: false, reason: 'Erro na verificação do plano' };
    }
  }

  /**
   * Sincroniza dados entre sistemas
   */
  async syncUserData(userId: string): Promise<{
    success: boolean;
    syncedSystems: string[];
    errors: string[];
  }> {
    const syncedSystems: string[] = [];
    const errors: string[] = [];

    // Sincronizar com RapiDoc
    try {
      const { data } = await supabase.functions.invoke('tema-orchestrator', {
        body: {
          action: 'sync_beneficiary',
          user_id: userId,
        },
      });
      if (data?.success) {
        syncedSystems.push('RapiDoc');
      }
    } catch (error: any) {
      errors.push(`RapiDoc: ${error.message}`);
    }

    // Sincronizar com Asaas
    try {
      const { data } = await supabase.functions.invoke('asaas-webhook', {
        body: {
          action: 'sync_customer',
          user_id: userId,
        },
      });
      if (data?.success) {
        syncedSystems.push('Asaas');
      }
    } catch (error: any) {
      errors.push(`Asaas: ${error.message}`);
    }

    return {
      success: errors.length === 0,
      syncedSystems,
      errors,
    };
  }

  /**
   * Verifica status de saúde de todas as integrações
   */
  async checkIntegrationsHealth(): Promise<{
    overall: 'healthy' | 'degraded' | 'down';
    services: {
      rapidoc: 'healthy' | 'degraded' | 'down';
      supabase: 'healthy' | 'degraded' | 'down';
      asaas: 'healthy' | 'degraded' | 'down';
      resend: 'healthy' | 'degraded' | 'down';
    };
    lastCheck: string;
  }> {
    const connectivity = await errorRecovery.checkConnectivity();
    
    const services = {
      rapidoc: connectivity.rapidoc ? 'healthy' as const : 'down' as const,
      supabase: connectivity.supabase ? 'healthy' as const : 'down' as const,
      asaas: connectivity.asaas ? 'healthy' as const : 'down' as const,
      resend: connectivity.resend ? 'healthy' as const : 'down' as const,
    };

    const healthyCount = Object.values(services).filter(status => status === 'healthy').length;
    const overall = healthyCount === 4 ? 'healthy' : healthyCount >= 2 ? 'degraded' : 'down';

    return {
      overall,
      services,
      lastCheck: new Date().toISOString(),
    };
  }
}

// Instância singleton
export const integrationOrchestrator = IntegrationOrchestrator.getInstance();

// Hooks para usar em componentes React
export function useIntegrationOrchestrator() {
  return {
    requestConsultation: integrationOrchestrator.requestConsultation.bind(integrationOrchestrator),
    processPayment: integrationOrchestrator.processPayment.bind(integrationOrchestrator),
    sendNotification: integrationOrchestrator.sendNotification.bind(integrationOrchestrator),
    syncUserData: integrationOrchestrator.syncUserData.bind(integrationOrchestrator),
    checkHealth: integrationOrchestrator.checkIntegrationsHealth.bind(integrationOrchestrator),
  };
}