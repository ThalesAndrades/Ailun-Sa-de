# Guia de Instalação - Melhorias AiLun Saúde

## Visão Geral

Este guia detalha o processo de instalação e configuração das melhorias implementadas na plataforma AiLun Saúde, incluindo reconhecimento de beneficiários, consultas médicas imediatas e WebView.

---

## 1. Pré-requisitos

Antes de iniciar, certifique-se de ter:

- **Node.js**: versão 18+ instalada
- **Expo CLI**: instalado globalmente
- **Acesso ao Supabase**: credenciais de administrador
- **Chave API Rapidoc**: fornecida pela Rapidoc
- **Git**: para controle de versão

---

## 2. Instalação de Dependências

### 2.1 Navegar até o diretório do projeto

```bash
cd Ailun-Sa-de
```

### 2.2 Instalar pacotes NPM necessários

```bash
# WebView para navegação interna
npm install react-native-webview

# Axios para chamadas HTTP
npm install axios

# Verificar se os pacotes Expo estão atualizados
npx expo install expo-linear-gradient @expo/vector-icons expo-router react-native-safe-area-context
```

### 2.3 Instalar permissões de câmera e microfone

```bash
npx expo install expo-camera expo-av
```

---

## 3. Configuração do Banco de Dados (Supabase)

### 3.1 Acessar o Supabase SQL Editor

1. Faça login no [Supabase](https://supabase.com)
2. Selecione seu projeto AiLun Saúde
3. Navegue até **SQL Editor** no menu lateral

### 3.2 Executar o Schema de Beneficiários e Planos

1. Abra o arquivo `supabase/schema_beneficiary_plans.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** para executar

**Tabelas criadas:**
- `beneficiaries`
- `subscription_plans`
- `plan_members`
- `consultation_history`

**Views criadas:**
- `v_user_plans`

**Funções criadas:**
- `get_active_plan()`
- `increment_service_usage()`
- `reset_psychology_limits()`
- `reset_nutrition_limits()`

### 3.3 Verificar a criação das tabelas

Execute no SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('beneficiaries', 'subscription_plans', 'plan_members', 'consultation_history');
```

Você deve ver as 4 tabelas listadas.

---

## 4. Configuração de Variáveis de Ambiente

### 4.1 Criar arquivo .env (se não existir)

Na raiz do projeto, crie ou edite o arquivo `.env`:

```bash
touch .env
```

### 4.2 Adicionar variáveis necessárias

Edite o arquivo `.env` e adicione:

```env
# Supabase (já existentes - verificar)
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui

# API Rapidoc (NOVO)
EXPO_PUBLIC_RAPIDOC_API_URL=https://api.rapidoc.tech
EXPO_PUBLIC_RAPIDOC_API_KEY=sua_chave_api_rapidoc_aqui

# Asaas (já existentes - verificar)
EXPO_PUBLIC_ASAAS_API_URL=https://sandbox.asaas.com/api/v3
EXPO_PUBLIC_ASAAS_API_KEY=sua_chave_asaas_aqui
```

**Importante**: Substitua os valores de exemplo pelas suas credenciais reais.

### 4.3 Verificar o arquivo .gitignore

Certifique-se de que `.env` está no `.gitignore`:

```bash
echo ".env" >> .gitignore
```

---

## 5. Configuração de Permissões

### 5.1 Editar app.json

Abra o arquivo `app.json` e adicione as configurações de permissões:

```json
{
  "expo": {
    "name": "AiLun Saúde",
    "slug": "ailun-saude",
    "version": "2.0.0",
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Permitir que $(PRODUCT_NAME) acesse sua câmera para videochamadas médicas"
        }
      ],
      [
        "expo-av",
        {
          "microphonePermission": "Permitir que $(PRODUCT_NAME) acesse seu microfone para videochamadas médicas"
        }
      ]
    ],
    "ios": {
      "bundleIdentifier": "com.ailun.saude",
      "infoPlist": {
        "NSCameraUsageDescription": "Precisamos acessar sua câmera para realizar videochamadas com médicos",
        "NSMicrophoneUsageDescription": "Precisamos acessar seu microfone para realizar videochamadas com médicos",
        "NSPhotoLibraryUsageDescription": "Permitir acesso à galeria para enviar exames e documentos"
      }
    },
    "android": {
      "package": "com.ailun.saude",
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "INTERNET",
        "ACCESS_NETWORK_STATE",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

---

## 6. Configuração de Rotas

### 6.1 Verificar estrutura de pastas

Certifique-se de que a estrutura de pastas está correta:

```
app/
├── consultation/
│   ├── request-immediate.tsx ✅
│   ├── pre-consultation.tsx ✅
│   └── webview.tsx ✅
├── signup/
│   ├── welcome.tsx
│   ├── personal-data.tsx
│   ├── contact.tsx
│   ├── address.tsx
│   ├── payment.tsx
│   └── confirmation.tsx
├── login.tsx
└── dashboard.tsx
```

### 6.2 Adicionar navegação no Dashboard

No arquivo `app/dashboard.tsx`, adicione um botão para acessar a consulta imediata:

```tsx
<TouchableOpacity
  style={styles.serviceCard}
  onPress={() => router.push('/consultation/request-immediate')}
>
  <MaterialIcons name="medical-services" size={32} color="#00B4DB" />
  <Text style={styles.serviceTitle}>Médico Imediato</Text>
  <Text style={styles.serviceDescription}>
    Consulte um médico agora
  </Text>
</TouchableOpacity>
```

---

## 7. Testes de Instalação

### 7.1 Limpar cache e reinstalar

```bash
# Limpar cache do Expo
npx expo start -c

# Ou limpar cache do npm
rm -rf node_modules
npm install
```

### 7.2 Executar o projeto

```bash
npx expo start
```

### 7.3 Testar em dispositivo/emulador

1. Escaneie o QR Code com Expo Go (iOS/Android)
2. Ou pressione `i` para iOS Simulator
3. Ou pressione `a` para Android Emulator

### 7.4 Verificar funcionalidades

- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Botão "Médico Imediato" aparece
- [ ] Tela de solicitação abre
- [ ] Dados do beneficiário carregam
- [ ] Formulário de sintomas funciona
- [ ] Tela de pré-consulta abre
- [ ] WebView carrega (teste com URL de exemplo)

---

## 8. Configuração da API Rapidoc

### 8.1 Obter credenciais

Entre em contato com a Rapidoc para obter:
- URL da API (produção ou sandbox)
- Chave de API (API Key)
- Documentação de endpoints

### 8.2 Configurar endpoints

Verifique se os endpoints no arquivo `services/rapidoc-consultation-service.ts` estão corretos:

```typescript
const RAPIDOC_API_BASE_URL = process.env.EXPO_PUBLIC_RAPIDOC_API_URL || 'https://api.rapidoc.tech';
```

### 8.3 Testar integração

Execute um teste de conexão:

```typescript
// No console do app ou em um arquivo de teste
import { getAvailableSpecialties } from './services/rapidoc-consultation-service';

getAvailableSpecialties().then(response => {
  console.log('Especialidades:', response);
});
```

---

## 9. Migração de Dados Existentes

### 9.1 Migrar beneficiários existentes

Se você já tem beneficiários cadastrados em outra tabela, execute:

```sql
-- Exemplo de migração (ajustar conforme sua estrutura)
INSERT INTO public.beneficiaries (
  user_id,
  beneficiary_uuid,
  cpf,
  full_name,
  birth_date,
  email,
  phone,
  service_type,
  is_primary,
  status
)
SELECT 
  user_id,
  uuid,
  cpf,
  name,
  birth_date,
  email,
  phone,
  'G', -- tipo de serviço padrão
  true,
  'active'
FROM public.old_beneficiaries_table;
```

### 9.2 Criar planos para beneficiários existentes

```sql
-- Exemplo de criação de planos padrão
INSERT INTO public.subscription_plans (
  user_id,
  beneficiary_id,
  plan_name,
  service_type,
  include_clinical,
  base_price,
  total_price,
  status
)
SELECT 
  b.user_id,
  b.id,
  'Plano Básico',
  'G',
  true,
  29.90,
  29.90,
  'active'
FROM public.beneficiaries b
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscription_plans sp 
  WHERE sp.beneficiary_id = b.id
);
```

---

## 10. Configuração de Cron Jobs (Opcional)

Para resetar limites de uso automaticamente:

### 10.1 Configurar no Supabase

1. Acesse **Database** > **Cron Jobs** no Supabase
2. Crie um novo job para resetar limites de psicologia (mensal):

```sql
-- Executar todo dia 1 às 00:00
SELECT cron.schedule(
  'reset-psychology-limits',
  '0 0 1 * *',
  $$SELECT reset_psychology_limits()$$
);
```

3. Crie um job para resetar limites de nutrição (trimestral):

```sql
-- Executar no dia 1 de jan, abr, jul, out às 00:00
SELECT cron.schedule(
  'reset-nutrition-limits',
  '0 0 1 1,4,7,10 *',
  $$SELECT reset_nutrition_limits()$$
);
```

---

## 11. Build para Produção

### 11.1 Build iOS

```bash
# Configurar credenciais
eas build:configure

