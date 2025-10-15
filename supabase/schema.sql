-- =====================================================
-- SCHEMA DO BANCO DE DADOS - AILUN SAUDE
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: profiles
-- Perfil completo do usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  birth_date DATE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies para profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- TABELA: health_info
-- Informações de saúde do usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS public.health_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2),
  height INTEGER,
  blood_type TEXT,
  allergies TEXT,
  medications TEXT,
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies para health_info
ALTER TABLE public.health_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health info"
  ON public.health_info FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own health info"
  ON public.health_info FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health info"
  ON public.health_info FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABELA: emergency_contacts
-- Contatos de emergência do usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies para emergency_contacts
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own emergency contacts"
  ON public.emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
  ON public.emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
  ON public.emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
  ON public.emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABELA: user_preferences
-- Preferências e configurações do usuário
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_language TEXT DEFAULT 'pt-BR',
  notifications_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light',
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS Policies para user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TABELA: consultation_logs
-- Histórico de consultas e atendimentos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.consultation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN ('doctor', 'specialist', 'psychologist', 'nutritionist')),
  session_id TEXT,
  professional_name TEXT,
  specialty TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'failed')),
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  consultation_url TEXT,
  estimated_wait_time INTEGER,
  professional_rating INTEGER CHECK (professional_rating >= 1 AND professional_rating <= 5),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultation_logs
CREATE INDEX idx_consultation_logs_user_id ON public.consultation_logs(user_id);
CREATE INDEX idx_consultation_logs_status ON public.consultation_logs(status);
CREATE INDEX idx_consultation_logs_created_at ON public.consultation_logs(created_at DESC);

-- RLS Policies para consultation_logs
ALTER TABLE public.consultation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultation logs"
  ON public.consultation_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consultation logs"
  ON public.consultation_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consultation logs"
  ON public.consultation_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABELA: active_sessions
-- Sessões ativas de consultas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consultation_log_id UUID REFERENCES public.consultation_logs(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  service_type TEXT NOT NULL,
  professional_info JSONB DEFAULT '{}',
  session_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'completed')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para active_sessions
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX idx_active_sessions_status ON public.active_sessions(status);
CREATE INDEX idx_active_sessions_expires_at ON public.active_sessions(expires_at);

-- RLS Policies para active_sessions
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own active sessions"
  ON public.active_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own active sessions"
  ON public.active_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own active sessions"
  ON public.active_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABELA: consultation_queue
-- Fila de espera para consultas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.consultation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  specialty TEXT,
  priority INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'processing', 'assigned', 'cancelled')),
  queue_position INTEGER,
  estimated_time INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultation_queue
CREATE INDEX idx_consultation_queue_user_id ON public.consultation_queue(user_id);
CREATE INDEX idx_consultation_queue_status ON public.consultation_queue(status);
CREATE INDEX idx_consultation_queue_priority ON public.consultation_queue(priority DESC);

-- RLS Policies para consultation_queue
ALTER TABLE public.consultation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue entries"
  ON public.consultation_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue entries"
  ON public.consultation_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue entries"
  ON public.consultation_queue FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABELA: system_notifications
-- Notificações do sistema para usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para system_notifications
CREATE INDEX idx_system_notifications_user_id ON public.system_notifications(user_id);
CREATE INDEX idx_system_notifications_read_at ON public.system_notifications(read_at);
CREATE INDEX idx_system_notifications_created_at ON public.system_notifications(created_at DESC);

-- RLS Policies para system_notifications
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.system_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.system_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_info_updated_at
  BEFORE UPDATE ON public.health_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_logs_updated_at
  BEFORE UPDATE ON public.consultation_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_queue_updated_at
  BEFORE UPDATE ON public.consultation_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO: Criar perfil automaticamente após registro
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- STORAGE BUCKETS
-- Execute estes comandos no Supabase Dashboard > Storage
-- =====================================================

-- Criar bucket para avatares (público)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Criar bucket para documentos médicos (privado)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('medical-documents', 'medical-documents', false);

-- =====================================================
-- POLÍTICAS DE STORAGE
-- =====================================================

-- Políticas para avatars bucket
-- CREATE POLICY "Users can upload own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update own avatar"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Anyone can view avatars"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- Políticas para medical-documents bucket
-- CREATE POLICY "Users can upload own documents"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view own documents"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete own documents"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

