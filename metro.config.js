// Configuración de Metro para el build web de pKapp.
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

// El orden importa: withNativeWind devuelve una config con su propio resolver.
// Si se envolviera al final, pisaría el resolveRequest de abajo y el shim de
// decode-uri-component dejaría de aplicarse — un fallo que solo se ve al exportar.
const config = withNativeWind(getDefaultConfig(__dirname), {
  input: './global.css',
});

// Fuentes web de D4: Metro no trae woff2 entre sus assetExts.
config.resolver.assetExts.push('woff2');

// query-string@7 (dependencia de @react-navigation/core) hace require() de
// decode-uri-component, que desde la 0.5.0 es ESM puro. Se mantiene la 0.5.0
// por la vulnerabilidad de DoS de las anteriores y se resuelve la interop acá.
const decodeUriComponentShim = path.resolve(__dirname, 'src/shims/decode-uri-component.js');

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Solo este módulo: el resto de las resoluciones no se toca.
  if (moduleName === 'decode-uri-component') {
    return { type: 'sourceFile', filePath: decodeUriComponentShim };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
