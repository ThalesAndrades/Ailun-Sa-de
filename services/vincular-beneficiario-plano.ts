
/**
 * Serviço para Vinculação de Beneficiários a Planos
 * Automatiza o processo de buscar beneficiários na RapiDoc e criar planos no Supabase
 */

import { beneficiaryService } from './beneficiary-service';
import {
  getBeneficiaryByCPF,
  createBeneficiary,
  createSubscriptionPlan,
  getActivePlan
} from './beneficiary-plan-service';

export interface VinculacaoResult {
  success: boolean;
  beneficiario?: any;
  plano?: any;
  error?: string;
  detalhes?: string;
}

export interface DadosPlano {
  nome: string;
  tipo: 'G' | 'GS' | 'GSP';
  incluiClinica: boolean;
  incluiEspecialistas: boolean;
  incluiPsicologia: boolean;
  incluiNutricao: boolean;
  preco: number;
}

const PLANOS_DISPONIVEIS: Record<string, DadosPlano> = {
  'GS_ATIVO': {
    nome: 'GS Ativo',
    tipo: 'GS',
    incluiClinica: true,
    incluiEspecialistas: true,
    incluiPsicologia: false,
    incluiNutricao: false,
    preco: 89.90
  },
  'GSP_COMPLETO': {
    nome: 'GSP Completo',
    tipo: 'GSP',
    incluiClinica: true,
    incluiEspecialistas: true,
    incluiPsicologia: true,
    incluiNutricao: true,
    preco: 129.90
  },
  'G_BASICO': {
    nome: 'G Básico',
    tipo: 'G',
    incluiClinica: true,
    incluiEspecialistas: false,
    incluiPsicologia: false,
    incluiNutricao: false,
    preco: 49.90
  }
};

/**
 * Vincula um beneficiário a um plano específico
 */
export async function vincularBeneficiarioAPlano(
  cpf: string,
  tipoPlano: keyof typeof PLANOS_DISPONIVEIS,
  forcarAtualizacao: boolean = false
): Promise<VinculacaoResult> {
  try {
    // Iniciando vinculação de beneficiário

    // 1. Validar dados de entrada
    const dadosPlano = PLANOS_DISPONIVEIS[tipoPlano];
    if (!dadosPlano) {
      return {
        success: false,
        error: `Tipo de plano '${tipoPlano}' não encontrado`,
        detalhes: `Planos disponíveis: ${Object.keys(PLANOS_DISPONIVEIS).join(', ')}`
      };
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      return {
        success: false,
        error: 'CPF inválido - deve conter 11 dígitos'
      };
    }

    // 2. Verificar se beneficiário existe no Supabase
    // Verificando beneficiário no sistema local
    let beneficiarioLocal = await getBeneficiaryByCPF(cpfLimpo);

    // 3. Se não existe localmente, buscar na RapiDoc e criar
    if (!beneficiarioLocal) {
      // Beneficiário não encontrado localmente, buscando na RapiDoc

      const resultadoRapiDoc = await beneficiaryService.getBeneficiaryByCPF(cpfLimpo);

      if (!resultadoRapiDoc.success || !resultadoRapiDoc.beneficiary) {
        return {
          success: false,
          error: 'Beneficiário não encontrado na RapiDoc',
          detalhes: resultadoRapiDoc.error
        };
      }

      const beneficiarioRapiDoc = resultadoRapiDoc.beneficiary;

      // Criar beneficiário no Supabase
      // Criando beneficiário no sistema local
      const resultadoCriacao = await createBeneficiary({
        user_id: beneficiarioRapiDoc.uuid, // Usar UUID da RapiDoc como user_id
        beneficiary_uuid: beneficiarioRapiDoc.uuid,
        cpf: cpfLimpo,
        full_name: beneficiarioRapiDoc.name,
        birth_date: beneficiarioRapiDoc.birthday || '1990-01-01',
        email: beneficiarioRapiDoc.email || `${cpfLimpo}@rapidoc.com`,
        phone: beneficiarioRapiDoc.phone || '11999999999',
        service_type: dadosPlano.tipo,
        is_primary: true
      });

      if (!resultadoCriacao.success || !resultadoCriacao.data) {
        return {
          success: false,
          error: 'Erro ao criar beneficiário no sistema',
          detalhes: resultadoCriacao.error
        };
      }

      beneficiarioLocal = resultadoCriacao.data;
      // Beneficiário criado no sistema local
    }

    // 4. Verificar plano ativo existente
    // Verificando plano ativo existente
    const planoExistente = await getActivePlan(beneficiarioLocal.user_id);

    if (planoExistente && !forcarAtualizacao) {
      if (planoExistente.service_type === dadosPlano.tipo) {
        // Beneficiário já possui plano do tipo correto
        return {
          success: true,
          beneficiario: beneficiarioLocal,
          plano: planoExistente,
          detalhes: 'Plano já existe e está ativo'
        };
      } else {
        return {
          success: false,
          error: `Beneficiário já possui plano ativo do tipo '${planoExistente.service_type}'`,
          detalhes: 'Use forcarAtualizacao=true para substituir o plano existente'
        };
      }
    }

    // 5. Criar novo plano
    // Criando novo plano
    const resultadoPlano = await createSubscriptionPlan({
      user_id: beneficiarioLocal.user_id,
      beneficiary_id: beneficiarioLocal.id,
      plan_name: dadosPlano.nome,
      service_type: dadosPlano.tipo,
      include_clinical: dadosPlano.incluiClinica,
      include_specialists: dadosPlano.incluiEspecialistas,
      include_psychology: dadosPlano.incluiPsicologia,
      include_nutrition: dadosPlano.incluiNutricao,
      member_count: 1,
      discount_percentage: 0,
      base_price: dadosPlano.preco,
      total_price: dadosPlano.preco
    });

    if (!resultadoPlano.success || !resultadoPlano.data) {
      return {
        success: false,
        error: 'Erro ao criar plano',
        detalhes: resultadoPlano.error
      };
    }

    // Vinculação concluída com sucesso
    return {
      success: true,
      beneficiario: beneficiarioLocal,
      plano: resultadoPlano.data,
      detalhes: `Plano '${dadosPlano.nome}' criado com sucesso`
    };

  } catch (error: any) {
    console.error('💥 Erro na vinculação:', error);
    return {
      success: false,
      error: 'Erro interno do sistema',
      detalhes: error.message
    };
  }
}

