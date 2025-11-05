# Guia de Configuração - Modo Demo para Revisão nas Lojas

## 📱 Sobre o Modo Demo

O **Modo Demo** foi configurado especificamente para facilitar a revisão do aplicativo **Ailun Saúde** nas lojas (Apple App Store e Google Play Store). Este modo permite que os revisores testem todas as funcionalidades do app sem necessidade de cadastro real ou dados sensíveis.

---

## 🎯 Objetivos do Modo Demo

1. **Facilitar a revisão**: Credenciais pré-configuradas para acesso imediato
2. **Demonstrar funcionalidades**: Dados mock realistas que mostram todas as features
3. **Segurança**: Nenhum dado real de pacientes ou profissionais é exposto
4. **Compliance**: Atende aos requisitos de revisão da Apple e Google

---

## 🔧 Configuração do Modo Demo

### 1. Ativar o Modo Demo

Para ativar o modo demo, copie o arquivo de configuração:

```bash
cp .env.demo .env
```

Ou configure manualmente no arquivo `.env`:

```env
EXPO_PUBLIC_APP_ENV=demo
EXPO_PUBLIC_DEMO_MODE=true
EXPO_PUBLIC_SHOW_DEMO_BANNER=true
```

### 2. Credenciais de Acesso para Revisores

**Email**: `demo@ailun.com.br`  
**Senha**: `Demo@2025`

> ⚠️ **Importante**: Estas credenciais devem ser fornecidas no campo "Sign-In Information" do App Store Connect e Google Play Console.

### 3. Dados Mock Disponíveis

O modo demo inclui dados fictícios completos:

- ✅ **Perfil de usuário** completo com informações de saúde
- ✅ **3 consultas agendadas** (passadas, presentes e futuras)
- ✅ **5 profissionais disponíveis** (médicos, psicólogos, nutricionistas)
- ✅ **Assinatura ativa** do Plano Família
- ✅ **Notificações** de lembretes e confirmações
- ✅ **Documentos médicos** (exames e receitas)

---

## 📋 Funcionalidades Demonstráveis

### ✅ Autenticação
- Login com credenciais demo
- Autenticação biométrica (Face ID/Touch ID)
- Logout seguro

### ✅ Dashboard
- Visão geral de consultas agendadas
- Acesso rápido às funcionalidades principais
- Notificações em tempo real

### ✅ Agendamento de Consultas
- Busca de profissionais por especialidade
- Visualização de perfis de médicos
- Agendamento de teleconsultas
- Consultas imediatas (clínico geral)

### ✅ Teleconsulta
- Interface de videochamada (simulada em demo)
- Controles de áudio e vídeo
- Chat durante a consulta
- Finalização e avaliação

### ✅ Perfil do Usuário
- Edição de dados pessoais
- Informações de saúde
- Contatos de emergência
- Upload de documentos médicos

### ✅ Assinaturas
- Visualização do plano ativo
- Histórico de pagamentos
- Opções de upgrade/downgrade

### ✅ Notificações
- Lembretes de consultas
- Confirmações de agendamento
- Mensagens do sistema

---

## 🏗️ Estrutura de Arquivos do Modo Demo

```
Ailun-Sa-de/
├── .env.demo                    # Configurações do modo demo
├── DEMO_MODE_GUIDE.md          # Este guia
├── DEMO_SUBMISSION_CHECKLIST.md # Checklist para submissão
├── data/
│   └── demoData.ts             # Dados mock para demonstração
└── services/
    └── demoService.ts          # Serviço para gerenciar modo demo
```

---

## 🚀 Build para Submissão

### iOS (Apple App Store)

```bash
# 1. Ativar modo demo
cp .env.demo .env

# 2. Build de produção com EAS
npx eas-cli build --platform ios --profile production

# 3. Submeter para App Store
npx eas-cli submit --platform ios --profile production
```

### Android (Google Play Store)

```bash
# 1. Ativar modo demo
cp .env.demo .env

# 2. Build de produção com EAS
npx eas-cli build --platform android --profile production

# 3. Submeter para Google Play
npx eas-cli submit --platform android --profile production
```

---

## 📝 Informações para App Store Connect

### Sign-In Information

Ao submeter para a Apple, preencha o campo **"Sign-in required"** com:

**Username**: `demo@ailun.com.br`  
**Password**: `Demo@2025`

**Notes**:
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

---

## 📝 Informações para Google Play Console

### Instruções de Teste

```
CREDENCIAIS DE ACESSO:
Email: demo@ailun.com.br
Senha: Demo@2025

FUNCIONALIDADES PARA TESTAR:

1. AUTENTICAÇÃO
   - Faça login com as credenciais acima
   - Teste a autenticação biométrica (se disponível)

2. DASHBOARD
   - Visualize as consultas agendadas
   - Navegue pelas diferentes seções do app

3. AGENDAMENTO
   - Toque em "Agendar Consulta"
   - Escolha uma especialidade (ex: Cardiologista)
   - Selecione um profissional
   - Agende uma teleconsulta

4. PERFIL
   - Acesse o perfil do usuário
   - Visualize informações de saúde
   - Veja documentos médicos

5. ASSINATURA
   - Acesse a seção de assinaturas
   - Visualize o plano ativo (Plano Família)

OBSERVAÇÕES:
- Todos os dados são fictícios
- As teleconsultas são simuladas em modo demo
- Nenhuma transação financeira real será processada
```

---

## ⚠️ Importante para Revisores

### Permissões Solicitadas

O aplicativo solicita as seguintes permissões:

1. **Câmera**: Para teleconsultas por vídeo
2. **Microfone**: Para áudio durante teleconsultas
3. **Notificações**: Para lembretes de consultas
4. **Biometria**: Para login rápido e seguro
5. **Calendário**: Para adicionar consultas ao calendário
6. **Contatos**: Para facilitar compartilhamento (opcional)

### Política de Privacidade

URL: https://souailun.info/PrivacyPolicy

### Suporte

- **Website**: https://ailun.com.br
- **Email**: thales@ailun.com.br
- **Telefone**: +55 11 99999-9999

---

## 🔄 Desativar Modo Demo (Após Aprovação)

Após a aprovação nas lojas, para desativar o modo demo:

```bash
# 1. Restaurar configurações de produção
cp .env.production .env

# 2. Ou editar manualmente
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_DEMO_MODE=false
EXPO_PUBLIC_SHOW_DEMO_BANNER=false

# 3. Rebuild e resubmit
npx eas-cli build --platform all --profile production
```

---

## 📊 Monitoramento

Durante o período de revisão, monitore:

- ✅ Logs de acesso com credenciais demo
- ✅ Erros ou crashes reportados
- ✅ Tempo de resposta das APIs
- ✅ Status de build no EAS

---

## 🆘 Troubleshooting

### Problema: Credenciais não funcionam

**Solução**: Verifique se o modo demo está ativado no `.env`:
```bash
grep DEMO_MODE .env
# Deve retornar: EXPO_PUBLIC_DEMO_MODE=true
```

### Problema: Dados não aparecem

**Solução**: Verifique se o arquivo `data/demoData.ts` existe e está sendo importado corretamente.

### Problema: Build falha

**Solução**: Limpe o cache e reconstrua:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

---

## 📞 Suporte

Para dúvidas sobre o modo demo ou processo de submissão:

**Email**: thales@ailun.com.br  
**GitHub**: https://github.com/ThalesAndrades/Ailun-Sa-de

---

**Última atualização**: 04 de novembro de 2025  
**Versão do guia**: 1.0  
**Versão do app**: 1.2.3 (Build 25)
