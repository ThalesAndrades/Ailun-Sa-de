/**
 * Tela de Índice Simplificada para Evitar Problemas de Roteamento
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function IndexScreen() {
  useEffect(() => {
    // Redirecionar após um pequeno delay
    const timer = setTimeout(() => {
      try {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/dashboard';
          }
        } else {
          // Para aplicativos nativos, usar redirecionamento simples
          if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/dashboard';
          }
        }
      } catch (error) {
        console.log('Redirecionamento não disponível:', error);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.text}>Carregando AiLun Saúde...</Text>
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
  text: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
});