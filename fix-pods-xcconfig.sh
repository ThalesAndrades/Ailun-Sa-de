#!/bin/bash

# 🔧 Corrigir Erro de Configuração Pods xcconfig
# Erro: "Unable to open base configuration reference file"

set -e

PROJECT_DIR="/Applications/Ailun-Sa-de-1"
cd "$PROJECT_DIR"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║     🔧 CORRIGINDO ERRO: Pods xcconfig Configuration         ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "Passo 1: Limpando Pods anterior..."
cd ios
rm -rf Pods Podfile.lock build DerivedData .build-cache
cd ..
echo "✅ Pods limpo"
echo ""

echo "Passo 2: Limpando cache Xcode..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*AilunSade*
echo "✅ Cache limpo"
echo ""

echo "Passo 3: Reinstalando Pods com configurações corretas..."
cd ios
pod repo update
pod install --repo-update
cd ..
echo "✅ Pods reinstalado"
echo ""

echo "Passo 4: Verificando estrutura Pods..."
if [ -d "ios/Pods" ]; then
    echo "✅ ios/Pods criado"
    PODS_COUNT=$(find ios/Pods -name "*.xcconfig" | wc -l)
    echo "   Arquivos xcconfig encontrados: $PODS_COUNT"
else
    echo "❌ Erro: ios/Pods não foi criado"
    exit 1
fi
echo ""

echo "Passo 5: Validando Podfile.lock..."
if [ -f "ios/Podfile.lock" ]; then
    echo "✅ ios/Podfile.lock criado"
    PODS_LISTED=$(grep -c "PODS:" ios/Podfile.lock || echo "0")
    echo "   Pods no lock: $PODS_LISTED"
else
    echo "❌ Erro: ios/Podfile.lock não foi criado"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "✅ CORREÇÃO CONCLUÍDA!"
echo ""
echo "Próximas ações:"
echo "  1. Abra Xcode novamente:"
echo "     open -a Xcode ios/AilunSade.xcworkspace"
echo ""
echo "  2. Ou faça build via CLI:"
echo "     cd /Applications/Ailun-Sa-de-1"
echo "     npm run ios"
echo ""
echo "═══════════════════════════════════════════════════════════════"
