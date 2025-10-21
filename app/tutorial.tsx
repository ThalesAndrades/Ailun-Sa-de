import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity, 
  StyleSheet,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

const tutorialSteps = [
  {
    id: 1,
    title: 'Cuidado Médico Instantâneo',
    subtitle: 'Conectado via RapiDoc API',
    description: 'Nosso app está integrado com a plataforma RapiDoc para conectar você imediatamente com clínicos gerais ou agendar consultas com especialistas qualificados.',
    features: [
      { icon: 'medical-services', title: 'Médico Agora', desc: 'Consulta imediata 24/7 via RapiDoc' },
      { icon: 'person-search', title: 'Especialistas', desc: 'Cardiologistas, dermatologistas e mais' }
    ],
    gradient: ['#FF6B6B', '#FF8E53'],
    bgGradient: ['#FFE4E1', '#FFF0F0']
  },
  {
    id: 2,
    title: 'Saúde Mental e Nutricional',
    subtitle: 'Profissionais certificados pela RapiDoc',
    description: 'Cuide da sua mente e corpo com profissionais especializados. Todos os serviços são orquestrados através da nossa integração com a API RapiDoc.',
    features: [
      { icon: 'psychology', title: 'Psicólogos', desc: 'Apoio profissional integrado via RapiDoc' },
      { icon: 'restaurant', title: 'Nutricionistas', desc: 'Planos alimentares personalizados' }
    ],
    gradient: ['#4ECDC4', '#44A08D'],
    bgGradient: ['#E8F8F5', '#F0FFFE']
  },
  {
    id: 3,
    title: 'Bem-vindo ao Ailun Saúde!',
    subtitle: 'Tecnologia RapiDoc integrada',
    description: 'Tudo pronto! Você agora tem acesso a cuidados médicos de qualidade através da nossa integração avançada com a plataforma RapiDoc.',
    features: [
      { icon: 'cloud', title: 'RapiDoc Integration', desc: 'API profissional para serviços médicos' },
      { icon: 'receipt', title: 'Receitas Digitais', desc: 'Prescrições seguras e práticas' },
      { icon: 'history', title: 'Histórico Completo', desc: 'Todos seus dados médicos organizados' },
      { icon: 'security', title: 'Segurança Total', desc: 'Seus dados protegidos e privados' }
    ],
    gradient: ['#667eea', '#764ba2'],
    bgGradient: ['#E8EAFF', '#F0F2FF']
  }
];

export default function TutorialScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const step = Math.round(x / width);
    if (step !== currentStep) {
      setCurrentStep(step);
      // Animate content change
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const goToStep = (step: number) => {
    scrollViewRef.current?.scrollTo({ x: step * width, animated: true });
    setCurrentStep(step);
  };

  const handleFinish = () => {
    router.replace('/onboarding/step1');
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <LinearGradient 
      colors={currentStepData.bgGradient as unknown as readonly [string, ...string[]]} 
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source="https://cdn-ai.onspace.ai/onspace/project/image/ksdz89BjSWxDET66Tbtsxc/instories_926E70A0-81FF-43ED-878A-889EE40D615D.png"
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        
        <View style={styles.stepIndicators}>
          {tutorialSteps.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.stepDot,
                index === currentStep && styles.stepDotActive,
                { backgroundColor: index === currentStep ? currentStepData.gradient[0] : '#DDD' }
              ]}
              onPress={() => goToStep(index)}
            />
          ))}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {tutorialSteps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <View style={styles.titleSection}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>

              <View style={styles.featuresContainer}>
                {step.features.map((feature, featureIndex) => (
                  <View key={featureIndex} style={styles.featureCard}>
                    <LinearGradient
                      colors={step.gradient as unknown as readonly [string, ...string[]]}
                      style={styles.featureGradient}
                    >
                      <View style={styles.featureIconContainer}>
                        <MaterialIcons 
                          name={feature.icon as any} 
                          size={28} 
                          color="white" 
                        />
                      </View>
                      
                      <View style={styles.featureContent}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>{feature.desc}</Text>
                      </View>

                      <View style={styles.featureArrow}>
                        <MaterialIcons name="arrow-forward" size={20} color="white" />
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>

              {step.id === 3 && (
                <View style={styles.welcomeSection}>
                  <View style={styles.welcomeCard}>
                    <MaterialIcons name="celebration" size={40} color={step.gradient[0]} />
                    <Text style={styles.welcomeText}>
                      Parabéns! Você está pronto para cuidar da sua saúde com a melhor tecnologia médica integrada via RapiDoc.
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.navigationButtons}>
          {currentStep > 0 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => goToStep(currentStep - 1)}
            >
              <MaterialIcons name="arrow-back" size={24} color={currentStepData.gradient[0]} />
              <Text style={[styles.backButtonText, { color: currentStepData.gradient[0] }]}>
                Anterior
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.spacer} />
          
          {currentStep < tutorialSteps.length - 1 ? (
            <TouchableOpacity 
              style={[styles.nextButton, { backgroundColor: currentStepData.gradient[0] }]}
              onPress={() => goToStep(currentStep + 1)}
            >
              <Text style={styles.nextButtonText}>Próximo</Text>
              <MaterialIcons name="arrow-forward" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.finishButton, { backgroundColor: currentStepData.gradient[0] }]}
              onPress={handleFinish}
            >
              <MaterialIcons name="check-circle" size={24} color="white" />
              <Text style={styles.finishButtonText}>Começar Cadastro!</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 60,
    height: 60,
  },
  stepIndicators: {
    flexDirection: 'row',
    gap: 12,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DDD',
  },
  stepDotActive: {
    width: 30,
    borderRadius: 6,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: width,
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flex: 1,
    gap: 16,
  },
  featureCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featureArrow: {
    marginLeft: 12,
  },
  welcomeSection: {
    marginTop: 20,
  },
  welcomeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});