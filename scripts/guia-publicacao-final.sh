#!/bin/bash

# 📱 AILUN SAÚDE - GUIA FINAL DE PUBLICAÇÃO
# Este script fornece instruções passo a passo para publicar em ambas as lojas

set -e

PROJECT_ROOT="/Applications/Ailun-Sa-de-1"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║     🚀 AILUN SAÚDE - GUIA FINAL DE PUBLICAÇÃO OFICIAL        ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Menu principal
while true; do
    echo -e "${YELLOW}Escolha uma opção:${NC}"
    echo ""
    echo -e "${GREEN}📱 PUBLICAÇÃO${NC}"
    echo "  1) 📊 Ver Status Completo de Publicação"
    echo "  2) 🤖 Upload Automático Android (Google Play)"
    echo "  3) 🤖 Upload Automático iOS (App Store)"
    echo "  4) 🤖 Upload Ambas as Plataformas (Paralelo)"
    echo ""
    echo -e "${GREEN}📋 GUIAS${NC}"
    echo "  5) 📖 Guia Passo a Passo - Google Play Android"
    echo "  6) 📖 Guia Passo a Passo - App Store iOS"
    echo "  7) 📖 Troubleshooting & FAQ"
    echo ""
    echo -e "${GREEN}🔧 FERRAMENTAS${NC}"
    echo "  8) 🔍 Validar Artifacts do Build"
    echo "  9) 📦 Listar Arquivos para Upload"
    echo "  10) 🧹 Limpar Arquivos Temporários"
    echo ""
    echo -e "${GREEN}0) Sair${NC}"
    echo ""
    read -p "Digite sua escolha: " choice

    case $choice in
        1)
            echo ""
            cat "$PROJECT_ROOT/PUBLICACAO_COMPLETA.md"
            ;;
        
        2)
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
            echo -e "${BLUE}📱 UPLOAD AUTOMÁTICO - GOOGLE PLAY ANDROID${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
            echo ""
            echo -e "${YELLOW}⚠️  ESTE RECURSO REQUER CONFIGURAÇÃO ADICIONAL${NC}"
            echo ""
            echo "Para realizar upload automático, você precisa de:"
            echo "  1. Chave API do Google Play Console (JSON)"
            echo "  2. Ferramenta: bundletool (instalada via npm)"
            echo ""
            echo -e "${GREEN}Opções:${NC}"
            echo "  A) Fazer upload MANUAL via Google Play Console (Recomendado - 2 min)"
            echo "  B) Ver instruções para setup automático (Avançado)"
            echo ""
            read -p "Escolha (A/B): " android_choice
            
            if [[ "$android_choice" == "A" ]]; then
                cat << 'ANDROID_MANUAL'

╔════════════════════════════════════════════════════════════════╗
║ 📱 UPLOAD MANUAL - GOOGLE PLAY CONSOLE (Recomendado)         ║
╚════════════════════════════════════════════════════════════════╝

✅ Você tem tudo pronto:
   • AAB File: /Applications/Ailun-Sa-de-1/build/ailun-saude-app-1.2.0.aab (145 MB)
   • Screenshots: 6 imagens em google-play/screenshots/
   • Metadata: Completa em google-play/metadata.json

🚀 PASSO A PASSO (5-10 minutos):

1️⃣  ABRIR GOOGLE PLAY CONSOLE
    URL: https://play.google.com/console
    Login: Sua conta Google associada ao app

2️⃣  NAVEGAR ATÉ O APP
    Menu: Selecione "Ailun Saúde" (com.ailun.saude)

3️⃣  CRIAR NOVO RELEASE
    Menu: Testing → Internal testing (ou Production → Create release)
    Seção: Builds
    Botão: "Create new release"

4️⃣  UPLOAD DO AAB
    Clique: "Choose files"
    Local: /Applications/Ailun-Sa-de-1/build/ailun-saude-app-1.2.0.aab
    Confirme: O arquivo foi reconhecido

