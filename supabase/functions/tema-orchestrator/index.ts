import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface CreateSubscriptionData {
  // Dados Pessoais
  fullName: string
  cpf: string
  birthDate: string
  email: string
  phone: string
  
  // Endereço
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  
  // Plano
  includeSpecialists: boolean
  includePsychology: boolean
  includeNutrition: boolean
  memberCount: number
  serviceType: string
  totalPrice: number
  discountPercentage: number
  
  // Pagamento
  paymentMethod: 'credit_card' | 'pix' | 'boleto'
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, data, paymentId } = await req.json()

    switch (action) {
      case 'create_subscription':
        return await handleCreateSubscription(data, supabase)
      
      case 'check_payment_status':
        return await handleCheckPaymentStatus(paymentId, supabase)
      
      default:
        throw new Error(`Ação não reconhecida: ${action}`)
    }

  } catch (error) {
    console.error('Erro no tema-orchestrator:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleCreateSubscription(data: CreateSubscriptionData, supabase: any) {
  console.log('[handleCreateSubscription] Iniciando criação de assinatura:', data.email)

  try {
    // 1. Criar beneficiário via RapiDoc
    console.log('[handleCreateSubscription] Criando beneficiário...')
    const beneficiaryResult = await createRapidocBeneficiary({
      name: data.fullName,
      cpf: data.cpf,
      birthDate: data.birthDate,
      email: data.email,
      phone: data.phone,
      serviceType: data.serviceType,
    })

    if (!beneficiaryResult.success) {
      throw new Error(beneficiaryResult.error || 'Erro ao criar beneficiário')
    }

    const beneficiaryUuid = beneficiaryResult.data.uuid
    console.log('[handleCreateSubscription] Beneficiário criado:', beneficiaryUuid)

    // 2. Criar usuário no Supabase Auth
    console.log('[handleCreateSubscription] Criando usuário...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.cpf, // Senha temporária = CPF
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        cpf: data.cpf,
      },
    })

    if (authError || !authData.user) {
      throw new Error(`Erro ao criar usuário: ${authError?.message || 'Usuário não criado'}`)
    }

    const userId = authData.user.id
    console.log('[handleCreateSubscription] Usuário criado:', userId)

    // 3. Criar cliente no Asaas
    console.log('[handleCreateSubscription] Criando cliente Asaas...')
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
    })

    console.log('[handleCreateSubscription] Cliente Asaas criado:', asaasCustomer.id)

    // 4. Processar pagamento
    console.log('[handleCreateSubscription] Processando pagamento:', data.paymentMethod)
    let paymentResult: any = {}

    if (data.paymentMethod === 'credit_card' && data.creditCard) {
      // Criar assinatura com cartão de crédito
      const subscription = await createAsaasSubscription({
        customerId: asaasCustomer.id,
        billingType: 'CREDIT_CARD',
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
        value: data.totalPrice,
      })

      paymentResult = {
        asaasSubscriptionId: subscription.id,
        paymentMethod: 'credit_card',
      }

    } else if (data.paymentMethod === 'pix') {
      // Criar cobrança PIX
      const pixPayment = await createAsaasPixPayment({
        customerId: asaasCustomer.id,
        value: data.totalPrice,
        description: `Assinatura AiLun Saúde - ${data.fullName}`,
        beneficiaryUuid,
      })

      paymentResult = {
        paymentId: pixPayment.id,
        pixQrCode: pixPayment.encodedImage,
        pixCopyPaste: pixPayment.payload,
        paymentMethod: 'pix',
      }

    } else if (data.paymentMethod === 'boleto') {
      // Criar cobrança via boleto
      const boletoPayment = await createAsaasBoletoPayment({
        customerId: asaasCustomer.id,
        value: data.totalPrice,
        description: `Assinatura AiLun Saúde - ${data.fullName}`,
        beneficiaryUuid,
      })

      paymentResult = {
        paymentId: boletoPayment.id,
        boletoUrl: boletoPayment.bankSlipUrl,
        paymentMethod: 'boleto',
      }
    }

    // 5. Salvar dados no Supabase
    console.log('[handleCreateSubscription] Salvando dados no Supabase...')
    
    // Criar perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: data.email,
        full_name: data.fullName,
        phone: data.phone,
        birth_date: data.birthDate,
        is_active_beneficiary: true,
        plan_type: data.serviceType,
        plan_details: {
          includeSpecialists: data.includeSpecialists,
          includePsychology: data.includePsychology,
          includeNutrition: data.includeNutrition,
          memberCount: data.memberCount,
          totalPrice: data.totalPrice,
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.warn('[handleCreateSubscription] Erro ao criar perfil:', profileError.message)
    }

    // Criar beneficiário
    const { error: beneficiaryError } = await supabase
      .from('beneficiaries')
      .insert({
        user_id: userId,
        beneficiary_uuid: beneficiaryUuid,
        cpf: data.cpf,
        full_name: data.fullName,
        birth_date: data.birthDate,
        email: data.email,
        phone: data.phone,
        service_type: data.serviceType,
        is_primary: true,
        status: 'active',
        has_active_plan: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (beneficiaryError) {
      console.warn('[handleCreateSubscription] Erro ao criar beneficiário:', beneficiaryError.message)
    }

    // Criar plano de assinatura
    const { error: planError } = await supabase
      .from('subscription_plans')
      .insert({
        user_id: userId,
        beneficiary_id: beneficiaryUuid,
        plan_name: `Plano ${data.serviceType}`,
        service_type: data.serviceType,
        include_clinical: true,
        include_specialists: data.includeSpecialists,
        include_psychology: data.includePsychology,
        include_nutrition: data.includeNutrition,
        member_count: data.memberCount,
        discount_percentage: data.discountPercentage,
        base_price: data.totalPrice,
        total_price: data.totalPrice,
        asaas_customer_id: asaasCustomer.id,
        asaas_subscription_id: paymentResult.asaasSubscriptionId,
        payment_method: data.paymentMethod,
        billing_cycle: 'monthly',
        status: data.paymentMethod === 'credit_card' ? 'active' : 'pending',
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (planError) {
      console.warn('[handleCreateSubscription] Erro ao criar plano:', planError.message)
    }

    console.log('[handleCreateSubscription] Registro concluído com sucesso!')

    return new Response(
      JSON.stringify({
        success: true,
        beneficiaryUuid,
        asaasCustomerId: asaasCustomer.id,
        ...paymentResult,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[handleCreateSubscription] Erro:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro ao criar assinatura'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleCheckPaymentStatus(paymentId: string, supabase: any) {
  try {
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
    const asaasApiUrl = 'https://api.asaas.com/v3'

    const response = await fetch(`${asaasApiUrl}/payments/${paymentId}`, {
      headers: {
        'access_token': asaasApiKey,
      },
    })

    const payment = await response.json()

    return new Response(
      JSON.stringify({
        success: true,
        status: payment.status,
        paid: payment.status === 'RECEIVED' || payment.status === 'CONFIRMED',
        payment,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('[handleCheckPaymentStatus] Erro:', error)
    return new Response(
      JSON.stringify({
        success: false,
        status: 'ERROR',
        paid: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}

// Funções auxiliares do RapiDoc
async function createRapidocBeneficiary(data: {
  name: string
  cpf: string
  birthDate: string
  email: string
  phone: string
  serviceType: string
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const rapidocClientId = Deno.env.get('RAPIDOC_CLIENT_ID')
    const rapidocToken = Deno.env.get('RAPIDOC_TOKEN')
    const rapidocBaseUrl = Deno.env.get('RAPIDOC_BASE_URL') || 'https://api.rapidoc.tech'

    const response = await fetch(`${rapidocBaseUrl}/beneficiaries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rapidocToken}`,
        'X-Client-ID': rapidocClientId,
      },
      body: JSON.stringify({
        name: data.name,
        cpf: data.cpf,
        birth_date: data.birthDate,
        email: data.email,
        phone: data.phone,
        service_type: data.serviceType,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Erro ao criar beneficiário')
    }

    return { success: true, data: result }

  } catch (error) {
    console.error('[createRapidocBeneficiary] Erro:', error)
    return { success: false, error: error.message }
  }
}

// Funções auxiliares do Asaas
async function createAsaasCustomer(data: {
  name: string
  email: string
  cpf: string
  phone: string
  postalCode: string
  address: string
  addressNumber: string
  complement?: string
  province: string
  beneficiaryUuid: string
}): Promise<any> {
  const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
  const asaasApiUrl = 'https://api.asaas.com/v3'

  const response = await fetch(`${asaasApiUrl}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey,
    },
    body: JSON.stringify({
      name: data.name,
      email: data.email,
      cpfCnpj: data.cpf,
      phone: data.phone,
      mobilePhone: data.phone,
      postalCode: data.postalCode,
      address: data.address,
      addressNumber: data.addressNumber,
      complement: data.complement,
      province: data.province,
      externalReference: data.beneficiaryUuid,
      notificationDisabled: false,
    }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.description || 'Erro ao criar cliente Asaas')
  }

  return result
}

async function createAsaasSubscription(data: {
  customerId: string
  billingType: string
  creditCard: any
  creditCardHolderInfo: any
  beneficiaryUuid: string
  value: number
}): Promise<any> {
  const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
  const asaasApiUrl = 'https://api.asaas.com/v3'

  const subscriptionData: any = {
    customer: data.customerId,
    billingType: data.billingType,
    value: data.value,
    nextDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cycle: 'MONTHLY',
    description: 'Assinatura AiLun Saúde - Acesso completo aos serviços de telemedicina',
    externalReference: data.beneficiaryUuid,
  }

  if (data.creditCard && data.creditCardHolderInfo) {
    subscriptionData.creditCard = {
      holderName: data.creditCard.holderName,
      number: data.creditCard.number,
      expiryMonth: data.creditCard.expiryMonth,
      expiryYear: data.creditCard.expiryYear,
      ccv: data.creditCard.ccv,
    }

    subscriptionData.creditCardHolderInfo = {
      name: data.creditCardHolderInfo.name,
      email: data.creditCardHolderInfo.email,
      cpfCnpj: data.creditCardHolderInfo.cpfCnpj,
      postalCode: data.creditCardHolderInfo.postalCode,
      addressNumber: data.creditCardHolderInfo.addressNumber,
      addressComplement: data.creditCardHolderInfo.addressComplement,
      phone: data.creditCardHolderInfo.phone,
      mobilePhone: data.creditCardHolderInfo.mobilePhone,
    }
  }

  const response = await fetch(`${asaasApiUrl}/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey,
    },
    body: JSON.stringify(subscriptionData),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.errors?.[0]?.description || 'Erro ao criar assinatura')
  }

  return result
}

async function createAsaasPixPayment(data: {
  customerId: string
  value: number
  description: string
  beneficiaryUuid: string
}): Promise<any> {
  const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
  const asaasApiUrl = 'https://api.asaas.com/v3'

  const response = await fetch(`${asaasApiUrl}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey,
    },
    body: JSON.stringify({
      customer: data.customerId,
      billingType: 'PIX',
      value: data.value,
      dueDate: new Date().toISOString().split('T')[0],
      description: data.description,
      externalReference: data.beneficiaryUuid,
    }),
  })

  const payment = await response.json()

  if (!response.ok) {
    throw new Error(payment.errors?.[0]?.description || 'Erro ao criar pagamento PIX')
  }

  // Buscar QR Code do PIX
  const qrCodeResponse = await fetch(`${asaasApiUrl}/payments/${payment.id}/pixQrCode`, {
    headers: {
      'access_token': asaasApiKey,
    },
  })

  const qrCodeData = await qrCodeResponse.json()

  return {
    ...payment,
    ...qrCodeData,
  }
}

async function createAsaasBoletoPayment(data: {
  customerId: string
  value: number
  description: string
  beneficiaryUuid: string
}): Promise<any> {
  const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
  const asaasApiUrl = 'https://api.asaas.com/v3'

  // Data de vencimento: 3 dias úteis
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 3)

  const response = await fetch(`${asaasApiUrl}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': asaasApiKey,
    },
    body: JSON.stringify({
      customer: data.customerId,
      billingType: 'BOLETO',
      value: data.value,
      dueDate: dueDate.toISOString().split('T')[0],
      description: data.description,
      externalReference: data.beneficiaryUuid,
    }),
  })

  const payment = await response.json()

  if (!response.ok) {
    throw new Error(payment.errors?.[0]?.description || 'Erro ao criar boleto')
  }

  return payment
}