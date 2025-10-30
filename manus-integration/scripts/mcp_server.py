#!/usr/bin/env python3
"""
Servidor MCP (Model Context Protocol) para Ailun Saúde
Integração Manus + Claude

Expõe ferramentas e dados da plataforma Ailun para uso via MCP.
"""

import json
import os
from typing import Dict, Any, List
from dotenv import load_dotenv
from claude_client import ClaudeClient
from supabase_integration import SupabaseClaudeIntegration

load_dotenv()


class MCPServer:
    """
    Servidor MCP para integração com Manus.

    Expõe ferramentas que podem ser chamadas via manus-mcp-cli.
    """

    def __init__(self):
        """Inicializa o servidor MCP"""
        self.claude = ClaudeClient()
        self.integration = SupabaseClaudeIntegration()

        self.tools = {
            "analyze_health_data": self.analyze_health_data,
            "generate_report": self.generate_report,
            "search_users": self.search_users,
            "get_appointment_summary": self.get_appointment_summary,
            "predict_trends": self.predict_trends,
            "smart_query": self.smart_query
        }

    def list_tools(self) -> List[Dict[str, Any]]:
        """
        Lista todas as ferramentas disponíveis.

        Returns:
            Lista de ferramentas com descrições
        """
        return [
            {
                "name": "analyze_health_data",
                "description": "Analisa dados de saúde de um usuário usando Claude",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "user_id": {"type": "string", "description": "ID do usuário"}
                    },
                    "required": ["user_id"]
                }
            },
            {
                "name": "generate_report",
                "description": "Gera relatório diário da plataforma",
                "input_schema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "search_users",
                "description": "Busca usuários com filtros",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Consulta de busca"},
                        "limit": {"type": "integer", "description": "Limite de resultados"}
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "get_appointment_summary",
                "description": "Gera resumo de consulta médica",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "appointment_id": {"type": "string", "description": "ID da consulta"}
                    },
                    "required": ["appointment_id"]
                }
            },
            {
                "name": "predict_trends",
                "description": "Prevê tendências de consultas",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "days": {"type": "integer", "description": "Dias para análise"}
                    }
                }
            },
            {
                "name": "smart_query",
                "description": "Consulta em linguagem natural usando Claude",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Pergunta em linguagem natural"}
                    },
                    "required": ["query"]
                }
            }
        ]

    def analyze_health_data(self, user_id: str) -> Dict[str, Any]:
        """
        Ferramenta MCP: Analisa dados de saúde.

        Args:
            user_id: ID do usuário

        Returns:
            Análise de saúde
        """
        return self.integration.get_user_health_summary(user_id)

    def generate_report(self) -> Dict[str, Any]:
        """
        Ferramenta MCP: Gera relatório diário.

        Returns:
            Relatório em formato Markdown
        """
        report = self.integration.generate_daily_report()
        return {
            "success": True,
            "report": report,
            "format": "markdown"
        }

    def search_users(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """
        Ferramenta MCP: Busca usuários.

        Args:
            query: Consulta de busca
            limit: Limite de resultados

        Returns:
            Resultados da busca
        """
        return self.integration.smart_search(query)

    def get_appointment_summary(self, appointment_id: str) -> Dict[str, Any]:
        """
        Ferramenta MCP: Resumo de consulta.

        Args:
            appointment_id: ID da consulta

        Returns:
            Resumo da consulta
        """
        # TODO: Implementar busca de consulta específica
        return {
            "success": False,
            "message": "Função ainda não implementada",
            "appointment_id": appointment_id
        }

    def predict_trends(self, days: int = 30) -> Dict[str, Any]:
        """
        Ferramenta MCP: Previsão de tendências.

        Args:
            days: Dias para análise

        Returns:
            Análise de tendências
        """
        trends = self.integration.analyze_appointment_trends(days=days)
        return {
            "success": True,
            "analysis": trends,
            "period_days": days
        }

    def smart_query(self, query: str) -> Dict[str, Any]:
        """
        Ferramenta MCP: Query em linguagem natural.

        Args:
            query: Pergunta em linguagem natural

        Returns:
            Resposta do Claude
        """
        system_prompt = """Você é um assistente da plataforma Ailun Saúde.
        Responda perguntas sobre dados, métricas e análises da plataforma.
        Seja claro, objetivo e baseado em dados quando possível."""

        response = self.claude.generate_text(query, system_prompt=system_prompt)

        return {
            "success": True,
            "query": query,
            "response": response
        }

    def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Chama uma ferramenta MCP.

        Args:
            tool_name: Nome da ferramenta
            arguments: Argumentos da ferramenta

        Returns:
            Resultado da ferramenta
        """
        if tool_name not in self.tools:
            return {
                "success": False,
                "error": f"Ferramenta '{tool_name}' não encontrada",
                "available_tools": list(self.tools.keys())
            }

        try:
            result = self.tools[tool_name](**arguments)
            return {
                "success": True,
                "tool": tool_name,
                "result": result
            }
        except Exception as e:
            return {
                "success": False,
                "tool": tool_name,
                "error": str(e)
            }


# CLI para teste do servidor MCP
if __name__ == "__main__":
    import sys

    server = MCPServer()

    if len(sys.argv) < 2:
        print("=== Servidor MCP - Ailun Saúde ===")
        print("\nFerramentas disponíveis:")
        for tool in server.list_tools():
            print(f"\n📌 {tool['name']}")
            print(f"   {tool['description']}")
            print(f"   Schema: {json.dumps(tool['input_schema'], indent=6)}")

        print("\n\nUso:")
        print("  python mcp_server.py <tool_name> '<json_args>'")
        print("\nExemplos:")
        print('  python mcp_server.py generate_report \'{}\'')
        print('  python mcp_server.py predict_trends \'{"days": 30}\'')
        print('  python mcp_server.py smart_query \'{"query": "Quantas consultas tivemos hoje?"}\'')

    else:
        tool_name = sys.argv[1]
        arguments = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}

        print(f"\n▶️  Chamando ferramenta: {tool_name}")
        print(f"📋 Argumentos: {json.dumps(arguments, indent=2)}\n")

        result = server.call_tool(tool_name, arguments)

        print("📤 Resultado:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
