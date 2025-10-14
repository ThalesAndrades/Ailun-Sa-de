# 🎨 Guia de Integração da UI com Serviços Supabase e RapiDoc

Este guia detalha como integrar os serviços recém-criados (`services/consultationFlow.ts`, `services/rapidoc.ts`) nas telas do seu aplicativo React Native. Ele oferece exemplos práticos para cada fluxo de consulta, ajudando você a conectar a lógica de backend com a experiência do usuário.

---

## 🚀 Visão Geral da Integração

Os serviços em `services/consultationFlow.ts` encapsulam toda a lógica de negócio e chamadas à API RapiDoc, simplificando a integração no frontend. Seu trabalho será:

1.  **Importar** as funções necessárias.
2.  **Chamar** as funções nos eventos da UI (ex: `onPress` de um botão).
3.  **Gerenciar o estado** da UI (carregamento, erros, dados).
4.  **Navegar** entre as telas com base nas respostas.

---

## 1. Fluxo: Médico Imediato

Este fluxo é para quando o usuário precisa de um atendimento médico imediato e será redirecionado para uma sala de consulta externa.

### Componente de Exemplo: `ImmediateConsultationScreen.tsx`

```typescript
// examples/ImmediateConsultationScreen.tsx

import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, Linking, StyleSheet } from 'react-native';
import { startImmediateConsultation } from '../services/consultationFlow';
import { useAuth } from '../hooks/useAuth'; // Assumindo que você tem um hook de autenticação

const ImmediateConsultationScreen: React.FC = () => {
  const { user, loading: authLoading } = useAuth(); // Obter usuário logado
  const [loading, setLoading] = useState(false);
  const [consultationUrl, setConsultationUrl] = useState<string | null>(null);

  const handleStartConsultation = async () => {
    if (!user || !user.id) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    setLoading(true);
    try {
      // O beneficiaryUuid deve ser obtido do perfil do usuário
      // Ex: user.user_metadata.rapidoc_beneficiary_uuid
      // Por enquanto, usaremos um placeholder ou o ID do usuário se for o caso
      const beneficiaryUuid = user.user_metadata?.rapidoc_beneficiary_uuid || user.id; 

      const result = await startImmediateConsultation(beneficiaryUuid);

      if (result.success) {
        setConsultationUrl(result.data.consultationUrl);
        Alert.alert('Sucesso', 'Sua consulta imediata foi iniciada! Clique no botão para acessar.');
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível iniciar a consulta imediata.');
      }
    } catch (error) {
      console.error('Erro ao iniciar consulta imediata:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao iniciar a consulta.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessConsultation = () => {
    if (consultationUrl) {
      Linking.openURL(consultationUrl).catch(err =>
        console.error('Erro ao abrir URL da consulta:', err)
      );
    }
  };

  if (authLoading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Consulta Médica Imediata</Text>
      <Text style={styles.description}>
        Clique no botão abaixo para iniciar uma consulta com um médico disponível agora.
      </Text>
      <Button
        title={loading ? "Iniciando..." : "Iniciar Consulta Imediata"}
        onPress={handleStartConsultation}
        disabled={loading || !user}
      />
      {consultationUrl && (
        <View style={styles.consultationLinkContainer}>
          <Text style={styles.consultationText}>Sua consulta está pronta!</Text>
          <Button title="Acessar Sala de Consulta" onPress={handleAccessConsultation} />
        </View>
      )}
      {loading && <ActivityIndicator size="small" color="#0000ff" style={styles.loadingIndicator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  consultationLinkContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  consultationText: {
    fontSize: 18,
    marginBottom: 10,
  },
  loadingIndicator: {
    marginTop: 10,
  },
});

export default ImmediateConsultationScreen;
```

### Pontos de Atenção:
-   **`useAuth()`**: Certifique-se de que seu hook de autenticação fornece o `user.id` e, idealmente, o `rapidoc_beneficiary_uuid` do perfil do usuário.
-   **`beneficiaryUuid`**: Este UUID é crucial para todas as chamadas à RapiDoc. Ele deve ser obtido do perfil do usuário no Supabase (tabela `user_profiles`).
-   **`Linking.openURL()`**: Abre o link da consulta em um navegador externo ou aplicativo compatível.

