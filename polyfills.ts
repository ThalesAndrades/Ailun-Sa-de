
/**
 * Polyfills para compatibilidade
 * Configurações mínimas necessárias
 */

import 'react-native-url-polyfill/auto';

// Polyfill React.use apenas se necessário
if (typeof React !== 'undefined' && !React.use) {
  React.use = function(promise: Promise<any> | any): any { // Added type annotations
    if (promise && typeof promise.then === 'function') {
      throw promise; // Suspense behavior
    }
    return promise;
  };
}

// Verificação de ambiente
if (typeof global !== 'undefined') {
  // Polyfills globais mínimos
  global.process = global.process || { env: {} };
  
  // URL polyfill para React Native
  if (!global.URL) {
    try {
      const { URL, URLSearchParams } = require('react-native-url-polyfill');
      global.URL = URL;
      global.URLSearchParams = URLSearchParams;
    } catch (e) {
      // Ignore se não estiver disponível
    }
  }
}
