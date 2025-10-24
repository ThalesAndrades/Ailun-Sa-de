/**
 * Hook para Autenticação de Beneficiários Ativos
 * Integra o sistema de autenticação otimizado para beneficiários
 */

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { 
  authenticateActiveBeneficiary,
  getCurrentBeneficiaryStatus,
  checkActiveBeneficiary,
  resetBeneficiaryPassword,
  validateCPF,
  type AuthenticationResult,
  type ActiveBeneficiaryData 
} from '../services/active-beneficiary-auth';
import { 
  authenticateWithRapidoc,
  checkRapidocCPF 
} from '../services/rapidoc-auth';
import { logger } from '../utils/logger';
import { showTemplateMessage } from '../utils/alertHelpers';
import { MessageTemplates } from '../constants/messageTemplates';

export interface UseActiveBeneficiaryAuthResult {
  // Estados
  loading: boolean;
  isAuthenticated: boolean;
  beneficiary: ActiveBeneficiaryData | null;
  user: any | null;
  
  // Funções de autenticação
  loginWithCPF: (cpf: string, password: string) => Promise<AuthenticationResult>;
  checkBeneficiary: (cpf: string) => Promise<boolean>;
  resetPassword: (cpf: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
  logout: () => Promise<void>;
  
  // Utilidades
  formatCPF: (cpf: string) => string;
  validateCPFFormat: (cpf: string) => boolean;
}

export function useActiveBeneficiaryAuth(): UseActiveBeneficiaryAuthResult {
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [beneficiary, setBeneficiary] = useState<ActiveBeneficiaryData | null>(null);
  const [user, setUser] = useState<any | null>(null);

  /**
   * Login com CPF e senha
   */
  const loginWithCPF = useCallback(async (cpf: string, password: string): Promise<AuthenticationResult> => {
    setLoading(true);
    
    try {
      logger.info('[useActiveBeneficiaryAuth] Iniciando login com CPF');
      
      // Validar formato do CPF
      const cpfValidation = validateCPF(cpf);
      if (!cpfValidation.isValid) {
        return {
          success: false,
          error: 'CPF inválido. Verifique o formato.'
        };
      }

      const numericCPF = cpf.replace(/\D/g, '');
      
      // Primeiro, tentar autenticar via RapiDoc
      logger.info('[useActiveBeneficiaryAuth] Tentando autenticação via RapiDoc');
      const rapidocResult = await authenticateWithRapidoc(numericCPF, password);
      
      if (rapidocResult.success) {
        logger.info('[useActiveBeneficiaryAuth] Autenticação RapiDoc bem-sucedida');
        
        // Converter resultado RapiDoc para formato AuthenticationResult
        const result: AuthenticationResult = {
          success: true,
          data: {
            beneficiary: rapidocResult.beneficiary as any,
            user: rapidocResult.user,
          },
          requiresOnboarding: rapidocResult.requiresOnboarding,
          requiresSubscription: false,
        };
        
        if (result.success && result.data) {
          setBeneficiary(result.data.beneficiary);
          setUser(result.data.user);
          setIsAuthenticated(true);
          
          if (result.requiresOnboarding) {
            showTemplateMessage(MessageTemplates.auth.loginSuccess(result.data.beneficiary.full_name));
            setTimeout(() => router.replace('/onboarding/platform-guide'), 1500);
          } else {
            showTemplateMessage(MessageTemplates.auth.loginSuccess(result.data.beneficiary.full_name));
            setTimeout(() => router.replace('/dashboard'), 1500);
          }
        }
        
        return result;
      }
      
      // Se RapiDoc falhar, tentar autenticação local
      logger.info('[useActiveBeneficiaryAuth] RapiDoc falhou, tentando autenticação local');
      const result = await authenticateActiveBeneficiary(numericCPF, password);
      
      if (result.success && result.data) {
        setBeneficiary(result.data.beneficiary);
        setUser(result.data.user);
        setIsAuthenticated(true);
        
        // Determinar rota de redirecionamento
        if (result.requiresSubscription) {
          showTemplateMessage({
            title: '⚠️ Plano Inativo',
            message: 'Sua assinatura está inativa. Complete ou renove seu plano.',
            type: 'warning'
          });
          setTimeout(() => router.replace('/subscription/inactive'), 1500);
        } else if (result.requiresOnboarding) {
          showTemplateMessage(MessageTemplates.auth.loginSuccess(result.data.beneficiary.full_name));
          setTimeout(() => router.replace('/onboarding/platform-guide'), 1500);
        } else {
          showTemplateMessage(MessageTemplates.auth.loginSuccess(result.data.beneficiary.full_name));
          setTimeout(() => router.replace('/dashboard'), 1500);
        }
        
        logger.info('[useActiveBeneficiaryAuth] Login realizado com sucesso');
      } else {
        logger.warn('[useActiveBeneficiaryAuth] Falha no login:', result.error);
        
        if (result.requiresSubscription) {
          showTemplateMessage({
            title: '⚠️ Cadastro Incompleto',
            message: 'Complete seu cadastro para acessar o aplicativo.',
            type: 'warning'
          });
          setTimeout(() => router.replace('/signup/welcome'), 1500);
        }
      }
      
      return result;
    } catch (error: any) {
      logger.error('[useActiveBeneficiaryAuth] Erro no login:', error);
      return {
        success: false,
        error: 'Erro interno durante o login'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verificar se CPF é de beneficiário ativo
   */
  const checkBeneficiary = useCallback(async (cpf: string): Promise<boolean> => {
    try {
      const numericCPF = cpf.replace(/\D/g, '');
      const result = await checkActiveBeneficiary(numericCPF);
      return result.isActive;
    } catch (error) {
      logger.error('[useActiveBeneficiaryAuth] Erro ao verificar beneficiário:', error);
      return false;
    }
  }, []);

  /**
   * Reset de senha
   */
  const resetPassword = useCallback(async (cpf: string): Promise<void> => {
    try {
      const numericCPF = cpf.replace(/\D/g, '');
      const result = await resetBeneficiaryPassword(numericCPF);
      
      if (result.success) {
        showTemplateMessage({
          title: '🔑 Senha Recuperada',
          message: result.message,
          type: 'info'
        });
      } else {
        showTemplateMessage({
          title: '❌ Erro',
          message: result.message,
          type: 'error'
        });
      }
    } catch (error) {
      logger.error('[useActiveBeneficiaryAuth] Erro no reset de senha:', error);
      showTemplateMessage(MessageTemplates.errors.generic);
    }
  }, []);

  /**
   * Atualizar status atual
   */
  const refreshStatus = useCallback(async (): Promise<void> => {
    setLoading(true);
    
    try {
      const status = await getCurrentBeneficiaryStatus();
      
      setIsAuthenticated(status.isAuthenticated);
      setBeneficiary(status.beneficiary || null);
      setUser(status.user || null);
      
      logger.info('[useActiveBeneficiaryAuth] Status atualizado:', { 
        isAuthenticated: status.isAuthenticated,
        hasBeneficiary: !!status.beneficiary 
      });
    } catch (error) {
      logger.error('[useActiveBeneficiaryAuth] Erro ao atualizar status:', error);
      setIsAuthenticated(false);
      setBeneficiary(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      const { supabase } = await import('../services/supabase');
      await supabase.auth.signOut();
      
      setIsAuthenticated(false);
      setBeneficiary(null);
      setUser(null);
      
      logger.info('[useActiveBeneficiaryAuth] Logout realizado');
    } catch (error) {
      logger.error('[useActiveBeneficiaryAuth] Erro no logout:', error);
    }
  }, []);

  /**
   * Formatar CPF
   */
  const formatCPF = useCallback((cpf: string): string => {
    const numericCPF = cpf.replace(/\D/g, '');
    if (numericCPF.length <= 11) {
      return numericCPF
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return cpf;
  }, []);

  /**
   * Validar formato do CPF
   */
  const validateCPFFormat = useCallback((cpf: string): boolean => {
    const validation = validateCPF(cpf);
    return validation.isValid;
  }, []);

  return {
    // Estados
    loading,
    isAuthenticated,
    beneficiary,
    user,
    
    // Funções
    loginWithCPF,
    checkBeneficiary,
    resetPassword,
    refreshStatus,
    logout,
    
    // Utilidades
    formatCPF,
    validateCPFFormat,
  };
}

export default useActiveBeneficiaryAuth;