# Guia Rápido - EAS Build e Submit

## 🚀 Comandos Essenciais do EAS

### 1. Login no EAS

Antes de qualquer operação, faça login na sua conta Expo:

```bash
npx eas-cli login
```

**Credenciais**:
- Username: thales-andrades (ou seu email Expo)
- Password: [sua senha Expo]

### 2. Verificar Configuração

Verifique se o projeto está configurado corretamente:

```bash
npx eas-cli build:configure
```

Este comando verifica o `eas.json` e sugere correções se necessário.

---

## 📱 Build para iOS

### Build de Produção

```bash
npx eas-cli build --platform ios --profile production
```

**O que acontece**:
1. EAS faz upload do código para servidores Expo
2. Build é executado em máquinas macOS na nuvem
3. Tempo estimado: 15-30 minutos
4. Resultado: arquivo `.ipa` pronto para submissão

### Build de Preview (Teste Interno)

```bash
npx eas-cli build --platform ios --profile preview
```

**Uso**: Para testar internamente antes da submissão oficial.

### Build para Simulador

```bash
npx eas-cli build --platform ios --profile simulator
```

**Uso**: Para testar no simulador iOS do Xcode.

---

## 🤖 Build para Android

### Build de Produção

```bash
npx eas-cli build --platform android --profile production
```

**O que acontece**:
1. EAS faz upload do código
2. Build gera arquivo `.aab` (Android App Bundle)
3. Tempo estimado: 15-30 minutos
4. Resultado: arquivo `.aab` pronto para Google Play

### Build de Preview (APK)

```bash
npx eas-cli build --platform android --profile preview
```

**Uso**: Gera um APK para instalação direta em dispositivos de teste.

---

## 🚀 Build para Ambas as Plataformas

```bash
npx eas-cli build --platform all --profile production
```

**Atenção**: Consome 2 builds (1 iOS + 1 Android).

---

## 📤 Submissão para Lojas

### Submeter para Apple App Store

```bash
npx eas-cli submit --platform ios --profile production
```

**Pré-requisitos**:
1. Build iOS concluído com sucesso
2. Apple Developer Account ativa
3. App criado no App Store Connect
4. Certificados e provisioning profiles configurados

**O que acontece**:
1. EAS seleciona o build mais recente
2. Upload para App Store Connect
3. Build fica disponível para associar à versão do app

### Submeter para Google Play Store

```bash
npx eas-cli submit --platform android --profile production
```

**Pré-requisitos**:
1. Build Android concluído com sucesso
2. Google Play Developer Account ativa
3. App criado no Google Play Console
4. Service Account JSON configurado (para automação)

**O que acontece**:
1. EAS seleciona o build mais recente
2. Upload para Google Play Console
3. Release fica disponível para revisão

---

## 🔍 Monitoramento de Builds

### Ver Status de Builds

```bash
npx eas-cli build:list
```

Lista todos os builds recentes com status.

### Ver Detalhes de um Build Específico

```bash
npx eas-cli build:view [BUILD_ID]
```

### Ver Logs de Build

Os logs são exibidos automaticamente durante o build. Para ver logs de builds anteriores:

```bash
npx eas-cli build:view [BUILD_ID]
```

---

## 📊 Verificar Status de Submissão

### iOS

```bash
npx eas-cli submit:list --platform ios
```

### Android

```bash
npx eas-cli submit:list --platform android
```

---

## 🔧 Configurações Avançadas

### Incrementar Build Number Automaticamente

No `eas.json`, a configuração `autoIncrement: true` já está ativada para iOS:

```json
{
  "build": {
    "production": {
      "ios": {
        "autoIncrement": true
      }
    }
  }
}
```

### Especificar Build Específico para Submit

```bash
npx eas-cli submit --platform ios --id [BUILD_ID]
```

### Build Local (Sem Usar Servidores EAS)

```bash
npx eas-cli build --platform ios --local
```

**Atenção**: Requer Xcode instalado (apenas macOS).

---

## 🐛 Troubleshooting

### Erro: "No development builds found"

**Solução**: Use o profile correto (`production` em vez de `development`).

