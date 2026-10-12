// Carga de las fuentes IBM Plex en web (design.md D4): @font-face con
// `font-display: swap` sobre los woff2 con subset latin.
//
// No bloquea: inyectar la hoja es síncrono y barato, y el navegador descarga
// cada woff2 solo cuando algún texto usa su familia. Con swap, ese texto se
// pinta primero con la fuente del sistema y cambia a Plex al llegar. Si la
// carga falla, la regla queda sin efecto y no hay error visible.

const FUENTES = [
  { nombre: 'PlexSans-Regular', peso: 400, archivo: require('../assets/fuentes/PlexSans-Regular.woff2') },
  { nombre: 'PlexSans-SemiBold', peso: 600, archivo: require('../assets/fuentes/PlexSans-SemiBold.woff2') },
  { nombre: 'PlexMono-Regular', peso: 400, archivo: require('../assets/fuentes/PlexMono-Regular.woff2') },
  { nombre: 'PlexMono-Medium', peso: 500, archivo: require('../assets/fuentes/PlexMono-Medium.woff2') },
];

const ID_ESTILO = 'pkapp-fuentes';

function url(archivo) {
  // Metro web resuelve el asset a una URL (string) o a { uri }.
  return typeof archivo === 'string' ? archivo : archivo && archivo.uri;
}

export function cargarFuentes() {
  try {
    if (typeof document === 'undefined' || document.getElementById(ID_ESTILO)) return;
    const css = FUENTES.map(({ nombre, peso, archivo }) => (
      `@font-face { font-family: '${nombre}'; font-weight: ${peso}; font-style: normal; ` +
      `font-display: swap; src: url('${url(archivo)}') format('woff2'); }`
    )).join('\n');
    const estilo = document.createElement('style');
    estilo.id = ID_ESTILO;
    estilo.textContent = css;
    document.head.appendChild(estilo);
  } catch {
    // Sin fuentes la app sigue con la del sistema.
  }
}
