# Welcome to Ailun Saúde

**Ailun Saúde** é uma plataforma de saúde digital que conecta pacientes com profissionais de saúde através de consultas online, gerenciamento de informações médicas e assinaturas de planos de saúde.

## 🏥 Sobre o Projeto

O aplicativo Ailun Saúde, construído com **React Native** e **Expo**, oferece uma experiência completa de cuidados com a saúde, integrando:

- 🩺 **Consultas médicas online** (clínico geral, especialistas, psicólogos, nutricionistas)
- 📋 **Gerenciamento de informações de saúde**
- 📞 **Contatos de emergência**
- 💳 **Assinaturas e pagamentos**
- 🔔 **Notificações em tempo real**
- 📊 **Histórico de consultas**

## 🚀 Tecnologias Principais

- **React Native**: 0.79.4
- **React**: 19.0.0
- **Expo**: ~53.0.12
- **Expo Router**: ~5.1.0
- **Supabase**: ^2.50.0 (Backend completo)
- **TypeScript**: ~5.8.3

## 📦 Estrutura do Projeto

```
Ailun-Sa-de/
├── app/                    # Telas e navegação (Expo Router)
│   ├── (tabs)/            # Navegação por abas
│   ├── onboarding/        # Fluxo de boas-vindas
│   ├── login.tsx          # Tela de login
│   └── dashboard.tsx      # Dashboard principal
├── services/              # Serviços e integrações
│   ├── supabase.ts       # Cliente Supabase e tipos
│   ├── auth.ts           # Autenticação
│   ├── database.ts       # Operações de banco de dados
│   ├── storage.ts        # Upload/download de arquivos
│   └── orchestrator.ts   # Orquestração de consultas
├── hooks/                 # React Hooks personalizados
│   └── useAuth.ts        # Hook de autenticação
├── supabase/             # Configuração do Supabase
│   ├── functions/        # Edge Functions
│   │   ├── orchestrator/ # Orquestração de consultas
│   │   ├── rapidoc/      # Integração RapiDoc
│   │   └── tema-orchestrator/ # Assinaturas Asaas
│   └── schema.sql        # Schema do banco de dados
├── docs/                  # Documentação
│   ├── SUPABASE_INTEGRATION.md  # Guia de uso do Supabase
│   ├── SUPABASE_SETUP.md        # Configuração do Dashboard
│   └── EDGE_FUNCTIONS.md        # Documentação das Edge Functions
├── scripts/              # Scripts utilitários
│   └── test-supabase.js  # Teste de conexão
└── constants/            # Constantes e configurações
```

## 🔧 Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone https://github.com/ThalesAndrades/Ailun-Sa-de.git
cd Ailun-Sa-de
```

### 2. Instalar Dependências

```bash
npm install
# ou
pnpm install
# ou
yarn install
```

### 3. Configurar Variáveis de Ambiente

O arquivo `.env` já está configurado com as credenciais do Supabase:

```env
EXPO_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Configurar o Supabase

Siga o guia completo em [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) para:

1. Criar as tabelas do banco de dados
2. Configurar buckets de Storage
3. Configurar Edge Functions
4. Configurar autenticação

**Atalho rápido:**
```bash
# 1. Acesse o SQL Editor no Supabase Dashboard
# 2. Execute o arquivo supabase/schema.sql
# 3. Crie os buckets: avatars e medical-documents
```

### 5. Testar a Integração

```bash
node scripts/test-supabase.js
```

Você deve ver:
```
✅ Autenticação: OK
✅ Banco de Dados: OK
✅ Storage: OK
```

## 🎯 Executar o Projeto

### Desenvolvimento

```bash
npm run start         # Iniciar servidor Expo
npm run android       # Abrir no Android
npm run ios           # Abrir no iOS
npm run web           # Abrir no navegador
```

### Limpar Cache

```bash
npm run reset-project
```

### Lint

```bash
npm run lint
```

## 🔐 Autenticação

### Exemplo de Login

```typescript
import { useAuth } from './hooks/useAuth';

function LoginScreen() {
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    const result = await signIn('usuario@email.com', 'senha123');
    if (result.success) {
      // Navegar para dashboard
    }
  };

  return (
    <Button title="Entrar" onPress={handleLogin} disabled={loading} />
  );
}
```

### Exemplo de Registro

```typescript
import { signUp } from './services/auth';

const result = await signUp('novo@email.com', 'senha123');
if (result.success) {
  console.log('Usuário criado!');
}
```

## 🏥 Consultas Médicas

### Iniciar Consulta

