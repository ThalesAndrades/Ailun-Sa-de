import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBeneficiaryByCPF } from './rapidoc';

const AUTH_KEY = '@ailun_auth';

export interface AuthSession {
  beneficiaryUuid: string;
  cpf: string;
  name: string;
  email: string;
  phone: string;
  isAuthenticated: boolean;
  loginDate: string;
}

/**
 * Valida se a senha corresponde aos 4 primeiros dígitos do CPF
 */
const validatePassword = (cpf: string, password: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
  const first4Digits = cleanCPF.substring(0, 4);
  return password === first4Digits;
};

/**
 * Valida formato básico do CPF (11 dígitos)
 */
const validateCPFFormat = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11;
};

/**
 * Realiza login com CPF e senha
 */
export const loginWithCPF = async (cpf: string, password: string) => {
  try {
    console.log('[Login] Iniciando login com CPF');
    
    // 1. Limpar CPF (remover pontos e traços)
    const cleanCPF = cpf.replace(/\D/g, '');
    console.log('[Login] CPF limpo:', cleanCPF);

    // 2. Validar formato do CPF
    if (!validateCPFFormat(cleanCPF)) {
      console.log('[Login] CPF inválido');
      return {
        success: false,
        error: 'CPF inválido. Deve conter 11 dígitos.',
      };
    }

    // 3. Validar senha (4 primeiros dígitos do CPF)
    if (!validatePassword(cleanCPF, password)) {
      console.log('[Login] Senha incorreta');
      return {
        success: false,
        error: 'Senha incorreta. A senha deve ser os 4 primeiros dígitos do CPF.',
      };
    }

    console.log('[Login] Buscando beneficiário na RapiDoc...');
    // 4. Buscar beneficiário na RapiDoc
    const beneficiaryResult = await getBeneficiaryByCPF(cleanCPF);
    console.log('[Login] Resultado da busca:', beneficiaryResult);

    if (!beneficiaryResult.success) {
      return {
        success: false,
        error: beneficiaryResult.error || 'CPF não encontrado no sistema.',
      };
    }

    const beneficiary = beneficiaryResult.data;

    // 5. Verificar se o beneficiário está ativo
    if (beneficiary.status && beneficiary.status !== 'active') {
      return {
        success: false,
        error: 'Beneficiário inativo. Entre em contato com o suporte.',
      };
    }

    // 6. Criar sessão local
    const session: AuthSession = {
      beneficiaryUuid: beneficiary.uuid,
      cpf: cleanCPF,
      name: beneficiary.name,
      email: beneficiary.email || '',
      phone: beneficiary.phone || '',
      isAuthenticated: true,
      loginDate: new Date().toISOString(),
    };

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(session));

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      success: false,
      error: 'Erro ao realizar login. Tente novamente.',
    };
  }
};

/**
 * Obtém a sessão atual do usuário
 */
export const getCurrentSession = async (): Promise<AuthSession | null> => {
  try {
    const sessionData = await AsyncStorage.getItem(AUTH_KEY);
    if (!sessionData) return null;

    const session: AuthSession = JSON.parse(sessionData);
    return session;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
};

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return session?.isAuthenticated || false;
};

/**
 * Realiza logout
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    return { success: true };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { success: false, error: 'Erro ao fazer logout.' };
  }
};

/**
 * Atualiza dados da sessão
 */
export const updateSession = async (updates: Partial<AuthSession>) => {
  try {
    const currentSession = await getCurrentSession();
    if (!currentSession) {
      return { success: false, error: 'Nenhuma sessão ativa.' };
    }

    const updatedSession = { ...currentSession, ...updates };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedSession));

    return { success: true, data: updatedSession };
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return { success: false, error: 'Erro ao atualizar sessão.' };
  }
};

/**
 * Formata CPF para exibição (123.456.789-00)
 */
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

