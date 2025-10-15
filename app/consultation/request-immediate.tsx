import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { requestImmediateConsultation } from '../../services/rapidoc-consultation-service';
import { 
  getBeneficiaryByCPF, 
  canUseService,
  recordConsultation,
  incrementServiceUsage 
} from '../../services/beneficiary-plan-service';
import { supabase } from '../../services/supabase';

export default function RequestImmediateConsultationScreen() {
  const insets = useSafeAreaInsets();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [beneficiaryUuid, setBeneficiaryUuid] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<any>(null);

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
      // Buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        router.back();
        return;
      }

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile) {
        Alert.alert('Erro', 'Perfil não encontrado');
        router.back();
        return;
      }

      // Buscar beneficiário pelo CPF do perfil (assumindo que existe)
      // Em produção, você deve ter o CPF no perfil ou uma relação direta
      const { data: beneficiaries } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (beneficiaries) {
        setBeneficiaryUuid(beneficiaries.beneficiary_uuid);
        
        // Buscar plano ativo
        const { data: plan } = await supabase
          .from('v_user_plans')
          .select('*')
          .eq('beneficiary_uuid', beneficiaries.beneficiary_uuid)
          .eq('plan_status', 'active')
          .single();

        setUserPlan(plan);
      }
    } catch (error) {
      console.error('[loadUserData] Erro:', error);
    }
  };

  const handleRequestConsultation = async () => {
    if (!beneficiaryUuid) {
      Alert.alert(
        'Erro',
        'Não foi possível identificar seu beneficiário. Por favor, complete seu cadastro.'
      );
      return;
    }

    // Validar sintomas
    if (!symptoms.trim()) {
      Alert.alert(
        'Atenção',
        'Por favor, descreva seus sintomas para que o médico possa atendê-lo melhor.'
      );
      return;
    }

    // Feedback tátil
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Verificar se pode usar o serviço
    const canUse = await canUseService(beneficiaryUuid, 'clinical');
    
    if (!canUse.canUse) {
      Alert.alert('Serviço Indisponível', canUse.reason || 'Você não pode usar este serviço no momento.');
      return;
    }

    setIsLoading(true);

    try {
      // Solicitar consulta imediata
      const response = await requestImmediateConsultation({
        beneficiaryUuid,
        serviceType: 'clinical',
        symptoms,
        urgency,
      });

      if (!response.success) {
        Alert.alert('Erro', response.error || 'Não foi possível solicitar a consulta');
        setIsLoading(false);
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
            service_type: 'clinical',
            session_id: response.sessionId,
            consultation_url: response.consultationUrl,
            status: 'pending',
          });
        }
      }

      setIsLoading(false);

      // Navegar para a tela de pré-consulta
      router.push({
        pathname: '/consultation/pre-consultation',
        params: {
          sessionId: response.sessionId,
          consultationUrl: response.consultationUrl || '',
          estimatedWaitTime: response.estimatedWaitTime?.toString() || '5',
        },
      });
    } catch (error: any) {
      console.error('[handleRequestConsultation] Erro:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao solicitar a consulta. Tente novamente.');
      setIsLoading(false);
    }
  };

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
            <Text style={styles.headerTitle}>Médico Imediato</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Ícone */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="medical-services" size={64} color="#fff" />
          </View>

          <Text style={styles.title}>Consulta Imediata</Text>
          <Text style={styles.subtitle}>
            Conecte-se com um médico em poucos minutos
          </Text>

          {/* Informações do Plano */}
          {userPlan && (
            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <MaterialIcons name="verified" size={20} color="#4CAF50" />
                <Text style={styles.planTitle}>Seu Plano</Text>
              </View>
              <Text style={styles.planName}>{userPlan.plan_name}</Text>
              <Text style={styles.planService}>
                Consultas clínicas ilimitadas incluídas
              </Text>
            </View>
          )}

          {/* Formulário */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Descreva seus sintomas</Text>
            <Text style={styles.formSubtitle}>
              Isso ajudará o médico a entender melhor seu caso
            </Text>

            <TextInput
              style={styles.textArea}
              placeholder="Ex: Dor de cabeça, febre, tosse..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={symptoms}
              onChangeText={setSymptoms}
              textAlignVertical="top"
            />

            <Text style={styles.urgencyTitle}>Nível de urgência</Text>
            <View style={styles.urgencyContainer}>
              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === 'low' && styles.urgencyButtonActive,
                ]}
                onPress={() => setUrgency('low')}
              >
                <MaterialIcons
                  name="sentiment-satisfied"
                  size={24}
                  color={urgency === 'low' ? '#4CAF50' : '#999'}
                />
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === 'low' && styles.urgencyTextActive,
                  ]}
                >
                  Baixa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === 'medium' && styles.urgencyButtonActive,
                ]}
                onPress={() => setUrgency('medium')}
              >
                <MaterialIcons
                  name="sentiment-neutral"
                  size={24}
                  color={urgency === 'medium' ? '#FFB74D' : '#999'}
                />
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === 'medium' && styles.urgencyTextActive,
                  ]}
                >
                  Média
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.urgencyButton,
                  urgency === 'high' && styles.urgencyButtonActive,
                ]}
                onPress={() => setUrgency('high')}
              >
                <MaterialIcons
                  name="sentiment-very-dissatisfied"
                  size={24}
                  color={urgency === 'high' ? '#ff6b6b' : '#999'}
                />
                <Text
                  style={[
                    styles.urgencyText,
                    urgency === 'high' && styles.urgencyTextActive,
                  ]}
                >
                  Alta
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Aviso de Emergência */}
          <View style={styles.warningCard}>
            <MaterialIcons name="warning" size={20} color="#ff6b6b" />
            <Text style={styles.warningText}>
              Em caso de emergência médica, ligue 192 (SAMU) ou dirija-se ao hospital mais próximo
            </Text>
          </View>

          {/* Botão de Solicitar */}
          <TouchableOpacity
            style={styles.requestButton}
            onPress={handleRequestConsultation}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="video-call" size={24} color="#fff" />
                <Text style={styles.requestButtonText}>Solicitar Consulta</Text>
              </>
            )}
          </TouchableOpacity>
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
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  planService: {
    fontSize: 14,
    color: '#4CAF50',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 120,
    marginBottom: 20,
  },
  urgencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  urgencyButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  urgencyButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#00B4DB',
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  urgencyTextActive: {
    color: '#333',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#ff6b6b',
    lineHeight: 20,
  },
  requestButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  requestButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
});

