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
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  startNutritionistFlow,
  confirmNutritionistAppointment,
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

interface NutritionistAppointmentScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function NutritionistAppointmentScreen({ visible, onClose }: NutritionistAppointmentScreenProps) {
  const { beneficiaryUuid } = useCPFAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Horários, 2: Confirmação
  const [availableTimes, setAvailableTimes] = useState<Availability[]>([]);
  const [selectedTime, setSelectedTime] = useState<Availability | null>(null);
  const [nutritionData, setNutritionData] = useState<any>(null);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    if (visible && step === 1 && beneficiaryUuid) {
      fetchNutritionistAvailability();
    }
  }, [visible, step, beneficiaryUuid]);

  const fetchNutritionistAvailability = async () => {
    setLoading(true);
    try {
      const { dateInitial, dateFinal } = getDefaultDateRange();
      const result = await startNutritionistFlow(beneficiaryUuid!, dateInitial, dateFinal);
      
      if (result.success) {
        setNutritionData(result.data);
        setAvailableTimes(result.data.availability || []);
        
        if (result.data.needsGeneralPractitioner) {
          Alert.alert(
            'Atenção',
            'Para agendar com nutricionista, recomendamos consulta prévia com clínico geral.',
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
          showAlert('Aviso', 'Não há horários disponíveis para Nutrição no momento');
        }
      } else {
        showAlert('Erro', result.error || 'Não foi possível carregar horários de Nutrição');
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
    if (!selectedTime || !beneficiaryUuid || !nutritionData) return;

    setLoading(true);
    try {
      const result = await confirmNutritionistAppointment(
        beneficiaryUuid,
        selectedTime.uuid,
        nutritionData.specialty?.uuid,
        nutritionData.referral?.uuid
      );

      if (result.success) {
        showAlert('Sucesso', result.message || 'Agendamento com nutricionista realizado com sucesso!');
        resetModal();
        onClose();
      } else {
        showAlert('Erro', result.error || 'Não foi possível agendar consulta com nutricionista');
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao agendar consulta com nutricionista');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedTime(null);
    setAvailableTimes([]);
    setNutritionData(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#FFB74D', '#FFA726']} style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nutricionistas</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>Passo {step} de 2</Text>
          </View>
        </View>

        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFB74D" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )}

          {!loading && step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Horários Disponíveis</Text>
              <Text style={styles.stepSubtitle}>Escolha o melhor horário para sua consulta nutricional</Text>
              
              {availableTimes.length > 0 ? (
                <FlatList
                  data={availableTimes}
                  keyExtractor={(item) => item.uuid}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.timeItem} 
                      onPress={() => handleSelectTime(item)}
                    >
                      <View style={styles.timeInfo}>
                        <Text style={styles.timeDate}>{item.date}</Text>
                        <Text style={styles.timeHour}>{item.time}</Text>
                      </View>
                      <View style={styles.professionalInfo}>
                        <MaterialIcons name="person" size={20} color="#FFB74D" />
                        <Text style={styles.professionalName}>{item.professionalName}</Text>
                      </View>
                      <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="schedule" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>Nenhum horário disponível</Text>
                  <Text style={styles.emptySubtext}>Tente novamente mais tarde</Text>
                </View>
              )}
            </View>
          )}

          {!loading && step === 2 && selectedTime && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Confirmar Consulta</Text>
              
              <View style={styles.confirmationCard}>
                <View style={styles.confirmationHeader}>
                  <MaterialIcons name="restaurant" size={32} color="#FFB74D" />
                  <Text style={styles.confirmationTitle}>Consulta Nutricional</Text>
                </View>
                
                <View style={styles.confirmationItem}>
                  <MaterialIcons name="schedule" size={24} color="#FFB74D" />
                  <View style={styles.confirmationText}>
                    <Text style={styles.confirmationLabel}>Data e Horário</Text>
                    <Text style={styles.confirmationValue}>{selectedTime.date} às {selectedTime.time}</Text>
                  </View>
                </View>
                
                <View style={styles.confirmationItem}>
                  <MaterialIcons name="person" size={24} color="#FFB74D" />
                  <View style={styles.confirmationText}>
                    <Text style={styles.confirmationLabel}>Nutricionista</Text>
                    <Text style={styles.confirmationValue}>{selectedTime.professionalName}</Text>
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <MaterialIcons name="info" size={20} color="#FFB74D" />
                  <Text style={styles.infoText}>
                    Prepare-se trazendo informações sobre seus hábitos alimentares e objetivos de saúde.
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleConfirmAppointment}
              >
                <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => setStep(1)}
              >
                <MaterialIcons name="arrow-back" size={20} color="#FFB74D" />
                <Text style={styles.backButtonText}>Voltar para Horários</Text>
              </TouchableOpacity>
            </View>
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
    color: '#FFB74D',
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
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeInfo: {
    marginRight: 16,
  },
  timeDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeHour: {
    fontSize: 14,
    color: '#666',
  },
  professionalInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  professionalName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#e65100',
    marginLeft: 8,
  },
  confirmButton: {
    backgroundColor: '#FFB74D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
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
    color: '#FFB74D',
    fontSize: 16,
    marginLeft: 8,
  },
});