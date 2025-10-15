/**
 * Utilitários de validação para formulários
 */

/**
 * Validar CPF brasileiro
 */
export function isValidCpf(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  if (parseInt(cleanCpf.charAt(9)) !== digit1) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  return parseInt(cleanCpf.charAt(10)) === digit2;
}

/**
 * Validar e-mail
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validar telefone brasileiro
 */
export function isValidPhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (fixo ou celular)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Validar CEP brasileiro
 */
export function isValidZipCode(zipCode: string): boolean {
  // Remove caracteres não numéricos
  const cleanZip = zipCode.replace(/\D/g, '');
  
  // Verifica se tem exatamente 8 dígitos
  return cleanZip.length === 8;
}

/**
 * Validar data no formato brasileiro DD/MM/AAAA
 */
export function isValidBrazilianDate(dateString: string): boolean {
  // Verifica formato DD/MM/AAAA
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) return false;
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  // Verifica se os valores são válidos
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  // Verifica se a data é válida (considera anos bissextos, etc.)
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Validar idade mínima
 */
export function isValidAge(dateString: string, minAge: number = 0): boolean {
  if (!isValidBrazilianDate(dateString)) return false;
  
  const [day, month, year] = dateString.split('/').map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
}

/**
 * Validar se string tem comprimento mínimo
 */
export function hasMinLength(text: string, minLength: number): boolean {
  return text.trim().length >= minLength;
}

/**
 * Validar se string tem comprimento máximo
 */
export function hasMaxLength(text: string, maxLength: number): boolean {
  return text.trim().length <= maxLength;
}

/**
 * Validar se string contém apenas letras e espaços
 */
export function isValidName(name: string): boolean {
  const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  return nameRegex.test(name.trim()) && name.trim().length >= 2;
}

/**
 * Validar número de cartão de crédito (algoritmo de Luhn)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  // Remove espaços e hífens
  const cleanNumber = cardNumber.replace(/[\s-]/g, '');
  
  // Verifica se contém apenas números
  if (!/^\d+$/.test(cleanNumber)) return false;
  
  // Verifica comprimento (13-19 dígitos)
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);
    
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
 * Validar mês de expiração do cartão
 */
export function isValidExpiryMonth(month: string): boolean {
  const monthNum = parseInt(month, 10);
  return monthNum >= 1 && monthNum <= 12;
}

/**
 * Validar ano de expiração do cartão
 */
export function isValidExpiryYear(year: string): boolean {
  const currentYear = new Date().getFullYear();
  const yearNum = parseInt(year, 10);
  
  // Aceita anos de 2 ou 4 dígitos
  const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
  
  return fullYear >= currentYear && fullYear <= currentYear + 20;
}

/**
 * Validar data de expiração completa do cartão
 */
export function isValidExpiryDate(month: string, year: string): boolean {
  if (!isValidExpiryMonth(month) || !isValidExpiryYear(year)) {
    return false;
  }
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const expiryYear = parseInt(year, 10) < 100 ? 2000 + parseInt(year, 10) : parseInt(year, 10);
  const expiryMonth = parseInt(month, 10);
  
  if (expiryYear > currentYear) return true;
  if (expiryYear === currentYear && expiryMonth >= currentMonth) return true;
  
  return false;
}