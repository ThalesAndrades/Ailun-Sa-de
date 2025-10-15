/**
 * AI Assistant Integrado - AiLun Saúde
 * Implementação de assistente IA com contexto médico
 */

import { supabase } from './supabase';
import { logger } from '../utils/production-logger';

// Tipos para o assistente
export interface AssistantContext {
  userId: string;
  beneficiaryUuid?: string;
  userProfile?: any;
  subscriptionData?: any;
  recentAppointments?: any[];
  healthData?: any;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  context?: any;
  metadata?: any;
}

export interface AssistantResponse {
  message: string;
  actions?: AssistantAction[];
  suggestions?: string[];
  confidence: number;
  needsHumanSupport?: boolean;
}

export interface AssistantAction {
  type: 'navigate' | 'schedule' | 'call' | 'emergency' | 'info';
  label: string;
  data: any;
}

export class AiLunAssistant {
  private context: AssistantContext | null = null;
  private conversationHistory: AssistantMessage[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeAssistant();
  }

  private async initializeAssistant() {
    try {
      logger.info('[AI Assistant] Inicializando assistente IA');
      
      // Carregar configurações e modelos pré-treinados
      await this.loadMedicalKnowledgeBase();
      await this.loadUserPreferences();
      
      this.isInitialized = true;
      logger.info('[AI Assistant] Assistente inicializado com sucesso');
    } catch (error) {
      logger.error('[AI Assistant] Erro na inicialização:', error);
    }
  }

  /**
   * Define o contexto do usuário atual
   */
  async setUserContext(context: AssistantContext): Promise<void> {
    this.context = context;
    
    // Carregar dados adicionais do usuário
    if (context.userId) {
      await this.enrichUserContext();
    }
    
    logger.info('[AI Assistant] Contexto do usuário definido', { userId: context.userId });
  }

  /**
   * Processa uma mensagem do usuário e retorna resposta do assistente
   */
  async processMessage(userMessage: string): Promise<AssistantResponse> {
    if (!this.isInitialized) {
      return {
        message: 'Assistente ainda inicializando. Tente novamente em alguns instantes.',
        confidence: 0,
        needsHumanSupport: true
      };
    }

    try {
      logger.info('[AI Assistant] Processando mensagem', { message: userMessage });

      // Adicionar mensagem do usuário ao histórico
      const userMsg: AssistantMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        context: this.context
      };
      this.conversationHistory.push(userMsg);

      // Analisar intenção da mensagem
      const intent = await this.analyzeIntent(userMessage);
      
      // Gerar resposta baseada na intenção e contexto
      const response = await this.generateResponse(intent, userMessage);

      // Adicionar resposta do assistente ao histórico
      const assistantMsg: AssistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: { intent, confidence: response.confidence }
      };
      this.conversationHistory.push(assistantMsg);

      // Salvar conversa no Supabase (opcional)
      await this.saveConversation(userMsg, assistantMsg);

