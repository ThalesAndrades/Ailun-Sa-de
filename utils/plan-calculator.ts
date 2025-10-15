/**
 * Utilitários para cálculo de planos e preços
 */

export interface PlanCalculationInput {
  includeSpecialists: boolean;
  includePsychology: boolean;
  includeNutrition: boolean;
  memberCount: number;
}

export interface PlanCalculationResult {
  basePrice: number;
  specialistsPrice: number;
  psychologyPrice: number;
  nutritionPrice: number;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  totalPrice: number;
  serviceType: string;
  planName: string;
}

// Preços base dos serviços
const PRICES = {
  BASE: 59.90, // Clínico geral
  SPECIALISTS: 30.00,
  PSYCHOLOGY: 40.00,
  NUTRITION: 25.00,
} as const;

// Tabela de descontos por quantidade de membros
const MEMBER_DISCOUNTS = [
  { min: 1, max: 1, discount: 0 },
  { min: 2, max: 2, discount: 5 },
  { min: 3, max: 4, discount: 10 },
  { min: 5, max: 6, discount: 15 },
  { min: 7, max: 999, discount: 20 },
] as const;

/**
 * Calcular plano baseado nas seleções do usuário
 */
export function calculatePlan(input: PlanCalculationInput): PlanCalculationResult {
  // Preço base sempre incluído
  let basePrice = PRICES.BASE;
  
  // Preços dos add-ons
  const specialistsPrice = input.includeSpecialists ? PRICES.SPECIALISTS : 0;
  const psychologyPrice = input.includePsychology ? PRICES.PSYCHOLOGY : 0;
  const nutritionPrice = input.includeNutrition ? PRICES.NUTRITION : 0;
  
  // Subtotal antes do desconto
  const subtotal = basePrice + specialistsPrice + psychologyPrice + nutritionPrice;
  
  // Calcular desconto baseado na quantidade de membros
  const discountPercentage = getDiscountPercentage(input.memberCount);
  const discountAmount = (subtotal * discountPercentage) / 100;
  
  // Preço final
  const totalPrice = subtotal - discountAmount;
  
  // Determinar tipo de serviço e nome do plano
  const serviceType = determineServiceType(input);
  const planName = determinePlanName(input);
  
  return {
    basePrice,
    specialistsPrice,
    psychologyPrice,
    nutritionPrice,
    subtotal,
    discountPercentage,
    discountAmount,
    totalPrice: Math.round(totalPrice * 100) / 100, // Arredondar para 2 casas decimais
    serviceType,
    planName,
  };
}

/**
 * Obter percentual de desconto baseado na quantidade de membros
 */
export function getDiscountPercentage(memberCount: number): number {
  const discountTier = MEMBER_DISCOUNTS.find(
    tier => memberCount >= tier.min && memberCount <= tier.max
  );
  
  return discountTier?.discount || 0;
}

/**
 * Determinar tipo de serviço baseado nas seleções
 */
function determineServiceType(input: PlanCalculationInput): string {
  if (input.includeSpecialists && input.includePsychology && input.includeNutrition) {
    return 'GS_COMPLETO'; // Geral + Especialistas + Psicologia + Nutrição
  }
  
  if (input.includeSpecialists && input.includePsychology) {
    return 'GS_PLUS'; // Geral + Especialistas + Psicologia
  }
  
  if (input.includeSpecialists && input.includeNutrition) {
    return 'GS_NUTRI'; // Geral + Especialistas + Nutrição
  }
  
  if (input.includeSpecialists) {
    return 'GS'; // Geral + Especialistas
  }
  
  if (input.includePsychology && input.includeNutrition) {
    return 'G_PLUS'; // Geral + Psicologia + Nutrição
  }
  
  if (input.includePsychology) {
    return 'G_PSI'; // Geral + Psicologia
  }
  
  if (input.includeNutrition) {
    return 'G_NUTRI'; // Geral + Nutrição
  }
  
  return 'G'; // Apenas Geral
}

/**
 * Determinar nome do plano baseado nas seleções
 */
function determinePlanName(input: PlanCalculationInput): string {
  const services = ['Clínico Geral'];
  
  if (input.includeSpecialists) {
    services.push('Especialistas');
  }
  
  if (input.includePsychology) {
    services.push('Psicologia');
  }
  
  if (input.includeNutrition) {
    services.push('Nutrição');
  }
  
  if (services.length === 1) {
    return 'Plano Básico';
  }
  
  if (services.length === 2) {
    return 'Plano Essencial';
  }
  
  if (services.length === 3) {
    return 'Plano Avançado';
  }
  
  return 'Plano Completo';
}

/**
 * Formatar valor monetário para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Calcular economia com desconto
 */
export function calculateSavings(subtotal: number, discountPercentage: number): {
  savingsAmount: number;
  savingsText: string;
} {
  const savingsAmount = (subtotal * discountPercentage) / 100;
  const savingsText = discountPercentage > 0 
    ? `Economia de ${formatCurrency(savingsAmount)} (${discountPercentage}% de desconto)`
    : '';
  
  return {
    savingsAmount,
    savingsText,
  };
}

/**
 * Obter detalhes dos serviços incluídos
 */
export function getIncludedServices(input: PlanCalculationInput): Array<{
  name: string;
  description: string;
  price: number;
  included: boolean;
}> {
  return [
    {
      name: 'Clínico Geral 24h',
      description: 'Consultas ilimitadas com médicos generalistas',
      price: PRICES.BASE,
      included: true,
    },
    {
      name: 'Especialistas',
      description: 'Acesso a mais de 20 especialidades médicas',
      price: PRICES.SPECIALISTS,
      included: input.includeSpecialists,
    },
    {
      name: 'Psicologia',
      description: '2 consultas por mês com psicólogos',
      price: PRICES.PSYCHOLOGY,
      included: input.includePsychology,
    },
    {
      name: 'Nutrição',
      description: '1 consulta a cada 3 meses com nutricionista',
      price: PRICES.NUTRITION,
      included: input.includeNutrition,
    },
  ];
}

/**
 * Validar configuração do plano
 */
export function validatePlanConfiguration(input: PlanCalculationInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (input.memberCount < 1) {
    errors.push('Número de membros deve ser pelo menos 1');
  }
  
  if (input.memberCount > 20) {
    errors.push('Número máximo de membros é 20');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Comparar planos
 */
export function comparePlans(plan1: PlanCalculationInput, plan2: PlanCalculationInput): {
  cheaperPlan: 1 | 2 | 'equal';
  priceDifference: number;
  comparison: string;
} {
  const result1 = calculatePlan(plan1);
  const result2 = calculatePlan(plan2);
  
  const priceDifference = Math.abs(result1.totalPrice - result2.totalPrice);
  
  let cheaperPlan: 1 | 2 | 'equal';
  if (result1.totalPrice < result2.totalPrice) {
    cheaperPlan = 1;
  } else if (result2.totalPrice < result1.totalPrice) {
    cheaperPlan = 2;
  } else {
    cheaperPlan = 'equal';
  }
  
  const comparison = cheaperPlan === 'equal'
    ? 'Os planos têm o mesmo preço'
    : `O plano ${cheaperPlan} é ${formatCurrency(priceDifference)} mais barato`;
  
  return {
    cheaperPlan,
    priceDifference,
    comparison,
  };
}