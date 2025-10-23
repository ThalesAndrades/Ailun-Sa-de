import React, { useState, useEffect } from 'react';
import 'react-native-url-polyfill/auto';
import { logger } from '../utils/logger';
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
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { MessageTemplates } from '../constants/messageTemplates';
import {
  showTemplateMessage,
  showErrorAlert,
  showInvalidCPFAlert
} from '../utils/alertHelpers';
import { useActiveBeneficiaryAuth } from '../hooks/useActiveBeneficiaryAuth';

const CPF_KEY = 'last_used_cpf';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const { 
    loading, 
    loginWithCPF: authenticateBeneficiary, 
    formatCPF: formatCPFHelper,
    validateCPFFormat,
    resetPassword
  } = useActiveBeneficiaryAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [cpfError, setCpfError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [cpfFocused, setCpfFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  // Animações
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [buttonScaleAnim] = useState(new Animated.Value(1));
  const [cpfShakeAnim] = useState(new Animated.Value(0));
  const [senhaShakeAnim] = useState(new Animated.Value(0));
  const [cpfFocusAnim] = useState(new Animated.Value(0));
  const [senhaFocusAnim] = useState(new Animated.Value(0));
  const [cardScaleAnim] = useState(new Animated.Value(0.95));
  const [logoRotateAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

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
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Animação de pulso contínua para o botão
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Tentar login biométrico ao iniciar
    checkBiometricAuth();
  }, []);

  const checkBiometricAuth = async () => {
    try {
      // SecureStore não funciona em ambiente web
      if (Platform.OS === 'web') {
        return;
      }

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
            await performLogin(lastUsedCPF, storedPassword);
          }
        }
      }
    } catch (error) {
      logger.debug('Erro ao verificar autenticação biométrica', { error });
    }
  };

  const formatCPF = (value: string) => {
    return formatCPFHelper(value);
  };

  const handleCpfFocus = () => {
    setCpfFocused(true);
    Animated.timing(cpfFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleCpfBlur = () => {
    setCpfFocused(false);
    Animated.timing(cpfFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSenhaFocus = () => {
    setSenhaFocused(true);
    Animated.timing(senhaFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSenhaBlur = () => {
    setSenhaFocused(false);
    Animated.timing(senhaFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
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

  const validateFields = (cpfValue: string, senhaValue: string) => {
    logger.debug('Validação de campos iniciada');
    
    // Limpar erros anteriores
    setCpfError('');
    setSenhaError('');
    
    let isValid = true;
    
    // Garantir que os valores são strings
    const cpfString = String(cpfValue || '').trim();
    const senhaString = String(senhaValue || '').trim();
    const numericCPF = cpfString.replace(/\D/g, '');
    
    // Validar CPF
    if (!cpfString) {
      setCpfError("CPF é obrigatório");
      triggerShake(cpfShakeAnim);
      isValid = false;
    } else if (numericCPF.length < 11) {
      setCpfError(`CPF incompleto. Digite todos os 11 dígitos (atual: ${numericCPF.length})`);
      triggerShake(cpfShakeAnim);
      isValid = false;
    } else if (numericCPF.length > 11) {
      setCpfError(`CPF muito longo. Deve ter exatamente 11 dígitos (atual: ${numericCPF.length})`);
      triggerShake(cpfShakeAnim);
      isValid = false;
    }


    
    // Validar Senha
    if (!senhaString) {
      setSenhaError("Senha é obrigatória");
      triggerShake(senhaShakeAnim);
      isValid = false;
    } else if (senhaString.length < 4) {
      setSenhaError(`Senha incompleta. Digite todos os 4 dígitos (atual: ${senhaString.length})`);
      triggerShake(senhaShakeAnim);
      isValid = false;
    } else if (senhaString.length > 4) {
      setSenhaError(`Senha muito longa. Deve ter exatamente 4 dígitos (atual: ${senhaString.length})`);
      triggerShake(senhaShakeAnim);
      isValid = false;
    }

    logger.debug('Resultado da validação', { isValid });

    if (!isValid && Platform.OS !== 'web') {
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

  const performLogin = async (cpfValue: string, senhaValue: string) => {
    logger.info('Executando login');
    
    try {
      // Garantir que são strings e limpar
      const cpfString = String(cpfValue).trim();
      const senhaString = String(senhaValue).trim();
      
      // Salvar credenciais apenas em plataformas nativas
      if (Platform.OS !== 'web') {
        try {
          const numericCPF = cpfString.replace(/\D/g, '');
          await SecureStore.setItemAsync(CPF_KEY, numericCPF);
          await SecureStore.setItemAsync(numericCPF, senhaString);
        } catch (error) {
          logger.error('Erro ao salvar credenciais', error as Error);
        }
      }
      
      // Usar o novo sistema de autenticação de beneficiários
      const result = await authenticateBeneficiary(cpfString, senhaString);
      
      if (result.success) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        // Mostrar erro no campo apropriado
        const errorMessage = result.error || 'Erro inesperado';
        
        if (errorMessage.toLowerCase().includes('cpf') || errorMessage.toLowerCase().includes('beneficiário')) {
          setCpfError(errorMessage);
          triggerShake(cpfShakeAnim);
        } else if (errorMessage.toLowerCase().includes('senha')) {
          setSenhaError(errorMessage);
          triggerShake(senhaShakeAnim);
        } else {
          showErrorAlert(errorMessage);
        }
        
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error: any) {
      logger.error('Erro no login', error);
      showTemplateMessage(MessageTemplates.errors.network);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const handleLogin = async () => {
    console.log('[handleLogin] Iniciando processo de login para beneficiário ativo');
    
    // Capturar os valores atuais do estado no momento da execução
    const currentCPF = cpf;
    const currentSenha = senha;
    
    // Limpar erros anteriores
    setCpfError('');
    setSenhaError('');
    
    // Validar campos com os valores atuais
    if (!validateFields(currentCPF, currentSenha)) {
      console.log('[handleLogin] Validação falhou');
      return;
    }

    // O loading é gerenciado pelo hook useActiveBeneficiaryAuth
    await performLogin(currentCPF, currentSenha);
  };

  const handleForgotPassword = async () => {
    if (cpf.length >= 11) {
      await resetPassword(cpf);
    } else {
      showTemplateMessage({
        title: '🔑 Esqueceu a Senha?',
        message: 'Sua senha são os 4 primeiros dígitos do seu CPF.\n\nPor exemplo:\nCPF: 123.456.789-10\nSenha: 1234\n\nDigite seu CPF completo para receber informações específicas.',
        type: 'info'
      });
    }
  };

  const handleHelp = () => {
    showTemplateMessage({
      title: '❓ Ajuda',
      message: 'Como fazer login:\n\n1. Digite seu CPF completo\n2. A senha são os 4 primeiros dígitos do CPF\n3. Toque em "Entrar"\n\nPrecisa de ajuda? Entre em contato:\ncontato@ailun.com.br',
      type: 'info'
    });
  };

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 40 }]}>
          <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <Animated.View style={[styles.logoContainer, {
              transform: [{
                rotate: logoRotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }]}>
              <View style={styles.logoCard}>
                <Image
                  source="https://cdn-ai.onspace.ai/onspace/project/image/SZxF5tJTtjPgSg2rCnCKdZ/instories_926E70A0-81FF-43ED-878A-889EE40D615D.png"
                  style={styles.logoImage}
                  contentFit="contain"
                />
              </View>
            </Animated.View>
            <Text style={styles.title}>Ailun Saúde</Text>
            <Text style={styles.subtitle}>Cuidando da sua saúde com tecnologia</Text>
          </Animated.View>

          <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ scale: cardScaleAnim }] }]}>
            <Animated.View style={styles.card}>
              <Text style={styles.formTitle}>Fazer Login</Text>
              <Text style={styles.formSubtitle}>
                Digite seus dados para acessar
              </Text>

              {/* CPF Input */}
              <View style={styles.inputContainer}>
                <Animated.View style={[styles.inputWrapper, cpfError ? styles.inputError : {}, {
                  borderColor: cpfFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['#e9ecef', '#00B4DB']
                  }),
                  borderWidth: cpfFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2]
                  }),
                  shadowOpacity: cpfFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.15]
                  })
                }]}>
                  <MaterialIcons name="badge" size={24} color="#00B4DB" style={styles.inputIcon} />
                  <Animated.View style={{ transform: [{ translateX: cpfShakeAnim }] }}>
                    <TextInput
                      style={styles.input}
                      placeholder="CPF"
                      placeholderTextColor="#999"
                      value={cpf}
                      onChangeText={handleCPFChange}
                      onFocus={handleCpfFocus}
                      onBlur={handleCpfBlur}
                      keyboardType="numeric"
                      maxLength={14}
                      editable={!loading}
                    />
                  </Animated.View>
                </Animated.View>
                {cpfError ? <Text style={styles.errorText}>{cpfError}</Text> : null}
              </View>

              {/* Senha Input */}
              <View style={styles.inputContainer}>
                <Animated.View style={[styles.inputWrapper, senhaError ? styles.inputError : {}, {
                  borderColor: senhaFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['#e9ecef', '#00B4DB']
                  }),
                  borderWidth: senhaFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2]
                  }),
                  shadowOpacity: senhaFocusAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.15]
                  })
                }]}>
                  <MaterialIcons name="lock" size={24} color="#00B4DB" style={styles.inputIcon} />
                  <Animated.View style={{ transform: [{ translateX: senhaShakeAnim }] }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Senha (4 primeiros dígitos do CPF)"
                      placeholderTextColor="#999"
                      value={senha}
                      onChangeText={setSenha}
                      onFocus={handleSenhaFocus}
                      onBlur={handleSenhaBlur}
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
                </Animated.View>
                {senhaError ? <Text style={styles.errorText}>{senhaError}</Text> : null}
              </View>

              {/* Login Button */}
              <Animated.View style={{ transform: [{ scale: !loading ? pulseAnim : 1 }] }}>
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
              </Animated.View>

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

              {/* Signup Button */}
              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => router.push('/signup/welcome')}
                activeOpacity={0.8}
              >
                <MaterialIcons name="person-add" size={24} color="#00B4DB" />
                <Text style={styles.signupButtonText}>Quero ser Ailun</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>✨ Sistema Otimizado para Beneficiários</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="verified" size={20} color="rgba(76, 175, 80, 0.9)" />
                  <Text style={styles.featureText}>Login Automático para Beneficiários Ativos</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="speed" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.featureText}>Acesso Direto aos Serviços</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="sync" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.featureText}>Sincronização Automática</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="security" size={20} color="rgba(255, 255, 255, 0.8)" />
                  <Text style={styles.featureText}>Segurança Aprimorada</Text>
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
    marginBottom: 20,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  logoImage: {
    width: 100,
    height: 100,
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
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
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
    shadowColor: '#00B4DB',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
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
    backgroundColor: '#00B4DB',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#00B4DB',
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
    color: '#00B4DB',
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
  signupButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#00B4DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonText: {
    color: '#00B4DB',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});