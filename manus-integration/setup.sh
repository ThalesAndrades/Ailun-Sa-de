#!/bin/bash
#
# Script de Configuração - Integração Manus + Claude
# Projeto: Ailun Saúde
#

set -e  # Sair em caso de erro

echo "========================================="
echo "🚀 SETUP - INTEGRAÇÃO MANUS + CLAUDE"
echo "   Projeto: Ailun Saúde"
echo "========================================="
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verificar Python
echo -e "${BLUE}🔍 Verificando Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 não encontrado. Por favor, instale Python 3.8+${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d ' ' -f 2)
echo -e "${GREEN}✅ Python $PYTHON_VERSION encontrado${NC}"
echo ""

# Verificar pip
echo -e "${BLUE}🔍 Verificando pip...${NC}"
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ pip3 não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ pip3 encontrado${NC}"
echo ""

# Criar ambiente virtual (opcional mas recomendado)
echo -e "${BLUE}📦 Criando ambiente virtual...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Ambiente virtual criado${NC}"
else
    echo -e "${YELLOW}⚠️  Ambiente virtual já existe${NC}"
fi
echo ""

# Ativar ambiente virtual
echo -e "${BLUE}🔌 Ativando ambiente virtual...${NC}"
source venv/bin/activate
echo -e "${GREEN}✅ Ambiente virtual ativado${NC}"
echo ""

# Instalar dependências
echo -e "${BLUE}📥 Instalando dependências...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# Verificar variáveis de ambiente
echo -e "${BLUE}🔐 Verificando variáveis de ambiente...${NC}"
ENV_FILE="../.env"

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado em $ENV_FILE${NC}"
    echo -e "${YELLOW}⚠️  Por favor, configure as variáveis de ambiente${NC}"
    exit 1
fi

# Verificar chaves necessárias
REQUIRED_VARS=(
    "ANTHROPIC_API_KEY"
    "EXPO_PUBLIC_SUPABASE_URL"
    "EXPO_PUBLIC_SUPABASE_ANON_KEY"
)

ALL_VARS_SET=true
for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" "$ENV_FILE"; then
        echo -e "${RED}❌ Variável $var não encontrada no .env${NC}"
        ALL_VARS_SET=false
    else
        echo -e "${GREEN}✅ $var configurada${NC}"
    fi
done

echo ""

if [ "$ALL_VARS_SET" = false ]; then
    echo -e "${YELLOW}⚠️  Algumas variáveis de ambiente estão faltando${NC}"
    echo ""
    echo "Por favor, adicione ao arquivo $ENV_FILE:"
    echo ""
    echo "# API Anthropic (Claude)"
    echo "ANTHROPIC_API_KEY=sua_chave_aqui"
    echo ""
    exit 1
fi

# Criar diretórios necessários
echo -e "${BLUE}📁 Criando diretórios...${NC}"
mkdir -p reports
mkdir -p logs
echo -e "${GREEN}✅ Diretórios criados${NC}"
echo ""

# Testar conexão com Claude
echo -e "${BLUE}🧪 Testando conexão com Claude...${NC}"
python3 << EOF
import os
import sys
sys.path.insert(0, './scripts')
from dotenv import load_dotenv
load_dotenv('../.env')

try:
    from claude_client import ClaudeClient
    client = ClaudeClient()
    response = client.generate_text("Diga 'OK' se você está funcionando corretamente.")
    print(f"✅ Claude respondeu: {response[:50]}...")
    sys.exit(0)
except Exception as e:
    print(f"❌ Erro ao conectar com Claude: {e}")
    sys.exit(1)
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Conexão com Claude OK${NC}"
else
    echo -e "${RED}❌ Falha na conexão com Claude${NC}"
    exit 1
fi
echo ""

# Testar conexão com Supabase
echo -e "${BLUE}🧪 Testando conexão com Supabase...${NC}"
python3 << EOF
import os
import sys
sys.path.insert(0, './scripts')
from dotenv import load_dotenv
load_dotenv('../.env')

try:
    from supabase import create_client
    url = os.getenv("EXPO_PUBLIC_SUPABASE_URL")
    key = os.getenv("EXPO_PUBLIC_SUPABASE_ANON_KEY")
    client = create_client(url, key)
    print("✅ Conexão com Supabase estabelecida")
    sys.exit(0)
except Exception as e:
    print(f"❌ Erro ao conectar com Supabase: {e}")
    sys.exit(1)
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Conexão com Supabase OK${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Falha na conexão com Supabase (pode ser normal se RLS estiver ativo)${NC}"
fi
echo ""

# Tornar scripts executáveis
echo -e "${BLUE}🔧 Configurando permissões de scripts...${NC}"
chmod +x scripts/*.py
chmod +x examples/*.sh
chmod +x examples/*.py
echo -e "${GREEN}✅ Permissões configuradas${NC}"
echo ""

# Mensagem final
echo "========================================="
echo -e "${GREEN}✅ SETUP CONCLUÍDO COM SUCESSO!${NC}"
echo "========================================="
echo ""
echo "📚 Próximos passos:"
echo ""
echo "1. ${BLUE}Testar integração básica:${NC}"
echo "   python scripts/claude_client.py"
echo ""
echo "2. ${BLUE}Executar exemplo de automação:${NC}"
echo "   python examples/example_daily_automation.py"
echo ""
echo "3. ${BLUE}Iniciar servidor MCP:${NC}"
echo "   python scripts/mcp_server.py"
echo ""
echo "4. ${BLUE}Iniciar scheduler de automações:${NC}"
echo "   python scripts/automation_scheduler.py"
echo ""
echo "5. ${BLUE}Executar automação específica:${NC}"
echo "   python scripts/automation_scheduler.py daily"
echo ""
echo "📖 Documentação completa: docs/INTEGRATION_GUIDE.md"
echo ""
echo "💡 Para desativar o ambiente virtual: deactivate"
echo "💡 Para reativar: source venv/bin/activate"
echo ""
