import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

type PlanType = 'G' | 'GS' | 'GSP';

interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
  icon: string;
}

const PLANS: Plan[] = [
  {
    id: 'G',
    name: 'Plano Clínico',
    description: 'Consultas com clínico geral ilimitadas',
    price: 49.90,
    icon: 'medical-services',
    features: [
      'Médico Imediato 24h',
      'Consultas ilimitadas',
      'Atendimento online',
      'Prescrição médica digital',
    ],
  },
  {
    id: 'GS',
    name: 'Plano Clínico + Especialistas',
    description: 'Inclui consultas com especialistas',
    price: 89.90,
    icon: 'local-hospital',
    popular: true,
    features: [
      'Tudo do Plano Clínico',
      'Consultas com especialistas',
      'Agendamento facilitado',
      'Encaminhamento médico',
    ],
  },
  {
    id: 'GSP',
    name: 'Plano Completo',
    description: 'Acesso total a todos os serviços',
    price: 129.90,
    icon: 'verified',
    features: [
      'Tudo do Plano Clínico + Especialistas',
      'Psicólogos qualificados',
      'Nutricionistas especializados',
      'Suporte prioritário',
    ],
  },
];

export default function SelectPlanScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>('GS'); // Default: plano mais popular
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSelectPlan = (planId: PlanType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (!selectedPlan) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const plan = PLANS.find(p => p.id === selectedPlan);
    router.push({
      pathname: '/subscription/terms',
      params: {
        planId: selectedPlan,
        planName: plan?.name,
        planPrice: plan?.price.toString(),
      },
    });
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
            <Text style={styles.headerTitle}>Escolha seu Plano</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Título */}
          <View style={styles.titleContainer}>
            <MaterialIcons name="favorite" size={48} color="#fff" />
            <Text style={styles.title}>Quero Ser AiLun</Text>
            <Text style={styles.subtitle}>
              Selecione o plano que melhor atende às suas necessidades de saúde
            </Text>
          </View>

          {/* Planos */}
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.popular && styles.planCardPopular,
              ]}
              onPress={() => handleSelectPlan(plan.id)}
              activeOpacity={0.8}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MAIS POPULAR</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={styles.planIconContainer}>
                  <MaterialIcons name={plan.icon as any} size={32} color="#00B4DB" />
                </View>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
                {selectedPlan === plan.id && (
                  <MaterialIcons name="check-circle" size={28} color="#4CAF50" />
                )}
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>
                  R$ {plan.price.toFixed(2).replace('.', ',')}
                </Text>
                <Text style={styles.planPeriod}>/mês</Text>
              </View>

              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <MaterialIcons name="check" size={18} color="#4CAF50" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}

          {/* Botão de Continuar */}
          <TouchableOpacity
            style={[styles.continueButton, !selectedPlan && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!selectedPlan}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Informações Adicionais */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={20} color="#00B4DB" />
            <Text style={styles.infoText}>
              Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais.
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
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardSelected: {
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  planCardPopular: {
    borderColor: '#FFB74D',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FFB74D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 180, 219, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
});

