import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RAPIDOC_BASE_URL = 'https://api.rapidoc.tech/tema/api'
const RAPIDOC_CONTENT_TYPE = 'application/vnd.rapidoc.tema-v2+json'

interface RapidocRequest {
  action: string;
  beneficiaryUuid?: string;
  specialtyUuid?: string;
  dateInitial?: string;
  dateFinal?: string;
  availabilityUuid?: string;
  referralUuid?: string;
  approveAdditionalPayment?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const rapidocToken = Deno.env.get('RAPIDOC_TOKEN')
    const rapidocClientId = Deno.env.get('RAPIDOC_CLIENT_ID')

    if (!rapidocToken || !rapidocClientId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração da API RapiDoc não encontrada' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const requestData: RapidocRequest = await req.json()

    // Validate request
    if (!requestData.action) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ação não especificada' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get user authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não autenticado' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client for user validation
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Usuário não autenticado' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Process different actions
    let apiResponse;

    switch (requestData.action) {
      case 'request-immediate-appointment':
        apiResponse = await requestImmediateAppointment(
          rapidocToken,
          rapidocClientId,
          requestData.beneficiaryUuid!
        )
        break

      case 'list-specialties':
        apiResponse = await listSpecialties(rapidocToken, rapidocClientId)
        break

      case 'check-referral':
        apiResponse = await checkReferral(
          rapidocToken,
          rapidocClientId,
          requestData.beneficiaryUuid!,
          requestData.specialtyUuid!
        )
        break

      case 'list-availability':
        apiResponse = await listAvailability(
          rapidocToken,
          rapidocClientId,
          requestData.specialtyUuid!,
          requestData.dateInitial!,
          requestData.dateFinal!,
          requestData.beneficiaryUuid!
        )
        break

      case 'schedule-appointment':
        apiResponse = await scheduleAppointment(
          rapidocToken,
          rapidocClientId,
          requestData.beneficiaryUuid!,
          requestData.availabilityUuid!,
          requestData.specialtyUuid!,
          requestData.referralUuid,
          requestData.approveAdditionalPayment
        )
        break

      case 'list-appointments':
        apiResponse = await listAppointments(rapidocToken, rapidocClientId)
        break

      case 'cancel-appointment':
        apiResponse = await cancelAppointment(
          rapidocToken,
          rapidocClientId,
          requestData.availabilityUuid! // appointmentUuid
        )
        break

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Ação não reconhecida' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

    return new Response(
      JSON.stringify(apiResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('RapiDoc API Error:', {
      message: error.message,
      timestamp: new Date().toISOString(),
      stack: error.stack
    })
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// ==================== API FUNCTIONS ====================

async function rapidocRequest(
  token: string,
  clientId: string,
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'clientId': clientId,
    'Content-Type': RAPIDOC_CONTENT_TYPE,
  }

  const options: RequestInit = {
    method,
    headers,
  }

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${RAPIDOC_BASE_URL}${endpoint}`, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`RapiDoc API Error: ${response.status} - ${errorText}`)
  }

  return await response.json()
}

async function requestImmediateAppointment(
  token: string,
  clientId: string,
  beneficiaryUuid: string
) {
  try {
    const response = await rapidocRequest(
      token,
      clientId,
      `/beneficiaries/${beneficiaryUuid}/request-appointment`,
      'GET'
    )

    return {
      success: response.success,
      data: {
        consultationUrl: response.data?.url || response.data?.appointmentUrl,
      },
      message: response.message
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function listSpecialties(token: string, clientId: string) {
  try {
    const response = await rapidocRequest(token, clientId, '/specialties', 'GET')

    // Filtrar nutrição
    const specialties = response.data.filter(
      (specialty: any) => !specialty.name.toLowerCase().includes('nutrição')
    )

    return {
      success: response.success,
      data: specialties,
      message: response.message
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function checkReferral(
  token: string,
  clientId: string,
  beneficiaryUuid: string,
  specialtyUuid: string
) {
  try {
    const response = await rapidocRequest(
      token,
      clientId,
      '/beneficiary-medical-referrals',
      'GET'
    )

    const referrals = response.data.filter(
      (referral: any) => 
        referral.beneficiaryUuid === beneficiaryUuid &&
        referral.specialtyUuid === specialtyUuid &&
        referral.status === 'active'
    )

    return {
      success: true,
      hasReferral: referrals.length > 0,
      referral: referrals[0] || null,
      message: referrals.length > 0 
        ? 'Encaminhamento ativo encontrado' 
        : 'Nenhum encaminhamento ativo'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function listAvailability(
  token: string,
  clientId: string,
  specialtyUuid: string,
  dateInitial: string,
  dateFinal: string,
  beneficiaryUuid: string
) {
  try {
    const params = new URLSearchParams({
      specialtyUuid,
      dateInitial,
      dateFinal,
      beneficiaryUuid,
    })

    const response = await rapidocRequest(
      token,
      clientId,
      `/specialty-availability?${params}`,
      'GET'
    )

    return {
      success: response.success,
      data: response.data,
      message: response.message
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function scheduleAppointment(
  token: string,
  clientId: string,
  beneficiaryUuid: string,
  availabilityUuid: string,
  specialtyUuid: string,
  referralUuid?: string,
  approveAdditionalPayment?: boolean
) {
  try {
    const body: any = {
      beneficiaryUuid,
      availabilityUuid,
      specialtyUuid,
    }

    if (referralUuid) {
      body.beneficiaryMedicalReferralUuid = referralUuid
    } else {
      body.approveAdditionalPayment = approveAdditionalPayment ?? true
    }

    const response = await rapidocRequest(
      token,
      clientId,
      '/appointments',
      'POST',
      body
    )

    return {
      success: response.success,
      data: response.data,
      message: response.message || 'Agendamento realizado com sucesso'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function listAppointments(token: string, clientId: string) {
  try {
    const response = await rapidocRequest(token, clientId, '/appointments', 'GET')

    return {
      success: response.success,
      data: response.data,
      message: response.message
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

async function cancelAppointment(
  token: string,
  clientId: string,
  appointmentUuid: string
) {
  try {
    const response = await rapidocRequest(
      token,
      clientId,
      `/appointments/${appointmentUuid}`,
      'DELETE'
    )

    return {
      success: response.success,
      message: response.message || 'Agendamento cancelado com sucesso'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

