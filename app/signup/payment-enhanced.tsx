import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ProgressIndicator from '../../components/signup/ProgressIndicator';
import { useErrorFeedback } from '../../components/ErrorFeedback';
import { processRegistration } from '../../services/registration';

export default function PaymentEnhancedScreen() {
  const insets = useSafeAreaInsets();
  const [selectedMethod, setSelectedMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card');
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess, ErrorModal, ErrorToast } = useErrorFeedback();

  // Estados do cartão de crédito
  const [cardData, setCardData] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });

  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  const validateCard = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!cardData.holderName.trim()) {
      errors.holderName = 'Nome do portador é obrigatório';
    }
    
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      errors.number = 'Número do cartão inválido';
    }
    
    if (!cardData.expiryMonth || !cardData.expiryYear) {
      errors.expiry = 'Data de expiração obrigatória';
    }
    
    if (!cardData.ccv || cardData.ccv.length < 3) {
      errors.ccv = 'CVV inválido';
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayment = async () => {
    if (selectedMethod === 'credit_card' && !validateCard()) {
      showError({
        title: 'Dados do Cartão Inválidos',
        message: 'Por favor, verifique os dados do seu cartão de crédito.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);

    try {
      // Simular dados de registro (normalmente viriam do contexto ou params)
      const registrationData = {
        fullName: 'João Silva Santos',
        cpf: '12345678901',
        birthDate: '1985-03-15',
        email: 'joao.silva@email.com',
        phone: '11987654321',
        cep: '01310100',
        street: 'Av Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        includeSpecialists: true,
        includePsychology: false,
        includeNutrition: false,
        memberCount: 1,
        serviceType: 'gs',
        totalPrice: 89.90,
        discountPercentage: 0,
        paymentMethod: selectedMethod,
        creditCard: selectedMethod === 'credit_card' ? cardData : undefined,
      };

      const result = await processRegistration(registrationData);

      if (result.success) {
        showSuccess('Pagamento processado com sucesso! Redirecionando...', true);
        
        setTimeout(() => {
          router.push({
            pathname: '/signup/confirmation',
            params: {
              beneficiaryUuid: result.beneficiaryUuid,
              paymentMethod: selectedMethod,
              pixQrCode: result.pixQrCode,
              boletoUrl: result.boletoUrl,
            },
          });
        }, 2000);

      } else {
        showError({
          title: 'Erro no Pagamento',
          message: result.error || 'Não foi possível processar o pagamento. Tente novamente.',
          type: 'error',
          actionText: 'Tentar Novamente',
          onAction: () => handlePayment(),
        }, true);
      }

    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      showError({
        title: 'Erro Inesperado',
        message: 'Ocorreu um erro inesperado. Por favor, tente novamente em alguns minutos.',
        type: 'error',
      }, true);
    } finally {
      setLoading(false);
    }
  };

  const renderCreditCardForm = () => (
    <View style={styles.cardForm}>
      <Text style={styles.sectionTitle}>Dados do Cartão</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nome no Cartão</Text>
        <View style={[styles.inputContainer, cardErrors.holderName && styles.inputError]}>
          <MaterialIcons name="person" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Nome conforme impresso no cartão"
            value={cardData.holderName}
            onChangeText={(text) => setCardData(prev => ({ ...prev, holderName: text }))}
            placeholderTextColor="#999"
          />
        </View>
        {cardErrors.holderName && (
          <Text style={styles.errorText}>{cardErrors.holderName}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Número do Cartão</Text>
        <View style={[styles.inputContainer, cardErrors.number && styles.inputError]}>
          <MaterialIcons name="credit-card" size={20} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="0000 0000 0000 0000"
            value={cardData.number}
            onChangeText={(text) => {
              const formatted = text
                .replace(/\s/g, '')
                .replace(/(\d{4})(\d)/, '$1 $2')
                .replace(/(\d{4}) (\d{4})(\d)/, '$1 $2 $3')
                .replace(/(\d{4}) (\d{4}) (\d{4})(\d)/, '$1 $2 $3 $4');
              setCardData(prev => ({ ...prev, number: formatted }));
            }}
            maxLength={19}
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
        {cardErrors.number && (
          <Text style={styles.errorText}>{cardErrors.number}</Text>
        )}
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Validade</Text>
          <View style={styles.expiryContainer}>
            <TextInput
              style={[styles.input, styles.smallInput]}
              placeholder="MM"
              value={cardData.expiryMonth}
              onChangeText={(text) => setCardData(prev => ({ ...prev, expiryMonth: text }))}
              maxLength={2}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.expirySeparator}>/</Text>
            <TextInput
              style={[styles.input, styles.smallInput]}
              placeholder="AAAA"
              value={cardData.expiryYear}
              onChangeText={(text) => setCardData(prev => ({ ...prev, expiryYear: text }))}
              maxLength={4}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>CVV</Text>
          <View style={[styles.inputContainer, cardErrors.ccv && styles.inputError]}>
            <MaterialIcons name="lock" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="000"
              value={cardData.ccv}
              onChangeText={(text) => setCardData(prev => ({ ...prev, ccv: text }))}
              maxLength={4}
              secureTextEntry
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </View>

      {(cardErrors.expiry || cardErrors.ccv) && (
        <Text style={styles.errorText}>
          {cardErrors.expiry || cardErrors.ccv}
        </Text>
      )}
    </View>
  );

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
            stepLabels={['Dados', 'Contato', 'Endereço', 'Pagamento']}
          />

          <View style={styles.card}>
            <Text style={styles.title}>Método de Pagamento</Text>
            <Text style={styles.description}>
              Escolha como deseja pagar sua assinatura mensal
            </Text>

            {/* Métodos de Pagamento */}
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedMethod === 'credit_card' && styles.methodSelected,
                ]}
                onPress={() => setSelectedMethod('credit_card')}
              >
                <MaterialIcons name="credit-card" size={24} color={selectedMethod === 'credit_card' ? '#00B4DB' : '#666'} />
                <Text style={[
                  styles.methodText,
                  selectedMethod === 'credit_card' && styles.methodTextSelected,
                ]}>
                  Cartão de Crédito
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedMethod === 'pix' && styles.methodSelected,
                ]}
                onPress={() => setSelectedMethod('pix')}
              >
                <MaterialIcons name="qr-code" size={24} color={selectedMethod === 'pix' ? '#00B4DB' : '#666'} />
                <Text style={[
                  styles.methodText,
                  selectedMethod === 'pix' && styles.methodTextSelected,
                ]}>
                  PIX
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedMethod === 'boleto' && styles.methodSelected,
                ]}
                onPress={() => setSelectedMethod('boleto')}
              >
                <MaterialIcons name="receipt" size={24} color={selectedMethod === 'boleto' ? '#00B4DB' : '#666'} />
                <Text style={[
                  styles.methodText,
                  selectedMethod === 'boleto' && styles.methodTextSelected,
                ]}>
                  Boleto
                </Text>
              </TouchableOpacity>
            </View>

            {/* Formulário específico do método */}
            {selectedMethod === 'credit_card' && renderCreditCardForm()}

            {selectedMethod === 'pix' && (
              <View style={styles.methodInfo}>
                <MaterialIcons name="info" size={24} color="#2196f3" />
                <Text style={styles.methodInfoText}>
                  Você receberá um QR Code para pagamento via PIX após finalizar o cadastro.
                </Text>
              </View>
            )}

            {selectedMethod === 'boleto' && (
              <View style={styles.methodInfo}>
                <MaterialIcons name="info" size={24} color="#ff9800" />
                <Text style={styles.methodInfoText}>
                  O boleto será gerado após finalizar o cadastro. Vencimento em 3 dias úteis.
                </Text>
              </View>
            )}

            {/* Resumo do valor */}
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Plano Mensal</Text>
                <Text style={styles.summaryValue}>R$ 89,90</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxa de adesão</Text>
                <Text style={styles.summaryValue}>Grátis</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>R$ 89,90/mês</Text>
              </View>
            </View>
          </View>

          {/* Botões */}
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                {selectedMethod === 'credit_card' ? 'Finalizar Pagamento' : 'Continuar'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Componentes de erro */}
        {ErrorModal}
        {ErrorToast}
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
    marginBottom: 24,
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
    marginBottom: 24,
  },
  paymentMethods: {
    marginBottom: 24,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  methodSelected: {
    borderColor: '#00B4DB',
    backgroundColor: '#f0f9ff',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    color: '#666',
  },
  methodTextSelected: {
    color: '#00B4DB',
    fontWeight: '600',
  },
  cardForm: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#f44336',
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: '#fff',
  },
  smallInput: {
    width: 60,
    textAlign: 'center',
    marginLeft: 0,
  },
  expirySeparator: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    marginBottom: 24,
  },
  methodInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    lineHeight: 20,
  },
  summary: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00B4DB',
  },
  payButton: {
    backgroundColor: '#00B4DB',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00B4DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
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