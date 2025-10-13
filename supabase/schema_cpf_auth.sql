-- ============================================================================
-- SCHEMA DO BANCO DE DADOS - AILUN SAUDE
-- Sistema de Autenticação por CPF (sem Supabase Auth)
-- ============================================================================

-- ==================== TABELAS ====================

-- 1. Tabela de Logs de Consultas
CREATE TABLE IF NOT EXISTS public.consultation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_uuid TEXT NOT NULL,
    service_type TEXT NOT NULL, -- 'immediate', 'specialist', 'nutritionist', 'psychology'
    specialty TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    consultation_url TEXT,
    appointment_uuid TEXT,
    scheduled_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Notificações do Sistema
CREATE TABLE IF NOT EXISTS public.system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_uuid TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Sessões Ativas (opcional, para controle de sessões)
CREATE TABLE IF NOT EXISTS public.active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_uuid TEXT NOT NULL,
    consultation_type TEXT,
    session_data JSONB,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Fila de Consultas (para médico imediato)
CREATE TABLE IF NOT EXISTS public.consultation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_uuid TEXT NOT NULL,
    queue_position INTEGER,
    estimated_wait_time INTEGER, -- em minutos
    status TEXT DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Lembretes de Consultas
CREATE TABLE IF NOT EXISTS public.consultation_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_uuid TEXT NOT NULL,
    consultation_log_id UUID REFERENCES public.consultation_logs(id) ON DELETE CASCADE,
    reminder_date TIMESTAMPTZ NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Preferências do Usuário (opcional)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    beneficiary_uuid TEXT PRIMARY KEY,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'pt-BR',
    theme TEXT DEFAULT 'light',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ÍNDICES ====================

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_consultation_logs_beneficiary ON public.consultation_logs(beneficiary_uuid);
CREATE INDEX IF NOT EXISTS idx_consultation_logs_status ON public.consultation_logs(status);
CREATE INDEX IF NOT EXISTS idx_consultation_logs_created_at ON public.consultation_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_beneficiary ON public.system_notifications(beneficiary_uuid);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.system_notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.system_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_active_sessions_beneficiary ON public.active_sessions(beneficiary_uuid);
CREATE INDEX IF NOT EXISTS idx_active_sessions_expires_at ON public.active_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_queue_beneficiary ON public.consultation_queue(beneficiary_uuid);
CREATE INDEX IF NOT EXISTS idx_queue_status ON public.consultation_queue(status);

CREATE INDEX IF NOT EXISTS idx_reminders_beneficiary ON public.consultation_reminders(beneficiary_uuid);
CREATE INDEX IF NOT EXISTS idx_reminders_sent ON public.consultation_reminders(sent);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON public.consultation_reminders(reminder_date);

-- ==================== TRIGGERS ====================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas
DROP TRIGGER IF EXISTS update_consultation_logs_updated_at ON public.consultation_logs;
CREATE TRIGGER update_consultation_logs_updated_at
    BEFORE UPDATE ON public.consultation_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_queue_updated_at ON public.consultation_queue;
CREATE TRIGGER update_queue_updated_at
    BEFORE UPDATE ON public.consultation_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== FUNÇÕES ÚTEIS ====================

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.active_sessions
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para criar lembrete automático (30 min antes da consulta)
CREATE OR REPLACE FUNCTION create_consultation_reminder()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.scheduled_date IS NOT NULL THEN
        INSERT INTO public.consultation_reminders (
            beneficiary_uuid,
            consultation_log_id,
            reminder_date
        ) VALUES (
            NEW.beneficiary_uuid,
            NEW.id,
            NEW.scheduled_date - INTERVAL '30 minutes'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de lembrete
DROP TRIGGER IF EXISTS create_reminder_on_schedule ON public.consultation_logs;
CREATE TRIGGER create_reminder_on_schedule
    AFTER INSERT OR UPDATE OF scheduled_date ON public.consultation_logs
    FOR EACH ROW
    WHEN (NEW.scheduled_date IS NOT NULL)
    EXECUTE FUNCTION create_consultation_reminder();

-- ==================== POLÍTICAS RLS (OPCIONAL) ====================

-- Como não temos auth.users, o RLS pode ser desabilitado
-- OU você pode criar políticas customizadas baseadas em beneficiary_uuid
-- passado via claims do JWT das Edge Functions

-- Desabilitar RLS por enquanto (você pode habilitar depois se necessário)
ALTER TABLE public.consultation_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_reminders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences DISABLE ROW LEVEL SECURITY;

-- ==================== COMENTÁRIOS ====================

COMMENT ON TABLE public.consultation_logs IS 'Histórico de consultas e agendamentos';
COMMENT ON TABLE public.system_notifications IS 'Notificações do sistema para beneficiários';
COMMENT ON TABLE public.active_sessions IS 'Sessões ativas de consultas';
COMMENT ON TABLE public.consultation_queue IS 'Fila de espera para consultas imediatas';
COMMENT ON TABLE public.consultation_reminders IS 'Lembretes de consultas agendadas';
COMMENT ON TABLE public.user_preferences IS 'Preferências e configurações do usuário';

-- ==================== DADOS INICIAIS (OPCIONAL) ====================

-- Você pode inserir dados de teste aqui se necessário

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================

-- Para verificar se as tabelas foram criadas:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

