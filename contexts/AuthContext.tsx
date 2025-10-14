import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../services/supabase';
import { ensureBeneficiaryProfile } from '../services/userProfile';
import { getBeneficiaryByCPF } from '../services/beneficiary-plan-service';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;  
  beneficiaryUuid: string | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [beneficiaryUuid, setBeneficiaryUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
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
      
      // Buscar perfil no Supabase incluindo novos campos de beneficiário ativo
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*, is_active_beneficiary, plan_type, plan_details')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Verificar se é beneficiário ativo integrado ou buscar por CPF
      if (profileData?.is_active_beneficiary) {
        // Usuário é um beneficiário ativo - usar o próprio user ID como beneficiaryUuid
        setBeneficiaryUuid(userId);
      } else if (profileData?.cpf) {
        // Buscar beneficiário por CPF no novo sistema
        const beneficiary = await getBeneficiaryByCPF(profileData.cpf);
        if (beneficiary) {
          setBeneficiaryUuid(beneficiary.beneficiary_uuid);
        } else if (user?.email) {
          // Fallback para garantir beneficiário RapiDoc
          const beneficiaryResult = await ensureBeneficiaryProfile(
            userId,
            user.email,
            profileData?.full_name || 'Usuário Ailun',
            profileData?.phone || '',
            profileData.cpf,
            profileData?.birth_date || '1990-01-01'
          );

          if (beneficiaryResult.success) {
            setBeneficiaryUuid(beneficiaryResult.beneficiaryUuid);
          } else {
            console.error('Erro ao garantir beneficiário:', beneficiaryResult.error);
          }
        }
      } else if (user?.email) {
        // Usuário sem CPF - criar beneficiário padrão
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

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
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
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { error } = await supabase
      .from(\'user_profiles\')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (!error) {
        await loadProfile(user.id);
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    beneficiaryUuid,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}