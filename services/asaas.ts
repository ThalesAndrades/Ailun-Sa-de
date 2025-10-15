/**
 * Serviço de Integração com Asaas
 * Sistema de pagamentos e assinaturas
 * 
 * Modelo de Negócio:
 * - Assinatura mensal: R$ 89,90
 * - Métodos: Cartão de crédito e PIX
 * - Renovação automática
 */

import { supabase } from './supabase';

// NOTA: Este serviço não deve ser usado diretamente no frontend
// Todas as operações devem passar pela Edge Function 'tema-orchestrator'
const ASAAS_API_KEY = process.env.ASAAS_API_KEY || '';
const ASAAS_API_URL = 'https://api.asaas.com/v3';

// Valor da assinatura mensal
const SUBSCRIPTION_VALUE = 89.90;

interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
}

interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
  value: number;
  nextDueDate: string;
  cycle: 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  description: string;
  endDate?: string;
  maxPayments?: number;
  externalReference?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELED';
}

interface AsaasPayment {
  id: string;
  customer: string;
  subscription?: string;
  billingType: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
  value: number;
  dueDate: string;
  description: string;
  externalReference?: string;
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH' | 'REFUND_REQUESTED' | 'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE' | 'AWAITING_CHARGEBACK_REVERSAL' | 'DUNNING_REQUESTED' | 'DUNNING_RECEIVED' | 'AWAITING_RISK_ANALYSIS';
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  invoiceNumber?: string;
}

interface CreditCardData {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  addressComplement?: string;
  phone: string;
  mobilePhone?: string;
}

/**
 * Fazer requisição à API do Asaas (apenas para Edge Functions)
 * IMPORTANTE: Este método não deve ser usado no frontend React Native
 */
async function asaasRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<any> {
  if (!ASAAS_API_KEY) {
    throw new Error('ASAAS_API_KEY não configurada. Certifique-se de que está executando em Edge Function.');
  }

  try {
    const url = `${ASAAS_API_URL}${endpoint}`;
    
    console.log(`[asaasRequest] ${method} ${url}`);
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'access_token': ASAAS_API_KEY,
        'User-Agent': 'AiLun-Saude/1.0',
      },
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
      console.log(`[asaasRequest] Body:`, JSON.stringify(data, null, 2));
    }

    const response = await fetch(url, options);
    const result = await response.json();

    console.log(`[asaasRequest] Response status:`, response.status);
    console.log(`[asaasRequest] Response:`, result);

    if (!response.ok) {
      const errorMsg = result.errors?.[0]?.description || result.message || 'Erro na requisição ao Asaas';
      console.error(`[asaasRequest] Erro na API:`, errorMsg);
      throw new Error(errorMsg);
    }

    return result;
  } catch (error: any) {
    console.error('[asaasRequest] Erro na requisição:', error);
    throw new Error(`Falha na requisição Asaas: ${error.message}`);
  }
}

/**
 * Criar cliente no Asaas (apenas Edge Functions)
 * No frontend, use a Edge Function 'tema-orchestrator'
 */
export async function createAsaasCustomer(data: {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  beneficiaryUuid?: string;
}): Promise<AsaasCustomer> {
  // Validar e limpar dados de entrada
  const customerData = {
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    cpfCnpj: data.cpf.replace(/\D/g, ''),
    phone: data.phone.replace(/\D/g, ''),
    mobilePhone: data.phone.replace(/\D/g, ''),
    postalCode: data.postalCode?.replace(/\D/g, ''),
    address: data.address?.trim(),
    addressNumber: data.addressNumber?.trim(),
    complement: data.complement?.trim() || undefined,
    province: data.province?.trim(),
    externalReference: data.beneficiaryUuid,
    notificationDisabled: false,
  };

  // Validações básicas
  if (customerData.cpfCnpj.length !== 11) {
    throw new Error('CPF deve ter 11 dígitos');
  }
  
  if (customerData.phone.length < 10) {
    throw new Error('Telefone deve ter pelo menos 10 dígitos');
  }
  
  if (!customerData.email.includes('@')) {
    throw new Error('Email inválido');
  }

  console.log('[createAsaasCustomer] Criando cliente:', {
    ...customerData,
    cpfCnpj: customerData.cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')
  });

  const customer = await asaasRequest('/customers', 'POST', customerData);
  
  // Salvar ID do cliente Asaas no Supabase se estiver em ambiente server
  if (data.beneficiaryUuid && typeof window === 'undefined') {
    try {
      await supabase
        .from('user_profiles')
        .upsert({
          beneficiary_uuid: data.beneficiaryUuid,
          asaas_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        });
      
      console.log('[createAsaasCustomer] Cliente salvo no Supabase:', customer.id);
    } catch (error) {
      console.warn('[createAsaasCustomer] Erro ao salvar no Supabase:', error);
    }
  }

  return customer;
}

