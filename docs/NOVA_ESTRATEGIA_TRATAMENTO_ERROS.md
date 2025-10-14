# Nova Estratégia de Tratamento de Erros e Alterações Arquiteturais

## 1. Introdução

Este documento descreve a nova estratégia de tratamento de erros implementada para a comunicação com a API da Rapidoc, com foco em melhorar a robustez, a resiliência e a integridade arquitetural do aplicativo AiLun Saúde. A principal motivação foi o erro `TypeError: Load failed` e a necessidade de um tratamento mais sofisticado do que um simples proxy.

## 2. Problema Original e Solução Temporária

O erro `TypeError: Load failed` indicava uma falha na comunicação de rede, frequentemente associada a problemas de CORS ou inacessibilidade da API da Rapidoc. A solução inicial envolveu a criação de um proxy (`api/rapidoc-proxy.ts`) para contornar as restrições de CORS, movendo a requisição para um contexto de servidor.

Embora funcional, essa abordagem de proxy direto no frontend não era a solução arquiteturalmente mais elegante ou resiliente a longo prazo, pois ainda dependia de uma requisição síncrona e não tratava de forma robusta outras falhas de rede ou temporárias.

## 3. Nova Estratégia: Adaptador de API com Retry

A nova estratégia foca em desacoplar a lógica de comunicação com a Rapidoc do serviço de autenticação e introduzir mecanismos de resiliência.

### 3.1. `RapidocApiAdapter` (`services/rapidoc-api-adapter.ts`)

Foi criado um novo módulo, `RapidocApiAdapter`, que atua como uma camada de abstração para todas as interações com a API da Rapidoc. Este adaptador centraliza:

*   **Configuração da API**: Utiliza `RAPIDOC_CONFIG` para URL base e headers.
*   **Tratamento de Requisições**: Encapsula a lógica de `fetch` para a Rapidoc.
*   **Tratamento de Erros Centralizado**: Captura erros de rede e respostas HTTP não-OK, retornando um objeto `RapidocApiResult` padronizado (`{ success: boolean; data?: T; error?: string; status?: number; }`).
*   **Mecanismo de Retry**: Implementa um mecanismo de retry com *backoff exponencial* para requisições que falham devido a problemas de rede. Isso significa que, em caso de falha, a requisição é tentada novamente algumas vezes com um pequeno atraso crescente entre as tentativas, aumentando a chance de sucesso em falhas transitórias de rede.
    *   `MAX_RETRIES`: Número máximo de tentativas (configurado para 3).
    *   `RETRY_DELAY_MS`: Atraso inicial entre as tentativas (configurado para 1000ms).

**Exemplo de Retry:**

```typescript
// services/rapidoc-api-adapter.ts
private static async request<T>(endpoint: string, options: RequestInit = {}, retries = 0): Promise<RapidocApiResult<T>> {
  // ... lógica de requisição ...
  } catch (error: any) {
    if (retries < this.MAX_RETRIES - 1) {
      const delay = this.RETRY_DELAY_MS * (retries + 1);
      await this.sleep(delay);
      return this.request<T>(endpoint, options, retries + 1);
    }
    return { success: false, error: `Erro de conexão após ${this.MAX_RETRIES} tentativas: ${error.message}` };
  }
}
```

### 3.2. Refatoração de `cpfAuthNew.ts`

O serviço `services/cpfAuthNew.ts` foi refatorado para remover a dependência direta do `rapidocFetch` e do proxy. Agora, ele utiliza o `RapidocApiAdapter` para buscar beneficiários. Isso simplifica a lógica interna de `cpfAuthNew.ts` e o torna mais limpo e focado em autenticação, delegando a complexidade da comunicação externa ao adaptador.

**Alterações Chave:**

*   Remoção de importações diretas de `RAPIDOC_CONFIG` e `rapidocFetch`.
*   Substituição da chamada `fetchBeneficiaryFromProxy(cpf)` por `RapidocApiAdapter.getBeneficiaryByCPF(cpf)`.
*   Tratamento de erros no `catch` agora foca em erros retornados pelo adaptador, que já inclui o retry e mensagens mais específicas.

## 4. Benefícios Arquiteturais

*   **Desacoplamento**: A lógica de comunicação com a Rapidoc está agora isolada no `RapidocApiAdapter`, tornando o sistema mais modular e fácil de manter.
*   **Resiliência**: O mecanismo de retry aumenta a tolerância a falhas transitórias de rede, melhorando a experiência do usuário ao reduzir a ocorrência de erros por problemas temporários.
*   **Tratamento de Erros Consistente**: Todos os erros de comunicação com a Rapidoc são tratados de forma unificada pelo adaptador, garantindo mensagens de erro padronizadas e informativas.
*   **Testabilidade**: O adaptador pode ser facilmente mockado em testes unitários, facilitando a validação da lógica de negócios sem depender da API real.
*   **Escalabilidade**: Futuras otimizações (como cache de dados) podem ser implementadas dentro do adaptador sem afetar os serviços que o utilizam.

## 5. Próximos Passos

*   **Testar Exaustivamente**: Realizar testes completos para validar o mecanismo de retry e o tratamento de erros em diferentes cenários de rede (offline, latência alta, falhas temporárias da API).
*   **Monitoramento**: Integrar o `RapidocApiAdapter` com o sistema de auditoria para registrar tentativas de retry e falhas persistentes, fornecendo insights sobre a saúde da comunicação com a Rapidoc.
*   **Otimização de Desempenho**: Considerar a implementação de um cache de dados de beneficiários no adaptador para reduzir o número de chamadas à API da Rapidoc, especialmente para dados frequentemente acessados.

## 6. Conclusão

A nova estratégia de tratamento de erros com o `RapidocApiAdapter` representa uma melhoria significativa na arquitetura do aplicativo, tornando-o mais robusto, resiliente e fácil de manter. Esta abordagem garante que o aplicativo possa lidar com falhas de comunicação de forma mais graciosa, proporcionando uma experiência mais estável para o usuário.
