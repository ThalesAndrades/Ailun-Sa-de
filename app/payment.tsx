import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 'R$ 29,90',
    period: '/mês',
    features: [
      'Consultas com clínicos gerais',
      'Chat 24h com médicos',
      'Receitas digitais',
      'Histórico médico'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 49,90',
    period: '/mês',
    popular: true,
    features: [
      'Todos os recursos do Básico',
      'Consultas com especialistas',
      'Psicólogos e nutricionistas',
      'Exames laboratoriais com desconto',
      'Telemedicina familiar (até 4 pessoas)'
    ]
  },
  {
    id: 'family',
    name: 'Família',
    price: 'R$ 79,90',
    period: '/mês',
    features: [
      'Todos os recursos do Premium',
      'Até 6 membros da família',
      'Pediatra exclusivo',
      'Plano odontológico básico',
      'Consultas domiciliares'
    ]
  }
];

export default function PaymentScreen() {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const insets = useSafeAreaInsets();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handlePayment = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    showAlert(
      'Pagamento Simulado', 
      `Plano ${plan?.name} selecionado por ${plan?.price}${plan?.period}. Em um app real, aqui seria integrado um gateway de pagamento.`
    );
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
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
          <Text style={styles.headerTitle}>Escolha seu plano</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="star" size={40} color="white" />
            <Text style={styles.title}>Planos de Assinatura</Text>
            <Text style={styles.subtitle}>Escolha o plano ideal para suas necessidades</Text>
          </View>

          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                  plan.popular && styles.planCardPopular
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MAIS POPULAR</Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{plan.price}</Text>
                    <Text style={styles.planPeriod}>{plan.period}</Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <MaterialIcons name="check-circle" size={20} color="#00B4DB" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {selectedPlan === plan.id && (
                  <View style={styles.selectedIndicator}>
                    <MaterialIcons name="radio-button-checked" size={24} color="#00B4DB" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.paymentInfo}>
            <MaterialIcons name="security" size={24} color="white" />
            <Text style={styles.paymentInfoText}>
              Pagamento seguro • Cancele a qualquer momento
            </Text>
          </View>

          <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
            <MaterialIcons name="payment" size={24} color="white" />
            <Text style={styles.payButtonText}>Assinar Agora</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            Ao prosseguir, você concorda com nossos Termos de Uso e Política de Privacidade
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
    fontSize: 24,
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
  plansContainer: {
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#00B4DB',
    shadowColor: '#00B4DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  planCardPopular: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    left: 20,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00B4DB',
  },
  planPeriod: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paymentInfoText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'white',
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
});