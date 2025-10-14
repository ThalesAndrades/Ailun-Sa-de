/**
 * Utilitários para debug e teste da integração RapiDoc
 */

import { RAPIDOC_CONFIG } from '../config/rapidoc.config';
import { getBeneficiaryByCPF } from '../services/rapidoc';

/**
 * Testa conectividade básica com a API RapiDoc
 */
export const testRapidocConnection = async () => {
  console.log('=== TESTE DE CONEXÃO RAPIDOC ===');
  console.log('Base URL:', RAPIDOC_CONFIG.baseUrl);
  console.log('Client ID:', RAPIDOC_CONFIG.clientId);
  console.log('Token presente:', !!RAPIDOC_CONFIG.token);
  console.log('Token (primeiros 50 chars):', RAPIDOC_CONFIG.token?.substring(0, 50) + '...');
  
  try {
    // Teste básico de fetch para a URL base
    console.log('\n--- Testando conectividade básica ---');
    const response = await fetch(RAPIDOC_CONFIG.baseUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RAPIDOC_CONFIG.token}`,
        'clientId': RAPIDOC_CONFIG.clientId,
        'Content-Type': RAPIDOC_CONFIG.contentType,
      }
    });
    
    console.log('Status da resposta:', response.status);
    console.log('Status OK:', response.ok);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Resposta (primeiros 500 chars):', responseText.substring(0, 500));
    
    return {
      success: response.ok,
      status: response.status,
      response: responseText
    };
    
  } catch (error: any) {
    console.error('Erro no teste de conexão:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Testa busca de beneficiário com CPFs de exemplo
 */
export const testBeneficiarySearch = async (testCPFs: string[] = ['12345678901', '11111111111']) => {
  console.log('\n=== TESTE DE BUSCA DE BENEFICIÁRIOS ===');
  
  for (const cpf of testCPFs) {
    console.log(`\n--- Testando CPF: ${cpf} ---`);
    
    try {
      const result = await getBeneficiaryByCPF(cpf);
      console.log('Resultado:', result);
      
      if (result.success) {
        console.log('✅ Beneficiário encontrado para CPF:', cpf);
        console.log('Dados:', result.data);
      } else {
        console.log('❌ Beneficiário não encontrado para CPF:', cpf);
        console.log('Erro:', result.error);
      }
    } catch (error: any) {
      console.log('💥 Erro na busca para CPF:', cpf);
      console.log('Erro:', error.message);
    }
  }
};

/**
 * Validador de configuração da API
 */
export const validateRapidocConfig = () => {
  console.log('\n=== VALIDAÇÃO DE CONFIGURAÇÃO ===');
  
  const config = RAPIDOC_CONFIG;
  const issues = [];
  
  // Verificar se todos os campos estão presentes
  if (!config.baseUrl) {
    issues.push('❌ Base URL não configurada');
  } else {
    console.log('✅ Base URL:', config.baseUrl);
  }
  
  if (!config.clientId) {
    issues.push('❌ Client ID não configurado');
  } else {
    console.log('✅ Client ID:', config.clientId);
  }
  
  if (!config.token) {
    issues.push('❌ Token não configurado');
  } else {
    console.log('✅ Token configurado (length:', config.token.length, ')');
  }
  
  if (!config.contentType) {
    issues.push('❌ Content-Type não configurado');
  } else {
    console.log('✅ Content-Type:', config.contentType);
  }
  
  // Verificar formato da URL
  if (config.baseUrl && !config.baseUrl.startsWith('http')) {
    issues.push('⚠️ Base URL deve começar com http:// ou https://');
  }
  
  // Verificar se a URL termina com barra
  if (config.baseUrl && config.baseUrl.endsWith('/')) {
    issues.push('⚠️ Base URL não deve terminar com /');
  }
  
  console.log('\n--- Resumo da Validação ---');
  if (issues.length === 0) {
    console.log('✅ Configuração válida!');
  } else {
    console.log('❌ Problemas encontrados:');
    issues.forEach(issue => console.log(issue));
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

/**
 * Executa todos os testes de debug
 */
export const runFullDiagnostic = async () => {
  console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DA RAPIDOC');
  console.log('='.repeat(50));
  
  // 1. Validar configuração
  const configValidation = validateRapidocConfig();
  
  // 2. Testar conectividade
  const connectionTest = await testRapidocConnection();
  
  // 3. Testar busca de beneficiários
  await testBeneficiarySearch();
  
  console.log('\n' + '='.repeat(50));
  console.log('🏁 DIAGNÓSTICO CONCLUÍDO');
  
  return {
    config: configValidation,
    connection: connectionTest
  };
};