-- Migração para adicionar campo de aceite de termos ao perfil do usuário
-- Data: 2025-10-14

-- Adicionar campo terms_accepted à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;

-- Adicionar campo terms_accepted_at para registrar quando o usuário aceitou os termos
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para melhorar a performance de consultas
CREATE INDEX IF NOT EXISTS idx_profiles_terms_accepted ON public.profiles(terms_accepted);

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.terms_accepted IS 'Indica se o usuário aceitou os Termos de Uso e Política de Privacidade';
COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'Data e hora em que o usuário aceitou os termos';

