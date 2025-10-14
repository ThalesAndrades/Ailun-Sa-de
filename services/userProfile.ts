import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
  has_seen_onboarding: boolean;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Garantir que o beneficiário existe no sistema Supabase
 * (Para logs, notificações, etc.)
 */
export async function ensureBeneficiaryProfile(
  userId: string,
  email: string,
  fullName: string,
  phone?: string,
  cpf?: string,
  birthDate?: string
): Promise<{ success: boolean; beneficiaryUuid: string; error?: string }> {
  try {
    // Verificar se já existe profile
    const { data: existingProfile, error: selectError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }

    if (existingProfile) {
      return { 
        success: true, 
        beneficiaryUuid: userId 
      };
    }

    // Criar profile se não existir
    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        phone: phone?.replace(/\D/g, ''),
        birth_date: birthDate,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Profile criado para beneficiário
    return { 
      success: true, 
      beneficiaryUuid: userId 
    };

  } catch (error: any) {
    console.error('Erro ao garantir profile do beneficiário:', error);
    return { 
      success: false, 
      beneficiaryUuid: userId,
      error: error.message 
    };
  }
}

/**
 * Obter perfil do usuário
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
}

/**
 * Atualizar perfil do usuário
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Marcar que o usuário viu o onboarding
 */
export async function markOnboardingSeen(userId: string): Promise<{ success: boolean; error?: string }> {
  return updateUserProfile(userId, { has_seen_onboarding: true });
}

/**
 * Marcar que o usuário aceitou os termos de uso
 */
export async function acceptTerms(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Usar a função SQL que criamos
    const { error } = await supabase
      .rpc('accept_terms', { user_id_param: userId });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao aceitar termos:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verificar se o usuário já aceitou os termos
 */
export async function hasAcceptedTerms(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId);
    return profile?.terms_accepted || false;
  } catch (error) {
    console.error('Erro ao verificar termos aceitos:', error);
    return false;
  }
}