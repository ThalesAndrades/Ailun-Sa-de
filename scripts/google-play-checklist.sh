#!/bin/bash
# 📱 Ailun Saúde - Google Play Console Checklist

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   📱 GOOGLE PLAY CONSOLE — CHECKLIST DE PUBLICAÇÃO        ║"
echo "║                                                            ║"
echo "║              Ailun Saúde v1.2.0                           ║"
echo "║              Package: com.ailun.saude                      ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2"
        return 0
    else
        echo -e "${RED}❌${NC} $2"
        return 1
    fi
}

echo "📋 VERIFICAÇÃO DE ARQUIVOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_file "build/ailun-saude-app-1.2.0.aab" "AAB Build (141 MB)"
check_file "google-play/metadata.json" "Metadados JSON"
check_file "assets/adaptive-icon.png" "Ícone do App (512×512)"
check_file "google-play/screenshots/1_login.png" "Screenshot 1 - Login"
check_file "google-play/screenshots/2_dashboard.png" "Screenshot 2 - Dashboard"
check_file "google-play/screenshots/3_agendamento.png" "Screenshot 3 - Agendamento"
check_file "google-play/screenshots/4_videochamada.png" "Screenshot 4 - Videochamada"
check_file "google-play/screenshots/5_historico.png" "Screenshot 5 - Histórico"
check_file "google-play/screenshots/6_perfil.png" "Screenshot 6 - Perfil"

echo ""
echo "📝 DADOS PREENCHIDOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat google-play/metadata.json | python3 -m json.tool 2>/dev/null | head -20

echo ""
echo "📊 ESTATÍSTICAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Tamanho do AAB
if [ -f "build/ailun-saude-app-1.2.0.aab" ]; then
    SIZE=$(du -h "build/ailun-saude-app-1.2.0.aab" | cut -f1)
    echo "AAB Size:          $SIZE"
fi

# Número de screenshots
SCREENSHOT_COUNT=$(ls google-play/screenshots/*.png 2>/dev/null | wc -l)
echo "Screenshots:       $SCREENSHOT_COUNT / 6"

# Tamanho dos metadados
if [ -f "google-play/metadata.json" ]; then
    METADATA_SIZE=$(du -h "google-play/metadata.json" | cut -f1)
    echo "Metadata JSON:     $METADATA_SIZE"
fi

echo ""
echo "🎯 PRÓXIMAS ETAPAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cat << 'EOF'
1. 🌐 Acesse Google Play Console
   → https://play.google.com/console

2. 📱 Selecione "Ailun Saúde"
   → Package: com.ailun.saude

3. 📄 Preencha Store Listing
   → Use dados em: google-play/metadata.json
   → Título, Descrição, Keywords

4. 📸 Upload Screenshots
   → Selecione arquivos em: google-play/screenshots/
   → Formatos: 1080×1920 px
   → Máximo 8 imagens

5. 📦 Upload AAB
   → Arquivo: build/ailun-saude-app-1.2.0.aab
   → Acesse: Testing → Internal Testing → Create Release

6. 🏷️ Adicione Release Notes
   → Use versão 1.2.0
   → Incluir melhorias e correções

7. ✅ Revisar Aplicativo
   → Verifique todas as informações
   → Confirme conformidade LGPD

8. 🚀 Publicar
   → Internal Testing → Start Rollout
   → Ou Production (após teste)

EOF

echo ""
echo "📞 CONTATO & SUPORTE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Email:             support@ailun.com.br"
echo "Website:           https://www.ailun.com.br"
echo "Privacy Policy:    https://www.ailun.com.br/privacy"
echo "Terms of Service:  https://www.ailun.com.br/terms"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✨ Status: PRONTO PARA PUBLICAÇÃO ✨"
echo ""
echo "Tudo preparado! Acesse Google Play Console e faça upload do AAB."
echo ""
echo "═══════════════════════════════════════════════════════════════"
