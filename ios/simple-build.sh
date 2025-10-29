#!/bin/bash

# 🔨 iOS Build Script Simples (sem problemas de assinatura)
# Funciona com Expo + Xcode

set -e

PROJECT_DIR="/Applications/Ailun-Sa-de-1"
cd "$PROJECT_DIR"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║         🔨 BUILD iOS — AILUN SAÚDE v1.2.0                   ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Passo 1: Verificar pré-requisitos
echo "📋 Passo 1: Verificando pré-requisitos..."
echo ""

if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Erro: xcodebuild não encontrado"
    echo "   Instale Xcode Command Line Tools: xcode-select --install"
    exit 1
fi

if ! command -v pod &> /dev/null; then
    echo "❌ Erro: CocoaPods não encontrado"
    echo "   Instale: sudo gem install cocoapods"
    exit 1
fi

echo "✅ xcodebuild: $(xcodebuild -version | head -1)"
echo "✅ CocoaPods: $(pod --version)"
echo ""

# Passo 2: Setup do projeto Expo
echo "📋 Passo 2: Preparando projeto React Native..."
echo ""

if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado"
    exit 1
fi

echo "✅ package.json encontrado"
echo ""

# Passo 3: Limpar builds anteriores
echo "📋 Passo 3: Limpando builds anteriores..."
echo ""

if [ -d "ios/Pods" ]; then
    echo "🧹 Removendo: ios/Pods"
    rm -rf ios/Pods
fi

if [ -f "ios/Podfile.lock" ]; then
    echo "🧹 Removendo: ios/Podfile.lock"
    rm ios/Podfile.lock
fi

echo "✅ Limpeza concluída"
echo ""

# Passo 4: Instalar dependências
echo "📋 Passo 4: Instalando CocoaPods..."
echo ""

cd ios

if [ ! -f "Podfile" ]; then
    echo "❌ Erro: Podfile não encontrado em ios/"
    exit 1
fi

echo "Executando: pod install"
pod install --repo-update

echo "✅ CocoaPods instalado"
echo ""

cd ..

# Passo 5: Build com Xcode
echo "📋 Passo 5: Compilando com Xcode..."
echo ""

WORKSPACE="ios/AilunSade.xcworkspace"
SCHEME="AilunSade"
BUILD_DIR="ios/build"
ARCHIVE_PATH="$BUILD_DIR/AilunSade.xcarchive"

if [ ! -d "$WORKSPACE" ]; then
    echo "❌ Erro: Workspace não encontrado: $WORKSPACE"
    exit 1
fi

# Criar diretório de build
mkdir -p "$BUILD_DIR"

echo "Workspace: $WORKSPACE"
echo "Scheme: $SCHEME"
echo "Archive Path: $ARCHIVE_PATH"
echo ""

# Build archive
echo "🔨 Compilando archive..."
echo ""

xcodebuild archive \
    -workspace "$WORKSPACE" \
    -scheme "$SCHEME" \
    -destination generic/platform=iOS \
    -archivePath "$ARCHIVE_PATH" \
    -derivedDataPath "$BUILD_DIR/DerivedData" \
    -configuration Release \
    CODE_SIGN_IDENTITY="" \
    CODE_SIGNING_REQUIRED=NO \
    COMPILER_INDEX_STORE_ENABLE=NO \
    2>&1 | tee "$BUILD_DIR/build.log"

BUILD_STATUS=$?

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ BUILD SUCESSO!"
    echo ""
    echo "Archive criado em:"
    echo "   $ARCHIVE_PATH"
    echo ""
    ls -lh "$ARCHIVE_PATH"
    echo ""
    echo "Próximas ações:"
    echo "  1. Adicionar certificados de assinatura"
    echo "  2. Exportar para .ipa"
    echo "  3. Fazer upload para App Store Connect"
    echo ""
else
    echo "❌ BUILD FALHOU (exit code: $BUILD_STATUS)"
    echo ""
    echo "Verifique o log: $BUILD_DIR/build.log"
    echo ""
    tail -50 "$BUILD_DIR/build.log"
    exit 1
fi

echo "═══════════════════════════════════════════════════════════════"
