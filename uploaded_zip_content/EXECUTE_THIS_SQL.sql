-- ==========================================
-- AILUN SAUDE - SCHEMA COMPLETO
-- Execute este SQL no Supabase Dashboard
-- ==========================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABELAS
-- ==========================================

-- 1. Perfis de Usuário
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    birth_date DATE,
    avatar_url TEXT,
    rapidoc_beneficiary_uuid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Informações de Saúde
CREATE TABLE IF NOT EXISTS public.health_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    weight NUMERIC,
    height NUMERIC,
    blood_type TEXT,
    allergies TEXT,
    chronic_conditions TEXT,
    medications TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Contatos de Emergência
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relationship TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Preferências do Usuário
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'pt-BR',
    theme TEXT DEFAULT 'light',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 5. Histórico de Consultas
CREATE TABLE IF NOT EXISTS public.consultation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    specialty TEXT,
    status TEXT DEFAULT 'pending',
    success BOOLEAN DEFAULT false,
    consultation_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Sessões Ativas
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_url TEXT NOT NULL,
    service_type TEXT NOT NULL,
    professional_info JSONB,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- 7. Fila de Consultas
CREATE TABLE IF NOT EXISTS public.consultation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    specialty TEXT,
    position INTEGER,
    estimated_wait_time INTEGER,
    status TEXT DEFAULT 'waiting',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notificações do Sistema
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ÍNDICES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_health_info_user_id ON public.health_info(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_logs_user_id ON public.consultation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_logs_status ON public.consultation_logs(status);
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_queue_user_id ON public.consultation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_user_id ON public.system_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_system_notifications_read ON public.system_notifications(read_at);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para health_info
CREATE POLICY "Users can view own health info" ON public.health_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own health info" ON public.health_info FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health info" ON public.health_info FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para emergency_contacts
CREATE POLICY "Users can view own emergency contacts" ON public.emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emergency contacts" ON public.emergency_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emergency contacts" ON public.emergency_contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emergency contacts" ON public.emergency_contacts FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para consultation_logs
CREATE POLICY "Users can view own consultation logs" ON public.consultation_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own consultation logs" ON public.consultation_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para active_sessions
CREATE POLICY "Users can view own active sessions" ON public.active_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own active sessions" ON public.active_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own active sessions" ON public.active_sessions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para consultation_queue
CREATE POLICY "Users can view own queue position" ON public.consultation_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own queue entry" ON public.consultation_queue FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para system_notifications
CREATE POLICY "Users can view own notifications" ON public.system_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.system_notifications FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_info_updated_at BEFORE UPDATE ON public.health_info
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_logs_updated_at BEFORE UPDATE ON public.consultation_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil ao registrar
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- CONCLUÍDO!
-- ==========================================

-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_profiles', 
    'health_info', 
    'emergency_contacts', 
    'user_preferences', 
    'consultation_logs', 
    'active_sessions', 
    'consultation_queue', 
    'system_notifications'
)
ORDER BY table_name;