/**
 * Buscar cliente no Asaas por CPF
 */
export async function getAsaasCustomerByCPF(cpf: string): Promise<AsaasCustomer | null> {
  try {
    const cleanCPF = cpf.replace(/\D/g, '');
    const result = await asaasRequest(`/customers?cpfCnpj=${cleanCPF}`);
    
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return null;
  }
}

/**
 * Criar assinatura mensal (R$ 89,90)
 */
export async function createSubscription(data: {
  customerId: string;
  billingType: 'CREDIT_CARD' | 'PIX';
  creditCard?: CreditCardData;
  creditCardHolderInfo?: CreditCardHolderInfo;
  beneficiaryUuid?: string;
}): Promise<AsaasSubscription> {
  const subscriptionData: any = {
    customer: data.customerId,
    billingType: data.billingType,
    value: SUBSCRIPTION_VALUE,
    nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Amanhã
    cycle: 'MONTHLY',
    description: 'Assinatura AiLun Saúde - Acesso completo aos serviços de telemedicina',
    externalReference: data.beneficiaryUuid,
  };

  // Se for cartão de crédito, incluir dados do cartão
  if (data.billingType === 'CREDIT_CARD' && data.creditCard && data.creditCardHolderInfo) {
    subscriptionData.creditCard = {
      holderName: data.creditCard.holderName,
      number: data.creditCard.number.replace(/\s/g, ''),
      expiryMonth: data.creditCard.expiryMonth,
      expiryYear: data.creditCard.expiryYear,
      ccv: data.creditCard.ccv,
    };

    subscriptionData.creditCardHolderInfo = {
      name: data.creditCardHolderInfo.name,
      email: data.creditCardHolderInfo.email,
      cpfCnpj: data.creditCardHolderInfo.cpfCnpj.replace(/\D/g, ''),
      postalCode: data.creditCardHolderInfo.postalCode.replace(/\D/g, ''),
      addressNumber: data.creditCardHolderInfo.addressNumber,
      addressComplement: data.creditCardHolderInfo.addressComplement,
      phone: data.creditCardHolderInfo.phone.replace(/\D/g, ''),
      mobilePhone: data.creditCardHolderInfo.mobilePhone?.replace(/\D/g, ''),
    };
  }

  const subscription = await asaasRequest('/subscriptions', 'POST', subscriptionData);

  // Salvar ID da assinatura no Supabase
  if (data.beneficiaryUuid) {
    await supabase
      .from('user_profiles')
      .upsert({
        beneficiary_uuid: data.beneficiaryUuid,
        asaas_subscription_id: subscription.id,
        subscription_status: 'ACTIVE',
        subscription_value: SUBSCRIPTION_VALUE,
        subscription_billing_type: data.billingType,
        updated_at: new Date().toISOString(),
      });
  }

  return subscription;
}

/**
 * Buscar assinatura por ID
 */
export async function getSubscription(subscriptionId: string): Promise<AsaasSubscription> {
  return await asaasRequest(`/subscriptions/${subscriptionId}`);
}

/**
 * Cancelar assinatura
 */
export async function cancelSubscription(
  subscriptionId: string,
  beneficiaryUuid?: string
): Promise<AsaasSubscription> {
  const subscription = await asaasRequest(`/subscriptions/${subscriptionId}`, 'DELETE');

  // Atualizar status no Supabase
  if (beneficiaryUuid) {
    await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'CANCELED',
        updated_at: new Date().toISOString(),
      })
      .eq('beneficiary_uuid', beneficiaryUuid);
  }

  return subscription;
}

/**
 * Listar pagamentos de uma assinatura
 */
export async function getSubscriptionPayments(subscriptionId: string): Promise<AsaasPayment[]> {
  const result = await asaasRequest(`/payments?subscription=${subscriptionId}`);
  return result.data || [];
}

/**
 * Buscar pagamento por ID
 */
export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return await asaasRequest(`/payments/${paymentId}`);
}

/**
 * Verificar status da assinatura do beneficiário
 */
