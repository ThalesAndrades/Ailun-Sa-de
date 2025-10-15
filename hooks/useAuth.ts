/**
 * Hook de Autenticação - AiLun Saúde
 * Sistema completo de autenticação com integração RapiDoc
 */

import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { 
  supabase, 
  UserProfile, 
  getCurrentSession,
  getCurrentUser,
  logAuditEvent,
  checkSupabaseConfig
} from '../services/supabase';
import { ensureBeneficiaryProfile } from '../services/userProfile';
import { rapidocService } from '../services/rapidoc';
import { ProductionLogger } from '../utils/production-logger';

interface UseAuthReturn {
  // Estado de autenticação
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  beneficiaryUuid: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Funções de autenticação
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  
  // Funções de perfil
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  
  // Estado da integração
  integrationStatus: {
    supabase: boolean;
    rapidoc: boolean;
    lastCheck: Date | null;
  };
  checkIntegrations: () => Promise<void>;
}

const logger = new ProductionLogger('useAuth');

export const useAuth = (): UseAuthReturn => {
  // Estados principais
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [beneficiaryUuid, setBeneficiaryUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado das integrações
  const [integrationStatus, setIntegrationStatus] = useState({
    supabase: false,
    rapidoc: false,
    lastCheck: null as Date | null,
  });

  // Inicialização
  useEffect(() => {
    initializeAuth();
  }, []);

  // Listener de mudanças de autenticação
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.info(`Auth state changed: ${event}`, { userId: session?.user?.id });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email!);
          await logAuditEvent('user_login', { 
            method: 'email_password',
            platform: Platform.OS 
          });
        } else {
          // Cleanup ao fazer logout
          setProfile(null);
          setBeneficiaryUuid(null);
          if (event === 'SIGNED_OUT') {
            await logAuditEvent('user_logout');
          }
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      logger.info('Inicializando autenticação');
      
      // Verificar configuração
      const config = checkSupabaseConfig();
      if (!config.isConfigured) {
        logger.error('Supabase não configurado corretamente', config);
        setLoading(false);
        return;
      }
      
      // Obter sessão inicial
      const session = await getCurrentSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id, session.user.email!);
      }
      
      // Verificar integrações
      await checkIntegrations();
      
    } catch (error: any) {
      logger.error('Erro na inicialização da autenticação', { error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      logger.info('Carregando perfil do usuário', { userId });
      
      // Buscar perfil no Supabase
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Erro ao carregar perfil', { error: error.message });
        return;
      }

      // Se perfil não existe, criar um básico
      if (!profileData) {
        const newProfile = {
          id: userId,
          email: email,
          full_name: email.split('@')[0], // Nome inicial baseado no email
          has_seen_onboarding: false,
          terms_accepted: false,
          is_active_beneficiary: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) {
          logger.error('Erro ao criar perfil', { error: createError.message });
          return;
        }

        setProfile(createdProfile);
        logger.info('Perfil criado com sucesso', { userId });
      } else {
        setProfile(profileData);
      }

      // Garantir beneficiário RapiDoc se CPF disponível
      if (profileData?.cpf) {
        const beneficiaryResult = await ensureBeneficiaryProfile(
          userId,
          email,
          profileData.full_name || email.split('@')[0],
          profileData.phone || '',
          profileData.cpf,
          profileData.birth_date || '1990-01-01'
        );

        if (beneficiaryResult.success) {
          setBeneficiaryUuid(beneficiaryResult.beneficiaryUuid);
          logger.info('Beneficiário RapiDoc garantido', { 
            beneficiaryUuid: beneficiaryResult.beneficiaryUuid 
          });
        } else {
          logger.warn('Falha ao garantir beneficiário RapiDoc', {
            error: beneficiaryResult.error
          });
        }
      }

    } catch (error: any) {
      logger.error('Erro ao carregar perfil do usuário', { 
        error: error.message,
        userId 
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      logger.info('Tentativa de login', { email });
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        logger.error('Erro no login', { error: error.message });
        await logAuditEvent('user_login_failed', { 
          email,
          error: error.message 
        }, 'error');
        
        return { 
          success: false, 
          error: getAuthErrorMessage(error.message) 
        };
      }

      logger.info('Login realizado com sucesso', { 
        userId: data.user?.id 
      });

      return { success: true };
      
    } catch (error: any) {
      logger.error('Erro inesperado no login', { error: error.message });
      return { 
        success: false, 
        error: 'Erro interno. Tente novamente.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      logger.info('Tentativa de cadastro', { email });
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: metadata || {
            full_name: email.split('@')[0],
          }
        }
      });

      if (error) {
        logger.error('Erro no cadastro', { error: error.message });
        await logAuditEvent('user_signup_failed', { 
          email,
          error: error.message 
        }, 'error');
        
        return { 
          success: false, 
          error: getAuthErrorMessage(error.message) 
        };
      }

      logger.info('Cadastro realizado com sucesso', { 
        userId: data.user?.id,
        needsConfirmation: !data.session
      });

      await logAuditEvent('user_signup_success', { 
        email,
        userId: data.user?.id 
      });

      return { success: true };
      
    } catch (error: any) {
      logger.error('Erro inesperado no cadastro', { error: error.message });
      return { 
        success: false, 
        error: 'Erro interno. Tente novamente.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      logger.info('Realizando logout');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Erro no logout', { error: error.message });
        throw error;
      }
      
      // Cleanup local
      setUser(null);
      setProfile(null);
      setSession(null);
      setBeneficiaryUuid(null);
      
      logger.info('Logout realizado com sucesso');
      
    } catch (error: any) {
      logger.error('Erro no logout', { error: error.message });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      logger.info('Atualizando perfil', { userId: user.id, fields: Object.keys(data) });
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        logger.error('Erro ao atualizar perfil', { error: error.message });
        return { success: false, error: error.message };
      }

      // Recarregar perfil
      await loadUserProfile(user.id, user.email!);
      
      await logAuditEvent('profile_updated', { 
        userId: user.id,
        updatedFields: Object.keys(data)
      });

      logger.info('Perfil atualizado com sucesso');
      return { success: true };
      
    } catch (error: any) {
      logger.error('Erro inesperado ao atualizar perfil', { error: error.message });
      return { success: false, error: error.message };
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user.id, user.email!);
    }
  }, [user]);

  const checkIntegrations = async () => {
    try {
      const results = {
        supabase: false,
        rapidoc: false,
        lastCheck: new Date(),
      };

      // Testar Supabase
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        results.supabase = !error;
      } catch {
        results.supabase = false;
      }

      // Testar RapiDoc
      try {
        const healthCheck = await rapidocService.checkHealth();
        results.rapidoc = healthCheck.status !== 'down';
      } catch {
        results.rapidoc = false;
      }

      setIntegrationStatus(results);
      
      logger.info('Verificação de integrações', {
        supabase: results.supabase,
        rapidoc: results.rapidoc
      });
      
    } catch (error: any) {
      logger.error('Erro na verificação de integrações', { error: error.message });
    }
  };

  // Mapear erros de autenticação para mensagens amigáveis
  const getAuthErrorMessage = (error: string): string => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Confirme seu email antes de fazer login',
      'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
      'User already registered': 'Este email já está cadastrado',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'Unable to validate email address': 'Email inválido',
    };

    return errorMap[error] || 'Erro de autenticação. Tente novamente.';
  };

  return {
    // Estado
    user,
    session,
    profile,
    beneficiaryUuid,
    loading,
    isAuthenticated: !!user,
    
    // Funções
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    
    // Integrações
    integrationStatus,
    checkIntegrations,
  };
};

export default useAuth;