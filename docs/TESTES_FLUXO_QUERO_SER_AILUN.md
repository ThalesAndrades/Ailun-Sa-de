# Testes do Fluxo "Quero ser AiLun" - AiLun Saúde

## 1. Objetivo

Este documento descreve os testes realizados para verificar a integridade e o funcionamento correto do fluxo completo "Quero ser AiLun", desde o registro inicial até a confirmação do cadastro e pagamento.

## 2. Escopo dos Testes

### 2.1. Componentes Testados

*   **Tela de Boas-Vindas** (`app/signup/welcome.tsx`)
*   **Tela de Contato** (`app/signup/contact.tsx`)
*   **Tela de Endereço** (`app/signup/address.tsx`)
*   **Tela de Seleção de Plano e Pagamento** (`app/signup/payment.tsx`)
*   **Tela de Confirmação** (`app/signup/confirmation.tsx`)
*   **Serviço de Registro** (`services/registration.ts`)
*   **Serviço de Planos de Assinatura** (`services/subscription-plan-service.ts`)
*   **Integração com Supabase Auth**
*   **Integração com Rapidoc**
*   **Integração com Asaas**

## 3. Casos de Teste

### 3.1. Teste 1: Navegação Completa do Fluxo

**Objetivo**: Verificar se o usuário consegue navegar por todas as telas do fluxo sem erros.

**Passos**:
1.  Clicar no botão "Quero ser AiLun" na tela de login
2.  Verificar se a tela de boas-vindas é exibida
3.  Clicar em "Começar"
4.  Preencher os dados de contato e clicar em "Continuar"
5.  Preencher o endereço e clicar em "Continuar"
6.  Selecionar um plano e método de pagamento, aceitar os termos e clicar em "Finalizar Cadastro"
7.  Verificar se a tela de confirmação é exibida

**Resultado Esperado**: ✅ Navegação fluida sem erros

**Status**: ⏳ Pendente de execução após configuração do Supabase

---

### 3.2. Teste 2: Validação de Campos Obrigatórios

**Objetivo**: Verificar se os campos obrigatórios são validados corretamente.

**Passos**:
1.  Tentar avançar sem preencher campos obrigatórios em cada tela
2.  Verificar se mensagens de erro são exibidas
3.  Preencher os campos e verificar se a validação passa

**Resultado Esperado**: ✅ Mensagens de erro claras e validação correta

**Status**: ⏳ Pendente de execução

---

### 3.3. Teste 3: Criação de Usuário no Supabase Auth

**Objetivo**: Verificar se o usuário é criado corretamente no Supabase Auth.

**Passos**:
1.  Completar o fluxo de cadastro com sucesso
2.  Verificar no Supabase Auth se o usuário foi criado
3.  Verificar se o e-mail e os metadados (nome, CPF) estão corretos

**Resultado Esperado**: ✅ Usuário criado com sucesso no Supabase Auth

**Status**: ⏳ Pendente de execução após configuração do Supabase

---

### 3.4. Teste 4: Criação de Perfil no Supabase

**Objetivo**: Verificar se o perfil do usuário é criado corretamente na tabela `user_profiles`.

**Passos**:
1.  Completar o fluxo de cadastro com sucesso
2.  Verificar no Supabase se o perfil foi criado na tabela `user_profiles`
3.  Verificar se todos os campos estão preenchidos corretamente

**Resultado Esperado**: ✅ Perfil criado com sucesso no Supabase

**Status**: ⏳ Pendente de execução após configuração do Supabase

---

### 3.5. Teste 5: Criação de Beneficiário na Rapidoc

**Objetivo**: Verificar se o beneficiário é criado corretamente na Rapidoc.

**Passos**:
1.  Completar o fluxo de cadastro com sucesso
2.  Verificar na Rapidoc se o beneficiário foi criado
3.  Verificar se o `serviceType` está correto (G, GP, GS, GSP)

