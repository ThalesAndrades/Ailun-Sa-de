/**
 * Script para Ler o ServiceType de Cada Beneficiário
 * 
 * Este script:
 * 1. Busca todos os beneficiários no Supabase
 * 2. Faz uma chamada PUT para a API da Rapidoc para obter o serviceType real de cada um
 * 3. Gera um relatório com os dados
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { RAPIDOC_CONFIG } = require('../config/rapidoc-config');

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Buscar todos os beneficiários
 */
async function getAllBeneficiaries() {
  try {
    const { data, error } = await supabase
      .from('beneficiaries')
      .select(`
        id,
        user_id,
        beneficiary_uuid,
        cpf,
        full_name,
        birth_date,
        email,
        phone,
        service_type,
        status
      `);

    if (error) {
      throw error;
    }

    // Verificar se cada beneficiário tem plano ativo
    const beneficiariesWithPlanStatus = [];

    for (const beneficiary of data) {
      const { data: planData, error: planError } = await supabase
        .from('subscription_plans')
        .select('id, status')
        .eq('beneficiary_id', beneficiary.id)
        .eq('status', 'active')
        .single();

      beneficiariesWithPlanStatus.push({
        ...beneficiary,
        has_active_plan: !!planData && !planError,
      });
    }

    return beneficiariesWithPlanStatus;
  } catch (error) {
    console.error('[getAllBeneficiaries] Erro:', error);
    throw error;
  }
}

/**
 * Obter serviceType da Rapidoc
 */
async function getServiceTypeFromRapidoc(beneficiaryUuid, beneficiaryData) {
  try {
    const response = await axios.put(
      `${RAPIDOC_CONFIG.BASE_URL}beneficiaries/${beneficiaryUuid}`,
      beneficiaryData,
      {
        headers: RAPIDOC_CONFIG.HEADERS,
      }
    );

    return response.data.serviceType || null;
  } catch (error) {
    console.error(`[getServiceTypeFromRapidoc] Erro para UUID ${beneficiaryUuid}:`, error.response?.data || error.message);
    return null;
  }
}

/**
 * Processar todos os beneficiários e gerar relatório
 */
