import { RAPIDOC_CONFIG } from "../config/rapidoc.config";

export interface RapidocApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

export class RapidocApiAdapter {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000;

  private static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}, retries = 0): Promise<RapidocApiResult<T>> {
    const url = `${RAPIDOC_CONFIG.BASE_URL}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: RAPIDOC_CONFIG.HEADERS,
      ...options,
    };

    try {
      console.log(`[RapidocApiAdapter] Requisição para: ${url}`);
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[RapidocApiAdapter] Erro na resposta (${response.status}): ${errorText}`);
        return {
          success: false,
          error: `Erro na API Rapidoc: ${response.status} - ${errorText}`,
          status: response.status,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data as T,
        status: response.status,
      };
    } catch (error: any) {
      console.error(`[RapidocApiAdapter] Erro de conexão com a Rapidoc (tentativa ${retries + 1}/${this.MAX_RETRIES}): ${error.message}`);
      
      // Implementar retry para erros de rede
      if (retries < this.MAX_RETRIES - 1) {
        const delay = this.RETRY_DELAY_MS * (retries + 1); // Backoff exponencial
        console.log(`[RapidocApiAdapter] Tentando novamente em ${delay}ms...`);
        await this.sleep(delay);
        return this.request<T>(endpoint, options, retries + 1);
      }
      
      return {
        success: false,
        error: `Erro de conexão com a Rapidoc após ${this.MAX_RETRIES} tentativas: ${error.message || "Verifique sua conexão com a internet."}`,
      };
    }
  }

  public static async getBeneficiaryByCPF(cpf: string): Promise<RapidocApiResult<any>> {
    // A API de beneficiários da Rapidoc retorna todos os beneficiários e o filtro é feito localmente.
    // Isso pode ser otimizado se a API da Rapidoc suportar filtro por CPF diretamente.
    const result = await this.request<{ success: boolean; beneficiaries: any[]; message?: string }>("/beneficiaries", {
      method: "GET",
    });

    if (!result.success || !result.data?.success) {
      return {
        success: false,
        error: result.error || result.data?.message || "Erro ao buscar lista de beneficiários.",
        status: result.status,
      };
    }

    const beneficiary = result.data.beneficiaries.find((b: any) => b.cpf === cpf);

    if (!beneficiary) {
      return {
        success: false,
        error: "CPF não encontrado no sistema Rapidoc.",
      };
    }

    return {
      success: true,
      data: beneficiary,
    };
  }

  public static async createBeneficiary(beneficiaryData: any): Promise<RapidocApiResult<any>> {
    return this.request("/beneficiaries", {
      method: "POST",
      body: JSON.stringify(beneficiaryData),
    });
  }

  public static async updateBeneficiary(uuid: string, beneficiaryData: any): Promise<RapidocApiResult<any>> {
    return this.request(`/beneficiaries/${uuid}`, {
      method: "PUT",
      body: JSON.stringify(beneficiaryData),
    });
  }
}

