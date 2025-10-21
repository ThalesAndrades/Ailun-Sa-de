#!/bin/bash

# 🎯 iOS BUILD + APPLE CONNECT SYNC
# Execute este script e acompanhe pelo Apple Connect

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║              🍎 iOS BUILD + APPLE CONNECT SYNC — AILUN SAÚDE                 ║
║                                                                                ║
║                  Execute este script E abra Apple Connect em paralelo          ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝


⚡ COMECE AGORA: 3 PASSOS SIMULTÂNEOS
═══════════════════════════════════════════════════════════════════════════════

PASSO 1: Abra Apple Connect (este browser)
   🔗 https://appstoreconnect.apple.com
   
   Faça login com:
   • Email: Seu Apple ID
   • Password: Sua senha
   • 2FA: Se necessário

   Vá para: My Apps → Ailun Saúde → TestFlight


PASSO 2: Copie e execute este comando NO TERMINAL
───────────────────────────────────────────────────────────────────────────────

cd /Applications/Ailun-Sa-de-1 && \
xcodebuild archive \
  -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -destination "generic/platform=iOS" \
  -archivePath "ios/build/AilunSade.xcarchive" \
  -derivedDataPath "ios/build/DerivedData" \
  -configuration Release \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  COMPILER_INDEX_STORE_ENABLE=NO \
  2>&1 | tee ios/build/build.log


PASSO 3: Acompanhe no Apple Connect
   ✅ Abra em nova aba: https://appstoreconnect.apple.com
   ✅ Meu Apps → Ailun Saúde
   ✅ Compilações/Builds (procure a nova versão)
   ✅ Aguarde upload automático (5-10 min)
   ✅ Quando terminar, você verá "Ready to Test"


═══════════════════════════════════════════════════════════════════════════════

📋 CHECKLIST ENQUANTO O BUILD RODA
═══════════════════════════════════════════════════════════════════════════════

Enquanto o build está compilando (5-10 minutos):

[ ] 1. Copie o comando acima
[ ] 2. Cole NO TERMINAL (não no browser)
[ ] 3. Aperte Enter
[ ] 4. Abra Apple Connect em NOVO TAB
[ ] 5. Faça login
[ ] 6. Vá para "My Apps" → "Ailun Saúde"
[ ] 7. Clique em "TestFlight"
[ ] 8. Procure "Builds" na seção "iOS App"
[ ] 9. Acompanhe o progresso
[ ] 10. Quando terminar no terminal (✅ BUILD SUCESSO), 
        será enviado automaticamente para Apple Connect


═══════════════════════════════════════════════════════════════════════════════

🔍 O QUE OBSERVAR NO APPLE CONNECT
═══════════════════════════════════════════════════════════════════════════════

Status Esperado (em ordem):

1. "Processing" ou "Waiting"
   → Build está sendo processado pela Apple
   → Tempo: 5-30 minutos

2. "Ready to Test"
   → ✅ Build foi aprovado
   → Você pode iniciar testes

3. "Feedback" (opcional)
   → Se houver erro, mostra aqui

4. "Rejected" (improvável)
   → Se tiver erro de assinatura
   → Mostra detalhes do erro


═══════════════════════════════════════════════════════════════════════════════

⏱️ TIMELINE ESPERADA
═══════════════════════════════════════════════════════════════════════════════

Local (seu Mac):
   Compilation: 3-5 minutos
   Upload: 2-5 minutos
   Total: ~8 minutos

Apple Servers:
   Processing: 5-30 minutos
   (você verá progresso no Connect)

Visível no Connect:
   "Processing" → "Ready to Test" → Pronto!


═══════════════════════════════════════════════════════════════════════════════

🛠️ SE HOUVER ERRO
═══════════════════════════════════════════════════════════════════════════════

No Terminal (saída):
   ❌ Erro com "exit code 65"?
      → Copie o erro completo
      → Mostra exatamente o problema

No Apple Connect (após upload):
   ❌ "Rejected" ou "Feedback"?
      → Clique em "View Details"
      → Mostra motivo do erro
      → Mensagens são bem específicas


═══════════════════════════════════════════════════════════════════════════════

✅ SUCESSO: O QUE FAZER DEPOIS
═══════════════════════════════════════════════════════════════════════════════

1. Build termina no terminal (você vê "✅ BUILD SUCESSO!")

2. Você abrirá um link automático ou receberá notificação no Connect

3. No Connect, você verá "Ready to Test"

4. Próximas ações:
   
   Opção A: Publicar direto
   • Ir para "Prepare for Submission"
   • Preencher metadados (descrição, screenshots)
   • Submit para review
   
   Opção B: Testar com TestFlight
   • Convide testadores
   • Eles testam antes da publicação
   • Depois você submete


═══════════════════════════════════════════════════════════════════════════════

📱 LINKS RÁPIDOS
═══════════════════════════════════════════════════════════════════════════════

Apple Connect (login):
   https://appstoreconnect.apple.com

Ailun Saúde App:
   https://appstoreconnect.apple.com/apps

TestFlight:
   https://appstoreconnect.apple.com/apps/YOUR_APP_ID/testflight/

Documentação:
   https://help.apple.com/app-store-connect/


═══════════════════════════════════════════════════════════════════════════════

💡 DICA: MONITORAR PELO TERMINAL
═══════════════════════════════════════════════════════════════════════════════

Se não quiser abrir browser, monitore os logs:

# Ver build em tempo real
tail -f /Applications/Ailun-Sa-de-1/ios/build/build.log

# Quando terminar com sucesso, você verá:
# ✅ BUILD SUCESSO!
# Archive criado em: /Applications/Ailun-Sa-de-1/ios/build/AilunSade.xcarchive


═══════════════════════════════════════════════════════════════════════════════

🎯 RESUMO: 3 COISAS QUE VOCÊ PRECISA FAZER
═══════════════════════════════════════════════════════════════════════════════

1. COPIE E EXECUTE o comando no terminal
   (Seção "PASSO 2" acima)

2. ABRA Apple Connect em paralelo
   https://appstoreconnect.apple.com

3. ACOMPANHE o status (5-30 minutos)

Tudo mais é automático! 🚀


═══════════════════════════════════════════════════════════════════════════════

EOF

# Agora execute o build automaticamente
echo ""
echo "🚀 INICIANDO BUILD AGORA..."
echo ""
echo "Pressione ENTER para continuar"
read -r

cd /Applications/Ailun-Sa-de-1

xcodebuild archive \
  -workspace ios/AilunSade.xcworkspace \
  -scheme AilunSade \
  -destination "generic/platform=iOS" \
  -archivePath "ios/build/AilunSade.xcarchive" \
  -derivedDataPath "ios/build/DerivedData" \
  -configuration Release \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  COMPILER_INDEX_STORE_ENABLE=NO \
  2>&1 | tee ios/build/build.log

BUILD_STATUS=$?

echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ BUILD CONCLUÍDO COM SUCESSO!"
    echo ""
    echo "Próximas ações:"
    echo "1. Abra Apple Connect:"
    echo "   https://appstoreconnect.apple.com/apps"
    echo ""
    echo "2. Vá para 'My Apps' → 'Ailun Saúde'"
    echo ""
    echo "3. Clique em 'TestFlight' e aguarde o build aparecer"
    echo ""
    echo "O build será enviado automaticamente para Apple!"
    echo ""
else
    echo "❌ BUILD FALHOU (exit code: $BUILD_STATUS)"
    echo ""
    echo "Verifique os erros acima"
    echo ""
    echo "Log completo em: ios/build/build.log"
    echo ""
fi

echo "════════════════════════════════════════════════════════════════════════════════"