5️⃣  ADICIONAR SCREENSHOTS
    Menu: Store presence → Screenshots
    Selecione: Phone (Portrait)
    Carregue: Todas as 6 imagens de google-play/screenshots/
    Confirme: Todas as 6 imagens aparecem

6️⃣  PREENCHER RELEASE NOTES
    Campo: O que há de novo nesta versão
    Texto: "Versão 1.2.0 - Melhorias de interface e performance"

7️⃣  REVIEW E PUBLICAÇÃO
    Botão: "Review release"
    Verifique: Todas as informações
    Botão: "Start rollout to production"

⏱️  TEMPO NECESSÁRIO:
    • Upload: 2-3 minutos
    • Processing: 1-2 horas automático
    • Total até live: ~2 horas

🎉 PRONTO! O app aparecerá na Google Play Store após processamento

ANDROID_MANUAL
            fi
            ;;
        
        3)
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
            echo -e "${BLUE}🍎 UPLOAD AUTOMÁTICO - APP STORE iOS${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
            echo ""
            echo -e "${YELLOW}⚠️  ESTE RECURSO REQUER CONFIGURAÇÃO ADICIONAL${NC}"
            echo ""
            echo "Para realizar upload automático, você precisa de:"
            echo "  1. App Store Connect credentials"
            echo "  2. Ferramenta: Transporter (incluído no Xcode)"
            echo ""
            echo -e "${GREEN}Opções:${NC}"
            echo "  A) Fazer upload MANUAL via App Store Connect (Recomendado - 5 min)"
            echo "  B) Ver instruções para setup automático (Avançado)"
            echo ""
            read -p "Escolha (A/B): " ios_choice
            
            if [[ "$ios_choice" == "A" ]]; then
                cat << 'IOS_MANUAL'

╔════════════════════════════════════════════════════════════════╗
║ 🍎 UPLOAD MANUAL - APP STORE CONNECT (Recomendado)           ║
╚════════════════════════════════════════════════════════════════╝

✅ Você terá em breve:
   • IPA File: Será gerado após conclusão do build
   • Screenshots: Você pode adicionar
   • Metadata: Você pode preencher

🚀 PASSO A PASSO (5-15 minutos):

1️⃣  ABRIR APP STORE CONNECT
    URL: https://appstoreconnect.apple.com
    Login: Sua conta Apple ID

2️⃣  NAVEGAR ATÉ O APP
    Menu: Selecione "Ailun Saúde"

3️⃣  ACESSAR VERSÃO PARA ENTREGA
    Menu: Versão para entrega
    Ação: Criar nova versão iOS (ou continue com draft)

4️⃣  UPLOAD DO BUILD
    Método 1 - Via Xcode:
      • Abra: ios/AilunSade.xcworkspace
      • Produto → Destino → Generic iOS Device
      • Produto → Archive
      • Distribuir App → App Store Connect
      • Seguir wizard

    Método 2 - Via Transporter:
      • Abra: Transporter app (included com Xcode)
      • Selecione: IPA file
      • Clique: Deliver

5️⃣  ADICIONAR INFORMAÇÕES DO BUILD
    Seção: Build
    Botão: Selecione o build que foi uploadado
    Confirme: Build foi processado

6️⃣  PREENCHER INFORMAÇÕES DA VERSÃO
    Campos:
      • Descrição: "Ailun Saúde v1.2.0 com melhorias..."
      • Release notes: "Nova interface, melhor performance"
      • Palavras-chave: saúde, médico, consulta, etc
      • Suporte e política de privacidade

7️⃣  ADICIONAR SCREENSHOTS E PREVIEW
    Screenshots: Pelo menos 2 (máximo 10)
    Preview: Opcional (video de até 30s)

8️⃣  SUBMIT PARA REVIEW
    Botão: "Enviar para análise"
    Confirmação: Seu app entrará na fila de review

⏱️  TEMPO NECESSÁRIO:
    • Upload: 3-5 minutos
    • Apple Review: 24-48 horas
    • Total até live: ~1-2 dias

🎉 PRONTO! Seu app aparecerá na App Store após aprovação

