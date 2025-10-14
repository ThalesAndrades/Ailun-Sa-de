import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { startImmediateConsultation } from '../services/consultationFlow';

/**
 * EXEMPLO: Tela de Médico Imediato
 * 
 * Fluxo:
 * 1. Usuário clica em "Solicitar Atendimento"
 * 2. App chama API RapiDoc
 * 3. Mostra sala de espera com link da consulta
 */

interface ImmediateConsultationScreenProps {
  beneficiaryUuid: string;
}

export default function ImmediateConsultationScreen({ 
  beneficiaryUuid 
}: ImmediateConsultationScreenProps) {
  const [loading, setLoading] = useState(false);
  const [consultationUrl, setConsultationUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleRequestConsultation = async () => {
    setLoading(true);

    try {
      const result = await startImmediateConsultation(beneficiaryUuid);

      if (result.success) {
        setConsultationUrl(result.data.consultationUrl);
        setMessage(result.data.message);
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível solicitar atendimento');
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConsultation = () => {
    if (consultationUrl) {
      Linking.openURL(consultationUrl).catch((err) => {
        Alert.alert('Erro', 'Não foi possível abrir o link da consulta');
        console.error('Erro ao abrir URL:', err);
      });
    }
  };

  // Estado inicial: botão para solicitar
  if (!consultationUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Médico Imediato</Text>
          <Text style={styles.subtitle}>
            Atendimento com clínico geral sem agendamento
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.infoText}>
            Você será atendido por um médico clínico geral em poucos minutos.
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRequestConsultation}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Solicitar Atendimento</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Estado de espera: sala de espera com link
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sala de Espera</Text>
        <Text style={styles.subtitle}>{message}</Text>
      </View>

      <View style={styles.waitingRoom}>
        <View style={styles.statusIndicator}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.statusText}>Aguardando médico...</Text>
        </View>

        {/* Botão central com link da consulta */}
        <TouchableOpacity
          style={styles.consultationButton}
          onPress={handleOpenConsultation}
        >
          <Text style={styles.consultationButtonText}>
            🩺 Entrar na Consulta
          </Text>
        </TouchableOpacity>

        <Text style={styles.externalNote}>
          O atendimento será realizado em ambiente externo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  waitingRoom: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  statusIndicator: {
    alignItems: 'center',
    marginBottom: 60,
  },
  statusText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  consultationButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  consultationButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  externalNote: {
    fontSize: 14,
    color: '#999',
    marginTop: 24,
    textAlign: 'center',
  },
});

