# Guia de Configuração do Supabase Dashboard

Este guia descreve os passos para configurar completamente o Supabase para o projeto AiLun Saude.

## 📋 Pré-requisitos

- Acesso ao [Supabase Dashboard](https://app.supabase.com)
- Projeto criado: `bmtieinegditdeijyslu`

---

## 1️⃣ Criar Tabelas do Banco de Dados

### Passo 1: Acessar o SQL Editor

1. Acesse https://app.supabase.com/project/bmtieinegditdeijyslu
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**

### Passo 2: Executar o Schema

1. Abra o arquivo `supabase/schema.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione `Ctrl+Enter`)

### Passo 3: Verificar Criação

Após executar, você deve ver as seguintes tabelas criadas:

- ✅ `user_profiles`
- ✅ `health_info`
- ✅ `emergency_contacts`
- ✅ `user_preferences`
- ✅ `consultation_logs`
- ✅ `active_sessions`
- ✅ `consultation_queue`
- ✅ `system_notifications`

Para verificar, vá em **Table Editor** no menu lateral.

---

## 2️⃣ Configurar Storage (Buckets)

### Passo 1: Criar Bucket para Avatares

1. No menu lateral, clique em **Storage**
2. Clique em **Create a new bucket**
3. Configure:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Ativado
   - **File size limit**: 2 MB
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. Clique em **Create bucket**

### Passo 2: Configurar Políticas do Bucket Avatars

1. Clique no bucket `avatars`
2. Vá na aba **Policies**
3. Clique em **New Policy** > **For full customization**
4. Crie as seguintes políticas:

**Política 1: Upload de Avatar**
```sql
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Política 2: Atualizar Avatar**
```sql
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Política 3: Visualizar Avatares (Público)**
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### Passo 3: Criar Bucket para Documentos Médicos

1. Clique em **New bucket**
2. Configure:
   - **Name**: `medical-documents`
   - **Public bucket**: ❌ Desativado (privado)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: `application/pdf, image/jpeg, image/png`
3. Clique em **Create bucket**

### Passo 4: Configurar Políticas do Bucket Medical Documents

**Política 1: Upload de Documentos**
```sql
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Política 2: Visualizar Documentos Próprios**
```sql
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**Política 3: Deletar Documentos Próprios**
```sql
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'medical-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 3️⃣ Configurar Autenticação

### Passo 1: Configurar Provedores de Autenticação

1. No menu lateral, clique em **Authentication** > **Providers**
2. Configure os provedores desejados:

#### Email (já habilitado por padrão)
- ✅ Ativado
- **Confirm email**: Recomendado ativar para produção
- **Secure email change**: Ativado

#### Google (opcional)
1. Clique em **Google**
2. Ative o provedor
3. Configure com suas credenciais do Google Cloud Console

#### Apple (opcional)
1. Clique em **Apple**
2. Ative o provedor
3. Configure com suas credenciais do Apple Developer

### Passo 2: Configurar Email Templates

1. Vá em **Authentication** > **Email Templates**
2. Personalize os templates:
   - **Confirm signup**: Email de confirmação de cadastro
   - **Reset password**: Email de recuperação de senha
   - **Magic Link**: Link mágico para login

Exemplo de personalização:

```html
<h2>Bem-vindo ao AiLun Saude!</h2>
<p>Clique no link abaixo para confirmar seu email:</p>
<a href="{{ .ConfirmationURL }}">Confirmar Email</a>
```

### Passo 3: Configurar URLs de Redirecionamento

1. Vá em **Authentication** > **URL Configuration**
2. Adicione as URLs permitidas:
   - `ailun://` (para deep linking no app)
   - `http://localhost:8081` (para desenvolvimento)
   - Sua URL de produção quando disponível

---

## 4️⃣ Configurar Realtime (Opcional)

### Habilitar Realtime para Tabelas

1. Vá em **Database** > **Replication**
2. Selecione as tabelas que devem ter Realtime:
   - ✅ `system_notifications`
   - ✅ `active_sessions`
   - ✅ `consultation_queue`
3. Clique em **Save**

---

## 5️⃣ Testar a Configuração

### Teste 1: Criar Usuário de Teste

1. Vá em **Authentication** > **Users**
2. Clique em **Add user** > **Create new user**
3. Configure:
   - **Email**: `teste@ailun.com.br`
   - **Password**: `Teste123!`
   - **Auto Confirm User**: ✅ Ativado
4. Clique em **Create user**

### Teste 2: Verificar Perfil Criado Automaticamente

1. Vá em **Table Editor** > `user_profiles`
2. Verifique se um perfil foi criado automaticamente para o usuário de teste
3. Se sim, o trigger `on_auth_user_created` está funcionando! ✅

### Teste 3: Executar Script de Teste

No terminal do projeto, execute:

```bash
node scripts/test-supabase.js
```

Você deve ver:
- ✅ Autenticação: OK
- ✅ Banco de Dados: OK
- ✅ Storage: OK

---

## 6️⃣ Configurações de Segurança (Produção)

### Row Level Security (RLS)

Todas as tabelas já têm RLS habilitado pelo script `schema.sql`. Verifique:

1. Vá em **Table Editor**
2. Clique em cada tabela
3. Vá na aba **Policies**
4. Confirme que existem políticas configuradas

### API Keys

**⚠️ IMPORTANTE:**

- **Anon Key**: Use no frontend (já configurada no `.env`)
- **Service Role Key**: Use apenas no backend/servidor
- **NUNCA** exponha a Service Role Key no código do app

### Rate Limiting

1. Vá em **Settings** > **API**
2. Configure limites de requisição:
   - **Auth requests**: 60/hora por IP
   - **Database requests**: 1000/minuto
   - **Storage uploads**: 100/hora por usuário

---

## 7️⃣ Monitoramento

### Logs

1. Vá em **Logs** no menu lateral
2. Monitore:
   - **API Logs**: Requisições à API
   - **Database Logs**: Queries executadas
   - **Auth Logs**: Tentativas de login

### Métricas

1. Vá em **Reports**
2. Monitore:
   - Número de usuários ativos
   - Uso de storage
   - Requisições por endpoint

---

## 8️⃣ Backup e Recuperação

### Configurar Backups Automáticos

1. Vá em **Settings** > **Database**
2. Em **Backup Settings**:
   - **Enable automatic backups**: ✅ Ativado
   - **Retention period**: 7 dias (ou mais para produção)

### Fazer Backup Manual

1. Vá em **Settings** > **Database**
2. Clique em **Create backup**
3. Aguarde a conclusão

---

## ✅ Checklist Final

Antes de ir para produção, verifique:

- [ ] Todas as tabelas criadas
- [ ] RLS habilitado em todas as tabelas
- [ ] Buckets de storage criados
- [ ] Políticas de storage configuradas
- [ ] Email templates personalizados
- [ ] URLs de redirecionamento configuradas
- [ ] Usuário de teste criado e funcionando
- [ ] Script de teste executado com sucesso
- [ ] Backups automáticos habilitados
- [ ] Rate limiting configurado
- [ ] Service Role Key segura (não exposta)

---

## 🆘 Problemas Comuns

### Erro: "Could not find the table"

**Solução**: Execute o script `schema.sql` no SQL Editor.

### Erro: "new row violates row-level security policy"

**Solução**: Verifique se as políticas RLS estão configuradas corretamente.

### Erro: "Failed to upload file"

**Solução**: Verifique se os buckets foram criados e as políticas de storage estão corretas.

### Erro: "Invalid API key"

**Solução**: Verifique se as variáveis de ambiente no `.env` estão corretas.

---

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Guia de Storage](https://supabase.com/docs/guides/storage)
- [Guia de Realtime](https://supabase.com/docs/guides/realtime)

---

**Desenvolvido por AiLun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

