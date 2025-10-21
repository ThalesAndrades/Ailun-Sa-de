#!/bin/bash
# Build script para Xcode — Ailun Saúde

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Ailun Saúde — Build Script para Xcode"
echo "========================================="
echo ""

# Verificar dependências
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Erro: xcodebuild não encontrado"
    echo "   Instale Xcode: https://apps.apple.com/us/app/xcode/id497799835"
    exit 1
fi

if ! command -v pod &> /dev/null; then
    echo "❌ Erro: CocoaPods não encontrado"
    echo "   Instale: sudo gem install cocoapods"
    exit 1
fi

# Menu
echo "Escolha uma opção:"
echo "1) Build para Simulator (Debug)"
echo "2) Build para Device Físico (Debug)"
echo "3) Build para Simulator (Release)"
echo "4) Limpar build e reconstruir"
echo "5) Abrir Xcode"
echo "6) Sair"
echo ""
read -p "Opção (1-6): " option

case $option in
    1)
        echo "📱 Building para iPhone Simulator..."
        xcodebuild -workspace ios/AilunSade.xcworkspace \
            -scheme AilunSade \
            -configuration Debug \
            -sdk iphonesimulator \
            -derivedDataPath build \
            BUILD_DIR=build
        echo "✅ Build completado!"
        echo ""
        read -p "Deseja executar agora? (s/n): " run
        if [[ $run == "s" ]]; then
            open build/Debug-iphonesimulator/AilunSade.app
        fi
        ;;
    2)
        echo "📱 Building para Device Físico..."
        echo "Certifique-se que seu device está conectado"
        xcodebuild -workspace ios/AilunSade.xcworkspace \
            -scheme AilunSade \
            -configuration Debug \
            -sdk iphoneos \
            -derivedDataPath build
        echo "✅ Build completado!"
        echo "Conecte seu device e pressione Cmd+R no Xcode"
        ;;
    3)
        echo "📦 Building para Simulator (Release)..."
        xcodebuild -workspace ios/AilunSade.xcworkspace \
            -scheme AilunSade \
            -configuration Release \
            -sdk iphonesimulator \
            -derivedDataPath build
        echo "✅ Build Release completado!"
        ;;
    4)
        echo "🧹 Limpando build anterior..."
        xcodebuild clean -workspace ios/AilunSade.xcworkspace \
            -scheme AilunSade
        rm -rf build ios/build ios/Pods
        echo "🔄 Reinstalando CocoaPods..."
        cd ios
        pod install
        cd ..
        echo "✅ Limpeza concluída!"
        ;;
    5)
        echo "📂 Abrindo Xcode..."
        open ios/AilunSade.xcworkspace
        ;;
    6)
        echo "👋 Até logo!"
        exit 0
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "Para informações completas, veja: XCODE_BUILD_GUIDE.md"
