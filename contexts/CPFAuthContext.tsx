import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { getCurrentSession, logout as logoutService, AuthSession } from '../services/cpfAuthNew';
import { ensureBeneficiaryProfile } from '../services/userProfile';

export interface CPFAuthContextType {
  session: AuthSession | null;
  beneficiaryUuid: string | null;
  user: {
    name: string;
    cpf: string;
    email: string;
    phone: string;
  } | null;
  loading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const CPFAuthContext = createContext<CPFAuthContextType | undefined>(undefined);

export function CPFAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    try {
      const currentSession = await getCurrentSession();
      setSession(currentSession);
      
      // Se há sessão ativa, garantir que o beneficiário existe no sistema
      if (currentSession?.isAuthenticated) {
        await ensureBeneficiaryInSystem(currentSession);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  };

  const ensureBeneficiaryInSystem = async (sessionData: AuthSession) => {
    try {
      // Verificar se o beneficiário precisa ser registrado no sistema Supabase
      // (para logs de consultas, notificações, etc.)
      const result = await ensureBeneficiaryProfile(
        sessionData.beneficiaryUuid, // Usar como userId
        sessionData.email,
        sessionData.name,
        sessionData.phone,
        sessionData.cpf,
        '' // birth_date seria coletado no onboarding
      );

      if (result.success) {
        // Beneficiário garantido no sistema
      } else {
        console.error('Erro ao garantir beneficiário:', result.error);
      }
    } catch (error) {
      console.error('Erro ao garantir beneficiário no sistema:', error);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutService();
      setSession(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    await checkSession();
  };

  const value: CPFAuthContextType = {
    session,
    beneficiaryUuid: session?.beneficiaryUuid || null,
    user: session ? {
      name: session.name,
      cpf: session.cpf,
      email: session.email,
      phone: session.phone,
    } : null,
    loading,
    isAuthenticated: !!session?.isAuthenticated,
    logout,
    refreshSession,
  };

  return (
    <CPFAuthContext.Provider value={value}>
      {children}
    </CPFAuthContext.Provider>
  );
}