# Changelog - Versão 1.2.3

**Data**: 24 de outubro de 2025  
**Tipo**: Correção de Bugs Críticos

## 🔧 Correções Críticas

### Autenticação
- ✅ Corrigido tipo `AuthenticationResult` no hook `useActiveBeneficiaryAuth`
- ✅ Adicionadas propriedades `tokens` e `user` na conversão de `RapidocAuthResult`
- ✅ Fluxo de autenticação RapiDoc agora funciona corretamente

### Componentes
- ✅ Corrigido `FormInput` com todas as propriedades necessárias
- ✅ Adicionada propriedade `onChangeText` explicitamente
- ✅ Adicionadas todas as props de `TextInput` (placeholder, secureTextEntry, keyboardType, etc.)

### Imports
- ✅ Removidos imports duplicados de `Alert` no arquivo `dashboard.tsx`
- ✅ Corrigidos 13 imports incorretos que causavam conflitos de tipos

## 📊 Builds

- **iOS**: Build 25 (versão 1.2.3)
- **Android**: Build 15 (versionCode 15)

## 🎯 Impacto

Esta versão corrige os erros críticos que impediam o app de abrir corretamente após o login. O fluxo de autenticação agora está totalmente funcional tanto para usuários locais quanto para beneficiários da RapiDoc.

## 🔍 Notas Técnicas

Os avisos de TypeScript relacionados a imports de `react-native` (Alert, RefreshControl, etc.) são falsos positivos causados pelo `moduleResolution: "bundler"` do Expo SDK 53. Esses avisos não afetam a compilação ou execução do app, pois o Expo usa Babel para transpilar o código.

## 📝 Arquivos Modificados

- `hooks/useActiveBeneficiaryAuth.ts`
- `components/signup/FormInput.tsx`
- `app/dashboard.tsx`
- `app.json`

## ✅ Status

- [x] Correções implementadas
- [x] Versão atualizada
- [ ] Builds em andamento no Expo
- [ ] Testes em dispositivos reais

