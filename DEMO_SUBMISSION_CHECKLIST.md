# Checklist de Submissão - Ailun Saúde (Modo Demo)

## 📋 Preparação Geral

### Configuração do Projeto

- [ ] Modo demo ativado (`.env.demo` copiado para `.env`)
- [ ] Versão atualizada no `app.json` (1.2.3)
- [ ] Build number incrementado (iOS: 25, Android: 15)
- [ ] Dependências instaladas (`npm install`)
- [ ] Projeto compila sem erros (`npx expo start`)
- [ ] EAS CLI instalado (`npx eas-cli --version`)
- [ ] Conta Expo configurada (`npx eas-cli login`)

### Assets e Recursos

- [ ] Ícone do app (1024x1024px) - `assets/icon.png`
- [ ] Splash screen - `assets/splash.png`
- [ ] Screenshots para App Store (3 imagens, 1284x2778px)
- [ ] Screenshots para Google Play (mínimo 2 imagens)
- [ ] Logo oficial - `assets/app-store/logo.png`
- [ ] Ícone adaptativo Android - `assets/adaptive-icon.png`

---

## 🍎 Apple App Store

### 1. Configurações no App Store Connect

**URL**: https://appstoreconnect.apple.com/apps/6753972192

#### App Information

- [ ] **Name**: Ailun Saúde
- [ ] **Subtitle**: Saúde fácil, você no controle.
- [ ] **Primary Category**: Medical
- [ ] **Secondary Category**: Health & Fitness
- [ ] **Primary Language**: Portuguese (Brazil)
- [ ] **Bundle ID**: app.ailun
- [ ] **SKU**: EX1760427424509
- [ ] **Apple ID**: 6753972192

#### Pricing and Availability

- [ ] **Price**: $0.00 (Gratuito)
- [ ] **Availability**: 175 países/regiões
- [ ] **Distribution**: Public - Discoverable on App Store

#### App Privacy

- [ ] **Privacy Policy URL**: https://souailun.info/PrivacyPolicy
- [ ] **Data Types Collected**: 8 tipos configurados
  - [ ] Email Address
  - [ ] Name
  - [ ] Phone Number
  - [ ] Physical Address
  - [ ] Health & Fitness
  - [ ] Crash Data
  - [ ] Performance Data
  - [ ] Other Diagnostic Data

### 2. Version Information (1.0)

#### Metadata

- [ ] **Description**: Descrição completa do app (mínimo 10 caracteres)
- [ ] **Keywords**: saúde, telemedicina, consulta, médico, prontuário, teleconsulta, ailun, atendimento
- [ ] **Support URL**: https://ailun.com.br
- [ ] **Marketing URL**: https://ailun.com.br (opcional)
- [ ] **Version**: 1.0
- [ ] **Copyright**: 2025 Ailun Tecnologia LTDA

#### Screenshots

- [ ] **iPhone 6.5" Display** (obrigatório):
  - [ ] Screenshot 1: Home Screen
  - [ ] Screenshot 2: Appointments List
  - [ ] Screenshot 3: Teleconsultation

#### Build

- [ ] **Build associado**: Build 25 (versão 1.2.3)
- [ ] **App Icon**: Incluído automaticamente

#### Sign-In Information ⚠️ IMPORTANTE

- [x] **Sign-in required**: Marcado
- [x] **Username**: demo@ailun.com.br
- [x] **Password**: Demo@2025
- [x] **Notes**:
```
Este é um aplicativo de telemedicina. Use as credenciais fornecidas para acessar.

Funcionalidades principais para testar:
1. Login com as credenciais acima
2. Visualizar dashboard com consultas agendadas
3. Agendar nova consulta (escolha qualquer especialidade)
4. Acessar perfil do usuário
5. Visualizar assinatura ativa

Todas as consultas e dados são fictícios para fins de demonstração.
```

#### Contact Information

- [ ] **First Name**: Thales
- [ ] **Last Name**: Andrades
- [ ] **Phone**: +5511999999999
- [ ] **Email**: thales@ailun.com.br

