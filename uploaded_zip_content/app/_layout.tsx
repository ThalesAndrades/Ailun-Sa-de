import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CPFAuthProvider } from '../contexts/CPFAuthContext';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CPFAuthProvider>
        <AuthProvider>
          <NotificationProvider>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Tela inicial e login */}
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              
              {/* Onboarding */}
              <Stack.Screen name="onboarding/step1" />
              <Stack.Screen name="onboarding/step2" />
              <Stack.Screen name="onboarding/step3" />
              
              {/* Signup Flow */}
              <Stack.Screen name="signup/welcome" />
              <Stack.Screen name="signup/personal-data" />
              <Stack.Screen name="signup/contact" />
              <Stack.Screen name="signup/address" />
              <Stack.Screen name="signup/payment" />
              <Stack.Screen name="signup/confirmation" />
              
              {/* Dashboard principal */}
              <Stack.Screen name="dashboard" />
              
              {/* Consultas */}
              <Stack.Screen name="consultation/request-immediate" />
              <Stack.Screen name="consultation/pre-consultation" />
              <Stack.Screen name="consultation/schedule" />
              <Stack.Screen name="consultation/webview" />
              
              {/* Perfil */}
              <Stack.Screen name="profile/index" />
              <Stack.Screen name="profile/plan" />
              
              {/* Pagamentos */}
              <Stack.Screen name="payment" />
              <Stack.Screen name="payment-pix" />
              <Stack.Screen name="payment-card" />
              <Stack.Screen name="payment-history" />
              
              {/* Outros */}
              <Stack.Screen name="subscription" />
              <Stack.Screen name="tutorial" />
              <Stack.Screen name="splash" />
            </Stack>
            <StatusBar style="auto" />
          </NotificationProvider>
        </AuthProvider>
      </CPFAuthProvider>
    </SafeAreaProvider>
  );
}