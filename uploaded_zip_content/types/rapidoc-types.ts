/**
 * Tipos TypeScript para a API RapiDoc
 * Documentação: https://sandbox.rapidoc.tech/tema/api/
 */

// ==================== BENEFICIÁRIOS ====================

export interface BeneficiaryData {
  name: string;
  cpf: string;
  birthday: string; // yyyy-MM-dd
  phone?: string;
  email: string;
  zipCode?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentType?: 'S' | 'A'; // S=recorrente, A=consulta
  serviceType?: 'G' | 'P' | 'GP' | 'GS' | 'GSP';
  holder?: string; // CPF do titular
  general?: string; // Campo genérico
}

export interface BeneficiaryResponse {
  cpf: string;
  uuid: string;
  name: string;
  birthday: string;
  phone?: string;
  email?: string;
  zipCode?: string;
  address?: string;
  city?: string;
  state?: string;
  paymentType?: 'S' | 'A';
  serviceType?: 'G' | 'P' | 'GP' | 'GS' | 'GSP';
  isActive: boolean;
  createdAt: string;
  clientId: string;
}

// ==================== ESPECIALIDADES ====================

export interface SpecialtyData {
  uuid: string;
  name: string;
  description?: string;
  active: boolean;
}

// ==================== DISPONIBILIDADE ====================

export interface AvailabilitySlot {
  uuid: string;
  date: string;
  time: string;
  available: boolean;
  specialtyUuid: string;
  professionalName?: string;
}

export interface AvailabilityQuery {
  specialtyUuid: string;
  dateInitial: string; // dd/MM/yyyy
  dateFinal: string; // dd/MM/yyyy
  beneficiaryUuid: string;
}

// ==================== AGENDAMENTOS ====================

export interface AppointmentData {
  uuid: string;
  beneficiaryUuid: string;
  specialtyUuid: string;
  availabilityUuid?: string;
  beneficiaryMedicalReferralUuid?: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
  doctor?: string;
  approveAdditionalPayment?: boolean;
}

export interface AppointmentRequest {
  beneficiaryUuid: string;
  availabilityUuid: string;
  specialtyUuid: string;
  approveAdditionalPayment?: boolean;
  beneficiaryMedicalReferralUuid?: string;
}

// ==================== ENCAMINHAMENTOS MÉDICOS ====================

export interface MedicalReferral {
  uuid: string;
  beneficiaryUuid: string;
  specialtyUuid: string;
  specialtyName: string;
  referralDate: string;
  expirationDate?: string;
  description?: string;
  status: 'active' | 'used' | 'expired';
  active: boolean;
}

// ==================== RESPOSTAS DA API ====================

export interface ApiResponse<T = any> {
  message: string;
  success: boolean;
  data?: T;
  beneficiaries?: BeneficiaryResponse[];
  url?: string;
  appointmentUrl?: string;
  appointment?: AppointmentData;
  specialties?: SpecialtyData[];
  availability?: AvailabilitySlot[];
  referrals?: MedicalReferral[];
}

// ==================== TIPOS DE SERVIÇO ====================

export type PaymentType = 'S' | 'A'; // S=recorrente, A=consulta
export type ServiceType = 'G' | 'P' | 'GP' | 'GS' | 'GSP';
// G = clínico geral
// P = psicologia
// GP = clínico + psicologia
// GS = clínico + especialistas
// GSP = clínico + especialistas + psicologia

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'in-progress';
export type ReferralStatus = 'active' | 'used' | 'expired';

// ==================== TIPOS DE ERRO ====================

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  code?: number;
}

// ==================== HELPERS DE TIPO ====================

export type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ==================== CONSTANTES ====================

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  'G': 'Clínico Geral',
  'P': 'Psicologia',
  'GP': 'Clínico + Psicologia',
  'GS': 'Clínico + Especialistas',
  'GSP': 'Clínico + Especialistas + Psicologia'
};

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  'S': 'Recorrente',
  'A': 'Por Consulta'
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  'scheduled': 'Agendado',
  'completed': 'Concluído',
  'cancelled': 'Cancelado',
  'in-progress': 'Em Andamento'
};

