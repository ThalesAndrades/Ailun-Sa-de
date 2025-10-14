import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormInput from '../../components/signup/FormInput';
import ProgressIndicator from '../../components/signup/ProgressIndicator';
import { isValidEmail, isValidPhone } from '../../utils/validators';

export default function ContactScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const formatPhone = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 11) {
      if (numericValue.length <= 10) {
        // (XX) XXXX-XXXX
        return numericValue
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2');
      } else {
        // (XX) XXXXX-XXXX
        return numericValue
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2');
      }
    }
    return phone;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError) setEmailError('');
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
    if (phoneError) setPhoneError('');
  };

  const validateFields = (): boolean => {
    let isValid = true;

    // Validar email
    if (!isValidEmail(email)) {
      setEmailError('E-mail inválido');
      isValid = false;
    }

    // Validar telefone
    if (!isValidPhone(phone)) {
      setPhoneError('Telefone inválido');
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateFields()) {
      router.push({
        pathname: '/signup/address',
        params: { ...params, email, phone },
      });
    }
  };

  const isFormValid = isValidEmail(email) && isValidPhone(phone);

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
            currentStep={2}
            totalSteps={4}
            stepLabels={['Dados', 'Contato', 'Endereço', 'Plano']}
          />

          <View style={styles.card}>
            <Text style={styles.title}>Informações de Contato</Text>
            <Text style={styles.description}>
              Como podemos entrar em contato com você?
            </Text>

            <FormInput
              label="E-mail"
              value={email}
              onChangeText={handleEmailChange}
              error={emailError}
              icon="email"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              isValid={isValidEmail(email)}
            />

            <FormInput
              label="Telefone/Celular"
              value={phone}
              onChangeText={handlePhoneChange}
              error={phoneError}
              icon="phone"
              placeholder="(00) 00000-0000"
              keyboardType="phone-pad"
              maxLength={15}
              isValid={isValidPhone(phone)}
            />

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Usaremos essas informações para enviar confirmações e atualizações importantes sobre seu plano.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Próximo</Text>
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
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00B4DB',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  nextButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00B4DB',
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

