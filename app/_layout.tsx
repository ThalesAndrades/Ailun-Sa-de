/**
 * Root Layout - AiLun Saúde
 * Layout principal com polyfills aplicados PRIMEIRO
 */

// CRÍTICO: Polyfills de inicialização DEVEM ser a primeira coisa importada
import '../polyfill-init';
import '../polyfills';

// Forçar uma pausa para garantir que polyfills sejam aplicados
console.log('[AiLun] Verificando React.use:', typeof React?.use);

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Contexts
import { CPFAuthProvider } from '../contexts/CPFAuthContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

// Manter splash screen até a inicialização estar completa
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[AiLun] Inicializando aplicação v2.1.1');
        
        // Verificar se React.use está disponível
        if (typeof React.use !== 'function') {
          console.warn('[AiLun] React.use não disponível, aplicando polyfill de emergência');
          
          // Polyfill de emergência
          React.use = function(resource) {
            if (resource && typeof resource.then === 'function') {
              throw resource;
            }
            if (resource && resource._context) {
              return resource._currentValue || resource._defaultValue || null;
            }
            return resource;
          };
        }
        
        // Aguardar um pouco para carregar recursos essenciais
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('[AiLun] Aplicação inicializada com sucesso');
        console.log('[AiLun] React.use status:', typeof React.use);
        
      } catch (error) {
        console.error('[AiLun] Erro na inicialização:', error);
      } finally {
        // Esconder splash screen após inicialização
        SplashScreen.hideAsync();
      }
    };
    
    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <CPFAuthProvider>
        <AuthProvider>
          <NotificationProvider>
            <Stack 
              screenOptions={{ 
                headerShown: false,
                animation: Platform.select({
                  ios: 'slide_from_right',
                  android: 'slide_from_right',
                  default: 'fade',
                }),
                gestureEnabled: Platform.OS === 'ios',
                gestureDirection: 'horizontal',
              }}
            >
              {/* Telas de entrada */}
              <Stack.Screen 
                name="index" 
                options={{ 
                  title: 'AiLun Saúde',
                }} 
              />
              <Stack.Screen 
                name="splash" 
                options={{ 
                  title: 'Carregando...',
                  animation: 'fade',
                }} 
              />
              <Stack.Screen 
                name="login" 
                options={{ 
                  title: 'Login',
                  animation: 'slide_from_bottom',
                }} 
              />
              
              {/* Dashboard principal */}
              <Stack.Screen 
                name="dashboard" 
                options={{ 
                  title: 'Dashboard',
                  gestureEnabled: false, // Não permitir voltar por gesto
                }} 
              />
              
              {/* Tab navigator */}
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false,
                  title: 'Navegação',
                }} 
              />
              
              {/* Onboarding */}
              <Stack.Screen 
                name="onboarding/step1" 
                options={{ 
                  title: 'Bem-vindo',
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="onboarding/step2" 
                options={{ 
                  title: 'Configuração',
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="onboarding/step3" 
                options={{ 
                  title: 'Finalizar',
                  animation: 'slide_from_right',
                }} 
              />
              <Stack.Screen 
                name="onboarding/platform-guide" 
                options={{ 
                  title: 'Guia da Plataforma',
                  animation: 'slide_from_bottom',
                }} 
              />
              
              {/* Cadastro */}
              <Stack.Screen 
                name="signup/welcome" 
                options={{ 
                  title: 'Cadastro',
                  animation: 'slide_from_bottom',
                }} 
              />
              <Stack.Screen 
                name="signup/personal-data" 
                options={{ 
                  title: 'Dados Pessoais',
                }} 
              />
              <Stack.Screen 
                name="signup/contact" 
                options={{ 
                  title: 'Contato',
                }} 
              />
              <Stack.Screen 
                name="signup/address" 
                options={{ 
                  title: 'Endereço',
                }} 
              />
              <Stack.Screen 
                name="signup/payment" 
                options={{ 
                  title: 'Pagamento',
                }} 
              />
              <Stack.Screen 
                name="signup/confirmation" 
                options={{ 
                  title: 'Confirmação',
                  gestureEnabled: false,
                }} 
              />
              
              {/* Consultas */}
              <Stack.Screen 
                name="consultation/request-immediate" 
                options={{ 
                  title: 'Médico Agora',
                  animation: 'slide_from_bottom',
                }} 
              />
              <Stack.Screen 
                name="consultation/enhanced-request" 
                options={{ 
                  title: 'Solicitação Avançada',
                }} 
              />
              <Stack.Screen 
                name="consultation/pre-consultation" 
                options={{ 
                  title: 'Pré-consulta',
                }} 
              />
              <Stack.Screen 
                name="consultation/schedule" 
                options={{ 
                  title: 'Agendar Consulta',
                }} 
              />
              <Stack.Screen 
                name="consultation/webview" 
                options={{ 
                  title: 'Consulta Médica',
                  headerShown: false,
                  gestureEnabled: false,
                  animation: 'fade',
                }} 
              />
              
              {/* Perfil */}
              <Stack.Screen 
                name="profile/index" 
                options={{ 
                  title: 'Perfil',
                }} 
              />
              <Stack.Screen 
                name="profile/plan" 
                options={{ 
                  title: 'Meu Plano',
                }} 
              />
              <Stack.Screen 
                name="profile/subscription" 
                options={{ 
                  title: 'Assinatura',
                }} 
              />
              
              {/* Pagamentos */}
              <Stack.Screen 
                name="payment" 
                options={{ 
                  title: 'Pagamento',
                  animation: 'slide_from_bottom',
                }} 
              />
              <Stack.Screen 
                name="payment-pix" 
                options={{ 
                  title: 'Pagamento PIX',
                }} 
              />
              <Stack.Screen 
                name="payment-card" 
                options={{ 
                  title: 'Cartão de Crédito',
                }} 
              />
              <Stack.Screen 
                name="payment-history" 
                options={{ 
                  title: 'Histórico de Pagamentos',
                }} 
              />
              
              {/* Assinatura */}
              <Stack.Screen 
                name="subscription" 
                options={{ 
                  title: 'Assinatura',
                }} 
              />
              <Stack.Screen 
                name="subscription/inactive" 
                options={{ 
                  title: 'Assinatura Inativa',
                  gestureEnabled: false,
                }} 
              />
              
              {/* Administração */}
              <Stack.Screen 
                name="admin/audit-logs" 
                options={{ 
                  title: 'Logs de Auditoria',
                  animation: 'slide_from_bottom',
                }} 
              />
              
              {/* Utilitários */}
              <Stack.Screen 
                name="tutorial" 
                options={{ 
                  title: 'Tutorial',
                  animation: 'slide_from_bottom',
                }} 
              />
              
              {/* 404 - deve ser a última */}
              <Stack.Screen 
                name="+not-found" 
                options={{ 
                  title: 'Página não encontrada',
                  presentation: 'modal',
                  animation: 'slide_from_bottom',
                }} 
              />
            </Stack>
            <StatusBar 
              style="auto" 
              backgroundColor="transparent" 
              translucent={Platform.OS === 'android'}
            />
          </NotificationProvider>
        </AuthProvider>
      </CPFAuthProvider>
    </SafeAreaProvider>
  );
}