import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors, spacing, typography } from '../constants/theme';
import { authService } from '../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatCPF = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return cpf;
  };

  const handleCPFChange = (text: string) => {
    const formatted = formatCPF(text);
    setCpf(formatted);
    setError('');
  };

  const handleLogin = async () => {
    const cpfNumbers = cpf.replace(/\D/g, '');
    
    if (cpfNumbers.length !== 11) {
      setError('CPF inválido');
      return;
    }

    setLoading(true);
    setError('');

    const result = await authService.verificarBeneficiarioAtivo(cpfNumbers);

    setLoading(false);

    if (result.success && result.data) {
      router.replace({
        pathname: '/dashboard',
        params: {
          cpf: cpfNumbers,
          nome: result.data.nome,
        },
      });
    } else {
      setError(result.error || 'CPF não encontrado na base de beneficiários ativos');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo ao Ailun</Text>
          <Text style={styles.subtitle}>
            Entre com seu CPF para acessar
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={handleCPFChange}
              keyboardType="numeric"
              maxLength={14}
              editable={!loading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Acesso exclusivo para beneficiários cadastrados
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
  button: {
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
