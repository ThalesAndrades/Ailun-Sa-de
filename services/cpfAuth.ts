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
  
  console.log('🔐 [validatePassword] Validando senha');
  console.log('📋 CPF fornecido:', cpfString);
  console.log('🔑 Senha fornecida:', passwordString);
  
  if (cpfString.length < 4) {
    console.log('❌ CPF muito curto para validação:', cpfString.length);
    return false;
  }
  
  const first4Digits = cpfString.substring(0, 4);
  const isValid = passwordString === first4Digits;
  
  console.log('🔢 Primeiros 4 dígitos do CPF:', first4Digits);
  console.log('✅ Senhas coincidem:', isValid);
  
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
  
  console.log('📋 [validateCPFFormat] Validando formato do CPF');
  console.log('📄 CPF original:', cpfString);
  console.log('🧹 CPF limpo:', cleaned);
  console.log('📏 Comprimento:', cleaned.length);
  console.log('✅ Formato válido:', isValid);
  
  return isValid;
};

/**
 * Realiza login com CPF e senha
 */
export const loginWithCPF = async (cpf: string, password: string) => {
  try {
    console.log('🚀 [loginWithCPF] ========== INICIANDO PROCESSO DE LOGIN ==========');
    console.log('📄 CPF recebido:', cpf, '(tipo:', typeof cpf, ')');
    console.log('🔑 Senha recebida:', password, '(tipo:', typeof password, ')');
    
    // 1. Garantir que são strings e limpar CPF
    const cpfString = String(cpf || '').trim();
    const passwordString = String(password || '').trim();
    const cleanCPF = cpfString.replace(/\D/g, '');
    
    console.log('🧹 Dados processados:');
    console.log('  - CPF string:', cpfString);
    console.log('  - CPF limpo:', cleanCPF);
    console.log('  - Senha string:', passwordString);

    // 2. Validações básicas
    console.log('🔍 Executando validações básicas...');
    
    if (!cpfString) {
      console.log('❌ Validação falhou: CPF vazio');
      return {
        success: false,
        error: 'CPF é obrigatório.',
      };
    }

    if (!passwordString) {
      console.log('❌ Validação falhou: Senha vazia');
      return {
        success: false,
        error: 'Senha é obrigatória.',
      };
    }

    // 3. Validar formato do CPF
    console.log('📋 Validando formato do CPF...');
    if (!validateCPFFormat(cleanCPF)) {
      console.log('❌ Validação falhou: Formato de CPF inválido');
      return {
        success: false,
        error: `CPF deve ter exatamente 11 dígitos. Atual: ${cleanCPF.length} dígitos.`,
      };
    }
    console.log('✅ Formato do CPF válido');

    // 4. Validar senha (4 primeiros dígitos do CPF)
    console.log('🔐 Validando senha...');
    if (!validatePassword(cleanCPF, passwordString)) {
      console.log('❌ Validação falhou: Senha incorreta');
      return {
        success: false,
        error: 'Senha incorreta. A senha deve ser os 4 primeiros dígitos do CPF.',
      };
    }
    console.log('✅ Senha válida');

    console.log('🌐 Todas as validações passaram, buscando beneficiário na RapiDoc...');
    
    // 5. Buscar beneficiário na RapiDoc
    const beneficiaryResult = await getBeneficiaryByCPF(cleanCPF);
    
    console.log('📊 [loginWithCPF] Resultado da busca na RapiDoc:');
    console.log('  - Success:', beneficiaryResult.success);
    console.log('  - Error:', beneficiaryResult.error);
    console.log('  - Data:', beneficiaryResult.data);

    if (!beneficiaryResult.success) {
      console.log('❌ Beneficiário não encontrado na RapiDoc');
      console.log('📄 Mensagem de erro:', beneficiaryResult.error);
      
      // Mapear tipos de erro para mensagens mais amigáveis
      let errorMessage = beneficiaryResult.error || 'CPF não encontrado no sistema.';
      
      if (errorMessage.includes('conexão') || errorMessage.includes('network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Timeout na conexão. Tente novamente.';
      } else if (errorMessage.includes('servidor') || errorMessage.includes('server')) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    const beneficiary = beneficiaryResult.data;
    console.log('✅ Beneficiário encontrado na RapiDoc:');
    console.log('  - UUID:', beneficiary.uuid);
    console.log('  - Nome:', beneficiary.name);
    console.log('  - CPF:', beneficiary.cpf);
    console.log('  - Email:', beneficiary.email);
    console.log('  - Status:', beneficiary.status);

    // 6. Verificar se o beneficiário está ativo
    if (beneficiary.status && beneficiary.status !== 'active') {
      console.log('❌ Beneficiário inativo, status:', beneficiary.status);
      return {
        success: false,
        error: 'Beneficiário inativo. Entre em contato com o suporte.',
      };
    }
    console.log('✅ Beneficiário está ativo ou sem status definido');

    // 7. Criar sessão local
    console.log('💾 Criando sessão local...');
    const session: AuthSession = {
      beneficiaryUuid: beneficiary.uuid,
      cpf: cleanCPF,
      name: beneficiary.name,
      email: beneficiary.email || '',
      phone: beneficiary.phone || '',
      isAuthenticated: true,
      loginDate: new Date().toISOString(),
    };

    console.log('📝 Sessão criada:', {
      beneficiaryUuid: session.beneficiaryUuid,
      cpf: session.cpf,
      name: session.name,
      email: session.email,
      loginDate: session.loginDate
    });

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(session));
    console.log('💾 Sessão salva no AsyncStorage');

    console.log('🎉 [loginWithCPF] ========== LOGIN REALIZADO COM SUCESSO ==========');
    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error('💥 [loginWithCPF] ========== ERRO NO PROCESSO DE LOGIN ==========');
    console.error('❌ Erro:', error);
    console.error('🔍 Detalhes:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      name: error instanceof Error ? error.name : 'Erro',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : 'N/A'
    });
    
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