---

## 2. Fluxo: Agendamento de Especialistas

Este fluxo envolve listar especialidades, verificar encaminhamentos, listar horários e agendar.

### Componente de Exemplo: `SpecialistAppointmentScreen.tsx`

```typescript
// components/SpecialistAppointmentScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import {
  getSpecialtiesList,
  checkSpecialtyReferral,
  getSpecialtyAvailability,
  scheduleSpecialistAppointment,
} from '../services/consultationFlow';
import { useAuth } from '../hooks/useAuth';

interface Specialty {
  uuid: string;
  name: string;
}

interface Availability {
  uuid: string;
  date: string;
  time: string;
  professionalName: string;
  specialtyUuid: string;
}

const SpecialistAppointmentScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Listar Especialidades, 2: Listar Horários, 3: Confirmar
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [hasReferral, setHasReferral] = useState<boolean | null>(null);
  const [availableTimes, setAvailableTimes] = useState<Availability[]>([]);
  const [selectedTime, setSelectedTime] = useState<Availability | null>(null);

  const beneficiaryUuid = user?.user_metadata?.rapidoc_beneficiary_uuid || user?.id; // Obter do perfil

  useEffect(() => {
    if (step === 1 && beneficiaryUuid) {
      fetchSpecialties();
    }
  }, [step, beneficiaryUuid]);

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      const result = await getSpecialtiesList();
      if (result.success) {
        // Remover Nutrição da lista, pois tem fluxo separado
        setSpecialties(result.data.filter(s => s.name.toLowerCase() !== 'nutrição'));
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível carregar as especialidades.');
      }
    } catch (error) {
      console.error('Erro ao buscar especialidades:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpecialty = async (specialty: Specialty) => {
    setSelectedSpecialty(specialty);
    setLoading(true);
    try {
      const referralCheck = await checkSpecialtyReferral(beneficiaryUuid, specialty.uuid);
      if (referralCheck.success) {
        setHasReferral(referralCheck.data.hasReferral);
        if (referralCheck.data.hasReferral) {
          Alert.alert('Encaminhamento', `Você tem encaminhamento ativo para ${specialty.name}.`);
          setStep(2); // Ir para listagem de horários
        } else {
          Alert.alert(
            'Encaminhamento Necessário',
            `Você não possui encaminhamento para ${specialty.name}. Sugerimos uma consulta com clínico geral para obter um encaminhamento.`, 
            [
              { text: 'OK', onPress: () => setStep(1) }, // Voltar para especialidades
              { text: 'Agendar Clínico Geral', onPress: () => { /* Navegar para fluxo de clínico geral */ } },
            ]
          );
        }
      } else {
        Alert.alert('Erro', referralCheck.error || 'Não foi possível verificar o encaminhamento.');
      }
    } catch (error) {
      console.error('Erro ao verificar encaminhamento:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao verificar encaminhamento.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedSpecialty || !beneficiaryUuid) return;

    setLoading(true);
    try {
      const result = await getSpecialtyAvailability(beneficiaryUuid, selectedSpecialty.uuid);
      if (result.success) {
        setAvailableTimes(result.data);
        if (result.data.length === 0) {
          Alert.alert('Aviso', 'Não há horários disponíveis para esta especialidade.');
        }
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível carregar os horários disponíveis.');
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao buscar horários.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTime = (time: Availability) => {
    setSelectedTime(time);
    setStep(3); // Ir para confirmação
  };

  const handleConfirmAppointment = async () => {
    if (!selectedSpecialty || !selectedTime || !beneficiaryUuid || hasReferral === null) return;

    setLoading(true);
    try {
      const result = await scheduleSpecialistAppointment(
        beneficiaryUuid,
        selectedSpecialty.uuid,
        selectedTime.uuid,
        hasReferral, // Passa se tem encaminhamento
        null // referralUuid (se tiver, será preenchido internamente pelo service)
      );

      if (result.success) {
        Alert.alert('Sucesso', 'Agendamento realizado com sucesso!');
        // Redirecionar para tela de agendamentos ou perfil
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível agendar a consulta.');
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao agendar a consulta.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View>
          <Text style={styles.title}>Escolha uma Especialidade</Text>
          <FlatList
            data={specialties}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.specialtyItem} onPress={() => handleSelectSpecialty(item)}>
                <Text style={styles.specialtyText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {step === 2 && selectedSpecialty && (
        <View>
          <Text style={styles.title}>Horários para {selectedSpecialty.name}</Text>
          <Button title="Voltar para Especialidades" onPress={() => setStep(1)} />
          <FlatList
            data={availableTimes}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.timeItem} onPress={() => handleSelectTime(item)}>
                <Text>{item.date} às {item.time} - {item.professionalName}</Text>
              </TouchableOpacity>
            )}
          />
          {availableTimes.length === 0 && <Text style={styles.noDataText}>Nenhum horário disponível.</Text>}
        </View>
      )}

      {step === 3 && selectedSpecialty && selectedTime && (
        <View>
          <Text style={styles.title}>Confirmar Agendamento</Text>
          <Text>Especialidade: {selectedSpecialty.name}</Text>
          <Text>Data: {selectedTime.date}</Text>
          <Text>Hora: {selectedTime.time}</Text>
          <Text>Profissional: {selectedTime.professionalName}</Text>
          <Button title="Confirmar Agendamento" onPress={handleConfirmAppointment} />
          <Button title="Voltar para Horários" onPress={() => setStep(2)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  specialtyItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  specialtyText: {
    fontSize: 18,
  },
  timeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
    alignItems: 'center',
  },
  noDataText: {
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default SpecialistAppointmentScreen;
```

