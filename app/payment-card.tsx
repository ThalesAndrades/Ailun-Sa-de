import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCPFAuth } from '../hooks/useCPFAuth';
import { useSubscription } from '../hooks/useSubscription';

interface CardForm {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  postalCode: string;
  address: string;
  addressNumber: string;
  complement: string;
  province: string;
}

export default function PaymentCardScreen() {
  const insets = useSafeAreaInsets();
  const { user, beneficiaryUuid } = useCPFAuth();
  const { createSubscription, loading } = useSubscription(beneficiaryUuid || '');

  const [form, setForm] = useState<CardForm>({
    holderName: user?.name || '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
    postalCode: '',
    address: '',
    addressNumber: '',
    complement: '',
    province: '',
  });

  const [errors, setErrors] = useState<Partial<CardForm>>({});

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CardForm> = {};

    if (!form.holderName.trim()) {
      newErrors.holderName = 'Nome do titular é obrigatório';
    }

    if (!form.number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.number = 'Número do cartão deve ter 16 dígitos';
    }

    if (!form.expiryMonth.match(/^(0[1-9]|1[0-2])$/)) {
      newErrors.expiryMonth = 'Mês deve estar entre 01 e 12';
    }

    if (!form.expiryYear.match(/^\d{4}$/)) {
      newErrors.expiryYear = 'Ano deve ter 4 dígitos';
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const expYear = parseInt(form.expiryYear);
    const expMonth = parseInt(form.expiryMonth);

    if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
      newErrors.expiryYear = 'Cartão vencido';
    }

    if (!form.ccv.match(/^\d{3,4}$/)) {
      newErrors.ccv = 'CVV deve ter 3 ou 4 dígitos';
    }

    if (!form.postalCode.replace(/\D/g, '').match(/^\d{8}$/)) {
      newErrors.postalCode = 'CEP deve ter 8 dígitos';
    }

    if (!form.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!form.addressNumber.trim()) {
      newErrors.addressNumber = 'Número é obrigatório';
    }

    if (!form.province.trim()) {
      newErrors.province = 'Cidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/\d{1,4}/g);
    return match ? match.join(' ').substr(0, 19) : '';
  };

  const formatCEP = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2').substr(0, 9);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showAlert('Dados Inválidos', 'Por favor, corrija os campos destacados em vermelho.');
      return;
    }

    if (!user || !beneficiaryUuid) {
      showAlert('Erro', 'Dados do usuário não encontrados. Faça login novamente.');
      return;
    }

    try {
      const result = await createSubscription({
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        postalCode: form.postalCode.replace(/\D/g, ''),
        address: form.address,
        addressNumber: form.addressNumber,
        complement: form.complement,
        province: form.province,
        billingType: 'CREDIT_CARD',
        creditCard: {
          holderName: form.holderName.toUpperCase(),
          number: form.number.replace(/\s/g, ''),
          expiryMonth: form.expiryMonth,
          expiryYear: form.expiryYear,
          ccv: form.ccv,
        },
      });

      if (result.success) {
        showAlert(
          'Assinatura Criada!',
          'Sua assinatura foi criada com sucesso! Você receberá uma confirmação por email.'
        );
        router.replace('/subscription');
      } else {
        showAlert('Erro no Pagamento', result.error || 'Não foi possível processar o pagamento.');
      }
    } catch (error: any) {
      console.error('Erro ao criar assinatura:', error);
      showAlert('Erro', 'Erro inesperado. Tente novamente.');
    }
  };

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={[styles.scrollContainer, { paddingTop: insets.top }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pagamento com Cartão</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.priceCard}>
              <Text style={styles.priceTitle}>AiLun Saúde Premium</Text>
              <Text style={styles.priceValue}>R$ 89,90/mês</Text>
              <Text style={styles.priceSubtitle}>Renovação automática • Cancele quando quiser</Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Dados do Cartão</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome no Cartão</Text>
                <TextInput
                  style={[styles.input, errors.holderName && styles.inputError]}
                  value={form.holderName}
                  onChangeText={(text) => setForm({ ...form, holderName: text })}
                  placeholder="Nome conforme impresso no cartão"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                />
                {errors.holderName && <Text style={styles.errorText}>{errors.holderName}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número do Cartão</Text>
                <TextInput
                  style={[styles.input, errors.number && styles.inputError]}
                  value={form.number}
                  onChangeText={(text) => setForm({ ...form, number: formatCardNumber(text) })}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={19}
                />
                {errors.number && <Text style={styles.errorText}>{errors.number}</Text>}
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Mês</Text>
                  <TextInput
                    style={[styles.input, errors.expiryMonth && styles.inputError]}
                    value={form.expiryMonth}
                    onChangeText={(text) => setForm({ ...form, expiryMonth: text.replace(/\D/g, '') })}
                    placeholder="MM"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={2}
                  />
                  {errors.expiryMonth && <Text style={styles.errorText}>{errors.expiryMonth}</Text>}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginHorizontal: 8 }]}>
                  <Text style={styles.inputLabel}>Ano</Text>
                  <TextInput
                    style={[styles.input, errors.expiryYear && styles.inputError]}
                    value={form.expiryYear}
                    onChangeText={(text) => setForm({ ...form, expiryYear: text.replace(/\D/g, '') })}
                    placeholder="AAAA"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  {errors.expiryYear && <Text style={styles.errorText}>{errors.expiryYear}</Text>}
                </View>

                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={[styles.input, errors.ccv && styles.inputError]}
                    value={form.ccv}
                    onChangeText={(text) => setForm({ ...form, ccv: text.replace(/\D/g, '') })}
                    placeholder="000"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                  {errors.ccv && <Text style={styles.errorText}>{errors.ccv}</Text>}
                </View>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Endereço de Cobrança</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CEP</Text>
                <TextInput
                  style={[styles.input, errors.postalCode && styles.inputError]}
                  value={form.postalCode}
                  onChangeText={(text) => setForm({ ...form, postalCode: formatCEP(text) })}
                  placeholder="00000-000"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={9}
                />
                {errors.postalCode && <Text style={styles.errorText}>{errors.postalCode}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Endereço</Text>
                <TextInput
                  style={[styles.input, errors.address && styles.inputError]}
                  value={form.address}
                  onChangeText={(text) => setForm({ ...form, address: text })}
                  placeholder="Rua, Avenida, etc."
                  placeholderTextColor="#999"
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Número</Text>
                  <TextInput
                    style={[styles.input, errors.addressNumber && styles.inputError]}
                    value={form.addressNumber}
                    onChangeText={(text) => setForm({ ...form, addressNumber: text })}
                    placeholder="123"
                    placeholderTextColor="#999"
                  />
                  {errors.addressNumber && <Text style={styles.errorText}>{errors.addressNumber}</Text>}
                </View>

                <View style={[styles.inputGroup, { flex: 2, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Complemento (Opcional)</Text>
                  <TextInput
                    style={styles.input}
                    value={form.complement}
                    onChangeText={(text) => setForm({ ...form, complement: text })}
                    placeholder="Apto, Bloco, etc."
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Cidade</Text>
                <TextInput
                  style={[styles.input, errors.province && styles.inputError]}
                  value={form.province}
                  onChangeText={(text) => setForm({ ...form, province: text })}
                  placeholder="São Paulo"
                  placeholderTextColor="#999"
                />
                {errors.province && <Text style={styles.errorText}>{errors.province}</Text>}
              </View>
            </View>

            <View style={styles.securityInfo}>
              <MaterialIcons name="lock" size={20} color="white" />
              <Text style={styles.securityText}>
                Seus dados estão protegidos com criptografia SSL
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size={24} />
              ) : (
                <>
                  <MaterialIcons name="credit-card" size={24} color="white" />
                  <Text style={styles.payButtonText}>Confirmar Pagamento</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  priceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  priceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00B4DB',
    marginBottom: 8,
  },
  priceSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  securityText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});