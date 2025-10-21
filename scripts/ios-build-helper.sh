#!/bin/bash

# 🍎 Ailun Saúde - iOS Build Helper Script
# Automatiza o processo de build para iOS
# Uso: ./scripts/ios-build-helper.sh [debug|release|archive|clean]

set -e

PROJECT_ROOT="/Applications/Ailun-Sa-de-1"
IOS_DIR="$PROJECT_ROOT/ios"
WORKSPACE="$IOS_DIR/AilunSade.xcworkspace"
SCHEME="AilunSade"
DERIVED_DATA="$IOS_DIR/build"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}🍎 Ailun Saúde - iOS Build Helper${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_prerequisites() {
    print_info "Verificando pré-requisitos..."
    
    # Verificar Xcode
    if ! command -v xcodebuild &> /dev/null; then
        print_error "xcodebuild não encontrado. Instale Xcode."
        exit 1
    fi
    print_success "xcodebuild encontrado"
    
    # Verificar CocoaPods
    if ! command -v pod &> /dev/null; then
        print_error "CocoaPods não encontrado. Execute: sudo gem install cocoapods"
        exit 1
    fi
    print_success "CocoaPods encontrado"
    
    # Verificar workspace
    if [ ! -d "$WORKSPACE" ]; then
        print_error "Workspace não encontrado: $WORKSPACE"
        exit 1
    fi
    print_success "Workspace encontrado"
    
    # Verificar Podfile.lock
    if [ ! -f "$IOS_DIR/Podfile.lock" ]; then
        print_warning "Podfile.lock não encontrado. Executando pod install..."
        cd "$IOS_DIR"
        pod install
        cd "$PROJECT_ROOT"
    fi
    print_success "Dependências prontas"
    
    echo ""
}

clean_build() {
    print_info "Limpando build anterior..."
    
    rm -rf "$DERIVED_DATA"
    rm -rf ~/Library/Developer/Xcode/DerivedData/AilunSade*
    
    xcodebuild \
        -workspace "$WORKSPACE" \
        -scheme "$SCHEME" \
        clean
    
    print_success "Build cache limpo"
    echo ""
}

build_debug_simulator() {
    print_info "Building para simulador (Debug)..."
    
    xcodebuild \
        -workspace "$WORKSPACE" \
        -scheme "$SCHEME" \
        -configuration Debug \
        -sdk iphonesimulator \
        -derivedDataPath "$DERIVED_DATA" \
        build \
        2>&1 | tee build.log
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        print_success "Build Debug para simulador completo!"
        echo ""
        print_info "Próximos passos:"
        echo "  1. Abra Xcode: open $WORKSPACE"
        echo "  2. Selecione Device/Simulator"
        echo "  3. Pressione Cmd+R para executar"
    else
        print_error "Build falhou. Veja build.log para detalhes."
        exit 1
    fi
}

build_release_device() {
    print_info "Building para dispositivo (Release)..."
    
    xcodebuild \
        -workspace "$WORKSPACE" \
        -scheme "$SCHEME" \
        -configuration Release \
        -sdk iphoneos \
        -derivedDataPath "$DERIVED_DATA" \
        build \
        2>&1 | tee build.log
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        print_success "Build Release para dispositivo completo!"
    else
        print_error "Build falhou. Veja build.log para detalhes."
        exit 1
    fi
}

build_archive() {
    print_info "Criando Archive para App Store..."
    
    ARCHIVE_PATH="$DERIVED_DATA/AilunSade.xcarchive"
    
    xcodebuild \
        -workspace "$WORKSPACE" \
        -scheme "$SCHEME" \
        -configuration Release \
        archive \
        -archivePath "$ARCHIVE_PATH" \
        2>&1 | tee build.log
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        print_success "Archive criado com sucesso!"
        echo ""
        print_info "Archive localizado em: $ARCHIVE_PATH"
        print_info "Próximos passos:"
        echo "  1. Abra Xcode Organizer"
        echo "  2. Selecione o archive"
        echo "  3. Clique 'Distribute App'"
        echo "  4. Selecione 'App Store Connect'"
    else
        print_error "Archive falhou. Veja build.log para detalhes."
        exit 1
    fi
}

open_xcode() {
    print_info "Abrindo Xcode..."
    open "$WORKSPACE"
    print_success "Xcode aberto!"
}

install_pods() {
    print_info "Instalando/Atualizando CocoaPods..."
    
    cd "$IOS_DIR"
    pod install --repo-update
    cd "$PROJECT_ROOT"
    
    print_success "CocoaPods atualizado!"
}

show_help() {
    cat << EOF
Uso: $0 [comando]

Comandos disponíveis:
  debug              Build Debug para Simulador iOS
  release            Build Release para Dispositivo iOS
  archive            Criar Archive para App Store
  clean              Limpar build cache
  pods               Reinstalar CocoaPods
  xcode              Abrir Xcode
  help               Mostrar esta mensagem

Exemplos:
  ./scripts/ios-build-helper.sh debug
  ./scripts/ios-build-helper.sh release
  ./scripts/ios-build-helper.sh archive

EOF
}

# Main
main() {
    print_header
    
    COMMAND="${1:-help}"
    
    case "$COMMAND" in
        debug)
            check_prerequisites
            build_debug_simulator
            ;;
        release)
            check_prerequisites
            build_release_device
            ;;
        archive)
            check_prerequisites
            build_archive
            ;;
        clean)
            clean_build
            ;;
        pods)
            install_pods
            ;;
        xcode)
            open_xcode
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Comando desconhecido: $COMMAND"
            echo ""
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    print_info "Concluído em: $(date)"
}

# Executar main
main "$@"
