# Melhorias de Segurança - AiLun Saúde

## Data: Outubro 2025

## Mudanças Implementadas

### 1. Remoção de Chaves API Hardcoded

**Problema**: Chaves de API do Asaas estavam hardcoded no código fonte como fallback.

**Solução**: 
- Criado arquivo de configuração centralizado: `config/asaas.config.ts`
- Todas as chaves agora vêm exclusivamente de variáveis de ambiente
- Sistema alerta quando chaves não estão configuradas

**Arquivos Atualizados**:
- `services/asaas.ts`
- `services/registration.ts`
- `config/asaas.config.ts` (novo)

### 2. Variáveis de Ambiente Necessárias

Para o sistema funcionar corretamente em produção, configure:

```bash
# Asaas (Gateway de Pagamento)
ASAAS_API_KEY=sua_chave_aqui
# ou
EXPO_PUBLIC_ASAAS_API_KEY=sua_chave_aqui

# Supabase (já configurado)
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# Rapidoc (Telemedicina)
RAPIDOC_API_KEY=...
RAPIDOC_BASE_URL=...
```

### 3. Cálculo Dinâmico de Preços

**Problema**: Valor fixo de R$ 89,90 estava hardcoded em múltiplos lugares.

**Solução**:
- Sistema agora usa `utils/plan-calculator.ts` para cálculo dinâmico
- Preços baseados em:
  - Serviços selecionados (Clínico, Especialistas, Psicologia, Nutrição)
  - Número de membros da família
  - Descontos progressivos por volume

**Preços Base**:
- Clínico 24h: R$ 29,90 (sempre incluído)
- Especialistas: R$ 49,90
- Psicologia: R$ 39,90
- Nutrição: R$ 29,90

**Descontos**:
- 1 pessoa: 0%
- 2-3 pessoas: 10%
- 4-6 pessoas: 15%
- 7-10 pessoas: 20%

### 4. Auditoria e Logs

Sistema implementa logs de auditoria para:
- Início de cadastro
- Cadastro concluído
- Falhas no cadastro
- Início de pagamento
- Pagamento concluído/falha
- Atribuição de plano

Todos os eventos críticos são registrados na tabela `audit_logs` do Supabase.

### 5. Tratamento de Erros

Implementado tratamento robusto de erros em:
- Integração com Asaas (pagamentos)
- Integração com Rapidoc (telemedicina)
- Criação de usuários e planos no Supabase
- Validação de dados de entrada

### 6. Validação de Dados

Validações implementadas para:
- CPF (formato e dígito verificador)
- Email (formato válido)
- Telefone (formato brasileiro)
- CEP (formato brasileiro)
- Dados de cartão de crédito (quando aplicável)

## Checklist de Segurança para Deploy

- [ ] Configurar todas as variáveis de ambiente em produção
- [ ] Remover/revogar chaves antigas se expostas
- [ ] Testar fluxo completo de cadastro em ambiente de staging
- [ ] Validar webhooks do Asaas
- [ ] Configurar rate limiting no Supabase
- [ ] Habilitar SSL/TLS em todas as conexões
- [ ] Revisar permissões do banco de dados
- [ ] Configurar backup automático do banco
- [ ] Implementar monitoramento de erros (ex: Sentry)

## Arquivos de Referência

### Principais Serviços
- `services/registration.ts` - Orquestração de cadastro
- `services/asaas.ts` - Integração de pagamento
- `services/beneficiary-service.ts` - Integração Rapidoc
- `services/subscription-plan-service.ts` - Gerenciamento de planos
- `services/audit-service.ts` - Sistema de auditoria

### Fluxo de Cadastro
- `app/signup/welcome.tsx` - Boas-vindas
- `app/signup/contact.tsx` - Dados de contato
- `app/signup/address.tsx` - Endereço
- `app/signup/payment.tsx` - Seleção de plano e pagamento
- `app/signup/confirmation.tsx` - Processamento

### Utilitários
- `utils/plan-calculator.ts` - Cálculo de preços
- `utils/validators.ts` - Validações
- `config/asaas.config.ts` - Configuração Asaas

## Próximas Melhorias Recomendadas

1. **Adicionar Rate Limiting**: Prevenir abuso de APIs
2. **Implementar CAPTCHA**: No formulário de cadastro
3. **2FA para Admin**: Autenticação de dois fatores para áreas administrativas
4. **Criptografia de Dados Sensíveis**: Dados pessoais no banco
5. **Logs de Acesso**: Registro de todas as ações de usuários
6. **Backup Automático**: Rotina diária de backup
7. **Disaster Recovery Plan**: Plano de recuperação de desastres
8. **Penetration Testing**: Testes de segurança periódicos

## Contato

Para questões de segurança, entre em contato com a equipe de desenvolvimento.
