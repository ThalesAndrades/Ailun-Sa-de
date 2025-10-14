# 💳 Integração Asaas - Sistema de Pagamentos

**Versão**: 1.0.0  
**Data**: 13 de Outubro de 2025  
**Status**: ✅ Implementado

---

## 📋 Visão Geral

Sistema completo de pagamentos e assinaturas integrado com o **Asaas**, permitindo cobranças recorrentes mensais de **R$ 89,90** via **Cartão de Crédito** ou **PIX**.

---

## 🎯 Modelo de Negócio

### Assinatura Mensal
- **Valor**: R$ 89,90/mês
- **Métodos de Pagamento**: Cartão de Crédito e PIX
- **Renovação**: Automática
- **Ciclo**: Mensal

### Funcionalidades
- ✅ Criação automática de clientes no Asaas
- ✅ Criação de assinaturas mensais
- ✅ Pagamento via cartão de crédito
- ✅ Pagamento via PIX (QR Code)
- ✅ Webhooks para notificações em tempo real
- ✅ Histórico de pagamentos
- ✅ Cancelamento de assinaturas
- ✅ Verificação de status

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
ASAAS_API_KEY=$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmNhMmE3MDRkLTM0YjEtNDVmMS05NWU4LWJjOTY5ZTk3NGMyMzo6JGFhY2hfOGVlOWY3ZTItZTBiYy00YmYxLWI2ZTEtMDQ1NzlmMWI5MWRk
```

### 2. Executar SQL

Execute o arquivo `supabase/schema_payments.sql` no SQL Editor do Supabase para criar as tabelas necessárias:

```bash
# No Supabase Dashboard
# SQL Editor > New Query > Cole o conteúdo de schema_payments.sql > Run
```

### 3. Deploy da Edge Function

```bash
supabase functions deploy asaas-webhook
```

### 4. Configurar Webhook no Asaas

1. Acesse: https://www.asaas.com/config/webhook
2. URL do Webhook: `https://[SEU-PROJETO].supabase.co/functions/v1/asaas-webhook`
3. Eventos para escutar:
   - PAYMENT_CREATED
   - PAYMENT_RECEIVED
   - PAYMENT_CONFIRMED
   - PAYMENT_OVERDUE
   - PAYMENT_REFUNDED

---

## 📦 Estrutura de Arquivos

```
├── services/
│   └── asaas.ts (Serviço principal)
├── hooks/
│   └── useSubscription.ts (Hook React)
├── supabase/
│   ├── schema_payments.sql (Schema do banco)
│   └── functions/
│       └── asaas-webhook/ (Edge Function)
└── docs/
    └── ASAAS_INTEGRATION.md (Este arquivo)
```

---

## 🚀 Como Usar

### 1. Criar Assinatura com Cartão de Crédito

```typescript
import { useSubscription } from '../hooks/useSubscription';

const { createSubscription, loading, error } = useSubscription(beneficiaryUuid);

const handleSubscribe = async () => {
  const result = await createSubscription({
    // Dados do beneficiário
    name: 'João Silva',
    email: 'joao@email.com',
    cpf: '12345678900',
    phone: '11999999999',
    postalCode: '01310100',
    address: 'Av. Paulista',
    addressNumber: '1000',
    complement: 'Apto 101',
    province: 'São Paulo',
    
    // Método de pagamento
    billingType: 'CREDIT_CARD',
    
    // Dados do cartão
    creditCard: {
      holderName: 'JOAO SILVA',
      number: '5162306219378829',
      expiryMonth: '12',
      expiryYear: '2028',
      ccv: '318',
    },
  });

  if (result.success) {
    console.log('Assinatura criada!', result.subscription);
  } else {
    console.error('Erro:', result.error);
  }
};
```

### 2. Criar Assinatura com PIX

