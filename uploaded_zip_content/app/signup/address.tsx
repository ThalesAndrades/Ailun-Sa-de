import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FormInput from '../../components/signup/FormInput';
import ProgressIndicator from '../../components/signup/ProgressIndicator';
import { isValidZipCode } from '../../utils/validators';

export default function AddressScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  const formatCep = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 8) {
      return numericValue.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return cep;
  };

  const handleCepChange = async (value: string) => {
    const formatted = formatCep(value);
    setCep(formatted);
    if (cepError) setCepError('');

    const numericCep = value.replace(/\D/g, '');
    
    // Buscar endereço quando CEP estiver completo
    if (numericCep.length === 8) {
      setLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${numericCep}/json/`);
        const data = await response.json();

        if (data.erro) {
          setCepError('CEP não encontrado');
        } else {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
        }
      } catch (error) {
        setCepError('Erro ao buscar CEP');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const validateFields = (): boolean => {
    if (!isValidZipCode(cep)) {
      setCepError('CEP inválido');
      return false;
    }

    return (
      street.trim().length > 0 &&
      number.trim().length > 0 &&
      neighborhood.trim().length > 0 &&
      city.trim().length > 0 &&
      state.trim().length > 0
    );
  };

  const handleNext = () => {
    if (validateFields()) {
      router.push({
        pathname: '/signup/payment',
        params: { ...params, cep, street, number, complement, neighborhood, city, state },
      });
    }
  };

  const isFormValid =
    isValidZipCode(cep) &&
    street.trim().length > 0 &&
    number.trim().length > 0 &&
    neighborhood.trim().length > 0 &&
    city.trim().length > 0 &&
    state.trim().length > 0;

  return (
    <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ProgressIndicator
            currentStep={3}
            totalSteps={4}
            stepLabels={['Dados', 'Contato', 'Endereço', 'Plano']}
          />

          <View style={styles.card}>
            <Text style={styles.title}>Endereço</Text>
            <Text style={styles.description}>
              Onde você mora? Digite seu CEP para preenchimento automático
            </Text>

            <View style={styles.cepContainer}>
              <FormInput
                label="CEP"
                value={cep}
                onChangeText={handleCepChange}
                error={cepError}
                icon="location-on"
                placeholder="00000-000"
                keyboardType="numeric"
                maxLength={9}
                isValid={isValidZipCode(cep)}
              />
              {loadingCep && (
                <ActivityIndicator
                  size="small"
                  color="#00B4DB"
                  style={styles.cepLoader}
                />
              )}
            </View>

            <FormInput
              label="Rua/Avenida"
              value={street}
              onChangeText={setStreet}
              icon="home"
              placeholder="Nome da rua"
              editable={!loadingCep}
            />

            <View style={styles.row}>
              <View style={styles.numberInput}>
                <FormInput
                  label="Número"
                  value={number}
                  onChangeText={setNumber}
                  icon="tag"
                  placeholder="123"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.complementInput}>
                <FormInput
                  label="Complemento"
                  value={complement}
                  onChangeText={setComplement}
                  icon="add-location"
                  placeholder="Apto, Bloco..."
                  showCheckmark={false}
                />
              </View>
            </View>

            <FormInput
              label="Bairro"
              value={neighborhood}
              onChangeText={setNeighborhood}
              icon="location-city"
              placeholder="Nome do bairro"
              editable={!loadingCep}
            />

            <View style={styles.row}>
              <View style={styles.cityInput}>
                <FormInput
                  label="Cidade"
                  value={city}
                  onChangeText={setCity}
                  icon="location-city"
                  placeholder="Cidade"
                  editable={!loadingCep}
                />
              </View>
              <View style={styles.stateInput}>
                <FormInput
                  label="Estado"
                  value={state}
                  onChangeText={setState}
                  icon="map"
                  placeholder="UF"
                  maxLength={2}
                  autoCapitalize="characters"
                  editable={!loadingCep}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isFormValid}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Próximo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  cepContainer: {
    position: 'relative',
  },
  cepLoader: {
    position: 'absolute',
    right: 16,
    top: 44,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  numberInput: {
    flex: 1,
  },
  complementInput: {
    flex: 2,
  },
  cityInput: {
    flex: 2,
  },
  stateInput: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0.1,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00B4DB',
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

