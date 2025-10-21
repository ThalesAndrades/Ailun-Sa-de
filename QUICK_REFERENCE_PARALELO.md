# ⚡ QUICK REFERENCE — Publicação Paralela (45 mins)

## 🎯 SEU OBJETIVO
Publicar **Google Play + App Store** simultaneamente em ~45 minutos.

---

## 📱 GOOGLE PLAY (Tab 1)

### Login & Setup (2 mins)
```
1. Abra: https://play.google.com/console
2. Login com email Google
3. Selecione app: "Ailun Saúde"
4. Clique: "Create new release"
5. Escolha: "Production"
```

### Upload AAB (5 mins)
```
Arquivo: build/ailun-saude-app-1.2.0.aab (141 MB)

1. Arraste para área de upload OU clique "Upload"
2. Aguarde validação (2-3 mins)
3. Status: "✅ Reviewed and approved" = OK
```

### Screenshots (5 mins)
```
Origem: google-play/screenshots/

1. Aba: "Screenshots"
2. Selecione: "6.3 inch phone"
3. Upload 6 imagens
4. Organize ordem
```

### Metadados (5 mins)
```
1. Título: "Ailun Saúde"
2. Descrição: Vide GOOGLE_PLAY_STEP_BY_STEP.md
3. Palavras-chave: saúde, médico, telemedicina
4. Categoria: Medicina
5. Preço: Free
```

### Conformidade (3 mins)
```
1. Aba: "Conformance"
2. Marque: LGPD + GDPR (✅)
3. Conteúdo: appropriate for your app
```

### Publique (2 mins)
```
1. Clique: "Review"
2. Verifique resumo
3. Clique: "Confirm and start publishing"
4. Status: "Publishing in progress..." ✅

RESULTADO: App em review automático (~24h)
```

**⏱️ Total Google Play: ~20 mins**

---

## 🍎 APP STORE (Tab 2)

### Login & Setup (2 mins)
```
1. Abra: https://appstoreconnect.apple.com
2. Login com Apple ID
3. Selecione app: "Ailun Saúde"
```

### Distribution Certs (5-15 mins)

**OPÇÃO A: Automatic (FÁCIL)**
```
No Terminal:
  open ios/AilunSade.xcworkspace

Em Xcode:
  1. Target: "AilunSade"
  2. Signing & Capabilities
  3. ✅ Check: "Automatically manage signing"
  4. Select: Your Team
  5. Done! (espere 1-2 mins)
```

**OPÇÃO B: Manual** (se tiver certs)
```
Vide: docs/IOS_SIGNING_NEXT_STEPS.md
Tempo: 15 mins
```

### Export .ipa (5 mins)
```bash
xcodebuild -exportArchive \
  -archivePath ios/build/AilunSade.xcarchive \
  -exportOptionsPlist ios/exportOptions.plist \
  -exportPath ios/build

Verifique:
  ls -lh ios/build/AilunSade.ipa
  (Esperado: ~50-60 MB)
```

### Upload .ipa (5 mins)
```bash
xcrun altool --upload-app \
  -f ios/build/AilunSade.ipa \
  -t ios \
  -u seu-email@example.com \
  -p app-specific-password

OU: App Store Connect → Add Build
```

### Metadados (5 mins)
```
1. Subtitle: "Consultas médicas por vídeo"
2. Description: Vide DEPLOYMENT_GUIDE_FINAL.md
3. Keywords: saúde, médico, telemedicina
4. Privacy URL: seu-site.com/privacy
5. Support URL: seu-site.com/support
```

### Submeta (2 mins)
```
1. Aba: "General Information"
2. Clique: "Submit for Review"
3. Verifique informações
4. Clique: "Submit for Review" novamente
5. Status: "In Review" ✅

RESULTADO: App em review manual (24-48h)
```

**⏱️ Total App Store: ~25 mins**

---

## ⏱️ TIMELINE PARALELA

```
00:00 — Comece
  ├─ Google Play: Setup (2 mins)
  └─ Apple: Setup (2 mins)

05:00 — Upload
  ├─ Google Play: AAB upload (5 mins)
  └─ Apple: Distribution certs (5-15 mins)

15:00 — Paralelo
  ├─ Google Play: Screenshots (5 mins)
  └─ Apple: .ipa export (5 mins)

25:00 — Metadados
  ├─ Google Play: Metadados (5 mins) → PUBLISH ✅
  └─ Apple: Metadados (5 mins)

40:00 — Finalizar
  ├─ Google Play: ✅ PUBLICADO
  └─ Apple: Submit review (2 mins) → SUBMETIDO ✅

45:00 — ✅ COMPLETO!
  ├─ Google Play: Live em ~24h
  └─ App Store: Review 24-48h
```

---

## 📋 QUICK CHECKLIST

### Google Play
- [ ] Console login
- [ ] App selecionado
- [ ] AAB uploading
- [ ] Screenshots uploaded
- [ ] Metadados preenchidos
- [ ] Conformidade OK
- [ ] ✅ Publicado

### App Store
- [ ] Developer login
- [ ] Certs configurados
- [ ] .ipa exportado
- [ ] .ipa uploaded
- [ ] Metadados preenchidos
- [ ] Build selecionado
- [ ] ✅ Submetido

---

## 🆘 QUICK TROUBLESHOOTING

| Problema | Solução |
|----------|---------|
| **AAB não valida** | Verifique versionCode em app.json |
| **Sem certs distribuidora** | Use Automatic Signing (Opção A) |
| **Upload lento** | Pode retomar de onde parou |
| **Arquivo .ipa não encontrado** | Verifique: `ls ios/build/AilunSade.ipa` |
| **Export falha** | Tente: `npm run clean && npm install` |
| **Dúvida em texto** | Copie dos arquivos de guia |

---

## 📞 DOCUMENTOS RÁPIDOS

```
Google Play: GOOGLE_PLAY_STEP_BY_STEP.md
Apple Certs: docs/IOS_SIGNING_NEXT_STEPS.md
Apple Upload: DEPLOYMENT_GUIDE_FINAL.md
Geral:       DOCUMENTATION_INDEX.md
```

---

## ✨ VOCÊ ESTÁ PRONTO!

```
✅ Código: Pronto
✅ Assets: Prontos
✅ Docs: Prontos
✅ Tempo: 45 minutos

👉 COMECE AGORA!
```

**Resultado em 2-3 dias:**
- 📱 Google Play: ✅ LIVE
- 🍎 App Store: ✅ LIVE

---

## 🎊 MOTIVAÇÃO

Você está **45 minutos de distância** de ter seu app em ambas as maiores lojas do mundo!

**Vamos lá!** 🚀

```
[START] → 45 mins → [DONE] → 2-3 dias → [LIVE!] 🎉
```

Go go go! 💪
