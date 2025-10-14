-- =====================================================
-- SCHEMA ATUALIZADO - BENEFICIÁRIOS E PLANOS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- TABELA: beneficiaries
-- Informações dos beneficiários da RapiDoc
-- =====================================================
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  beneficiary_uuid TEXT NOT NULL UNIQUE, -- UUID do beneficiário na RapiDoc
  cpf TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('G', 'GS', 'GSP')),
  is_primary BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para beneficiaries
CREATE INDEX idx_beneficiaries_user_id ON public.beneficiaries(user_id);
CREATE INDEX idx_beneficiaries_cpf ON public.beneficiaries(cpf);
CREATE INDEX idx_beneficiaries_uuid ON public.beneficiaries(beneficiary_uuid);

-- RLS Policies para beneficiaries
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own beneficiaries"
  ON public.beneficiaries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own beneficiaries"
  ON public.beneficiaries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own beneficiaries"
  ON public.beneficiaries FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABELA: subscription_plans
-- Planos de assinatura dos usuários
-- =====================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  
  -- Informações do plano
  plan_name TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('G', 'GS', 'GSP')),
  
  -- Serviços incluídos
  include_clinical BOOLEAN DEFAULT true,
  include_specialists BOOLEAN DEFAULT false,
  include_psychology BOOLEAN DEFAULT false,
  include_nutrition BOOLEAN DEFAULT false,
  
  -- Membros e descontos
  member_count INTEGER DEFAULT 1 CHECK (member_count >= 1 AND member_count <= 10),
  discount_percentage DECIMAL(5,2) DEFAULT 0.00,
  
  -- Valores
  base_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  -- Informações de pagamento
  asaas_customer_id TEXT,
  asaas_subscription_id TEXT,
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'pix', 'boleto')),
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'quarterly', 'yearly')),
  
  -- Status da assinatura
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'cancelled', 'expired')),
  next_billing_date DATE,
  
  -- Limites de uso
  psychology_limit INTEGER DEFAULT 2, -- consultas por mês
  nutrition_limit INTEGER DEFAULT 1, -- consultas a cada 3 meses
  psychology_used INTEGER DEFAULT 0,
  nutrition_used INTEGER DEFAULT 0,
  last_psychology_reset TIMESTAMP WITH TIME ZONE,
  last_nutrition_reset TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, beneficiary_id)
);

-- Índices para subscription_plans
CREATE INDEX idx_subscription_plans_user_id ON public.subscription_plans(user_id);
CREATE INDEX idx_subscription_plans_beneficiary_id ON public.subscription_plans(beneficiary_id);
CREATE INDEX idx_subscription_plans_status ON public.subscription_plans(status);
CREATE INDEX idx_subscription_plans_asaas_subscription_id ON public.subscription_plans(asaas_subscription_id);

-- RLS Policies para subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription plans"
  ON public.subscription_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription plans"
  ON public.subscription_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription plans"
  ON public.subscription_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABELA: plan_members
-- Membros adicionais do plano familiar
-- =====================================================
CREATE TABLE IF NOT EXISTS public.plan_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  
  -- Informações do membro
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date DATE NOT NULL,
  relationship TEXT, -- Ex: cônjuge, filho, pai, mãe
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para plan_members
CREATE INDEX idx_plan_members_subscription_plan_id ON public.plan_members(subscription_plan_id);
CREATE INDEX idx_plan_members_beneficiary_id ON public.plan_members(beneficiary_id);
CREATE INDEX idx_plan_members_cpf ON public.plan_members(cpf);

-- RLS Policies para plan_members
ALTER TABLE public.plan_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plan members"
  ON public.plan_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.subscription_plans
      WHERE subscription_plans.id = plan_members.subscription_plan_id
      AND subscription_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own plan members"
  ON public.plan_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.subscription_plans
      WHERE subscription_plans.id = plan_members.subscription_plan_id
      AND subscription_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own plan members"
  ON public.plan_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.subscription_plans
      WHERE subscription_plans.id = plan_members.subscription_plan_id
      AND subscription_plans.user_id = auth.uid()
    )
  );

-- =====================================================
-- TABELA: consultation_history
-- Histórico detalhado de consultas por beneficiário
-- =====================================================
CREATE TABLE IF NOT EXISTS public.consultation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  subscription_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  
  -- Informações da consulta
  service_type TEXT NOT NULL CHECK (service_type IN ('clinical', 'specialist', 'psychology', 'nutrition')),
  specialty TEXT,
  professional_name TEXT,
  professional_id TEXT,
  
  -- Detalhes da sessão
  session_id TEXT,
  consultation_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled', 'no_show')),
  
  -- Timestamps
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Avaliação
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultation_history
CREATE INDEX idx_consultation_history_beneficiary_id ON public.consultation_history(beneficiary_id);
CREATE INDEX idx_consultation_history_subscription_plan_id ON public.consultation_history(subscription_plan_id);
CREATE INDEX idx_consultation_history_service_type ON public.consultation_history(service_type);
CREATE INDEX idx_consultation_history_status ON public.consultation_history(status);
CREATE INDEX idx_consultation_history_created_at ON public.consultation_history(created_at DESC);

