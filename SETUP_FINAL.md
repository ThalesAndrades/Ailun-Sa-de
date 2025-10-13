# 🎯 Configuração Final do Supabase - Ailun Saúde

## ⚠️ Ação Manual Necessária

Devido a limitações de conectividade de rede do ambiente sandbox, o SQL precisa ser executado manualmente no Supabase Dashboard.

---

## 📋 Passo a Passo (5 minutos)

### Passo 1: Abrir o SQL Editor

1. Acesse: https://supabase.com/dashboard/project/bmtieinegditdeijyslu/sql/new
2. Você já está logado

### Passo 2: Copiar o SQL

1. Abra o arquivo: `supabase/schema_cpf_auth.sql`
2. Selecione todo o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)

### Passo 3: Colar e Executar

1. Cole no editor SQL do Supabase (Ctrl+V)
2. Clique no botão verde **"Run"** (canto inferior direito)
3. Ou pressione **Ctrl+Enter**

### Passo 4: Aguardar

- A execução leva cerca de 5-10 segundos
- Você verá mensagens de sucesso no painel de resultados

### Passo 5: Verificar

Execute esta query para verificar:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Você deve ver 6 tabelas:
- ✅ active_sessions
- ✅ consultation_logs
- ✅ consultation_queue
- ✅ consultation_reminders
- ✅ system_notifications
- ✅ user_preferences

---

## 📊 O Que Será Criado

### 6 Tabelas Principais

1. **consultation_logs**
   - Histórico completo de consultas e agendamentos
   - Campos: beneficiary_uuid, service_type, specialty, status, consultation_url, appointment_uuid, scheduled_date

2. **system_notifications**
   - Notificações para beneficiários
   - Campos: beneficiary_uuid, title, message, type, read, action_url

3. **active_sessions**
   - Sessões ativas de consultas (médico imediato)
   - Campos: beneficiary_uuid, consultation_type, session_data, expires_at

4. **consultation_queue**
   - Fila de espera para médico imediato
   - Campos: beneficiary_uuid, queue_position, estimated_wait_time, status

5. **consultation_reminders**
   - Lembretes automáticos (30 min antes da consulta)
   - Campos: beneficiary_uuid, consultation_log_id, reminder_date, sent

6. **user_preferences**
   - Preferências e configurações do usuário
   - Campos: beneficiary_uuid, notifications_enabled, email_notifications, sms_notifications, language, theme

### Recursos Automáticos

✅ **Triggers**:
- `update_consultation_logs_updated_at` - Atualiza `updated_at` automaticamente
- `update_queue_updated_at` - Atualiza `updated_at` da fila
- `update_preferences_updated_at` - Atualiza `updated_at` das preferências
- `create_reminder_on_schedule` - Cria lembrete automático ao agendar consulta

✅ **Funções**:
- `update_updated_at_column()` - Função para atualizar timestamps
- `clean_expired_sessions()` - Limpa sessões expiradas
- `create_consultation_reminder()` - Cria lembretes 30 min antes

✅ **Índices Otimizados**:
- 15 índices para melhorar performance de queries

✅ **Sem Dependência de auth.users**:
- Usa `beneficiary_uuid` (TEXT) em vez de foreign keys para `auth.users`
- Compatível com autenticação por CPF

---

## 🔐 Credenciais Configuradas

### Supabase
- **Project ID**: bmtieinegditdeijyslu
- **URL**: https://bmtieinegditdeijyslu.supabase.co
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### RapiDoc TEMA
- **URL**: https://api.rapidoc.tech/
- **Client ID**: 540e4b44-d68d-4ade-885f-fd4940a3a045
- **Token**: eyJhbGciOiJSUzUxMiJ9...

---

## ✅ Checklist Final

### Banco de Dados
- [ ] Executar `schema_cpf_auth.sql` no SQL Editor
- [ ] Verificar se as 6 tabelas foram criadas
- [ ] Verificar se os triggers foram criados
- [ ] Verificar se as funções foram criadas

### Edge Functions (Opcional)
- [ ] Configurar variáveis de ambiente:
  - `RAPIDOC_CLIENT_ID`
  - `RAPIDOC_TOKEN`
- [ ] Re-deployar Edge Functions

### Aplicativo
- [ ] Implementar telas de login (CPF + senha)
- [ ] Implementar telas de consulta
- [ ] Testar autenticação
- [ ] Testar fluxos de consulta

---

## 🚀 Próximos Passos

Após executar o SQL:

1. **Testar Autenticação**
   - Implementar tela de login usando `services/cpfAuth.ts`
   - Testar com CPF real da RapiDoc

2. **Implementar Fluxos de Consulta**
   - Médico imediato
   - Especialistas
   - Nutricionista
   - Psicologia

3. **Integrar com UI**
   - Seguir guia em `docs/UI_INTEGRATION_GUIDE.md`

---

## 📞 Suporte

Se tiver problemas ao executar o SQL, verifique:

1. **Erro de sintaxe**: Certifique-se de copiar TODO o conteúdo do arquivo
2. **Permissões**: Você está logado como proprietário do projeto
3. **Timeout**: Se demorar muito, tente executar em partes menores

---

**Desenvolvido por AiLun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

