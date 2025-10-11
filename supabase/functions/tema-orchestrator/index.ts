import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TemaOrchestrationRequest {
  action: 'create_subscription' | 'check_subscription' | 'cancel_subscription' | 'start_consultation' | 'check_queue' | 'get_active_sessions' | 'get_notifications';
  serviceType?: 'doctor' | 'specialist' | 'psychologist' | 'nutritionist';
  specialty?: string;
  subscriptionData?: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerDocument: string;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get user from auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request
    const requestData: TemaOrchestrationRequest = await req.json()
    console.log('Tema Orchestrator request:', requestData)

    let response;

    switch (requestData.action) {
      case 'create_subscription':
        response = await createAsaasSubscription(supabaseClient, user.id, requestData.subscriptionData)
        break
      
      case 'check_subscription':
        response = await checkAsaasSubscription(supabaseClient, user.id, user.email)
        break
      
      case 'cancel_subscription':
        response = await cancelAsaasSubscription(supabaseClient, user.id)
        break
      
      case 'start_consultation':
        response = await startConsultation(supabaseClient, user.id, requestData)
        break
      
      case 'check_queue':
        response = await checkQueue(supabaseClient, user.id)
        break
      
      case 'get_active_sessions':
        response = await getActiveSessions(supabaseClient, user.id)
        break
      
      case 'get_notifications':
        response = await getNotifications(supabaseClient, user.id)
        break
      
      default:
        response = { success: false, error: 'Ação não reconhecida' }
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Tema Orchestrator error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Asaas Integration Functions
async function createAsaasSubscription(supabaseClient: any, userId: string, subscriptionData: any) {
  try {
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
    const asaasBaseUrl = Deno.env.get('ASAAS_BASE_URL') || 'https://www.asaas.com/api/v3'
    
    if (!asaasApiKey) {
      return { success: false, error: 'Configuração de pagamento não encontrada' }
    }

    // Create customer in Asaas
    const customerResponse = await fetch(`${asaasBaseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey,
      },
      body: JSON.stringify({
        name: subscriptionData.customerName,
        email: subscriptionData.customerEmail,
        phone: subscriptionData.customerPhone,
        cpfCnpj: subscriptionData.customerDocument,
      }),
    })

    if (!customerResponse.ok) {
      throw new Error(`Asaas Customer API error: ${customerResponse.status}`)
    }

    const customerData = await customerResponse.json()

    // Create subscription in Asaas (R$ 89,90)
    const subscriptionResponse = await fetch(`${asaasBaseUrl}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey,
      },
      body: JSON.stringify({
        customer: customerData.id,
        billingType: 'CREDIT_CARD',
        value: 89.90,
        nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        cycle: 'MONTHLY',
        description: 'Assinatura Ailun Saúde - Plano Premium',
      }),
    })

    if (!subscriptionResponse.ok) {
      throw new Error(`Asaas Subscription API error: ${subscriptionResponse.status}`)
    }

    const subscriptionAsaasData = await subscriptionResponse.json()

    // Save subscription data in database
    const { error: dbError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: userId,
        email: subscriptionData.customerEmail,
        full_name: subscriptionData.customerName,
        phone: subscriptionData.customerPhone,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (dbError) {
      console.error('Database error:', dbError)
    }

    // Log subscription creation
    await supabaseClient
      .from('consultation_logs')
      .insert({
        user_id: userId,
        service_type: 'subscription',
        status: 'active',
        success: true,
        metadata: {
          asaas_customer_id: customerData.id,
          asaas_subscription_id: subscriptionAsaasData.id,
          subscription_value: 89.90,
          billing_type: 'MONTHLY',
        }
      })

    // Create notification
    await createNotification(supabaseClient, userId, {
      title: 'Assinatura Criada',
      message: 'Sua assinatura Ailun Saúde foi criada com sucesso! Valor: R$ 89,90/mês',
      type: 'success',
      metadata: {
        subscription_id: subscriptionAsaasData.id,
        value: 89.90
      }
    })

    return {
      success: true,
      data: {
        subscription_id: subscriptionAsaasData.id,
        customer_id: customerData.id,
        payment_url: subscriptionAsaasData.invoiceUrl,
        value: 89.90,
        next_due_date: subscriptionAsaasData.nextDueDate,
        message: 'Assinatura criada com sucesso'
      }
    }

  } catch (error) {
    console.error('Create Asaas subscription error:', error)
    return { success: false, error: 'Erro ao criar assinatura' }
  }
}

async function checkAsaasSubscription(supabaseClient: any, userId: string, userEmail: string) {
  try {
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
    const asaasBaseUrl = Deno.env.get('ASAAS_BASE_URL') || 'https://www.asaas.com/api/v3'
    
    if (!asaasApiKey) {
      return { success: false, error: 'Configuração de pagamento não encontrada' }
    }

    // Get customer by email
    const customerResponse = await fetch(`${asaasBaseUrl}/customers?email=${userEmail}`, {
      method: 'GET',
      headers: {
        'access_token': asaasApiKey,
      },
    })

    if (!customerResponse.ok) {
      return { success: true, subscribed: false, message: 'Cliente não encontrado' }
    }

    const customerData = await customerResponse.json()
    if (!customerData.data || customerData.data.length === 0) {
      return { success: true, subscribed: false, message: 'Cliente não encontrado' }
    }

    const customer = customerData.data[0]

    // Get active subscriptions
    const subscriptionResponse = await fetch(`${asaasBaseUrl}/subscriptions?customer=${customer.id}&status=ACTIVE`, {
      method: 'GET',
      headers: {
        'access_token': asaasApiKey,
      },
    })

    if (!subscriptionResponse.ok) {
      throw new Error(`Asaas Subscription check error: ${subscriptionResponse.status}`)
    }

    const subscriptionData = await subscriptionResponse.json()
    const hasActiveSubscription = subscriptionData.data && subscriptionData.data.length > 0

    let subscriptionInfo = null
    if (hasActiveSubscription) {
      const subscription = subscriptionData.data[0]
      subscriptionInfo = {
        subscription_id: subscription.id,
        value: subscription.value,
        next_due_date: subscription.nextDueDate,
        status: subscription.status,
        cycle: subscription.cycle
      }
    }

    return {
      success: true,
      subscribed: hasActiveSubscription,
      subscription: subscriptionInfo,
      customer_id: customer.id
    }

  } catch (error) {
    console.error('Check Asaas subscription error:', error)
    return { success: false, error: 'Erro ao verificar assinatura' }
  }
}

async function cancelAsaasSubscription(supabaseClient: any, userId: string) {
  try {
    // Get subscription from logs
    const { data: logData } = await supabaseClient
      .from('consultation_logs')
      .select('metadata')
      .eq('user_id', userId)
      .eq('service_type', 'subscription')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!logData?.metadata?.asaas_subscription_id) {
      return { success: false, error: 'Assinatura não encontrada' }
    }

    const asaasApiKey = Deno.env.get('ASAAS_API_KEY')
    const asaasBaseUrl = Deno.env.get('ASAAS_BASE_URL') || 'https://www.asaas.com/api/v3'

    // Cancel subscription in Asaas
    const cancelResponse = await fetch(`${asaasBaseUrl}/subscriptions/${logData.metadata.asaas_subscription_id}`, {
      method: 'DELETE',
      headers: {
        'access_token': asaasApiKey,
      },
    })

    if (!cancelResponse.ok) {
      throw new Error(`Asaas Cancel API error: ${cancelResponse.status}`)
    }

    // Update log status
    await supabaseClient
      .from('consultation_logs')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('service_type', 'subscription')
      .eq('status', 'active')

    // Create notification
    await createNotification(supabaseClient, userId, {
      title: 'Assinatura Cancelada',
      message: 'Sua assinatura foi cancelada com sucesso.',
      type: 'info'
    })

    return {
      success: true,
      message: 'Assinatura cancelada com sucesso'
    }

  } catch (error) {
    console.error('Cancel Asaas subscription error:', error)
    return { success: false, error: 'Erro ao cancelar assinatura' }
  }
}

