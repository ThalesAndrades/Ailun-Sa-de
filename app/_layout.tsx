/**
 * Root Layout - AiLun Saúde
 * Layout principal com providers e navegação otimizada
 */

// Polyfills devem ser importados ANTES de tudo
import '../polyfills';

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

// Configurações globais
import { logAuditEvent, checkSupabaseConfig } from '../services/supabase';
import { ProductionLogger } from '../utils/production-logger';
import { isRapidocConfigured, getRapidocInfo } from '../config/rapidoc.config';

const logger = new ProductionLogger('RootLayout');

// Configurações de performance
if (Platform.OS !== 'web') {
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

// Manter splash screen até a inicialização estar completa
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  useEffect(() => {
    const initializeApp = async () => {
      try {
        logger.info('Inicializando aplicação AiLun Saúde v2.1.0');
        
        // Verificar configurações essenciais
        const supabaseConfig = checkSupabaseConfig();
        const rapidocConfig = getRapidocInfo();
        
        logger.info('Configurações verificadas', {
          supabase: supabaseConfig.isConfigured,
          rapidoc: rapidocConfig.configured,
          platform: Platform.OS,
        });
        
        if (!supabaseConfig.isConfigured) {
          logger.error('Supabase não configurado', supabaseConfig);
        }
        
        if (!rapidocConfig.configured) {
          logger.warn('RapiDoc não configurado completamente', rapidocConfig);
        }
        
        // Log de inicialização da aplicação
        await logAuditEvent('app_initialized', {
          platform: Platform.OS,
          version: '2.1.0',
          supabaseConfigured: supabaseConfig.isConfigured,
          rapidocConfigured: rapidocConfig.configured,
        });
        
        // Aguardar um pouco para carregar recursos essenciais
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        logger.info('Aplicação inicializada com sucesso');
        
      } catch (error: any) {
        logger.error('Erro na inicialização da aplicação', { error: error.message });
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