# 🚀 Guia de Deploy em Produção - AiLun Saude

Este guia descreve os passos necessários para colocar o aplicativo AiLun Saude em produção.

---

## ✅ Pré-requisitos

- [ ] Conta Supabase configurada
- [ ] Credenciais de produção da RapiDoc TEMA
- [ ] Credenciais de produção da Asaas
- [ ] Expo CLI instalado
- [ ] Supabase CLI instalado

---

## 📋 Checklist de Produção

### 1. Configurar Supabase

#### 1.1 Criar Tabelas do Banco de Dados

```bash
# 1. Acesse o Supabase Dashboard
https://app.supabase.com/project/bmtieinegditdeijyslu

# 2. Vá em SQL Editor
# 3. Execute o arquivo supabase/schema.sql
```

#### 1.2 Criar Buckets de Storage

```bash
# No Supabase Dashboard → Storage

# Bucket 1: avatars (público)
- Nome: avatars
- Público: Sim
- Allowed MIME types: image/*

# Bucket 2: medical-documents (privado)
- Nome: medical-documents
- Público: Não
- Allowed MIME types: application/pdf, image/*
```

#### 1.3 Configurar Variáveis de Ambiente

```bash
# No Supabase Dashboard → Settings → Edge Functions

# Adicionar:
RAPIDOC_TOKEN=seu_token_de_producao
RAPIDOC_CLIENT_ID=seu_client_id_de_producao
ASAAS_API_KEY=sua_chave_api_asaas
```

**Como obter credenciais RapiDoc:**
- WhatsApp: (51) 8314-0497
- Solicitar: "Credenciais de produção para API TEMA"

---

### 2. Deploy das Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Link com o projeto
supabase link --project-ref bmtieinegditdeijyslu

# Deploy de todas as Edge Functions
supabase functions deploy orchestrator
supabase functions deploy rapidoc
supabase functions deploy tema-orchestrator

# Verificar deploy
supabase functions list
```

---

### 3. Configurar Aplicativo Mobile

#### 3.1 Atualizar Variáveis de Ambiente

O arquivo `.env` já está configurado:

```env
EXPO_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3.2 Verificar Configuração

```bash
cd Ailun-Sa-de
pnpm install
```

#### 3.3 Testar Localmente

```bash
# Iniciar servidor Expo
pnpm start

# Testar no Android
pnpm android

# Testar no iOS
pnpm ios
```

---

### 4. Build para Produção

#### 4.1 Configurar EAS (Expo Application Services)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login no Expo
eas login

# Configurar projeto
eas build:configure
```

#### 4.2 Build Android

```bash
# Build APK para testes
eas build --platform android --profile preview

# Build AAB para Google Play Store
eas build --platform android --profile production
```

#### 4.3 Build iOS

```bash
# Build para TestFlight
eas build --platform ios --profile preview

# Build para App Store
eas build --platform ios --profile production
```

---

### 5. Testar Integração em Produção

#### 5.1 Criar Beneficiário de Teste

```typescript
import { addBeneficiary } from './services/rapidoc';

const createTestUser = async () => {
  const result = await addBeneficiary({
    name: 'Usuário Teste Produção',
    cpf: '12345678900',
    birthday: '1990-01-15',
    phone: '11999999999',
    email: 'teste@ailun.com.br',
    serviceType: 'GSP', // Clínico + Especialistas + Psicologia
  });
  
  if (result.success) {
    console.log('✅ Beneficiário criado:', result.data.uuid);
    // Salvar UUID no perfil do usuário
  }
};
```

#### 5.2 Testar Fluxos

```bash
# 1. Médico Imediato
- Clicar em "Médico Imediato"
- Verificar se retorna URL da consulta
- Testar abertura do link

# 2. Especialistas
- Listar especialidades
- Verificar encaminhamentos
- Listar horários
- Confirmar agendamento

# 3. Nutricionista
- Buscar horários
- Confirmar agendamento

