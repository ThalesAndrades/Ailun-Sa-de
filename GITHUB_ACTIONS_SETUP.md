# 🚀 Build Automático via GitHub Actions

## ✅ Configuração Completa - Passo a Passo

### 1️⃣ Configurar Secret do Expo no GitHub

**IMPORTANTE:** Você precisa adicionar seu token do Expo como secret no GitHub.

#### Passo 1: Gerar Token do Expo
```bash
# No seu computador, execute:
npx expo login
# Email: thales@ailun.com.br
# Senha: @Telemed123

# Depois de logado, gere um token:
npx eas whoami
npx eas build:configure

# Ou crie um token de acesso:
# 1. Acesse: https://expo.dev/accounts/ailun/settings/access-tokens
# 2. Clique em "Create Token"
# 3. Nome: "GitHub Actions"
# 4. Copie o token gerado
```

#### Passo 2: Adicionar Secret no GitHub
1. Acesse: https://github.com/ThalesAndrades/Ailun-Sa-de/settings/secrets/actions
2. Clique em **"New repository secret"**
3. Nome: `EXPO_TOKEN`
4. Valor: Cole o token gerado acima
5. Clique em **"Add secret"**

---

### 2️⃣ Branches que Fazem Build Automático

Os builds são acionados automaticamente quando você fizer **push** para estas branches:

```
✅ main          → Build automático iOS + Android (production)
✅ master        → Build automático iOS + Android (production)
✅ production    → Build automático iOS + Android (production)
✅ release/*     → Build automático iOS + Android (production)
```

**Exemplo:**
```bash
# Criar branch de release
git checkout -b release/v1.0.0

# Fazer suas alterações
git add .
git commit -m "feat: Nova funcionalidade XYZ"

# Push para acionar o build automático
git push origin release/v1.0.0
```

**Resultado:** GitHub Actions vai automaticamente:
1. ✅ Instalar dependências
2. ✅ Executar build iOS (production)
3. ✅ Executar build Android (production)
4. ✅ Enviar para Expo servers

---

### 3️⃣ Build Manual via GitHub Actions

Se você quiser fazer build de **qualquer branch**, sem precisar fazer push:

#### Via Interface Web:
1. Acesse: https://github.com/ThalesAndrades/Ailun-Sa-de/actions
2. Clique em **"EAS Build"** (no menu lateral esquerdo)
3. Clique no botão **"Run workflow"** (canto superior direito)
4. Escolha:
   - **Branch:** Selecione qual branch quer fazer build
   - **Platform:** `ios`, `android` ou `all`
   - **Profile:** `production`, `preview` ou `development`
5. Clique em **"Run workflow"**

#### Via GitHub CLI:
```bash
# Instalar GitHub CLI (se não tiver)
brew install gh  # macOS
# ou
sudo apt install gh  # Linux

# Fazer login
gh auth login

# Disparar build iOS production
gh workflow run "EAS Build" \
  --ref main \
  -f platform=ios \
  -f profile=production

# Disparar build Android production
gh workflow run "EAS Build" \
  --ref main \
  -f platform=android \
  -f profile=production

# Disparar ambos
gh workflow run "EAS Build" \
  --ref main \
  -f platform=all \
  -f profile=production
```

---

### 4️⃣ Submit Automático para App Stores

Depois que o build estiver pronto, você pode enviar para as lojas:

#### Via Interface Web:
1. Acesse: https://github.com/ThalesAndrades/Ailun-Sa-de/actions
2. Clique em **"EAS Submit to App Stores"**
3. Clique em **"Run workflow"**
4. Escolha a plataforma: `ios`, `android` ou `both`
5. Clique em **"Run workflow"**

#### Via GitHub CLI:
```bash
# Submit iOS para TestFlight
gh workflow run "EAS Submit to App Stores" \
  -f platform=ios

# Submit Android para Play Store
gh workflow run "EAS Submit to App Stores" \
  -f platform=android

# Submit ambos
gh workflow run "EAS Submit to App Stores" \
  -f platform=both
```

