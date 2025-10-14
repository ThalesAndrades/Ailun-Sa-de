/**
 * Configuração centralizada do Asaas
 * Para segurança, as chaves devem vir de variáveis de ambiente
 */

export const ASAAS_CONFIG = {
  apiUrl: 'https://api.asaas.com/v3',
  apiKey: process.env.ASAAS_API_KEY || process.env.EXPO_PUBLIC_ASAAS_API_KEY,
};

// Validação da configuração
if (!ASAAS_CONFIG.apiKey) {
  console.error(
    '[ASAAS_CONFIG] ERRO: Chave API não configurada! ' +
    'Configure a variável de ambiente ASAAS_API_KEY ou EXPO_PUBLIC_ASAAS_API_KEY'
  );
}
