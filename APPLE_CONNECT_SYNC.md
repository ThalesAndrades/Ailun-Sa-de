# 🍎 Guia: Apple Connect Sync + iOS Build

## 📌 O que você vai fazer

1. **Terminal**: Execute o build
2. **Browser**: Abra Apple Connect
3. **Browser**: Acompanhe o status
4. **Automático**: Build envia para Apple

---

## ⚡ COMECE AGORA (30 segundos)

### Passo 1: Executar o build

Abra Terminal e execute:

```bash
chmod +x /Applications/Ailun-Sa-de-1/BUILD_E_CONNECT.sh
bash /Applications/Ailun-Sa-de-1/BUILD_E_CONNECT.sh
```

Isso vai:
- ✅ Mostrar instruções
- ✅ Compilar o iOS
- ✅ Preparar upload para Apple
- ⏳ Você acompanha em tempo real

### Passo 2: Abrir Apple Connect

Enquanto o build roda (em outro browser tab):

1. Abra: **https://appstoreconnect.apple.com**
2. Faça login com seu Apple ID
3. Vá para: **My Apps → Ailun Saúde**

### Passo 3: Ir para TestFlight

No Apple Connect:
1. Clique em **"TestFlight"** (menu lateral)
2. Procure por **"Builds"** (seção iOS App)
3. Você verá um build novo aparecendo

---

## 📊 O que ver em cada estágio

### Terminal (Seu Mac) — ~8 minutos

```
🔨 Compilando...
   [████████░░░░░░░░] 50%
   
✅ Compilation complete
🚀 Enviando para Apple...
   [████████████████] 100%
   
✅ BUILD SUCESSO!
Archive: /Applications/Ailun-Sa-de-1/ios/build/AilunSade.xcarchive
```

### Apple Connect — 5-30 minutos

**Timeline esperada:**

```
⏳ Processing (5-15 min)
   "Apple está validando o build..."

⏳ Waiting for Review (opcional)
   "Build pronto, aguardando fila"

✅ Ready to Test (final!)
   "Build aprovado e pronto para TestFlight"
```

---

## 🎯 Botões importantes no Apple Connect

Quando você está em **TestFlight → Builds**:

| Botão | Ação | Quando |
|-------|------|--------|
| **View Details** | Ver status detalhado | Sempre clique aqui! |
| **Add Group** | Adicionar testadores | Após "Ready to Test" |
| **Submit to Review** | Enviar para App Store | Quando pronto |

---

## ✅ Sucesso: Você verá isso

### No Terminal:
```
✅ BUILD SUCESSO!

Próximas ações:
1. Abra Apple Connect:
   https://appstoreconnect.apple.com/apps

2. Vá para 'My Apps' → 'Ailun Saúde'

3. Clique em 'TestFlight' e aguarde o build aparecer
```

### No Apple Connect:
```
🎊 Builds

Versão 1.2 Build 5
✅ Ready to Test

[Add Group] [Submit to Review]
```

---

## ❌ Se houver erro

### No Terminal:
```
❌ BUILD FALHOU (exit code: 65)

Error: ...
```

**Ação**: Copie a mensagem de erro e me mostre

### No Apple Connect:
```
Versão 1.2 Build 5
⛔ Rejected

[View Details]
```

**Ação**: Clique em **"View Details"** e copie a mensagem

---

## 📱 Links diretos

**Você pode marcá-los:**

1. **Dashboard Apple Connect**
   ```
   https://appstoreconnect.apple.com
   ```

2. **Seus Apps**
   ```
   https://appstoreconnect.apple.com/apps
   ```

3. **TestFlight (após app criado)**
   ```
   https://appstoreconnect.apple.com/apps/YOUR_APP_ID/testflight/
   ```

---

## ⏱️ Tempo total

| Etapa | Tempo |
|-------|-------|
| Build no Mac | 3-5 min |
| Upload para Apple | 2-5 min |
| Processing | 5-30 min |
| **Total** | **~20 min** |

---

## 🚀 Próximas ações após "Ready to Test"

### Opção A: Testar antes de publicar
1. Vá para TestFlight
2. Adicione testadores (seu email, por exemplo)
3. Você receberá link para testar
4. Depois submita para App Store

### Opção B: Publicar direto
1. Vá para "Prepare for Submission"
2. Preencha descrição e screenshots
3. Submit para review
4. ✅ Publicado em 24-48 horas

---

## 💡 Dica: Monitorar sem browser

Se preferir apenas terminal:

```bash
# Ver logs em tempo real
tail -f /Applications/Ailun-Sa-de-1/ios/build/build.log
```

---

## 🎯 Resumo

```
┌─────────────────────────────────────────┐
│  Você está aqui: ⬅️ Terminal Build      │
│  ↓                                      │
│  Próxima: Apple Connect TestFlight     │
│  ↓                                      │
│  Final: App Store Publication          │
└─────────────────────────────────────────┘
```

**Comece agora:**
```bash
bash /Applications/Ailun-Sa-de-1/BUILD_E_CONNECT.sh
```

---

**Versão:** 1.2.0  
**Data:** 21 de outubro de 2025  
**Status:** Pronto para iOS build + publicação
