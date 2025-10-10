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