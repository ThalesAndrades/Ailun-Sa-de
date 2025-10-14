# Análise do Fluxo de Verificação de Plano Ativo

## 1. Visão Geral

O objetivo desta análise é identificar os pontos de entrada no aplicativo AiLun Saúde que exigem um plano ativo para acesso a serviços e garantir que o usuário seja devidamente redirecionado caso não possua um plano válido.

## 2. Pontos de Entrada e Validação Atual

Após a análise dos arquivos `app/dashboard.tsx`, `app/consultation/request-immediate.tsx` e `app/consultation/schedule.tsx`, os seguintes pontos foram identificados:

### a) `app/dashboard.tsx` (Tela Principal)

*   **Ponto de Entrada Principal**: Esta é a primeira tela que o usuário vê após o login.
*   **Validação Existente**: A tela utiliza o hook `useSubscription` para buscar os dados da assinatura (`subscriptionData`). A UI exibe o status da assinatura (ativo/inativo) e um botão para gerenciar a assinatura.
*   **Lacuna Identificada**: **Não há um bloqueio efetivo**. O usuário pode clicar nos botões de serviço ("Médico Agora", "Especialistas", etc.) mesmo com um plano inativo. A validação ocorre apenas na tela seguinte, o que pode gerar uma quebra na experiência do usuário.

### b) `app/consultation/request-immediate.tsx` (Solicitação de Médico Imediato)

*   **Ponto de Entrada**: Acessado a partir do Dashboard.
*   **Validação Existente**: A função `loadUserData` busca o beneficiário e, em seguida, a função `handleRequestConsultation` chama `canUseService(beneficiaryUuid, 'clinical')`. Se o serviço não puder ser usado, um `Alert` é exibido.
*   **Análise**: A validação está implementada, mas ocorre de forma reativa (após o clique). O ideal seria que o usuário nem conseguisse chegar a esta tela sem um plano que permita o serviço.

### c) `app/consultation/schedule.tsx` (Agendamento de Consultas)

*   **Ponto de Entrada**: Acessado a partir do Dashboard (através de modais que ainda não foram implementados, mas o fluxo está previsto).
*   **Validação Existente**: Similar à tela de médico imediato, a função `loadUserData` chama `canUseService` para o tipo de serviço específico (especialista, psicologia, nutrição). Se o serviço não for permitido, um `Alert` é exibido e o usuário é enviado de volta (`router.back()`).
*   **Análise**: A validação existe e é funcional, mas, assim como nos outros pontos, a experiência pode ser melhorada com uma verificação proativa no Dashboard.

## 3. Proposta de Melhoria

Para garantir uma experiência de usuário mais fluida e robusta, proponho as seguintes alterações:

1.  **Centralizar a Verificação no Dashboard**: Implementar uma lógica no `app/dashboard.tsx` que, ao carregar, verifique o `subscriptionData`. Se `hasActiveSubscription` for `false`, o aplicativo deve redirecionar o usuário para uma nova tela `app/subscription/inactive.tsx`.

2.  **Criar Tela de Plano Inativo (`app/subscription/inactive.tsx`)**: Esta tela informará ao usuário que ele não possui um plano ativo e apresentará as opções para assinar um novo plano, redirecionando-o para o fluxo de `signup` ou para uma tela de gerenciamento de assinaturas.

3.  **Reforçar a Validação nos Pontos de Entrada**: Além do redirecionamento no Dashboard, manter as validações existentes (`canUseService`) dentro das telas de solicitação de serviço como uma segunda camada de segurança, garantindo que o acesso direto via URL (se aplicável em cenários de desenvolvimento/teste) também seja tratado.

## 4. Conclusão

A implementação atual possui as validações necessárias, mas elas estão distribuídas e reativas. A centralização da verificação no Dashboard e a criação de um fluxo de redirecionamento para uma tela de "Plano Inativo" criarão uma barreira clara para usuários sem plano, melhorando a usabilidade e a clareza do fluxo do aplicativo.

