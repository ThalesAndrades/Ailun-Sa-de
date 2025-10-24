import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface FormInputProps extends TextInputProps {
  label: string;
  value?: string;
  error?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  isValid?: boolean;
  showCheckmark?: boolean;
}

export default function FormInput({ 
  label, 
  error, 
  icon, 
  isValid = false,
  showCheckmark = true,
  ...textInputProps 
}: FormInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[styles.inputContainer, error && styles.inputContainerError]}>
        {icon && (
          <MaterialIcons 
            name={icon} 
            size={20} 
            color={error ? '#ff6b6b' : '#666'} 
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon]}
          placeholderTextColor="#999"
          {...textInputProps}
        />
        
        {showCheckmark && isValid && !error && (
          <MaterialIcons 
            name="check-circle" 
            size={20} 
            color="#4CAF50" 
            style={styles.checkmark}
          />
        )}
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputContainerError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  checkmark: {
    marginLeft: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 8,
    marginLeft: 4,
  },
});