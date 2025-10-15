import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export default function ProgressIndicator({ 
  currentStep, 
  totalSteps, 
  stepLabels 
}: ProgressIndicatorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Passo {currentStep} de {totalSteps}
      </Text>
      
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <View
              style={[
                styles.step,
                index < currentStep 
                  ? styles.stepCompleted
                  : index === currentStep
                  ? styles.stepActive
                  : styles.stepPending,
              ]}
            >
              <Text
                style={[
                  styles.stepText,
                  index < currentStep || index === currentStep
                    ? styles.stepTextActive
                    : styles.stepTextPending,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.connector,
                  index < currentStep - 1 ? styles.connectorCompleted : styles.connectorPending,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
      
      <View style={styles.labelsContainer}>
        {stepLabels.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.label,
              index < currentStep
                ? styles.labelCompleted
                : index === currentStep
                ? styles.labelActive
                : styles.labelPending,
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  stepPending: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepTextActive: {
    color: '#00B4DB',
  },
  stepTextPending: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  connector: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  connectorCompleted: {
    backgroundColor: '#4CAF50',
  },
  connectorPending: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  labelCompleted: {
    color: '#4CAF50',
  },
  labelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  labelPending: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});