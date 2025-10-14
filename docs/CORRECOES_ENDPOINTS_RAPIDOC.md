# Correções de Endpoints da API Rapidoc TEMA

## Data: 14 de outubro de 2025

## Resumo

Este documento detalha as correções realizadas nos endpoints da API Rapidoc para alinhamento com a documentação oficial da API TEMA.

---

## Mudanças Implementadas

### 1. Base URL Atualizada

**Antes:**
```
https://api.rapidoc.tech/
```

**Depois:**
```
https://sandbox.rapidoc.tech/tema/api/
```

**Arquivos Afetados:**
- `config/rapidoc.config.ts`
- `services/rapidoc-consultation-service.ts`

---

### 2. Endpoints de Beneficiários

Os endpoints de beneficiários já estavam corretos conforme a documentação:

- **POST** `/beneficiaries` - Adicionar beneficiários
- **GET** `/beneficiaries/:uuid/request-appointment` - Solicitar atendimento
- **DELETE** `/beneficiaries/:uuid` - Inativar beneficiário

**Arquivo:** `services/rapidoc-api-adapter.ts`

---

### 3. Endpoints de Encaminhamentos

O endpoint de encaminhamentos já estava correto:

- **GET** `/beneficiary-medical-referrals` - Ler encaminhamentos

**Arquivo:** `services/referral-service.ts`

---

### 4. Endpoints de Agendamento

#### 4.1. Especialidades

Endpoint já estava correto:

- **GET** `/specialties` - Ler especialidades

**Arquivo:** `services/specialty-service.ts`

#### 4.2. Disponibilidade

Endpoint já estava correto:

- **GET** `/specialty-availability` - Ler disponibilidade por especialidades

**Parâmetros:**
- `specialtyUuid`: UUID da especialidade
- `dateInitial`: Data inicial (formato: dd/MM/yyyy)
- `dateFinal`: Data final (formato: dd/MM/yyyy)
- `beneficiaryUuid`: UUID do beneficiário

**Arquivo:** `services/availability-service.ts`

#### 4.3. Agendamentos

Os endpoints de agendamentos foram corrigidos:

- **POST** `/appointments` - Realizar agendamento
- **GET** `/appointments` - Ler agendamentos
- **GET** `/appointments/:uuid` - Ler agendamento por UUID
- **DELETE** `/appointments/:uuid` - Cancelar agendamento

**Correção Principal:**
- Mudança do endpoint de cancelamento de `POST /appointments/:uuid/cancel` para `DELETE /appointments/:uuid`

**Arquivo:** `services/appointment-service.ts`

---

### 5. Endpoint de Solicitação de Consulta Imediata

**Antes:**
```typescript
POST /consultations/immediate
```

**Depois:**
```typescript
GET /beneficiaries/:uuid/request-appointment
```

**Arquivo:** `services/rapidoc-consultation-service.ts`

**Nota:** Este endpoint retorna uma URL de consulta para webview, conforme especificado na documentação TEMA.

---

## Headers Padrão

Todos os serviços utilizam os seguintes headers padrão:

```typescript
{
  'Authorization': `Bearer ${RAPIDOC_TOKEN}`,
  'clientId': '540e4b44-d68d-4ade-885f-fd4940a3a045',
  'Content-Type': 'application/vnd.rapidoc.tema-v2+json'
}
```

---

## Estrutura de Resposta Padrão

A API Rapidoc TEMA retorna respostas no seguinte formato:

```json
{
  "message": "Processamento concluido com sucesso",
  "success": true,
  "data": {...}
}
```

---

## Códigos de Status HTTP

- **200 OK**: Operação realizada com sucesso
- **201 CREATED**: Recurso criado com sucesso
- Outros códigos de erro conforme padrão HTTP

---

## Próximos Passos

1. **Testar Endpoints**: Realizar testes abrangentes de todos os endpoints corrigidos em ambiente de desenvolvimento.
2. **Validar Respostas**: Verificar se as respostas da API estão sendo processadas corretamente.
3. **Atualizar Variáveis de Ambiente**: Garantir que `EXPO_PUBLIC_RAPIDOC_API_TOKEN` esteja configurado corretamente.
4. **Documentar Casos de Uso**: Criar exemplos de uso para cada endpoint.

---

## Referências

- Documentação oficial da API Rapidoc TEMA (arquivo: `RapidocTEMA-InformaçõesdaAPI(2)`)
- Base URL de Sandbox: `https://sandbox.rapidoc.tech/tema/api/`
- Contato para suporte: WhatsApp (51) 8314-0497

---

## Observações Importantes

1. **Ambiente de Sandbox**: A base URL atual aponta para o ambiente de sandbox. Para produção, será necessário atualizar para a URL de produção fornecida pela Rapidoc.
2. **Token de API**: O token deve ser mantido em variável de ambiente (`EXPO_PUBLIC_RAPIDOC_API_TOKEN`) e nunca hardcoded no código.
3. **Client ID**: O Client ID é fixo (`540e4b44-d68d-4ade-885f-fd4940a3a045`) conforme configuração atual.
4. **Content-Type**: O Content-Type específico `application/vnd.rapidoc.tema-v2+json` deve ser mantido em todas as requisições.

---

## Checklist de Validação

- [x] Base URL atualizada para sandbox
- [x] Endpoint de cancelamento de agendamento corrigido
- [x] Endpoint de solicitação de consulta imediata atualizado
- [ ] Testes de integração realizados
- [ ] Validação de respostas da API
- [ ] Documentação de casos de uso criada
- [ ] Migração para ambiente de produção planejada

---

**Autor:** Manus AI  
**Data de Criação:** 14 de outubro de 2025  
**Última Atualização:** 14 de outubro de 2025

