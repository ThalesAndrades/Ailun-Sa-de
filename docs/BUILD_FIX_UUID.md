# Correção do Erro "Invalid UUID appId" - Build iOS

## Problema Identificado

**Erro**: `Invalid UUID appId`  
**Causa**: O `projectId` configurado em `app.json` e `app.config.js` não era um UUID válido.

```json
// ❌ Configuração INCORRETA
"eas": {
  "projectId": "ailun-saude-production"  // Não é um UUID válido
}
```

## Solução Aplicada

### 1. ✅ Removido projectId Inválido

Removido a configuração `extra.eas.projectId` dos arquivos:
- `app.json`
- `app.config.js`

Agora o EAS Build irá:
1. Criar automaticamente um projectId válido (UUID)
2. Ou vincular ao projeto existente na sua conta EAS

### 2. ✅ Otimizado eas.json

Adicionado `resourceClass` para melhor alocação de recursos:

```json
{
  "build": {
    "development": {
      "ios": {
        "resourceClass": "default"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "large"  // Mais memória para build de produção
      }
    }
  }
}
```

## Como Fazer Build Agora

### Opção 1: Build via OnSpace AI (Recomendado)
1. O OnSpace AI detectará automaticamente as mudanças
2. O build será reconstruído automaticamente
3. Aguarde a conclusão

### Opção 2: Build via EAS CLI (Local)

```bash
# 1. Instalar EAS CLI (se não tiver)
npm install -g eas-cli

# 2. Login no EAS
eas login

# 3. Configurar projeto (primeira vez)
eas build:configure

# 4. Build para iOS
eas build --platform ios --profile preview

# 5. Build para Android
eas build --platform android --profile preview
```

### Opção 3: Build de Produção

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## Perfis de Build Disponíveis

### Development
- **Uso**: Testes locais
- **iOS**: Simulator build
- **Android**: APK para instalação direta
```bash
eas build --platform ios --profile development
```

### Preview
- **Uso**: Testes internos/beta
- **iOS**: IPA para TestFlight interno
- **Android**: APK para distribuição interna
```bash
eas build --platform ios --profile preview
```

### Production
- **Uso**: Publicação nas lojas
- **iOS**: IPA para App Store
- **Android**: APK/AAB para Google Play
```bash
eas build --platform ios --profile production
```

## Verificar Status do Build

```bash
# Ver builds recentes
eas build:list

# Ver detalhes de um build específico
eas build:view [BUILD_ID]

# Ver logs de um build
eas build:logs [BUILD_ID]
```

## Troubleshooting

### Se ainda aparecer erro de UUID:

1. **Limpar cache local**:
```bash
rm -rf node_modules
npm install
```

2. **Reconfigurar EAS**:
```bash
eas init
```

3. **Verificar credenciais**:
```bash
eas credentials
```

### Se erro de certificados iOS:

```bash
# Ver certificados atuais
eas credentials --platform ios

# Gerar novos certificados
eas credentials --platform ios --profile production
```

### Se erro de permissões:

1. Verifique se está logado na conta correta:
```bash
eas whoami
```

2. Se necessário, faça logout e login novamente:
```bash
eas logout
eas login
```

## Próximos Passos

Após o build bem-sucedido:

### Para iOS:
1. **TestFlight**: Build será automaticamente enviado
2. **App Store**: Usar `eas submit --platform ios`

### Para Android:
1. **Internal Testing**: Distribuir APK diretamente
2. **Google Play**: Usar `eas submit --platform android`

## Monitoramento

O build pode ser monitorado em:
- **OnSpace AI**: Interface visual
- **EAS Dashboard**: https://expo.dev/accounts/[seu-username]/projects/[projeto]
- **Terminal**: `eas build:list --platform ios --status in-progress`

## Resultados Esperados

✅ Build iniciará sem erro de UUID  
✅ EAS criará/vinculará automaticamente o projectId correto  
✅ Arquivos binários (.ipa/.apk) serão gerados com sucesso  

---
**Última atualização**: 20/10/2025  
**Status**: ✅ Configuração corrigida - pronto para build
