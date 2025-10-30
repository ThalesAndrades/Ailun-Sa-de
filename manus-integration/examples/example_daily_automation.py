#!/usr/bin/env python3
"""
Exemplo: Automação Diária Completa
Projeto: Ailun Saúde - Integração Manus + Claude

Este exemplo demonstra um fluxo completo de automação diária que:
1. Coleta dados do Supabase
2. Analisa com Claude
3. Gera relatório
4. Salva e notifica

Uso:
    python example_daily_automation.py
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Adicionar diretório de scripts ao path
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

from claude_client import ClaudeClient
from supabase_integration import SupabaseClaudeIntegration


def main():
    """Executa automação diária completa"""

    print("="*70)
    print("🤖 AUTOMAÇÃO DIÁRIA - AILUN SAÚDE")
    print("="*70)
    print(f"\n📅 Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")

    # Inicializar integrações
    print("🔧 Inicializando integrações...")
    try:
        claude = ClaudeClient()
        integration = SupabaseClaudeIntegration()
        print("✅ Integrações inicializadas com sucesso\n")
    except Exception as e:
        print(f"❌ Erro ao inicializar: {e}")
        return

    # Etapa 1: Gerar relatório diário
    print("-" * 70)
    print("📊 ETAPA 1: Gerando Relatório Diário")
    print("-" * 70)
    try:
        daily_report = integration.generate_daily_report()
        print("✅ Relatório diário gerado\n")

        # Salvar relatório
        output_dir = Path("./manus-integration/reports")
        output_dir.mkdir(parents=True, exist_ok=True)

        filename = f"relatorio_{datetime.now().strftime('%Y%m%d')}.md"
        filepath = output_dir / filename

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(daily_report)

        print(f"💾 Relatório salvo: {filepath}\n")
        print("📄 Prévia do relatório:")
        print("-" * 70)
        print(daily_report[:500] + "..." if len(daily_report) > 500 else daily_report)
        print("-" * 70 + "\n")

    except Exception as e:
        print(f"❌ Erro ao gerar relatório: {e}\n")

    # Etapa 2: Análise de tendências
    print("-" * 70)
    print("📈 ETAPA 2: Análise de Tendências (7 dias)")
    print("-" * 70)
    try:
        trends = integration.analyze_appointment_trends(days=7)
        print("✅ Análise de tendências concluída\n")

        # Salvar análise
        trends_filename = f"tendencias_{datetime.now().strftime('%Y%m%d')}.md"
        trends_filepath = output_dir / trends_filename

        with open(trends_filepath, "w", encoding="utf-8") as f:
            f.write(trends)

        print(f"💾 Análise salva: {trends_filepath}\n")
        print("📄 Prévia da análise:")
        print("-" * 70)
        print(trends[:500] + "..." if len(trends) > 500 else trends)
        print("-" * 70 + "\n")

    except Exception as e:
        print(f"❌ Erro ao analisar tendências: {e}\n")

    # Etapa 3: Insights com Claude
    print("-" * 70)
    print("💡 ETAPA 3: Gerando Insights Estratégicos")
    print("-" * 70)
    try:
        system_prompt = """Você é um consultor estratégico de saúde digital.
        Gere insights acionáveis para melhorar a plataforma."""

        prompt = f"""Com base no relatório diário e análise de tendências, gere 5 insights estratégicos:

RELATÓRIO DIÁRIO:
{daily_report[:1000]}

TENDÊNCIAS:
{trends[:1000]}

Forneça insights em formato de lista numerada, cada um com:
- Observação
- Impacto potencial
- Ação recomendada

Seja conciso e prático."""

        insights = claude.generate_text(prompt, system_prompt=system_prompt, temperature=0.7)
        print("✅ Insights gerados\n")

        # Salvar insights
        insights_filename = f"insights_{datetime.now().strftime('%Y%m%d')}.md"
        insights_filepath = output_dir / insights_filename

        with open(insights_filepath, "w", encoding="utf-8") as f:
            f.write(f"# Insights Estratégicos - {datetime.now().strftime('%d/%m/%Y')}\n\n")
            f.write(insights)

        print(f"💾 Insights salvos: {insights_filepath}\n")
        print("📄 Insights gerados:")
        print("-" * 70)
        print(insights)
        print("-" * 70 + "\n")

    except Exception as e:
        print(f"❌ Erro ao gerar insights: {e}\n")

    # Resumo final
    print("="*70)
    print("✅ AUTOMAÇÃO DIÁRIA CONCLUÍDA")
    print("="*70)
    print("\n📁 Arquivos gerados:")
    for file in output_dir.glob("*.md"):
        if file.stat().st_mtime > (datetime.now().timestamp() - 300):  # últimos 5 min
            print(f"  - {file.name}")

    print("\n🎯 Próximos passos sugeridos:")
    print("  1. Revisar relatórios gerados")
    print("  2. Compartilhar insights com equipe")
    print("  3. Implementar ações recomendadas")
    print("  4. Agendar próxima execução\n")


if __name__ == "__main__":
    main()