# 4. Psicologia
- Buscar horários
- Confirmar agendamento
```

---

### 6. Configurar Notificações Push

#### 6.1 Configurar Firebase (Android)

```bash
# 1. Criar projeto no Firebase Console
# 2. Adicionar app Android
# 3. Baixar google-services.json
# 4. Adicionar ao projeto
```

#### 6.2 Configurar APNs (iOS)

```bash
# 1. Criar certificado APNs no Apple Developer
# 2. Configurar no Expo
# 3. Testar notificações
```

#### 6.3 Implementar Lembretes

```typescript
import * as Notifications from 'expo-notifications';

// Já implementado em consultationFlow.ts
// Lembretes são criados automaticamente 30 minutos antes
```

---

### 7. Monitoramento e Logs

#### 7.1 Logs do Supabase

```bash
# Acessar logs das Edge Functions
https://app.supabase.com/project/bmtieinegditdeijyslu/functions

# Selecionar função → Logs
```

#### 7.2 Logs do Expo

```bash
# Instalar Sentry para monitoramento
npm install @sentry/react-native

# Configurar no app
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'seu_dsn_aqui',
});
```

---

### 8. Publicar nas Lojas

#### 8.1 Google Play Store

```bash
# 1. Criar conta de desenvolvedor
# 2. Criar novo app
# 3. Upload do AAB
# 4. Preencher informações
# 5. Enviar para revisão
```

#### 8.2 Apple App Store

```bash
# 1. Criar conta Apple Developer
# 2. Criar app no App Store Connect
# 3. Upload via TestFlight
# 4. Preencher informações
# 5. Enviar para revisão
```

---

## 🔒 Segurança em Produção

### Checklist de Segurança

- [ ] Row Level Security (RLS) habilitado em todas as tabelas
- [ ] Políticas de acesso configuradas
- [ ] Credenciais em variáveis de ambiente (não no código)
- [ ] HTTPS obrigatório
- [ ] Validação de autenticação em todas as Edge Functions
- [ ] Logs de auditoria configurados
- [ ] Rate limiting configurado
- [ ] Backup automático do banco de dados

---

## 📊 Métricas e Analytics

### Configurar Analytics

```typescript
import * as Analytics from 'expo-firebase-analytics';

// Rastrear eventos importantes
Analytics.logEvent('consultation_started', {
  type: 'immediate',
  timestamp: new Date().toISOString(),
});

Analytics.logEvent('appointment_scheduled', {
  specialty: 'Cardiologia',
  date: '15/10/2025',
});
```

---

## 🆘 Troubleshooting

### Problema: Edge Function não responde

```bash
# Verificar logs
supabase functions logs rapidoc

# Verificar variáveis de ambiente
# Dashboard → Settings → Edge Functions
```

### Problema: Erro de autenticação RapiDoc

```bash
# Verificar credenciais
# Contatar suporte: (51) 8314-0497
```

### Problema: Banco de dados não acessível

```bash
# Verificar RLS
# SQL Editor → Verificar políticas
```

---

## 📞 Suporte

### RapiDoc
- **WhatsApp**: (51) 8314-0497
- **Email**: suporte@rapidoc.tech

### Supabase
- **Docs**: https://supabase.com/docs
- **Discord**: https://discord.supabase.com

### AiLun Tecnologia
- **CNPJ**: 60.740.536/0001-75
- **Email**: contato@ailun.com.br

---

## 📝 Checklist Final

### Antes do Deploy

- [ ] Código revisado e testado
- [ ] Testes de integração passando
- [ ] Credenciais de produção configuradas
- [ ] Edge Functions deployadas
- [ ] Banco de dados configurado
- [ ] Storage configurado
- [ ] Notificações configuradas

### Após o Deploy

- [ ] Testar todos os fluxos
- [ ] Verificar logs
- [ ] Monitorar performance
- [ ] Criar usuários de teste
- [ ] Documentar problemas encontrados

### Manutenção Contínua

- [ ] Monitorar logs diariamente
- [ ] Backup semanal do banco
- [ ] Atualizar dependências mensalmente
- [ ] Revisar políticas de segurança
- [ ] Coletar feedback dos usuários

---

## 🎉 Pronto para Produção!

Após seguir todos os passos acima, seu aplicativo estará pronto para uso em produção.

**Boa sorte! 🚀**

---

**Desenvolvido por AiLun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

**Última atualização**: 13/10/2025

