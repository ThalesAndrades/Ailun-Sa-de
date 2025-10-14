import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  title: string;
  price: string;
  period: string;
  features: PlanFeature[];
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function PlanCard({
  title,
  price,
  period,
  features,
  isPopular = false,
  isSelected = false,
  onSelect,
}: PlanCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        isPopular && styles.containerPopular,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MAIS POPULAR</Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>R$</Text>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.period}>/{period}</Text>
        </View>
      </View>
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <MaterialIcons
              name={feature.included ? 'check-circle' : 'cancel'}
              size={20}
              color={feature.included ? '#4CAF50' : '#ccc'}
            />
            <Text
              style={[
                styles.featureText,
                !feature.included && styles.featureTextDisabled,
              ]}
            >
              {feature.text}
            </Text>
          </View>
        ))}
      </View>
      {isSelected && (
        <View style={styles.selectedIndicator}>
          <MaterialIcons name="check-circle" size={24} color="#00B4DB" />
          <Text style={styles.selectedText}>Plano Selecionado</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  containerSelected: {
    borderColor: '#00B4DB',
    backgroundColor: '#f0f9ff',
  },
  containerPopular: {
    borderColor: '#FFB74D',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#FFB74D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#00B4DB',
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#00B4DB',
    marginLeft: 4,
  },
  period: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  featureTextDisabled: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00B4DB',
    marginLeft: 8,
  },
});

