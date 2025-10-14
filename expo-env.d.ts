/**
 * Expo Environment Types
 * Declarações de tipos para ambiente Expo
 */

/// <reference types="expo/types" />

// Polyfill para React.use se não existir
declare module 'react' {
  interface React {
    use?: <T>(resource: T | Promise<T>) => T;
  }
}

// Tipos globais para o app
declare global {
  interface Window {
    React?: typeof import('react');
  }
  
  namespace NodeJS {
    interface Global {
      React?: typeof import('react');
    }
  }
}

// Tipos para as integrações
declare module '@env' {
  export const EXPO_PUBLIC_SUPABASE_URL: string;
  export const EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  export const RESEND_API_KEY: string;
  export const ASAAS_API_KEY: string;
}

export {};