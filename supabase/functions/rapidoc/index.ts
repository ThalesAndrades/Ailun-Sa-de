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
      console.error('Missing RapiDoc configuration')
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
    console.log('RapiDoc request:', requestData)

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

    // Log consultation request for tracking
    await logConsultationRequest(supabaseClient, user.id, requestData.serviceType, apiResponse)

    return new Response(
      JSON.stringify(apiResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('RapiDoc function error:', error)
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

// Doctor consultation request
async function requestDoctorConsultation(
  baseUrl: string, 
  clientId: string, 
  token: string, 
  userProfile: any, 
  urgency: string
): Promise<RapidocApiResponse> {
  try {
    const response = await fetch(`${baseUrl}/api/v1/consultations/doctor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-ID': clientId,
      },
      body: JSON.stringify({
        patient: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        },
        urgency: urgency,
        type: 'general_medicine',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`RapiDoc API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      sessionId: data.session_id || `DOC_${Date.now()}`,
      consultationUrl: data.consultation_url,
      estimatedWaitTime: data.estimated_wait_time || 5,
      professionalInfo: {
        name: data.doctor?.name || 'Dr. Silva',
        specialty: 'Clínica Geral',
        rating: data.doctor?.rating || 4.8,
      },
      message: 'Consulta com clínico geral solicitada com sucesso'
    }
  } catch (error) {
    console.error('Doctor consultation error:', error)
    return {
      success: false,
      error: 'Não foi possível conectar com o serviço médico no momento'
    }
  }
}

// Specialist consultation request
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
      },
      body: JSON.stringify({
        patient: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        },
        specialty: specialtyArea,
        urgency: 'medium',
        type: 'specialist_consultation',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`RapiDoc Specialist API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      sessionId: data.session_id || `SPEC_${Date.now()}`,
      consultationUrl: data.consultation_url,
      estimatedWaitTime: data.estimated_wait_time || 15,
      professionalInfo: {
        name: data.specialist?.name || `Dr. ${specialtyArea}`,
        specialty: specialtyArea,
        rating: data.specialist?.rating || 4.9,
      },
      message: `Consulta com especialista em ${specialtyArea} solicitada com sucesso`
    }
  } catch (error) {
    console.error('Specialist consultation error:', error)
    return {
      success: false,
      error: 'Não foi possível conectar com o especialista no momento'
    }
  }
}

// Psychology consultation request
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
      },
      body: JSON.stringify({
        patient: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        },
        urgency: 'medium',
        type: 'psychology_consultation',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`RapiDoc Psychology API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      sessionId: data.session_id || `PSY_${Date.now()}`,
      consultationUrl: data.consultation_url,
      estimatedWaitTime: data.estimated_wait_time || 10,
      professionalInfo: {
        name: data.psychologist?.name || 'Dra. Maria',
        specialty: 'Psicologia Clínica',
        rating: data.psychologist?.rating || 4.9,
      },
      message: 'Consulta psicológica solicitada com sucesso'
    }
  } catch (error) {
    console.error('Psychology consultation error:', error)
    return {
      success: false,
      error: 'Não foi possível conectar com o serviço de psicologia no momento'
    }
  }
}

// Nutrition consultation request
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
      },
      body: JSON.stringify({
        patient: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        },
        urgency: 'low',
        type: 'nutrition_consultation',
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`RapiDoc Nutrition API error: ${response.status}`)
    }

    const data = await response.json()
    
    return {
      success: true,
      sessionId: data.session_id || `NUT_${Date.now()}`,
      consultationUrl: data.consultation_url,
      estimatedWaitTime: data.estimated_wait_time || 20,
      professionalInfo: {
        name: data.nutritionist?.name || 'Dra. Ana',
        specialty: 'Nutrição Clínica',
        rating: data.nutritionist?.rating || 4.7,
      },
      message: 'Consulta nutricional solicitada com sucesso'
    }
  } catch (error) {
    console.error('Nutrition consultation error:', error)
    return {
      success: false,
      error: 'Não foi possível conectar com o serviço de nutrição no momento'
    }
  }
}

// Log consultation requests for analytics
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
        created_at: new Date().toISOString(),
      })
  } catch (error) {
    console.error('Failed to log consultation request:', error)
  }
}