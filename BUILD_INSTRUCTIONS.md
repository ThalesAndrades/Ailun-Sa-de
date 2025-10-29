# 🚀 Instruções para Rebuild no EAS

## ✅ CORREÇÕES JÁ APLICADAS

Todas as correções críticas foram implementadas e commitadas:
- ✅ Variáveis de ambiente corrigidas com prefixo EXPO_PUBLIC_
- ✅ Tabelas do banco corrigidas (profiles → user_profiles)
- ✅ ErrorBoundary adicionado
- ✅ Validação de configuração implementada
- ✅ eas.json atualizado com todas as env vars

**Commit:** `1bd5de6` - "fix: Corrigir crashes críticos do TestFlight e variáveis de ambiente"

---

## 📋 PASSO A PASSO PARA REBUILD

### 1. Verificar Instalação do EAS CLI

```bash
# Verificar se EAS CLI está instalado
eas --version

# Se não estiver instalado:
npm install -g eas-cli
```

### 2. Autenticar no Expo

```bash
# Fazer login no Expo
eas login

# Ou usar token (se preferir)
export EXPO_TOKEN=seu-token-aqui
eas whoami
```

### 3. Verificar Configuração do Projeto

```bash
# Verificar se o projeto está linkado corretamente
eas project:info

# Saída esperada:
# Project ID: cc54d990-b563-4ac0-af92-91a286f137c7
# Owner: thales-andrades
```

### 4. Build para iOS (TestFlight)

```bash
# Build para iOS com perfil production
eas build --platform ios --profile production

# O comando vai:
# - Fazer upload do código
# - Injetar as variáveis de ambiente do eas.json
# - Compilar o app
# - Gerar o arquivo .ipa
# - Enviar para TestFlight (se configurado)
```

### 5. Acompanhar o Build

Durante o build, você verá:

```
✔ Synced project configuration
✔ Uploaded project files
✔ Build started
✔ Build completed

Build ID: [uuid]
Status: finished
Platform: ios
Distribution: store
Build URL: https://expo.dev/...
```

### 6. Verificar Build no Dashboard

Acesse: https://expo.dev/accounts/thales-andrades/projects/ailun-saude-app/builds

---

## 🔍 VERIFICAÇÕES IMPORTANTES

### Durante o Build

O EAS vai mostrar as variáveis sendo injetadas. Verifique se aparecem:

```
Environment variables:
  EXPO_PUBLIC_APP_ENV=production
  EXPO_PUBLIC_DISABLE_LOGS=true
  EXPO_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  EXPO_PUBLIC_RAPIDOC_CLIENT_ID=540e4b44-...
  EXPO_PUBLIC_RAPIDOC_TOKEN=eyJ...
  EXPO_PUBLIC_RAPIDOC_BASE_URL=https://api.rapidoc.tech/tema/api/
```

### Após o Build

1. **Baixe o .ipa** (se não for automaticamente para TestFlight)
2. **Teste a instalação** no dispositivo físico
3. **Verifique se o app abre** sem crash
4. **Teste o login** e navegação básica

---

## 🐛 SE AINDA HOUVER CRASH

### 1. ErrorBoundary vai capturar o erro

Se o app crashar, você verá uma tela azul com:
- Título: "Ops! Algo deu errado"
- Botão: "Tentar Novamente"
- Detalhes do erro (em modo DEV)

### 2. Verificar Logs do Expo

```bash
# Ver logs do build
eas build:view [BUILD_ID]

# Ver logs do app em tempo real (se estiver rodando)
npx expo start
```

### 3. Validação de Configuração

Se aparecer a tela de erro de configuração:
- Significa que alguma variável de ambiente está faltando
- A tela vai listar exatamente quais variáveis estão faltando
- Adicione-as ao `eas.json` e faça rebuild

---

## 📱 TESTANDO NO TESTFLIGHT

### 1. Aguardar Processamento

Após o build completar:
- Apple vai processar o app (5-30 minutos)
- Você receberá email quando estiver pronto

### 2. Adicionar Testadores

No App Store Connect:
1. Vá em "TestFlight"
2. Selecione o build
3. Adicione testadores internos/externos

### 3. Instalar e Testar

No iPhone:
1. Abra o app TestFlight
2. Instale o Ailun Saúde
3. Abra o app
4. Teste os fluxos principais:
   - ✅ App abre sem crash
   - ✅ Tela de login aparece
   - ✅ Login funciona
   - ✅ Dashboard carrega
   - ✅ Navegação funciona

---

## 🔧 TROUBLESHOOTING

### Erro: "EXPO_TOKEN not valid"

```bash
# Gerar novo token
# 1. Vá em https://expo.dev/accounts/[user]/settings/access-tokens
# 2. Clique em "Create Token"
# 3. Nome: "EAS Build Token"
# 4. Copie o token
# 5. Use no terminal:
export EXPO_TOKEN=seu-novo-token
```

### Erro: "Project not found"

```bash
# Verificar se está no diretório correto
pwd
# Deve estar em: /home/user/Ailun-Sa-de

# Re-linkar projeto
eas init --id cc54d990-b563-4ac0-af92-91a286f137c7
```

### Erro: "Build failed"

```bash
# Ver logs detalhados
eas build:view [BUILD_ID]

# Limpar cache e tentar novamente
eas build --platform ios --profile production --clear-cache
```

### App ainda crasha no TestFlight

Se após todas as correções o app ainda crashar:

1. **Verifique o ErrorBoundary:**
   - Deve aparecer tela azul com erro
   - Tire screenshot da mensagem

2. **Verifique logs do Xcode:**
   - Conecte iPhone ao Mac
   - Abra Xcode > Window > Devices and Simulators
   - Veja os crash logs

3. **Habilite modo DEV temporariamente:**
   - Edite `eas.json`:
     ```json
     "production": {
       "env": {
         "EXPO_PUBLIC_APP_ENV": "staging",
         "EXPO_PUBLIC_DISABLE_LOGS": "false",
         ...
       }
     }
     ```
   - Rebuild
   - Erro vai aparecer com mais detalhes

---

## 📊 CHECKLIST DE BUILD

- [ ] EAS CLI instalado e atualizado
- [ ] Autenticado no Expo (`eas whoami`)
- [ ] Variáveis de ambiente verificadas no `eas.json`
- [ ] Código commitado (commit `1bd5de6` ou posterior)
- [ ] Executado `eas build --platform ios --profile production`
- [ ] Build completou com sucesso
- [ ] App apareceu no TestFlight
- [ ] Instalado no iPhone físico
- [ ] App abre sem crash
- [ ] Login funciona
- [ ] Navegação funciona

---

## 🆘 PRECISA DE AJUDA?

Se encontrar erros específicos, compartilhe:
1. **Mensagem de erro completa** do terminal
2. **Screenshot** da tela de erro no app
3. **Logs do build** (`eas build:view [BUILD_ID]`)
4. **Versão do build** que está testando

---

## ✅ RESUMO

**O que foi corrigido:**
- 4 problemas críticos que causavam crash
- Variáveis de ambiente
- Tabelas do banco
- Tratamento de erros
- Validação de configuração

**Próximo passo:**
- Executar: `eas build --platform ios --profile production`
- Aguardar build completar
- Testar no TestFlight

**Status:** Código pronto para deploy! 🚀

---

**Última atualização:** 29/10/2025
**Commit atual:** `1bd5de6`
**Branch:** `claude/analyze-repository-overview-011CUbKxru5Rm9NUEo43d2ms`
