# 🎯 Google Play Console - Checklist Final

## ✅ PRÉ-UPLOAD (Valide tudo ANTES de começar)

```bash
# Execute no terminal:
cd /Applications/Ailun-Sa-de-1
chmod +x scripts/google-play-checklist.sh
./scripts/google-play-checklist.sh
```

### Resultado esperado:
```
✅ AAB Build (141 MB)
✅ Metadados JSON
✅ Ícone do App
✅ Screenshot 1-6
✅ Status: PRONTO PARA PUBLICAÇÃO
```

---

## 📋 CHECKLIST DE UPLOAD (Passo-a-Passo)

### 1️⃣ ACESSAR GOOGLE PLAY CONSOLE

- [ ] Abra: https://play.google.com/console
- [ ] Clique em "Sign in" com sua conta Google Developer
- [ ] Selecione o projeto: **Ailun Saúde** (com.ailun.saude)

### 2️⃣ NAVEGAR ATÉ A SEÇÃO DE RELEASE

- [ ] No menu esquerdo, clique em **"Testing"**
- [ ] Selecione **"Internal Testing"** (ou "Closed Testing" conforme sua conta)
- [ ] Clique em **"Create new release"** (botão azul)

### 3️⃣ FAZER UPLOAD DO AAB

- [ ] Clique em **"Browse files"** na seção "App bundles"
- [ ] Navegue até: `/Applications/Ailun-Sa-de-1/build/`
- [ ] Selecione: **ailun-saude-app-1.2.0.aab** (145 MB)
- [ ] Aguarde o upload completar (confirmação: ✅ verde)
- [ ] Verá: "Version 12" ou "Build 12" confirmado

### 4️⃣ ADICIONAR RELEASE NOTES

- [ ] No campo **"Release notes"**, cole:

```
Versão 1.2.0 - Melhorias e Correções
======================================

✅ Novas Funcionalidades:
• Agendamento de consultas médicas online
• Videochamada com especialistas
• Histórico de consultas
• Sistema de notificações

🐛 Correções:
• Melhor performance
• Interface otimizada
• Segurança reforçada

🔒 Segurança & Privacidade:
• LGPD compliant
• Criptografia end-to-end
• Dados protegidos em Supabase
```

- [ ] Clique **"Add language"** se quiser adicionar outros idiomas
- [ ] Deixe em Português (pt-BR) como padrão

### 5️⃣ REVISAR E CONFIRMAR RELEASE

- [ ] Clique em **"Next"** ou **"Review release"**
- [ ] Verifique:
  - [ ] AAB file: ✅ Presente
  - [ ] Version code: 12
  - [ ] Version name: 1.2.0
  - [ ] Release notes: ✅ Preenchidas

### 6️⃣ INICIAR ROLLOUT

- [ ] Clique em **"Start rollout to Internal Testing"** (não Production!)
- [ ] Confirme na caixa de diálogo
- [ ] Status: "In progress..." (aguarde 1-2 minutos)

### 7️⃣ CONFIRMAR PUBLICAÇÃO

- [ ] Quando terminar, verá: **"100% rolled out"**
- [ ] Status mudará para: **"Completed"** (verde)
- [ ] Notificação: "Your release has been rolled out"

---

## 🎨 PREENCHER STORE LISTING (Simultaneamente)

### Acesse: Google Play Console → Seu App → Store presence → Main store listing

#### Título do App (50 caracteres máximo)
```
Ailun Saúde - Teleconsultas
```
- [ ] Preenchido ✅

#### Descrição Curta (80 caracteres)
```
Agende consultas médicas online com especialistas
```
- [ ] Preenchido ✅

#### Descrição Completa (4000 caracteres)
- [ ] Use o arquivo: `google-play/metadata.json` → campo "fullDescription"
- [ ] Cole integralmente
- [ ] Clique **"Save draft"**

