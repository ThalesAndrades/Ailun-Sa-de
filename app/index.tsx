import React, { useEffect, useState } from 'react';
import 'react-native-url-polyfill/auto';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { validateConfig } from '../constants/config';

export default function IndexScreen() {
  const { user, loading, profile } = useAuth();
  const [configValid, setConfigValid] = useState(true);
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  // Validar configurações ao iniciar
  useEffect(() => {
    const config = validateConfig();
    if (!config.valid) {
      console.error('Erros de configuração:', config.errors);
      setConfigValid(false);
      setConfigErrors(config.errors);
    }
  }, []);

  useEffect(() => {
    const handleNavigation = async () => {
      // Se a configuração não é válida, não navegar
      if (!configValid) return;
      // Aguardar o carregamento do contexto
      if (loading) return;

      // Se não está autenticado, ir para login
      if (!user) {
        router.replace('/login');
        return;
      }

      // Verificar se precisa ver onboarding
      if (profile && !profile.has_seen_onboarding) {
        router.replace('/onboarding/platform-guide');
        return;
      }

      // Se está autenticado e já viu onboarding, ir para dashboard
      router.replace('/dashboard');
    };

    // Pequeno delay para evitar navegação instantânea
    const timer = setTimeout(() => {
      handleNavigation();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, loading, profile, configValid]);

  // Mostrar erro de configuração se houver
  if (!configValid) {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorTitle}>❌ Erro de Configuração</Text>
          <Text style={styles.errorText}>
            O aplicativo não está configurado corretamente:
          </Text>
          {configErrors.map((error, index) => (
            <Text key={index} style={styles.errorItem}>
              • {error}
            </Text>
          ))}
          <Text style={styles.errorFooter}>
            Entre em contato com o suporte técnico.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="white" />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorItem: {
    fontSize: 14,
    color: 'white',
    marginBottom: 8,
    textAlign: 'left',
    width: '100%',
  },
  errorFooter: {
    fontSize: 14,
    color: 'white',
    marginTop: 20,
    textAlign: 'center',
    opacity: 0.8,
  },
});