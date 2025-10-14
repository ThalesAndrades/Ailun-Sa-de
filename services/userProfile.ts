import { supabase } from './supabase';
import { addBeneficiary, Beneficiary } from './rapidoc';

/**
 * Garante que o usuário tenha um beneficiaryUuid associado ao seu perfil
 * Se não tiver, cria um novo beneficiário na RapiDoc e atualiza o perfil
 */
export const ensureBeneficiaryProfile = async (
  userId: string, 
  userEmail: string, 
  userName: string = '', 
  userPhone: string = '',
  userCpf: string = '',
  userBirthDate: string = ''
) => {
  try {
    // 1. Verificar se o usuário já tem um perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil do usuário:', profileError);
      return { success: false, error: profileError.message };
    }

    // 2. Se já tiver perfil completo, retornar
    if (profile) {
      return { 
        success: true, 
        beneficiaryUuid: userId, // Usar o próprio userId como beneficiaryUuid
        existingBeneficiary: true
      };
    }

    // 3. Se não tiver perfil, criar
    console.log('Criando perfil para:', userName, userEmail);
    
    const { error: createError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userEmail,
        full_name: userName,
        phone: userPhone,
        birth_date: userBirthDate || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (createError) {
      console.error('Erro ao criar perfil:', createError);
      return { success: false, error: createError.message };
    }

    return { 
      success: true, 
      beneficiaryUuid: userId,
      existingBeneficiary: false
    };
  } catch (error: any) {
    console.error('Erro inesperado ao garantir beneficiário:', error);
    return { 
      success: false, 
      error: error.message || 'Erro inesperado' 
    };
  }
};

/**
 * Atualiza os dados do beneficiário no perfil local
 */
export const updateBeneficiaryProfile = async (
  userId: string,
  userData: {
    name?: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
  }
) => {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (userData.name) updateData.full_name = userData.name;
    if (userData.phone) updateData.phone = userData.phone;
    if (userData.birthDate) updateData.birth_date = userData.birthDate;

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar perfil local:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, message: 'Perfil atualizado com sucesso' };
  } catch (error: any) {
    console.error('Erro ao atualizar perfil do beneficiário:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Busca informações do beneficiário
 */
export const getBeneficiaryInfo = async (userId: string) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: profile,
      hasBeneficiary: true
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};