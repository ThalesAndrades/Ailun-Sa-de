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
  // Garantir que ambos são strings
  const cpfString = String(cpf || '').replace(/\D/g, ''); 
  const passwordString = String(password || '');
  
  if (cpfString.length < 4) {
    console.log('[validatePassword] CPF muito curto:', cpfString.length);
    return false;
  }
  
  const first4Digits = cpfString.substring(0, 4);
  const isValid = passwordString === first4Digits;
  
  console.log('[validatePassword] CPF:', cpfString);
  console.log('[validatePassword] Primeiros 4 dígitos:', first4Digits);
  console.log('[validatePassword] Senha fornecida:', passwordString);
  console.log('[validatePassword] Senhas coincidem:', isValid);
  
  return isValid;
};

/**
 * Valida formato básico do CPF (11 dígitos)
 */
const validateCPFFormat = (cpf: string): boolean => {
  // Garantir que é string e limpar
  const cpfString = String(cpf || '').trim();
  const cleaned = cpfString.replace(/\D/g, '');
  const isValid = cleaned.length === 11;
  
  console.log('[validateCPFFormat] CPF original:', cpfString);
  console.log('[validateCPFFormat] CPF limpo:', cleaned);
  console.log('[validateCPFFormat] Comprimento:', cleaned.length);
  console.log('[validateCPFFormat] É válido:', isValid);
  
  return isValid;
};

/**
 * Realiza login com CPF e senha
 */
export const loginWithCPF = async (cpf: string, password: string) => {
  try {
    console.log('[loginWithCPF] Iniciando login');
    console.log('[loginWithCPF] CPF recebido:', cpf, 'tipo:', typeof cpf);
    console.log('[loginWithCPF] Senha recebida:', password, 'tipo:', typeof password);
    
    // 1. Garantir que são strings e limpar CPF
    const cpfString = String(cpf || '').trim();
    const passwordString = String(password || '').trim();
    const cleanCPF = cpfString.replace(/\D/g, '');
    
    console.log('[loginWithCPF] CPF string:', cpfString);
    console.log('[loginWithCPF] CPF limpo:', cleanCPF);
    console.log('[loginWithCPF] Senha string:', passwordString);

    // 2. Validações básicas
    if (!cpfString) {
      console.log('[loginWithCPF] CPF vazio');
      return {
        success: false,
        error: 'CPF é obrigatório.',
      };
    }

    if (!passwordString) {
      console.log('[loginWithCPF] Senha vazia');
      return {
        success: false,
        error: 'Senha é obrigatória.',
      };
    }

    // 3. Validar formato do CPF
    if (!validateCPFFormat(cleanCPF)) {
      console.log('[loginWithCPF] Formato de CPF inválido');
      return {
        success: false,
        error: `CPF deve ter exatamente 11 dígitos. Atual: ${cleanCPF.length} dígitos.`,
      };
    }

    // 4. Validar senha (4 primeiros dígitos do CPF)
    if (!validatePassword(cleanCPF, passwordString)) {
      console.log('[loginWithCPF] Senha incorreta');
      return {
        success: false,
        error: 'Senha incorreta. A senha deve ser os 4 primeiros dígitos do CPF.',
      };
    }

    console.log('[loginWithCPF] Validações passaram, buscando beneficiário...');
    
    // 5. Buscar beneficiário na RapiDoc
    const beneficiaryResult = await getBeneficiaryByCPF(cleanCPF);
    console.log('[loginWithCPF] Resultado da busca de beneficiário:', beneficiaryResult);

    if (!beneficiaryResult.success) {
      console.log('[loginWithCPF] Beneficiário não encontrado');
      return {
        success: false,
        error: beneficiaryResult.error || 'CPF não encontrado no sistema.',
      };
    }

    const beneficiary = beneficiaryResult.data;
    console.log('[loginWithCPF] Beneficiário encontrado:', beneficiary);

    // 6. Verificar se o beneficiário está ativo
    if (beneficiary.status && beneficiary.status !== 'active') {
      console.log('[loginWithCPF] Beneficiário inativo:', beneficiary.status);
      return {
        success: false,
        error: 'Beneficiário inativo. Entre em contato com o suporte.',
      };
    }

    // 7. Criar sessão local
    const session: AuthSession = {
      beneficiaryUuid: beneficiary.uuid,
      cpf: cleanCPF,
      name: beneficiary.name,
      email: beneficiary.email || '',
      phone: beneficiary.phone || '',
      isAuthenticated: true,
      loginDate: new Date().toISOString(),
    };

    console.log('[loginWithCPF] Criando sessão:', session);
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(session));

    console.log('[loginWithCPF] Login realizado com sucesso');
    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error('[loginWithCPF] Erro no login:', error);
    return {
      success: false,
      error: 'Erro ao realizar login. Verifique sua conexão e tente novamente.',
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