// query-string@7 (vía @react-navigation/core) hace require('decode-uri-component')
// y espera una función. La 0.5.0 es ESM puro: sin este shim Metro entrega el
// objeto del módulo y la app revienta al parsear cualquier query string.
// Se importa por ruta relativa para no volver a pasar por el resolveRequest.
const modulo = require('../../node_modules/decode-uri-component/index.js');

module.exports = modulo.default || modulo;
