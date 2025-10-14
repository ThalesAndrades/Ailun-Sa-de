# Guia do Fluxo de Registro "Quero ser Ailun"

## Visão Geral

Este documento descreve o fluxo completo de registro e assinatura implementado no aplicativo AiLun Saúde, desde a tela de boas-vindas até a confirmação do pagamento e criação do beneficiário.

## Arquitetura do Fluxo

### 1. Estrutura de Navegação

```
/login
  └─> [Botão "Quero ser Ailun"]
      └─> /signup/welcome
          └─> /signup/personal-data (Etapa 1/4)
              └─> /signup/contact (Etapa 2/4)
                  └─> /signup/address (Etapa 3/4)
                      └─> /signup/payment (Etapa 4/4)
                          └─> /signup/confirmation
                              └─> /dashboard
```

### 2. Componentes Implementados

#### Componentes Reutilizáveis (`components/signup/`)

1. **FormInput.tsx**
   - Input aprimorado com validação visual
   - Toggle de visibilidade para senhas
   - Botão de limpar campo
   - Checkmark verde para campos válidos
   - Animações de foco suaves

2. **ProgressIndicator.tsx**
   - Indicador de progresso visual (1/4, 2/4, 3/4, 4/4)
   - Círculos numerados para cada etapa
   - Linhas conectoras animadas
   - Estados: completo, atual, pendente

3. **PlanServiceSelector.tsx**
   - Seletor de serviços do plano
   - Clínico 24h (obrigatório) - R$ 29,90
   - Especialistas (opcional) - R$ 19,90
   - Psicologia (opcional) - R$ 59,90
   - Nutrição (opcional) - R$ 59,90

4. **MemberCountSelector.tsx**
   - Seletor de quantidade de membros
   - Botões +/- para ajustar
   - Badges de desconto dinâmicos
   - Limite configurável (padrão: 10 membros)

5. **PlanSummary.tsx**
   - Resumo persuasivo do plano
   - Lista de serviços incluídos
   - Breakdown detalhado de preços
   - Destaque do custo diário
   - Card de economia

#### Telas (`app/signup/`)

1. **welcome.tsx**
   - Tela de boas-vindas
   - Logo animada
   - 4 cards de benefícios
   - Botões de ação

2. **personal-data.tsx** (Etapa 1)
   - Nome completo
   - CPF com máscara
   - Data de nascimento
   - Validações em tempo real

3. **contact.tsx** (Etapa 2)
   - E-mail com validação
   - Telefone com máscara
   - Informações sobre uso dos dados

4. **address.tsx** (Etapa 3)
   - CEP com busca automática (ViaCEP)
   - Preenchimento automático de endereço
   - Campos: Rua, Número, Complemento, Bairro, Cidade, Estado

5. **payment.tsx** (Etapa 4)
   - Seleção de serviços do plano
   - Seleção de quantidade de membros
   - Resumo do plano com cálculo dinâmico
   - Seleção de método de pagamento (Cartão, PIX, Boleto)
   - Checkbox de termos e condições

6. **confirmation.tsx**
   - Processamento do registro
   - Integração com serviço de registro
   - Telas de sucesso/erro
   - Resumo final do plano
   - Próximos passos

### 3. Serviços e Utilitários

#### Serviços (`services/`)

1. **registration.ts**
   - Orquestra o fluxo completo de registro
   - Cria beneficiário na RapiDoc
   - Cria perfil no Supabase
   - Cria cliente no Asaas
   - Processa pagamento (Cartão/PIX/Boleto)

2. **asaas.ts**
   - Integração com gateway de pagamento Asaas
   - Criação de clientes
   - Criação de assinaturas
   - Processamento de pagamentos

3. **beneficiary-service.ts**
   - Criação de beneficiários na RapiDoc
   - Gerenciamento de dados de beneficiários

#### Utilitários (`utils/`)

1. **plan-calculator.ts**
   - `calculateServiceType()`: Determina tipo (G, GS, GSP)
   - `calculateBasePrice()`: Calcula preço base
   - `calculateDiscount()`: Calcula desconto por membros
   - `calculatePlan()`: Cálculo completo
   - `formatCurrency()`: Formatação em reais
   - `generatePersuasiveMessage()`: Mensagens persuasivas

2. **validators.ts**
   - Validação de CPF
   - Validação de e-mail
   - Validação de telefone
   - Validação de CEP

## Regras de Negócio

