import { useContext } from 'react';
import { NotificationContext, NotificationContextType } from '../contexts/NotificationContext';

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}