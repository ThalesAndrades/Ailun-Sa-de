# Integração do Supabase - AiLun Saude

Este documento descreve como o Supabase está integrado no projeto AiLun Saude e como utilizar os serviços disponíveis.

## 📋 Índice

1. [Configuração](#configuração)
2. [Autenticação](#autenticação)
3. [Banco de Dados](#banco-de-dados)
4. [Storage](#storage)
5. [Realtime](#realtime)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Exemplos de Uso](#exemplos-de-uso)

---

## 🔧 Configuração

### Credenciais

As credenciais do Supabase estão configuradas no arquivo `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://bmtieinegditdeijyslu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Cliente Supabase

O cliente está inicializado em `services/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 🔐 Autenticação

### Serviços Disponíveis

O arquivo `services/auth.ts` fornece funções prontas para autenticação:

#### Registro de Usuário

```typescript
import { signUp } from '../services/auth';

const handleSignUp = async () => {
  const result = await signUp('usuario@email.com', 'senha123');
  
  if (result.success) {
    console.log('Usuário registrado:', result.data);
  } else {
    console.error('Erro:', result.error);
  }
};
```

#### Login

```typescript
import { signIn } from '../services/auth';

const handleSignIn = async () => {
  const result = await signIn('usuario@email.com', 'senha123');
  
  if (result.success) {
    console.log('Login realizado:', result.data);
  } else {
    console.error('Erro:', result.error);
  }
};
```

#### Logout

```typescript
import { signOut } from '../services/auth';

const handleSignOut = async () => {
  await signOut();
};
```

#### Resetar Senha

```typescript
import { resetPassword } from '../services/auth';

const handleResetPassword = async () => {
  const result = await resetPassword('usuario@email.com');
  
  if (result.success) {
    console.log('Email de recuperação enviado');
  }
};
```

### Hook useAuth

Para facilitar o uso em componentes React, utilize o hook `useAuth`:

```typescript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, session, loading, signIn, signOut } = useAuth();

  if (loading) {
    return <Text>Carregando...</Text>;
  }

  if (!user) {
    return <LoginScreen onSignIn={signIn} />;
  }

  return (
    <View>
      <Text>Bem-vindo, {user.email}</Text>
      <Button title="Sair" onPress={signOut} />
    </View>
  );
}
```

---

## 🗄️ Banco de Dados

### Estrutura de Tabelas

O projeto utiliza as seguintes tabelas principais:

- **user_profiles**: Perfil do usuário
- **health_info**: Informações de saúde
- **emergency_contacts**: Contatos de emergência
- **user_preferences**: Preferências do usuário
- **consultation_logs**: Histórico de consultas
- **active_sessions**: Sessões ativas
- **consultation_queue**: Fila de consultas
- **system_notifications**: Notificações do sistema

### Operações CRUD

O arquivo `services/database.ts` fornece funções para todas as operações:

#### Perfil do Usuário

```typescript
import { getUserProfile, upsertUserProfile } from '../services/database';

// Buscar perfil
const profile = await getUserProfile(userId);

// Atualizar perfil
const result = await upsertUserProfile(userId, {
  full_name: 'João Silva',
  phone: '(11) 98765-4321',
  birth_date: '1990-01-15',
});
```

#### Informações de Saúde

```typescript
import { getHealthInfo, upsertHealthInfo } from '../services/database';

// Salvar informações de saúde
const result = await upsertHealthInfo(userId, {
  weight: 75,
  height: 175,
  blood_type: 'O+',
  allergies: 'Penicilina',
  medications: 'Losartana 50mg',
});
```

#### Contatos de Emergência

```typescript
import { 
  addEmergencyContact, 
  getEmergencyContacts, 
  removeEmergencyContact 
} from '../services/database';

// Adicionar contato
await addEmergencyContact(userId, {
  name: 'Maria Silva',
  phone: '(11) 91234-5678',
});

// Listar contatos
const contacts = await getEmergencyContacts(userId);

// Remover contato
await removeEmergencyContact(contactId);
```

---

## 📁 Storage

### Upload de Arquivos

O arquivo `services/storage.ts` fornece funções para gerenciar arquivos:

#### Upload de Imagem de Perfil

```typescript
import { uploadProfileImage } from '../services/storage';
import * as ImagePicker from 'expo-image-picker';

const handleUploadImage = async () => {
  // Selecionar imagem
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    const upload = await uploadProfileImage(userId, result.assets[0].uri);
    
    if (upload.success) {
      console.log('URL da imagem:', upload.url);
    }
  }
};
```

#### Upload de Documento Médico

```typescript
import { uploadMedicalDocument } from '../services/storage';
import * as DocumentPicker from 'expo-document-picker';

const handleUploadDocument = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
  });

  if (result.type === 'success') {
    const upload = await uploadMedicalDocument(
      userId, 
      result.uri, 
      result.name
    );
    
    if (upload.success) {
      console.log('Documento salvo:', upload.path);
    }
  }
};
```

### Download e Acesso a Arquivos

```typescript
import { getPublicUrl, getSignedUrl, downloadFile } from '../services/storage';

// URL pública (para buckets públicos)
const publicUrl = getPublicUrl('avatars', `${userId}/profile.jpg`);

// URL assinada (para buckets privados, expira em 1 hora)
const signedUrl = await getSignedUrl('medical-documents', filePath, 3600);

// Download direto
const file = await downloadFile('medical-documents', filePath);
```

---

## ⚡ Realtime

### Inscrever-se para Mudanças em Tempo Real

```typescript
import { subscribeToUserChanges } from '../services/database';

useEffect(() => {
  const subscription = subscribeToUserChanges(userId, (payload) => {
    console.log('Mudança detectada:', payload);
    // Atualizar estado do componente
  });

  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

### Exemplo: Chat em Tempo Real

```typescript
import { supabase } from '../services/supabase';

// Inscrever-se para novas mensagens
const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      console.log('Nova mensagem:', payload.new);
    }
  )
  .subscribe();

// Enviar mensagem
await supabase.from('messages').insert({
  user_id: userId,
  content: 'Olá!',
});
```

---

## 🎣 Hooks Personalizados

### useAuth

Gerencia autenticação e sessão do usuário.

```typescript
const { user, session, loading, signIn, signUp, signOut } = useAuth();
```

### Criar Hooks Personalizados

Você pode criar hooks para outras funcionalidades:

```typescript
// hooks/useUserProfile.ts
import { useState, useEffect } from 'react';
import { getUserProfile } from '../services/database';

export const useUserProfile = (userId: string) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getUserProfile(userId);
      if (result.success) {
        setProfile(result.data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading };
};
```

---

## 💡 Exemplos de Uso

### Tela de Login Completa

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    const result = await signIn(email, password);
    
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button 
        title={loading ? "Carregando..." : "Entrar"} 
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

### Tela de Perfil com Upload de Foto

```typescript
import React, { useEffect, useState } from 'react';
import { View, Image, Button } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../services/database';
import { uploadProfileImage } from '../services/storage';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const result = await getUserProfile(user.id);
    if (result.success) {
      setProfile(result.data);
      setAvatarUrl(result.data.avatar_url);
    }
  };

  const handleUploadAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const upload = await uploadProfileImage(user.id, result.assets[0].uri);
      
      if (upload.success) {
        setAvatarUrl(upload.url);
      }
    }
  };

  return (
    <View>
      {avatarUrl && (
        <Image 
          source={{ uri: avatarUrl }} 
          style={{ width: 100, height: 100, borderRadius: 50 }}
        />
      )}
      <Button title="Alterar Foto" onPress={handleUploadAvatar} />
    </View>
  );
}
```

---

## 🔒 Segurança

### Row Level Security (RLS)

Certifique-se de que as políticas RLS estão configuradas no Supabase para proteger os dados:

```sql
-- Exemplo: Usuários só podem ver seus próprios dados
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Validação de Dados

Sempre valide os dados antes de enviar ao Supabase:

```typescript
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password: string) => {
  return password.length >= 6;
};
```

---

## 📚 Recursos Adicionais

- [Documentação Oficial do Supabase](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Expo + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

---

## 🆘 Suporte

Para dúvidas ou problemas com a integração do Supabase, consulte:

- Dashboard do Supabase: https://app.supabase.com
- Logs do projeto: https://app.supabase.com/project/bmtieinegditdeijyslu/logs

---

**Desenvolvido por AiLun Tecnologia**  
CNPJ: 60.740.536/0001-75  
Email: contato@ailun.com.br

