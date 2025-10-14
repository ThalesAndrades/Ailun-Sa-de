/**
 * Script para Ler o ServiceType de Cada Beneficiário
 * 
 * Este script:
 * 1. Busca todos os beneficiários no Supabase
 * 2. Faz uma chamada PUT para a API da Rapidoc para obter o serviceType real de cada um
 * 3. Gera um relatório com os dados
 */

import { supabase } from '../services/supabase';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

// Configuração da API Rapidoc
const RAPIDOC_API_URL = 'https://api.rapidoc.tech/tema/api';
const RAPIDOC_CLIENT_ID = '540e4b44-d68d-4ade-885f-fd4940a3a045';
const RAPIDOC_BEARER_TOKEN = 'eyJhbGciOiJSUzUxMiJ9.eyJjbGllbnQiOiJBSUxVTiBURUNOT0xPR0lBIn0.Wkzl4kZkBhTCHoSI_9r5TDmTY9ZHrxIj7kyCUvWeXM9FKIhpf9vY464wFwb4u0K_ys_TtB00awXU42duDxEz_KJ4oloJbklLsIaiHW6OgGnrv5iLN1wNYb9uTPDJjCkiNBtNIr0F5_7U8gV6qwztAWn5vY8qrt7DxOoaO_8uIe-jydSZYjl9jMtMjWd3phmjjxfoDLqLGRKoSgw01Efk6ivkzndB2gcdmZIz6tgwhTfwuQLRkhMmqCv188twAkP2Dyt8A_OREr8iyiXHlBNlZnLcYlng5_9PHDUww2exl_QC6RuhB2k-vwsZ4eOxjOThpkCWT-E4zomUMpVuoEFtN_yt3vGiTwr_WHWjleDnOR1CeGCtxRCDmzU7IGmwa7fEhOrx7VUXPKZKidmF2HGicBq4QK22JvAimuDstuAcHIepr9gs8abm0p93_-BbnZDoM4edmhFLvBykfbV-rXVhen0nJVm5c9av4QP8tb41lglrs3DVa7KCqESG8kB47uCf74K8GJLpHzgk2ERHH_E3o1I_NdFwf1qZTAxiCCGIi0wjtVkU9zTrEyNb5HNpSgXn3Hj7IyMiCvHTzrweY7aizFF9uyrIf_5-SY-jmE-XuhvZiOuRQO-7XnCWHtuuuHXUVxKEFmG7EQWvI-e7z62cAJdQZhlxEBtepSgzpC_GKPc';

interface Beneficiary {
  id: string;
  user_id: string;
  beneficiary_uuid: string;
  cpf: string;
  full_name: string;
  birth_date: string;
  email: string;
  phone: string;
  service_type: string;
  status: string;
  has_active_plan: boolean;
}

interface BeneficiaryReport {
  beneficiary_uuid: string;
  cpf: string;
  full_name: string;
  email: string;
  service_type_supabase: string;
  service_type_rapidoc: string | null;
  has_active_plan: boolean;
  status: string;
  error?: string;
}

/**
 * Buscar todos os beneficiários
 */
async function getAllBeneficiaries(): Promise<Beneficiary[]> {
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
    const beneficiariesWithPlanStatus: Beneficiary[] = [];

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
async function getServiceTypeFromRapidoc(
  beneficiaryUuid: string,
  beneficiaryData: {
    cpf: string;
    name: string;
    birthDate: string;
    email: string;
    phone: string;
    serviceType: string;
  }
): Promise<string | null> {
  try {
    const response = await axios.put(
      `${RAPIDOC_API_URL}/beneficiaries/${beneficiaryUuid}`,
      beneficiaryData,
      {
        headers: {
          'Authorization': `Bearer ${RAPIDOC_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.serviceType || null;
  } catch (error: any) {
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

    const report: BeneficiaryReport[] = [];

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

    // 5. Gerar arquivo de relatório
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

  } catch (error) {
    console.error('❌ Erro fatal no processamento:', error);
    throw error;
  }
}

/**
 * Gerar relatório em formato Markdown
 */
function generateMarkdownReport(report: BeneficiaryReport[]): string {
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

export { generateServiceTypeReport };

