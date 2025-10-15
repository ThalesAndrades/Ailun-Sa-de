/**
 * Componente de Status de Conexão
 * Exibe informações sobre o status das integrações em tempo real
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIntegrationStatus, useRealTimeIntegrations } from '../hooks/useRealTimeIntegrations';
import { showTemplateMessage } from '../utils/alertHelpers';

export interface ConnectionStatusProps {
  compact?: boolean;
  showDetails?: boolean;
}

export function ConnectionStatus({ compact = false, showDetails = false }: ConnectionStatusProps) {
  const { isOnline, isConnected, hasProblems, pendingOperations, lastSync } = useIntegrationStatus();
  const { status, forceSync, retryFailedOperations, isLoading } = useRealTimeIntegrations();
  const [modalVisible, setModalVisible] = useState(false);

  const getStatusColor = () => {
    if (!isOnline) return '#FF5722'; // Offline
    if (!isConnected) return '#FF9800'; // Problemas de conexão
    if (hasProblems) return '#FFC107'; // Problemas degradados
    return '#4CAF50'; // Tudo funcionando
  };

  const getStatusIcon = () => {
    if (!isOnline) return 'wifi-off';
    if (!isConnected) return 'error-outline';
    if (hasProblems) return 'warning';
    return 'check-circle';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!isConnected) return 'Problemas de Conexão';
    if (hasProblems) return 'Funcionamento Limitado';
    return 'Conectado';
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora';
    if (minutes === 1) return 'há 1 minuto';
    if (minutes < 60) return `há ${minutes} minutos`;
    
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return 'há 1 hora';
    if (hours < 24) return `há ${hours} horas`;
    
    return lastSync.toLocaleDateString();
  };

  const handleStatusPress = () => {
    if (compact) {
      setModalVisible(true);
    } else if (hasProblems || pendingOperations > 0) {
      showDetailsModal();
    }
  };

  const showDetailsModal = () => {
    setModalVisible(true);
  };

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      showTemplateMessage({
        title: '❌ Erro na Sincronização',
        message: 'Não foi possível sincronizar. Tente novamente.',
        type: 'error'
      });
    }
  };

  const handleRetryOperations = async () => {
    try {
      await retryFailedOperations();
    } catch (error) {
      showTemplateMessage({
        title: '❌ Erro no Reprocessamento',
        message: 'Não foi possível processar operações pendentes.',
        type: 'error'
      });
    }
  };

  const renderServiceStatus = (serviceName: string, status: string) => {
    const getServiceIcon = () => {
      switch (status) {
        case 'healthy': return 'check-circle';
        case 'degraded': return 'warning';
        case 'down': return 'error';
        default: return 'help-outline';
      }
    };

    const getServiceColor = () => {
      switch (status) {
        case 'healthy': return '#4CAF50';
        case 'degraded': return '#FFC107';
        case 'down': return '#F44336';
        default: return '#9E9E9E';
      }
    };

    return (
      <View key={serviceName} style={styles.serviceItem}>
        <MaterialIcons 
          name={getServiceIcon()} 
          size={20} 
          color={getServiceColor()} 
        />
        <Text style={styles.serviceName}>{serviceName}</Text>
        <Text style={[styles.serviceStatus, { color: getServiceColor() }]}>
          {status === 'healthy' ? 'OK' : status === 'degraded' ? 'Lento' : 'Indisponível'}
        </Text>
      </View>
    );
  };

  if (compact) {
    return (
      <>
        <TouchableOpacity 
          style={[styles.compactContainer, { borderColor: getStatusColor() }]}
          onPress={handleStatusPress}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name={getStatusIcon()} 
            size={20} 
            color={getStatusColor()} 
          />
          {pendingOperations > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingOperations}</Text>
            </View>
          )}
        </TouchableOpacity>

        <ConnectionStatusModal 
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          status={status}
          isLoading={isLoading}
          onForceSync={handleForceSync}
          onRetryOperations={handleRetryOperations}
          formatLastSync={formatLastSync}
          renderServiceStatus={renderServiceStatus}
        />
      </>
    );
  }

  if (!showDetails && isOnline && isConnected && !hasProblems && pendingOperations === 0) {
    return null; // Não mostrar quando tudo está funcionando normalmente
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: getStatusColor() }]}
      onPress={handleStatusPress}
      activeOpacity={0.8}
    >
      <MaterialIcons 
        name={getStatusIcon()} 
        size={24} 
        color="white" 
      />
      <View style={styles.textContainer}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {pendingOperations > 0 && (
          <Text style={styles.pendingText}>
            {pendingOperations} operação{pendingOperations > 1 ? 'ões' : ''} pendente{pendingOperations > 1 ? 's' : ''}
          </Text>
        )}
      </View>
      {hasProblems && (
        <MaterialIcons name="info-outline" size={20} color="white" />
      )}
    </TouchableOpacity>
  );
}

interface ConnectionStatusModalProps {
  visible: boolean;
  onClose: () => void;
  status: any;
  isLoading: boolean;
  onForceSync: () => void;
  onRetryOperations: () => void;
  formatLastSync: () => string;
  renderServiceStatus: (serviceName: string, status: string) => React.ReactNode;
}

function ConnectionStatusModal({
  visible,
  onClose,
  status,
  isLoading,
  onForceSync,
  onRetryOperations,
  formatLastSync,
  renderServiceStatus,
}: ConnectionStatusModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <LinearGradient colors={['#00B4DB', '#0083B0']} style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Status das Integrações</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Status Geral */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status Geral</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <MaterialIcons 
                  name={status.isOnline ? 'wifi' : 'wifi-off'} 
                  size={24} 
                  color={status.isOnline ? '#4CAF50' : '#F44336'} 
                />
                <Text style={styles.statusLabel}>Conectividade</Text>
                <Text style={[styles.statusValue, { 
                  color: status.isOnline ? '#4CAF50' : '#F44336' 
                }]}>
                  {status.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>

              <View style={styles.statusRow}>
                <MaterialIcons 
                  name="sync" 
                  size={24} 
                  color="#666" 
                />
                <Text style={styles.statusLabel}>Última Sincronização</Text>
                <Text style={styles.statusValue}>{formatLastSync()}</Text>
              </View>

              <View style={styles.statusRow}>
                <MaterialIcons 
                  name="pending-actions" 
                  size={24} 
                  color={status.pendingOperations > 0 ? '#FF9800' : '#4CAF50'} 
                />
                <Text style={styles.statusLabel}>Operações Pendentes</Text>
                <Text style={[styles.statusValue, {
                  color: status.pendingOperations > 0 ? '#FF9800' : '#4CAF50'
                }]}>
                  {status.pendingOperations}
                </Text>
              </View>
            </View>
          </View>

          {/* Status dos Serviços */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status dos Serviços</Text>
            <View style={styles.servicesCard}>
              {renderServiceStatus('RapiDoc (Consultas)', status.health.rapidoc)}
              {renderServiceStatus('Supabase (Banco de Dados)', status.health.supabase)}
              {renderServiceStatus('Asaas (Pagamentos)', status.health.asaas)}
              {renderServiceStatus('Resend (Notificações)', status.health.resend)}
            </View>
          </View>

          {/* Ações */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações</Text>
            <View style={styles.actionsCard}>
              <TouchableOpacity
                style={[styles.actionButton, isLoading && styles.actionButtonDisabled]}
                onPress={onForceSync}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MaterialIcons name="refresh" size={24} color="white" />
                )}
                <Text style={styles.actionButtonText}>Forçar Sincronização</Text>
              </TouchableOpacity>

              {status.pendingOperations > 0 && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton, isLoading && styles.actionButtonDisabled]}
                  onPress={onRetryOperations}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#00B4DB" size="small" />
                  ) : (
                    <MaterialIcons name="replay" size={24} color="#00B4DB" />
                  )}
                  <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
                    Tentar Novamente ({status.pendingOperations})
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pendingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  servicesCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  serviceName: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  serviceStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00B4DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#00B4DB',
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#00B4DB',
  },
});