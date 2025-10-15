import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WebViewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [error, setError] = useState(false);

  const url = params.url as string;

  if (!url) {
    Alert.alert('Erro', 'URL não fornecida');
    router.back();
    return null;
  }

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
  };

  const handleGoBack = () => {
    if (webViewRef.current && canGoBack) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (webViewRef.current && canGoForward) {
      webViewRef.current.goForward();
    }
  };

  const handleReload = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
      setError(false);
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Sair da Consulta',
      'Tem certeza que deseja sair? A consulta será encerrada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
            onPress={handleGoBack}
            disabled={!canGoBack}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={canGoBack ? '#fff' : '#999'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
            onPress={handleGoForward}
            disabled={!canGoForward}
          >
            <MaterialIcons
              name="arrow-forward"
              size={24}
              color={canGoForward ? '#fff' : '#999'}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton} onPress={handleReload}>
            <MaterialIcons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* URL Bar */}
      <View style={styles.urlBar}>
        <MaterialIcons name="lock" size={16} color="#4CAF50" />
        <Text style={styles.urlText} numberOfLines={1}>
          {currentUrl || url}
        </Text>
      </View>

      {/* WebView */}
      {error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Erro ao Carregar</Text>
          <Text style={styles.errorMessage}>
            Não foi possível carregar a página. Verifique sua conexão e tente novamente.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleReload}>
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <WebView
            ref={webViewRef}
            source={{ uri: url }}
            style={styles.webview}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={handleError}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo={true}
            // Configurações de permissões para videochamada
            {...Platform.select({
              ios: {
                allowsInlineMediaPlayback: true,
                mediaPlaybackRequiresUserAction: false,
              },
              android: {
                mixedContentMode: 'always',
                geolocationEnabled: true,
              },
            })}
          />

          {/* Loading Indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00B4DB" />
              <Text style={styles.loadingText}>Carregando consulta...</Text>
            </View>
          )}
        </>
      )}

      {/* Bottom Info Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.infoContainer}>
          <MaterialIcons name="videocam" size={16} color="#4CAF50" />
          <Text style={styles.infoText}>Consulta em andamento</Text>
        </View>
        <View style={styles.statusDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00B4DB',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  urlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#00B4DB',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
});

