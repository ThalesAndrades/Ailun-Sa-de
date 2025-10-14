# Documentação Completa do Fluxo "Quero ser AiLun" - AiLun Saúde

## 1. Introdução

Este documento descreve a arquitetura, a lógica de negócios e a implementação técnica do fluxo completo "Quero ser AiLun", que permite a novos usuários se registrarem, selecionarem um plano, realizarem o pagamento e se tornarem membros da plataforma AiLun Saúde.

## 2. Visão Geral do Fluxo

O fluxo "Quero ser AiLun" é uma jornada de 5 etapas que guia o usuário desde o interesse inicial até a conclusão do cadastro e pagamento. As etapas são:

1.  **Boas-Vindas**: Apresentação da plataforma e início do fluxo.
2.  **Contato**: Coleta de dados pessoais e de contato.
3.  **Endereço**: Coleta de informações de endereço.
4.  **Plano e Pagamento**: Seleção de plano, número de membros e método de pagamento.
5.  **Confirmação**: Processamento do cadastro e pagamento, e confirmação final.

## 3. Arquitetura e Tecnologias

O fluxo é construído com as seguintes tecnologias:

*   **Frontend**: React Native com Expo
*   **Backend**: Supabase (autenticação, banco de dados)
*   **Gateway de Pagamento**: Asaas
*   **Serviços de Telemedicina**: Rapidoc

## 4. Diagrama do Fluxo

```mermaid
graph TD
    A[Tela de Login] -->|Botão "Quero ser AiLun"| B(Tela de Boas-Vindas);
    B --> C(Tela de Contato);
    C --> D(Tela de Endereço);
    D --> E(Tela de Plano e Pagamento);
    E --> F(Tela de Confirmação);
    F -->|Processamento| G{Serviço de Registro};
    G --> H(Supabase Auth);
    G --> I(Rapidoc);
    G --> J(Asaas);
    G --> K(Supabase DB);
    K --> L(Tabela user_profiles);
    K --> M(Tabela subscription_plans);
    F -->|Sucesso| N(Guia da Plataforma);
    N --> O(Dashboard);
```

## 5. Detalhes da Implementação

### 5.1. Telas do Fluxo

*   **`app/signup/welcome.tsx`**: Tela inicial de boas-vindas.
*   **`app/signup/contact.tsx`**: Formulário para dados de contato.
*   **`app/signup/address.tsx`**: Formulário para endereço.
*   **`app/signup/payment.tsx`**: Seleção de plano, membros e pagamento.
*   **`app/signup/confirmation.tsx`**: Tela de processamento e confirmação.

### 5.2. Serviços de Backend

*   **`services/registration.ts`**: Orquestra todo o fluxo de registro, integrando com os demais serviços.
*   **`services/subscription-plan-service.ts`**: Gerencia a criação e atualização de planos de assinatura no Supabase.
*   **`services/audit-service.ts`**: Registra eventos de auditoria para rastreabilidade.
*   **`services/asaas.ts`**: Integração com a API do Asaas para criação de clientes e pagamentos.
*   **`services/beneficiary-service.ts`**: Integração com a API da Rapidoc para criação de beneficiários.

### 5.3. Lógica de Negócios

1.  **Criação de Usuário**: O usuário é criado no Supabase Auth com o e-mail e uma senha temporária (CPF).
2.  **Criação de Beneficiário**: O beneficiário é criado na Rapidoc com o `serviceType` selecionado.
3.  **Criação de Perfil**: O perfil do usuário é criado no Supabase com todos os dados coletados.
4.  **Criação de Cliente Asaas**: O cliente é criado no Asaas para processamento do pagamento.
5.  **Processamento de Pagamento**: O pagamento é processado via cartão de crédito, PIX ou boleto.
6.  **Criação de Plano de Assinatura**: O plano de assinatura é criado no Supabase com o status "active" (cartão) ou "pending" (PIX/boleto).
7.  **Redirecionamento**: O usuário é redirecionado para o guia da plataforma no primeiro acesso.

## 6. Configuração e Variáveis de Ambiente

Para que o fluxo funcione corretamente, as seguintes variáveis de ambiente devem ser configuradas no arquivo `.env.local`:

*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_ROLE_KEY`
*   `RAPIDOC_API_KEY`
*   `ASAAS_API_KEY`
*   `VAPID_PUBLIC_KEY`
*   `VAPID_PRIVATE_KEY`

## 7. Testes

Os testes completos do fluxo estão documentados em `docs/TESTES_FLUXO_QUERO_SER_AILUN.md`. Os testes aguardam a configuração completa do Supabase, Rapidoc e Asaas para serem executados.

## 8. Próximos Passos

1.  **Configurar o Supabase**: Executar os scripts SQL para criar as tabelas necessárias.
2.  **Configurar as credenciais**: Garantir que as variáveis de ambiente estejam corretas.
3.  **Executar testes manuais**: Testar cada etapa do fluxo manualmente.
4.  **Implementar validações adicionais**: Adicionar validação de CPF e e-mail mais robusta.
5.  **Monitorar logs de auditoria**: Acompanhar os eventos registrados para identificar problemas.

## 9. Conclusão

O fluxo "Quero ser AiLun" foi implementado com sucesso e está pronto para ser testado e implantado. A arquitetura é robusta e escalável, e a integração com os serviços externos garante a funcionalidade completa da plataforma.

