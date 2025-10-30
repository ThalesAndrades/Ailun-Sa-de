# 🎯 QUAL BRANCH DO GITHUB USAR PARA BUILD AUTOMÁTICO

## ✅ RESPOSTA DIRETA

Use qualquer uma destas branches para fazer **push** e o build acontece **automaticamente**:

```
✅ main
✅ master
✅ production
✅ release/v1.0.0  (ou qualquer release/*)
```

---

## 🚀 COMO FAZER

### Método 1: Usar branch "production" (Mais Simples)

```bash
# 1. Ir para branch production
git checkout production

# Se não existir, criar:
git checkout -b production

# 2. Fazer suas alterações (já foram feitas)
# (arquivos já estão commitados)

# 3. Fazer push
git push origin production
```

**Resultado:** Build iOS + Android inicia automaticamente no GitHub Actions!

---

### Método 2: Usar branch "main" ou "master"

```bash
# 1. Merge suas alterações para main
git checkout main
git merge claude/analyze-repository-overview-011CUbKxru5Rm9NUEo43d2ms

# 2. Push
git push origin main
```

**Resultado:** Build iOS + Android inicia automaticamente no GitHub Actions!

---

### Método 3: Criar branch "release"

```bash
# 1. Criar branch release
git checkout -b release/v1.0.0

# 2. Cherry-pick ou merge suas alterações
git merge claude/analyze-repository-overview-011CUbKxru5Rm9NUEo43d2ms

# 3. Push
git push origin release/v1.0.0
```

**Resultado:** Build iOS + Android inicia automaticamente no GitHub Actions!

---

## ⚙️ ANTES DE COMEÇAR (IMPORTANTE!)

**Você PRECISA configurar o token do Expo no GitHub primeiro!**

### Passo Único:
1. Acesse: https://expo.dev/accounts/ailun/settings/access-tokens
2. Clique em "Create Token"
3. Nome: `GitHub Actions`
4. Copie o token gerado
5. Vá para: https://github.com/ThalesAndrades/Ailun-Sa-de/settings/secrets/actions
6. Clique "New repository secret"
7. Nome: `EXPO_TOKEN`
8. Cole o token
9. Salvar

**Pronto! Agora qualquer push para as branches acima vai fazer build automático!**

---

## 📊 ACOMPANHAR O BUILD

### GitHub Actions (ver logs, status, erros):
https://github.com/ThalesAndrades/Ailun-Sa-de/actions

### Expo Dashboard (baixar app, ver progresso):
https://expo.dev/accounts/ailun/projects/ailun-saude/builds

---

## 🎯 RECOMENDAÇÃO

**Use a branch "production"** - é a mais clara e específica para builds de produção.

```bash
# Comandos completos:
git checkout -b production
git push origin production

# Acessar e ver o build rodando:
# https://github.com/ThalesAndrades/Ailun-Sa-de/actions
```

**Tempo estimado:** 15-30 minutos até ter o app pronto para download/TestFlight.

---

## ❓ E SE EU QUISER FAZER BUILD MANUAL?

Você pode disparar build de **qualquer branch**, sem precisar fazer push:

1. Acesse: https://github.com/ThalesAndrades/Ailun-Sa-de/actions
2. Clique em "EAS Build"
3. Clique "Run workflow"
4. Escolha a branch, plataforma e perfil
5. Confirme

**Não precisa que seja main/master/production para build manual!**

---

## 📋 RESUMO RÁPIDO

| Método | Branch | Trigger | Precisa Token? |
|--------|--------|---------|----------------|
| **Auto** | production, main, master, release/* | Push | ✅ Sim |
| **Manual** | Qualquer branch | GitHub Actions UI | ✅ Sim |

**Mais detalhes:** Leia `GITHUB_ACTIONS_SETUP.md`
