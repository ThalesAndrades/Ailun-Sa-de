import { useState } from 'react';
import { useCPFAuth } from './useCPFAuth';
import { consultationFlowService } from '../services/consultation-flow-integrated';
import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { showTemplateMessage } from '../utils/alertHelpers';
import { MessageTemplates } from '../constants/messageTemplates';

export function useRapidocCPF() {
  const { beneficiaryUuid } = useCPFAuth();
  const [loading, setLoading] = useState(false);

  const requestDoctorNow = async () => {
    if (!beneficiaryUuid) {
      showTemplateMessage(MessageTemplates.errors.notAuthenticated);
      return;
    }

    setLoading(true);
    try {
      showTemplateMessage(MessageTemplates.immediate.connecting);
      
      const result = await consultationFlowService.startImmediateDoctorFlow(beneficiaryUuid);
      
      if (result.success && result.url) {
        showTemplateMessage(MessageTemplates.immediate.success);
        
        // Abrir URL da consulta
        if (Platform.OS === 'web') {
          window.open(result.url, '_blank');
        } else {
          try {
            await WebBrowser.openBrowserAsync(result.url);
          } catch (error) {
            await Linking.openURL(result.url);
          }
        }
      } else {
        showTemplateMessage({
          ...MessageTemplates.immediate.error,
          message: result.error || MessageTemplates.immediate.error.message
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar médico imediato:', error);
      showTemplateMessage(MessageTemplates.immediate.error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    requestDoctorNow
  };
}