/**
 * Babel configuration para AiLun Saúde
 * Configurações de transpilação otimizadas
 */

module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
    ],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@services': './services',
            '@hooks': './hooks',
            '@utils': './utils',
            '@constants': './constants',
            '@contexts': './contexts',
            '@types': './types',
          },
        },
      ],
      // Plugin para melhor suporte a React 18
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
      // Plugin para suporte a optional chaining e nullish coalescing
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      // Plugin para async/await
      '@babel/plugin-transform-async-to-generator',
      // Plugin para spread operator
      '@babel/plugin-proposal-object-rest-spread',
      // Plugin para class properties
      '@babel/plugin-proposal-class-properties',
      // Reanimated plugin (deve ser o último)
      'react-native-reanimated/plugin',
    ],
  };
};