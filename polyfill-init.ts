/**
 * Polyfill de Inicialização Crítica
 * Deve ser executado ANTES de qualquer importação React/Expo
 */

// Aplicar polyfills críticos IMEDIATAMENTE
(function() {
  'use strict';

  console.log('[Polyfill-Init] Inicializando polyfills críticos...');

  // 1. React.use polyfill SUPER ROBUSTO
  function applyReactUsePolyfill() {
    try {
      // Múltiplas tentativas de obter React
      let React;
      
      // Tentativa 1: require direto
      try {
        React = require('react');
      } catch (e) {
        console.log('[Polyfill] React require falhou, tentando global...');
      }
      
      // Tentativa 2: global
      if (!React && typeof global !== 'undefined' && global.React) {
        React = global.React;
      }
      
      // Tentativa 3: window (para web)
      if (!React && typeof window !== 'undefined' && window.React) {
        React = window.React;
      }
      
      // Tentativa 4: criar objeto React se não existir
      if (!React) {
        React = {};
        console.log('[Polyfill] Criando objeto React fallback');
      }

      // Implementação robusta do React.use
      const usePolyfill = function(resource) {
        console.log('[Polyfill] React.use chamado com:', typeof resource);
        
        // Para Promises (padrão Suspense)
        if (resource && typeof resource.then === 'function') {
          console.log('[Polyfill] Suspendendo para Promise');
          throw resource; // Suspend
        }
        
        // Para Context objects
        if (resource && (resource._context !== undefined || resource.Provider || resource.Consumer)) {
          console.log('[Polyfill] Processando Context object');
          
          // Tentar usar useContext se disponível
          if (React.useContext && typeof React.useContext === 'function') {
            try {
              return React.useContext(resource);
            } catch (e) {
              console.warn('[Polyfill] useContext falhou:', e);
            }
          }
          
          // Fallback para contexts
          return resource._currentValue || resource._defaultValue || null;
        }
        
        // Para outros recursos síncronos
        console.log('[Polyfill] Retornando recurso síncrono');
        return resource;
      };

      // Aplicar polyfill
      if (!React.use) {
        React.use = usePolyfill;
        console.log('[Polyfill] React.use aplicado com sucesso');
      }

      // Garantir que está disponível globalmente
      if (typeof global !== 'undefined') {
        if (!global.React) {
          global.React = React;
        } else if (!global.React.use) {
          global.React.use = usePolyfill;
        }
      }

      if (typeof window !== 'undefined') {
        if (!window.React) {
          window.React = React;
        } else if (!window.React.use) {
          window.React.use = usePolyfill;
        }
      }

      return true;
    } catch (error) {
      console.error('[Polyfill] Erro crítico ao aplicar React.use:', error);
      return false;
    }
  }

  // 2. Polyfills de compatibilidade básica
  function applyBasicPolyfills() {
    try {
      // Process polyfill
      if (typeof global !== 'undefined' && !global.process) {
        global.process = { 
          env: {},
          platform: 'web',
          version: 'polyfill',
          nextTick: (callback) => setTimeout(callback, 0)
        };
      }

      // Console polyfill
      if (typeof console === 'undefined') {
        const noop = () => {};
        global.console = {
          log: noop, warn: noop, error: noop, info: noop, debug: noop
        };
      }

      return true;
    } catch (error) {
      console.error('[Polyfill] Erro em polyfills básicos:', error);
      return false;
    }
  }

  // Executar polyfills
  const reactSuccess = applyReactUsePolyfill();
  const basicSuccess = applyBasicPolyfills();

  console.log('[Polyfill-Init] Status:', {
    reactUse: reactSuccess,
    basic: basicSuccess,
    reactAvailable: typeof (global?.React?.use || window?.React?.use) === 'function'
  });

})();

// URL polyfill (não crítico, mas útil)
try {
  require('react-native-url-polyfill/auto');
} catch (error) {
  console.warn('[Polyfill] URL polyfill opcional falhou:', error);
}