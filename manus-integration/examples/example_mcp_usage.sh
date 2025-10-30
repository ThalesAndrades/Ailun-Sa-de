#!/bin/bash
#
# Exemplo de Uso do MCP Server
# Projeto: Ailun Saúde - Integração Manus + Claude
#
# Demonstra como usar o servidor MCP via manus-mcp-cli
# (assumindo que manus-mcp-cli está instalado)

echo "========================================="
echo "🔧 EXEMPLOS DE USO MCP - AILUN SAÚDE"
echo "========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório do servidor MCP
MCP_SERVER="../scripts/mcp_server.py"

echo -e "${BLUE}📋 Exemplo 1: Listar ferramentas disponíveis${NC}"
echo "Comando: python $MCP_SERVER"
echo ""
python $MCP_SERVER
echo ""
echo "---"
echo ""

echo -e "${BLUE}📊 Exemplo 2: Gerar relatório diário${NC}"
echo "Comando: python $MCP_SERVER generate_report '{}'"
echo ""
python $MCP_SERVER generate_report '{}'
echo ""
echo "---"
echo ""

echo -e "${BLUE}📈 Exemplo 3: Previsão de tendências (30 dias)${NC}"
echo "Comando: python $MCP_SERVER predict_trends '{\"days\": 30}'"
echo ""
python $MCP_SERVER predict_trends '{"days": 30}'
echo ""
echo "---"
echo ""

echo -e "${BLUE}🔍 Exemplo 4: Consulta inteligente${NC}"
echo "Comando: python $MCP_SERVER smart_query '{\"query\": \"Quais são as principais métricas da plataforma?\"}'"
echo ""
python $MCP_SERVER smart_query '{"query": "Quais são as principais métricas da plataforma?"}'
echo ""
echo "---"
echo ""

echo -e "${GREEN}✅ Exemplos concluídos!${NC}"
echo ""
echo "💡 Para usar via manus-mcp-cli (quando disponível):"
echo ""
echo -e "${YELLOW}# Listar ferramentas${NC}"
echo "manus-mcp-cli tool list --server ailun-health"
echo ""
echo -e "${YELLOW}# Chamar ferramenta${NC}"
echo "manus-mcp-cli tool call generate_report --server ailun-health --input '{}'"
echo ""
echo -e "${YELLOW}# Query inteligente${NC}"
echo "manus-mcp-cli tool call smart_query --server ailun-health --input '{\"query\": \"Análise do mês\"}'"
echo ""

chmod +x "$0"
