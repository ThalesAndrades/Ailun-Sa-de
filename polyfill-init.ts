/**
 * Polyfill de Inicialização ULTRA Crítica - AiLun Saúde
 * DEVE ser executado ANTES de qualquer coisa relacionada ao React/Expo Router
 */

// Log inicial para debug
console.log('[Polyfill-Init] 🚀 Inicializando polyfills ULTRA críticos...');

// Polyfill mais agressivo e completo para React.use
const ULTRA_REACT_USE_POLYFILL = function usePolyfill(resource) {
  // Debug detalhado
  const resourceType = typeof resource;
  const resourceConstructor = resource?.constructor?.name || 'Unknown';
  const hasContext = resource && (resource._context !== undefined || resource.Provider || resource.Consumer);
  const hasPromise = resource && typeof resource.then === 'function';
  
  console.log('[🔧 React.use] Chamado:', { 
    type: resourceType, 
    constructor: resourceConstructor,
    hasContext,
    hasPromise,
    keys: resource ? Object.keys(resource).slice(0, 5) : []
  });
  
  // CASO 1: Context objects (CRÍTICO para expo-router)
  if (resource && typeof resource === 'object' && hasContext) {
    console.log('[🔧 React.use] 🎯 Processando Context object');
    
    // Tentar propriedades do context em ordem de prioridade
    if (resource._currentValue !== undefined) {
      console.log('[🔧 React.use] ✅ Retornando _currentValue:', resource._currentValue);
      return resource._currentValue;
    }
    
    if (resource._defaultValue !== undefined) {
      console.log('[🔧 React.use] ✅ Retornando _defaultValue:', resource._defaultValue);
      return resource._defaultValue;
    }
    
    // Tentar useContext se React estiver disponível
    try {
      const ReactModule = require('react');
      if (ReactModule && ReactModule.useContext && typeof ReactModule.useContext === 'function') {
        const contextValue = ReactModule.useContext(resource);
        console.log('[🔧 React.use] ✅ Retornando via useContext:', contextValue);
        return contextValue;
      }
    } catch (e) {
      console.log('[🔧 React.use] ⚠️ useContext falhou:', e.message);
    }
    
    // Fallback para context vazio
    console.log('[🔧 React.use] ⚠️ Context sem valor, retornando null');
    return null;
  }
  
  // CASO 2: Promise objects (Suspense)
  if (resource && hasPromise) {
    console.log('[🔧 React.use] 🎯 Detectada Promise - suspendendo');
    throw resource;
  }
  
  // CASO 3: Resource objects com read()
  if (resource && typeof resource === 'object' && resource.read && typeof resource.read === 'function') {
    console.log('[🔧 React.use] 🎯 Detectado Resource com read()');
    try {
      const result = resource.read();
      console.log('[🔧 React.use] ✅ Resource.read() retornou:', result);
      return result;
    } catch (e) {
      console.log('[🔧 React.use] ⚠️ Resource.read() falhou:', e.message);
      throw e;
    }
  }
  
  // CASO 4: Recursos síncronos diretos
  console.log('[🔧 React.use] 📦 Retornando resource diretamente:', resource);
  return resource;
};

// Função para aplicar o polyfill de forma ultra agressiva
function APPLY_ULTRA_POLYFILL() {
  const locations = [];
  
  // 1. Tentar React via require
  try {
    const ReactModule = require('react');
    if (ReactModule) {
      if (!ReactModule.use || typeof ReactModule.use !== 'function') {
        ReactModule.use = ULTRA_REACT_USE_POLYFILL;
        locations.push('require("react")');
        console.log('[Polyfill-Init] ✅ Aplicado via require("react")');
      } else {
        console.log('[Polyfill-Init] ℹ️ React.use já existe via require');
      }
    }
  } catch (e) {
    console.log('[Polyfill-Init] ⚠️ require("react") falhou:', e.message);
  }
  
  // 2. Aplicar em global
  try {
    if (typeof global !== 'undefined') {
      if (!global.React) {
        global.React = {};
      }
      if (!global.React.use) {
        global.React.use = ULTRA_REACT_USE_POLYFILL;
        locations.push('global.React');
        console.log('[Polyfill-Init] ✅ Aplicado em global.React');
      }
    }
  } catch (e) {
    console.log('[Polyfill-Init] ⚠️ global falhou:', e.message);
  }
  
  // 3. Aplicar em window (web)
  try {
    if (typeof window !== 'undefined') {
      if (!(window as any).React) {
        (window as any).React = {};
      }
      if (!(window as any).React.use) {
        (window as any).React.use = ULTRA_REACT_USE_POLYFILL;
        locations.push('window.React');
        console.log('[Polyfill-Init] ✅ Aplicado em window.React');
      }
    }
  } catch (e) {
    console.log('[Polyfill-Init] ⚠️ window falhou:', e.message);
  }
  
  // 4. Tentar aplicar em exports/module.exports
  try {
    if (typeof module !== 'undefined' && module.exports) {
      const ReactModule = require('react');
      if (ReactModule && !ReactModule.use) {
        ReactModule.use = ULTRA_REACT_USE_POLYFILL;
        locations.push('module.exports');
        console.log('[Polyfill-Init] ✅ Aplicado via module.exports');
      }
    }
  } catch (e) {
    console.log('[Polyfill-Init] ⚠️ module.exports falhou:', e.message);
  }
  
  console.log('[Polyfill-Init] 🎯 Polyfill aplicado em:', locations.join(', '));
}

// EXECUTAR IMEDIATAMENTE (IIFE ultra agressiva)
(() => {
  console.log('[Polyfill-Init] 🚀 Executando aplicação ultra agressiva...');
  APPLY_ULTRA_POLYFILL();
  
  // Verificação final
  const checks = [];
  try {
    if (require('react').use) checks.push('✅ require("react").use');
  } catch {} 
  try {
    if (global?.React?.use) checks.push('✅ global.React.use');
  } catch {}
  try {
    if ((window as any)?.React?.use) checks.push('✅ window.React.use');
  } catch {}
  
  console.log('[Polyfill-Init] 🎉 ULTRA polyfill concluído!', checks.join(', '));
})();

// Aplicar novamente em um setTimeout para garantir (backup)
setTimeout(() => {
  console.log('[Polyfill-Init] 🔄 Aplicando polyfill de backup...');
  APPLY_ULTRA_POLYFILL();
}, 0);

console.log('[Polyfill-Init] 🏁 Inicialização ULTRA crítica finalizada');