# Integração RapiDoc - Documentação Detalhada

## Visão Geral

O RapiDoc é a plataforma de API de saúde integrada ao sistema Ailun Saúde para gerenciamento de beneficiários, consultas médicas e serviços de telemedicina. Esta documentação descreve todos os aspectos da integração.

## Configuração e Autenticação

### Variáveis de Ambiente

```bash
RAPIDOC_CLIENT_ID=seu_client_id
RAPIDOC_TOKEN=seu_bearer_token
RAPIDOC_BASE_URL=https://api.rapidoc.tech
```

### Headers Padrão

Todas as requisições para a API RapiDoc devem incluir:

```typescript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${RAPIDOC_TOKEN}`,
  'X-Client-ID': RAPIDOC_CLIENT_ID,
  'User-Agent': 'AiLun-Saude/1.0',
}
```

## Endpoints Principais

### 1. Beneficiários

#### Criar Beneficiário
**Endpoint:** `POST /beneficiaries`

**Payload de Requisição:**
```typescript
interface CreateBeneficiaryRequest {
  name: string;           // Nome completo do beneficiário
  cpf: string;           // CPF sem formatação (apenas números)
  birth_date: string;    // Data no formato YYYY-MM-DD
  email: string;         // Email válido
  phone: string;         // Telefone sem formatação (apenas números)
  service_type: string;  // Tipo de serviço: 'gs', 'premium', etc.
}
```

**Exemplo:**
```json
{
  "name": "João Silva Santos",
  "cpf": "12345678901",
  "birth_date": "1985-03-15",
  "email": "joao.silva@email.com",
  "phone": "11987654321",
  "service_type": "gs"
}
```

**Resposta de Sucesso:**
```typescript
interface CreateBeneficiaryResponse {
  uuid: string;          // ID único do beneficiário
  name: string;
  cpf: string;
  service_type: string;
  status: 'active' | 'inactive';
  created_at: string;    // ISO 8601 timestamp
}
```

#### Buscar Beneficiário por CPF
**Endpoint:** `GET /beneficiaries/search?cpf={cpf}`

**Resposta:**
```typescript
interface BeneficiarySearchResponse {
  uuid: string;
  name: string;
  cpf: string;
  birth_date: string;
  email: string;
  phone: string;
  service_type: string;
  status: string;
  has_active_plan: boolean;
}
```

### 2. Consultas Médicas

#### Solicitar Consulta Imediata
**Endpoint:** `POST /consultations/immediate`

**Payload:**
```typescript
interface ImmediateConsultationRequest {
  beneficiary_uuid: string;
  service_type: 'clinical' | 'specialist' | 'psychology' | 'nutrition';
  specialty?: string;        // Obrigatório para especialistas
  priority: number;          // 0 = normal, 1 = alta, 2 = urgente
  notes?: string;           // Observações do paciente
}
```

**Resposta:**
```typescript
interface ConsultationResponse {
  consultation_id: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed';
  estimated_time?: number;   // Tempo estimado em minutos
  queue_position?: number;   // Posição na fila
  consultation_url?: string; // URL da sala virtual (quando disponível)
  professional?: {
    name: string;
    specialty: string;
    crm: string;
  };
}
```

#### Agendar Consulta
**Endpoint:** `POST /consultations/schedule`

**Payload:**
```typescript
interface ScheduleConsultationRequest {
  beneficiary_uuid: string;
  service_type: string;
  specialty?: string;
  preferred_date: string;    // YYYY-MM-DD
  preferred_time: string;    // HH:MM
  notes?: string;
}
```

#### Buscar Histórico de Consultas
**Endpoint:** `GET /consultations/history?beneficiary_uuid={uuid}&limit={limit}&offset={offset}`

### 3. Disponibilidade de Profissionais

#### Verificar Disponibilidade
**Endpoint:** `GET /availability?service_type={type}&date={YYYY-MM-DD}&specialty={specialty}`

**Resposta:**
```typescript
interface AvailabilityResponse {
  available_slots: Array<{
    time: string;          // HH:MM
    professional_id: string;
    professional_name: string;
    available: boolean;
  }>;
  next_available?: string; // Próximo horário disponível se não houver hoje
}
```

## Tratamento de Erros

### Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Dados inválidos na requisição
- **401**: Token de autenticação inválido
- **403**: Acesso negado
- **404**: Recurso não encontrado
- **409**: Conflito (ex: CPF já cadastrado)
- **422**: Erro de validação
- **429**: Muitas requisições (rate limit)
- **500**: Erro interno do servidor
- **503**: Serviço temporariamente indisponível

### Estrutura de Erro Padrão

```typescript
interface RapidocError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  request_id: string;
}
```

### Exemplos de Erros Comuns

```json
// CPF já cadastrado
{
  "error": {
    "code": "DUPLICATE_CPF",
    "message": "CPF já cadastrado no sistema",
    "details": {
      "existing_beneficiary_uuid": "uuid-existente"
    }
  }
}

// Beneficiário não encontrado
{
  "error": {
    "code": "BENEFICIARY_NOT_FOUND",
    "message": "Beneficiário não encontrado"
  }
}

