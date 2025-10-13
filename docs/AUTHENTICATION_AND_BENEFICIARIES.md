# 🔐 Autenticação e Gerenciamento de Beneficiários - AiLun Saude

Este documento explica como funciona o sistema de autenticação do aplicativo AiLun Saude e como os dados dos beneficiários são gerenciados entre o Supabase (autenticação) e a RapiDoc (serviços de saúde).

---

## 🏗️ Arquitetura de Autenticação

O sistema utiliza **duas plataformas distintas** que trabalham juntas:

### 1. **Supabase Auth** (Autenticação e Perfil do Usuário)
- **Responsável por**: Login, registro, recuperação de senha, sessões
- **Armazena**: Email, senha (criptografada), ID do usuário
- **Tabela principal**: `auth.users` (gerenciada automaticamente pelo Supabase)
- **Tabela de perfil**: `public.user_profiles` (criada por você)

### 2. **RapiDoc TEMA** (Beneficiários e Serviços de Saúde)
- **Responsável por**: Consultas médicas, agendamentos, encaminhamentos
- **Armazena**: Dados do beneficiário (nome, CPF, telefone, etc.)
- **Identificador**: `beneficiaryUuid` (UUID único gerado pela RapiDoc)

---

## 🔄 Como Funciona o Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE AUTENTICAÇÃO                        │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRO DO USUÁRIO
   ↓
   Usuário preenche: Email, Senha, Nome, CPF, Telefone, Data de Nascimento
   ↓
   ┌──────────────────────────────────────────────────────────┐
   │ SUPABASE AUTH                                            │
   │ - Cria conta com email/senha                             │
   │ - Gera userId (UUID)                                     │
   │ - Armazena em auth.users                                 │
   └──────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────┐
   │ TRIGGER AUTOMÁTICO (on_auth_user_created)                │
   │ - Cria registro em user_profiles                         │
   │ - Associa userId do auth.users                           │
   └──────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────┐
   │ RAPIDOC API                                              │
   │ - Adiciona beneficiário na RapiDoc                       │
   │ - Envia: nome, CPF, telefone, email, data nascimento    │
   │ - Recebe: beneficiaryUuid                                │
   └──────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────┐
   │ ATUALIZAR PERFIL NO SUPABASE                             │
   │ - Salva beneficiaryUuid em user_profiles                 │
   │ - Campo: rapidoc_beneficiary_uuid                        │
   └──────────────────────────────────────────────────────────┘
   ↓
   ✅ USUÁRIO PRONTO PARA USAR O APP


2. LOGIN DO USUÁRIO
   ↓
   Usuário insere: Email e Senha
   ↓
   ┌──────────────────────────────────────────────────────────┐
   │ SUPABASE AUTH                                            │
   │ - Valida credenciais                                     │
   │ - Cria sessão (JWT token)                                │
   │ - Retorna userId                                         │
   └──────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────┐
   │ BUSCAR PERFIL DO USUÁRIO                                 │
   │ - Query: SELECT * FROM user_profiles WHERE id = userId   │
   │ - Obtém: rapidoc_beneficiary_uuid, nome, etc.            │
   └──────────────────────────────────────────────────────────┘
   ↓
   ✅ USUÁRIO LOGADO E PRONTO PARA AGENDAR CONSULTAS
```

---

## 📊 Onde Ficam os Dados dos Beneficiários

### No **Supabase** (Banco de Dados PostgreSQL)

#### Tabela: `auth.users` (Gerenciada pelo Supabase)
```sql
-- Criada automaticamente pelo Supabase Auth
-- NÃO é acessível diretamente via SQL Editor
-- Armazena dados de autenticação

Campos principais:
- id (UUID) - Identificador único do usuário
- email (TEXT) - Email de login
- encrypted_password (TEXT) - Senha criptografada
- email_confirmed_at (TIMESTAMP) - Data de confirmação do email
- created_at (TIMESTAMP) - Data de criação
```

#### Tabela: `public.user_profiles` (Criada por você)
```sql
-- Tabela criada pelo seu schema SQL
-- Acessível e editável

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    birth_date DATE,
    avatar_url TEXT,
    rapidoc_beneficiary_uuid TEXT, -- ⭐ CHAVE DE LIGAÇÃO COM RAPIDOC
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

