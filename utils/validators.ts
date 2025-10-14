export class Validators {
  /**
   * Valida CPF brasileiro
   */
  static isValidCpf(cpf: string): boolean {
    cpf = cpf.replace(/[^\d]/g, 
    '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
  }

  /**
   * Valida email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida telefone brasileiro
   */
  static isValidPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/[^\d]/g, 
    '');
    return /^[1-9]{2}9?[0-9]{8}$/.test(cleanPhone);
  }

  /**
   * Valida CEP brasileiro
   */
  static isValidZipCode(zipCode: string): boolean {
    const cleanZipCode = zipCode.replace(/[^\d]/g, 
    '');
    return /^[0-9]{8}$/.test(cleanZipCode);
  }

  /**
   * Valida UUID
   */
  static isValidUuid(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-
    9a-f]{12}$/i.test(uuid);
  }

  /**
   * Valida data no formato brasileiro
   */
  static isValidBrazilianDate(date: string): boolean {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
      return false;
    }
    const [day, month, year] = date.split(
      '/'
    ).map(Number);
    const dateObj = new Date(year, month - 1, day);
    return dateObj.getDate() === day &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getFullYear() === year;
  }

  /**
   * Valida data no formato ISO
   */
  static isValidIsoDate(date: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return false;
    }
    return !isNaN(Date.parse(date));
  }
}

