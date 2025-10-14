# Fluxos e Telas Principais do Aplicativo AiLun Saúde

Este documento descreve os principais fluxos de usuário e as telas correspondentes do aplicativo AiLun Saúde, com o objetivo de auxiliar na captura de prints para publicação em lojas de aplicativos. Cada seção detalha um fluxo específico, listando as telas envolvidas e sua funcionalidade.

## 1. Fluxo de Autenticação e Registro

Este fluxo abrange o processo de entrada de usuários existentes e o registro de novos usuários na plataforma.

| Tela Principal | Caminho do Arquivo | Descrição |
|---|---|---|
| **Tela de Login** | `app/login.tsx` | Permite que usuários existentes façam login na aplicação. Inclui campos para e-mail/CPF e senha, além de opções para recuperação de senha e navegação para o registro. |
| **Boas-vindas (Registro)** | `app/signup/welcome.tsx` | Primeira tela do fluxo de registro, apresentando a proposta de valor da AiLun Saúde e convidando o usuário a iniciar o cadastro. |
| **Dados Pessoais (Registro)** | `app/signup/personal-data.tsx` | Coleta informações pessoais básicas do novo usuário, como nome completo, CPF, data de nascimento e gênero. |
| **Contato (Registro)** | `app/signup/contact.tsx` | Solicita informações de contato, como e-mail e número de telefone. |
| **Endereço (Registro)** | `app/signup/address.tsx` | Coleta o endereço residencial do usuário. |
| **Pagamento (Registro)** | `app/signup/payment.tsx` | Permite ao usuário selecionar o plano de assinatura e inserir os dados de pagamento. |
| **Confirmação (Registro)** | `app/signup/confirmation.tsx` | Exibe um resumo das informações fornecidas e do plano escolhido, solicitando a confirmação final do usuário antes de concluir o registro. |

## 2. Fluxo de Consultas e Agendamentos

Este fluxo gerencia a solicitação e o agendamento de consultas com profissionais de saúde.

| Tela Principal | Caminho do Arquivo | Descrição |
|---|---|---|
| **Pré-Consulta** | `app/consultation/pre-consultation.tsx` | Tela inicial para o fluxo de consulta, onde o usuário pode escolher o tipo de consulta (imediata ou agendada) e a especialidade. |
| **Solicitar Consulta Imediata** | `app/consultation/request-immediate.tsx` | Permite ao usuário solicitar uma consulta imediata, conectando-o ao profissional disponível mais rapidamente. |
| **Agendar Consulta** | `app/consultation/schedule.tsx` | Oferece opções para agendar consultas em datas e horários específicos com profissionais disponíveis. |
| **Webview da Consulta** | `app/consultation/webview.tsx` | Tela que exibe a interface da teleconsulta em si, geralmente incorporando uma solução de vídeo conferência. |

## 3. Fluxo de Perfil e Assinatura

Este fluxo permite ao usuário gerenciar suas informações de perfil e detalhes da assinatura.

| Tela Principal | Caminho do Arquivo | Descrição |
|---|---|---|
| **Perfil do Usuário** | `app/profile/index.tsx` | Exibe as informações do perfil do usuário, com opções para editar dados pessoais, alterar senha, etc. |
| **Detalhes do Plano** | `app/profile/plan.tsx` | Mostra os detalhes do plano de assinatura atual do usuário, incluindo benefícios e status. |
| **Assinatura Inativa** | `app/subscription/inactive.tsx` | Tela exibida quando a assinatura do usuário está inativa ou expirada, com opções para reativar ou escolher um novo plano. |

## 4. Fluxo de Dashboard

O dashboard é a tela principal após o login, oferecendo uma visão geral e acesso rápido às funcionalidades mais importantes.

| Tela Principal | Caminho do Arquivo | Descrição |
|---|---|---|
| **Dashboard Principal** | `app/dashboard.tsx` | Visão geral personalizada para o usuário, com atalhos para agendamentos, histórico de consultas, notificações e outras funcionalidades chave. |

## 5. Fluxo de Onboarding

Este fluxo guia novos usuários através das funcionalidades básicas da plataforma.

| Tela Principal | Caminho do Arquivo | Descrição |
|---|---|---|
| **Guia da Plataforma** | `app/onboarding/platform-guide.tsx` | Apresenta um tour guiado pelas principais funcionalidades e benefícios do aplicativo para novos usuários. |

## 6. Telas de Pagamento (Adicionais)

| Tela Principal | Caminho do Arquivo | Descrição |
|---|---|---|
| **Histórico de Pagamentos** | `app/payment-history.tsx` | Exibe o histórico de transações e pagamentos do usuário. |
| **Pagamento via PIX** | `app/payment-pix.tsx` | Interface para realizar pagamentos utilizando o método PIX. |
| **Pagamento via Cartão** | `app/payment-card.tsx` | Interface para inserir e gerenciar informações de cartão de crédito/débito para pagamentos. |

---

**Autor:** Manus AI
**Data:** 14 de Outubro de 2025