### 3. Build com EAS

```bash
# Login no EAS
npx eas-cli login

# Build para iOS
npx eas-cli build --platform ios --profile production

# Aguardar conclusão do build (15-30 minutos)
# Verificar status em: https://expo.dev/accounts/thales-andrades/projects/ailun-saude-app/builds
```

### 4. Submissão

```bash
# Submeter para App Store
npx eas-cli submit --platform ios --profile production

# Ou manualmente no App Store Connect
# 1. Associar build à versão 1.0
# 2. Preencher todos os campos obrigatórios
# 3. Fazer upload dos screenshots
# 4. Clicar em "Add for Review"
```

### 5. Após Submissão

- [ ] Status mudou para "Waiting for Review"
- [ ] Email de confirmação recebido
- [ ] Monitorar status em App Store Connect
- [ ] Tempo estimado de revisão: 24-48 horas

---

## 🤖 Google Play Store

### 1. Configurações no Google Play Console

**URL**: https://play.google.com/console

#### App Details

- [ ] **App name**: Ailun Saúde
- [ ] **Short description**: Telemedicina fácil e acessível
- [ ] **Full description**: Descrição completa (mínimo 80 caracteres)
- [ ] **Category**: Medical
- [ ] **Tags**: saúde, telemedicina, médico, consulta

#### Store Listing

- [ ] **App icon**: 512x512px (PNG)
- [ ] **Feature graphic**: 1024x500px
- [ ] **Phone screenshots**: Mínimo 2, máximo 8
- [ ] **7-inch tablet screenshots**: Opcional
- [ ] **10-inch tablet screenshots**: Opcional

#### Privacy Policy

- [ ] **Privacy Policy URL**: https://souailun.info/PrivacyPolicy

#### App Access

- [x] **Restricted access**: Sim
- [x] **Instructions for testing**:
```
CREDENCIAIS DE ACESSO:
Email: demo@ailun.com.br
Senha: Demo@2025

FUNCIONALIDADES PARA TESTAR:
1. Login com as credenciais acima
2. Visualizar dashboard com consultas agendadas
3. Agendar nova consulta
4. Acessar perfil do usuário
5. Visualizar assinatura ativa

Todos os dados são fictícios para fins de demonstração.
```

#### Content Rating

- [ ] **Questionário preenchido**
- [ ] **Classificação obtida**: Livre ou 12+

#### App Content

- [ ] **Target audience**: Adultos
- [ ] **Privacy & security**: Declaração de coleta de dados
- [ ] **Data safety**: Formulário preenchido
- [ ] **Ads**: Não contém anúncios
- [ ] **In-app purchases**: Não (ou declarar assinaturas)

### 2. Build com EAS

```bash
# Build para Android
npx eas-cli build --platform android --profile production

# Aguardar conclusão do build (15-30 minutos)
```

### 3. Submissão

```bash
# Submeter para Google Play
npx eas-cli submit --platform android --profile production

# Ou manualmente no Google Play Console
# 1. Criar nova release em "Production"
# 2. Upload do AAB (Android App Bundle)
# 3. Preencher release notes
# 4. Revisar e publicar
```

### 4. Após Submissão

- [ ] Status mudou para "In Review"
- [ ] Email de confirmação recebido
- [ ] Monitorar status no Google Play Console
- [ ] Tempo estimado de revisão: 1-7 dias

---

## 🔐 Segurança e Compliance

### Permissões Declaradas

- [ ] **Câmera**: Justificativa fornecida (teleconsultas)
- [ ] **Microfone**: Justificativa fornecida (teleconsultas)
- [ ] **Notificações**: Justificativa fornecida (lembretes)
- [ ] **Biometria**: Justificativa fornecida (login seguro)
- [ ] **Calendário**: Justificativa fornecida (agendamento)
- [ ] **Localização**: Justificativa fornecida (clínicas próximas)

### Dados Coletados

