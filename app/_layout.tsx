// Polyfills devem ser importados ANTES de tudo
import '../polyfills';

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CPFAuthProvider } from '../contexts/CPFAuthContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { Platform } from 'react-native';

// Configurações de performance
if (Platform.OS !== 'web') {
  // Configurações nativas de performance
  try {
    const { InteractionManager } = require('react-native');
    
    // Permitir mais tempo para animações em dispositivos lentos
    if (InteractionManager?.setDeadline) {
      InteractionManager.setDeadline(100);
    }
  } catch (error) {
    // Ignore se InteractionManager não estiver disponível
  }
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CPFAuthProvider>
        <AuthProvider>
          <NotificationProvider>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
              }}
            >
              {/* Tela inicial */}
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              
              {/* Dashboard principal */}
              <Stack.Screen name="dashboard" />
              
              {/* Tab navigator - simplificado */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              
              {/* Outras telas */}
              <Stack.Screen name="onboarding/step1" />
              <Stack.Screen name="onboarding/step2" />
              <Stack.Screen name="onboarding/step3" />
              <Stack.Screen name="onboarding/platform-guide" />
              
              <Stack.Screen name="signup/welcome" />
              <Stack.Screen name="signup/personal-data" />
              <Stack.Screen name="signup/contact" />
              <Stack.Screen name="signup/address" />
              <Stack.Screen name="signup/payment" />
              <Stack.Screen name="signup/confirmation" />
              
              <Stack.Screen name="consultation/request-immediate" />
              <Stack.Screen name="consultation/enhanced-request" />
              <Stack.Screen name="consultation/pre-consultation" />
              <Stack.Screen name="consultation/schedule" />
              <Stack.Screen name="consultation/webview" />
              
              <Stack.Screen name="profile/index" />
              <Stack.Screen name="profile/plan" />
              <Stack.Screen name="profile/subscription" />
              
              <Stack.Screen name="payment" />
              <Stack.Screen name="payment-pix" />
              <Stack.Screen name="payment-card" />
              <Stack.Screen name="payment-history" />
              
              <Stack.Screen name="subscription" />
              <Stack.Screen name="subscription/inactive" />
              
              <Stack.Screen name="admin/audit-logs" />
              
              <Stack.Screen name="tutorial" />
              <Stack.Screen name="splash" />
              
              {/* 404 Page - deve ser a última */}
              <Stack.Screen 
                name="+not-found" 
                options={{ 
                  title: 'Página não encontrada',
                  presentation: 'modal'
                }} 
              />
            </Stack>
            <StatusBar style="auto" />
          </NotificationProvider>
        </AuthProvider>
      </CPFAuthProvider>
    </SafeAreaProvider>
  );
}