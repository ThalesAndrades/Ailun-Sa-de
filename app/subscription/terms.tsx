import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function SubscriptionTermsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleToggleTerms = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTermsAccepted(!termsAccepted);
  };

  const handleTogglePrivacy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrivacyAccepted(!privacyAccepted);
  };

  const handleContinue = () => {
    if (!termsAccepted || !privacyAccepted) {
      Alert.alert(
        'Aceite Necessário',
        'Por favor, aceite os Termos de Uso e a Política de Privacidade para continuar.'
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Redirecionar para a tela de assinatura principal que já tem os métodos de pagamento
    router.push({
      pathname: '/subscription',
      params: {
        ...params,
        termsAccepted: 'true',
        privacyAccepted: 'true',
      },
    });
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
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Termos e Condições</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Título */}
          <View style={styles.titleContainer}>
            <MaterialIcons name="gavel" size={48} color="#fff" />
            <Text style={styles.title}>Termos de Uso</Text>
            <Text style={styles.subtitle}>
              Leia e aceite os termos para continuar
            </Text>
          </View>

          {/* Resumo do Plano */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumo da Assinatura</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Plano:</Text>
              <Text style={styles.summaryValue}>{params.planName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Valor:</Text>
              <Text style={styles.summaryValue}>
                R$ {params.planPrice?.toString().replace('.', ',')}/mês
              </Text>
            </View>
          </View>

          {/* Termos de Uso */}
          <View style={styles.termsCard}>
            <View style={styles.termsHeader}>
              <Text style={styles.termsTitle}>Termos de Uso</Text>
            </View>
            
            <ScrollView style={styles.termsContent} nestedScrollEnabled>
              <Text style={styles.termsText}>
                Ao aceitar estes termos, você concorda com:
                {'\n\n'}
                • Utilizar os serviços da AiLun Saúde de acordo com as leis vigentes
                {'\n\n'}
                • Fornecer informações verdadeiras e atualizadas
                {'\n\n'}
                • Manter a confidencialidade de suas credenciais de acesso
                {'\n\n'}
                • Respeitar os profissionais de saúde e outros usuários
                {'\n\n'}
                • Pagar pontualmente as mensalidades da assinatura
                {'\n\n'}
                • Não compartilhar sua conta com terceiros
                {'\n\n'}
                A AiLun Saúde se compromete a:
                {'\n\n'}
                • Fornecer acesso aos serviços contratados
                {'\n\n'}
                • Proteger seus dados pessoais
                {'\n\n'}
                • Garantir a qualidade dos profissionais
                {'\n\n'}
                • Oferecer suporte técnico quando necessário
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={handleToggleTerms}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <MaterialIcons name="check" size={18} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>
                Li e aceito os Termos de Uso
              </Text>
            </TouchableOpacity>
          </View>

          {/* Política de Privacidade */}
          <View style={styles.termsCard}>
            <View style={styles.termsHeader}>
              <Text style={styles.termsTitle}>Política de Privacidade</Text>
            </View>
            
            <ScrollView style={styles.termsContent} nestedScrollEnabled>
              <Text style={styles.termsText}>
                Sua privacidade é importante para nós:
                {'\n\n'}
                • Coletamos apenas dados necessários para prestar os serviços
                {'\n\n'}
                • Seus dados de saúde são protegidos por criptografia
                {'\n\n'}
                • Não compartilhamos suas informações com terceiros sem autorização
                {'\n\n'}
                • Você pode solicitar a exclusão de seus dados a qualquer momento
                {'\n\n'}
                • Utilizamos cookies para melhorar sua experiência
                {'\n\n'}
                • Cumprimos a Lei Geral de Proteção de Dados (LGPD)
                {'\n\n'}
                Dados coletados:
                {'\n\n'}
                • Informações pessoais (nome, CPF, e-mail, telefone)
                {'\n\n'}
                • Dados de saúde (sintomas, histórico médico)
                {'\n\n'}
                • Dados de pagamento (processados por gateway seguro)
                {'\n\n'}
                • Dados de uso da plataforma (logs, análises)
              </Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={handleTogglePrivacy}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]}>
                {privacyAccepted && <MaterialIcons name="check" size={18} color="#fff" />}
              </View>
              <Text style={styles.checkboxLabel}>
                Li e aceito a Política de Privacidade
              </Text>
            </TouchableOpacity>
          </View>

          {/* Botão de Continuar */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!termsAccepted || !privacyAccepted) && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!termsAccepted || !privacyAccepted}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continuar para Pagamento</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
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
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  termsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  termsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  termsContent: {
    maxHeight: 150,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
});

