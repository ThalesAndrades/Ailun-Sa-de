# Solução Definitiva: Erro "Invalid UUID appId"

## Problema
```
Project already linked (ID: ailun-saude-production)
Invalid UUID appId
```

O cache local do EAS ainda está usando uma configuração antiga com projectId inválido, mesmo depois de removermos dos arquivos de configuração.

## ✅ Solução Completa

### Opção 1: Limpar Cache (Recomendado)

#### No Mac/Linux:
```bash
# Dar permissão de execução ao script
chmod +x scripts/clear-eas-cache.sh

# Executar o script
./scripts/clear-eas-cache.sh
```

#### No Windows:
```bash
# Executar o script
scripts\clear-eas-cache.bat
```

#### Manualmente:
```bash
# 1. Limpar cache do Expo
rm -rf .expo
rm -rf .eas
rm -rf node_modules/.cache

# 2. Limpar node_modules
rm -rf node_modules
rm -f package-lock.json

# 3. Reinstalar
npm install

# 4. Limpar build cache
npx expo start --clear
```

### Opção 2: Reconfigurar EAS (Se Opção 1 não funcionar)

```bash
# 1. Login no EAS
eas login

# 2. Reconfigurar projeto (forçar)
eas init --force

# 3. Quando perguntado, selecione "Create a new project"
# 4. O EAS criará automaticamente um UUID válido
```

### Opção 3: Usar Build no OnSpace AI (Mais Fácil)

1. **No OnSpace AI**, as configurações são gerenciadas automaticamente
2. O build será feito no servidor sem problemas de cache local
3. Aguarde o build completar na interface do OnSpace

## Após Limpar o Cache

### Testar localmente:
```bash
# Iniciar o projeto para verificar
npx expo start --clear

# Se tudo funcionar, tente o build
eas build --platform ios --profile development
```

## Verificar Configurações

### Arquivo app.json - DEVE SER assim:
```json
{
  "expo": {
    "name": "Ailun Saúde",
    "slug": "ailun-saude-app",
    "extra": {
      "router": {
        "origin": false
      }
      // ❌ NÃO deve ter "eas" aqui
      // ❌ NÃO deve ter "projectId" aqui
    }
  }
}
```

### Arquivo app.config.js - DEVE SER assim:
```javascript
module.exports = {
  expo: {
    extra: {
      router: {
        origin: false
      }
      // ❌ NÃO deve ter "eas" aqui
      // ❌ NÃO deve ter "projectId" aqui
    }
  }
};
```

## Entendendo o Problema

### O que estava errado:
```json
// ❌ ERRADO - não é um UUID válido
"extra": {
  "eas": {
    "projectId": "ailun-saude-production"  // Texto, não UUID
  }
}
```

### O que o EAS espera:
```json
// ✅ CORRETO - formato UUID válido
"extra": {
  "eas": {
    "projectId": "12345678-1234-1234-1234-123456789abc"
  }
}
```

### A melhor solução:
```json
// ✅ MELHOR - deixar vazio, EAS cria automaticamente
"extra": {
  "router": {
    "origin": false
  }
  // Sem "eas" ou "projectId"
}
```

## Troubleshooting

### Se ainda der erro após limpar cache:

1. **Verificar se está logado:**
```bash
eas whoami
```

2. **Fazer logout e login novamente:**
```bash
eas logout
eas login
```

3. **Listar projetos existentes:**
```bash
eas project:list
```

4. **Desvincular projeto atual (se necessário):**
```bash
eas project:unlink
```

5. **Vincular a um novo projeto:**
```bash
eas project:init --force
```

### Se erro persistir no OnSpace AI:

O OnSpace AI gerencia o build automaticamente. Se o erro continuar:
1. As mudanças nos arquivos já foram aplicadas ✅
2. O cache do OnSpace será limpo automaticamente
3. O próximo build deve funcionar
4. **Aguarde alguns minutos** para o sistema reprocessar

## Comandos Úteis

```bash
# Ver builds recentes
eas build:list

# Ver detalhes de um build
eas build:view [BUILD_ID]

# Ver logs de um build
eas build:logs [BUILD_ID]

# Cancelar build em andamento
eas build:cancel

# Ver status do projeto
eas project:info
```

## Build Profiles Disponíveis

```bash
# Development (para testar localmente)
eas build --platform ios --profile development

# Preview (para testes internos)
eas build --platform ios --profile preview

# Production (para App Store)
eas build --platform ios --profile production
```

## Resultado Esperado

Após executar a solução:

✅ Cache limpo  
✅ EAS criará automaticamente um UUID válido  
✅ Build iniciará sem erros  
✅ Arquivo .eas/eas.json será criado com configuração correta  

---

**Última atualização**: 20/10/2025  
**Status**: ✅ Solução completa documentada

**Resumo**: O problema é cache local. Execute o script de limpeza ou aguarde o OnSpace AI reprocessar automaticamente.
