/**
 * Orquestrador de Integrações - Alinhado com APIs Oficiais
 * Coordena integrações entre RapiDoc, Asaas, Resend e Supabase
 */

import { rapidocService } from './rapidoc';
import { rapidocConsultationService } from './rapidoc-consultation-service';
import type {
  BeneficiaryCreateData,
  RapidocBeneficiary,
  RapidocSpecialty,
  RapidocAvailability,
  RapidocAppointment,
  ConsultationResponse
} from './rapidoc';
import type {
  ConsultationRequest,
  ScheduleRequest,
  ConsultationResult
} from './rapidoc-consultation-service';
import { asaasService } from './asaas';
import { sendEmail } from './email';
import { supabase } from './supabase';
import { ProductionLogger } from '../utils/production-logger';
import { retryOperation } from '../utils/retry';

interface IntegrationHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: {
    rapidoc: 'healthy' | 'degraded' | 'down';
    supabase: 'healthy' | 'degraded' | 'down';
    asaas: 'healthy' | 'degraded' | 'down';
    resend: 'healthy' | 'degraded' | 'down';
  };
  lastCheck: Date;
}

interface OrchestrationResult {
  success: boolean;
  data?: any;
  errors: string[];
  warnings: string[];
  syncedSystems: string[];
}

interface NotificationRequest {
  userId: string;
  type: 'email' | 'push' | 'sms';
  template: string;
  data: Record<string, any>;
}

interface PaymentRequest {
  customerId: string;
  amount: number;
  description: string;
  paymentMethod: 'pix' | 'credit_card' | 'boleto';
  dueDate?: Date;
}

class IntegrationOrchestrator {
  private logger = new ProductionLogger('IntegrationOrchestrator');
  private healthCache: IntegrationHealth | null = null;
  private healthCacheExpiry: number = 0;

  // ==================== CONSULTAS E AGENDAMENTOS ====================

  /**
   * Solicitar consulta com orquestração completa
   */
  async requestConsultation(request: ConsultationRequest): Promise<ConsultationResult & {
    queuePosition?: number;
    estimatedWaitTime?: number;
    professionalInfo?: any;
  }> {
    try {
      this.logger.info('Iniciando solicitação de consulta orquestrada', request);
      
      // 1. Verificar se beneficiário existe no RapiDoc
      let beneficiary: RapidocBeneficiary | null = null;
      
      try {
        // Buscar no Supabase primeiro para pegar CPF
        const { data: profile } = await supabase
          .from('beneficiaries')
          .select('cpf, full_name')
          .eq('beneficiary_uuid', request.beneficiaryUuid)
          .single();
        
        if (profile?.cpf) {
          beneficiary = await rapidocService.getBeneficiaryByCPF(profile.cpf);
        }
      } catch (error) {
        this.logger.warn('Beneficiário não encontrado no RapiDoc', { error });
      }
      
      // 2. Determinar tipo de consulta e executar
      let consultationResult: ConsultationResult;
      
      if (request.serviceType === 'clinical') {
        // Consulta clínica imediata
        consultationResult = await rapidocConsultationService.requestImmediateConsultation(
          beneficiary?.uuid || request.beneficiaryUuid
        );
      } else {
        // Agendamento de especialidade
        const specialtyResult = await rapidocConsultationService.getSpecialtyByType(
          request.serviceType as 'psychology' | 'nutrition'
        );
        
        if (!specialtyResult) {
          return {
            success: false,
            error: 'Especialidade não encontrada'
          };
        }
        
        // Buscar disponibilidade
        const availabilityResult = await rapidocConsultationService.getSpecialtyAvailability(
          specialtyResult.uuid,
          beneficiary?.uuid || request.beneficiaryUuid
        );
        
        if (!availabilityResult.success || availabilityResult.availableSlots.length === 0) {
          return {
            success: false,
            error: 'Nenhum horário disponível encontrado'
          };
        }
        
        // Agendar no primeiro horário disponível
        const firstSlot = availabilityResult.availableSlots[0];
        
        consultationResult = await rapidocConsultationService.scheduleAppointment({
          beneficiaryUuid: beneficiary?.uuid || request.beneficiaryUuid,
          availabilityUuid: firstSlot.uuid,
          specialtyUuid: specialtyResult.uuid,
          serviceType: request.serviceType as any,
          approveAdditionalPayment: true
        });
      }
      
      // 3. Se bem-sucedido, registrar no Supabase e enviar notificações
      if (consultationResult.success) {
        try {
          // Registrar consulta no histórico
          await supabase.from('consultation_history').insert({
            beneficiary_id: request.beneficiaryUuid,
            service_type: request.serviceType.toUpperCase(),
            specialty: request.specialty,
            session_id: consultationResult.consultationId,
            consultation_url: consultationResult.sessionUrl,
            status: 'scheduled',
            metadata: {
              priority: request.priority,
              notes: request.notes,
              source: 'rapidoc_api'
            }
          });
          
          // Enviar notificação por email se houver
          if (beneficiary?.email) {
            await this.sendNotification(request.beneficiaryUuid, 'email', 'consultation_scheduled', {
              consultationType: request.serviceType,
              consultationUrl: consultationResult.sessionUrl,
              scheduledAt: new Date().toISOString(),
              professionalInfo: consultationResult.professionalInfo
            });
          }
          
        } catch (error) {
          this.logger.warn('Falha nas operações pós-agendamento', { error });
          // Não falhar a consulta por causa disso
        }
      }
      
      return {
        ...consultationResult,
        queuePosition: request.serviceType === 'clinical' ? 1 : undefined,
        estimatedWaitTime: request.serviceType === 'clinical' ? 0 : this.calculateWaitTime(request.serviceType)
      };
      
    } catch (error: any) {
      this.logger.error('Erro na orquestração de consulta', { error: error.message });
      return {
        success: false,
        error: 'Erro interno na solicitação de consulta'
      };
    }
  }

