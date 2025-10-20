# Configuração de Variáveis de Ambiente no EAS

## ⚠️ Problema Detectado

```
No environment variables with visibility "Plain text" and "Sensitive" found 
for the "production" environment on EAS.
```

O app **não funcionará em produção** sem as variáveis do Supabase configuradas!

## ✅ Solução: Configurar Variáveis no EAS

### Variáveis Necessárias

Estas variáveis devem estar configuradas no EAS para o profile "production":

```bash
# Supabase (Cliente)
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY

# Supabase (Servidor - Edge Functions)
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_DB_URL

# Integrações Externas
ASAAS_API_KEY
RESEND_API_KEY
RAPIDOC_CLIENT_ID
RAPIDOC_TOKEN
RAPIDOC_BASE_URL
```

## 📋 Comandos para Configurar

### Método 1: Via EAS CLI (Recomendado)

```bash
# 1. Login no EAS
eas login

# 2. Configurar variáveis públicas (cliente)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "sua-url-supabase" --type string
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "sua-anon-key" --type string

# 3. Configurar variáveis sensíveis (servidor)
eas secret:create --scope project --name SUPABASE_SERVICE_ROLE_KEY --value "sua-service-role-key" --type string
eas secret:create --scope project --name SUPABASE_DB_URL --value "sua-db-url" --type string

# 4. Configurar integrações
eas secret:create --scope project --name ASAAS_API_KEY --value "sua-asaas-key" --type string
eas secret:create --scope project --name RESEND_API_KEY --value "sua-resend-key" --type string
eas secret:create --scope project --name RAPIDOC_CLIENT_ID --value "seu-rapidoc-client" --type string
eas secret:create --scope project --name RAPIDOC_TOKEN --value "seu-rapidoc-token" --type string
eas secret:create --scope project --name RAPIDOC_BASE_URL --value "https://api.rapidoc.tech" --type string
```

### Método 2: Via Interface Web (Mais Fácil)

1. Acesse: https://expo.dev/accounts/onspace/projects/ailun-saude-app/secrets
2. Clique em "Create Secret"
3. Adicione cada variável:
   - Nome: `EXPO_PUBLIC_SUPABASE_URL`
   - Value: Cole o valor do `.env`
   - Environment: `production`
   - Visibility: `Plain text` (para EXPO_PUBLIC_*) ou `Sensitive` (para outras)

## 🔍 Verificar Configuração

```bash
# Listar todas as secrets configuradas
eas secret:list

# Ver detalhes do projeto
eas project:info
```

## 📱 Valores Atuais (.env)

### ⚠️ ATENÇÃO: Não compartilhe estes valores publicamente!

De acordo com os arquivos `.env` do projeto:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[Copiar do arquivo .env]

# Integrações
ASAAS_API_KEY=[Copiar do arquivo .env]
RESEND_API_KEY=[Copiar do arquivo .env]
RAPIDOC_CLIENT_ID=[Copiar do arquivo .env]
RAPIDOC_TOKEN=[Copiar do arquivo .env]
RAPIDOC_BASE_URL=https://api.rapidoc.tech
```

## 🚀 Após Configurar

1. **Verificar secrets**:
```bash
eas secret:list
```

2. **Rebuild**:
```bash
eas build --platform ios --profile production --clear-cache
```

3. **Testar localmente primeiro**:
```bash
eas build --platform ios --profile preview
```

## ⚠️ EAS Submit Status

Status atual: **Partial Outage**
- Submissões iOS estão mais lentas que o normal
- Verifique: https://status.expo.dev/

### Recomendação:
- Aguarde a resolução do problema da Expo antes de fazer submit para App Store
- Você pode fazer build normalmente
- O submit pode ser feito depois

## 🔐 Segurança

### Nunca:
- ❌ Commitar arquivos `.env` no Git
- ❌ Compartilhar service role keys publicamente
- ❌ Usar variáveis de desenvolvimento em produção

### Sempre:
- ✅ Usar `eas secret:create` para variáveis sensíveis
- ✅ Usar diferentes valores para development/staging/production
- ✅ Rotacionar chaves periodicamente
- ✅ Usar variáveis `EXPO_PUBLIC_*` apenas para valores não-sensíveis

## 📖 Documentação Oficial

- [EAS Environment Variables](https://docs.expo.dev/eas/environment-variables/)
- [EAS Secrets](https://docs.expo.dev/eas/secrets/)
- [Expo Status](https://status.expo.dev/)

---

**Última atualização**: 20/10/2025  
**Status**: ⚠️ VARIÁVEIS NÃO CONFIGURADAS - AÇÃO NECESSÁRIA  
**Prioridade**: 🔴 CRÍTICO - App não funcionará sem estas configurações
