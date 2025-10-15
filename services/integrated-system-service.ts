/**
 * Serviço Integrado do Sistema AiLun Saúde
 * Orquestrador principal para todas as integrações backend-frontend
 */

import { supabase } from './supabase';
import { rapidocService } from './rapidoc';
import { createAsaasCustomer, createSubscription } from './asaas';
import { getBeneficiaryByCPF, createBeneficiary, canUseService } from './beneficiary-plan-service';
import { ProductionLogger } from '../utils/production-logger';

const logger = new ProductionLogger('IntegratedSystemService');

export interface SystemUser {
  id: string;
  email: string;
  profile: {
    full_name?: string;
    phone?: string;
    cpf?: string;
    birth_date?: string;
    is_active_beneficiary?: boolean;
    plan_type?: string;
    subscription_status?: string;
    asaas_customer_id?: string;
    asaas_subscription_id?: string;
  };
  beneficiary?: {
    beneficiary_uuid: string;
    service_type: 'G' | 'GS' | 'GSP';
    status: 'active' | 'inactive';
  };
  subscription?: {
    plan_name: string;
    total_price: number;
    status: 'active' | 'inactive' | 'overdue';
    next_billing_date?: string;
    services: {
      clinical: boolean;
      specialists: boolean;
      psychology: boolean;
      nutrition: boolean;
    };
  };
}

/**
 * Classe principal para gerenciar integrações do sistema
 */
class IntegratedSystemService {
  
