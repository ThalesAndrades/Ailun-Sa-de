#!/bin/bash

# 📦 Script para exportar .ipa do archive
# Uso: bash ios/export-ipa.sh

set -e

PROJECT_DIR="/Applications/Ailun-Sa-de-1"
cd "$PROJECT_DIR"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         📦 EXPORT .ipa — AILUN SAÚDE v1.2.0                 ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

ARCHIVE_PATH="ios/build/AilunSade.xcarchive"
EXPORT_PATH="ios/build/AilunSade.ipa"
EXPORT_OPTIONS="ios/exportOptions.plist"

echo "📋 Verificando pré-requisitos..."
echo ""

if [ ! -f "$EXPORT_OPTIONS" ]; then
    echo "❌ Erro: exportOptions.plist não encontrado"
    echo "   Criar em: $EXPORT_OPTIONS"
    exit 1
fi

if [ ! -d "$ARCHIVE_PATH" ]; then
    echo "❌ Erro: Archive não encontrado: $ARCHIVE_PATH"
    echo "   Execute primeiro: bash ios/simple-build.sh"
    exit 1
fi

echo "✅ Archive encontrado: $ARCHIVE_PATH"
echo "✅ Opções de export encontradas: $EXPORT_OPTIONS"
echo ""

echo "📋 Exportando .ipa..."
echo ""

# Criar diretório se não existir
mkdir -p "ios/build"

# Executar exportação
xcodebuild -exportArchive \
    -archivePath "$ARCHIVE_PATH" \
    -exportPath "ios/build" \
    -exportOptionsPlist "$EXPORT_OPTIONS" \
    2>&1 | tee "ios/build/export.log"

EXPORT_STATUS=$?

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ $EXPORT_STATUS -eq 0 ]; then
    echo "✅ EXPORT SUCESSO!"
    echo ""
    
    if [ -f "$EXPORT_PATH" ]; then
        SIZE=$(du -h "$EXPORT_PATH" | cut -f1)
        echo ".ipa criado:"
        echo "   $EXPORT_PATH"
        echo "   Tamanho: $SIZE"
        echo ""
        ls -lh "$EXPORT_PATH"
        echo ""
    else
        echo "⚠️  Arquivo .ipa não encontrado no caminho esperado"
        echo "   Procurando em: ios/build/"
        ls -lh ios/build/*.ipa 2>/dev/null || echo "   Nenhum .ipa encontrado"
    fi
    
    echo ""
    echo "Próximas ações:"
    echo "  1. Fazer upload para App Store Connect"
    echo "  2. Usar Transporter para publicar"
    echo ""
else
    echo "❌ EXPORT FALHOU (exit code: $EXPORT_STATUS)"
    echo ""
    echo "Verifique o log: ios/build/export.log"
    echo ""
    tail -50 "ios/build/export.log"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
