# Guia de Build iOS - Ailun Saúde

## Correções Aplicadas

### 1. Configurações iOS (app.json)
✅ **Deployment Target**: iOS 14.0 (compatibilidade ampla)
✅ **Permissões Info.plist**: Todas as permissões necessárias adicionadas:
- Camera
- Microphone  
- Face ID
- Photo Library
- Location
- Calendar
- Contacts
- Background Notifications

✅ **Segurança**: ITSAppUsesNonExemptEncryption = false (build mais rápido)

### 2. Configurações EAS Build (eas.json)
✅ **Development**: Configurado para simulador iOS
✅ **Preview**: Build de release para testes
✅ **Production**: Build otimizado com auto-incremento de versão

### 3. Metro Config (metro.config.js)
✅ **Asset Types**: Suporte completo para imagens, fontes, áudio/vídeo
✅ **Otimização**: Bloqueio de módulos desnecessários para reduzir bundle

## Como Fazer Build iOS

### Pré-requisitos
```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login no EAS
eas login
```

### Build Local (Simulador)
```bash
# Build para simulador iOS
eas build --platform ios --profile development --local
```

### Build Preview (TestFlight/Ad-Hoc)
```bash
# Build para testes
eas build --platform ios --profile preview
```

### Build Production (App Store)
```bash
# Build para publicação
eas build --platform ios --profile production
```

## Checklist Antes do Build

### ✅ Configurações Apple Developer
- [ ] Conta Apple Developer ativa ($99/ano)
- [ ] App ID criado no portal (com.ailun.saude)
- [ ] Certificados de distribuição válidos
- [ ] Provisioning profiles atualizados

### ✅ Assets
- [ ] Ícone do app (1024x1024 PNG)
- [ ] Splash screen otimizada
- [ ] Screenshots para App Store

### ✅ Permissões
Todas as permissões estão configuradas:
- ✅ Camera & Microphone (consultas vídeo)
- ✅ Face ID/Touch ID (autenticação)
- ✅ Photo Library (compartilhamento)
- ✅ Calendar (agendamento)
- ✅ Contacts (emergência)
- ✅ Location (serviços próximos)

### ✅ Bundle & Versioning
- Bundle ID: `com.ailun.saude`
- Version: `1.2.0`
- Build Number: Auto-incrementado no production

## Solução de Problemas Comuns

### ❌ Erro: "No Provisioning Profile"
**Solução**: Configure no EAS:
```bash
eas credentials
```

### ❌ Erro: "Missing Info.plist keys"
**Solução**: Já corrigido - todas as permissões estão no app.json

### ❌ Erro: "Build timeout"
**Solução**: Use build local ou upgrade EAS plan

### ❌ Erro: "CocoaPods install failed"
**Solução**: Geralmente auto-resolvido pelo EAS. Se persistir:
```bash
# No seu Mac local
cd ios && pod install --repo-update
```

## Deploy para App Store

### 1. Build Production
```bash
eas build --platform ios --profile production
```

### 2. Submit para Review
```bash
eas submit --platform ios
```

### 3. Preencher no App Store Connect
- Descrição do app
- Screenshots (6.5", 5.5")
- Keywords
- Categoria: Medicina/Saúde
- Classificação etária
- Preço: Grátis

## Configurações Adicionais para Produção

### App Store Connect
1. Criar app no portal
2. Configurar In-App Purchases (se necessário)
3. Habilitar Sign in with Apple (se usar)
4. Configurar Push Notifications

### Documentação Necessária
- Privacy Policy URL
- Terms of Service URL  
- Support URL
- Marketing URL (opcional)

## Status das Correções
✅ **app.json**: Totalmente configurado
✅ **eas.json**: Profiles iOS criados
✅ **metro.config.js**: Otimizado
✅ **Permissões**: Todas declaradas
✅ **Assets**: Estrutura pronta

## Próximos Passos
1. Execute build de desenvolvimento para testar
2. Corrija qualquer erro específico do seu projeto
3. Faça build preview para TestFlight
4. Teste com usuários beta
5. Submit para App Store

## Suporte
Se encontrar erros específicos, documente:
- Mensagem de erro completa
- Platform/profile usado
- Logs do EAS build
- Versões das dependências

---
**Atualizado**: 19 de Outubro de 2025
**Versão do App**: 1.2.0
**iOS Deployment Target**: 14.0+
