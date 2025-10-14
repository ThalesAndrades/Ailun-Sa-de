import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useCPFAuth } from '../hooks/useCPFAuth';

export default function IndexScreen() {
  const { isAuthenticated, loading, session } = useCPFAuth();

  useEffect(() => {
    const handleNavigation = async () => {
      // Aguardar o carregamento do contexto
      if (loading) return;

      // Se não está autenticado, ir para login
      if (!isAuthenticated || !session) {
        router.replace('/login');
        return;
      }

      // Se está autenticado, ir para dashboard
      router.replace('/dashboard');
    };

    // Pequeno delay para evitar navegação instantânea
    const timer = setTimeout(() => {
      handleNavigation();
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, loading, session]);

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