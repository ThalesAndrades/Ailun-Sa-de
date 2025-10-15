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
  console.log('[processRegistration] ===== INICIANDO REGISTRO =====');
  console.log('[processRegistration] Email:', data.email);
  console.log('[processRegistration] Método de pagamento:', data.paymentMethod);
  
  try {
    // Validar dados obrigatórios antes de enviar
    if (!data.fullName || !data.cpf || !data.email) {
      throw new Error('Dados obrigatórios não fornecidos (nome, CPF, email)');
    }
    
    if (!data.paymentMethod || !['credit_card', 'pix', 'boleto'].includes(data.paymentMethod)) {
      throw new Error('Método de pagamento inválido');
    }
    
    if (data.paymentMethod === 'credit_card' && !data.creditCard) {
      throw new Error('Dados do cartão de crédito não fornecidos');
    }
    
    console.log('[processRegistration] Validações iniciais OK');
    
    // Preparar dados para Edge Function
    const edgeFunctionPayload = {
      action: 'create_subscription',
      data: {
        // Dados Pessoais
        fullName: data.fullName.trim(),
        cpf: data.cpf.replace(/\D/g, ''),
        birthDate: data.birthDate,
        email: data.email.toLowerCase().trim(),
        phone: data.phone.replace(/\D/g, ''),
        
        // Endereço
        cep: data.cep.replace(/\D/g, ''),
        street: data.street.trim(),
        number: data.number.trim(),
        complement: data.complement?.trim() || undefined,
        neighborhood: data.neighborhood.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        
        // Plano
        includeSpecialists: Boolean(data.includeSpecialists),
        includePsychology: Boolean(data.includePsychology),
        includeNutrition: Boolean(data.includeNutrition),
        memberCount: Number(data.memberCount) || 1,
        serviceType: data.serviceType,
        totalPrice: Number(data.totalPrice) || 0,
        discountPercentage: Number(data.discountPercentage) || 0,
        
        // Pagamento
        paymentMethod: data.paymentMethod,
        creditCard: data.creditCard ? {
          holderName: data.creditCard.holderName.trim(),
          number: data.creditCard.number.replace(/\s/g, ''),
          expiryMonth: data.creditCard.expiryMonth.padStart(2, '0'),
          expiryYear: data.creditCard.expiryYear,
          ccv: data.creditCard.ccv,
        } : undefined,
      },
    };
    
    console.log('[processRegistration] Payload preparado para Edge Function');
    console.log('[processRegistration] Tamanho do payload:', JSON.stringify(edgeFunctionPayload).length);
    
    // Chamar Edge Function
    const { data: registrationResult, error: edgeFunctionError } = await supabase.functions.invoke('tema-orchestrator', {
      body: edgeFunctionPayload,
    });
    
    console.log('[processRegistration] Resposta da Edge Function:');
    console.log('- Error:', edgeFunctionError);
    console.log('- Data:', registrationResult);

    if (edgeFunctionError) {
      console.error('[processRegistration] Erro da Edge Function:', edgeFunctionError);
      throw new Error(`Edge Function error: ${edgeFunctionError.message || JSON.stringify(edgeFunctionError)}`);
    }

    if (!registrationResult) {
      throw new Error('Edge Function retornou resposta vazia');
    }
    
    if (!registrationResult.success) {
      const errorMsg = registrationResult.error || 'Erro desconhecido no processamento';
      console.error('[processRegistration] Edge Function retornou erro:', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('[processRegistration] ===== REGISTRO CONCLUÍDO COM SUCESSO =====');
    console.log('[processRegistration] Beneficiário UUID:', registrationResult.beneficiaryUuid);
    console.log('[processRegistration] Customer ID Asaas:', registrationResult.asaasCustomerId);

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
    console.error('[processRegistration] ===== ERRO NO REGISTRO =====');
    console.error('[processRegistration] Tipo do erro:', typeof error);
    console.error('[processRegistration] Mensagem:', error.message);
    console.error('[processRegistration] Stack:', error.stack);
    
    // Registrar evento de falha no cadastro
    try {
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
          paymentMethod: data.paymentMethod,
        },
      });
    } catch (auditError) {
      console.warn('[processRegistration] Erro ao registrar auditoria:', auditError);
    }
    
    return {
      success: false,
      error: error.message || 'Erro interno ao processar registro',
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

