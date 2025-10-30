#!/usr/bin/env python3
"""
Integração Supabase + Claude
Projeto: Ailun Saúde

Conecta dados do Supabase com análise do Claude.
"""

import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv
from claude_client import ClaudeClient

load_dotenv()


class SupabaseClaudeIntegration:
    """Integração entre Supabase e Claude para análise de dados de saúde"""

    def __init__(self):
        """Inicializa conexões com Supabase e Claude"""
        # Supabase
        supabase_url = os.getenv("EXPO_PUBLIC_SUPABASE_URL")
        supabase_key = os.getenv("EXPO_PUBLIC_SUPABASE_ANON_KEY")

        if not supabase_url or not supabase_key:
            raise ValueError("Credenciais do Supabase não configuradas")

        self.supabase: Client = create_client(supabase_url, supabase_key)

        # Claude
        self.claude = ClaudeClient()

    def get_user_health_summary(self, user_id: str) -> Dict[str, Any]:
        """
        Busca dados de saúde do usuário e gera resumo com Claude.

        Args:
            user_id: ID do usuário

        Returns:
            Resumo de saúde com análise do Claude
        """
        try:
            # Buscar perfil do usuário
            profile = self.supabase.table("user_profiles")\
                .select("*")\
                .eq("id", user_id)\
                .single()\
                .execute()

            if not profile.data:
                return {"error": "Usuário não encontrado"}

            # Buscar consultas recentes (últimos 6 meses)
            six_months_ago = (datetime.now() - timedelta(days=180)).isoformat()

            appointments = self.supabase.table("appointments")\
                .select("*")\
                .eq("user_id", user_id)\
                .gte("date", six_months_ago)\
                .order("date", desc=True)\
                .execute()

            # Montar dados para análise
            user_data = {
                "perfil": profile.data,
                "consultas_recentes": appointments.data if appointments.data else [],
                "total_consultas": len(appointments.data) if appointments.data else 0
            }

            # Analisar com Claude
            analysis = self.claude.analyze_health_data(user_data)

            return {
                "user_id": user_id,
                "data": user_data,
                "analise_claude": analysis,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            return {"error": f"Erro ao buscar dados: {str(e)}"}

    def generate_daily_report(self) -> str:
        """
        Gera relatório diário de atividades da plataforma.

        Returns:
            Relatório formatado em Markdown
        """
        try:
            today = datetime.now().date().isoformat()

            # Buscar consultas do dia
            appointments_today = self.supabase.table("appointments")\
                .select("*")\
                .eq("date", today)\
                .execute()

            # Buscar novos usuários do dia
            new_users = self.supabase.table("user_profiles")\
                .select("*")\
                .gte("created_at", today)\
                .execute()

            # Dados para o relatório
            report_data = {
                "data": today,
                "total_consultas": len(appointments_today.data) if appointments_today.data else 0,
                "novos_usuarios": len(new_users.data) if new_users.data else 0,
                "consultas": appointments_today.data if appointments_today.data else []
            }

            # Gerar relatório com Claude
            system_prompt = """Você é um analista de dados de plataforma de saúde.
            Gere relatórios diários concisos e informativos em formato Markdown."""

            prompt = f"""Gere um relatório diário executivo com base nestes dados:

{json.dumps(report_data, indent=2, ensure_ascii=False)}

O relatório deve incluir:
# Relatório Diário - Ailun Saúde

## Resumo Executivo
- Métricas principais do dia

## Consultas
- Total e detalhes relevantes

## Novos Usuários
- Crescimento da base

## Insights
- Padrões ou observações importantes

Formato: Markdown profissional, objetivo e claro."""

            report = self.claude.generate_text(prompt, system_prompt=system_prompt, temperature=0.5)

            return report

        except Exception as e:
            return f"# Erro ao gerar relatório\n\n{str(e)}"

    def analyze_appointment_trends(self, days: int = 30) -> str:
        """
        Analisa tendências de consultas.

        Args:
            days: Número de dias para análise

        Returns:
            Análise de tendências
        """
        try:
            start_date = (datetime.now() - timedelta(days=days)).isoformat()

            appointments = self.supabase.table("appointments")\
                .select("*")\
                .gte("created_at", start_date)\
                .order("created_at", desc=False)\
                .execute()

            if not appointments.data:
                return "Nenhuma consulta encontrada no período."

            # Preparar dados para análise
            trend_data = {
                "periodo": f"Últimos {days} dias",
                "total_consultas": len(appointments.data),
                "consultas": appointments.data
            }

            system_prompt = """Você é um analista de dados especializado em tendências de saúde.
            Identifique padrões, sazonalidades e insights acionáveis."""

            prompt = f"""Analise as tendências de consultas:

{json.dumps(trend_data, indent=2, ensure_ascii=False)}

Forneça:
1. Tendência geral (crescimento, estabilidade, queda)
2. Padrões temporais (dias/horários mais procurados)
3. Insights e recomendações
4. Previsões para próximo período

Seja objetivo e baseado em dados."""

            analysis = self.claude.generate_text(prompt, system_prompt=system_prompt, temperature=0.6)

            return analysis

        except Exception as e:
            return f"Erro ao analisar tendências: {str(e)}"

    def smart_search(self, query: str, table: str = "user_profiles") -> Dict[str, Any]:
        """
        Busca inteligente usando Claude para interpretar query natural.

        Args:
            query: Consulta em linguagem natural
            table: Tabela para buscar

        Returns:
            Resultados da busca com interpretação do Claude
        """
        try:
            # Usar Claude para converter query natural em filtros
            system_prompt = """Você é um assistente de busca em banco de dados.
            Converta consultas em linguagem natural para filtros de busca."""

            prompt = f"""Converta esta consulta em filtros de busca:
Query: "{query}"
Tabela: {table}

Retorne um JSON com os filtros apropriados para a busca.
Exemplo: {{"filters": {{"status": "active", "age__gte": 18}}}}

Apenas o JSON, sem explicações."""

            filters_json = self.claude.generate_text(prompt, system_prompt=system_prompt, temperature=0.2)

            # Parse dos filtros (simplificado - em produção use validação mais robusta)
            # Por enquanto, fazer busca geral
            results = self.supabase.table(table)\
                .select("*")\
                .limit(10)\
                .execute()

            return {
                "query": query,
                "interpretacao_claude": filters_json,
                "resultados": results.data if results.data else [],
                "total": len(results.data) if results.data else 0
            }

        except Exception as e:
            return {"error": f"Erro na busca: {str(e)}"}


# Exemplo de uso
if __name__ == "__main__":
    integration = SupabaseClaudeIntegration()

    print("=== Teste 1: Relatório Diário ===")
    daily_report = integration.generate_daily_report()
    print(daily_report)
    print("\n" + "="*60 + "\n")

    print("=== Teste 2: Análise de Tendências ===")
    trends = integration.analyze_appointment_trends(days=30)
    print(trends)
    print("\n" + "="*60 + "\n")

    print("=== Teste 3: Busca Inteligente ===")
    search_results = integration.smart_search("usuários cadastrados esta semana")
    print(json.dumps(search_results, indent=2, ensure_ascii=False))
