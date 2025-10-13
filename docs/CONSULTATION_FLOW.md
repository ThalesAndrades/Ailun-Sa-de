# Fluxo de Consultas - AiLun Saude

Este documento descreve o fluxo completo de consultas médicas integrado com a API RapiDoc TEMA.

---

## 📋 Visão Geral

O aplicativo oferece **4 tipos de consultas**:

1. **Médico Imediato** - Atendimento imediato com clínico geral
2. **Especialistas** - Consultas agendadas com especialistas
3. **Nutricionista** - Consultas agendadas com nutricionista
4. **Psicologia** - Consultas agendadas com psicólogo

---

## 🏥 FLUXO 1: Médico Imediato

### Descrição
Atendimento imediato com clínico geral, sem necessidade de agendamento.

### Passo a Passo

```typescript
import { startImmediateConsultation } from './services/consultationFlow';

// 1. Usuário clica em "Médico Imediato"
const handleImmediateConsultation = async () => {
  const result = await startImmediateConsultation(beneficiaryUuid);
  
  if (result.success) {
    // 2. Navegar para página de espera
    navigation.navigate('WaitingRoom', {
      consultationUrl: result.data.consultationUrl,
      message: result.data.message
    });
  } else {
    Alert.alert('Erro', result.error);
  }
};
```

### Tela de Espera

```typescript
function WaitingRoomScreen({ route }) {
  const { consultationUrl, message } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sala de Espera</Text>
      <Text style={styles.message}>{message}</Text>
      
      {/* Botão central com link da consulta */}
      <TouchableOpacity 
        style={styles.consultationButton}
        onPress={() => Linking.openURL(consultationUrl)}
      >
        <Text style={styles.buttonText}>Entrar na Consulta</Text>
      </TouchableOpacity>
      
      <Text style={styles.info}>
        O atendimento será realizado em ambiente externo
      </Text>
    </View>
  );
}
```

### API Chamada

- **Endpoint**: `GET /beneficiaries/:uuid/request-appointment`
- **Retorno**: URL da consulta
- **Ambiente**: Externo (RapiDoc)

---

## 🩺 FLUXO 2: Especialistas

### Descrição
Consultas agendadas com especialistas, requer verificação de encaminhamento.

### ETAPA 1: Listar Especialidades

```typescript
import { getSpecialtiesList } from './services/consultationFlow';

// Usuário clica em "Especialistas"
const handleSpecialtiesClick = async () => {
  const result = await getSpecialtiesList();
  
  if (result.success) {
    // Mostrar lista de especialidades (exceto nutrição)
    setSpecialties(result.data);
  }
};
```

**Tela:**
```
┌─────────────────────────────┐
│     Escolha a Especialidade  │
├─────────────────────────────┤
│  🩺 Cardiologia             │
│  🩺 Dermatologia            │
│  🩺 Ortopedia               │
│  🩺 Ginecologia             │
│  ...                        │
└─────────────────────────────┘
```

### ETAPA 2: Verificar Encaminhamento

```typescript
import { checkSpecialtyReferral } from './services/consultationFlow';

// Usuário clica em uma especialidade
const handleSpecialtySelect = async (specialty) => {
  const result = await checkSpecialtyReferral(
    beneficiaryUuid,
    specialty.uuid
  );
  
  if (result.needsGeneralPractitioner) {
    // Não tem encaminhamento
    Alert.alert(
      'Encaminhamento Necessário',
      'Você precisa passar pelo clínico geral para obter encaminhamento para esta especialidade.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Ir para Clínico Geral', 
          onPress: () => startImmediateConsultation(beneficiaryUuid)
        }
      ]
    );
  } else {
    // Tem encaminhamento, continuar para horários
    navigation.navigate('SpecialtyAvailability', {
      specialty,
      referral: result.referral
    });
  }
};
```

### ETAPA 3: Listar Horários Disponíveis

```typescript
import { getSpecialtyAvailability, getDefaultDateRange } from './services/consultationFlow';

// Buscar horários disponíveis
const loadAvailability = async () => {
  const { dateInitial, dateFinal } = getDefaultDateRange(); // Próximos 30 dias
  
  const result = await getSpecialtyAvailability(
    beneficiaryUuid,
    specialty.uuid,
    dateInitial,
    dateFinal
  );
  
  if (result.success) {
    setAvailability(result.data);
  }
};
```

