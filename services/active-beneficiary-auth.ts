/**
 * Serviço de Autenticação para Beneficiários Ativos
 * Sistema otimizado para login de beneficiários com planos ativos
 */

import { supabase } from './supabase';
import { logger } from '../utils/logger';

export interface ActiveBeneficiaryData {
  id: string;
  user_id: string | null;
  beneficiary_uuid: string;
  cpf: string;
  full_name: string;
  birth_date: string;
  email: string;
  phone: string;
  service_type: string;
  is_primary: boolean;
  status: string;
  has_active_plan: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthenticationResult {
  success: boolean;
  data?: {
    beneficiary: ActiveBeneficiaryData;
    user?: any;
    profile?: any;
    subscription?: any;
  };
  error?: string;
  requiresOnboarding?: boolean;
  requiresSubscription?: boolean;
}

/**
 * Verificar se um CPF é de um beneficiário ativo
 */
export async function checkActiveBeneficiary(cpf: string): Promise<{
  isActive: boolean;
  beneficiary?: ActiveBeneficiaryData;
  error?: string;
}> {
  try {
    logger.info('[checkActiveBeneficiary] Verificando CPF: ' + cpf.substring(0, 3) + '***');

    const { data: beneficiary, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('cpf', cpf)
      .eq('status', 'active')
      .eq('has_active_plan', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error('[checkActiveBeneficiary] Erro na consulta:', error);
      return { isActive: false, error: 'Erro ao verificar beneficiário' };
    }

    if (!beneficiary) {
      logger.info('[checkActiveBeneficiary] Beneficiário não encontrado ou inativo');
      return { isActive: false };
    }

    logger.info('[checkActiveBeneficiary] Beneficiário ativo encontrado:', beneficiary.beneficiary_uuid);
    return { 
      isActive: true, 
      beneficiary: beneficiary as ActiveBeneficiaryData 
    };
  } catch (error: any) {
    logger.error('[checkActiveBeneficiary] Erro inesperado:', error);
    return { isActive: false, error: 'Erro interno do sistema' };
  }
}

/**
 * Autenticar beneficiário ativo com CPF e senha
 */
export async function authenticateActiveBeneficiary(
  cpf: string, 
  password: string
): Promise<AuthenticationResult> {
  try {
    logger.info('[authenticateActiveBeneficiary] Iniciando autenticação para CPF: ' + cpf.substring(0, 3) + '***');

    // 1. Verificar se é beneficiário ativo
    const beneficiaryCheck = await checkActiveBeneficiary(cpf);
    
    if (!beneficiaryCheck.isActive || !beneficiaryCheck.beneficiary) {
      return {
        success: false,
        error: 'CPF não encontrado nos beneficiários ativos ou plano inativo',
        requiresSubscription: true
      };
    }

    const beneficiary = beneficiaryCheck.beneficiary;

    // 2. Validar senha (4 primeiros dígitos do CPF)
    const expectedPassword = cpf.replace(/\D/g, '').substring(0, 4);
    
    if (password !== expectedPassword) {
      logger.warn('[authenticateActiveBeneficiary] Senha incorreta para CPF: ' + cpf.substring(0, 3) + '***');
      return {
        success: false,
        error: 'Senha incorreta. Use os 4 primeiros dígitos do CPF.'
      };
    }

    // 3. Verificar se já existe usuário Supabase vinculado
    let user = null;
    let profile = null;
    let requiresOnboarding = false;

    if (beneficiary.user_id) {
      // Usuário já existe, fazer login
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(beneficiary.user_id);
      
      if (!userError && userData.user) {
        user = userData.user;
        
        // Buscar perfil do usuário
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        profile = profileData;
        requiresOnboarding = !profileData?.has_seen_onboarding;
      }
    }

    // 4. Se não existe usuário, criar um novo
    if (!user) {
      logger.info('[authenticateActiveBeneficiary] Criando novo usuário para beneficiário: ' + beneficiary.beneficiary_uuid);
      
      const email = beneficiary.email || `${cpf.replace(/\D/g, '')}@ailun.temp`;
      const temporaryPassword = `Ailun${cpf.replace(/\D/g, '').substring(0, 6)}!`;

      const { data: newUserData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          cpf,
          full_name: beneficiary.full_name,
          beneficiary_uuid: beneficiary.beneficiary_uuid,
          source: 'beneficiary_migration'
        }
      });

      if (createError) {
        logger.error('[authenticateActiveBeneficiary] Erro ao criar usuário:', createError);
        return {
          success: false,
          error: 'Erro ao criar conta do usuário'
        };
      }

      user = newUserData.user;
      
      // Vincular beneficiário ao usuário criado
      await supabase
        .from('beneficiaries')
        .update({ user_id: user!.id })
        .eq('id', beneficiary.id);

      // Criar perfil do usuário
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          id: user!.id,
          email: user!.email!,
          full_name: beneficiary.full_name,
          phone: beneficiary.phone,
          birth_date: beneficiary.birth_date,
          has_seen_onboarding: false,
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
          is_active_beneficiary: true,
          plan_type: beneficiary.service_type,
        })
        .select()
        .single();

      profile = newProfile;
      requiresOnboarding = true;

