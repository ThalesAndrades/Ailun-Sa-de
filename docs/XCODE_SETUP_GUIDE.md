# 🍎 Guia: Abrir e Rodar no Xcode

Este guia explica como baixar o build iOS e abrir no Xcode no seu Mac para desenvolvimento e testes locais.

---

## 📋 Pré-requisitos

- **macOS** com Xcode instalado (versão 15.0+)
- **Node.js** instalado
- **EAS CLI** instalado: `npm install -g eas-cli`
- **Apple Developer Account** configurada

---

## 🎯 Opção 1: Build para Simulador (Download Direto)

### 1.1 Gerar Build para Simulador

```bash
# Via EAS CLI
eas build --platform ios --profile simulator

# Aguardar conclusão do build...
```

### 1.2 Baixar o Build

```bash
# Baixar o arquivo .app
eas build:download --platform ios --profile simulator

# O arquivo será baixado na pasta atual
```

### 1.3 Abrir no Simulador

```bash
# Extrair o arquivo .tar.gz
tar -xzf build-xxxxx.tar.gz

# Arrastar o .app para o simulador aberto
# OU usar o comando:
xcrun simctl install booted AilunSaude.app
```

---

## 🎯 Opção 2: Gerar Código Nativo (Projeto Xcode Completo)

### 2.1 Preparar Projeto Nativo

```bash
# Gerar diretórios ios/ e android/ nativos
npx expo prebuild --platform ios

# Isso criará o diretório ios/ com todo o código nativo
```

### 2.2 Abrir no Xcode

```bash
# Abrir o workspace no Xcode
open ios/AilunSaude.xcworkspace

# OU abrir manualmente:
# - Navegar até a pasta ios/
# - Duplo clique em AilunSaude.xcworkspace
```

### 2.3 Configurar Signing no Xcode

1. No Xcode, selecione o projeto no navegador
2. Vá para **Signing & Capabilities**
3. Configure:
   - **Team**: 2QJ24JV9N2 (Thales Andrade Silva)
   - **Bundle Identifier**: app.ailun
   - ✅ **Automatically manage signing**

### 2.4 Rodar no Simulador/Dispositivo

```bash
# Via linha de comando (recomendado)
npx expo run:ios

# Ou apertar ▶️ (Run) no Xcode
```

---

## 🎯 Opção 3: Build Preview para Dispositivo Físico

### 3.1 Gerar Build Internal

```bash
# Build que pode ser instalado diretamente no dispositivo
eas build --platform ios --profile preview
```

### 3.2 Baixar o .ipa

```bash
# Baixar arquivo
eas build:download --platform ios --profile preview

# Resultado: build-xxxxx.ipa
```

### 3.3 Instalar no Dispositivo

**Via Xcode:**
```bash
# 1. Conectar iPhone via USB
# 2. Abrir Xcode
# 3. Window > Devices and Simulators
# 4. Arrastar o .ipa para o dispositivo
```

**Via Terminal:**
```bash
# Instalar via ideviceinstaller (se instalado)
ideviceinstaller -i build-xxxxx.ipa
```

---

## 🛠️ Comandos Úteis

### Limpar Cache
```bash
# Limpar cache do Expo
npx expo start -c

# Limpar build anterior do Xcode
cd ios && xcodebuild clean && cd ..

# Reinstalar dependências iOS
cd ios && pod install && cd ..
```

### Ver Lista de Builds
```bash
# Listar todos os builds
eas build:list --platform ios

# Ver detalhes de um build específico
eas build:view [BUILD_ID]
```

### Debug no Xcode
```bash
# Rodar com logs detalhados
npx expo run:ios --configuration Debug

# Rodar em dispositivo específico
npx expo run:ios --device
```

---

## 📱 Profiles EAS Disponíveis

### Simulator
- ✅ Roda no simulador iOS
- ✅ Build rápido
- ✅ Ideal para testes

```bash
eas build --platform ios --profile simulator
```

### Preview
- ✅ Roda em dispositivos físicos
- ✅ Distribution: Internal
- ✅ Pode ser baixado

```bash
eas build --platform ios --profile preview
```

### Production
- ✅ Build otimizado
- ✅ Distribution: App Store
- ⚠️ Não permite download direto

```bash
eas build --platform ios --profile production
```

---

## 🔧 Troubleshooting

### Erro: "Unable to boot simulator"
```bash
# Reiniciar simulador
killall Simulator
open -a Simulator
```

### Erro: "Code signing error"
```bash
# 1. Abrir Xcode
# 2. Preferences > Accounts
# 3. Adicionar Apple ID (thales@ailunsaude.com.br)
# 4. Download Manual Profiles
```

### Erro: "Command PhaseScriptExecution failed"
```bash
# Limpar e reinstalar
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
cd ..
```

### Erro: "Module not found"
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
cd ios && pod install && cd ..
```

---

## 📊 Comparação de Métodos

| Método | Tempo Setup | Editável | Debug | Device |
|--------|-------------|----------|-------|--------|
| **Simulator Build** | ~10min | ❌ | Limitado | Não |
| **Expo Prebuild** | ~5min | ✅ | Completo | Sim |
| **Preview Build** | ~15min | ❌ | Limitado | Sim |

---

## 🎯 Recomendação

Para desenvolvimento local e testes no Xcode:

1. **Use `npx expo prebuild`** - Gera código nativo editável
2. **Abra no Xcode** - Controle total do projeto
3. **Use `npx expo run:ios`** - Build e run automático

```bash
# Workflow completo recomendado
npx expo prebuild --platform ios
cd ios && pod install && cd ..
npx expo run:ios
```

---

## 📝 Notas Importantes

- ⚠️ Após `expo prebuild`, o diretório `ios/` será versionado
- ⚠️ Mudanças no `app.json` requerem novo `prebuild`
- ⚠️ Mantenha o Xcode e CocoaPods atualizados
- ⚠️ Use sempre o `.xcworkspace`, não o `.xcodeproj`

---

## 🔗 Links Úteis

- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [Running in Xcode](https://docs.expo.dev/guides/ios-developer-mode/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Apple Developer Portal](https://developer.apple.com/)

---

**Configurado por**: OnSpace AI  
**Última atualização**: 2025-10-20  
**Projeto**: Ailun Saúde