- [ ] **Informações de contato**: Email, telefone, nome
- [ ] **Dados de saúde**: Informações médicas (com consentimento)
- [ ] **Dados de diagnóstico**: Crash reports, performance
- [ ] **Dados de uso**: Interação com o app

### Políticas

- [ ] **Política de Privacidade**: Publicada e acessível
- [ ] **Termos de Uso**: Publicados e acessíveis
- [ ] **LGPD**: Compliance verificado
- [ ] **HIPAA**: Compliance verificado (se aplicável)

---

## 🧪 Testes Finais

### Testes Funcionais

- [ ] Login com credenciais demo funciona
- [ ] Dashboard carrega corretamente
- [ ] Agendamento de consultas funciona
- [ ] Perfil do usuário acessível
- [ ] Notificações aparecem
- [ ] Navegação entre telas fluida

### Testes de Performance

- [ ] App inicia em menos de 3 segundos
- [ ] Transições suaves entre telas
- [ ] Sem crashes ou freezes
- [ ] Consumo de memória aceitável
- [ ] Consumo de bateria otimizado

### Testes de UI/UX

- [ ] Interface responsiva em diferentes tamanhos de tela
- [ ] Textos legíveis e sem erros de português
- [ ] Botões e elementos interativos funcionam
- [ ] Feedback visual adequado
- [ ] Modo escuro funciona (se implementado)

### Testes de Conectividade

- [ ] App funciona com Wi-Fi
- [ ] App funciona com dados móveis
- [ ] Tratamento adequado de perda de conexão
- [ ] Mensagens de erro claras

---

## 📊 Monitoramento Pós-Submissão

### Métricas para Acompanhar

- [ ] Status da revisão (diariamente)
- [ ] Emails da Apple/Google
- [ ] Logs de erro (se houver)
- [ ] Feedback dos revisores

### Ações em Caso de Rejeição

1. **Ler atentamente o motivo da rejeição**
2. **Corrigir o problema identificado**
3. **Atualizar build number**
4. **Rebuild e resubmit**
5. **Adicionar notas explicativas**

---

## ✅ Checklist Final Antes de Submeter

### Apple App Store

- [ ] Todos os campos obrigatórios preenchidos
- [ ] Screenshots carregados (mínimo 1, recomendado 3)
- [ ] Build associado à versão
- [ ] Credenciais demo fornecidas
- [ ] Política de privacidade acessível
- [ ] Botão "Add for Review" ativo

### Google Play Store

- [ ] App bundle (.aab) gerado
- [ ] Store listing completo
- [ ] Screenshots carregados (mínimo 2)
- [ ] Credenciais demo fornecidas
- [ ] Content rating obtido
- [ ] Data safety preenchido

---

## 📞 Contatos de Suporte

### Expo/EAS

- **Documentação**: https://docs.expo.dev/
- **Fórum**: https://forums.expo.dev/
- **Discord**: https://chat.expo.dev/

### Apple

- **App Store Connect**: https://appstoreconnect.apple.com/
- **Developer Support**: https://developer.apple.com/support/
- **Guidelines**: https://developer.apple.com/app-store/review/guidelines/

### Google

- **Play Console**: https://play.google.com/console/
- **Developer Support**: https://support.google.com/googleplay/android-developer/
- **Guidelines**: https://play.google.com/about/developer-content-policy/

---

## 📝 Notas Importantes

1. **Tempo de Revisão**:
   - Apple: 24-48 horas (média)
   - Google: 1-7 dias (média)

2. **Taxa de Aprovação**:
   - Primeira submissão pode ser rejeitada por detalhes
   - Leia atentamente os guidelines antes de submeter

3. **Atualizações**:
   - Após aprovação, atualizações também passam por revisão
   - Mantenha o modo demo ativo para facilitar futuras revisões

4. **Comunicação**:
   - Responda rapidamente a solicitações dos revisores
   - Seja claro e profissional nas respostas

---

**Data de criação**: 04 de novembro de 2025  
**Última atualização**: 04 de novembro de 2025  
**Versão**: 1.0  
**Responsável**: Thales Andrades (thales@ailun.com.br)
