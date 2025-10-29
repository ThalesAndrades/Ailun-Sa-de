# 🚀 DEPLOY RÁPIDO - 3 PASSOS

## ✅ CORREÇÕES JÁ APLICADAS E COMMITADAS

Todos os bugs críticos foram corrigidos e o código está pronto para deploy!

---

## 📱 OPÇÃO 1: SCRIPT AUTOMÁTICO (RECOMENDADO)

### Passo 1: Fazer Login no Expo

```bash
eas login
```

Quando solicitado:
- **Email:** `thales@ailun.com.br`
- **Senha:** `@Telemed123`

### Passo 2: Executar o Script

```bash
./deploy-to-testflight.sh
```

O script vai:
- ✅ Verificar dependências
- ✅ Confirmar autenticação
- ✅ Iniciar build para iOS
- ✅ Mostrar link para acompanhar progresso

### Passo 3: Aguardar Build

Acesse: https://expo.dev/accounts/thales-andrades/projects/ailun-saude-app/builds

Tempo estimado: **15-30 minutos**

---

## 💻 OPÇÃO 2: COMANDOS MANUAIS

Se preferir controle total, execute passo a passo:

```bash
# 1. Fazer login
eas login
# Email: thales@ailun.com.br
# Senha: @Telemed123

# 2. Verificar autenticação
eas whoami
# Deve mostrar: thales-andrades

# 3. Verificar projeto
eas project:info
# Deve mostrar: Ailun Saúde (cc54d990-b563-4ac0-af92-91a286f137c7)

# 4. Iniciar build
eas build --platform ios --profile production

# 5. Acompanhar status
eas build:list --platform ios --limit 5
```

---

## 🔍 VERIFICAR DURANTE O BUILD

### No Terminal

Você verá as variáveis sendo injetadas:

```
✔ Build environment variables:
  EXPO_PUBLIC_APP_ENV=production
  EXPO_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
  EXPO_PUBLIC_RAPIDOC_CLIENT_ID=540e4b44-...
  EXPO_PUBLIC_RAPIDOC_TOKEN=eyJ...
  ✅ Todas configuradas!
```

### No Dashboard

1. Abra: https://expo.dev
2. Vá em "Builds"
3. Veja o status em tempo real
4. Quando completar: "Status: Finished ✅"

---

## 📲 APÓS O BUILD COMPLETAR

### 1. App Store Connect

- Apple vai processar (5-30 minutos)
- Você receberá email: "Your build has been processed"

### 2. TestFlight

No App Store Connect:
1. Vá em **TestFlight**
2. Selecione o novo build
3. Clique em **"Adicionar para Teste"**
4. Adicione testadores

### 3. Testar no iPhone

1. Abra o app **TestFlight** no iPhone
2. Encontre **Ailun Saúde**
3. Clique em **"Instalar"**
4. Aguarde instalação
5. **Abra o app**

### 4. Verificar Correções

✅ **App abre sem crash**
✅ **Tela de login aparece**
✅ **Login funciona**
✅ **Dashboard carrega**
✅ **Navegação funciona**

Se houver erro:
- ErrorBoundary vai mostrar tela azul
- Tire screenshot da mensagem
- Compartilhe para análise

---

## 🐛 TROUBLESHOOTING

### "Command not found: eas"

```bash
npm install -g eas-cli
```

### "Authentication failed"

```bash
# Fazer logout e login novamente
eas logout
eas login
```

### "Project not linked"

```bash
eas init --id cc54d990-b563-4ac0-af92-91a286f137c7
```

### "Build failed"

```bash
# Ver logs detalhados
eas build:view [BUILD_ID]

# Tentar novamente com cache limpo
eas build --platform ios --profile production --clear-cache
```

---

## 📊 CHECKLIST RÁPIDO

- [ ] EAS CLI instalado (`eas --version`)
- [ ] Login feito (`eas whoami`)
- [ ] Build iniciado (`eas build --platform ios --profile production`)
- [ ] Build completou com sucesso
- [ ] App apareceu no TestFlight
- [ ] Instalado no iPhone
- [ ] **App abre SEM CRASH** ✅

---

## 🎯 RESUMO DO QUE FOI CORRIGIDO

### Problema #1: Variáveis de Ambiente
- ❌ Antes: `RAPIDOC_CLIENT_ID` → `undefined`
- ✅ Agora: `EXPO_PUBLIC_RAPIDOC_CLIENT_ID` → valor correto

### Problema #2: Tabela do Banco
- ❌ Antes: `from('profiles')` → erro 404
- ✅ Agora: `from('user_profiles')` → correto

### Problema #3: Builds sem Env Vars
- ❌ Antes: eas.json sem variáveis
- ✅ Agora: todas as variáveis configuradas

### Problema #4: Sem Tratamento de Erro
- ❌ Antes: Crash completo sem informação
- ✅ Agora: ErrorBoundary mostra erro amigável

---

## ✅ STATUS

**Código:** ✅ Pronto para deploy
**Commit:** `1bd5de6`
**Branch:** `claude/analyze-repository-overview-011CUbKxru5Rm9NUEo43d2ms`

**Próximo passo:** Execute um dos comandos acima! 🚀

---

## 🆘 PRECISA DE AJUDA?

Se encontrar qualquer erro:

1. **Copie a mensagem de erro completa**
2. **Tire screenshot** (se for erro no app)
3. **Execute:** `eas build:view [BUILD_ID]`
4. **Compartilhe** os logs

---

**Última atualização:** 29/10/2025
**Tempo estimado para deploy:** 5 minutos (setup) + 25 minutos (build) = **30 minutos total**
