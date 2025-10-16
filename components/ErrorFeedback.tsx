/**
 * Componente de Feedback de Erro Aprimorado
 * Sistema robusto para exibir mensagens de erro ao usuário
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ErrorInfo {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  duration?: number;
  actionText?: string;
  onAction?: () => void;
}

interface ErrorModalProps {
  visible: boolean;
  error: ErrorInfo;
  onClose: () => void;
}

interface ToastProps extends ErrorInfo {
  visible: boolean;
  onHide: () => void;
}

// Modal de Erro
export function ErrorModal({ visible, error, onClose }: ErrorModalProps) {
  const getIconName = () => {
    switch (error.type) {
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'check-circle';
      default: return 'error';
    }
  };

  const getIconColor = () => {
    switch (error.type) {
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      case 'success': return '#4caf50';
      default: return '#f44336';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <MaterialIcons
              name={getIconName()}
              size={32}
              color={getIconColor()}
            />
            {error.title && (
              <Text style={styles.modalTitle}>{error.title}</Text>
            )}
          </View>
          
          <Text style={styles.modalMessage}>{error.message}</Text>
          
          <View style={styles.modalActions}>
            {error.actionText && error.onAction && (
              <TouchableOpacity
                style={[styles.modalButton, styles.modalActionButton]}
                onPress={() => {
                  error.onAction?.();
                  onClose();
                }}
              >
                <Text style={styles.modalActionText}>{error.actionText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton]}
              onPress={onClose}
            >
              <Text style={styles.modalCloseText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Toast/Snackbar
export function ErrorToast({ visible, message, type = 'error', duration = 3000, onHide }: ToastProps) {
  const insets = useSafeAreaInsets();
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [slideAnim] = React.useState(new Animated.Value(-100));

  React.useEffect(() => {
    if (visible) {
      // Animar entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide após duração
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      case 'success': return '#4caf50';
      default: return '#f44336';
    }
  };

  const getIconName = () => {
    switch (type) {
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'success': return 'check-circle';
      default: return 'error';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toastContainer,
        {
          top: insets.top + 10,
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <MaterialIcons name={getIconName()} size={20} color="#fff" />
      <Text style={styles.toastText} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity onPress={hideToast} style={styles.toastCloseButton}>
        <MaterialIcons name="close" size={18} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}

// Hook para gerenciar erros
export function useErrorFeedback() {
  const [currentError, setCurrentError] = React.useState<ErrorInfo | null>(null);
  const [showModal, setShowModal] = React.useState(false);
  const [showToast, setShowToast] = React.useState(false);

  const showError = (error: ErrorInfo, useModal = false) => {
    // Se for web e não for modal, usar alert nativo
    if (Platform.OS === 'web' && !useModal) {
      Alert.alert(
        error.title || 'Erro',
        error.message,
        error.actionText && error.onAction
          ? [
              { text: 'Cancelar', style: 'cancel' },
              { text: error.actionText, onPress: error.onAction },
            ]
          : [{ text: 'OK' }]
      );
      return;
    }

    setCurrentError(error);
    if (useModal) {
      setShowModal(true);
    } else {
      setShowToast(true);
    }
  };

  const hideError = () => {
    setShowModal(false);
    setShowToast(false);
    setTimeout(() => setCurrentError(null), 300);
  };

  const showSuccess = (message: string, useModal = false) => {
    showError({ message, type: 'success' }, useModal);
  };

  const showWarning = (message: string, useModal = false) => {
    showError({ message, type: 'warning' }, useModal);
  };

  const showInfo = (message: string, useModal = false) => {
    showError({ message, type: 'info' }, useModal);
  };

  return {
    showError,
    showSuccess,
    showWarning,
    showInfo,
    hideError,
    // Componentes para renderizar
    ErrorModal: currentError ? (
      <ErrorModal
        visible={showModal}
        error={currentError}
        onClose={hideError}
      />
    ) : null,
    ErrorToast: currentError ? (
      <ErrorToast
        {...currentError}
        visible={showToast}
        onHide={hideError}
      />
    ) : null,
  };
}

// Componente de erro para campos de formulário
export function FieldError({ error, visible = true }: { error?: string; visible?: boolean }) {
  if (!error || !visible) return null;

  return (
    <View style={styles.fieldErrorContainer}>
      <MaterialIcons name="error-outline" size={16} color="#f44336" />
      <Text style={styles.fieldErrorText}>{error}</Text>
    </View>
  );
}

// Hook para validação de formulário com feedback
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, (value: any) => string | undefined>
) {
  const [values, setValues] = React.useState<T>(initialValues);
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = React.useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = (name: keyof T, value: any): string | undefined => {
    const rule = validationRules[name];
    return rule ? rule(value) : undefined;
  };

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let hasErrors = false;

    Object.keys(validationRules).forEach((key) => {
      const error = validateField(key as keyof T, values[key]);
      if (error) {
        newErrors[key as keyof T] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const setValue = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Validar campo em tempo real se já foi tocado
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const setFieldTouched = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validar quando o campo perde o foco
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 350,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalActionButton: {
    backgroundColor: '#2196f3',
  },
  modalCloseButton: {
    backgroundColor: '#f5f5f5',
  },
  modalActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCloseText: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Toast styles
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
  },
  toastText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 12,
    fontWeight: '500',
  },
  toastCloseButton: {
    padding: 4,
  },

  // Field error styles
  fieldErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  fieldErrorText: {
    color: '#f44336',
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
});

export default {
  ErrorModal,
  ErrorToast,
  FieldError,
  useErrorFeedback,
  useFormValidation,
};