#### Screenshots (Até 8 imagens)
1. [ ] `google-play/screenshots/1_login.png` → "Faça login seguro"
2. [ ] `google-play/screenshots/2_dashboard.png` → "Veja seu dashboard"
3. [ ] `google-play/screenshots/3_agendamento.png` → "Agende consultas"
4. [ ] `google-play/screenshots/4_videochamada.png` → "Videochamada HD"
5. [ ] `google-play/screenshots/5_historico.png` → "Acesse seu histórico"
6. [ ] `google-play/screenshots/6_perfil.png` → "Gerencie seu perfil"

- [ ] Todos os 6 uploads confirmados ✅

#### Ícone do App (512×512 PNG)
- [ ] Upload: `assets/adaptive-icon.png`
- [ ] Confirmação: ✅ Verde

#### Ícone de Recurso (1024×500 PNG) - OPCIONAL
- [ ] Deixe como padrão (gerado automaticamente)

---

## 🔒 PREENCHER CONFORMIDADE E CONTEÚDO

### Acesse: Store presence → App content

#### Content Rating Questionnaire
- [ ] Clique em **"Content rating"**
- [ ] Selecione categoria: **"Health & Fitness"**
- [ ] Responda questionário (2-3 minutos)
- [ ] Resultado esperado: **GREEN** ✅
- [ ] Content rating: 12+ ou PEGI-3

#### Política de Privacidade
- [ ] Campo "Privacy policy": `https://www.ailun.com.br/privacy`
- [ ] Clique **"Save"**

#### Perguntas de Conformidade
- [ ] "Seus dados são coletados?": **Sim** (saúde do usuário)
- [ ] "Você permite compartilhamento?": **Não**
- [ ] "Dados sensíveis?": **Sim** (saúde)
- [ ] "LGPD compliant": **Sim** ✅

---

## 💰 CONFIGURAR PRECIFICAÇÃO E DISTRIBUIÇÃO

### Acesse: Setup → Pricing and distribution

- [ ] **Price**: FREE (Gratuito)
- [ ] **Countries**: Todos (exceto restrições legais)
- [ ] **Device categories**: Telefones e Tablets
- [ ] **Languages**: Português (Brazil) + Inglês
- [ ] **Content rating**: GREEN (12+)

---

## 🔍 VALIDAÇÃO FINAL PRÉ-PUBLICAÇÃO

### Execute checklist:
```bash
# Terminal:
/Applications/Ailun-Sa-de-1/scripts/google-play-checklist.sh

# Esperado: Todos os itens ✅
```

### Na Google Play Console, verifique:

- [ ] ✅ AAB Build: Presente e validado
- [ ] ✅ App name: Preenchido
- [ ] ✅ Screenshots: 6 imagens com descrições
- [ ] ✅ Ícone: 512×512 PNG
- [ ] ✅ Description: Completa em português
- [ ] ✅ Keywords: 6 termos
- [ ] ✅ Privacy policy: Linkada
- [ ] ✅ Content rating: GREEN (12+)
- [ ] ✅ LGPD compliant: Marcado
- [ ] ✅ Release notes: Preenchidas
- [ ] ✅ Version: 1.2.0 (12)

---

## 🚀 PUBLICAR PARA INTERNAL TESTING (Seguro!)

### RECOMENDADO: Comece com Internal Testing

1. [ ] Clique em **"Testing"** → **"Internal Testing"**
2. [ ] Clique em **"Create new release"**
3. [ ] Faça upload do AAB
4. [ ] Adicione release notes
5. [ ] Clique **"Start rollout"**
6. [ ] Aguarde 24-48 horas para revisão do Google

### Depois de aprovado pelo Google:

1. [ ] Clique em **"Testing"** → **"Closed Testing"** ou **"Open Testing"**
2. [ ] Repita o processo acima
3. [ ] IMPORTANTE: Não vai para Production automaticamente!

### Para Production (Após testes):

1. [ ] Clique em **"Release"** → **"Production"**
2. [ ] Repita o processo
3. [ ] ⚠️ IMPORTANTE: Isso vai viver para TODOS
4. [ ] Recomendado fazer rollout gradual (10% → 50% → 100%)

---

## ⏱️ TEMPOS ESTIMADOS

