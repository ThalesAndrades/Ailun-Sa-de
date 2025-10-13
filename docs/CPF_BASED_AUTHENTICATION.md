# 🔐 Autenticação Baseada em CPF - Sistema Simplificado

Este documento descreve o novo sistema de autenticação do AiLun Saude, que utiliza **apenas os dados da RapiDoc** para autenticação, sem necessidade de criar contas separadas no Supabase Auth.

---

## 🎯 Conceito do Sistema

### Regras de Autenticação:
-   **Login**: CPF do beneficiário (11 dígitos, apenas números)
-   **Senha**: 4 primeiros dígitos do CPF
-   **Fonte de Dados**: Apenas RapiDoc TEMA (sem Supabase Auth)
-   **Sessão**: Gerenciada localmente no app (AsyncStorage/SecureStore)

### Exemplo:
```
CPF: 12345678900
Login: 12345678900
Senha: 1234
```

---

## 🏗️ Arquitetura Simplificada

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DE AUTENTICAÇÃO                        │
└─────────────────────────────────────────────────────────────────┘

1. USUÁRIO INSERE CREDENCIAIS
   ↓
   CPF: 12345678900
   Senha: 1234
   ↓
   ┌──────────────────────────────────────────────────────────┐
   │ VALIDAÇÃO LOCAL                                          │
   │ - Verifica se senha = 4 primeiros dígitos do CPF         │
   │ - Se inválido: Retorna erro                              │
   └──────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────┐
   │ BUSCAR BENEFICIÁRIO NA RAPIDOC                           │
   │ - Chama API: GET /beneficiaries?cpf={cpf}                │
   │ - Verifica se beneficiário existe e está ativo           │
   └──────────────────────────────────────────────────────────┘
   ↓
   ┌──────────────────────────────────────────────────────────┐
   │ CRIAR SESSÃO LOCAL                                       │
   │ - Salva beneficiaryUuid no AsyncStorage/SecureStore     │
   │ - Salva dados do beneficiário (nome, CPF, etc.)          │
   │ - Define flag isAuthenticated = true                     │
   └──────────────────────────────────────────────────────────┘
   ↓
   ✅ USUÁRIO LOGADO E PRONTO PARA USAR O APP
```

---

## 📦 Implementação

### 1. Criar Serviço de Autenticação Simplificado

```typescript
// services/cpfAuth.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBeneficiaryByCPF } from './rapidoc'; // Função a ser criada

const AUTH_KEY = '@ailun_auth';

interface AuthSession {
  beneficiaryUuid: string;
  cpf: string;
  name: string;
  email: string;
  phone: string;
  isAuthenticated: boolean;
  loginDate: string;
}

/**
 * Valida se a senha corresponde aos 4 primeiros dígitos do CPF
 */
const validatePassword = (cpf: string, password: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, ''); // Remove caracteres não numéricos
  const first4Digits = cleanCPF.substring(0, 4);
  return password === first4Digits;
};

/**
 * Realiza login com CPF e senha
 */
export const loginWithCPF = async (cpf: string, password: string) => {
  try {
    // 1. Limpar CPF (remover pontos e traços)
    const cleanCPF = cpf.replace(/\D/g, '');

    // 2. Validar formato do CPF
    if (cleanCPF.length !== 11) {
      return {
        success: false,
        error: 'CPF inválido. Deve conter 11 dígitos.',
      };
    }

    // 3. Validar senha (4 primeiros dígitos do CPF)
    if (!validatePassword(cleanCPF, password)) {
      return {
        success: false,
        error: 'Senha incorreta. A senha deve ser os 4 primeiros dígitos do CPF.',
      };
    }

    // 4. Buscar beneficiário na RapiDoc
    const beneficiaryResult = await getBeneficiaryByCPF(cleanCPF);

    if (!beneficiaryResult.success) {
      return {
        success: false,
        error: beneficiaryResult.error || 'CPF não encontrado no sistema.',
      };
    }

    const beneficiary = beneficiaryResult.data;

    // 5. Verificar se o beneficiário está ativo
    if (beneficiary.status !== 'active') {
      return {
        success: false,
        error: 'Beneficiário inativo. Entre em contato com o suporte.',
      };
    }

    // 6. Criar sessão local
    const session: AuthSession = {
      beneficiaryUuid: beneficiary.uuid,
      cpf: cleanCPF,
      name: beneficiary.name,
      email: beneficiary.email,
      phone: beneficiary.phone,
      isAuthenticated: true,
      loginDate: new Date().toISOString(),
    };

    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(session));

    return {
      success: true,
      data: session,
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      success: false,
      error: 'Erro ao realizar login. Tente novamente.',
    };
  }
};

