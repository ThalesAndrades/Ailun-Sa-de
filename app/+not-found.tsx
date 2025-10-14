import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();

  const handleGoHome = () => {
    try {
      router.replace('/dashboard');
    } catch {
      // Fallback em caso de erro de navegação
      router.replace('/');
    }
  };

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="error-outline" size={80} color="white" />
        </View>
        
        <Text style={styles.title}>Página não encontrada</Text>
        <Text style={styles.subtitle}>
          A página que você procura não existe ou foi movida.
        </Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGoHome}
          activeOpacity={0.8}
        >
          <MaterialIcons name="home" size={24} color="white" />
          <Text style={styles.buttonText}>Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});