**Resultado Esperado**: ✅ Beneficiário criado com sucesso na Rapidoc

**Status**: ⏳ Pendente de execução após configuração da Rapidoc

---

### 3.6. Teste 6: Criação de Cliente no Asaas

**Objetivo**: Verificar se o cliente é criado corretamente no Asaas.

**Passos**:
1.  Completar o fluxo de cadastro com sucesso
2.  Verificar no Asaas se o cliente foi criado
3.  Verificar se os dados do cliente estão corretos

**Resultado Esperado**: ✅ Cliente criado com sucesso no Asaas

**Status**: ⏳ Pendente de execução após configuração do Asaas

---

### 3.7. Teste 7: Processamento de Pagamento com Cartão de Crédito

**Objetivo**: Verificar se o pagamento com cartão de crédito é processado corretamente.

**Passos**:
1.  Completar o fluxo de cadastro selecionando "Cartão de Crédito"
2.  Preencher os dados do cartão
3.  Verificar se a assinatura é criada no Asaas
4.  Verificar se o status do plano no Supabase é "active"

**Resultado Esperado**: ✅ Pagamento processado com sucesso e plano ativo

**Status**: ⏳ Pendente de execução após configuração do Asaas

---

### 3.8. Teste 8: Geração de Pagamento PIX

**Objetivo**: Verificar se o pagamento PIX é gerado corretamente.

**Passos**:
1.  Completar o fluxo de cadastro selecionando "PIX"
2.  Verificar se o QR Code e o código copia e cola são gerados
3.  Verificar se o status do plano no Supabase é "pending"

**Resultado Esperado**: ✅ Pagamento PIX gerado com sucesso

**Status**: ⏳ Pendente de execução após configuração do Asaas

---

### 3.9. Teste 9: Geração de Boleto

**Objetivo**: Verificar se o boleto é gerado corretamente.

**Passos**:
1.  Completar o fluxo de cadastro selecionando "Boleto"
2.  Verificar se a URL do boleto é gerada
3.  Verificar se o status do plano no Supabase é "pending"

**Resultado Esperado**: ✅ Boleto gerado com sucesso

**Status**: ⏳ Pendente de execução após configuração do Asaas

---

### 3.10. Teste 10: Criação de Plano de Assinatura no Supabase

**Objetivo**: Verificar se o plano de assinatura é criado corretamente na tabela `subscription_plans`.

**Passos**:
1.  Completar o fluxo de cadastro com sucesso
2.  Verificar no Supabase se o plano foi criado na tabela `subscription_plans`
3.  Verificar se todos os campos estão preenchidos corretamente
4.  Verificar se o `serviceType`, `memberCount` e `monthlyPrice` estão corretos

**Resultado Esperado**: ✅ Plano de assinatura criado com sucesso

**Status**: ⏳ Pendente de execução após configuração do Supabase

---

### 3.11. Teste 11: Redirecionamento para Onboarding

**Objetivo**: Verificar se o usuário é redirecionado para o guia da plataforma após o cadastro.

**Passos**:
1.  Completar o fluxo de cadastro com sucesso
2.  Clicar em "Ir para o Dashboard" na tela de confirmação
3.  Verificar se o usuário é redirecionado para `/onboarding/platform-guide`

**Resultado Esperado**: ✅ Usuário redirecionado para o guia da plataforma

**Status**: ⏳ Pendente de execução

---

### 3.12. Teste 12: Registro de Eventos de Auditoria

**Objetivo**: Verificar se os eventos de auditoria são registrados corretamente.

**Passos**:
1.  Completar o fluxo de cadastro com sucesso
2.  Verificar no Supabase se os eventos foram registrados na tabela `audit_logs`
3.  Verificar se os eventos incluem: `signup_started`, `payment_initiated`, `signup_completed`, `payment_success`, `plan_assigned`

**Resultado Esperado**: ✅ Eventos de auditoria registrados corretamente

