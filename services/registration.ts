/**
 * Serviço de Registro de Usuário
 * Integra o fluxo completo de cadastro, pagamento e criação de beneficiário
 */

import { supabase } from './supabase';
import { createAsaasCustomer, createSubscription } from './asaas';
import { createBeneficiary } from './beneficiary-service';
import { auditService, AuditEventType, AuditEventStatus } from './audit-service';
import { createSubscriptionPlan } from './subscription-plan-service';

export interface RegistrationData {
  // Dados Pessoais
  fullName: string;
  cpf: string;
  birthDate: string;
  
  // Contato
  email: string;
  phone: string;
  
  // Endereço
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  
  // Plano
  includeSpecialists: boolean;
  includePsychology: boolean;
  includeNutrition: boolean;
  memberCount: number;
  serviceType: string;
  totalPrice: number;
  discountPercentage: number;
  
  // Pagamento
  paymentMethod: 'credit_card' | 'pix' | 'boleto';
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
}

export interface RegistrationResult {
  success: boolean;
  beneficiaryUuid?: string;
  asaasCustomerId?: string;
  asaasSubscriptionId?: string;
  paymentId?: string;
  pixQrCode?: string;
  pixCopyPaste?: string;
  boletoUrl?: string;
  error?: string;
}

/**
 * Processar registro completo do usuário
 */
export async function processRegistration(
  data: RegistrationData
): Promise<RegistrationResult> {
  try {
    console.log('[processRegistration] Iniciando registro:', data.email);
    
    // Usar Edge Function para processar todo o fluxo de registro e pagamento
    const { data: registrationResult, error: edgeFunctionError } = await supabase.functions.invoke('tema-orchestrator', {
      body: {
        action: 'create_subscription',
        data: {
          // Dados Pessoais
          fullName: data.fullName,
          cpf: data.cpf.replace(/\D/g, ''),
          birthDate: data.birthDate,
          email: data.email,
          phone: data.phone.replace(/\D/g, ''),
          
          // Endereço
          cep: data.cep.replace(/\D/g, ''),
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          
          // Plano
          includeSpecialists: data.includeSpecialists,
          includePsychology: data.includePsychology,
          includeNutrition: data.includeNutrition,
          memberCount: data.memberCount,
          serviceType: data.serviceType,
          totalPrice: data.totalPrice,
          discountPercentage: data.discountPercentage,
          
          // Pagamento
          paymentMethod: data.paymentMethod,
          creditCard: data.creditCard ? {
            holderName: data.creditCard.holderName,
            number: data.creditCard.number.replace(/\s/g, ''),
            expiryMonth: data.creditCard.expiryMonth,
            expiryYear: data.creditCard.expiryYear,
            ccv: data.creditCard.ccv,
          } : undefined,
        },
      },
    });

    if (edgeFunctionError) {
      throw new Error(edgeFunctionError.message || 'Erro ao processar registro');
    }

    if (!registrationResult || !registrationResult.success) {
      throw new Error(registrationResult?.error || 'Erro desconhecido no registro');
    }

    console.log('[processRegistration] Registro processado com sucesso!');

    return {
      success: true,
      beneficiaryUuid: registrationResult.beneficiaryUuid,
      asaasCustomerId: registrationResult.asaasCustomerId,
      asaasSubscriptionId: registrationResult.asaasSubscriptionId,
      paymentId: registrationResult.paymentId,
      pixQrCode: registrationResult.pixQrCode,
      pixCopyPaste: registrationResult.pixCopyPaste,
      boletoUrl: registrationResult.boletoUrl,
    };

  } catch (error: any) {
    console.error('[processRegistration] Erro no registro:', error);
    
    // Registrar evento de falha no cadastro
    await auditService.logEvent({
      eventType: AuditEventType.SIGNUP_FAILED,
      userEmail: data.email,
      status: AuditEventStatus.FAILURE,
      errorMessage: error.message,
      errorStack: error.stack,
      eventData: {
        fullName: data.fullName,
        cpf: data.cpf,
        serviceType: data.serviceType,
      },
    });
    
    return {
      success: false,
      error: error.message || 'Erro ao processar registro',
    };
  }
}

// Funções removidas - processamento via Edge Function

/**
 * Verificar status do pagamento
 */
export async function checkPaymentStatus(paymentId: string): Promise<{
  status: string;
  paid: boolean;
  payment?: any;
}> {
  try {
    const { data: result, error } = await supabase.functions.invoke('tema-orchestrator', {
      body: {
        action: 'check_payment_status',
        paymentId,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      status: result.status,
      paid: result.paid,
      payment: result.payment,
    };
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return {
      status: 'ERROR',
      paid: false,
    };
  }
}

