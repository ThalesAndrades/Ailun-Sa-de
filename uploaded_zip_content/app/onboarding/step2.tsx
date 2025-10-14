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

export default function OnboardingStep2() {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    bloodType: '',
    allergies: '',
    medications: '',
    medicalHistory: '',
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
    router.push('/onboarding/step3');
  };

  const updateField = (field: string, value: string) => {
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
          <Text style={styles.step}>Passo 2 de 3</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <MaterialIcons name="favorite" size={40} color="white" />
            <Text style={styles.title}>Informações de Saúde</Text>
            <Text style={styles.subtitle}>Ajude-nos a conhecer melhor seu perfil de saúde</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Peso (kg)</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="monitor-weight" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="70"
                    placeholderTextColor="#999"
                    value={formData.weight}
                    onChangeText={(value) => updateField('weight', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Altura (cm)</Text>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="height" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="175"
                    placeholderTextColor="#999"
                    value={formData.height}
                    onChangeText={(value) => updateField('height', value)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo Sanguíneo</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="bloodtype" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="O+, A+, B+, AB+..."
                  placeholderTextColor="#999"
                  value={formData.bloodType}
                  onChangeText={(value) => updateField('bloodType', value)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Alergias</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="warning" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Descreva suas alergias (se houver)"
                  placeholderTextColor="#999"
                  value={formData.allergies}
                  onChangeText={(value) => updateField('allergies', value)}
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medicamentos em Uso</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="medication" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Lista de medicamentos atuais"
                  placeholderTextColor="#999"
                  value={formData.medications}
                  onChangeText={(value) => updateField('medications', value)}
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Histórico Médico</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <MaterialIcons name="history" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Cirurgias, doenças prévias, condições crônicas..."
                  placeholderTextColor="#999"
                  value={formData.medicalHistory}
                  onChangeText={(value) => updateField('medicalHistory', value)}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Continuar</Text>
              <MaterialIcons name="arrow-forward" size={24} color="white" />
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    width: '48%',
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
    height: 120,
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