/**
 * Script para vincular Thales Andrades (CPF 05034153912) ao plano GS Ativo
 * Execute este script no console do navegador ou Node.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Dados do Thales
const THALES_DATA = {
  cpf: '05034153912',
  nome: 'Thales Andrades'
};

// Configuração da RapiDoc
const RAPIDOC_CONFIG = {
  baseUrl: 'https://api.rapidoc.com', // Substitua pela URL correta
  token: process.env.RAPIDOC_TOKEN, // Substitua pelo token correto
  clientId: process.env.RAPIDOC_CLIENT_ID, // Substitua pelo client ID correto
  contentType: 'application/json'
};

/**
 * Busca beneficiário na API RapiDoc
 */
async function buscarBeneficiarioRapiDoc(cpf) {
  try {
    console.log(`🔍 Buscando beneficiário ${cpf} na RapiDoc...`);
    
    const response = await fetch(`${RAPIDOC_CONFIG.baseUrl}/beneficiaries`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RAPIDOC_CONFIG.token}`,
        'clientId': RAPIDOC_CONFIG.clientId,
        'Content-Type': RAPIDOC_CONFIG.contentType,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API RapiDoc: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success || !data.beneficiaries) {
      throw new Error('Erro ao buscar beneficiários na RapiDoc');
    }

    // Buscar pelo CPF
    const beneficiario = data.beneficiaries.find(b => b.cpf === cpf);
    
    if (!beneficiario) {
      throw new Error(`Beneficiário com CPF ${cpf} não encontrado na RapiDoc`);
    }

    console.log(`✅ Beneficiário encontrado na RapiDoc:`, {
      uuid: beneficiario.uuid,
      nome: beneficiario.name,
      cpf: beneficiario.cpf,
      ativo: beneficiario.isActive
    });

    return beneficiario;
  } catch (error) {
    console.error('❌ Erro ao buscar na RapiDoc:', error);
    throw error;
  }
}

/**
 * Verifica se beneficiário já existe no Supabase
 */
async function verificarBeneficiarioSupabase(cpf) {
  try {
    console.log(`🔍 Verificando se beneficiário ${cpf} existe no Supabase...`);
    
    const { data, error } = await supabase
      .from('beneficiaries')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      console.log('✅ Beneficiário já existe no Supabase:', {
        id: data.id,
        uuid: data.beneficiary_uuid,
        nome: data.full_name
      });
      return data;
    }

    console.log('ℹ️ Beneficiário não existe no Supabase local');
    return null;
  } catch (error) {
    console.error('❌ Erro ao verificar no Supabase:', error);
    throw error;
  }
}

/**
 * Cria beneficiário no Supabase
 */
async function criarBeneficiarioSupabase(dadosRapiDoc) {
  try {
    console.log('📝 Criando beneficiário no Supabase...');
    
    // Gerar um user_id temporário ou usar o UUID da RapiDoc
    const userId = dadosRapiDoc.uuid; // Usando o UUID da RapiDoc como user_id
    
    const dadosBeneficiario = {
      user_id: userId,
      beneficiary_uuid: dadosRapiDoc.uuid,
      cpf: dadosRapiDoc.cpf,
      full_name: dadosRapiDoc.name,
      birth_date: dadosRapiDoc.birthday || '1990-01-01', // Data padrão se não fornecida
      email: dadosRapiDoc.email || 'thales@exemplo.com',
      phone: dadosRapiDoc.phone || '11999999999',
      service_type: 'GS', // Tipo de serviço GS Ativo
      is_primary: true,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('beneficiaries')
      .insert(dadosBeneficiario)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Beneficiário criado no Supabase:', {
      id: data.id,
      nome: data.full_name,
      cpf: data.cpf
    });

    return data;
  } catch (error) {
    console.error('❌ Erro ao criar beneficiário no Supabase:', error);
    throw error;
  }
}

/**
 * Verifica se já existe plano ativo para o beneficiário
 */
async function verificarPlanoAtivo(beneficiarioId) {
  try {
    console.log('🔍 Verificando plano ativo existente...');
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('beneficiary_id', beneficiarioId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data) {
      console.log('⚠️ Já existe um plano ativo:', {
        id: data.id,
        nome: data.plan_name,
        tipo: data.service_type
      });
      return data;
    }

    console.log('ℹ️ Nenhum plano ativo encontrado');
    return null;
  } catch (error) {
    console.error('❌ Erro ao verificar plano ativo:', error);
    throw error;
  }
}

/**
 * Cria plano GS Ativo para o beneficiário
 */
async function criarPlanoGSAtivo(beneficiario) {
  try {
    console.log('📝 Criando plano GS Ativo...');
    
    const dadosPlano = {
      user_id: beneficiario.user_id,
      beneficiary_id: beneficiario.id,
      plan_name: 'GS Ativo',
      service_type: 'GS',
      include_clinical: true,
      include_specialists: true,
      include_psychology: false,
      include_nutrition: false,
      member_count: 1,
      discount_percentage: 0.00,
      base_price: 89.90, // Preço base do plano GS
      total_price: 89.90,
      billing_cycle: 'monthly',
      status: 'active',
      psychology_limit: 0,
      nutrition_limit: 0,
      psychology_used: 0,
      nutrition_used: 0,
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 dias
    };

    const { data, error } = await supabase
      .from('subscription_plans')
      .insert(dadosPlano)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Plano GS Ativo criado com sucesso:', {
      id: data.id,
      nome: data.plan_name,
      valor: data.total_price,
      proximo_vencimento: data.next_billing_date
    });

    return data;
  } catch (error) {
    console.error('❌ Erro ao criar plano GS Ativo:', error);
    throw error;
  }
}

/**
 * Atualiza plano existente para GS Ativo
 */
async function atualizarParaGSAtivo(planoExistente) {
  try {
    console.log('📝 Atualizando plano existente para GS Ativo...');
    
    const atualizacoes = {
      plan_name: 'GS Ativo',
      service_type: 'GS',
      include_clinical: true,
      include_specialists: true,
      include_psychology: false,
      include_nutrition: false,
      base_price: 89.90,
      total_price: 89.90,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('subscription_plans')
      .update(atualizacoes)
      .eq('id', planoExistente.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Plano atualizado para GS Ativo:', {
      id: data.id,
      nome: data.plan_name,
      valor: data.total_price
    });

    return data;
  } catch (error) {
    console.error('❌ Erro ao atualizar plano:', error);
    throw error;
  }
}

/**
 * Função principal
 */
async function vincularThalesGSAtivo() {
  try {
    console.log('🚀 INICIANDO VINCULAÇÃO DO THALES AO PLANO GS ATIVO');
    console.log('=' .repeat(60));
    
    // 1. Verificar se existe no Supabase
    let beneficiarioLocal = await verificarBeneficiarioSupabase(THALES_DATA.cpf);
    
    // 2. Se não existe, buscar na RapiDoc e criar
    if (!beneficiarioLocal) {
      console.log('📍 Beneficiário não existe localmente, buscando na RapiDoc...');
      const beneficiarioRapiDoc = await buscarBeneficiarioRapiDoc(THALES_DATA.cpf);
      beneficiarioLocal = await criarBeneficiarioSupabase(beneficiarioRapiDoc);
    }
    
    // 3. Verificar se já tem plano ativo
    const planoExistente = await verificarPlanoAtivo(beneficiarioLocal.id);
    
    // 4. Criar ou atualizar plano
    let planoFinal;
    if (planoExistente) {
      if (planoExistente.service_type === 'GS' && planoExistente.plan_name === 'GS Ativo') {
        console.log('✅ Thales já possui o plano GS Ativo!');
        planoFinal = planoExistente;
      } else {
        planoFinal = await atualizarParaGSAtivo(planoExistente);
      }
    } else {
      planoFinal = await criarPlanoGSAtivo(beneficiarioLocal);
    }
    
    // 5. Resumo final
    console.log('');
    console.log('🎉 VINCULAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('=' .repeat(60));
    console.log('👤 Beneficiário:', beneficiarioLocal.full_name);
    console.log('📋 CPF:', beneficiarioLocal.cpf);
    console.log('🔑 UUID RapiDoc:', beneficiarioLocal.beneficiary_uuid);
    console.log('📦 Plano:', planoFinal.plan_name);
    console.log('💰 Valor:', `R$ ${planoFinal.total_price}`);
    console.log('📅 Próximo vencimento:', planoFinal.next_billing_date);
    console.log('✅ Status:', planoFinal.status);
    console.log('');
    console.log('Serviços incluídos:');
    console.log('- Clínica Geral:', planoFinal.include_clinical ? '✅' : '❌');
    console.log('- Especialistas:', planoFinal.include_specialists ? '✅' : '❌');
    console.log('- Psicologia:', planoFinal.include_psychology ? '✅' : '❌');
    console.log('- Nutrição:', planoFinal.include_nutrition ? '✅' : '❌');
    
    return {
      success: true,
      beneficiario: beneficiarioLocal,
      plano: planoFinal
    };
    
  } catch (error) {
    console.error('');
    console.error('💥 ERRO NA VINCULAÇÃO:');
    console.error('=' .repeat(60));
    console.error(error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Executar o script
vincularThalesGSAtivo()
  .then(resultado => {
    if (resultado.success) {
      console.log('\n🎯 Script executado com sucesso!');
    } else {
      console.log('\n⚠️ Script falhou:', resultado.error);
    }
  })
  .catch(error => {
    console.error('\n💥 Erro fatal:', error);
  });

// Para execução em ambiente Node.js, exporte a função
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { vincularThalesGSAtivo };
}