
/**
 * Polyfills Completos para Compatibilidade Expo Router + React 18
 */

// URL polyfill essencial
try {
  require('react-native-url-polyfill/auto');
} catch (error) {
  console.warn('URL polyfill not available:', error);
}

// React.use polyfill robusto para expo-router
if (typeof React !== 'undefined' || typeof global !== 'undefined') {
  try {
    const React = require('react');
    
    // Polyfill para React.use (necessário para expo-router 6.0.12)
    if (!React.use) {
      React.use = function(promise) {
        if (promise && typeof promise.then === 'function') {
          throw promise; // Suspend pattern
        }
        return promise;
      };
    }
    
    // Adicionar ao global para acesso direto
    if (typeof global !== 'undefined') {
      global.React = React;
    }
  } catch (error) {
    console.warn('React polyfill setup failed:', error);
    
    // Fallback global para React.use
    if (typeof global !== 'undefined' && !global.React) {
      global.React = {
        use: function(promise) {
          if (promise && typeof promise.then === 'function') {
            throw promise;
          }
          return promise;
        }
      };
    }
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
