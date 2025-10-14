import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/plan-calculator';
import { processRegistration, RegistrationData } from '../../services/registration';

type ProcessingStatus = 'processing' | 'success' | 'error';

export default function ConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<ProcessingStatus>('processing');
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [errorMessage, setErrorMessage] = useState('');

  // Processar registro e pagamento
  useEffect(() => {
    const processPayment = async () => {
      try {
        // Preparar dados de registro
        const registrationData: RegistrationData = {
          fullName: params.fullName as string,
          cpf: params.cpf as string,
          birthDate: params.birthDate as string,
          email: params.email as string,
          phone: params.phone as string,
          cep: params.cep as string,
          street: params.street as string,
          number: params.number as string,
          complement: params.complement as string,
          neighborhood: params.neighborhood as string,
          city: params.city as string,
          state: params.state as string,
          includeSpecialists: params.includeSpecialists === 'true',
          includePsychology: params.includePsychology === 'true',
          includeNutrition: params.includeNutrition === 'true',
          memberCount: parseInt(params.memberCount as string),
          serviceType: params.serviceType as string,
          totalPrice: parseFloat(params.totalPrice as string),
          discountPercentage: parseFloat(params.discountPercentage as string),
          paymentMethod: params.paymentMethod as 'credit_card' | 'pix' | 'boleto',
        };

        console.log('[ConfirmationScreen] Processando registro...');

        // Processar registro
        const result = await processRegistration(registrationData);

        if (result.success) {
          console.log('[ConfirmationScreen] Registro concluído com sucesso!');
          setStatus('success');
          
          // Animar ícone de sucesso
          Animated.parallel([
            Animated.spring(scaleAnim, {
              toValue: 1,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          throw new Error(result.error || 'Erro ao processar registro');
        }
      } catch (error: any) {
        console.error('[ConfirmationScreen] Erro no processamento:', error);
        setErrorMessage(error.message || 'Não foi possível processar seu cadastro.');
        setStatus('error');
        
        // Animar ícone de erro
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    };

    processPayment();
  }, []);

  const handleGoToDashboard = () => {
    router.replace('/dashboard');
  };

  const handleTryAgain = () => {
    router.back();
  };

  const renderProcessing = () => (
    <View style={styles.statusContainer}>
      <ActivityIndicator size="large" color="#00B4DB" />
      <Text style={styles.statusTitle}>Processando seu cadastro...</Text>
      <Text style={styles.statusDescription}>
        Aguarde enquanto confirmamos seu pagamento e criamos sua conta.
      </Text>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.statusContainer}>
      <Animated.View
        style={[
          styles.iconContainer,
          styles.successIconContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
      </Animated.View>
      
      <Text style={styles.statusTitle}>Bem-vindo ao AiLun Saúde! 🎉</Text>
      <Text style={styles.statusDescription}>
        Seu cadastro foi concluído com sucesso! Agora você tem acesso a todos os benefícios do seu plano.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumo do Plano</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Nome:</Text>
          <Text style={styles.summaryValue}>{params.fullName}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>E-mail:</Text>
          <Text style={styles.summaryValue}>{params.email}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Membros:</Text>
          <Text style={styles.summaryValue}>{params.memberCount} pessoa(s)</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.servicesContainer}>
          <Text style={styles.servicesTitle}>Serviços Incluídos:</Text>
          
          <View style={styles.serviceItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.serviceText}>Clínico 24h</Text>
          </View>

          {params.includeSpecialists === 'true' && (
            <View style={styles.serviceItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.serviceText}>Especialistas</Text>
            </View>
          )}

          {params.includePsychology === 'true' && (
            <View style={styles.serviceItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.serviceText}>Psicologia (2 consultas/mês)</Text>
            </View>
          )}

          {params.includeNutrition === 'true' && (
            <View style={styles.serviceItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.serviceText}>Nutrição (1 consulta/3 meses)</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Mensal:</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(parseFloat(params.totalPrice as string))}
          </Text>
        </View>

        {parseFloat(params.discountPercentage as string) > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>
              🎉 Você economiza {params.discountPercentage}% por ter {params.memberCount} membros!
            </Text>
          </View>
        )}
      </View>

      <View style={styles.nextStepsCard}>
        <Text style={styles.nextStepsTitle}>Próximos Passos:</Text>
        
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>
            Enviamos um e-mail de confirmação para {params.email}
          </Text>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>
            Acesse o app e comece a usar seus benefícios imediatamente
          </Text>
        </View>

        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>
            Adicione dependentes e familiares na área de configurações
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.dashboardButton}
        onPress={handleGoToDashboard}
        activeOpacity={0.8}
      >
        <Text style={styles.dashboardButtonText}>Ir para o App</Text>
        <MaterialIcons name="arrow-forward" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderError = () => (
    <View style={styles.statusContainer}>
      <Animated.View
        style={[
          styles.iconContainer,
          styles.errorIconContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <MaterialIcons name="error" size={80} color="#ff6b6b" />
      </Animated.View>
      
      <Text style={styles.statusTitle}>Ops! Algo deu errado</Text>
      <Text style={styles.statusDescription}>
        {errorMessage || 'Não conseguimos processar seu pagamento. Por favor, verifique seus dados e tente novamente.'}
      </Text>

      <View style={styles.errorCard}>
        <Text style={styles.errorTitle}>Possíveis causas:</Text>
        <Text style={styles.errorItem}>• Dados do cartão incorretos</Text>
        <Text style={styles.errorItem}>• Saldo insuficiente</Text>
        <Text style={styles.errorItem}>• Problema de conexão</Text>
        <Text style={styles.errorItem}>• Erro no servidor</Text>
      </View>

      <TouchableOpacity
        style={styles.retryButton}
        onPress={handleTryAgain}
        activeOpacity={0.8}
      >
        <MaterialIcons name="refresh" size={24} color="#fff" />
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.supportButton}
        onPress={() => Alert.alert('Suporte', 'Entre em contato: suporte@ailun.com.br')}
        activeOpacity={0.8}
      >
        <Text style={styles.supportButtonText}>Falar com o Suporte</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {status === 'processing' && renderProcessing()}
        {status === 'success' && renderSuccess()}
        {status === 'error' && renderError()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  statusContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  successIconContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 60,
    padding: 20,
  },
  errorIconContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 60,
    padding: 20,
  },
  statusTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusDescription: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  servicesContainer: {
    marginBottom: 8,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00B4DB',
  },
  discountBadge: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB74D',
  },
  discountBadgeText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  nextStepsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00B4DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingTop: 4,
  },
  dashboardButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dashboardButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginRight: 8,
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  errorItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#00B4DB',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  supportButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  supportButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

