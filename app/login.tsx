import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { loginWithCPF } from '../services/cpfAuth';
import { MessageTemplates } from '../constants/messageTemplates';
import {
  showTemplateMessage,
  showErrorAlert,
  showInvalidCPFAlert
} from '../utils/alertHelpers';

const CPF_KEY = 'last_used_cpf';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [senhaError, setSenhaError] = useState('');

  // Animações
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  const [cpfShakeAnim] = useState(new Animated.Value(0));
  const [senhaShakeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Tentar login biométrico ao iniciar
    checkBiometricAuth();
  }, []);

  const checkBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const lastUsedCPF = await SecureStore.getItemAsync(CPF_KEY);

    if (hasHardware && isEnrolled && lastUsedCPF) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login com Biometria',
        cancelLabel: 'Usar Senha',
      });

      if (result.success) {
        const storedPassword = await SecureStore.getItemAsync(lastUsedCPF);
        if (storedPassword) {
          handleLogin(lastUsedCPF, storedPassword);
        }
      }
    }
  };

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

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);
    if (cpfError) setCpfError('');

    const numericCPF = value.replace(/\D/g, '');
    if (numericCPF.length >= 4) {
      setSenha(numericCPF.substring(0, 4));
      if (senhaError) setSenhaError('');
    }
  };

  const validateFields = () => {
    let isValid = true;
    if (!cpf.trim()) {
      setCpfError("CPF é obrigatório");
      triggerShake(cpfShakeAnim);
      isValid = false;
    } else if (cpf.replace(/\D/g, '').length !== 11) {
      setCpfError("CPF deve ter 11 dígitos");
      triggerShake(cpfShakeAnim);
      isValid = false;
    }

    if (!senha.trim()) {
      setSenhaError("Senha é obrigatória");
      triggerShake(senhaShakeAnim);
      isValid = false;
    } else if (senha.length !== 4) {
      setSenhaError("Senha deve ter 4 dígitos");
      triggerShake(senhaShakeAnim);
      isValid = false;
    }

    if (!isValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    return isValid;
  };

  const triggerShake = (shakeAnim: Animated.Value) => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleLogin = async (cpfValue = cpf, senhaValue = senha) => {
    if (!validateFields()) return;

    setLoading(true);

    try {
      const numericCPF = cpfValue.replace(/\D/g, '');
      const result = await loginWithCPF(numericCPF, senhaValue);

      if (result.success && result.data) {
        await SecureStore.setItemAsync(CPF_KEY, numericCPF);
        await SecureStore.setItemAsync(numericCPF, senhaValue);

        showTemplateMessage(MessageTemplates.auth.loginSuccess(result.data.name));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setTimeout(() => {
          router.replace('/dashboard');
        }, 1500);
      } else {
        showErrorAlert(result.error || 'Erro inesperado');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      showTemplateMessage(MessageTemplates.errors.network);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showTemplateMessage({
      title: '🔑 Esqueceu a Senha?',
      message: 'Sua senha são os 4 primeiros dígitos do seu CPF.\n\nPor exemplo:\nCPF: 123.456.789-10\nSenha: 1234\n\nSe continuar com problemas, entre em contato conosco.',
      type: 'info'
    });
  };

  const handleHelp = () => {
    showTemplateMessage({
      title: '❓ Ajuda',
      message: 'Como fazer login:\n\n1. Digite seu CPF completo\n2. A senha são os 4 primeiros dígitos do CPF\n3. Toque em "Entrar"\n\nPrecisa de ajuda? Entre em contato:\ncontato@ailun.com.br',
      type: 'info'
    });
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 40 }]}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="health-and-safety" size={64} color="white" />
            </View>
            <Text style={styles.title}>AiLun Saúde</Text>
            <Text style={styles.subtitle}>Sua saúde em primeiro lugar</Text>
          </Animated.View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            <View style={styles.card}>
              <Text style={styles.formTitle}>Fazer Login</Text>
              <Text style={styles.formSubtitle}>
                Digite seus dados para acessar
              </Text>

              {/* CPF Input */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, cpfError ? styles.inputError : {}]}>
                  <MaterialIcons name="badge" size={24} color="#667eea" style={styles.inputIcon} />
                  <Animated.View style={{ transform: [{ translateX: cpfShakeAnim }] }}>
                    <TextInput
                      style={styles.input}
                      placeholder="CPF"
                      value={cpf}
                      onChangeText={handleCPFChange}
                      keyboardType="numeric"
                      maxLength={14}
                      editable={!loading}
                    />
                  </Animated.View>
                </View>
                {cpfError ? <Text style={styles.errorText}>{cpfError}</Text> : null}
              </View>

              {/* Senha Input */}
              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, senhaError ? styles.inputError : {}]}>
                  <MaterialIcons name="lock" size={24} color="#667eea" style={styles.inputIcon} />
                  <Animated.View style={{ transform: [{ translateX: senhaShakeAnim }] }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Senha (4 primeiros dígitos do CPF)"
                      value={senha}
                      onChangeText={setSenha}
                      secureTextEntry={!showPassword}
                      keyboardType="numeric"
                      maxLength={4}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </Animated.View>
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons
                      name={showPassword ? 'visibility' : 'visibility-off'}
                      size={24}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
                {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled, { transform: [{ scale: buttonScaleAnim }] }]}
                onPressIn={() => Animated.spring(buttonScaleAnim, { toValue: 0.95, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(buttonScaleAnim, { toValue: 1, useNativeDriver: true }).start()}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <MaterialIcons name="login" size={24} color="white" />
                    <Text style={styles.loginButtonText}>Entrar</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Help Links */}
              <View style={styles.helpContainer}>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.helpLink}>Esqueceu a senha?</Text>
                </TouchableOpacity>

                <View style={styles.helpSeparator} />

                <TouchableOpacity onPress={handleHelp}>
                  <Text style={styles.helpLink}>Precisa de ajuda?</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Recursos Disponíveis</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="medical-services" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.featureText}>Médico Imediato</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="person-search" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.featureText}>Especialistas</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="psychology" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.featureText}>Psicologia</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="restaurant" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.featureText}>Nutrição</Text>
                </View>
              </View>
            </View>

            <Text style={styles.footerText}>
              AiLun Tecnologia • CNPJ: 60.740.536/0001-75
            </Text>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  helpLink: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  helpSeparator: {
    width: 1,
    height: 16,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});

