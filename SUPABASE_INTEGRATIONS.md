# Integrações Supabase no Projeto Ailun-Sa-de

Este documento detalha as integrações do projeto Ailun-Sa-de com o Supabase, identificadas através da análise dos arquivos do projeto.

## Arquivos e suas Funções:

### `hooks/useAuth.ts`
- **Função:** Gerencia sessões de autenticação de usuários.
- **Detalhes:** Utiliza `@supabase/supabase-js` para interagir com o sistema de autenticação do Supabase, controlando o estado da sessão e do usuário.

### `scripts/assign-subscriptions-to-beneficiaries.ts`
- **Função:** Script para atribuir assinaturas a beneficiários.
- **Detalhes:** Faz chamadas para a API da Rapidoc para obter `serviceType` e, em seguida, atualiza as assinaturas no Supabase. Utiliza `createClient` de `@supabase/supabase-js` para interagir com o banco de dados.

### `services/audit-service.ts`
- **Função:** Serviço para registrar eventos críticos do sistema.
- **Detalhes:** Permite rastreamento, análise e conformidade com requisitos de auditoria, registrando eventos diretamente no Supabase. Utiliza `createClient` de `@supabase/supabase-js`.

### `services/subscription-plan-service.ts`
- **Função:** Gerencia a criação, atualização e consulta de planos de assinatura.
- **Detalhes:** Interage com o Supabase para persistir e recuperar informações sobre planos de assinatura. Utiliza `createClient` de `@supabase/supabase-js`.

### `services/supabase.ts`
- **Função:** Configuração centralizada do cliente Supabase.
- **Detalhes:** Exporta uma instância configurada do cliente Supabase (`supabase`) utilizando `createClient` e as variáveis de ambiente `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

### `supabase/functions/asaas-webhook/index.ts`
- **Função:** Função Edge do Supabase para lidar com webhooks do Asaas.
- **Detalhes:** Recebe e processa eventos de webhook do Asaas, interagindo com o Supabase para atualizar dados relacionados a pagamentos e assinaturas. Utiliza `createClient` de `https://esm.sh/@supabase/supabase-js@2`.

### `supabase/functions/orchestrator/index.ts`
- **Função:** Função Edge do Supabase para orquestração geral.
- **Detalhes:** Provavelmente coordena diferentes processos ou serviços dentro do ecossistema do aplicativo. Utiliza `createClient` de `https://esm.sh/@supabase/supabase-js@2`.

### `supabase/functions/rapidoc/index.ts`
- **Função:** Função Edge do Supabase para integração com Rapidoc.
- **Detalhes:** Processa dados ou requisições relacionadas à Rapidoc, interagindo com o Supabase. Utiliza `createClient` de `https://esm.sh/@supabase/supabase-js@2`.

### `supabase/functions/tema-orchestrator/index.ts`
- **Função:** Outra Função Edge do Supabase para orquestração.
- **Detalhes:** Similar ao `orchestrator/index.ts`, mas possivelmente com um escopo diferente ou para um tema específico. Utiliza `createClient` de `https://esm.sh/@supabase/supabase-js@2`.

## Próximos Passos:

Com base nesta documentação, os próximos passos incluirão:
1. Revisar a lógica de cada integração para identificar pontos de melhoria de performance, segurança e robustez.
2. Garantir que as variáveis de ambiente do Supabase estejam configuradas corretamente em todos os ambientes (desenvolvimento, staging, produção).
3. Verificar a consistência dos esquemas de banco de dados e políticas de RLS (Row Level Security) no Supabase.
4. Otimizar as consultas e mutações realizadas no Supabase para garantir eficiência.
5. Implementar testes para as funções Edge e serviços que interagem com o Supabase.


## Ajustes no Esquema do Supabase

Foram realizadas as seguintes alterações nos arquivos de esquema SQL do Supabase para garantir consistência e evitar duplicação:

1.  **`supabase/schema.sql`**:
    *   A tabela `user_profiles` foi renomeada para `profiles`.
    *   Todas as referências a `user_profiles` (criação da tabela, RLS policies, triggers e função `handle_new_user`) foram atualizadas para `profiles`.

2.  **`supabase/schema_cpf_auth.sql`**:
    *   A definição da tabela `user_preferences` foi removida, pois já existe uma tabela similar (`user_preferences`) no esquema principal (`schema.sql`).
    *   As referências a `user_preferences` (triggers e RLS policies) também foram removidas deste arquivo.

3.  **`supabase/schema_payments.sql`**:
    *   As referências à tabela `user_profiles` nas cláusulas `ALTER TABLE` e `CREATE INDEX` foram atualizadas para `profiles`.
    *   Os comentários (`COMMENT ON COLUMN`) que faziam referência a `user_profiles` foram atualizados para `profiles`.

**Ação Necessária:**
Para que essas alterações tenham efeito, é **essencial que o usuário aplique manualmente** essas modificações no editor SQL do painel do Supabase ou execute os scripts SQL atualizados. Caso contrário, o banco de dados pode não estar sincronizado com o código-fonte, causando erros.

