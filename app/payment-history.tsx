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
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCPFAuth } from '../hooks/useCPFAuth';
import { useSubscription, formatBillingType } from '../hooks/useSubscription';

interface PaymentItem {
  id: string;
  value: number;
  dueDate: string;
  status: string;
  billingType: string;
  description: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
}

export default function PaymentHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { beneficiaryUuid } = useCPFAuth();
  const { subscriptionData, getPaymentHistory, loading } = useSubscription(beneficiaryUuid || '');
  
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      setLoadingHistory(true);
      const history = await getPaymentHistory();
      setPayments(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPaymentHistory();
    setRefreshing(false);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { text: string; color: string; icon: string }> = {
      PENDING: { text: 'Pendente', color: '#FF9800', icon: 'schedule' },
      RECEIVED: { text: 'Pago', color: '#4CAF50', icon: 'check-circle' },
      CONFIRMED: { text: 'Confirmado', color: '#4CAF50', icon: 'verified' },
      OVERDUE: { text: 'Vencido', color: '#F44336', icon: 'warning' },
      REFUNDED: { text: 'Reembolsado', color: '#9C27B0', icon: 'undo' },
      RECEIVED_IN_CASH: { text: 'Recebido', color: '#4CAF50', icon: 'paid' },
    };

    return statusMap[status] || { text: status, color: '#757575', icon: 'help' };
  };

  const handlePaymentPress = (payment: PaymentItem) => {
    const statusInfo = getStatusInfo(payment.status);
    const formattedDate = new Date(payment.dueDate).toLocaleDateString('pt-BR');
    const formattedValue = payment.value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    showAlert(
      'Detalhes do Pagamento',
      `ID: ${payment.id}\nValor: ${formattedValue}\nVencimento: ${formattedDate}\nStatus: ${statusInfo.text}\nMétodo: ${formatBillingType(payment.billingType)}`
    );
  };

  const renderPaymentItem = (payment: PaymentItem, index: number) => {
    const statusInfo = getStatusInfo(payment.status);
    const formattedDate = new Date(payment.dueDate).toLocaleDateString('pt-BR');
    const formattedValue = payment.value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return (
      <TouchableOpacity
        key={payment.id}
        style={styles.paymentItem}
        onPress={() => handlePaymentPress(payment)}
        activeOpacity={0.7}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.paymentLeft}>
            <MaterialIcons
              name={statusInfo.icon as any}
              size={24}
              color={statusInfo.color}
            />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>AiLun Saúde Premium</Text>
              <Text style={styles.paymentDate}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.paymentRight}>
            <Text style={styles.paymentValue}>{formattedValue}</Text>
            <Text style={[styles.paymentStatus, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        <View style={styles.paymentDetails}>
          <View style={styles.paymentDetail}>
            <MaterialIcons name="payment" size={16} color="#666" />
            <Text style={styles.paymentDetailText}>
              {formatBillingType(payment.billingType)}
            </Text>
          </View>
          <View style={styles.paymentDetail}>
            <MaterialIcons name="receipt" size={16} color="#666" />
            <Text style={styles.paymentDetailText}>ID: {payment.id.substring(0, 8)}...</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="receipt-long" size={80} color="#E0E0E0" />
      <Text style={styles.emptyStateTitle}>Nenhum pagamento encontrado</Text>
      <Text style={styles.emptyStateMessage}>
        Seus pagamentos aparecerão aqui assim que forem processados.
      </Text>
      <TouchableOpacity style={styles.createSubscriptionButton} onPress={() => router.push('/subscription')}>
        <MaterialIcons name="add" size={20} color="white" />
        <Text style={styles.createSubscriptionButtonText}>Criar Assinatura</Text>
      </TouchableOpacity>
    </View>
  );

  if (loadingHistory && !refreshing) {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Pagamentos</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <MaterialIcons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Status da Assinatura</Text>
            <Text style={[
              styles.summaryValue,
              { color: subscriptionData?.hasActiveSubscription ? '#4CAF50' : '#F44336' }
            ]}>
              {subscriptionData?.hasActiveSubscription ? 'Ativa' : 'Inativa'}
            </Text>
          </View>
          {subscriptionData?.subscription && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Próximo Pagamento</Text>
              <Text style={styles.summaryValue}>
                {subscriptionData.nextPayment 
                  ? new Date(subscriptionData.nextPayment.dueDate).toLocaleDateString('pt-BR')
                  : 'Não disponível'
                }
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="white"
              colors={['#00B4DB']}
            />
          }
        >
          {payments.length > 0 ? (
            <View style={styles.paymentsList}>
              <Text style={styles.sectionTitle}>Histórico de Pagamentos</Text>
              {payments.map((payment, index) => renderPaymentItem(payment, index))}
            </View>
          ) : (
            renderEmptyState()
          )}

          <View style={styles.helpCard}>
            <MaterialIcons name="help" size={24} color="#00B4DB" />
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Precisa de ajuda?</Text>
              <Text style={styles.helpText}>
                Entre em contato conosco se tiver dúvidas sobre seus pagamentos ou assinatura.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
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
    marginBottom: 20,
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
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  paymentsList: {
    marginBottom: 20,
  },
  paymentItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  paymentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createSubscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'white',
  },
  createSubscriptionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpContent: {
    flex: 1,
    marginLeft: 16,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});