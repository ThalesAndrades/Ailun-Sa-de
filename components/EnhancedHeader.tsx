
/**
 * Header Aprimorado com Funcionalidades Integradas
 * Componente de cabeçalho unificado com status, notificações e navegação
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { ConnectionStatus } from './ConnectionStatus';
import { useAuth } from '../hooks/useAuth';
import { useIntegratedNotifications } from '../hooks/useIntegratedNotifications';
import { useBeneficiaryPlan } from '../hooks/useBeneficiaryPlan';
import { getGreetingMessage } from '../constants/messageTemplates';

export interface EnhancedHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showUser?: boolean;
  showNotifications?: boolean;
  showConnectionStatus?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  gradient?: string[];
  actions?: Array<{
    icon: string;
    onPress: () => void;
    badge?: number;
    color?: string;
  }>;
}

export function EnhancedHeader({
  title,
  subtitle,
  showLogo = false,
  showUser = false,
  showNotifications = true,
  showConnectionStatus = true,
  showBackButton = false,
  onBackPress,
  gradient = ['#00B4DB', '#0083B0'],
  actions = [],
}: EnhancedHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user, profile, beneficiaryUuid } = useAuth();
  const { hasUnreadNotifications, unreadCount } = useIntegratedNotifications();
  const { plan } = useBeneficiaryPlan(beneficiaryUuid);
  
  const [userMenuVisible, setUserMenuVisible] = useState(false);

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleLogout = () => {
    router.replace('/login');
  };

  const getStatusBarStyle = () => {
    return Platform.OS === 'ios' ? 'light-content' : 'light-content';
  };

  return (
    <>
      <StatusBar barStyle={getStatusBarStyle()} backgroundColor={gradient[0]} />
      <LinearGradient colors={gradient} style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          {/* Left Side */}
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={onBackPress || (() => router.back())}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            )}
            
            {showLogo && (
              <View style={styles.logoContainer}>
                <Image
                  source="https://cdn-ai.onspace.ai/onspace/project/image/SZxF5tJTtjPgSg2rCnCKdZ/instories_926E70A0-81FF-43ED-878A-889EE40D615D.png"
                  style={styles.logo}
                  contentFit="contain"
                />
              </View>
            )}

            <View style={styles.titleContainer}>
              {title ? (
                <>
                  <Text style={styles.title}>{title}</Text>
                  {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </>
              ) : showUser && profile ? (
                <>
                  <Text style={styles.greeting}>
                    {getGreetingMessage(profile.full_name?.split(' ')[0] || 'Usuário')}
                  </Text>
                  <Text style={styles.welcomeText}>Como podemos ajudar hoje?</Text>
                  {profile.is_active_beneficiary && (
                    <View style={styles.beneficiaryBadge}>
                      <MaterialIcons name="verified" size={16} color="#fff" />
                      <Text style={styles.beneficiaryText}>Beneficiário Ativo</Text>
                    </View>
                  )}
                </>
              ) : null}
            </View>
          </View>

          {/* Right Side */}
          <View style={styles.rightSection}>
            {/* Connection Status */}
            {showConnectionStatus && (
              <ConnectionStatus compact={true} />
            )}

            {/* Plan Status */}
            {plan && (
              <TouchableOpacity 
                style={styles.planButton}
                onPress={() => router.push('/profile/plan')}
              >
                <MaterialIcons name="stars" size={20} color="#FFD700" />
              </TouchableOpacity>
            )}

            {/* Notifications */}
            {showNotifications && (
              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  hasUnreadNotifications && styles.actionButtonWithBadge
                ]} 
                onPress={handleNotifications}
              >
                <MaterialIcons name="notifications" size={24} color="white" />
                {hasUnreadNotifications && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Custom Actions */}
            {actions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={action.onPress}
              >
                <MaterialIcons 
                  name={action.icon as any} 
                  size={24} 
                  color={action.color || "white"} 
                />
                {action.badge && action.badge > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>
                      {action.badge > 9 ? '9+' : action.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* User Menu */}
            {showUser && (
              <TouchableOpacity 
                style={styles.userButton}
                onPress={handleProfile}
              >
                {profile?.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <MaterialIcons name="account-circle" size={32} color="white" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Optional Progress Bar for Loading States */}
        {/* This could be added later for showing loading progress */}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 32,
    height: 32,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  beneficiaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  beneficiaryText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  planButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  actionButtonWithBadge: {
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
