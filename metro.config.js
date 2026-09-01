// Configuración de Metro para excluir expo-sqlite del bundle web.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// El orden importa: withNativeWind devuelve una config con su propio resolver.
// Si se envolviera al final, pisaría el resolveRequest de abajo y el stub de
// expo-sqlite dejaría de aplicarse en web — un fallo que solo se ve al exportar.
const config = withNativeWind(getDefaultConfig(__dirname), {
  input: './global.css',
});

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
