# AiLun Saúde - README

## 🏥 Aplicativo de Telemedicina Completo

**AiLun Saúde** é um aplicativo moderno de telemedicina que oferece consultas médicas online, agendamentos com especialistas e um sistema completo de gestão de saúde.

### 🚀 Versão Atual: 2.1.0

## ✨ Principais Funcionalidades

### 🩺 Consultas Médicas
- **Médico Agora**: Consultas imediatas com clínicos gerais
- **Especialistas**: Cardiologistas, dermatologistas, neurologistas e mais
- **Psicólogos**: Cuidado da saúde mental
- **Nutricionistas**: Planos alimentares personalizados

### 📱 Recursos do Aplicativo
- Interface moderna e intuitiva
- Navegação fluida entre telas
- Notificações em tempo real
- Histórico completo de consultas
- Perfil do usuário personalizado
- Sistema de pagamentos integrado

### 🔗 Integrações
- **RapiDoc**: Plataforma de telemedicina para consultas
- **Supabase**: Backend completo com autenticação e dados
- **Asaas**: Processamento de pagamentos
- **Resend**: Sistema de emails transacionais

## 🛠️ Tecnologias

### Framework Principal
- **React Native 0.79.3** - Framework mobile multiplataforma
- **Expo 54** - Plataforma de desenvolvimento
- **TypeScript 5.8.3** - Tipagem estática
- **Expo Router 6.0.12** - Navegação baseada em arquivos

### Backend e Serviços
- **Supabase** - Backend-as-a-Service com PostgreSQL
- **RapiDoc API** - Serviços de telemedicina
- **Asaas** - Gateway de pagamentos
- **Resend** - Emails transacionais

### UI e Experiência
- **React Native Paper** - Componentes Material Design
- **Expo Linear Gradient** - Gradientes suaves
- **React Native Reanimated** - Animações fluidas
- **Expo Vector Icons** - Ícones consistentes

## 🏗️ Arquitetura

### Estrutura de Pastas
```
📁 ailun-saude/
├── 📁 app/                    # Páginas do aplicativo (Expo Router)
│   ├── 📁 (tabs)/            # Navegação por abas
│   ├── 📁 onboarding/        # Telas de apresentação
│   ├── 📁 signup/            # Fluxo de cadastro
│   ├── 📁 consultation/      # Consultas médicas
│   ├── 📁 profile/           # Perfil do usuário
│   └── 📁 payment/           # Pagamentos
├── 📁 components/            # Componentes reutilizáveis
├── 📁 services/             # Integrações com APIs
├── 📁 hooks/                # Hooks personalizados
├── 📁 contexts/             # Contextos React
├── 📁 constants/            # Constantes e configurações
├── 📁 utils/                # Utilitários e helpers
└── 📁 types/                # Definições TypeScript
```

### Padrão de Arquitetura
**Services → Hooks → Components → Pages**

- **Services**: Lógica de negócio e integrações
- **Hooks**: Estado e efeitos colaterais
- **Components**: Interface do usuário
- **Pages**: Telas do aplicativo

## 🚀 Como Executar

### Pré-requisitos
- **Node.js 18+**
- **npm 8+** ou **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/ailun-saude/ailun-app.git

# Instalar dependências
cd ailun-app
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

### Desenvolvimento
```bash
# Iniciar servidor de desenvolvimento
npm start

# Executar em dispositivo específico
npm run android    # Android
npm run ios        # iOS
npm run web        # Web browser
```

### Builds de Produção
```bash
# Build para todas as plataformas
npm run build:all

# Build específico
npm run build:android
npm run build:ios

# Deploy
npm run submit:android
npm run submit:ios
```

## 🔧 Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=sua_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica

# RapiDoc
RAPIDOC_BASE_URL=https://api.rapidoc.com
RAPIDOC_CLIENT_ID=seu_client_id
RAPIDOC_TOKEN=seu_token

# Asaas
ASAAS_API_KEY=sua_chave_asaas

# Resend
RESEND_API_KEY=sua_chave_resend
```

### Configuração do Supabase
1. Criar projeto no [Supabase](https://supabase.com)
2. Executar migrations em `supabase/migrations/`
3. Configurar Row Level Security (RLS)
4. Adicionar chaves ao `.env`

### Configuração do RapiDoc
1. Obter credenciais da API RapiDoc
2. Configurar endpoints em `config/rapidoc.config.ts`
3. Testar conectividade

## 📋 Scripts Disponíveis

### Desenvolvimento
- `npm start` - Inicia servidor Expo
- `npm run dev` - Modo development client
- `npm run web` - Executa no browser

### Testes
- `npm test` - Executa testes unitários
- `npm run test:watch` - Testes em modo watch
- `npm run typecheck` - Verificação de tipos

### Build e Deploy
- `npm run build:all` - Build para todas plataformas
- `npm run submit:android` - Deploy Android
- `npm run submit:ios` - Deploy iOS
- `npm run update` - Over-the-air update

### Qualidade
- `npm run lint` - Análise de código
- `npm run typecheck` - Verificação TypeScript

## 🔐 Segurança

### Autenticação
- **PKCE Flow** para segurança OAuth
- **JWT Tokens** com refresh automático
- **Secure Storage** para tokens sensíveis

### Proteção de Dados
- **Row Level Security** no Supabase
- **Criptografia** de dados sensíveis
- **Auditoria** de eventos críticos

### APIs
- **Rate Limiting** para prevenir abuso
- **HTTPS** obrigatório para todas comunicações
- **Validação** de entrada em todos endpoints

## 📊 Monitoramento

### Health Checks
- Verificação automática de integrações
- Status das APIs em tempo real
- Alertas de degradação de serviço

### Logging
- **Structured Logging** com contexto
- **Error Tracking** com stack traces
- **Performance Monitoring** de APIs

### Analytics
- Eventos de usuário
- Métricas de performance
- Relatórios de uso

## 🤝 Contribuição

### Padrões de Código
- **TypeScript** obrigatório
- **ESLint** para qualidade de código
- **Prettier** para formatação
- **Conventional Commits** para mensagens

### Processo de Desenvolvimento
1. Fork do repositório
2. Criar branch: `feature/nova-funcionalidade`
3. Implementar com testes
4. Executar `npm run typecheck` e `npm run lint`
5. Criar Pull Request

### Issues e Bugs
- Usar templates de issue
- Incluir logs e steps to reproduce
- Testar em múltiplas plataformas

## 📄 Licença

Este projeto é propriedade da **AiLun Saúde** e está licenciado sob termos proprietários.

Para uso comercial, entre em contato: contato@ailun.com.br

## 📞 Suporte

### Documentação
- [Guia de Desenvolvimento](./docs/development.md)
- [API Reference](./docs/api.md)
- [Troubleshooting](./docs/troubleshooting.md)

### Contato
- **Email**: dev@ailun.com.br
- **Suporte**: suporte@ailun.com.br
- **Website**: https://ailun.com.br

---

**Desenvolvido com ❤️ pela equipe AiLun Saúde**