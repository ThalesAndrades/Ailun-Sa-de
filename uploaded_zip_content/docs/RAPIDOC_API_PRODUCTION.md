# RapiDoc TEMA - API de Produção

## 🚀 Configuração de Produção

O projeto está configurado para usar a **API de Produção** da RapiDoc TEMA.

---

## 🔧 Configuração

### URL Base
```
https://api.rapidoc.tech/tema/api
```

### Headers Obrigatórios
```
Authorization: Bearer {TOKEN}
clientId: {CLIENT_ID}
Content-Type: application/vnd.rapidoc.tema-v2+json
```

---

## 🔐 Credenciais

As credenciais devem ser configuradas como **variáveis de ambiente** no Supabase:

### No Supabase Dashboard

1. Acesse: https://app.supabase.com/project/bmtieinegditdeijyslu/settings/functions
2. Vá em **Edge Functions** → **Settings**
3. Adicione as seguintes variáveis:

```env
RAPIDOC_TOKEN=seu_token_de_producao
RAPIDOC_CLIENT_ID=seu_client_id_de_producao
```

### Como Obter as Credenciais

**Contato RapiDoc:**
- WhatsApp: (51) 8314-0497
- Solicite: "Credenciais de produção para API TEMA"

---

## 📋 Endpoints Disponíveis

### 1. Beneficiários

#### Adicionar Beneficiário
```http
POST /beneficiaries
Content-Type: application/vnd.rapidoc.tema-v2+json

[
  {
    "name": "João Silva",
    "cpf": "12345678900",
    "birthday": "1990-01-15",
    "phone": "11999999999",
    "email": "joao@email.com",
    "serviceType": "GSP"
  }
]
```

#### Solicitar Atendimento Imediato
```http
GET /beneficiaries/{uuid}/request-appointment
```

#### Inativar Beneficiário
```http
DELETE /beneficiaries/{uuid}
```

---

### 2. Especialidades

#### Listar Especialidades
```http
GET /specialties
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "abc123",
      "name": "Cardiologia",
      "description": "Especialidade em doenças do coração"
    }
  ]
}
```

---

### 3. Encaminhamentos

#### Listar Encaminhamentos
```http
GET /beneficiary-medical-referrals
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "ref123",
      "beneficiaryUuid": "ben123",
      "specialtyUuid": "spec123",
      "specialtyName": "Cardiologia",
      "referralDate": "2025-10-01",
      "status": "active"
    }
  ]
}
```

---

### 4. Disponibilidade

#### Listar Horários Disponíveis
```http
GET /specialty-availability?specialtyUuid={uuid}&dateInitial={dd/MM/yyyy}&dateFinal={dd/MM/yyyy}&beneficiaryUuid={uuid}
```

**Exemplo:**
```http
GET /specialty-availability?specialtyUuid=abc123&dateInitial=15/10/2025&dateFinal=15/11/2025&beneficiaryUuid=ben123
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "uuid": "avail123",
      "date": "15/10/2025",
      "time": "14:00",
      "professionalName": "Dr. João Silva",
      "specialtyUuid": "abc123"
    }
  ]
}
```

---

### 5. Agendamentos

#### Agendar COM Encaminhamento
```http
POST /appointments
Content-Type: application/vnd.rapidoc.tema-v2+json

{
  "beneficiaryUuid": "ben123",
  "availabilityUuid": "avail123",
  "specialtyUuid": "spec123",
  "beneficiaryMedicalReferralUuid": "ref123"
}
```

#### Agendar SEM Encaminhamento
```http
POST /appointments
Content-Type: application/vnd.rapidoc.tema-v2+json

{
  "beneficiaryUuid": "ben123",
  "availabilityUuid": "avail123",
  "specialtyUuid": "spec123",
  "approveAdditionalPayment": true
}
```

#### Listar Agendamentos
```http
GET /appointments
```

#### Buscar Agendamento Específico
```http
GET /appointments/{uuid}
```

#### Cancelar Agendamento
```http
DELETE /appointments/{uuid}
```

---

## 🔄 Fluxos de Integração

### Fluxo 1: Médico Imediato

```
1. POST /beneficiaries (se não existir)
2. GET /beneficiaries/{uuid}/request-appointment
3. Retorna URL da consulta
```

### Fluxo 2: Especialista