### Pontos de Atenção:
-   **`beneficiaryUuid`**: Essencial para verificar encaminhamentos e agendar.
-   **`step`**: Use um estado para controlar as etapas do fluxo (seleção de especialidade, horários, confirmação).
-   **`Alert.alert`**: Para feedback ao usuário (sucesso, erro, encaminhamento).
-   **`filter`**: A lista de especialidades é filtrada para remover 'Nutrição'.
-   **Encaminhamento**: Se o usuário não tiver encaminhamento, o app sugere agendar um clínico geral.

---

## 3. Fluxo: Agendamento de Nutricionista

Este fluxo é similar ao de especialistas, mas focado apenas na especialidade de Nutrição.

### Componente de Exemplo: `NutritionistAppointmentScreen.tsx`

```typescript
// components/NutritionistAppointmentScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import {
  startNutritionistFlow,
} from '../services/consultationFlow';
import { useAuth } from '../hooks/useAuth';

interface Availability {
  uuid: string;
  date: string;
  time: string;
  professionalName: string;
  specialtyUuid: string;
}

const NutritionistAppointmentScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Listar Horários, 2: Confirmar
  const [availableTimes, setAvailableTimes] = useState<Availability[]>([]);
  const [selectedTime, setSelectedTime] = useState<Availability | null>(null);

  const beneficiaryUuid = user?.user_metadata?.rapidoc_beneficiary_uuid || user?.id; // Obter do perfil

  useEffect(() => {
    if (step === 1 && beneficiaryUuid) {
      fetchNutritionistAvailability();
    }
  }, [step, beneficiaryUuid]);

  const fetchNutritionistAvailability = async () => {
    setLoading(true);
    try {
      const result = await startNutritionistFlow(beneficiaryUuid);
      if (result.success) {
        setAvailableTimes(result.data.availableTimes);
        if (result.data.availableTimes.length === 0) {
          Alert.alert('Aviso', 'Não há horários disponíveis para Nutrição.');
        }
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível carregar os horários de Nutrição.');
      }
    } catch (error) {
      console.error('Erro ao buscar horários de Nutrição:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTime = (time: Availability) => {
    setSelectedTime(time);
    setStep(2); // Ir para confirmação
  };

  const handleConfirmAppointment = async () => {
    if (!selectedTime || !beneficiaryUuid) return;

    setLoading(true);
    try {
      // startNutritionistFlow já lida com o agendamento internamente
      // Aqui, apenas confirmamos que o selectedTime foi escolhido
      // A lógica de agendamento está dentro de startNutritionistFlow
      const result = await startNutritionistFlow(beneficiaryUuid, selectedTime.uuid); // Re-chama com o horário selecionado

      if (result.success && result.data.appointmentConfirmed) {
        Alert.alert('Sucesso', 'Agendamento com Nutricionista realizado com sucesso!');
        // Redirecionar para tela de agendamentos ou perfil
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível agendar a consulta com Nutricionista.');
      }
    } catch (error) {
      console.error('Erro ao agendar consulta com Nutricionista:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao agendar a consulta.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View>
          <Text style={styles.title}>Agendar Nutricionista</Text>
          <FlatList
            data={availableTimes}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.timeItem} onPress={() => handleSelectTime(item)}>
                <Text>{item.date} às {item.time} - {item.professionalName}</Text>
              </TouchableOpacity>
            )}
          />
          {availableTimes.length === 0 && <Text style={styles.noDataText}>Nenhum horário disponível.</Text>}
        </View>
      )}

      {step === 2 && selectedTime && (
        <View>
          <Text style={styles.title}>Confirmar Agendamento Nutricionista</Text>
          <Text>Data: {selectedTime.date}</Text>
          <Text>Hora: {selectedTime.time}</Text>
          <Text>Profissional: {selectedTime.professionalName}</Text>
          <Button title="Confirmar Agendamento" onPress={handleConfirmAppointment} />
          <Button title="Voltar para Horários" onPress={() => setStep(1)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
    alignItems: 'center',
  },
  noDataText: {
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default NutritionistAppointmentScreen;
```

