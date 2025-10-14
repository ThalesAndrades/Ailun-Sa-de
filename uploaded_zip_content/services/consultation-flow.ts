/**
 * Alias para o serviço integrado de fluxo de consultas
 * Mantém compatibilidade com componentes que importam este arquivo
 */

export * from './consultation-flow-integrated';

// Re-exportar métodos principais para compatibilidade
import { consultationFlowService } from './consultation-flow-integrated';

export const {
  getDefaultDateRange,
  startImmediateDoctorFlow,
  getSpecialtiesList,
  checkSpecialtyReferral,
  getSpecialtyAvailability,
  scheduleSpecialistAppointment,
  startPsychologyFlow,
  startNutritionistFlow,
  confirmPsychologyAppointment,
  confirmNutritionistAppointment
} = consultationFlowService;