import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../services/supabase';
import { getBeneficiaryByCPF } from '../../services/beneficiary-plan-service';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  birth_date: string;
  avatar_url?: string;
}

interface Beneficiary {
  beneficiary_uuid: string;
  cpf: string;
  full_name: string;
  service_type: string;
  status: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [beneficiary, setBeneficiary] = useState<Beneficiary | null>(null);
  
  // Campos editáveis
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);

      // Buscar usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        Alert.alert('Erro', 'Usuário não autenticado');
        router.back();
        return;
      }

      // Buscar perfil do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('[loadProfileData] Erro ao buscar perfil:', profileError);
      } else if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || '');
        setPhone(profileData.phone || '');
        setBirthDate(profileData.birth_date || '');
      }

      // Buscar beneficiário
      const { data: beneficiaryData, error: beneficiaryError } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_primary', true)
        .single();

      if (beneficiaryError) {
        console.error('[loadProfileData] Erro ao buscar beneficiário:', beneficiaryError);
      } else if (beneficiaryData) {
        setBeneficiary(beneficiaryData);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('[loadProfileData] Erro:', error);
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          phone: phone.replace(/\D/g, ''),
          birth_date: birthDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
      setIsEditing(false);
      loadProfileData();
    } catch (error: any) {
      console.error('[handleSaveProfile] Erro:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setBirthDate(profile.birth_date || '');
    }
    setIsEditing(false);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const getServiceTypeName = (type: string) => {
    switch (type) {
      case 'G': return 'Clínico';
      case 'GS': return 'Clínico + Especialistas';
      case 'GSP': return 'Clínico + Especialistas + Psicologia';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00B4DB" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Meu Perfil</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <MaterialIcons
                name={isEditing ? 'close' : 'edit'}
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialIcons name="person" size={64} color="#00B4DB" />
            </View>
            <Text style={styles.userName}>{fullName || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{profile?.email}</Text>
          </View>

          {/* Informações Pessoais */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="person-outline" size={24} color="#00B4DB" />
              <Text style={styles.cardTitle}>Informações Pessoais</Text>
            </View>

            {isEditing ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nome Completo</Text>
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Digite seu nome completo"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Telefone</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="(00) 00000-0000"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Data de Nascimento</Text>
                  <TextInput
                    style={styles.input}
                    value={birthDate}
                    onChangeText={setBirthDate}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor="#999"
                  />
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nome Completo</Text>
                  <Text style={styles.infoValue}>{fullName || 'Não informado'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Telefone</Text>
                  <Text style={styles.infoValue}>
                    {phone ? formatPhone(phone) : 'Não informado'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Data de Nascimento</Text>
                  <Text style={styles.infoValue}>
                    {birthDate ? formatDate(birthDate) : 'Não informado'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Informações do Beneficiário */}
          {beneficiary && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="badge" size={24} color="#00B4DB" />
                <Text style={styles.cardTitle}>Dados do Beneficiário</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>CPF</Text>
                <Text style={styles.infoValue}>{formatCPF(beneficiary.cpf)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tipo de Serviço</Text>
                <Text style={styles.infoValue}>
                  {getServiceTypeName(beneficiary.service_type)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color="#4CAF50"
                  />
                  <Text style={styles.statusText}>
                    {beneficiary.status === 'active' ? 'Ativo' : beneficiary.status}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>UUID</Text>
                <Text style={[styles.infoValue, styles.uuidText]}>
                  {beneficiary.beneficiary_uuid}
                </Text>
              </View>
            </View>
          )}

          {/* Botões de Ação */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancelEdit}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="save" size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Botão Ver Plano */}
          <TouchableOpacity
            style={styles.planButton}
            onPress={() => router.push('/profile/plan')}
          >
            <MaterialIcons name="card-membership" size={24} color="#00B4DB" />
            <Text style={styles.planButtonText}>Ver Meu Plano</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#00B4DB" />
          </TouchableOpacity>

          {/* Botão Sair */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            }}
          >
            <MaterialIcons name="logout" size={20} color="#ff6b6b" />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  uuidText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  planButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
  },
});

