/**
 * Metro configuration para AiLun Saúde
 * Configuração simplificada baseada no padrão Expo
 */

const { getDefaultConfig } = require('expo/metro-config');

// Obter configuração padrão do Expo
const config = getDefaultConfig(__dirname);

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

// Manter configurações experimentais desabilitadas para estabilidade
config.transformer.experimentalImportSupport = false;

module.exports = config;