/**
 * Tela de Visualização de Logs de Auditoria
 * 
 * Esta tela permite que administradores visualizem e filtrem logs de auditoria do sistema.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { auditService, AuditLog } from '../../services/audit-service';

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchQuery, selectedEventType, selectedStatus, logs]);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      // Carregar logs de auditoria do Supabase
      const { supabase } = await import('../../services/supabase');
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[AuditLogsScreen] Erro ao carregar logs:', error);
        setLogs([]);
      } else {
        setLogs(data || []);
      }
    } catch (error) {
      console.error('[AuditLogsScreen] Erro ao carregar logs:', error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchQuery) {
      filtered = filtered.filter(
        (log) =>
          log.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.user_email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedEventType) {
      filtered = filtered.filter((log) => log.event_type === selectedEventType);
    }

    if (selectedStatus) {
      filtered = filtered.filter((log) => log.status === selectedStatus);
    }

    setFilteredLogs(filtered);
  };

  const getEventTypeIcon = (eventType: string): string => {
    if (eventType.includes('login')) return 'log-in';
    if (eventType.includes('logout')) return 'log-out';
    if (eventType.includes('signup')) return 'person-add';
    if (eventType.includes('beneficiary')) return 'people';
    if (eventType.includes('plan')) return 'card';
    if (eventType.includes('consultation')) return 'medical';
    if (eventType.includes('payment')) return 'cash';
    if (eventType.includes('profile')) return 'person';
    return 'information-circle';
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'failure':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderLogItem = (log: AuditLog) => (
    <View key={log.id} style={styles.logItem}>
      <View style={styles.logHeader}>
        <View style={styles.logIcon}>
          <Ionicons
            name={getEventTypeIcon(log.event_type) as any}
            size={20}
            color="#6366f1"
          />
        </View>
        <View style={styles.logInfo}>
          <Text style={styles.logEventType}>
            {log.event_type.replace(/_/g, ' ').toUpperCase()}
          </Text>
          <Text style={styles.logDate}>{formatDate(log.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(log.status) }]}>
          <Text style={styles.statusText}>{log.status.toUpperCase()}</Text>
        </View>
      </View>

      {log.user_email && (
        <Text style={styles.logDetail}>
          <Text style={styles.logDetailLabel}>Usuário: </Text>
          {log.user_email}
        </Text>
      )}

      {log.error_message && (
        <Text style={styles.logError}>
          <Text style={styles.logDetailLabel}>Erro: </Text>
          {log.error_message}
        </Text>
      )}

      {log.event_data && Object.keys(log.event_data).length > 0 && (
        <View style={styles.eventDataContainer}>
          <Text style={styles.logDetailLabel}>Dados do Evento:</Text>
          <Text style={styles.eventDataText}>
            {JSON.stringify(log.event_data, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Carregando logs de auditoria...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logs de Auditoria</Text>
        <TouchableOpacity onPress={loadAuditLogs} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por tipo de evento ou usuário..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      {/* Lista de Logs */}
      <ScrollView style={styles.logsContainer} showsVerticalScrollIndicator={false}>
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyText}>Nenhum log de auditoria encontrado</Text>
            <Text style={styles.emptySubtext}>
              {logs.length === 0
                ? 'Os logs de auditoria aparecerão aqui conforme os eventos forem registrados.'
                : 'Tente ajustar os filtros de busca.'}
            </Text>
          </View>
        ) : (
          filteredLogs.map(renderLogItem)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1f2937',
  },
  logsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  logItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logEventType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  logDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  logDetail: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  logDetailLabel: {
    fontWeight: '600',
    color: '#1f2937',
  },
  logError: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 4,
  },
  eventDataContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  eventDataText: {
    fontSize: 12,
    color: '#4b5563',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

