# 🔑 Como Gerar Token Expo Correto

## ⚠️ Problema com os Tokens Fornecidos

Os tokens que você forneceu retornaram erro "Forbidden":
- Token 1: `wwcgj61cj52lh3Yh2hjg82YeJIuotg2hYL_DoXSe` ❌
- Token 2: `x038X2mm3Yxm-eqZelQZHjZy1NqVjK3NeT-CsgNn` ❌

**Possíveis causas:**
- Tokens expirados
- Permissões insuficientes
- Escopo limitado (read-only)

---

## ✅ SOLUÇÃO RECOMENDADA: Login Direto

Em vez de usar token, use o método de login direto (mais simples e seguro):

### Abra seu terminal e execute:

```bash
cd /caminho/para/Ailun-Sa-de

# Login direto no Expo
eas login

# Quando solicitado:
Email: thales@ailun.com.br
Senha: @Telemed123

# Verificar autenticação
eas whoami
# Deve mostrar: thales-andrades

# Iniciar build
eas build --platform ios --profile production
```

**Pronto!** Este é o método mais confiável.

---

## 🔑 Se Preferir Gerar Novo Token

Se ainda assim você quiser usar token, siga estes passos:

### Passo 1: Acessar Configurações

1. Abra: https://expo.dev/accounts/thales-andrades/settings/access-tokens
2. Faça login com:
   - Email: `thales@ailun.com.br`
   - Senha: `@Telemed123`

### Passo 2: Criar Novo Token

3. Clique em **"Create Token"** ou **"New Access Token"**
4. Preencha:
   - **Nome:** "EAS Build Token" (ou qualquer nome descritivo)
   - **Permissions:** Selecione **"All permissions"** ou:
     - ✅ Read and write builds
     - ✅ Read and write projects
     - ✅ Submit to stores
5. Clique em **"Create Token"**

### Passo 3: Copiar Token

6. **Copie o token imediatamente** (ele só é mostrado uma vez!)
7. Salve em local seguro

### Passo 4: Usar Token

```bash
# Método 1: Variável de ambiente
export EXPO_TOKEN="seu-novo-token-aqui"
eas whoami

# Se funcionar, inicie o build
eas build --platform ios --profile production
```

```bash
# Método 2: Arquivo .expo/token
mkdir -p ~/.expo
echo "seu-novo-token-aqui" > ~/.expo/token
eas whoami
```

---

## 🚀 MÉTODO MAIS RÁPIDO: Script Local

Use o script que criei para você:

```bash
cd /caminho/para/Ailun-Sa-de
./deploy-to-testflight.sh
```

O script vai:
1. Verificar se EAS CLI está instalado
2. Verificar autenticação (e pedir login se necessário)
3. Iniciar build automaticamente

---

## 🔍 Verificar Se Token Funcionou

Teste o token:

```bash
export EXPO_TOKEN="seu-token"
eas whoami
```

**Resultado esperado:**
```
thales-andrades
```

**Se der erro:**
- "Forbidden" = Token sem permissões ou inválido
- "Unauthorized" = Token expirado
- "Invalid token" = Token malformado

---

## 💡 Dica: Por Que Login Direto é Melhor?

| Método | Vantagens | Desvantagens |
|--------|-----------|--------------|
| **Login direto** | ✅ Sempre funciona<br>✅ Sessão persistente<br>✅ Mais simples | ❌ Precisa digitar senha |
| **Token** | ✅ Automação<br>✅ CI/CD | ❌ Pode expirar<br>❌ Precisa gerar<br>❌ Pode ter problemas de permissão |

Para uso manual (como agora), **login direto é recomendado**.

---

## 🎯 RESUMO: O Que Fazer Agora

### Opção 1 (MAIS SIMPLES): Login Direto
```bash
eas login
# Email: thales@ailun.com.br
# Senha: @Telemed123

eas build --platform ios --profile production
```

### Opção 2: Usar Script
```bash
./deploy-to-testflight.sh
```

### Opção 3: Gerar Novo Token
1. Acesse: https://expo.dev/accounts/thales-andrades/settings/access-tokens
2. Create Token → All permissions
3. Copie e use com `export EXPO_TOKEN="..."`

---

**✅ RECOMENDAÇÃO:** Use a **Opção 1 (Login Direto)** - é mais rápida e confiável! 🚀

---

**Próximo passo:** Execute um dos comandos acima no seu terminal local.
