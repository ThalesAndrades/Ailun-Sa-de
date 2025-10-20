import React, { useEffect } from 'react';
import 'react-native-url-polyfill/auto';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function IndexScreen() {
  const { user, loading, profile } = useAuth();

  useEffect(() => {
    const handleNavigation = async () => {
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
  }, [user, loading, profile]);

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
  },
});