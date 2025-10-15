/**
 * Hook para integração com MCP (Model Context Protocol)
 * Facilita comunicação com o servidor MCP do AiLun Saúde
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { logger } from '../utils/production-logger';

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

interface MCPCapabilities {
  health?: {
    symptom_analysis?: boolean;
    recommendations?: boolean;
    emergency_detection?: boolean;
  };
  appointments?: {
    scheduling?: boolean;
    management?: boolean;
    reminders?: boolean;
  };
  integrations?: {
    rapidoc?: boolean;
    asaas?: boolean;
    resend?: boolean;
  };
}

interface UseMCPIntegrationReturn {
  // Estado
  isInitialized: boolean;
  capabilities: MCPCapabilities | null;
  loading: boolean;
  error: string | null;

  // Métodos de saúde
  analyzeSymptoms: (symptoms: string[], urgencyLevel?: string) => Promise<any>;
  getRecommendations: (context?: any) => Promise<any>;
  handleEmergency: (emergencyType: string, location?: string, symptoms?: string[]) => Promise<any>;

  // Métodos de agendamento
  scheduleAppointment: (serviceType: string, urgency?: string, preferredDate?: Date) => Promise<any>;
  listAppointments: (limit?: number, status?: string) => Promise<any>;

  // Métodos de usuário
  getUserProfile: () => Promise<any>;
  sendNotification: (title: string, message: string, type?: string) => Promise<any>;

  // Utilitários
  initialize: () => Promise<void>;
  reset: () => void;
}

export function useMCPIntegration(userId?: string): UseMCPIntegrationReturn {
  const [isInitialized, setIsInitialized] = useState(false);
  const [capabilities, setCapabilities] = useState<MCPCapabilities | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mcpServerUrl = `${supabase.supabaseUrl}/functions/v1/mcp-server`;

  // Fazer uma chamada MCP para o servidor
  const callMCP = useCallback(async (method: string, params?: any): Promise<any> => {
    if (!userId) {
      throw new Error('User ID is required for MCP calls');
    }

    const requestId = Date.now();
    const mcpRequest: MCPRequest = {
      jsonrpc: '2.0',
      method,
      params: {
        userId,
        ...params
      },
      id: requestId
    };

    logger.info('[MCP] Calling method:', { method, params });

    const response = await fetch(mcpServerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
      },
      body: JSON.stringify(mcpRequest)
    });

    if (!response.ok) {
      throw new Error(`MCP call failed: ${response.statusText}`);
    }

    const mcpResponse: MCPResponse = await response.json();

    if (mcpResponse.error) {
      throw new Error(`MCP Error (${mcpResponse.error.code}): ${mcpResponse.error.message}`);
    }

    return mcpResponse.result;
  }, [userId, mcpServerUrl]);

  // Inicializar conexão MCP
  const initialize = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      logger.info('[MCP] Initializing MCP integration');
      
      const result = await callMCP('initialize');
      
      setCapabilities(result.capabilities);
      setIsInitialized(true);
      
      logger.info('[MCP] Integration initialized successfully', { 
        capabilities: result.capabilities 
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to initialize MCP integration';
      setError(errorMessage);
      logger.error('[MCP] Initialization failed:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, callMCP]);

  // Auto-inicializar quando userId estiver disponível
  useEffect(() => {
    if (userId && !isInitialized) {
      initialize();
    }
  }, [userId, isInitialized, initialize]);

  // Métodos de saúde
  const analyzeSymptoms = useCallback(async (symptoms: string[], urgencyLevel?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await callMCP('health/analyze_symptoms', {
        symptoms,
        urgencyLevel
      });

      logger.info('[MCP] Symptoms analyzed:', { symptoms, result });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to analyze symptoms';
      setError(errorMessage);
      logger.error('[MCP] Symptom analysis failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callMCP]);

  const getRecommendations = useCallback(async (context?: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await callMCP('health/get_recommendations', {
        context
      });

      logger.info('[MCP] Recommendations retrieved:', { result });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get recommendations';
      setError(errorMessage);
      logger.error('[MCP] Get recommendations failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callMCP]);

  const handleEmergency = useCallback(async (emergencyType: string, location?: string, symptoms?: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const result = await callMCP('emergency/handle', {
        emergencyType,
        location,
        symptoms
      });

      logger.info('[MCP] Emergency handled:', { emergencyType, result });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to handle emergency';
      setError(errorMessage);
      logger.error('[MCP] Emergency handling failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callMCP]);

  // Métodos de agendamento
  const scheduleAppointment = useCallback(async (serviceType: string, urgency?: string, preferredDate?: Date) => {
    setLoading(true);
    setError(null);

    try {
      const result = await callMCP('appointments/schedule', {
        serviceType,
        urgency,
        preferredDate: preferredDate?.toISOString()
      });

      logger.info('[MCP] Appointment scheduled:', { serviceType, result });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to schedule appointment';
      setError(errorMessage);
      logger.error('[MCP] Appointment scheduling failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callMCP]);

  const listAppointments = useCallback(async (limit = 10, status?: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await callMCP('appointments/list', {
        limit,
        status
      });

      logger.info('[MCP] Appointments listed:', { limit, status, result });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to list appointments';
      setError(errorMessage);
      logger.error('[MCP] List appointments failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callMCP]);

  // Métodos de usuário
  const getUserProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await callMCP('user/get_profile');

      logger.info('[MCP] User profile retrieved:', { result });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get user profile';
      setError(errorMessage);
      logger.error('[MCP] Get user profile failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callMCP]);

  const sendNotification = useCallback(async (title: string, message: string, type = 'info') => {
    setLoading(true);
    setError(null);

    try {
      const result = await callMCP('notifications/send', {
        title,
        message,
        type
      });

      logger.info('[MCP] Notification sent:', { title, message, type, result });
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send notification';
      setError(errorMessage);
      logger.error('[MCP] Send notification failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [callMCP]);

  // Utilitários
  const reset = useCallback(() => {
    setIsInitialized(false);
    setCapabilities(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    // Estado
    isInitialized,
    capabilities,
    loading,
    error,

    // Métodos de saúde
    analyzeSymptoms,
    getRecommendations,
    handleEmergency,

    // Métodos de agendamento
    scheduleAppointment,
    listAppointments,

    // Métodos de usuário
    getUserProfile,
    sendNotification,

    // Utilitários
    initialize,
    reset
  };
}

export default useMCPIntegration;