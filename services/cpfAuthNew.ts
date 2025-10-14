import AsyncStorage from '@react-native-async-storage/async-storage';
import { RapidocApiAdapter } from './rapidoc-api-adapter';
import { auditService, AuditEventType, AuditEventStatus } from './audit-service';

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

    const result = await RapidocApiAdapter.getBeneficiaryByCPF(cpf);

    if (!result.success || !result.data) {
      console.log('[Auth] Erro ao buscar beneficiário:', result.error);
      return {
        success: false,
        error: result.error || 'CPF não encontrado no sistema.',
      };
    }

    const beneficiary = result.data as Beneficiary;
    console.log('[Auth] Beneficiário encontrado:', { name: beneficiary.name, isActive: beneficiary.isActive });

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
    console.error('[Auth] Tipo do erro:', error.constructor.name);
    console.error('[Auth] Mensagem do erro:', error.message);
    console.error('[Auth] Stack do erro:', error.stack);
    
    // Verificar se é um erro de rede (CORS, DNS, etc.)
    return {
      success: false,
      error: `Erro de comunicação com a Rapidoc: ${error.message || 'Verifique sua conexão com a internet.'}`,
    };
  }
};

/**
 * Valida se a senha corresponde aos 4 primeiros dígitos do CPF
 */
const validatePassword = (cpf: string, password: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  const first4Digits = cleanCPF.substring(0, 4);
  console.log('[Auth] Validando senha. Primeiros 4 dígitos do CPF:', first4Digits, 'Senha fornecida:', password);
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
    console.log('[Auth] ========== INÍCIO DO LOGIN ==========');
    auditService.logEvent(AuditEventType.LOGIN_ATTEMPT, AuditEventStatus.INFO, { cpf: cpf });
    console.log('[Auth] CPF recebido:', cpf);
    console.log('[Auth] Senha recebida:', password);

    // 1. Limpar CPF (remover pontos e traços)
    const cleanCPF = cpf.replace(/\D/g, '');
    console.log('[Auth] CPF limpo:', cleanCPF);

    // 2. Validar formato do CPF
    if (!validateCPFFormat(cleanCPF)) {
      console.log('[Auth] CPF inválido - não tem 11 dígitos');
      auditService.logEvent(AuditEventType.LOGIN_ATTEMPT, AuditEventStatus.FAIL, { cpf: cpf, reason: 'CPF inválido' });
      return {
        success: false,
        error: 'CPF inválido. Deve conter 11 dígitos.',
      };
    }

    // 3. Validar senha (4 primeiros dígitos do CPF)
    if (!validatePassword(cleanCPF, password)) {
      console.log('[Auth] Senha incorreta');
      auditService.logEvent(AuditEventType.LOGIN_ATTEMPT, AuditEventStatus.FAIL, { cpf: cpf, reason: 'Senha incorreta' });
      return {
        success: false,
        error: 'Senha incorreta. A senha deve ser os 4 primeiros dígitos do CPF.',
      };
    }

    console.log('[Auth] Validações iniciais OK. Buscando beneficiário na RapiDoc...');
    
    // 4. Buscar beneficiário na RapiDoc
    const beneficiaryResult = await getBeneficiaryByCPF(cleanCPF);
    
    if (!beneficiaryResult.success || !beneficiaryResult.data) {
      console.log('[Auth] Falha ao buscar beneficiário:', beneficiaryResult.error);
      auditService.logEvent(AuditEventType.LOGIN_ATTEMPT, AuditEventStatus.FAIL, { cpf: cpf, reason: beneficiaryResult.error || 'Beneficiário não encontrado' });
      return {
        success: false,
        error: beneficiaryResult.error || 'CPF não encontrado no sistema.',
      };
    }

    const beneficiary = beneficiaryResult.data;
    console.log('[Auth] Beneficiário autenticado com sucesso:', beneficiary.name);
    auditService.logEvent(AuditEventType.LOGIN_SUCCESS, AuditEventStatus.SUCCESS, { beneficiaryUuid: beneficiary.uuid, cpf: cleanCPF });

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
    console.log('[Auth] Sessão criada com sucesso');
    console.log('[Auth] ========== FIM DO LOGIN ==========');

    return {
      success: true,
      data: session,
    };
  } catch (error) {
     console.error('[Auth] Erro no login:', error);
    auditService.logEvent(AuditEventType.LOGIN_ATTEMPT, AuditEventStatus.FAIL, { cpf: cpf, reason: error.message || 'Erro desconhecido no login' });
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

