import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface GuideStep {
  id: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  gradient: string[];
  title: string;
  description: string;
  tips: string[];
}

const guideSteps: GuideStep[] = [
  {
    id: 1,
    icon: 'waving-hand',
    iconColor: '#FFD700',
    gradient: ['#00B4DB', '#0083B0'],
    title: 'Bem-vindo à AiLun Saúde!',
    description: 'Sua saúde e bem-estar agora estão a um toque de distância. Vamos conhecer juntos como aproveitar ao máximo nossa plataforma.',
    tips: [
      'Acesso 24/7 a profissionais de saúde',
      'Consultas rápidas e seguras',
      'Histórico médico sempre disponível',
    ],
  },
  {
    id: 2,
    icon: 'medical-services',
    iconColor: '#FF6B6B',
    gradient: ['#FF6B6B', '#FF8E53'],
    title: 'Médico Imediato',
    description: 'Precisa de atendimento agora? Com o Médico Imediato, você se conecta com um clínico geral em poucos minutos, sem sair de casa.',
    tips: [
      'Atendimento em até 5 minutos',
      'Consultas ilimitadas incluídas no seu plano',
      'Receitas e atestados digitais',
    ],
  },
  {
    id: 3,
    icon: 'person-search',
    iconColor: '#4ECDC4',
    gradient: ['#4ECDC4', '#44A08D'],
    title: 'Especialistas',
    description: 'Agende consultas com cardiologistas, dermatologistas e outros especialistas de forma rápida e prática.',
    tips: [
      'Mais de 20 especialidades disponíveis',
      'Escolha o melhor horário para você',
      'Confirmação automática por e-mail',
    ],
  },
  {
    id: 4,
    icon: 'psychology',
    iconColor: '#A8E6CF',
    gradient: ['#A8E6CF', '#88D8A3'],
    title: 'Psicologia',
    description: 'Cuide da sua saúde mental com sessões de psicologia. Agende consultas com psicólogos qualificados e experientes.',
    tips: [
      'Sessões de 50 minutos',
      'Profissionais especializados',
      'Ambiente seguro e confidencial',
    ],
  },
  {
    id: 5,
    icon: 'restaurant',
    iconColor: '#FFB74D',
    gradient: ['#FFB74D', '#FFA726'],
    title: 'Nutrição',
    description: 'Alcance seus objetivos de saúde com planos alimentares personalizados criados por nutricionistas especializados.',
    tips: [
      'Planos alimentares personalizados',
      'Acompanhamento trimestral',
      'Orientação para dietas especiais',
    ],
  },
  {
    id: 6,
    icon: 'check-circle',
    iconColor: '#4CAF50',
    gradient: ['#4CAF50', '#45A049'],
    title: 'Tudo Pronto!',
    description: 'Agora você está pronto para aproveitar todos os benefícios da AiLun Saúde. Vamos começar?',
    tips: [
      'Explore o dashboard principal',
      'Acesse seu perfil a qualquer momento',
      'Visualize seu plano e histórico de consultas',
    ],
  },
];

export default function PlatformGuideScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [iconScaleAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    animateStep();
  }, [currentStep]);

  const animateStep = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    iconScaleAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: currentStep / (guideSteps.length - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = async () => {
    // Marcar que o usuário já viu o guia
    const { supabase } = await import('../../services/supabase');
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ has_seen_onboarding: true })
        .eq('id', user.id);
    }

    // Navegar para o dashboard
    router.replace('/dashboard');
  };

  const currentGuideStep = guideSteps[currentStep];
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient colors={currentGuideStep.gradient} style={styles.gradient}>
      <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        {/* Header com botão de pular */}
        <View style={styles.header}>
          <View style={{ width: 80 }} />
          <Text style={styles.stepIndicator}>
            {currentStep + 1} de {guideSteps.length}
          </Text>
          {currentStep < guideSteps.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Pular</Text>
            </TouchableOpacity>
          )}
          {currentStep === guideSteps.length - 1 && <View style={{ width: 80 }} />}
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        {/* Conteúdo do guia */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Ícone */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: iconScaleAnim }],
                },
              ]}
            >
              <MaterialIcons
                name={currentGuideStep.icon}
                size={80}
                color={currentGuideStep.iconColor}
              />
            </Animated.View>

            {/* Título */}
            <Text style={styles.title}>{currentGuideStep.title}</Text>

            {/* Descrição */}
            <Text style={styles.description}>{currentGuideStep.description}</Text>

            {/* Dicas */}
            <View style={styles.tipsContainer}>
              {currentGuideStep.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <MaterialIcons name="check-circle" size={24} color="#fff" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Botões de navegação */}
        <View style={styles.navigationContainer}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={handlePrevious} style={styles.previousButton}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.previousButtonText}>Anterior</Text>
            </TouchableOpacity>
          )}
          {currentStep === 0 && <View style={{ flex: 1 }} />}

          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>
              {currentStep === guideSteps.length - 1 ? 'Começar' : 'Próximo'}
            </Text>
            <MaterialIcons
              name={currentStep === guideSteps.length - 1 ? 'check' : 'arrow-forward'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Indicadores de passo (dots) */}
        <View style={styles.dotsContainer}>
          {guideSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 32,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipText: {
    fontSize: 15,
    color: '#fff',
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  previousButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B4DB',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#fff',
  },
});

