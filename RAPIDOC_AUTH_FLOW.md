# Fluxo de Autenticação RapiDoc

**Data**: 23 de outubro de 2025  
**Versão**: 1.0  
**Status**: ✅ Implementado

---

## 📋 Visão Geral

Sistema de autenticação integrado que permite login direto de usuários cadastrados na API RapiDoc sem necessidade de cadastro prévio no app Ailun Saúde.

---

## 🔄 Fluxo de Autenticação

### 1. Login do Usuário

```
Usuário insere CPF e senha (4 primeiros dígitos do CPF)
         ↓
Validação de formato do CPF
         ↓
Tentativa de autenticação via RapiDoc API
         ↓
    ┌────────────┐
    │ Sucesso?   │
    └────┬───┬───┘
         │   │
    Sim  │   │  Não
         │   │
         ↓   ↓
    RapiDoc  Autenticação Local
         ↓         ↓
    Sincronizar   Verificar
    com Supabase  Supabase
         ↓         ↓
    Criar/Obter   Login
    Usuário       Tradicional
         ↓         ↓
    Gerar Tokens  ↓
         ↓         ↓
    Login Sucesso ↓
         └─────────┘
              ↓
         Dashboard
```

---

## 🔑 Componentes Principais

### 1. RapiDoc Auth Service (`services/rapidoc-auth.ts`)

**Funções principais**:

#### `fetchRapidocBeneficiaryByCPF(cpf: string)`
- Busca beneficiário na API RapiDoc
- Valida se está ativo
- Retorna dados do beneficiário

#### `authenticateWithRapidoc(cpf: string, password: string)`
- Autenticação completa via RapiDoc
- Sincroniza com Supabase
- Cria/obtém usuário
- Gera tokens JWT
- Retorna resultado completo

#### `syncRapidocBeneficiaryToSupabase(beneficiary)`
- Sincroniza dados do RapiDoc para Supabase
- Cria ou atualiza registro de beneficiário
- Mantém dados atualizados

#### `syncAllRapidocBeneficiaries()`
- Sincronização em massa
- Importa todos os beneficiários ativos
- Útil para migração inicial

### 2. Hook Atualizado (`hooks/useActiveBeneficiaryAuth.ts`)

**Fluxo de login**:
1. Validar formato do CPF
2. **Tentar RapiDoc primeiro** (novo)
3. Se falhar, tentar autenticação local
4. Redirecionar para dashboard ou onboarding

---

## 📊 Estrutura de Dados

### RapidocBeneficiary

```typescript
interface RapidocBeneficiary {
  id: string;
  cpf: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  service_type: string;  // G, GP, GS, GSP
  status: string;        // active, inactive
  is_active: boolean;
  beneficiary_uuid?: string;
}
```

### RapidocAuthResult

```typescript
interface RapidocAuthResult {
  success: boolean;
  beneficiary?: RapidocBeneficiary;
  user?: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  error?: string;
  requiresOnboarding?: boolean;
}
```

---

## 🔐 Segurança

### Validação de Senha

- Senha padrão: **4 primeiros dígitos do CPF**
- Validação no servidor
- Não armazena senha em texto plano
- Usa tokens JWT após autenticação

### Proteção de Dados

- Logs não expõem CPF completo (apenas 3 primeiros dígitos)
- Comunicação HTTPS com RapiDoc API
- Tokens JWT com expiração
- Dados sensíveis no SecureStore

### Headers RapiDoc

```typescript
{
  'Authorization': 'Bearer [TOKEN]',
  'clientId': '[CLIENT_ID]',
  'Content-Type': 'application/vnd.rapidoc.tema-v2+json'
}
```

---

## 🚀 Uso

### Login Simples

```typescript
import { useActiveBeneficiaryAuth } from '../hooks/useActiveBeneficiaryAuth';

const { loginWithCPF, loading } = useActiveBeneficiaryAuth();

// Login automático com RapiDoc
const result = await loginWithCPF('123.456.789-00', '1234');

if (result.success) {
  // Usuário autenticado
  // Redirecionado automaticamente
}
```

### Verificar CPF na RapiDoc

```typescript
import { checkRapidocCPF } from '../services/rapidoc-auth';

const { exists, isActive, beneficiary } = await checkRapidocCPF('12345678900');

if (exists && isActive) {
  console.log('Beneficiário ativo:', beneficiary.full_name);
}
```

### Sincronização em Massa

```typescript
import { syncAllRapidocBeneficiaries } from '../services/rapidoc-auth';

const result = await syncAllRapidocBeneficiaries();

console.log(`Sincronizados: ${result.synced}, Erros: ${result.errors}`);
```

---

## 📝 Cenários de Uso

### Cenário 1: Usuário Novo da RapiDoc

1. Usuário existe na RapiDoc ✅
2. Usuário NÃO existe no Supabase ❌
3. Sistema:
   - Busca dados na RapiDoc
   - Cria beneficiário no Supabase
   - Cria usuário no Supabase
   - Cria perfil
   - Gera tokens
   - Redireciona para onboarding

### Cenário 2: Usuário Existente

1. Usuário existe na RapiDoc ✅
2. Usuário JÁ existe no Supabase ✅
3. Sistema:
   - Busca dados na RapiDoc
   - Atualiza dados no Supabase
   - Obtém usuário existente
   - Gera tokens
   - Redireciona para dashboard

