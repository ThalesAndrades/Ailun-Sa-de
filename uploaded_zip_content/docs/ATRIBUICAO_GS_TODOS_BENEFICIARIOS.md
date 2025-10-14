# Atribuição de ServiceType GS para Todos os Beneficiários

## 1. Objetivo

Este documento descreve o processo de atribuição do `serviceType` **"GS" (Clínico + Especialistas)** para todos os beneficiários existentes na plataforma AiLun Saúde, além da criação de planos de assinatura ativos para aqueles que ainda não possuem.

## 2. ServiceType GS - Clínico + Especialistas

O `serviceType` "GS" oferece os seguintes serviços:

*   **Clínico 24h (G)**: Atendimento médico clínico geral disponível 24 horas por dia, 7 dias por semana.
*   **Especialistas (S)**: Acesso a consultas com médicos especialistas de diversas áreas.

**Nota**: A nutrição é considerada uma especialidade dentro do plano GS, mas é cobrada separadamente na plataforma.

## 3. Valores do Plano GS

*   **Valor Base**: R$ 79,90 por mês (para 1 membro)
*   **Descontos Progressivos**: Aplicados conforme o número de membros adicionados ao plano familiar.

## 4. Script SQL de Atribuição

O script SQL `update_all_beneficiaries_to_gs.sql` foi criado para automatizar o processo de atribuição. Ele realiza as seguintes operações:

### 4.1. Parte 1: Atualizar ServiceType

Atualiza o campo `service_type` de todos os beneficiários na tabela `beneficiaries` para "GS", garantindo consistência dos dados.

### 4.2. Parte 2: Criar Planos Ativos

Para cada beneficiário que não possui um plano ativo na tabela `subscription_plans`, o script cria um novo registro com as seguintes configurações:

*   **Nome do Plano**: "Clínico + Especialistas"
*   **ServiceType**: "GS"
*   **Serviços Incluídos**:
    *   `include_clinical`: `true`
    *   `include_specialists`: `true`
    *   `include_psychology`: `false`
    *   `include_nutrition`: `false`
*   **Valores**:
    *   `base_price`: R$ 79,90
    *   `total_price`: R$ 79,90
*   **Status**: `active`
*   **Ciclo de Cobrança**: `monthly` (mensal)
*   **Limites de Uso**:
    *   `psychology_limit`: 2 consultas por mês (não aplicável para GS, mas mantido para futura expansão)
    *   `nutrition_limit`: 1 consulta a cada 3 meses (não aplicável para GS, mas mantido para futura expansão)

### 4.3. Parte 3: Verificação Pós-Execução

O script inclui consultas de verificação para confirmar que:

*   Todos os beneficiários têm `service_type` = "GS"
*   Todos os beneficiários possuem um plano ativo
*   Estatísticas gerais estão corretas

## 5. Como Executar o Script

### 5.1. Acesso ao Supabase SQL Editor

1.  Acesse o [Supabase Dashboard](https://app.supabase.com/)
2.  Selecione seu projeto AiLun Saúde
3.  No menu lateral, clique em **SQL Editor**

### 5.2. Executar o Script

1.  Clique em **New query** para criar uma nova consulta
2.  Copie todo o conteúdo do arquivo `supabase/migrations/update_all_beneficiaries_to_gs.sql`
3.  Cole no editor SQL
4.  Clique em **Run** para executar o script

### 5.3. Monitorar a Execução

O script fornecerá feedback em tempo real através de mensagens `RAISE NOTICE`, incluindo:

*   Número de beneficiários atualizados
*   Planos criados com sucesso
*   Erros encontrados (se houver)
*   Resumo final da execução

### 5.4. Verificar os Resultados

Após a execução, o script exibirá automaticamente:

*   Uma tabela com todos os beneficiários e seus planos
*   Estatísticas gerais (total de beneficiários, com/sem plano ativo)

## 6. Resultados Esperados

Após a execução bem-sucedida do script:

*   **Todos os beneficiários** terão `service_type` = "GS"
*   **Todos os beneficiários** terão um plano ativo na tabela `subscription_plans`
*   **Consistência de dados** entre as tabelas `beneficiaries` e `subscription_plans`

## 7. Tratamento de Erros

O script possui tratamento de erros robusto:

*   **Erros individuais**: Se houver um erro ao criar um plano para um beneficiário específico, o script registrará o erro e continuará com os demais beneficiários.
*   **Resumo de erros**: Ao final, o script exibirá quantos planos foram criados com sucesso e quantos falharam.

## 8. Rollback (Desfazer Alterações)

Se necessário desfazer as alterações, você pode executar as seguintes consultas SQL:

```sql
-- Remover planos criados pelo script (CUIDADO: isso removerá TODOS os planos ativos)
DELETE FROM public.subscription_plans
WHERE plan_name = 'Clínico + Especialistas' 
  AND service_type = 'GS' 
  AND status = 'active';

-- Reverter serviceType dos beneficiários (ajuste conforme necessário)
UPDATE public.beneficiaries
SET service_type = 'G'  -- ou outro valor padrão
WHERE service_type = 'GS';
```

**⚠️ ATENÇÃO**: Execute o rollback apenas se estiver absolutamente certo de que deseja desfazer as alterações, pois isso pode afetar o acesso dos usuários à plataforma.

## 9. Próximos Passos

Após a atribuição de GS para todos os beneficiários:

1.  **Sincronizar com a Rapidoc**: Considere fazer chamadas PUT para a API da Rapidoc para atualizar o `serviceType` de cada beneficiário também na plataforma externa.
2.  **Comunicar aos Usuários**: Informe os usuários sobre a atualização de seus planos e os novos serviços disponíveis.
3.  **Monitorar o Uso**: Acompanhe o uso dos serviços para garantir que os limites e configurações estão adequados.

## 10. Conclusão

Este processo garante que todos os beneficiários da plataforma AiLun Saúde tenham um plano ativo e consistente, com acesso aos serviços de Clínico 24h e Especialistas (serviceType GS). A execução do script é segura, com tratamento de erros e verificações pós-execução para garantir a integridade dos dados.