  // ==================== PAGAMENTOS ====================

  /**
   * Processar pagamento com integração Asaas
   */
  async processPayment(request: PaymentRequest): Promise<OrchestrationResult> {
    const result: OrchestrationResult = {
      success: false,
      errors: [],
      warnings: [],
      syncedSystems: []
    };
    
    try {
      this.logger.info('Processando pagamento', request);
      
      // 1. Processar pagamento no Asaas
      const paymentResult = await asaasService.createPayment({
        customer: request.customerId,
        billingType: request.paymentMethod === 'pix' ? 'PIX' : 
                    request.paymentMethod === 'credit_card' ? 'CREDIT_CARD' : 'BOLETO',
        value: request.amount,
        description: request.description,
        dueDate: request.dueDate?.toISOString().split('T')[0]
      });
      
      if (paymentResult.success) {
        result.syncedSystems.push('asaas');
        result.data = paymentResult.data;
        
        // 2. Registrar pagamento no Supabase
        try {
          await supabase.from('subscription_plans').insert({
            user_id: request.customerId,
            asaas_subscription_id: paymentResult.data.id,
            payment_method: request.paymentMethod,
            base_price: request.amount,
            total_price: request.amount,
            status: 'active',
            next_billing_date: request.dueDate,
            metadata: {
              source: 'asaas_integration',
              payment_id: paymentResult.data.id
            }
          });
          
          result.syncedSystems.push('supabase');
        } catch (supabaseError: any) {
          result.warnings.push(`Falha ao sincronizar com Supabase: ${supabaseError.message}`);
        }
        
        // 3. Enviar confirmação por email
        try {
          await this.sendNotification(request.customerId, 'email', 'payment_confirmation', {
            amount: request.amount,
            description: request.description,
            paymentMethod: request.paymentMethod,
            paymentId: paymentResult.data.id
          });
          
          result.syncedSystems.push('resend');
        } catch (emailError: any) {
          result.warnings.push(`Falha ao enviar email: ${emailError.message}`);
        }
        
        result.success = true;
        
      } else {
        result.errors.push(paymentResult.error || 'Falha no processamento do pagamento');
      }
      
    } catch (error: any) {
      this.logger.error('Erro no processamento de pagamento', { error: error.message });
      result.errors.push('Erro interno no processamento do pagamento');
    }
    
    return result;
  }

  // ==================== NOTIFICAÇÕES ====================

