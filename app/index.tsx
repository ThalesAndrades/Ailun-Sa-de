/**
 * Página Principal - AiLun Saúde v2.1.0
 * Redirecionamento inteligente com splash screen integrado
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { MaterialIcons } from '@expo/vector-icons';

export default function IndexScreen() {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Decidir para onde redirecionar baseado no estado de autenticação
      const timer = setTimeout(() => {
        if (isAuthenticated && user) {
          // Se o usuário está autenticado, vai para o dashboard
          router.replace('/dashboard');
        } else {
          // Se não está autenticado, vai para o login
          router.replace('/login');
        }
      }, 2000); // 2 segundos para mostrar o splash

      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, user]);

  return (
    <LinearGradient 
      colors={['#00B4DB', '#0083B0']} 
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <MaterialIcons name="health-and-safety" size={80} color="white" />
          <Text style={styles.logoText}>AiLun Saúde</Text>
          <Text style={styles.versionText}>v2.1.0</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>
            {loading ? 'Verificando autenticação...' : 'Iniciando aplicativo...'}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Telemedicina integrada</Text>
          <Text style={styles.footerSubtext}>RapiDoc • Supabase • Asaas</Text>
        </View>
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
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  versionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footerSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});