async function generateServiceTypeReport() {
  console.log('🚀 Iniciando leitura de serviceType dos beneficiários...\n');

  try {
    // 1. Buscar todos os beneficiários
    console.log('📋 Buscando beneficiários no Supabase...');
    const beneficiaries = await getAllBeneficiaries();
    console.log(`✅ Encontrados ${beneficiaries.length} beneficiários\n`);

    if (beneficiaries.length === 0) {
      console.log('⚠️  Nenhum beneficiário encontrado!');
      return;
    }

    const report = [];

    // 2. Processar cada beneficiário
    for (let i = 0; i < beneficiaries.length; i++) {
      const beneficiary = beneficiaries[i];
      console.log(`\n[${i + 1}/${beneficiaries.length}] 🔄 Processando: ${beneficiary.full_name}`);
      console.log(`   CPF: ${beneficiary.cpf}`);
      console.log(`   UUID: ${beneficiary.beneficiary_uuid}`);
      console.log(`   ServiceType (Supabase): ${beneficiary.service_type}`);
      console.log(`   Plano Ativo: ${beneficiary.has_active_plan ? 'Sim' : 'Não'}`);

      // 3. Obter serviceType da Rapidoc
      const rapidocServiceType = await getServiceTypeFromRapidoc(
        beneficiary.beneficiary_uuid,
        {
          cpf: beneficiary.cpf.replace(/\D/g, ''),
          name: beneficiary.full_name,
          birthDate: beneficiary.birth_date,
          email: beneficiary.email,
          phone: beneficiary.phone.replace(/\D/g, ''),
          serviceType: beneficiary.service_type,
        }
      );

      if (rapidocServiceType) {
        console.log(`   ✅ ServiceType (Rapidoc): ${rapidocServiceType}`);
      } else {
        console.log(`   ⚠️  Não foi possível obter serviceType da Rapidoc`);
      }

      // 4. Adicionar ao relatório
      report.push({
        beneficiary_uuid: beneficiary.beneficiary_uuid,
        cpf: beneficiary.cpf,
        full_name: beneficiary.full_name,
        email: beneficiary.email,
        service_type_supabase: beneficiary.service_type,
        service_type_rapidoc: rapidocServiceType,
        has_active_plan: beneficiary.has_active_plan,
        status: beneficiary.status,
        error: rapidocServiceType ? undefined : 'Erro ao obter serviceType da Rapidoc',
      });

      // Pequeno delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 5. Gerar arquivo de relatório JSON
    const reportPath = path.join(__dirname, '..', 'docs', 'RELATORIO_SERVICETYPE_BENEFICIARIOS.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    console.log(`\n✅ Relatório JSON salvo em: ${reportPath}`);

    // 6. Gerar relatório em Markdown
    const markdownReport = generateMarkdownReport(report);
    const markdownPath = path.join(__dirname, '..', 'docs', 'RELATORIO_SERVICETYPE_BENEFICIARIOS.md');
    fs.writeFileSync(markdownPath, markdownReport, 'utf-8');
    console.log(`✅ Relatório Markdown salvo em: ${markdownPath}`);

    // 7. Exibir resumo
    console.log('\n' + '='.repeat(80));
    console.log('📊 RESUMO DO RELATÓRIO');
    console.log('='.repeat(80));
    console.log(`Total de beneficiários: ${report.length}`);
    console.log(`Com plano ativo: ${report.filter(r => r.has_active_plan).length}`);
    console.log(`Sem plano ativo: ${report.filter(r => !r.has_active_plan).length}`);
    console.log(`ServiceType obtido com sucesso: ${report.filter(r => r.service_type_rapidoc).length}`);
    console.log(`Erros ao obter serviceType: ${report.filter(r => !r.service_type_rapidoc).length}`);
    console.log('='.repeat(80));

    // 8. Exibir tabela resumida
    console.log('\n📋 TABELA DE BENEFICIÁRIOS:\n');
    console.table(report.map(r => ({
      Nome: r.full_name,
      CPF: r.cpf,
      'ServiceType (Supabase)': r.service_type_supabase,
      'ServiceType (Rapidoc)': r.service_type_rapidoc || 'N/A',
      'Plano Ativo': r.has_active_plan ? 'Sim' : 'Não',
      Status: r.status,
    })));

    return report;

  } catch (error) {
    console.error('❌ Erro fatal no processamento:', error);
    throw error;
  }
}

/**
 * Gerar relatório em formato Markdown
 */
function generateMarkdownReport(report) {
  let markdown = '# Relatório de ServiceType dos Beneficiários\n\n';
  markdown += `**Data de Geração**: ${new Date().toLocaleString('pt-BR')}\n\n`;
  markdown += `**Total de Beneficiários**: ${report.length}\n\n`;
  markdown += '---\n\n';
  markdown += '## Resumo\n\n';
  markdown += `- **Com plano ativo**: ${report.filter(r => r.has_active_plan).length}\n`;
  markdown += `- **Sem plano ativo**: ${report.filter(r => !r.has_active_plan).length}\n`;
  markdown += `- **ServiceType obtido com sucesso**: ${report.filter(r => r.service_type_rapidoc).length}\n`;
  markdown += `- **Erros ao obter serviceType**: ${report.filter(r => !r.service_type_rapidoc).length}\n\n`;
  markdown += '---\n\n';
  markdown += '## Detalhes dos Beneficiários\n\n';
  markdown += '| Nome | CPF | ServiceType (Supabase) | ServiceType (Rapidoc) | Plano Ativo | Status | Observações |\n';
  markdown += '|------|-----|------------------------|----------------------|-------------|--------|-------------|\n';

  for (const item of report) {
    const planStatus = item.has_active_plan ? '✅ Sim' : '❌ Não';
    const serviceTypeRapidoc = item.service_type_rapidoc || '⚠️ N/A';
    const observations = item.error || '-';
    
    markdown += `| ${item.full_name} | ${item.cpf} | ${item.service_type_supabase} | ${serviceTypeRapidoc} | ${planStatus} | ${item.status} | ${observations} |\n`;
  }

  markdown += '\n---\n\n';
  markdown += '## Legenda de ServiceType\n\n';
  markdown += '- **G**: Clínico 24h\n';
  markdown += '- **GP**: Clínico + Psicologia\n';
  markdown += '- **GS**: Clínico + Especialistas\n';
  markdown += '- **GSP**: Clínico + Especialistas + Psicologia\n\n';
  markdown += '---\n\n';
  markdown += '## Observações\n\n';
  markdown += '- A nutrição é considerada uma especialidade, mas é cobrada separadamente na plataforma.\n';
  markdown += '- Beneficiários sem plano ativo precisam ter uma assinatura atribuída.\n';
  markdown += '- Discrepâncias entre o serviceType do Supabase e da Rapidoc devem ser investigadas.\n';

  return markdown;
}

// Executar o script
if (require.main === module) {
  generateServiceTypeReport()
    .then(() => {
      console.log('\n✅ Processo concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro no processo:', error);
      process.exit(1);
    });
}

module.exports = { generateServiceTypeReport };

