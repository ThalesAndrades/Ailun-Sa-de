import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Alert, 
  FlatList, 
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../services/supabase';
import { useCPFAuth } from '../hooks/useCPFAuth';

interface ConsultationLog {
  id: string;
  beneficiary_uuid: string;
  service_type: string;
  specialty?: string;
  status: string;
  consultation_url?: string;
  professional_name?: string;
  estimated_wait_time?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface MyAppointmentsScreenProps {
  onClose: () => void;
}

export default function MyAppointmentsScreen({ onClose }: MyAppointmentsScreenProps) {
  const { beneficiaryUuid } = useCPFAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [appointments, setAppointments] = useState<ConsultationLog[]>([]);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const fetchAppointments = useCallback(async () => {
    if (!beneficiaryUuid) return;

    try {
      const { data, error } = await supabase
        .from('consultation_logs')
        .select('*')
        .eq('beneficiary_uuid', beneficiaryUuid)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        showAlert('Erro', 'Não foi possível carregar seus agendamentos');
        console.error('Erro ao buscar agendamentos:', error);
      } else {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      showAlert('Erro', 'Erro inesperado ao carregar agendamentos');
    }
  }, [beneficiaryUuid]);

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      await fetchAppointments();
      setLoading(false);
    };

    loadAppointments();
  }, [fetchAppointments]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  };

  const getServiceTypeDisplayName = (serviceType: string) => {
    const serviceNames = {
      doctor: 'Médico Imediato',
      immediate: 'Médico Imediato',
      specialist: 'Especialista',
      psychologist: 'Psicólogo',
      psychology: 'Psicólogo',
      nutritionist: 'Nutricionista',
      subscription: 'Assinatura'
    };
    return serviceNames[serviceType as keyof typeof serviceNames] || serviceType;
  };

  const getStatusDisplayName = (status: string) => {
    const statusNames = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      active: 'Ativa',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      failed: 'Falhou'
    };
    return statusNames[status as keyof typeof statusNames] || status;
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: '#FFA726',
      confirmed: '#4CAF50',
      active: '#4CAF50',
      completed: '#2196F3',
      cancelled: '#F44336',
      failed: '#F44336'
    };
    return statusColors[status as keyof typeof statusColors] || '#757575';
  };

  const handleOpenConsultation = (consultationUrl: string) => {
    Linking.openURL(consultationUrl).catch(() => {
      showAlert('Erro', 'Não foi possível abrir o link da consulta');
    });
  };

  const renderAppointmentItem = ({ item }: { item: ConsultationLog }) => (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentHeader}>
        <View style={styles.serviceInfo}>
          <MaterialIcons 
            name={getServiceIcon(item.service_type)} 
            size={24} 
            color={getServiceColor(item.service_type)} 
          />
          <View style={styles.serviceText}>
            <Text style={styles.serviceTitle}>
              {getServiceTypeDisplayName(item.service_type)}
              {item.specialty && ` - ${item.specialty}`}
            </Text>
            {item.professional_name && (
              <Text style={styles.professionalName}>{item.professional_name}</Text>
            )}
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusDisplayName(item.status)}</Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="schedule" size={16} color="#666" />
          <Text style={styles.detailText}>
            {new Date(item.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {item.estimated_wait_time && (
          <View style={styles.detailItem}>
            <MaterialIcons name="timer" size={16} color="#666" />
            <Text style={styles.detailText}>
              Tempo estimado: {item.estimated_wait_time} min
            </Text>
          </View>
        )}
      </View>

      {item.consultation_url && (item.status === 'active' || item.status === 'confirmed') && (
        <TouchableOpacity 
          style={styles.consultationButton}
          onPress={() => handleOpenConsultation(item.consultation_url!)}
        >
          <MaterialIcons name="videocam" size={20} color="white" />
          <Text style={styles.consultationButtonText}>Acessar Consulta</Text>
        </TouchableOpacity>
      )}

      {item.metadata?.appointment_date && item.metadata?.appointment_time && (
        <View style={styles.scheduledInfo}>
          <MaterialIcons name="event" size={16} color="#4CAF50" />
          <Text style={styles.scheduledText}>
            Agendado para {item.metadata.appointment_date} às {item.metadata.appointment_time}
          </Text>
        </View>
      )}
    </View>
  );

  const getServiceIcon = (serviceType: string) => {
    const icons = {
      doctor: 'medical-services',
      immediate: 'medical-services',
      specialist: 'person-search',
      psychologist: 'psychology',
      psychology: 'psychology',
      nutritionist: 'restaurant',
      subscription: 'payment'
    };
    return icons[serviceType as keyof typeof icons] || 'healing';
  };

  const getServiceColor = (serviceType: string) => {
    const colors = {
      doctor: '#FF6B6B',
      immediate: '#FF6B6B',
      specialist: '#4ECDC4',
      psychologist: '#A8E6CF',
      psychology: '#A8E6CF',
      nutritionist: '#FFB74D',
      subscription: '#9C27B0'
    };
    return colors[serviceType as keyof typeof colors] || '#757575';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4DB" />
        <Text style={styles.loadingText}>Carregando agendamentos...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Agendamentos</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {appointments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-note" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Nenhum agendamento</Text>
            <Text style={styles.emptySubtitle}>
              Você ainda não possui consultas agendadas
            </Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={renderAppointmentItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#00B4DB']}
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </View>
    </LinearGradient>
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
  backButton: {
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
  placeholder: {
    width: 40,
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
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    color: '#00B4DB',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceText: {
    marginLeft: 12,
    flex: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  professionalName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  consultationButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  consultationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scheduledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  scheduledText: {
    fontSize: 14,
    color: '#2e7d32',
    marginLeft: 8,
  },
});