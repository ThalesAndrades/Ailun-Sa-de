#!/bin/bash

# 🔨 iOS Build Archive — Versão Corrigida
# Executa xcodebuild archive com paths corretos

set -e

# Usar paths locais (não /Volumes/workspace/)
PROJECT_DIR="/Applications/Ailun-Sa-de-1"
WORKSPACE="$PROJECT_DIR/ios/AilunSade.xcworkspace"
BUILD_DIR="$PROJECT_DIR/ios/build"
ARCHIVE_PATH="$BUILD_DIR/AilunSade.xcarchive"
DERIVED_DATA="$BUILD_DIR/DerivedData"
RESULT_BUNDLE="$BUILD_DIR/resultbundle.xcresult"

cd "$PROJECT_DIR"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║        🔨 iOS ARCHIVE BUILD — AILUN SAÚDE v1.2.0            ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Verificando pré-requisitos..."
echo ""

if [ ! -d "$WORKSPACE" ]; then
    echo "❌ Erro: Workspace não encontrado: $WORKSPACE"
    exit 1
fi
echo "✅ Workspace: $WORKSPACE"

if [ ! -f "$WORKSPACE/contents.xcworkspacedata" ]; then
    echo "❌ Erro: Workspace inválido"
    exit 1
fi
echo "✅ Workspace válido"

# Criar diretórios
mkdir -p "$BUILD_DIR" "$DERIVED_DATA"
echo "✅ Diretórios criados"
echo ""

echo "📋 Executando xcodebuild archive..."
echo ""
echo "Workspace: $WORKSPACE"
echo "Scheme: AilunSade"
echo "Archive Path: $ARCHIVE_PATH"
echo ""

# Comando de build com paths corretos
xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme AilunSade \
    -destination "generic/platform=iOS" \
    -archivePath "$ARCHIVE_PATH" \
    -derivedDataPath "$DERIVED_DATA" \
    -resultBundlePath "$RESULT_BUNDLE" \
    -configuration Release \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    COMPILER_INDEX_STORE_ENABLE=NO \
    2>&1 | tee "$BUILD_DIR/xcodebuild.log"

BUILD_STATUS=$?

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ BUILD SUCESSO!"
    echo ""
    
    if [ -d "$ARCHIVE_PATH" ]; then
        SIZE=$(du -sh "$ARCHIVE_PATH" | cut -f1)
        echo "Archive criado:"
        echo "  $ARCHIVE_PATH"
        echo "  Tamanho: $SIZE"
        echo ""
        echo "Próximas ações:"
        echo "  1. Exportar .ipa:"
        echo "     xcodebuild -exportArchive -archivePath '$ARCHIVE_PATH' \\"
        echo "       -exportPath '$BUILD_DIR' \\"
        echo "       -exportOptionsPlist 'ios/exportOptions.plist'"
        echo ""
        echo "  2. Upload para App Store Connect"
        echo ""
    else
        echo "⚠️  Archive não encontrado em: $ARCHIVE_PATH"
    fi
else
    echo "❌ BUILD FALHOU (exit code: $BUILD_STATUS)"
    echo ""
    echo "Log completo em: $BUILD_DIR/xcodebuild.log"
    echo ""
    echo "Últimas 50 linhas do log:"
    tail -50 "$BUILD_DIR/xcodebuild.log"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
