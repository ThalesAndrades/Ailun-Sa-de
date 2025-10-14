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
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { getActivePlan } from '../../services/beneficiary-plan-service';

interface PlanDetails {
  plan_id: string;
  beneficiary_name: string;
  plan_name: string;
  service_type: string;
  include_clinical: boolean;
  include_specialists: boolean;
  include_psychology: boolean;
  include_nutrition: boolean;
  member_count: number;
  discount_percentage: number;
  total_price: number;
  plan_status: string;
  next_billing_date?: string;
  psychology_limit: number;
  psychology_used: number;
  psychology_available: number;
  nutrition_limit: number;
  nutrition_used: number;
  nutrition_available: number;
}

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<PlanDetails | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadPlanData();
  }, []);

  const loadPlanData = async () => {
    try {
      setIsLoading(true);

      // Buscar usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        router.back();
        return;
      }

      // Buscar plano ativo
      const activePlan = await getActivePlan(user.id);

      if (activePlan) {
        setPlan(activePlan);
      } else {
        Alert.alert(
          'Sem Plano Ativo',
          'Você ainda não possui um plano ativo. Deseja assinar agora?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Assinar',
              onPress: () => router.push('/signup/welcome'),
            },
          ]
        );
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[loadPlanData] Erro:', error);
      setIsLoading(false);
    }
  };

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'G': return 'Plano Clínico';
      case 'GS': return 'Plano Clínico + Especialistas';
      case 'GSP': return 'Plano Completo';
      default: return 'Plano Personalizado';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: string) => {
    if (!date) return 'Não definido';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'pending': return '#FFB74D';
      case 'suspended': return '#ff6b6b';
      case 'cancelled': return '#999';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'pending': return 'Pendente';
      case 'suspended': return 'Suspenso';
      case 'cancelled': return 'Cancelado';
      case 'expired': return 'Expirado';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4DB" />
        <Text style={styles.loadingText}>Carregando plano...</Text>
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="card-membership" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>Nenhum Plano Ativo</Text>
        <Text style={styles.emptyText}>
          Você ainda não possui um plano ativo.
        </Text>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={() => router.push('/signup/welcome')}
        >
          <Text style={styles.subscribeButtonText}>Assinar Agora</Text>
        </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Meu Plano</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Card do Plano */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <MaterialIcons name="card-membership" size={32} color="#00B4DB" />
              <View style={styles.planHeaderText}>
                <Text style={styles.planName}>{plan.plan_name}</Text>
                <Text style={styles.planType}>
                  {getServiceTypeName(plan.service_type)}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(plan.plan_status) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(plan.plan_status) },
                  ]}
                >
                  {getStatusText(plan.plan_status)}
                </Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Valor Mensal</Text>
              <Text style={styles.priceValue}>{formatCurrency(plan.total_price)}</Text>
              {plan.discount_percentage > 0 && (
                <Text style={styles.discountText}>
                  {plan.discount_percentage}% de desconto aplicado
                </Text>
              )}
            </View>
          </View>

          {/* Serviços Incluídos */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.cardTitle}>Serviços Incluídos</Text>
            </View>

            {plan.include_clinical && (
              <View style={styles.serviceRow}>
                <MaterialIcons name="medical-services" size={20} color="#00B4DB" />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>Clínico 24h</Text>
                  <Text style={styles.serviceDescription}>Consultas ilimitadas</Text>
                </View>
                <MaterialIcons name="check" size={24} color="#4CAF50" />
              </View>
            )}

            {plan.include_specialists && (
              <View style={styles.serviceRow}>
                <MaterialIcons name="local-hospital" size={20} color="#00B4DB" />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>Especialistas</Text>
                  <Text style={styles.serviceDescription}>Consultas ilimitadas</Text>
                </View>
                <MaterialIcons name="check" size={24} color="#4CAF50" />
              </View>
            )}

            {plan.include_psychology && (
              <View style={styles.serviceRow}>
                <MaterialIcons name="psychology" size={20} color="#00B4DB" />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>Psicologia</Text>
                  <Text style={styles.serviceDescription}>
                    {plan.psychology_available} de {plan.psychology_limit} consultas disponíveis este mês
                  </Text>
                </View>
                <View style={styles.usageBadge}>
                  <Text style={styles.usageText}>
                    {plan.psychology_used}/{plan.psychology_limit}
                  </Text>
                </View>
              </View>
            )}

            {plan.include_nutrition && (
              <View style={styles.serviceRow}>
                <MaterialIcons name="restaurant" size={20} color="#00B4DB" />
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>Nutrição</Text>
                  <Text style={styles.serviceDescription}>
                    {plan.nutrition_available} de {plan.nutrition_limit} consultas disponíveis neste trimestre
                  </Text>
                </View>
                <View style={styles.usageBadge}>
                  <Text style={styles.usageText}>
                    {plan.nutrition_used}/{plan.nutrition_limit}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Informações do Plano */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="info-outline" size={24} color="#00B4DB" />
              <Text style={styles.cardTitle}>Informações do Plano</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Beneficiário</Text>
              <Text style={styles.infoValue}>{plan.beneficiary_name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membros no Plano</Text>
              <Text style={styles.infoValue}>
                {plan.member_count} {plan.member_count === 1 ? 'pessoa' : 'pessoas'}
              </Text>
            </View>

            {plan.next_billing_date && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Próxima Cobrança</Text>
                <Text style={styles.infoValue}>
                  {formatDate(plan.next_billing_date)}
                </Text>
              </View>
            )}
          </View>

          {/* Ações */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Gerenciar Plano',
                'Em breve você poderá alterar seu plano diretamente pelo app.'
              );
            }}
          >
            <MaterialIcons name="settings" size={20} color="#00B4DB" />
            <Text style={styles.actionButtonText}>Gerenciar Plano</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#00B4DB" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                'Histórico de Pagamentos',
                'Em breve você poderá visualizar seu histórico de pagamentos.'
              );
            }}
          >
            <MaterialIcons name="receipt" size={20} color="#00B4DB" />
            <Text style={styles.actionButtonText}>Histórico de Pagamentos</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#00B4DB" />
          </TouchableOpacity>

          {/* Informações Adicionais */}
          <View style={styles.helpCard}>
            <MaterialIcons name="help-outline" size={20} color="#666" />
            <Text style={styles.helpText}>
              Precisa de ajuda com seu plano? Entre em contato com nosso suporte.
            </Text>
          </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  subscribeButton: {
    backgroundColor: '#00B4DB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
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
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  planHeaderText: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  planType: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00B4DB',
    marginBottom: 4,
  },
  discountText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    gap: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
  usageBadge: {
    backgroundColor: '#f0f9ff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  usageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#00B4DB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  helpCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

