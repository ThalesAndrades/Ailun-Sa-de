#!/bin/bash

#================================================================
# SCRIPT ULTRA-SIMPLIFICADO DE BUILD - AILUN SAÚDE
#================================================================
# Execute este script no SEU computador para fazer o build
#================================================================

set -e # Parar em caso de erro

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

clear

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}║         🚀 AILUN SAÚDE - BUILD AUTOMÁTICO 🚀          ║${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se está no diretório correto
if [ ! -f "app.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório raiz do projeto!${NC}"
    echo "   Navegue até o diretório Ailun-Sa-de e tente novamente."
    exit 1
fi

echo -e "${GREEN}✅ Diretório correto${NC}"
echo ""

# Verificar EAS CLI
echo -e "${BLUE}📋 Verificando EAS CLI...${NC}"
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠️  EAS CLI não encontrado. Instalando...${NC}"
    npm install -g eas-cli
    echo -e "${GREEN}✅ EAS CLI instalado${NC}"
else
    echo -e "${GREEN}✅ EAS CLI encontrado: $(eas --version)${NC}"
fi
echo ""

# Verificar autenticação
echo -e "${BLUE}🔐 Verificando autenticação...${NC}"
if eas whoami &> /dev/null; then
    EXPO_USER=$(eas whoami)
    echo -e "${GREEN}✅ Já autenticado como: $EXPO_USER${NC}"
else
    echo -e "${YELLOW}⚠️  Não autenticado. Iniciando login...${NC}"
    echo ""
    echo -e "${BLUE}Por favor, faça login:${NC}"
    echo -e "Email: ${GREEN}thales@ailun.com.br${NC}"
    echo -e "Senha: ${GREEN}@Telemed123${NC}"
    echo ""

    eas login

    if eas whoami &> /dev/null; then
        EXPO_USER=$(eas whoami)
        echo -e "${GREEN}✅ Login bem-sucedido! Usuário: $EXPO_USER${NC}"
    else
        echo -e "${RED}❌ Login falhou. Tente novamente.${NC}"
        exit 1
    fi
fi
echo ""

# Verificar projeto
echo -e "${BLUE}📦 Verificando configuração do projeto...${NC}"
PROJECT_INFO=$(eas project:info 2>&1)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Projeto configurado corretamente${NC}"
    echo "$PROJECT_INFO" | grep -E "(Project ID|Owner)" | sed 's/^/   /'
else
    echo -e "${RED}❌ Erro ao verificar projeto${NC}"
    echo "$PROJECT_INFO"
    exit 1
fi
echo ""

# Mostrar último commit
echo -e "${BLUE}📝 Último commit:${NC}"
git log -1 --oneline | sed 's/^/   /'
echo ""

# Confirmar build
echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║                                                        ║${NC}"
echo -e "${YELLOW}║  Você está prestes a iniciar o build para iOS         ║${NC}"
echo -e "${YELLOW}║  Tempo estimado: 20-30 minutos                         ║${NC}"
echo -e "${YELLOW}║                                                        ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
read -p "$(echo -e ${GREEN}Deseja continuar? [Y/n]: ${NC})" -n 1 -r
echo

if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}Build cancelado pelo usuário.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║            🏗️  INICIANDO BUILD PARA iOS 🏗️            ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Executar build
eas build --platform ios --profile production --non-interactive

BUILD_EXIT_CODE=$?

echo ""
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}║            ✅ BUILD INICIADO COM SUCESSO! ✅           ║${NC}"
    echo -e "${GREEN}║                                                        ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📊 Acompanhe o progresso:${NC}"
    echo ""
    echo "   🌐 Dashboard:"
    echo "   https://expo.dev/accounts/thales-andrades/projects/ailun-saude-app/builds"
    echo ""
    echo "   📟 Terminal:"
    echo "   eas build:list --platform ios --limit 1"
    echo ""
    echo -e "${YELLOW}⏱️  Tempo estimado: 20-30 minutos${NC}"
    echo ""
    echo -e "${BLUE}📱 O app será enviado automaticamente para o TestFlight quando pronto.${NC}"
    echo ""
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                        ║${NC}"
    echo -e "${RED}║              ❌ BUILD FALHOU ❌                        ║${NC}"
    echo -e "${RED}║                                                        ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dicas para resolver:${NC}"
    echo "   1. Verifique sua conexão com a internet"
    echo "   2. Execute: eas build:list para ver o erro completo"
    echo "   3. Tente novamente: ./build-agora.sh"
    echo ""
    exit 1
fi
