# 🌐 Configuração DNS do Hostinger para Resend

**Domínio**: ailun.com.br  
**Objetivo**: Configurar registros DNS para envio de emails via Resend

---

## 📋 Registros DNS Necessários

### 1. SPF Record (Sender Policy Framework)

**Tipo**: `TXT`  
**Nome**: `@` (ou deixe em branco)  
**Valor**: `v=spf1 include:_spf.resend.com ~all`  
**TTL**: 3600 (ou padrão)

**O que faz**: Autoriza o Resend a enviar emails em nome do domínio ailun.com.br

---

### 2. DKIM Record (DomainKeys Identified Mail)

**Tipo**: `CNAME`  
**Nome**: `resend._domainkey`  
**Valor**: `resend._domainkey.u.resend.com`  
**TTL**: 3600 (ou padrão)

**O que faz**: Adiciona assinatura digital aos emails para verificar autenticidade

---

### 3. DMARC Record (Domain-based Message Authentication) - OPCIONAL

**Tipo**: `TXT`  
**Nome**: `_dmarc`  
**Valor**: `v=DMARC1; p=none; rua=mailto:thales@ailun.com.br`  
**TTL**: 3600 (ou padrão)

**O que faz**: Define política de autenticação e recebe relatórios de emails

---

## 🔧 Como Configurar no Hostinger

### Passo 1: Acessar o Hostinger

1. Acesse: https://hpanel.hostinger.com
2. **Email**: thalesandradees@gmail.com
3. **Senha**: @Telemed123

### Passo 2: Navegar para DNS

1. No painel, clique em **"Websites"** ou **"Domínios"**
2. Selecione o domínio **ailun.com.br**
3. Clique em **"DNS / Name Servers"** ou **"Gerenciar DNS"**

### Passo 3: Adicionar Registro SPF

1. Clique em **"Add Record"** ou **"Adicionar Registro"**
2. Selecione tipo: **TXT**
3. **Nome**: `@` (ou deixe em branco)
4. **Valor**: `v=spf1 include:_spf.resend.com ~all`
5. **TTL**: 3600
6. Clique em **"Save"** ou **"Salvar"**

### Passo 4: Adicionar Registro DKIM

1. Clique em **"Add Record"** ou **"Adicionar Registro"**
2. Selecione tipo: **CNAME**
3. **Nome**: `resend._domainkey`
4. **Valor**: `resend._domainkey.u.resend.com`
5. **TTL**: 3600
6. Clique em **"Save"** ou **"Salvar"**

### Passo 5: Adicionar Registro DMARC (Opcional)

1. Clique em **"Add Record"** ou **"Adicionar Registro"**
2. Selecione tipo: **TXT**
3. **Nome**: `_dmarc`
4. **Valor**: `v=DMARC1; p=none; rua=mailto:thales@ailun.com.br`
5. **TTL**: 3600
6. Clique em **"Save"** ou **"Salvar"**

---

## ⏱️ Tempo de Propagação

- **Mínimo**: 5-10 minutos
- **Máximo**: 48 horas
- **Típico**: 1-2 horas

**Dica**: Use https://dnschecker.org para verificar a propagação

---

## ✅ Verificar Configuração

### No Resend

1. Acesse: https://resend.com/domains
2. Clique em **"Add Domain"**
3. Digite: `ailun.com.br`
4. Aguarde verificação automática
5. Status deve mudar para **"Verified"** ✅

### Ferramentas Online

1. **MXToolbox**: https://mxtoolbox.com/SuperTool.aspx
   - Digite: `ailun.com.br`
   - Verifique SPF e DKIM

2. **DNSChecker**: https://dnschecker.org
   - Digite: `resend._domainkey.ailun.com.br`
   - Tipo: CNAME
   - Deve retornar: `resend._domainkey.u.resend.com`

---

## 📊 Tabela Resumo

| Tipo  | Nome                | Valor                                    | TTL  |
|-------|---------------------|------------------------------------------|------|
| TXT   | @                   | v=spf1 include:_spf.resend.com ~all      | 3600 |
| CNAME | resend._domainkey   | resend._domainkey.u.resend.com           | 3600 |
| TXT   | _dmarc              | v=DMARC1; p=none; rua=mailto:thales@ailun.com.br | 3600 |

---

## ⚠️ Atenção

### Registros SPF Existentes

Se já existe um registro SPF no domínio, você precisa **modificar** (não adicionar outro):

**Antes**:
```
v=spf1 include:_spf.google.com ~all
```

**Depois**:
```
v=spf1 include:_spf.google.com include:_spf.resend.com ~all
```

**Importante**: Só pode haver **1 registro SPF** por domínio!

---

## 🔍 Troubleshooting

### Problema: Domínio não verifica no Resend

**Solução**:
1. Aguarde 1-2 horas
2. Verifique se os registros estão corretos
3. Use https://dnschecker.org para confirmar propagação
4. Tente "Verify" novamente no Resend

### Problema: Emails indo para spam

**Solução**:
1. Configure DMARC
2. Aguarde 24-48h após configuração
3. Envie emails de teste
4. Peça aos destinatários para marcar como "Não é spam"

### Problema: Erro "SPF record already exists"

**Solução**:
1. Edite o registro SPF existente
2. Adicione `include:_spf.resend.com` antes do `~all`
3. Não crie um segundo registro SPF

---

## 🎯 Após Configuração

### 1. Atualizar Código

Edite `services/email.ts`:

```typescript
// Antes
const FROM_EMAIL = 'AiLun Saúde <onboarding@resend.dev>';

// Depois
const FROM_EMAIL = 'AiLun Saúde <noreply@ailun.com.br>';
```

### 2. Testar Envio

```bash
cd /home/ubuntu/Ailun-Sa-de
node scripts/test-email.js
```

### 3. Verificar Entrega

1. Envie email de teste
2. Verifique caixa de entrada
3. Verifique cabeçalhos do email
4. Confirme que SPF e DKIM passaram

---

## 📞 Suporte

**Hostinger Support**: https://www.hostinger.com.br/contato  
**Resend Documentation**: https://resend.com/docs/dashboard/domains/introduction

**AiLun Tecnologia**  
Email: thales@ailun.com.br

---

## ✅ Checklist

- [ ] Acessar Hostinger
- [ ] Navegar para DNS do ailun.com.br
- [ ] Adicionar registro SPF (TXT)
- [ ] Adicionar registro DKIM (CNAME)
- [ ] Adicionar registro DMARC (TXT) - opcional
- [ ] Aguardar propagação (1-2h)
- [ ] Verificar no Resend
- [ ] Atualizar `FROM_EMAIL` no código
- [ ] Testar envio de email
- [ ] Verificar entrega

---

**Status**: ⏳ Aguardando configuração manual no Hostinger

