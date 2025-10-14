import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInputProps,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  showClearButton?: boolean;
  showCheckmark?: boolean;
  isValid?: boolean;
}

export default function FormInput({
  label,
  value,
  onChangeText,
  error,
  icon,
  showClearButton = true,
  showCheckmark = true,
  isValid = false,
  ...textInputProps
}: FormInputProps) {
  const [focused, setFocused] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: error ? ['#ff6b6b', '#ff6b6b'] : ['#e0e0e0', '#00B4DB'],
  });

  const iconColor = error ? '#ff6b6b' : focused ? '#00B4DB' : '#999';

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputWrapper, { borderColor }]}>
        {icon && (
          <MaterialIcons name={icon} size={24} color={iconColor} style={styles.icon} />
        )}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#999"
          {...textInputProps}
        />
        {showClearButton && value.length > 0 && !isValid && (
          <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
            <MaterialIcons name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
        {showCheckmark && isValid && value.length > 0 && (
          <MaterialIcons name="check-circle" size={24} color="#4CAF50" style={styles.checkmark} />
        )}
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  checkmark: {
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 6,
    marginLeft: 4,
  },
});