  /**
   * Obter status completo do usuário
   */
  async getUserCompleteStatus(userId: string): Promise<{
    success: boolean;
    user?: SystemUser;
    error?: string;
  }> {
    try {
      logger.info('Carregando status completo do usuário', { userId });

      // 1. Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error(`Erro ao carregar perfil: ${profileError.message}`);
      }

      const user: SystemUser = {
        id: userId,
        email: profile.email,
        profile: profile,
      };

      // 2. Verificar se é beneficiário
      if (profile.cpf) {
        const beneficiary = await getBeneficiaryByCPF(profile.cpf);
        if (beneficiary) {
          user.beneficiary = {
            beneficiary_uuid: beneficiary.beneficiary_uuid,
            service_type: beneficiary.service_type,
            status: beneficiary.status,
          };

          // 3. Verificar status da assinatura
          if (profile.asaas_subscription_id) {
            const subscriptionCheck = await this.checkSubscriptionStatus(beneficiary.beneficiary_uuid);
            if (subscriptionCheck.success) {
              user.subscription = subscriptionCheck.subscription;
            }
          }
        }
      }

      logger.info('Status completo carregado com sucesso', { 
        userId,
        hasBeneficiary: !!user.beneficiary,
        hasSubscription: !!user.subscription
      });

      return { success: true, user };

    } catch (error: any) {
      logger.error('Erro ao carregar status do usuário', { 
        error: error.message,
        userId 
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Sincronizar beneficiário com RapiDoc
   */
  async syncBeneficiaryWithRapidoc(
    userId: string,
    userData: {
      full_name: string;
      email: string;
      cpf: string;
      phone: string;
      birth_date: string;
    }
  ): Promise<{
    success: boolean;
    beneficiaryUuid?: string;
    error?: string;
  }> {
    try {
      logger.info('Sincronizando beneficiário com RapiDoc', { 
        userId,
        email: userData.email 
      });

      // 1. Verificar se beneficiário já existe na RapiDoc
      let rapidocBeneficiary = await rapidocService.getBeneficiaryByCPF(userData.cpf);

      // 2. Se não existir, criar na RapiDoc
      if (!rapidocBeneficiary) {
        rapidocBeneficiary = await rapidocService.createBeneficiary({
          name: userData.full_name,
          cpf: userData.cpf,
          birthday: userData.birth_date,
          phone: userData.phone,
          email: userData.email,
          serviceType: 'GS', // Clínico + Especialista por padrão
          paymentType: 'S', // Recorrente
        });

        logger.info('Beneficiário criado na RapiDoc', { 
          beneficiaryUuid: rapidocBeneficiary.uuid 
        });
      }

      // 3. Criar ou atualizar no Supabase
      let supabaseBeneficiary = await getBeneficiaryByCPF(userData.cpf);
      
      if (!supabaseBeneficiary) {
        const createResult = await createBeneficiary({
          user_id: userId,
          beneficiary_uuid: rapidocBeneficiary.uuid,
          cpf: userData.cpf,
          full_name: userData.full_name,
          birth_date: userData.birth_date,
          email: userData.email,
          phone: userData.phone,
          service_type: 'GS',
          is_primary: true,
        });

        if (!createResult.success) {
          throw new Error(createResult.error);
        }

        supabaseBeneficiary = createResult.data;
      }

      // 4. Atualizar perfil do usuário
      await supabase
        .from('user_profiles')
        .update({
          is_active_beneficiary: true,
          plan_type: 'premium',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      logger.info('Beneficiário sincronizado com sucesso', {
        userId,
        beneficiaryUuid: rapidocBeneficiary.uuid
      });

      return {
        success: true,
        beneficiaryUuid: rapidocBeneficiary.uuid,
      };

    } catch (error: any) {
      logger.error('Erro na sincronização do beneficiário', {
        error: error.message,
        userId
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Criar assinatura completa (Asaas + Supabase)
   */
  async createCompleteSubscription(
    userId: string,
    beneficiaryUuid: string,
    subscriptionData: {
      name: string;
      email: string;
      cpf: string;
      phone: string;
      postalCode: string;
      address: string;
      addressNumber: string;
      complement?: string;
      province: string;
      billingType: 'CREDIT_CARD' | 'PIX';
      creditCard?: any;
    }
  ): Promise<{
    success: boolean;
    subscription?: any;
    payment?: any;
    pixQrCode?: string;
    error?: string;
  }> {
    try {
      logger.info('Criando assinatura completa', { userId, beneficiaryUuid });

      // 1. Criar cliente no Asaas
      const customer = await createAsaasCustomer({
        name: subscriptionData.name,
        email: subscriptionData.email,
        cpf: subscriptionData.cpf,
        phone: subscriptionData.phone,
        postalCode: subscriptionData.postalCode,
        address: subscriptionData.address,
        addressNumber: subscriptionData.addressNumber,
        complement: subscriptionData.complement,
        province: subscriptionData.province,
        beneficiaryUuid,
      });

      // 2. Criar assinatura no Asaas
      const subscription = await createSubscription({
        customerId: customer.id,
        billingType: subscriptionData.billingType,
        creditCard: subscriptionData.creditCard,
        creditCardHolderInfo: subscriptionData.creditCard ? {
          name: subscriptionData.name,
          email: subscriptionData.email,
          cpfCnpj: subscriptionData.cpf,
          postalCode: subscriptionData.postalCode,
          addressNumber: subscriptionData.addressNumber,
          addressComplement: subscriptionData.complement,
          phone: subscriptionData.phone,
        } : undefined,
        beneficiaryUuid,
      });

      // 3. Atualizar no Supabase
      await supabase
        .from('user_profiles')
        .update({
          asaas_customer_id: customer.id,
          asaas_subscription_id: subscription.id,
          subscription_status: 'ACTIVE',
          subscription_value: 89.90,
          subscription_billing_type: subscriptionData.billingType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      // 4. Marcar beneficiário como tendo plano ativo
      await supabase
        .from('beneficiaries')
        .update({
          has_active_plan: true,
          updated_at: new Date().toISOString(),
        })
        .eq('beneficiary_uuid', beneficiaryUuid);

      logger.info('Assinatura criada com sucesso', {
        userId,
        subscriptionId: subscription.id,
        customerId: customer.id
      });

      return {
        success: true,
        subscription,
        payment: subscription.firstPayment || null,
      };

    } catch (error: any) {
      logger.error('Erro ao criar assinatura completa', {
        error: error.message,
        userId,
        beneficiaryUuid
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar status completo da assinatura
   */
  async checkSubscriptionStatus(beneficiaryUuid: string): Promise<{
    success: boolean;
    subscription?: {
      plan_name: string;
      total_price: number;
      status: 'active' | 'inactive' | 'overdue';
      next_billing_date?: string;
      services: {
        clinical: boolean;
        specialists: boolean;
        psychology: boolean;
        nutrition: boolean;
      };
    };
    error?: string;
  }> {
    try {
      // Buscar dados no Supabase
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('asaas_subscription_id, subscription_status, subscription_value')
        .eq('beneficiary_uuid', beneficiaryUuid)
        .single();

      if (!profile?.asaas_subscription_id) {
        return {
          success: true,
          subscription: {
            plan_name: 'Sem Assinatura',
            total_price: 0,
            status: 'inactive',
            services: {
              clinical: false,
              specialists: false,
              psychology: false,
              nutrition: false,
            }
          }
        };
      }

      // Determinar serviços disponíveis baseado no beneficiário
      const beneficiary = await getBeneficiaryByCPF(''); // Implementar busca por UUID
      const serviceType = beneficiary?.service_type || 'G';

      const services = {
        clinical: true, // Sempre disponível
        specialists: ['GS', 'GSP'].includes(serviceType),
        psychology: ['GP', 'GSP'].includes(serviceType),
        nutrition: ['GSP'].includes(serviceType),
      };

      return {
        success: true,
        subscription: {
          plan_name: 'Plano Premium AiLun',
          total_price: profile.subscription_value || 89.90,
          status: profile.subscription_status === 'ACTIVE' ? 'active' : 'inactive',
          services,
        }
      };

    } catch (error: any) {
      logger.error('Erro ao verificar assinatura', { 
        error: error.message,
        beneficiaryUuid 
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Solicitar consulta através do sistema integrado
   */
  async requestIntegratedConsultation(
    beneficiaryUuid: string,
    serviceType: 'clinical' | 'specialist' | 'psychology' | 'nutrition'
  ): Promise<{
    success: boolean;
    consultationUrl?: string;
    sessionId?: string;
    estimatedWaitTime?: number;
    error?: string;
  }> {
    try {
      logger.info('Solicitando consulta integrada', { 
        beneficiaryUuid,
        serviceType 
      });

      // 1. Verificar se pode usar o serviço
      const serviceCheck = await canUseService(beneficiaryUuid, serviceType);
      if (!serviceCheck.canUse) {
        return { success: false, error: serviceCheck.reason };
      }

      // 2. Para consulta clínica, usar RapiDoc diretamente
      if (serviceType === 'clinical') {
        const consultationResult = await rapidocService.requestImmediateConsultation(beneficiaryUuid);
        
        if (consultationResult.success) {
          // Registrar no histórico
          await this.recordConsultationHistory(
            beneficiaryUuid,
            serviceType,
            'active',
            consultationResult.url
          );
        }

        return consultationResult;
      }

      // 3. Para outros serviços, usar Edge Function tema-orchestrator
      const { data, error } = await supabase.functions.invoke('tema-orchestrator', {
        body: {
          action: 'start_consultation',
          serviceType,
          beneficiaryUuid,
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Erro na Edge Function');
      }

      // Registrar no histórico
      await this.recordConsultationHistory(
        beneficiaryUuid,
        serviceType,
        'active',
        data.consultationUrl,
        data.sessionId
      );

      return {
        success: true,
        consultationUrl: data.consultationUrl,
        sessionId: data.sessionId,
        estimatedWaitTime: data.estimatedWaitTime,
      };

    } catch (error: any) {
      logger.error('Erro na consulta integrada', {
        error: error.message,
        beneficiaryUuid,
        serviceType
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Registrar consulta no histórico
   */
  private async recordConsultationHistory(
    beneficiaryUuid: string,
    serviceType: string,
    status: string,
    consultationUrl?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('consultation_history')
        .insert({
          beneficiary_id: beneficiaryUuid, // Usar UUID como ID temporariamente
          service_type: serviceType,
          status: status,
          consultation_url: consultationUrl,
          session_id: sessionId,
          created_at: new Date().toISOString(),
          metadata: {
            platform: 'mobile_app',
            version: '2.1.0',
          }
        });

      logger.info('Consulta registrada no histórico', {
        beneficiaryUuid,
        serviceType,
        status
      });

    } catch (error: any) {
      logger.error('Erro ao registrar consulta no histórico', {
        error: error.message,
        beneficiaryUuid
      });
    }
  }

  /**
   * Processar webhook do Asaas (para uso em Edge Function)
   */
  async processAsaasWebhook(event: string, payment: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const beneficiaryUuid = payment.externalReference;
      
      if (!beneficiaryUuid) {
        return { success: true }; // Webhook sem referência
      }

      // Atualizar status baseado no evento
      switch (event) {
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_CONFIRMED':
          await supabase
            .from('user_profiles')
            .update({
              subscription_status: 'ACTIVE',
              last_payment_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('beneficiary_uuid', beneficiaryUuid);

          await supabase
            .from('beneficiaries')
            .update({
              has_active_plan: true,
              updated_at: new Date().toISOString(),
            })
            .eq('beneficiary_uuid', beneficiaryUuid);

          // Criar notificação
          await supabase
            .from('system_notifications')
            .insert({
              beneficiary_uuid: beneficiaryUuid,
              title: 'Pagamento Confirmado',
              message: `Seu pagamento de R$ ${payment.value?.toFixed(2) || '89,90'} foi confirmado!`,
              type: 'success',
              created_at: new Date().toISOString(),
            });
          break;

        case 'PAYMENT_OVERDUE':
          await supabase
            .from('user_profiles')
            .update({
              subscription_status: 'OVERDUE',
              updated_at: new Date().toISOString(),
            })
            .eq('beneficiary_uuid', beneficiaryUuid);

          await supabase
            .from('beneficiaries')
            .update({
              has_active_plan: false,
              updated_at: new Date().toISOString(),
            })
            .eq('beneficiary_uuid', beneficiaryUuid);
          break;
      }

      logger.info('Webhook processado com sucesso', { event, beneficiaryUuid });
      return { success: true };

    } catch (error: any) {
      logger.error('Erro ao processar webhook', { error: error.message, event });
      return { success: false, error: error.message };
    }
  }

  /**
   * Sincronizar todos os beneficiários ativos
   */
  async syncAllActiveBeneficiaries(): Promise<{
    success: boolean;
    synced: number;
    errors: number;
    details: string[];
  }> {
    try {
      logger.info('Iniciando sincronização de todos os beneficiários');

      // Buscar beneficiários ativos na RapiDoc
      const rapidocBeneficiaries = await rapidocService.getAllBeneficiaries();
      
      let synced = 0;
      let errors = 0;
      const details: string[] = [];

      for (const rapidocBenef of rapidocBeneficiaries) {
        try {
          // Verificar se já existe no Supabase
          const existingBenef = await getBeneficiaryByCPF(rapidocBenef.cpf);
          
          if (!existingBenef) {
            // Criar no Supabase sem user_id (beneficiário órfão)
            await supabase
              .from('beneficiaries')
              .insert({
                beneficiary_uuid: rapidocBenef.uuid,
                cpf: rapidocBenef.cpf,
                full_name: rapidocBenef.name,
                birth_date: rapidocBenef.birthday ? this.parseRapidocDate(rapidocBenef.birthday) : '1990-01-01',
                email: rapidocBenef.email || `${rapidocBenef.cpf}@rapidoc.temp`,
                phone: rapidocBenef.phone || '11999999999',
                service_type: rapidocBenef.serviceType || 'GS',
                is_primary: true,
                status: rapidocBenef.isActive ? 'active' : 'inactive',
                has_active_plan: true,
              });
            
            synced++;
            details.push(`✅ Sincronizado: ${rapidocBenef.name} (${rapidocBenef.cpf})`);
          } else {
            // Atualizar status se necessário
            await supabase
              .from('beneficiaries')
              .update({
                status: rapidocBenef.isActive ? 'active' : 'inactive',
                has_active_plan: rapidocBenef.isActive,
                updated_at: new Date().toISOString(),
              })
              .eq('beneficiary_uuid', rapidocBenef.uuid);
            
            details.push(`🔄 Atualizado: ${rapidocBenef.name} (${rapidocBenef.cpf})`);
          }
        } catch (error: any) {
          errors++;
          details.push(`❌ Erro: ${rapidocBenef.name} - ${error.message}`);
        }
      }

      logger.info('Sincronização concluída', { 
        total: rapidocBeneficiaries.length,
        synced,
        errors 
      });

      return {
        success: true,
        synced,
        errors,
        details,
      };

    } catch (error: any) {
      logger.error('Erro na sincronização geral', { error: error.message });
      return {
        success: false,
        synced: 0,
        errors: 1,
        details: [`Erro geral: ${error.message}`],
      };
    }
  }

  /**
   * Converter data do formato RapiDoc (DD/MM/YYYY) para ISO (YYYY-MM-DD)
   */
  private parseRapidocDate(rapidocDate: string): string {
    if (rapidocDate.includes('/')) {
      const [day, month, year] = rapidocDate.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return rapidocDate;
  }
}

// Singleton instance
export const integratedSystemService = new IntegratedSystemService();
export default integratedSystemService;