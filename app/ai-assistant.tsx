/**
 * Página do AI Assistant - Interface principal
 * Tela dedicada para interação com o assistente IA
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AIAssistant from '../components/AIAssistant';
import { useAuth } from '../hooks/useAuth';

export default function AIAssistantScreen() {
  const insets = useSafeAreaInsets();
  const { user, loading } = useAuth();

  const handleClose = () => {
    router.back();
  };

  // Redirect para login se não autenticado
  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AIAssistant 
        visible={true}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});