import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingStep3() {
  const [formData, setFormData] = useState({
    emergencyName: '',
    emergencyPhone: '',
    preferredLanguage: 'Português',
    notifications: true,
    preferences: '',
  });
  const insets = useSafeAreaInsets();

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleNext = () => {
    if (!formData.emergencyName || !formData.emergencyPhone) {
      showAlert('Campos obrigatórios', 'Preencha os dados do contato de emergência');
      return;
    }
    router.push('/payment');
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <LinearGradient 
      colors={['#00B4DB', '#0083B0']} 
      style={styles.container}
    >
      <ScrollView 
        style={[styles.scrollContainer, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.step}>Passo 3 de 3</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="settings" size={40} color="white" />
            <Text style={styles.title}>Configurações Finais</Text>
            <Text style={styles.subtitle}>Últimos detalhes para personalizar sua experiência</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.sectionTitle}>
              <MaterialIcons name="emergency" size={24} color="#00B4DB" />
              <Text style={styles.sectionTitleText}>Contato de Emergência</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Contato *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nome completo"
                  placeholderTextColor="#999"
                  value={formData.emergencyName}
                  onChangeText={(value) => updateField('emergencyName', value)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefone de Emergência *</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="phone" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="(11) 99999-9999"
                  placeholderTextColor="#999"
                  value={formData.emergencyPhone}
                  onChangeText={(value) => updateField('emergencyPhone', value)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.sectionTitle}>
              <MaterialIcons name="tune" size={24} color="#00B4DB" />
              <Text style={styles.sectionTitleText}>Preferências</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Idioma Preferido</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="language" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Português"
                  placeholderTextColor="#999"
                  value={formData.preferredLanguage}
                  onChangeText={(value) => updateField('preferredLanguage', value)}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.toggleContainer}
              onPress={() => updateField('notifications', !formData.notifications)}
            >
              <View style={styles.toggleLeft}>
                <MaterialIcons name="notifications" size={20} color="#666" />
                <Text style={styles.toggleText}>Receber notificações</Text>
              </View>
              <View style={[styles.toggle, formData.notifications && styles.toggleActive]}>
                <View style={[styles.toggleDot, formData.notifications && styles.toggleDotActive]} />
              </View>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Observações Especiais</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <MaterialIcons name="note" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Horários preferenciais, necessidades especiais..."
                  placeholderTextColor="#999"
                  value={formData.preferences}
                  onChangeText={(value) => updateField('preferences', value)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Finalizar Cadastro</Text>
              <MaterialIcons name="check" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  step: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  textAreaContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingTop: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#00B4DB',
  },
  toggleDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#00B4DB',
    borderRadius: 12,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#00B4DB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});