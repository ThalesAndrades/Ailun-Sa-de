/**
 * Babel configuration otimizada para Expo Router v6
 */

module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      'babel-preset-expo',
    ],
    plugins: [
      // Plugin para resolver problemas com expo-router (opcional, se disponível)
      // ['@babel/plugin-proposal-export-namespace-from'],
      // Suporte para optional chaining (já incluído no preset)
      // ['@babel/plugin-proposal-optional-chaining'],
      // Suporte para nullish coalescing (já incluído no preset)
      // ['@babel/plugin-proposal-nullish-coalescing-operator'],
      // Reanimated plugin (deve ser o último)
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          // Configurações específicas para produção podem ser adicionadas aqui
        ],
      },
    },
  };
};