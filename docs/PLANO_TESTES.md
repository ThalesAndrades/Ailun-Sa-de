# Plano de Testes - AiLun Saúde

## Data: Outubro 2025

## Objetivo
Validar todas as funcionalidades críticas após auditoria e melhorias de segurança.

---

## 1. Testes de Fluxo de Novos Usuários

### 1.1 Cadastro - "Quero ser AiLun"

**Pré-requisitos**: Nenhum (usuário novo)

**Passos**:
1. Abrir app na tela de login
2. Clicar em "Quero ser Ailun"
3. Tela de boas-vindas deve aparecer
4. Preencher dados pessoais:
   - Nome completo
   - CPF (validar formato)
   - Email (validar formato)
   - Telefone (validar formato)
   - Data de nascimento
5. Clicar em "Continuar"
6. Preencher endereço:
   - CEP (testar busca automática)
   - Rua, número, complemento
   - Bairro, cidade, estado
7. Clicar em "Continuar"
8. Selecionar plano:
   - Clínico 24h (obrigatório) - R$ 29,90
   - + Especialistas (opcional) - R$ 49,90
   - + Psicologia (opcional) - R$ 39,90
   - + Nutrição (opcional) - R$ 29,90
9. Selecionar número de membros (1-10)
10. Verificar cálculo dinâmico:
    - Preço base correto
    - Desconto aplicado corretamente
    - Total calculado = (base - desconto) × membros
11. Escolher método de pagamento:
    - Cartão de crédito
    - PIX
    - Boleto
12. Aceitar termos de uso
13. Clicar em "Finalizar"
14. Aguardar processamento
15. Verificar criação:
    - Usuário no Supabase Auth
    - Perfil em user_profiles
    - Beneficiário na Rapidoc
    - Cliente no Asaas
    - Plano em subscription_plans

**Resultado Esperado**: 
- Cadastro concluído com sucesso
- Redirecionamento para guia da plataforma (onboarding)
- Todos os dados salvos corretamente

**Cenários de Teste**:

#### Teste 1.1.1: Plano Básico (Apenas Clínico)
- Serviços: Clínico
- Membros: 1
- Preço esperado: R$ 29,90
- Desconto: 0%

#### Teste 1.1.2: Plano Completo Individual
- Serviços: Clínico + Especialistas + Psicologia + Nutrição
- Membros: 1
- Preço base: R$ 148,70
- Desconto: 0%
- Total: R$ 148,70

#### Teste 1.1.3: Plano Família com Desconto
- Serviços: Clínico + Especialistas
- Membros: 4
- Preço base por pessoa: R$ 79,80
- Desconto: 15%
- Preço com desconto: R$ 67,83
- Total: R$ 271,32 (4 × 67,83)

#### Teste 1.1.4: Plano Família Grande
- Serviços: Completo
- Membros: 8
- Preço base: R$ 148,70
- Desconto: 20%
- Preço com desconto: R$ 118,96
- Total: R$ 951,68 (8 × 118,96)

### 1.2 Validações de Entrada

**Testes de CPF**:
- ✓ CPF válido: 123.456.789-09
- ✗ CPF inválido: 111.111.111-11
- ✗ CPF com formato errado: 12345678909
- ✗ CPF já cadastrado

**Testes de Email**:
- ✓ Email válido: usuario@exemplo.com
- ✗ Email inválido: usuario@
- ✗ Email já cadastrado

**Testes de Telefone**:
- ✓ Telefone válido: (11) 98765-4321
- ✗ Telefone inválido: 12345

**Testes de CEP**:
- ✓ CEP válido: 01310-100
- ✗ CEP inválido: 00000-000

---

## 2. Testes de Fluxo de Usuários Existentes

### 2.1 Login

**Pré-requisitos**: Usuário já cadastrado

**Passos**:
1. Abrir app na tela de login
2. Inserir CPF e senha
3. Clicar em "Entrar"
4. Sistema verifica:
   - Credenciais corretas
   - Plano ativo existe
   - Primeiro acesso ou não
5. Redirecionamento:
   - Se primeiro acesso → Guia da plataforma
   - Se não → Dashboard

**Resultado Esperado**: 
- Login bem-sucedido
- Redirecionamento correto baseado em estado do usuário

### 2.2 Dashboard - Usuário com Plano Ativo

**Pré-requisitos**: Usuário logado com plano ativo

**Passos**:
1. Dashboard deve exibir:
   - Nome do usuário
   - Status da assinatura (ativo)
   - Valor do plano
   - Próxima data de cobrança
   - Botões de serviços disponíveis
2. Verificar disponibilidade de serviços:
   - Médico Agora (sempre disponível com plano ativo)
   - Especialistas (se incluído no plano)
   - Psicologia (se incluído no plano)
   - Nutrição (se incluído no plano)
3. Clicar em serviço disponível
4. Sistema deve permitir acesso

**Resultado Esperado**: 
- Todos os serviços do plano estão acessíveis
- Serviços não incluídos mostram mensagem informativa

### 2.3 Dashboard - Usuário sem Plano Ativo

**Pré-requisitos**: Usuário logado sem plano ativo

**Passos**:
1. Tentar acessar dashboard
2. Sistema detecta falta de plano ativo
3. Redirecionamento automático para /subscription/inactive
4. Tela mostra:
   - Mensagem sobre plano inativo
   - Opções para assinar/renovar
   - Link para "Quero ser Ailun"

