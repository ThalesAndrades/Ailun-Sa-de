# 🤖 Guia Completo de Integração Manus + Claude
## Projeto: Ailun Saúde

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Configuração](#configuração)
4. [Componentes](#componentes)
5. [Uso Básico](#uso-básico)
6. [Automações](#automações)
7. [MCP (Model Context Protocol)](#mcp-model-context-protocol)
8. [Exemplos Práticos](#exemplos-práticos)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

---

## 🎯 Visão Geral

Esta integração conecta o agente autônomo **Manus** com os modelos de linguagem **Claude** da Anthropic para automatizar tarefas de análise de dados, geração de relatórios e insights na plataforma Ailun Saúde.

### Características Principais

- ✅ **Integração via API Anthropic** - Chamadas diretas ao Claude via SDK Python
- ✅ **Suporte a MCP** - Model Context Protocol para interoperabilidade
- ✅ **Automação Agendada** - Tarefas recorrentes (diária, semanal, mensal)
- ✅ **Análise de Dados de Saúde** - Processamento inteligente de dados clínicos
- ✅ **Geração de Relatórios** - Resumos executivos automatizados
- ✅ **Integração com Supabase** - Acesso direto ao banco de dados
- ✅ **Busca Inteligente** - Queries em linguagem natural

### Benefícios

- 🚀 **Automação**: Reduz trabalho manual repetitivo
- 📊 **Insights**: Análises profundas de dados de saúde
- ⏱️ **Eficiência**: Processos que levavam horas agora levam minutos
- 🎯 **Precisão**: Análises baseadas em IA de última geração
- 🔄 **Escalabilidade**: Processa grandes volumes de dados facilmente

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      AILUN SAÚDE APP                         │
│                  (React Native + Expo)                       │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
│          (PostgreSQL + Auth + Storage + Edge)                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │
┌────────────────▼────────────────────────────────────────────┐
│              MANUS + CLAUDE INTEGRATION                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Claude     │  │  Supabase    │  │     MCP      │     │
│  │   Client     │  │ Integration  │  │   Server     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │         Automation Scheduler                        │    │
│  │  (Relatórios, Análises, Lembretes, Insights)       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                 │
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  ANTHROPIC CLAUDE API                        │
│              (claude-3-5-sonnet-20240620)                    │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **App Mobile** → Dados armazenados no **Supabase**
2. **Manus Scripts** → Leem dados do **Supabase**
3. **Claude API** → Processa e analisa os dados
4. **Relatórios** → Gerados e salvos localmente ou enviados
5. **Automações** → Executadas em horários agendados

---

## ⚙️ Configuração

### Pré-requisitos

- Python 3.8 ou superior
- pip3
- Conta Anthropic (API Key)
- Acesso ao Supabase do projeto Ailun

### Instalação

```bash
# 1. Navegar para o diretório de integração
cd manus-integration

# 2. Executar script de setup
./setup.sh

# 3. O script irá:
#    - Criar ambiente virtual
#    - Instalar dependências
#    - Verificar variáveis de ambiente
#    - Testar conexões
```

### Variáveis de Ambiente

Adicione ao arquivo `.env` na raiz do projeto:

```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Supabase (já existentes no projeto)
EXPO_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# RapiDoc (já existentes no projeto)
EXPO_PUBLIC_RAPIDOC_CLIENT_ID=540e4b44-d68d-4ade-885f-fd4940a3a045
EXPO_PUBLIC_RAPIDOC_TOKEN=eyJhbGciOiJSUzUxMiJ9...
EXPO_PUBLIC_RAPIDOC_BASE_URL=https://api.rapidoc.tech/tema/api/
```

### Obter API Key Anthropic

1. Acesse: https://console.anthropic.com/
2. Faça login ou crie uma conta
3. Vá para "API Keys"
4. Clique em "Create Key"
5. Copie a chave e adicione ao `.env`

---

## 🧩 Componentes

### 1. Claude Client (`scripts/claude_client.py`)

Cliente Python para interação com Claude via API Anthropic.

**Principais Métodos:**

```python
from claude_client import ClaudeClient

client = ClaudeClient()

# Geração de texto simples
response = client.generate_text("Seu prompt aqui")

# Análise de dados de saúde
health_data = {"paciente_id": "123", "pressao": 140}
analysis = client.analyze_health_data(health_data)

# Resumo de consulta
appointment = {"data": "2025-10-30", "medico": "Dr. Silva"}
summary = client.generate_appointment_summary(appointment)

# Modo chat
messages = [
    {"role": "user", "content": "Olá"},
    {"role": "assistant", "content": "Olá! Como posso ajudar?"},
    {"role": "user", "content": "Analise este dado..."}
]
response = client.chat(messages)
```

### 2. Supabase Integration (`scripts/supabase_integration.py`)

Conecta dados do Supabase com análise do Claude.

**Principais Métodos:**

```python
from supabase_integration import SupabaseClaudeIntegration

integration = SupabaseClaudeIntegration()

# Resumo de saúde do usuário
user_summary = integration.get_user_health_summary("user_id_123")

# Relatório diário
daily_report = integration.generate_daily_report()

# Análise de tendências
trends = integration.analyze_appointment_trends(days=30)

# Busca inteligente
results = integration.smart_search("usuários cadastrados esta semana")
```

### 3. Automation Scheduler (`scripts/automation_scheduler.py`)

Agendador de tarefas automatizadas.

**Tarefas Configuradas:**

- ✅ **Relatório Diário** - 09:00 todos os dias
- ✅ **Análise Semanal** - Segunda-feira 10:00
- ✅ **Resumo Mensal** - Dia 1 às 08:00
- ✅ **Lembretes** - A cada 6 horas

**Uso:**

```bash
# Modo daemon (roda indefinidamente)
python scripts/automation_scheduler.py

# Executar tarefa específica uma vez
python scripts/automation_scheduler.py daily
python scripts/automation_scheduler.py weekly
python scripts/automation_scheduler.py monthly
```

### 4. MCP Server (`scripts/mcp_server.py`)

Servidor Model Context Protocol para integração com Manus.

**Ferramentas Disponíveis:**

- `analyze_health_data` - Analisa dados de saúde
- `generate_report` - Gera relatórios
- `search_users` - Busca usuários
- `get_appointment_summary` - Resumo de consulta
- `predict_trends` - Previsão de tendências
- `smart_query` - Query em linguagem natural

**Uso:**

```bash
# Listar ferramentas
python scripts/mcp_server.py

# Chamar ferramenta específica
python scripts/mcp_server.py generate_report '{}'
python scripts/mcp_server.py predict_trends '{"days": 30}'
python scripts/mcp_server.py smart_query '{"query": "Quantas consultas hoje?"}'
```

---

## 🚀 Uso Básico

### Exemplo 1: Gerar Relatório Diário

```python
from supabase_integration import SupabaseClaudeIntegration

integration = SupabaseClaudeIntegration()
report = integration.generate_daily_report()

print(report)

# Salvar em arquivo
with open("relatorio.md", "w") as f:
    f.write(report)
```

### Exemplo 2: Analisar Dados de Paciente

```python
from claude_client import ClaudeClient

client = ClaudeClient()

patient_data = {
    "nome": "João Silva",
    "idade": 45,
    "pressao_arterial": {"sistolica": 145, "diastolica": 95},
    "glicemia": 190,
    "sintomas": "Cansaço frequente, sede excessiva"
}

analysis = client.analyze_health_data(patient_data)
print(analysis)
```

### Exemplo 3: Automação Completa

```bash
# Executar exemplo de automação diária
python examples/example_daily_automation.py
```

Este exemplo:
1. Gera relatório diário
2. Analisa tendências
3. Gera insights estratégicos
4. Salva tudo em arquivos Markdown

---

## ⏰ Automações

### Configurar Scheduler

Edite `scripts/automation_scheduler.py` para customizar horários:

```python
# Relatório diário às 9h
schedule.every().day.at("09:00").do(self.daily_health_report)

# Análise semanal toda segunda às 10h
schedule.every().monday.at("10:00").do(self.weekly_trends_analysis)

# Lembretes a cada 6 horas
schedule.every(6).hours.do(self.appointment_reminders)
```

### Executar em Background

**Linux/Mac:**

```bash
# Com nohup
nohup python scripts/automation_scheduler.py > logs/scheduler.log 2>&1 &

# Com screen
screen -S manus-scheduler
python scripts/automation_scheduler.py
# Ctrl+A, D para detach
```

**Systemd Service (Linux):**

Crie `/etc/systemd/system/manus-ailun.service`:

```ini
[Unit]
Description=Manus + Claude Automation for Ailun Saúde
After=network.target

[Service]
Type=simple
User=ailun
WorkingDirectory=/path/to/Ailun-Sa-de/manus-integration
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/python scripts/automation_scheduler.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Ativar:

```bash
sudo systemctl enable manus-ailun
sudo systemctl start manus-ailun
sudo systemctl status manus-ailun
```

---

## 🔌 MCP (Model Context Protocol)

### O que é MCP?

Model Context Protocol é um padrão aberto para integração de modelos de linguagem com ferramentas e dados externos.

### Usando MCP com Manus

**Via manus-mcp-cli:**

```bash
# Listar ferramentas
manus-mcp-cli tool list --server ailun-health

# Chamar ferramenta
manus-mcp-cli tool call generate_report \
  --server ailun-health \
  --input '{}'

# Query inteligente
manus-mcp-cli tool call smart_query \
  --server ailun-health \
  --input '{"query": "Análise do mês atual"}'
```

**Via Python (direto):**

```bash
# Usando o servidor MCP diretamente
python scripts/mcp_server.py generate_report '{}'
python scripts/mcp_server.py predict_trends '{"days": 30}'
```

### Ferramentas MCP Disponíveis

| Ferramenta | Descrição | Input |
|-----------|-----------|-------|
| `analyze_health_data` | Analisa dados de saúde | `{"user_id": "123"}` |
| `generate_report` | Gera relatório diário | `{}` |
| `search_users` | Busca usuários | `{"query": "texto", "limit": 10}` |
| `get_appointment_summary` | Resumo de consulta | `{"appointment_id": "456"}` |
| `predict_trends` | Previsão de tendências | `{"days": 30}` |
| `smart_query` | Query natural | `{"query": "pergunta"}` |

---

## 💡 Exemplos Práticos

### Caso de Uso 1: Dashboard Executivo Automático

```python
# dashboard_executivo.py
from supabase_integration import SupabaseClaudeIntegration
from datetime import datetime

integration = SupabaseClaudeIntegration()

# Coletar dados
daily_report = integration.generate_daily_report()
trends_7d = integration.analyze_appointment_trends(7)
trends_30d = integration.analyze_appointment_trends(30)

# Montar dashboard
dashboard = f"""
# Dashboard Executivo - Ailun Saúde
**Data:** {datetime.now().strftime('%d/%m/%Y %H:%M')}

---

## Resumo Diário
{daily_report}

---

## Tendências - 7 Dias
{trends_7d}

---

## Tendências - 30 Dias
{trends_30d}

---

*Gerado automaticamente por Manus + Claude*
"""

# Salvar
with open("dashboard_executivo.md", "w") as f:
    f.write(dashboard)

print("✅ Dashboard gerado: dashboard_executivo.md")
```

### Caso de Uso 2: Alertas Inteligentes

```python
# alertas_inteligentes.py
from supabase_integration import SupabaseClaudeIntegration
from claude_client import ClaudeClient

integration = SupabaseClaudeIntegration()
claude = ClaudeClient()

# Buscar consultas do dia
trends = integration.analyze_appointment_trends(1)

# Detectar anomalias com Claude
prompt = f"""Analise este dado e identifique anomalias ou alertas importantes:

{trends}

Retorne apenas alertas críticos que requerem atenção imediata.
Formato: Lista numerada, máximo 5 alertas."""

alerts = claude.generate_text(prompt, temperature=0.3)

if "nenhum" not in alerts.lower() and "nada" not in alerts.lower():
    # Enviar alertas (email, SMS, push)
    print("🚨 ALERTAS DETECTADOS:")
    print(alerts)
    # TODO: send_notification(alerts)
else:
    print("✅ Nenhum alerta detectado")
```

### Caso de Uso 3: Assistente de Triagem

```python
# assistente_triagem.py
from claude_client import ClaudeClient

client = ClaudeClient()

def triage_patient(symptoms: str, history: dict) -> dict:
    """
    Auxilia na triagem de pacientes.

    ATENÇÃO: Este é um AUXILIAR, não substitui avaliação médica.
    """

    system_prompt = """Você é um assistente de triagem médica.
    Forneça análise preliminar baseada em sintomas.
    SEMPRE recomende consulta médica para sintomas graves.
    Você é um AUXILIAR, não faz diagnósticos finais."""

    prompt = f"""
    Sintomas relatados: {symptoms}

    Histórico: {history}

    Forneça:
    1. Nível de urgência (baixo/médio/alto/crítico)
    2. Possíveis causas comuns
    3. Recomendação de ação
    4. Especialidade médica sugerida

    Seja cauteloso e priorize segurança do paciente.
    """

    analysis = client.generate_text(prompt, system_prompt=system_prompt, temperature=0.3)

    return {
        "symptoms": symptoms,
        "analysis": analysis,
        "timestamp": datetime.now().isoformat(),
        "disclaimer": "Esta é uma análise preliminar. Consulte um médico para diagnóstico definitivo."
    }

# Exemplo de uso
result = triage_patient(
    symptoms="Dor no peito intensa, falta de ar",
    history={"idade": 55, "hipertensao": True}
)

print(result["analysis"])
```

---

## 🔧 Troubleshooting

### Erro: "ANTHROPIC_API_KEY não configurada"

**Solução:**
```bash
# Adicionar ao .env
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> .env
```

### Erro: "Module 'anthropic' not found"

**Solução:**
```bash
pip install anthropic
# ou
pip install -r requirements.txt
```

### Erro: "Supabase connection failed"

**Possíveis causas:**
1. Variáveis de ambiente incorretas
2. Row Level Security (RLS) bloqueando acesso
3. Rede/firewall

**Solução:**
```bash
# Verificar variáveis
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print(os.getenv('EXPO_PUBLIC_SUPABASE_URL'))"

# Testar conexão
python scripts/supabase_integration.py
```

### Scheduler não está executando tarefas

**Verificar:**
```bash
# Ver jobs agendados
python -c "import schedule; print(schedule.get_jobs())"

# Ver logs
tail -f logs/scheduler.log
```

---

## ❓ FAQ

### Q: Preciso de GPU para rodar?
**A:** Não. A integração usa a API do Claude (cloud), não roda modelos localmente.

### Q: Quanto custa usar a API do Claude?
**A:** Depende do uso. Veja preços em: https://www.anthropic.com/pricing
- claude-3-5-sonnet: ~$3/milhão de tokens input, ~$15/milhão output
- Estimativa: ~$10-50/mês para uso moderado

### Q: Os dados de saúde são enviados para o Claude?
**A:** Sim, através da API. Garanta conformidade com LGPD/HIPAA:
- Use dados anonimizados quando possível
- Implemente criptografia em trânsito (HTTPS - já feito)
- Revise termos de serviço da Anthropic
- Configure data retention policies

### Q: Posso usar modelos locais em vez do Claude API?
**A:** Sim, mas requer modificações:
- Use Ollama, llama.cpp ou similar
- Adapte `claude_client.py` para usar API local
- Performance pode ser inferior dependendo do hardware

### Q: Como adicionar novas automações?
**A:** Edite `automation_scheduler.py`:
```python
def minha_automacao(self):
    # Sua lógica aqui
    pass

# No setup_schedules():
schedule.every().day.at("15:00").do(self.minha_automacao)
```

### Q: Funciona com React Native?
**A:** Esta integração é **backend** (Python). Para frontend:
- Use Edge Functions do Supabase
- Crie API endpoints que chamam estes scripts
- Ou use diretamente do app (requer Anthropic SDK JavaScript)

### Q: Como monitorar erros?
**A:** Implemente logging:
```python
import logging

logging.basicConfig(
    filename='logs/manus.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logging.info("Tarefa executada com sucesso")
logging.error("Erro ao processar dados")
```

---

## 📚 Recursos Adicionais

- **Documentação Claude API:** https://docs.anthropic.com/
- **Supabase Python Client:** https://supabase.com/docs/reference/python/
- **MCP Spec:** https://spec.modelcontextprotocol.io/
- **Schedule Library:** https://schedule.readthedocs.io/

---

## 📧 Suporte

Para problemas ou dúvidas:

1. Verifique este guia primeiro
2. Revise logs em `logs/`
3. Teste componentes individuais
4. Contate equipe de desenvolvimento

---

**Última atualização:** 30/10/2025
**Versão:** 1.0.0
**Projeto:** Ailun Saúde - Integração Manus + Claude
