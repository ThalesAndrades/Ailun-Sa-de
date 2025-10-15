#!/usr/bin/env npx tsx
/**
 * Script para Sincronizar Todos os Beneficiários RapiDoc com Supabase
 * Uso: npx tsx scripts/sync-all-beneficiaries.ts
 */

import { integratedSystemService } from '../services/integrated-system-service';

async function main() {
  console.log('🔄 Iniciando sincronização de beneficiários...\n');

  try {
    const result = await integratedSystemService.syncAllActiveBeneficiaries();

    console.log('📊 Resultado da Sincronização:');
    console.log(`✅ Beneficiários sincronizados: ${result.synced}`);
    console.log(`❌ Erros encontrados: ${result.errors}`);
    console.log(`📈 Total processado: ${result.synced + result.errors}\n`);

    if (result.details.length > 0) {
      console.log('📋 Detalhes da operação:');
      result.details.forEach((detail, index) => {
        console.log(`${index + 1}. ${detail}`);
      });
    }

    if (result.success) {
      console.log('\n🎉 Sincronização concluída com sucesso!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Sincronização concluída com erros.');
      process.exit(1);
    }

  } catch (error: any) {
    console.error('\n❌ Erro fatal na sincronização:', error.message);
    process.exit(1);
  }
}

// Executar script
main().catch(console.error);