/**
 * Vincula especificamente o Thales Andrades ao plano GS Ativo
 */
export async function vincularThalesGSAtivo(): Promise<VinculacaoResult> {
  // Executando vinculação específica: Thales Andrades → GS Ativo

  const resultado = await vincularBeneficiarioAPlano('05034153912', 'GS_ATIVO');

  if (resultado.success) {
    // Thales Andrades vinculado ao plano GS Ativo com sucesso
    const detalhes = {
      nome: resultado.beneficiario?.full_name,
      cpf: resultado.beneficiario?.cpf,
      plano: resultado.plano?.plan_name,
      valor: resultado.plano?.total_price,
      uuid_rapidoc: resultado.beneficiario?.beneficiary_uuid
    }; // Added missing closing brace here
  } else {
    console.error('❌ Falha na vinculação do Thales:', resultado.error);
  }

  return resultado;
}

/**
 * Lista todos os planos disponíveis
 */
export function listarPlanosDisponiveis(): DadosPlano[] {
  return Object.entries(PLANOS_DISPONIVEIS).map(([chave, dados]) => ({
    ...dados,
    chave
  })) as any;
}

/**
 * Função utilitária para executar via console
 */
export async function executarVinculacao() {
  // Sistema de vinculação de beneficiários iniciado

  try {
    const resultado = await vincularThalesGSAtivo();

    if (resultado.success) {
      // Vinculação realizada com sucesso
      const resumo = {
        beneficiario: resultado.beneficiario?.full_name,
        cpf: resultado.beneficiario?.cpf,
        plano: resultado.plano?.plan_name,
        valor: resultado.plano?.total_price,
        uuid: resultado.beneficiario?.beneficiary_uuid
      };
    } else {
      console.log('\n❌ FALHA na vinculação:');
      console.log(`🚨 Erro: ${resultado.error}`);
      if (resultado.detalhes) {
        console.log(`📝 Detalhes: ${resultado.detalhes}`);
      }
    }
  } catch (error) {
    console.error('\n💥 ERRO FATAL:', error);
  }
}

// Para execução no console do navegador
if (typeof window !== 'undefined') {
  (window as any).vincularThales = executarVinculacao;
  (window as any).vincularBeneficiario = vincularBeneficiarioAPlano;
}