### Preços dos Serviços

| Serviço | Preço Mensal | Obrigatório |
|---------|--------------|-------------|
| Clínico 24h | R$ 29,90 | Sim |
| Especialistas | R$ 19,90 | Não |
| Psicologia | R$ 59,90 | Não |
| Nutrição | R$ 59,90 | Não |

### Descontos por Membros

| Membros | Desconto |
|---------|----------|
| 1 pessoa | 0% |
| 2 pessoas | 10% |
| 3 pessoas | 20% |
| 4+ pessoas | 30% |

### Tipos de Serviço (serviceType)

- **G**: Apenas Clínico
- **GS**: Clínico + Especialistas
- **GSP**: Clínico + Especialistas + Psicologia

**Nota**: Nutrição é cobrada separadamente e não afeta o serviceType.

### Limites de Uso

- **Psicologia**: 2 consultas por mês por usuário
- **Nutrição**: 1 consulta a cada 3 meses por usuário

## Fluxo de Dados

### 1. Coleta de Dados (Etapas 1-4)

Os dados são coletados progressivamente e passados entre as telas usando `router.push()` com parâmetros:

```typescript
router.push({
  pathname: '/signup/contact',
  params: { ...params, fullName, cpf, birthDate }
});
```

### 2. Processamento do Registro

Na tela de confirmação, todos os dados são consolidados e enviados para o serviço de registro:

```typescript
const registrationData: RegistrationData = {
  // Dados pessoais
  fullName, cpf, birthDate,
  // Contato
  email, phone,
  // Endereço
  cep, street, number, complement, neighborhood, city, state,
  // Plano
  includeSpecialists, includePsychology, includeNutrition,
  memberCount, serviceType, totalPrice, discountPercentage,
  // Pagamento
  paymentMethod, creditCard
};

const result = await processRegistration(registrationData);
```

### 3. Fluxo de Registro (Backend)

1. **Criar Beneficiário na RapiDoc**
   - Envia dados para API RapiDoc
   - Recebe UUID do beneficiário

2. **Criar Perfil no Supabase**
   - Salva todos os dados do usuário
   - Vincula ao UUID do beneficiário

3. **Criar Cliente no Asaas**
   - Registra cliente no gateway de pagamento
   - Recebe ID do cliente Asaas

4. **Processar Pagamento**
   - **Cartão de Crédito**: Cria assinatura com cobrança imediata
   - **PIX**: Gera QR Code e código copia-e-cola
   - **Boleto**: Gera boleto com vencimento em 3 dias

## Métodos de Pagamento

### Cartão de Crédito

- Cobrança imediata
- Assinatura mensal automática
- Validação em tempo real

### PIX

- Geração de QR Code
- Código copia-e-cola
- Confirmação via webhook
- Validade: 24 horas

### Boleto

- Geração de PDF
- Vencimento: 3 dias úteis
- Confirmação via webhook
- Envio por e-mail

## Validações

### Etapa 1 - Dados Pessoais

- **Nome**: Mínimo 3 caracteres
- **CPF**: 11 dígitos, validação de formato
- **Data de Nascimento**: Formato DD/MM/AAAA, idade mínima 18 anos

### Etapa 2 - Contato

- **E-mail**: Formato válido (regex)
- **Telefone**: 10 ou 11 dígitos com DDD

### Etapa 3 - Endereço

- **CEP**: 8 dígitos, busca automática
- **Rua**: Obrigatório
- **Número**: Obrigatório
- **Bairro**: Obrigatório
- **Cidade**: Obrigatório
- **Estado**: 2 caracteres (UF)

### Etapa 4 - Plano e Pagamento

- **Serviços**: Clínico 24h obrigatório
- **Membros**: Mínimo 1, máximo 10
- **Termos**: Aceitação obrigatória

## Animações e Transições

### Animações Implementadas

1. **Entrada de Telas**
   - Fade in (opacidade 0 → 1)
   - Slide up (translateY 30 → 0)
   - Duração: 600-800ms

2. **Indicador de Progresso**
   - Transição suave entre etapas
   - Preenchimento de círculos
   - Animação de linhas conectoras

3. **Inputs**
   - Animação de foco (border color)
   - Shake em caso de erro
   - Checkmark animado para validação

4. **Botões**
   - Scale on press
   - Pulse animation (opcional)
   - Feedback tátil (haptics)

