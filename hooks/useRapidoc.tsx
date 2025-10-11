import { useState, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { rapidocApiService, RapidocServiceResponse } from '../services/rapidocApi';
import { useAuth } from './useAuth';

interface UseRapidocReturn {
  loading: boolean;
  requestDoctorNow: () => Promise<void>;
  requestSpecialist: (specialtyArea?: string) => Promise<void>;
  requestPsychologist: () => Promise<void>;
  requestNutritionist: () => Promise<void>;
}

export function useRapidoc(): UseRapidocReturn {
  const [loading, setLoading] = useState(false);
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

  const handleServiceResponse = useCallback(async (response: RapidocServiceResponse, serviceName: string) => {
    if (!response.success) {
      showAlert('Erro no Serviço', response.error || `Não foi possível conectar ao serviço de ${serviceName}`);
      return;
    }

    if (response.consultationUrl) {
      // Abrir URL da consulta
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
      // Mostrar informações da consulta
      const waitTimeText = response.estimatedWaitTime 
        ? `\n\nTempo estimado: ${response.estimatedWaitTime} minutos`
        : '';
      
      const professionalText = response.professionalInfo
        ? `\n\nProfissional: ${response.professionalInfo.name}\nEspecialidade: ${response.professionalInfo.specialty}\nAvaliação: ${response.professionalInfo.rating}/5`
        : '';

      showAlert(
        'Consulta Solicitada',
        `Sua solicitação de ${serviceName} foi processada com sucesso!${waitTimeText}${professionalText}`
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
      const userProfile = getUserProfile();
      const response = await rapidocApiService.requestDoctorNow(userProfile);
      await handleServiceResponse(response, 'Médico Agora');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta médica');
    } finally {
      setLoading(false);
    }
  }, [user, getUserProfile, handleServiceResponse, showAlert]);

  const requestSpecialist = useCallback(async (specialtyArea = 'Clínica Geral') => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const userProfile = getUserProfile();
      const response = await rapidocApiService.requestSpecialist(userProfile, specialtyArea);
      await handleServiceResponse(response, `Especialista em ${specialtyArea}`);
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta com especialista');
    } finally {
      setLoading(false);
    }
  }, [user, getUserProfile, handleServiceResponse, showAlert]);

  const requestPsychologist = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const userProfile = getUserProfile();
      const response = await rapidocApiService.requestPsychologist(userProfile);
      await handleServiceResponse(response, 'Psicólogo');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta psicológica');
    } finally {
      setLoading(false);
    }
  }, [user, getUserProfile, handleServiceResponse, showAlert]);

  const requestNutritionist = useCallback(async () => {
    if (!user) {
      showAlert('Login Necessário', 'Faça login para acessar os serviços médicos');
      return;
    }

    setLoading(true);
    try {
      const userProfile = getUserProfile();
      const response = await rapidocApiService.requestNutritionist(userProfile);
      await handleServiceResponse(response, 'Nutricionista');
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao solicitar consulta nutricional');
    } finally {
      setLoading(false);
    }
  }, [user, getUserProfile, handleServiceResponse, showAlert]);

  return {
    loading,
    requestDoctorNow,
    requestSpecialist,
    requestPsychologist,
    requestNutritionist,
  };
}