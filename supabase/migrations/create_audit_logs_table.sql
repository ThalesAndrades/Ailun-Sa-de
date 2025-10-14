-- =====================================================
-- TABELA: audit_logs
-- Sistema de Auditoria para rastreamento de eventos críticos
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação do evento
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login_success',
    'login_failure',
    'logout',
    'signup_started',
    'signup_completed',
    'signup_failed',
    'beneficiary_created',
    'beneficiary_updated',
    'plan_assigned',
    'plan_updated',
    'plan_cancelled',
    'consultation_requested',
    'consultation_scheduled',
    'consultation_cancelled',
    'consultation_completed',
    'payment_initiated',
    'payment_success',
    'payment_failed',
    'profile_updated',
    'password_changed',
    'password_reset_requested',
    'data_export_requested',
    'data_deleted'
  )),
  
  -- Dados do usuário
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  
  -- Dados do evento
  event_data JSONB DEFAULT '{}',
  
  -- Status do evento
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending', 'cancelled')),
  error_message TEXT,
  error_stack TEXT,
  
  -- Informações de contexto
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  platform TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Índices para audit_logs
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_event_type ON public.audit_logs(event_type);
CREATE INDEX idx_audit_logs_status ON public.audit_logs(status);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user_email ON public.audit_logs(user_email);

-- Índice composto para consultas comuns
CREATE INDEX idx_audit_logs_user_event ON public.audit_logs(user_id, event_type, created_at DESC);

-- RLS Policies para audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas administradores podem visualizar todos os logs
CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Usuários podem visualizar apenas seus próprios logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Sistema pode inserir logs (usando service_role)
CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para limpar logs antigos (manter apenas últimos 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.audit_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de auditoria
CREATE OR REPLACE FUNCTION get_audit_statistics(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  event_type TEXT,
  total_count BIGINT,
  success_count BIGINT,
  failure_count BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.event_type,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE al.status = 'success') as success_count,
    COUNT(*) FILTER (WHERE al.status = 'failure') as failure_count,
    COUNT(DISTINCT al.user_id) as unique_users
  FROM public.audit_logs al
  WHERE al.created_at BETWEEN p_start_date AND p_end_date
  GROUP BY al.event_type
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter logs de um usuário específico
CREATE OR REPLACE FUNCTION get_user_audit_trail(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  event_type TEXT,
  status TEXT,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.event_type,
    al.status,
    al.event_data,
    al.created_at
  FROM public.audit_logs al
  WHERE al.user_id = p_user_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.audit_logs IS 'Tabela de auditoria para rastreamento de eventos críticos do sistema';
COMMENT ON COLUMN public.audit_logs.event_type IS 'Tipo de evento auditado';
COMMENT ON COLUMN public.audit_logs.user_id IS 'ID do usuário que gerou o evento';
COMMENT ON COLUMN public.audit_logs.event_data IS 'Dados adicionais do evento em formato JSON';
COMMENT ON COLUMN public.audit_logs.status IS 'Status do evento (success, failure, pending, cancelled)';
COMMENT ON COLUMN public.audit_logs.ip_address IS 'Endereço IP de origem do evento';
COMMENT ON COLUMN public.audit_logs.user_agent IS 'User agent do navegador/dispositivo';

