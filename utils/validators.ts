/**
 * Utilitários de validação para formulários
 */

/**
 * Validar CPF
 */
export function isValidCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  
  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Validar email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim().toLowerCase());
}

/**
 * Validar telefone
 */
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Validar data de nascimento
 */
export function isValidBirthDate(date: string): boolean {
  if (!date) return false;
  
  const birthDate = new Date(date);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  
  // Deve ter pelo menos 16 anos e no máximo 120 anos
  return age >= 16 && age <= 120;
}

/**
 * Validar data brasileira (DD/MM/AAAA)
 */
export function isValidBrazilianDate(date: string): boolean {
  if (!date) return false;
  
  // Verificar formato DD/MM/AAAA
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = date.match(dateRegex);
  
  if (!match) return false;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  // Verificar se a data é válida
  const birthDate = new Date(year, month - 1, day);
  
  if (
    birthDate.getDate() !== day ||
    birthDate.getMonth() !== month - 1 ||
    birthDate.getFullYear() !== year
  ) {
    return false;
  }
  
  // Verificar idade (16 a 120 anos)
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 16 && age - 1 <= 120;
  }
  
  return age >= 16 && age <= 120;
}

/**
 * Validar CEP
 */
export function isValidZipCode(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
}

/**
 * Validar cartão de crédito (Algoritmo de Luhn)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleanNumber)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Validar CVV do cartão
 */
export function isValidCvv(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv);
}

/**
 * Validar mês de expiração
 */
export function isValidExpiryMonth(month: string): boolean {
  const monthNum = parseInt(month, 10);
  return monthNum >= 1 && monthNum <= 12;
}

/**
 * Validar ano de expiração
 */
export function isValidExpiryYear(year: string): boolean {
  if (year.length !== 4) return false;
  
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  
  return yearNum >= currentYear && yearNum <= currentYear + 20;
}

/**
 * Validar nome completo
 */
export function isValidFullName(name: string): boolean {
  const trimmedName = name.trim();
  const words = trimmedName.split(' ').filter(word => word.length > 0);
  
  // Deve ter pelo menos 2 palavras e cada palavra deve ter pelo menos 2 caracteres
  return words.length >= 2 && words.every(word => word.length >= 2);
}

/**
 * Validar senha
 */
export function isValidPassword(password: string): boolean {
  // Pelo menos 6 caracteres
  return password.length >= 6;
}

/**
 * Validar número de endereço
 */
export function isValidAddressNumber(number: string): boolean {
  const trimmed = number.trim();
  return trimmed.length > 0 && /^[0-9A-Za-z\-\s]+$/.test(trimmed);
}

/**
 * Formatar CPF
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formatar telefone
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Formatar CEP
 */
export function formatZipCode(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Máscara de cartão de crédito
 */
export function formatCreditCard(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  return cleanNumber
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4}) (\d{4})(\d)/, '$1 $2 $3')
    .replace(/(\d{4}) (\d{4}) (\d{4})(\d)/, '$1 $2 $3 $4');
}

/**
 * Detectar bandeira do cartão
 */
export function getCardBrand(cardNumber: string): string {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6/.test(cleanNumber)) return 'discover';
  if (/^35/.test(cleanNumber)) return 'jcb';
  
  return 'unknown';
}

/**
 * Validar todos os campos obrigatórios
 */
export function validateRequiredFields(fields: Record<string, any>): string[] {
  const errors: string[] = [];
  
  Object.entries(fields).forEach(([key, value]) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`Campo ${key} é obrigatório`);
    }
  });
  
  return errors;
}

/**
 * Sanitizar entrada de texto
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove caracteres HTML básicos
    .replace(/\s+/g, ' '); // Remove espaços extras
}

/**
 * Validar dados do cartão completos
 */
export function validateCreditCardData(data: {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!isValidFullName(data.holderName)) {
    errors.push('Nome do portador inválido');
  }
  
  if (!isValidCreditCard(data.number)) {
    errors.push('Número do cartão inválido');
  }
  
  if (!isValidExpiryMonth(data.expiryMonth)) {
    errors.push('Mês de expiração inválido');
  }
  
  if (!isValidExpiryYear(data.expiryYear)) {
    errors.push('Ano de expiração inválido');
  }
  
  if (!isValidCvv(data.cvv)) {
    errors.push('CVV inválido');
  }
  
  // Verificar se o cartão não está expirado
  const currentDate = new Date();
  const expiryDate = new Date(parseInt(data.expiryYear), parseInt(data.expiryMonth) - 1);
  
  if (expiryDate < currentDate) {
    errors.push('Cartão expirado');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}