import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated/lib/reanimated2/js-reanimated/src/Reanimated2/core';
import { CPFAuthProvider } from '../contexts/CPFAuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    // Configure Android notification channel
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'AiLun Saúde',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#667eea',
        sound: 'default',
      });
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <CPFAuthProvider>
      <NotificationProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="splash" />
          <Stack.Screen name="tutorial" />
          <Stack.Screen name="payment" />
          <Stack.Screen name="onboarding/step1" />
          <Stack.Screen name="onboarding/step2" />
          <Stack.Screen name="onboarding/step3" />
        </Stack>
      </NotificationProvider>
    </CPFAuthProvider>
  );
}