#!/usr/bin/env python3
"""
Agendador de Automações Manus + Claude
Projeto: Ailun Saúde

Sistema de agendamento de tarefas automatizadas usando Manus e Claude.
"""

import os
import json
import schedule
import time
from datetime import datetime
from typing import Callable, Dict, Any
from pathlib import Path
from dotenv import load_dotenv
from claude_client import ClaudeClient
from supabase_integration import SupabaseClaudeIntegration

load_dotenv()


class AutomationScheduler:
    """Gerenciador de automações agendadas"""

    def __init__(self, output_dir: str = "./reports"):
        """
        Inicializa o agendador.

        Args:
            output_dir: Diretório para salvar relatórios
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.claude = ClaudeClient()
        self.integration = SupabaseClaudeIntegration()

        self.jobs: Dict[str, Callable] = {}

    def save_report(self, filename: str, content: str) -> str:
        """
        Salva relatório em arquivo.

        Args:
            filename: Nome do arquivo
            content: Conteúdo do relatório

        Returns:
            Caminho do arquivo salvo
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = self.output_dir / f"{timestamp}_{filename}"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        return str(filepath)

    def daily_health_report(self):
        """Gera relatório diário de saúde da plataforma"""
        print(f"[{datetime.now()}] Gerando relatório diário...")

        try:
            report = self.integration.generate_daily_report()
            filepath = self.save_report("relatorio_diario.md", report)

            print(f"✅ Relatório salvo: {filepath}")

            # Opcional: Enviar por email ou notificação
            # self.send_notification(report)

        except Exception as e:
            print(f"❌ Erro ao gerar relatório diário: {e}")

    def weekly_trends_analysis(self):
        """Analisa tendências semanais"""
        print(f"[{datetime.now()}] Analisando tendências semanais...")

        try:
            trends = self.integration.analyze_appointment_trends(days=7)
            filepath = self.save_report("analise_semanal.md", trends)

            print(f"✅ Análise salva: {filepath}")

        except Exception as e:
            print(f"❌ Erro ao analisar tendências: {e}")

    def monthly_executive_summary(self):
        """Gera resumo executivo mensal"""
        print(f"[{datetime.now()}] Gerando resumo executivo mensal...")

        try:
            trends_30d = self.integration.analyze_appointment_trends(days=30)

            system_prompt = """Você é um analista executivo de saúde digital.
            Crie resumos executivos mensais concisos para stakeholders."""

            prompt = f"""Com base nesta análise de 30 dias, crie um resumo executivo:

{trends_30d}

Inclua:
# Resumo Executivo Mensal - Ailun Saúde

## Destaques do Mês
- KPIs principais

## Performance
- Crescimento e métricas

## Insights Estratégicos
- Oportunidades e riscos

## Recomendações
- Ações prioritárias

Formato: Markdown executivo, máximo 1 página."""

            summary = self.claude.generate_text(prompt, system_prompt=system_prompt, temperature=0.5)

            filepath = self.save_report("resumo_mensal.md", summary)

            print(f"✅ Resumo executivo salvo: {filepath}")

        except Exception as e:
            print(f"❌ Erro ao gerar resumo mensal: {e}")

    def appointment_reminders(self):
        """Envia lembretes de consultas (placeholder)"""
        print(f"[{datetime.now()}] Processando lembretes de consultas...")

        # TODO: Implementar lógica de lembretes
        # - Buscar consultas das próximas 24h
        # - Gerar mensagens personalizadas com Claude
        # - Enviar via canal apropriado (SMS, email, push)

        print("⚠️  Função de lembretes ainda não implementada")

    def setup_schedules(self):
        """Configura todos os agendamentos"""

        # Relatório diário às 9h
        schedule.every().day.at("09:00").do(self.daily_health_report)
        print("✅ Agendado: Relatório diário às 09:00")

        # Análise semanal toda segunda às 10h
        schedule.every().monday.at("10:00").do(self.weekly_trends_analysis)
        print("✅ Agendado: Análise semanal às segundas 10:00")

        # Resumo mensal no dia 1 às 8h
        # Note: schedule não suporta dia do mês diretamente, precisa de lógica customizada
        schedule.every().day.at("08:00").do(self._check_monthly_summary)
        print("✅ Agendado: Verificação de resumo mensal às 08:00")

        # Lembretes de consulta a cada 6 horas
        schedule.every(6).hours.do(self.appointment_reminders)
        print("✅ Agendado: Lembretes a cada 6 horas")

    def _check_monthly_summary(self):
        """Verifica se deve gerar resumo mensal (dia 1)"""
        if datetime.now().day == 1:
            self.monthly_executive_summary()

    def run_once_now(self, job_name: str):
        """
        Executa uma tarefa imediatamente.

        Args:
            job_name: Nome da tarefa ('daily', 'weekly', 'monthly')
        """
        jobs_map = {
            "daily": self.daily_health_report,
            "weekly": self.weekly_trends_analysis,
            "monthly": self.monthly_executive_summary,
            "reminders": self.appointment_reminders
        }

        if job_name not in jobs_map:
            print(f"❌ Tarefa '{job_name}' não encontrada")
            print(f"Tarefas disponíveis: {', '.join(jobs_map.keys())}")
            return

        print(f"▶️  Executando tarefa: {job_name}")
        jobs_map[job_name]()

    def run_forever(self):
        """Inicia o loop de agendamento"""
        print("\n" + "="*60)
        print("🤖 Scheduler Manus + Claude iniciado")
        print("="*60 + "\n")

        self.setup_schedules()

        print(f"\n⏰ Próximas execuções:")
        for job in schedule.get_jobs():
            print(f"  - {job}")

        print("\n🔄 Loop de agendamento iniciado. Pressione Ctrl+C para sair.\n")

        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Verifica a cada 1 minuto

        except KeyboardInterrupt:
            print("\n\n👋 Scheduler encerrado pelo usuário")


# CLI para execução manual
if __name__ == "__main__":
    import sys

    scheduler = AutomationScheduler(output_dir="./manus-integration/reports")

    if len(sys.argv) > 1:
        # Modo CLI: executar tarefa específica
        job_name = sys.argv[1]
        scheduler.run_once_now(job_name)
    else:
        # Modo daemon: executar loop de agendamento
        scheduler.run_forever()
