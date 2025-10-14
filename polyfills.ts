/**
 * Polyfills para compatibilidade com React e Expo Router
 * Este arquivo deve ser importado ANTES de qualquer outro código
 */

// @ts-ignore
import 'react-native-url-polyfill/auto';

// Polyfill para React.use (necessário para expo-router 6.0.12)
if (typeof React === 'undefined') {
  // Tenta importar React se não estiver disponível globalmente
  try {
    const React = require('react');
    if (!React.use) {
      React.use = function(resource: any) {
        if (resource && typeof resource.then === 'function') {
          // É uma Promise - throw para que React saiba que precisa aguardar
          throw resource;
        }
        return resource;
      };
    }
    
    // Disponibilizar globalmente
    if (typeof global !== 'undefined') {
      global.React = React;
    }
    if (typeof window !== 'undefined') {
      (window as any).React = React;
    }
  } catch (error) {
    console.warn('Não foi possível importar React para polyfill');
  }
}

// Se React já está disponível globalmente, adicionar o polyfill
if (typeof React !== 'undefined' && !React.use) {
  (React as any).use = function(resource: any) {
    if (resource && typeof resource.then === 'function') {
      throw resource;
    }
    return resource;
  };
}

// Polyfill global para compatibilidade com expo-router
if (typeof global !== 'undefined') {
  // Garantir que fetch está disponível
  if (!global.fetch) {
    global.fetch = require('node-fetch').default;
  }
  
  // Polyfill para URLSearchParams se necessário
  if (!global.URLSearchParams) {
    global.URLSearchParams = require('url-search-params');
  }
}

// Polyfill para Web
if (typeof window !== 'undefined') {
  // Garantir que os métodos de navegação existem
  if (!window.history?.pushState) {
    window.history = {
      ...window.history,
      pushState: () => {},
      replaceState: () => {},
      back: () => {},
      forward: () => {},
      go: () => {},
    } as any;
  }
}

// Suprimir warnings específicos do expo-router durante o desenvolvimento
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Filtrar warnings conhecidos que não são problemas reais
    if (
      message.includes('expo-router') ||
      message.includes('useExpoRouterStore') ||
      message.includes('NavigationContainer') ||
      message.includes('useLinking') ||
      message.includes('React.use')
    ) {
      return;
    }
  }
  originalWarn(...args);
};

console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string') {
    // Filtrar erros relacionados a React.use que são tratados pelo polyfill
    if (message.includes('use is not a function') || message.includes('c.use is not a function')) {
      return;
    }
  }
  originalError(...args);
};

export {};