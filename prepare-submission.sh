#!/bin/bash

##############################################
# Script de Preparação para Submissão
# Ailun Saúde - Modo Demo
# Versão: 1.0
# Data: 04/11/2025
##############################################

set -e  # Parar em caso de erro

echo "================================================"
echo "🚀 PREPARAÇÃO PARA SUBMISSÃO - AILUN SAÚDE"
echo "================================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar se estamos no diretório correto
echo "📁 Verificando diretório do projeto..."
if [ ! -f "package.json" ]; then
    print_error "Erro: package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi
print_success "Diretório correto"
echo ""

# 2. Verificar Node.js e npm
echo "🔧 Verificando Node.js e npm..."
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado"
    exit 1
fi
NODE_VERSION=$(node --version)
print_success "Node.js: $NODE_VERSION"

if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado"
    exit 1
fi
NPM_VERSION=$(npm --version)
print_success "npm: $NPM_VERSION"
echo ""

# 3. Ativar modo demo
echo "🎭 Ativando modo demo..."
if [ -f ".env.demo" ]; then
    cp .env.demo .env
    print_success "Arquivo .env.demo copiado para .env"
else
    print_warning "Arquivo .env.demo não encontrado. Usando .env existente."
fi
echo ""

# 4. Verificar dependências
echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules não encontrado. Instalando dependências..."
    npm install
    print_success "Dependências instaladas"
else
    print_success "node_modules existe"
fi
echo ""

# 5. Verificar Expo CLI
echo "🔍 Verificando Expo CLI..."
if ! npx expo --version &> /dev/null; then
    print_error "Expo CLI não está funcionando corretamente"
    exit 1
fi
EXPO_VERSION=$(npx expo --version)
print_success "Expo CLI: $EXPO_VERSION"
echo ""

# 6. Verificar EAS CLI
echo "🔍 Verificando EAS CLI..."
if ! npx eas-cli --version &> /dev/null; then
    print_warning "EAS CLI não encontrado. Será instalado automaticamente quando necessário."
else
    EAS_VERSION=$(npx eas-cli --version | head -n 1)
    print_success "EAS CLI: $EAS_VERSION"
fi
echo ""

# 7. Verificar app.json
echo "📄 Verificando app.json..."
if [ ! -f "app.json" ]; then
    print_error "app.json não encontrado"
    exit 1
fi

APP_NAME=$(grep -o '"name": "[^"]*' app.json | grep -o '[^"]*$' | head -n 1)
APP_VERSION=$(grep -o '"version": "[^"]*' app.json | grep -o '[^"]*$')
print_success "App: $APP_NAME"
print_success "Versão: $APP_VERSION"
echo ""

# 8. Verificar eas.json
echo "📄 Verificando eas.json..."
if [ ! -f "eas.json" ]; then
    print_error "eas.json não encontrado"
    exit 1
fi
print_success "eas.json encontrado"
echo ""

# 9. Verificar assets
echo "🎨 Verificando assets..."
MISSING_ASSETS=0

if [ ! -f "assets/icon.png" ]; then
    print_warning "assets/icon.png não encontrado"
    MISSING_ASSETS=$((MISSING_ASSETS + 1))
else
    print_success "Icon encontrado"
fi

if [ ! -f "assets/splash.png" ]; then
    print_warning "assets/splash.png não encontrado"
    MISSING_ASSETS=$((MISSING_ASSETS + 1))
else
    print_success "Splash screen encontrado"
fi

if [ ! -f "assets/adaptive-icon.png" ]; then
    print_warning "assets/adaptive-icon.png não encontrado"
    MISSING_ASSETS=$((MISSING_ASSETS + 1))
else
    print_success "Adaptive icon encontrado"
fi

if [ $MISSING_ASSETS -gt 0 ]; then
    print_warning "$MISSING_ASSETS asset(s) faltando"
fi
echo ""

# 10. Verificar screenshots
echo "📸 Verificando screenshots..."
SCREENSHOT_DIR="assets/app-store/screenshots"
if [ -d "$SCREENSHOT_DIR" ]; then
    SCREENSHOT_COUNT=$(ls -1 "$SCREENSHOT_DIR"/*.png 2>/dev/null | wc -l)
    if [ $SCREENSHOT_COUNT -ge 3 ]; then
        print_success "$SCREENSHOT_COUNT screenshots encontrados"
    else
        print_warning "Apenas $SCREENSHOT_COUNT screenshots encontrados (recomendado: 3+)"
    fi
else
    print_warning "Diretório de screenshots não encontrado"
fi
echo ""

# 11. Verificar arquivos de documentação
echo "📚 Verificando documentação..."
DOC_FILES=("DEMO_MODE_GUIDE.md" "DEMO_SUBMISSION_CHECKLIST.md" "README.md")
for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        print_success "$doc encontrado"
    else
        print_warning "$doc não encontrado"
    fi
done
echo ""

# 12. Verificar variáveis de ambiente
echo "🔐 Verificando variáveis de ambiente..."
if [ -f ".env" ]; then
    if grep -q "EXPO_PUBLIC_DEMO_MODE=true" .env; then
        print_success "Modo demo ativado"
    else
        print_warning "Modo demo pode não estar ativado corretamente"
    fi
    
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
        print_success "Supabase URL configurado"
    else
        print_warning "Supabase URL não encontrado"
    fi
else
    print_error "Arquivo .env não encontrado"
fi
echo ""

# 13. Resumo
echo "================================================"
echo "📊 RESUMO DA VERIFICAÇÃO"
echo "================================================"
echo ""
echo "✅ Projeto: $APP_NAME"
echo "✅ Versão: $APP_VERSION"
echo "✅ Node.js: $NODE_VERSION"
echo "✅ Expo CLI: $EXPO_VERSION"
echo ""

# 14. Próximos passos
echo "================================================"
echo "🎯 PRÓXIMOS PASSOS"
echo "================================================"
echo ""
echo "1. Login no EAS (se ainda não fez):"
echo "   npx eas-cli login"
echo ""
echo "2. Build para iOS:"
echo "   npx eas-cli build --platform ios --profile production"
echo ""
echo "3. Build para Android:"
echo "   npx eas-cli build --platform android --profile production"
echo ""
echo "4. Submeter para App Store:"
echo "   npx eas-cli submit --platform ios --profile production"
echo ""
echo "5. Submeter para Google Play:"
echo "   npx eas-cli submit --platform android --profile production"
echo ""
echo "================================================"
echo ""

print_success "Preparação concluída! O projeto está pronto para submissão."
echo ""
echo "📖 Para mais detalhes, consulte:"
echo "   - DEMO_MODE_GUIDE.md"
echo "   - DEMO_SUBMISSION_CHECKLIST.md"
echo ""