// Consultation Functions (reusing from orchestrator)
async function startConsultation(supabaseClient: any, userId: string, request: TemaOrchestrationRequest) {
  try {
    // Check if user has active subscription
    const subscriptionCheck = await checkAsaasSubscription(supabaseClient, userId, '')
    if (!subscriptionCheck.subscribed) {
      return {
        success: false,
        error: 'Assinatura ativa necessária para acessar consultas',
        requires_subscription: true
      }
    }

    // Clean expired sessions first
    await supabaseClient.rpc('clean_expired_sessions')

    // Check if user has active sessions
    const { data: activeSessions } = await supabaseClient
      .from('active_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    if (activeSessions && activeSessions.length > 0) {
      return {
        success: false,
        error: 'Você já tem uma consulta ativa. Finalize antes de iniciar outra.',
        activeSession: activeSessions[0]
      }
    }

    // Add to queue and call RapiDoc
    const queueEntry = {
      user_id: userId,
      service_type: request.serviceType,
      specialty: request.specialty,
      priority: getPriority(request.serviceType),
      status: 'waiting',
      metadata: {
        requested_at: new Date().toISOString(),
        user_agent: 'Ailun Saúde App'
      }
    }

    const { data: queueData } = await supabaseClient
      .from('consultation_queue')
      .insert(queueEntry)
      .select()
      .single()

    // Call RapiDoc function
    const { data: consultationData } = await supabaseClient.functions.invoke('rapidoc', {
      body: {
        action: 'request-consultation',
        serviceType: request.serviceType,
        specialty: request.specialty,
        queueId: queueData.id
      }
    })

    if (!consultationData.success) {
      await supabaseClient
        .from('consultation_queue')
        .update({ status: 'cancelled' })
        .eq('id', queueData.id)

      return {
        success: false,
        error: consultationData?.error || 'Erro ao iniciar consulta'
      }
    }

    // Create consultation log and active session
    const logEntry = {
      user_id: userId,
      service_type: request.serviceType,
      session_id: consultationData.sessionId,
      professional_name: consultationData.professionalInfo?.name,
      specialty: consultationData.professionalInfo?.specialty || request.specialty,
      status: 'active',
      success: true,
      consultation_url: consultationData.consultationUrl,
      estimated_wait_time: consultationData.estimatedWaitTime,
      professional_rating: consultationData.professionalInfo?.rating,
      metadata: consultationData
    }

    const { data: logData } = await supabaseClient
      .from('consultation_logs')
      .insert(logEntry)
      .select()
      .single()

    const sessionEntry = {
      user_id: userId,
      consultation_log_id: logData.id,
      session_id: consultationData.sessionId,
      service_type: request.serviceType,
      professional_info: consultationData.professionalInfo || {},
      session_url: consultationData.consultationUrl,
      status: 'active',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString()
    }

    await supabaseClient
      .from('active_sessions')
      .insert(sessionEntry)

    await supabaseClient
      .from('consultation_queue')
      .update({ status: 'assigned' })
      .eq('id', queueData.id)

    return {
      success: true,
      data: {
        consultationLog: logData,
        session: consultationData,
        message: 'Consulta iniciada com sucesso'
      }
    }

  } catch (error) {
    console.error('Start consultation error:', error)
    return { success: false, error: 'Erro ao iniciar consulta' }
  }
}