```
1. GET /specialties (listar especialidades)
2. GET /beneficiary-medical-referrals (verificar encaminhamento)
3. GET /specialty-availability (listar horários)
4. POST /appointments (confirmar agendamento)
```

### Fluxo 3: Nutricionista

```
1. GET /specialties (buscar UUID da nutrição)
2. GET /beneficiary-medical-referrals (verificar encaminhamento)
3. GET /specialty-availability (listar horários)
4. POST /appointments (confirmar agendamento)
```

### Fluxo 4: Psicologia

```
1. GET /specialties (buscar UUID da psicologia)
2. GET /beneficiary-medical-referrals (verificar encaminhamento)
3. GET /specialty-availability (listar horários)
4. POST /appointments (confirmar agendamento)
```

---

## ⚠️ Diferenças entre Sandbox e Produção

| Aspecto | Sandbox | Produção |
|---------|---------|----------|
| **URL Base** | `https://sandbox.rapidoc.tech/tema/api` | `https://api.rapidoc.tech/tema/api` |
| **Credenciais** | Teste | Reais |
| **Dados** | Fictícios | Reais |
| **Cobrança** | Não | Sim |
| **Encaminhamentos** | Precisam ser solicitados ao suporte | Gerados automaticamente |

---

## 🧪 Testar em Produção

### 1. Configurar Credenciais

```bash
# No Supabase Dashboard
# Settings → Edge Functions → Environment Variables

RAPIDOC_TOKEN=seu_token_real
RAPIDOC_CLIENT_ID=seu_client_id_real
```

### 2. Testar Conexão

```typescript
import { listSpecialties } from './services/rapidoc';

const testConnection = async () => {
  const result = await listSpecialties();
  
  if (result.success) {
    console.log('✅ Conexão com produção OK');
    console.log('Especialidades:', result.data);
  } else {
    console.error('❌ Erro:', result.error);
  }
};
```

### 3. Criar Beneficiário de Teste

```typescript
import { addBeneficiary } from './services/rapidoc';

const createTestBeneficiary = async () => {
  const result = await addBeneficiary({
    name: 'Usuário Teste',
    cpf: '12345678900',
    birthday: '1990-01-15',
    phone: '11999999999',
    email: 'teste@ailun.com.br',
    serviceType: 'GSP', // Clínico + Especialistas + Psicologia
  });
  
  if (result.success) {
    console.log('✅ Beneficiário criado:', result.data.uuid);
    return result.data.uuid;
  }
};
```

---

## 📊 Monitoramento

### Logs da Edge Function

1. Acesse: https://app.supabase.com/project/bmtieinegditdeijyslu/functions
2. Clique em **rapidoc**
3. Vá em **Logs**

### Verificar Requisições

```typescript
// Logs são automaticamente gerados
console.log('RapiDoc request:', { action, beneficiaryUuid });
console.error('RapiDoc error:', { message, timestamp });
```

---

## 🔒 Segurança

### Boas Práticas

1. ✅ **Nunca exponha** as credenciais no código
2. ✅ **Use variáveis de ambiente** no Supabase
3. ✅ **Valide autenticação** do usuário antes de chamar API
4. ✅ **Registre logs** de todas as operações
5. ✅ **Trate erros** adequadamente

### Exemplo de Validação

```typescript
// Já implementado na Edge Function
const { data: { user }, error } = await supabaseClient.auth.getUser();

if (error || !user) {
  return { success: false, error: 'Não autorizado' };
}
```

---

## 📞 Suporte

### RapiDoc
- **WhatsApp**: (51) 8314-0497
- **Email**: suporte@rapidoc.tech

### AiLun Tecnologia
- **CNPJ**: 60.740.536/0001-75
- **Email**: contato@ailun.com.br

---

## ✅ Checklist de Produção

- [ ] Credenciais de produção configuradas no Supabase
- [ ] URL base atualizada para `https://api.rapidoc.tech/tema/api`
- [ ] Teste de conexão realizado
- [ ] Beneficiários criados
- [ ] Fluxo de médico imediato testado
- [ ] Fluxo de especialistas testado
- [ ] Fluxo de nutricionista testado
- [ ] Fluxo de psicologia testado
- [ ] Logs configurados
- [ ] Tratamento de erros implementado
- [ ] Documentação atualizada

---

**Última atualização**: 13/10/2025  
**Versão da API**: v2  
**Ambiente**: Produção

