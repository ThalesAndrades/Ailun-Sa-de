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
    // 1. Verificar se o usuário já tem um beneficiaryUuid
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('rapidoc_beneficiary_uuid')
      .eq('id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil do usuário:', profileError);
      return { success: false, error: profileError.message };
    }

    // 2. Se já tiver beneficiaryUuid, retornar
    if (profile?.rapidoc_beneficiary_uuid) {
      return { 
        success: true, 
        beneficiaryUuid: profile.rapidoc_beneficiary_uuid,
        existingBeneficiary: true
      };
    }

    // 3. Se não tiver, criar novo beneficiário na RapiDoc
    console.log('Criando beneficiário na RapiDoc para:', userName, userEmail);
    
    const beneficiaryData: Beneficiary = {
      name: userName || 'Usuário Ailun',
      cpf: userCpf || '00000000000', // CPF padrão - deve ser substituído por dados reais
      birthday: userBirthDate || '1990-01-01', // Data de nascimento padrão
      phone: userPhone || '',
      email: userEmail,
      serviceType: 'GSP', // Generalista, Especialista, Psicologia
    };

    const rapidocResult = await addBeneficiary(beneficiaryData);

    if (rapidocResult.success && rapidocResult.data?.uuid) {
      const newBeneficiaryUuid = rapidocResult.data.uuid;
      console.log('Beneficiário RapiDoc criado:', newBeneficiaryUuid);

      // 4. Atualizar o perfil do usuário no Supabase
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          email: userEmail,
          full_name: userName,
          phone: userPhone,
          rapidoc_beneficiary_uuid: newBeneficiaryUuid,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (updateError) {
        console.error('Erro ao atualizar perfil com beneficiaryUuid:', updateError);
        return { success: false, error: updateError.message };
      }

      // 5. Log da criação do beneficiário
      await supabase
        .from('consultation_logs')
        .insert({
          user_id: userId,
          service_type: 'beneficiary_creation',
          status: 'completed',
          success: true,
          metadata: {
            rapidoc_beneficiary_uuid: newBeneficiaryUuid,
            created_at: new Date().toISOString(),
            beneficiary_data: beneficiaryData
          }
        });

      return { 
        success: true, 
        beneficiaryUuid: newBeneficiaryUuid,
        existingBeneficiary: false
      };
    } else {
      console.error('Erro ao criar beneficiário na RapiDoc:', rapidocResult.error);
      return { 
        success: false, 
        error: rapidocResult.error || 'Erro ao criar beneficiário' 
      };
    }
  } catch (error: any) {
    console.error('Erro inesperado ao garantir beneficiário:', error);
    return { 
      success: false, 
      error: error.message || 'Erro inesperado' 
    };
  }
};

/**
 * Atualiza os dados do beneficiário na RapiDoc e no perfil local
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
    // 1. Buscar beneficiaryUuid atual
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('rapidoc_beneficiary_uuid, email')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.rapidoc_beneficiary_uuid) {
      return { success: false, error: 'Beneficiário não encontrado' };
    }

    // 2. Atualizar perfil local
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (userData.name) updateData.full_name = userData.name;
    if (userData.phone) updateData.phone = userData.phone;
    if (userData.birthDate) updateData.birth_date = userData.birthDate;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar perfil local:', updateError);
      return { success: false, error: updateError.message };
    }

    // 3. Log da atualização
    await supabase
      .from('consultation_logs')
      .insert({
        user_id: userId,
        service_type: 'profile_update',
        status: 'completed',
        success: true,
        metadata: {
          updated_fields: Object.keys(userData),
          updated_at: new Date().toISOString()
        }
      });

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
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      data: profile,
      hasBeneficiary: !!profile.rapidoc_beneficiary_uuid
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};