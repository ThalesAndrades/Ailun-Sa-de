/**
 * DADOS MOCK PARA MODO DEMONSTRAÇÃO
 * Ailun Saúde - App de Telemedicina
 * 
 * Este arquivo contém dados fictícios para demonstração do aplicativo
 * durante o processo de revisão nas lojas (Apple App Store e Google Play Store)
 */

export const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@ailun.com.br',
  full_name: 'Usuário Demonstração',
  phone: '(11) 99999-0000',
  birth_date: '1990-01-15',
  cpf: '000.000.000-00',
  avatar_url: null,
  has_seen_onboarding: true,
  created_at: '2025-01-01T00:00:00Z',
};

export const DEMO_HEALTH_INFO = {
  user_id: 'demo-user-001',
  weight: 75,
  height: 175,
  blood_type: 'O+',
  allergies: 'Nenhuma alergia conhecida',
  chronic_conditions: null,
  medications: null,
  emergency_contact_name: 'Maria Silva',
  emergency_contact_phone: '(11) 98888-0000',
  emergency_contact_relationship: 'Esposa',
};

export const DEMO_CONSULTATIONS = [
  {
    id: 'consult-001',
    user_id: 'demo-user-001',
    professional_name: 'Dr. João Silva',
    professional_specialty: 'Cardiologista',
    professional_crm: 'CRM/SP 123456',
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Daqui a 2 horas
    status: 'scheduled',
    type: 'specialist',
    consultation_url: null,
    notes: 'Consulta de rotina - Check-up cardíaco',
    created_at: '2025-11-03T10:00:00Z',
  },
  {
    id: 'consult-002',
    user_id: 'demo-user-001',
    professional_name: 'Dra. Maria Santos',
    professional_specialty: 'Dermatologista',
    professional_crm: 'CRM/SP 789012',
    scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
    status: 'scheduled',
    type: 'specialist',
    consultation_url: null,
    notes: 'Avaliação de manchas na pele',
    created_at: '2025-11-02T14:30:00Z',
  },
  {
    id: 'consult-003',
    user_id: 'demo-user-001',
    professional_name: 'Dr. Pedro Almeida',
    professional_specialty: 'Clínico Geral',
    professional_crm: 'CRM/SP 345678',
    scheduled_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias atrás
    status: 'completed',
    type: 'doctor',
    consultation_url: null,
    notes: 'Consulta realizada com sucesso. Paciente apresenta boa saúde geral.',
    created_at: '2025-10-28T09:00:00Z',
  },
];

export const DEMO_SUBSCRIPTION = {
  id: 'sub-001',
  user_id: 'demo-user-001',
  plan_name: 'Plano Família',
  plan_value: 89.90,
  status: 'active',
  next_billing_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // Daqui a 15 dias
  payment_method: 'credit_card',
  started_at: '2025-10-01T00:00:00Z',
};

export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif-001',
    user_id: 'demo-user-001',
    title: 'Lembrete de Consulta',
    message: 'Sua consulta com Dr. João Silva está agendada para hoje às 14:00',
    type: 'appointment_reminder',
    read: false,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
  },
  {
    id: 'notif-002',
    user_id: 'demo-user-001',
    title: 'Consulta Confirmada',
    message: 'Sua consulta com Dra. Maria Santos foi confirmada para amanhã às 10:30',
    type: 'appointment_confirmed',
    read: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 horas atrás
  },
  {
    id: 'notif-003',
    user_id: 'demo-user-001',
    title: 'Bem-vindo ao Ailun Saúde!',
    message: 'Obrigado por escolher o Ailun Saúde. Explore todas as funcionalidades do app.',
    type: 'welcome',
    read: true,
    created_at: '2025-10-01T00:00:00Z',
  },
];

export const DEMO_MEDICAL_DOCUMENTS = [
  {
    id: 'doc-001',
    user_id: 'demo-user-001',
    document_name: 'Exame de Sangue - Hemograma Completo',
    document_type: 'exam_result',
    file_path: null,
    uploaded_at: '2025-10-28T15:00:00Z',
  },
  {
    id: 'doc-002',
    user_id: 'demo-user-001',
    document_name: 'Receita Médica - Dr. Pedro Almeida',
    document_type: 'prescription',
    file_path: null,
    uploaded_at: '2025-10-28T15:30:00Z',
  },
];

export const DEMO_PROFESSIONALS = [
  {
    id: 'prof-001',
    name: 'Dr. João Silva',
    specialty: 'Cardiologista',
    crm: 'CRM/SP 123456',
    rating: 4.9,
    total_consultations: 1250,
    avatar_url: null,
    available: true,
  },
  {
    id: 'prof-002',
    name: 'Dra. Maria Santos',
    specialty: 'Dermatologista',
    crm: 'CRM/SP 789012',
    rating: 4.8,
    total_consultations: 980,
    avatar_url: null,
    available: true,
  },
  {
    id: 'prof-003',
    name: 'Dr. Pedro Almeida',
    specialty: 'Clínico Geral',
    crm: 'CRM/SP 345678',
    rating: 4.7,
    total_consultations: 1580,
    avatar_url: null,
    available: true,
  },
  {
    id: 'prof-004',
    name: 'Dra. Ana Costa',
    specialty: 'Psicóloga',
    crp: 'CRP/SP 06/123456',
    rating: 5.0,
    total_consultations: 750,
    avatar_url: null,
    available: true,
  },
  {
    id: 'prof-005',
    name: 'Dr. Carlos Mendes',
    specialty: 'Nutricionista',
    crn: 'CRN-3 12345',
    rating: 4.9,
    total_consultations: 620,
    avatar_url: null,
    available: true,
  },
];

/**
 * Função para verificar se o app está em modo demo
 */
export const isDemoMode = (): boolean => {
  return process.env.EXPO_PUBLIC_DEMO_MODE === 'true' || 
         process.env.EXPO_PUBLIC_APP_ENV === 'demo';
};

/**
 * Função para obter credenciais de demo
 */
export const getDemoCredentials = () => {
  return {
    email: process.env.EXPO_PUBLIC_DEMO_EMAIL || 'demo@ailun.com.br',
    password: process.env.EXPO_PUBLIC_DEMO_PASSWORD || 'Demo@2025',
  };
};

/**
 * Função para simular delay de rede (para melhor UX em demo)
 */
export const simulateNetworkDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
