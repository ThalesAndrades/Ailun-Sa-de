import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { calculatePlan, formatCurrency } from '../../utils/plan-calculator';

interface PlanSummaryProps {
  includeSpecialists: boolean;
  includePsychology: boolean;
  includeNutrition: boolean;
  memberCount: number;
}

export default function PlanSummary({
  includeSpecialists,
  includePsychology,
  includeNutrition,
  memberCount,
}: PlanSummaryProps) {
  const calculation = calculatePlan({
    includeSpecialists,
    includePsychology,
    includeNutrition,
    memberCount,
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Seu Plano</Text>
      
      {/* Serviços incluídos */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Serviços Incluídos:</Text>
        
        <View style={styles.serviceItem}>
          <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
          <Text style={styles.serviceText}>Clínico Geral 24h</Text>
          <Text style={styles.servicePrice}>Incluído</Text>
        </View>

        {includeSpecialists && (
          <View style={styles.serviceItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.serviceText}>Especialistas</Text>
            <Text style={styles.servicePrice}>R$ 30,00</Text>
          </View>
        )}

        {includePsychology && (
          <View style={styles.serviceItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.serviceText}>Psicologia (2x/mês)</Text>
            <Text style={styles.servicePrice}>R$ 40,00</Text>
          </View>
        )}

        {includeNutrition && (
          <View style={styles.serviceItem}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.serviceText}>Nutrição (1x/3 meses)</Text>
            <Text style={styles.servicePrice}>R$ 25,00</Text>
          </View>
        )}
      </View>

      {/* Cálculo de preços */}
      <View style={styles.calculationSection}>
        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>Subtotal (por pessoa):</Text>
          <Text style={styles.calculationValue}>{formatCurrency(calculation.basePrice)}</Text>
        </View>

        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>Membros:</Text>
          <Text style={styles.calculationValue}>{memberCount}x</Text>
        </View>

        <View style={styles.calculationRow}>
          <Text style={styles.calculationLabel}>Total sem desconto:</Text>
          <Text style={styles.calculationValue}>{formatCurrency(calculation.subtotal)}</Text>
        </View>

        {calculation.discountPercentage > 0 && (
          <View style={styles.calculationRow}>
            <Text style={styles.discountLabel}>
              Desconto ({calculation.discountPercentage}%):
            </Text>
            <Text style={styles.discountValue}>
              -{formatCurrency(calculation.discountAmount)}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Mensal:</Text>
          <Text style={styles.totalValue}>{formatCurrency(calculation.totalPrice)}</Text>
        </View>
      </View>

      {/* Economia destacada */}
      {calculation.discountPercentage > 0 && (
        <View style={styles.savingsCard}>
          <MaterialIcons name="savings" size={24} color="#4CAF50" />
          <View style={styles.savingsText}>
            <Text style={styles.savingsTitle}>Você está economizando!</Text>
            <Text style={styles.savingsAmount}>
              {formatCurrency(calculation.discountAmount)} por mês
            </Text>
            <Text style={styles.savingsDetail}>
              {formatCurrency(calculation.discountAmount * 12)} por ano
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  servicesSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  serviceText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  calculationSection: {
    gap: 8,
  },
  calculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calculationLabel: {
    fontSize: 14,
    color: '#666',
  },
  calculationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  discountLabel: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00B4DB',
  },
  savingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f8e9',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  savingsText: {
    marginLeft: 12,
    flex: 1,
  },
  savingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  savingsAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  savingsDetail: {
    fontSize: 12,
    color: '#4E342E',
    marginTop: 2,
  },
});