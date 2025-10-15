/**
 * Utilitários para cálculo de planos de saúde
 */

export interface PlanCalculationInput {
  includeSpecialists: boolean;
  includePsychology: boolean;
  includeNutrition: boolean;
  memberCount: number;
}

export interface PlanCalculationResult {
  basePrice: number;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  totalPrice: number;
  serviceType: string;
  planName: string;
}

// Preços base dos serviços (por pessoa/mês)
const SERVICE_PRICES = {
  clinical: 59.90,      // Clínico geral 24h (sempre incluído)
  specialists: 30.00,   // Especialistas
  psychology: 40.00,    // Psicologia
  nutrition: 25.00,     // Nutrição
};

// Tabela de descontos por quantidade de membros
const DISCOUNT_TABLE = [
  { minMembers: 1, maxMembers: 1, discount: 0 },
  { minMembers: 2, maxMembers: 2, discount: 5 },
  { minMembers: 3, maxMembers: 4, discount: 10 },
  { minMembers: 5, maxMembers: 6, discount: 15 },
  { minMembers: 7, maxMembers: Infinity, discount: 20 },
];

/**
 * Calcular preço do plano baseado nos serviços selecionados
 */
export function calculatePlan(input: PlanCalculationInput): PlanCalculationResult {
  // Preço base por pessoa (sempre inclui clínico geral)
  let basePrice = SERVICE_PRICES.clinical;
  
  // Adicionar serviços opcionais
  if (input.includeSpecialists) {
    basePrice += SERVICE_PRICES.specialists;
  }
  
  if (input.includePsychology) {
    basePrice += SERVICE_PRICES.psychology;
  }
  
  if (input.includeNutrition) {
    basePrice += SERVICE_PRICES.nutrition;
  }
  
  // Subtotal (preço base × número de membros)
  const subtotal = basePrice * input.memberCount;
  
  // Calcular desconto baseado no número de membros
  const discountPercentage = getDiscountPercentage(input.memberCount);
  const discountAmount = (subtotal * discountPercentage) / 100;
  
  // Preço final
  const totalPrice = subtotal - discountAmount;
  
  // Determinar tipo de serviço e nome do plano
  const serviceType = determineServiceType(input);
  const planName = generatePlanName(input);
  
  return {
    basePrice,
    subtotal,
    discountPercentage,
    discountAmount,
    totalPrice,
    serviceType,
    planName,
  };
}

/**
 * Determinar percentual de desconto baseado no número de membros
 */
function getDiscountPercentage(memberCount: number): number {
  for (const tier of DISCOUNT_TABLE) {
    if (memberCount >= tier.minMembers && memberCount <= tier.maxMembers) {
      return tier.discount;
    }
  }
  return 0;
}

/**
 * Determinar tipo de serviço para integração com backend
 */
function determineServiceType(input: PlanCalculationInput): string {
  // Sempre GS (Grupo Saúde) para todos os planos
  return 'GS';
}

/**
 * Gerar nome do plano baseado nos serviços incluídos
 */
function generatePlanName(input: PlanCalculationInput): string {
  const services = ['Clínico'];
  
  if (input.includeSpecialists) {
    services.push('Especialistas');
  }
  
  if (input.includePsychology) {
    services.push('Psicologia');
  }
  
  if (input.includeNutrition) {
    services.push('Nutrição');
  }
  
  const serviceName = services.join(' + ');
  
  if (input.memberCount === 1) {
    return `Plano ${serviceName}`;
  } else {
    return `Plano ${serviceName} Família (${input.memberCount} membros)`;
  }
}

/**
 * Formatar valor monetário em Real brasileiro
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Calcular economia anual baseada no desconto
 */
export function calculateYearlySavings(discountAmount: number): number {
  return discountAmount * 12;
}

/**
 * Verificar se o plano inclui determinado serviço
 */
export function includesService(
  input: PlanCalculationInput,
  service: 'clinical' | 'specialists' | 'psychology' | 'nutrition'
): boolean {
  switch (service) {
    case 'clinical':
      return true; // Sempre incluído
    case 'specialists':
      return input.includeSpecialists;
    case 'psychology':
      return input.includePsychology;
    case 'nutrition':
      return input.includeNutrition;
    default:
      return false;
  }
}

/**
 * Obter detalhes de um serviço específico
 */
export function getServiceDetails(service: keyof typeof SERVICE_PRICES) {
  const details = {
    clinical: {
      name: 'Clínico Geral 24h',
      description: 'Consultas ilimitadas com médicos generalistas',
      frequency: 'Ilimitado',
      icon: 'medical-services',
    },
    specialists: {
      name: 'Especialistas',
      description: 'Acesso a mais de 20 especialidades médicas',
      frequency: 'Conforme necessidade',
      icon: 'local-hospital',
    },
    psychology: {
      name: 'Psicologia',
      description: 'Acompanhamento psicológico profissional',
      frequency: '2 consultas por mês',
      icon: 'psychology',
    },
    nutrition: {
      name: 'Nutrição',
      description: 'Orientação nutricional personalizada',
      frequency: '1 consulta a cada 3 meses',
      icon: 'restaurant',
    },
  };
  
  return {
    ...details[service],
    price: SERVICE_PRICES[service],
    formattedPrice: formatCurrency(SERVICE_PRICES[service]),
  };
}