### Cenário 3: Usuário Inativo

1. Usuário existe na RapiDoc ✅
2. Status: `inactive` ou `is_active: false` ❌
3. Sistema:
   - Retorna erro
   - Mensagem: "Beneficiário inativo. Entre em contato com o suporte."

### Cenário 4: CPF Não Encontrado

1. CPF não existe na RapiDoc ❌
2. Sistema:
   - Tenta autenticação local
   - Se falhar, retorna erro
   - Mensagem: "CPF não encontrado"

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
RAPIDOC_BASE_URL=https://api.rapidoc.tech/tema/api/
RAPIDOC_CLIENT_ID=540e4b44-d68d-4ade-885f-fd4940a3a045
RAPIDOC_TOKEN=eyJhbGciOiJSUzUxMiJ9...
```

### Configuração no Código

```typescript
// config/rapidoc.config.ts
export const RAPIDOC_CONFIG = {
  BASE_URL: process.env.RAPIDOC_BASE_URL,
  CLIENT_ID: process.env.RAPIDOC_CLIENT_ID,
  TOKEN: process.env.RAPIDOC_TOKEN,
  CONTENT_TYPE: 'application/vnd.rapidoc.tema-v2+json',
  
  get HEADERS() {
    return {
      'Authorization': `Bearer ${this.TOKEN}`,
      'clientId': this.CLIENT_ID,
      'Content-Type': this.CONTENT_TYPE,
    };
  },
};
```

---

## 📊 Tipos de Serviço

| Código | Nome | Preço | Inclui |
|--------|------|-------|--------|
| **G** | Clínico 24h | R$ 49,90 | Clínico geral |
| **GP** | Clínico + Psicologia | R$ 89,90 | Clínico + Psicologia |
| **GS** | Clínico + Especialistas | R$ 79,90 | Clínico + Especialistas |
| **GSP** | Completo | R$ 119,90 | Todos os serviços |

---

## 🐛 Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| `CPF não encontrado no sistema RapiDoc` | CPF não cadastrado | Cadastrar na RapiDoc |
| `Beneficiário inativo` | Status inativo na RapiDoc | Ativar beneficiário |
| `Senha incorreta` | Senha != 4 primeiros dígitos | Usar senha correta |
| `Erro de conexão com a API RapiDoc` | Timeout ou rede | Tentar novamente |
| `Erro ao sincronizar dados` | Problema no Supabase | Verificar logs |

### Logs

```typescript
// Exemplo de logs
[RapidocAuth] Buscando beneficiário na RapiDoc: 123***
[RapidocAuth] Beneficiário encontrado e ativo na RapiDoc
[RapidocAuth] Sincronizando beneficiário com Supabase
[RapidocAuth] Beneficiário atualizado no Supabase
[RapidocAuth] Criando novo usuário Supabase
[RapidocAuth] Usuário e perfil criados com sucesso
[RapidocAuth] Autenticação concluída com sucesso
```

---

## 🧪 Testes

### Teste Manual

1. **Login com usuário RapiDoc novo**:
   ```
   CPF: 123.456.789-00
   Senha: 1234
   ```
   Resultado esperado: Criação de conta + onboarding

2. **Login com usuário existente**:
   ```
   CPF: 987.654.321-00
   Senha: 9876
   ```
   Resultado esperado: Login direto + dashboard

3. **Login com CPF inativo**:
   ```
   CPF: 111.222.333-44
   Senha: 1112
   ```
   Resultado esperado: Erro "Beneficiário inativo"

4. **Login com senha errada**:
   ```
   CPF: 123.456.789-00
   Senha: 0000
   ```
   Resultado esperado: Erro "Senha incorreta"

---

## 📈 Melhorias Futuras

### Curto Prazo

- [ ] Cache de beneficiários RapiDoc (5 minutos)
- [ ] Retry automático em caso de timeout
- [ ] Métricas de uso (quantos logins via RapiDoc)

### Médio Prazo

- [ ] Sincronização automática diária
- [ ] Webhook da RapiDoc para atualizações
- [ ] Dashboard de administração

### Longo Prazo

- [ ] SSO (Single Sign-On) com RapiDoc
- [ ] Autenticação biométrica integrada
- [ ] Multi-fator authentication (MFA)

---

## 🔗 Referências

- **RapiDoc API**: https://api.rapidoc.tech/tema/api/
- **Documentação Supabase**: https://supabase.com/docs
- **Token Service**: `services/tokenService.ts`
- **Active Beneficiary Auth**: `services/active-beneficiary-auth.ts`

---

## ✅ Checklist de Implementação

- [x] Criar `rapidoc-auth.ts`
- [x] Atualizar `useActiveBeneficiaryAuth.ts`
- [x] Integrar com `tokenService`
- [x] Sincronização com Supabase
- [x] Tratamento de erros
- [x] Logs de auditoria
- [x] Documentação completa
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Deploy em produção

---

## 📞 Suporte

Para problemas ou dúvidas:
- Email: suporte@ailun.com.br
- Documentação: Este arquivo
- Logs: Verificar console do app

---

**Implementado em**: 23 de outubro de 2025  
**Versão**: 1.0  
**Status**: ✅ Pronto para uso

