import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PlanServices } from '../../utils/plan-calculator';

interface ServiceOption {
  key: keyof PlanServices;
  title: string;
  description: string;
  price: number;
  icon: keyof typeof MaterialIcons.glyphMap;
  required?: boolean;
}

interface PlanServiceSelectorProps {
  services: PlanServices;
  onServicesChange: (services: PlanServices) => void;
}

const SERVICE_OPTIONS: ServiceOption[] = [
  {
    key: 'clinico',
    title: 'Atendimento Médico 24h',
    description: 'Clínico geral disponível 24 horas por dia',
    price: 29.90,
    icon: 'medical-services',
    required: true,
  },
  {
    key: 'especialistas',
    title: 'Médicos Especialistas',
    description: 'Acesso a mais de 20 especialidades médicas',
    price: 19.90,
    icon: 'local-hospital',
  },
  {
    key: 'psicologia',
    title: 'Atendimento Psicológico',
    description: '2 consultas por mês com psicólogos',
    price: 59.90,
    icon: 'psychology',
  },
  {
    key: 'nutricao',
    title: 'Nutricionista',
    description: '1 consulta a cada 3 meses',
    price: 59.90,
    icon: 'restaurant',
  },
];

export default function PlanServiceSelector({
  services,
  onServicesChange,
}: PlanServiceSelectorProps) {
  const toggleService = (key: keyof PlanServices) => {
    // Clínico é obrigatório
    if (key === 'clinico') return;

    onServicesChange({
      ...services,
      [key]: !services[key],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Monte seu Plano Personalizado</Text>
      <Text style={styles.sectionDescription}>
        Escolha os serviços que você e sua família precisam
      </Text>

      {SERVICE_OPTIONS.map((option) => {
        const isSelected = services[option.key];
        const isRequired = option.required;

        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.serviceCard,
              isSelected && styles.serviceCardSelected,
              isRequired && styles.serviceCardRequired,
            ]}
            onPress={() => toggleService(option.key)}
            activeOpacity={isRequired ? 1 : 0.7}
            disabled={isRequired}
          >
            <View style={styles.serviceHeader}>
              <View
                style={[
                  styles.iconContainer,
                  isSelected && styles.iconContainerSelected,
                ]}
              >
                <MaterialIcons
                  name={option.icon}
                  size={28}
                  color={isSelected ? '#fff' : '#00B4DB'}
                />
              </View>
              <View style={styles.serviceInfo}>
                <View style={styles.serviceTitleRow}>
                  <Text style={styles.serviceTitle}>{option.title}</Text>
                  {isRequired && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>OBRIGATÓRIO</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.serviceDescription}>{option.description}</Text>
              </View>
            </View>

            <View style={styles.serviceFooter}>
              <Text style={styles.servicePrice}>
                + R$ {option.price.toFixed(2).replace('.', ',')}
              </Text>
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && (
                  <MaterialIcons name="check" size={20} color="#fff" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceCardSelected: {
    borderColor: '#00B4DB',
    backgroundColor: '#f0f9ff',
  },
  serviceCardRequired: {
    borderColor: '#FFB74D',
    backgroundColor: '#fff9f0',
  },
  serviceHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#00B4DB',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: '#FFB74D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00B4DB',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#00B4DB',
    borderColor: '#00B4DB',
  },
});

