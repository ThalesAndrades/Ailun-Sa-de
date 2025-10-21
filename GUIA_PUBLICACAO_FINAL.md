# 🚀 Guia Completo — iOS App Store & Android Google Play

## 📱 Status Atual

✅ **Projeto Completo:**
- App React Native 100% funcional (4 serviços de saúde auditados)
- TypeScript configurado
- Supabase integrado
- RapiDoc API integrada
- Expo SDK 53 + iOS 14.0+
- Android AAB pronto: `build/ailun-saude-app-1.2.0.aab` (141-145 MB)
- iOS Archive pronto: `ios/build/AilunSade.xcarchive`

---

## 🔧 Opção 1: Usar Expo EAS (RECOMENDADO) ⭐

### Vantagens:
- ✅ Sem certificados locais
- ✅ Assinatura automática com Apple
- ✅ CI/CD integrado
- ✅ Mais rápido

### Passos:

#### 1️⃣ Criar conta Expo
```bash
# https://expo.dev → Sign up
# Email + Password
```

#### 2️⃣ Login no EAS CLI
```bash
eas login
# Email do Expo
# Password do Expo
```

#### 3️⃣ Configurar projeto
```bash
eas build:configure
# Segue os prompts, salva em eas.json
```

#### 4️⃣ Build para App Store
```bash
bash ios/build-eas.sh
# Selecionar opção 2 (production)
```

#### 5️⃣ Esperar build terminar
- Acompanhe em: https://expo.dev/builds
- Tempo: ~15-30 minutos
- Download automático do .ipa

#### 6️⃣ Upload para App Store
```bash
# Opção A: Via Transporter (CLI)
xcrun altool --upload-app \
  -f AilunSade.ipa \
  -t ios \
  -u seu_email@apple.com

# Opção B: Via App Store Connect (GUI)
# https://appstoreconnect.apple.com
# Versão → Build
# Selecionar build e submeter
```

---

## 🔧 Opção 2: Usar xcodebuild Localmente (MANUAL)

### Pré-requisitos:
- Certificado iOS Distribution (Apple Developer)
- Provisioning Profile criado
- Xcode 15+

### Passos:

#### 1️⃣ Criar Archive (já feito ✅)
```bash
bash ios/simple-build.sh
# Output: ios/build/AilunSade.xcarchive
```

#### 2️⃣ Exportar .ipa
```bash
xcodebuild -exportArchive \
  -archivePath ios/build/AilunSade.xcarchive \
  -exportPath ios/build \
  -exportOptionsPlist ios/exportOptions.plist
```

#### 3️⃣ Verificar .ipa
```bash
ls -lh ios/build/AilunSade.ipa
file ios/build/AilunSade.ipa
```

#### 4️⃣ Upload para App Store
```bash
xcrun altool --upload-app \
  -f ios/build/AilunSade.ipa \
  -t ios \
  -u seu_email@apple.com \
  -p sua_senha_app_specific
```

---

## 🤖 Android Google Play

### Status: ✅ PRONTO

Arquivo: `build/ailun-saude-app-1.2.0.aab` (141-145 MB)

### Passos:

#### 1️⃣ Acessar Google Play Console
```
https://play.google.com/console
```

#### 2️⃣ Criar aplicação
- Name: "Ailun Saúde"
- Type: Apps
- Category: Medical

#### 3️⃣ Upload AAB
```
Release → Production → Create new release → Upload AAB
```

#### 4️⃣ Preencher informações
- Screenshots (já temos 6 em `screenshots/`)
- Description: "Consultas médicas imediatas, agendamentos com especialistas, psicologia e nutrição"
- Privacy Policy: URL
- Permissions: Microphone, Camera (já solicitadas no app)

#### 5️⃣ Submit
- Review automático: 1-3 horas
- Publicação: 24 horas

---

## 📋 Checklist Final

### Antes de publicar:

```
iOS:
- [ ] App ID criado (app.ailun)
- [ ] Bundle ID: app.ailun
- [ ] Certificado iOS Distribution
- [ ] Provisioning Profile válida
- [ ] Version & Build number atualizados
- [ ] Screenshots 5.5" + 6.5" + iPad
- [ ] Icon 1024x1024 RGB
- [ ] Privacy Policy URL
- [ ] Terms & Conditions (opcional)
- [ ] Support URL
- [ ] Demo Account (para testar)

Android:
- [ ] Package name: app.ailun
- [ ] Version: 1.2.0
- [ ] Build: 5
- [ ] Screenshots (mínimo 2, máximo 8)
- [ ] Icon 512x512
- [ ] Banner 1024x500
- [ ] Description
- [ ] Privacy Policy URL
- [ ] Permissions: INTERNET, RECORD_AUDIO, CAMERA, etc.

Ambos:
- [ ] App nomes idênticos
- [ ] Versões sincronizadas
- [ ] Descrição coerente
- [ ] Privacy Policy valida
- [ ] Sem erros de linting
- [ ] TypeScript type-safe
- [ ] Testes manuais realizados
```

---

## 🔐 Credenciais Necessárias

### Apple:
- Apple ID + Password
- Team ID: UAUX8M9JPN
- Bundle ID: app.ailun
- App-specific password (para CLI)

**Gerar app-specific password:**
1. https://appleid.apple.com
2. Security → App Specific Passwords
3. Generate nova
4. Usar no terminal (só uma vez)

### Google:
- Google Play Console account
- Service Account JSON (para CI/CD)

---

## ⏱️ Timeline Estimado

```
Expo EAS:
1. Setup: 10 min
2. Build: 20-30 min
3. Upload: 5 min
4. Review: 1-3 horas (automático)
5. Publicação: 24 horas
Total: ~1 dia para ambas as stores

xcodebuild Manual:
1. Certificados: 30 min (se não tiver)
2. Export: 10 min
3. Upload: 5 min
4. Review + Publicação: ~1 dia
```

---

## 🆘 Problemas Comuns

### iOS

**Erro: "No signing certificate iOS Distribution found"**
```bash
# Solução: Gerar certificado novo via Xcode
# Xcode → Preferences → Accounts → Manage Certificates
```

**Erro: "No profiles for bundle ID were found"**
```bash
# Solução: Criar provisioning profile em developer.apple.com
# App IDs → Provisioning Profiles → Create
```

**Erro: "Provisioning profile doesn't include the aps-environment"**
```bash
# Solução: Habilitar Push Notifications no App ID
```

### Android

**Erro: "Binary is not 64-bit"**
```bash
# Solução: Verificar package.json (já está OK)
# Usar: react-native-gradle version 8+
```

**Erro: "Duplicate resource"**
```bash
# Solução: Limpar node_modules + rebuild
rm -rf node_modules && npm install
expo prebuild --clean
```

---

## 📞 Suporte

- Expo Docs: https://docs.expo.dev
- Apple Developer: https://developer.apple.com
- Google Play: https://support.google.com/googleplay
- Our Repo: https://github.com/ThalesAndrades/Ailun-Sa-de

---

## ✅ Próximas Ações

1. **Escolher opção** (EAS ou Manual)
2. **Setup certificados** (se opção 2)
3. **Build + Export**
4. **Upload ambas stores**
5. **Monitorar publicação**
6. **Celebrar! 🎉**

---

**Última atualização:** 2025-10-21  
**Versão do app:** 1.2.0  
**Build:** 5  
**Status:** ✅ PRONTO PARA PUBLICAÇÃO
