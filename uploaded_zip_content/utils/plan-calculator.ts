export interface PlanConfig {
  includeSpecialists: boolean;
  includePsychology: boolean;
  includeNutrition: boolean;
  memberCount: number;
}

export interface PlanDetails {
  serviceType: 'G' | 'GS' | 'GSP';
  planName: string;
  basePrice: number;
  totalPrice: number;
  discountPercentage: number;
  memberCount: number;
  services: {
    clinical: boolean;
    specialists: boolean;
    psychology: boolean;
    nutrition: boolean;
  };
}

// Preços base dos serviços
const BASE_PRICES = {
  clinical: 29.90,        // Clínico sempre incluído
  specialists: 49.90,     // Especialistas
  psychology: 39.90,      // Psicologia
  nutrition: 29.90,       // Nutrição
};

// Descontos progressivos por quantidade de membros
const MEMBER_DISCOUNTS = [
  { min: 1, max: 1, discount: 0 },     // 1 pessoa: 0%
  { min: 2, max: 3, discount: 10 },    // 2-3 pessoas: 10%
  { min: 4, max: 6, discount: 15 },    // 4-6 pessoas: 15%
  { min: 7, max: 10, discount: 20 },   // 7-10 pessoas: 20%
];

export function calculatePlan(config: PlanConfig): PlanDetails {
  // Calcular preço base
  let basePrice = BASE_PRICES.clinical; // Clínico sempre incluído

  if (config.includeSpecialists) {
    basePrice += BASE_PRICES.specialists;
  }

  if (config.includePsychology) {
    basePrice += BASE_PRICES.psychology;
  }

  if (config.includeNutrition) {
    basePrice += BASE_PRICES.nutrition;
  }

  // Aplicar desconto por quantidade de membros
  const memberDiscount = MEMBER_DISCOUNTS.find(
    discount => config.memberCount >= discount.min && config.memberCount <= discount.max
  );

  const discountPercentage = memberDiscount?.discount || 0;
  const discountAmount = (basePrice * discountPercentage) / 100;
  const totalPrice = (basePrice - discountAmount) * config.memberCount;

  // Determinar tipo de serviço
  let serviceType: 'G' | 'GS' | 'GSP' = 'G';
  let planName = 'Plano Clínico';

  if (config.includeSpecialists && (config.includePsychology || config.includeNutrition)) {
    serviceType = 'GSP';
    planName = 'Plano Completo';
  } else if (config.includeSpecialists) {
    serviceType = 'GS';
    planName = 'Plano Clínico + Especialistas';
  }

  return {
    serviceType,
    planName,
    basePrice,
    totalPrice,
    discountPercentage,
    memberCount: config.memberCount,
    services: {
      clinical: true, // Sempre incluído
      specialists: config.includeSpecialists,
      psychology: config.includePsychology,
      nutrition: config.includeNutrition,
    },
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function getServiceTypeName(serviceType: string): string {
  switch (serviceType) {
    case 'G': return 'Plano Clínico';
    case 'GS': return 'Plano Clínico + Especialistas';
    case 'GSP': return 'Plano Completo';
    default: return 'Plano Personalizado';
  }
}

export function getDiscountText(memberCount: number): string {
  const discount = MEMBER_DISCOUNTS.find(
    d => memberCount >= d.min && memberCount <= d.max
  );
  
  if (!discount || discount.discount === 0) {
    return '';
  }
  
  return `${discount.discount}% de desconto por ter ${memberCount} ${memberCount === 1 ? 'membro' : 'membros'}`;
}