Exemplo de registro:
┌──────────────────────────────────────┬─────────────────┬──────────────┬─────────────┬──────────────────────────────────────┐
│ id                                   │ full_name       │ phone        │ birth_date  │ rapidoc_beneficiary_uuid             │
├──────────────────────────────────────┼─────────────────┼──────────────┼─────────────┼──────────────────────────────────────┤
│ 123e4567-e89b-12d3-a456-426614174000 │ João Silva      │ 11999999999  │ 1990-01-15  │ abc123-def456-ghi789                 │
│ 987f6543-e21c-34d5-b678-123456789abc │ Maria Santos    │ 11988888888  │ 1985-05-20  │ xyz789-uvw456-rst123                 │
└──────────────────────────────────────┴─────────────────┴──────────────┴─────────────┴──────────────────────────────────────┘
```

### Na **RapiDoc TEMA** (API Externa)

A RapiDoc mantém seu próprio banco de dados de beneficiários. Quando você adiciona um beneficiário via API, a RapiDoc armazena:

```json
{
  "uuid": "abc123-def456-ghi789",
  "name": "João Silva",
  "cpf": "12345678900",
  "birthday": "1990-01-15",
  "phone": "11999999999",
  "email": "joao@email.com",
  "serviceType": "GSP",
  "status": "active",
  "createdAt": "2025-10-13T10:00:00Z"
}
```

**Importante**: Você **NÃO tem acesso direto** ao banco de dados da RapiDoc. Todas as operações são feitas via API REST.

---

## 🔑 Login e Senha de Cada Beneficiário

### ⚠️ Conceito Importante: Autenticação vs. Beneficiário

**Existem DOIS sistemas separados:**

1.  **Autenticação no App (Supabase Auth)**
    -   **Login**: Email do usuário (ex: `joao@email.com`)
    -   **Senha**: Senha escolhida pelo usuário no registro (ex: `Senha@123`)
    -   **Onde é usado**: Para fazer login no aplicativo AiLun Saude

2.  **Beneficiário na RapiDoc (Serviços de Saúde)**
    -   **Identificação**: `beneficiaryUuid` (UUID único)
    -   **Não tem login/senha**: A RapiDoc identifica o beneficiário pelo UUID
    -   **Onde é usado**: Nas chamadas à API RapiDoc para agendar consultas

### 📝 Resumo:

| Sistema | Login | Senha | Onde é usado |
|---------|-------|-------|--------------|
| **Supabase Auth** | Email do usuário | Senha do usuário | Login no app |
| **RapiDoc TEMA** | Não tem | Não tem | Identificação via `beneficiaryUuid` |

**Exemplo prático:**

```
Usuário: João Silva
Email: joao@email.com
Senha do App: Senha@123
Supabase userId: 123e4567-e89b-12d3-a456-426614174000
RapiDoc beneficiaryUuid: abc123-def456-ghi789

Para fazer login no app:
- Email: joao@email.com
- Senha: Senha@123

Para agendar consulta na RapiDoc:
- Usa o beneficiaryUuid: abc123-def456-ghi789
- A API da RapiDoc não pede login/senha, apenas o UUID
```

---

## 🔗 Como Conectar os Dois Sistemas

### Passo 1: Registro do Usuário

Quando um novo usuário se registra no app, você precisa:

1.  **Criar conta no Supabase Auth** (email + senha)
2.  **Adicionar beneficiário na RapiDoc** (nome, CPF, telefone, etc.)
3.  **Salvar o `beneficiaryUuid` no perfil do Supabase**

#### Exemplo de Código (Tela de Registro):

```typescript
// screens/RegisterScreen.tsx

import { useState } from 'react';
import { supabase } from '../services/supabase';
import { addBeneficiary } from '../services/rapidoc';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleRegister = async () => {
    try {
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;
      const userId = authData.user?.id;

      if (!userId) throw new Error('Erro ao criar usuário');

      // 2. Adicionar beneficiário na RapiDoc
      const rapidocResult = await addBeneficiary({
        name: fullName,
        cpf: cpf,
        birthday: birthDate, // Formato: YYYY-MM-DD
        phone: phone,
        email: email,
        serviceType: 'GSP', // Generalista, Especialista, Psicologia
      });

      if (!rapidocResult.success) {
        throw new Error(rapidocResult.error || 'Erro ao criar beneficiário na RapiDoc');
      }

      const beneficiaryUuid = rapidocResult.data.uuid;

      // 3. Atualizar perfil no Supabase com o beneficiaryUuid
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          phone: phone,
          birth_date: birthDate,
          rapidoc_beneficiary_uuid: beneficiaryUuid,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
      // Navegar para tela principal
    } catch (error) {
      console.error('Erro no registro:', error);
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Nome Completo" value={fullName} onChangeText={setFullName} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <TextInput placeholder="CPF" value={cpf} onChangeText={setCpf} />
      <TextInput placeholder="Telefone" value={phone} onChangeText={setPhone} />
      <TextInput placeholder="Data de Nascimento (YYYY-MM-DD)" value={birthDate} onChangeText={setBirthDate} />
      <Button title="Cadastrar" onPress={handleRegister} />
    </View>
  );
};
```

### Passo 2: Login do Usuário

Quando o usuário faz login, você precisa:

1.  **Autenticar no Supabase Auth** (email + senha)
2.  **Buscar o perfil do usuário** (incluindo `rapidoc_beneficiary_uuid`)
3.  **Armazenar os dados no estado global** (Context, Redux, etc.)

#### Exemplo de Código (Tela de Login):

```typescript
// screens/LoginScreen.tsx

