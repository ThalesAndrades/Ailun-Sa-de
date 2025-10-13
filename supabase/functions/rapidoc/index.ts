import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RapidocRequest {
  action: string;
  serviceType: 'doctor' | 'specialist' | 'psychologist' | 'nutritionist';
  userProfile?: {
    name: string;
    email: string;
    phone?: string;
  };
  urgency?: 'low' | 'medium' | 'high';
  specialtyArea?: string;
  queueId?: string;
}

interface RapidocApiResponse {
  success: boolean;
  sessionId?: string;
  consultationUrl?: string;
  estimatedWaitTime?: number;
  professionalInfo?: {
    name: string;
    specialty: string;
    rating: number;
  };
  message?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const rapidocClientId = Deno.env.get('RAPIDOC_CLIENT_ID')
    const rapidocToken = Deno.env.get('RAPIDOC_TOKEN')
    const rapidocBaseUrl = Deno.env.get('RAPIDOC_BASE_URL')

    if (!rapidocClientId || !rapidocToken || !rapidocBaseUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Configuração da API não encontrada' 
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
    if (!requestData.action || !requestData.serviceType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Dados da solicitação inválidos' 
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

    // Process different service types
    let apiResponse: RapidocApiResponse;

    switch (requestData.serviceType) {
      case 'doctor':
        apiResponse = await requestDoctorConsultation(
          rapidocBaseUrl, 
          rapidocClientId, 
          rapidocToken, 
          requestData.userProfile || { name: 'Usuário', email: user.email || '' },
          requestData.urgency || 'high'
        )
        break;

      case 'specialist':
        apiResponse = await requestSpecialistConsultation(
          rapidocBaseUrl, 
          rapidocClientId, 
          rapidocToken, 
          requestData.userProfile || { name: 'Usuário', email: user.email || '' },
          requestData.specialtyArea || 'Clínica Geral'
        )
        break;

      case 'psychologist':
        apiResponse = await requestPsychologyConsultation(
          rapidocBaseUrl, 
          rapidocClientId, 
          rapidocToken, 
          requestData.userProfile || { name: 'Usuário', email: user.email || '' }
        )
        break;

      case 'nutritionist':
        apiResponse = await requestNutritionConsultation(
          rapidocBaseUrl, 
          rapidocClientId, 
          rapidocToken, 
          requestData.userProfile || { name: 'Usuário', email: user.email || '' }
        )
        break;

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Tipo de serviço não reconhecido' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
    }

    // Log consultation request for tracking (production-ready)
    await logConsultationRequest(supabaseClient, user.id, requestData.serviceType, apiResponse)

    return new Response(
      JSON.stringify(apiResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    // Production error logging
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

// Production-ready API calls with real RapiDoc integration
async function requestDoctorConsultation(
  baseUrl: string, 
  clientId: string, 
  token: string, 
  userProfile: any, 
  urgency: string
): Promise<RapidocApiResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/consultations/immediate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-ID': clientId,
        'X-Service-Type': 'general_medicine',
      },
      body: JSON.stringify({
        patient: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        },
        service: {
          type: 'immediate_consultation',
          specialty: 'general_medicine',
          urgency: urgency,
        },
        metadata: {
          platform: 'ailun_health',
          timestamp: new Date().toISOString(),
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`RapiDoc API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      sessionId: data.session_id,
      consultationUrl: data.consultation_url,
      estimatedWaitTime: data.estimated_wait_time || 3,
      professionalInfo: {
        name: data.professional?.name || 'Médico Disponível',
        specialty: 'Clínica Geral',
        rating: data.professional?.rating || 4.8,
      },
      message: 'Conexão estabelecida com sucesso'
    }
  } catch (error) {
    return {
      success: false,
      error: 'Não foi possível conectar com o serviço médico no momento. Tente novamente em alguns minutos.'
    }
  }
}

async function requestSpecialistConsultation(
  baseUrl: string, 
  clientId: string, 
  token: string, 
  userProfile: any, 
  specialtyArea: string
): Promise<RapidocApiResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/consultations/specialist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-ID': clientId,
        'X-Service-Type': 'specialist',
      },
      body: JSON.stringify({
        patient: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        },
        service: {
          type: 'specialist_consultation',
          specialty: specialtyArea.toLowerCase().replace(/\s+/g, '_'),
          urgency: 'medium',
        },
        metadata: {
          platform: 'ailun_health',
          timestamp: new Date().toISOString(),
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`RapiDoc Specialist API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      sessionId: data.session_id,
      consultationUrl: data.consultation_url,
      estimatedWaitTime: data.estimated_wait_time || 10,
      professionalInfo: {
        name: data.specialist?.name || `Especialista em ${specialtyArea}`,
        specialty: specialtyArea,
        rating: data.specialist?.rating || 4.9,
      },
      message: `Agendamento confirmado com especialista em ${specialtyArea}`
    }
  } catch (error) {
    return {
      success: false,
      error: `Especialista em ${specialtyArea} não disponível no momento. Tente novamente mais tarde.`
    }
  }
}

async function requestPsychologyConsultation(
  baseUrl: string, 
  clientId: string, 
  token: string, 
  userProfile: any
): Promise<RapidocApiResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/consultations/psychology`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-ID': clientId,
        'X-Service-Type': 'psychology',
      },
      body: JSON.stringify({
        patient: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        },
        service: {
          type: 'psychology_consultation',
          specialty: 'clinical_psychology',
          urgency: 'medium',
        },
        metadata: {
          platform: 'ailun_health',
          timestamp: new Date().toISOString(),
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`RapiDoc Psychology API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      sessionId: data.session_id,
      consultationUrl: data.consultation_url,
      estimatedWaitTime: data.estimated_wait_time || 8,
      professionalInfo: {
        name: data.psychologist?.name || 'Psicólogo Qualificado',
        specialty: 'Psicologia Clínica',
        rating: data.psychologist?.rating || 4.9,
      },
      message: 'Sessão de psicologia agendada com sucesso'
    }
  } catch (error) {
    return {
      success: false,
      error: 'Serviço de psicologia temporariamente indisponível. Nossa equipe está trabalhando para restabelecer o atendimento.'
    }
  }
}

