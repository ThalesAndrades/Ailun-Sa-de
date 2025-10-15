
/**
 * Root Layout - AiLun Saúde
 * Configuração principal do app com providers e navegação
 */

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="splash" />
            <Stack.Screen name="tutorial" />
            <Stack.Screen 
              name="+not-found" 
              options={{ 
                title: 'Página não encontrada',
                headerShown: true 
              }} 
            />
            
            {/* Signup Flow */}
            <Stack.Screen name="signup/welcome" />
            <Stack.Screen name="signup/personal-data" />
            <Stack.Screen name="signup/contact" />
            <Stack.Screen name="signup/address" />
            <Stack.Screen name="signup/payment" />
            <Stack.Screen name="signup/confirmation" />
            
            {/* Onboarding */}
            <Stack.Screen name="onboarding/platform-guide" />
            <Stack.Screen name="onboarding/step1" />
            <Stack.Screen name="onboarding/step2" />
            <Stack.Screen name="onboarding/step3" />
            
            {/* Profile */}
            <Stack.Screen name="profile/index" />
            <Stack.Screen name="profile/plan" />
            <Stack.Screen name="profile/subscription" />
            
            {/* Payment */}
            <Stack.Screen name="payment" />
            <Stack.Screen name="payment-card" />
            <Stack.Screen name="payment-pix" />
            <Stack.Screen name="payment-history" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="subscription/inactive" />
            
            {/* Consultation */}
            <Stack.Screen name="consultation/enhanced-request" />
            <Stack.Screen name="consultation/pre-consultation" />
            <Stack.Screen name="consultation/request-immediate" />
            <Stack.Screen name="consultation/schedule" />
            <Stack.Screen name="consultation/webview" />
            
            {/* Admin */}
            <Stack.Screen name="admin/audit-logs" />
          </Stack>
          <StatusBar style="auto" />
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