  /**
   * Enviar notificação integrada
   */
  async sendNotification(
    userId: string,
    type: 'email' | 'push' | 'sms',
    template: string,
    data: Record<string, any>
  ): Promise<OrchestrationResult> {
    const result: OrchestrationResult = {
      success: false,
      errors: [],
      warnings: [],
      syncedSystems: []
    };
    
    try {
      this.logger.info('Enviando notificação', { userId, type, template });
      
      // 1. Buscar dados do usuário
      const { data: user } = await supabase
        .from('user_profiles')
        .select('email, full_name, phone')
        .eq('id', userId)
        .single();
      
      if (!user) {
        result.errors.push('Usuário não encontrado');
        return result;
      }
      
      // 2. Preparar conteúdo da notificação
      const notificationData = {
        ...data,
        userName: user.full_name,
        userEmail: user.email
      };
      
      // 3. Enviar conforme o tipo
      if (type === 'email' && user.email) {
        try {
          const emailResult = await sendEmail({
            to: user.email,
            subject: this.getEmailSubject(template, notificationData),
            template,
            data: notificationData
          });
          
          if (emailResult.success) {
            result.syncedSystems.push('resend');
            result.success = true;
          } else {
            result.errors.push(emailResult.error || 'Falha no envio de email');
          }
        } catch (emailError: any) {
          result.errors.push(`Erro no email: ${emailError.message}`);
        }
      }
      
      // 4. Registrar notificação no Supabase
      try {
        await supabase.from('system_notifications').insert({
          beneficiary_uuid: userId,
          title: this.getNotificationTitle(template),
          message: this.getNotificationMessage(template, notificationData),
          type: 'info',
          metadata: {
            template,
            notification_type: type,
            sent_at: new Date().toISOString()
          }
        });
        
        result.syncedSystems.push('supabase');
      } catch (supabaseError: any) {
        result.warnings.push(`Falha ao registrar notificação: ${supabaseError.message}`);
      }
      
    } catch (error: any) {
      this.logger.error('Erro no envio de notificação', { error: error.message });
      result.errors.push('Erro interno no envio de notificação');
    }
    
    return result;
  }

  // ==================== SINCRONIZAÇÃO ====================

  /**
   * Sincronizar dados do usuário entre sistemas
   */
  async syncUserData(userId: string): Promise<OrchestrationResult> {
    const result: OrchestrationResult = {
      success: false,
      errors: [],
      warnings: [],
      syncedSystems: []
    };
    
    try {
      this.logger.info('Sincronizando dados do usuário', { userId });
      
      // 1. Buscar dados no Supabase
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!userProfile) {
        result.errors.push('Usuário não encontrado');
        return result;
      }
      
      const { data: beneficiary } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (beneficiary) {
        // 2. Sincronizar com RapiDoc
        try {
          const rapidocBeneficiary = await rapidocService.getBeneficiaryByCPF(beneficiary.cpf);
          
          if (!rapidocBeneficiary) {
            // Criar beneficiário no RapiDoc
            const createData: BeneficiaryCreateData = {
              name: beneficiary.full_name,
              cpf: beneficiary.cpf,
              birthday: beneficiary.birth_date,
              phone: beneficiary.phone,
              email: beneficiary.email,
              zipCode: userProfile.address?.zipCode,
              address: userProfile.address?.street,
              city: userProfile.address?.city,
              state: userProfile.address?.state,
              serviceType: rapidocService.mapServiceType(beneficiary.service_type || 'clinical')
            };
            
            await rapidocService.createBeneficiary(createData);
          }
          
          result.syncedSystems.push('rapidoc');
        } catch (rapidocError: any) {
          result.errors.push(`RapiDoc sync falhou: ${rapidocError.message}`);
        }
        
        // 3. Sincronizar com Asaas
        try {
          const asaasCustomer = await asaasService.getCustomerByCPF(beneficiary.cpf);
          
          if (!asaasCustomer.success) {
            // Criar customer no Asaas
            await asaasService.createCustomer({
              name: beneficiary.full_name,
              cpfCnpj: beneficiary.cpf,
              email: beneficiary.email,
              phone: beneficiary.phone,
              address: userProfile.address?.street,
              addressNumber: userProfile.address?.number,
              complement: userProfile.address?.complement,
              province: userProfile.address?.neighborhood,
              city: userProfile.address?.city,
              state: userProfile.address?.state,
              postalCode: userProfile.address?.zipCode
            });
          }
          
          result.syncedSystems.push('asaas');
        } catch (asaasError: any) {
          result.errors.push(`Asaas sync falhou: ${asaasError.message}`);
        }
      }
      
      result.success = result.syncedSystems.length > 0;
      
    } catch (error: any) {
      this.logger.error('Erro na sincronização de dados', { error: error.message });
      result.errors.push('Erro interno na sincronização');
    }
    