**Resultado Esperado**: 
- Usuário não pode acessar serviços
- Redirecionamento para tela de plano inativo
- Opção clara para ativar plano

---

## 3. Testes de Integração

### 3.1 Integração Rapidoc

**Teste**: Criar beneficiário
**Endpoint**: POST /beneficiario
**Dados**: CPF, nome, data de nascimento, email, telefone
**Verificar**: Beneficiário criado com UUID

**Teste**: Buscar beneficiário por CPF
**Endpoint**: GET /beneficiario/{cpf}
**Verificar**: Dados corretos retornados

### 3.2 Integração Asaas

**Teste**: Criar cliente
**Endpoint**: POST /customers
**Dados**: Nome, email, CPF, telefone, endereço
**Verificar**: Cliente criado com ID

**Teste**: Criar assinatura
**Endpoint**: POST /subscriptions
**Dados**: Cliente, valor dinâmico, ciclo mensal
**Verificar**: Assinatura criada, valor correto

**Teste**: Gerar PIX
**Endpoint**: POST /payments (PIX)
**Verificar**: QR Code gerado, payload correto

**Teste**: Gerar Boleto
**Endpoint**: POST /payments (Boleto)
**Verificar**: URL do boleto gerada

### 3.3 Integração Supabase

**Teste**: Criar usuário
**Tabela**: auth.users
**Verificar**: Usuário criado, email correto

**Teste**: Criar perfil
**Tabela**: user_profiles
**Verificar**: Perfil vinculado a usuário e beneficiário

**Teste**: Criar plano
**Tabela**: subscription_plans
**Verificar**: Plano com preço dinâmico correto

**Teste**: Registrar auditoria
**Tabela**: audit_logs
**Verificar**: Eventos registrados

---

## 4. Testes de Segurança

### 4.1 Variáveis de Ambiente

**Teste**: ASAAS_API_KEY não configurada
**Ação**: Tentar criar cliente
**Resultado Esperado**: Erro claro indicando falta de configuração

**Teste**: SUPABASE_URL não configurada
**Ação**: Tentar autenticar
**Resultado Esperado**: Erro claro

### 4.2 Validação de Dados

**Teste**: SQL Injection em CPF
**Input**: `' OR '1'='1`
**Resultado Esperado**: Entrada rejeitada

**Teste**: XSS em nome
**Input**: `<script>alert('xss')</script>`
**Resultado Esperado**: Script não executado, caracteres escapados

### 4.3 Autenticação e Autorização

**Teste**: Acessar dashboard sem login
**Resultado Esperado**: Redirecionamento para login

**Teste**: Acessar serviço não incluído no plano
**Resultado Esperado**: Mensagem informativa, acesso negado

---

## 5. Testes de Performance

### 5.1 Tempo de Resposta

**Operação**: Cadastro completo
**Tempo Esperado**: < 5 segundos

**Operação**: Login
**Tempo Esperado**: < 2 segundos

**Operação**: Cálculo de plano
**Tempo Esperado**: < 100ms

### 5.2 Carga

**Teste**: 10 cadastros simultâneos
**Resultado Esperado**: Todos bem-sucedidos

**Teste**: 50 logins simultâneos
**Resultado Esperado**: Todos bem-sucedidos

---

## 6. Testes de UI/UX

### 6.1 Responsividade

**Teste**: iPhone 12 (390×844)
**Resultado Esperado**: Interface funcional e legível

**Teste**: iPad (768×1024)
**Resultado Esperado**: Interface funcional e legível

**Teste**: Web (Desktop)
**Resultado Esperado**: Interface funcional e legível

### 6.2 Acessibilidade

**Teste**: Navegação por teclado
**Resultado Esperado**: Todos os campos acessíveis

**Teste**: Leitores de tela
**Resultado Esperado**: Conteúdo lido corretamente

---

## 7. Checklist de Validação Final

Antes do lançamento:

- [ ] Todos os testes de fluxo de novos usuários passaram
- [ ] Todos os testes de fluxo de usuários existentes passaram
- [ ] Todas as integrações validadas
- [ ] Testes de segurança aprovados
- [ ] Performance dentro dos limites aceitáveis
- [ ] UI/UX testada em diferentes dispositivos
- [ ] Variáveis de ambiente configuradas em produção
- [ ] Backup do banco configurado
- [ ] Monitoramento de erros ativo
- [ ] Documentação atualizada
- [ ] Logs de auditoria funcionando
- [ ] Cálculo dinâmico de preços validado
- [ ] Métodos de pagamento testados (cartão, PIX, boleto)
- [ ] Webhooks do Asaas configurados
- [ ] SSL/TLS ativo em todas as conexões

---

## 8. Relatório de Bugs

| ID | Descrição | Severidade | Status | Responsável |
|----|-----------|------------|--------|-------------|
| - | - | - | - | - |

**Severidades**:
- **Crítica**: Impede uso do sistema
- **Alta**: Funcionalidade principal afetada
- **Média**: Funcionalidade secundária afetada
- **Baixa**: Problema cosmético

---

## Execução dos Testes

**Data de Início**: _____/_____/_____
**Data de Conclusão**: _____/_____/_____
**Responsável**: _____________________
**Ambiente**: □ Desenvolvimento □ Staging □ Produção

**Observações**:
_________________________________________________
_________________________________________________
_________________________________________________
