# Changelog - Ailun Saúde

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.2.1] - 2025-10-22

### 🔒 Segurança

#### Adicionado
- **Sistema de Tokens JWT**: Implementado `tokenService` para gerenciamento seguro de autenticação
- **Logger Condicional**: Console.logs removidos em produção (apenas em desenvolvimento)
- **Babel Plugin**: Configurado `transform-remove-console` para remover logs automaticamente

#### Alterado
- **Autenticação**: Login agora salva tokens JWT em vez de senha
- **Autenticação Biométrica**: Atualizada para usar tokens em vez de senha armazenada
- **SecureStore**: Armazena apenas CPF (para lembrar usuário) e tokens JWT
- **Login Automático**: Implementado login automático se token JWT for válido

#### Removido
- **Armazenamento de Senha**: Senha não é mais armazenada em nenhum formato
- **Console.logs Sensíveis**: Removidos todos os logs que expunham CPF e senha

### 🔧 Compatibilidade

#### Alterado
- **React**: Downgrade de 19.0.0 para 18.2.0 (versão estável)
- **@types/react**: Atualizado para 18.2.0
- **Dependências**: Reinstaladas com versões compatíveis

### 📱 Versão

#### Alterado
- **App Version**: 1.2.0 → 1.2.1
- **iOS Build Number**: 13 → 19
- **Android Version Code**: 12 → 13

### 📝 Documentação

#### Adicionado
- `CHANGELOG.md`: Histórico de mudanças
- `CORRECOES_CRITICAS.md`: Documentação detalhada das correções
- `services/tokenService.ts`: Serviço de gerenciamento de tokens

### ⚠️ Breaking Changes

**Backend deve retornar tokens JWT no login:**

```typescript
// Resposta esperada do backend
{
  success: true,
  tokens: {
    accessToken: string,  // JWT token
    refreshToken: string  // Refresh token (opcional)
  },
  user: {
    id: string
  }
}
```

**Migração necessária:**
- Backend deve implementar geração de JWT tokens
- Tokens devem ter expiração configurada
- Implementar endpoint `/auth/refresh` para renovar tokens

### 🐛 Correções

- Corrigido exposição de dados sensíveis em logs
- Corrigido incompatibilidade com React 19
- Corrigido armazenamento inseguro de credenciais

---

## [1.2.0] - 2025-10-20

### Adicionado
- Funcionalidades base do aplicativo
- Autenticação com CPF
- Teleconsultas
- Agendamento de consultas
- Prontuário eletrônico

### Segurança
- Implementação inicial de autenticação
- SecureStore para dados sensíveis

---

## Tipos de Mudanças

- **Adicionado** para novas funcionalidades
- **Alterado** para mudanças em funcionalidades existentes
- **Descontinuado** para funcionalidades que serão removidas
- **Removido** para funcionalidades removidas
- **Corrigido** para correções de bugs
- **Segurança** para vulnerabilidades corrigidas

---

## Links

- [Repositório GitHub](https://github.com/ThalesAndrades/Ailun-Sa-de)
- [Expo Dashboard](https://expo.dev/accounts/thales-andrades/projects/ailun-saude-app)
- [Apple App Store Connect](https://appstoreconnect.apple.com/apps/6753972192)

