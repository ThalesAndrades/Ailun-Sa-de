/**
 * MCP (Model Context Protocol) Server - Supabase Edge Function
 * Servidor compatível com MCP para integração com AiLun Saúde
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

// Interface MCP padrão
interface MCPRequest {
  jsonrpc: string;
  method: string;
  params?: any;
  id?: string | number;
}

interface MCPResponse {
  jsonrpc: string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id?: string | number;
}

interface HealthContext {
  userId: string;
  beneficiaryUuid?: string;
  symptoms?: string[];
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
  medicalHistory?: any;
  currentMedications?: string[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const requestBody = await req.json() as MCPRequest;
    console.log('[MCP Server] Received request:', requestBody);

    // Validar formato MCP
    if (requestBody.jsonrpc !== '2.0') {
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32600,
            message: 'Invalid Request - jsonrpc must be 2.0'
          },
          id: requestBody.id
        } as MCPResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    let response: MCPResponse;

    switch (requestBody.method) {
      case 'initialize':
        response = await handleInitialize(requestBody, supabaseClient);
        break;
      
      case 'health/analyze_symptoms':
        response = await handleAnalyzeSymptoms(requestBody, supabaseClient);
        break;
      
      case 'health/get_recommendations':
        response = await handleGetRecommendations(requestBody, supabaseClient);
        break;
      
      case 'appointments/schedule':
        response = await handleScheduleAppointment(requestBody, supabaseClient);
        break;
      
      case 'appointments/list':
        response = await handleListAppointments(requestBody, supabaseClient);
        break;
      
      case 'user/get_profile':
        response = await handleGetUserProfile(requestBody, supabaseClient);
        break;
      
      case 'notifications/send':
        response = await handleSendNotification(requestBody, supabaseClient);
        break;
      
      case 'emergency/handle':
        response = await handleEmergency(requestBody, supabaseClient);
        break;
      
      default:
        response = {
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Method not found: ${requestBody.method}`
          },
          id: requestBody.id
        };
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('[MCP Server] Error:', error);
    
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message
        }
      } as MCPResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

async function handleInitialize(request: MCPRequest, supabase: any): Promise<MCPResponse> {
  return {
    jsonrpc: '2.0',
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        health: {
          symptom_analysis: true,
          recommendations: true,
          emergency_detection: true
        },
        appointments: {
          scheduling: true,
          management: true,
          reminders: true
        },
        integrations: {
          rapidoc: true,
          asaas: true,
          resend: true
        }
      },
      serverInfo: {
        name: 'AiLun Saúde MCP Server',
        version: '1.0.0'
      }
    },
    id: request.id
  };
}

async function handleAnalyzeSymptoms(request: MCPRequest, supabase: any): Promise<MCPResponse> {
  const { symptoms, userId, urgencyLevel } = request.params as {
    symptoms: string[];
    userId: string;
    urgencyLevel?: string;
  };

  // Análise básica de sintomas (em produção, usar IA mais sofisticada)
  const emergencySymptoms = [
    'dor no peito', 'falta de ar severa', 'desmaio', 'sangramento excessivo',
    'convulsão', 'dor de cabeça súbita e intensa'
  ];

  const urgentSymptoms = [
    'febre alta', 'vômito persistente', 'dor abdominal intensa',
    'dificuldade para respirar', 'dor de cabeça severa'
  ];

  let analysisResult = {
    urgencyLevel: 'low' as 'low' | 'medium' | 'high' | 'emergency',
    recommendations: [] as string[],
    shouldSeekCare: false,
    estimatedWaitTime: '24-48 horas'
  };

  // Verificar sintomas de emergência
  const hasEmergencySymptoms = symptoms.some(symptom => 
    emergencySymptoms.some(emergency => 
      symptom.toLowerCase().includes(emergency.toLowerCase())
    )
  );

  if (hasEmergencySymptoms) {
    analysisResult = {
      urgencyLevel: 'emergency',
      recommendations: [
        'Procure atendimento de emergência imediatamente',
        'Ligue para o SAMU (192) ou vá ao pronto-socorro',
        'Não dirija - peça para alguém te levar ou chame uma ambulância'
      ],
      shouldSeekCare: true,
      estimatedWaitTime: 'Imediato'
    };
  } else {
    // Verificar sintomas urgentes
    const hasUrgentSymptoms = symptoms.some(symptom => 
      urgentSymptoms.some(urgent => 
        symptom.toLowerCase().includes(urgent.toLowerCase())
      )
    );

    if (hasUrgentSymptoms) {
      analysisResult = {
        urgencyLevel: 'high',
        recommendations: [
          'Recomendamos consulta médica nas próximas 4-6 horas',
          'Monitore os sintomas de perto',
          'Se piorar, procure atendimento de emergência'
        ],
        shouldSeekCare: true,
        estimatedWaitTime: '4-6 horas'
      };
    } else {
      analysisResult = {
        urgencyLevel: 'medium',
        recommendations: [
          'Agende uma consulta nas próximas 24-48 horas',
          'Monitore os sintomas',
          'Mantenha-se hidratado e descanse'
        ],
        shouldSeekCare: true,
        estimatedWaitTime: '24-48 horas'
      };
    }
  }

  // Salvar análise no banco
  try {
    await supabase
      .from('symptom_analysis')
      .insert([
        {
          user_id: userId,
          symptoms,
          urgency_level: analysisResult.urgencyLevel,
          recommendations: analysisResult.recommendations,
          created_at: new Date().toISOString()
        }
      ]);
  } catch (error) {
    console.error('[MCP] Error saving symptom analysis:', error);
  }

  return {
    jsonrpc: '2.0',
    result: analysisResult,
    id: request.id
  };
}

async function handleGetRecommendations(request: MCPRequest, supabase: any): Promise<MCPResponse> {
  const { userId, context } = request.params as {
    userId: string;
    context: HealthContext;
  };

  // Buscar histórico do usuário
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  const { data: recentAppointments } = await supabase
    .from('consultation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Gerar recomendações baseadas no contexto
  const recommendations = {
    preventive: [
      'Mantenha uma dieta balanceada',
      'Pratique exercícios regulares',
      'Durma de 7-8 horas por noite',
      'Mantenha exames em dia'
    ],
    personalized: [] as string[],
    appointments: [] as string[]
  };

  // Recomendações baseadas no histórico
  if (recentAppointments && recentAppointments.length === 0) {
    recommendations.appointments.push('Agende um check-up geral');
  }

  // Recomendações baseadas na idade (se disponível)
  if (userProfile?.birth_date) {
    const age = new Date().getFullYear() - new Date(userProfile.birth_date).getFullYear();
    
    if (age >= 40) {
      recommendations.personalized.push('Considere exames cardiológicos anuais');
    }
    
    if (age >= 50) {
      recommendations.personalized.push('Agende exames de prevenção oncológica');
    }
  }

  return {
    jsonrpc: '2.0',
    result: recommendations,
    id: request.id
  };
}

async function handleScheduleAppointment(request: MCPRequest, supabase: any): Promise<MCPResponse> {
  const { userId, serviceType, urgency, preferredDate } = request.params;

  // Esta função integraria com o RapiDoc para agendamento real
  // Por enquanto, simular o processo
  
  const appointmentId = crypto.randomUUID();
  
  // Salvar no banco
  const { error } = await supabase
    .from('consultation_requests')
    .insert([
      {
        id: appointmentId,
        user_id: userId,
        service_type: serviceType,
        urgency_level: urgency,
        preferred_date: preferredDate,
        status: 'pending',
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Failed to schedule appointment',
        data: error
      },
      id: request.id
    };
  }

  return {
    jsonrpc: '2.0',
    result: {
      appointmentId,
      status: 'scheduled',
      estimatedTime: '15-30 minutos',
      message: 'Consulta agendada com sucesso'
    },
    id: request.id
  };
}

async function handleListAppointments(request: MCPRequest, supabase: any): Promise<MCPResponse> {
  const { userId, limit = 10, status } = request.params;

  let query = supabase
    .from('consultation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: appointments, error } = await query;

  if (error) {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Failed to fetch appointments',
        data: error
      },
      id: request.id
    };
  }

  return {
    jsonrpc: '2.0',
    result: {
      appointments: appointments || [],
      total: appointments?.length || 0
    },
    id: request.id
  };
}

async function handleGetUserProfile(request: MCPRequest, supabase: any): Promise<MCPResponse> {
  const { userId } = request.params;

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Failed to fetch user profile',
        data: error
      },
      id: request.id
    };
  }

  // Não retornar dados sensíveis
  const sanitizedProfile = {
    id: profile.id,
    full_name: profile.full_name,
    email: profile.email,
    has_active_plan: profile.is_active_beneficiary,
    created_at: profile.created_at
  };

  return {
    jsonrpc: '2.0',
    result: sanitizedProfile,
    id: request.id
  };
}

async function handleSendNotification(request: MCPRequest, supabase: any): Promise<MCPResponse> {
  const { userId, title, message, type = 'info' } = request.params;

  const { error } = await supabase
    .from('system_notifications')
    .insert([
      {
        beneficiary_uuid: userId, // Ajustar conforme necessário
        title,
        message,
        type,
        created_at: new Date().toISOString()
      }
    ]);

  if (error) {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Failed to send notification',
        data: error
      },
      id: request.id
    };
  }

  return {
    jsonrpc: '2.0',
    result: {
      success: true,
      message: 'Notification sent successfully'
    },
    id: request.id
  };
}

async function handleEmergency(request: MCPRequest, supabase: any): Promise<MCPResponse> {
  const { userId, emergencyType, location, symptoms } = request.params;

  // Salvar registro de emergência
  const { error } = await supabase
    .from('emergency_logs')
    .insert([
      {
        user_id: userId,
        emergency_type: emergencyType,
        location,
        symptoms,
        status: 'reported',
        created_at: new Date().toISOString()
      }
    ]);

  // Enviar notificação urgente
  await supabase
    .from('system_notifications')
    .insert([
      {
        beneficiary_uuid: userId,
        title: '🚨 Emergência Detectada',
        message: 'Ligue 192 (SAMU) imediatamente ou procure o pronto-socorro mais próximo.',
        type: 'emergency',
        created_at: new Date().toISOString()
      }
    ]);

  return {
    jsonrpc: '2.0',
    result: {
      emergencyContacts: [
        { name: 'SAMU', phone: '192' },
        { name: 'Bombeiros', phone: '193' },
        { name: 'Polícia', phone: '190' }
      ],
      message: 'Emergência registrada. Procure atendimento imediato.',
      priority: 'critical'
    },
    id: request.id
  };
}