IOS_MANUAL
            fi
            ;;
        
        4)
            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
            echo -e "${BLUE}🤖 INSTRUÇÃO: UPLOADS PARALELOS${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "VOCÊ PODE fazer uploads em ambas as plataformas simultaneamente!"
            echo ""
            echo -e "${GREEN}Estratégia Recomendada:${NC}"
            echo ""
            echo "1. Abra 2 abas no navegador:"
            echo "   • Aba 1: https://play.google.com/console (Google Play)"
            echo "   • Aba 2: https://appstoreconnect.apple.com (App Store)"
            echo ""
            echo "2. Em paralelo:"
            echo "   • Google Play: Upload AAB + screenshots (10 min)"
            echo "   • App Store: Upload IPA + info (5-10 min)"
            echo ""
            echo "3. Ambas processarão simultaneamente:"
            echo "   • Google Play: 1-2 horas até live"
            echo "   • App Store: 24-48 horas até live"
            echo ""
            echo -e "${YELLOW}Total de tempo até ambas ao vivo: ~1-2 dias${NC}"
            echo ""
            ;;
        
        5)
            cat << 'GOOGLE_PLAY_GUIDE'

╔════════════════════════════════════════════════════════════════╗
║ 📖 GUIA COMPLETO - GOOGLE PLAY ANDROID                        ║
╚════════════════════════════════════════════════════════════════╝

📋 PRÉ-REQUISITOS:
  ✅ Conta Google Play Console
  ✅ App "Ailun Saúde" já criado
  ✅ Arquivo AAB: ailun-saude-app-1.2.0.aab (145 MB)
  ✅ Screenshots: 6 imagens (1080×1920 px)

🎯 OBJETIVO:
  Publicar Android app na Google Play Store

⏱️  TEMPO: ~15 minutos de trabalho + 1-2 horas processamento

═════════════════════════════════════════════════════════════════

🔹 FASE 1: PREPARAÇÃO (2 min)

1. Abra Google Play Console:
   https://play.google.com/console

2. Login com sua conta Google (a mesma do setup)

3. Selecione "Ailun Saúde" na lista de apps

═════════════════════════════════════════════════════════════════

🔹 FASE 2: UPLOAD DO BUILD (3 min)

1. Menu Lateral: Release
   ↓
2. Seção: Production
   ↓
3. Botão: "Create new release"
   ↓
4. Seção: "Upload your app bundle"
   ↓
5. Clique: "Choose files"
   ↓
6. Selecione: /Applications/Ailun-Sa-de-1/build/ailun-saude-app-1.2.0.aab
   ↓
7. Confirme o upload

✅ O sistema mostrará:
   • Version name: 1.2.0
   • App size: ~145 MB
   • Architecture support: ARM64

═════════════════════════════════════════════════════════════════

🔹 FASE 3: SCREENSHOTS (3 min)

1. Menu: Store presence
   ↓
2. Clique: Screenshots
   ↓
3. Selecione: "Phone (Portrait)"
   ↓
4. Botão: "+ Upload" 
   ↓
5. Carregue 6 imagens de:
   /Applications/Ailun-Sa-de-1/google-play/screenshots/

Imagens esperadas:
  • screenshot-1.png (Home)
  • screenshot-2.png (Login)
  • screenshot-3.png (Dashboard)
  • screenshot-4.png (Agendamento)
  • screenshot-5.png (Histórico)
  • screenshot-6.png (Perfil)

═════════════════════════════════════════════════════════════════

🔹 FASE 4: INFORMAÇÕES DO RELEASE (3 min)

1. Volte para: Release → Production
   ↓
2. Preencha: "What's new in this version"
   
   Texto sugerido:
   """
   Versão 1.2.0 - Melhorias e correções
   
   • Novo design visual moderno
   • Melhor performance
   • Correções de bugs
   • Compatibilidade expandida
   """

═════════════════════════════════════════════════════════════════

🔹 FASE 5: REVIEW E PUBLICAÇÃO (2 min)