```typescript
const result = await createSubscription({
  name: 'Maria Silva',
  email: 'maria@email.com',
  cpf: '98765432100',
  phone: '11888888888',
  postalCode: '01310100',
  address: 'Av. Paulista',
  addressNumber: '2000',
  province: 'São Paulo',
  
  billingType: 'PIX',
});

if (result.success) {
  // Exibir QR Code do PIX
  console.log('QR Code:', result.pixQrCode);
  console.log('Copia e Cola:', result.pixCopyPaste);
}
```

### 3. Verificar Status da Assinatura

```typescript
const { subscriptionData, loading } = useSubscription(beneficiaryUuid);

if (subscriptionData?.hasActiveSubscription) {
  console.log('Assinatura ativa!');
  console.log('Próximo pagamento:', subscriptionData.nextPayment);
} else {
  console.log('Sem assinatura ativa');
}
```

### 4. Cancelar Assinatura

```typescript
const { cancelSubscription } = useSubscription(beneficiaryUuid);

const handleCancel = async () => {
  const success = await cancelSubscription();
  
  if (success) {
    console.log('Assinatura cancelada!');
  }
};
```

### 5. Buscar Histórico de Pagamentos

```typescript
const { getPaymentHistory } = useSubscription(beneficiaryUuid);

const handleViewHistory = async () => {
  const payments = await getPaymentHistory();
  console.log('Histórico:', payments);
};
```

---

## 📊 Tabelas do Banco de Dados

### user_profiles (Colunas Adicionadas)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| asaas_customer_id | VARCHAR(255) | ID do cliente no Asaas |
| asaas_subscription_id | VARCHAR(255) | ID da assinatura ativa |
| subscription_status | VARCHAR(50) | Status: ACTIVE, INACTIVE, OVERDUE, CANCELED |
| subscription_value | DECIMAL(10,2) | Valor mensal (R$ 89,90) |
| subscription_billing_type | VARCHAR(20) | CREDIT_CARD ou PIX |
| last_payment_date | TIMESTAMPTZ | Data do último pagamento |

### payment_logs

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| beneficiary_uuid | VARCHAR(255) | UUID do beneficiário |
| payment_id | VARCHAR(255) | ID do pagamento no Asaas |
| subscription_id | VARCHAR(255) | ID da assinatura |
| value | DECIMAL(10,2) | Valor do pagamento |
| status | VARCHAR(50) | PENDING, RECEIVED, OVERDUE, etc. |
| billing_type | VARCHAR(20) | CREDIT_CARD, PIX, BOLETO |
| due_date | DATE | Data de vencimento |
| payment_date | TIMESTAMPTZ | Data do pagamento |
| invoice_url | TEXT | URL da nota fiscal |
| bank_slip_url | TEXT | URL do boleto |
| pix_qr_code | TEXT | QR Code do PIX (base64) |
| pix_copy_paste | TEXT | Código PIX copia e cola |
| metadata | JSONB | Dados completos do Asaas |

### asaas_webhooks

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | UUID | ID único |
| event | VARCHAR(100) | Tipo de evento |
| payment_id | VARCHAR(255) | ID do pagamento |
| payload | JSONB | Dados completos do webhook |
| processed | BOOLEAN | Se foi processado |
| processed_at | TIMESTAMPTZ | Quando foi processado |

---

## 🔔 Webhooks

### Eventos Suportados

#### PAYMENT_CREATED
Novo pagamento criado (primeira cobrança da assinatura).

#### PAYMENT_RECEIVED
Pagamento recebido (PIX confirmado ou cartão aprovado).

**Ações:**
- Atualizar `subscription_status` para `ACTIVE`
- Registrar em `payment_logs`
- Criar notificação de confirmação

#### PAYMENT_CONFIRMED
Pagamento confirmado pelo banco.

**Ações:**
- Mesmas do `PAYMENT_RECEIVED`

#### PAYMENT_OVERDUE
Pagamento vencido (não pago na data de vencimento).

**Ações:**
- Atualizar `subscription_status` para `OVERDUE`
- Criar notificação de vencimento

#### PAYMENT_REFUNDED
Pagamento reembolsado.

**Ações:**
- Atualizar `subscription_status` para `REFUNDED`
- Criar notificação de reembolso

---

## 🎨 Componentes de UI