# Build para iOS
eas build --platform ios
```

### 11.2 Build Android

```bash
# Build para Android
eas build --platform android
```

### 11.3 Submeter para lojas

```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

---

## 12. Monitoramento e Logs

### 12.1 Configurar Sentry (Opcional)

```bash
npm install @sentry/react-native

# Configurar
npx @sentry/wizard -i reactNative -p ios android
```

### 12.2 Logs do Supabase

Acesse **Logs** no Supabase para monitorar:
- Queries lentas
- Erros de RLS
- Uso de API

---

## 13. Troubleshooting

### Problema: WebView não carrega

**Solução:**
- Verificar se `react-native-webview` está instalado
- Limpar cache: `npx expo start -c`
- Verificar permissões de internet

### Problema: Erro ao buscar beneficiário

**Solução:**
- Verificar se o schema foi executado corretamente
- Verificar RLS policies no Supabase
- Verificar se o usuário está autenticado

### Problema: API Rapidoc retorna erro 401

**Solução:**
- Verificar se `EXPO_PUBLIC_RAPIDOC_API_KEY` está configurada
- Verificar se a chave é válida
- Verificar se a URL da API está correta

### Problema: Permissões de câmera/microfone negadas

**Solução:**
- Verificar `app.json` com as permissões
- Reconstruir o app: `npx expo prebuild --clean`
- Reinstalar no dispositivo

---

## 14. Checklist de Instalação

- [ ] Dependências instaladas
- [ ] Schema SQL executado no Supabase
- [ ] Variáveis de ambiente configuradas
- [ ] Permissões adicionadas ao app.json
- [ ] Rotas de consulta criadas
- [ ] Navegação no dashboard adicionada
- [ ] Testes de funcionalidade realizados
- [ ] API Rapidoc configurada
- [ ] Migração de dados (se necessário)
- [ ] Cron jobs configurados (opcional)
- [ ] Build de produção testado

---

## 15. Suporte

Para dúvidas ou problemas durante a instalação:

- **E-mail**: contato@ailun.com.br
- **Documentação**: `/docs`
- **Issues**: GitHub Issues (se aplicável)

---

**Última Atualização**: 14 de outubro de 2025  
**Versão**: 2.0.0  
**Desenvolvido por**: Manus AI

