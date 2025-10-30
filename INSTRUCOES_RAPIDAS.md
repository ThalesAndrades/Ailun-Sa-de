# ⚡ INSTRUÇÕES RÁPIDAS - Build Automático via GitHub

## 🎯 VOCÊ ESTÁ AQUI

Eu configurei **tudo** para você fazer build automático direto do GitHub, **sem precisar do seu computador**.

Mas o GitHub não me deixa fazer push de workflows (segurança). Então você precisa executar 3 comandos:

---

## ✅ 3 PASSOS SIMPLES

### 1️⃣ Execute o script (no seu computador):
```bash
cd /caminho/para/Ailun-Sa-de
./setup-github-actions.sh
```

### 2️⃣ Faça commit e push:
```bash
git add .github/workflows/*.yml GITHUB_ACTIONS_SETUP.md QUAL_BRANCH_USAR.md
git commit -m "ci: Adicionar GitHub Actions para build automático"
git checkout -b production
git push origin production
```

### 3️⃣ Configure o token do Expo no GitHub:

**a) Gerar token do Expo:**
```bash
npx expo login
# Email: thales@ailun.com.br
# Senha: @Telemed123
```

Depois acesse: https://expo.dev/accounts/ailun/settings/access-tokens
- Clique em "Create Token"
- Nome: "GitHub Actions"
- Copie o token gerado

**b) Adicionar no GitHub:**
- Vá para: https://github.com/ThalesAndrades/Ailun-Sa-de/settings/secrets/actions
- Clique "New repository secret"
- Nome: `EXPO_TOKEN`
- Valor: Cole o token
- Salvar

---

## 🚀 PRONTO! AGORA É AUTOMÁTICO

Sempre que você fizer **push** para estas branches:

```
✅ production
✅ main
✅ master
✅ release/*
```

**O build iOS + Android vai acontecer AUTOMATICAMENTE no GitHub!**

---

## 📊 ACOMPANHAR BUILDS

- GitHub Actions: https://github.com/ThalesAndrades/Ailun-Sa-de/actions
- Expo Dashboard: https://expo.dev/accounts/ailun/projects/ailun-saude/builds

---

## ⚡ BUILD MANUAL (sem precisar push)

Se quiser fazer build de qualquer branch sem fazer push:

1. Acesse: https://github.com/ThalesAndrades/Ailun-Sa-de/actions
2. Clique em "EAS Build"
3. Clique "Run workflow"
4. Escolha branch + plataforma + perfil
5. Confirme

---

## 📄 ARQUIVOS CRIADOS

- `.github/workflows/eas-build.yml` - Build automático
- `.github/workflows/eas-submit.yml` - Submit para lojas
- `GITHUB_ACTIONS_SETUP.md` - Documentação completa
- `QUAL_BRANCH_USAR.md` - Guia rápido de branches
- `setup-github-actions.sh` - Script de setup

---

## ❓ DÚVIDAS

**P: Qual branch usar?**
R: `production` (ou main/master)

**P: Quanto tempo demora o build?**
R: 15-30 minutos (iOS), 10-20 minutos (Android)

**P: Preciso do meu computador?**
R: NÃO! Tudo roda na nuvem do GitHub!

**P: Como baixar o app depois?**
R: Acesse https://expo.dev/accounts/ailun/projects/ailun-saude/builds

**Documentação completa:** Leia `GITHUB_ACTIONS_SETUP.md`
