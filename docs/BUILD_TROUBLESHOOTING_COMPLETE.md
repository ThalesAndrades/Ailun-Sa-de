# 🔧 Troubleshooting Completo - Build iOS

## 🚨 Como Diagnosticar Problemas

### Passo 1: Executar Script de Diagnóstico

**Mac/Linux:**
```bash
chmod +x scripts/diagnose-build.sh
./scripts/diagnose-build.sh
```

**Windows:**
```bash
scripts\diagnose-build.bat
```

Este script verificará **automaticamente**:
- ✅ EAS CLI instalado
- ✅ Autenticação no EAS
- ✅ Configuração do app.json
- ✅ Configuração do app.config.js
- ✅ Configuração do eas.json
- ✅ Secrets configurados
- ✅ Projeto vinculado ao EAS

---

## 🔍 Problemas Comuns e Soluções

### Problema 1: "Invalid UUID appId"

**Sintomas:**
```
Invalid UUID appId
Request ID: xxxxx
```

**Causa:** projectId incorreto ou ausente

**Solução:**
```bash
# 1. Verificar se projectId existe
grep -A 2 "eas" app.json

# 2. Se não existir ou estiver incorreto:
# Editar app.json e app.config.js manualmente
# projectId correto: 6f414a22-cc84-442f-9022-bb0ddc251d59

# 3. Limpar cache
rm -rf .expo
rm -rf node_modules/.cache

# 4. Tentar novamente
eas build --platform ios --profile preview
```

---

### Problema 2: "No environment variables found"

**Sintomas:**
```
No environment variables with visibility "Plain text" and "Sensitive" found
```

**Causa:** Variáveis de ambiente não configuradas no EAS

**Solução:**

**Opção A - Script Automático:**
```bash
# Mac/Linux
./scripts/configure-eas-secrets.sh

# Windows
scripts\configure-eas-secrets.bat
```

**Opção B - Manual:**
```bash
eas secret:create --scope project \
  --name EXPO_PUBLIC_SUPABASE_URL \
  --value "sua-url" \
  --type string

eas secret:create --scope project \
  --name EXPO_PUBLIC_SUPABASE_ANON_KEY \
  --value "sua-key" \
  --type string
```

**Opção C - Interface Web:**
1. Acesse: https://expo.dev/accounts/onspace/projects/ailun-saude-app/secrets
2. Clique "Create Secret"
3. Adicione cada variável necessária

**Verificar:**
```bash
eas secret:list
```

---

### Problema 3: "EAS Submit experiencing partial outage"

**Sintomas:**
```
EAS Submit is experiencing a partial outage.
Reason: Increased iOS submission times.
```

**Causa:** Problema temporário nos servidores da Expo

**Solução:**
- ✅ **Build funciona normalmente** - pode continuar
- ⚠️ **Submit está lento** - aguarde ou tente mais tarde
- 📊 **Verificar status**: https://status.expo.dev/

**Workaround:**
```bash
# Fazer apenas o build (sem submit)
eas build --platform ios --profile production

# Fazer submit manualmente depois
eas submit --platform ios --latest
```

---

### Problema 4: "Project not found" ou "Project not linked"

**Sintomas:**
```
Project not found
Project not linked
```

**Causa:** Projeto não vinculado ao EAS

**Solução:**
```bash
# 1. Verificar projeto atual
eas project:info

# 2. Se não estiver vinculado:
eas init --force

# 3. Verificar app.json
cat app.json | grep projectId

# 4. Se projectId estiver incorreto, corrigir manualmente
# projectId correto: 6f414a22-cc84-442f-9022-bb0ddc251d59
```

---

### Problema 5: "Authentication failed" ou "Not logged in"

**Sintomas:**
```
Authentication failed
You are not logged in
```

**Causa:** Não autenticado no EAS CLI

**Solução:**
```bash
# 1. Login
eas login

# 2. Verificar
eas whoami

# 3. Se necessário, logout e login novamente
eas logout
eas login
```

---

### Problema 6: Build falha com erro de dependências

**Sintomas:**
```
npm ERR!
yarn error
dependency conflict
```

