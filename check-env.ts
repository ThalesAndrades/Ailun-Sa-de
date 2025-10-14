import { createClient } from '@supabase/supabase-js';

// Simular o carregamento das variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'URL_NOT_LOADED';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'KEY_NOT_LOADED';

console.log('Verificando variáveis de ambiente no check-env.ts:');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey);

// Tentar criar um cliente Supabase para verificar se as chaves são válidas
try {
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Cliente Supabase criado com sucesso (se as chaves forem válidas).');
} catch (error) {
  console.error('Erro ao criar cliente Supabase:', error);
}

