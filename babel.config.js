/**
 * Babel configuration para AiLun Saúde
 * Configuração simplificada e compatível
 */

module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      'babel-preset-expo',
    ],
    plugins: [
      // Reanimated plugin (deve ser o último)
      'react-native-reanimated/plugin',
    ],
  };
};