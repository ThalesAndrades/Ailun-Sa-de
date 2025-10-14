# Implementação do Aceite do Usuário Pós-Pagamento e Documentos Legais

Este documento detalha a estratégia para implementar o aceite do usuário após a confirmação do pagamento para liberar o acesso ao dashboard, bem como a criação de documentos legais essenciais para um aplicativo na área da saúde.

## 1. Implementação do Aceite do Usuário Pós-Pagamento

Para garantir que o usuário só acesse o dashboard após a confirmação do pagamento e o aceite dos termos, a seguinte lógica deve ser implementada:

### 1.1. Modificação do Esquema do Usuário no Supabase

É necessário adicionar um campo ao perfil do usuário no Supabase para registrar o status do aceite dos termos. Sugere-se um campo booleano:

```sql
ALTER TABLE public.profiles
ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE;
```

### 1.2. Lógica no Fluxo de Registro/Pagamento

Após a confirmação bem-sucedida do pagamento (conforme o fluxo de negócio pós-pagamento da Rapidoc Telemedicina), o aplicativo deve:

1.  **Exibir Tela de Aceite:** Redirecionar o usuário para uma tela dedicada onde os Termos de Uso e a Política de Privacidade são apresentados.
2.  **Registro do Aceite:** Ao clicar em "Aceitar" nesta tela, o campo `terms_accepted` no perfil do usuário no Supabase deve ser atualizado para `TRUE`.
3.  **Redirecionamento para o Dashboard:** Somente após o registro do aceite, o usuário deve ser redirecionado para o dashboard principal.

### 1.3. Proteção de Rotas

As rotas que levam ao dashboard e outras funcionalidades principais devem ser protegidas. Antes de renderizar o dashboard, o aplicativo deve verificar duas condições:

*   **Autenticação:** O usuário está logado.
*   **Aceite dos Termos:** O campo `terms_accepted` do usuário é `TRUE`.

Se o usuário estiver logado, mas `terms_accepted` for `FALSE`, ele deve ser redirecionado para a tela de aceite dos termos.

**Exemplo de pseudocódigo para proteção de rota (em `_layout.tsx` ou similar):**

```typescript
// Dentro de um hook de autenticação ou componente de layout
const { user, isLoading, termsAccepted } = useAuth(); // Supondo que useAuth retorne o status de aceite

useEffect(() => {
  if (!isLoading) {
    if (user && !termsAccepted) {
      // Redirecionar para a tela de aceite dos termos
      router.replace("/signup/terms-acceptance");
    } else if (!user) {
      // Redirecionar para a tela de login
      router.replace("/login");
    }
  }
}, [user, isLoading, termsAccepted]);
```

## 2. Documentos Legais Adicionais para Aplicativos de Saúde

Além dos Termos de Uso e da Política de Privacidade, um aplicativo na área da saúde como o AiLun Saúde requer outros documentos legais cruciais para garantir conformidade e transparência. A seguir, um documento essencial foi criado:

### 2.1. Termo de Consentimento Livre e Esclarecido (TCLE) para Serviços de Telemedicina

Este documento é fundamental para formalizar o consentimento do paciente para receber atendimento médico à distância. Ele informa o paciente sobre os riscos, benefícios, limitações e responsabilidades associadas à telemedicina. Um TCLE detalhado foi criado e está disponível em `Ailun-Sa-de/docs/TERMO_DE_CONSENTIMENTO_TELEMEDICINA.md`.

### 2.2. Outros Documentos Potencialmente Necessários (Recomendação)

Dependendo da complexidade e das funcionalidades futuras do aplicativo, outros documentos podem ser necessários:

*   **Política de Cookies:** Se o aplicativo utilizar cookies ou tecnologias de rastreamento no ambiente web.
*   **Acordo de Nível de Serviço (SLA):** Se houver garantias de disponibilidade e desempenho para serviços premium.
*   **Manual do Usuário/FAQ:** Para orientar os usuários sobre o uso da plataforma e responder a perguntas comuns.
*   **Política de Segurança da Informação:** Detalhando as medidas de segurança implementadas para proteger os dados de saúde.

---

**Autor:** Manus AI
**Data:** 14 de Outubro de 2025
