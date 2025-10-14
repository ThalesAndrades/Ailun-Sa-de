import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useBeneficiaryStatus } from '../../hooks/useBeneficiaryStatus';
import { checkSubscriptionStatus, cancelSubscription } from '../../services/asaas';
import { formatCurrency } from '../../utils/plan-calculator';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();
  const { beneficiary, plan, subscriptionStatus, loading, refresh } = useBeneficiaryStatus(profile?.cpf);
  const [canceling, setCanceling] = useState(false);

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Assinatura',
      'Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos serviços imediatamente.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: performCancelSubscription,
        },
      ]
    );
  };

  const performCancelSubscription = async () => {
    if (!subscriptionStatus?.subscription?.id) return;

    try {
      setCanceling(true);
      
      await cancelSubscription(
        subscriptionStatus.subscription.id,
        beneficiary?.beneficiary_uuid
      );

      Alert.alert(
        'Assinatura Cancelada',
        'Sua assinatura foi cancelada com sucesso.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível cancelar a assinatura.');
    } finally {
      setCanceling(false);
    }
  };

  const handleRenewSubscription = () => {
    router.push('/payment');
  };

  const handleUpdatePaymentMethod = () => {
    router.push('/payment-card');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4DB" />
        <Text style={styles.loadingText}>Carregando assinatura...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minha Assinatura</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status da Assinatura */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialIcons
              name={subscriptionStatus?.hasActiveSubscription ? "check-circle" : "warning"}
              size={32}
              color={subscriptionStatus?.hasActiveSubscription ? "#4CAF50" : "#FF9800"}
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>
                {subscriptionStatus?.hasActiveSubscription ? 'Assinatura Ativa' : 'Assinatura Inativa'}
              </Text>
              <Text style={styles.statusSubtitle}>
                {subscriptionStatus?.hasActiveSubscription 
                  ? 'Todos os serviços disponíveis'
                  : 'Renove para continuar usando'
                }
              </Text>
            </View>
          </View>

          {subscriptionStatus?.subscription && (
            <View style={styles.subscriptionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[
                  styles.detailValue,
                  { color: subscriptionStatus.hasActiveSubscription ? '#4CAF50' : '#FF9800' }
                ]}>
                  {subscriptionStatus.subscription.status}
                </Text>
              </View>
              
              {subscriptionStatus.subscription.value && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valor:</Text>
                  <Text style={styles.detailValue}>
                    {formatCurrency(subscriptionStatus.subscription.value)}
                  </Text>
                </View>
              )}

              {subscriptionStatus.subscription.cycle && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ciclo:</Text>
                  <Text style={styles.detailValue}>
                    {subscriptionStatus.subscription.cycle === 'MONTHLY' ? 'Mensal' : subscriptionStatus.subscription.cycle}
                  </Text>
                </View>
              )}

              {subscriptionStatus.subscription.nextDueDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Próximo vencimento:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(subscriptionStatus.subscription.nextDueDate).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Plano Atual */}
        {plan && (
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>Plano Atual</Text>
            
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.plan_name}</Text>
              <Text style={styles.planPrice}>
                {formatCurrency(plan.total_price)}/mês
              </Text>
            </View>

            <View style={styles.servicesGrid}>
              <View style={[styles.serviceItem, plan.include_clinical && styles.serviceIncluded]}>
                <MaterialIcons 
                  name="medical-services" 
                  size={20} 
                  color={plan.include_clinical ? "#4CAF50" : "#ddd"} 
                />
                <Text style={[
                  styles.serviceText,
                  plan.include_clinical && styles.serviceTextIncluded
                ]}>
                  Clínico 24h
                </Text>
              </View>

              <View style={[styles.serviceItem, plan.include_specialists && styles.serviceIncluded]}>
                <MaterialIcons 
                  name="person-search" 
                  size={20} 
                  color={plan.include_specialists ? "#4CAF50" : "#ddd"} 
                />
                <Text style={[
                  styles.serviceText,
                  plan.include_specialists && styles.serviceTextIncluded
                ]}>
                  Especialistas
                </Text>
              </View>

              <View style={[styles.serviceItem, plan.include_psychology && styles.serviceIncluded]}>
                <MaterialIcons 
                  name="psychology" 
                  size={20} 
                  color={plan.include_psychology ? "#4CAF50" : "#ddd"} 
                />
                <Text style={[
                  styles.serviceText,
                  plan.include_psychology && styles.serviceTextIncluded
                ]}>
                  Psicologia ({plan.psychology_available}/{plan.psychology_limit})
                </Text>
              </View>

              <View style={[styles.serviceItem, plan.include_nutrition && styles.serviceIncluded]}>
                <MaterialIcons 
                  name="restaurant" 
                  size={20} 
                  color={plan.include_nutrition ? "#4CAF50" : "#ddd"} 
                />
                <Text style={[
                  styles.serviceText,
                  plan.include_nutrition && styles.serviceTextIncluded
                ]}>
                  Nutrição ({plan.nutrition_available}/{plan.nutrition_limit})
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Ações */}
        <View style={styles.actionsContainer}>
          {!subscriptionStatus?.hasActiveSubscription ? (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleRenewSubscription}
            >
              <MaterialIcons name="refresh" size={24} color="white" />
              <Text style={styles.primaryButtonText}>Renovar Assinatura</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleUpdatePaymentMethod}
              >
                <MaterialIcons name="credit-card" size={24} color="#00B4DB" />
                <Text style={styles.secondaryButtonText}>Alterar Forma de Pagamento</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.dangerButton, canceling && styles.dangerButtonDisabled]}
                onPress={handleCancelSubscription}
                disabled={canceling}
              >
                {canceling ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MaterialIcons name="cancel" size={24} color="white" />
                )}
                <Text style={styles.dangerButtonText}>
                  {canceling ? 'Cancelando...' : 'Cancelar Assinatura'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Histórico de Pagamentos */}
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => router.push('/payment-history')}
        >
          <MaterialIcons name="history" size={24} color="#00B4DB" />
          <Text style={styles.historyButtonText}>Histórico de Pagamentos</Text>
          <MaterialIcons name="arrow-forward" size={20} color="#666" />
        </TouchableOpacity>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  subscriptionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00B4DB',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  servicesGrid: {
    gap: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serviceIncluded: {
    // Estilo adicional para serviços incluídos
  },
  serviceText: {
    fontSize: 16,
    color: '#999',
    marginLeft: 12,
  },
  serviceTextIncluded: {
    color: '#333',
  },
  actionsContainer: {
    marginBottom: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00B4DB',
  },
  secondaryButtonText: {
    color: '#00B4DB',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dangerButton: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonDisabled: {
    opacity: 0.7,
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  historyButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B4DB',
    marginLeft: 8,
    flex: 1,
  },
});