// Paleta de pKapp: la fuente única de verdad de los colores.
// tailwind.config.js lee de acá, así que las clases de utilidad y las props que
// solo aceptan un color (la StatusBar, el manifest) salen del mismo lugar y no
// pueden desincronizarse.
//
// Tokens del rediseño (change rediseno-plancha, tarea 1.1). Usos, justificación y
// pares de contraste: openspec/changes/rediseno-plancha/diseno/tokens.md
//
// Van planos y con las mismas claves en `claro` y `oscuro`: se lee
// `plancha[tema].tinta` sin ramificar por token. Ningún nombre choca con una
// familia de Tailwind.
const plancha = {
  claro: {
    fondo: '#f4f5f6',         // página
    superficie: '#ffffff',    // tarjeta, panel, campo y opción
    tinta: '#14181d',         // texto principal, glifos y relleno de lo seleccionado
    tintaSec: '#4a525c',      // metadatos, rótulos, descripciones y placeholder
    linea: '#14181d',         // marco de tarjeta, panel y cabecera
    borde: '#7c848d',         // borde de un control en reposo: 3:1 como mínimo
    filete: '#b9bfc6',        // divisor interno decorativo: no delimita ningún control
    inactivo: '#7c848d',      // texto y glifo de un control deshabilitado
    acento: '#0b6e80',        // ids, etiquetas, chips, nota y contorno de filamentos
    foco: '#095c6b',          // contorno de foco: 2 px con 2 px de separación
    acierto: '#1f6b3a',       // respuesta correcta y banda de 80 o más
    aciertoFondo: '#e6f1ea',
    error: '#a32424',         // respuesta incorrecta y banda de menos de 60
    errorFondo: '#f8e9e9',
    acentoFondo: '#e2eef0',   // cuerpo y pie del pedido de donación (solo ahí, CD-8)
    acentoBanda: '#0b6e80',   // banda del encabezado del pedido de donación (solo ahí, CD-8)
    intermedia: '#3f5f7a',    // banda de 60 a 79 (D6)
    filamento: '#14181d',     // tinta del campo de filamentos
    // Bordes de app (D8): no dependen del tema, mismo valor en los dos objetos.
    manifestTema: '#0b0d10',  // theme_color del manifest
    manifestFondo: '#0b0d10', // background_color del manifest y splash
    iconoFondo: '#0b0d10',    // fondo del ícono adaptativo
  },
  oscuro: {
    fondo: '#0b0d10',
    superficie: '#12161b',
    tinta: '#e6e9ed',
    tintaSec: '#98a2ae',
    linea: '#c9d0d8',
    borde: '#6b7684',
    filete: '#2b323a',
    inactivo: '#6b7684',
    acento: '#5cc3d6',
    foco: '#7fd6e3',
    acierto: '#7bcb92',
    aciertoFondo: '#10231a',
    error: '#f08c8c',
    errorFondo: '#2a1414',
    acentoFondo: '#1d3037',
    acentoBanda: '#4692a1',
    intermedia: '#8fb4c9',
    filamento: '#8fb4c9',
    manifestTema: '#0b0d10',
    manifestFondo: '#0b0d10',
    iconoFondo: '#0b0d10',
  },
};

module.exports = { plancha };
