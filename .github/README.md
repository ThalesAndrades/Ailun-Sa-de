# ⚠️ GitHub Workflows

## Status: Não Commitados (Por Design)

Os arquivos em `.github/workflows/` **não foram commitados diretamente** devido a restrições de segurança do GitHub que impedem que aplicativos/bots criem ou modifiquem workflows sem permissões especiais.

## Como Configurar

### Opção 1: Script Automático (Recomendado)

Execute o script que irá criar os workflows localmente:

```bash
./setup-github-actions.sh
```

### Opção 2: Manual

1. Os workflows já estão criados localmente em `.github/workflows/`
2. Adicione-os ao git manualmente:

```bash
git add .github/workflows/*.yml
git commit -m "ci: Adicionar workflows de build"
git push
```

3. Configure o secret `EXPO_TOKEN` no GitHub:
   - Acesse: https://github.com/ThalesAndrades/Ailun-Sa-de/settings/secrets/actions
   - Crie um novo secret chamado `EXPO_TOKEN`
   - Cole seu token do Expo

## Workflows Disponíveis

### `eas-build.yml`
- **Trigger:** Push para `main`, `master`, `production`, `release/*`
- **Função:** Build automático iOS + Android
- **Manual:** Via GitHub Actions UI

### `eas-submit.yml`
- **Trigger:** Manual apenas
- **Função:** Submit para App Store e Play Store
- **Uso:** Via GitHub Actions UI

## Branches com Build Automático

Após configurar, estes branches terão build automático:
- ✅ `main`
- ✅ `master`
- ✅ `production`
- ✅ `release/*`

## Mais Informações

- **Guia Completo:** `GITHUB_ACTIONS_SETUP.md`
- **Guia Rápido:** `INSTRUCOES_RAPIDAS.md`
- **Qual Branch Usar:** `QUAL_BRANCH_USAR.md`

---

**Nota:** Este é um comportamento esperado e por design. Os workflows estão prontos para uso, apenas aguardando configuração manual por questões de segurança do GitHub.
