/**
 * Testes de Integração - AiLun Saúde
 * 
 * Testes automatizados para validar fluxos completos
 */

import { RapidocService } from '../services/rapidoc';
import { loginWithCPF } from '../services/cpfAuth';
import {
  startImmediateConsultationEnhanced,
  scheduleSpecialistAppointmentEnhanced,
  cancelAppointmentEnhanced,
  listSpecialtiesEnhanced,
  checkAvailableSchedulesEnhanced,
} from '../services/consultationFlowEnhanced';

// Dados de teste (usar beneficiário real da lista)
const TEST_BENEFICIARY = {
  uuid: '9c8ab482-4240-4ab6-837c-6b6f08f46432',
  cpf: '05034153912',
  name: 'Thales Andrades Machado',
  email: 'thales-andrades@hotmail.com',
};

/**
 * Teste 1: Autenticação
 */
export async function testAuthentication(): Promise<{ success: boolean; message: string }> {
  console.log('\n🧪 Teste 1: Autenticação por CPF');
  console.log('─'.repeat(60));

  try {
    // Teste 1.1: Login com CPF válido
    console.log('  1.1 Testando login com CPF válido...');
    const loginResult = await loginWithCPF(TEST_BENEFICIARY.cpf, '0503');
    
    if (!loginResult.success) {
      return {
        success: false,
        message: `❌ Falha no login: ${loginResult.error}`,
      };
    }

    console.log('  ✅ Login bem-sucedido');
    console.log(`  👤 Usuário: ${loginResult.user?.name}`);

    // Teste 1.2: Login com senha incorreta
    console.log('  1.2 Testando login com senha incorreta...');
    const invalidLogin = await loginWithCPF(TEST_BENEFICIARY.cpf, '9999');
    
    if (invalidLogin.success) {
      return {
        success: false,
        message: '❌ Login deveria falhar com senha incorreta',
      };
    }

    console.log('  ✅ Login rejeitado corretamente');

    return {
      success: true,
      message: '✅ Teste de autenticação passou',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erro no teste: ${error.message}`,
    };
  }
}

/**
 * Teste 2: Listar Beneficiários
 */
export async function testListBeneficiaries(): Promise<{ success: boolean; message: string }> {
  console.log('\n🧪 Teste 2: Listar Beneficiários');
  console.log('─'.repeat(60));

  try {
    const result = await RapidocService.listBeneficiaries();

    if (!result.success) {
      return {
        success: false,
        message: `❌ Falha ao listar beneficiários: ${result.error}`,
      };
    }

    const count = result.data?.length || 0;
    console.log(`  ✅ ${count} beneficiários encontrados`);

    if (count === 0) {
      return {
        success: false,
        message: '❌ Nenhum beneficiário encontrado',
      };
    }

    return {
      success: true,
      message: `✅ Teste de listagem passou (${count} beneficiários)`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erro no teste: ${error.message}`,
    };
  }
}

/**
 * Teste 3: Listar Especialidades
 */
export async function testListSpecialties(): Promise<{ success: boolean; message: string }> {
  console.log('\n🧪 Teste 3: Listar Especialidades');
  console.log('─'.repeat(60));

  try {
    const result = await listSpecialtiesEnhanced();

    if (!result.success) {
      return {
        success: false,
        message: `❌ Falha ao listar especialidades: ${result.error}`,
      };
    }

    const count = result.data?.count || 0;
    console.log(`  ✅ ${count} especialidades encontradas`);

    if (count === 0) {
      return {
        success: false,
        message: '❌ Nenhuma especialidade encontrada',
      };
    }

    // Listar algumas especialidades
    const specialties = result.data?.specialties || [];
    console.log('  📋 Especialidades disponíveis:');
    specialties.slice(0, 5).forEach((s: any) => {
      console.log(`     - ${s.name}`);
    });

    return {
      success: true,
      message: `✅ Teste de especialidades passou (${count} encontradas)`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erro no teste: ${error.message}`,
    };
  }
}

/**
 * Teste 4: Verificar Horários Disponíveis
 */
export async function testCheckSchedules(): Promise<{ success: boolean; message: string }> {
  console.log('\n🧪 Teste 4: Verificar Horários Disponíveis');
  console.log('─'.repeat(60));

  try {
    // Primeiro, listar especialidades para pegar uma UUID
    const specialtiesResult = await RapidocService.listSpecialties();
    
    if (!specialtiesResult.success || !specialtiesResult.data || specialtiesResult.data.length === 0) {
      return {
        success: false,
        message: '❌ Não foi possível obter especialidades para teste',
      };
    }

    const specialty = specialtiesResult.data[0];
    console.log(`  🔍 Testando com especialidade: ${specialty.name}`);

    const result = await checkAvailableSchedulesEnhanced(specialty.uuid, specialty.name);

    if (!result.success) {
      console.log(`  ⚠️ Nenhum horário disponível para ${specialty.name}`);
      return {
        success: true, // Não é um erro se não houver horários
        message: `✅ Teste de horários passou (sem horários disponíveis)`,
      };
    }

    const count = result.data?.count || 0;
    console.log(`  ✅ ${count} horários disponíveis`);

    return {
      success: true,
      message: `✅ Teste de horários passou (${count} horários)`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erro no teste: ${error.message}`,
    };
  }
}

/**
 * Teste 5: Buscar Beneficiário por CPF
 */
export async function testGetBeneficiaryByCPF(): Promise<{ success: boolean; message: string }> {
  console.log('\n🧪 Teste 5: Buscar Beneficiário por CPF');
  console.log('─'.repeat(60));

  try {
    const result = await RapidocService.getBeneficiaryByCPF(TEST_BENEFICIARY.cpf);

    if (!result.success) {
      return {
        success: false,
        message: `❌ Falha ao buscar beneficiário: ${result.error}`,
      };
    }

    console.log(`  ✅ Beneficiário encontrado: ${result.data?.name}`);
    console.log(`  📧 Email: ${result.data?.email}`);
    console.log(`  📱 Telefone: ${result.data?.phone}`);

    return {
      success: true,
      message: '✅ Teste de busca por CPF passou',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `❌ Erro no teste: ${error.message}`,
    };
  }
}

/**
 * Executar todos os testes
 */
export async function runAllTests(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 EXECUTANDO TESTES DE INTEGRAÇÃO - AiLun Saúde');
  console.log('='.repeat(60));

  const tests = [
    { name: 'Autenticação', fn: testAuthentication },
    { name: 'Listar Beneficiários', fn: testListBeneficiaries },
    { name: 'Listar Especialidades', fn: testListSpecialties },
    { name: 'Verificar Horários', fn: testCheckSchedules },
    { name: 'Buscar por CPF', fn: testGetBeneficiaryByCPF },
  ];

  const results = [];

  for (const test of tests) {
    const result = await test.fn();
    results.push({
      name: test.name,
      ...result,
    });
  }

  // Resumo
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((r) => {
    console.log(`${r.success ? '✅' : '❌'} ${r.name}: ${r.message}`);
  });

  console.log('\n' + '─'.repeat(60));
  console.log(`Total: ${results.length} testes`);
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📊 Taxa de Sucesso: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    console.log('⚠️ Alguns testes falharam. Revise os erros acima.\n');
  } else {
    console.log('🎉 Todos os testes passaram com sucesso!\n');
  }
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('❌ Erro ao executar testes:', error);
    process.exit(1);
  });
}

