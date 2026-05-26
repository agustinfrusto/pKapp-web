// Configuración de Metro para excluir expo-sqlite del bundle web.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Stub vacío al que redirigir expo-sqlite y sus internals en web
const emptyShim = path.resolve(__dirname, 'src/db/sqlite-stub.js');

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    // Cualquier cosa que toque expo-sqlite (incluyendo workers internos) → stub vacío
    if (
      moduleName === 'expo-sqlite' ||
      moduleName.startsWith('expo-sqlite/') ||
      moduleName.includes('wa-sqlite')
    ) {
      return { type: 'sourceFile', filePath: emptyShim };
    }
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
