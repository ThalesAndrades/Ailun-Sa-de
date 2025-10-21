import React, { useState, useEffect } from 'react';
import 'react-native-url-polyfill/auto';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { getBeneficiaryByCPF, canUseService } from '../services/beneficiary-plan-service';
import { checkSubscriptionStatus } from '../services/asaas';
import { useBeneficiaryPlan } from '../hooks/useBeneficiaryPlan';
import { useSubscription } from '../hooks/useSubscription';
import { useRapidocConsultation } from '../hooks/useRapidocConsultation';
import { useIntegratedNotifications } from '../hooks/useIntegratedNotifications';
import { MessageTemplates, getGreetingMessage } from '../constants/messageTemplates';
import { showTemplateMessage, showConfirmationAlert } from '../utils/alertHelpers';
import SpecialistAppointmentScreen from '../components/SpecialistAppointmentScreen';
import NutritionistAppointmentScreen from '../components/NutritionistAppointmentScreen';
import PsychologyAppointmentScreen from '../components/PsychologyAppointmentScreen';
import MyAppointmentsScreen from '../components/MyAppointmentsScreen';
import NotificationScreen from '../components/NotificationScreen';

interface ServiceButton {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  gradient: readonly any[];
  onPress: () => void;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile, beneficiaryUuid, loading: authLoading, signOut } = useAuth();
  const [beneficiaryData, setBeneficiaryData] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const { plan, loading: planLoading, canUse } = useBeneficiaryPlan(beneficiaryUuid);
  const { subscriptionData, loading: subscriptionLoading } = useSubscription(beneficiaryUuid || '');
  const { loading: consultationLoading, requestImmediate } = useRapidocConsultation();
  const { 
    hasUnreadNotifications, 
    unreadCount, 
    refreshNotifications 
  } = useIntegratedNotifications();
  
  // Modal states
  const [specialistModal, setSpecialistModal] = useState(false);
  const [nutritionistModal, setNutritionistModal] = useState(false);
  const [psychologyModal, setPsychologyModal] = useState(false);
  const [appointmentsModal, setAppointmentsModal] = useState(false);
  const [notificationsModal, setNotificationsModal] = useState(false);

  // Animações
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [cardAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]);

  // Animações de entrada
  useEffect(() => {
    if (!authLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
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

      // Animar cards em sequência
      cardAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start();
      });
    }
  }, [authLoading]);

  // Auto-refresh notifications e dados
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        refreshNotifications();
        loadUserData();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [user, refreshNotifications]);

  // Carregar dados do usuário
  const loadUserData = async () => {
    if (!user || !profile?.cpf) return;

    try {
      // Buscar dados do beneficiário
      const beneficiary = await getBeneficiaryByCPF(profile.cpf);
      setBeneficiaryData(beneficiary);

      // Verificar status da assinatura
      if (beneficiary?.beneficiary_uuid) {
        const subStatus = await checkSubscriptionStatus(beneficiary.beneficiary_uuid);
        setSubscriptionStatus(subStatus);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user, profile]);

  // Redirect para login se não autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading]);

  // Verificar plano ativo e redirecionar se necessário
  useEffect(() => {
    // Aguardar o carregamento dos dados de assinatura
    if (!subscriptionLoading && subscriptionData && !subscriptionData.hasActiveSubscription) {
      // Redirecionar para tela de plano inativo
      router.replace('/subscription/inactive');
    }
  }, [subscriptionData, subscriptionLoading]);

  const handleDoctorNow = async () => {
    if (consultationLoading || !beneficiaryUuid) return;
    
    // Verificar status da assinatura
    if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription) {
      showTemplateMessage({
        title: '⚠️ Assinatura Inativa',
        message: 'Sua assinatura está inativa. Por favor, regularize seu pagamento para continuar usando os serviços.',
        type: 'warning'
      });
      router.push('/subscription');
      return;
    }

    // Verificar se pode usar o serviço
    if (beneficiaryData?.beneficiary_uuid) {
      const serviceCheck = await canUseService(beneficiaryData.beneficiary_uuid, 'clinical');
      if (!serviceCheck.canUse) {
        showTemplateMessage({
          title: 'Serviço Indisponível',
          message: serviceCheck.reason || 'Você não pode usar este serviço no momento.',
          type: 'warning'
        });
        return;
      }
    }
    
    // Navegar para tela de solicitação de consulta imediata
    router.push('/consultation/request-immediate');
  };

  const handleSpecialists = async () => {
    if (!beneficiaryUuid) return;
    
    // Verificar status da assinatura
    if (subscriptionStatus && !subscriptionStatus.hasActiveSubscription) {
      showTemplateMessage({
        title: '⚠️ Assinatura Inativa',
        message: 'Sua assinatura está inativa. Por favor, regularize seu pagamento para continuar usando os serviços.',
        type: 'warning'
      });
      router.push('/subscription');
      return;
    }

    // Verificar se pode usar especialistas
    if (beneficiaryData?.beneficiary_uuid) {
      const serviceCheck = await canUseService(beneficiaryData.beneficiary_uuid, 'specialist');
      if (!serviceCheck.canUse) {
        showTemplateMessage({
          title: 'Especialistas Indisponíveis',
          message: serviceCheck.reason || 'Especialistas não estão incluídos no seu plano atual.',
          type: 'info'
        });
        return;
      }
    }
    
    router.push({
      pathname: '/consultation/schedule',
      params: { serviceType: 'specialist' }
    });
  };

  const handlePsychology = async () => {
    if (!beneficiaryUuid) return;
    
    // Verificar se pode usar psicologia
    const canUseService = await canUse('psychology');
    if (!canUseService.canUse) {
      showTemplateMessage({
        title: 'Psicologia Indisponível',
        message: canUseService.reason || 'Psicologia não está incluída no seu plano atual.',
        type: 'info'
      });
      return;
    }
    
    router.push({
      pathname: '/consultation/schedule',
      params: { serviceType: 'psychology' }
    });
  };

  const handleNutrition = async () => {
    if (!beneficiaryUuid) return;
    
    // Verificar se pode usar nutrição
    const canUseService = await canUse('nutrition');
    if (!canUseService.canUse) {
      showTemplateMessage({
        title: 'Nutrição Indisponível',
        message: canUseService.reason || 'Nutrição não está incluída no seu plano atual.',
        type: 'info'
      });
      return;
    }
    
    router.push({
      pathname: '/consultation/schedule',
      params: { serviceType: 'nutrition' }
    });
  };

  const services: ServiceButton[] = [
    {
      id: 'doctor',
      title: 'Médico Agora',
      subtitle: 'Consulta imediata com clínico geral',
      icon: 'medical-services' as keyof typeof MaterialIcons.glyphMap,
      color: '#FF6B6B',
      gradient: ['#FF6B6B', '#FF8E53'],
      onPress: handleDoctorNow
    },
    {
      id: 'specialists',
      title: 'Especialistas',
      subtitle: 'Cardiologista, dermatologista e mais',
      icon: 'person-search' as keyof typeof MaterialIcons.glyphMap,
      color: '#4ECDC4',
      gradient: ['#4ECDC4', '#44A08D'],
      onPress: handleSpecialists
    },
    {
      id: 'psychologists',
      title: 'Psicólogos',
      subtitle: 'Cuidado da saúde mental',
      icon: 'psychology' as keyof typeof MaterialIcons.glyphMap,
      color: '#A8E6CF',
      gradient: ['#A8E6CF', '#88D8A3'],
      onPress: handlePsychology
    },
    {
      id: 'nutritionists',
      title: 'Nutricionistas',
      subtitle: 'Planos alimentares personalizados',
      icon: 'restaurant' as keyof typeof MaterialIcons.glyphMap,
      color: '#FFB74D',
      gradient: ['#FFB74D', '#FFA726'],
      onPress: handleNutrition
    }
  ];

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleAppointments = () => {
    setAppointmentsModal(true);
  };

  const handleNotifications = () => {
    setNotificationsModal(true);
  };

  const handleLogout = () => {
    showConfirmationAlert(
      'Tem certeza que deseja sair do aplicativo?',
      async () => {
        await signOut();
        showTemplateMessage({
          title: '👋 Até Logo',
          message: 'Logout realizado com sucesso!',
          type: 'success'
        });
        router.replace('/login');
      },
      undefined,
      '🚪 Sair do Aplicativo'
    );
  };

  const handleSubscription = () => {
    router.push('/subscription');
  };

  // Loading state
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4DB" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  // Se não autenticado, não renderizar nada (será redirecionado)
  if (!user) {
    return null;
  }

  return (
    <LinearGradient 
      colors={['#00B4DB', '#0083B0']} 
      style={styles.container}
    >
      <ScrollView 
        style={[styles.scrollContainer, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {profile?.full_name ? getGreetingMessage(profile.full_name.split(' ')[0]) : 'Olá!'}
            </Text>
            <Text style={styles.welcomeText}>Como podemos ajudar hoje?</Text>
            {profile?.is_active_beneficiary && (
              <View style={styles.beneficiaryBadge}>
                <MaterialIcons name="verified" size={16} color="#fff" />
                <Text style={styles.beneficiaryText}>Beneficiário Ativo</Text>
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            {/* Botão de Assinatura */}
            <TouchableOpacity 
              style={[
                styles.subscriptionButton, 
                plan && styles.subscriptionButtonActive
              ]} 
              onPress={handleSubscription}
            >
              <MaterialIcons 
                name={plan ? "stars" : "star"} 
                size={20} 
                color={plan ? "#FFD700" : "white"} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, hasUnreadNotifications && styles.headerButtonWithBadge]} 
              onPress={handleNotifications}
            >
              <MaterialIcons name="notifications" size={24} color="white" />
              {hasUnreadNotifications && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleAppointments}>
              <MaterialIcons name="history" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleProfile}>
              <MaterialIcons name="account-circle" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.quickAccessCard}>
            <View style={styles.quickAccessHeader}>
              <MaterialIcons name="speed" size={24} color="#00B4DB" />
              <Text style={styles.quickAccessTitle}>Acesso Rápido</Text>
            </View>
            <Text style={styles.quickAccessSubtitle}>
              Conecte-se instantaneamente com profissionais de saúde
            </Text>

            {/* Status do Plano */}
            {plan && (
              <TouchableOpacity 
                style={styles.planStatus}
                onPress={() => router.push('/profile/plan')}
              >
                <MaterialIcons name="card-membership" size={20} color="#4CAF50" />
                <Text style={styles.planStatusText}>
                  {plan.plan_name} • {plan.member_count} {plan.member_count === 1 ? 'membro' : 'membros'}
                </Text>
                <MaterialIcons name="arrow-forward" size={16} color="#666" />
              </TouchableOpacity>
            )}

            {/* Status da Assinatura */}
            {subscriptionStatus && (
              <View style={[
                styles.subscriptionStatus,
                subscriptionStatus.hasActiveSubscription 
                  ? styles.subscriptionStatusActive 
                  : styles.subscriptionStatusInactive
              ]}>
                <MaterialIcons 
                  name={subscriptionStatus.hasActiveSubscription ? "verified" : "warning"} 
                  size={20} 
                  color={subscriptionStatus.hasActiveSubscription ? "#4CAF50" : "#FF9800"} 
                />
                <Text style={[
                  styles.subscriptionStatusText,
                  subscriptionStatus.hasActiveSubscription 
                    ? styles.subscriptionStatusTextActive
                    : styles.subscriptionStatusTextInactive
                ]}>
                  {subscriptionStatus.hasActiveSubscription 
                    ? 'Assinatura Ativa' 
                    : 'Assinatura Inativa'}
                </Text>
                {!subscriptionStatus.hasActiveSubscription && (
                  <TouchableOpacity 
                    onPress={() => router.push('/subscription')}
                    style={styles.renewButton}
                  >
                    <Text style={styles.renewButtonText}>Renovar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {hasUnreadNotifications && (
              <TouchableOpacity 
                style={styles.notificationAlert}
                onPress={handleNotifications}
              >
                <MaterialIcons name="notifications-active" size={20} color="#FF9800" />
                <Text style={styles.notificationAlertText}>
                  Você tem {unreadCount} notificação{unreadCount > 1 ? 'ões' : ''} não lida{unreadCount > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <Animated.View
                key={service.id}
                style={{
                  opacity: cardAnimations[index],
                  transform: [
                    {
                      translateY: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                      })
                    },
                    {
                      scale: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1]
                      })
                    }
                  ]
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.serviceCard, 
                    (consultationLoading && service.id === 'doctor') && styles.serviceCardDisabled
                  ]}
                  onPress={service.onPress}
                  activeOpacity={0.8}
                  disabled={consultationLoading && service.id === 'doctor'}
                >
                <LinearGradient
                  colors={service.gradient as unknown as readonly [string, ...string[]]}
                  style={styles.serviceGradient}
                >
                  <View style={styles.serviceIconContainer}>
                    {(consultationLoading && service.id === 'doctor') ? (
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
              </Animated.View>
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
            <Text style={styles.featuresTitle}>Recursos Integrados</Text>
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
                <MaterialIcons name="credit-card" size={20} color="#00B4DB" />
                <Text style={styles.featureText}>Pagamentos seguros via Asaas</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="notifications-active" size={20} color="#00B4DB" />
                <Text style={styles.featureText}>Notificações inteligentes</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="email" size={20} color="#00B4DB" />
                <Text style={styles.featureText}>Confirmações por email</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="schedule" size={20} color="#00B4DB" />
                <Text style={styles.featureText}>Lembretes automáticos</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="security" size={20} color="#00B4DB" />
                <Text style={styles.featureText}>Plataforma segura e confiável</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modals */}
      <SpecialistAppointmentScreen 
        visible={specialistModal}
        onClose={() => setSpecialistModal(false)}
      />
      
      <NutritionistAppointmentScreen 
        visible={nutritionistModal}
        onClose={() => setNutritionistModal(false)}
      />
      
      <PsychologyAppointmentScreen 
        visible={psychologyModal}
        onClose={() => setPsychologyModal(false)}
      />

      {appointmentsModal && (
        <Modal visible={appointmentsModal} animationType="slide" presentationStyle="pageSheet">
          <MyAppointmentsScreen onClose={() => setAppointmentsModal(false)} />
        </Modal>
      )}

      {notificationsModal && (
        <NotificationScreen onClose={() => setNotificationsModal(false)} />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
  beneficiaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  beneficiaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
  },
  subscriptionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButtonWithBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  quickAccessCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
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
    marginBottom: 16,
  },
  planStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#E8F5E8',
    marginBottom: 12,
  },
  planStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    color: '#4CAF50',
  },
  notificationAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
  },
  notificationAlertText: {
    fontSize: 14,
    color: '#e65100',
    marginLeft: 8,
    fontWeight: '500',
  },
  servicesGrid: {
    marginBottom: 24,
  },
  serviceCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  serviceCardDisabled: {
    opacity: 0.7,
  },
  serviceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  subscriptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  subscriptionStatusActive: {
    backgroundColor: '#E8F5E8',
  },
  subscriptionStatusInactive: {
    backgroundColor: '#fff3e0',
  },
  subscriptionStatusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  subscriptionStatusTextActive: {
    color: '#4CAF50',
  },
  subscriptionStatusTextInactive: {
    color: '#e65100',
  },
  renewButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  renewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});