/**
 * Metro configuration para AiLun Saúde
 * Configuração otimizada para build e desenvolvimento
 */

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configurações de resolver para melhor compatibilidade
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'jsx',
  'js',
  'ts',
  'tsx',
  'json',
  'mjs',
  'cjs',
];

// Aliases para melhorar resolução de módulos
config.resolver.alias = {
  ...config.resolver.alias,
  // Garantir compatibilidade com diferentes versões de React
  'react-native$': require.resolve('react-native'),
  'react$': require.resolve('react'),
};

// Configurações para Platform Extensions
config.resolver.platforms = [
  'native', 
  'ios', 
  'android', 
  'web',
];

// Transformações específicas
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    mangle: {
      keep_fnames: true,
    },
    keep_fnames: true,
  },
};

// Configurações de cache
config.cacheStores = [
  {
    name: 'filesystem',
    type: 'FileStore',
    root: './node_modules/.cache/metro',
  },
];

// Configurações específicas para resolução de problemas do expo-router
config.resolver.resolverMainFields = [
  'react-native',
  'browser',
  'main',
];

// Suporte a symlinks para desenvolvimento
config.resolver.symlinks = false;

// Configuração do watchman para desenvolvimento
config.watchFolders = [__dirname];

module.exports = withNativeWind(config, { input: './global.css' });