/**
 * Obtém a sessão atual do usuário
 */
export const getCurrentSession = async (): Promise<AuthSession | null> => {
  try {
    const sessionData = await AsyncStorage.getItem(AUTH_KEY);
    if (!sessionData) return null;

    const session: AuthSession = JSON.parse(sessionData);
    return session;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
};

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return session?.isAuthenticated || false;
};

/**
 * Realiza logout
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    return { success: true };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { success: false, error: 'Erro ao fazer logout.' };
  }
};

/**
 * Atualiza dados da sessão
 */
export const updateSession = async (updates: Partial<AuthSession>) => {
  try {
    const currentSession = await getCurrentSession();
    if (!currentSession) {
      return { success: false, error: 'Nenhuma sessão ativa.' };
    }

    const updatedSession = { ...currentSession, ...updates };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updatedSession));

    return { success: true, data: updatedSession };
  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return { success: false, error: 'Erro ao atualizar sessão.' };
  }
};
```

---

### 2. Adicionar Função para Buscar Beneficiário por CPF na RapiDoc

```typescript
// services/rapidoc.ts (adicionar esta função)

/**
 * Busca beneficiário por CPF na RapiDoc
 */
export const getBeneficiaryByCPF = async (cpf: string) => {
  try {
    const response = await fetch(
      `${RAPIDOC_BASE_URL}/beneficiaries?cpf=${cpf}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${RAPIDOC_TOKEN}`,
          'clientId': RAPIDOC_CLIENT_ID,
          'Content-Type': RAPIDOC_CONTENT_TYPE,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Erro ao buscar beneficiário.',
      };
    }

    // A API pode retornar uma lista, pegar o primeiro resultado
    const beneficiary = Array.isArray(data) ? data[0] : data;

    if (!beneficiary) {
      return {
        success: false,
        error: 'CPF não encontrado.',
      };
    }

    return {
      success: true,
      data: beneficiary,
    };
  } catch (error) {
    console.error('Erro ao buscar beneficiário por CPF:', error);
    return {
      success: false,
      error: 'Erro de conexão com o servidor.',
    };
  }
};
```

---

### 3. Criar Tela de Login

```typescript
// screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { loginWithCPF } from '../services/cpfAuth';

const LoginScreen: React.FC = ({ navigation }) => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!cpf || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithCPF(cpf, password);

      if (result.success) {
        Alert.alert('Sucesso', `Bem-vindo, ${result.data.name}!`);
        // Navegar para tela principal
        navigation.replace('Home');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao fazer login.');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (text: string) => {
    // Remove caracteres não numéricos
    const cleaned = text.replace(/\D/g, '');
    
    // Formata CPF: 123.456.789-00
    const formatted = cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    
    return formatted;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AiLun Saude</Text>
      <Text style={styles.subtitle}>Faça login com seu CPF</Text>

      <TextInput
        style={styles.input}
        placeholder="CPF (apenas números)"
        value={cpf}
        onChangeText={(text) => setCpf(formatCPF(text))}
        keyboardType="numeric"
        maxLength={14} // 123.456.789-00
      />

      <TextInput
        style={styles.input}
        placeholder="Senha (4 primeiros dígitos do CPF)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        keyboardType="numeric"
        maxLength={4}
      />

      <Button
        title={loading ? 'Entrando...' : 'Entrar'}
        onPress={handleLogin}
        disabled={loading}
      />

      {loading && <ActivityIndicator size="small" color="#0000ff" style={styles.loader} />}

      <Text style={styles.helpText}>
        Sua senha são os 4 primeiros dígitos do seu CPF.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loader: {
    marginTop: 10,
  },
  helpText: {
    marginTop: 20,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});

export default LoginScreen;
```

---

### 4. Criar Hook de Autenticação

```typescript
// hooks/useCPFAuth.ts

import { useState, useEffect } from 'react';
import { getCurrentSession, logout as logoutService } from '../services/cpfAuth';

interface AuthSession {
  beneficiaryUuid: string;
  cpf: string;
  name: string;
  email: string;
  phone: string;
  isAuthenticated: boolean;
  loginDate: string;
}

