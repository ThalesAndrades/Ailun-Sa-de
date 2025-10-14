import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InactiveSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubscribe = () => {
    // Redirecionar para o fluxo de assinatura (signup)
    router.push('/signup/welcome');
  };

  const handleContactSupport = () => {
    // Redirecionar para tela de suporte ou abrir e-mail
    // Implementação futura
  };

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          {/* Ícone de Alerta */}
          <View style={styles.iconContainer}>
            <MaterialIcons name="info-outline" size={80} color="#fff" />
          </View>

          <Text style={styles.title}>Plano Inativo</Text>
          <Text style={styles.subtitle}>
            Para acessar os serviços da AiLun Saúde, você precisa de um plano ativo.
          </Text>

          {/* Card de Informações */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.infoText}>Consultas médicas ilimitadas</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.infoText}>Acesso a especialistas</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.infoText}>Psicologia e nutrição</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.infoText}>Atendimento 24/7</Text>
            </View>
          </View>

          {/* Botão de Assinar */}
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={handleSubscribe}
            activeOpacity={0.8}
          >
            <MaterialIcons name="star" size={24} color="#fff" />
            <Text style={styles.subscribeButtonText}>Assinar Agora</Text>
          </TouchableOpacity>

          {/* Botão de Suporte */}
          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
            activeOpacity={0.8}
          >
            <MaterialIcons name="help-outline" size={20} color="#00B4DB" />
            <Text style={styles.supportButtonText}>Precisa de Ajuda?</Text>
          </TouchableOpacity>

          {/* Informações Adicionais */}
          <View style={styles.additionalInfo}>
            <Text style={styles.additionalInfoTitle}>Por que assinar?</Text>
            <Text style={styles.additionalInfoText}>
              Com um plano ativo, você tem acesso ilimitado a consultas médicas, especialistas, psicólogos e nutricionistas, tudo de forma rápida e conveniente, direto do seu celular.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  subscribeButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  supportButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00B4DB',
  },
  additionalInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 20,
  },
  additionalInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  additionalInfoText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 20,
  },
});

