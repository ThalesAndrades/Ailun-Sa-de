import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CPFAuthProvider } from '../contexts/CPFAuthContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#00B4DB" />
      <CPFAuthProvider>
        <AuthProvider>
          <NotificationProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 300,
              }}
            >
              <Stack.Screen 
                name="index" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="login" 
                options={{ 
                  headerShown: false,
                  animation: 'fade'
                }} 
              />
              <Stack.Screen 
                name="dashboard" 
                options={{ 
                  headerShown: false,
                  gestureEnabled: false 
                }} 
              />
              <Stack.Screen 
                name="splash" 
                options={{ 
                  headerShown: false,
                  animation: 'fade'
                }} 
              />
              <Stack.Screen 
                name="tutorial" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="subscription" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="payment" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="payment-pix" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="payment-card" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="payment-history" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="onboarding/step1" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="onboarding/step2" 
                options={{ 
                  headerShown: false 
                }} 
              />
              <Stack.Screen 
                name="onboarding/step3" 
                options={{ 
                  headerShown: false 
                }} 
              />
            </Stack>
          </NotificationProvider>
        </AuthProvider>
      </CPFAuthProvider>
    </SafeAreaProvider>
  );
}