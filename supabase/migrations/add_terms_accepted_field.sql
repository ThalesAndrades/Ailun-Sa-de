-- =====================================================
-- MIGRATION: Adicionar campos de termos aceitos
-- Data: 14 de outubro de 2025
-- Descrição: Adiciona campos terms_accepted e terms_accepted_at à tabela profiles
-- =====================================================

-- Verificar se a tabela profiles existe (usar user_profiles se necessário)
DO $$
DECLARE
    table_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        -- Adicionar campos à tabela profiles
        ALTER TABLE public.profiles
        ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
        
        ALTER TABLE public.profiles
        ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        
        -- Comentários nas colunas
        COMMENT ON COLUMN public.profiles.terms_accepted IS 'Indica se o usuário aceitou os termos de uso';
        COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'Data e hora em que os termos foram aceitos';
        
        RAISE NOTICE 'Campos adicionados à tabela profiles com sucesso';
    ELSE
        RAISE NOTICE 'Tabela profiles não encontrada, verificando user_profiles...';
        
        -- Verificar se existe user_profiles (nome alternativo)
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles'
        ) INTO table_exists;
        
        IF table_exists THEN
            -- Adicionar campos à tabela user_profiles
            ALTER TABLE public.user_profiles
            ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE;
            
            ALTER TABLE public.user_profiles
            ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
            
            -- Comentários nas colunas
            COMMENT ON COLUMN public.user_profiles.terms_accepted IS 'Indica se o usuário aceitou os termos de uso';
            COMMENT ON COLUMN public.user_profiles.terms_accepted_at IS 'Data e hora em que os termos foram aceitos';
            
            RAISE NOTICE 'Campos adicionados à tabela user_profiles com sucesso';
        ELSE
            RAISE EXCEPTION 'Nenhuma tabela de perfis de usuário encontrada (profiles ou user_profiles)';
        END IF;
    END IF;
END $$;

-- =====================================================
-- FUNÇÃO AUXILIAR: Aceitar Termos
-- =====================================================

CREATE OR REPLACE FUNCTION accept_terms(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
    table_exists boolean;
BEGIN
    -- Verificar qual tabela existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        UPDATE public.profiles 
        SET 
            terms_accepted = TRUE,
            terms_accepted_at = NOW(),
            updated_at = NOW()
        WHERE id = user_id_param;
    ELSE
        UPDATE public.user_profiles 
        SET 
            terms_accepted = TRUE,
            terms_accepted_at = NOW()
        WHERE id = user_id_param;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário na função
COMMENT ON FUNCTION accept_terms(UUID) IS 'Marca os termos como aceitos para um usuário específico';
