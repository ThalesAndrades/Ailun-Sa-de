#!/usr/bin/env python3
"""
Cliente Claude para Integração Manus
Projeto: Ailun Saúde

Este módulo fornece uma interface simplificada para interagir com o Claude
através do SDK da Anthropic.
"""

import os
import json
from typing import Optional, Dict, List, Any
from anthropic import Anthropic, APIError
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()


class ClaudeClient:
    """Cliente para interação com Claude via API Anthropic"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "claude-3-5-sonnet-20240620",
        max_tokens: int = 4096
    ):
        """
        Inicializa o cliente Claude.

        Args:
            api_key: Chave de API Anthropic (usa ANTHROPIC_API_KEY se não fornecida)
            model: Modelo Claude a ser usado
            max_tokens: Número máximo de tokens na resposta
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")

        if not self.api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY não configurada. "
                "Configure a variável de ambiente ou passe api_key no construtor."
            )

        self.model = model
        self.max_tokens = max_tokens

        try:
            self.client = Anthropic(api_key=self.api_key)
        except Exception as e:
            raise RuntimeError(f"Erro ao inicializar cliente Anthropic: {e}")

    def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7
    ) -> str:
        """
        Gera texto usando Claude.

        Args:
            prompt: Prompt do usuário
            system_prompt: Prompt de sistema (opcional)
            temperature: Temperatura para geração (0.0-1.0)

        Returns:
            Texto gerado pelo Claude
        """
        try:
            messages = [{"role": "user", "content": prompt}]

            kwargs = {
                "model": self.model,
                "max_tokens": self.max_tokens,
                "temperature": temperature,
                "messages": messages
            }

            if system_prompt:
                kwargs["system"] = system_prompt

            message = self.client.messages.create(**kwargs)

            return message.content[0].text

        except APIError as e:
            return f"Erro na API do Claude: {e}"
        except Exception as e:
            return f"Erro inesperado: {e}"

    def analyze_health_data(self, data: Dict[str, Any]) -> str:
        """
        Analisa dados de saúde usando Claude.

        Args:
            data: Dicionário com dados de saúde do paciente

        Returns:
            Análise gerada pelo Claude
        """
        system_prompt = """Você é um assistente especializado em análise de dados de saúde.
        Sua função é analisar dados clínicos e fornecer insights úteis para profissionais de saúde.
        Sempre mantenha a privacidade e o sigilo médico.
        Forneça análises claras, objetivas e baseadas em evidências."""

        prompt = f"""Analise os seguintes dados de saúde:

{json.dumps(data, indent=2, ensure_ascii=False)}

Por favor, forneça:
1. Resumo dos principais indicadores
2. Identificação de padrões ou tendências
3. Alertas sobre valores fora do normal
4. Recomendações para acompanhamento

Mantenha a análise clara e objetiva."""

        return self.generate_text(prompt, system_prompt=system_prompt)

    def generate_appointment_summary(self, appointment_data: Dict[str, Any]) -> str:
        """
        Gera resumo de consulta médica.

        Args:
            appointment_data: Dados da consulta

        Returns:
            Resumo formatado da consulta
        """
        system_prompt = """Você é um assistente médico especializado em documentação clínica.
        Gere resumos concisos e profissionais de consultas médicas."""

        prompt = f"""Gere um resumo profissional desta consulta médica:

{json.dumps(appointment_data, indent=2, ensure_ascii=False)}

O resumo deve incluir:
- Motivo da consulta
- Principais achados
- Diagnóstico
- Plano de tratamento
- Próximos passos

Formato: Português formal, linguagem médica apropriada."""

        return self.generate_text(prompt, system_prompt=system_prompt, temperature=0.3)

    def chat(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None
    ) -> str:
        """
        Modo chat com histórico de mensagens.

        Args:
            messages: Lista de mensagens [{"role": "user"|"assistant", "content": "..."}]
            system_prompt: Prompt de sistema (opcional)

        Returns:
            Resposta do Claude
        """
        try:
            kwargs = {
                "model": self.model,
                "max_tokens": self.max_tokens,
                "messages": messages
            }

            if system_prompt:
                kwargs["system"] = system_prompt

            message = self.client.messages.create(**kwargs)

            return message.content[0].text

        except APIError as e:
            return f"Erro na API do Claude: {e}"
        except Exception as e:
            return f"Erro inesperado: {e}"


# Exemplo de uso
if __name__ == "__main__":
    # Exemplo 1: Geração de texto simples
    client = ClaudeClient()

    response = client.generate_text(
        "Explique em 3 parágrafos a importância da integração de IA em sistemas de saúde."
    )
    print("=== Exemplo 1: Geração de Texto ===")
    print(response)
    print("\n" + "="*60 + "\n")

    # Exemplo 2: Análise de dados de saúde
    health_data = {
        "paciente_id": "12345",
        "data": "2025-10-30",
        "pressao_arterial": {"sistolica": 140, "diastolica": 95},
        "frequencia_cardiaca": 88,
        "temperatura": 36.8,
        "glicemia": 185,
        "observacoes": "Paciente relata cansaço frequente"
    }

    analysis = client.analyze_health_data(health_data)
    print("=== Exemplo 2: Análise de Dados de Saúde ===")
    print(analysis)
    print("\n" + "="*60 + "\n")

    # Exemplo 3: Resumo de consulta
    appointment = {
        "data": "2025-10-30",
        "medico": "Dr. Silva",
        "paciente": "João Santos",
        "motivo": "Check-up anual",
        "sintomas": "Sem queixas específicas",
        "exame_fisico": "Pressão arterial 130/85, FC 72 bpm",
        "diagnostico": "Hipertensão leve controlada",
        "tratamento": "Manter medicação atual (Losartana 50mg)",
        "retorno": "3 meses"
    }

    summary = client.generate_appointment_summary(appointment)
    print("=== Exemplo 3: Resumo de Consulta ===")
    print(summary)
