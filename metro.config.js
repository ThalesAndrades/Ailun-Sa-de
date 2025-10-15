/**
 * Metro configuration otimizada para Expo Router v6
 */

const { getDefaultConfig } = require('expo/metro-config');

// Obter configuração padrão do Expo
const config = getDefaultConfig(__dirname);

// Configurações específicas para resolver problemas do expo-router
config.resolver.alias = {
  ...config.resolver.alias,
  // Garantir que React seja resolvido corretamente
  'react': require.resolve('react'),
};

// Configurações básicas de assets
config.resolver.assetExts.push(
  // Fontes
  'ttf',
  'otf',
  // Imagens
  'svg',
  'webp',
  // Áudio/Vídeo
  'mp3',
  'wav',
  'm4a'
);

// Configurações de transformação
config.transformer = {
  ...config.transformer,
  experimentalImportSupport: false,
  // Garantir que polyfills sejam aplicados
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: false,
    },
  }),
};

// Resolver problemas com módulos do expo-router
config.resolver.platforms = ['ios', 'android', 'web', 'native'];

// Configurações de watch para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  config.watchFolders = [
    ...config.watchFolders,
    // Adicionar pastas específicas se necessário
  ];
}

module.exports = config;