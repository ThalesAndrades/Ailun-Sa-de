/**
 * Metro configuration otimizada para Expo Router v6 + React.use polyfill
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Obter configuração padrão do Expo
const config = getDefaultConfig(__dirname);

// Configurações específicas para resolver problemas do expo-router
config.resolver.alias = {
  ...config.resolver.alias,
  // Garantir que React seja resolvido corretamente
  'react': require.resolve('react'),
  // Forçar resolução correta do React
  'react/jsx-runtime': require.resolve('react/jsx-runtime'),
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

// Configurações de transformação específicas para React 18 + Expo Router
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

// Configurações de cache para desenvolvimento
if (process.env.NODE_ENV === 'development') {
  // Limpar cache mais agressivamente durante desenvolvimento
  config.resetCache = true;
  
  config.watchFolders = [
    ...config.watchFolders,
    // Adicionar pastas específicas se necessário
  ];
}

// Configurações especiais para Expo Router + React.use
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.sourceExts.push('ts', 'tsx');

// Configuração de node_modules paths (corrigida)
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  ...config.resolver.nodeModulesPaths || []
];

module.exports = config;