import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function TabsIndexScreen() {
  useEffect(() => {
    // Redirecionar para o dashboard principal
    router.replace('/dashboard');
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#00B4DB" />
    </View>
  );
}