**Status**: ⏳ Pendente de execução após configuração do Supabase

---

### 3.13. Teste 13: Tratamento de Erros

**Objetivo**: Verificar se os erros são tratados corretamente e mensagens claras são exibidas ao usuário.

**Passos**:
1.  Simular falha na criação do beneficiário na Rapidoc
2.  Verificar se a mensagem de erro é exibida
3.  Verificar se o evento `signup_failed` é registrado na auditoria
4.  Tentar novamente e verificar se o fluxo funciona

**Resultado Esperado**: ✅ Erros tratados corretamente com mensagens claras

**Status**: ⏳ Pendente de execução

---

### 3.14. Teste 14: Cálculo Dinâmico de Preços

**Objetivo**: Verificar se o cálculo de preços é feito corretamente com base nos serviços selecionados e número de membros.

**Passos**:
1.  Selecionar diferentes combinações de serviços
2.  Alterar o número de membros
3.  Verificar se o preço total e o desconto são calculados corretamente

**Resultado Esperado**: ✅ Preços calculados corretamente

**Status**: ⏳ Pendente de execução

---

### 3.15. Teste 15: Validação de CPF

**Objetivo**: Verificar se a validação de CPF funciona corretamente.

**Passos**:
1.  Tentar cadastrar com um CPF inválido
2.  Verificar se a mensagem de erro é exibida
3.  Cadastrar com um CPF válido e verificar se passa

**Resultado Esperado**: ✅ Validação de CPF funcionando corretamente

**Status**: ⏳ Pendente de implementação de validação robusta

## 4. Resumo dos Resultados

| Teste | Status | Observações |
|---|---|---|
| 3.1 - Navegação Completa | ⏳ Pendente | Aguardando configuração do Supabase |
| 3.2 - Validação de Campos | ⏳ Pendente | - |
| 3.3 - Criação de Usuário | ⏳ Pendente | Aguardando configuração do Supabase |
| 3.4 - Criação de Perfil | ⏳ Pendente | Aguardando configuração do Supabase |
| 3.5 - Criação de Beneficiário | ⏳ Pendente | Aguardando configuração da Rapidoc |
| 3.6 - Criação de Cliente Asaas | ⏳ Pendente | Aguardando configuração do Asaas |
| 3.7 - Pagamento Cartão | ⏳ Pendente | Aguardando configuração do Asaas |
| 3.8 - Pagamento PIX | ⏳ Pendente | Aguardando configuração do Asaas |
| 3.9 - Geração de Boleto | ⏳ Pendente | Aguardando configuração do Asaas |
| 3.10 - Criação de Plano | ⏳ Pendente | Aguardando configuração do Supabase |
| 3.11 - Redirecionamento | ⏳ Pendente | - |
| 3.12 - Eventos de Auditoria | ⏳ Pendente | Aguardando configuração do Supabase |
| 3.13 - Tratamento de Erros | ⏳ Pendente | - |
| 3.14 - Cálculo de Preços | ⏳ Pendente | - |
| 3.15 - Validação de CPF | ⏳ Pendente | Aguardando implementação |

## 5. Próximos Passos

1.  **Configurar o Supabase**: Executar os scripts SQL para criar as tabelas necessárias
2.  **Configurar as credenciais**: Garantir que as variáveis de ambiente estejam corretas
3.  **Executar testes manuais**: Testar cada etapa do fluxo manualmente
4.  **Implementar validações adicionais**: Adicionar validação de CPF e e-mail mais robusta
5.  **Monitorar logs de auditoria**: Acompanhar os eventos registrados para identificar problemas

## 6. Conclusão

O fluxo "Quero ser AiLun" foi implementado com sucesso e está pronto para ser testado. Todos os componentes necessários foram criados e integrados. Os testes aguardam a configuração completa do Supabase, Rapidoc e Asaas para serem executados.

