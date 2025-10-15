/**
 * Polyfill Produção - AiLun Saúde v2.1.0
 * Polyfill otimizado para Apple Store - SEM LOGS DE DEBUG
 */

// Polyfill optimizado para React.use sem logs de debug
const PRODUCTION_REACT_USE_POLYFILL = function usePolyfill(resource: any) {
  // Context objects (crítico para expo-router)
  if (resource && typeof resource === 'object') {
    const hasContext = resource._context !== undefined || resource.Provider || resource.Consumer;
    
    if (hasContext) {
      // Tentar propriedades do context em ordem de prioridade
      if (resource._currentValue !== undefined) {
        return resource._currentValue;
      }
      if (resource._defaultValue !== undefined) {
        return resource._defaultValue;
      }
      
      // Tentar useContext se disponível
      try {
        const ReactModule = require('react');
        if (ReactModule?.useContext && typeof ReactModule.useContext === 'function') {
          return ReactModule.useContext(resource);
        }
      } catch {
        // Silencioso em produção
      }
      
      return null;
    }
    
    // Resource objects com read()
    if (resource.read && typeof resource.read === 'function') {
      try {
        return resource.read();
      } catch (e) {
        throw e; // Re-throw para Suspense
      }
    }
  }
  
  // Promise objects (Suspense)
  if (resource && typeof resource.then === 'function') {
    throw resource;
  }
  
  // Retorno direto para recursos síncronos
  return resource;
};

// Aplicação do polyfill otimizada
function applyProductionPolyfill(): void {
  const polyfill = PRODUCTION_REACT_USE_POLYFILL;
  
  // 1. React via require
  try {
    const ReactModule = require('react');
    if (ReactModule && !ReactModule.use) {
      ReactModule.use = polyfill;
    }
  } catch {
    // Silencioso em produção
  }
  
  // 2. Global React
  try {
    if (typeof global !== 'undefined') {
      if (!global.React) global.React = {};
      if (!global.React.use) {
        global.React.use = polyfill;
      }
    }
  } catch {
    // Silencioso em produção
  }
  
  // 3. Window React (web)
  try {
    if (typeof window !== 'undefined') {
      if (!(window as any).React) (window as any).React = {};
      if (!(window as any).React.use) {
        (window as any).React.use = polyfill;
      }
    }
  } catch {
    // Silencioso em produção
  }
}

// Execução imediata
applyProductionPolyfill();

// Backup execution
if (typeof setTimeout !== 'undefined') {
  setTimeout(applyProductionPolyfill, 0);
}

// Garantir que está disponível para importação
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { applyProductionPolyfill };
}

export { applyProductionPolyfill };