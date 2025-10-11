import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../services/supabase';
import { useAuth } from './useAuth';

interface RapidocServiceResponse {
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

interface UseRapidocReturn {
  loading: boolean;
  requestDoctorNow: () => Promise<void>;
  requestSpecialist: (specialtyArea?: string) => Promise<void>;
  requestPsychologist: () => Promise<void>;
  requestNutritionist: () => Promise<void>;
  consultationHistory: RapidocServiceResponse[];
}

export function useRapidoc(): UseRapidocReturn {
  const [loading, setLoading] = useState(false);
  const [consultationHistory, setConsultationHistory] = useState<RapidocServiceResponse[]>([]);
  const { user, profile } = useAuth();

  const showAlert = useCallback((title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }, []);

  const getUserProfile = useCallback(() => {
    if (!user) return undefined;
    
    return {
      name: profile?.full_name || 'Usuário',
      email: user.email || '',
      phone: profile?.phone
    };
  }, [user, profile]);

  const callRapidocFunction = useCallback(async (
    serviceType: 'doctor' | 'specialist' | 'psychologist' | 'nutritionist',
    specialtyArea?: string
  ): Promise<RapidocServiceResponse> => {
    try {
      const userProfile = getUserProfile();
      
      const { data, error } = await supabase.functions.invoke('rapidoc', {
        body: {
          action: 'request-consultation',
          serviceType,
          userProfile,
          urgency: serviceType === 'doctor' ? 'high' : serviceType === 'nutritionist' ? 'low' : 'medium',
          specialtyArea,
        }
      });

      if (error) {
        console.error('RapiDoc Edge Function Error:', error);
        return {
          success: false,
          error: error.message || 'Erro na comunicação com o serviço médico'
        };
      }

      // Add to consultation history
      if (data.success) {
        setConsultationHistory(prev => [data, ...prev.slice(0, 9)]); // Keep last 10
      }

      return data;
    } catch (error) {
      console.error('RapiDoc Service Error:', error);
      return {
        success: false,
        error: 'Erro interno do serviço'
      };
    }
  }, [getUserProfile]);

  const handleServiceResponse = useCallback(async (
    response: RapidocServiceResponse, 
    serviceName: string
  ) => {
    if (!response.success) {
      showAlert('Erro no Serviço', response.error || `Não foi possível conectar ao serviço de ${serviceName}`);
      return;
    }

    if (response.consultationUrl) {
      // Open consultation URL
      try {
        if (Platform.OS === 'web') {
          window.open(response.consultationUrl, '_blank');
        } else {
          await WebBrowser.openBrowserAsync(response.consultationUrl);
        }
      } catch (error) {
        showAlert('Erro', 'Não foi possível abrir a consulta');
      }
    } else {
      // Show consultation information
      const waitTimeText = response.estimatedWaitTime 
        ? `\n\nTempo estimado: ${response.estimatedWaitTime} minutos`
        : '';
      
      const professionalText = response.professionalInfo
        ? `\n\nProfissional: ${response.professionalInfo.name}\nEspecialidade: ${response.professionalInfo.specialty}\nAvaliação: ${response.professionalInfo.rating}/5`
        : '';

      const message = response.message || `Sua solicitação de ${serviceName} foi processada com sucesso!`;

      showAlert(
        'Consulta Solicitada',
        `${message}${waitTimeText}${professionalText}`
      );
    }
  }, [showAlert]);

  const requestDoctorNow = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callRapidocFunction('doctor');
      await handleServiceResponse(response, 'Médico Agora');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta médica');
    } finally {
      setLoading(false);
    }
  }, [user, callRapidocFunction, handleServiceResponse, showAlert]);

  const requestSpecialist = useCallback(async (specialtyArea = 'Clínica Geral') => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callRapidocFunction('specialist', specialtyArea);
      await handleServiceResponse(response, `Especialista em ${specialtyArea}`);
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta com especialista');
    } finally {
      setLoading(false);
    }
  }, [user, callRapidocFunction, handleServiceResponse, showAlert]);

  const requestPsychologist = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callRapidocFunction('psychologist');
      await handleServiceResponse(response, 'Psicólogo');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta psicológica');
    } finally {
      setLoading(false);
    }
  }, [user, callRapidocFunction, handleServiceResponse, showAlert]);

  const requestNutritionist = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const response = await callRapidocFunction('nutritionist');
      await handleServiceResponse(response, 'Nutricionista');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta nutricional');
    } finally {
      setLoading(false);
    }
  }, [user, callRapidocFunction, handleServiceResponse, showAlert]);

  return {
    loading,
    requestDoctorNow,
    requestSpecialist,
    requestPsychologist,
    requestNutritionist,
    consultationHistory,
  };
}