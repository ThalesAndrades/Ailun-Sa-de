import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({});

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack 
        screenOptions={{ headerShown: false }}
        initialRouteName="splash"
      >
        <Stack.Screen 
          name="index" 
          options={{ href: null }}
        />
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="tutorial" />
        <Stack.Screen name="onboarding/step1" />
        <Stack.Screen name="onboarding/step2" />
        <Stack.Screen name="onboarding/step3" />
        <Stack.Screen name="payment" />
        <Stack.Screen name="dashboard" />
      </Stack>
    </AuthProvider>
  );
}