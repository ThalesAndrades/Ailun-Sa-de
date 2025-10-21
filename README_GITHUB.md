# 🏥 Ailun Saúde

Aplicativo de telemedicina com consultas médicas, especialistas, psicólogos e nutricionistas.

## 📱 Informações do App

- **Nome**: Ailun Saúde
- **Bundle ID**: app.ailun
- **Versão**: 1.2.0
- **Build**: 13
- **Plataformas**: iOS 14.0+ | Android
- **Owner**: thales-andrades

## 🚀 Início Rápido

### Pré-requisitos
```bash
node --version  # v16+
npm --version   # v8+
```

### Instalação
```bash
# Clonar repositório
git clone [URL_DO_REPOSITORIO]
cd ailun-saude-app

# Instalar dependências
npm install

# Iniciar desenvolvimento
npm start
```

## 🍎 Desenvolvimento iOS (Xcode)

### Setup Rápido
```bash
# 1. Gerar código nativo iOS
npx expo prebuild --platform ios --clean

# 2. Instalar dependências iOS
cd ios && pod install && cd ..

# 3. Abrir no Xcode
open ios/AilunSaude.xcworkspace

# 4. Configurar Team ID no Xcode:
# - Signing & Capabilities
# - Team: 2QJ24JV9N2 (Thales Andrade Silva)
# - Bundle ID: app.ailun (já configurado)

# 5. Rodar
# Aperte ▶️ Run no Xcode ou:
npx expo run:ios
```

**📖 Documentação Completa**: [XCODE_QUICK_START.md](./XCODE_QUICK_START.md)

## 🤖 Build Android

```bash
# Development
eas build --platform android --profile development

# Production
eas build --platform android --profile production
```

## 🔧 Scripts Disponíveis

```bash
npm start          # Iniciar Expo
npm run android    # Rodar Android
npm run ios        # Rodar iOS
npm run web        # Rodar Web
npm run lint       # Linting
npm run reset      # Resetar projeto
```

## 📂 Estrutura do Projeto

```
ailun-saude-app/
├── app/                    # Páginas e rotas (Expo Router)
│   ├── (tabs)/            # Navegação por tabs
│   ├── login.tsx          # Login
│   ├── dashboard.tsx      # Dashboard principal
│   ├── onboarding/        # Fluxo de boas-vindas
│   ├── signup/            # Cadastro de usuário
│   ├── consultation/      # Consultas médicas
│   └── profile/           # Perfil do usuário
├── components/            # Componentes reutilizáveis
├── services/              # Lógica de negócio e APIs
├── hooks/                 # Custom hooks
├── contexts/              # Contextos React
├── constants/             # Constantes e temas
├── utils/                 # Funções utilitárias
├── types/                 # TypeScript types
└── docs/                  # Documentação
```

## 🔑 Credenciais e Configuração

### Apple Developer
- **Team ID**: 2QJ24JV9N2
- **Apple ID**: thales@ailunsaude.com.br
- **App Store ID**: 6753972192

### Supabase
- **URL**: https://bmtieinegditdeijyslu.supabase.co
- **Anon Key**: Configurado em variáveis de ambiente

### EAS Project
- **Project ID**: 6f414a22-cc84-442f-9022-bb0ddc251d59
- **Owner**: thales-andrades

## 🌐 Variáveis de Ambiente

Crie arquivo `.env`:
```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# APIs Externas
RESEND_API_KEY=your_resend_key
ASAAS_API_KEY=your_asaas_key

# Ambiente
EXPO_PUBLIC_APP_ENV=development
```

## 📦 Build via EAS

### iOS
```bash
# Simulator (para Xcode)
eas build --platform ios --profile simulator

# Preview (para testar em dispositivo)
eas build --platform ios --profile preview

# Production (App Store)
eas build --platform ios --profile production
```

### Android
```bash
# Development
eas build --platform android --profile development

# Production
eas build --platform android --profile production
```

## 🧪 Testes

```bash
# Rodar testes
npm test

# Validar configuração
npm run validate
```

## 📖 Documentação Adicional

- **[XCODE_QUICK_START.md](./XCODE_QUICK_START.md)** - Guia rápido Xcode
- **[docs/XCODE_SETUP_GUIDE.md](./docs/XCODE_SETUP_GUIDE.md)** - Guia completo Xcode
- **[docs/BUILD_TROUBLESHOOTING.md](./docs/BUILD_TROUBLESHOOTING.md)** - Solução de problemas
- **[docs/IOS_BUILD_GUIDE.md](./docs/IOS_BUILD_GUIDE.md)** - Build iOS detalhado

## 🛠️ Tecnologias

- **React Native** - Framework mobile
- **Expo** - Toolchain e SDK
- **Expo Router** - Navegação baseada em arquivos
- **TypeScript** - Tipagem estática
- **Supabase** - Backend e autenticação
- **EAS** - Build e deploy

## 📱 Features Principais

- ✅ Login e autenticação via CPF
- ✅ Onboarding em 3 passos
- ✅ Dashboard com 4 serviços principais
- ✅ Consultas médicas imediatas
- ✅ Agendamento de especialistas
- ✅ Psicólogos e nutricionistas
- ✅ Sistema de pagamento integrado
- ✅ Perfil de usuário completo
- ✅ Notificações em tempo real

## 🐛 Troubleshooting

### Erro de dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro no iOS
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
```

### Cache do Expo
```bash
npx expo start -c
```

## 📞 Suporte

Para dúvidas e problemas:
- Email: thales@ailunsaude.com.br
- Documentação: [/docs](./docs/)

## 📄 Licença

Propriedade de Ailun Saúde. Todos os direitos reservados.

---

**Última atualização**: 2025-10-20  
**Versão do App**: 1.2.0  
**Build**: 13  
**Status**: ✅ Pronto para Produção