**Tela:**
```
┌─────────────────────────────┐
│  Horários Disponíveis        │
│  Cardiologia                 │
├─────────────────────────────┤
│  📅 15/10/2025 - 14:00      │
│     Dr. João Silva           │
│                              │
│  📅 16/10/2025 - 10:30      │
│     Dra. Maria Santos        │
│                              │
│  📅 17/10/2025 - 16:00      │
│     Dr. Pedro Costa          │
└─────────────────────────────┘
```

### ETAPA 4: Confirmar Agendamento

```typescript
import { scheduleSpecialistAppointment } from './services/consultationFlow';

// Usuário escolhe um horário
const handleConfirmAppointment = async (availability) => {
  const result = await scheduleSpecialistAppointment(
    beneficiaryUuid,
    availability.uuid,
    specialty.uuid,
    referral?.uuid // UUID do encaminhamento
  );
  
  if (result.success) {
    Alert.alert(
      'Sucesso!',
      result.message,
      [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
    );
  }
};
```

**Confirmação:**
```
┌─────────────────────────────┐
│  ✅ Agendamento Confirmado   │
├─────────────────────────────┤
│  Especialidade: Cardiologia  │
│  Data: 15/10/2025            │
│  Horário: 14:00              │
│  Profissional: Dr. João Silva│
│                              │
│  🔔 Você receberá um lembrete│
│     30 minutos antes         │
└─────────────────────────────┘
```

---

## 🥗 FLUXO 3: Nutricionista

### Descrição
Consultas agendadas com nutricionista, com verificação de encaminhamento.

### Passo a Passo

```typescript
import { startNutritionistFlow, confirmNutritionistAppointment, getDefaultDateRange } from './services/consultationFlow';

// 1. Usuário clica em "Nutricionista"
const handleNutritionistClick = async () => {
  const { dateInitial, dateFinal } = getDefaultDateRange();
  
  const result = await startNutritionistFlow(
    beneficiaryUuid,
    dateInitial,
    dateFinal
  );
  
  if (result.success) {
    // 2. Mostrar horários disponíveis
    setNutritionData(result.data);
    
    if (result.data.needsGeneralPractitioner) {
      // Avisar sobre necessidade de encaminhamento
      Alert.alert(
        'Atenção',
        'Para agendar com nutricionista, você precisa de encaminhamento do clínico geral.',
        [
          { text: 'Continuar Mesmo Assim', onPress: () => {} },
          { text: 'Ir para Clínico Geral', onPress: () => startImmediateConsultation(beneficiaryUuid) }
        ]
      );
    }
  }
};

// 3. Usuário escolhe horário
const handleSelectNutritionistSlot = async (availability) => {
  const result = await confirmNutritionistAppointment(
    beneficiaryUuid,
    availability.uuid,
    nutritionData.specialty.uuid,
    nutritionData.referral?.uuid
  );
  
  if (result.success) {
    Alert.alert('Sucesso!', result.message);
  }
};
```

### Fluxo Visual

```
Usuário clica em "Nutricionista"
         ↓
App busca UUID da nutrição
         ↓
App verifica encaminhamento
         ↓
App lista horários disponíveis
         ↓
Usuário escolhe horário
         ↓
App confirma agendamento
         ↓
Lembrete criado (30 min antes)
```

---

## 🧠 FLUXO 4: Psicologia

### Descrição
Consultas agendadas com psicólogo, com listagem de profissionais e horários.

### Passo a Passo

```typescript
import { startPsychologyFlow, confirmPsychologyAppointment, getDefaultDateRange } from './services/consultationFlow';

// 1. Usuário clica em "Psicologia"
const handlePsychologyClick = async () => {
  const { dateInitial, dateFinal } = getDefaultDateRange();
  
  const result = await startPsychologyFlow(
    beneficiaryUuid,
    dateInitial,
    dateFinal
  );
  
  if (result.success) {
    // 2. Mostrar horários e profissionais
    setPsychologyData(result.data);
    
    if (result.data.needsGeneralPractitioner) {
      // Avisar sobre necessidade de encaminhamento
      showReferralAlert();
    }
  }
};

// 3. Usuário escolhe profissional e horário
const handleSelectPsychologySlot = async (availability) => {
  const result = await confirmPsychologyAppointment(
    beneficiaryUuid,
    availability.uuid,
    psychologyData.specialty.uuid,
    psychologyData.referral?.uuid
  );
  
  if (result.success) {
    Alert.alert('Sucesso!', result.message);
  }
};
```

