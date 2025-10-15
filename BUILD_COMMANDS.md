# Comandos de Build - AiLun Saúde 🚀

## 🏗️ **Comandos Essenciais**

### **Preparação**
```bash
# Instalar dependências
npm install

# Verificar saúde do projeto
npx expo doctor

# Limpar cache se necessário
npm run start:clear
```

### **Development**
```bash
# Iniciar desenvolvimento local
npm run start

# Iniciar com cache limpo
npm run start:clear

# Iniciar para iOS
npm run ios

# Iniciar para Android
npm run android

# Verificar TypeScript
npm run typecheck
```

### **Build para Produção**

#### **iOS (Apple Store)**
```bash
# Build iOS produção
npm run build:ios
# ou
npx eas build --platform ios --profile production

# Build iOS preview (TestFlight)
npx eas build --platform ios --profile preview
```

#### **Android (Play Store)**
```bash
# Build Android produção
npm run build:android
# ou
npx eas build --platform android --profile production

# Build Android preview (Internal Testing)
npx eas build --platform android --profile preview
```

#### **Build Todas Plataformas**
```bash
# Build iOS + Android simultaneamente
npm run build:all
# ou
npx eas build --platform all --profile production
```

### **Submit para Stores**

#### **Apple App Store**
```bash
# Submit automático
npm run submit:ios
# ou
npx eas submit --platform ios

# Submit manual
# 1. Download do .ipa do EAS Build
# 2. Upload via Transporter ou Xcode Organizer
```

#### **Google Play Store**
```bash
# Submit automático
npm run submit:android
# ou
npx eas submit --platform android
```

### **Updates OTA (Over The Air)**

```bash
# Update de produção
npm run update
# ou
npx eas update --branch production --message "Update description"

# Update de preview
npx eas update --branch preview --message "Preview update"
```

## ⚙️ **Configuração EAS (Primeira Vez)**

### **1. Setup Inicial**
```bash
# Login EAS
npx eas login

# Configurar projeto
npx eas build:configure

# Configurar credenciais iOS
npx eas credentials
```

### **2. iOS Certificates**
```bash
# Gerar certificados automaticamente
npx eas credentials --platform ios

# Ou configurar manualmente:
# - Apple Developer Account
# - Distribution Certificate
# - Provisioning Profile
```

### **3. Android Keystore**
```bash
# Gerar keystore automaticamente
npx eas credentials --platform android

# Configurar Google Play Service Account
# - service-account-key.json
# - Upload key
```

## 🔍 **Comandos de Debug**

### **Verificar Configuração**
```bash
# Verificar status do projeto
npx expo doctor

# Verificar configuração EAS
npx eas build:list

# Verificar credenciais
npx eas credentials
```

### **Logs de Build**
```bash
# Ver builds recentes
npx eas build:list

# Ver logs de build específico
npx eas build:view [BUILD_ID]

# Ver updates
npx eas update:list
```

### **Local Debug**
```bash
# Verificar TypeScript
npm run typecheck

# Verificar ESLint
npm run lint

# Limpar cache Metro
npx expo start --clear

# Reset completo
npm run clean
```

## 📱 **Testes de Dispositivo**

### **Simulador iOS**
```bash
# Abrir simulador
npx expo run:ios

# Build específico para simulador
npx eas build --platform ios --profile preview --local
```

### **Emulador Android**
```bash
# Abrir emulador
npx expo run:android

# Build específico para emulador
npx eas build --platform android --profile preview --local
```

### **Dispositivo Físico**
```bash
# Expo Go (desenvolvimento)
npx expo start --tunnel

# Development Build (produção-like)
npx eas build --profile development
```

## 🚨 **Comandos de Emergência**

### **Reset Completo**
```bash
# Limpar tudo
rm -rf node_modules
rm -rf .expo
rm package-lock.json

# Reinstalar
npm install
npx expo install --fix
```

### **Cache Issues**
```bash
# Limpar cache Expo
npx expo start --clear --reset-cache

# Limpar cache Metro
npx expo r -c

# Limpar cache EAS
npx eas build --clear-cache
```

### **Dependency Issues**
```bash
# Verificar dependências
npx expo install --fix

# Atualizar Expo SDK
npx expo install expo@latest

# Verificar compatibilidade
npx expo doctor
```

## 📊 **Monitoramento**

### **Build Status**
```bash
# Status atual
npx eas build:list --status=in-progress

# Histórico completo
npx eas build:list --limit=20

# Builds por plataforma
npx eas build:list --platform=ios
```

### **Update Status**
```bash
# Updates publicados
npx eas update:list

# Status por branch
npx eas update:list --branch=production
```

## 🎯 **Workflow Recomendado**

### **Desenvolvimento Diário**
```bash
1. npm run start:clear          # Iniciar limpo
2. npm run typecheck           # Verificar tipos
3. npm run lint               # Verificar código
4. # Desenvolver e testar
5. git add . && git commit -m "feature: xxx"
```

### **Deploy Produção**
```bash
1. npm run typecheck           # Verificar tipos
2. npm run build:ios          # Build iOS
3. # Aguardar build completar (15-30 min)
4. npm run submit:ios         # Submit App Store
5. # Aguardar review Apple (24-48h)
```

### **Hotfix Urgent**
```bash
1. # Fix do código
2. npm run update             # OTA Update
3. # Live em minutos!
```

---

## 🏆 **Status Atual**

✅ **Projeto configurado e pronto para build**
✅ **EAS configurado com profiles de produção**
✅ **Scripts npm otimizados**
✅ **Configurações Apple Store completas**

### **Próximo comando a executar:**
```bash
npm run build:ios
```

**🎉 AiLun Saúde pronto para Apple Store!** 🍎