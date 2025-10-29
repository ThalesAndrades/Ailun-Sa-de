import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../services/supabase';
import { ensureBeneficiaryProfile } from '../services/userProfile';

/**
 * Hook personalizado para gerenciar autenticação
 * Uso: const { user, session, loading, signIn, signOut, profile } = useAuth();
 */

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  beneficiaryUuid: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [beneficiaryUuid, setBeneficiaryUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setBeneficiaryUuid(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Buscar perfil no Supabase
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Garantir que o usuário tem um beneficiário RapiDoc
      if (user?.email) {
        const beneficiaryResult = await ensureBeneficiaryProfile(
          userId,
          user.email,
          profileData?.full_name || 'Usuário Ailun',
          profileData?.phone || '',
          '', // CPF - seria coletado no onboarding
          profileData?.birth_date || '1990-01-01'
        );

        if (beneficiaryResult.success) {
          setBeneficiaryUuid(beneficiaryResult.beneficiaryUuid);
        } else {
          console.error('Erro ao garantir beneficiário:', beneficiaryResult.error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      setBeneficiaryUuid(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!error) {
        await loadProfile(user.id);
      }

      return { success: !error, error: error?.message };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  return {
    user,
    session,
    profile,
    beneficiaryUuid,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };
};

