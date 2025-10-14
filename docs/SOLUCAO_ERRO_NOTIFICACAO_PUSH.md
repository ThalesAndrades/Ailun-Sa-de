# Solução para Erro de Notificação Push no Expo

## 1. Problema Identificado

O aplicativo Expo estava apresentando o seguinte erro ao tentar registrar notificações push na web:

```
Erro ao registrar para notificações: Error: You must provide `notification.vapidPublicKey` in `app.json` to use push notifications on web.
```

Este erro ocorre porque, para que as notificações push funcionem em plataformas web usando o Expo, é necessário fornecer uma chave VAPID (Voluntary Application Server Identification) pública no arquivo `app.json` do projeto.

## 2. Solução Implementada

A solução envolveu a geração de um par de chaves VAPID (pública e privada) e a configuração da chave pública no `app.json`.

### 2.1. Geração das Chaves VAPID

As chaves VAPID foram geradas utilizando a ferramenta `web-push` via linha de comando. Este processo resultou em um par de chaves:

*   **Chave Pública VAPID**: `BEP5tfhd-q6h20770MQ4tQFCgtbVQ1pGhpBlbi43_6vRrcWnrsPBJqEQAKCpIKcTEApCuBExqLyEb7nIS9TEgZc`
*   **Chave Privada VAPID**: `Cy2kV_zT773f7k7BrKk6ImHmS3FI4CU414aPEVKZoEk`

**Comando utilizado para gerar as chaves:**

```bash
web-push generate-vapid-keys
```

### 2.2. Configuração no `app.json`

A chave pública VAPID foi adicionada à seção `notification` dentro do objeto `expo` no arquivo `app.json`.

**Trecho relevante do `app.json` após a alteração:**

```json
{
  "expo": {
    // ... outras configurações ...
    "experiments": {
      "typedRoutes": true
    },
    "notification": {
      "vapidPublicKey": "BEP5tfhd-q6h20770MQ4tQFCgtbVQ1pGhpBlbi43_6vRrcWnrsPBJqEQAKCpIKcTEApCuBExqLyEb7nIS9TEgZc"
    }
  }
}
```

### 2.3. Armazenamento das Chaves VAPID

Para referência futura e para uso em um servidor de backend (que seria responsável por enviar as notificações push), as chaves VAPID (pública e privada) foram salvas no arquivo `.env.local` na raiz do projeto. Este arquivo é ideal para armazenar variáveis de ambiente sensíveis que não devem ser versionadas.

**Trecho relevante do `.env.local`:**

```
# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=BEP5tfhd-q6h20770MQ4tQFCgtbVQ1pGhpBlbi43_6vRrcWnrsPBJqEQAKCpIKcTEApCuBExqLyEb7nIS9TEgZc
VAPID_PRIVATE_KEY=Cy2kV_zT773f7k7BrKk6ImHmS3FI4CU414aPEVKZoEk
```

## 3. Verificação e Teste

Após a implementação, o aplicativo deve ser reconstruído e testado para verificar se o erro de registro de notificações push foi resolvido e se o dispositivo web consegue obter um token de notificação com sucesso.

## 4. Próximos Passos

Com a chave VAPID pública configurada no `app.json` e as chaves VAPID armazenadas, o próximo passo seria implementar a lógica de backend para enviar notificações push usando essas chaves. O servidor de backend precisaria da chave privada VAPID para assinar as requisições de envio de notificação.
