import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface MemberCountSelectorProps {
  memberCount: number;
  onMemberCountChange: (count: number) => void;
  maxMembers?: number;
}

export default function MemberCountSelector({
  memberCount,
  onMemberCountChange,
  maxMembers = 10,
}: MemberCountSelectorProps) {
  const increment = () => {
    if (memberCount < maxMembers) {
      onMemberCountChange(memberCount + 1);
    }
  };

  const decrement = () => {
    if (memberCount > 1) {
      onMemberCountChange(memberCount - 1);
    }
  };

  const getDiscountText = () => {
    if (memberCount === 1) return '';
    if (memberCount === 2) return '5% de desconto';
    if (memberCount <= 4) return '10% de desconto';
    if (memberCount <= 6) return '15% de desconto';
    return '20% de desconto';
  };

  const getDiscountPercent = () => {
    if (memberCount === 1) return 0;
    if (memberCount === 2) return 5;
    if (memberCount <= 4) return 10;
    if (memberCount <= 6) return 15;
    return 20;
  };

  return (
    <View style={styles.container}>
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={[styles.button, memberCount <= 1 && styles.buttonDisabled]}
          onPress={decrement}
          disabled={memberCount <= 1}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="remove"
            size={24}
            color={memberCount <= 1 ? '#ccc' : '#00B4DB'}
          />
        </TouchableOpacity>

        <View style={styles.countContainer}>
          <Text style={styles.countNumber}>{memberCount}</Text>
          <Text style={styles.countLabel}>
            {memberCount === 1 ? 'membro' : 'membros'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, memberCount >= maxMembers && styles.buttonDisabled]}
          onPress={increment}
          disabled={memberCount >= maxMembers}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="add"
            size={24}
            color={memberCount >= maxMembers ? '#ccc' : '#00B4DB'}
          />
        </TouchableOpacity>
      </View>

      {/* Indicador de desconto */}
      {getDiscountPercent() > 0 && (
        <View style={styles.discountBadge}>
          <MaterialIcons name="local-offer" size={16} color="#FFB74D" />
          <Text style={styles.discountText}>{getDiscountText()}</Text>
        </View>
      )}

      {/* Escala de descontos */}
      <View style={styles.discountScale}>
        <Text style={styles.scaleTitle}>Descontos por quantidade de membros:</Text>
        
        <View style={styles.scaleRow}>
          <View style={[styles.scaleItem, memberCount === 1 && styles.scaleItemActive]}>
            <Text style={[styles.scaleMembers, memberCount === 1 && styles.scaleTextActive]}>1</Text>
            <Text style={[styles.scaleDiscount, memberCount === 1 && styles.scaleTextActive]}>0%</Text>
          </View>
          
          <View style={[styles.scaleItem, memberCount === 2 && styles.scaleItemActive]}>
            <Text style={[styles.scaleMembers, memberCount === 2 && styles.scaleTextActive]}>2</Text>
            <Text style={[styles.scaleDiscount, memberCount === 2 && styles.scaleTextActive]}>5%</Text>
          </View>
          
          <View style={[styles.scaleItem, memberCount >= 3 && memberCount <= 4 && styles.scaleItemActive]}>
            <Text style={[styles.scaleMembers, memberCount >= 3 && memberCount <= 4 && styles.scaleTextActive]}>3-4</Text>
            <Text style={[styles.scaleDiscount, memberCount >= 3 && memberCount <= 4 && styles.scaleTextActive]}>10%</Text>
          </View>
          
          <View style={[styles.scaleItem, memberCount >= 5 && memberCount <= 6 && styles.scaleItemActive]}>
            <Text style={[styles.scaleMembers, memberCount >= 5 && memberCount <= 6 && styles.scaleTextActive]}>5-6</Text>
            <Text style={[styles.scaleDiscount, memberCount >= 5 && memberCount <= 6 && styles.scaleTextActive]}>15%</Text>
          </View>
          
          <View style={[styles.scaleItem, memberCount >= 7 && styles.scaleItemActive]}>
            <Text style={[styles.scaleMembers, memberCount >= 7 && styles.scaleTextActive]}>7+</Text>
            <Text style={[styles.scaleDiscount, memberCount >= 7 && styles.scaleTextActive]}>20%</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00B4DB',
  },
  buttonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  countContainer: {
    alignItems: 'center',
    marginHorizontal: 40,
  },
  countNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: '#00B4DB',
  },
  countLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 20,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8F00',
    marginLeft: 4,
  },
  discountScale: {
    width: '100%',
  },
  scaleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  scaleItemActive: {
    backgroundColor: '#00B4DB',
  },
  scaleMembers: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  scaleDiscount: {
    fontSize: 11,
    color: '#666',
  },
  scaleTextActive: {
    color: '#fff',
  },
});