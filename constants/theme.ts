/**
 * Sistema de Design - Ailun Saúde
 * Padronização visual e componentes reutilizáveis
 */

// ==================== CORES ====================

export const Colors = {
  // Cores primárias
  primary: '#00B4DB',
  primaryDark: '#0083B0',
  secondary: '#4ECDC4',
  
  // Estados
  success: '#4CAF50',
  warning: '#FF9800', 
  error: '#F44336',
  info: '#2196F3',
  
  // Tons de cinza
  white: '#FFFFFF',
  gray50: '#F8F9FA',
  gray100: '#F5F5F5', 
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  black: '#000000',
  
  // Gradientes
  gradientPrimary: ['#00B4DB', '#0083B0'],
  gradientSecondary: ['#4ECDC4', '#44A08D'],
  gradientSuccess: ['#4CAF50', '#45A049'],
  gradientWarning: ['#FF9800', '#F57C00'],
  gradientError: ['#F44336', '#D32F2F'],
  
  // Serviços (cores específicas para cada tipo de consulta)
  services: {
    clinical: ['#FF6B6B', '#FF8E53'],    // Médico Agora
    specialist: ['#4ECDC4', '#44A08D'],  // Especialistas
    psychology: ['#A8E6CF', '#88D8A3'],  // Psicologia
    nutrition: ['#FFB74D', '#FFA726'],   // Nutrição
    emergency: ['#FF4757', '#FF3838'],   // Emergência
  },
  
  // Transparências
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  backdropBlur: 'rgba(255, 255, 255, 0.9)',
} as const;

// ==================== TIPOGRAFIA ====================

export const Typography = {
  // Tamanhos
  sizes: {
    xs: 12,
    sm: 14, 
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  // Pesos
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Altura da linha
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  
  // Famílias de fonte
  families: {
    system: 'System',
    mono: 'Menlo',
  },
} as const;

// ==================== ESPAÇAMENTO ====================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// ==================== BORDAS ====================

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// ==================== SOMBRAS ====================

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// ==================== COMPONENTES BASE ====================

export const Components = {
  // Botões
  button: {
    height: 56,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.xl,
  },
  
  buttonSmall: {
    height: 40,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.base,
  },
  
  // Cards
  card: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    ...Shadows.base,
  },
  
  // Inputs
  input: {
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.sizes.base,
  },
  
  // Headers
  header: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  
  // Modais
  modal: {
    backgroundColor: Colors.backdropBlur,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
} as const;

// ==================== ANIMAÇÕES ====================

export const Animations = {
  // Durações
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Tipos de easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
  
  // Valores comuns
  scale: {
    press: 0.95,
    hover: 1.05,
  },
  
  opacity: {
    hidden: 0,
    visible: 1,
  },
} as const;

// ==================== BREAKPOINTS ====================

export const Breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

// ==================== HELPERS ====================

export const getServiceColor = (serviceType: string): string[] => {
  switch (serviceType) {
    case 'clinical':
      return Colors.services.clinical;
    case 'specialist':
      return Colors.services.specialist;
    case 'psychology':
      return Colors.services.psychology;
    case 'nutrition':
      return Colors.services.nutrition;
    case 'emergency':
      return Colors.services.emergency;
    default:
      return Colors.gradientPrimary;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
    case 'success':
    case 'completed':
      return Colors.success;
    case 'warning':
    case 'pending':
      return Colors.warning;
    case 'error':
    case 'cancelled':
    case 'inactive':
      return Colors.error;
    case 'info':
    case 'scheduled':
      return Colors.info;
    default:
      return Colors.gray600;
  }
};

// ==================== TEMA PRINCIPAL ====================

export const Theme = {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Components,
  Animations,
  Breakpoints,
  
  // Helpers
  getServiceColor,
  getStatusColor,
} as const;

export default Theme;