export async function checkSubscriptionStatus(beneficiaryUuid: string): Promise<{
  hasActiveSubscription: boolean;
  subscription?: AsaasSubscription;
  nextPayment?: AsaasPayment;
  status: string;
}> {
  try {
    // Buscar dados do Supabase
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('asaas_subscription_id, subscription_status')
      .eq('beneficiary_uuid', beneficiaryUuid)
      .single();

    if (!profile || !profile.asaas_subscription_id) {
      return {
        hasActiveSubscription: false,
        status: 'NO_SUBSCRIPTION',
      };
    }

    // Buscar assinatura no Asaas
    const subscription = await getSubscription(profile.asaas_subscription_id);

    // Buscar próximo pagamento
    const payments = await getSubscriptionPayments(subscription.id);
    const nextPayment = payments.find(p => p.status === 'PENDING');

    return {
      hasActiveSubscription: subscription.status === 'ACTIVE',
      subscription,
      nextPayment,
      status: subscription.status,
    };
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    return {
      hasActiveSubscription: false,
      status: 'ERROR',
    };
  }
}

/**
 * Processar webhook do Asaas
 */
export async function processAsaasWebhook(event: string, payment: AsaasPayment): Promise<void> {
  try {
    // Buscar beneficiário pelo externalReference
    const beneficiaryUuid = payment.externalReference;
    
    if (!beneficiaryUuid) {
      console.warn('Webhook sem externalReference:', payment.id);
      return;
    }

    // Atualizar status no Supabase baseado no evento
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

        // Registrar pagamento
        await supabase
          .from('payment_logs')
          .insert({
            beneficiary_uuid: beneficiaryUuid,
            payment_id: payment.id,
            value: payment.value,
            status: 'RECEIVED',
            billing_type: payment.billingType,
            due_date: payment.dueDate,
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
        break;

      case 'PAYMENT_REFUNDED':
        await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'REFUNDED',
            updated_at: new Date().toISOString(),
          })
          .eq('beneficiary_uuid', beneficiaryUuid);
        break;
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    throw error;
  }
}

/**
 * Fluxo completo de criação de assinatura
 */
export async function createCompleteSubscription(data: {
  // Dados do beneficiário
  name: string;
  email: string;
  cpf: string;
  phone: string;
  postalCode: string;
  address: string;
  addressNumber: string;
  complement?: string;
  province: string;
  beneficiaryUuid: string;
  
  // Método de pagamento
  billingType: 'CREDIT_CARD' | 'PIX';
  
  // Dados do cartão (se aplicável)
  creditCard?: CreditCardData;
}): Promise<{
  success: boolean;
  subscription?: AsaasSubscription;
  payment?: AsaasPayment;
  pixQrCode?: string;
  pixCopyPaste?: string;
  error?: string;
}> {
  try {
    // 1. Verificar se cliente já existe
    let customer = await getAsaasCustomerByCPF(data.cpf);

    // 2. Criar cliente se não existir
    if (!customer) {
      customer = await createAsaasCustomer({
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        postalCode: data.postalCode,
        address: data.address,
        addressNumber: data.addressNumber,
        complement: data.complement,
        province: data.province,
        beneficiaryUuid: data.beneficiaryUuid,
      });
    }

    // 3. Criar assinatura
    const subscription = await createSubscription({
      customerId: customer.id,
      billingType: data.billingType,
      creditCard: data.creditCard,
      creditCardHolderInfo: data.creditCard ? {
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpf,
        postalCode: data.postalCode,
        addressNumber: data.addressNumber,
        addressComplement: data.complement,
        phone: data.phone,
      } : undefined,
      beneficiaryUuid: data.beneficiaryUuid,
    });

    // 4. Buscar primeiro pagamento
    const payments = await getSubscriptionPayments(subscription.id);
    const firstPayment = payments[0];

    // 5. Se for PIX, buscar QR Code
    let pixQrCode, pixCopyPaste;
    if (data.billingType === 'PIX' && firstPayment) {
      const pixData = await asaasRequest(`/payments/${firstPayment.id}/pixQrCode`);
      pixQrCode = pixData.encodedImage;
      pixCopyPaste = pixData.payload;
    }

    return {
      success: true,
      subscription,
      payment: firstPayment,
      pixQrCode,
      pixCopyPaste,
    };
  } catch (error: any) {
    console.error('Erro ao criar assinatura:', error);
    return {
      success: false,
      error: error.message || 'Erro ao criar assinatura',
    };
  }
}

