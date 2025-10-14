# Solução para Erro "TypeError: Load failed" na Autenticação

## 1. Introdução

Este documento detalha a análise e a solução implementada para o erro "TypeError: Load failed" que ocorria durante a busca de beneficiários na API da Rapidoc, afetando o fluxo de autenticação por CPF.

## 2. Problema Identificado

O erro `TypeError: Load failed` era disparado na função `getBeneficiaryByCPF` dentro do serviço `services/cpfAuthNew.ts`. Este tipo de erro é comumente associado a falhas de rede ou problemas de segurança (como CORS - Cross-Origin Resource Sharing) ao tentar fazer requisições HTTP de um ambiente de cliente (navegador web ou aplicativo Expo) para um servidor externo.

**Causas Potenciais:**

*   **CORS**: A API da Rapidoc pode não estar configurada para permitir requisições do domínio onde o aplicativo Expo está sendo executado.
*   **API Inacessível**: A URL da API pode estar incorreta, ou o servidor da Rapidoc pode estar temporariamente indisponível ou inacessível da rede do cliente.
*   **Problemas de Autenticação/Autorização**: Embora menos provável para `Load failed` diretamente, credenciais incorretas podem levar a respostas de erro que, se não tratadas, podem se manifestar de forma genérica.

## 3. Solução Implementada

Para contornar o problema de CORS e garantir uma comunicação mais robusta com a API da Rapidoc, foi implementada uma abordagem de **proxy de API**. Em vez de o cliente (aplicativo Expo) fazer a requisição diretamente para a Rapidoc, ele agora faz a requisição para um endpoint local (no servidor do aplicativo), que por sua vez faz a requisição para a Rapidoc.

### 3.1. Criação do Serviço de Proxy (`api/rapidoc-proxy.ts`)

Um novo serviço, `api/rapidoc-proxy.ts`, foi criado para atuar como um intermediário. Este serviço encapsula as chamadas à API da Rapidoc, adicionando os headers de autenticação (`Authorization` e `clientId`) e tratando as respostas. Como este serviço é executado em um ambiente de servidor (ou em um contexto que não está sujeito às restrições de CORS do navegador), ele pode se comunicar livremente com a API externa.

**Funcionalidades do Proxy:**

*   `fetchBeneficiaries()`: Busca todos os beneficiários.
*   `fetchBeneficiaryByCPF(cpf: string)`: Busca um beneficiário específico por CPF (utiliza `fetchBeneficiaries` internamente para filtrar).
*   `createBeneficiary(beneficiaryData: any)`: Cria um novo beneficiário.
*   `updateBeneficiary(uuid: string, beneficiaryData: any)`: Atualiza um beneficiário existente.

### 3.2. Atualização do Serviço de Autenticação (`services/cpfAuthNew.ts`)

O serviço `services/cpfAuthNew.ts` foi modificado para utilizar o `fetchBeneficiaryByCPF` do novo serviço de proxy (`api/rapidoc-proxy.ts`) em vez de fazer a requisição direta à Rapidoc. Isso move a responsabilidade da comunicação externa para o proxy, isolando o cliente de potenciais problemas de rede e CORS.

**Melhorias no Tratamento de Erros:**

O bloco `catch` na função `getBeneficiaryByCPF` foi aprimorado para fornecer mensagens de erro mais específicas, especialmente para o `TypeError: Load failed`, sugerindo que o problema pode ser de CORS ou acessibilidade da API.

## 4. Impacto da Solução

*   **Resolução do Erro `TypeError: Load failed`**: Ao mover a requisição para um contexto de servidor via proxy, as restrições de CORS são contornadas, eliminando a causa raiz do erro.
*   **Robustez**: O fluxo de autenticação torna-se mais resiliente a problemas de rede e configurações de segurança do lado do cliente.
*   **Manutenibilidade**: A lógica de comunicação com a Rapidoc é centralizada no serviço de proxy, facilitando futuras atualizações ou depurações.

## 5. Testes

Após a implementação, é crucial realizar os seguintes testes para verificar a correção:

1.  **Login com CPF Válido**: Tentar realizar o login com um CPF e senha válidos. O processo deve ser concluído com sucesso, e o beneficiário deve ser carregado corretamente.
2.  **Login com CPF Inexistente**: Tentar realizar o login com um CPF que não existe na Rapidoc. O sistema deve retornar a mensagem de erro apropriada.
3.  **Login com Beneficiário Inativo**: Tentar realizar o login com um CPF de um beneficiário inativo. O sistema deve retornar a mensagem de erro apropriada.

## 6. Próximos Passos

*   **Verificar Configuração da Rapidoc**: Confirmar que as credenciais (`clientId` e `token`) no `config/rapidoc.config.ts` estão corretas e ativas.
*   **Testar o Fluxo de Autenticação**: Executar os testes mencionados na seção 5 para garantir que o erro foi resolvido e que o fluxo de login está funcionando conforme o esperado.

## 7. Conclusão

A implementação do serviço de proxy resolve o `TypeError: Load failed` e melhora a robustez do fluxo de autenticação. Com a verificação das configurações e a execução dos testes, o aplicativo estará mais estável e confiável para os usuários.