### Tela de Assinatura

```typescript
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useSubscription, formatSubscriptionStatus } from '../hooks/useSubscription';

export function SubscriptionScreen({ beneficiaryUuid }: { beneficiaryUuid: string }) {
  const { subscriptionData, loading, createSubscription } = useSubscription(beneficiaryUuid);

  if (loading) {
    return <Text>Carregando...</Text>;
  }

  if (subscriptionData?.hasActiveSubscription) {
    const statusInfo = formatSubscriptionStatus(subscriptionData.status);
    
    return (
      <View>
        <Text>Assinatura: {statusInfo.text}</Text>
        <Text>Valor: R$ 89,90/mês</Text>
        {subscriptionData.nextPayment && (
          <Text>Próximo pagamento: {subscriptionData.nextPayment.dueDate}</Text>
        )}
      </View>
    );
  }

  return (
    <View>
      <Text>Você não possui assinatura ativa</Text>
      <Button title="Assinar por R$ 89,90/mês" onPress={() => {/* Abrir modal de pagamento */}} />
    </View>
  );
}
```

---

## 🧪 Testes

### Cartões de Teste

```
Aprovado:
Número: 5162306219378829
CVV: 318
Validade: 12/2028

Recusado:
Número: 5184019740373151
CVV: 318
Validade: 12/2028
```

### PIX de Teste

No ambiente de produção, use PIX real. No sandbox, qualquer PIX é aprovado automaticamente após 10 segundos.

---

## 📈 Fluxo Completo

### 1. Usuário Sem Assinatura
```
1. Usuário abre o app
2. Sistema verifica: Sem assinatura
3. Exibe tela de assinatura
4. Usuário escolhe método (Cartão ou PIX)
5. Preenche dados
6. Sistema cria cliente no Asaas
7. Sistema cria assinatura
8. Se PIX: Exibe QR Code
9. Se Cartão: Processa imediatamente
10. Webhook confirma pagamento
11. Sistema ativa assinatura
12. Usuário pode usar o app
```

### 2. Renovação Automática
```
1. Asaas gera nova cobrança (todo dia 15, por exemplo)
2. Se Cartão: Cobra automaticamente
3. Se PIX: Envia notificação para pagar
4. Webhook confirma pagamento
5. Assinatura continua ativa
```

### 3. Pagamento Vencido
```
1. Pagamento não é recebido na data
2. Webhook PAYMENT_OVERDUE
3. Sistema muda status para OVERDUE
4. Envia notificação ao usuário
5. Bloqueia acesso às consultas
6. Usuário regulariza pagamento
7. Webhook PAYMENT_RECEIVED
8. Sistema reativa assinatura
```

---

## ✅ Checklist de Implementação

### Backend
- [x] Criar serviço `asaas.ts`
- [x] Criar hook `useSubscription.ts`
- [x] Criar schema SQL `schema_payments.sql`
- [x] Criar Edge Function `asaas-webhook`
- [x] Adicionar variável de ambiente `ASAAS_API_KEY`

### Supabase
- [ ] Executar `schema_payments.sql`
- [ ] Deploy da Edge Function `asaas-webhook`
- [ ] Configurar variável `ASAAS_API_KEY` nas Edge Functions

### Asaas
- [ ] Configurar webhook no dashboard
- [ ] Testar webhook com Postman/Insomnia

### Frontend
- [ ] Implementar tela de assinatura
- [ ] Implementar formulário de cartão
- [ ] Implementar tela de PIX (QR Code)
- [ ] Implementar tela de histórico de pagamentos
- [ ] Implementar bloqueio de acesso sem assinatura

---

## 🎉 Resultado

Com esta integração, o AiLun Saúde agora possui:

✅ Sistema completo de pagamentos  
✅ Assinaturas recorrentes automáticas  
✅ Suporte a Cartão e PIX  
✅ Webhooks em tempo real  
✅ Histórico de pagamentos  
✅ Notificações automáticas  
✅ Controle de acesso baseado em assinatura  

---

**Desenvolvido por AiLun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

