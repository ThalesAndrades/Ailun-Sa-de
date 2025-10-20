# 📱 Comandos de Build iOS - Ailun Saúde

## 🎯 Build Principal (OnSpace AI)

O OnSpace AI deve executar automaticamente:
```bash
eas build --platform ios --profile production --no-wait --no-submit
```

**CRÍTICO**: 
- ✅ Use `--no-submit` para EVITAR submit automático
- ❌ NÃO use `--auto-submit` (causa erro de credenciais)
- 📦 Build gera IPA para download
- 🚀 Submit manual depois (quando pronto)

## 🔄 Comandos Alternativos

### 1. Build Preview (Para Testes)
```bash
eas build --platform ios --profile preview
```

### 2. Build Apenas (Sem Submit)
```bash
eas build --platform ios --profile production --no-wait --no-submit
```

### 3. Build e Monitorar (Foreground)
```bash
eas build --platform ios --profile production
```

### 4. Build Local (Mac apenas)
```bash
eas build --platform ios --profile production --local
```

## 📊 Verificar Status

### Listar Builds
```bash
eas build:list
```

### Ver Último Build
```bash
eas build:view
```

### Ver Build Específico
```bash
eas build:view [BUILD_ID]
```

### Ver Logs Completos
```bash
eas build:view [BUILD_ID] --logs
```

## 📥 Download

### Download Automático do Último Build
```bash
eas build:download --platform ios --profile production
```

### Download de Build Específico
```bash
eas build:download --id [BUILD_ID]
```

## 🚀 Submit (Após Build)

### Submit Automático
```bash
eas submit --platform ios --profile production
```

### Submit com IPA Local
```bash
eas submit --platform ios --profile production --path ./build.ipa
```

## 🔑 Gerenciar Credenciais

### Ver Credenciais Atuais
```bash
eas credentials
```

### Criar Novo Certificado
```bash
eas credentials
# Selecionar: iOS > Production > Create new
```

### Verificar Provisioning Profile
```bash
eas credentials
# Selecionar: iOS > Production > Provisioning Profile
```

## 🧹 Limpeza e Manutenção

### Limpar Cache Local
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Limpar Cache EAS
```bash
# Mac/Linux
./scripts/clear-eas-cache.sh

# Windows
scripts\clear-eas-cache.bat
```

### Rebuild Completo
```bash
# Limpar tudo
rm -rf node_modules
rm package-lock.json
rm -rf .expo

# Reinstalar
npm install

# Build novamente
eas build --platform ios --profile production
```

## 🔍 Debug

### Verificar TypeScript
```bash
npx tsc --noEmit
```

### Verificar Configuração
```bash
# Ver informações do projeto
eas project:info

# Verificar configuração atual
cat eas.json | grep -A 20 "production"
```

### Ver Variáveis de Ambiente
```bash
# No profile production
eas env:list --environment production
```

## 📱 Informações do App

- **Nome**: Ailun Saúde
- **Bundle ID**: com.ailun.saude
- **Apple ID**: thales@ailunsaude.com.br
- **App Store Connect ID**: 6753972192
- **Project ID**: 6f414a22-cc84-442f-9022-bb0ddc251d59
- **Owner**: onspace

## 🆘 Troubleshooting

### Build Falhou?
```bash
# Ver logs detalhados
eas build:view --logs

# Verificar status do EAS
curl https://status.expo.dev/
```

### Erro de Certificado?
```bash
# Recriar credenciais
eas credentials
# Selecionar: iOS > Production > Remove > Create new
```

### Erro de Timeout?
- Verificar se `resourceClass` está em "medium" (não "large")
- Tentar build em horário diferente
- Verificar https://status.expo.dev/

### Submit Falhando?
- Não usar `--auto-submit` no build
- Fazer submit manual após build
- Verificar credenciais no App Store Connect

---

**Última Atualização**: 20/10/2025  
**Status**: ✅ Configurações Otimizadas
