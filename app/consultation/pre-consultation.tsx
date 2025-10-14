import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PreConsultationScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [isLoading, setIsLoading] = useState(false);
  const [consultationUrl, setConsultationUrl] = useState<string | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number>(5);

  useEffect(() => {
    // Animação de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Animação de pulso no botão
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Verificar se já temos a URL da consulta (passada como parâmetro)
    if (params.consultationUrl) {
      setConsultationUrl(params.consultationUrl as string);
    }

    // Simular tempo de espera estimado
    if (params.estimatedWaitTime) {
      setEstimatedWaitTime(Number(params.estimatedWaitTime));
    }
  }, []);

  const handleEnterConsultation = () => {
    if (!consultationUrl) {
      Alert.alert(
        'Aguarde',
        'A sala de consulta ainda não está disponível. Por favor, aguarde alguns instantes.'
      );
      return;
    }

    // Navegar para a tela de WebView com a URL da consulta
    router.push({
      pathname: '/consultation/webview',
      params: { url: consultationUrl },
    });
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Consulta',
      'Tem certeza que deseja cancelar esta consulta?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, Cancelar',
          style: 'destructive',
          onPress: () => {
            // TODO: Chamar API para cancelar a consulta
            router.back();
          },
        },
      ]
    );
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
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="medical-services" size={64} color="#fff" />
            </View>
            <Text style={styles.title}>Sala de Pré-Consulta</Text>
            <Text style={styles.subtitle}>Médico Imediato</Text>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <MaterialIcons name="schedule" size={24} color="#00B4DB" />
              <Text style={styles.statusTitle}>Status da Consulta</Text>
            </View>

            {consultationUrl ? (
              <View style={styles.statusContent}>
                <View style={styles.statusBadge}>
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.statusBadgeText}>Sala Disponível</Text>
                </View>
                <Text style={styles.statusMessage}>
                  Sua consulta está pronta! Clique no botão abaixo para entrar na sala.
                </Text>
              </View>
            ) : (
              <View style={styles.statusContent}>
                <View style={[styles.statusBadge, styles.statusBadgeWaiting]}>
                  <ActivityIndicator size="small" color="#FFB74D" />
                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextWaiting]}>
                    Aguardando
                  </Text>
                </View>
                <Text style={styles.statusMessage}>
                  Estamos preparando sua sala de consulta. Tempo estimado: {estimatedWaitTime} minutos.
                </Text>
              </View>
            )}
          </View>

          {/* Informações Importantes */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informações Importantes</Text>
            
            <View style={styles.infoItem}>
              <MaterialIcons name="videocam" size={20} color="#00B4DB" />
              <Text style={styles.infoText}>
                Certifique-se de que sua câmera e microfone estão funcionando
              </Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="wifi" size={20} color="#00B4DB" />
              <Text style={styles.infoText}>
                Conecte-se a uma rede Wi-Fi estável para melhor qualidade
              </Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="headset" size={20} color="#00B4DB" />
              <Text style={styles.infoText}>
                Use fones de ouvido para melhor privacidade e qualidade de áudio
              </Text>
            </View>

            <View style={styles.infoItem}>
              <MaterialIcons name="location-on" size={20} color="#00B4DB" />
              <Text style={styles.infoText}>
                Busque um local tranquilo e bem iluminado
              </Text>
            </View>
          </View>

          {/* Botão Principal */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.enterButton,
                !consultationUrl && styles.enterButtonDisabled,
              ]}
              onPress={handleEnterConsultation}
              disabled={!consultationUrl}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="video-call" size={28} color="#fff" />
                  <Text style={styles.enterButtonText}>
                    {consultationUrl ? 'Entrar na Sala' : 'Aguardando Sala...'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Botão Cancelar */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancelar Consulta</Text>
          </TouchableOpacity>

          {/* Suporte */}
          <View style={styles.supportCard}>
            <MaterialIcons name="help-outline" size={20} color="#666" />
            <Text style={styles.supportText}>
              Precisa de ajuda? Entre em contato com nosso suporte
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
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  statusContent: {
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  statusBadgeWaiting: {
    backgroundColor: '#fff3e0',
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statusBadgeTextWaiting: {
    color: '#FFB74D',
  },
  statusMessage: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  enterButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  enterButtonDisabled: {
    backgroundColor: '#ccc',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  enterButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#666',
  },
});