| Etapa | Tempo | Status |
|-------|-------|--------|
| Upload AAB | 2-5 min | ✅ Rápido |
| Store listing | 10-15 min | ✅ Moderado |
| Conformidade | 5 min | ✅ Rápido |
| Revisão do Google | 24-48 horas | ⏳ Aguarde |
| Disponível na loja | 1-2 horas após aprovação | 🎉 Pronto! |

---

## 🆘 PROBLEMAS COMUNS & SOLUÇÕES

### ❌ "AAB is not valid"
- ✅ Solução: Baixe novamente: `build/ailun-saude-app-1.2.0.aab`
- ✅ Verifique: `ls -lh build/ailun-saude-app-1.2.0.aab` (deve ser ~145 MB)

### ❌ "Screenshots have wrong dimensions"
- ✅ Solução: Use screenshots do `google-play/screenshots/`
- ✅ Todos devem ser: 1080×1920 px

### ❌ "Package name mismatch"
- ✅ Solução: Verifique: `app.json` → "package": "com.ailun.saude"
- ✅ Deve corresponder ao console

### ❌ "Content rating incomplete"
- ✅ Solução: Complete o questionário em "Content rating"
- ✅ Resultado: Deve ser GREEN ou PEGI-3

### ❌ "Wait, Google is reviewing"
- ✅ Solução: Paciência! Leva 24-48 horas
- ✅ Você receberá email quando terminar

---

## 📱 TESTAR APÓS PUBLICAÇÃO

### Link para testes (Internal Testing):
```
https://play.google.com/apps/internaltest/4701220258475505818
```

### Passo-a-passo de teste:
1. [ ] Acesse link acima com conta Google cadastrada
2. [ ] Clique em **"Become a tester"**
3. [ ] Abra Google Play Store no seu telefone
4. [ ] Procure por **"Ailun Saúde"**
5. [ ] Clique em **"Install"**
6. [ ] Teste funcionalidades principais:
   - [ ] Login (Email/CPF)
   - [ ] Dashboard
   - [ ] Agendar consulta
   - [ ] Videochamada (simulada)
   - [ ] Histórico
   - [ ] Perfil

---

## 📊 MONITORAMENTO PÓS-PUBLICAÇÃO

### Após 48 horas, acesse: "Analytics"

- [ ] **Installs**: Quantas pessoas baixaram
- [ ] **Uninstalls**: Quantas desinstalaram
- [ ] **Ratings**: Estrelas (esperado: 4.5+)
- [ ] **Reviews**: Leia feedback dos usuários
- [ ] **Crashes**: Monitore estabilidade

### Se houver problemas:
1. Corrija no código
2. Faça novo build
3. Crie nova release com version code incrementado (13, 14, etc)
4. Repita processo de upload

---

## ✨ DADOS FINAIS (Para Cópia Rápida)

### Identifique do App
```
Nome:           Ailun Saúde
Package ID:     com.ailun.saude
Version:        1.2.0
Version Code:   12
Min SDK:        Android 7.0 (API 24)
Target SDK:     Android 14 (API 34)
Size:           145 MB (AAB)
```

### Links Importantes
```
Console:        https://play.google.com/console
App:            com.ailun.saude
Website:        https://www.ailun.com.br
Privacy:        https://www.ailun.com.br/privacy
Support:        support@ailun.com.br
```

### Credenciais
```
Developer:      thales-andrades
EAS Project:    6f414a22-cc84-442f-9022-bb0ddc251d59
Email:          support@ailun.com.br
```

---

## ✅ CONCLUSÃO

Parabéns! Você tem:

- ✅ AAB Build validado (145 MB)
- ✅ 6 Screenshots em alta qualidade
- ✅ Metadados completos em português
- ✅ Conformidade LGPD + GDPR
- ✅ Documentação completa
- ✅ Checklist automatizado

**Próximo passo:** Acesse Google Play Console e comece o upload!

**Tempo total esperado:** 5-10 minutos para upload + 24-48h para revisão do Google

**Resultado final:** Seu aplicativo disponível para download no Google Play Store! 🎉

---

**Documento criado:** 21 de Outubro de 2025  
**Status:** ✅ 100% Completo  
**Confiança:** ⭐⭐⭐⭐⭐ Máxima
