import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getAvailableSpecialties,
  getAvailableSlots,
  scheduleConsultation,
} from '../../services/rapidoc-consultation-service';
import {
  canUseService,
  recordConsultation,
  incrementServiceUsage,
} from '../../services/beneficiary-plan-service';
import { supabase } from '../../services/supabase';

type ServiceType = 'specialist' | 'psychology' | 'nutrition';

interface Specialty {
  id: string;
  name: string;
  category: string;
}

interface TimeSlot {
  date: string;
  time: string;
  professionalName?: string;
}

export default function ScheduleConsultationScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const serviceType = (params.serviceType as ServiceType) || 'specialist';
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  
  const [beneficiaryUuid, setBeneficiaryUuid] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<any>(null);
  
  const [step, setStep] = useState<'specialty' | 'slots' | 'confirm'>('specialty');
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      // Buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        router.back();
        return;
      }

      // Buscar beneficiário
      const { data: beneficiaryData } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (beneficiaryData) {
        setBeneficiaryUuid(beneficiaryData.beneficiary_uuid);
        
        // Verificar se pode usar o serviço
        const canUse = await canUseService(
          beneficiaryData.beneficiary_uuid,
          serviceType === 'specialist' ? 'specialist' : serviceType
        );
        
        if (!canUse.canUse) {
          Alert.alert('Serviço Indisponível', canUse.reason || 'Você não pode usar este serviço no momento.');
          router.back();
          return;
        }

        // Buscar plano ativo
        const { data: plan } = await supabase
          .from('v_user_plans')
          .select('*')
          .eq('beneficiary_uuid', beneficiaryData.beneficiary_uuid)
          .eq('plan_status', 'active')
          .single();

        setUserPlan(plan);
      }

      // Carregar especialidades se for especialista
      if (serviceType === 'specialist') {
        await loadSpecialties();
      } else {
        // Para psicologia e nutrição, ir direto para slots
        setStep('slots');
        await loadSlots();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[loadUserData] Erro:', error);
      setIsLoading(false);
    }
  };

  const loadSpecialties = async () => {
    try {
      const response = await getAvailableSpecialties();
      
      if (response.success && response.specialties) {
        setSpecialties(response.specialties);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar as especialidades');
      }
    } catch (error) {
      console.error('[loadSpecialties] Erro:', error);
    }
  };

  const loadSlots = async (specialty?: string) => {
    try {
      setIsLoading(true);
      
      const response = await getAvailableSlots(serviceType, specialty);
      
      if (response.success && response.slots) {
        setSlots(response.slots);
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os horários disponíveis');
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('[loadSlots] Erro:', error);
      setIsLoading(false);
    }
  };

  const handleSelectSpecialty = async (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setStep('slots');
    await loadSlots(specialty.id);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleConfirmSchedule = async () => {
    if (!beneficiaryUuid || !selectedSlot) return;

    setIsScheduling(true);

    try {
      const response = await scheduleConsultation({
        beneficiaryUuid,
        serviceType,
        specialty: selectedSpecialty?.id,
        preferredDate: selectedSlot.date,
        preferredTime: selectedSlot.time,
      });

      if (!response.success) {
        Alert.alert('Erro', response.error || 'Não foi possível agendar a consulta');
        setIsScheduling(false);
        return;
      }

      // Registrar consulta no histórico
      if (userPlan) {
        const { data: beneficiary } = await supabase
          .from('beneficiaries')
          .select('id')
          .eq('beneficiary_uuid', beneficiaryUuid)
          .single();

        if (beneficiary) {
          await recordConsultation({
            beneficiary_id: beneficiary.id,
            subscription_plan_id: userPlan.plan_id,
            service_type: serviceType,
            appointment_id: response.appointmentId,
            scheduled_date: response.scheduledDate,
            scheduled_time: response.scheduledTime,
            status: 'scheduled',
          });

          // Incrementar uso para serviços limitados
          if (serviceType === 'psychology' || serviceType === 'nutrition') {
            await incrementServiceUsage(beneficiaryUuid, serviceType);
          }
        }
      }

      setIsScheduling(false);

      Alert.alert(
        'Consulta Agendada!',
        `Sua consulta foi agendada para ${formatDate(response.scheduledDate || '')} às ${response.scheduledTime}. Você receberá uma confirmação por e-mail.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('[handleConfirmSchedule] Erro:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao agendar a consulta. Tente novamente.');
      setIsScheduling(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const getServiceTitle = () => {
    switch (serviceType) {
      case 'specialist': return 'Especialistas';
      case 'psychology': return 'Psicologia';
      case 'nutrition': return 'Nutrição';
      default: return 'Agendamento';
    }
  };

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'specialist': return 'local-hospital';
      case 'psychology': return 'psychology';
      case 'nutrition': return 'restaurant';
      default: return 'calendar-today';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4DB" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{getServiceTitle()}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Ícone */}
          <View style={styles.iconContainer}>
            <MaterialIcons name={getServiceIcon()} size={64} color="#fff" />
          </View>

          <Text style={styles.title}>Agendar Consulta</Text>
          <Text style={styles.subtitle}>
            Escolha a especialidade e o horário desejado
          </Text>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step !== 'specialty' && styles.stepDotActive]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={[styles.stepLine, step !== 'specialty' && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <View style={[styles.stepLine, step === 'confirm' && styles.stepLineActive]} />
            <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]}>
              <Text style={styles.stepNumber}>3</Text>
            </View>
          </View>

          {/* Conteúdo baseado no step */}
          {step === 'specialty' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Escolha a Especialidade</Text>
              {specialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty.id}
                  style={styles.optionButton}
                  onPress={() => handleSelectSpecialty(specialty)}
                >
                  <Text style={styles.optionText}>{specialty.name}</Text>
                  <MaterialIcons name="arrow-forward" size={24} color="#00B4DB" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {step === 'slots' && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Horários Disponíveis</Text>
              {slots.length > 0 ? (
                slots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.slotButton}
                    onPress={() => handleSelectSlot(slot)}
                  >
                    <View style={styles.slotInfo}>
                      <Text style={styles.slotDate}>{formatDate(slot.date)}</Text>
                      <Text style={styles.slotTime}>{slot.time}</Text>
                      {slot.professionalName && (
                        <Text style={styles.slotProfessional}>{slot.professionalName}</Text>
                      )}
                    </View>
                    <MaterialIcons name="arrow-forward" size={24} color="#00B4DB" />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum horário disponível no momento</Text>
              )}
            </View>
          )}

          {step === 'confirm' && selectedSlot && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Confirmar Agendamento</Text>
              
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Serviço</Text>
                <Text style={styles.confirmValue}>{getServiceTitle()}</Text>
              </View>

              {selectedSpecialty && (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Especialidade</Text>
                  <Text style={styles.confirmValue}>{selectedSpecialty.name}</Text>
                </View>
              )}

              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Data</Text>
                <Text style={styles.confirmValue}>{formatDate(selectedSlot.date)}</Text>
              </View>

              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Horário</Text>
                <Text style={styles.confirmValue}>{selectedSlot.time}</Text>
              </View>

              {selectedSlot.professionalName && (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmLabel}>Profissional</Text>
                  <Text style={styles.confirmValue}>{selectedSlot.professionalName}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmSchedule}
                disabled={isScheduling}
              >
                {isScheduling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={24} color="#fff" />
                    <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#fff',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00B4DB',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepLineActive: {
    backgroundColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  slotButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  slotInfo: {
    flex: 1,
  },
  slotDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 14,
    color: '#00B4DB',
    fontWeight: '600',
  },
  slotProfessional: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 24,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  confirmLabel: {
    fontSize: 14,
    color: '#666',
  },
  confirmValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