### Pontos de Atenção:
-   O `startNutritionistFlow` no `consultationFlow.ts` já lida com a busca do UUID da nutrição e a verificação de encaminhamento. A UI apenas precisa chamar essa função.
-   A lógica de agendamento é integrada na segunda chamada de `startNutritionistFlow` com o `availabilityUuid`.

---

## 4. Fluxo: Agendamento de Psicologia

Este fluxo é muito similar ao de especialistas, mas focado na especialidade de Psicologia.

### Componente de Exemplo: `PsychologyAppointmentScreen.tsx`

```typescript
// components/PsychologyAppointmentScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import {
  startPsychologyFlow,
} from '../services/consultationFlow';
import { useAuth } from '../hooks/useAuth';

interface Availability {
  uuid: string;
  date: string;
  time: string;
  professionalName: string;
  specialtyUuid: string;
}

const PsychologyAppointmentScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Listar Horários, 2: Confirmar
  const [availableTimes, setAvailableTimes] = useState<Availability[]>([]);
  const [selectedTime, setSelectedTime] = useState<Availability | null>(null);

  const beneficiaryUuid = user?.user_metadata?.rapidoc_beneficiary_uuid || user?.id; // Obter do perfil

  useEffect(() => {
    if (step === 1 && beneficiaryUuid) {
      fetchPsychologyAvailability();
    }
  }, [step, beneficiaryUuid]);

  const fetchPsychologyAvailability = async () => {
    setLoading(true);
    try {
      const result = await startPsychologyFlow(beneficiaryUuid);
      if (result.success) {
        setAvailableTimes(result.data.availableTimes);
        if (result.data.availableTimes.length === 0) {
          Alert.alert('Aviso', 'Não há horários disponíveis para Psicologia.');
        }
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível carregar os horários de Psicologia.');
      }
    } catch (error) {
      console.error('Erro ao buscar horários de Psicologia:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTime = (time: Availability) => {
    setSelectedTime(time);
    setStep(2); // Ir para confirmação
  };

  const handleConfirmAppointment = async () => {
    if (!selectedTime || !beneficiaryUuid) return;

    setLoading(true);
    try {
      // startPsychologyFlow já lida com o agendamento internamente
      // Aqui, apenas confirmamos que o selectedTime foi escolhido
      const result = await startPsychologyFlow(beneficiaryUuid, selectedTime.uuid); // Re-chama com o horário selecionado

      if (result.success && result.data.appointmentConfirmed) {
        Alert.alert('Sucesso', 'Agendamento com Psicólogo realizado com sucesso!');
        // Redirecionar para tela de agendamentos ou perfil
      } else {
        Alert.alert('Erro', result.error || 'Não foi possível agendar a consulta com Psicólogo.');
      }
    } catch (error) {
      console.error('Erro ao agendar consulta com Psicólogo:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado ao agendar a consulta.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {step === 1 && (
        <View>
          <Text style={styles.title}>Agendar Psicólogo</Text>
          <FlatList
            data={availableTimes}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.timeItem} onPress={() => handleSelectTime(item)}>
                <Text>{item.date} às {item.time} - {item.professionalName}</Text>
              </TouchableOpacity>
            )}
          />
          {availableTimes.length === 0 && <Text style={styles.noDataText}>Nenhum horário disponível.</Text>}
        </View>
      )}

      {step === 2 && selectedTime && (
        <View>
          <Text style={styles.title}>Confirmar Agendamento Psicólogo</Text>
          <Text>Data: {selectedTime.date}</Text>
          <Text>Hora: {selectedTime.time}</Text>
          <Text>Profissional: {selectedTime.professionalName}</Text>
          <Button title="Confirmar Agendamento" onPress={handleConfirmAppointment} />
          <Button title="Voltar para Horários" onPress={() => setStep(1)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
    alignItems: 'center',
  },
  noDataText: {
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
});

export default PsychologyAppointmentScreen;
```

