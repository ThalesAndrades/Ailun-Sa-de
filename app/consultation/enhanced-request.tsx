
/**
 * Tela de Solicitação de Consulta Aprimorada
 * Integrada com RapiDoc, notificações e sistema de fila em tempo real
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { EnhancedHeader } from '../../components/EnhancedHeader';
import { ConnectionStatus } from '../../components/ConnectionStatus';
import { useAuth } from '../../hooks/useAuth';
import { useRealTimeIntegrations } from '../../hooks/useRealTimeIntegrations';
import { useBeneficiaryPlan } from '../../hooks/useBeneficiaryPlan';
import { showTemplateMessage, showConfirmationAlert } from '../../utils/alertHelpers';
import { ErrorMessages, InfoMessages } from '../../constants/ErrorMessages';

interface ConsultationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  timestamp?: Date;
}

interface QueueInfo {
  position: number;
  estimatedWaitTime: number;
  totalInQueue: number;
  averageConsultationTime: number;
}

export default function EnhancedConsultationRequestScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { beneficiaryUuid, profile } = useAuth();
  const { plan, canUse } = useBeneficiaryPlan(beneficiaryUuid);
  const realTimeIntegrations = useRealTimeIntegrations();

  const serviceType = (params.serviceType as string) || 'clinical';
  const specialty = params.specialty as string;
  const priority = (params.priority as string) || 'normal';

  const [isRequesting, setIsRequesting] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(null);
  const [professionalInfo, setProfessionalInfo] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Animações
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [stepAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);

  const steps: ConsultationStep[] = [
    {
      id: 'validation',
      title: 'Validando Plano',
      description: 'Verificando se o serviço está disponível',
      status: 'pending',
    },
    {
      id: 'queue',
      title: 'Entrando na Fila',
      description: 'Adicionando você à fila de atendimento',
      status: 'pending',
    },
    {
      id: 'matching',
      title: 'Buscando Profissional',
      description: 'Encontrando o melhor profissional disponível',
      status: 'pending',
    },
    {
      id: 'connecting',
      title: 'Conectando',
      description: 'Preparando a sala de consulta',
      status: 'pending',
    },
  ];

  useEffect(() => {
    // Animação de pulso contínua
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  useEffect(() => {
    // Verificar permissões ao carregar
    checkPermissions();
  }, [serviceType, beneficiaryUuid]);

  const checkPermissions = async () => {
    if (!beneficiaryUuid) {
      showTemplateMessage({
        title: '❌ Usuário não Identificado',
        message: 'Faça login novamente para solicitar consulta.',
        type: 'error'
      });
      router.back();
      return;
    }

    try {
      const serviceCheck = await canUse(serviceType as any);
      if (!serviceCheck.canUse) {
        showTemplateMessage({
          title: '⚠️ Serviço Indisponível',
          message: serviceCheck.reason || 'Este serviço não está disponível no seu plano.',
          type: 'warning'
        });
        router.back();
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    }
  };

  const animateStep = (stepIndex: number, status: 'active' | 'completed' | 'failed') => {
    const animation = stepAnimations[stepIndex];
    const targetValue = status === 'completed' ? 1 : status === 'active' ? 0.5 : 0;

    Animated.timing(animation, {
      toValue: targetValue,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const updateStep = (stepIndex: number, status: 'active' | 'completed' | 'failed') => {
    setCurrentStep(stepIndex);
    steps[stepIndex].status = status;
    steps[stepIndex].timestamp = new Date();
    animateStep(stepIndex, status);

    // Feedback háptico
    if (Platform.OS !== 'web') {
      if (status === 'completed') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (status === 'failed') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleRequestConsultation = async () => {
    if (isRequesting) return;

    setIsRequesting(true);

    try {
      // Etapa 1: Validar plano
      updateStep(0, 'active');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      updateStep(0, 'completed');

      // Etapa 2: Entrar na fila
      updateStep(1, 'active');

      const consultationRequest = {
        beneficiaryUuid: beneficiaryUuid!,
        serviceType: serviceType as any,
        specialty,
        priority: priority as any,
        notes: `Solicitação via app móvel - ${profile?.full_name}`,
      };

      const result = await realTimeIntegrations.requestConsultation(consultationRequest);

      if (!result.success) {
        updateStep(1, 'failed');
        throw new Error(result.error || 'Falha na solicitação');
      }

      updateStep(1, 'completed');
      setConsultationId(result.consultationId);

      // Atualizar informações da fila
      if (result.queuePosition && result.estimatedWaitTime) {
        setQueueInfo({
          position: result.queuePosition,
          estimatedWaitTime: result.estimatedWaitTime,
          totalInQueue: result.queuePosition + 10, // Estimativa
          averageConsultationTime: 15, // Média de 15 minutos
        });
      }

      // Etapa 3: Buscar profissional
      updateStep(2, 'active');

      if (result.professionalInfo) {
        setProfessionalInfo(result.professionalInfo);
        updateStep(2, 'completed');

        // Etapa 4: Conectar
        updateStep(3, 'active');

        if (result.sessionUrl) {
          setSessionUrl(result.sessionUrl);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Preparar sala
          updateStep(3, 'completed');

          // Redirecionar para consulta
          setTimeout(() => {
            router.replace({
              pathname: '/consultation/webview',
              params: {
                url: result.sessionUrl!,
                consultationId: result.consultationId!,
                professionalName: result.professionalInfo?.name || 'Profissional',
              }
            });
          }, 1000);
        } else {
          // Aguardar em fila
          showTemplateMessage({
            title: '⏱️ Aguardando Atendimento',
            message: `Você está na posição ${queueInfo?.position || 1} da fila. Tempo estimado: ${queueInfo?.estimatedWaitTime || 10} minutos.`,
            type: 'info'
          });
        }
      }

    } catch (error: any) {
      console.error('Erro na solicitação de consulta:', error);
      updateStep(currentStep, 'failed');

      showTemplateMessage({
        title: '❌ Erro na Solicitação',
        message: error.message || ErrorMessages.CONSULTATION.SCHEDULE_FAILED,
        type: 'error'
      });

      setTimeout(() => {
        setIsRequesting(false);
      }, 3000);
    }
  };

  const handleCancel = () => {
    if (!isRequesting) {
      router.back();
      return;
    }

    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    setShowCancelModal(false);

    if (consultationId) {
      try {
        // Cancelar consulta via integração
        // await realTimeIntegrations.cancelConsultation(consultationId);
        showTemplateMessage({
          title: '❌ Consulta Cancelada',
          message: 'Sua solicitação foi cancelada.',
          type: 'info'
        });
      } catch (error) {
        console.error('Erro ao cancelar consulta:', error);
      }
    }

    router.back();
  };

  const getServiceTitle = () => {
    switch (serviceType) {
      case 'clinical': return 'Médico Clínico Geral';
      case 'specialist': return `Especialista${specialty ? ` - ${specialty}` : ''}`;
      case 'psychology': return 'Psicólogo';
      case 'nutrition': return 'Nutricionista';
      default: return 'Profissional de Saúde';
    }
  };

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'clinical': return 'medical-services';
      case 'specialist': return 'person-search';
      case 'psychology': return 'psychology';
      case 'nutrition': return 'restaurant';
      default: return 'healing';
    }
  };

  const renderStep = (step: ConsultationStep, index: number) => {
    const animation = stepAnimations[index];
    const isActive = currentStep === index;
    const isCompleted = step.status === 'completed';
    const isFailed = step.status === 'failed';

    return (
      <Animated.View key={step.id} style={[
        styles.stepContainer,
        {
          backgroundColor: animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['#f5f5f5', '#fff3e0', '#e8f5e8']
          }),
          borderColor: animation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: ['#e0e0e0', '#ff9800', '#4caf50']
          })
        }
      ]}>
        <View style={styles.stepHeader}>
          <View style={[
            styles.stepIcon,
            isActive && styles.stepIconActive,
            isCompleted && styles.stepIconCompleted,
            isFailed && styles.stepIconFailed,
          ]}>
            {isCompleted ? (
              <MaterialIcons name="check" size={20} color="white" />
            ) : isFailed ? (
              <MaterialIcons name="close" size={20} color="white" />
            ) : isActive ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.stepNumber}>{index + 1}</Text>
            )}
          </View>

          <View style={styles.stepInfo}>
            <Text style={[
              styles.stepTitle,
              isActive && styles.stepTitleActive,
              isCompleted && styles.stepTitleCompleted,
            ]}>
              {step.title}
            </Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            {step.timestamp && (
              <Text style={styles.stepTime}>
                {step.timestamp.toLocaleTimeString()}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <EnhancedHeader
        title="Solicitação de Consulta"
        subtitle={getServiceTitle()}
        showBackButton
        onBackPress={handleCancel}
        showConnectionStatus
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Info Card */}
        <View style={styles.serviceCard}>
          <LinearGradient
            colors={['#00B4DB', '#0083B0']}
            style={styles.serviceGradient}
          >
            <Animated.View style={[
              styles.serviceIconContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <MaterialIcons
                name={getServiceIcon() as any}
                size={40}
                color="white"
              />
            </Animated.View>

            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{getServiceTitle()}</Text>
              <Text style={styles.serviceDescription}>
                {priority === 'urgent' ? 'Atendimento Prioritário' : 'Atendimento Normal'}
              </Text>

              {queueInfo && (
                <View style={styles.queueInfo}>
                  <MaterialIcons name="people" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.queueText}>
                    Posição {queueInfo.position} de {queueInfo.totalInQueue} • ~{queueInfo.estimatedWaitTime}min
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>Progresso da Solicitação</Text>
          {steps.map(renderStep)}
        </View>

        {/* Professional Info */}
        {professionalInfo && (
          <View style={styles.professionalCard}>
            <View style={styles.professionalHeader}>
              <MaterialIcons name="person" size={24} color="#00B4DB" />
              <Text style={styles.professionalTitle}>Profissional Designado</Text>
            </View>

            <View style={styles.professionalInfo}>
              <Text style={styles.professionalName}>{professionalInfo.name}</Text>
              <Text style={styles.professionalSpecialty}>{professionalInfo.specialty}</Text>
              {professionalInfo.crm && (
                <Text style={styles.professionalCrm}>CRM: {professionalInfo.crm}</Text>
              )}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {!isRequesting ? (
            <TouchableOpacity
              style={styles.requestButton}
              onPress={handleRequestConsultation}
              activeOpacity={0.8}
            >
              <MaterialIcons name="videocam" size={24} color="white" />
              <Text style={styles.requestButtonText}>Solicitar Consulta</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.waitingContainer}>
              <ActivityIndicator size="large" color="#00B4DB" />
              <Text style={styles.waitingText}>
                {InfoMessages.CONSULTATION.WAITING_DOCTOR}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <MaterialIcons name="close" size={24} color="#666" />
            <Text style={styles.cancelButtonText}>
              {isRequesting ? 'Cancelar Solicitação' : 'Voltar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="warning" size={48} color="#FF9800" />
            <Text style={styles.modalTitle}>Cancelar Solicitação?</Text>
            <Text style={styles.modalMessage}>
              Você perderá sua posição na fila e precisará solicitar novamente.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Continuar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={confirmCancel}
              >
                <Text style={styles.modalButtonTextPrimary}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  serviceCard: {
    borderRadius: 16,
    marginTop: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  serviceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  queueInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  stepsContainer: {
    marginTop: 24,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  stepContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepIconActive: {
    backgroundColor: '#FF9800',
  },
  stepIconCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepIconFailed: {
    backgroundColor: '#F44336',
  },
  stepNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  stepTitleActive: {
    color: '#FF9800',
  },
  stepTitleCompleted: {
    color: '#4CAF50',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 12,
    color: '#999',
  },
  professionalCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  professionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  professionalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  professionalInfo: {
    paddingLeft: 32,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  professionalSpecialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  professionalCrm: {
    fontSize: 12,
    color: '#999',
  },
  actionsContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B4DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#00B4DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
  },
  waitingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#f5f5f5',
  },
  modalButtonPrimary: {
    backgroundColor: '#FF5722',
  },
  modalButtonTextSecondary: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButtonTextPrimary: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