```bash
npx eas-cli build --platform ios --profile production
```

### Erro: "Not logged in"

**Solução**: Faça login novamente.

```bash
npx eas-cli logout
npx eas-cli login
```

### Erro: "Build failed"

**Solução**: Verifique os logs do build para identificar o problema.

```bash
npx eas-cli build:view [BUILD_ID]
```

Problemas comuns:
- Dependências incompatíveis
- Erros de TypeScript
- Configurações incorretas no `app.json` ou `eas.json`

### Build Muito Lento

**Solução**: Use resource class maior (requer plano pago):

```json
{
  "build": {
    "production": {
      "ios": {
        "resourceClass": "medium"
      },
      "android": {
        "resourceClass": "large"
      }
    }
  }
}
```

---

## 📱 Testar Build Antes de Submeter

### iOS (TestFlight)

1. Build com profile `preview`:
   ```bash
   npx eas-cli build --platform ios --profile preview
   ```

2. Instalar via TestFlight:
   - Build aparece automaticamente no TestFlight
   - Convide testadores internos/externos
   - Teste todas as funcionalidades

### Android (Internal Testing)

1. Build com profile `preview`:
   ```bash
   npx eas-cli build --platform android --profile preview
   ```

2. Instalar APK diretamente:
   - Download do APK via dashboard Expo
   - Instalar em dispositivo de teste
   - Teste todas as funcionalidades

---

## 🔐 Credenciais e Certificados

### iOS

EAS gerencia automaticamente:
- Distribution Certificate
- Provisioning Profiles
- Push Notification Keys

**Primeira vez**: EAS solicitará acesso à sua conta Apple Developer.

### Android

EAS gerencia automaticamente:
- Keystore
- Upload Key
- Signing Configuration

**Primeira vez**: EAS cria e armazena o keystore de forma segura.

---

## 📊 Monitoramento via Dashboard

Acesse o dashboard web do EAS:

```
https://expo.dev/accounts/thales-andrades/projects/ailun-saude-app/builds
```

**Recursos**:
- Ver todos os builds
- Download de arquivos (.ipa, .aab, .apk)
- Logs detalhados
- Métricas de build

---

## 💡 Dicas e Boas Práticas

### 1. Sempre Teste Antes de Submeter

```bash
# Build de preview primeiro
npx eas-cli build --platform ios --profile preview

# Teste no TestFlight
# Depois, build de produção
npx eas-cli build --platform ios --profile production
```

### 2. Use Git Tags para Versões

```bash
git tag -a v1.2.3 -m "Release 1.2.3"
git push origin v1.2.3
```

### 3. Mantenha Changelog Atualizado

Documente mudanças em cada versão para facilitar release notes.

### 4. Monitore Builds Regularmente

Verifique o dashboard EAS diariamente durante o período de submissão.

### 5. Configure Notificações

Ative notificações por email no dashboard Expo para receber alertas sobre builds.

---

## 📞 Suporte

### Documentação Oficial

- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **Troubleshooting**: https://docs.expo.dev/build-reference/troubleshooting/

### Comunidade

- **Fórum Expo**: https://forums.expo.dev/
- **Discord**: https://chat.expo.dev/
- **GitHub Issues**: https://github.com/expo/eas-cli/issues

### Contato Direto

- **Email**: thales@ailun.com.br
- **Projeto**: Ailun Saúde

---

## 📝 Checklist Rápido

Antes de fazer build:

- [ ] Código commitado no Git
- [ ] Versão atualizada em `app.json`
- [ ] Modo demo ativado (`.env.demo` → `.env`)
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto compila localmente (`npx expo start`)
- [ ] Login no EAS feito (`npx eas-cli login`)

Antes de submeter:

- [ ] Build concluído com sucesso
- [ ] Build testado (TestFlight ou Internal Testing)
- [ ] Screenshots preparados
- [ ] Metadata preenchido nas lojas
- [ ] Credenciais demo documentadas

---

**Última atualização**: 04 de novembro de 2025  
**Versão**: 1.0  
**Autor**: Thales Andrades
