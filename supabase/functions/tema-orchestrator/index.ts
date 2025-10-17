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
  console.log('[EDGE_FUNCTION] Iniciando processamento da requisição')
  console.log('[EDGE_FUNCTION] Method:', req.method)
  console.log('[EDGE_FUNCTION] URL:', req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[EDGE_FUNCTION] Respondendo a requisição OPTIONS')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar variáveis de ambiente
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
    const rapidocClientId = Deno.env.get('RAPIDOC_CLIENT_ID')
    const rapidocToken = Deno.env.get('RAPIDOC_TOKEN')
    
    console.log('[EDGE_FUNCTION] Verificando variáveis de ambiente:')
    console.log('- SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING')
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'OK' : 'MISSING')
    console.log('- ASAAS_API_KEY:', asaasApiKey ? 'OK' : 'MISSING')
    console.log('- RAPIDOC_CLIENT_ID:', rapidocClientId ? 'OK' : 'MISSING')
    console.log('- RAPIDOC_TOKEN:', rapidocToken ? 'OK' : 'MISSING')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log('[EDGE_FUNCTION] Cliente Supabase inicializado')

    // Parse request body
    let requestBody
    try {
      requestBody = await req.json()
      console.log('[EDGE_FUNCTION] Body recebido:', JSON.stringify(requestBody, null, 2))
    } catch (parseError) {
      console.error('[EDGE_FUNCTION] Erro ao parsear JSON:', parseError)
      throw new Error('Corpo da requisição inválido (JSON malformado)')
    }

    const { action, data, paymentId } = requestBody
    console.log('[EDGE_FUNCTION] Ação solicitada:', action)

    switch (action) {
      case 'create_subscription':
        console.log('[EDGE_FUNCTION] Processando criação de assinatura')
        return await handleCreateSubscription(data, supabase)
      
      case 'check_payment_status':
        console.log('[EDGE_FUNCTION] Verificando status do pagamento:', paymentId)
        return await handleCheckPaymentStatus(paymentId, supabase)
      
      default:
        console.error('[EDGE_FUNCTION] Ação não reconhecida:', action)
        throw new Error(`Ação não reconhecida: ${action}`)
    }

  } catch (error) {
    console.error('[EDGE_FUNCTION] Erro crítico:', error)
    console.error('[EDGE_FUNCTION] Stack trace:', error.stack)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
        action: 'error_response'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleCreateSubscription(data: CreateSubscriptionData, supabase: any) {
  console.log('[handleCreateSubscription] =============================================')
  console.log('[handleCreateSubscription] Iniciando criação de assinatura')
  console.log('[handleCreateSubscription] Email:', data?.email)
  console.log('[handleCreateSubscription] Método de pagamento:', data?.paymentMethod)
  console.log('[handleCreateSubscription] Valor total:', data?.totalPrice)
  console.log('[handleCreateSubscription] Tipo de serviço:', data?.serviceType)
  console.log('[handleCreateSubscription] Serviços inclusos:', {
    specialists: data?.includeSpecialists,
    psychology: data?.includePsychology,
    nutrition: data?.includeNutrition,
    memberCount: data?.memberCount
  })
  
  // Validar dados obrigatórios
  if (!data) {
    throw new Error('Dados da assinatura não fornecidos')
  }
  
  if (!data.fullName || !data.cpf || !data.email) {
    throw new Error('Dados obrigatórios não fornecidos (fullName, cpf, email)')
  }
  
  if (!data.paymentMethod || !['credit_card', 'pix', 'boleto'].includes(data.paymentMethod)) {
    throw new Error('Método de pagamento inválido')
  }

  if (!data.totalPrice || data.totalPrice <= 0) {
    throw new Error('Valor do plano inválido')
  }

  if (!data.serviceType) {
    throw new Error('Tipo de serviço não especificado')
  }
  
  console.log('[handleCreateSubscription] Validações iniciais OK')

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
    console.log('[handleCreateSubscription] Valor a ser cobrado:', data.totalPrice)
    console.log('[handleCreateSubscription] Cliente Asaas ID:', asaasCustomer.id)
    let paymentResult: any = {}

    if (data.paymentMethod === 'credit_card' && data.creditCard) {
      console.log('[handleCreateSubscription] Processando cartão de crédito')
      
      // Validar dados do cartão
      if (!data.creditCard.holderName || !data.creditCard.number || !data.creditCard.expiryMonth || !data.creditCard.expiryYear || !data.creditCard.ccv) {
        throw new Error('Dados do cartão de crédito incompletos')
      }
      
      // Criar assinatura com cartão de crédito
      const subscription = await createAsaasSubscription({
        customerId: asaasCustomer.id,
        billingType: 'CREDIT_CARD',
        creditCard: data.creditCard,
        creditCardHolderInfo: {
          name: data.fullName,
          email: data.email,
          cpfCnpj: data.cpf.replace(/\D/g, ''),
          postalCode: data.cep.replace(/\D/g, ''),
          addressNumber: data.number,
          addressComplement: data.complement,
          phone: data.phone.replace(/\D/g, ''),
        },
        beneficiaryUuid,
        value: data.totalPrice,
        serviceType: data.serviceType,
        planDetails: {
          includeSpecialists: data.includeSpecialists,
          includePsychology: data.includePsychology,
          includeNutrition: data.includeNutrition,
          memberCount: data.memberCount,
        }
      })

      console.log('[handleCreateSubscription] Assinatura criada:', subscription.id)
      console.log('[handleCreateSubscription] Status da assinatura:', subscription.status)

      paymentResult = {
        asaasSubscriptionId: subscription.id,
        paymentMethod: 'credit_card',
        subscriptionStatus: subscription.status,
      }

    } else if (data.paymentMethod === 'pix') {
      console.log('[handleCreateSubscription] Processando PIX')
      
      // Criar cobrança PIX mensal
      const pixPayment = await createAsaasPixPayment({
        customerId: asaasCustomer.id,
        value: data.totalPrice,
        description: `Assinatura AiLun Saúde ${data.serviceType} - ${data.fullName}`,
        beneficiaryUuid,
        serviceType: data.serviceType,
      })

      console.log('[handleCreateSubscription] PIX criado:', pixPayment.id)
      console.log('[handleCreateSubscription] QR Code gerado:', pixPayment.encodedImage ? 'SIM' : 'NÃO')

      paymentResult = {
        paymentId: pixPayment.id,
        pixQrCode: pixPayment.encodedImage,
        pixCopyPaste: pixPayment.payload,
        paymentMethod: 'pix',
        paymentStatus: pixPayment.status,
      }

    } else if (data.paymentMethod === 'boleto') {
      console.log('[handleCreateSubscription] Processando Boleto')
      
      // Criar cobrança via boleto
      const boletoPayment = await createAsaasBoletoPayment({
        customerId: asaasCustomer.id,
        value: data.totalPrice,
        description: `Assinatura AiLun Saúde ${data.serviceType} - ${data.fullName}`,
        beneficiaryUuid,
        serviceType: data.serviceType,
      })

      console.log('[handleCreateSubscription] Boleto criado:', boletoPayment.id)
      console.log('[handleCreateSubscription] URL do boleto:', boletoPayment.bankSlipUrl ? 'SIM' : 'NÃO')

      paymentResult = {
        paymentId: boletoPayment.id,
        boletoUrl: boletoPayment.bankSlipUrl,
        paymentMethod: 'boleto',
        paymentStatus: boletoPayment.status,
      }
    } else {
      throw new Error(`Método de pagamento não suportado: ${data.paymentMethod}`)
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
  console.log('[handleCheckPaymentStatus] Verificando status do pagamento:', paymentId)
  
  try {
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
    const asaasApiUrl = 'https://api.asaas.com/v3'
    
    if (!asaasApiKey) {
      throw new Error('ASAAS_API_KEY não configurada')
    }

    if (!paymentId || paymentId.trim() === '') {
      throw new Error('ID do pagamento não fornecido')
    }

    const response = await fetch(`${asaasApiUrl}/payments/${paymentId.trim()}`, {
      method: 'GET',
      headers: {
        'access_token': asaasApiKey,
        'User-Agent': 'AiLun-Saude/1.0',
      },
    })

    const payment = await response.json()
    
    console.log('[handleCheckPaymentStatus] Response status:', response.status)
    console.log('[handleCheckPaymentStatus] Payment status:', payment.status)

    if (!response.ok) {
      const errorMsg = payment.errors?.[0]?.description || payment.message || 'Erro ao consultar pagamento'
      console.error('[handleCheckPaymentStatus] Erro na API:', errorMsg)
      throw new Error(errorMsg)
    }

    const isPaid = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(payment.status)
    const isPending = ['PENDING', 'AWAITING_RISK_ANALYSIS'].includes(payment.status)
    const isOverdue = payment.status === 'OVERDUE'
    const isCanceled = ['REFUNDED', 'CHARGEBACK_REQUESTED'].includes(payment.status)

    console.log('[handleCheckPaymentStatus] Status processado:', {
      status: payment.status,
      isPaid,
      isPending,
      isOverdue,
      isCanceled
    })

    return new Response(
      JSON.stringify({
        success: true,
        status: payment.status,
        paid: isPaid,
        pending: isPending,
        overdue: isOverdue,
        canceled: isCanceled,
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
        pending: false,
        overdue: false,
        canceled: false,
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
  console.log('[createRapidocBeneficiary] ===== INICIANDO CRIAÇÃO BENEFICIÁRIO =====')
  console.log('[createRapidocBeneficiary] Nome:', data.name)
  console.log('[createRapidocBeneficiary] CPF:', data.cpf.replace(/\d(?=\d{4})/g, '*'))
  console.log('[createRapidocBeneficiary] Email:', data.email)
  console.log('[createRapidocBeneficiary] Tipo de serviço:', data.serviceType)
  
  try {
    const rapidocClientId = Deno.env.get('RAPIDOC_CLIENT_ID')
    const rapidocToken = Deno.env.get('RAPIDOC_TOKEN')
    const rapidocBaseUrl = Deno.env.get('RAPIDOC_BASE_URL') || 'https://api.rapidoc.tech'
    
    console.log('[createRapidocBeneficiary] RapiDoc Base URL:', rapidocBaseUrl)
    console.log('[createRapidocBeneficiary] Client ID configurado:', rapidocClientId ? 'SIM' : 'NÃO')
    console.log('[createRapidocBeneficiary] Token configurado:', rapidocToken ? 'SIM' : 'NÃO')
    
    if (!rapidocClientId || !rapidocToken) {
      console.warn('[createRapidocBeneficiary] Credenciais RapiDoc não configuradas, simulando criação')
      // Simular beneficiário para desenvolvimento
      const simulatedBeneficiary = {
        uuid: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        cpf: data.cpf,
        service_type: data.serviceType,
        status: 'active'
      }
      return { success: true, data: simulatedBeneficiary }
    }
    
    const beneficiaryPayload = {
      name: data.name.trim(),
      cpf: data.cpf.replace(/\D/g, ''),
      birth_date: data.birthDate,
      email: data.email.toLowerCase().trim(),
      phone: data.phone.replace(/\D/g, ''),
      service_type: data.serviceType,
    }
    
    console.log('[createRapidocBeneficiary] Payload:', JSON.stringify(beneficiaryPayload, null, 2))

    const response = await fetch(`${rapidocBaseUrl}/beneficiaries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${rapidocToken}`,
        'X-Client-ID': rapidocClientId || '',
        'User-Agent': 'AiLun-Saude-EdgeFunction/1.0',
      },
      body: JSON.stringify(beneficiaryPayload),
    })

    const result = await response.json()
    
    console.log('[createRapidocBeneficiary] Response status:', response.status)
    console.log('[createRapidocBeneficiary] Response:', result)

    if (!response.ok) {
      const errorMsg = result.message || result.error || 'Erro ao criar beneficiário no RapiDoc'
      console.error('[createRapidocBeneficiary] Erro da API:', errorMsg)
      throw new Error(errorMsg)
    }

    console.log('[createRapidocBeneficiary] ===== BENEFICIÁRIO CRIADO COM SUCESSO =====')
    console.log('[createRapidocBeneficiary] UUID retornado:', result.uuid || result.id)
    console.log('[createRapidocBeneficiary] Status:', result.status)
    return { success: true, data: result }

  } catch (error) {
    console.error('[createRapidocBeneficiary] Erro na requisição:', error)
    return { 
      success: false, 
      error: `Falha ao criar beneficiário: ${error.message}`
    }
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

  console.log('[createAsaasCustomer] ===== INICIANDO CRIAÇÃO CLIENTE ASAAS =====')
  console.log('[createAsaasCustomer] Nome:', data.name)
  console.log('[createAsaasCustomer] Email:', data.email)
  console.log('[createAsaasCustomer] CPF mascarado:', data.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4'))
  
  if (!asaasApiKey) {
    throw new Error('ASAAS_API_KEY não configurada')
  }

  // Limpar e validar dados
  const customerData = {
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    cpfCnpj: data.cpf.replace(/\D/g, ''),
    phone: data.phone.replace(/\D/g, ''),
    mobilePhone: data.phone.replace(/\D/g, ''),
    postalCode: data.postalCode.replace(/\D/g, ''),
    address: data.address?.trim(),
    addressNumber: data.addressNumber?.trim(),
    complement: data.complement?.trim() || undefined,
    province: data.province?.trim(),
    externalReference: data.beneficiaryUuid,
    notificationDisabled: false,
  }

  console.log('[createAsaasCustomer] Dados limpos:', {
    ...customerData,
    cpfCnpj: customerData.cpfCnpj.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')
  })

  try {
    const response = await fetch(`${asaasApiUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey,
        'User-Agent': 'AiLun-Saude/1.0',
      },
      body: JSON.stringify(customerData),
    })

    const result = await response.json()
    
    console.log('[createAsaasCustomer] Response status:', response.status)
    console.log('[createAsaasCustomer] Response:', result)

    if (!response.ok) {
      const errorMsg = result.errors?.[0]?.description || result.message || 'Erro ao criar cliente Asaas'
      console.error('[createAsaasCustomer] Erro na API:', errorMsg)
      throw new Error(errorMsg)
    }

    console.log('[createAsaasCustomer] ===== CLIENTE ASAAS CRIADO COM SUCESSO =====')
    console.log('[createAsaasCustomer] ID do Cliente:', result.id)
    console.log('[createAsaasCustomer] Status da resposta:', response.status)
    return result
    
  } catch (error) {
    console.error('[createAsaasCustomer] Erro na requisição:', error)
    throw new Error(`Falha ao criar cliente: ${error.message}`)
  }
}

async function createAsaasSubscription(data: {
  customerId: string
  billingType: string
  creditCard: any
  creditCardHolderInfo: any
  beneficiaryUuid: string
  value: number
  serviceType: string
  planDetails: {
    includeSpecialists: boolean
    includePsychology: boolean
    includeNutrition: boolean
    memberCount: number
  }
}): Promise<any> {
  const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
  const asaasApiUrl = 'https://api.asaas.com/v3'

  console.log('[createAsaasSubscription] ===== INICIANDO CRIAÇÃO ASSINATURA =====')
  console.log('[createAsaasSubscription] Cliente ID:', data.customerId)
  console.log('[createAsaasSubscription] Tipo de cobrança:', data.billingType)
  console.log('[createAsaasSubscription] Valor:', data.value)
  
  if (!asaasApiKey) {
    throw new Error('ASAAS_API_KEY não configurada')
  }

  // Calcular data de vencimento (próximo mês)
  const nextDueDate = new Date()
  nextDueDate.setMonth(nextDueDate.getMonth() + 1)
  nextDueDate.setDate(1) // Primeira cobrança sempre no dia 1
  
  // Construir descrição detalhada do plano
  const planServices = ['Clínico Geral 24h']
  if (data.planDetails.includeSpecialists) planServices.push('Especialistas')
  if (data.planDetails.includePsychology) planServices.push('Psicologia')
  if (data.planDetails.includeNutrition) planServices.push('Nutrição')
  
  const planDescription = `AiLun Saúde ${data.serviceType} - ${planServices.join(' + ')}${data.planDetails.memberCount > 1 ? ` (${data.planDetails.memberCount} membros)` : ''}`

  const subscriptionData: any = {
    customer: data.customerId,
    billingType: data.billingType,
    value: Math.round(data.value * 100) / 100, // Garantir 2 casas decimais
    nextDueDate: nextDueDate.toISOString().split('T')[0],
    cycle: 'MONTHLY',
    description: planDescription,
    externalReference: data.beneficiaryUuid,
    // Adicionar metadados do plano
    observations: `Tipo: ${data.serviceType} | Especialistas: ${data.planDetails.includeSpecialists ? 'Sim' : 'Não'} | Psicologia: ${data.planDetails.includePsychology ? 'Sim' : 'Não'} | Nutrição: ${data.planDetails.includeNutrition ? 'Sim' : 'Não'} | Membros: ${data.planDetails.memberCount}`,
  }

  // Configurar dados do cartão de crédito se necessário
  if (data.billingType === 'CREDIT_CARD' && data.creditCard && data.creditCardHolderInfo) {
    console.log('[createAsaasSubscription] Configurando dados do cartão')
    
    subscriptionData.creditCard = {
      holderName: data.creditCard.holderName.trim(),
      number: data.creditCard.number.replace(/\s/g, ''),
      expiryMonth: data.creditCard.expiryMonth.padStart(2, '0'),
      expiryYear: data.creditCard.expiryYear,
      ccv: data.creditCard.ccv,
    }

    subscriptionData.creditCardHolderInfo = {
      name: data.creditCardHolderInfo.name.trim(),
      email: data.creditCardHolderInfo.email.toLowerCase().trim(),
      cpfCnpj: data.creditCardHolderInfo.cpfCnpj.replace(/\D/g, ''),
      postalCode: data.creditCardHolderInfo.postalCode.replace(/\D/g, ''),
      addressNumber: data.creditCardHolderInfo.addressNumber,
      addressComplement: data.creditCardHolderInfo.addressComplement || undefined,
      phone: data.creditCardHolderInfo.phone.replace(/\D/g, ''),
    }
  }

  console.log('[createAsaasSubscription] Dados da assinatura:', {
    ...subscriptionData,
    creditCard: subscriptionData.creditCard ? {
      ...subscriptionData.creditCard,
      number: subscriptionData.creditCard.number.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 **** **** $4'),
      ccv: '***'
    } : undefined
  })

  try {
    const response = await fetch(`${asaasApiUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey,
        'User-Agent': 'AiLun-Saude/1.0',
      },
      body: JSON.stringify(subscriptionData),
    })

    const result = await response.json()
    
    console.log('[createAsaasSubscription] Response status:', response.status)
    console.log('[createAsaasSubscription] Response:', result)

    if (!response.ok) {
      const errorMsg = result.errors?.[0]?.description || result.message || 'Erro ao criar assinatura'
      console.error('[createAsaasSubscription] Erro na API:', errorMsg)
      throw new Error(errorMsg)
    }

    console.log('[createAsaasSubscription] ===== ASSINATURA CRIADA COM SUCESSO =====')
    console.log('[createAsaasSubscription] ID da Assinatura:', result.id)
    console.log('[createAsaasSubscription] Status:', result.status)
    console.log('[createAsaasSubscription] Próxima cobrança:', result.nextDueDate)
    return result
    
  } catch (error) {
    console.error('[createAsaasSubscription] Erro na requisição:', error)
    throw new Error(`Falha ao criar assinatura: ${error.message}`)
  }
}

async function createAsaasPixPayment(data: {
  customerId: string
  value: number
  description: string
  beneficiaryUuid: string
  serviceType: string
}): Promise<any> {
  const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
  const asaasApiUrl = 'https://api.asaas.com/v3'

  console.log('[createAsaasPixPayment] ===== INICIANDO CRIAÇÃO PAGAMENTO PIX =====')
  console.log('[createAsaasPixPayment] Cliente ID:', data.customerId)
  console.log('[createAsaasPixPayment] Valor:', data.value)
  console.log('[createAsaasPixPayment] Descrição:', data.description)
  
  if (!asaasApiKey) {
    throw new Error('ASAAS_API_KEY não configurada')
  }

  // Data de vencimento: hoje + 1 dia para dar tempo de processar
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 1)

  const paymentData = {
    customer: data.customerId,
    billingType: 'PIX',
    value: Math.round(data.value * 100) / 100, // Garantir 2 casas decimais
    dueDate: dueDate.toISOString().split('T')[0],
    description: data.description.trim(),
    externalReference: data.beneficiaryUuid,
    // Adicionar metadados para identificação
    observations: `Primeira mensalidade - Plano ${data.serviceType}`,
  }

  console.log('[createAsaasPixPayment] Dados do pagamento:', paymentData)

  try {
    // 1. Criar pagamento PIX
    const response = await fetch(`${asaasApiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey,
        'User-Agent': 'AiLun-Saude/1.0',
      },
      body: JSON.stringify(paymentData),
    })

    const payment = await response.json()
    
    console.log('[createAsaasPixPayment] Payment response status:', response.status)
    console.log('[createAsaasPixPayment] Payment response:', payment)

    if (!response.ok) {
      const errorMsg = payment.errors?.[0]?.description || payment.message || 'Erro ao criar pagamento PIX'
      console.error('[createAsaasPixPayment] Erro na API:', errorMsg)
      throw new Error(errorMsg)
    }

    // 2. Buscar QR Code do PIX
    console.log('[createAsaasPixPayment] Buscando QR Code PIX:', payment.id)
    
    const qrCodeResponse = await fetch(`${asaasApiUrl}/payments/${payment.id}/pixQrCode`, {
      method: 'GET',
      headers: {
        'access_token': asaasApiKey,
        'User-Agent': 'AiLun-Saude/1.0',
      },
    })

    const qrCodeData = await qrCodeResponse.json()
    
    console.log('[createAsaasPixPayment] QR Code response status:', qrCodeResponse.status)
    
    if (!qrCodeResponse.ok) {
      console.warn('[createAsaasPixPayment] Erro ao buscar QR Code, mas pagamento foi criado')
      return payment // Retorna só o pagamento se não conseguir o QR Code
    }

    console.log('[createAsaasPixPayment] PIX criado com sucesso com QR Code')
    return {
      ...payment,
      ...qrCodeData,
    }
    
  } catch (error) {
    console.error('[createAsaasPixPayment] Erro na requisição:', error)
    throw new Error(`Falha ao criar pagamento PIX: ${error.message}`)
  }
}

async function createAsaasBoletoPayment(data: {
  customerId: string
  value: number
  description: string
  beneficiaryUuid: string
  serviceType: string
}): Promise<any> {
  const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
  const asaasApiUrl = 'https://api.asaas.com/v3'

  console.log('[createAsaasBoletoPayment] ===== INICIANDO CRIAÇÃO BOLETO =====')
  console.log('[createAsaasBoletoPayment] Cliente ID:', data.customerId)
  console.log('[createAsaasBoletoPayment] Valor:', data.value)
  console.log('[createAsaasBoletoPayment] Descrição:', data.description)
  
  if (!asaasApiKey) {
    throw new Error('ASAAS_API_KEY não configurada')
  }

  // Data de vencimento: 5 dias úteis (considerando fins de semana)
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 5)
  
  // Se cair no fim de semana, move para segunda
  while (dueDate.getDay() === 0 || dueDate.getDay() === 6) {
    dueDate.setDate(dueDate.getDate() + 1)
  }

  const paymentData = {
    customer: data.customerId,
    billingType: 'BOLETO',
    value: Math.round(data.value * 100) / 100, // Garantir 2 casas decimais
    dueDate: dueDate.toISOString().split('T')[0],
    description: data.description.trim(),
    externalReference: data.beneficiaryUuid,
    // Adicionar metadados para identificação
    observations: `Primeira mensalidade - Plano ${data.serviceType}`,
  }

  console.log('[createAsaasBoletoPayment] Dados do boleto:', paymentData)

  try {
    const response = await fetch(`${asaasApiUrl}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey,
        'User-Agent': 'AiLun-Saude/1.0',
      },
      body: JSON.stringify(paymentData),
    })

    const payment = await response.json()
    
    console.log('[createAsaasBoletoPayment] Response status:', response.status)
    console.log('[createAsaasBoletoPayment] Response:', payment)

    if (!response.ok) {
      const errorMsg = payment.errors?.[0]?.description || payment.message || 'Erro ao criar boleto'
      console.error('[createAsaasBoletoPayment] Erro na API:', errorMsg)
      throw new Error(errorMsg)
    }

    console.log('[createAsaasBoletoPayment] Boleto criado com sucesso:', payment.id)
    console.log('[createAsaasBoletoPayment] URL do boleto:', payment.bankSlipUrl)
    
    return payment
    
  } catch (error) {
    console.error('[createAsaasBoletoPayment] Erro na requisição:', error)
    throw new Error(`Falha ao criar boleto: ${error.message}`)
  }
}