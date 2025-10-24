/**
 * Serviço de Autenticação com RapiDoc API
 * Permite login direto de usuários cadastrados na RapiDoc
 */

import { RAPIDOC_CONFIG } from '../config/rapidoc.config';
import { supabase } from './supabase';
import { logger } from '../utils/logger';
import { tokenService } from './tokenService';

export interface RapidocBeneficiary {
  id: string;
  cpf: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  service_type: string;
  status: string;
  is_active: boolean;
  beneficiary_uuid?: string;
}

export interface RapidocAuthResult {
  success: boolean;
  beneficiary?: RapidocBeneficiary;
  user?: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  requiresOnboarding?: boolean;
}

/**
 * Buscar beneficiário na API RapiDoc por CPF
 */
export async function fetchRapidocBeneficiaryByCPF(cpf: string): Promise<{
  success: boolean;
  beneficiary?: RapidocBeneficiary;
  error?: string;
}> {
  try {
    const numericCPF = cpf.replace(/\D/g, '');
    logger.info(`[RapidocAuth] Buscando beneficiário na RapiDoc: ${numericCPF.substring(0, 3)}***`);

    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[RapidocAuth] Erro na API RapiDoc:', errorText);
      return {
        success: false,
        error: `Erro na API RapiDoc: ${response.status}`,
      };
    }

    const data = await response.json();
    const beneficiaries = data.beneficiaries || [];
    
    // Buscar beneficiário por CPF
    const beneficiary = beneficiaries.find((b: any) => 
      b.cpf?.replace(/\D/g, '') === numericCPF
    );

    if (!beneficiary) {
      logger.info('[RapidocAuth] Beneficiário não encontrado na RapiDoc');
      return {
        success: false,
        error: 'CPF não encontrado no sistema RapiDoc',
      };
    }

    // Verificar se está ativo
    if (!beneficiary.is_active || beneficiary.status !== 'active') {
      logger.warn('[RapidocAuth] Beneficiário inativo na RapiDoc');
      return {
        success: false,
        error: 'Beneficiário inativo. Entre em contato com o suporte.',
      };
    }

    logger.info('[RapidocAuth] Beneficiário encontrado e ativo na RapiDoc');
    return {
      success: true,
      beneficiary: {
        id: beneficiary.id,
        cpf: beneficiary.cpf,
        full_name: beneficiary.full_name || beneficiary.name,
        email: beneficiary.email,
        phone: beneficiary.phone,
        birth_date: beneficiary.birth_date,
        service_type: beneficiary.service_type || 'G',
        status: beneficiary.status,
        is_active: beneficiary.is_active,
        beneficiary_uuid: beneficiary.uuid || beneficiary.id,
      },
    };
  } catch (error: any) {
    logger.error('[RapidocAuth] Erro ao buscar beneficiário:', error);
    return {
      success: false,
      error: 'Erro de conexão com a API RapiDoc',
    };
  }
}

/**
 * Sincronizar beneficiário da RapiDoc com Supabase
 */
async function syncRapidocBeneficiaryToSupabase(
  rapidocBeneficiary: RapidocBeneficiary
): Promise<{
  success: boolean;
  beneficiary?: any;
  error?: string;
}> {
  try {
    const numericCPF = rapidocBeneficiary.cpf.replace(/\D/g, '');
    
    logger.info('[RapidocAuth] Sincronizando beneficiário com Supabase');

    // Verificar se já existe no Supabase
    const { data: existingBeneficiary } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('cpf', numericCPF)
      .single();

    if (existingBeneficiary) {
      // Atualizar dados existentes
      const { data: updatedBeneficiary, error: updateError } = await supabase
        .from('beneficiaries')
        .update({
          full_name: rapidocBeneficiary.full_name,
          email: rapidocBeneficiary.email,
          phone: rapidocBeneficiary.phone,
          service_type: rapidocBeneficiary.service_type,
          status: 'active',
          has_active_plan: true,
          beneficiary_uuid: rapidocBeneficiary.beneficiary_uuid || existingBeneficiary.beneficiary_uuid,
          updated_at: new Date().toISOString(),
        })
        .eq('cpf', numericCPF)
        .select()
        .single();

      if (updateError) {
        logger.error('[RapidocAuth] Erro ao atualizar beneficiário:', updateError);
        return { success: false, error: 'Erro ao atualizar dados' };
      }

      logger.info('[RapidocAuth] Beneficiário atualizado no Supabase');
      return { success: true, beneficiary: updatedBeneficiary };
    } else {
      // Criar novo beneficiário
      const { data: newBeneficiary, error: insertError } = await supabase
        .from('beneficiaries')
        .insert({
          cpf: numericCPF,
          full_name: rapidocBeneficiary.full_name,
          email: rapidocBeneficiary.email,
          phone: rapidocBeneficiary.phone,
          birth_date: rapidocBeneficiary.birth_date,
          service_type: rapidocBeneficiary.service_type,
          status: 'active',
          has_active_plan: true,
          is_primary: true,
          beneficiary_uuid: rapidocBeneficiary.beneficiary_uuid || `rapidoc-${numericCPF}`,
        })
        .select()
        .single();

      if (insertError) {
        logger.error('[RapidocAuth] Erro ao criar beneficiário:', insertError);
        return { success: false, error: 'Erro ao criar beneficiário' };
      }

      logger.info('[RapidocAuth] Novo beneficiário criado no Supabase');
      return { success: true, beneficiary: newBeneficiary };
    }
  } catch (error: any) {
    logger.error('[RapidocAuth] Erro ao sincronizar beneficiário:', error);
    return { success: false, error: 'Erro interno ao sincronizar dados' };
  }
}

