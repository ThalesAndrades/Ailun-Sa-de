# Revisão do Fluxo "Quero ser AiLun" - AiLun Saúde

## 1. Visão Geral do Fluxo

O fluxo "Quero ser AiLun" é o processo de registro e assinatura para novos usuários da plataforma AiLun Saúde. Este fluxo guia o usuário desde a tela de boas-vindas até a confirmação do cadastro e pagamento, criando um beneficiário na Rapidoc e um plano de assinatura no Supabase.

## 2. Telas Existentes

### 2.1. Tela de Boas-Vindas (`app/signup/welcome.tsx`)

**Objetivo**: Apresentar a plataforma e iniciar o fluxo de cadastro.

**Status**: ✅ Implementada

**Funcionalidades**:
- Apresentação visual da marca AiLun Saúde
- Botão "Começar" para iniciar o cadastro
- Navegação para a tela de contato

**Observações**: Tela bem estruturada e alinhada com a identidade visual da marca.

---

### 2.2. Tela de Contato (`app/signup/contact.tsx`)

**Objetivo**: Coletar informações de contato do usuário (nome completo, CPF, data de nascimento, e-mail, telefone).

**Status**: ✅ Implementada

**Funcionalidades**:
- Formulário com validação de campos
- Máscaras para CPF e telefone
- Botão "Continuar" para avançar para a próxima etapa

**Observações**: Validações básicas implementadas. Recomenda-se adicionar validação de CPF e e-mail mais robusta.

---

### 2.3. Tela de Dados Pessoais (`app/signup/personal-data.tsx`)

**Objetivo**: Coletar dados pessoais adicionais do usuário.

**Status**: ✅ Implementada

**Funcionalidades**:
- Formulário para dados pessoais complementares
- Navegação para a tela de endereço

**Observações**: Tela implementada, mas pode ser consolidada com a tela de contato para simplificar o fluxo.

---

### 2.4. Tela de Endereço (`app/signup/address.tsx`)

**Objetivo**: Coletar informações de endereço do usuário (CEP, rua, número, complemento, bairro, cidade, estado).

**Status**: ✅ Implementada

**Funcionalidades**:
- Formulário com busca automática de endereço por CEP
- Validação de campos obrigatórios
- Botão "Continuar" para avançar para a seleção de plano

**Observações**: Funcionalidade de busca por CEP implementada. Recomenda-se adicionar feedback visual durante a busca.

---

### 2.5. Tela de Seleção de Plano e Pagamento (`app/signup/payment.tsx`)

**Objetivo**: Permitir que o usuário selecione um plano de assinatura, configure o número de membros e escolha a forma de pagamento.

**Status**: ✅ Implementada

**Funcionalidades**:
- Seleção de serviços inclusos (Médico 24h, Especialistas, Psicologia, Nutrição)
- Seletor de quantidade de membros com descontos progressivos
- Cálculo dinâmico de preços
- Seleção de forma de pagamento (Cartão de Crédito, PIX, Boleto)
- Botão "Finalizar Cadastro" para processar o pagamento

**Observações**: Tela bem estruturada. **Necessita integração com o Asaas para processar pagamentos reais e com o Supabase para criar o plano de assinatura.**

---

### 2.6. Tela de Confirmação (`app/signup/confirmation.tsx`)

**Objetivo**: Exibir um resumo do cadastro e direcionar o usuário para o próximo passo (guia da plataforma ou dashboard).

**Status**: ✅ Implementada

**Funcionalidades**:
- Exibição de mensagem de sucesso ou erro
- Animações de feedback visual
- Botão "Ir para o Dashboard" ou "Tentar Novamente"

**Observações**: Tela implementada com integração ao serviço de registro. **Necessita ajustes para redirecionar para o guia da plataforma (onboarding) no primeiro acesso.**

## 3. Fluxo de Navegação Atual

```
Login (Botão "Quero ser AiLun")
  ↓
Welcome
  ↓
Contact
  ↓
Personal Data (Opcional)
  ↓
Address
  ↓
Payment (Seleção de Plano)
  ↓
Confirmation
  ↓
Dashboard ou Onboarding
```

## 4. Lacunas e Inconsistências Identificadas

### 4.1. Integração com Asaas

**Problema**: A tela de pagamento não está totalmente integrada com o Asaas para processar pagamentos reais.

**Impacto**: Usuários não conseguem finalizar a compra do plano.

**Solução**: Implementar a integração completa com a API do Asaas, incluindo criação de cliente, criação de assinatura e processamento de pagamento.

---

### 4.2. Criação de Beneficiário na Rapidoc

