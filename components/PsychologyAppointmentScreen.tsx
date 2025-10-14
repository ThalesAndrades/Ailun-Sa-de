import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  FlatList, 
  StyleSheet,
  Modal,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  startPsychologyFlow,
  confirmPsychologyAppointment,
  getDefaultDateRange,
} from '../services/consultationFlow';
import { useCPFAuth } from '../hooks/useCPFAuth';

interface Availability {
  uuid: string;
  date: string;
  time: string;
  professionalName: string;
  specialtyUuid: string;
}

interface PsychologyAppointmentScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function PsychologyAppointmentScreen({ visible, onClose }: PsychologyAppointmentScreenProps) {
  const { beneficiaryUuid } = useCPFAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Horários, 2: Confirmação
  const [availableTimes, setAvailableTimes] = useState<Availability[]>([]);
  const [selectedTime, setSelectedTime] = useState<Availability | null>(null);
  const [psychologyData, setPsychologyData] = useState<any>(null);

  // Animações
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    if (visible && step === 1 && beneficiaryUuid) {
      fetchPsychologyAvailability();
    }
  }, [visible, step, beneficiaryUuid]);

  // Animar entrada quando modal abre ou step muda
  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      scaleAnim.setValue(0.95);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, step]);

  const fetchPsychologyAvailability = async () => {
    setLoading(true);
    try {
      const { dateInitial, dateFinal } = getDefaultDateRange();
      const result = await startPsychologyFlow(beneficiaryUuid!, dateInitial, dateFinal);
      
      if (result.success) {
        setPsychologyData(result.data);
        setAvailableTimes(result.data.availability || []);
        
        if (result.data.needsGeneralPractitioner) {
          Alert.alert(
            'Recomendação',
            'Para melhor acompanhamento psicológico, sugerimos uma consulta prévia com clínico geral.',
            [
              { text: 'Continuar Mesmo Assim', style: 'default' },
              { 
                text: 'Ir para Clínico Geral', 
                onPress: () => {
                  onClose();
                  // Navegar para médico imediato
                }
              }
            ]
          );
        }
        
        if (!result.data.availability || result.data.availability.length === 0) {
          showAlert('Aviso', 'Não há horários disponíveis para Psicologia no momento');
        }
      } else {
        showAlert('Erro', result.error || 'Não foi possível carregar horários de Psicologia');
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao carregar horários');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTime = (time: Availability) => {
    setSelectedTime(time);
    setStep(2);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedTime || !beneficiaryUuid || !psychologyData) return;

    setLoading(true);
    try {
      const result = await confirmPsychologyAppointment(
        beneficiaryUuid,
        selectedTime.uuid,
        psychologyData.specialty?.uuid,
        psychologyData.referral?.uuid
      );

      if (result.success) {
        showAlert('Sucesso', result.message || 'Agendamento com psicólogo realizado com sucesso!');
        resetModal();
        onClose();
      } else {
        showAlert('Erro', result.error || 'Não foi possível agendar consulta com psicólogo');
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao agendar consulta com psicólogo');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedTime(null);
    setAvailableTimes([]);
    setPsychologyData(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#A8E6CF', '#88D8A3']} style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Psicólogos</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>Passo {step} de 2</Text>
          </View>
        </View>

        <View style={styles.content}>
          {Boolean(loading) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A8E6CF" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )}

          {!loading && step === 1 && (
            <Animated.View style={[styles.stepContainer, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }]}>
              <Text style={styles.stepTitle}>Profissionais Disponíveis</Text>
              <Text style={styles.stepSubtitle}>Escolha o psicólogo e horário que melhor se adapta às suas necessidades</Text>
              
              {availableTimes.length > 0 ? (
                <FlatList
                  data={availableTimes}
                  keyExtractor={(item) => item.uuid}
                  renderItem={({ item, index }) => (
                    <Animated.View
                      style={{
                        opacity: fadeAnim,
                        transform: [{
                          translateX: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0]
                          })
                        }]
                      }}
                    >
                      <TouchableOpacity 
                        style={styles.timeItem} 
                        onPress={() => handleSelectTime(item)}
                        activeOpacity={0.7}
                      >
                      <View style={styles.professionalCard}>
                        <View style={styles.professionalHeader}>
                          <MaterialIcons name="psychology" size={24} color="#A8E6CF" />
                          <Text style={styles.professionalName}>{item.professionalName}</Text>
                        </View>
                        
                        <View style={styles.appointmentInfo}>
                          <View style={styles.timeInfo}>
                            <MaterialIcons name="schedule" size={16} color="#666" />
                            <Text style={styles.timeText}>{item.date} às {item.time}</Text>
                          </View>
                          
                          <View style={styles.ratingInfo}>
                            <MaterialIcons name="star" size={16} color="#FFC107" />
                            <Text style={styles.ratingText}>4.9 (120 avaliações)</Text>
                          </View>
                        </View>
                      </View>
                      
                      <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="psychology" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>Nenhum horário disponível</Text>
                  <Text style={styles.emptySubtext}>Tente novamente mais tarde</Text>
                </View>
              )}
            </Animated.View>
          )}

          {!loading && step === 2 && selectedTime && (
            <Animated.View style={[styles.stepContainer, {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }]}>
              <Text style={styles.stepTitle}>Confirmar Consulta</Text>
              
              <View style={styles.confirmationCard}>
                <View style={styles.confirmationHeader}>
                  <MaterialIcons name="psychology" size={32} color="#A8E6CF" />
                  <Text style={styles.confirmationTitle}>Consulta Psicológica</Text>
                </View>
                
                <View style={styles.confirmationItem}>
                  <MaterialIcons name="person" size={24} color="#A8E6CF" />
                  <View style={styles.confirmationText}>
                    <Text style={styles.confirmationLabel}>Psicólogo</Text>
                    <Text style={styles.confirmationValue}>{selectedTime.professionalName}</Text>
                  </View>
                </View>
                
                <View style={styles.confirmationItem}>
                  <MaterialIcons name="schedule" size={24} color="#A8E6CF" />
                  <View style={styles.confirmationText}>
                    <Text style={styles.confirmationLabel}>Data e Horário</Text>
                    <Text style={styles.confirmationValue}>{selectedTime.date} às {selectedTime.time}</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <MaterialIcons name="lightbulb" size={20} color="#A8E6CF" />
                  <Text style={styles.infoText}>
                    Prepare-se para conversar sobre seus sentimentos e experiências em um ambiente seguro e acolhedor.
                  </Text>
                </View>

                <View style={styles.privacyBox}>
                  <MaterialIcons name="lock" size={20} color="#4CAF50" />
                  <Text style={styles.privacyText}>
                    Consulta 100% confidencial e sigilosa
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirmAppointment}
                activeOpacity={0.8}
              >
                <MaterialIcons name="check-circle" size={24} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => setStep(1)}
                activeOpacity={0.7}
              >
                <MaterialIcons name="arrow-back" size={20} color="#A8E6CF" />
                <Text style={styles.backButtonText}>Voltar para Horários</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  stepIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#A8E6CF',
    fontSize: 16,
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
  professionalCard: {
    flex: 1,
  },
  professionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  appointmentInfo: {
    gap: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  confirmationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  confirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationText: {
    marginLeft: 12,
    flex: 1,
  },
  confirmationLabel: {
    fontSize: 14,
    color: '#666',
  },
  confirmationValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    marginLeft: 8,
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#388e3c',
    marginLeft: 8,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#A8E6CF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#A8E6CF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  backButtonText: {
    color: '#A8E6CF',
    fontSize: 16,
    marginLeft: 8,
  },
});