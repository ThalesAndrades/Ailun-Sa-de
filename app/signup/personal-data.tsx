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
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormInput from '../../components/signup/FormInput';
import ProgressIndicator from '../../components/signup/ProgressIndicator';
import { isValidCPF, isValidBrazilianDate } from '../../utils/validators';

export default function PersonalDataScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [nameError, setNameError] = useState('');
  const [cpfError, setCpfError] = useState('');
  const [birthdateError, setBirthdateError] = useState('');

  const formatCPF = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 11) {
      return numericValue
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return cpf;
  };

  const formatDate = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 8) {
      return numericValue
        .replace(/(\d{2})(\d)/, '$1/$2')
        .replace(/(\d{2})(\d)/, '$1/$2');
    }
    return birthdate;
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);
    if (cpfError) setCpfError('');
  };

  const handleBirthdateChange = (value: string) => {
    const formatted = formatDate(value);
    setBirthdate(formatted);
    if (birthdateError) setBirthdateError('');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) setNameError('');
  };

  const validateFields = (): boolean => {
    let isValid = true;

    // Validar nome
    if (name.trim().length < 3) {
      setNameError('Nome completo é obrigatório');
      isValid = false;
    }

    // Validar CPF
    if (!isValidCPF(cpf)) {
      setCpfError('CPF inválido');
      isValid = false;
    }

    // Validar data de nascimento
    if (!isValidBrazilianDate(birthdate)) {
      setBirthdateError('Data de nascimento inválida (DD/MM/AAAA)');
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateFields()) {
      // Salvar dados no contexto ou AsyncStorage
      // Por enquanto, apenas navegar para a próxima tela
      router.push({
        pathname: '/signup/contact',
        params: { name, cpf, birthdate },
      });
    }
  };

  const isFormValid = name.trim().length >= 3 && isValidCPF(cpf) && isValidBrazilianDate(birthdate);

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
            currentStep={1}
            totalSteps={4}
            stepLabels={['Dados', 'Contato', 'Endereço', 'Plano']}
          />

          <View style={styles.card}>
            <Text style={styles.title}>Dados Pessoais</Text>
            <Text style={styles.description}>
              Vamos começar com suas informações básicas
            </Text>

            <FormInput
              label="Nome Completo"
              value={name}
              onChangeText={handleNameChange}
              error={nameError}
              icon="person"
              placeholder="Digite seu nome completo"
              autoCapitalize="words"
              isValid={name.trim().length >= 3}
            />

            <FormInput
              label="CPF"
              value={cpf}
              onChangeText={handleCpfChange}
              error={cpfError}
              icon="badge"
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
              isValid={isValidCPF(cpf)}
            />

            <FormInput
              label="Data de Nascimento"
              value={birthdate}
              onChangeText={handleBirthdateChange}
              error={birthdateError}
              icon="cake"
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              maxLength={10}
              isValid={isValidBrazilianDate(birthdate)}
            />
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

