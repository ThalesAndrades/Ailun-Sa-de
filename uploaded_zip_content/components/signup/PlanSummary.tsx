import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  PlanCalculation,
  formatCurrency,
  generatePersuasiveMessage,
  getServicesDescription,
} from '../../utils/plan-calculator';

interface PlanSummaryProps {
  calculation: PlanCalculation;
}

export default function PlanSummary({ calculation }: PlanSummaryProps) {
  const {
    totalPrice,
    pricePerMember,
    pricePerDay,
    pricePerDayPerMember,
    savings,
    discountPercentage,
    membersCount,
    basePrice,
  } = calculation;

  const servicesDescriptions = getServicesDescription(calculation.services);
  const persuasiveMessage = generatePersuasiveMessage(calculation);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumo do Seu Plano</Text>

      {/* Mensagem Persuasiva */}
      <View style={styles.persuasiveCard}>
        <MaterialIcons name="star" size={32} color="#FFB74D" />
        <Text style={styles.persuasiveMessage}>{persuasiveMessage}</Text>
      </View>

      {/* Serviços Incluídos */}
      <View style={styles.servicesCard}>
        <Text style={styles.servicesTitle}>Serviços Incluídos:</Text>
        {servicesDescriptions.map((description, index) => (
          <View key={index} style={styles.serviceRow}>
            <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.serviceText}>{description}</Text>
          </View>
        ))}
      </View>

      {/* Breakdown de Preços */}
      <View style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Valor base por pessoa:</Text>
          <Text style={styles.priceValue}>{formatCurrency(basePrice)}</Text>
        </View>

        {membersCount > 1 && (
          <>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {membersCount} {membersCount === 1 ? 'pessoa' : 'pessoas'} x {formatCurrency(basePrice)}:
              </Text>
              <Text style={styles.priceValue}>
                {formatCurrency(basePrice * membersCount)}
              </Text>
            </View>

            {discountPercentage > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, styles.discountLabel]}>
                  Desconto ({(discountPercentage * 100).toFixed(0)}%):
                </Text>
                <Text style={[styles.priceValue, styles.discountValue]}>
                  -{formatCurrency(savings)}
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.divider} />

        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total Mensal:</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalPrice)}</Text>
        </View>

        {membersCount > 1 && (
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Por pessoa:</Text>
            <Text style={styles.priceValue}>{formatCurrency(pricePerMember)}</Text>
          </View>
        )}
      </View>

      {/* Destaque do Valor Diário */}
      <View style={styles.dailyCard}>
        <View style={styles.dailyHeader}>
          <MaterialIcons name="calendar-today" size={24} color="#00B4DB" />
          <Text style={styles.dailyTitle}>Custo Diário</Text>
        </View>
        <Text style={styles.dailyValue}>{formatCurrency(pricePerDay)}</Text>
        <Text style={styles.dailyDescription}>
          ou {formatCurrency(pricePerDayPerMember)} por dia por pessoa
        </Text>
        <Text style={styles.dailyComparison}>
          Menos que um café por dia para cuidar da saúde de toda a família!
        </Text>
      </View>

      {savings > 0 && (
        <View style={styles.savingsCard}>
          <MaterialIcons name="savings" size={28} color="#4CAF50" />
          <View style={styles.savingsContent}>
            <Text style={styles.savingsTitle}>Você está economizando</Text>
            <Text style={styles.savingsValue}>{formatCurrency(savings)}/mês</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  persuasiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9f0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  persuasiveMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
    flex: 1,
    lineHeight: 24,
  },
  servicesCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  discountLabel: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  discountValue: {
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
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
  dailyCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00B4DB',
  },
  dailyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00B4DB',
    marginLeft: 12,
  },
  dailyValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00B4DB',
    marginBottom: 8,
  },
  dailyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dailyComparison: {
    fontSize: 13,
    color: '#00B4DB',
    fontStyle: 'italic',
  },
  savingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fff4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  savingsContent: {
    marginLeft: 16,
    flex: 1,
  },
  savingsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  savingsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
  },
});

