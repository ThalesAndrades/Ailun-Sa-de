/**
 * Script de Teste da Integração do Supabase
 * Execute com: node scripts/test-supabase.js
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

console.log('🔍 Testando Integração do Supabase...\n');

// Verificar variáveis de ambiente
console.log('📋 Verificando configuração:');
console.log(`   URL: ${supabaseUrl ? '✅ Configurada' : '❌ Não encontrada'}`);
console.log(`   Anon Key: ${supabaseAnonKey ? '✅ Configurada' : '❌ Não encontrada'}\n`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!');
  console.log('   Verifique o arquivo .env\n');
  process.exit(1);
}

// Criar cliente
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('🔌 Testando conexão com o Supabase...');
    
    // Teste 1: Verificar autenticação
    console.log('\n1️⃣ Teste de Autenticação:');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log(`   ⚠️  Nenhuma sessão ativa (esperado): ${sessionError.message}`);
    } else {
      console.log(`   ✅ Cliente de autenticação funcionando`);
      if (session) {
        console.log(`   👤 Usuário logado: ${session.user.email}`);
      } else {
        console.log(`   👤 Nenhum usuário logado (esperado)`);
      }
    }

    // Teste 2: Verificar acesso ao banco de dados
    console.log('\n2️⃣ Teste de Banco de Dados:');
    try {
      // Tentar listar tabelas (pode falhar se não houver permissão, mas testa a conexão)
      const { data, error } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          console.log('   ⚠️  Tabela "user_profiles" não existe ainda');
          console.log('   💡 Crie as tabelas no Supabase Dashboard');
        } else if (error.code === 'PGRST116') {
          console.log('   ✅ Conexão com banco de dados OK');
          console.log('   ℹ️  Tabela existe mas está vazia (esperado)');
        } else {
          console.log(`   ⚠️  Erro ao acessar tabela: ${error.message}`);
          console.log(`   Código: ${error.code}`);
        }
      } else {
        console.log('   ✅ Conexão com banco de dados OK');
        console.log(`   📊 Dados encontrados: ${JSON.stringify(data)}`);
      }
    } catch (dbError) {
      console.log(`   ❌ Erro ao testar banco: ${dbError.message}`);
    }

    // Teste 3: Verificar Storage
    console.log('\n3️⃣ Teste de Storage:');
    try {
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      if (storageError) {
        console.log(`   ⚠️  Erro ao listar buckets: ${storageError.message}`);
      } else {
        console.log('   ✅ Conexão com Storage OK');
        if (buckets && buckets.length > 0) {
          console.log(`   📦 Buckets encontrados: ${buckets.map(b => b.name).join(', ')}`);
        } else {
          console.log('   📦 Nenhum bucket criado ainda');
          console.log('   💡 Crie buckets no Supabase Dashboard em Storage');
        }
      }
    } catch (storageError) {
      console.log(`   ❌ Erro ao testar storage: ${storageError.message}`);
    }

    // Resumo
    console.log('\n' + '='.repeat(50));
    console.log('✅ TESTE CONCLUÍDO!');
    console.log('='.repeat(50));
    console.log('\n📝 Próximos passos:');
    console.log('   1. Criar tabelas no Supabase Dashboard');
    console.log('   2. Configurar Row Level Security (RLS)');
    console.log('   3. Criar buckets de Storage se necessário');
    console.log('   4. Testar autenticação criando um usuário');
    console.log('\n📚 Consulte: docs/SUPABASE_INTEGRATION.md\n');

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Executar testes
testConnection();

