-- =====================================================
-- SCRIPT: Atualizar Todos os Beneficiários para ServiceType GS
-- e Criar Planos Ativos
-- =====================================================
-- Este script:
-- 1. Atualiza todos os beneficiários existentes para serviceType "GS"
-- 2. Cria planos de assinatura ativos para beneficiários sem plano
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PARTE 1: Atualizar serviceType de todos os beneficiários para "GS"
-- =====================================================

DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Atualizar todos os beneficiários para serviceType "GS"
  UPDATE public.beneficiaries
  SET 
    service_type = 'GS',
    updated_at = NOW()
  WHERE service_type != 'GS' OR service_type IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RAISE NOTICE '✅ Atualizado serviceType de % beneficiários para "GS"', updated_count;
END $$;

-- =====================================================
-- PARTE 2: Criar planos ativos para beneficiários sem plano
-- =====================================================

DO $$
DECLARE
  beneficiary_record RECORD;
  created_count INTEGER := 0;
  skipped_count INTEGER := 0;
BEGIN
  -- Iterar sobre todos os beneficiários
  FOR beneficiary_record IN 
    SELECT 
      b.id AS beneficiary_id,
      b.user_id,
      b.full_name,
      b.cpf,
      b.service_type
    FROM public.beneficiaries b
    LEFT JOIN public.subscription_plans sp 
      ON b.id = sp.beneficiary_id AND sp.status = 'active'
    WHERE sp.id IS NULL
  LOOP
    BEGIN
      -- Criar plano de assinatura para o beneficiário
      INSERT INTO public.subscription_plans (
        user_id,
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
        billing_cycle,
        status,
        psychology_limit,
        nutrition_limit,
        psychology_used,
        nutrition_used,
        created_at,
        updated_at
      ) VALUES (
        beneficiary_record.user_id,
        beneficiary_record.beneficiary_id,
        'Clínico + Especialistas',  -- Nome do plano
        'GS',                        -- ServiceType
        true,                        -- include_clinical
        true,                        -- include_specialists
        false,                       -- include_psychology
        false,                       -- include_nutrition
        1,                           -- member_count
        0.00,                        -- discount_percentage
        79.90,                       -- base_price (Clínico + Especialistas)
        79.90,                       -- total_price
        'monthly',                   -- billing_cycle
        'active',                    -- status
        2,                           -- psychology_limit
        1,                           -- nutrition_limit
        0,                           -- psychology_used
        0,                           -- nutrition_used
        NOW(),
        NOW()
      );
      
      created_count := created_count + 1;
      RAISE NOTICE '✅ Plano criado para beneficiário: % (CPF: %)', 
        beneficiary_record.full_name, 
        beneficiary_record.cpf;
        
    EXCEPTION WHEN OTHERS THEN
      skipped_count := skipped_count + 1;
      RAISE NOTICE '⚠️  Erro ao criar plano para beneficiário: % (CPF: %) - Erro: %', 
        beneficiary_record.full_name, 
        beneficiary_record.cpf,
        SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 RESUMO DA EXECUÇÃO';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Planos criados com sucesso: %', created_count;
  RAISE NOTICE '⚠️  Planos não criados (erros): %', skipped_count;
  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- PARTE 3: Verificação pós-execução
-- =====================================================

-- Verificar beneficiários e seus planos
SELECT 
  b.full_name AS "Nome do Beneficiário",
  b.cpf AS "CPF",
  b.service_type AS "ServiceType",
  CASE 
    WHEN sp.id IS NOT NULL THEN '✅ Sim'
    ELSE '❌ Não'
  END AS "Plano Ativo",
  sp.plan_name AS "Nome do Plano",
  sp.total_price AS "Valor do Plano"
FROM public.beneficiaries b
LEFT JOIN public.subscription_plans sp 
  ON b.id = sp.beneficiary_id AND sp.status = 'active'
ORDER BY b.full_name;

-- Estatísticas gerais
SELECT 
  COUNT(*) AS "Total de Beneficiários",
  COUNT(CASE WHEN b.service_type = 'GS' THEN 1 END) AS "ServiceType GS",
  COUNT(sp.id) AS "Com Plano Ativo",
  COUNT(*) - COUNT(sp.id) AS "Sem Plano Ativo"
FROM public.beneficiaries b
LEFT JOIN public.subscription_plans sp 
  ON b.id = sp.beneficiary_id AND sp.status = 'active';

