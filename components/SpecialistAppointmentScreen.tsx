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
  getSpecialtiesList,
  checkSpecialtyReferral,
  getSpecialtyAvailability,
  scheduleSpecialistAppointment,
  getDefaultDateRange,
} from '../services/consultationFlow';
import { useAuth } from '../hooks/useAuth';

interface Specialty {
  uuid: string;
  name: string;
  description?: string;
}

interface Availability {
  uuid: string;
  date: string;
  time: string;
  professionalName: string;
  specialtyUuid: string;
}

interface SpecialistAppointmentScreenProps {
  visible: boolean;
  onClose: () => void;
}

export default function SpecialistAppointmentScreen({ visible, onClose }: SpecialistAppointmentScreenProps) {
  const { user, profile } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Especialidades, 2: Horários, 3: Confirmação
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [hasReferral, setHasReferral] = useState<boolean | null>(null);
  const [referralData, setReferralData] = useState<any>(null);
  const [availableTimes, setAvailableTimes] = useState<Availability[]>([]);
  const [selectedTime, setSelectedTime] = useState<Availability | null>(null);

  const beneficiaryUuid = profile?.rapidoc_beneficiary_uuid || user?.id;

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    if (visible && step === 1 && beneficiaryUuid) {
      fetchSpecialties();
    }
  }, [visible, step, beneficiaryUuid]);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const result = await getSpecialtiesList();
      if (result.success) {
        // Filtrar nutrição e psicologia (têm fluxos separados)
        const filteredSpecialties = result.data.filter((s: Specialty) => 
          !s.name.toLowerCase().includes('nutrição') && 
          !s.name.toLowerCase().includes('psicologia')
        );
        setSpecialties(filteredSpecialties);
      } else {
        showAlert('Erro', result.error || 'Não foi possível carregar as especialidades');
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao carregar especialidades');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpecialty = async (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setLoading(true);
    
    try {
      const referralCheck = await checkSpecialtyReferral(beneficiaryUuid!, specialty.uuid);
      
      if (referralCheck.success) {
        setHasReferral(referralCheck.hasReferral);
        setReferralData(referralCheck.referral);
        
        if (referralCheck.hasReferral) {
          showAlert('Encaminhamento', `Você tem encaminhamento ativo para ${specialty.name}`);
          await fetchAvailability(specialty);
        } else {
          Alert.alert(
            'Encaminhamento Necessário',
            `Você precisa de encaminhamento médico para ${specialty.name}. Deseja agendar uma consulta com clínico geral primeiro?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Ir para Clínico Geral', 
                onPress: () => {
                  onClose();
                  // Aqui você pode navegar para o fluxo de médico imediato
                }
              }
            ]
          );
        }
      } else {
        showAlert('Erro', referralCheck.error || 'Erro ao verificar encaminhamento');
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao verificar encaminhamento');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async (specialty: Specialty) => {
    setLoading(true);
    try {
      const { dateInitial, dateFinal } = getDefaultDateRange();
      const result = await getSpecialtyAvailability(
        beneficiaryUuid!,
        specialty.uuid,
        dateInitial,
        dateFinal
      );
      
      if (result.success) {
        setAvailableTimes(result.data);
        if (result.data.length === 0) {
          showAlert('Aviso', 'Não há horários disponíveis para esta especialidade');
          setStep(1);
        } else {
          setStep(2);
        }
      } else {
        showAlert('Erro', result.error || 'Erro ao carregar horários disponíveis');
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao carregar horários');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTime = (time: Availability) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedSpecialty || !selectedTime || !beneficiaryUuid) return;

    setLoading(true);
    try {
      const result = await scheduleSpecialistAppointment(
        beneficiaryUuid,
        selectedTime.uuid,
        selectedSpecialty.uuid,
        referralData?.uuid
      );

      if (result.success) {
        showAlert('Sucesso', result.message || 'Agendamento realizado com sucesso!');
        resetModal();
        onClose();
      } else {
        showAlert('Erro', result.error || 'Não foi possível agendar a consulta');
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado ao agendar consulta');
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep(1);
    setSelectedSpecialty(null);
    setHasReferral(null);
    setReferralData(null);
    setAvailableTimes([]);
    setSelectedTime(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#4ECDC4', '#44A08D']} style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Especialistas</Text>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>Passo {step} de 3</Text>
          </View>
        </View>

        <View style={styles.content}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          )}

          {!loading && step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Escolha a Especialidade</Text>
              <FlatList
                data={specialties}
                keyExtractor={(item) => item.uuid}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.specialtyItem} 
                    onPress={() => handleSelectSpecialty(item)}
                  >
                    <MaterialIcons name="medical-services" size={24} color="#4ECDC4" />
                    <Text style={styles.specialtyText}>{item.name}</Text>
                    <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {!loading && step === 2 && selectedSpecialty && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Horários - {selectedSpecialty.name}</Text>
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => setStep(1)}
              >
                <MaterialIcons name="arrow-back" size={20} color="#4ECDC4" />
                <Text style={styles.backButtonText}>Voltar para Especialidades</Text>
              </TouchableOpacity>
              
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
                    <Text style={styles.professionalName}>{item.professionalName}</Text>
                    <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {!loading && step === 3 && selectedSpecialty && selectedTime && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Confirmar Agendamento</Text>
              
              <View style={styles.confirmationCard}>
                <View style={styles.confirmationItem}>
                  <MaterialIcons name="medical-services" size={24} color="#4ECDC4" />
                  <View style={styles.confirmationText}>
                    <Text style={styles.confirmationLabel}>Especialidade</Text>
                    <Text style={styles.confirmationValue}>{selectedSpecialty.name}</Text>
                  </View>
                </View>
                
                <View style={styles.confirmationItem}>
                  <MaterialIcons name="schedule" size={24} color="#4ECDC4" />
                  <View style={styles.confirmationText}>
                    <Text style={styles.confirmationLabel}>Data e Horário</Text>
                    <Text style={styles.confirmationValue}>{selectedTime.date} às {selectedTime.time}</Text>
                  </View>
                </View>
                
                <View style={styles.confirmationItem}>
                  <MaterialIcons name="person" size={24} color="#4ECDC4" />
                  <View style={styles.confirmationText}>
                    <Text style={styles.confirmationLabel}>Profissional</Text>
                    <Text style={styles.confirmationValue}>{selectedTime.professionalName}</Text>
                  </View>
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
                onPress={() => setStep(2)}
              >
                <MaterialIcons name="arrow-back" size={20} color="#4ECDC4" />
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
    color: '#4ECDC4',
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
    marginBottom: 24,
    textAlign: 'center',
  },
  specialtyItem: {
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
  specialtyText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
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
    marginRight: 12,
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
  professionalName: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  confirmationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
  confirmButton: {
    backgroundColor: '#4ECDC4',
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
    color: '#4ECDC4',
    fontSize: 16,
    marginLeft: 8,
  },
});