**Causa:** Conflito de dependências ou cache corrompido

**Solução:**
```bash
# 1. Limpar completamente
rm -rf node_modules
rm -rf .expo
rm -rf ios/build
rm package-lock.json
rm yarn.lock

# 2. Reinstalar
npm install

# 3. Build com cache limpo
eas build --platform ios --profile preview --clear-cache
```

---

### Problema 7: "Unable to resolve module"

**Sintomas:**
```
Unable to resolve module X from Y
Cannot find module
```

**Causa:** Importação incorreta ou módulo ausente

**Solução:**
```bash
# 1. Verificar se módulo está instalado
npm list nome-do-modulo

# 2. Se não estiver, instalar
npm install nome-do-modulo

# 3. Verificar imports no código
# Garantir que paths estão corretos

# 4. Limpar cache e rebuildar
rm -rf .expo
eas build --platform ios --profile preview --clear-cache
```

---

## 📋 Checklist Antes de Fazer Build

### ✅ Configuração Básica
- [ ] EAS CLI instalado: `npm install -g eas-cli`
- [ ] Logado no EAS: `eas whoami`
- [ ] Projeto vinculado: `eas project:info`

### ✅ Arquivos de Configuração
- [ ] `app.json` tem `projectId` correto
- [ ] `app.json` tem `owner: "onspace"`
- [ ] `app.config.js` tem `projectId` correto
- [ ] `app.config.js` tem `owner: "onspace"`
- [ ] `eas.json` tem profiles corretos

### ✅ Variáveis de Ambiente
- [ ] `EXPO_PUBLIC_SUPABASE_URL` configurado
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` configurado
- [ ] Outras keys necessárias configuradas
- [ ] Verificado com: `eas secret:list`

### ✅ Código
- [ ] Sem erros de TypeScript: `npx tsc --noEmit`
- [ ] Sem erros de linting: `npm run lint` (se configurado)
- [ ] App funciona localmente: `npx expo start`

---

## 🚀 Comandos de Build Recomendados

### Build de Desenvolvimento
```bash
# iOS Simulator (mais rápido)
eas build --platform ios --profile development

# Instalar no dispositivo de teste
eas build:run --profile development
```

### Build Preview (Teste Real)
```bash
# Preview completo
eas build --platform ios --profile preview

# Com cache limpo
eas build --platform ios --profile preview --clear-cache

# Ver logs detalhados
eas build --platform ios --profile preview --verbose
```

### Build de Produção
```bash
# Build de produção
eas build --platform ios --profile production

# Com todas as otimizações
eas build --platform ios --profile production --clear-cache --no-wait
```

---

## 🔍 Logs e Debugging

### Ver Logs do Build
```bash
# Listar builds
eas build:list

# Ver detalhes de um build específico
eas build:view [BUILD_ID]

# Ver logs em tempo real
eas build --platform ios --profile preview --wait
```

### Debugging Avançado
```bash
# Inspecionar configuração
eas config

# Ver informações do projeto
eas project:info

# Verificar secrets
eas secret:list

# Verificar certificados
eas credentials

# Ver metadata
eas metadata:pull
```

---

## 📞 Suporte

### Recursos Oficiais
- **Documentação EAS**: https://docs.expo.dev/build/introduction/
- **Status Expo**: https://status.expo.dev/
- **Fórum Expo**: https://forums.expo.dev/
- **Discord Expo**: https://discord.gg/expo

### Comandos de Suporte
```bash
# Gerar relatório de diagnóstico
eas diagnostics

# Verificar saúde do projeto
eas doctor

# Ver versão e informações
eas --version
eas --help
```

---

## 🎯 Próximos Passos Após Build Bem-Sucedido

1. **Testar o Build**
   ```bash
   # Download do .ipa
   eas build:download --platform ios --latest
   ```

2. **TestFlight (iOS)**
   ```bash
   # Submit para TestFlight
   eas submit --platform ios --latest
   ```

3. **App Store**
   - Acesse App Store Connect
   - Configure metadados
   - Submeta para revisão

---

**Última atualização**: 20/10/2025  
**Versão**: 2.0  
**Status**: Guia Completo de Troubleshooting
