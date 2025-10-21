# iOS Build (EAS) — Ailun Saúde

Este documento descreve os passos necessários para gerar um build iOS com EAS (Expo Application Services).

Pré-requisitos
- macOS com Xcode instalado (para gerar e testar localmente se necessário).
- Conta Apple Developer (com Team ID e acesso ao App Store Connect).
- Supabase env vars configuradas para produção (veja `eas.json`).
- Supabase CLI / EAS CLI: `npm install -g eas-cli`.

Arquivos importantes no repositório
- `app.json` / `app.config.js` — contém `ios.bundleIdentifier` (`app.ailun`), `buildNumber`, `infoPlist` e referências aos assets (`assets/adaptive-icon.png`, `assets/splash.png`).
- `eas.json` — perfis de build (`production`, `preview`, `development`). A seção `submit.production.ios` já contém `appleId`, `ascAppId` e `appleTeamId`.
- `assets/` — já adicionamos `adaptive-icon.png`, `splash.png`, `favicon.png` placeholders para evitar erros de build. Substitua por imagens finais antes do release.

Variáveis de ambiente importantes (defina no EAS dashboard ou `eas secret`):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Outras chaves que o projeto requer (cheque `eas.json` e `docs/EAS_ENVIRONMENT_VARIABLES.md`)

Passos para gerar o build iOS (produção)
1. Instalar EAS CLI:

```bash
npm install -g eas-cli
```

2. Fazer login no EAS e Apple

```bash
eas login
# para subir certificados automaticos
eas credentials
```

3. Configurar credenciais e provisionamento
- Recomenda-se usar o fluxo automático: `eas build -p ios --profile production` solicitará upload de certificados ou pode administrar automaticamente via EAS.
- Se preferir gerir manualmente, gere provisioning profile e certificados no Apple Developer e suba via `eas credentials`.

4. Executar build

```bash
eas build -p ios --profile production
```

5. Submissão (opcional via EAS Submit)

```bash
eas submit -p ios --latest --profile production
```

Pontos importantes / notas de manutenção
- `bundleIdentifier` em `app.json` está definido como `app.ailun`. Confirme com o App Store Connect se este identificador está correto/registrado.
- `eas.json` já contém `submit.production.ios` com `appleId`, `ascAppId` e `appleTeamId`. Confirme estes valores antes de submeter.
- Substitua os arquivos placeholder em `assets/` por imagens finais (adaptive icon, splash) para evitar artefatos visuais.
- NÃO COMMITAR segredos. Use o painel EAS (Project > Secrets) ou `eas secret` para configurar variáveis sensíveis.

Problemas comuns
- expo not found / `npm run lint` — instale dependências localmente (`npm install`) e instale `expo-cli`/EAS se necessário.
- Erros de provisionamento — verifique permissões da conta Apple e Team ID.

Se quiser, eu posso:
- Atualizar o `bundleIdentifier` para um valor definido por você.
- Substituir os placeholder assets por imagens reais (forneça PNGs).
- Automatizar a criação de `eas secrets` com um script (se você fornecer as chaves temporárias).

---
Gerado em 20 de outubro de 2025.
