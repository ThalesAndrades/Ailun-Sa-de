import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCPFAuth } from '../hooks/useCPFAuth';
import { useSubscription, formatSubscriptionStatus, formatBillingType } from '../hooks/useSubscription';

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const { user, beneficiaryUuid } = useCPFAuth();
  const { subscriptionData, loading, refreshSubscription } = useSubscription(beneficiaryUuid || '');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (beneficiaryUuid) {
      refreshSubscription();
    }
  }, [beneficiaryUuid]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSubscription();
    setRefreshing(false);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSubscribe = () => {
    if (!user || !beneficiaryUuid) {
      showAlert('Erro', 'Dados do usuário não encontrados. Faça login novamente.');
      return;
    }
    // Redirecionar para seleção de planos
    router.push('/subscription/select-plan');
  };

  const handleSubscribePix = () => {
    if (!user || !beneficiaryUuid) {
      showAlert('Erro', 'Dados do usuário não encontrados. Faça login novamente.');
      return;
    }
    router.push('/payment-pix');
  };

  const handleViewHistory = () => {
    router.push('/payment-history');
  };

  const handleCancelSubscription = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja cancelar sua assinatura?');
      if (confirmed) {
        showAlert('Em Desenvolvimento', 'Funcionalidade de cancelamento será implementada em breve.');
      }
    } else {
      Alert.alert(
        'Cancelar Assinatura',
        'Tem certeza que deseja cancelar sua assinatura?',
        [
          { text: 'Não', style: 'cancel' },
          {
            text: 'Sim, cancelar',
            style: 'destructive',
            onPress: () => {
              showAlert('Em Desenvolvimento', 'Funcionalidade de cancelamento será implementada em breve.');
            },
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Carregando assinatura...</Text>
        </View>
      </LinearGradient>
    );
  }

  const hasActiveSubscription = subscriptionData?.hasActiveSubscription;
  const statusInfo = formatSubscriptionStatus(subscriptionData?.status || 'NO_SUBSCRIPTION');

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <ScrollView
        style={[styles.scrollContainer, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Minha Assinatura</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <MaterialIcons 
              name="refresh" 
              size={24} 
              color="white" 
              style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {hasActiveSubscription ? (
            // Usuário com assinatura ativa
            <>
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <MaterialIcons name="check-circle" size={32} color="#4CAF50" />
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusTitle}>Assinatura Ativa</Text>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.text}
                    </Text>
                  </View>
                </View>

                <View style={styles.subscriptionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Plano:</Text>
                    <Text style={styles.detailValue}>AiLun Saúde Premium</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Valor:</Text>
                    <Text style={styles.detailValue}>R$ 89,90/mês</Text>
                  </View>
                  {subscriptionData?.subscription?.billingType && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Método:</Text>
                      <Text style={styles.detailValue}>
                        {formatBillingType(subscriptionData.subscription.billingType)}
                      </Text>
                    </View>
                  )}
                  {subscriptionData?.nextPayment && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Próximo pagamento:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(subscriptionData.nextPayment.dueDate).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.featuresCard}>
                <Text style={styles.featuresTitle}>Benefícios Inclusos</Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="medical-services" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Médico Agora - Consultas 24h</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="person-search" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Especialistas Certificados</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="psychology" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Psicólogos Qualificados</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="restaurant" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Nutricionistas Especializados</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
                <MaterialIcons name="history" size={24} color="#00B4DB" />
                <Text style={styles.historyButtonText}>Ver Histórico de Pagamentos</Text>
                <MaterialIcons name="arrow-forward" size={20} color="#00B4DB" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
                <MaterialIcons name="cancel" size={20} color="#FF5722" />
                <Text style={styles.cancelButtonText}>Cancelar Assinatura</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Usuário sem assinatura ativa
            <>
              <View style={styles.planCard}>
                <View style={styles.planHeader}>
                  <MaterialIcons name="local-hospital" size={40} color="white" />
                  <Text style={styles.planTitle}>AiLun Saúde Premium</Text>
                  <Text style={styles.planSubtitle}>Acesso completo aos cuidados de saúde</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={styles.planPrice}>R$ 89,90</Text>
                  <Text style={styles.planPeriod}>/mês</Text>
                </View>

                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>MAIS POPULAR</Text>
                </View>
              </View>

              <View style={styles.featuresCard}>
                <Text style={styles.featuresTitle}>O que está incluído:</Text>
                <View style={styles.featuresList}>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="medical-services" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Médico Agora - Consultas 24h</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="person-search" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Especialistas Certificados</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="psychology" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Psicólogos Qualificados</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="restaurant" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Nutricionistas Especializados</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="security" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Plataforma Segura e Confiável</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <MaterialIcons name="schedule" size={24} color="#00B4DB" />
                    <Text style={styles.featureText}>Agendamento Inteligente</Text>
                  </View>
                </View>
              </View>

              <View style={styles.paymentMethods}>
                <Text style={styles.paymentTitle}>Escolha sua forma de pagamento:</Text>
                
                <TouchableOpacity style={styles.paymentOption} onPress={handleSubscribe}>
                  <LinearGradient colors={['#4CAF50', '#45A049']} style={styles.paymentGradient}>
                    <MaterialIcons name="credit-card" size={32} color="white" />
                    <View style={styles.paymentContent}>
                      <Text style={styles.paymentOptionTitle}>Cartão de Crédito</Text>
                      <Text style={styles.paymentOptionSubtitle}>Renovação automática</Text>
                    </View>
                    <MaterialIcons name="arrow-forward" size={24} color="white" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.paymentOption} onPress={handleSubscribePix}>
                  <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.paymentGradient}>
                    <MaterialIcons name="qr-code" size={32} color="white" />
                    <View style={styles.paymentContent}>
                      <Text style={styles.paymentOptionTitle}>PIX</Text>
                      <Text style={styles.paymentOptionSubtitle}>Pagamento via QR Code</Text>
                    </View>
                    <MaterialIcons name="arrow-forward" size={24} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.guaranteeCard}>
                <MaterialIcons name="lock" size={24} color="#00B4DB" />
                <Text style={styles.guaranteeText}>
                  Pagamento 100% seguro via Asaas • Cancele a qualquer momento
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 30,
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
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    marginTop: 4,
  },
  subscriptionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  planSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#00B4DB',
  },
  planPeriod: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  planBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    position: 'absolute',
    top: -10,
    right: 20,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
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
    flex: 1,
  },
  paymentMethods: {
    marginBottom: 20,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  paymentOption: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  paymentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  paymentContent: {
    flex: 1,
    marginLeft: 16,
  },
  paymentOptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  guaranteeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  guaranteeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    textAlign: 'center',
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B4DB',
    flex: 1,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#FF5722',
    marginLeft: 8,
  },
});