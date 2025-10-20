# 🔧 Troubleshooting: Builds Falhando no iOS

## 🚨 Situação Atual

**Status**: Builds falhando consecutivamente  
**Data**: 20/10/2025  
**Erro Observado**: "EAS Submit is experiencing a partial outage"

## 📊 Análise dos Problemas

### 1. ⚠️ Partial Outage do EAS Submit
```
EAS Submit is experiencing a partial outage.
Reason: Increased iOS submission times.
```

**Causa**: Problema nos servidores do Expo  
**Impacto**: Submissões automáticas para App Store estão lentas/falhando  
**Status**: Verificar em https://status.expo.dev/

### 2. ✅ Configurações do App - OK
- ✅ Project ID configurado corretamente
- ✅ Owner "onspace" configurado
- ✅ Bundle identifier válido
- ✅ Variáveis de ambiente configuradas
- ✅ Permissões iOS corretas

### 3. ❓ Possíveis Causas Adicionais

#### A. Credenciais da Apple Não Configuradas
**Sintomas**: Build falha ao tentar submeter
**Solução**: Configure credenciais via:
```bash
eas credentials
```

#### B. Certificados iOS Ausentes
**Sintomas**: Build falha na fase de assinatura
**Solução**: Deixe o EAS gerenciar automaticamente

#### C. App Store Connect - Configuração Incompleta
**Sintomas**: Submission falha
**Verificar**:
- App criado no App Store Connect? ✅ (visto na imagem)
- Bundle ID corresponde? ✅ `com.ailun.saude`
- Status "Preparar para envio"? ✅

## 🎯 Soluções

### Solução 1: Build Sem Auto-Submit (RECOMENDADO)

Faça o build **sem tentar submeter automaticamente**:

```bash
# Via OnSpace AI - use o comando:
eas build --platform ios --profile production --no-wait

# OU use o perfil preview para testar:
eas build --platform ios --profile preview
```

**Vantagens**:
- Não depende do EAS Submit
- Você recebe o arquivo .ipa
- Pode submeter manualmente depois

### Solução 2: Aguardar Resolução do Outage

1. Verificar status: https://status.expo.dev/
2. Aguardar resolução do problema
3. Tentar novamente quando normalizar

### Solução 3: Build Local com Credenciais

Se urgente, faça build localmente:

```bash
# 1. Configure credenciais
eas credentials

# 2. Escolha "iOS" > "Set up Push Notifications"
# 3. Escolha "iOS" > "Set up provisioning profile"

# 3. Build
eas build --platform ios --profile production --local
```

## 📝 Checklist de Diagnóstico

Execute este checklist antes de fazer novo build:

### Verificações Pré-Build
- [ ] Status do Expo está OK? (https://status.expo.dev/)
- [ ] Project ID está correto no app.json?
- [ ] Variáveis de ambiente no eas.json?
- [ ] Bundle identifier único?
- [ ] Build number incrementado?

### Verificações Apple
- [ ] App criado no App Store Connect?
- [ ] Bundle ID corresponde?
- [ ] Credenciais configuradas no EAS?
- [ ] Certificados válidos?

### Após Build Falhar
- [ ] Ver logs completos: `eas build:list`
- [ ] Identificar fase do erro (dependencies/build/submit)
- [ ] Verificar mensagens de erro específicas

## 🔍 Comandos Úteis

### Ver Builds Recentes
```bash
eas build:list --platform ios --limit 10
```

### Ver Detalhes de um Build Específico
```bash
eas build:view <build-id>
```

### Ver Status do Projeto
```bash
eas project:info
```

### Cancelar Build em Andamento
```bash
eas build:cancel
```

## 📈 Próximos Passos Recomendados

### Passo 1: Fazer Build Simples (Sem Submit)
```bash
eas build --platform ios --profile production
```

### Passo 2: Se Build Passar - Submeter Manualmente
```bash
eas submit --platform ios --latest
```

### Passo 3: Se Build Falhar - Analisar Logs
```bash
eas build:list
# Clicar no build falhado para ver logs completos
```

## ⚡ Configuração Atualizada

O `eas.json` foi atualizado para:
- ✅ Remover `--auto-submit` do profile production
- ✅ Manter `autoIncrement` para versão automática
- ✅ `resourceClass: large` para builds mais rápidos
- ✅ Variáveis de ambiente configuradas

## 🎯 Resultado Esperado

Após essas correções:
1. ✅ Build deve **completar com sucesso**
2. ✅ Arquivo .ipa será gerado
3. ✅ Você pode baixar e testar
4. ✅ Submissão manual quando quiser

## 📞 Suporte

Se os builds continuarem falhando:
1. **Verifique logs completos** do build falhado
2. **Tire screenshot** da mensagem de erro específica
3. **Verifique status** do Expo: https://status.expo.dev/
4. **Teste com profile preview** primeiro

---

**Última Atualização**: 20/10/2025  
**Status**: Configuração otimizada - pronta para novo build  
**Recomendação**: Fazer build sem auto-submit primeiro