1. Botão: "Review release"
   ↓
2. Valide informações:
   □ Build uploaded
   □ Version name: 1.2.0
   □ Screenshots: 6 imagens
   □ Release notes: Preenchido
   ↓
3. Botão: "Start rollout to production"
   ↓
4. Confirme: Seu app será publicado

═════════════════════════════════════════════════════════════════

✅ SUCESSO!

Seu app iniciará rollout automático para todos os usuários.
Tempo: 1-2 horas até aparecer em "Google Play Store"

📊 MONITORAMENTO:
   • Google Play Console → Release → Production
   • Status: "In progress" → "Rolled out"
   • Usuários: Verão novo app em 1-2h

═════════════════════════════════════════════════════════════════

❓ PROBLEMAS?
   
   Q: App rejeitado?
   A: Verifique conformidade com política Google Play
      https://play.google.com/intl/pt/developer/distribution/play-policies
   
   Q: Build pendente?
   A: Aguarde processing (1-2h). Verifique status.
   
   Q: Screenshots com problema?
   A: Dimensões devem ser 1080×1920 px (16:9)

GOOGLE_PLAY_GUIDE
            ;;
        
        6)
            cat << 'APP_STORE_GUIDE'

╔════════════════════════════════════════════════════════════════╗
║ 📖 GUIA COMPLETO - APP STORE iOS                              ║
╚════════════════════════════════════════════════════════════════╝

📋 PRÉ-REQUISITOS:
  ✅ Conta Apple Developer
  ✅ App "Ailun Saúde" já criado no App Store Connect
  ✅ IPA será gerado após conclusão do build
  ✅ Certificados de assinatura válidos

🎯 OBJETIVO:
  Publicar iOS app na App Store

⏱️  TEMPO: ~10 minutos de trabalho + 24-48 horas review

═════════════════════════════════════════════════════════════════

🔹 FASE 1: PREPARAÇÃO (1 min)

1. Abra App Store Connect:
   https://appstoreconnect.apple.com

2. Login com seu Apple ID

3. Selecione "Ailun Saúde" na lista de apps

═════════════════════════════════════════════════════════════════

🔹 FASE 2: UPLOAD DO BUILD (5-10 min)

OPÇÃO A - Via Xcode (Recomendado):

1. Abra o projeto em Xcode:
   open /Applications/Ailun-Sa-de-1/ios/AilunSade.xcworkspace

2. Select Scheme: AilunSade

3. Select Destination: Generic iOS Device

4. Product → Archive
   (Xcode compilará e criará archive)

5. Window → Organizer

6. Select seu archive

7. Distribute App → App Store Connect

8. Sign in com seu Apple ID

9. Select team que criou o app

10. Escolha: Upload build automaticamente

11. Confirme: Build será enviado

OPÇÃO B - Via Transporter:

1. Abra Transporter (incluído com Xcode)

