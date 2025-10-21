#!/bin/bash

# Build Helper Script para Ailun Saúde
# Este script automatiza o processo de build para iOS e Android com EAS

set -e

echo "🚀 Ailun Saúde - Build Helper"
echo "=============================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções
print_step() {
  echo -e "${BLUE}▶${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar se EAS CLI está instalado
check_eas() {
  print_step "Verificando EAS CLI..."
  if command -v eas &> /dev/null; then
    print_success "EAS CLI encontrado"
  else
    print_error "EAS CLI não encontrado"
    echo "Instale com: npm install -g eas-cli"
    exit 1
  fi
}

# Verificar dependências
check_deps() {
  print_step "Verificando dependências..."
  if [ ! -d "node_modules" ]; then
    print_error "node_modules não encontrado"
    echo "Execute: npm install --legacy-peer-deps"
    exit 1
  fi
  print_success "Dependências OK"
}

# Validar configuração
validate_config() {
  print_step "Validando configuração..."
  
  if [ ! -f "app.json" ]; then
    print_error "app.json não encontrado"
    exit 1
  fi
  
  if [ ! -f "eas.json" ]; then
    print_error "eas.json não encontrado"
    exit 1
  fi
  
  if [ ! -f "tsconfig.json" ]; then
    print_error "tsconfig.json não encontrado"
    exit 1
  fi
  
  print_success "Arquivos de config OK"
}

# Build iOS
build_ios() {
  print_step "Iniciando build iOS (production)..."
  echo ""
  
  check_eas
  
  print_warning "Pré-requisitos:"
  echo "  - Apple Developer Account ativa"
  echo "  - eas login && eas credentials executado"
  echo ""
  
  read -p "Continuar com build iOS? (s/n) " -n 1 -r
  echo
  
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    eas build -p ios --profile production
    print_success "Build iOS iniciado! Acompanhe em: https://expo.dev/dashboard"
  else
    print_warning "Build iOS cancelado"
  fi
}

# Build Android
build_android() {
  print_step "Iniciando build Android (production)..."
  echo ""
  
  check_eas
  
  print_warning "Pré-requisitos:"
  echo "  - Google Play Service Account JSON (./google-play-service-account.json)"
  echo "  - eas credentials configurado para Android"
  echo ""
  
  read -p "Continuar com build Android? (s/n) " -n 1 -r
  echo
  
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    eas build -p android --profile production
    print_success "Build Android iniciado! Acompanhe em: https://expo.dev/dashboard"
  else
    print_warning "Build Android cancelado"
  fi
}

# Build ambos
build_both() {
  print_step "Iniciando builds iOS + Android..."
  echo ""
  
  read -p "Confirmar build para iOS e Android? (s/n) " -n 1 -r
  echo
  
  if [[ $REPLY =~ ^[Ss]$ ]]; then
    build_ios
    echo ""
    build_android
  else
    print_warning "Build cancelado"
  fi
}

# Menu
show_menu() {
  echo ""
  echo "O que deseja fazer?"
  echo "1. Build iOS"
  echo "2. Build Android"
  echo "3. Build iOS + Android"
  echo "4. Apenas validar configuração"
  echo "5. Sair"
  echo ""
}

# Main
check_deps
validate_config

while true; do
  show_menu
  read -p "Escolha uma opção (1-5): " choice
  
  case $choice in
    1)
      build_ios
      ;;
    2)
      build_android
      ;;
    3)
      build_both
      ;;
    4)
      print_success "Configuração validada!"
      ;;
    5)
      echo "Até logo! 👋"
      exit 0
      ;;
    *)
      print_error "Opção inválida"
      ;;
  esac
done
