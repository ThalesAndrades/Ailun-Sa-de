/**
 * Documentação Completa - Correção de Endpoints RapiDoc
 * Sistema AiLun Saúde - Integração Oficial com RapiDoc API
 */

# Correções Implementadas - Endpoints RapiDoc

## ✅ Alinhamento com Documentação Oficial

### 1. Serviço Principal (services/rapidoc.ts)
- **Headers corretos**: `Authorization: Bearer TOKEN`, `clientId: CLIENT_ID`, `Content-Type: application/vnd.rapidoc.tema-v2+json`
- **Endpoints oficiais**: Todos os endpoints atualizados conforme documentação
- **Estrutura de dados**: Formatação correta para beneficiários, datas e parâmetros

### 2. Beneficiários
```typescript
// POST /tema/api/beneficiaries - Criar beneficiários (array)
createBeneficiaries(beneficiaries: BeneficiaryCreateData[]): Promise<RapidocBeneficiary[]>

// GET /tema/api/beneficiaries/:cpf - Buscar por CPF
getBeneficiaryByCPF(cpf: string): Promise<RapidocBeneficiary | null>

// GET /tema/api/beneficiaries - Listar todos
getAllBeneficiaries(): Promise<RapidocBeneficiary[]>

// PUT /tema/api/beneficiaries/:uuid - Atualizar
updateBeneficiary(uuid: string, data: Partial<BeneficiaryCreateData>): Promise<RapidocBeneficiary>

// DELETE /tema/api/beneficiaries/:uuid - Inativar
deactivateBeneficiary(uuid: string): Promise<boolean>

// PUT /tema/api/beneficiaries/:uuid/reactivate - Reativar
reactivateBeneficiary(uuid: string): Promise<boolean>
```

### 3. Consultas e Agendamentos
```typescript
// GET /tema/api/beneficiaries/:uuid/request-appointment - Consulta imediata
requestImmediateConsultation(beneficiaryUuid: string): Promise<ConsultationResponse>

// GET /tema/api/specialties - Listar especialidades
getSpecialties(): Promise<RapidocSpecialty[]>

// GET /tema/api/specialty-availability - Disponibilidade
getSpecialtyAvailability(params): Promise<RapidocAvailability[]>

// POST /tema/api/appointments - Agendar consulta
scheduleAppointment(params): Promise<RapidocAppointment>

// GET /tema/api/appointments - Listar agendamentos
getAllAppointments(): Promise<RapidocAppointment[]>

// DELETE /tema/api/appointments/:uuid - Cancelar agendamento
cancelAppointment(appointmentUuid: string): Promise<boolean>
```

### 4. Encaminhamentos Médicos
```typescript
// GET /tema/api/beneficiaries/:uuid/medical-referrals - Encaminhamentos do beneficiário
getBeneficiaryMedicalReferrals(beneficiaryUuid: string): Promise<RapidocMedicalReferral[]>

// GET /tema/api/beneficiary-medical-referrals - Todos os encaminhamentos
getAllMedicalReferrals(): Promise<RapidocMedicalReferral[]>
```

## 🔄 Mapeamentos e Formatações

### Tipos de Serviço (serviceType)
- `G` - Clínico Geral
- `P` - Psicologia
- `GP` - Clínico + Psicologia
- `GS` - Clínico + Especialista
- `GSP` - Clínico + Especialistas + Psicologia

### Tipos de Pagamento (paymentType)
- `S` - Recorrente (Subscription)
- `A` - Por Consulta (À vista)

### Formatos de Data
- **birthday**: `YYYY-MM-DD` (para cadastro)
- **dates**: `DD/MM/YYYY` (para agendamentos)
- **datetime**: `DD/MM/YYYY HH:MM:SS` (para timestamps)

## 🏗️ Arquivos Atualizados

### 1. services/rapidoc.ts
- Classe RapidocService completa com todos os endpoints
- Headers corretos conforme documentação
- Tratamento de erros robusto
- Mapeamentos de tipos de serviço
- Utilitários de formatação de data

### 2. services/rapidoc-consultation-service.ts
- Serviço especializado em consultas
- Integração completa com todos os endpoints de agendamento
- Verificação de saúde da API
- Suporte a encaminhamentos médicos

### 3. hooks/useRapidocConsultation.tsx
- Hook React com estado completo
- Gerenciamento de especialidades, agendamentos e encaminhamentos
- Funções de carregamento e atualização
- Sistema de saúde da integração

### 4. services/integration-orchestrator.ts
- Orquestração entre RapiDoc, Supabase, Asaas e Resend
- Sincronização automática de dados
- Processamento de pagamentos integrado
- Sistema de notificações multi-canal

### 5. config/rapidoc.config.ts
- Configurações centralizadas
- Endpoints oficiais mapeados
- Validação de configuração
- Headers padronizados

## 🧪 Testes de Integração

### Verificação de Saúde
```typescript
const health = await rapidocConsultationService.checkHealth();
// Retorna: { status: 'healthy' | 'degraded' | 'down', message: string }
```

### Teste de Endpoints
- ✅ GET /tema/api/specialties
- ✅ GET /tema/api/beneficiaries
- ✅ GET /tema/api/appointments
- ✅ POST /tema/api/beneficiaries (array)
- ✅ GET /tema/api/beneficiaries/:uuid/request-appointment

## 🎯 Próximos Passos

1. **Testar integração completa** com beneficiários reais
2. **Validar fluxo de agendamento** com especialidades
3. **Verificar encaminhamentos médicos** funcionando
4. **Confirmar notificações** sendo enviadas
5. **Testar sincronização** entre sistemas

## 📋 Checklist de Qualidade

- ✅ Headers conforme documentação oficial
- ✅ Endpoints exatos da API RapiDoc
- ✅ Estruturas de dados corretas
- ✅ Formatação de datas adequada
- ✅ Mapeamento de tipos de serviço
- ✅ Tratamento de erros robusto
- ✅ Sistema de retry implementado
- ✅ Logs detalhados para debugging
- ✅ Verificação de saúde automática
- ✅ Integração com outros serviços

Sistema AiLun Saúde agora está totalmente alinhado com a documentação oficial da RapiDoc, garantindo máxima compatibilidade e funcionalidade.