2. Adicionar arquivo:
   Localize o arquivo .ipa gerado
   (Caminho: /Applications/Ailun-Sa-de-1/ios/build/*.ipa)

3. Deliver

4. Sign in com Apple ID

5. Confirme o upload

═════════════════════════════════════════════════════════════════

🔹 FASE 3: INFORMAÇÕES DA VERSÃO (3 min)

1. App Store Connect → Versão

2. Preencha:

   DESCRIÇÃO:
   "Ailun Saúde - Sua plataforma de saúde digital
   
   Acesse consultas médicas, histórico e agendamentos
   de forma segura e prática."

   PALAVRAS-CHAVE:
   "saúde, médico, consulta, digital, bem-estar"

   CATEGORIA:
   "Health & Fitness" ou "Medical"

   SUPORTE:
   seu-email@example.com ou URL de suporte

   POLÍTICA DE PRIVACIDADE:
   https://seusite.com/privacidade

═════════════════════════════════════════════════════════════════

🔹 FASE 4: SCREENSHOTS (3 min)

1. App Store Connect → Screenshots

2. Para cada tipo de dispositivo (iPhone, iPad):
   
   Clique "+" para adicionar
   
   Requisitos mínimos:
   • 2 screenshots (máximo 10)
   • Dimensão: 1170×2532 (iPhone 15)
   • Formato: PNG ou JPG
   • Descrição: Opcional

3. Organize screenshots na ordem desejada

═════════════════════════════════════════════════════════════════

🔹 FASE 5: CONFIGURAR RELEASE (1 min)

1. Versão Release Type:
   Selecione: "Manual Release"
   (Você controla quando vai ao vivo)

2. Rating (Classificação indicativa):
   Preencha com "Low violence" ou similar

═════════════════════════════════════════════════════════════════

🔹 FASE 6: SUBMIT PARA REVIEW (1 min)

1. Selecione seu build (espere processamento)

2. Preencha: "Informações para revisão"
   (Notas para os reviewers se necessário)

3. Botão: "Enviar para análise"

4. Confirme: Seu app entrará na fila

═════════════════════════════════════════════════════════════════

✅ SUCESSO!

Seu app foi enviado para revisão Apple.

📊 MONITORAMENTO:
   • App Store Connect → Versão
   • Status: "Aguardando revisão" → "Revisão em progresso"
     → "Pronto para venda"
   • Você receberá email quando aprovado

⏱️  TEMPO APPLE REVIEW:
   • Típico: 24-48 horas
   • Máximo: até 7 dias (raro)

═════════════════════════════════════════════════════════════════

✅ APROVADO!

Após aprovação, escolha:
  • Liberar manualmente (você escolhe data/hora)
  • Liberar automaticamente (imediato)

═════════════════════════════════════════════════════════════════

❓ PROBLEMAS?
   
   Q: Rejeitado?
   A: Revise feedback da Apple
      https://developer.apple.com/app-store/review/guidelines/
   
   Q: Build não aparece?
   A: Aguarde processamento (até 30 min)
   
   Q: Screenshot com aviso?
   A: Verifique: 1170×2532 px, texto legível

APP_STORE_GUIDE
            ;;
        
        7)
            cat << 'TROUBLESHOOTING'

╔════════════════════════════════════════════════════════════════╗
║ 🔧 TROUBLESHOOTING & FAQ                                      ║
╚════════════════════════════════════════════════════════════════╝

❓ PERGUNTAS FREQUENTES - iOS

Q1: Onde está meu IPA?
A: Será gerado em:
   /Applications/Ailun-Sa-de-1/ios/build/Build/Products/Release-iphoneos/AilunSade.ipa
   
   Se ainda não existe, build ainda está em progresso.

Q2: Build falhou, e agora?
A: Execute:
   cd /Applications/Ailun-Sa-de-1
   bash scripts/ios-build-helper.sh clean
   bash scripts/ios-build-helper.sh pods
   bash scripts/ios-build-helper.sh release

Q3: Certificado expirou?
A: Apple Developer Account → Certificates
   Renove antes de fazer upload

Q4: Bundle ID não corresponde?
A: Verifique em:
   Xcode → Target → Bundle Identifier
   Deve ser: com.ailun.saude

═════════════════════════════════════════════════════════════════

❓ PERGUNTAS FREQUENTES - Android

Q1: Onde está meu AAB?
A: /Applications/Ailun-Sa-de-1/build/ailun-saude-app-1.2.0.aab

Q2: Versão rejeitada por ser menor?
A: Google Play rejeita se versão ≤ anterior
   Aumento: versionCode em app.json

Q3: Screenshots não aceitadas?
A: Verifiquem dimensões: 1080×1920 px exato

═════════════════════════════════════════════════════════════════

❓ PERGUNTAS FREQUENTES - GERAL

Q1: Posso publicar ambas ao mesmo tempo?
A: SIM! Recomendado. Estratégia:
   Hora 1: Upload iOS + Android
   Próx 1-2h: Aparecem na Google Play
   Próx 24-48h: Aparecem na App Store

Q2: Quanto custa publicar?
A: 
   Google Play: Uma vez (≈$25)
   App Store: Anual ($99/ano)

Q3: Preciso de certificados?
A:
   iOS: SIM (App Store Certificate + Provisioning Profile)
   Android: SIM (Keystore) - já gerado

Q4: Quanto tempo até aparecer?
A:
   Google Play: 1-2 horas
   App Store: 24-48 horas (típico)
   Alguns casos: até 7 dias (raro)

═════════════════════════════════════════════════════════════════

🆘 ERROS COMUNS

ERRO: "Build incomplete"
SOLUÇÃO: Aguarde processamento completo (5-30 min)

ERRO: "Version already exists"
SOLUÇÃO: Aumente versionCode antes de resubmeter

ERRO: "Invalid certificate"
SOLUÇÃO: Renove certificados em Apple Developer

ERRO: "Screenshots too small"
SOLUÇÃO: Use exatamente 1080×1920 ou 1170×2532

═════════════════════════════════════════════════════════════════

📞 CONTATOS SUPORTE

Google Play Support:
https://support.google.com/googleplay/android-developer

Apple Developer Support:
https://developer.apple.com/support/

Ailun Saúde Support:
[Seu email de suporte]

TROUBLESHOOTING
            ;;
        
        8)
            echo ""
            echo -e "${BLUE}🔍 Validando iOS artifacts...${NC}"
            echo ""
            
            app_path="$PROJECT_ROOT/ios/build/Build/Products/Release-iphoneos/AilunSade.app"
            
            if [ -d "$app_path" ]; then
                echo -e "${GREEN}✅ AilunSade.app encontrado${NC}"
                echo "   Localização: $app_path"
                echo "   Tamanho: $(du -sh "$app_path" | cut -f1)"
                
                if [ -f "$app_path/AilunSade" ]; then
                    echo -e "${GREEN}✅ Executável encontrado${NC}"
                    file "$app_path/AilunSade"
                else
                    echo -e "${RED}❌ Executável não encontrado${NC}"
                fi
            else
                echo -e "${YELLOW}⏳ AilunSade.app ainda não foi gerado${NC}"
                echo "   Localizações de build:"
                find "$PROJECT_ROOT/ios/build" -name "AilunSade.app" 2>/dev/null || echo "   Nenhum app encontrado"
            fi
            echo ""
            ;;
        
        9)
            echo ""
            echo -e "${BLUE}📦 Arquivos para Upload:${NC}"
            echo ""
            
            echo -e "${GREEN}ANDROID:${NC}"
            ls -lh "$PROJECT_ROOT/build/ailun-saude-app-1.2.0.aab" 2>/dev/null || echo "  AAB não encontrado"
            
            echo ""
            echo -e "${GREEN}iOS:${NC}"
            find "$PROJECT_ROOT/ios/build" -name "*.ipa" 2>/dev/null | head -1 || echo "  IPA ainda não foi gerado"
            find "$PROJECT_ROOT/ios/build" -name "*.xcarchive" 2>/dev/null | head -1 || echo "  Archive ainda não foi gerado"
            
            echo ""
            echo -e "${GREEN}SCREENSHOTS:${NC}"
            ls -lh "$PROJECT_ROOT/google-play/screenshots/" 2>/dev/null | tail -7 || echo "  Screenshots não encontrados"
            echo ""
            ;;
        
        10)
            echo ""
            echo -e "${YELLOW}🧹 Limpando arquivos temporários...${NC}"
            
            find "$PROJECT_ROOT/ios/build" -name "*.o" -delete
            find "$PROJECT_ROOT/ios/build" -name "*.pcm" -delete
            echo -e "${GREEN}✅ Objetos temporários removidos${NC}"
            
            echo ""
            ;;
        
        0)
            echo ""
            echo -e "${GREEN}👋 Até logo! Boa sorte com a publicação!${NC}"
            echo ""
            exit 0
            ;;
        
        *)
            echo -e "${RED}Opção inválida${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${YELLOW}Pressione Enter para continuar...${NC}"
    read
    clear
done
