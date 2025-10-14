import AsyncStorage from '@react-native-async-storage/async-storage';
import { RAPIDOC_CONFIG } from '../config/rapidoc.config';

const AUTH_KEY = '@ailun_auth';
const RAPIDOC_BASE_URL = RAPIDOC_CONFIG.baseUrl;
const RAPIDOC_CONTENT_TYPE = RAPIDOC_CONFIG.contentType;

export interface AuthSession {
  beneficiaryUuid: string;
  cpf: string;
  name: string;
  email: string;
  phone: string;
  isAuthenticated: boolean;
  loginDate: string;
}

export interface Beneficiary {
  uuid: string;
  name: string;
  cpf: string;
  birthday: string;
  phone?: string;
  email?: string;
  zipCode?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentType?: 'S' | 'A';
  serviceType?: 'G' | 'P' | 'GP' | 'GS' | 'GSP';
  isActive: boolean;
  createdAt: string;
  clientId: string;
}

/**
 * Busca beneficiário por CPF na API RapiDoc
 */
const getBeneficiaryByCPF = async (cpf: string): Promise<{ success: boolean; data?: Beneficiary; error?: string }> => {
  try {
    console.log('[Auth] Buscando beneficiário por CPF:', cpf);

    const response = await fetch(`${RAPIDOC_BASE_URL}/beneficiaries?cpf=${cpf}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RAPIDOC_CONFIG.token}`,
        'clientId': RAPIDOC_CONFIG.clientId,
        'Content-Type': RAPIDOC_CONTENT_TYPE,
      },
    });

    console.log('[Auth] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Auth] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('[Auth] Dados recebidos:', data);

    if (!data.success) {
      return {
        success: false,
        error: data.message || 'Erro ao buscar beneficiário',
      };
    }

    // A API retorna um array de beneficiários
    const beneficiaries = data.beneficiaries || [];
    const beneficiary = beneficiaries.find((b: Beneficiary) => b.cpf === cpf);

    if (!beneficiary) {
      return {
        success: false,
        error: 'CPF não encontrado no sistema.',
      };
    }

    if (!beneficiary.isActive) {
      return {
        success: false,
        error: 'Beneficiário inativo. Entre em contato com o suporte.',
      };
    }

    return {
      success: true,
      data: beneficiary,
    };
  } catch (error: any) {
    console.error('[Auth] Erro ao buscar beneficiário:', error);
    return {
      success: false,
      error: 'Erro de conexão com o servidor. Verifique sua internet.',
    };
  }
};

/**
 * Valida se a senha corresponde aos 4 primeiros dígitos do CPF
 */
const validatePassword = (cpf: string, password: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
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
    console.log('[Auth] Iniciando login com CPF');

    // 1. Limpar CPF (remover pontos e traços)
    const cleanCPF = cpf.replace(/\D/g, '');
    console.log('[Auth] CPF limpo:', cleanCPF);

    // 2. Validar formato do CPF
    if (!validateCPFFormat(cleanCPF)) {
      console.log('[Auth] CPF inválido');
      return {
        success: false,
        error: 'CPF inválido. Deve conter 11 dígitos.',
      };
    }

    // 3. Validar senha (4 primeiros dígitos do CPF)
    if (!validatePassword(cleanCPF, password)) {
      console.log('[Auth] Senha incorreta');
      return {
        success: false,
        error: 'Senha incorreta. A senha deve ser os 4 primeiros dígitos do CPF.',
      };
    }

    console.log('[Auth] Buscando beneficiário na RapiDoc...');
    // 4. Buscar beneficiário na RapiDoc
    const beneficiaryResult = await getBeneficiaryByCPF(cleanCPF);
    console.log('[Auth] Resultado da busca:', beneficiaryResult);

    if (!beneficiaryResult.success || !beneficiaryResult.data) {
      return {
        success: false,
        error: beneficiaryResult.error || 'CPF não encontrado no sistema.',
      };
    }

    const beneficiary = beneficiaryResult.data;

    // 5. Criar sessão local
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
    console.error('[Auth] Erro no login:', error);
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
    console.error('[Auth] Erro ao obter sessão:', error);
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
    console.error('[Auth] Erro ao fazer logout:', error);
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
    console.error('[Auth] Erro ao atualizar sessão:', error);
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

