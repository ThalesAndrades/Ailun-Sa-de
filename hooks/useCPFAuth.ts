import { useState, useEffect } from 'react';
import { getCurrentSession, logout as logoutService, AuthSession } from '../services/cpfAuth';

/**
 * Hook personalizado para gerenciar autenticação baseada em CPF
 */
export const useCPFAuth = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    const currentSession = await getCurrentSession();
    setSession(currentSession);
    setLoading(false);
  };

  const logout = async () => {
    await logoutService();
    setSession(null);
  };

  const refreshSession = async () => {
    await checkSession();
  };

  return {
    session,
    loading,
    isAuthenticated: !!session?.isAuthenticated,
    beneficiaryUuid: session?.beneficiaryUuid || null,
    user: session ? {
      name: session.name,
      cpf: session.cpf,
      email: session.email,
      phone: session.phone,
    } : null,
    logout,
    refreshSession,
  };
};

