import { supabase } from './supabase';

export interface BeneficiaryData {
  cpf: string;
  nome: string;
  status: string;
}

export const authService = {
  async verificarBeneficiarioAtivo(cpf: string): Promise<{ success: boolean; data?: BeneficiaryData; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('login_cpf', {
        body: { cpf },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.beneficiario) {
        return { success: true, data: data.beneficiario };
      }

      return { success: false, error: 'CPF não encontrado ou inativo' };
    } catch (error) {
      return { success: false, error: 'Erro ao verificar beneficiário' };
    }
  },
};
