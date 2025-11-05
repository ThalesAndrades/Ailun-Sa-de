# Checklist Final para Revisão nas Lojas - Ailun Saúde

**Data**: 04 de novembro de 2025  
**Status do Projeto**: ✅ **Pronto para Submissão**

---

## 1. Status das Integrações e Configurações

Sim, **todas as integrações técnicas estão OK**. O projeto está devidamente configurado para ser submetido às lojas em **modo de demonstração**.

| Item | Status | Detalhes |
| :--- | :--- | :--- |
| **Integrações de API** | ✅ OK | Supabase, RapiDoc, Asaas e Resend estão configurados no ambiente de demonstração. |
| **Modo Demo** | ✅ OK | Ativado por padrão. O app usará dados fictícios e credenciais de teste. |
| **Credenciais de Teste** | ✅ OK | Um usuário de demonstração (`demo@ailun.com.br`) está configurado para os revisores. |
| **Builds (Compilação)** | ✅ OK | O projeto está compilando com sucesso para iOS e Android via EAS. |

---

## 2. Itens Prontos para Submissão

Os seguintes itens já foram preparados e estão prontos para serem usados no processo de submissão:

| Item | Status | Detalhes |
| :--- | :--- | :--- |
| **Screenshots (iOS)** | ✅ Pronto | 3 screenshots profissionais nas dimensões corretas (1284x2778px) estão disponíveis. |
| **Screenshots (Android)** | ✅ Pronto | Os mesmos screenshots podem ser usados ou adaptados para a Google Play. |
| **Ícones e Assets** | ✅ Pronto | Ícone do app, splash screen e outros assets visuais estão configurados. |
| **Metadados** | ✅ Pronto | Nome do app, descrição, palavras-chave e política de privacidade estão definidos. |

---

## 3. Checklist de Ações para Você Executar

Abaixo estão as ações que **você precisa realizar** para finalizar o envio para revisão.

### 🍎 Apple App Store

1.  **Acessar o App Store Connect**:
    *   Vá para [App Store Connect](https://appstoreconnect.apple.com/apps/6753972192/distribution/ios/version/inflight).

2.  **Fazer Upload dos Screenshots**:
    *   Na seção "App Previews and Screenshots", para a categoria "iPhone 6.5-Inch Display", faça o upload dos 3 arquivos que estão em `assets/app-store/screenshots/`.
    *   Use os arquivos `resized_screenshot_*.png`.

3.  **Adicionar Credenciais de Teste**:
    *   Role para baixo até a seção "App Review Information".
    *   Marque a caixa **"Sign-in required"**.
    *   Preencha os seguintes campos:
        *   **Username**: `demo@ailun.com.br`
        *   **Password**: `Demo@2025`
    *   No campo de notas (opcional), você pode adicionar uma breve explicação sobre o modo demo.

4.  **Salvar e Enviar para Revisão**:
    *   Clique em **"Save"** no canto superior direito.
    *   O botão **"Add for Review"** (ou "Submit for Review") ficará azul. Clique nele para finalizar.

### 🤖 Google Play Store

1.  **Acessar o Google Play Console**:
    *   Vá para o painel do seu aplicativo no [Google Play Console](https://play.google.com/console).

2.  **Criar uma Nova Release**:
    *   No menu lateral, vá para **Production** ou **Internal testing**.
    *   Clique em **"Create new release"**.

3.  **Fazer Upload do App Bundle (AAB)**:
    *   Na seção "App bundles", faça o upload do arquivo `.aab` que foi gerado pelo build do EAS. Se não o tiver, posso gerá-lo novamente para você.

4.  **Preencher Informações da Release**:
    *   Adicione notas sobre a versão (ex: "Versão inicial do Ailun Saúde").

5.  **Configurar Acesso para Revisores**:
    *   No menu lateral, vá para **App content** -> **App access**.
    *   Indique que o app tem acesso restrito e forneça as mesmas credenciais de teste:
        *   **Username**: `demo@ailun.com.br`
        *   **Password**: `Demo@2025`

6.  **Revisar e Lançar**:
    *   Volte para a página da release, clique em **"Review release"** e depois em **"Start rollout"**.

---

## 4. Credenciais de Demonstração (Para sua Referência)

Use estas credenciais nos campos de teste das lojas:

- **Email**: `demo@ailun.com.br`
- **Senha**: `Demo@2025`

---

## 5. Conclusão

O projeto está tecnicamente sólido e pronto. Sua parte agora é seguir o checklist acima para carregar os materiais e informações finais nas plataformas da Apple e do Google. Após seguir esses passos, os aplicativos estarão na fila de revisão.

Se tiver qualquer dúvida durante o processo, me avise!