async function checkQueue(supabaseClient: any, userId: string) {
  try {
    const { data: queueItems } = await supabaseClient
      .from('consultation_queue')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['waiting', 'processing'])
      .order('created_at', { ascending: false })
      .limit(5)

    return {
      success: true,
      data: queueItems || []
    }
  } catch (error) {
    console.error('Check queue error:', error)
    return { success: false, error: 'Erro ao verificar fila' }
  }
}

async function getActiveSessions(supabaseClient: any, userId: string) {
  try {
    const { data: sessions } = await supabaseClient
      .from('active_sessions')
      .select(`
        *,
        consultation_logs (
          professional_name,
          specialty,
          status,
          estimated_wait_time
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    return {
      success: true,
      data: sessions || []
    }
  } catch (error) {
    console.error('Get active sessions error:', error)
    return { success: false, error: 'Erro ao buscar sessões ativas' }
  }
}

async function getNotifications(supabaseClient: any, userId: string) {
  try {
    const { data: notifications } = await supabaseClient
      .from('system_notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    return {
      success: true,
      data: notifications || []
    }
  } catch (error) {
    console.error('Get notifications error:', error)
    return { success: false, error: 'Erro ao buscar notificações' }
  }
}

async function createNotification(supabaseClient: any, userId: string, notification: {
  title: string;
  message: string;
  type: string;
  action_url?: string;
  metadata?: any;
}) {
  try {
    await supabaseClient
      .from('system_notifications')
      .insert({
        user_id: userId,
        ...notification,
        metadata: notification.metadata || {}
      })
  } catch (error) {
    console.error('Create notification error:', error)
  }
}

function getPriority(serviceType?: string): number {
  switch (serviceType) {
    case 'doctor': return 10
    case 'psychologist': return 7
    case 'specialist': return 5
    case 'nutritionist': return 3
    default: return 1
  }
}