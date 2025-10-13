import React, { createContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { useCPFAuth } from '../hooks/useCPFAuth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  expoPushToken: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearBadge: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { beneficiaryUuid } = useCPFAuth();
  const {
    expoPushToken,
    notifications,
    unreadCount,
    loading,
    loadUnreadNotifications,
    markAsRead,
    markAllAsRead,
    clearBadge,
  } = useNotifications(beneficiaryUuid);

  const refreshNotifications = useCallback(async () => {
    if (beneficiaryUuid) {
      await loadUnreadNotifications();
    }
  }, [beneficiaryUuid, loadUnreadNotifications]);

  // Auto-refresh notifications when user changes
  useEffect(() => {
    if (beneficiaryUuid) {
      refreshNotifications();
    }
  }, [beneficiaryUuid, refreshNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    expoPushToken,
    markAsRead,
    markAllAsRead,
    clearBadge,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}