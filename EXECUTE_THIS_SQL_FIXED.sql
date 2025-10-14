-- ==========================================
-- AILUN SAUDE - SCHEMA COMPLETO CORRIGIDO
-- Execute este SQL no Supabase Dashboard
-- ==========================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- TABELAS PRINCIPAIS - SEM DEPENDÊNCIA AUTH.USERS
-- ==========================================

-- 1. Beneficiários (Principal)
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_uuid TEXT NOT NULL UNIQUE, -- UUID do beneficiário na RapiDoc
    cpf TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK (service_type IN ('G', 'GS', 'GSP')),
    is_primary BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    rapidoc_beneficiary_uuid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Planos de Assinatura
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_uuid TEXT NOT NULL, -- Referência direta ao UUID do beneficiário
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
    psychology_limit INTEGER DEFAULT 2,
    nutrition_limit INTEGER DEFAULT 1,
    psychology_used INTEGER DEFAULT 0,
    nutrition_used INTEGER DEFAULT 0,
    last_psychology_reset TIMESTAMPTZ,
    last_nutrition_reset TIMESTAMPTZ,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(beneficiary_uuid)
);

-- 3. Membros do Plano Familiar
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
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Histórico de Consultas
CREATE TABLE IF NOT EXISTS public.consultation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_uuid TEXT NOT NULL, -- Referência direta
    beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
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
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Avaliação
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Perfis de Usuário (Complementar)
CREATE TABLE IF NOT EXISTS public.user_profiles_ailun (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_uuid TEXT UNIQUE, -- Vinculação com beneficiário
    full_name TEXT,
    phone TEXT,
    birth_date DATE,
    avatar_url TEXT,
    rapidoc_beneficiary_uuid TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ÍNDICES
-- ==========================================

-- Beneficiaries
CREATE INDEX IF NOT EXISTS idx_beneficiaries_cpf ON public.beneficiaries(cpf);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_uuid ON public.beneficiaries(beneficiary_uuid);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_email ON public.beneficiaries(email);

-- Subscription Plans
CREATE INDEX IF NOT EXISTS idx_subscription_plans_beneficiary_uuid ON public.subscription_plans(beneficiary_uuid);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_beneficiary_id ON public.subscription_plans(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_status ON public.subscription_plans(status);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_asaas_subscription_id ON public.subscription_plans(asaas_subscription_id);

-- Plan Members
CREATE INDEX IF NOT EXISTS idx_plan_members_subscription_plan_id ON public.plan_members(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_members_beneficiary_id ON public.plan_members(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_plan_members_cpf ON public.plan_members(cpf);

-- Consultation History
CREATE INDEX IF NOT EXISTS idx_consultation_history_beneficiary_uuid ON public.consultation_history(beneficiary_uuid);
CREATE INDEX IF NOT EXISTS idx_consultation_history_beneficiary_id ON public.consultation_history(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_consultation_history_service_type ON public.consultation_history(service_type);
CREATE INDEX IF NOT EXISTS idx_consultation_history_status ON public.consultation_history(status);
CREATE INDEX IF NOT EXISTS idx_consultation_history_created_at ON public.consultation_history(created_at DESC);

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_ailun_beneficiary_uuid ON public.user_profiles_ailun(beneficiary_uuid);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles_ailun ENABLE ROW LEVEL SECURITY;

-- Políticas para beneficiaries - Usando CPF como identificador
CREATE POLICY "Users can view beneficiaries by CPF" 
ON public.beneficiaries FOR SELECT 
USING (true); -- Liberado para leitura, controle será feito na aplicação

CREATE POLICY "Service can insert beneficiaries" 
ON public.beneficiaries FOR INSERT 
WITH CHECK (true); -- Liberado para inserção via serviços

CREATE POLICY "Service can update beneficiaries" 
ON public.beneficiaries FOR UPDATE 
USING (true); -- Liberado para atualização via serviços

-- Políticas para subscription_plans
CREATE POLICY "Users can view subscription plans" 
ON public.subscription_plans FOR SELECT 
USING (true);

CREATE POLICY "Service can insert subscription plans" 
ON public.subscription_plans FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update subscription plans" 
ON public.subscription_plans FOR UPDATE 
USING (true);

-- Políticas para plan_members
CREATE POLICY "Users can view plan members" 
ON public.plan_members FOR SELECT 
USING (true);

CREATE POLICY "Service can insert plan members" 
ON public.plan_members FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update plan members" 
ON public.plan_members FOR UPDATE 
USING (true);

-- Políticas para consultation_history
CREATE POLICY "Users can view consultation history" 
ON public.consultation_history FOR SELECT 
USING (true);

CREATE POLICY "Service can insert consultation history" 
ON public.consultation_history FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update consultation history" 
ON public.consultation_history FOR UPDATE 
USING (true);

-- Políticas para user_profiles_ailun
CREATE POLICY "Users can view profiles" 
ON public.user_profiles_ailun FOR SELECT 
USING (true);

CREATE POLICY "Service can insert profiles" 
ON public.user_profiles_ailun FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service can update profiles" 
ON public.user_profiles_ailun FOR UPDATE 
USING (true);

-- ==========================================
-- TRIGGERS E FUNCTIONS
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
CREATE TRIGGER update_beneficiaries_updated_at 
BEFORE UPDATE ON public.beneficiaries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at 
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_plan_members_updated_at 
BEFORE UPDATE ON public.plan_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_history_updated_at 
BEFORE UPDATE ON public.consultation_history
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_ailun_updated_at 
BEFORE UPDATE ON public.user_profiles_ailun
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- FUNCTIONS ÚTEIS
-- ==========================================

-- Função para obter plano ativo por CPF
CREATE OR REPLACE FUNCTION get_active_plan_by_cpf(p_cpf TEXT)
RETURNS TABLE (
    plan_id UUID,
    beneficiary_uuid TEXT,
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
        sp.beneficiary_uuid,
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
    WHERE b.cpf = p_cpf
      AND sp.status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Função para obter plano ativo por beneficiary_uuid
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
    WHERE sp.beneficiary_uuid = p_beneficiary_uuid
      AND sp.status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- INSERIR DADOS DO THALES ANDRADES
-- ==========================================

-- Inserir beneficiário Thales Andrades
INSERT INTO public.beneficiaries (
    beneficiary_uuid,
    cpf,
    full_name,
    birth_date,
    email,
    phone,
    service_type,
    is_primary,
    status,
    rapidoc_beneficiary_uuid
) VALUES (
    'thales-andrades-uuid-001',
    '05034153912',
    'Thales Andrades',
    '1990-01-15',
    'thales.andrades@email.com',
    '(11) 99999-9999',
    'GS',
    true,
    'active',
    'thales-rapidoc-uuid-001'
) ON CONFLICT (cpf) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    service_type = EXCLUDED.service_type,
    updated_at = NOW();

-- Inserir plano GS Ativo para Thales
INSERT INTO public.subscription_plans (
    beneficiary_uuid,
    beneficiary_id,
    plan_name,
    service_type,
    include_clinical,
    include_specialists,
    include_psychology,
    include_nutrition,
    member_count,
    discount_percentage,
    base_price,
    total_price,
    payment_method,
    billing_cycle,
    status,
    next_billing_date,
    psychology_limit,
    nutrition_limit,
    psychology_used,
    nutrition_used
) VALUES (
    'thales-andrades-uuid-001',
    (SELECT id FROM public.beneficiaries WHERE cpf = '05034153912'),
    'Plano GS Ativo',
    'GS',
    true,  -- Clínico Geral
    true,  -- Especialistas
    false, -- Psicologia não incluída no GS
    false, -- Nutrição não incluída no GS
    1,     -- 1 membro
    0.00,  -- Sem desconto
    149.90, -- Preço base GS
    149.90, -- Preço total
    'credit_card',
    'monthly',
    'active',
    CURRENT_DATE + INTERVAL '1 month',
    0, -- Sem limite psicologia (não incluído)
    0, -- Sem limite nutrição (não incluído)
    0, -- Uso atual
    0  -- Uso atual
) ON CONFLICT (beneficiary_uuid) DO UPDATE SET
    plan_name = EXCLUDED.plan_name,
    service_type = EXCLUDED.service_type,
    include_clinical = EXCLUDED.include_clinical,
    include_specialists = EXCLUDED.include_specialists,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Inserir perfil de usuário para Thales
INSERT INTO public.user_profiles_ailun (
    beneficiary_uuid,
    full_name,
    phone,
    birth_date,
    rapidoc_beneficiary_uuid
) VALUES (
    'thales-andrades-uuid-001',
    'Thales Andrades',
    '(11) 99999-9999',
    '1990-01-15',
    'thales-rapidoc-uuid-001'
) ON CONFLICT (beneficiary_uuid) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- ==========================================
-- VIEW PARA CONSULTAS FACILITADAS
-- ==========================================

-- View para visualizar planos com beneficiários
CREATE OR REPLACE VIEW public.v_beneficiary_plans AS
SELECT 
    b.id AS beneficiary_id,
    b.beneficiary_uuid,
    b.cpf,
    b.full_name AS beneficiary_name,
    b.email,
    b.phone,
    b.service_type AS beneficiary_service_type,
    b.status AS beneficiary_status,
    
    sp.id AS plan_id,
    sp.plan_name,
    sp.service_type AS plan_service_type,
    sp.include_clinical,
    sp.include_specialists,
    sp.include_psychology,
    sp.include_nutrition,
    sp.member_count,
    sp.total_price,
    sp.status AS plan_status,
    sp.next_billing_date,
    sp.psychology_limit,
    sp.psychology_used,
    (sp.psychology_limit - sp.psychology_used) AS psychology_available,
    sp.nutrition_limit,
    sp.nutrition_used,
    (sp.nutrition_limit - sp.nutrition_used) AS nutrition_available,
    
    sp.created_at AS plan_created_at,
    sp.updated_at AS plan_updated_at
FROM public.beneficiaries b
LEFT JOIN public.subscription_plans sp ON b.id = sp.beneficiary_id;

-- ==========================================
-- VERIFICAÇÃO FINAL
-- ==========================================

-- Listar todas as tabelas criadas
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'beneficiaries',
    'subscription_plans', 
    'plan_members',
    'consultation_history',
    'user_profiles_ailun'
)
ORDER BY table_name;

-- Verificar se Thales foi inserido corretamente
SELECT 
    b.full_name,
    b.cpf,
    b.service_type,
    sp.plan_name,
    sp.status AS plan_status,
    sp.include_clinical,
    sp.include_specialists
FROM public.beneficiaries b
LEFT JOIN public.subscription_plans sp ON b.id = sp.beneficiary_id
WHERE b.cpf = '05034153912';

-- Verificar total de registros
SELECT 
    'beneficiaries' AS tabela, COUNT(*) AS total
FROM public.beneficiaries
UNION ALL
SELECT 
    'subscription_plans' AS tabela, COUNT(*) AS total
FROM public.subscription_plans
UNION ALL
SELECT 
    'user_profiles_ailun' AS tabela, COUNT(*) AS total
FROM public.user_profiles_ailun;

-- ==========================================
-- CONCLUÍDO!
-- SQL corrigido e executável no Supabase
-- ==========================================