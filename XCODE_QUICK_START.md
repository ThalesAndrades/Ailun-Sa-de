# 🚀 Guia Rápido: Abrir no Xcode

## ⚡ Método Mais Rápido (5 minutos)

### 1. Gerar Código Nativo
```bash
npx expo prebuild --platform ios --clean
```

### 2. Instalar Dependências iOS
```bash
cd ios
pod install
cd ..
```

### 3. Abrir no Xcode
```bash
open ios/AilunSaude.xcworkspace
```

### 4. Configurar Signing (Uma vez)
No Xcode:
1. Selecione o projeto **AilunSaude** no navegador lateral
2. Selecione o target **AilunSaude** 
3. Vá para aba **Signing & Capabilities**
4. Configure:
   - **Team**: 2QJ24JV9N2 (Thales Andrade Silva)
   - **Bundle Identifier**: app.ailun (já preenchido)
   - ✅ Marque **Automatically manage signing**

### 5. Rodar
Aperte o botão ▶️ **Run** no Xcode ou use:
```bash
npx expo run:ios
```

---

## 📋 Checklist de Validação

Antes de abrir no Xcode, verifique:

- [x] **Node.js instalado**: `node --version` (v16+)
- [x] **Xcode instalado**: Versão 15.0+
- [x] **CocoaPods instalado**: `pod --version`
- [x] **Apple Developer Account**: thales@ailunsaude.com.br
- [x] **Team ID**: 2QJ24JV9N2
- [x] **Bundle ID**: app.ailun

---

## 🔧 Comandos Úteis

### Limpar e Reconstruir
```bash
# Limpar tudo
rm -rf ios node_modules package-lock.json

# Reinstalar
npm install
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
```

### Rodar em Dispositivo Específico
```bash
# Ver dispositivos disponíveis
xcrun simctl list devices

# Rodar em dispositivo específico
npx expo run:ios --device "iPhone 15 Pro"
```

### Debug no Xcode
```bash
# Rodar com debug
npx expo run:ios --configuration Debug

# Ver logs
npx react-native log-ios
```

---

## ⚠️ Troubleshooting

### Erro: "Unable to resolve module"
```bash
npm install
cd ios && pod install && cd ..
npx expo start -c
```

### Erro: "Code signing error"
1. Abra Xcode
2. Preferences > Accounts
3. Adicione Apple ID: thales@ailunsaude.com.br
4. Clique em "Download Manual Profiles"

### Erro: "Build failed"
```bash
# Limpar cache do Xcode
cd ios
xcodebuild clean
rm -rf ~/Library/Developer/Xcode/DerivedData/*
pod deintegrate && pod install
cd ..
```

### Erro: "Simulator not found"
```bash
# Abrir aplicativo Simulador
open -a Simulator

# Reiniciar simulador
killall Simulator
open -a Simulator
```

---

## 📱 Informações do Projeto

| Configuração | Valor |
|-------------|-------|
| **App Name** | Ailun Saúde |
| **Bundle ID** | app.ailun |
| **Team ID** | 2QJ24JV9N2 |
| **Apple ID** | thales@ailunsaude.com.br |
| **Owner** | thales-andrades |
| **Version** | 1.2.0 |
| **Build Number** | 13 |
| **Min iOS** | 14.0 |

---

## 🎯 Estrutura Gerada

Após `npx expo prebuild`, você terá:

```
ios/
├── AilunSaude/              # Código fonte iOS
├── AilunSaude.xcodeproj/    # ❌ NÃO use este
├── AilunSaude.xcworkspace/  # ✅ SEMPRE use este
├── Podfile                  # Dependências CocoaPods
└── Pods/                    # Bibliotecas instaladas
```

**IMPORTANTE**: Sempre abra `.xcworkspace`, nunca `.xcodeproj`

---

## 🔗 Links Rápidos

- [Expo Prebuild Docs](https://docs.expo.dev/workflow/prebuild/)
- [Apple Developer Portal](https://developer.apple.com/account/)
- [Guia Completo Xcode](./docs/XCODE_SETUP_GUIDE.md)

---

## ✅ Validação Final

Execute estes comandos para validar:

```bash
# 1. Verificar Node.js
node --version

# 2. Verificar Xcode
xcode-select -p

# 3. Verificar CocoaPods
pod --version

# 4. Gerar e abrir
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..
open ios/AilunSaude.xcworkspace
```

Se todos os comandos executarem sem erros, **está pronto para uso!** 🎉

---

**Última atualização**: 2025-10-20  
**Configurado por**: OnSpace AI  
**Projeto**: Ailun Saúde
