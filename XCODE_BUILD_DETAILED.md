# 🍎 Build iOS Completo - Passo a Passo Detalhado

**Data:** 21 de Outubro de 2025  
**Versão:** 1.2.0  
**Status:** ✅ Pronto para Build

---

## 📋 ÍNDICE

1. [Verificação Prévia](#verificação-prévia)
2. [Opção A: Build Rápido via Terminal](#opção-a-build-rápido)
3. [Opção B: Build via Xcode (GUI)](#opção-b-xcode-gui)
4. [Configurações de Signing](#configurações-de-signing)
5. [Troubleshooting](#troubleshooting)
6. [Próximos Passos](#próximos-passos)

---

## ✅ Verificação Prévia

Antes de qualquer coisa, execute:

```bash
# Abra terminal e vá para a pasta do projeto
cd /Applications/Ailun-Sa-de-1

# Verifique se tudo está em ordem
echo "=== CHECKLIST PRÉ-BUILD ==="
echo ""
echo "1. iOS Project:"
test -d ios && echo "✅ ios/ existe" || echo "❌ ios/ NÃO encontrado"
test -f ios/AilunSade.xcworkspace && echo "✅ xcworkspace existe" || echo "❌ xcworkspace NÃO encontrado"
test -f ios/Podfile && echo "✅ Podfile existe" || echo "❌ Podfile NÃO encontrado"
test -f ios/Podfile.lock && echo "✅ Podfile.lock existe" || echo "❌ Podfile.lock NÃO encontrado"
echo ""
echo "2. Ferramentas:"
which xcodebuild > /dev/null && echo "✅ xcodebuild disponível" || echo "❌ xcodebuild NÃO encontrado"
which pod > /dev/null && echo "✅ CocoaPods disponível" || echo "❌ CocoaPods NÃO encontrado"
echo ""
echo "3. Verificar Podfile.lock sincronizado:"
pod install --repo-update --dry-run 2>&1 | grep -q "Analyzing dependencies" && echo "✅ Pods sincronizados" || echo "⚠️ Pode precisar pod install"
```

**Esperado:** Todos com ✅

---

## Opção A: Build Rápido via Terminal

### ⚡ Método Mais Rápido (3-5 minutos)

```bash
cd /Applications/Ailun-Sa-de-1/ios

# Executar script de build
./build.sh
```

**Resultado:**
```
...
Build complete! 
Output: build/Release-iphoneos/AilunSade.app
✅ SUCCESS
```

### Se build.sh não tiver permissão:

```bash
chmod +x /Applications/Ailun-Sa-de-1/ios/build.sh
./build.sh
```

### Build Manual via xcodebuild:

#### Para Simulador (mais rápido):
```bash
cd /Applications/Ailun-Sa-de-1

xcodebuild \
  -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -configuration Debug \
  -sdk iphonesimulator \
  -derivedDataPath ios/build \
  build
```

#### Para Dispositivo Físico:
```bash
cd /Applications/Ailun-Sa-de-1

xcodebuild \
  -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -configuration Release \
  -sdk iphoneos \
  -derivedDataPath ios/build \
  build
```

#### Para App Store (Archive):
```bash
cd /Applications/Ailun-Sa-de-1

xcodebuild \
  -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -configuration Release \
  -scheme AilunSade \
  archive \
  -archivePath ios/build/AilunSade.xcarchive
```

---

## Opção B: Xcode GUI (Mais Visual)

### 📖 Passo 1: Abrir Xcode

```bash
open /Applications/Ailun-Sa-de-1/ios/AilunSade.xcworkspace
```

**⚠️ IMPORTANTE:** Abra `.xcworkspace`, NÃO `.xcodeproj`

Você verá a janela do Xcode com:
- Left panel: Project navigator
- Center: Editor
- Right panel: Inspectors

### 📖 Passo 2: Selecionar Scheme e Device

Na barra de ferramentas superior:

```
[AilunSade ▼]  [iPhone 16 Pro Simulator ▼]  [▶ Build & Run]
```

#### 2a. Selecionar Scheme (primeiro dropdown)
- Clique em `AilunSade`
- Se não aparecer, verifique se está no workspace

#### 2b. Selecionar Device/Simulator (segundo dropdown)

**Para Simulador:**
- Clique no dropdown
- Selecione: `iPhone 16 Pro` ou qualquer iPhone disponível

**Para Dispositivo Físico:**
- Conecte seu iPhone via USB
- Clique no dropdown
- Selecione: Seu iPhone (aparecerá com o nome)

### 📖 Passo 3: Configurar Code Signing (IMPORTANTE)

Se for usar dispositivo físico:

1. **Na left panel:** Clique em "AilunSade" (projeto)
2. **Na center panel:** Selecione "AilunSade" (target)
3. **Na top tabs:** Clique em "Signing & Capabilities"
4. **Configure:**
   - [ ] Team: Selecione sua Apple Developer Team
   - [ ] Bundle ID: `com.ailun.saude`
   - [ ] Provisioning Profile: Deixe "Automatic"

Resultado esperado: Todos os campos em verde ✅

### 📖 Passo 4: Fazer Build

#### Opção 4a: Build Apenas (sem run)
```
Product → Build
```
Ou pressione: **⌘B**

**Status:**
- Barra de progresso aparecerá na top
- Build Log no painel inferior
- Verde quando completo: ✅

#### Opção 4b: Build + Run (vai abrir app)
```
Product → Run
```
Ou pressione: **⌘R**

**O que acontece:**
1. Build completa
2. App é instalado
3. App abre automaticamente no simulador/device

### 📖 Passo 5: Monitorar Progresso

**Na janela do Xcode:**

1. **Build Log** (painel inferior):
   - Mostra cada etapa de compilação
   - Procure por "Build successful" ou "Build failed"

2. **Issues** (Report Navigator):
   - Se houver erros, aparecem em vermelho
   - Warnings em amarelo

3. **Activity Viewer** (no topo):
   - Barra de progresso
   - Status: "Building", "Installing", "Running"

### 📖 Passo 6: Sucesso!

Quando build termina:

**No Simulador:**
- Simulador abre automaticamente
- App instala e inicia
- Você vê a tela de login/splash

**No Dispositivo:**
- App instala no seu iPhone
- App abre automaticamente
- Icone aparece na home screen

---

## 🔒 Configurações de Signing

### Se Receber Erro: "No provisioning profile found"

#### Solução 1: Configurar Apple ID no Xcode

```
Xcode → Preferences → Accounts
```

1. Clique em "+"
2. Selecione "Apple ID"
3. Clique "Continue"
4. Entre com sua Apple ID e senha
5. Clique "Next"

#### Solução 2: Selecionar Team no Projeto

```
Project → AilunSade → Signing & Capabilities
```

1. Na seção "Signing", selecione seu Team
2. Xcode criará provisioning profile automaticamente
3. Deve aparecer em verde ✅

#### Solução 3: Manual Provisioning Profile

Se automático não funcionar:

```
Project → Build Settings
```

Procure por:
- `PROVISIONING_PROFILE`
- `PROVISIONING_PROFILE_SPECIFIER`
- `DEVELOPMENT_TEAM`

Configure com seus valores do Apple Developer Account

---

## 🚀 Build Strategies

### Strategy 1: Desenvolvimento Rápido
```bash
xcodebuild \
  -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -configuration Debug \
  -sdk iphonesimulator
```
- **Tempo:** 2-3 minutos
- **Uso:** Testes rápidos
- **Device:** Simulador apenas

### Strategy 2: Teste em Device
```bash
xcodebuild \
  -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -configuration Debug \
  -sdk iphoneos
```
- **Tempo:** 3-5 minutos
- **Uso:** Testes em device real
- **Device:** iPhone conectado

### Strategy 3: Produção/App Store
```bash
xcodebuild \
  -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -configuration Release \
  -sdk iphoneos \
  archive \
  -archivePath build/AilunSade.xcarchive
```
- **Tempo:** 5-10 minutos
- **Uso:** Submissão App Store
- **Output:** `.xcarchive` para distribuição

---

## ❌ Troubleshooting

### Problema 1: "Build failed with CocoaPods error"

```bash
cd /Applications/Ailun-Sa-de-1/ios

# Opção 1: Reinstalar Pods
rm -rf Pods Podfile.lock
pod install --repo-update

# Opção 2: Update CocoaPods
pod repo update
pod install

# Depois tente build novamente
```

### Problema 2: "Command PhaseScriptExecution failed"

```bash
cd /Applications/Ailun-Sa-de-1

# Limpar build
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Tente novamente
xcodebuild clean -workspace ios/AilunSade.xcworkspace
xcodebuild -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -configuration Debug \
  build
```

### Problema 3: "Xcode says development team is required"

```
Project → AilunSade → Signing & Capabilities
```

Na seção Signing:
- [ ] Selecione seu Team no dropdown
- [ ] Bundle ID deve ser: com.ailun.saude
- [ ] Clique em "Copy Provisioning Profile"

### Problema 4: "Simulator device not found"

```bash
# Listar simuladores
xcrun simctl list devices

# Criar novo se não houver
xcrun simctl create "iPhone 16 Pro" \
  com.apple.CoreSimulator.SimDeviceType.iPhone-16-Pro \
  com.apple.CoreSimulator.SimRuntime.iOS-18-0

# Ou abrir Simulator app
open /Applications/Simulator.app
```

### Problema 5: "Build muito lento"

**Soluções:**
1. Use device físico em vez de simulador
2. Feche outros apps
3. Limpe build cache: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
4. Use SSD em vez de HDD
5. Considere usar EAS build (cloud) se problema persistir

---

## 📱 Testar o App

Depois que build completa com sucesso:

### Testes Básicos
- [ ] App inicia sem crash
- [ ] Tela de splash aparece
- [ ] Login screen carrega
- [ ] Tente fazer login com credenciais de teste
- [ ] Dashboard carrega dados
- [ ] Botões respondem a cliques

### Testes de Network
- [ ] App conecta ao Supabase
- [ ] API calls funcionam
- [ ] Dados aparecem corretamente

### Testes de Funcionalidade
- [ ] Agendamento de consultas
- [ ] Videochamada (ou simulação)
- [ ] Histórico de consultas
- [ ] Perfil de usuário

---

## 📦 Exportar para App Store

Depois do build funcionar localmente:

### Passo 1: Fazer Archive

```bash
xcodebuild -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -configuration Release \
  archive \
  -archivePath ~/AilunSade.xcarchive
```

Ou via Xcode:
```
Product → Archive
```

### Passo 2: Exportar IPA

```bash
xcodebuild -exportArchive \
  -archivePath ~/AilunSade.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath ~/AilunSade.ipa
```

Ou via Xcode:
```
Window → Organizer
Selecione seu archive
Clique "Distribute App"
```

### Passo 3: Submeter App Store Connect

(Requer Apple Developer Account ativo)

```
https://appstoreconnect.apple.com
```

---

## 📊 Arquivos Importantes

```
/Applications/Ailun-Sa-de-1/
├── ios/
│   ├── AilunSade.xcworkspace/     ← Abra ESTE
│   ├── AilunSade.xcodeproj/       ← Não use direto
│   ├── AilunSade/                 ← Source code
│   │   ├── AilunSade.swift
│   │   └── ...
│   ├── Pods/                      ← Dependências
│   ├── Podfile                    ← Define dependências
│   ├── Podfile.lock               ← Lock de versões
│   ├── build.sh                   ← Script de build
│   └── build/                     ← Output do build
├── app.json                       ← Configuração Expo
└── package.json
```

---

## ✨ Status

**Projeto:** Ailun Saúde v1.2.0  
**iOS Target:** iOS 13.0+  
**Architecture:** arm64 (device) + x86_64 (simulator)  
**Status:** ✅ Pronto para Build

---

## 🎯 Próximos Passos

1. ✅ Execute um dos métodos acima
2. ✅ Verifique se build completa sem erros
3. ✅ Teste o app no simulador/device
4. ✅ Se funcionar: Parabéns! 🎉
5. ⏳ Se houver erros: Veja seção Troubleshooting

---

## 💡 Dicas Profissionais

- **Sempre use `.xcworkspace`**, nunca `.xcodeproj` diretamente
- **Mantenha Podfile.lock em git** para consistência
- **Use `pod install --repo-update`** regularmente
- **Limpe build cache** se tiver comportamentos estranhos
- **Considere EAS** para CI/CD e builds na nuvem

---

**Pronto para começar? Execute agora:**

```bash
cd /Applications/Ailun-Sa-de-1/ios
./build.sh
```

Ou abra Xcode:

```bash
open /Applications/Ailun-Sa-de-1/ios/AilunSade.xcworkspace
```

**Boa sorte! 🚀**