export const useCPFAuth = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setLoading(true);
    const currentSession = await getCurrentSession();
    setSession(currentSession);
    setLoading(false);
  };

  const logout = async () => {
    await logoutService();
    setSession(null);
  };

  const refreshSession = async () => {
    await checkSession();
  };

  return {
    session,
    loading,
    isAuthenticated: !!session?.isAuthenticated,
    beneficiaryUuid: session?.beneficiaryUuid || null,
    logout,
    refreshSession,
  };
};
```

---

### 5. Proteger Rotas com Autenticação

```typescript
// navigation/AppNavigator.tsx (exemplo com React Navigation)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useCPFAuth } from '../hooks/useCPFAuth';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
// ... outras telas

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useCPFAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            {/* Outras telas autenticadas */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

---

### 6. Usar `beneficiaryUuid` nas Consultas

Agora, em todas as telas de consulta, você pode obter o `beneficiaryUuid` do hook:

```typescript
// screens/ImmediateConsultationScreen.tsx

import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { useCPFAuth } from '../hooks/useCPFAuth';
import { startImmediateConsultation } from '../services/consultationFlow';

const ImmediateConsultationScreen = () => {
  const { beneficiaryUuid } = useCPFAuth();
  const [loading, setLoading] = useState(false);

  const handleStartConsultation = async () => {
    if (!beneficiaryUuid) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    setLoading(true);
    try {
      const result = await startImmediateConsultation(beneficiaryUuid);
      if (result.success) {
        Alert.alert('Sucesso', 'Consulta iniciada!');
        // Abrir URL da consulta
      } else {
        Alert.alert('Erro', result.error);
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>Consulta Médica Imediata</Text>
      <Button title="Iniciar Consulta" onPress={handleStartConsultation} disabled={loading} />
    </View>
  );
};

export default ImmediateConsultationScreen;
```

---

## 🗑️ Remover Supabase Auth (Opcional)

Se você não quer mais usar o Supabase Auth, pode:

1.  **Manter as tabelas do Supabase** para armazenar logs de consultas, notificações, etc.
2.  **Remover a dependência de `auth.users`** das tabelas (mudar `user_id` para `beneficiary_uuid`)
3.  **Usar apenas o `beneficiaryUuid` como chave primária**

### Exemplo de Ajuste no Schema:

```sql
-- Alterar tabela consultation_logs para usar beneficiaryUuid
ALTER TABLE public.consultation_logs 
  DROP COLUMN user_id,
  ADD COLUMN beneficiary_uuid TEXT NOT NULL;

-- Remover RLS baseado em auth.uid()
DROP POLICY "Users can view own consultation logs" ON public.consultation_logs;

-- Criar nova política RLS (se necessário, ou desabilitar RLS)
-- Como não há mais auth.uid(), você pode desabilitar RLS ou criar políticas customizadas
ALTER TABLE public.consultation_logs DISABLE ROW LEVEL SECURITY;
```

**⚠️ Atenção**: Se desabilitar RLS, você precisará validar o acesso nas Edge Functions do Supabase.

---

## ✅ Checklist de Implementação

- [ ] Criar `services/cpfAuth.ts` com funções de login/logout
- [ ] Adicionar `getBeneficiaryByCPF` em `services/rapidoc.ts`
- [ ] Criar `screens/LoginScreen.tsx` com login por CPF
- [ ] Criar `hooks/useCPFAuth.ts` para gerenciar sessão
- [ ] Proteger rotas com verificação de autenticação
- [ ] Atualizar todas as telas de consulta para usar `beneficiaryUuid` do hook
- [ ] Testar fluxo completo: Login → Consulta → Logout
- [ ] (Opcional) Ajustar schema do Supabase para remover dependência de `auth.users`

---

## 🔒 Segurança

### ⚠️ Considerações Importantes:

1.  **Senha Fraca**: Os 4 primeiros dígitos do CPF são uma senha muito fraca. Considere:
    -   Adicionar opção de trocar senha
    -   Usar biometria (Face ID, Touch ID)
    -   Implementar 2FA (SMS, email)

2.  **Armazenamento Seguro**: Use `expo-secure-store` em vez de `AsyncStorage` para dados sensíveis:
    ```bash
    npm install expo-secure-store
    ```
    ```typescript
    import * as SecureStore from 'expo-secure-store';
    
    // Salvar
    await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify(session));
    
    // Buscar
    const sessionData = await SecureStore.getItemAsync(AUTH_KEY);
    ```

3.  **Validação de CPF**: Implemente validação de dígitos verificadores do CPF:
    ```typescript
    const validateCPF = (cpf: string): boolean => {
      const cleaned = cpf.replace(/\D/g, '');
      if (cleaned.length !== 11) return false;
      
      // Implementar algoritmo de validação de CPF
      // (código disponível em bibliotecas como 'cpf-cnpj-validator')
      return true;
    };
    ```

---

## 📞 Próximos Passos

1.  Implementar o sistema de autenticação baseado em CPF
2.  Testar login com CPFs reais da RapiDoc
3.  Ajustar o schema do Supabase (se necessário)
4.  Implementar melhorias de segurança (SecureStore, validação de CPF)

---

**Desenvolvido por AiLun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

**Última atualização**: 13/10/2025

