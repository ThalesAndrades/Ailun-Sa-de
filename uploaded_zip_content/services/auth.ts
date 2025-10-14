import { supabase } from './supabase';

/**
 * Serviços de Autenticação do Supabase
 * Exemplos de uso para login, registro e gerenciamento de sessão
 */

// Registrar novo usuário
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao registrar:', error.message);
    return { success: false, error: error.message };
  }
};

// Login com email e senha
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao fazer login:', error.message);
    return { success: false, error: error.message };
  }
};

// Logout
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao fazer logout:', error.message);
    return { success: false, error: error.message };
  }
};

// Obter usuário atual
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { success: true, user };
  } catch (error: any) {
    console.error('Erro ao obter usuário:', error.message);
    return { success: false, error: error.message };
  }
};

// Obter sessão atual
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session };
  } catch (error: any) {
    console.error('Erro ao obter sessão:', error.message);
    return { success: false, error: error.message };
  }
};

// Resetar senha
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'ailun://reset-password',
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao resetar senha:', error.message);
    return { success: false, error: error.message };
  }
};

// Atualizar senha
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar senha:', error.message);
    return { success: false, error: error.message };
  }
};

// Listener para mudanças de autenticação
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