### Pontos de Atenção:
-   Similar ao fluxo de Nutrição, o `startPsychologyFlow` no `consultationFlow.ts` já lida com a busca do UUID da psicologia e a verificação de encaminhamento.
-   A lógica de agendamento é integrada na segunda chamada de `startPsychologyFlow` com o `availabilityUuid`.

---

## 5. Gerenciamento de Beneficiários

Antes de qualquer fluxo de consulta, o usuário precisa ter um `beneficiaryUuid` associado ao seu perfil. Este UUID é gerado pela RapiDoc quando um beneficiário é adicionado.

### Exemplo: Associar Beneficiário ao Perfil do Usuário

Você pode fazer isso no momento do registro ou no primeiro login do usuário, ou em uma tela de configuração de perfil.

```typescript
// services/userProfile.ts (exemplo de como você pode ter um serviço de perfil)

import { supabase } from './supabase'; // Seu cliente Supabase
import { addBeneficiary } from './rapidoc'; // Função para adicionar beneficiário na RapiDoc

export const ensureBeneficiaryProfile = async (userId: string, userEmail: string, userName: string, userPhone: string) => {
  // 1. Tentar buscar o perfil do usuário no Supabase
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('rapidoc_beneficiary_uuid')
    .eq('id', userId)
    .single();

  if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = No rows found
    console.error('Erro ao buscar perfil do usuário:', profileError);
    return { success: false, error: profileError.message };
  }

  // 2. Se já tiver um beneficiaryUuid, retornar
  if (profile?.rapidoc_beneficiary_uuid) {
    return { success: true, beneficiaryUuid: profile.rapidoc_beneficiary_uuid };
  }

  // 3. Se não tiver, adicionar beneficiário na RapiDoc
  console.log('Adicionando beneficiário na RapiDoc...');
  const beneficiaryData = {
    name: userName,
    cpf: '00000000000', // CPF deve ser real e único
    birthday: '2000-01-01', // Data de nascimento real
    phone: userPhone,
    email: userEmail,
    serviceType: 'GSP', // Generalista, Especialista, Psicologia
  };
  const rapidocResult = await addBeneficiary(beneficiaryData);

  if (rapidocResult.success) {
    const newBeneficiaryUuid = rapidocResult.data.uuid;
    console.log('Beneficiário RapiDoc criado:', newBeneficiaryUuid);

    // 4. Atualizar o perfil do usuário no Supabase com o novo UUID
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ rapidoc_beneficiary_uuid: newBeneficiaryUuid })
      .eq('id', userId);

    if (updateError) {
      console.error('Erro ao atualizar perfil com beneficiaryUuid:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, beneficiaryUuid: newBeneficiaryUuid };
  } else {
    console.error('Erro ao adicionar beneficiário na RapiDoc:', rapidocResult.error);
    return { success: false, error: rapidocResult.error };
  }
};

// Exemplo de uso em uma tela de perfil ou após o login
/*
const handleUserLogin = async (userId, email, name, phone) => {
  const result = await ensureBeneficiaryProfile(userId, email, name, phone);
  if (result.success) {
    console.log('Beneficiário garantido:', result.beneficiaryUuid);
    // Salvar no estado global ou contexto do usuário
  } else {
    Alert.alert('Erro', result.error);
  }
};
*/
```