-- RLS Policies para consultation_history
ALTER TABLE public.consultation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultation history"
  ON public.consultation_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.beneficiaries
      WHERE beneficiaries.id = consultation_history.beneficiary_id
      AND beneficiaries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own consultation history"
  ON public.consultation_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.beneficiaries
      WHERE beneficiaries.id = consultation_history.beneficiary_id
      AND beneficiaries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own consultation history"
  ON public.consultation_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.beneficiaries
      WHERE beneficiaries.id = consultation_history.beneficiary_id
      AND beneficiaries.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Função para resetar limites mensais de psicologia
CREATE OR REPLACE FUNCTION reset_psychology_limits()
RETURNS void AS $$
BEGIN
  UPDATE public.subscription_plans
  SET 
    psychology_used = 0,
    last_psychology_reset = NOW()
  WHERE 
    include_psychology = true
    AND (
      last_psychology_reset IS NULL
      OR last_psychology_reset < DATE_TRUNC('month', NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- Função para resetar limites trimestrais de nutrição
CREATE OR REPLACE FUNCTION reset_nutrition_limits()
RETURNS void AS $$
BEGIN
  UPDATE public.subscription_plans
  SET 
    nutrition_used = 0,
    last_nutrition_reset = NOW()
  WHERE 
    include_nutrition = true
    AND (
      last_nutrition_reset IS NULL
      OR last_nutrition_reset < DATE_TRUNC('month', NOW()) - INTERVAL '3 months'
    );
END;
$$ LANGUAGE plpgsql;

-- Função para obter o plano ativo de um beneficiário
CREATE OR REPLACE FUNCTION get_active_plan(p_beneficiary_uuid TEXT)
RETURNS TABLE (
  plan_id UUID,
  service_type TEXT,
  include_clinical BOOLEAN,
  include_specialists BOOLEAN,
  include_psychology BOOLEAN,
  include_nutrition BOOLEAN,
  psychology_available INTEGER,
  nutrition_available INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id AS plan_id,
    sp.service_type,
    sp.include_clinical,
    sp.include_specialists,
    sp.include_psychology,
    sp.include_nutrition,
    (sp.psychology_limit - sp.psychology_used) AS psychology_available,
    (sp.nutrition_limit - sp.nutrition_used) AS nutrition_available,
    sp.status
  FROM public.subscription_plans sp
  INNER JOIN public.beneficiaries b ON b.id = sp.beneficiary_id
  WHERE b.beneficiary_uuid = p_beneficiary_uuid
    AND sp.status = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar uso de serviço
CREATE OR REPLACE FUNCTION increment_service_usage(
  p_beneficiary_uuid TEXT,
  p_service_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_id UUID;
  v_current_used INTEGER;
  v_limit INTEGER;
BEGIN
  -- Buscar plano ativo
  SELECT sp.id INTO v_plan_id
  FROM public.subscription_plans sp
  INNER JOIN public.beneficiaries b ON b.id = sp.beneficiary_id
  WHERE b.beneficiary_uuid = p_beneficiary_uuid
    AND sp.status = 'active'
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Incrementar uso baseado no tipo de serviço
  IF p_service_type = 'psychology' THEN
    UPDATE public.subscription_plans
    SET psychology_used = psychology_used + 1
    WHERE id = v_plan_id
      AND psychology_used < psychology_limit;
    
    RETURN FOUND;
    
  ELSIF p_service_type = 'nutrition' THEN
    UPDATE public.subscription_plans
    SET nutrition_used = nutrition_used + 1
    WHERE id = v_plan_id
      AND nutrition_used < nutrition_limit;
    
    RETURN FOUND;
  END IF;
  
  -- Serviços ilimitados (clinical, specialist)
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para atualizar updated_at em beneficiaries
CREATE TRIGGER update_beneficiaries_updated_at
  BEFORE UPDATE ON public.beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em subscription_plans
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em plan_members
CREATE TRIGGER update_plan_members_updated_at
  BEFORE UPDATE ON public.plan_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em consultation_history
CREATE TRIGGER update_consultation_history_updated_at
  BEFORE UPDATE ON public.consultation_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

-- View para visualizar planos com informações de beneficiários
CREATE OR REPLACE VIEW public.v_user_plans AS
SELECT 
  sp.id AS plan_id,
  sp.user_id,
  b.beneficiary_uuid,
  b.full_name AS beneficiary_name,
  b.cpf,
  sp.plan_name,
  sp.service_type,
  sp.include_clinical,
  sp.include_specialists,
  sp.include_psychology,
  sp.include_nutrition,
  sp.member_count,
  sp.discount_percentage,
  sp.total_price,
  sp.status AS plan_status,
  sp.next_billing_date,
  sp.psychology_limit,
  sp.psychology_used,
  (sp.psychology_limit - sp.psychology_used) AS psychology_available,
  sp.nutrition_limit,
  sp.nutrition_used,
  (sp.nutrition_limit - sp.nutrition_used) AS nutrition_available,
  sp.created_at,
  sp.updated_at
FROM public.subscription_plans sp
INNER JOIN public.beneficiaries b ON b.id = sp.beneficiary_id;

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Comentário: Inserir dados de teste se necessário
-- INSERT INTO public.beneficiaries (...) VALUES (...);

