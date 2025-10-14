/**
 * Página de Consulta Médica Via WebView
 * Tela otimizada para videochamadas médicas com controles nativos
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/useAuth';
import { useRealTimeIntegrations } from '../../hooks/useRealTimeIntegrations';
import { showTemplateMessage } from '../../utils/alertHelpers';

const { width, height } = Dimensions.get('window');

export default function ConsultationWebViewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { profile } = useAuth();
  const realTimeIntegrations = useRealTimeIntegrations();
  
  const webViewRef = useRef<WebView>(null);
  
  const url = params.url as string;
  const consultationId = params.consultationId as string;
  const professionalName = params.professionalName as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [callStarted, setCallStarted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  
  const callStartTime = useRef<Date | null>(null);
  const durationInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Configurar orientação para landscape se necessário
    const configureOrientation = async () => {
      if (Platform.OS !== 'web') {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.ALL);
      }
    };
    configureOrientation();

    // Verificar URL válida
    if (!url || !url.startsWith('https://')) {
      setError('URL de consulta inválida');
      return;
    }

    return () => {
      // Cleanup ao sair
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      
      // Restaurar orientação
      if (Platform.OS !== 'web') {
        ScreenOrientation.unlockAsync();
      }
    };
  }, [url]);

  useEffect(() => {
    // Timer da consulta
    if (callStarted && !durationInterval.current) {
      callStartTime.current = new Date();
      durationInterval.current = setInterval(() => {
        if (callStartTime.current) {
          const now = new Date();
          const duration = Math.floor((now.getTime() - callStartTime.current.getTime()) / 1000);
          setCallDuration(duration);
        }
      }, 1000);
    } else if (!callStarted && durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = undefined;
    }
  }, [callStarted]);

  const handleWebViewLoad = () => {
    setLoading(false);
    setError(null);
    
    // Notificar que a consulta começou
    setCallStarted(true);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    showTemplateMessage({
      title: '🎥 Consulta Iniciada',
      message: `Conectado com ${professionalName || 'profissional de saúde'}`,
      type: 'success'
    });
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    setError('Erro ao carregar consulta');
    setLoading(false);
    
    showTemplateMessage({
      title: '❌ Erro na Consulta',
      message: 'Não foi possível conectar à videochamada. Verifique sua conexão.',
      type: 'error'
    });
  };

  const handleEndCall = () => {
    Alert.alert(
      '📞 Finalizar Consulta',
      'Tem certeza que deseja finalizar a consulta?',
      [
        { text: 'Continuar', style: 'cancel' },
        { text: 'Finalizar', style: 'destructive', onPress: confirmEndCall },
      ]
    );
  };

  const confirmEndCall = async () => {
    try {
      // Enviar notificação sobre fim da consulta
      if (consultationId && profile) {
        await realTimeIntegrations.sendNotification(
          profile.id,
          'email',
          'consultation_completed',
          {
            consultationId,
            professionalName,
            duration: formatDuration(callDuration),
            patientName: profile.full_name,
          }
        );
      }
      
      showTemplateMessage({
        title: '✅ Consulta Finalizada',
        message: `Duração: ${formatDuration(callDuration)}. Obrigado por usar o AiLun Saúde!`,
        type: 'success'
      });
      
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
    }
    
    router.back();
  };

  const toggleFullscreen = async () => {
    if (Platform.OS === 'web') return;
    
    try {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
      setIsFullscreen(!isFullscreen);
    } catch (error) {
      console.error('Erro ao alterar orientação:', error);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'good': return '#4CAF50';
      case 'fair': return '#FF9800';
      case 'poor': return '#F44336';
      default: return '#666';
    }
  };

  const injectScript = `
    (function() {
      // Interceptar eventos de call para detectar início/fim
      const originalAddEventListener = window.addEventListener;
      window.addEventListener = function(event, handler, ...args) {
        if (event === 'beforeunload') {
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'call_ending'
          }));
        }
        return originalAddEventListener.call(this, event, handler, ...args);
      };
      
      // Detectar qualidade da conexão
      if (navigator.connection) {
        const updateConnectionQuality = () => {
          const connection = navigator.connection;
          let quality = 'good';
          
          if (connection.effectiveType === '2g') quality = 'poor';
          else if (connection.effectiveType === '3g') quality = 'fair';
          
          window.ReactNativeWebView?.postMessage(JSON.stringify({
            type: 'connection_quality',
            quality: quality
          }));
        };
        
        navigator.connection.addEventListener('change', updateConnectionQuality);
        updateConnectionQuality();
      }
      
      // Notificar que a página carregou completamente
      window.addEventListener('load', () => {
        window.ReactNativeWebView?.postMessage(JSON.stringify({
          type: 'page_loaded'
        }));
      });
    })();
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'call_ending':
          setCallStarted(false);
          break;
        case 'connection_quality':
          setConnectionQuality(data.quality);
          break;
        case 'page_loaded':
          console.log('Página de consulta carregada completamente');
          break;
      }
    } catch (error) {
      console.error('Erro ao processar mensagem do WebView:', error);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#F44336" />
        <LinearGradient colors={['#F44336', '#D32F2F']} style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color="white" />
          <Text style={styles.errorTitle}>Erro na Consulta</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
            <Text style={styles.retryButtonText}>Voltar</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header com controles */}
      {!isFullscreen && (
        <LinearGradient 
          colors={['rgba(0,0,0,0.8)', 'transparent']}
          style={[styles.header, { paddingTop: insets.top }]}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.callInfo}>
                <Text style={styles.professionalName}>
                  {professionalName || 'Consulta Médica'}
                </Text>
                {callStarted && (
                  <View style={styles.callStatus}>
                    <View style={[styles.connectionDot, { backgroundColor: getConnectionColor() }]} />
                    <Text style={styles.callDuration}>{formatDuration(callDuration)}</Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerButton} onPress={toggleFullscreen}>
                <MaterialIcons 
                  name={isFullscreen ? "fullscreen-exit" : "fullscreen"} 
                  size={24} 
                  color="white" 
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
                <MaterialIcons name="call-end" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      )}

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00B4DB" />
            <Text style={styles.loadingText}>Conectando à consulta...</Text>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          onLoad={handleWebViewLoad}
          onError={handleWebViewError}
          onMessage={handleMessage}
          injectedJavaScript={injectScript}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          startInLoadingState={false}
          domStorageEnabled
          javaScriptEnabled
          mixedContentMode="always"
          userAgent="AiLunSaude/1.0 (Mobile Medical App)"
        />
      </View>

      {/* Controles flutuantes em fullscreen */}
      {isFullscreen && (
        <View style={styles.floatingControls}>
          <TouchableOpacity style={styles.floatingButton} onPress={toggleFullscreen}>
            <MaterialIcons name="fullscreen-exit" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.floatingButton, styles.endCallButtonFloating]} onPress={handleEndCall}>
            <MaterialIcons name="call-end" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callInfo: {
    marginLeft: 12,
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  callStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  callDuration: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  endCallButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 5,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  floatingControls: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    flexDirection: 'column',
    gap: 12,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButtonFloating: {
    backgroundColor: '#F44336',
  },
});