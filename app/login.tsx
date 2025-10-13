import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { loginWithCPF } from '../services/cpfAuth';

export default function LoginScreen() {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const formatCPF = (text: string) => {
    // Remove caracteres não numéricos
    const cleaned = text.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = cleaned.slice(0, 11);
    
    // Formata CPF: 123.456.789-00
    const formatted = limited
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    return formatted;
  };

  const handleCPFChange = (text: string) => {
    const formatted = formatCPF(text);
    setCpf(formatted);
    
    // Auto-preencher senha com os 4 primeiros dígitos
    const cleanCPF = text.replace(/\D/g, '');
    if (cleanCPF.length >= 4) {
      setPassword(cleanCPF.substring(0, 4));
    }
  };

  const handleLogin = async () => {
    if (!cpf || !password) {
      showAlert('Campos Obrigatórios', 'Preencha CPF e senha');
      return;
    }

    if (password.length !== 4) {
      showAlert('Senha Inválida', 'A senha deve ter exatamente 4 dígitos');
      return;
    }

    setLoading(true);

    try {
      const result = await loginWithCPF(cpf, password);

      if (result.success) {
        showAlert('Bem-vindo!', `Olá, ${result.data.name}! Redirecionando...`);
        
        // LOGIN BEM-SUCEDIDO: Ir direto para o dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        showAlert('Erro no Login', result.error || 'Erro na autenticação');
      }
    } catch (error) {
      showAlert('Erro', 'Erro inesperado na autenticação');
    } finally {
      setLoading(false);
    }
  };

  const handleNewUserFlow = () => {
    // NOVO USUÁRIO: Redirecionar para tutorial e onboarding
    router.push('/tutorial');
  };

  return (
    <LinearGradient 
      colors={['#00B4DB', '#0083B0']} 
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.keyboardContainer, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source="https://cdn-ai.onspace.ai/onspace/project/image/SZxF5tJTtjPgSg2rCnCKdZ/instories_926E70A0-81FF-43ED-878A-889EE40D615D.png"
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>
          <Text style={styles.title}>Ailun Saúde</Text>
          <Text style={styles.subtitle}>Entre com seu CPF</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.instructionBox}>
            <MaterialIcons name="info" size={20} color="#00B4DB" />
            <Text style={styles.instructionText}>
              Sua senha são os 4 primeiros dígitos do seu CPF
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="badge" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="CPF (apenas números)"
              placeholderTextColor="#999"
              value={cpf}
              onChangeText={handleCPFChange}
              keyboardType="numeric"
              maxLength={14} // 123.456.789-00
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Senha (4 dígitos)"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              keyboardType="numeric"
              maxLength={4}
              editable={!loading}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              disabled={loading}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.newUserButton} 
            onPress={handleNewUserFlow}
            disabled={loading}
          >
            <MaterialIcons name="person-add" size={24} color="#00B4DB" />
            <Text style={styles.newUserButtonText}>Ainda não sou Ailun</Text>
          </TouchableOpacity>

          <View style={styles.helpContainer}>
            <MaterialIcons name="help" size={16} color="#666" />
            <Text style={styles.helpText}>
              Exemplo: CPF 123.456.789-00 → Senha: 1234
            </Text>
          </View>
        </View>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#1565c0',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
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
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  loginButton: {
    backgroundColor: '#00B4DB',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00B4DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  newUserButton: {
    borderWidth: 2,
    borderColor: '#00B4DB',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  newUserButtonText: {
    color: '#00B4DB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
});