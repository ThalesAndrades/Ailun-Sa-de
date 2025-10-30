# 🤖 Integração Manus + Claude - Ailun Saúde

Automação inteligente de análises de dados e geração de relatórios usando o agente autônomo Manus e os modelos de linguagem Claude da Anthropic.

---

## 🚀 Quick Start

```bash
# 1. Configurar integração
cd manus-integration
./setup.sh

# 2. Testar Claude
python scripts/claude_client.py

# 3. Executar exemplo de automação
python examples/example_daily_automation.py

# 4. Iniciar scheduler de automações
python scripts/automation_scheduler.py
```

---

## 📁 Estrutura do Projeto

```
manus-integration/
├── config/                  # Configurações
│   └── manus.config.json   # Config principal
├── scripts/                 # Scripts Python
│   ├── claude_client.py    # Cliente Claude API
│   ├── supabase_integration.py  # Integração Supabase
│   ├── automation_scheduler.py  # Agendador de tarefas
│   └── mcp_server.py       # Servidor MCP
├── examples/               # Exemplos de uso
│   ├── example_daily_automation.py
│   └── example_mcp_usage.sh
├── docs/                   # Documentação
│   └── INTEGRATION_GUIDE.md  # Guia completo
├── reports/                # Relatórios gerados
├── logs/                   # Logs do sistema
├── requirements.txt        # Dependências Python
├── setup.sh               # Script de instalação
└── README.md              # Este arquivo
```

---

## ✨ Funcionalidades

### 🔧 Componentes Principais

1. **Claude Client** - Integração com API Anthropic
2. **Supabase Integration** - Conexão com banco de dados
3. **Automation Scheduler** - Agendamento de tarefas
4. **MCP Server** - Model Context Protocol

### 📊 Automações Disponíveis

- ✅ Relatórios diários (09:00)
- ✅ Análise de tendências semanal (Segunda 10:00)
- ✅ Resumo executivo mensal (Dia 1, 08:00)
- ✅ Lembretes de consultas (a cada 6h)

### 🎯 Casos de Uso

- 📈 Análise de dados de saúde
- 📄 Geração de relatórios automatizados
- 🔍 Busca inteligente em linguagem natural
- 💡 Geração de insights estratégicos
- 🚨 Detecção de anomalias e alertas

---

## ⚙️ Configuração

### Pré-requisitos

- Python 3.8+
- pip3
- API Key da Anthropic
- Acesso ao Supabase

### Variáveis de Ambiente

Adicione ao `.env` na raiz do projeto:

```bash
# API Claude
ANTHROPIC_API_KEY=sk-ant-your-api-key-here

# Supabase (já existentes)
EXPO_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Instalação

```bash
# Executar setup automático
./setup.sh

# O script irá:
# - Criar ambiente virtual
# - Instalar dependências
# - Verificar configurações
# - Testar conexões
```

---

## 📖 Exemplos de Uso

### Exemplo 1: Gerar Relatório

```python
from supabase_integration import SupabaseClaudeIntegration

integration = SupabaseClaudeIntegration()
report = integration.generate_daily_report()
print(report)
```

### Exemplo 2: Analisar Dados de Saúde

```python
from claude_client import ClaudeClient

client = ClaudeClient()
health_data = {
    "paciente_id": "123",
    "pressao_arterial": {"sistolica": 140, "diastolica": 90},
    "glicemia": 185
}

analysis = client.analyze_health_data(health_data)
print(analysis)
```

### Exemplo 3: Usar Servidor MCP

```bash
# Listar ferramentas
python scripts/mcp_server.py

# Gerar relatório
python scripts/mcp_server.py generate_report '{}'

# Analisar tendências
python scripts/mcp_server.py predict_trends '{"days": 30}'

# Query inteligente
python scripts/mcp_server.py smart_query '{"query": "Quantas consultas tivemos hoje?"}'
```

---

## 🔄 Automações

### Executar Manualmente

```bash
# Relatório diário
python scripts/automation_scheduler.py daily

# Análise semanal
python scripts/automation_scheduler.py weekly

# Resumo mensal
python scripts/automation_scheduler.py monthly
```

### Executar Continuamente

```bash
# Modo daemon (roda indefinidamente)
python scripts/automation_scheduler.py

# Em background
nohup python scripts/automation_scheduler.py > logs/scheduler.log 2>&1 &
```

---

## 📚 Documentação Completa

📖 **Leia o guia completo:** [`docs/INTEGRATION_GUIDE.md`](docs/INTEGRATION_GUIDE.md)

Inclui:
- Arquitetura detalhada
- Referência completa de API
- Casos de uso avançados
- Troubleshooting
- FAQ

---

## 🛠️ Ferramentas MCP Disponíveis

| Ferramenta | Descrição |
|-----------|-----------|
| `analyze_health_data` | Analisa dados de saúde de usuário |
| `generate_report` | Gera relatório diário da plataforma |
| `search_users` | Busca usuários com filtros |
| `get_appointment_summary` | Resumo de consulta médica |
| `predict_trends` | Previsão de tendências |
| `smart_query` | Consulta em linguagem natural |

---

## 🔐 Segurança e Privacidade

⚠️ **IMPORTANTE:** Este sistema processa dados de saúde sensíveis.

- ✅ Use HTTPS (já configurado)
- ✅ Anonimize dados quando possível
- ✅ Revise conformidade com LGPD
- ✅ Configure data retention policies
- ✅ Audite logs regularmente

---

## 🐛 Troubleshooting

### Erro comum: "ANTHROPIC_API_KEY não configurada"

```bash
# Adicionar ao .env
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" >> ../.env
```

### Erro: "Module not found"

```bash
# Reinstalar dependências
pip install -r requirements.txt
```

### Scheduler não executa tarefas

```bash
# Ver logs
tail -f logs/scheduler.log

# Verificar jobs
python -c "import schedule; print(schedule.get_jobs())"
```

---

## 📊 Arquitetura

```
App Mobile (React Native)
        ↓
   Supabase DB
        ↓
Manus + Claude Integration
    ↓         ↓         ↓
Claude    Scheduler   MCP
 API                 Server
```

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adicionar nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é parte do sistema Ailun Saúde.

---

## 📧 Contato

Para suporte ou dúvidas sobre a integração:

- **Documentação:** `docs/INTEGRATION_GUIDE.md`
- **Exemplos:** `examples/`
- **Logs:** `logs/`

---

## 🎯 Roadmap

- [ ] Integração com notificações push
- [ ] Dashboard web para visualização de relatórios
- [ ] Suporte a múltiplos idiomas
- [ ] API REST para acesso externo
- [ ] Integração com mais serviços de saúde
- [ ] Modo offline com sync

---

**Versão:** 1.0.0
**Última atualização:** 30/10/2025
**Projeto:** Ailun Saúde

---

## 🌟 Recursos Adicionais

- [Documentação Claude API](https://docs.anthropic.com/)
- [Supabase Python Client](https://supabase.com/docs/reference/python/)
- [Model Context Protocol](https://spec.modelcontextprotocol.io/)
- [Schedule Library](https://schedule.readthedocs.io/)

---

<div align="center">

**Feito com ❤️ para Ailun Saúde**

*Powered by Manus 🤖 + Claude 🧠*

</div>
