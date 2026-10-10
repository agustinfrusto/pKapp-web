// Paleta de pKapp: la fuente única de verdad de los colores.
// tailwind.config.js lee de acá, así que las clases de utilidad y las props que
// solo aceptan un color (trackColor de Switch, placeholderTextColor de TextInput,
// la StatusBar) salen del mismo lugar y no pueden desincronizarse.
//
// Los neutros no están acá: la escala `slate` por defecto de Tailwind coincide
// exacto con los nueve grises que la app ya venía usando.
const colores = {
  // Navy: la identidad de la app.
  brand: {
    DEFAULT: '#1a3f6f',
    ink: '#0f1f33',
    muted: '#354d66',
    soft: '#58738d',    // oscurecido desde #607d99 para llegar a 4.5:1
    pale: '#a8c8e0',
    border: '#ccd9e6',
    surface: '#dce8f5',
    tint: '#c5d9f0',
    wash: '#eef2f6',
  },
  // Teal: acento secundario.
  accent: {
    DEFAULT: '#0d7a8a',
    strong: '#095c6b',
    surface: '#ddf2f5',
  },
  // Texto atenuado. Reemplaza a slate-400, que no llegaba al contraste mínimo.
  muted: '#66707f',
  success: {
    DEFAULT: '#276221',
    strong: '#1a5216',
    surface: '#e8f5e7',
  },
  danger: {
    DEFAULT: '#b52828',
    strong: '#8b1c1c',
    surface: '#fceaea',
    border: '#fca5a5',
  },
  warning: {
    DEFAULT: '#b45309',
    bold: '#9c6200',    // oscurecido desde #c67c00 para llegar a 4.5:1
    strong: '#92400e',
    ink: '#78350f',
    surface: '#fef3c7',
    border: '#fde68a',
  },
  // Par categórico: distingue primer y segundo parcial. No se unifica con el
  // resto de la paleta porque codifica información, no decora.
  parcial: {
    1: '#e0f2fe',
    2: '#ede9fe',
  },
};

// Contraparte oscura. Un token no puede servir a los dos usos con un solo valor:
// en claro `brand` es fondo de cabecera Y color de texto, pero en oscuro el fondo
// tiene que oscurecerse y el texto tiene que aclararse. Por eso el set oscuro
// separa `deep` (fondos) de `light` (texto y acciones).
const oscuro = {
  brand: {
    deep: '#14304f',      // fondos navy: cabecera, botón primario
    light: '#6ba3e0',     // texto y acciones que en claro usaban brand
    ink: '#e2e8f0',       // texto principal, era el más oscuro en claro
    soft: '#9aa4b2',      // texto secundario
    pale: '#a8c8e0',      // texto sobre navy, no cambia
    border: '#334155',
    surface: '#1c3350',
    tint: '#234260',
    wash: '#263243',      // divisores
  },
  accent: {
    DEFAULT: '#3fb8cc',
    strong: '#7fd6e3',
    surface: '#0b3b44',
  },
  muted: '#8b96a5',
  success: {
    DEFAULT: '#6cc45f',
    strong: '#a3e39a',
    surface: '#16301a',
  },
  danger: {
    DEFAULT: '#f08a8a',
    strong: '#f7b8b8',
    surface: '#3a1c1c',
    border: '#6b2f2f',
  },
  warning: {
    DEFAULT: '#e0a23c',
    bold: '#e8b75e',
    strong: '#f0c674',
    ink: '#f5deb3',
    surface: '#3a2c14',
    border: '#5c4620',
  },
  parcial: {
    1: '#0c3a52',
    2: '#2e2450',
  },
};

module.exports = { colores, oscuro };

// ---------------------------------------------------------------------------
// Plancha: tokens del rediseño (change rediseno-plancha, tarea 1.1).
// Usos, justificación y pares de contraste:
// openspec/changes/rediseno-plancha/diseno/tokens.md
//
// Convive con `colores` y `oscuro` hasta que las tareas 3.x migren las pantallas y
// los retiren; tailwind.config.js no lo lee hasta la tarea 2.3. A diferencia de
// ellos va plano y con las mismas claves en `claro` y `oscuro`: se lee
// `plancha[tema].tinta` sin ramificar por token. Ningún nombre choca con una
// familia de Tailwind ni con las de arriba (brand, accent, muted, ...).
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
    intermedia: '#8fb4c9',
    filamento: '#8fb4c9',
    manifestTema: '#0b0d10',
    manifestFondo: '#0b0d10',
    iconoFondo: '#0b0d10',
  },
};

module.exports.plancha = plancha;