```typescript
import { startConsultation } from './services/orchestrator';

const result = await startConsultation('doctor');

if (result.success) {
  const { consultationUrl, professionalInfo } = result.data.session;
  console.log('URL da consulta:', consultationUrl);
  console.log('Profissional:', professionalInfo.name);
}
```

### Tipos de Consulta Disponíveis

- `'doctor'` - Clínico Geral
- `'specialist'` - Especialista (Cardiologia, Dermatologia, etc.)
- `'psychologist'` - Psicólogo
- `'nutritionist'` - Nutricionista

## 💳 Assinaturas

### Criar Assinatura

```typescript
import { createSubscription } from './services/orchestrator';

const result = await createSubscription({
  customerName: 'João Silva',
  customerEmail: 'joao@email.com',
  customerPhone: '11987654321',
  customerDocument: '12345678900',
});

if (result.success) {
  console.log('Valor: R$', result.data.value); // R$ 89,90/mês
  console.log('Boleto:', result.data.payment_url);
}
```

## 📱 Funcionalidades Principais

### 1. Perfil do Usuário

```typescript
import { getUserProfile, upsertUserProfile } from './services/database';

// Buscar perfil
const profile = await getUserProfile(userId);

// Atualizar perfil
await upsertUserProfile(userId, {
  full_name: 'João Silva',
  phone: '(11) 98765-4321',
  birth_date: '1990-01-15',
});
```

### 2. Informações de Saúde

```typescript
import { upsertHealthInfo } from './services/database';

await upsertHealthInfo(userId, {
  weight: 75,
  height: 175,
  blood_type: 'O+',
  allergies: 'Penicilina',
});
```

### 3. Upload de Documentos

```typescript
import { uploadMedicalDocument } from './services/storage';

const result = await uploadMedicalDocument(userId, fileUri, 'exame.pdf');
if (result.success) {
  console.log('Documento salvo:', result.path);
}
```

### 4. Notificações em Tempo Real

```typescript
import { supabase } from './services/supabase';

const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'system_notifications',
    filter: `user_id=eq.${userId}`,
  }, (payload) => {
    console.log('Nova notificação:', payload.new);
  })
  .subscribe();
```

## 📚 Documentação Completa

- **[Integração do Supabase](docs/SUPABASE_INTEGRATION.md)** - Guia completo de uso
- **[Configuração do Supabase](docs/SUPABASE_SETUP.md)** - Setup do Dashboard
- **[Edge Functions](docs/EDGE_FUNCTIONS.md)** - Documentação das funções
- **[README Supabase](SUPABASE_README.md)** - Resumo da integração

## 🛠️ Dependências Principais

### Core
- `@supabase/supabase-js` - Cliente Supabase
- `@react-native-async-storage/async-storage` - Armazenamento local
- `expo-router` - Navegação baseada em arquivos

### UI/UX
- `react-native-paper` - Componentes Material Design
- `@expo/vector-icons` - Ícones
- `lottie-react-native` - Animações
- `lucide-react-native` - Ícones modernos

### Mídia
- `expo-image-picker` - Seleção de imagens
- `expo-document-picker` - Seleção de documentos
- `expo-camera` - Acesso à câmera

### Comunicação
- `expo-notifications` - Notificações push
- `expo-location` - Geolocalização
- `@react-native-community/netinfo` - Status da rede

### Pagamentos
- `@stripe/stripe-react-native` - Integração Stripe (futuro)

## 🔒 Segurança

- ✅ **Row Level Security (RLS)** habilitado em todas as tabelas
- ✅ **Autenticação JWT** via Supabase Auth
- ✅ **Políticas de acesso** por usuário
- ✅ **Validação de dados** no backend (Edge Functions)
- ✅ **HTTPS** obrigatório para todas as requisições

## 🧪 Testes

```bash
# Testar conexão com Supabase
node scripts/test-supabase.js

# Executar testes (quando disponíveis)
npm test
```

## 🚀 Deploy

### Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Deploy de todas as funções
supabase functions deploy
```

### Aplicativo Mobile

```bash
# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é privado. Para colaboração, entre em contato com a AiLun Tecnologia.

## 📧 Contato

**Ailun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

---

## 🎉 Status do Projeto

- ✅ Autenticação implementada
- ✅ Banco de dados configurado
- ✅ Storage configurado
- ✅ Edge Functions implementadas
- ✅ Integração RapiDoc
- ✅ Integração Asaas
- 🚧 Interface do usuário (em desenvolvimento)
- 🚧 Testes automatizados (planejado)

---

**Desenvolvido com ❤️ pela equipe Ailun Tecnologia**

