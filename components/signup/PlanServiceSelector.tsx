import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface ServiceItemProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  price: string;
  included: boolean;
  onToggle: () => void;
  required?: boolean;
}

interface PlanServiceSelectorProps {
  includeSpecialists: boolean;
  includePsychology: boolean;
  includeNutrition: boolean;
  onSpecialistsChange: (value: boolean) => void;
  onPsychologyChange: (value: boolean) => void;
  onNutritionChange: (value: boolean) => void;
}

function ServiceItem({
  icon,
  title,
  description,
  price,
  included,
  onToggle,
  required = false,
}: ServiceItemProps) {
  return (
    <TouchableOpacity
      style={[styles.serviceItem, included && styles.serviceItemSelected]}
      onPress={onToggle}
      disabled={required}
      activeOpacity={0.7}
    >
      <View style={styles.serviceIcon}>
        <MaterialIcons
          name={icon}
          size={32}
          color={included ? '#00B4DB' : '#666'}
        />
      </View>
      
      <View style={styles.serviceContent}>
        <View style={styles.serviceHeader}>
          <Text style={[styles.serviceTitle, included && styles.serviceTitleSelected]}>
            {title}
          </Text>
          <Text style={[styles.servicePrice, included && styles.servicePriceSelected]}>
            {price}
          </Text>
        </View>
        
        <Text style={styles.serviceDescription}>{description}</Text>
        
        {required && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>Incluído</Text>
          </View>
        )}
      </View>
      
      <View style={styles.checkbox}>
        {included ? (
          <View style={styles.checkboxChecked}>
            <MaterialIcons name="check" size={18} color="#fff" />
          </View>
        ) : (
          <View style={styles.checkboxUnchecked} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function PlanServiceSelector({
  includeSpecialists,
  includePsychology,
  includeNutrition,
  onSpecialistsChange,
  onPsychologyChange,
  onNutritionChange,
}: PlanServiceSelectorProps) {
  return (
    <View style={styles.container}>
      {/* Clínico Geral - sempre incluído */}
      <ServiceItem
        icon="medical-services"
        title="Clínico Geral 24h"
        description="Consultas ilimitadas com médicos generalistas"
        price="Incluído"
        included={true}
        onToggle={() => {}}
        required={true}
      />
      
      {/* Especialistas */}
      <ServiceItem
        icon="local-hospital"
        title="Especialistas"
        description="Acesso a mais de 20 especialidades médicas"
        price="+ R$ 30,00/mês"
        included={includeSpecialists}
        onToggle={() => onSpecialistsChange(!includeSpecialists)}
      />
      
      {/* Psicologia */}
      <ServiceItem
        icon="psychology"
        title="Psicologia"
        description="2 consultas por mês com psicólogos"
        price="+ R$ 40,00/mês"
        included={includePsychology}
        onToggle={() => onPsychologyChange(!includePsychology)}
      />
      
      {/* Nutrição */}
      <ServiceItem
        icon="restaurant"
        title="Nutrição"
        description="1 consulta a cada 3 meses com nutricionista"
        price="+ R$ 25,00/mês"
        included={includeNutrition}
        onToggle={() => onNutritionChange(!includeNutrition)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  serviceItemSelected: {
    borderColor: '#00B4DB',
    backgroundColor: '#f0f9ff',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceContent: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  serviceTitleSelected: {
    color: '#00B4DB',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  servicePriceSelected: {
    color: '#00B4DB',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  requiredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requiredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  checkbox: {
    marginLeft: 12,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00B4DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: 'transparent',
  },
});