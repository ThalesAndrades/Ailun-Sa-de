/**
 * Proxy para a API Rapidoc
 * 
 * Este proxy resolve problemas de CORS ao fazer requisições do lado do servidor
 * em vez do lado do cliente.
 */

import { RAPIDOC_CONFIG } from '../config/rapidoc.config';

export interface RapidocProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

/**
 * Busca todos os beneficiários da API Rapidoc
 */
export async function fetchBeneficiaries(): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Buscando beneficiários...');
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Resposta recebida:', {
      success: data.success,
      count: data.beneficiaries?.length,
    });

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao buscar beneficiários:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Busca um beneficiário específico por CPF
 */
export async function fetchBeneficiaryByCPF(cpf: string): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Buscando beneficiário por CPF:', cpf);
    
    // Tentativa de buscar diretamente por CPF, se a API Rapidoc suportar
    // Assumindo que a API Rapidoc tem um endpoint para buscar por CPF diretamente
    // Se não tiver, a abordagem atual de buscar todos e filtrar é a única opção.
    // Para esta refatoração, vamos simular uma busca direta por CPF.
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries?cpf=${cpf}`, {
      method: 'GET',
      headers: RAPIDOC_CONFIG.HEADERS,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta ao buscar por CPF:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    const beneficiary = data.beneficiaries && data.beneficiaries.length > 0 ? data.beneficiaries[0] : null;

    if (!beneficiary) {
      return {
        success: false,
        error: 'CPF não encontrado no sistema.',
      };
    }

    return {
      success: true,
      data: beneficiary,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao buscar beneficiário por CPF:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Cria um novo beneficiário na API Rapidoc
 */
export async function createBeneficiary(beneficiaryData: any): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Criando beneficiário...');
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries`, {
      method: 'POST',
      headers: RAPIDOC_CONFIG.HEADERS,
      body: JSON.stringify(beneficiaryData),
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Beneficiário criado:', data);

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao criar beneficiário:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

/**
 * Atualiza um beneficiário existente na API Rapidoc
 */
export async function updateBeneficiary(uuid: string, beneficiaryData: any): Promise<RapidocProxyResponse> {
  try {
    console.log('[RapidocProxy] Atualizando beneficiário:', uuid);
    
    const response = await fetch(`${RAPIDOC_CONFIG.BASE_URL}/beneficiaries/${uuid}`, {
      method: 'PUT',
      headers: RAPIDOC_CONFIG.HEADERS,
      body: JSON.stringify(beneficiaryData),
    });

    console.log('[RapidocProxy] Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[RapidocProxy] Erro na resposta:', errorText);
      return {
        success: false,
        error: `Erro na API: ${response.status} - ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log('[RapidocProxy] Beneficiário atualizado:', data);

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error: any) {
    console.error('[RapidocProxy] Erro ao atualizar beneficiário:', error);
    return {
      success: false,
      error: error.message || 'Erro de conexão com a API Rapidoc',
    };
  }
}

export default {
  fetchBeneficiaries,
  fetchBeneficiaryByCPF,
  createBeneficiary,
  updateBeneficiary,
};

