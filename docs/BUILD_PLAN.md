# Plano de Build iOS e Android — Ailun Saúde

**Data**: 20 de outubro de 2025
**Versão do Projeto**: 1.2.0
**Status**: Em execução

---

## 📋 Plano Detalhado

### Fase 1: Preparação de Ambiente ✅

1. **Corrigir `tsconfig.json`** ✅
   - Removeu comando NPX inválido que corrompia o arquivo
   - Configurou `extends: "expo/tsconfig.base"`

2. **Instalar Dependências** 🔄
   - Executando: `npm install --legacy-peer-deps`
   - Motivo: Resolver conflito de versão React 19.0.0 vs lucide-react-native (requer React ^16-18)
   - Impacto: Sem problemas funcionais; lucide-react-native será instalado com peer deps resolvidas

### Fase 2: Validação de Configuração 📋

3. **Verificar `app.json`** ✅
   - ✓ iOS:
     - `bundleIdentifier`: app.ailun
     - `buildNumber`: 13
     - `deploymentTarget`: 14.0
     - Permissões e infoPlist: ✓ Configuradas
   - ✓ Android:
     - `package`: com.ailun.saude
     - `versionCode`: 12
     - Permissões: ✓ Configuradas
   - ✓ Assets: adaptive-icon.png, splash.png, favicon.png (placeholders criados)

4. **Verificar `eas.json`** 🔄
   - ✓ CLI version: >= 12.0.0
   - ✓ Build profiles: development, preview, simulator, production
   - ✓ Submit iOS: appleId, ascAppId, appleTeamId configurados
   - Nota: Sem campos inválidos detectados na versão atual

### Fase 3: Build com EAS 🔄

5. **Build iOS (Production)** ⏳
   ```bash
   eas build -p ios --profile production
   ```
   - Requer: Apple Developer Account + certificados de signing
   - Resultado esperado: .ipa file para App Store

6. **Build Android (Production)** ⏳
   ```bash
   eas build -p android --profile production
   ```
   - Requer: Google Play Service Account JSON
   - Resultado esperado: .aab file para Google Play

### Fase 4: Configurações Necessárias (Manual)

#### Pré-requisitos para iOS:
- [ ] Conta Apple Developer ativa
- [ ] Team ID válido (2QJ24JV9N2 em eas.json)
- [ ] Certificados de código e provisioning profiles
- [ ] App ID registrado (app.ailun)
- [ ] Login Apple: `eas login` + `eas credentials` (iOS)

#### Pré-requisitos para Android:
- [ ] Conta Google Play Console ativa
- [ ] Service Account JSON (google-play-service-account.json)
- [ ] Keystore para signing (EAS pode gerar ou usar existente)
- [ ] App ID registrado (com.ailun.saude)

### Fase 5: Variáveis de Ambiente (EAS Secrets)

As seguintes variáveis já estão em `eas.json` production profile:
```json
"env": {
  "EXPO_PUBLIC_APP_ENV": "production",
  "EXPO_PUBLIC_DISABLE_LOGS": "true",
  "EXPO_PUBLIC_SUPABASE_URL": "https://bmtieinegditdeijyslu.supabase.co",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJh..."
}
```

**⚠️ Segurança**: Nó recomenda mover chaves sensíveis para EAS Secrets Dashboard:
```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "<chave>"
```

---

## 🛠️ Arquivos Modificados

| Arquivo | Ação | Motivo |
|---------|------|--------|
| `tsconfig.json` | Corrigido | Remove comando NPX inválido |
| `assets/adaptive-icon.png` | Criado | Placeholder para build |
| `assets/splash.png` | Criado | Placeholder para build |
| `assets/favicon.png` | Criado | Placeholder para build |
| `docs/IOS_BUILD.md` | Criado | Documentação EAS iOS |
| `expo-tsconfig.base.json` | Criado | Base TypeScript local |
| `docs/BUILD_PLAN.md` | Criado | Este arquivo |

---

## 📊 Checklist de Build

### Antes do Build:
- [ ] `npm install --legacy-peer-deps` concluído
- [ ] `npx tsc --noEmit` sem erros
- [ ] `npm run lint` passando (ou sem erros críticos)
- [ ] Assets verificados (./assets/adaptive-icon.png, splash.png)
- [ ] `app.json` validado (bundleIdentifier, package, versões)
- [ ] `eas.json` validado (profiles, submit settings)

### Build iOS:
- [ ] EAS CLI instalado: `npm install -g eas-cli`
- [ ] Login EAS: `eas login`
- [ ] Credenciais Apple conectadas: `eas credentials`
- [ ] Build iniciado: `eas build -p ios --profile production`
- [ ] Build concluído (status no EAS dashboard)

### Build Android:
- [ ] Service Account JSON no repo (./google-play-service-account.json) ou EAS configurado
- [ ] Keystore configurado (EAS pode gerar)
- [ ] Build iniciado: `eas build -p android --profile production`
- [ ] Build concluído (status no EAS dashboard)

### Após Build:
- [ ] Download de artefatos (.ipa, .aab)
- [ ] Teste em device/simulator
- [ ] Deploy opcional: `eas submit -p ios --latest`
- [ ] Deploy opcional: `eas submit -p android --latest`

---

## 🚀 Próximos Passos

1. **Aguardar conclusão de `npm install`**
2. **Executar tipo checks e lint**:
   ```bash
   npx tsc --noEmit
   npm run lint
   ```
3. **Configurar EAS credentials** (se necessário):
   ```bash
   eas login
   eas credentials
   ```
4. **Iniciar builds**:
   ```bash
   eas build -p ios --profile production
   eas build -p android --profile production
   ```
5. **Monitorar no EAS Dashboard**: https://expo.dev/dashboard

---

## 📝 Notas

- Placeholders de assets devem ser substituídos por imagens reais antes de produção
- Versões: iOS buildNumber 13, Android versionCode 12 — incrementar conforme necessário
- Rapidoc token em `config/rapidoc-config.js` — considerar mover para env vars
- Supabase keys expostos em eas.json — considerar mover para EAS Secrets

---

**Gerado automaticamente por Copilot em 20 de outubro de 2025**
