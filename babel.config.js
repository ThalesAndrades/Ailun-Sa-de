/**
 * Babel Configuration - AiLun Saúde
 * Configuração otimizada para produção Apple Store
 */

module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'react',
          native: {
            disableImportExportTransform: false,
            unstable_transformProfile: 'default'
          },
          web: {
            disableImportExportTransform: false
          }
        }
      ]
    ],
    plugins: [
      // Suporte para módulos ES6
      '@babel/plugin-proposal-export-namespace-from',
      
      // Transformação de imports dinâmicos
      '@babel/plugin-syntax-dynamic-import',
      
      // Suporte completo para decorators
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      
      // Class properties
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      
      // Private methods
      ['@babel/plugin-proposal-private-methods', { loose: true }],
      
      // Nullish coalescing
      '@babel/plugin-proposal-nullish-coalescing-operator',
      
      // Optional chaining
      '@babel/plugin-proposal-optional-chaining',
      
      // Reanimated plugin (DEVE SER O ÚLTIMO)
      'react-native-reanimated/plugin'
    ],
    env: {
      production: {
        plugins: [
          // Remove console.log em produção
          ['transform-remove-console', { exclude: ['error', 'warn', 'info'] }],
          
          // Inline environment variables
          ['transform-inline-environment-variables'],
          
          // Minify dead code elimination
          ['minify-dead-code-elimination']
        ]
      },
      development: {
        plugins: [
          // React refresh para hot reload
          'react-refresh/babel'
        ]
      },
      test: {
        plugins: [
          // Jest specific transformations
          '@babel/plugin-transform-modules-commonjs'
        ]
      }
    },
    assumptions: {
      setPublicClassFields: true,
      privateFieldsAsProperties: true
    }
  };
};