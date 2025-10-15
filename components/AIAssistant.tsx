/**
 * Componente AI Assistant - Interface de Chat
 * Integração com o sistema de IA do AiLun Saúde
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { aiAssistant, AssistantMessage, AssistantResponse, AssistantAction } from '../services/ai-assistant';
import { useAuth } from '../hooks/useAuth';

interface AIAssistantProps {
  visible?: boolean;
  onClose?: () => void;
  initialMessage?: string;
}

export default function AIAssistant({ visible = true, onClose, initialMessage }: AIAssistantProps) {
  const insets = useSafeAreaInsets();
  const { user, profile, beneficiaryUuid } = useAuth();
  
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Inicializar assistente com contexto do usuário
  useEffect(() => {
    const initializeAssistant = async () => {
      if (user && profile) {
        await aiAssistant.setUserContext({
          userId: user.id,
          beneficiaryUuid,
          userProfile: profile,
        });
        
        setIsInitialized(true);
        
        // Mensagem de boas-vindas
        const welcomeMessage: AssistantMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Olá, ${profile.full_name?.split(' ')[0] || 'usuário'}! 👋 Sou seu assistente virtual da AiLun Saúde. Como posso te ajudar hoje?`,
          timestamp: new Date(),
        };
        
        setMessages([welcomeMessage]);
        
        // Processar mensagem inicial se fornecida
        if (initialMessage) {
          setTimeout(() => {
            handleSendMessage(initialMessage);
          }, 1000);
        }
      }
    };

    initializeAssistant();
  }, [user, profile, beneficiaryUuid, initialMessage]);

  // Animações de entrada
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Scroll automático para última mensagem
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputText.trim();
    if (!messageText || loading || !isInitialized) return;

    setInputText('');
    setLoading(true);

    // Adicionar mensagem do usuário
    const userMessage: AssistantMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Processar mensagem com o assistente IA
      const response = await aiAssistant.processMessage(messageText);
      
      // Adicionar resposta do assistente
      const assistantMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: { 
          actions: response.actions,
          suggestions: response.suggestions,
          confidence: response.confidence,
          needsHumanSupport: response.needsHumanSupport
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('[AI Assistant] Erro ao processar mensagem:', error);
      
      const errorMessage: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Pode tentar novamente ou entrar em contato com nosso suporte?',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleActionPress = (action: AssistantAction) => {
    switch (action.type) {
      case 'navigate':
        if (action.data.screen) {
          router.push(action.data.screen);
        }
        break;
      
      case 'call':
        // Implementar chamada telefônica
        console.log('Calling:', action.data.phone);
        break;
      
      case 'emergency':
        // Implementar ações de emergência
        console.log('Emergency action:', action.data);
        break;
      
      default:
        console.log('Action:', action);
    }
  };

  const renderMessage = (message: AssistantMessage) => {
    const isUser = message.role === 'user';
    const actions = message.metadata?.actions as AssistantAction[] || [];
    const suggestions = message.metadata?.suggestions as string[] || [];

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}>
          {!isUser && (
            <View style={styles.assistantIcon}>
              <MaterialIcons name="smart-toy" size={20} color="#00B4DB" />
            </View>
          )}
          
          <View style={[
            styles.messageContent,
            isUser ? styles.userContent : styles.assistantContent,
          ]}>
            <Text style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}>
              {message.content}
            </Text>
            
            <Text style={[
              styles.messageTime,
              isUser ? styles.userTime : styles.assistantTime,
            ]}>
              {message.timestamp.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {actions.length > 0 && (
          <View style={styles.actionsContainer}>
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={() => handleActionPress(action)}
              >
                <LinearGradient
                  colors={['#00B4DB', '#0083B0']}
                  style={styles.actionGradient}
                >
                  <Text style={styles.actionText}>{action.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Sugestões:</Text>
            <View style={styles.suggestionsGrid}>
              {suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <LinearGradient
        colors={['#00B4DB', '#0083B0']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIcon}>
              <MaterialIcons name="smart-toy" size={24} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Assistente IA</Text>
              <Text style={styles.headerSubtitle}>AiLun Saúde</Text>
            </View>
          </View>
          
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(renderMessage)}
          
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#00B4DB" />
              <Text style={styles.loadingText}>Processando...</Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Digite sua mensagem..."
              placeholderTextColor="#999"
              multiline
              maxLength={500}
              editable={!loading}
            />
            
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || loading) && styles.sendButtonDisabled
              ]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || loading}
            >
              <MaterialIcons 
                name="send" 
                size={24} 
                color={(!inputText.trim() || loading) ? '#ccc' : '#00B4DB'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    flexDirection: 'row',
    maxWidth: '85%',
    alignItems: 'flex-end',
  },
  userBubble: {
    flexDirection: 'row-reverse',
  },
  assistantBubble: {
    flexDirection: 'row',
  },
  assistantIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageContent: {
    borderRadius: 16,
    padding: 12,
  },
  userContent: {
    backgroundColor: '#00B4DB',
    borderBottomRightRadius: 4,
  },
  assistantContent: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  assistantText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  assistantTime: {
    color: '#999',
  },
  actionsContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  actionButton: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  suggestionsContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 8,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  suggestionText: {
    color: '#666',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f8f8',
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 120,
    paddingVertical: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});