---

## 📊 Monitorar Builds

### No GitHub:
- URL: https://github.com/ThalesAndrades/Ailun-Sa-de/actions
- Você verá todos os workflows rodando, logs completos, e status

### No Expo:
- URL: https://expo.dev/accounts/ailun/projects/ailun-saude/builds
- Você verá o progresso do build, download dos binários, etc.

---

## 🎯 Fluxo Recomendado para Produção

### Opção 1: Branch de Release (Recomendado)
```bash
# 1. Criar branch de release
git checkout -b release/v1.0.0

# 2. Fazer commit das alterações
git add .
git commit -m "chore: Release v1.0.0"

# 3. Push (isso aciona o build automático)
git push origin release/v1.0.0

# 4. Aguardar build completar (acompanhe no GitHub Actions)

# 5. Depois que build estiver OK, fazer submit via GitHub Actions UI
#    Actions → "EAS Submit to App Stores" → Run workflow → both

# 6. Merge na main quando tudo estiver OK
git checkout main
git merge release/v1.0.0
git push origin main
```

### Opção 2: Build Manual
```bash
# 1. Fazer commit das alterações na branch atual
git add .
git commit -m "feat: Nova funcionalidade"
git push

# 2. Acessar GitHub Actions e disparar build manualmente
#    https://github.com/ThalesAndrades/Ailun-Sa-de/actions
#    EAS Build → Run workflow → Escolher branch/platform/profile

# 3. Aguardar build completar

# 4. Fazer submit manualmente
#    EAS Submit to App Stores → Run workflow → Escolher platform
```

---

## ⚙️ Configuração Avançada

### Adicionar Notificações no Slack
Edite `.github/workflows/eas-build.yml` e adicione:

```yaml
- name: Notificar Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build ${{ job.status }}: ${{ github.event.head_commit.message }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Build Somente iOS em Branch Específica
Crie `.github/workflows/ios-only.yml`:

```yaml
name: iOS Build Only
on:
  push:
    branches:
      - ios/*

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: expo/expo-github-action@v8
        with:
          token: ${{ secrets.EXPO_TOKEN }}
      - run: npm ci
      - run: eas build --platform ios --profile production --non-interactive
```

---

## 🔧 Troubleshooting

### Erro: "EXPO_TOKEN not found"
- Verifique se você adicionou o secret no GitHub
- Nome deve ser exatamente: `EXPO_TOKEN` (case-sensitive)
- Recreate o secret se necessário

### Erro: "Forbidden" ou "Unauthorized"
- Token do Expo pode estar expirado
- Gere um novo token: https://expo.dev/accounts/ailun/settings/access-tokens
- Atualize o secret no GitHub

### Build não inicia automaticamente
- Verifique se o branch está correto (main, master, production, release/*)
- Verifique se o workflow está habilitado em Settings → Actions
- Verifique os logs em Actions → All workflows

### Build demora muito
- Builds iOS: ~15-30 minutos (normal)
- Builds Android: ~10-20 minutos (normal)
- Se demorar mais de 1h, verifique os logs

---

## 📱 Resultado Final

Após configurar tudo corretamente:

1. ✅ **Push para branch production** → Build automático inicia
2. ✅ **GitHub Actions** → Executa build no servidor do Expo
3. ✅ **15-30 minutos depois** → Build disponível em expo.dev
4. ✅ **Submit manual via Actions** → App enviado para TestFlight/Play Store
5. ✅ **Testers recebem** → Notificação para testar o app

**Sem precisar do seu computador! Tudo na nuvem! 🎉**

---

## 📚 Links Úteis

- GitHub Actions: https://github.com/ThalesAndrades/Ailun-Sa-de/actions
- Expo Builds: https://expo.dev/accounts/ailun/projects/ailun-saude/builds
- Expo Access Tokens: https://expo.dev/accounts/ailun/settings/access-tokens
- EAS Build Docs: https://docs.expo.dev/build/introduction/
- GitHub Actions Docs: https://docs.github.com/actions
