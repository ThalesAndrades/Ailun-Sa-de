/**
 * Script de Validação de Configuração
 * Verifica se todas as variáveis de ambiente estão configuradas
 */

const fs = require('fs');
const path = require('path');

// Variáveis obrigatórias
const REQUIRED_VARS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'RAPIDOC_CLIENT_ID',
  'RAPIDOC_TOKEN',
  'ASAAS_API_KEY',
  'RESEND_API_KEY',
];

// Variáveis opcionais
const OPTIONAL_VARS = [
  'RAPIDOC_BASE_URL',
  'EXPO_PUBLIC_APP_ENV',
  'EXPO_PUBLIC_DISABLE_LOGS',
];

function validateConfig() {
  console.log('🔍 Validando configuração do AiLun Saúde...\n');

  // Carregar .env
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado!');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  // Parse manual do .env
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  let hasErrors = false;

  // Validar variáveis obrigatórias
  console.log('📋 Verificando variáveis obrigatórias:');
  REQUIRED_VARS.forEach(varName => {
    const value = envVars[varName] || process.env[varName];
    if (!value || value === '') {
      console.error(`❌ ${varName}: NÃO CONFIGURADA`);
      hasErrors = true;
    } else {
      // Mascarar valores sensíveis
      const maskedValue = value.length > 20 ? 
        `${value.substring(0, 10)}...${value.substring(value.length - 10)}` :
        `${value.substring(0, 5)}...`;
      console.log(`✅ ${varName}: ${maskedValue}`);
    }
  });

  console.log('\n📋 Verificando variáveis opcionais:');
  OPTIONAL_VARS.forEach(varName => {
    const value = envVars[varName] || process.env[varName];
    if (!value || value === '') {
      console.log(`⚠️  ${varName}: Não configurada (usando padrão)`);
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  });

  // Validações específicas
  console.log('\n🔧 Validações específicas:');
  
  // Supabase URL
  const supabaseUrl = envVars['EXPO_PUBLIC_SUPABASE_URL'];
  if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
    console.error('❌ SUPABASE_URL parece inválida');
    hasErrors = true;
  } else if (supabaseUrl) {
    console.log('✅ Supabase URL válida');
  }

  // Asaas API Key
  const asaasKey = envVars['ASAAS_API_KEY'];
  if (asaasKey && !asaasKey.startsWith('$aact_')) {
    console.error('❌ ASAAS_API_KEY formato inválido');
    hasErrors = true;
  } else if (asaasKey) {
    console.log('✅ Asaas API Key formato válido');
  }

  // RapiDoc Token
  const rapidocToken = envVars['RAPIDOC_TOKEN'];
  if (rapidocToken && rapidocToken.length < 10) {
    console.error('❌ RAPIDOC_TOKEN muito curto');
    hasErrors = true;
  } else if (rapidocToken) {
    console.log('✅ RapiDoc Token válido');
  }

  // Resultado final
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.error('❌ CONFIGURAÇÃO INVÁLIDA!');
    console.error('Corrija os erros antes de continuar.');
    process.exit(1);
  } else {
    console.log('✅ CONFIGURAÇÃO VÁLIDA!');
    console.log('🚀 Aplicativo pronto para produção.');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  validateConfig();
}

module.exports = { validateConfig };