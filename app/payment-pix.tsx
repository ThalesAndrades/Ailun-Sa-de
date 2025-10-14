import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCPFAuth } from '../hooks/useCPFAuth';
import { useSubscription } from '../hooks/useSubscription';
import { Image } from 'expo-image';

export default function PaymentPixScreen() {
  const insets = useSafeAreaInsets();
  const { user, beneficiaryUuid } = useCPFAuth();
  const { createSubscription, loading } = useSubscription(beneficiaryUuid || '');

  const [paymentData, setPaymentData] = useState<{
    pixQrCode?: string;
    pixCopyPaste?: string;
    payment?: any;
  } | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const showAlert = (title: string, message: string, onPress?: () => void) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
      onPress?.();
    } else {
      Alert.alert(title, message, onPress ? [{ text: 'OK', onPress }] : undefined);
    }
  };

  const createPixPayment = async () => {
    if (!user || !beneficiaryUuid) {
      showAlert('Erro', 'Dados do usuário não encontrados. Faça login novamente.');
      return;
    }

    setProcessingPayment(true);

    try {
      const result = await createSubscription({
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        postalCode: '01310100', // CEP padrão - seria coletado em um onboarding completo
        address: 'Av. Paulista',
        addressNumber: '1000',
        complement: '',
        province: 'São Paulo',
        billingType: 'PIX',
      });

      if (result.success) {
        setPaymentData({
          pixQrCode: result.pixQrCode,
          pixCopyPaste: result.pixCopyPaste,
          payment: result.payment,
        });
      } else {
        showAlert('Erro no Pagamento', result.error || 'Não foi possível gerar o PIX.');
      }
    } catch (error: any) {
      console.error('Erro ao criar PIX:', error);
      showAlert('Erro', 'Erro inesperado. Tente novamente.');
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    createPixPayment();
  }, []);

  const copyPixCode = async () => {
    if (!paymentData?.pixCopyPaste) return;

    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(paymentData.pixCopyPaste);
      } else {
        Clipboard.setString(paymentData.pixCopyPaste);
      }
      showAlert('Copiado!', 'Código PIX copiado para a área de transferência.');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      showAlert('Erro', 'Não foi possível copiar o código.');
    }
  };

  const sharePixCode = async () => {
    if (!paymentData?.pixCopyPaste) return;

    try {
      await Share.share({
        message: `PIX - AiLun Saúde\nR$ 89,90\n\n${paymentData.pixCopyPaste}`,
        title: 'Pagamento PIX - AiLun Saúde',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const checkPayment = () => {
    showAlert(
      'Verificando Pagamento',
      'Esta funcionalidade será implementada em breve. Você receberá uma notificação quando o pagamento for confirmado.',
      () => {
        router.replace('/subscription');
      }
    );
  };

  if (processingPayment) {
    return (
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>Gerando PIX...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.container}>
      <ScrollView
        style={[styles.scrollContainer, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagamento PIX</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.priceCard}>
            <MaterialIcons name="qr-code" size={40} color="#FF9800" />
            <Text style={styles.priceTitle}>AiLun Saúde Premium</Text>
            <Text style={styles.priceValue}>R$ 89,90</Text>
            <Text style={styles.priceSubtitle}>Pagamento via PIX</Text>
          </View>

          {paymentData ? (
            <>
              <View style={styles.qrCodeCard}>
                <Text style={styles.qrTitle}>Escaneie o QR Code</Text>
                
                {paymentData.pixQrCode ? (
                  <View style={styles.qrCodeContainer}>
                    <Image
                      source={{ uri: `data:image/png;base64,${paymentData.pixQrCode}` }}
                      style={styles.qrCodeImage}
                      contentFit="contain"
                    />
                  </View>
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <MaterialIcons name="qr-code" size={80} color="#E0E0E0" />
                    <Text style={styles.qrPlaceholderText}>QR Code não disponível</Text>
                  </View>
                )}

                <Text style={styles.qrInstructions}>
                  Abra o app do seu banco e escaneie o código acima para pagar
                </Text>
              </View>

              {paymentData.pixCopyPaste && (
                <View style={styles.copyPasteCard}>
                  <Text style={styles.copyPasteTitle}>Ou copie o código PIX</Text>
                  
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeText} numberOfLines={3}>
                      {paymentData.pixCopyPaste}
                    </Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionButton} onPress={copyPixCode}>
                      <MaterialIcons name="content-copy" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Copiar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={sharePixCode}>
                      <MaterialIcons name="share" size={20} color="white" />
                      <Text style={styles.actionButtonText}>Compartilhar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>Como pagar:</Text>
                <View style={styles.stepsList}>
                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={styles.stepText}>Abra o aplicativo do seu banco</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={styles.stepText}>Escolha a opção PIX</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <Text style={styles.stepText}>Escaneie o QR Code ou cole o código</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>4</Text>
                    </View>
                    <Text style={styles.stepText}>Confirme o pagamento de R$ 89,90</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.checkButton} onPress={checkPayment}>
                <MaterialIcons name="check-circle" size={24} color="white" />
                <Text style={styles.checkButtonText}>Já paguei - Verificar</Text>
              </TouchableOpacity>

              <View style={styles.infoCard}>
                <MaterialIcons name="info" size={20} color="#FF9800" />
                <Text style={styles.infoText}>
                  O PIX será confirmado automaticamente em alguns minutos. Você receberá uma notificação.
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.errorCard}>
              <MaterialIcons name="error" size={40} color="#F44336" />
              <Text style={styles.errorTitle}>Erro ao gerar PIX</Text>
              <Text style={styles.errorMessage}>
                Não foi possível gerar o código PIX. Tente novamente.
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={createPixPayment}>
                <MaterialIcons name="refresh" size={20} color="white" />
                <Text style={styles.retryButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  priceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  priceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 8,
  },
  priceSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  qrCodeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 20,
  },
  qrPlaceholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  qrInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  copyPasteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  copyPasteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  codeContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 0.45,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  checkButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 12,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});