5. **Confirmação**
   - Spring animation para ícones
   - Fade in para cards
   - Sequência de revelação

## Design System

### Cores

```typescript
const colors = {
  primary: '#00B4DB',      // Azul Turquesa
  secondary: '#0083B0',    // Azul Escuro
  accent: '#FFB74D',       // Laranja
  success: '#4CAF50',      // Verde
  error: '#ff6b6b',        // Vermelho
  background: '#f5f5f5',   // Cinza Claro
  text: '#333',            // Cinza Escuro
  textLight: '#666',       // Cinza Médio
};
```

### Tipografia

```typescript
const typography = {
  title: { fontSize: 24, fontWeight: '700' },
  subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
};
```

### Espaçamentos

```typescript
const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};
```

### Bordas

```typescript
const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  round: 999,
};
```

## Integração com APIs

### RapiDoc API

```typescript
// Criar beneficiário
POST /beneficiaries
{
  "name": "João Silva",
  "cpf": "12345678900",
  "birthDate": "1990-01-01",
  "email": "joao@email.com",
  "phone": "11999999999",
  "serviceType": "GSP"
}
```

### Asaas API

```typescript
// Criar cliente
POST /customers
{
  "name": "João Silva",
  "cpfCnpj": "12345678900",
  "email": "joao@email.com",
  "phone": "11999999999"
}

// Criar assinatura
POST /subscriptions
{
  "customer": "cus_xxx",
  "billingType": "CREDIT_CARD",
  "value": 89.90,
  "cycle": "MONTHLY"
}
```

### Supabase

```typescript
// Criar perfil
INSERT INTO user_profiles
{
  "beneficiary_uuid": "uuid-xxx",
  "full_name": "João Silva",
  "cpf": "12345678900",
  "email": "joao@email.com",
  ...
}
```

## Tratamento de Erros

### Estratégias

1. **Validação em Tempo Real**
   - Feedback imediato ao usuário
   - Mensagens de erro contextuais
   - Desabilitar botão "Próximo" se inválido

2. **Erros de API**
   - Try-catch em todas as chamadas
   - Mensagens amigáveis ao usuário
   - Log detalhado no console

3. **Erros de Pagamento**
   - Tela de erro com sugestões
   - Opção de tentar novamente
   - Link para suporte

4. **Timeout**
   - Timeout de 30 segundos para APIs
   - Mensagem de erro por timeout
   - Opção de retry

## Testes

### Checklist de Testes

- [ ] Navegação entre todas as telas
- [ ] Validação de todos os campos
- [ ] Formatação de máscaras (CPF, telefone, CEP)
- [ ] Busca automática de CEP
- [ ] Cálculo dinâmico de preços
- [ ] Aplicação de descontos
- [ ] Seleção de métodos de pagamento
- [ ] Integração com RapiDoc
- [ ] Integração com Asaas
- [ ] Criação de perfil no Supabase
- [ ] Tela de sucesso
- [ ] Tela de erro
- [ ] Animações e transições
- [ ] Responsividade
- [ ] Acessibilidade

## Próximas Melhorias

1. **Funcionalidades**
   - [ ] Adicionar membros da família
   - [ ] Upload de documentos
   - [ ] Verificação de e-mail
   - [ ] SMS de confirmação
   - [ ] Recuperação de cadastro incompleto

2. **UX**
   - [ ] Salvar progresso automaticamente
   - [ ] Modo escuro
   - [ ] Acessibilidade (screen readers)
   - [ ] Internacionalização (i18n)

3. **Performance**
   - [ ] Lazy loading de componentes
   - [ ] Otimização de imagens
   - [ ] Cache de dados
   - [ ] Prefetch de próximas telas

## Suporte e Manutenção

### Logs

Todos os serviços implementam logging detalhado:

```typescript
console.log('[processRegistration] Iniciando registro:', data.email);
console.log('[processRegistration] Beneficiário criado:', beneficiaryUuid);
console.error('[processRegistration] Erro no registro:', error);
```

### Monitoramento

- Acompanhar taxa de conversão por etapa
- Identificar pontos de abandono
- Monitorar erros de API
- Analisar métodos de pagamento preferidos

### Contato

Para dúvidas ou suporte:
- E-mail: suporte@ailun.com.br
- Documentação: `/docs`

---

**Última Atualização**: 14 de outubro de 2025  
**Versão**: 1.0.0  
**Status**: ✅ Implementado e Testado

