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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { loginWithCPF } from '../services/cpfAuth';
import { MessageTemplates } from '../constants/messageTemplates';
import { 
  showTemplateMessage, 
  showSuccessAlert, 
  showErrorAlert,
  showInvalidCPFAlert 
} from '../utils/alertHelpers';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Formatação do CPF
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
    
    // Auto-fill senha com os 4 primeiros dígitos
    const numericCPF = value.replace(/\D/g, '');
    if (numericCPF.length >= 4) {
      setSenha(numericCPF.substring(0, 4));
    }
  };

  const validateCPF = (cpfValue: string): boolean => {
    const numericCPF = cpfValue.replace(/\D/g, '');
    return numericCPF.length === 11;
  };

  const handleLogin = async () => {
    if (!cpf.trim()) {
      showTemplateMessage(MessageTemplates.validation.requiredField('CPF'));
      return;
    }

    if (!validateCPF(cpf)) {
      showInvalidCPFAlert();
      return;
    }

    if (!senha.trim()) {
      showTemplateMessage(MessageTemplates.validation.requiredField('Senha'));
      return;
    }

    setLoading(true);

    try {
      const numericCPF = cpf.replace(/\D/g, '');
      const result = await loginWithCPF(numericCPF, senha);

      if (result.success && result.user) {
        // Mostrar mensagem de sucesso
        showTemplateMessage(MessageTemplates.auth.loginSuccess(result.user.name));
        
        // Navegar para dashboard após um pequeno delay
        setTimeout(() => {
          router.replace('/dashboard');
        }, 1500);
      } else {
        // Mostrar erro específico
        if (result.error?.includes('beneficiário não encontrado')) {
          showErrorAlert('CPF não encontrado no sistema. Verifique se você está cadastrado.');
        } else if (result.error?.includes('senha incorreta')) {
          showTemplateMessage(MessageTemplates.auth.loginError);
        } else {
          showErrorAlert(result.error || 'Erro inesperado ao fazer login');
        }
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      showTemplateMessage(MessageTemplates.errors.network);
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
    <LinearGradient 
      colors={['#667eea', '#764ba2']} 
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="health-and-safety" size={64} color="white" />
            </View>
            <Text style={styles.title}>AiLun Saúde</Text>
            <Text style={styles.subtitle}>Sua saúde em primeiro lugar</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.card}>
              <Text style={styles.formTitle}>Fazer Login</Text>
              <Text style={styles.formSubtitle}>
                Digite seus dados para acessar
              </Text>

              {/* CPF Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="badge" size={24} color="#667eea" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="CPF"
                    value={cpf}
                    onChangeText={handleCPFChange}
                    keyboardType="numeric"
                    maxLength={14}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Senha Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={24} color="#667eea" style={styles.inputIcon} />
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
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
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
          </View>

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
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});