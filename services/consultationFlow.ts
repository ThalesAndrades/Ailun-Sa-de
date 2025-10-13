import {
  requestImmediateAppointment,
  listSpecialties,
  getNutritionSpecialtyUuid,
  getPsychologySpecialtyUuid,
  checkMedicalReferral,
  listAvailability,
  scheduleAppointmentWithReferral,
  scheduleAppointmentWithoutReferral,
} from './rapidoc';
import { supabase } from './supabase';

/**
 * Serviço de Fluxo de Consultas
 * Implementa a lógica de negócio para cada tipo de consulta
 */

// ==================== MÉDICO IMEDIATO ====================

/**
 * FLUXO 1: Médico Imediato (Clínico Geral)
 * 
 * 1. Usuário clica em "Médico Imediato"
 * 2. App chama API RapiDoc para solicitar atendimento
 * 3. Usuário vai para página de espera
 * 4. Botão central mostra link da consulta (ambiente externo)
 */
export const startImmediateConsultation = async (beneficiaryUuid: string) => {
  try {
    // Solicitar atendimento imediato
    const result = await requestImmediateAppointment(beneficiaryUuid);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao solicitar atendimento',
      };
    }

    // Salvar no banco de dados
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('consultation_logs').insert({
        user_id: user.id,
        service_type: 'doctor',
        status: 'active',
        success: true,
        consultation_url: result.data.consultationUrl,
        metadata: {
          beneficiary_uuid: beneficiaryUuid,
          type: 'immediate',
          timestamp: new Date().toISOString(),
        },
      });
    }

    return {
      success: true,
      data: {
        consultationUrl: result.data.consultationUrl,
        message: 'Aguarde na sala de espera. O médico irá atendê-lo em breve.',
      },
    };
  } catch (error: any) {
    console.error('Erro no fluxo de médico imediato:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== ESPECIALISTAS ====================

/**
 * FLUXO 2: Especialistas
 * 
 * ETAPA 1: Listar especialidades (exceto nutrição)
 */
export const getSpecialtiesList = async () => {
  try {
    const result = await listSpecialties();

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao buscar especialidades',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    console.error('Erro ao listar especialidades:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * ETAPA 2: Verificar encaminhamento para especialidade
 */
export const checkSpecialtyReferral = async (
  beneficiaryUuid: string,
  specialtyUuid: string
) => {
  try {
    const result = await checkMedicalReferral(beneficiaryUuid, specialtyUuid);

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao verificar encaminhamento',
      };
    }

    return {
      success: true,
      hasReferral: result.hasReferral,
      referral: result.referral,
      needsGeneralPractitioner: !result.hasReferral,
      message: !result.hasReferral
        ? 'Você precisa passar pelo clínico geral para obter encaminhamento'
        : 'Encaminhamento ativo encontrado',
    };
  } catch (error: any) {
    console.error('Erro ao verificar encaminhamento:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * ETAPA 3: Listar horários disponíveis para especialidade
 */
export const getSpecialtyAvailability = async (
  beneficiaryUuid: string,
  specialtyUuid: string,
  dateInitial: string, // dd/MM/yyyy
  dateFinal: string // dd/MM/yyyy
) => {
  try {
    const result = await listAvailability(
      specialtyUuid,
      dateInitial,
      dateFinal,
      beneficiaryUuid
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao buscar horários disponíveis',
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    console.error('Erro ao buscar horários:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * ETAPA 4: Realizar agendamento com especialista
 */
export const scheduleSpecialistAppointment = async (
  beneficiaryUuid: string,
  availabilityUuid: string,
  specialtyUuid: string,
  referralUuid?: string
) => {
  try {
    let result;

    if (referralUuid) {
      // Agendar COM encaminhamento
      result = await scheduleAppointmentWithReferral(
        beneficiaryUuid,
        availabilityUuid,
        specialtyUuid,
        referralUuid
      );
    } else {
      // Agendar SEM encaminhamento (pode gerar cobrança adicional)
      result = await scheduleAppointmentWithoutReferral(
        beneficiaryUuid,
        availabilityUuid,
        specialtyUuid,
        true // approveAdditionalPayment
      );
    }

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Erro ao realizar agendamento',
      };
    }

    // Salvar no banco de dados
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const appointmentData = result.data;

      await supabase.from('consultation_logs').insert({
        user_id: user.id,
        service_type: 'specialist',
        status: 'pending',
        success: true,
        metadata: {
          beneficiary_uuid: beneficiaryUuid,
          appointment_uuid: appointmentData.uuid,
          availability_uuid: availabilityUuid,
          specialty_uuid: specialtyUuid,
          referral_uuid: referralUuid || null,
          appointment_date: appointmentData.appointmentDate,
          appointment_time: appointmentData.appointmentTime,
          timestamp: new Date().toISOString(),
        },
      });

      // Criar lembrete 30 minutos antes
      await createAppointmentReminder(
        user.id,
        appointmentData.appointmentDate,
        appointmentData.appointmentTime
      );
    }

    return {
      success: true,
      data: result.data,
      message: 'Agendamento realizado com sucesso! Você receberá um lembrete 30 minutos antes.',
    };
  } catch (error: any) {
    console.error('Erro ao agendar especialista:', error.message);
    return { success: false, error: error.message };
  }
};

// ==================== NUTRICIONISTA ====================

/**
 * FLUXO 3: Nutricionista
 * 
 * 1. Usuário clica em "Nutricionista"
 * 2. App busca UUID da especialidade de nutrição
 * 3. App lista horários disponíveis
 * 4. Usuário escolhe horário
 * 5. App realiza agendamento (verificando encaminhamento)
 */
export const startNutritionistFlow = async (
  beneficiaryUuid: string,
  dateInitial: string,
  dateFinal: string
) => {
  try {
    // 1. Buscar UUID da nutrição
    const specialtyResult = await getNutritionSpecialtyUuid();

    if (!specialtyResult.success) {
      return {
        success: false,
        error: 'Especialidade de nutrição não disponível',
      };
    }

    const nutritionSpecialty = specialtyResult.data;

    // 2. Verificar encaminhamento
    const referralCheck = await checkMedicalReferral(
      beneficiaryUuid,
      nutritionSpecialty.uuid
    );

    // 3. Buscar horários disponíveis
    const availabilityResult = await listAvailability(
      nutritionSpecialty.uuid,
      dateInitial,
      dateFinal,
      beneficiaryUuid
    );

    if (!availabilityResult.success) {
      return {
        success: false,
        error: 'Não há horários disponíveis no momento',
      };
    }

    return {
      success: true,
      data: {
        specialty: nutritionSpecialty,
        availability: availabilityResult.data,
        hasReferral: referralCheck.success && referralCheck.hasReferral,
        referral: referralCheck.referral,
        needsGeneralPractitioner: !(referralCheck.success && referralCheck.hasReferral),
      },
    };
  } catch (error: any) {
    console.error('Erro no fluxo de nutricionista:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Confirmar agendamento de nutricionista
 */
export const confirmNutritionistAppointment = async (
  beneficiaryUuid: string,
  availabilityUuid: string,
  specialtyUuid: string,
  referralUuid?: string
) => {
  return await scheduleSpecialistAppointment(
    beneficiaryUuid,
    availabilityUuid,
    specialtyUuid,
    referralUuid
  );
};

// ==================== PSICOLOGIA ====================

/**
 * FLUXO 4: Psicologia
 * 
 * 1. Usuário clica em "Psicologia"
 * 2. App busca UUID da especialidade de psicologia
 * 3. App lista horários e profissionais disponíveis
 * 4. Usuário escolhe
 * 5. App confirma agendamento
 */
export const startPsychologyFlow = async (
  beneficiaryUuid: string,
  dateInitial: string,
  dateFinal: string
) => {
  try {
    // 1. Buscar UUID da psicologia
    const specialtyResult = await getPsychologySpecialtyUuid();

    if (!specialtyResult.success) {
      return {
        success: false,
        error: 'Especialidade de psicologia não disponível',
      };
    }

    const psychologySpecialty = specialtyResult.data;

    // 2. Verificar encaminhamento
    const referralCheck = await checkMedicalReferral(
      beneficiaryUuid,
      psychologySpecialty.uuid
    );

    // 3. Buscar horários disponíveis
    const availabilityResult = await listAvailability(
      psychologySpecialty.uuid,
      dateInitial,
      dateFinal,
      beneficiaryUuid
    );

    if (!availabilityResult.success) {
      return {
        success: false,
        error: 'Não há horários disponíveis no momento',
      };
    }

    return {
      success: true,
      data: {
        specialty: psychologySpecialty,
        availability: availabilityResult.data,
        hasReferral: referralCheck.success && referralCheck.hasReferral,
        referral: referralCheck.referral,
        needsGeneralPractitioner: !(referralCheck.success && referralCheck.hasReferral),
      },
    };
  } catch (error: any) {
    console.error('Erro no fluxo de psicologia:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Confirmar agendamento de psicologia
 */
export const confirmPsychologyAppointment = async (
  beneficiaryUuid: string,
  availabilityUuid: string,
  specialtyUuid: string,
  referralUuid?: string
) => {
  return await scheduleSpecialistAppointment(
    beneficiaryUuid,
    availabilityUuid,
    specialtyUuid,
    referralUuid
  );
};

// ==================== HELPERS ====================

/**
 * Criar lembrete 30 minutos antes da consulta
 */
const createAppointmentReminder = async (
  userId: string,
  appointmentDate: string,
  appointmentTime: string
) => {
  try {
    // Calcular 30 minutos antes
    const [day, month, year] = appointmentDate.split('/');
    const [hours, minutes] = appointmentTime.split(':');
    
    const appointmentDateTime = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes)
    );

    const reminderDateTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);

    // Salvar no banco
    await supabase.from('system_notifications').insert({
      user_id: userId,
      title: 'Lembrete de Consulta',
      message: `Sua consulta está agendada para ${appointmentTime}. Prepare-se!`,
      type: 'info',
      metadata: {
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reminder_time: reminderDateTime.toISOString(),
        type: 'appointment_reminder',
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao criar lembrete:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Formatar data para dd/MM/yyyy
 */
export const formatDateToBrazilian = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Obter período padrão (próximos 30 dias)
 */
export const getDefaultDateRange = () => {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    dateInitial: formatDateToBrazilian(today),
    dateFinal: formatDateToBrazilian(thirtyDaysLater),
  };
};

