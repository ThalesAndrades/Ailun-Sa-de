import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MemberCountSelectorProps {
  count: number;
  onCountChange: (count: number) => void;
  maxCount?: number;
}

export default function MemberCountSelector({
  count,
  onCountChange,
  maxCount = 10,
}: MemberCountSelectorProps) {
  const increment = () => {
    if (count < maxCount) {
      onCountChange(count + 1);
    }
  };

  const decrement = () => {
    if (count > 1) {
      onCountChange(count - 1);
    }
  };

  const getDiscountBadge = () => {
    const additionalMembers = count - 1;
    if (additionalMembers === 1) return '10% OFF';
    if (additionalMembers === 2) return '20% OFF';
    if (additionalMembers >= 3) return '30% OFF';
    return null;
  };

  const discountBadge = getDiscountBadge();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quantas pessoas vão usar o plano?</Text>
      <Text style={styles.sectionDescription}>
        Adicione membros da família e ganhe descontos progressivos
      </Text>

      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={[styles.button, count === 1 && styles.buttonDisabled]}
          onPress={decrement}
          disabled={count === 1}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="remove"
            size={28}
            color={count === 1 ? '#ccc' : '#00B4DB'}
          />
        </TouchableOpacity>

        <View style={styles.countContainer}>
          <Text style={styles.countNumber}>{count}</Text>
          <Text style={styles.countLabel}>
            {count === 1 ? 'pessoa' : 'pessoas'}
          </Text>
          {discountBadge && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountBadge}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, count === maxCount && styles.buttonDisabled]}
          onPress={increment}
          disabled={count === maxCount}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="add"
            size={28}
            color={count === maxCount ? '#ccc' : '#00B4DB'}
          />
        </TouchableOpacity>
      </View>

      {count > 1 && (
        <View style={styles.benefitsContainer}>
          <MaterialIcons name="info" size={20} color="#00B4DB" />
          <Text style={styles.benefitsText}>
            {count - 1} {count === 2 ? 'membro adicional' : 'membros adicionais'} ={' '}
            <Text style={styles.benefitsHighlight}>
              {getDiscountBadge()} de desconto
            </Text>
          </Text>
        </View>
      )}
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
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00B4DB',
  },
  buttonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  countContainer: {
    alignItems: 'center',
    marginHorizontal: 40,
    minWidth: 100,
  },
  countNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#00B4DB',
  },
  countLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  discountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  benefitsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  benefitsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  benefitsHighlight: {
    fontWeight: '700',
    color: '#4CAF50',
  },
});