// Dados inválidos
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados de entrada inválidos",
    "details": {
      "field_errors": {
        "cpf": "CPF deve conter 11 dígitos",
        "email": "Email inválido"
      }
    }
  }
}
```

## Rate Limiting

A API RapiDoc implementa rate limiting:

- **Máximo**: 100 requisições por minuto por cliente
- **Header de controle**: `X-RateLimit-Remaining`
- **Reset**: A cada minuto

## Retry e Idempotência

### Estratégia de Retry

```typescript
const retryConfig = {
  maxRetries: 3,
  backoffMultiplier: 2,
  initialDelay: 1000,
  retryOn: [429, 500, 502, 503, 504],
};
```

### Headers de Idempotência

Para operações críticas, use o header `Idempotency-Key`:

```typescript
headers: {
  'Idempotency-Key': `${beneficiary_uuid}-${timestamp}`,
}
```

## Webhook Notifications

O RapiDoc pode enviar notificações via webhook para atualizações em tempo real:

### Configuração do Webhook

```json
{
  "webhook_url": "https://sua-api.com/webhook/rapidoc",
  "events": [
    "consultation.confirmed",
    "consultation.started",
    "consultation.completed",
    "professional.assigned"
  ]
}
```

### Estrutura do Webhook

```typescript
interface WebhookPayload {
  event_type: string;
  event_id: string;
  timestamp: string;
  data: {
    consultation_id: string;
    beneficiary_uuid: string;
    status: string;
    // ... outros dados específicos do evento
  };
}
```

## Integração no Código

### Service Layer (`services/rapidoc.ts`)

```typescript
class RapidocService {
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    // Implementação com retry, logging e tratamento de erros
  }

  async createBeneficiary(data: CreateBeneficiaryRequest): Promise<BeneficiaryResponse> {
    return this.makeRequest('/beneficiaries', 'POST', data);
  }

  async searchBeneficiary(cpf: string): Promise<BeneficiarySearchResponse> {
    return this.makeRequest(`/beneficiaries/search?cpf=${cpf}`);
  }
  
  // ... outros métodos
}
```

### Hook Layer (`hooks/useRapidoc.tsx`)

```typescript
export function useRapidoc() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBeneficiary = async (data: CreateBeneficiaryRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await rapidocService.createBeneficiary(data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createBeneficiary,
    searchBeneficiary,
    // ... outros métodos
  };
}
```

## Monitoramento e Logs

### Métricas Importantes

1. **Taxa de Sucesso**: % de requisições bem-sucedidas
2. **Latência**: Tempo médio de resposta
3. **Rate Limiting**: Frequência de hits no limite
4. **Errors**: Distribuição por tipo de erro

### Logging Estruturado

```typescript
const logRapidocRequest = (method: string, endpoint: string, duration: number, status: number) => {
  console.log({
    service: 'rapidoc',
    method,
    endpoint,
    duration_ms: duration,
    status_code: status,
    timestamp: new Date().toISOString(),
  });
};
```

## Ambiente de Desenvolvimento

### Configuração Local

```bash
# .env.development
RAPIDOC_CLIENT_ID=dev_client_id
RAPIDOC_TOKEN=dev_token
RAPIDOC_BASE_URL=https://api-dev.rapidoc.tech
```

### Mock Server para Testes

```typescript
// Para desenvolvimento local sem API
const mockRapidocService = {
  async createBeneficiary(data) {
    return {
      uuid: `mock_${Date.now()}`,
      name: data.name,
      cpf: data.cpf,
      status: 'active',
    };
  },
  // ... outros métodos mock
};
```

## Troubleshooting

### Problemas Comuns

1. **Token Expirado**
   - Erro: 401 Unauthorized
   - Solução: Renovar token na configuração

2. **Rate Limit Atingido**
   - Erro: 429 Too Many Requests
   - Solução: Implementar backoff exponencial

3. **CPF Duplicado**
   - Erro: 409 Conflict
   - Solução: Verificar se beneficiário já existe antes de criar

4. **Timeout de Rede**
   - Erro: Network timeout
   - Solução: Aumentar timeout ou verificar conectividade

### Debug e Logs

```typescript
// Ativar logs detalhados
const DEBUG_RAPIDOC = process.env.NODE_ENV === 'development';

if (DEBUG_RAPIDOC) {
  console.log('[RapiDoc] Request:', method, endpoint, body);
  console.log('[RapiDoc] Response:', status, responseData);
}
```

## Segurança

### Boas Práticas

1. **Nunca exponha tokens no cliente**
2. **Use HTTPS sempre**
3. **Valide dados antes de enviar**
4. **Implemente rate limiting local**
5. **Log apenas dados não sensíveis**

### Sanitização de Dados

```typescript
const sanitizeForLog = (data: any) => {
  const sanitized = { ...data };
  if (sanitized.cpf) {
    sanitized.cpf = sanitized.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
  }
  return sanitized;
};
```

## Conclusão

Esta integração permite que o Ailun Saúde utilize todos os recursos da plataforma RapiDoc de forma robusta e segura. Mantenha esta documentação atualizada conforme evoluções da API.

Para suporte técnico ou dúvidas sobre a integração, consulte:
- Documentação oficial: [docs.rapidoc.tech](https://docs.rapidoc.tech)
- Suporte técnico: suporte@rapidoc.tech
- Status da API: [status.rapidoc.tech](https://status.rapidoc.tech)