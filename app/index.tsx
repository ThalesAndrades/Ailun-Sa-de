
/**
 * Página Inicial - AiLun Saúde
 * Ponto de entrada do aplicativo
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Usuário logado - ir para dashboard
        router.replace('/dashboard');
      } else {
        // Usuário não logado - ir para splash/login
        router.replace('/splash');
      }
    }
  }, [user, loading]);

  // Mostrar loading enquanto verifica autenticação
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00B4DB" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
