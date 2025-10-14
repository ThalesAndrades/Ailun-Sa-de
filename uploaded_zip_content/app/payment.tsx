import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

export default function PaymentScreen() {
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { user, profile } = useAuth();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAsaasSubscription = async () => {
    if (!user || !profile) {
      showAlert('Erro', 'Dados do usuário não encontrados');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('tema-orchestrator', {
        body: {
          action: 'create_subscription',
          subscriptionData: {
            customerName: profile.full_name || 'Usuário Ailun',
            customerEmail: user.email || '',
            customerPhone: profile.phone || '',
            customerDocument: '00000000000', // CPF será coletado no onboarding
          }
        }
      });

      if (error) {
        console.error('Asaas subscription error:', error);
        showAlert('Erro', 'Não foi possível processar o pagamento');
        return;
      }

      if (!data.success) {
        showAlert('Erro', data.error || 'Erro ao criar assinatura');
        return;
      }

      // Open payment URL
      if (data.data?.payment_url) {
        try {
          if (Platform.OS === 'web') {
            window.open(data.data.payment_url, '_blank');
          } else {
            await WebBrowser.openBrowserAsync(data.data.payment_url);
          }
        } catch (error) {
          showAlert('Erro', 'Não foi possível abrir o pagamento');
        }
      }

      showAlert(
        'Assinatura Criada', 
        `Assinatura Ailun Saúde criada com sucesso!\nValor: R$ 89,90/mês\n\nVocê será redirecionado para completar o pagamento.`
      );

      // Navigate to dashboard after showing alert
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      showAlert('Erro', 'Erro inesperado no pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPayment = () => {
    showAlert(
      'Aviso', 
      'Você pode ativar sua assinatura a qualquer momento no aplicativo para acessar todas as funcionalidades.'
    );
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Assinatura Ailun</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="local-hospital" size={40} color="white" />
            <Text style={styles.title}>Plano Premium</Text>
            <Text style={styles.subtitle}>Acesso completo aos cuidados de saúde</Text>
          </View>

          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>R$ 89,90</Text>
                <Text style={styles.planPeriod}>/mês</Text>
              </View>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>RECOMENDADO</Text>
              </View>
            </View>

            <View style={styles.featuresContainer}>
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

          <View style={styles.paymentInfo}>
            <MaterialIcons name="lock" size={24} color="white" />
            <Text style={styles.paymentInfoText}>
              Pagamento seguro via Asaas • Cancele a qualquer momento
            </Text>
          </View>

          <TouchableOpacity 
            style={[styles.subscribeButton, loading && styles.buttonDisabled]} 
            onPress={handleAsaasSubscription}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size={24} />
            ) : (
              <>
                <MaterialIcons name="credit-card" size={24} color="white" />
                <Text style={styles.subscribeButtonText}>Assinar por R$ 89,90/mês</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleSkipPayment}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Pular por agora</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Ao prosseguir, você concorda com nossos Termos de Uso e Política de Privacidade. 
            A assinatura será processada via Asaas e renovada automaticamente.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
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
  popularBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  featuresContainer: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
    flex: 1,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paymentInfoText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});