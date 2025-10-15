/**
 * Metro configuration para AiLun Saúde
 * Configurações de bundling otimizadas para Expo sem NativeWind
 */

const { getDefaultConfig } = require('expo/metro-config');

// Obter configuração padrão do Expo
const config = getDefaultConfig(__dirname);

// Configurações adicionais para melhor performance
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configurações de assets
config.resolver.assetExts.push(
  // Arquivos de fonte
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Imagens adicionais
  'svg',
  'webp',
  // Áudio
  'mp3',
  'wav',
  'm4a',
  'aac',
  // Outros
  'bin',
  'txt',
  'json'
);

// Configurações de transformação
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
  minifierConfig: {
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

// Configurações de cache para desenvolvimento
config.resetCache = process.env.NODE_ENV === 'development';

// Configurações de serializer para otimização
config.serializer = {
  ...config.serializer,
};

// Configurações do watchman para melhor detecção de mudanças
config.watchFolders = [
  __dirname,
];

// Configurações de Metro para lidar com symlinks
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configurações experimentais para melhor performance
config.transformer.experimentalImportSupport = false;
config.transformer.inlineRequires = true;

module.exports = config;