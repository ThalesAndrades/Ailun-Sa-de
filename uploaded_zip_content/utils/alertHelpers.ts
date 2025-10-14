/**
 * Helpers para Alertas Cross-Platform
 * 
 * Utilitários para exibir alertas e mensagens usando os templates padronizados
 */

import { Platform, Alert } from 'react-native';
import { MessageTemplates } from '../constants/messageTemplates';

export interface AlertAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Exibir alerta cross-platform básico
 */
export function showAlert(title: string, message: string, actions?: AlertAction[]): void {
  if (Platform.OS === 'web') {
    // Para web, usar window.confirm ou window.alert
    if (actions && actions.length > 1) {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        actions.find(a => a.style !== 'cancel')?.onPress?.();
      } else {
        actions.find(a => a.style === 'cancel')?.onPress?.();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
      actions?.[0]?.onPress?.();
    }
  } else {
    // Para mobile, usar Alert nativo
    const alertActions = actions?.map(action => ({
      text: action.text,
      onPress: action.onPress,
      style: action.style,
    })) || [{ text: 'OK' }];

    Alert.alert(title, message, alertActions);
  }
}

/**
 * Exibir mensagem usando template
 */
export function showTemplateMessage(
  template: { title: string; message: string; type: string },
  actions?: AlertAction[]
): void {
  showAlert(template.title, template.message, actions);
}

/**
 * Exibir alerta de sucesso
 */
export function showSuccessAlert(message: string, onOk?: () => void): void {
  showAlert('✅ Sucesso', message, [
    { text: 'OK', onPress: onOk }
  ]);
}

/**
 * Exibir alerta de erro
 */
export function showErrorAlert(message: string, onOk?: () => void): void {
  showAlert('❌ Erro', message, [
    { text: 'OK', onPress: onOk }
  ]);
}

/**
 * Exibir alerta de aviso
 */
export function showWarningAlert(message: string, onOk?: () => void): void {
  showAlert('⚠️ Atenção', message, [
    { text: 'OK', onPress: onOk }
  ]);
}

/**
 * Exibir alerta de confirmação
 */
export function showConfirmationAlert(
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  title: string = 'Confirmar'
): void {
  showAlert(title, message, [
    { text: 'Cancelar', style: 'cancel', onPress: onCancel },
    { text: 'Confirmar', onPress: onConfirm }
  ]);
}

/**
 * Exibir alerta de login necessário
 */
export function showLoginRequiredAlert(onLogin?: () => void): void {
  showTemplateMessage(MessageTemplates.auth.sessionExpired, [
    { text: 'Fazer Login', onPress: onLogin }
  ]);
}

/**
 * Exibir alerta de erro de rede
 */
export function showNetworkErrorAlert(onRetry?: () => void): void {
  showTemplateMessage(MessageTemplates.errors.network, [
    { text: 'Tentar Novamente', onPress: onRetry },
    { text: 'Cancelar', style: 'cancel' }
  ]);
}

/**
 * Exibir alerta de validação usando template
 */
export function showValidationAlert(fieldName: string): void {
  showTemplateMessage(MessageTemplates.validation.requiredField(fieldName));
}

/**
 * Exibir alerta de CPF inválido
 */
export function showInvalidCPFAlert(): void {
  showTemplateMessage(MessageTemplates.auth.invalidCPF);
}

/**
 * Exibir alerta de loading com timeout
 */
export function showLoadingAlert(message: string = 'Carregando...', timeoutMs: number = 30000): () => void {
  let timeoutId: NodeJS.Timeout;
  
  if (Platform.OS === 'web') {
    // Para web, não há loading alert nativo, apenas log
    console.log(message);
    timeoutId = setTimeout(() => {
      showErrorAlert('Operação demorou muito tempo. Tente novamente.');
    }, timeoutMs);
  } else {
    // Para mobile, usar loading indicator (implementar se necessário)
    timeoutId = setTimeout(() => {
      showTemplateMessage(MessageTemplates.errors.timeout);
    }, timeoutMs);
  }

  // Retornar função para cancelar
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

/**
 * Criar ações de alert baseadas em template de feedback
 */
export function createTemplateActions(feedback: any): AlertAction[] {
  const actions: AlertAction[] = [];

  if (feedback.action) {
    actions.push({
      text: feedback.action.label,
      onPress: feedback.action.callback || (() => {
        // Se tem URL, tentar abrir
        if (feedback.action.url) {
          if (Platform.OS === 'web') {
            window.open(feedback.action.url, '_blank');
          } else {
            // Usar Linking.openURL se necessário
            console.log('Abrir URL:', feedback.action.url);
          }
        }
      })
    });
  }

  actions.push({ text: 'OK', style: 'cancel' });
  return actions;
}

/**
 * Exibir feedback de consulta usando template
 */
export function showConsultationFeedback(feedback: any): void {
  const actions = createTemplateActions(feedback);
  showAlert(feedback.title, feedback.message, actions);
}