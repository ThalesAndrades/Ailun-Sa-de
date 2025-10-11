import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrchestrationRequest {
  action: 'start_consultation' | 'check_queue' | 'get_active_sessions' | 'cancel_consultation' | 'get_notifications';
  serviceType?: 'doctor' | 'specialist' | 'psychologist' | 'nutritionist';
  specialty?: string;
  sessionId?: string;
  consultationId?: string;
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
    const requestData: OrchestrationRequest = await req.json()
    console.log('Orchestrator request:', requestData)

    let response;

    switch (requestData.action) {
      case 'start_consultation':
        response = await startConsultation(supabaseClient, user.id, requestData)
        break
      
      case 'check_queue':
        response = await checkQueue(supabaseClient, user.id)
        break
      
      case 'get_active_sessions':
        response = await getActiveSessions(supabaseClient, user.id)
        break
      
      case 'cancel_consultation':
        response = await cancelConsultation(supabaseClient, user.id, requestData.consultationId)
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
    console.error('Orchestrator error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function startConsultation(supabaseClient: any, userId: string, request: OrchestrationRequest) {
  try {
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

    // Add to queue first
    const queueEntry = {
      user_id: userId,
      service_type: request.serviceType,
      specialty: request.specialty,
      priority: getPriority(request.serviceType),
      status: 'waiting',
      metadata: {
        requested_at: new Date().toISOString(),
        user_agent: 'Ailun Mobile App'
      }
    }

    const { data: queueData, error: queueError } = await supabaseClient
      .from('consultation_queue')
      .insert(queueEntry)
      .select()
      .single()

    if (queueError) {
      console.error('Queue insertion error:', queueError)
      return { success: false, error: 'Erro ao entrar na fila de atendimento' }
    }

    // Call RapiDoc function to actually start consultation
    const { data: consultationData, error: consultationError } = await supabaseClient.functions.invoke('rapidoc', {
      body: {
        action: 'request-consultation',
        serviceType: request.serviceType,
        specialty: request.specialty,
        queueId: queueData.id
      }
    })

    if (consultationError || !consultationData.success) {
      // Update queue status to failed
      await supabaseClient
        .from('consultation_queue')
        .update({ status: 'cancelled' })
        .eq('id', queueData.id)

      return {
        success: false,
        error: consultationData?.error || 'Erro ao iniciar consulta'
      }
    }

    // Create consultation log
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

    // Create active session
    const sessionEntry = {
      user_id: userId,
      consultation_log_id: logData.id,
      session_id: consultationData.sessionId,
      service_type: request.serviceType,
      professional_info: consultationData.professionalInfo || {},
      session_url: consultationData.consultationUrl,
      status: 'active',
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
    }

    await supabaseClient
      .from('active_sessions')
      .insert(sessionEntry)

    // Update queue status
    await supabaseClient
      .from('consultation_queue')
      .update({ status: 'assigned' })
      .eq('id', queueData.id)

    // Send notification
    await createNotification(supabaseClient, userId, {
      title: 'Consulta Iniciada',
      message: `Sua consulta com ${consultationData.professionalInfo?.name || 'profissional'} foi iniciada com sucesso.`,
      type: 'success',
      action_url: consultationData.consultationUrl
    })

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

    const { data: queueStats } = await supabaseClient
      .from('consultation_queue')
      .select('service_type, count(*)')
      .eq('status', 'waiting')

    return {
      success: true,
      data: {
        userQueue: queueItems || [],
        globalStats: queueStats || []
      }
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

async function cancelConsultation(supabaseClient: any, userId: string, consultationId?: string) {
  try {
    if (!consultationId) {
      return { success: false, error: 'ID da consulta é obrigatório' }
    }

    // Update consultation log
    const { error: logError } = await supabaseClient
      .from('consultation_logs')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', consultationId)
      .eq('user_id', userId)

    if (logError) {
      return { success: false, error: 'Erro ao cancelar consulta' }
    }

    // Update active sessions
    await supabaseClient
      .from('active_sessions')
      .update({ status: 'expired' })
      .eq('consultation_log_id', consultationId)

    // Create notification
    await createNotification(supabaseClient, userId, {
      title: 'Consulta Cancelada',
      message: 'Sua consulta foi cancelada com sucesso.',
      type: 'info'
    })

    return {
      success: true,
      message: 'Consulta cancelada com sucesso'
    }
  } catch (error) {
    console.error('Cancel consultation error:', error)
    return { success: false, error: 'Erro ao cancelar consulta' }
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
}) {
  try {
    await supabaseClient
      .from('system_notifications')
      .insert({
        user_id: userId,
        ...notification,
        metadata: {}
      })
  } catch (error) {
    console.error('Create notification error:', error)
  }
}

function getPriority(serviceType?: string): number {
  switch (serviceType) {
    case 'doctor': return 10 // Highest priority
    case 'psychologist': return 7
    case 'specialist': return 5
    case 'nutritionist': return 3
    default: return 1
  }
}