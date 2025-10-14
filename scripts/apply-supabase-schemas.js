/**
 * Script para aplicar schemas no Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Credenciais do Supabase
const SUPABASE_URL = 'https://bmtieinegditdeijyslu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdGllaW5lZ2RpdGRlaWp5c2x1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg5MDYxMiwiZXhwIjoyMDc1NDY2NjEyfQ.Tl39T7JDcIfdjHisXEBIY1AF3XawBNf_hm5IURM_Kp0';

// Criar cliente Supabase com service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applySchema(schemaFile) {
  console.log(`\n📄 Aplicando schema: ${schemaFile}`);
  
  try {
    const schemaPath = path.join(__dirname, '..', 'supabase', schemaFile);
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Executar SQL no Supabase
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      console.error(`❌ Erro ao aplicar ${schemaFile}:`, error.message);
      return false;
    }
    
    console.log(`✅ Schema ${schemaFile} aplicado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao ler/aplicar ${schemaFile}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando aplicação de schemas no Supabase...\n');
  
  const schemas = [
    'schema_beneficiary_plans.sql',
    'migrations/create_audit_logs_table.sql',
    'migrations/add_onboarding_field.sql',
  ];
  
  for (const schema of schemas) {
    await applySchema(schema);
  }
  
  console.log('\n✨ Processo concluído!');
}

main().catch(console.error);
