# Vistoria do Fluxo de Agendamento e Chamada de Médico Imediato - AiLun Saúde

## Visão Geral

Este documento apresenta os resultados de uma vistoria detalhada nos fluxos de agendamento de consultas e de chamada de médico imediato ("Médico Agora") na plataforma AiLun Saúde. O objetivo é identificar pontos fortes, potenciais melhorias e possíveis erros ou inconsistências.

**Data da Vistoria**: 14 de outubro de 2025  
**Versão**: 1.0.0  
**Realizado por**: Manus AI

---

## 1. Fluxo de Chamada de Médico Imediato ("Médico Agora")

### 1.1 Componentes Envolvidos

-   `app/consultation/request-immediate.tsx` (Tela de Solicitação)
-   `app/consultation/pre-consultation.tsx` (Sala de Pré-Consulta)
-   `app/consultation/webview.tsx` (WebView para Consulta)
-   `services/rapidoc-consultation-service.ts` (Serviço de Integração Rapidoc)
-   `services/beneficiary-plan-service.ts` (Serviço de Beneficiários e Planos)

### 1.2 Análise do Fluxo

O fluxo de Médico Imediato está bem estruturado e funcional, cobrindo as etapas desde a solicitação até a entrada na sala de consulta.

1.  **Solicitação (`request-immediate.tsx`)**:
    *   **Pontos Fortes**: Carregamento automático de dados do beneficiário, verificação de elegibilidade do plano (`canUseService`), formulário para sintomas e urgência, aviso de emergência. A integração com `requestImmediateConsultation` da Rapidoc é direta.
    *   **Melhorias Potenciais**: Atualmente, a tela assume que o usuário autenticado é o beneficiário principal. Para cenários com múltiplos beneficiários (planos familiares), seria necessário um seletor de beneficiário nesta tela.
    *   **Erros/Inconsistências**: Nenhuma falha crítica identificada no fluxo lógico.

2.  **Sala de Pré-Consulta (`pre-consultation.tsx`)**:
    *   **Pontos Fortes**: Feedback visual claro sobre o status da consulta (aguardando/disponível), tempo estimado de espera, dicas importantes para a consulta. O botão central animado para "Entrar na Sala" é intuitivo.
    *   **Melhorias Potenciais**: A funcionalidade de cancelamento (`handleCancel`) atualmente apenas chama `router.back()`. Seria ideal integrar com `cancelImmediateConsultation` da Rapidoc para notificar o backend sobre o cancelamento.
    *   **Erros/Inconsistências**: Nenhuma falha crítica identificada.

3.  **WebView para Consulta (`webview.tsx`)**:
    *   **Pontos Fortes**: Permite a abertura de links externos (como a sala de consulta da Rapidoc) dentro do aplicativo, mantendo a experiência do usuário. Inclui controles de navegação (voltar, avançar, recarregar), barra de URL e tratamento de erros. As configurações para videochamadas (permissões de câmera/microfone) estão presentes.
    *   **Melhorias Potenciais**: A lógica de `handleClose` força o encerramento da consulta. Poderia haver uma opção para o usuário retornar à tela de pré-consulta se a consulta ainda não tiver terminado, ou um mecanismo para registrar o término da consulta (ex: `completeConsultation` da Rapidoc) ao fechar a WebView.
    *   **Erros/Inconsistências**: Nenhuma falha crítica identificada.

### 1.3 Integração com `rapidoc-consultation-service.ts`

-   As funções `requestImmediateConsultation`, `checkConsultationStatus`, `cancelImmediateConsultation` e `completeConsultation` estão bem definidas e prontas para uso. A estrutura de `Promise` e tratamento de erros é adequada.

---

## 2. Fluxo de Agendamento de Consultas

### 2.1 Componentes Envolvidos

-   `services/rapidoc-consultation-service.ts` (Serviço de Integração Rapidoc)
-   Atualmente, não há telas de UI dedicadas para o agendamento de especialistas, psicologia ou nutrição.

### 2.2 Análise do Fluxo

O serviço `rapidoc-consultation-service.ts` já possui as funções necessárias para o agendamento, mas a interface de usuário para este fluxo ainda não foi implementada.

1.  **Funções Disponíveis no Serviço**:
    *   `getAvailableSlots(serviceType, specialty?, startDate?)`: Permite buscar horários disponíveis.
    *   `scheduleConsultation(request)`: Permite agendar uma consulta.
    *   `getAvailableSpecialties()`: Lista as especialidades disponíveis.
    *   `getConsultationHistory(beneficiaryUuid, limit?)`: Busca o histórico de consultas.

2.  **Melhorias Necessárias (UI)**:
    *   **Tela de Seleção de Especialidade**: Uma tela onde o usuário possa escolher a especialidade desejada (utilizando `getAvailableSpecialties`).
    *   **Tela de Busca de Horários**: Uma interface para selecionar data e hora, exibindo os `AvailableSlots` retornados pela API.
    *   **Tela de Confirmação de Agendamento**: Para revisar os detalhes e confirmar a consulta (utilizando `scheduleConsultation`).
    *   **Tela de Meus Agendamentos**: Para visualizar consultas futuras e passadas (utilizando `getConsultationHistory`).

3.  **Integração com `beneficiary-plan-service.ts`**:
    *   O fluxo de agendamento precisará utilizar `canUseService` para verificar se o beneficiário tem o serviço de especialista, psicologia ou nutrição incluído no plano e se há limites de uso disponíveis (para psicologia e nutrição).
    *   Após o agendamento, `recordConsultation` e `incrementServiceUsage` (para serviços limitados) deverão ser chamados para registrar a consulta e atualizar os limites.

### 2.3 Pontos de Atenção

-   **Consistência de Dados**: Garantir que o `beneficiaryUuid` seja consistentemente usado em todas as chamadas da Rapidoc e que o `user_id` e `beneficiary_id` sejam corretamente associados no Supabase.
-   **Tratamento de Erros**: As funções do serviço já possuem tratamento de erros, mas a UI precisará exibir mensagens amigáveis ao usuário em caso de falha no agendamento ou na busca de horários.
-   **Notificações**: Implementar notificações (push, e-mail) para confirmar agendamentos e lembrar o usuário antes da consulta.

---

## 3. Recomendações Gerais

1.  **Implementar UI para Agendamento**: Priorizar a criação das telas de interface de usuário para o fluxo de agendamento de especialistas, psicologia e nutrição, utilizando as funções já existentes no `rapidoc-consultation-service.ts`.
2.  **Refinar Cancelamento de Consulta Imediata**: Integrar o botão de cancelar na tela de pré-consulta com a função `cancelImmediateConsultation` da Rapidoc.
3.  **Mecanismo de Término de Consulta**: Desenvolver uma forma de registrar o término de uma consulta na WebView, possivelmente com um botão de "Finalizar Consulta" ou um evento ao fechar a WebView, que chame `completeConsultation`.
4.  **Seleção de Beneficiário**: Para planos familiares, implementar um seletor de beneficiário nas telas de solicitação de consulta e agendamento.
5.  **Testes Abrangentes**: Realizar testes de integração completos para o fluxo de agendamento, incluindo cenários de sucesso, falha e limites de uso.

---

**Conclusão**: O fluxo de Médico Imediato está em um bom estado de implementação. O fluxo de agendamento possui a lógica de backend pronta, mas requer o desenvolvimento da interface de usuário para ser funcional. As próximas etapas devem focar na construção dessas interfaces e na integração completa com os serviços de backend e Supabase.

