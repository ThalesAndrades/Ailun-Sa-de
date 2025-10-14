/**
 * Utilitário para cálculo de planos personalizados da AiLun Saúde
 */

export interface PlanServices {
  clinico: boolean; // Sempre true (obrigatório)
  especialistas: boolean;
  psicologia: boolean;
  nutricao: boolean;
}

export interface PlanCalculation {
  services: PlanServices;
  membersCount: number;
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  totalPrice: number;
  pricePerMember: number;
  pricePerDay: number;
  pricePerDayPerMember: number;
  serviceType: 'G' | 'GS' | 'GSP';
  savings: number;
}

// Preços base dos serviços
const SERVICE_PRICES = {
  clinico: 29.90,
  especialistas: 19.90,
  psicologia: 59.90,
  nutricao: 59.90,
};

// Descontos por número de membros adicionais
const MEMBER_DISCOUNTS = {
  0: 0,    // Apenas 1 pessoa (titular)
  1: 0.10, // 1 membro adicional = 10%
  2: 0.20, // 2 membros adicionais = 20%
  3: 0.30, // 3+ membros adicionais = 30%
};

/**
 * Calcula o serviceType baseado nos serviços selecionados
 */
export function calculateServiceType(services: PlanServices): 'G' | 'GS' | 'GSP' {
  if (services.psicologia) {
    return 'GSP'; // Clínico + Especialistas + Psicologia
  }
  if (services.especialistas) {
    return 'GS'; // Clínico + Especialistas
  }
  return 'G'; // Apenas Clínico
}

/**
 * Calcula o preço base do plano (sem descontos)
 */
export function calculateBasePrice(services: PlanServices): number {
  let price = SERVICE_PRICES.clinico; // Sempre inclui clínico

  if (services.especialistas) {
    price += SERVICE_PRICES.especialistas;
  }
  if (services.psicologia) {
    price += SERVICE_PRICES.psicologia;
  }
  if (services.nutricao) {
    price += SERVICE_PRICES.nutricao;
  }

  return price;
}

/**
 * Calcula o desconto baseado no número de membros
 */
export function calculateDiscount(membersCount: number): number {
  const additionalMembers = Math.max(0, membersCount - 1);
  const discountKey = Math.min(additionalMembers, 3) as 0 | 1 | 2 | 3;
  return MEMBER_DISCOUNTS[discountKey];
}

/**
 * Calcula o plano completo com todos os valores
 */
export function calculatePlan(
  services: PlanServices,
  membersCount: number
): PlanCalculation {
  const basePrice = calculateBasePrice(services);
  const discountPercentage = calculateDiscount(membersCount);
  const discountAmount = basePrice * discountPercentage * membersCount;
  const totalPrice = (basePrice * membersCount) - discountAmount;
  const pricePerMember = totalPrice / membersCount;
  const pricePerDay = totalPrice / 30; // Considerando mês de 30 dias
  const pricePerDayPerMember = pricePerDay / membersCount;
  const serviceType = calculateServiceType(services);
  
  // Economia comparada ao preço sem desconto
  const priceWithoutDiscount = basePrice * membersCount;
  const savings = priceWithoutDiscount - totalPrice;

  return {
    services,
    membersCount,
    basePrice,
    discountPercentage,
    discountAmount,
    totalPrice,
    pricePerMember,
    pricePerDay,
    pricePerDayPerMember,
    serviceType,
    savings,
  };
}

/**
 * Formata valor em reais
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Gera mensagem persuasiva sobre o plano
 */
export function generatePersuasiveMessage(calculation: PlanCalculation): string {
  const { membersCount, pricePerDayPerMember, savings, discountPercentage } = calculation;

  let message = `Por apenas ${formatCurrency(pricePerDayPerMember)} por dia por pessoa`;

  if (membersCount > 1) {
    message += `, você e mais ${membersCount - 1} ${membersCount === 2 ? 'pessoa' : 'pessoas'} têm acesso completo à saúde`;
    
    if (discountPercentage > 0) {
      message += ` com ${(discountPercentage * 100).toFixed(0)}% de desconto (economize ${formatCurrency(savings)}/mês)`;
    }
  } else {
    message += `, você tem acesso completo à saúde`;
  }

  message += '!';
  return message;
}

/**
 * Gera descrição dos serviços incluídos
 */
export function getServicesDescription(services: PlanServices): string[] {
  const descriptions: string[] = [
    'Atendimento Médico 24h (Clínico Geral)',
  ];

  if (services.especialistas) {
    descriptions.push('Atendimento com Médicos Especialistas');
  }
  if (services.psicologia) {
    descriptions.push('Atendimento Psicológico (2 consultas/mês)');
  }
  if (services.nutricao) {
    descriptions.push('Atendimento com Nutricionista (1 consulta a cada 3 meses)');
  }

  return descriptions;
}