### Pontos de Atenção:
-   **`cpf` e `birthday`**: Estes campos são placeholders. Você deve coletar o CPF e a data de nascimento reais do usuário para o registro na RapiDoc.
-   **`serviceType`**: Define os tipos de serviço que o beneficiário pode acessar. `GSP` (Generalista, Especialista, Psicologia) é um bom ponto de partida.
-   **`user_profiles`**: A tabela `user_profiles` no Supabase deve armazenar o `rapidoc_beneficiary_uuid` para cada usuário.

---

## 6. Lembretes e Agendamentos no Perfil

O `consultationFlow.ts` já cuida de criar lembretes e salvar os agendamentos no perfil do usuário (tabela `consultation_logs`). Você precisará de uma tela para exibir esses agendamentos.

### Exemplo: Tela de Meus Agendamentos

```typescript
// screens/MyAppointmentsScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase'; // Seu cliente Supabase
import { useAuth } from '../hooks/useAuth';

interface ConsultationLog {
  id: string;
  service_type: string;
  specialty?: string;
  status: string;
  consultation_url?: string;
  created_at: string;
  // Adicione outros campos relevantes da sua tabela consultation_logs
}

const MyAppointmentsScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<ConsultationLog[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchAppointments(user.id);
    }
  }, [user]);

  const fetchAppointments = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('consultation_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        Alert.alert('Erro', error.message);
      } else {
        setAppointments(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao carregar seus agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Agendamentos</Text>
      {appointments.length === 0 ? (
        <Text style={styles.noAppointmentsText}>Você não possui agendamentos.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.appointmentItem}>
              <Text style={styles.appointmentTitle}>{item.service_type} {item.specialty ? `- ${item.specialty}` : ''}</Text>
              <Text>Status: {item.status}</Text>
              <Text>Data: {new Date(item.created_at).toLocaleDateString()}</Text>
              {item.consultation_url && (
                <Button title="Acessar Consulta" onPress={() => Linking.openURL(item.consultation_url!)} />
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  noAppointmentsText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  appointmentItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default MyAppointmentsScreen;
```

### Pontos de Atenção:
-   **`consultation_logs`**: Esta tabela armazena o histórico de todas as consultas e agendamentos.
-   **`supabase.from('consultation_logs').select('*').eq('user_id', userId)`**: Busca todos os logs de consulta para o usuário logado.
-   **`Linking.openURL()`**: Permite reabrir a URL de uma consulta imediata, se aplicável.

---

## 7. Dicas Gerais para a UI

-   **Estados de Carregamento (`loading`)**: Sempre mostre um indicador de carregamento (`ActivityIndicator`) enquanto as chamadas assíncronas estão em andamento.
-   **Tratamento de Erros (`Alert.alert`)**: Use `Alert.alert` para informar o usuário sobre erros de forma amigável.
-   **Feedback Visual**: Mude o texto dos botões, desabilite-os ou mostre mensagens de sucesso/erro para guiar o usuário.
-   **Navegação**: Use sua biblioteca de navegação (ex: React Navigation) para mover o usuário entre as telas de forma fluida após cada etapa do fluxo.
-   **Contexto/Redux**: Considere usar um Context API ou Redux para gerenciar o estado global do usuário (incluindo `beneficiaryUuid`, agendamentos, etc.) para evitar passar props em excesso.
-   **Validação de Formulários**: Implemente validação no frontend para dados como CPF, telefone, etc., antes de enviar para a API.
-   **Notificações Push**: Para os lembretes de 30 minutos, você precisará integrar as notificações push do Expo/Firebase para que o usuário receba o alerta mesmo com o app fechado.

---

## ✅ Próximos Passos na UI

1.  **Crie as telas** para cada fluxo (Médico Imediato, Especialistas, Nutricionista, Psicologia, Meus Agendamentos).
2.  **Implemente os componentes** de exemplo, adaptando-os ao seu design.
3.  **Conecte o `beneficiaryUuid`** do perfil do usuário com os serviços de consulta.
4.  **Teste exaustivamente** cada fluxo para garantir que a experiência do usuário seja fluida e sem erros.

---

**Desenvolvido por AiLun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

**Última atualização**: 13/10/2025