**Problema**: O fluxo não cria automaticamente um beneficiário na Rapidoc após o cadastro.

**Impacto**: Usuários não conseguem acessar os serviços de telemedicina.

**Solução**: Integrar a criação de beneficiário na Rapidoc no serviço de registro, usando a API da Rapidoc.

---

### 4.3. Criação de Plano de Assinatura no Supabase

**Problema**: O fluxo não cria automaticamente um plano de assinatura no Supabase após o pagamento.

**Impacto**: Usuários não têm um plano ativo associado, o que impede o acesso aos serviços.

**Solução**: Implementar a criação de `subscription_plan` no Supabase após a confirmação do pagamento.

---

### 4.4. Redirecionamento para Onboarding

**Problema**: A tela de confirmação não redireciona automaticamente para o guia da plataforma (onboarding) no primeiro acesso.

**Impacto**: Novos usuários não recebem orientação sobre como usar a plataforma.

**Solução**: Adicionar lógica para verificar se é o primeiro acesso do usuário e redirecionar para `/onboarding/platform-guide`.

---

### 4.5. Validação de Dados

**Problema**: As validações de dados são básicas e podem permitir a entrada de informações inválidas.

**Impacto**: Dados inconsistentes no banco de dados e possíveis erros na integração com APIs externas.

**Solução**: Implementar validações mais robustas para CPF, e-mail, CEP e outros campos críticos.

---

### 4.6. Tratamento de Erros

**Problema**: O tratamento de erros é genérico e não fornece feedback claro ao usuário sobre o que deu errado.

**Impacto**: Usuários podem ficar confusos ou frustrados ao encontrar erros.

**Solução**: Implementar mensagens de erro mais específicas e orientações sobre como resolver o problema.

---

### 4.7. Auditoria de Eventos

**Problema**: O fluxo não registra eventos de auditoria para rastreamento e diagnóstico.

**Impacto**: Dificuldade em identificar e resolver problemas no fluxo de cadastro.

**Solução**: Integrar o `AuditService` para registrar eventos como `signup_started`, `signup_completed`, `signup_failed`, `payment_initiated`, `payment_success`, `payment_failed`.

## 5. Recomendações de Melhoria

### 5.1. Consolidar Telas de Dados Pessoais

**Recomendação**: Consolidar as telas de contato e dados pessoais em uma única tela para simplificar o fluxo.

**Benefício**: Redução do número de etapas e melhoria da experiência do usuário.

---

### 5.2. Adicionar Indicador de Progresso

**Recomendação**: Adicionar um indicador de progresso (ex: "Etapa 1 de 4") no topo de cada tela.

**Benefício**: Usuários têm visibilidade sobre quantas etapas faltam para concluir o cadastro.

---

### 5.3. Implementar Salvamento Automático

**Recomendação**: Salvar automaticamente os dados do formulário em cada etapa para que o usuário possa retomar o cadastro caso saia do fluxo.

**Benefício**: Redução da frustração do usuário e aumento da taxa de conclusão do cadastro.

---

### 5.4. Adicionar Suporte a Múltiplas Formas de Pagamento

**Recomendação**: Garantir que todas as formas de pagamento (Cartão, PIX, Boleto) estejam totalmente funcionais.

**Benefício**: Maior flexibilidade para o usuário e aumento da taxa de conversão.

---

### 5.5. Implementar Testes Automatizados

**Recomendação**: Criar testes automatizados para o fluxo completo de cadastro.

**Benefício**: Garantia de que o fluxo funciona corretamente após alterações no código.

## 6. Próximos Passos

1.  **Fase 2**: Implementar a lógica de negócios para o registro de novos usuários, incluindo integração com Supabase Auth, Rapidoc e criação de perfis.
2.  **Fase 3**: Desenvolver a funcionalidade de seleção de plano com cálculo dinâmico de preços e integração com o Supabase.
3.  **Fase 4**: Integrar o fluxo de pagamento com o Asaas para processar pagamentos reais.
4.  **Fase 5**: Implementar a tela de confirmação final com redirecionamento para onboarding.
5.  **Fase 6**: Testar o fluxo completo de ponta a ponta.
6.  **Fase 7**: Documentar o fluxo completo com diagramas e especificações técnicas.

## 7. Conclusão

O fluxo "Quero ser AiLun" possui uma base sólida com telas bem estruturadas e alinhadas com a identidade visual da marca. No entanto, existem lacunas críticas nas integrações com Asaas, Rapidoc e Supabase que precisam ser resolvidas para que o fluxo funcione corretamente de ponta a ponta. As recomendações de melhoria visam aprimorar a experiência do usuário e garantir a robustez do sistema.

