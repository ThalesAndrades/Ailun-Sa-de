# 🚀 Quick Start Guide - Publicar Ailun Saúde

## ⚡ 5 Minutos para Começar

### 1️⃣ Verificar tudo está pronto
```bash
cd /Applications/Ailun-Sa-de-1
./scripts/google-play-checklist.sh
```
✅ Esperado: Todos os items verdes

### 2️⃣ Acessar Google Play Console
```
https://play.google.com/console
```

### 3️⃣ Upload AAB
- Arquivo: `/Applications/Ailun-Sa-de-1/build/ailun-saude-app-1.2.0.aab`
- Tamanho: 145 MB
- Destino: Testing → Internal Testing → Create release

### 4️⃣ Preencher dados
```
Título: Ailun Saúde - Teleconsultas
Descrição: Agende consultas médicas online com especialistas
Screenshots: 6 imagens em google-play/screenshots/
Ícone: assets/adaptive-icon.png (512×512)
```

### 5️⃣ Publicar
- Clique: "Start rollout to Internal Testing"
- Pronto! Google revisará em 24-48 horas

---

## 📁 ARQUIVOS ESSENCIAIS

| Arquivo | Tamanho | Uso |
|---------|---------|-----|
| `build/ailun-saude-app-1.2.0.aab` | 145 MB | Upload principal |
| `google-play/screenshots/1_login.png` | 15 KB | Screenshot 1 |
| `google-play/screenshots/2_dashboard.png` | 19 KB | Screenshot 2 |
| `google-play/screenshots/3_agendamento.png` | 17 KB | Screenshot 3 |
| `google-play/screenshots/4_videochamada.png` | 15 KB | Screenshot 4 |
| `google-play/screenshots/5_historico.png` | 18 KB | Screenshot 5 |
| `google-play/screenshots/6_perfil.png` | 17 KB | Screenshot 6 |
| `assets/adaptive-icon.png` | 9.3 KB | Ícone 512×512 |
| `google-play/metadata.json` | 8 KB | Textos/descrição |

---

## 💡 DICAS RÁPIDAS

### ✅ Store Listing
```
Categoria:    Health & Fitness
Preço:        GRATUITO
Rating:       GREEN (12+)
LGPD:         Compliant ✅
```

### ✅ Descrição Curta (Copie-Cole)
```
Ailun Saúde - Teleconsultas
```

### ✅ Descrição Completa
Arquivo: `google-play/metadata.json` → fullDescription

### ✅ Release Notes
Arquivo: `google-play/metadata.json` → releaseNotes

---

## 🎯 PASSO-A-PASSO VISUAL

```
┌─ Google Play Console ─────────────────────────┐
│                                               │
│ 1. Acesse https://play.google.com/console    │
│                                               │
│ 2. Selecione "Ailun Saúde" (com.ailun.saude) │
│                                               │
│ 3. Testing → Internal Testing                │
│                                               │
│ 4. Create new release                        │
│                                               │
│ 5. Faça upload: ailun-saude-app-1.2.0.aab   │
│                                               │
│ 6. Adicione release notes                    │
│                                               │
│ 7. Click "Start rollout to Internal Testing" │
│                                               │
│ 8. ✅ PRONTO! Google revisará em 24-48h     │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 🆘 PRECISA DE AJUDA?

### ❌ AAB não valida?
```bash
# Verifique tamanho
ls -lh build/ailun-saude-app-1.2.0.aab
# Deve ser: ~145M
```

### ❌ Screenshots com dimensão errada?
```
Dimensões corretas: 1080×1920 px
Encontre: google-play/screenshots/
```

### ❌ Google Play não encontra?
```
Package: com.ailun.saude
Deve estar em: app.json
```

### ❌ Erro de conformidade?
```
LGPD:     ✅ Compliant
GDPR:     ✅ Compliant
Rating:   ✅ GREEN (12+)
Privacy:  ✅ https://www.ailun.com.br/privacy
```

---

## 📞 SUPORTE

| Item | Valor |
|------|-------|
| Email | support@ailun.com.br |
| Website | https://www.ailun.com.br |
| Privacy | https://www.ailun.com.br/privacy |
| Developer | thales-andrades |

---

## ✨ PRÓXIMO PASSO

👉 **Abra Google Play Console AGORA:**
```
https://play.google.com/console
```

**Você tem tudo pronto. Faltam só 5 minutos de cliques!** 🎉

---

**Última atualização:** 21 de Outubro de 2025  
**Status:** ✅ 100% Pronto
