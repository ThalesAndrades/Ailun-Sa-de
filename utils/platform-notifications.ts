/**
 * Utilitários de notificação específicos por plataforma
 * Implementa fallbacks para web e tratamento unificado
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export interface WebNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
}

/**
 * Sistema de notificações unificado com fallback para web
 */
export class PlatformNotifications {
  private static instance: PlatformNotifications;
  private isWebSupported: boolean = false;

  private constructor() {
    this.checkWebSupport();
  }

  public static getInstance(): PlatformNotifications {
    if (!PlatformNotifications.instance) {
      PlatformNotifications.instance = new PlatformNotifications();
    }
    return PlatformNotifications.instance;
  }

  private checkWebSupport(): void {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      this.isWebSupported = 'Notification' in window;
    }
  }

  /**
   * Solicitar permissão para notificações (cross-platform)
   */
  public async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return this.requestWebPermission();
    }

    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('[PlatformNotifications] Erro ao solicitar permissão (nativo):', error);
      return false;
    }
  }

  private async requestWebPermission(): Promise<boolean> {
    if (!this.isWebSupported) {
      console.log('[PlatformNotifications] Notificações web não suportadas neste navegador');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('[PlatformNotifications] Erro ao solicitar permissão web:', error);
      return false;
    }
  }

  /**
   * Mostrar notificação (com fallback para web)
   */
  public async showNotification(
    title: string, 
    body: string, 
    data?: Record<string, any>
  ): Promise<boolean> {
    if (Platform.OS === 'web') {
      return this.showWebNotification({ title, body }, data);
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: null, // Imediato
      });
      return true;
    } catch (error) {
      console.error('[PlatformNotifications] Erro ao mostrar notificação nativa:', error);
      return false;
    }
  }

  private async showWebNotification(
    options: WebNotificationOptions, 
    data?: Record<string, any>
  ): Promise<boolean> {
    if (!this.isWebSupported) {
      // Fallback: mostrar alert ou toast
      this.showWebFallback(options.title, options.body);
      return true;
    }

    try {
      const hasPermission = await this.requestWebPermission();
      if (!hasPermission) {
        this.showWebFallback(options.title, options.body);
        return true;
      }

      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/favicon.png',
        badge: options.badge,
        tag: options.tag || 'ailun-notification',
        requireInteraction: options.requireInteraction || false,
        data: data || {},
      });

      // Auto-fechar após 5 segundos se não for interativa
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      return true;
    } catch (error) {
      console.error('[PlatformNotifications] Erro ao mostrar notificação web:', error);
      this.showWebFallback(options.title, options.body);
      return true;
    }
  }

  /**
   * Fallback para web quando notificações não estão disponíveis
   */
  private showWebFallback(title: string, body: string): void {
    // Criar toast notification visual
    const toast = this.createToastElement(title, body);
    document.body.appendChild(toast);

    // Remover após 5 segundos
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);

    console.log(`[Notificação] ${title}: ${body}`);
  }

  /**
   * Criar elemento de toast para fallback web
   */
  private createToastElement(title: string, body: string): HTMLElement {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #00B4DB;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      max-width: 350px;
      z-index: 10000;
      font-family: system-ui, -apple-system, sans-serif;
      animation: slideInRight 0.3s ease-out;
    `;

    toast.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px; font-size: 14px;">
        ${title}
      </div>
      <div style="font-size: 13px; opacity: 0.9; line-height: 1.4;">
        ${body}
      </div>
    `;

    // Adicionar animação CSS se não existir
    if (!document.querySelector('#ailun-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'ailun-toast-styles';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Permitir fechar ao clicar
    toast.addEventListener('click', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });

    return toast;
  }

  /**
   * Verificar se notificações estão disponíveis na plataforma atual
   */
  public isSupported(): boolean {
    if (Platform.OS === 'web') {
      return this.isWebSupported;
    }
    return true; // Sempre suportado em plataformas nativas
  }

  /**
   * Limpar badge (apenas nativo)
   */
  public async clearBadge(): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        await Notifications.setBadgeCountAsync(0);
      } catch (error) {
        console.error('[PlatformNotifications] Erro ao limpar badge:', error);
      }
    }
  }

  /**
   * Definir badge count (apenas nativo)
   */
  public async setBadge(count: number): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        await Notifications.setBadgeCountAsync(count);
      } catch (error) {
        console.error('[PlatformNotifications] Erro ao definir badge:', error);
      }
    }
  }
}

// Instância singleton
export const platformNotifications = PlatformNotifications.getInstance();

// Helpers para uso direto
export const showNotification = (title: string, body: string, data?: Record<string, any>) =>
  platformNotifications.showNotification(title, body, data);

export const requestNotificationPermission = () =>
  platformNotifications.requestPermission();

export const isNotificationSupported = () =>
  platformNotifications.isSupported();