async function requestNutritionConsultation(
  baseUrl: string, 
  clientId: string, 
  token: string, 
  userProfile: any
): Promise<RapidocApiResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/consultations/nutrition`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-ID': clientId,
        'X-Service-Type': 'nutrition',
      },
      body: JSON.stringify({
        patient: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        },
        service: {
          type: 'nutrition_consultation',
          specialty: 'clinical_nutrition',
          urgency: 'low',
        },
        metadata: {
          platform: 'ailun_health',
          timestamp: new Date().toISOString(),
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`RapiDoc Nutrition API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      sessionId: data.session_id,
      consultationUrl: data.consultation_url,
      estimatedWaitTime: data.estimated_wait_time || 15,
      professionalInfo: {
        name: data.nutritionist?.name || 'Nutricionista Certificado',
        specialty: 'Nutrição Clínica',
        rating: data.nutritionist?.rating || 4.8,
      },
      message: 'Consulta nutricional confirmada'
    }
  } catch (error) {
    return {
      success: false,
      error: 'Serviço de nutrição indisponível. Tente novamente em alguns minutos.'
    }
  }
}

// Production logging
async function logConsultationRequest(
  supabaseClient: any, 
  userId: string, 
  serviceType: string, 
  response: RapidocApiResponse
) {
  try {
    await supabaseClient
      .from('consultation_logs')
      .insert({
        user_id: userId,
        service_type: serviceType,
        success: response.success,
        session_id: response.sessionId,
        professional_name: response.professionalInfo?.name,
        specialty: response.professionalInfo?.specialty,
        status: response.success ? 'active' : 'failed',
        error_message: response.error,
        consultation_url: response.consultationUrl,
        estimated_wait_time: response.estimatedWaitTime,
        professional_rating: response.professionalInfo?.rating,
        metadata: {
          api_response: response,
          timestamp: new Date().toISOString(),
          platform: 'production'
        }
      })
  } catch (error) {
    console.error('Failed to log consultation request:', error)
  }
}