      return response;
    } catch (error) {
      logger.error('[AI Assistant] Erro ao processar mensagem:', error);
      return {
        message: 'Desculpe, ocorreu um erro. Você pode reformular sua pergunta ou entrar em contato com nosso suporte?',
        confidence: 0,
        needsHumanSupport: true
      };
    }
  }

  /**
   * Analisa a intenção da mensagem do usuário
   */
  private async analyzeIntent(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    // Intenções relacionadas a consultas
    if (lowerMessage.includes('consulta') || lowerMessage.includes('médico') || lowerMessage.includes('doutor')) {
      if (lowerMessage.includes('agendar') || lowerMessage.includes('marcar')) {
        return 'schedule_appointment';
      }
      if (lowerMessage.includes('cancelar')) {
        return 'cancel_appointment';
      }
      if (lowerMessage.includes('reagendar')) {
        return 'reschedule_appointment';
      }
      return 'appointment_info';
    }

    // Intenções de emergência
    if (lowerMessage.includes('emergência') || lowerMessage.includes('urgente') || lowerMessage.includes('socorro')) {
      return 'emergency';
    }

    // Intenções sobre sintomas
    if (lowerMessage.includes('sintoma') || lowerMessage.includes('dor') || lowerMessage.includes('febre')) {
      return 'symptom_check';
    }

    // Intenções sobre planos
    if (lowerMessage.includes('plano') || lowerMessage.includes('assinatura') || lowerMessage.includes('pagamento')) {
      return 'subscription_info';
    }

    // Intenções sobre especialistas
    if (lowerMessage.includes('especialista') || lowerMessage.includes('cardiologista') || 
        lowerMessage.includes('dermatologista') || lowerMessage.includes('neurologista')) {
      return 'specialist_info';
    }

    // Intenções sobre psicologia
    if (lowerMessage.includes('psicólogo') || lowerMessage.includes('psicologia') || lowerMessage.includes('ansiedade')) {
      return 'psychology_info';
    }

    // Intenções sobre nutrição
    if (lowerMessage.includes('nutricionista') || lowerMessage.includes('dieta') || lowerMessage.includes('alimentação')) {
      return 'nutrition_info';
    }

    // Saudações
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia')) {
      return 'greeting';
    }

    return 'general_inquiry';
  }

  /**
   * Gera resposta baseada na intenção e contexto
   */
  private async generateResponse(intent: string, userMessage: string): Promise<AssistantResponse> {
    switch (intent) {
      case 'schedule_appointment':
        return await this.handleScheduleAppointment(userMessage);
      
      case 'emergency':
        return this.handleEmergency();
      
      case 'symptom_check':
        return await this.handleSymptomCheck(userMessage);
      
      case 'subscription_info':
        return await this.handleSubscriptionInfo();
      
      case 'specialist_info':
        return await this.handleSpecialistInfo(userMessage);
      
      case 'psychology_info':
        return await this.handlePsychologyInfo();
      
      case 'nutrition_info':
        return await this.handleNutritionInfo();
      
      case 'greeting':
        return this.handleGreeting();
      
      case 'appointment_info':
        return await this.handleAppointmentInfo();
      
      default:
        return this.handleGeneralInquiry(userMessage);
    }
  }

  /**
   * Handlers para diferentes tipos de intenção
   */
  private async handleScheduleAppointment(message: string): Promise<AssistantResponse> {
    const actions: AssistantAction[] = [
      {
        type: 'navigate',
        label: 'Agendar Consulta',
        data: { screen: '/consultation/schedule' }
      }
    ];

    // Verificar se o usuário tem plano ativo
    if (!this.context?.subscriptionData?.hasActiveSubscription) {
      return {
        message: 'Para agendar consultas, você precisa de um plano ativo. Gostaria que eu te ajude a ativar sua assinatura?',
        actions: [
          {
            type: 'navigate',
            label: 'Ver Planos',
            data: { screen: '/subscription' }
          }
        ],
        confidence: 0.9
      };
    }

    // Identificar tipo de especialista se mencionado
    const specialists = ['cardiologista', 'dermatologista', 'neurologista', 'endocrinologista'];
    const mentionedSpecialist = specialists.find(spec => message.toLowerCase().includes(spec));

    if (mentionedSpecialist) {
      return {
        message: `Entendi que você quer agendar com um ${mentionedSpecialist}. Vou te ajudar a encontrar horários disponíveis.`,
        actions,
        suggestions: [
          'Verificar disponibilidade',
          'Ver meu histórico de consultas',
          'Falar com suporte'
        ],
        confidence: 0.95
      };
    }

    return {
      message: 'Posso te ajudar a agendar uma consulta! Que tipo de atendimento você precisa: médico geral, especialista, psicólogo ou nutricionista?',
      actions,
      suggestions: [
        'Médico agora (consulta imediata)',
        'Especialista',
        'Psicólogo',
        'Nutricionista'
      ],
      confidence: 0.9
    };
  }

  private handleEmergency(): AssistantResponse {
    return {
      message: '🚨 EMERGÊNCIA: Em caso de emergência médica, ligue imediatamente para:\n\n📞 SAMU: 192\n📞 Bombeiros: 193\n📞 Polícia: 190\n\nSe não é uma emergência, posso te ajudar a agendar uma consulta urgente.',
      actions: [
        {
          type: 'call',
          label: 'Ligar SAMU (192)',
          data: { phone: '192' }
        },
        {
          type: 'navigate',
          label: 'Médico Agora',
          data: { screen: '/consultation/request-immediate' }
        }
      ],
      confidence: 1.0
    };
  }

  private async handleSymptomCheck(message: string): Promise<AssistantResponse> {
    // AVISO IMPORTANTE: Esta é apenas uma triagem básica, não substitui avaliação médica
    
    const urgentSymptoms = ['dor no peito', 'falta de ar', 'desmaio', 'sangramento'];
    const hasUrgentSymptom = urgentSymptoms.some(symptom => 
      message.toLowerCase().includes(symptom)
    );

    if (hasUrgentSymptom) {
      return {
        message: '⚠️ Os sintomas que você mencionou podem ser sérios. Recomendo que procure atendimento médico imediatamente ou entre em contato com uma consulta urgente.',
        actions: [
          {
            type: 'navigate',
            label: 'Médico Agora',
            data: { screen: '/consultation/request-immediate' }
          },
          {
            type: 'call',
            label: 'SAMU (192)',
            data: { phone: '192' }
          }
        ],
        confidence: 0.95,
        needsHumanSupport: true
      };
    }

    return {
      message: 'Entendo sua preocupação com os sintomas. Embora eu possa oferecer informações gerais, é importante que um médico avalie adequadamente sua situação. Gostaria de agendar uma consulta?',
      actions: [
        {
          type: 'navigate',
          label: 'Médico Agora',
          data: { screen: '/consultation/request-immediate' }
        },
        {
          type: 'navigate',
          label: 'Agendar Consulta',
          data: { screen: '/consultation/schedule' }
        }
      ],
      suggestions: [
        'Agendar consulta urgente',
        'Falar sobre meus sintomas',
        'Ver histórico de consultas'
      ],
      confidence: 0.8
    };
  }

  private async handleSubscriptionInfo(): Promise<AssistantResponse> {
    if (!this.context?.subscriptionData) {
      return {
        message: 'Vou verificar informações sobre sua assinatura...',
        actions: [
          {
            type: 'navigate',
            label: 'Minha Assinatura',
            data: { screen: '/profile/subscription' }
          }
        ],
        confidence: 0.7
      };
    }

    const { hasActiveSubscription, plan } = this.context.subscriptionData;

    if (hasActiveSubscription) {
      return {
        message: `✅ Sua assinatura está ativa! Plano: ${plan?.plan_name || 'N/A'}. Você tem acesso a todos os serviços incluídos.`,
        actions: [
          {
            type: 'navigate',
            label: 'Detalhes do Plano',
            data: { screen: '/profile/plan' }
          }
        ],
        suggestions: [
          'Ver serviços incluídos',
          'Histórico de pagamentos',
          'Alterar plano'
        ],
        confidence: 0.95
      };
    }

    return {
      message: '⚠️ Sua assinatura está inativa. Para continuar usando nossos serviços, você precisa regularizar o pagamento.',
      actions: [
        {
          type: 'navigate',
          label: 'Ativar Assinatura',
          data: { screen: '/subscription' }
        }
      ],
      confidence: 0.95
    };
  }

  private async handleSpecialistInfo(message: string): Promise<AssistantResponse> {
    const specialists = [
      'Cardiologista', 'Dermatologista', 'Neurologista', 
      'Endocrinologista', 'Ginecologista', 'Urologista'
    ];

    return {
      message: `Temos especialistas disponíveis em várias áreas: ${specialists.join(', ')}. Precisa agendar com algum especialista específico?`,
      actions: [
        {
          type: 'navigate',
          label: 'Ver Especialistas',
          data: { screen: '/consultation/schedule', params: { serviceType: 'specialist' } }
        }
      ],
      suggestions: specialists.slice(0, 4),
      confidence: 0.9
    };
  }

  private async handlePsychologyInfo(): Promise<AssistantResponse> {
    return {
      message: 'Oferecemos atendimento psicológico com profissionais especializados. O cuidado da saúde mental é fundamental para o bem-estar geral.',
      actions: [
        {
          type: 'navigate',
          label: 'Agendar com Psicólogo',
          data: { screen: '/consultation/schedule', params: { serviceType: 'psychology' } }
        }
      ],
      suggestions: [
        'Ver psicólogos disponíveis',
        'Informações sobre terapia',
        'Consulta de emergência psicológica'
      ],
      confidence: 0.9
    };
  }

  private async handleNutritionInfo(): Promise<AssistantResponse> {
    return {
      message: 'Nossos nutricionistas podem te ajudar com planos alimentares personalizados e orientação nutricional especializada.',
      actions: [
        {
          type: 'navigate',
          label: 'Agendar com Nutricionista',
          data: { screen: '/consultation/schedule', params: { serviceType: 'nutrition' } }
        }
      ],
      suggestions: [
        'Planos alimentares',
        'Dietas especiais',
        'Orientação nutricional'
      ],
      confidence: 0.9
    };
  }

  private handleGreeting(): AssistantResponse {
    const userName = this.context?.userProfile?.full_name?.split(' ')[0] || 'usuário';
    
    return {
      message: `Olá, ${userName}! 👋 Sou seu assistente virtual da AiLun Saúde. Como posso te ajudar hoje?`,
      suggestions: [
        'Agendar uma consulta',
        'Ver minha assinatura',
        'Médico agora',
        'Falar com especialista'
      ],
      confidence: 1.0
    };
  }

  private async handleAppointmentInfo(): Promise<AssistantResponse> {
    return {
      message: 'Posso te ajudar com informações sobre consultas! Você pode agendar, cancelar, reagendar ou ver seu histórico.',
      actions: [
        {
          type: 'navigate',
          label: 'Minhas Consultas',
          data: { screen: '/profile/appointments' }
        }
      ],
      suggestions: [
        'Agendar nova consulta',
        'Cancelar consulta',
        'Ver próximas consultas',
        'Histórico de consultas'
      ],
      confidence: 0.9
    };
  }

  private handleGeneralInquiry(message: string): AssistantResponse {
    return {
      message: 'Entendi que você tem uma dúvida. Posso te ajudar com agendamentos, informações sobre planos, consultas ou outros serviços. Pode ser mais específico?',
      suggestions: [
        'Agendar consulta',
        'Informações do plano',
        'Suporte técnico',
        'Falar com atendente'
      ],
      confidence: 0.6,
      needsHumanSupport: true
    };
  }

  /**
   * Métodos auxiliares
   */
  private async enrichUserContext(): Promise<void> {
    if (!this.context?.userId) return;

    try {
      // Carregar perfil completo do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', this.context.userId)
        .single();

      if (profile) {
        this.context.userProfile = profile;
      }

      // Carregar consultas recentes
      const { data: appointments } = await supabase
        .from('consultation_history')
        .select('*')
        .eq('beneficiary_id', this.context.beneficiaryUuid)
        .order('created_at', { ascending: false })
        .limit(5);

      if (appointments) {
        this.context.recentAppointments = appointments;
      }

    } catch (error) {
      logger.error('[AI Assistant] Erro ao enriquecer contexto:', error);
    }
  }

  private async loadMedicalKnowledgeBase(): Promise<void> {
    // Carregar base de conhecimento médico (simulado)
    // Em produção, isso seria carregado de uma fonte confiável
    logger.info('[AI Assistant] Base de conhecimento médico carregada');
  }

  private async loadUserPreferences(): Promise<void> {
    // Carregar preferências do usuário para personalização
    logger.info('[AI Assistant] Preferências do usuário carregadas');
  }

  private async saveConversation(userMsg: AssistantMessage, assistantMsg: AssistantMessage): Promise<void> {
    try {
      if (!this.context?.userId) return;

      await supabase
        .from('ai_conversations')
        .insert([
          {
            user_id: this.context.userId,
            user_message: userMsg.content,
            assistant_response: assistantMsg.content,
            intent: assistantMsg.metadata?.intent,
            confidence: assistantMsg.metadata?.confidence,
            created_at: new Date().toISOString()
          }
        ]);
    } catch (error) {
      logger.error('[AI Assistant] Erro ao salvar conversa:', error);
    }
  }

  /**
   * Limpar histórico de conversa
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Obter histórico de conversa
   */
  getHistory(): AssistantMessage[] {
    return [...this.conversationHistory];
  }
}

// Instância singleton
export const aiAssistant = new AiLunAssistant();
export default aiAssistant;