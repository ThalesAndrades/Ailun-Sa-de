import { supabase, UserProfile, HealthInfo, EmergencyContact, UserPreferences } from './supabase';

/**
 * Serviços de Banco de Dados do Supabase
 * Exemplos de operações CRUD para as principais tabelas
 */

// ==================== USER PROFILE ====================

// Criar ou atualizar perfil do usuário
export const upsertUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao salvar perfil:', error.message);
    return { success: false, error: error.message };
  }
};

// Buscar perfil do usuário
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== HEALTH INFO ====================

// Criar ou atualizar informações de saúde
export const upsertHealthInfo = async (userId: string, healthInfo: Partial<HealthInfo>) => {
  try {
    const { data, error } = await supabase
      .from('health_info')
      .upsert({
        user_id: userId,
        ...healthInfo,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao salvar informações de saúde:', error.message);
    return { success: false, error: error.message };
  }
};

// Buscar informações de saúde
export const getHealthInfo = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('health_info')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar informações de saúde:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== EMERGENCY CONTACTS ====================

// Adicionar contato de emergência
export const addEmergencyContact = async (userId: string, contact: Omit<EmergencyContact, 'id' | 'user_id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: userId,
        ...contact,
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao adicionar contato de emergência:', error.message);
    return { success: false, error: error.message };
  }
};

// Listar contatos de emergência
export const getEmergencyContacts = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar contatos de emergência:', error.message);
    return { success: false, error: error.message };
  }
};

// Remover contato de emergência
export const removeEmergencyContact = async (contactId: string) => {
  try {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao remover contato de emergência:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== USER PREFERENCES ====================

// Salvar preferências do usuário
export const saveUserPreferences = async (userId: string, preferences: Partial<UserPreferences>) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao salvar preferências:', error.message);
    return { success: false, error: error.message };
  }
};

// Buscar preferências do usuário
export const getUserPreferences = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Erro ao buscar preferências:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== REALTIME SUBSCRIPTIONS ====================

// Inscrever-se para mudanças em tempo real
export const subscribeToUserChanges = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`user_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
};

