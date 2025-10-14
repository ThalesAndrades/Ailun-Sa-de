-- =====================================================
-- MIGRATION: Adicionar campo has_seen_onboarding
-- Data: 14 de outubro de 2025
-- Descrição: Adiciona campo para rastrear se o usuário já viu o guia da plataforma
-- =====================================================

-- Adicionar coluna has_seen_onboarding à tabela user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT FALSE;

-- Comentário na coluna
COMMENT ON COLUMN public.user_profiles.has_seen_onboarding IS 'Indica se o usuário já visualizou o guia de onboarding da plataforma';

