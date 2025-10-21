#!/bin/bash

# 🎯 Build & Export iOS — Usando Expo EAS (Recomendado)
# Mais fácil que xcodebuild para App Store

set -e

PROJECT_DIR="/Applications/Ailun-Sa-de-1"
cd "$PROJECT_DIR"

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║    🎯 BUILD iOS (App Store Ready) — AILUN SAÚDE v1.2.0      ║"
echo "║                                                               ║"
echo "║                   Usando Expo EAS Build                      ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "✅ O método EAS Build é RECOMENDADO porque:"
echo "   • Certifica automaticamente com Apple"
echo "   • Não precisa de certificados locais"
echo "   • Gera .ipa pronto para App Store"
echo "   • Compatível com CI/CD"
echo ""

echo "Verificando se EAS CLI está instalado..."
echo ""

if ! command -v eas &> /dev/null; then
    echo "📦 Instalando EAS CLI..."
    npm install -g eas-cli
fi

eas_version=$(eas --version)
echo "✅ EAS CLI: $eas_version"
echo ""

# Verificar eas.json
if [ ! -f "eas.json" ]; then
    echo "❌ Erro: eas.json não encontrado"
    echo "   Criar com: eas build:configure"
    exit 1
fi

echo "✅ eas.json encontrado"
echo ""

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Pré-requisitos para Expo EAS Build:                         ║"
echo "║                                                               ║"
echo "║  1. Conta na Expo (https://expo.dev)                         ║"
echo "║  2. Login: eas login                                          ║"
echo "║  3. Apple Developer Account (para assinatura)                ║"
echo "║                                                               ║"
echo "║  Documentação: https://docs.expo.dev/build/setup/            ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 OPÇÃO 1: Build interno (ad-hoc, local signing)"
echo "   Comando: eas build --platform ios --profile preview"
echo ""
echo "📋 OPÇÃO 2: Build para App Store (production)"
echo "   Comando: eas build --platform ios --profile production"
echo ""

read -p "Qual opção escolher? (1 ou 2): " OPTION

case $OPTION in
    1)
        echo ""
        echo "🔨 Building para ad-hoc (testing)..."
        echo ""
        eas build --platform ios --profile preview
        ;;
    2)
        echo ""
        echo "🔨 Building para App Store (production)..."
        echo ""
        eas build --platform ios --profile production
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Build submetido ao Expo EAS!"
echo ""
echo "Verifique o progresso em: https://expo.dev/builds"
echo "═══════════════════════════════════════════════════════════════"
