export class DateUtils {
  /**
   * Converte data do formato brasileiro (dd/MM/yyyy) para ISO (yyyy-MM-dd)
   */
  static brazilianToIso(brazilianDate: string): string {
    const [day, month, year] = brazilianDate.split(
      '/'
    );
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  /**
   * Converte data do formato ISO (yyyy-MM-dd) para brasileiro (dd/MM/yyyy)
   */
  static isoToBrazilian(isoDate: string): string {
    const [year, month, day] = isoDate.split(
      '-'
    );
    return `${day}/${month}/${year}`;
  }

  /**
   * Formata data para exibição amigável
   */
  static formatForDisplay(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Adiciona dias a uma data
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Verifica se uma data é hoje
   */
  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Calcula diferença em dias entre duas datas
   */
  static daysDifference(date1: Date, date2: Date): number {
    const timeDifference = date2.getTime() - date1.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
  }
}