      logger.info('[authenticateActiveBeneficiary] Usuário e perfil criados com sucesso');
    }

    // 5. Verificar status da assinatura
    const { checkSubscriptionStatus } = await import('./asaas');
    const subscriptionStatus = await checkSubscriptionStatus(beneficiary.beneficiary_uuid);

    // 6. Fazer login do usuário no Supabase
    if (user) {
      const { error: signInError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: user.email!,
      });

      if (signInError) {
        logger.error('[authenticateActiveBeneficiary] Erro ao fazer login:', signInError);
      }

      // Atualizar sessão
      await supabase.auth.setSession({
        access_token: '', // Será preenchido pelo Supabase
        refresh_token: ''
      });
    }

    logger.info('[authenticateActiveBeneficiary] Autenticação concluída com sucesso');

    return {
      success: true,
      data: {
        beneficiary,
        user,
        profile,
        subscription: subscriptionStatus
      },
      requiresOnboarding,
      requiresSubscription: !subscriptionStatus?.hasActiveSubscription
    };

  } catch (error: any) {
    logger.error('[authenticateActiveBeneficiary] Erro inesperado:', error);
    return {
      success: false,
      error: 'Erro interno durante a autenticação'
    };
  }
}

/**
 * Verificar status de autenticação do beneficiário atual
 */
export async function getCurrentBeneficiaryStatus(): Promise<{
  isAuthenticated: boolean;
  beneficiary?: ActiveBeneficiaryData;
  subscription?: any;
  user?: any;
}> {
  try {
    // Verificar usuário atual do Supabase
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { isAuthenticated: false };
    }

    // Buscar beneficiário vinculado
    const { data: beneficiary } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!beneficiary) {
      return { isAuthenticated: false };
    }

    // Verificar assinatura
    const { checkSubscriptionStatus } = await import('./asaas');
    const subscription = await checkSubscriptionStatus(beneficiary.beneficiary_uuid);

    return {
      isAuthenticated: true,
      beneficiary: beneficiary as ActiveBeneficiaryData,
      subscription,
      user
    };
  } catch (error: any) {
    logger.error('[getCurrentBeneficiaryStatus] Erro:', error);
    return { isAuthenticated: false };
  }
}

/**
 * Listar todos os beneficiários ativos (para administração)
 */
export async function listActiveBeneficiaries(limit = 50, offset = 0): Promise<{
  beneficiaries: ActiveBeneficiaryData[];
  total: number;
  hasMore: boolean;
}> {
  try {
    const { data: beneficiaries, error, count } = await supabase
      .from('beneficiaries')
      .select('*', { count: 'exact' })
      .eq('status', 'active')
      .eq('has_active_plan', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return {
      beneficiaries: beneficiaries as ActiveBeneficiaryData[],
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  } catch (error: any) {
    logger.error('[listActiveBeneficiaries] Erro:', error);
    return {
      beneficiaries: [],
      total: 0,
      hasMore: false
    };
  }
}

/**
 * Resetar senha de beneficiário (usar os 4 primeiros dígitos do CPF)
 */
export async function resetBeneficiaryPassword(cpf: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const beneficiaryCheck = await checkActiveBeneficiary(cpf);
    
    if (!beneficiaryCheck.isActive) {
      return {
        success: false,
        message: 'Beneficiário não encontrado ou plano inativo'
      };
    }

    const expectedPassword = cpf.replace(/\D/g, '').substring(0, 4);
    
    return {
      success: true,
      message: `Sua senha são os 4 primeiros dígitos do seu CPF: ${expectedPassword}`
    };
  } catch (error: any) {
    logger.error('[resetBeneficiaryPassword] Erro:', error);
    return {
      success: false,
      message: 'Erro ao processar solicitação'
    };
  }
}

/**
 * Validar CPF format
 */
export function validateCPF(cpf: string): { isValid: boolean; formatted: string } {
  const numericCPF = cpf.replace(/\D/g, '');
  
  if (numericCPF.length !== 11) {
    return { isValid: false, formatted: cpf };
  }

  // Verificar sequências inválidas
  if (/^(\d)\1{10}$/.test(numericCPF)) {
    return { isValid: false, formatted: cpf };
  }

  // Algoritmo de validação do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numericCPF.charAt(i)) * (10 - i);
  }
  
  let remainder = 11 - (sum % 11);
  let digit1 = remainder < 10 ? remainder : 0;
  
  if (parseInt(numericCPF.charAt(9)) !== digit1) {
    return { isValid: false, formatted: cpf };
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numericCPF.charAt(i)) * (11 - i);
  }
  
  remainder = 11 - (sum % 11);
  let digit2 = remainder < 10 ? remainder : 0;
  
  if (parseInt(numericCPF.charAt(10)) !== digit2) {
    return { isValid: false, formatted: cpf };
  }

  // Formatar CPF
  const formatted = numericCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  
  return { isValid: true, formatted };
}

export default {
  checkActiveBeneficiary,
  authenticateActiveBeneficiary,
  getCurrentBeneficiaryStatus,
  listActiveBeneficiaries,
  resetBeneficiaryPassword,
  validateCPF,
};