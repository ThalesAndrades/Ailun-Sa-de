import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';

export default function DashboardScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const nome = params.nome as string || 'Usuário';

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá,</Text>
          <Text style={styles.userName}>{nome}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serviços Disponíveis</Text>
          
          <View style={styles.grid}>
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialIcons name="medical-services" size={32} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Consultas</Text>
              <Text style={styles.cardDescription}>Agende suas consultas médicas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialIcons name="event-note" size={32} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Agendamentos</Text>
              <Text style={styles.cardDescription}>Veja seus próximos agendamentos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialIcons name="article" size={32} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Histórico</Text>
              <Text style={styles.cardDescription}>Acesse seu histórico médico</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card}>
              <View style={styles.cardIcon}>
                <MaterialIcons name="support-agent" size={32} color={colors.primary} />
              </View>
              <Text style={styles.cardTitle}>Suporte</Text>
              <Text style={styles.cardDescription}>Entre em contato conosco</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximas Consultas</Text>
          <View style={styles.emptyState}>
            <MaterialIcons name="event-available" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhuma consulta agendada</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h2,
    color: colors.text,
  },
  logoutButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm,
  },
  card: {
    width: '50%',
    padding: spacing.sm,
  },
  cardIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