import { useState } from 'react';
import { supabase } from '../services/supabase';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // 1. Autenticar no Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      const userId = authData.user?.id;

      if (!userId) throw new Error('Erro ao fazer login');

      // 2. Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // 3. Armazenar no estado global (exemplo com Context)
      // setUser({ ...authData.user, profile });

      console.log('Usuário logado:', profile);
      console.log('Beneficiary UUID:', profile.rapidoc_beneficiary_uuid);

      Alert.alert('Sucesso', 'Login realizado com sucesso!');
      // Navegar para tela principal
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
};
```

---

## 📋 Gerenciamento de Beneficiários Ativos

### Como Saber Quais Beneficiários Estão Ativos?

#### No Supabase:
```sql
-- Buscar todos os usuários com beneficiaryUuid
SELECT 
  id,
  full_name,
  phone,
  rapidoc_beneficiary_uuid,
  created_at
FROM user_profiles
WHERE rapidoc_beneficiary_uuid IS NOT NULL;
```

#### Na RapiDoc:
```typescript
// Usar a API da RapiDoc para listar beneficiários
import { listBeneficiaries } from '../services/rapidoc';

const fetchActiveBeneficiaries = async () => {
  const result = await listBeneficiaries();
  if (result.success) {
    console.log('Beneficiários ativos:', result.data);
  }
};
```

### Como Inativar um Beneficiário?

```typescript
import { inactivateBeneficiary } from '../services/rapidoc';

const handleInactivate = async (beneficiaryUuid: string) => {
  const result = await inactivateBeneficiary(beneficiaryUuid);
  if (result.success) {
    Alert.alert('Sucesso', 'Beneficiário inativado.');
    // Opcional: Remover o rapidoc_beneficiary_uuid do perfil no Supabase
  }
};
```

---

## 🔐 Segurança e Boas Práticas

### 1. **Nunca Exponha Credenciais no Frontend**
-   As credenciais da RapiDoc (`RAPIDOC_CLIENT_ID`, `RAPIDOC_TOKEN`) devem estar **apenas nas Edge Functions** do Supabase.
-   O app mobile **nunca** deve ter acesso direto a essas credenciais.

### 2. **Use Row Level Security (RLS)**
-   O RLS já está configurado nas tabelas do Supabase.
-   Isso garante que cada usuário só pode acessar seus próprios dados.

### 3. **Valide Dados no Backend**
-   Use as Edge Functions do Supabase para validar e processar dados antes de enviar para a RapiDoc.

### 4. **Armazene o `beneficiaryUuid` de Forma Segura**
-   O `beneficiaryUuid` deve ser armazenado na tabela `user_profiles` do Supabase.
-   Nunca armazene em `localStorage` ou `AsyncStorage` sem criptografia.

---

## 📊 Diagrama de Relacionamento

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO DO APLICATIVO                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   SUPABASE AUTH         │   │   RAPIDOC TEMA          │
│                         │   │                         │
│ - Email: joao@email.com │   │ - UUID: abc123-def456   │
│ - Senha: ********       │   │ - Nome: João Silva      │
│ - userId: 123e4567...   │   │ - CPF: 12345678900      │
│                         │   │ - Status: active        │
└─────────────────────────┘   └─────────────────────────┘
              │                               ▲
              │                               │
              │   ┌───────────────────────────┘
              │   │ rapidoc_beneficiary_uuid
              ▼   │
┌─────────────────────────────────────────────────────────┐
│   SUPABASE - user_profiles                              │
│                                                         │
│ - id: 123e4567... (FK para auth.users)                 │
│ - full_name: João Silva                                 │
│ - phone: 11999999999                                    │
│ - rapidoc_beneficiary_uuid: abc123-def456 ⭐            │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Implementação

- [ ] Implementar tela de registro com criação de beneficiário na RapiDoc
- [ ] Salvar `beneficiaryUuid` no perfil do usuário no Supabase
- [ ] Implementar tela de login com busca do perfil
- [ ] Armazenar `beneficiaryUuid` no estado global do app
- [ ] Usar `beneficiaryUuid` em todas as chamadas aos serviços de consulta
- [ ] Implementar função para verificar se o usuário já tem `beneficiaryUuid`
- [ ] Criar fluxo para adicionar `beneficiaryUuid` em usuários existentes (se necessário)
- [ ] Testar fluxo completo: Registro → Login → Agendamento

---

## 🆘 Perguntas Frequentes

### 1. **O que acontece se o usuário perder o `beneficiaryUuid`?**
-   Se o `beneficiaryUuid` for perdido do perfil no Supabase, você precisará:
    1.  Buscar o beneficiário na RapiDoc usando CPF ou email
    2.  Ou criar um novo beneficiário
    3.  Atualizar o perfil no Supabase com o UUID correto

### 2. **Posso ter múltiplos beneficiários para um mesmo usuário?**
-   Sim! Por exemplo, um usuário pode gerenciar consultas para dependentes (filhos, cônjuge).
-   Neste caso, você precisará de uma tabela adicional no Supabase para armazenar múltiplos `beneficiaryUuid` associados a um `userId`.

### 3. **Como funciona a recuperação de senha?**
-   A recuperação de senha é gerenciada pelo Supabase Auth.
-   Use `supabase.auth.resetPasswordForEmail(email)` para enviar um email de recuperação.
-   A RapiDoc **não tem sistema de login/senha**, então não há recuperação de senha lá.

---

**Desenvolvido por AiLun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

**Última atualização**: 13/10/2025