/**
 * Criar ou obter usuário Supabase para beneficiário RapiDoc
 */
async function getOrCreateSupabaseUser(
  rapidocBeneficiary: RapidocBeneficiary,
  supabaseBeneficiary: any
): Promise<{
  success: boolean;
  user?: any;
  profile?: any;
  requiresOnboarding?: boolean;
  error?: string;
}> {
  try {
    const numericCPF = rapidocBeneficiary.cpf.replace(/\D/g, '');

    // Verificar se já existe usuário vinculado
    if (supabaseBeneficiary.user_id) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        supabaseBeneficiary.user_id
      );

      if (!userError && userData.user) {
        // Buscar perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();

        return {
          success: true,
          user: userData.user,
          profile,
          requiresOnboarding: !profile?.has_seen_onboarding,
        };
      }
    }

    // Criar novo usuário
    logger.info('[RapidocAuth] Criando novo usuário Supabase');

    const email = rapidocBeneficiary.email || `${numericCPF}@ailun.rapidoc`;
    const password = `Ailun${numericCPF.substring(0, 6)}!`;

    const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        cpf: numericCPF,
        full_name: rapidocBeneficiary.full_name,
        beneficiary_uuid: rapidocBeneficiary.beneficiary_uuid,
        source: 'rapidoc_api',
      },
    });

    if (createError) {
      logger.error('[RapidocAuth] Erro ao criar usuário:', createError);
      return { success: false, error: 'Erro ao criar usuário' };
    }

    const user = newUserData.user;

    // Vincular usuário ao beneficiário
    await supabase
      .from('beneficiaries')
      .update({ user_id: user!.id })
      .eq('id', supabaseBeneficiary.id);

    // Criar perfil
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user!.id,
        email: user!.email!,
        full_name: rapidocBeneficiary.full_name,
        phone: rapidocBeneficiary.phone,
        birth_date: rapidocBeneficiary.birth_date,
        has_seen_onboarding: false,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        is_active_beneficiary: true,
        plan_type: rapidocBeneficiary.service_type,
      })
      .select()
      .single();

    logger.info('[RapidocAuth] Usuário e perfil criados com sucesso');

    return {
      success: true,
      user,
      profile: newProfile,
      requiresOnboarding: true,
    };
  } catch (error: any) {
    logger.error('[RapidocAuth] Erro ao criar usuário:', error);
    return { success: false, error: 'Erro interno ao criar usuário' };
  }
}

/**
 * Autenticar usuário com CPF e senha via RapiDoc
 */
