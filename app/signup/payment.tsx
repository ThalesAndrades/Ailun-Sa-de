import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ProgressIndicator from '../../components/signup/ProgressIndicator';
import PlanServiceSelector from '../../components/signup/PlanServiceSelector';
import MemberCountSelector from '../../components/signup/MemberCountSelector';
import PlanSummary from '../../components/signup/PlanSummary';
import { calculatePlan } from '../../utils/plan-calculator';

type PaymentMethod = 'credit_card' | 'pix' | 'boleto';

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Estado dos serviços selecionados
  const [includeSpecialists, setIncludeSpecialists] = useState(false);
  const [includePsychology, setIncludePsychology] = useState(false);
  const [includeNutrition, setIncludeNutrition] = useState(false);
  
  // Estado da quantidade de membros
  const [memberCount, setMemberCount] = useState(1);
  
  // Estado do método de pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  
  // Estado dos termos
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Cálculo do plano
  const [planDetails, setPlanDetails] = useState(
    calculatePlan({
      includeSpecialists: false,
      includePsychology: false,
      includeNutrition: false,
      memberCount: 1,
    })
  );

  // Atualizar cálculo quando os serviços ou membros mudarem
  useEffect(() => {
    const details = calculatePlan({
      includeSpecialists,
      includePsychology,
      includeNutrition,
      memberCount,
    });
    setPlanDetails(details);
  }, [includeSpecialists, includePsychology, includeNutrition, memberCount]);

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleFinalize = () => {
    if (!acceptedTerms) {
      Alert.alert(
        'Termos e Condições',
        'Por favor, aceite os termos de uso e a política de privacidade para continuar.'
      );
      return;
    }

    // Preparar dados para a próxima tela
    const registrationData = {
      ...params,
      includeSpecialists,
      includePsychology,
      includeNutrition,
      memberCount,
      paymentMethod,
      serviceType: planDetails.serviceType,
      totalPrice: planDetails.totalPrice,
      discountPercentage: planDetails.discountPercentage,
    };

    // Navegar para a tela de confirmação/processamento de pagamento
    router.push({
      pathname: '/signup/confirmation',
      params: registrationData,
    });
  };

  const isFormValid = acceptedTerms;

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ProgressIndicator
            currentStep={4}
            totalSteps={4}
            stepLabels={['Dados', 'Contato', 'Endereço', 'Plano']}
          />

          {/* Card de Seleção de Serviços */}
          <View style={styles.card}>
            <Text style={styles.title}>Monte seu Plano</Text>
            <Text style={styles.description}>
              Escolha os serviços que você e sua família precisam
            </Text>

            <PlanServiceSelector
              includeSpecialists={includeSpecialists}
              includePsychology={includePsychology}
              includeNutrition={includeNutrition}
              onSpecialistsChange={setIncludeSpecialists}
              onPsychologyChange={setIncludePsychology}
              onNutritionChange={setIncludeNutrition}
            />
          </View>

          {/* Card de Seleção de Membros */}
          <View style={styles.card}>
            <Text style={styles.title}>Quantas pessoas?</Text>
            <Text style={styles.description}>
              Adicione membros e ganhe descontos progressivos
            </Text>

            <MemberCountSelector
              memberCount={memberCount}
              onMemberCountChange={setMemberCount}
              maxMembers={10}
            />
          </View>

          {/* Card de Resumo do Plano */}
          <View style={styles.card}>
            <PlanSummary
              includeSpecialists={includeSpecialists}
              includePsychology={includePsychology}
              includeNutrition={includeNutrition}
              memberCount={memberCount}
            />
          </View>

          {/* Card de Método de Pagamento */}
          <View style={styles.card}>
            <Text style={styles.title}>Método de Pagamento</Text>
            <Text style={styles.description}>
              Como você prefere pagar?
            </Text>

            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  paymentMethod === 'credit_card' && styles.paymentMethodSelected,
                ]}
                onPress={() => handlePaymentMethodSelect('credit_card')}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="credit-card"
                  size={28}
                  color={paymentMethod === 'credit_card' ? '#00B4DB' : '#666'}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'credit_card' && styles.paymentMethodTextSelected,
                  ]}
                >
                  Cartão de Crédito
                </Text>
                {paymentMethod === 'credit_card' && (
                  <View style={styles.checkmark}>
                    <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  paymentMethod === 'pix' && styles.paymentMethodSelected,
                ]}
                onPress={() => handlePaymentMethodSelect('pix')}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="qr-code"
                  size={28}
                  color={paymentMethod === 'pix' ? '#00B4DB' : '#666'}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'pix' && styles.paymentMethodTextSelected,
                  ]}
                >
                  PIX
                </Text>
                {paymentMethod === 'pix' && (
                  <View style={styles.checkmark}>
                    <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentMethod,
                  paymentMethod === 'boleto' && styles.paymentMethodSelected,
                ]}
                onPress={() => handlePaymentMethodSelect('boleto')}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="receipt"
                  size={28}
                  color={paymentMethod === 'boleto' ? '#00B4DB' : '#666'}
                />
                <Text
                  style={[
                    styles.paymentMethodText,
                    paymentMethod === 'boleto' && styles.paymentMethodTextSelected,
                  ]}
                >
                  Boleto
                </Text>
                {paymentMethod === 'boleto' && (
                  <View style={styles.checkmark}>
                    <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Card de Termos e Condições */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                ]}
              >
                {acceptedTerms && (
                  <MaterialIcons name="check" size={18} color="#fff" />
                )}
              </View>
              <Text style={styles.termsText}>
                Li e aceito os{' '}
                <Text style={styles.termsLink}>Termos de Uso</Text> e a{' '}
                <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão de Finalizar */}
          <TouchableOpacity
            style={[styles.finalizeButton, !isFormValid && styles.finalizeButtonDisabled]}
            onPress={handleFinalize}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={styles.finalizeButtonText}>Finalizar Cadastro</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  paymentMethodSelected: {
    borderColor: '#00B4DB',
    backgroundColor: '#f0f9ff',
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  paymentMethodTextSelected: {
    color: '#00B4DB',
  },
  checkmark: {
    marginLeft: 'auto',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#00B4DB',
    borderColor: '#00B4DB',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#00B4DB',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  finalizeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  finalizeButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  finalizeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

