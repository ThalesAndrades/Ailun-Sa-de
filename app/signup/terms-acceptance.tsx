import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';

/**
 * Tela de Aceite de Termos de Uso e Política de Privacidade
 * 
 * Esta tela é exibida após o cadastro e pagamento do usuário,
 * solicitando o aceite dos termos antes de liberar o acesso ao dashboard.
 */
export default function TermsAcceptanceScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Função para registrar o aceite dos termos no Supabase
   */
  const handleAcceptTerms = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obter o usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('Usuário não autenticado. Por favor, faça login novamente.');
      }

      // Atualizar o perfil do usuário com o aceite dos termos
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error('Erro ao registrar aceite dos termos. Por favor, tente novamente.');
      }

      // Redirecionar para o dashboard
      router.replace('/dashboard');
    } catch (err: any) {
      console.error('Erro ao aceitar termos:', err);
      setError(err.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Função para recusar os termos e fazer logout
   */
  const handleDeclineTerms = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Termos de Uso e Política de Privacidade</Text>
        
        <Text style={styles.subtitle}>Bem-vindo(a) à AiLun Saúde!</Text>
        
        <Text style={styles.paragraph}>
          Para continuar, é necessário que você leia e aceite nossos Termos de Uso e Política de Privacidade.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Termos de Uso</Text>
          <Text style={styles.paragraph}>
            Ao utilizar os serviços da AiLun Saúde, você concorda em fornecer informações precisas e completas,
            manter a confidencialidade de suas credenciais de acesso e utilizar a plataforma de forma ética e legal.
          </Text>
          <Text style={styles.paragraph}>
            Você é responsável por garantir que seu equipamento e conexão à internet sejam adequados para a
            realização de consultas online.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Política de Privacidade</Text>
          <Text style={styles.paragraph}>
            Coletamos e utilizamos suas informações pessoais e de saúde exclusivamente para fornecer nossos
            serviços de telemedicina. Implementamos medidas rigorosas de segurança para proteger seus dados,
            em conformidade com a Lei Geral de Proteção de Dados (LGPD).
          </Text>
          <Text style={styles.paragraph}>
            Suas informações são compartilhadas apenas com os profissionais de saúde envolvidos no seu
            atendimento e parceiros essenciais para a operação da plataforma, sempre sob acordos de
            confidencialidade.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Consentimento para Telemedicina</Text>
          <Text style={styles.paragraph}>
            Ao aceitar estes termos, você também consente em receber atendimento de saúde à distância,
            compreendendo os benefícios, limitações e riscos associados à telemedicina.
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>Importante:</Text> A telemedicina não é adequada para situações de
            emergência. Em caso de emergência médica, procure imediatamente um pronto-socorro.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Seus Direitos</Text>
          <Text style={styles.paragraph}>
            Você tem o direito de acessar, corrigir, atualizar ou solicitar a exclusão de suas informações
            pessoais a qualquer momento. Para exercer esses direitos, entre em contato conosco através do
            e-mail contato@ailun.com.br.
          </Text>
        </View>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>
            Para ler os documentos completos, acesse:
          </Text>
          <Text style={styles.link}>• Termos de Uso e Política de Privacidade</Text>
          <Text style={styles.link}>• Termo de Consentimento para Telemedicina</Text>
        </View>
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.declineButton]}
          onPress={handleDeclineTerms}
          disabled={loading}
        >
          <Text style={styles.declineButtonText}>Recusar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={handleAcceptTerms}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.acceptButtonText}>Aceitar e Continuar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 12,
  },
  section: {
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  linkContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  declineButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#007AFF',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

