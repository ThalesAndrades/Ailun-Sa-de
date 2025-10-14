# Instruções para Configuração do Supabase - AiLun Saúde

## 1. Objetivo

Este documento fornece instruções passo a passo para configurar o banco de dados Supabase para o projeto AiLun Saúde, incluindo a criação das tabelas necessárias para o gerenciamento de beneficiários e planos.

## 2. Pré-requisitos

*   Acesso ao [Supabase Dashboard](https://app.supabase.com/)
*   Projeto AiLun Saúde criado no Supabase
*   Permissões de administrador no projeto

## 3. Passo 1: Acessar o SQL Editor

1.  Acesse o [Supabase Dashboard](https://app.supabase.com/)
2.  Selecione seu projeto **AiLun Saúde**
3.  No menu lateral esquerdo, clique em **SQL Editor**
4.  Clique em **New query** para criar uma nova consulta

## 4. Passo 2: Executar o Schema de Beneficiários e Planos

1.  Abra o arquivo `supabase/schema_beneficiary_plans.sql` no seu editor de código
2.  Copie **todo o conteúdo** do arquivo
3.  Cole no SQL Editor do Supabase
4.  Clique em **Run** para executar o script

### O que este script faz:

*   **Cria a tabela `beneficiaries`**: Armazena informações dos beneficiários da Rapidoc
*   **Cria a tabela `subscription_plans`**: Gerencia os planos de assinatura dos usuários
*   **Cria a tabela `plan_members`**: Gerencia membros adicionais do plano familiar
*   **Cria a tabela `consultation_history`**: Registra o histórico de consultas por beneficiário
*   **Cria funções auxiliares**: Para resetar limites mensais/trimestrais e obter planos ativos
*   **Configura RLS (Row Level Security)**: Garante que os usuários só possam acessar seus próprios dados

## 5. Passo 3: Verificar a Criação das Tabelas

Após executar o script, verifique se as tabelas foram criadas corretamente:

1.  No menu lateral esquerdo, clique em **Table Editor**
2.  Você deverá ver as seguintes tabelas:
    *   `beneficiaries`
    *   `subscription_plans`
    *   `plan_members`
    *   `consultation_history`

## 6. Passo 4: Executar o Script de Atribuição de GS (Opcional)

Se você deseja atribuir o `serviceType` "GS" (Clínico + Especialistas) a todos os beneficiários existentes, execute o seguinte script:

1.  Abra o arquivo `supabase/migrations/update_all_beneficiaries_to_gs.sql`
2.  Copie **todo o conteúdo** do arquivo
3.  Cole no SQL Editor do Supabase
4.  Clique em **Run** para executar o script

**Nota**: Este script só deve ser executado se você já tiver beneficiários cadastrados e deseja atualizá-los para o plano GS.

## 7. Passo 5: Configurar Variáveis de Ambiente

Certifique-se de que as variáveis de ambiente do Supabase estão configuradas corretamente no seu projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtdGllaW5lZ2RpdGRlaWp5c2x1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTA2MTIsImV4cCI6MjA3NTQ2NjYxMn0.6kIwU2VEVUaI1WGb5Wz37AVNuay4nkroJrWT-WYZUWI
```

Adicione essas variáveis ao arquivo `.env.local` na raiz do projeto.

## 8. Passo 6: Testar a Conexão

Para testar se a conexão com o Supabase está funcionando corretamente, você pode executar uma consulta simples no SQL Editor:

```sql
SELECT * FROM public.beneficiaries LIMIT 5;
```

Se a consulta retornar resultados (ou uma tabela vazia, mas sem erros), a configuração está correta.

## 9. Troubleshooting

### Erro: "Could not find the table 'public.beneficiaries' in the schema cache"

**Solução**: Este erro indica que a tabela `beneficiaries` não foi criada. Certifique-se de que você executou o script `supabase/schema_beneficiary_plans.sql` conforme descrito no Passo 2.

### Erro: "permission denied for table beneficiaries"

**Solução**: Este erro pode ocorrer se as políticas RLS (Row Level Security) estiverem bloqueando o acesso. Verifique se você está autenticado corretamente no Supabase e se as políticas RLS estão configuradas conforme o script.

### Erro: "duplicate key value violates unique constraint"

**Solução**: Este erro ocorre quando você tenta inserir um beneficiário com um CPF ou UUID que já existe. Verifique se o beneficiário já está cadastrado antes de tentar inseri-lo novamente.

## 10. Próximos Passos

Após configurar o Supabase:

1.  **Execute o script de atribuição de beneficiários**: Use o script `scripts/assign-subscriptions-to-beneficiaries.js` para vincular beneficiários ao plano GS.
2.  **Teste o fluxo de registro**: Verifique se o fluxo "Quero ser AiLun" está funcionando corretamente e criando beneficiários e planos no Supabase.
3.  **Monitore os logs**: Acompanhe os logs do Supabase para identificar possíveis erros ou problemas de desempenho.

## 11. Conclusão

Com essas instruções, você deve ser capaz de configurar o banco de dados Supabase para o projeto AiLun Saúde. Se encontrar algum problema, consulte a seção de Troubleshooting ou entre em contato com o suporte técnico.

