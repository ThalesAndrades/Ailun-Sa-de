#!/bin/bash

#================================================================
# SCRIPT AUTOMÁTICO DE DEPLOY PARA TESTFLIGHT - AILUN SAÚDE
#================================================================
# Este script faz o rebuild completo do app com as correções
# implementadas e envia para o TestFlight
#================================================================

set -e # Parar em caso de erro

echo ""
echo "🚀 ====================================="
echo "   AILUN SAÚDE - DEPLOY TO TESTFLIGHT"
echo "====================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "app.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório raiz do projeto!${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Verificando dependências...${NC}"

# Verificar se EAS CLI está instalado
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠️  EAS CLI não encontrado. Instalando...${NC}"
    npm install -g eas-cli
else
    echo -e "${GREEN}✅ EAS CLI encontrado${NC}"
fi

echo ""
echo -e "${BLUE}🔐 Autenticando no Expo...${NC}"
echo "Email: thales@ailun.com.br"

# Tentar autenticar
eas whoami > /dev/null 2>&1 || {
    echo -e "${YELLOW}⚠️  Você precisa fazer login no Expo${NC}"
    echo "Execute: eas login"
    echo "Email: thales@ailun.com.br"
    echo "Senha: @Telemed123"
    echo ""
    echo "Após fazer login, execute este script novamente."
    exit 1
}

EXPO_USER=$(eas whoami)
echo -e "${GREEN}✅ Autenticado como: $EXPO_USER${NC}"

echo ""
echo -e "${BLUE}📦 Verificando configuração do projeto...${NC}"

# Verificar project info
eas project:info

echo ""
echo -e "${BLUE}🔍 Verificando últimas alterações...${NC}"

# Mostrar último commit
git log -1 --oneline

echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Certifique-se de que todas as alterações foram commitadas!${NC}"
echo ""

# Confirmar build
read -p "$(echo -e ${BLUE}Deseja iniciar o build para iOS Production? [y/N]: ${NC})" -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Build cancelado.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}🏗️  Iniciando build para iOS...${NC}"
echo ""

# Executar build
eas build --platform ios --profile production --non-interactive

echo ""
echo -e "${GREEN}✅ ====================================="
echo "   BUILD INICIADO COM SUCESSO!"
echo "=====================================${NC}"
echo ""
echo "🌐 Acompanhe o progresso em:"
echo "   https://expo.dev/accounts/thales-andrades/projects/ailun-saude-app/builds"
echo ""
echo "📱 O app será enviado automaticamente para o TestFlight quando pronto."
echo ""
echo -e "${BLUE}⏱️  Tempo estimado: 15-30 minutos${NC}"
echo ""
echo "Para ver o status:"
echo "   eas build:list --platform ios --limit 1"
echo ""
