# Guia de Execução do Script de Atribuição de Assinaturas

## 1. Objetivo

Este documento fornece instruções detalhadas para executar o script `assign-subscriptions-to-beneficiaries.ts`, que atribui assinaturas a beneficiários existentes na plataforma AiLun Saúde que não possuem um plano ativo.

## 2. Pré-requisitos

Antes de executar o script, certifique-se de que:

1.  **Node.js e npm estão instalados**: O script requer Node.js (versão 22.13.0 ou superior) e npm.
2.  **Dependências do projeto estão instaladas**: Execute `npm install` ou `pnpm install` no diretório raiz do projeto.
3.  **Variáveis de ambiente estão configuradas**: As seguintes variáveis de ambiente devem estar definidas:
    *   `SUPABASE_URL`: URL do seu projeto Supabase
    *   `SUPABASE_ANON_KEY`: Chave anônima do Supabase
    *   `RAPIDOC_API_KEY`: Chave de API da Rapidoc para autenticação

4.  **Acesso ao Supabase**: Você deve ter acesso ao projeto Supabase e as tabelas `beneficiaries` e `subscription_plans` devem estar criadas conforme o schema `schema_beneficiary_plans.sql`.

## 3. Estrutura do Script

O script `assign-subscriptions-to-beneficiaries.ts` realiza as seguintes operações:

1.  **Buscar beneficiários sem plano ativo**: Consulta o Supabase para identificar todos os beneficiários que não possuem um registro na tabela `subscription_plans` com status `active`.
2.  **Atualizar beneficiário na Rapidoc**: Para cada beneficiário sem plano, faz uma chamada `PUT` para a API da Rapidoc (`https://api.rapidoc.tech/tema/api/beneficiaries/:uuid`) com o `serviceType` padrão "GS" (Clínico + Especialistas).
3.  **Obter serviceType real**: Lê o `serviceType` retornado pela API da Rapidoc.
4.  **Criar plano no Supabase**: Com base no `serviceType` retornado, cria um novo registro na tabela `subscription_plans` com as configurações apropriadas.
5.  **Atualizar serviceType do beneficiário**: Atualiza o campo `service_type` do beneficiário na tabela `beneficiaries` para refletir o `serviceType` real.

## 4. Como Executar o Script

### 4.1. Compilar o Script (se necessário)

Se o projeto usar TypeScript e não tiver um transpilador configurado, você pode precisar compilar o script primeiro:

```bash
npx tsc scripts/assign-subscriptions-to-beneficiaries.ts
```

### 4.2. Executar o Script

Execute o script usando Node.js:

```bash
node scripts/assign-subscriptions-to-beneficiaries.js
```

Ou, se estiver usando `ts-node` para executar diretamente TypeScript:

```bash
npx ts-node scripts/assign-subscriptions-to-beneficiaries.ts
```

### 4.3. Monitorar a Execução

O script fornece feedback detalhado durante a execução, incluindo:

*   Número de beneficiários sem plano ativo encontrados
*   Progresso do processamento de cada beneficiário
*   ServiceType obtido da Rapidoc para cada beneficiário
*   Sucesso ou falha na criação de planos
*   Resumo final com contagem de sucessos e erros

Exemplo de saída:

```
🚀 Iniciando processo de atribuição de assinaturas...

📋 Buscando beneficiários sem plano ativo...
✅ Encontrados 5 beneficiários sem plano ativo

🔄 Processando: João da Silva (123.456.789-00)
   UUID: rapidoc-uuid-abc
   ✅ ServiceType obtido da Rapidoc: GS
✅ Plano criado para beneficiário João da Silva (123.456.789-00)

...

============================================================
📊 RESUMO DO PROCESSAMENTO
============================================================
Total de beneficiários processados: 5
✅ Sucesso: 5
❌ Erros: 0
============================================================

✅ Processo concluído com sucesso!
```

## 5. Tratamento de Erros

O script possui tratamento de erros robusto:

*   **Erro na chamada à Rapidoc**: Se a chamada `PUT` para a Rapidoc falhar, o script usará o `serviceType` padrão "GS" e continuará o processamento.
*   **Erro na criação do plano**: Se houver um erro ao criar o plano no Supabase, o script registrará o erro e continuará com o próximo beneficiário.
*   **Erro fatal**: Se ocorrer um erro fatal (ex: falha na conexão com o Supabase), o script será interrompido e exibirá uma mensagem de erro.

## 6. Verificação Pós-Execução

Após a execução do script, você deve verificar:

1.  **Tabela `subscription_plans`**: Confirme que novos registros foram criados para os beneficiários processados, com status `active`.
2.  **Tabela `beneficiaries`**: Verifique se o campo `service_type` foi atualizado para refletir o `serviceType` real obtido da Rapidoc.
3.  **Logs do script**: Revise os logs para identificar quaisquer erros ou avisos.

## 7. Considerações Importantes

*   **Execução Única**: Este script deve ser executado uma única vez para atribuir planos aos beneficiários existentes. Executá-lo novamente pode resultar em tentativas de criar planos duplicados (embora o Supabase tenha uma restrição `UNIQUE(user_id, beneficiary_id)` para evitar isso).
*   **Backup**: Antes de executar o script em produção, faça um backup do banco de dados Supabase.
*   **Ambiente de Teste**: Teste o script em um ambiente de desenvolvimento ou staging antes de executá-lo em produção.

## 8. Solução de Problemas

### Problema: "RAPIDOC_API_KEY não está definida"

**Solução**: Certifique-se de que a variável de ambiente `RAPIDOC_API_KEY` está configurada corretamente no seu arquivo `.env` ou no ambiente de execução.

### Problema: "Erro ao conectar ao Supabase"

**Solução**: Verifique se as variáveis `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretas e se o projeto Supabase está acessível.

### Problema: "Nenhum beneficiário sem plano ativo encontrado"

**Solução**: Isso significa que todos os beneficiários já possuem um plano ativo. Verifique a tabela `subscription_plans` no Supabase para confirmar.

## 9. Conclusão

Este script automatiza o processo de atribuição de assinaturas a beneficiários existentes, garantindo que todos os usuários tenham um plano ativo e consistente com os dados da Rapidoc. Siga as instruções acima para executá-lo com segurança e eficácia.

