// Carga de las fuentes IBM Plex en nativo (design.md D4). La selección por
// plataforma sigue el patrón de src/db/database.native.js / database.web.js.
//
// No bloquea: se llama una vez al iniciar y no se espera. Mientras cargan, el
// texto usa la fuente del sistema; si la carga falla, se ignora sin error visible.
import * as Font from 'expo-font';

const FUENTES = {
  'PlexSans-Regular': require('../assets/fuentes/PlexSans-Regular.ttf'),
  'PlexSans-SemiBold': require('../assets/fuentes/PlexSans-SemiBold.ttf'),
  'PlexMono-Regular': require('../assets/fuentes/PlexMono-Regular.ttf'),
  'PlexMono-Medium': require('../assets/fuentes/PlexMono-Medium.ttf'),
};

export function cargarFuentes() {
  try {
    Font.loadAsync(FUENTES).catch(() => {});
  } catch {
    // Sin fuentes la app sigue con la del sistema.
  }
}
