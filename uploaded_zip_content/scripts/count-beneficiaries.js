/**
 * Script para contar beneficiários cadastrados no sistema
 * Execute com: node scripts/count-beneficiaries.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Ler variáveis do arquivo .env
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Consultando beneficiários cadastrados...\n');

// Criar cliente
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countBeneficiaries() {
  try {
    console.log('📊 Contando beneficiários...');

    // Contar usuários autenticados
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    const totalUsers = authUsers?.users?.length || 0;

    // Contar perfis com beneficiaryUuid na tabela profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .not('rapidoc_beneficiary_uuid', 'is', null);

    // Contar perfis na tabela user_profiles (caso exista)
    let userProfilesData = [];
    try {
      const { data: upData, error: upError } = await supabase
        .from('user_profiles')
        .select('id, email, full_name')
        .not('rapidoc_beneficiary_uuid', 'is', null);
      
      if (!upError) {
        userProfilesData = upData || [];
      }
    } catch (e) {
      // Tabela user_profiles pode não existir
    }

    // Contar perfis na tabela perfis (sistema brasileiro)
    let perfilsData = [];
    try {
      const { data: pData, error: pError } = await supabase
        .from('perfis')
        .select('id, nome, cpf')
        .eq('ativo', true);
      
      if (!pError) {
        perfilsData = pData || [];
      }
    } catch (e) {
      // Tabela perfis pode não existir
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 RESUMO DE BENEFICIÁRIOS');
    console.log('='.repeat(50));
    console.log(`👥 Total de usuários autenticados: ${totalUsers}`);
    console.log(`🏥 Perfis com beneficiário RapiDoc (profiles): ${profilesData?.length || 0}`);
    console.log(`🏥 Perfis com beneficiário RapiDoc (user_profiles): ${userProfilesData.length}`);
    console.log(`🇧🇷 Perfis ativos (perfis): ${perfilsData.length}`);

    const totalBeneficiaries = Math.max(
      profilesData?.length || 0,
      userProfilesData.length,
      perfilsData.length
    );

    console.log('\n' + '✨'.repeat(20));
    console.log(`🎯 TOTAL DE BENEFICIÁRIOS: ${totalBeneficiaries}`);
    console.log('✨'.repeat(20));

    // Mostrar alguns exemplos (primeiros 3)
    if (profilesData && profilesData.length > 0) {
      console.log('\n📋 Exemplos de beneficiários (profiles):');
      profilesData.slice(0, 3).forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name || profile.email || 'N/A'}`);
      });
    }

    if (userProfilesData.length > 0) {
      console.log('\n📋 Exemplos de beneficiários (user_profiles):');
      userProfilesData.slice(0, 3).forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.full_name || profile.email || 'N/A'}`);
      });
    }

    if (perfilsData.length > 0) {
      console.log('\n📋 Exemplos de beneficiários (perfis):');
      perfilsData.slice(0, 3).forEach((perfil, index) => {
        console.log(`   ${index + 1}. ${perfil.nome || perfil.cpf || 'N/A'}`);
      });
    }

    if (totalBeneficiaries === 0) {
      console.log('\n💡 NENHUM BENEFICIÁRIO ENCONTRADO');
      console.log('   Isso é normal se o app ainda não teve usuários reais.');
      console.log('   Beneficiários são criados automaticamente quando:');
      console.log('   1. Usuário se registra no app');
      console.log('   2. Faz login pela primeira vez');
      console.log('   3. Sistema chama ensureBeneficiaryProfile()');
    }

    console.log('\n📝 Para criar beneficiários de teste:');
    console.log('   1. Registre usuários no app');
    console.log('   2. Ou use o console do Supabase para criar perfis manualmente');

  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Executar contagem
countBeneficiaries();