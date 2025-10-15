
/**
 * Polyfills simplificados para compatibilidade
 */

// URL polyfill essencial
try {
  require('react-native-url-polyfill/auto');
} catch (error) {
  console.warn('URL polyfill not available:', error);
}

// Configurações globais mínimas
if (typeof global !== 'undefined') {
  // Process polyfill básico
  if (!global.process) {
    global.process = { env: {} };
  }
  
  // Garantir que process.env existe
  if (!global.process.env) {
    global.process.env = {};
  }
}

// Console fallback para debugging
if (typeof console === 'undefined') {
  global.console = {
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {}
  };
}