    return result;
  }

  // ==================== SAÚDE DO SISTEMA ====================

  /**
   * Verificar saúde de todas as integrações
   */
  async checkHealth(): Promise<IntegrationHealth> {
    // Cache por 2 minutos
    if (this.healthCache && Date.now() < this.healthCacheExpiry) {
      return this.healthCache;
    }
    
    this.logger.info('Verificando saúde das integrações');
    
    const health: IntegrationHealth = {
      overall: 'healthy',
      services: {
        rapidoc: 'down',
        supabase: 'down',
        asaas: 'down',
        resend: 'down'
      },
      lastCheck: new Date()
    };
    
    // Testar RapiDoc
    try {
      const rapidocHealth = await rapidocService.checkHealth();
      health.services.rapidoc = rapidocHealth.status;
    } catch {
      health.services.rapidoc = 'down';
    }
    
    // Testar Supabase
    try {
      await supabase.from('user_profiles').select('count').limit(1);
      health.services.supabase = 'healthy';
    } catch {
      health.services.supabase = 'down';
    }
    
    // Testar Asaas
    try {
      const asaasHealth = await asaasService.checkHealth();
      health.services.asaas = asaasHealth.status === 'ok' ? 'healthy' : 'down';
    } catch {
      health.services.asaas = 'down';
    }
    
    // Testar Resend (simples)
    health.services.resend = 'healthy'; // Assumir saudável se não tiver erro
    
    // Determinar saúde geral
    const healthyServices = Object.values(health.services).filter(s => s === 'healthy').length;
    const totalServices = Object.keys(health.services).length;
    
    if (healthyServices === totalServices) {
      health.overall = 'healthy';
    } else if (healthyServices > totalServices / 2) {
      health.overall = 'degraded';
    } else {
      health.overall = 'down';
    }
    
    // Cache por 2 minutos
    this.healthCache = health;
    this.healthCacheExpiry = Date.now() + 2 * 60 * 1000;
    
    this.logger.info('Verificação de saúde concluída', {
      overall: health.overall,
      healthy: healthyServices,
      total: totalServices
    });
    
    return health;
  }

  // ==================== UTILITÁRIOS ====================

  private calculateWaitTime(serviceType: string): number {
    const waitTimes = {
      clinical: 0, // Imediato
      specialist: 30, // 30 minutos
      psychology: 45, // 45 minutos
      nutrition: 60 // 60 minutos
    };
    
    return (waitTimes as any)[serviceType] || 30;
  }

  private getEmailSubject(template: string, data: any): string {
    const subjects = {
      consultation_scheduled: `Consulta Agendada - AiLun Saúde`,
      consultation_completed: `Consulta Finalizada - AiLun Saúde`,
      payment_confirmation: `Pagamento Confirmado - AiLun Saúde`,
      subscription_expired: `Assinatura Expirada - AiLun Saúde`
    };
    
    return (subjects as any)[template] || 'Notificação - AiLun Saúde';
  }

  private getNotificationTitle(template: string): string {
    const titles = {
      consultation_scheduled: 'Consulta Agendada',
      consultation_completed: 'Consulta Finalizada',
      payment_confirmation: 'Pagamento Confirmado',
      subscription_expired: 'Assinatura Expirada'
    };
    
    return (titles as any)[template] || 'Notificação';
  }

  private getNotificationMessage(template: string, data: any): string {
    const messages = {
      consultation_scheduled: `Sua consulta foi agendada com sucesso. Tipo: ${data.consultationType}`,
      consultation_completed: `Consulta finalizada. Duração: ${data.duration || 'N/A'}`,
      payment_confirmation: `Pagamento de R$ ${data.amount} confirmado via ${data.paymentMethod}`,
      subscription_expired: 'Sua assinatura expirou. Renove para continuar usando os serviços.'
    };
    
    return (messages as any)[template] || 'Nova notificação disponível';
  }
}

export const useIntegrationOrchestrator = () => {
  const orchestrator = new IntegrationOrchestrator();
  return orchestrator;
};

export default IntegrationOrchestrator;

export type {
  IntegrationHealth,
  OrchestrationResult,
  NotificationRequest,
  PaymentRequest
};