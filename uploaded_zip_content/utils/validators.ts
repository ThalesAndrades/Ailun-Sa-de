/**
 * Valida um CPF brasileiro
 * @param cpf - CPF no formato XXX.XXX.XXX-XX ou XXXXXXXXXXX
 * @returns boolean - true se válido, false se inválido
 */
export function isValidCpf(cpf: string): boolean {
  if (!cpf) return false;
  
  // Remove pontos, hífens e espaços
  const cleanCpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCpf)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let firstDigit = remainder >= 10 ? 0 : remainder;
  
  if (parseInt(cleanCpf.charAt(9)) !== firstDigit) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let secondDigit = remainder >= 10 ? 0 : remainder;
  
  return parseInt(cleanCpf.charAt(10)) === secondDigit;
}

/**
 * Valida uma data no formato brasileiro DD/MM/YYYY
 * @param date - Data no formato DD/MM/YYYY
 * @returns boolean - true se válida, false se inválida
 */
export function isValidBrazilianDate(date: string): boolean {
  if (!date) return false;
  
  // Verifica formato básico DD/MM/YYYY
  const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = date.match(dateRegex);
  
  if (!match) return false;
  
  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  const year = parseInt(match[3]);
  
  // Verifica intervalos básicos
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  
  // Verifica dias válidos para cada mês
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Verifica ano bissexto
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  if (isLeapYear) {
    daysInMonth[1] = 29; // Fevereiro em ano bissexto
  }
  
  if (day > daysInMonth[month - 1]) return false;
  
  // Verifica se a data não é futura
  const inputDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Permite até o final do dia atual
  
  return inputDate <= today;
}

/**
 * Formata um CPF adicionando pontos e hífen
 * @param cpf - CPF sem formatação
 * @returns string - CPF formatado XXX.XXX.XXX-XX
 */
export function formatCpf(cpf: string): string {
  const cleanCpf = cpf.replace(/[^\d]/g, '');
  
  if (cleanCpf.length <= 11) {
    return cleanCpf
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  }
  
  return cpf;
}

/**
 * Formata uma data adicionando barras
 * @param date - Data sem formatação
 * @returns string - Data formatada DD/MM/YYYY
 */
export function formatBrazilianDate(date: string): string {
  const cleanDate = date.replace(/[^\d]/g, '');
  
  if (cleanDate.length <= 8) {
    return cleanDate
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2');
  }
  
  return date;
}