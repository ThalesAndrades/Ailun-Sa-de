import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para os dados do usuário
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  birth_date?: string;
  has_seen_onboarding?: boolean;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface HealthInfo {
  id: string;
  user_id: string;
  weight?: number;
  height?: number;
  blood_type?: string;
  allergies?: string;
  medications?: string;
  medical_history?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_language: string;
  notifications_enabled: boolean;
  special_notes?: string;
  created_at: string;
  updated_at: string;
}

// Novos tipos para o sistema de orquestração
export interface ConsultationLog {
  id: string;
  user_id: string;
  service_type: 'doctor' | 'specialist' | 'psychologist' | 'nutritionist';
  session_id?: string;
  professional_name?: string;
  specialty?: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'failed';
  success: boolean;
  error_message?: string;
  consultation_url?: string;
  estimated_wait_time?: number;
  professional_rating?: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ActiveSession {
  id: string;
  user_id: string;
  consultation_log_id: string;
  session_id: string;
  service_type: string;
  professional_info: Record<string, any>;
  session_url?: string;
  status: 'active' | 'expired' | 'completed';
  expires_at: string;
  created_at: string;
}

export interface ConsultationQueue {
  id: string;
  user_id: string;
  service_type: string;
  specialty?: string;
  priority: number;
  status: 'waiting' | 'processing' | 'assigned' | 'cancelled';
  queue_position?: number;
  estimated_time?: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SystemNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read_at?: string;
  action_url?: string;
  metadata: Record<string, any>;
  created_at: string;
}