export async function authenticateWithRapidoc(
  cpf: string,
  password: string
): Promise<RapidocAuthResult> {
  try {
    const numericCPF = cpf.replace(/\D/g, '');
    logger.info(`[RapidocAuth] Iniciando autenticação: ${numericCPF.substring(0, 3)}***`);

    // 1. Buscar beneficiário na RapiDoc
    const rapidocResult = await fetchRapidocBeneficiaryByCPF(cpf);

    if (!rapidocResult.success || !rapidocResult.beneficiary) {
      return {
        success: false,
        error: rapidocResult.error || 'Beneficiário não encontrado',
      };
    }

    const rapidocBeneficiary = rapidocResult.beneficiary;

    // 2. Validar senha (4 primeiros dígitos do CPF)
    const expectedPassword = numericCPF.substring(0, 4);

    if (password !== expectedPassword) {
      logger.warn('[RapidocAuth] Senha incorreta');
      return {
        success: false,
        error: 'Senha incorreta. Use os 4 primeiros dígitos do CPF.',
      };
    }

    // 3. Sincronizar com Supabase
    const syncResult = await syncRapidocBeneficiaryToSupabase(rapidocBeneficiary);

    if (!syncResult.success || !syncResult.beneficiary) {
      return {
        success: false,
        error: syncResult.error || 'Erro ao sincronizar dados',
      };
    }

    const supabaseBeneficiary = syncResult.beneficiary;

    // 4. Criar ou obter usuário Supabase
    const userResult = await getOrCreateSupabaseUser(rapidocBeneficiary, supabaseBeneficiary);

    if (!userResult.success || !userResult.user) {
      return {
        success: false,
        error: userResult.error || 'Erro ao criar usuário',
      };
    }

    // 5. Gerar tokens JWT
    const tokens = await tokenService.saveTokens({
      accessToken: `rapidoc_access_${Date.now()}`,
      refreshToken: `rapidoc_refresh_${Date.now()}`,
      cpf: numericCPF,
      userId: userResult.user.id,
    });

    logger.info('[RapidocAuth] Autenticação concluída com sucesso');

    return {
      success: true,
      beneficiary: rapidocBeneficiary,
      user: userResult.user,
      tokens,
      requiresOnboarding: userResult.requiresOnboarding,
    };
  } catch (error: any) {
    logger.error('[RapidocAuth] Erro na autenticação:', error);
    return {
      success: false,
      error: 'Erro interno durante a autenticação',
    };
  }
}

/**
 * Verificar se CPF existe na RapiDoc
 */
export async function checkRapidocCPF(cpf: string): Promise<{
  exists: boolean;
  isActive: boolean;
  beneficiary?: RapidocBeneficiary;
}> {
  const result = await fetchRapidocBeneficiaryByCPF(cpf);

  return {
    exists: result.success,
    isActive: result.beneficiary?.is_active || false,
    beneficiary: result.beneficiary,
  };
}

/**
 * Sincronizar todos os beneficiários da RapiDoc
 */
export async function syncAllRapidocBeneficiaries(): Promise<{
  success: boolean;
  synced: number;
  errors: number;
  message: string;
}> {
  try {
    logger.info('[RapidocAuth] Iniciando sincronização em massa');

    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    if (!response.ok) {
      return {
        success: false,
        synced: 0,
        errors: 0,
        message: 'Erro ao buscar beneficiários da RapiDoc',
      };
    }

    const data = await response.json();
    const beneficiaries = data.beneficiaries || [];

    let synced = 0;
    let errors = 0;

    for (const beneficiary of beneficiaries) {
      if (beneficiary.is_active && beneficiary.status === 'active') {
        const rapidocBeneficiary: RapidocBeneficiary = {
          id: beneficiary.id,
          cpf: beneficiary.cpf,
          full_name: beneficiary.full_name || beneficiary.name,
          email: beneficiary.email,
          phone: beneficiary.phone,
          birth_date: beneficiary.birth_date,
          service_type: beneficiary.service_type || 'G',
          status: beneficiary.status,
          is_active: beneficiary.is_active,
          beneficiary_uuid: beneficiary.uuid || beneficiary.id,
        };

        const result = await syncRapidocBeneficiaryToSupabase(rapidocBeneficiary);

        if (result.success) {
          synced++;
        } else {
          errors++;
        }
      }
    }

    logger.info(`[RapidocAuth] Sincronização concluída: ${synced} sincronizados, ${errors} erros`);

    return {
      success: true,
      synced,
      errors,
      message: `Sincronizados ${synced} beneficiários com ${errors} erros`,
    };
  } catch (error: any) {
    logger.error('[RapidocAuth] Erro na sincronização em massa:', error);
    return {
      success: false,
      synced: 0,
      errors: 0,
      message: 'Erro interno durante a sincronização',
    };
  }
}