### Tela de Horários

```
┌─────────────────────────────┐
│  Psicologia - Horários       │
├─────────────────────────────┤
│  📅 15/10/2025 - 09:00      │
│     Dra. Ana Paula           │
│     ⭐ 4.9 (120 avaliações)  │
│                              │
│  📅 15/10/2025 - 14:00      │
│     Dr. Carlos Eduardo       │
│     ⭐ 4.8 (95 avaliações)   │
│                              │
│  📅 16/10/2025 - 10:00      │
│     Dra. Beatriz Lima        │
│     ⭐ 5.0 (200 avaliações)  │
└─────────────────────────────┘
```

---

## 🔔 Sistema de Lembretes

### Criação Automática

Quando um agendamento é confirmado, o sistema automaticamente:

1. Calcula 30 minutos antes da consulta
2. Cria uma notificação no banco de dados
3. Agenda notificação push (se configurado)

### Implementação

```typescript
// Já implementado em consultationFlow.ts
const createAppointmentReminder = async (
  userId: string,
  appointmentDate: string,
  appointmentTime: string
) => {
  // Calcular 30 minutos antes
  const reminderDateTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);

  // Salvar no banco
  await supabase.from('system_notifications').insert({
    user_id: userId,
    title: 'Lembrete de Consulta',
    message: `Sua consulta está agendada para ${appointmentTime}. Prepare-se!`,
    type: 'info',
    metadata: {
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      reminder_time: reminderDateTime.toISOString(),
      type: 'appointment_reminder',
    },
  });
};
```

### Exibir Lembretes

```typescript
import { getNotifications } from './services/orchestrator';

const loadReminders = async () => {
  const result = await getNotifications();
  
  if (result.success) {
    const reminders = result.data.filter(
      (notification) => notification.metadata?.type === 'appointment_reminder'
    );
    
    setReminders(reminders);
  }
};
```

---

## 📊 Diagrama Completo do Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                    TELA INICIAL                              │
│                                                              │
│  [Médico Imediato]  [Especialistas]  [Nutricionista]  [Psicologia]
│                                                              │
└──────┬──────────────────┬─────────────────┬────────────────┘
       │                  │                 │                 │
       ▼                  ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Solicitar    │  │ Listar       │  │ Buscar UUID  │  │ Buscar UUID  │
│ Atendimento  │  │ Especialidades│  │ Nutrição     │  │ Psicologia   │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                  │                 │                 │
       ▼                  ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Sala de      │  │ Verificar    │  │ Verificar    │  │ Verificar    │
│ Espera       │  │ Encaminhamento│  │ Encaminhamento│  │ Encaminhamento│
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                  │                 │                 │
       ▼                  ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Link Consulta│  │ Listar       │  │ Listar       │  │ Listar       │
│ (Externo)    │  │ Horários     │  │ Horários     │  │ Horários     │
└──────────────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                         │                 │                 │
                         ▼                 ▼                 ▼
                  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                  │ Confirmar    │  │ Confirmar    │  │ Confirmar    │
                  │ Agendamento  │  │ Agendamento  │  │ Agendamento  │
                  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                         │                 │                 │
                         └─────────────────┴─────────────────┘
                                           │
                                           ▼
                                  ┌──────────────┐
                                  │ Criar        │
                                  │ Lembrete     │
                                  │ (30 min antes)│
                                  └──────────────┘
```

---

## 🔧 Configuração

### Variáveis de Ambiente

```env
RAPIDOC_TOKEN=seu_token_aqui
RAPIDOC_CLIENT_ID=seu_client_id_aqui
```

### Beneficiário UUID

Cada usuário precisa ter um `beneficiaryUuid` associado. Isso pode ser:

1. Criado ao registrar o usuário
2. Armazenado no perfil do usuário
3. Obtido via API RapiDoc

```typescript
// Exemplo: Salvar beneficiaryUuid no perfil
await supabase.from('user_profiles').update({
  rapidoc_beneficiary_uuid: beneficiaryUuid
}).eq('id', userId);
```

---

## 📚 Referências

- **API RapiDoc TEMA**: `https://sandbox.rapidoc.tech/tema/api/`
- **Documentação**: Arquivo `RapidocTEMA-InformaçõesdaAPI`
- **Serviços**: `services/rapidoc.ts` e `services/consultationFlow.ts`
- **Edge Function**: `supabase/functions/rapidoc/index.ts`

---

**Desenvolvido por AiLun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

