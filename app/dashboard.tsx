import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRapidoc } from '../hooks/useRapidoc';

interface ServiceButton {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  gradient: string[];
  onPress: () => void;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { loading, requestDoctorNow, requestSpecialist, requestPsychologist, requestNutritionist } = useRapidoc();
  const [specialtyModal, setSpecialtyModal] = useState(false);

  const specialties = [
    'Cardiologia',
    'Dermatologia',
    'Endocrinologia',
    'Ginecologia',
    'Neurologia',
    'Ortopedia',
    'Pediatria',
    'Psiquiatria',
    'Urologia',
    'Clínica Geral'
  ];

  const services: ServiceButton[] = [
    {
      id: 'doctor',
      title: 'Médico Agora',
      subtitle: 'Consulta imediata com clínico geral',
      icon: 'medical-services',
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FF8E53'],
      onPress: requestDoctorNow
    },
    {
      id: 'specialists',
      title: 'Especialistas',
      subtitle: 'Cardiologista, dermatologista e mais',
      icon: 'person-search',
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'],
      onPress: () => setSpecialtyModal(true)
    },
    {
      id: 'psychologists',
      title: 'Psicólogos',
      subtitle: 'Cuidado da saúde mental',
      icon: 'psychology',
      color: '#A8E6CF',
      gradient: ['#A8E6CF', '#88D8A3'],
      onPress: requestPsychologist
    },
    {
      id: 'nutritionists',
      title: 'Nutricionistas',
      subtitle: 'Planos alimentares personalizados',
      icon: 'restaurant',
      color: '#FFB74D',
      gradient: ['#FFB74D', '#FFA726'],
      onPress: requestNutritionist
    }
  ];

  const handleSpecialtySelect = (specialty: string) => {
    setSpecialtyModal(false);
    requestSpecialist(specialty);
  };

  const handleProfile = () => {
    // TODO: Implementar tela de perfil
  };

  const handleNotifications = () => {
    // TODO: Implementar tela de notificações
  };

  return (
    <LinearGradient 
      colors={['#00B4DB', '#0083B0']} 
      style={styles.container}
    >
      <ScrollView 
        style={[styles.scrollContainer, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Olá!</Text>
            <Text style={styles.welcomeText}>Como podemos ajudar hoje?</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton} onPress={handleNotifications}>
              <MaterialIcons name="notifications" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleProfile}>
              <MaterialIcons name="account-circle" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.quickAccessCard}>
            <View style={styles.quickAccessHeader}>
              <MaterialIcons name="speed" size={24} color="#00B4DB" />
              <Text style={styles.quickAccessTitle}>Acesso Rápido</Text>
            </View>
            <Text style={styles.quickAccessSubtitle}>
              Conecte-se instantaneamente com profissionais de saúde
            </Text>
          </View>

          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, loading && styles.serviceCardDisabled]}
                onPress={service.onPress}
                activeOpacity={0.8}
                disabled={loading}
              >
                <LinearGradient
                  colors={service.gradient}
                  style={styles.serviceGradient}
                >
                  <View style={styles.serviceIconContainer}>
                    {loading ? (
                      <ActivityIndicator color="white" size={32} />
                    ) : (
                      <MaterialIcons 
                        name={service.icon} 
                        size={32} 
                        color="white" 
                      />
                    )}
                  </View>
                  
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                    <Text style={styles.serviceSubtitle}>{service.subtitle}</Text>
                  </View>

                  <View style={styles.serviceArrow}>
                    <MaterialIcons name="arrow-forward" size={20} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.emergencyCard}>
            <LinearGradient
              colors={['#FF4757', '#FF3838']}
              style={styles.emergencyGradient}
            >
              <MaterialIcons name="emergency" size={32} color="white" />
              <View style={styles.emergencyContent}>
                <Text style={styles.emergencyTitle}>Emergência?</Text>
                <Text style={styles.emergencySubtitle}>
                  Ligue para 192 (SAMU) ou 193 (Bombeiros)
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.featuresCard}>
            <Text style={styles.featuresTitle}>Recursos Conectados</Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialIcons name="online-prediction" size={20} color="#00B4DB" />
                <Text style={styles.featureText}>Consultas online em tempo real</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="verified" size={20} color="#00B4DB" />
                <Text style={styles.featureText}>Profissionais certificados</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="schedule" size={20} color="#00B4DB" />
                <Text style={styles.featureText}>Agendamento automático</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="security" size={20} color="#00B4DB" />
                <Text style={styles.featureText}>Plataforma segura e confiável</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal de Especialidades */}
      <Modal
        visible={specialtyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSpecialtyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha a Especialidade</Text>
              <TouchableOpacity
                onPress={() => setSpecialtyModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.specialtyList}>
              {specialties.map((specialty) => (
                <TouchableOpacity
                  key={specialty}
                  style={styles.specialtyItem}
                  onPress={() => handleSpecialtySelect(specialty)}
                >
                  <MaterialIcons name="medical-services" size={24} color="#00B4DB" />
                  <Text style={styles.specialtyText}>{specialty}</Text>
                  <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickAccessCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  quickAccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  quickAccessSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  servicesGrid: {
    marginBottom: 24,
  },
  serviceCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  serviceCardDisabled: {
    opacity: 0.7,
  },
  serviceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  serviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  serviceSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  serviceArrow: {
    marginLeft: 12,
  },
  emergencyCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 16,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuresCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  specialtyList: {
    flex: 1,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specialtyText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});