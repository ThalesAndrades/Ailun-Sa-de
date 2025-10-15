
/**
 * Polyfills Críticos para Expo Router 6.0.12 + React 18
 * DEVE ser importado antes de qualquer outro módulo React/Expo
 */

// Aplicar polyfills IMEDIATAMENTE na importação
(() => {
  'use strict';
  
  // URL polyfill essencial
  try {
    require('react-native-url-polyfill/auto');
  } catch (error) {
    console.warn('[Polyfill] URL polyfill failed:', error);
  }

  // REACT.USE POLYFILL CRÍTICO - Deve ser aplicado ANTES de tudo
  try {
    // Tentar obter React de múltiplas formas
    let React;
    try {
      React = require('react');
    } catch {
      // Se require falhar, tentar global
      React = (typeof global !== 'undefined' && global.React) || {};
    }

    // Implementação robusta do React.use
    const usePolyfill = function(resource) {
      // Se é uma Promise (Suspense pattern)
      if (resource && typeof resource.then === 'function') {
        throw resource; // Suspend
      }
      
      // Se é um Context
      if (resource && resource._context !== undefined) {
        // Usar useContext se disponível
        if (React.useContext) {
          return React.useContext(resource);
        }
        // Fallback para contexts
        return resource._currentValue || resource._defaultValue || null;
      }
      
      // Para recursos síncronos
      return resource;
    };

    // Aplicar polyfill se não existir
    if (!React.use) {
      React.use = usePolyfill;
      console.log('[Polyfill] React.use polyfill aplicado com sucesso');
    }

    // Garantir que está no global também
    if (typeof global !== 'undefined') {
      if (!global.React) {
        global.React = React;
      } else if (!global.React.use) {
        global.React.use = usePolyfill;
      }
    }

    // Aplicar em window para web
    if (typeof window !== 'undefined') {
      if (!window.React) {
        window.React = React;
      } else if (!window.React.use) {
        window.React.use = usePolyfill;
      }
    }
    
  } catch (error) {
    console.error('[Polyfill] React.use setup crítico falhou:', error);
    
    // FALLBACK DE EMERGÊNCIA
    const emergencyUse = function(resource) {
      if (resource && typeof resource.then === 'function') {
        throw resource;
      }
      if (resource && resource._context) {
        return resource._currentValue || resource._defaultValue || null;
      }
      return resource;
    };
    
    // Aplicar em todos os lugares possíveis
    try {
      if (typeof global !== 'undefined') {
        if (!global.React) global.React = {};
        global.React.use = emergencyUse;
      }
      if (typeof window !== 'undefined') {
        if (!window.React) window.React = {};
        window.React.use = emergencyUse;
      }
    } catch (e) {
      console.error('[Polyfill] Fallback de emergência falhou:', e);
    }
  }

// Configurações globais essenciais
if (typeof global !== 'undefined') {
  // Process polyfill robusto
  if (!global.process) {
    global.process = { 
      env: {},
      platform: 'web',
      version: 'polyfill',
      nextTick: (callback) => setTimeout(callback, 0)
    };
  }
  
  // Garantir que process.env existe
  if (!global.process.env) {
    global.process.env = {};
  }
  
  // Buffer polyfill básico
  if (!global.Buffer) {
    global.Buffer = {
      from: (data) => data,
      isBuffer: () => false
    };
  }
  
  // Performance polyfill
  if (!global.performance) {
    global.performance = {
      now: () => Date.now()
    };
  }
}

// Console fallback robusto
if (typeof console === 'undefined') {
  const noop = () => {};
  global.console = {
    log: noop,
    warn: noop,
    error: noop,
    info: noop,
    debug: noop,
    trace: noop,
    group: noop,
    groupEnd: noop,
    time: noop,
    timeEnd: noop
  };
}

// TextEncoder/TextDecoder polyfills
if (typeof global !== 'undefined') {
  if (!global.TextEncoder) {
    global.TextEncoder = class {
      encode(str) {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
          bytes.push(str.charCodeAt(i));
        }
        return new Uint8Array(bytes);
      }
    };
  }
  
  if (!global.TextDecoder) {
    global.TextDecoder = class {
      decode(bytes) {
        return String.fromCharCode(...bytes);
      }
    };
  }
}

// AbortController polyfill
if (typeof global !== 'undefined' && !global.AbortController) {
  global.AbortController = class {
    constructor() {
      this.signal = {
        aborted: false,
        addEventListener: () => {},
        removeEventListener: () => {}
      };
    }
    
    abort() {
      this.signal.aborted = true;
    }
  };
}
})(); // Missing closing parenthesis for the IIFE
