import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
  Clipboard,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRegistration } from '../../hooks/useRegistration';
import FormInput from '../../components/signup/FormInput';
import { isValidCreditCard, isValidCvv, isValidExpiryMonth, isValidExpiryYear } from '../../utils/validators';
import { formatCurrency } from '../../utils/plan-calculator';

type PaymentStep = 'confirmation' | 'payment_details' | 'processing' | 'pix_payment' | 'success';

export default function ConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { register, loading } = useRegistration();
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<PaymentStep>('confirmation');
  const [scaleAnim] = useState(new Animated.Value(0));
  
  // Estados do cartão de crédito
  const [holderName, setHolderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Estados do pagamento
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const paymentMethod = params.paymentMethod as string;
  const totalPrice = parseFloat(params.totalPrice as string) || 0;

  const formatCardNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue
      .replace(/(\d{4})(\d)/, '$1 $2')
      .replace(/(\d{4}) (\d{4})(\d)/, '$1 $2 $3')
      .replace(/(\d{4}) (\d{4}) (\d{4})(\d)/, '$1 $2 $3 $4')
      .substring(0, 19);
  };

  const formatExpiry = (value: string, type: 'month' | 'year') => {
    const numericValue = value.replace(/\D/g, '');
    if (type === 'month') {
      return numericValue.substring(0, 2);
    }
    return numericValue.substring(0, 4);
  };

  const isCardFormValid = () => {
    return (
      holderName.trim().length >= 3 &&
      isValidCreditCard(cardNumber.replace(/\s/g, '')) &&
      isValidExpiryMonth(expiryMonth) &&
      isValidExpiryYear(expiryYear) &&
      isValidCvv(cvv)
    );
  };

  const handleConfirm = () => {
    if (paymentMethod === 'credit_card') {
      setCurrentStep('payment_details');
    } else {
      processPayment();
    }
  };

  const processPayment = async () => {
    setCurrentStep('processing');
    setProcessing(true);
    
    try {
      const registrationData = {
        fullName: params.name as string,
        cpf: params.cpf as string,
        birthDate: params.birthdate as string,
        email: params.email as string,
        phone: params.phone as string,
        cep: params.cep as string,
        street: params.street as string,
        number: params.number as string,
        complement: params.complement as string,
        neighborhood: params.neighborhood as string,
        city: params.city as string,
        state: params.state as string,
        includeSpecialists: params.includeSpecialists === 'true',
        includePsychology: params.includePsychology === 'true',
        includeNutrition: params.includeNutrition === 'true',
        memberCount: parseInt(params.memberCount as string) || 1,
        serviceType: params.serviceType as string,
        totalPrice,
        discountPercentage: parseFloat(params.discountPercentage as string),
        paymentMethod: paymentMethod as 'credit_card' | 'pix' | 'boleto',
      };

      // Adicionar dados do cartão se necessário
      if (paymentMethod === 'credit_card') {
        registrationData.creditCard = {
          holderName,
          number: cardNumber.replace(/\s/g, ''),
          expiryMonth,
          expiryYear,
          ccv: cvv,
        };
      }

      const result = await register(registrationData);

      if (result.success) {
        setPaymentResult(result);
        
        if (paymentMethod === 'pix' && result.pixQrCode) {
          setCurrentStep('pix_payment');
        } else if (paymentMethod === 'boleto' && result.boletoUrl) {
          // Abrir boleto em nova janela/navegador
          if (result.boletoUrl) {
            await Linking.openURL(result.boletoUrl);
          }
          setCurrentStep('success');
        } else {
          setCurrentStep('success');
        }
        
        // Animar sucesso
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      } else {
        Alert.alert(
          'Erro no Pagamento',
          result.error || 'Ocorreu um erro ao processar o pagamento. Tente novamente.'
        );
        setCurrentStep('confirmation');
      }
    } catch (error: any) {
      Alert.alert(
        'Erro',
        error.message || 'Ocorreu um erro inesperado. Tente novamente.'
      );
      setCurrentStep('confirmation');
    } finally {
      setProcessing(false);
    }
  };

  const copyPixCode = async () => {
    if (paymentResult?.pixCopyPaste) {
      await Clipboard.setString(paymentResult.pixCopyPaste);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência.');
    }
  };

  const finalizeCadastro = () => {
    Alert.alert(
      'Cadastro Concluído!',
      'Seu cadastro foi processado com sucesso. Você já pode fazer login na AiLun Saúde.',
      [
        {
          text: 'Fazer Login',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  // Renderizar tela de confirmação
  if (currentStep === 'confirmation') {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
            </View>

            <Text style={styles.title}>Confirme seus Dados</Text>
            <Text style={styles.subtitle}>
              Revise as informações antes de finalizar seu cadastro
            </Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Resumo do Cadastro</Text>
              
              <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>🧑‍💼 Dados Pessoais</Text>
                <Text style={styles.summaryText}>• {params.name}</Text>
                <Text style={styles.summaryText}>• CPF: {params.cpf}</Text>
                <Text style={styles.summaryText}>• Nascimento: {params.birthdate}</Text>
              </View>

              <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>📧 Contato</Text>
                <Text style={styles.summaryText}>• {params.email}</Text>
                <Text style={styles.summaryText}>• {params.phone}</Text>
              </View>

              <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>📍 Endereço</Text>
                <Text style={styles.summaryText}>
                  • {params.street}, {params.number}
                  {params.complement ? `, ${params.complement}` : ''}
                </Text>
                <Text style={styles.summaryText}>
                  • {params.neighborhood}, {params.city}/{params.state}
                </Text>
              </View>

              <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>💳 Pagamento</Text>
                <Text style={styles.planPrice}>{formatCurrency(totalPrice)}/mês</Text>
                <Text style={styles.planDetails}>
                  {paymentMethod === 'credit_card' ? '💳 Cartão de Crédito' : 
                   paymentMethod === 'pix' ? '📱 PIX' : '🧾 Boleto Bancário'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>
                {paymentMethod === 'credit_card' ? 'Inserir Dados do Cartão' : 'Finalizar Cadastro'}
              </Text>
              <MaterialIcons name="arrow-forward" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Renderizar tela de detalhes do cartão
  if (currentStep === 'payment_details') {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="credit-card" size={80} color="#fff" />
            </View>

            <Text style={styles.title}>Dados do Cartão</Text>
            <Text style={styles.subtitle}>
              Insira os dados do seu cartão de crédito
            </Text>

            <View style={styles.card}>
              <FormInput
                label="Nome no Cartão"
                value={holderName}
                onChangeText={setHolderName}
                icon="person"
                placeholder="Como está escrito no cartão"
                autoCapitalize="words"
              />

              <FormInput
                label="Número do Cartão"
                value={cardNumber}
                onChangeText={(value) => setCardNumber(formatCardNumber(value))}
                icon="credit-card"
                placeholder="0000 0000 0000 0000"
                keyboardType="numeric"
                maxLength={19}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <FormInput
                    label="Mês"
                    value={expiryMonth}
                    onChangeText={(value) => setExpiryMonth(formatExpiry(value, 'month'))}
                    icon="calendar-today"
                    placeholder="MM"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
                <View style={styles.halfInput}>
                  <FormInput
                    label="Ano"
                    value={expiryYear}
                    onChangeText={(value) => setExpiryYear(formatExpiry(value, 'year'))}
                    icon="calendar-today"
                    placeholder="AAAA"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                </View>
                <View style={styles.halfInput}>
                  <FormInput
                    label="CVV"
                    value={cvv}
                    onChangeText={setCvv}
                    icon="lock"
                    placeholder="000"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total a pagar:</Text>
                <Text style={styles.totalValue}>{formatCurrency(totalPrice)}/mês</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmButton, !isCardFormValid() && styles.confirmButtonDisabled]}
              onPress={processPayment}
              disabled={!isCardFormValid()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="lock" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Pagar {formatCurrency(totalPrice)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep('confirmation')}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Renderizar tela de processamento
  if (currentStep === 'processing') {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.processingTitle}>Processando Pagamento...</Text>
          <Text style={styles.processingText}>
            Aguarde enquanto processamos sua solicitação
          </Text>
        </View>
      </LinearGradient>
    );
  }

  // Renderizar tela de pagamento PIX
  if (currentStep === 'pix_payment') {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="qr-code" size={80} color="#fff" />
            </View>

            <Text style={styles.title}>Pagamento PIX</Text>
            <Text style={styles.subtitle}>
              Escaneie o QR Code ou copie o código PIX
            </Text>

            <View style={styles.pixCard}>
              {paymentResult?.pixQrCode && (
                <Image
                  source={{ uri: `data:image/png;base64,${paymentResult.pixQrCode}` }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              )}

              <Text style={styles.pixAmount}>{formatCurrency(totalPrice)}</Text>
              
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyPixCode}
                activeOpacity={0.8}
              >
                <MaterialIcons name="content-copy" size={20} color="#00B4DB" />
                <Text style={styles.copyButtonText}>Copiar Código PIX</Text>
              </TouchableOpacity>

              <Text style={styles.pixInstructions}>
                1. Abra o app do seu banco{"\n"}
                2. Escaneie o QR Code ou cole o código copiado{"\n"}
                3. Confirme o pagamento{"\n"}
                4. Seu cadastro será ativado automaticamente
              </Text>
            </View>

            <TouchableOpacity
              style={styles.finishButton}
              onPress={finalizeCadastro}
              activeOpacity={0.8}
            >
              <Text style={styles.finishButtonText}>Finalizar Cadastro</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Renderizar tela de sucesso
  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.successIcon,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <MaterialIcons name="check-circle" size={120} color="#4CAF50" />
          </Animated.View>
          
          <Text style={styles.successTitle}>Cadastro Concluído!</Text>
          <Text style={styles.successText}>
            Seu cadastro foi processado com sucesso.{"\n"}
            Você já pode fazer login na AiLun Saúde.
          </Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Seu Plano AiLun</Text>
            
            <View style={styles.servicesList}>
              <View style={styles.serviceItem}>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.serviceText}>Clínico Geral 24h</Text>
              </View>

              {params.includeSpecialists === 'true' && (
                <View style={styles.serviceItem}>
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.serviceText}>Especialistas</Text>
                </View>
              )}

              {params.includePsychology === 'true' && (
                <View style={styles.serviceItem}>
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.serviceText}>Psicologia (2x/mês)</Text>
                </View>
              )}

              {params.includeNutrition === 'true' && (
                <View style={styles.serviceItem}>
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.serviceText}>Nutrição (1x/3 meses)</Text>
                </View>
              )}
            </View>

            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Valor Mensal:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace('/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Fazer Login</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  summarySection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B4DB',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  planDetails: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  servicesList: {
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00B4DB',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
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
  processingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  processingText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  pixCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  qrCode: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  pixAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 20,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B4DB',
    marginLeft: 8,
  },
  pixInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  finishButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    width: '100%',
    alignItems: 'center',
  },
  finishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B4DB',
  },
  successIcon: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 40,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00B4DB',
    marginRight: 8,
  },
});