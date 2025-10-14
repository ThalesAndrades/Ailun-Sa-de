/**
 * Serviço de Registro de Usuário
 * Integra o fluxo completo de cadastro, pagamento e criação de beneficiário
 */

import { supabase } from './supabase';
import { createAsaasCustomer, createSubscription } from './asaas';
import { createBeneficiary } from './beneficiary-service';
import { auditService, AuditEventType, AuditEventStatus } from './audit-service';
import { createSubscriptionPlan } from './subscription-plan-service';
import { ASAAS_CONFIG } from '../config/asaas.config';

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
    
    // Registrar evento de início de cadastro
    await auditService.logEvent({
      eventType: AuditEventType.SIGNUP_STARTED,
      userEmail: data.email,
      status: AuditEventStatus.PENDING,
      eventData: {
        fullName: data.fullName,
        cpf: data.cpf,
        serviceType: data.serviceType,
        memberCount: data.memberCount,
      },
    });

    // 1. Criar beneficiário na RapiDoc
    console.log('[processRegistration] Criando beneficiário na RapiDoc...');
    const beneficiaryResult = await createBeneficiary({
      name: data.fullName,
      cpf: data.cpf,
      birthDate: data.birthDate,
      email: data.email,
      phone: data.phone,
      serviceType: data.serviceType,
    });

    if (!beneficiaryResult.success || !beneficiaryResult.data) {
      throw new Error(beneficiaryResult.error || 'Erro ao criar beneficiário');
    }

    const beneficiaryUuid = beneficiaryResult.data.uuid;
    console.log('[processRegistration] Beneficiário criado:', beneficiaryUuid);

    // 2. Criar usuário no Supabase Auth
    console.log('[processRegistration] Criando usuário no Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.cpf.replace(/\D/g, ''), // Senha temporária = CPF sem formatação
      options: {
        data: {
          full_name: data.fullName,
          cpf: data.cpf,
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(`Erro ao criar usuário: ${authError?.message || 'Usuário não criado'}`);
    }

    const userId = authData.user.id;
    console.log('[processRegistration] Usuário criado:', userId);

    // 3. Criar perfil do usuário no Supabase
    console.log('[processRegistration] Criando perfil no Supabase...');
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        beneficiary_uuid: beneficiaryUuid,
        full_name: data.fullName,
        cpf: data.cpf.replace(/\D/g, ''),
        birth_date: data.birthDate,
        email: data.email,
        phone: data.phone.replace(/\D/g, ''),
        cep: data.cep.replace(/\D/g, ''),
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        service_type: data.serviceType,
        include_specialists: data.includeSpecialists,
        include_psychology: data.includePsychology,
        include_nutrition: data.includeNutrition,
        member_count: data.memberCount,
        plan_value: data.totalPrice,
        discount_percentage: data.discountPercentage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      throw new Error(`Erro ao criar perfil: ${profileError.message}`);
    }

    console.log('[processRegistration] Perfil criado com sucesso');

    // 4. Criar cliente no Asaas
    console.log('[processRegistration] Criando cliente no Asaas...');
    const asaasCustomer = await createAsaasCustomer({
      name: data.fullName,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone,
      postalCode: data.cep,
      address: data.street,
      addressNumber: data.number,
      complement: data.complement,
      province: data.neighborhood,
      beneficiaryUuid,
    });

    console.log('[processRegistration] Cliente Asaas criado:', asaasCustomer.id);

    // 5. Registrar evento de início de pagamento
    await auditService.logEvent({
      eventType: AuditEventType.PAYMENT_INITIATED,
      userId,
      userEmail: data.email,
      status: AuditEventStatus.PENDING,
      eventData: {
        paymentMethod: data.paymentMethod,
        totalPrice: data.totalPrice,
        asaasCustomerId: asaasCustomer.id,
      },
    });

    // 6. Processar pagamento baseado no método escolhido
    let paymentResult: any = {};

    if (data.paymentMethod === 'credit_card' && data.creditCard) {
      console.log('[processRegistration] Processando pagamento com cartão...');
      
      // Criar assinatura com cartão de crédito
      const subscription = await createSubscription({
        customerId: asaasCustomer.id,
        billingType: 'CREDIT_CARD',
        value: data.totalPrice,
        description: `Assinatura AiLun Saúde - ${data.serviceType} - ${data.fullName}`,
        creditCard: data.creditCard,
        creditCardHolderInfo: {
          name: data.fullName,
          email: data.email,
          cpfCnpj: data.cpf,
          postalCode: data.cep,
          addressNumber: data.number,
          addressComplement: data.complement,
          phone: data.phone,
        },
        beneficiaryUuid,
      });

      paymentResult = {
        asaasSubscriptionId: subscription.id,
        paymentMethod: 'credit_card',
      };

    } else if (data.paymentMethod === 'pix') {
      console.log('[processRegistration] Gerando pagamento PIX...');
      
      // Criar cobrança PIX
      const pixPayment = await createPixPayment({
        customerId: asaasCustomer.id,
        value: data.totalPrice,
        description: `Assinatura AiLun Saúde - ${data.fullName}`,
        beneficiaryUuid,
      });

      paymentResult = {
        paymentId: pixPayment.id,
        pixQrCode: pixPayment.encodedImage,
        pixCopyPaste: pixPayment.payload,
        paymentMethod: 'pix',
      };

    } else if (data.paymentMethod === 'boleto') {
      console.log('[processRegistration] Gerando boleto...');
      
      // Criar cobrança via boleto
      const boletoPayment = await createBoletoPayment({
        customerId: asaasCustomer.id,
        value: data.totalPrice,
        description: `Assinatura AiLun Saúde - ${data.fullName}`,
        beneficiaryUuid,
      });

      paymentResult = {
        paymentId: boletoPayment.id,
        boletoUrl: boletoPayment.bankSlipUrl,
        paymentMethod: 'boleto',
      };
    }

    // 7. Criar plano de assinatura no Supabase
    console.log('[processRegistration] Criando plano de assinatura no Supabase...');
    const planResult = await createSubscriptionPlan({
      userId,
      beneficiaryId: beneficiaryUuid,
      serviceType: data.serviceType,
      includeSpecialists: data.includeSpecialists,
      includePsychology: data.includePsychology,
      includeNutrition: data.includeNutrition,
      memberCount: data.memberCount,
      monthlyPrice: data.totalPrice,
      discountPercentage: data.discountPercentage,
      asaasCustomerId: asaasCustomer.id,
      asaasSubscriptionId: paymentResult.asaasSubscriptionId,
      status: data.paymentMethod === 'credit_card' ? 'active' : 'pending',
    });

    if (!planResult.success) {
      console.warn('[processRegistration] Erro ao criar plano, mas registro foi concluído:', planResult.error);
    }

    console.log('[processRegistration] Registro concluído com sucesso!');

    // Registrar evento de cadastro concluído
    await auditService.logEvent({
      eventType: AuditEventType.SIGNUP_COMPLETED,
      userId,
      userEmail: data.email,
      status: AuditEventStatus.SUCCESS,
      eventData: {
        beneficiaryUuid,
        asaasCustomerId: asaasCustomer.id,
        serviceType: data.serviceType,
        paymentMethod: data.paymentMethod,
      },
    });

    // Registrar evento de pagamento bem-sucedido (se aplicável)
    if (data.paymentMethod === 'credit_card') {
      await auditService.logEvent({
        eventType: AuditEventType.PAYMENT_SUCCESS,
        userId,
        userEmail: data.email,
        status: AuditEventStatus.SUCCESS,
        eventData: paymentResult,
      });
    }

    return {
      success: true,
      beneficiaryUuid,
      asaasCustomerId: asaasCustomer.id,
      ...paymentResult,
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

/**
 * Criar pagamento PIX
 */
async function createPixPayment(data: {
  customerId: string;
  value: number;
  description: string;
  beneficiaryUuid: string;
}): Promise<any> {
  const ASAAS_API_KEY = ASAAS_CONFIG.apiKey;
  const ASAAS_API_URL = ASAAS_CONFIG.apiUrl;
  
  if (!ASAAS_API_KEY) {
    throw new Error('Chave API do Asaas não configurada');
  }

  const response = await fetch(`${ASAAS_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
    },
    body: JSON.stringify({
      customer: data.customerId,
      billingType: 'PIX',
      value: data.value,
      dueDate: new Date().toISOString().split('T')[0],
      description: data.description,
      externalReference: data.beneficiaryUuid,
    }),
  });

  const payment = await response.json();

  if (!response.ok) {
    throw new Error(payment.errors?.[0]?.description || 'Erro ao criar pagamento PIX');
  }

  // Buscar QR Code do PIX
  const qrCodeResponse = await fetch(`${ASAAS_API_URL}/payments/${payment.id}/pixQrCode`, {
    headers: {
      'access_token': ASAAS_API_KEY,
    },
  });

  const qrCodeData = await qrCodeResponse.json();

  return {
    ...payment,
    ...qrCodeData,
  };
}

/**
 * Criar pagamento via Boleto
 */
async function createBoletoPayment(data: {
  customerId: string;
  value: number;
  description: string;
  beneficiaryUuid: string;
}): Promise<any> {
  const ASAAS_API_KEY = ASAAS_CONFIG.apiKey;
  const ASAAS_API_URL = ASAAS_CONFIG.apiUrl;
  
  if (!ASAAS_API_KEY) {
    throw new Error('Chave API do Asaas não configurada');
  }

  // Data de vencimento: 3 dias úteis
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 3);

  const response = await fetch(`${ASAAS_API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': ASAAS_API_KEY,
    },
    body: JSON.stringify({
      customer: data.customerId,
      billingType: 'BOLETO',
      value: data.value,
      dueDate: dueDate.toISOString().split('T')[0],
      description: data.description,
      externalReference: data.beneficiaryUuid,
    }),
  });

  const payment = await response.json();

  if (!response.ok) {
    throw new Error(payment.errors?.[0]?.description || 'Erro ao criar boleto');
  }

  return payment;
}

/**
 * Verificar status do pagamento
 */
export async function checkPaymentStatus(paymentId: string): Promise<{
  status: string;
  paid: boolean;
  payment?: any;
}> {
  try {
    const ASAAS_API_KEY = ASAAS_CONFIG.apiKey;
    const ASAAS_API_URL = ASAAS_CONFIG.apiUrl;
    
    if (!ASAAS_API_KEY) {
      throw new Error('Chave API do Asaas não configurada');
    }

    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      headers: {
        'access_token': ASAAS_API_KEY,
      },
    });

    const payment = await response.json();

    return {
      status: payment.status,
      paid: payment.status === 'RECEIVED' || payment.status === 'CONFIRMED',
      payment,
    };
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    return {
      status: 'ERROR',
      paid: false,
    };
  }
}

