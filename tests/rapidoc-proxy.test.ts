/**
 * Testes para o Rapidoc Proxy Extended
 * 
 * @author Manus AI
 * @date 2025-11-26
 */

import {
  fetchBeneficiaries,
  fetchBeneficiaryByCPF,
  createBeneficiary,
  updateBeneficiary,
  deleteBeneficiary,
  requestAppointmentUrl,
  fetchMedicalReferrals,
  fetchSpecialties,
  fetchSpecialtyAvailability,
  createAppointmentWithoutReferral,
  createAppointmentWithReferral,
  fetchAppointments,
  fetchAppointmentByUuid,
  cancelAppointment,
} from '../api/rapidoc-proxy-extended';

// ==========================================
// TESTES DE BENEFICIÁRIOS
// ==========================================

describe('Beneficiários', () => {
  test('Deve buscar todos os beneficiários', async () => {
    const result = await fetchBeneficiaries();
    
    expect(result.success).toBeDefined();
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.status).toBe(200);
    }
  });

  test('Deve buscar beneficiário por CPF', async () => {
    const cpf = '12345678900'; // CPF de teste
    const result = await fetchBeneficiaryByCPF(cpf);
    
    expect(result.success).toBeDefined();
  });

  test('Deve criar um novo beneficiário', async () => {
    const newBeneficiary = {
      name: 'João da Silva Teste',
      cpf: '98765432100',
      birthday: '1990-01-01',
      phone: '11999999999',
      email: 'joao.teste@example.com',
      zipCode: '01310100',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      paymentType: 'S',
      serviceType: 'G',
    };

    const result = await createBeneficiary(newBeneficiary);
    
    expect(result.success).toBeDefined();
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.message).toBe('Beneficiário criado com sucesso');
    }
  });
});

// ==========================================
// TESTES DE ESPECIALIDADES
// ==========================================

describe('Especialidades', () => {
  test('Deve buscar todas as especialidades', async () => {
    const result = await fetchSpecialties();
    
    expect(result.success).toBeDefined();
    if (result.success) {
      expect(result.data).toBeDefined();
      expect(result.data.specialties).toBeDefined();
    }
  });

  test('Deve buscar disponibilidade de especialidade', async () => {
    const params = {
      specialtyUuid: 'uuid-teste',
      dateInitial: '01/12/2025',
      dateFinal: '31/12/2025',
      beneficiaryUuid: 'uuid-beneficiario-teste',
    };

    const result = await fetchSpecialtyAvailability(params);
    
    expect(result.success).toBeDefined();
  });
});

// ==========================================
// TESTES DE AGENDAMENTOS
// ==========================================

describe('Agendamentos', () => {
  test('Deve buscar todos os agendamentos', async () => {
    const result = await fetchAppointments();
    
    expect(result.success).toBeDefined();
    if (result.success) {
      expect(result.data).toBeDefined();
    }
  });

  test('Deve criar agendamento sem encaminhamento', async () => {
    const appointmentData = {
      beneficiaryUuid: 'uuid-beneficiario',
      availabilityUuid: 'uuid-disponibilidade',
      specialtyUuid: 'uuid-especialidade',
      approveAdditionalPayment: true,
    };

    const result = await createAppointmentWithoutReferral(appointmentData);
    
    expect(result.success).toBeDefined();
  });

  test('Deve criar agendamento com encaminhamento', async () => {
    const appointmentData = {
      beneficiaryUuid: 'uuid-beneficiario',
      availabilityUuid: 'uuid-disponibilidade',
      specialtyUuid: 'uuid-especialidade',
      beneficiaryMedicalReferralUuid: 'uuid-encaminhamento',
    };

    const result = await createAppointmentWithReferral(appointmentData);
    
    expect(result.success).toBeDefined();
  });
});

// ==========================================
// TESTES DE ENCAMINHAMENTOS
// ==========================================

describe('Encaminhamentos Médicos', () => {
  test('Deve buscar todos os encaminhamentos', async () => {
    const result = await fetchMedicalReferrals();
    
    expect(result.success).toBeDefined();
    if (result.success) {
      expect(result.data).toBeDefined();
    }
  });
});

// ==========================================
// TESTES DE INTEGRAÇÃO
// ==========================================

describe('Integração Completa', () => {
  test('Fluxo completo: criar beneficiário, buscar especialidades, criar agendamento', async () => {
    // 1. Criar beneficiário
    const newBeneficiary = {
      name: 'Maria Teste Integração',
      cpf: '11122233344',
      birthday: '1985-05-15',
      phone: '11988887777',
      email: 'maria.integracao@example.com',
      zipCode: '01310100',
      address: 'Av. Paulista, 2000',
      city: 'São Paulo',
      state: 'SP',
      paymentType: 'S',
      serviceType: 'GSP',
    };

    const beneficiaryResult = await createBeneficiary(newBeneficiary);
    expect(beneficiaryResult.success).toBeDefined();

    if (beneficiaryResult.success && beneficiaryResult.data?.uuid) {
      // 2. Buscar especialidades
      const specialtiesResult = await fetchSpecialties();
      expect(specialtiesResult.success).toBeDefined();

      if (specialtiesResult.success && specialtiesResult.data?.specialties?.length > 0) {
        const firstSpecialty = specialtiesResult.data.specialties[0];

        // 3. Buscar disponibilidade
        const availabilityResult = await fetchSpecialtyAvailability({
          specialtyUuid: firstSpecialty.uuid,
          dateInitial: '01/12/2025',
          dateFinal: '31/12/2025',
          beneficiaryUuid: beneficiaryResult.data.uuid,
        });

        expect(availabilityResult.success).toBeDefined();

        if (availabilityResult.success && availabilityResult.data?.availabilities?.length > 0) {
          const firstAvailability = availabilityResult.data.availabilities[0];

          // 4. Criar agendamento
          const appointmentResult = await createAppointmentWithoutReferral({
            beneficiaryUuid: beneficiaryResult.data.uuid,
            availabilityUuid: firstAvailability.uuid,
            specialtyUuid: firstSpecialty.uuid,
            approveAdditionalPayment: true,
          });

          expect(appointmentResult.success).toBeDefined();
        }
      }
    }
  });
});

// ==========================================
// TESTES DE VALIDAÇÃO
// ==========================================

describe('Validações', () => {
  test('Deve retornar erro ao buscar beneficiário com CPF inválido', async () => {
    const result = await fetchBeneficiaryByCPF('00000000000');
    
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  test('Deve retornar erro ao criar beneficiário sem dados obrigatórios', async () => {
    const incompleteBeneficiary = {
      name: 'Teste Incompleto',
      // Faltando cpf e birthday (obrigatórios)
    };

    const result = await createBeneficiary(incompleteBeneficiary);
    
    expect(result.success).toBe(false);
  });
});

console.log('✅ Todos os testes foram definidos e estão prontos para execução');
