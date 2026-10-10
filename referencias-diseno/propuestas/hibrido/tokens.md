# Tokens Plancha · tarea 1.1

| Campo | Valor |
|---|---|
| Change | `openspec/changes/rediseno-plancha` (D1, D4, D6, D8, D9) |
| Rama | `rediseno` |
| Valores de color | `src/theme/colores.js`, export `plancha`: `claro` y `oscuro` con las mismas 19 claves |
| Valores de `tailwind.config.js` | sección d; los aplica el Programador en la tarea 2.3 |
| Insumos | `hibrido.html` (variables, líneas 13–16), `NOTAS.md`, `REFERENCIAS.md`, `NOTAS-FAVICON.md` |
| Convivencia | `colores` y `oscuro` quedan intactos hasta las tareas 3.x |

---

## a. Color

### a.1 Tokens

Nombre = clave en `plancha.claro` y `plancha.oscuro`. En Tailwind: `bg-fondo` y `dark:bg-fondoD` (cableado en d.2).

| Token | Claro | Oscuro | Uso | Por qué |
|---|---|---|---|---|
| `fondo` | `#f4f5f6` | `#0b0d10` | Página y cabecera. Texto sobre relleno de tinta | Neutro frío casi blanco / casi negro: sobriedad sin color (REFERENCIAS: «elementos demasiado coloridos» excluidos) |
| `superficie` | `#ffffff` | `#12161b` | Tarjeta, panel, campo, opción, caja del enunciado | Un solo escalón sobre `fondo`; la elevación la da el marco, no la sombra (D9) |
| `tinta` | `#14181d` | `#e6e9ed` | Texto principal, glifos y relleno de lo seleccionado (segmento, filtro, botón primario, casillas llenas) | Extremos de la paleta, los mismos del ícono (`NOTAS-FAVICON`) |
| `tintaSec` | `#4a525c` | `#98a2ae` | Metadatos, rótulos mono, descripciones, placeholder, chevron, regla | ≥ 7:1 en ambos temas: jerarquía por valor, no por color |
| `linea` | `#14181d` | `#c9d0d8` | Marco de 1 px de tarjeta, panel y cabecera; control seleccionado; acción primaria (2 px) | Marco de la Plancha (`NOTAS`); en oscuro un paso bajo la tinta para que no encandile |
| `borde` | `#7c848d` | `#6b7684` | Borde en reposo de un control: opción, acción, filtro, campo de texto | Escalón entre marco y filete: delimita sin pesar como el marco y llega a 3:1 (WCAG 1.4.11). Nuevo respecto del boceto |
| `filete` | `#b9bfc6` | `#2b323a` | Divisor interno decorativo: cajetín, filas, base de barra, casillas vacías | Segundo grosor del boceto (`--hair`); decorativo, nunca delimita un control |
| `inactivo` | `#7c848d` | `#6b7684` | Texto y glifo de un control deshabilitado (su borde pasa a `filete`) | Estado «deshabilitado» de la matriz; mismo valor que `borde`, distinto rol |
| `acento` | `#0b6e80` | `#5cc3d6` | Id de materia, etiquetas y chips, rótulo y borde de la nota, panel de mezcla, contorno del campo de filamentos | Único color de marca (eco del contorno de ref1); apagado en claro para no ser «color fuerte» |
| `foco` | `#095c6b` | `#7fd6e3` | Contorno de foco de teclado: 2 px, separado 2 px del control | Acento reforzado, sin matiz nuevo: ≥ 6,9:1 en ambos temas |
| `acierto` | `#1f6b3a` | `#7bcb92` | Respuesta correcta, banda de 80 o más, cifra de aciertos | Valor del boceto: verde sobrio |
| `aciertoFondo` | `#e6f1ea` | `#10231a` | Relleno de la opción correcta | Valor del boceto: apenas teñido |
| `error` | `#a32424` | `#f08c8c` | Respuesta incorrecta, banda de menos de 60, validación | Valor del boceto: rojo sobrio |
| `errorFondo` | `#f8e9e9` | `#2a1414` | Relleno de la opción incorrecta | Valor del boceto |
| `intermedia` | `#3f5f7a` | `#8fb4c9` | Banda de 60 a 79 (D6): porcentaje, barra y marca en estadísticas y resultados | Acero: tercer tono frío, ni cálido ni saturado; separable de verde y rojo en protanopía y deuteranopía (a.3) |
| `filamento` | `#14181d` | `#8fb4c9` | Trazo del campo de filamentos y de las ilustraciones de materia | Valor del boceto (`--fil`): tinta en claro, acero en oscuro |
| `manifestTema` | `#0b0d10` | `#0b0d10` | `theme_color` de `public/manifest.json`; `themeColor` de `app.json` | D8: tinta del ícono. No depende del tema |
| `manifestFondo` | `#0b0d10` | `#0b0d10` | `background_color` del manifest; `backgroundColor` de `app.json`; splash nativo de `App.js` | Splash continuo con el ícono, sin franja de otro color |
| `iconoFondo` | `#0b0d10` | `#0b0d10` | `android.adaptiveIcon.backgroundColor` de `app.json` | Reemplaza `#6366f1` por la tinta del ícono |

### a.2 Reglas de uso

| Regla | Detalle |
|---|---|
| Texto sobre relleno de tinta | Siempre `fondo` (par T7) |
| Delimitar un control | `borde` en reposo; `linea` si es marco estructural o está seleccionado; `filete` nunca |
| Estado semántico | El color no es el único portador: la marca o forma de acierto, error e intermedia la fijan las fichas (1.2, 1.3). Evidencia en a.3 |
| Hover y presionado | Sin token propio: marco de 1 a 2 px o inversión `tinta`/`fondo`; la matriz de estados va en las fichas |
| Placeholder | `tintaSec` (par T4) |
| `meta theme-color` | Inicial, en `scripts/inject-pwa.js`: valor de `claro.fondo`. En ejecución: `fondo` del tema activo |
| `StatusBar` | Contenido oscuro en claro y claro en oscuro (hoy `App.js` fija `light` siempre, por la banda navy) |
| Prohibido | Gradientes, sombras, transparencias de color (el halo `rgba(...)` de `webStyles.js` sale al migrar) |

### a.3 Distinguibilidad de los tres estados

Simulación con las matrices de Machado et al. (2009), severidad 1,0. ΔE en CIE76 sobre sRGB; a menor ΔE, más confundibles. Razón de luminancia: contraste WCAG entre los dos tonos.

| Tema | Par | Razón de luminancia | ΔE visión normal | ΔE protanopía | ΔE deuteranopía | ΔE tritanopía |
|---|---|---|---|---|---|---|
| claro | `acierto` y `intermedia` | 1,03 | 51 | 44 | 39 | 11 |
| claro | `intermedia` y `error` | 1,10 | 75 | 41 | 58 | 91 |
| claro | `acierto` y `error` | 1,14 | 87 | 13 | 19 | 97 |
| oscuro | `acierto` y `intermedia` | 1,13 | 46 | 40 | 34 | 13 |
| oscuro | `intermedia` y `error` | 1,08 | 55 | 24 | 37 | 72 |
| oscuro | `acierto` y `error` | 1,22 | 75 | 21 | 4 | 82 |

| Hallazgo | Consecuencia |
|---|---|
| Luminancia entre estados ≤ 1,22:1 | En escala de grises los tres tonos no se distinguen |
| `acierto` y `error` en oscuro, deuteranopía: ΔE 4; en claro, protanopía: ΔE 13 | El color solo no basta: la marca o forma es obligatoria (spec `design-system`, «Estados semánticos distinguibles sin color») |
| `intermedia` frente a los otros dos: ΔE ≥ 24 en protanopía y deuteranopía | La banda 60–79 se separa por color además de por marca; solo en tritanopía se acerca a `acierto` (11–13) |

---

## b. Tipografía

### b.1 Familias (D4)

| Clave Tailwind | Familia registrada | Familia | Peso | Archivo | Uso |
|---|---|---|---|---|---|
| `plex-sans` | `PlexSans-Regular` | IBM Plex Sans | 400 | `ttf` en nativo, `woff2` latin en web | Texto corrido |
| `plex-sans-semibold` | `PlexSans-SemiBold` | IBM Plex Sans | 600 | ídem | Títulos, nombres, botones |
| `plex-mono` | `PlexMono-Regular` | IBM Plex Mono | 400 | ídem | Rótulos, metadatos, contadores |
| `plex-mono-medium` | `PlexMono-Medium` | IBM Plex Mono | 500 | ídem | Cifras y datos |

Un archivo por peso y un nombre registrado por archivo: `expo-font` y `@font-face` usan los mismos nombres de la columna «Familia registrada».

### b.2 Escala

Cada paso es un `text-*` (tamaño, interlineado, espaciado) más un `font-plex-*` (familia y peso). Se escriben siempre juntos. Valores en px.

| Paso | Clases | Familia | Peso | Tamaño | Interlineado | Espaciado | Mayúsculas | Uso |
|---|---|---|---|---|---|---|---|---|
| `marca` | `text-marca font-plex-sans-semibold` | Plex Sans | 600 | 28 | 28 | −0,28 | no | Wordmark «pKapp» en el cajetín del selector |
| `titulo` | `text-titulo font-plex-sans-semibold` | Plex Sans | 600 | 18 | 24 | 0 | no | Título de pantalla, nombre de materia en inicio, enunciado de la pregunta, subtítulo de resultado |
| `item` | `text-item font-plex-sans-semibold` | Plex Sans | 600 | 16 | 22 | 0 | no | Nombre en lista (materia, tema), título de acción y de panel |
| `cuerpo` | `text-cuerpo font-plex-sans` | Plex Sans | 400 | 15 | 22 | 0 | no | Texto de opción, explicación, mensaje, filtro en reposo |
| `cuerpo-fuerte` | `text-cuerpo font-plex-sans-semibold` | Plex Sans | 600 | 15 | 22 | 0 | no | Botones, filtro o segmento activo, énfasis |
| `detalle` | `text-detalle font-plex-sans` | Plex Sans | 400 | 13 | 18 | 0 | no | Descripción secundaria, pie de fila |
| `rotulo` | `text-rotulo font-plex-mono uppercase` | Plex Mono | 400 | 11 | 16 | +0,66 | sí | Rótulos, metadatos, ids, chips, control de tema, leyendas, contadores |
| `rotulo-medio` | `text-rotulo font-plex-mono-medium uppercase` | Plex Mono | 500 | 11 | 16 | +0,66 | sí | Valor dentro del cajetín («Preguntas 419») |
| `dato` | `text-dato font-plex-mono-medium` | Plex Mono | 500 | 16 | 20 | 0 | no | Porcentaje en filas de estadísticas, letra de opción |
| `cifra` | `text-cifra font-plex-mono-medium` | Plex Mono | 500 | 26 | 28 | 0 | no | Cifras del trío de resultados |
| `display` | `text-display font-plex-mono-medium` | Plex Mono | 500 | 72 | 72 | −2,16 | no | Porcentaje de resultado |

### b.3 Reglas

| Regla | Detalle |
|---|---|
| Peso | No usar `font-bold`, `font-semibold` ni `font-medium`: el peso lo da la familia. En nativo cada peso es un archivo distinto y `fontWeight` no lo sintetiza |
| Interlineado | En px absolutos: NativeWind no admite interlineados relativos en nativo (`leading-tight` y similares son solo web) |
| Mayúsculas | Solo `rotulo` y `rotulo-medio`, con `uppercase`; el texto fuente se escribe en caja normal |
| Estilos | Sin cursiva (no se carga archivo itálico), sin subrayado ni tachado |
| Carga | Fuente del sistema mientras cargan; sin pantalla vacía ni error visible si falla (D4) |
| Mínimo | 11 px, solo en mono mayúsculas con espaciado; el texto corrido parte de 13 px |

---

## c. Radios, grosores de filete y espaciado

### c.1 Radios (D9)

| Clave | Valor | Justificación |
|---|---|---|
| `none`, `xs`, `sm`, `DEFAULT`, `md`, `lg`, `full` | 0 px | REFERENCIAS excluye «interfaces redondeadas»; el boceto fija `border-radius: 0` global. Ninguna clave distinta de 0, tampoco `full`: la UI no tiene elementos circulares (el aro del ícono es imagen) |

### c.2 Grosores

| px | Clase | Uso |
|---|---|---|
| 1 | `border` | Marco de tarjeta, panel y control; divisores; base de barra |
| 2 | `border-2` | Estado (acierto, error, seleccionado), acción primaria, panel de mezcla, contorno de foco |
| 3 | `border-l-3` | Borde izquierdo de la nota o explicación |
| 1,5 | `strokeWidth` del SVG | Trazo de glifos de acción (tarea 1.4) |

Sin otros grosores: `border-4` y `border-8` quedan sin uso.

### c.3 Espaciado

La escala por defecto de Tailwind (base 4 px) ya contiene todos los pasos del boceto: **`spacing` no cambia**. Pasos en uso:

| Paso | px | Rol |
|---|---|---|
| `0.5` | 2 | Separación entre casillas de progreso y de la tira de resultados |
| `1` | 4 | Separación mínima entre rótulo y valor |
| `1.5` | 6 | Padding vertical de cajetín |
| `2` | 8 | Separación entre elementos de un grupo; padding de chip |
| `2.5` | 10 | Separación entre opciones y entre tarjetas |
| `3` | 12 | Padding horizontal de cajetín y de opción |
| `3.5` | 14 | Padding interno de tarjeta, panel y nota |
| `4` | 16 | Padding de botón; padding de tarjeta de resultados |
| `5` | 20 | Margen lateral de pantalla |
| `6` | 24 | Separación entre bloques |
| `8` | 32 | Separación entre secciones |
| `10` | 40 | Lado del cuadro de glifo |

| Valor del boceto | Paso final |
|---|---|
| 5, 7, 9 | 6, 8, 8 |
| 11 | 12 |
| 18 | 16 |

Sin valores arbitrarios `[Npx]`: la deuda actual (`mb-[18px]`, `py-[11px]`) se normaliza al migrar cada pantalla.

---

## d. Bloque para `tailwind.config.js`

### d.1 Escalas (van en `theme.extend`)

```js
fontFamily: {
  // Una clave por archivo de fuente. En nativo solo se usa la primera de cada
  // lista; el resto es la pila de respaldo de web (swap con la del sistema, D4).
  'plex-sans':          ['PlexSans-Regular', 'system-ui', 'sans-serif'],
  'plex-sans-semibold': ['PlexSans-SemiBold', 'system-ui', 'sans-serif'],
  'plex-mono':          ['PlexMono-Regular', 'ui-monospace', 'monospace'],
  'plex-mono-medium':   ['PlexMono-Medium', 'ui-monospace', 'monospace'],
},
fontSize: {
  marca:   ['28px', { lineHeight: '28px', letterSpacing: '-0.28px' }],
  titulo:  ['18px', { lineHeight: '24px' }],
  item:    ['16px', { lineHeight: '22px' }],
  cuerpo:  ['15px', { lineHeight: '22px' }],
  detalle: ['13px', { lineHeight: '18px' }],
  rotulo:  ['11px', { lineHeight: '16px', letterSpacing: '0.66px' }],
  dato:    ['16px', { lineHeight: '20px' }],
  cifra:   ['26px', { lineHeight: '28px' }],
  display: ['72px', { lineHeight: '72px', letterSpacing: '-2.16px' }],
},
borderRadius: {
  none: '0px', xs: '0px', sm: '0px', DEFAULT: '0px', md: '0px', lg: '0px', full: '0px',
},
borderWidth: {
  DEFAULT: '1px', 0: '0px', 1: '1px', 2: '2px', 3: '3px',
},
// spacing: sin cambios (escala por defecto de Tailwind, base 4 px).
```

Los pasos `cuerpo-fuerte` y `rotulo-medio` reutilizan `text-cuerpo` y `text-rotulo` con otra familia: no necesitan clave de `fontSize`. Los nombres de `fontSize` no chocan con ninguna clave de color ni con las claves actuales (`xxs`, `xs`, `sm`, `base`, `md`, `lg`, `xl`, `display-sm`, `display-md`, `display-lg`), que siguen hasta que las tareas 3.x retiren su último uso. Verificado en seco con Tailwind 3.4.19 y el preset de NativeWind, en una configuración temporal fuera del repo: `text-rotulo` emite `font-size: 11px; line-height: 16px; letter-spacing: 0.66px`, `border-l-3` emite `3px`, `rounded-full` emite `0px`, `font-plex-sans-semibold` emite `PlexSans-SemiBold, system-ui, sans-serif` y `dark:bg-fondoD` resuelve con la variante `.dark`.

### d.2 Color (cableado propuesto, lo decide 2.3)

```js
colors: (() => {
  const { colores, oscuro, plancha } = require('./src/theme/colores');
  // Plancha entra plano (`bg-fondo`); la contraparte oscura lleva sufijo D, como
  // las familias actuales (`dark:bg-fondoD`).
  const planchaD = Object.fromEntries(
    Object.entries(plancha.oscuro).map(([k, v]) => [`${k}D`, v]));
  return { ...colores, ...plancha.claro, ...planchaD,
           brandD: oscuro.brand, accentD: oscuro.accent, mutedD: oscuro.muted,
           successD: oscuro.success, dangerD: oscuro.danger,
           warningD: oscuro.warning, parcialD: oscuro.parcial };
})(),
```

Los tres tokens de borde de app (`manifest*`, `iconoFondo`) no se consumen por clase: Tailwind solo emite las clases que se usan.

---

## e. Contraste

| Campo | Valor |
|---|---|
| Fórmula | WCAG 2.x: razón = (L1 + 0,05) / (L2 + 0,05), con L = 0,2126 R + 0,7152 G + 0,0722 B sobre sRGB linealizado |
| Redondeo | Truncada a 2 decimales; nunca se redondea hacia arriba |
| Fuente de los valores | `src/theme/colores.js`, export `plancha`; las tablas E1 a E4 las genera un script que lee ese archivo |
| Umbral de texto | 4,5:1 en todos los pares, incluidos `display`, `cifra` y `marca` (texto grande): ninguno depende de la excepción de 3:1 |
| Umbral no textual | 3:1 contra el fondo adyacente (1.4.11): borde de campo, selección del control de tema, foco, marcas de estado |
| Fuera de umbral | Filetes decorativos, ilustración y componente inactivo: tabla E3, marcados como tales |

Reproducir una razón:

```sh
node -e "const {plancha:p}=require('./src/theme/colores');const l=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2]};const r=(a,b)=>{const[x,y]=[l(a),l(b)].sort((m,n)=>n-m);return(x+.05)/(y+.05)};console.log(r(p.claro.tinta,p.claro.fondo))"
```


### E1 · Texto (umbral 4,5:1)

| # | Par (frente sobre fondo) | Uso | Claro | Oscuro | Cumple |
|---|---|---|---|---|---|
| T1 | `tinta` sobre `fondo` | Texto principal sobre la página: títulos, cuerpo, nombres | 16,32 | 15,97 | sí |
| T2 | `tinta` sobre `superficie` | Texto principal en tarjeta, panel, campo y opción | 17,82 | 14,91 | sí |
| T3 | `tintaSec` sobre `fondo` | Metadatos, rótulos y descripciones sobre la página | 7,25 | 7,51 | sí |
| T4 | `tintaSec` sobre `superficie` | Rótulos y descripciones en tarjeta o panel; placeholder del campo | 7,91 | 7,01 | sí |
| T5 | `acento` sobre `fondo` | Etiqueta de acento sobre la página | 5,40 | 9,48 | sí |
| T6 | `acento` sobre `superficie` | Id de materia, chip, botón secundario, rótulo de nota y de mezcla | 5,90 | 8,84 | sí |
| T7 | `fondo` sobre `tinta` | Texto sobre relleno de tinta: botón primario, segmento y filtro activos | 16,32 | 15,97 | sí |
| T8 | `fondo` sobre `acierto` | Letra de la opción correcta (texto sobre relleno de acierto) | 5,97 | 10,00 | sí |
| T9 | `fondo` sobre `error` | Letra de la opción incorrecta (texto sobre relleno de error) | 6,78 | 8,18 | sí |
| T10 | `acierto` sobre `fondo` | Porcentaje de acierto sobre la página; cifra de resultado | 5,97 | 10,00 | sí |
| T11 | `acierto` sobre `superficie` | Cifra de aciertos en la tarjeta de resultados | 6,51 | 9,33 | sí |
| T12 | `acierto` sobre `aciertoFondo` | Rótulo de estado en la opción correcta | 5,62 | 8,45 | sí |
| T13 | `tinta` sobre `aciertoFondo` | Texto de la opción correcta | 15,39 | 13,49 | sí |
| T14 | `error` sobre `fondo` | Porcentaje de error sobre la página; mensaje de validación | 6,78 | 8,18 | sí |
| T15 | `error` sobre `superficie` | Cifra de errores en la tarjeta; mensaje de validación en el campo | 7,40 | 7,64 | sí |
| T16 | `error` sobre `errorFondo` | Rótulo de estado en la opción incorrecta | 6,28 | 7,31 | sí |
| T17 | `tinta` sobre `errorFondo` | Texto de la opción incorrecta | 15,12 | 14,26 | sí |
| T18 | `intermedia` sobre `fondo` | Porcentaje de la banda 60–79 sobre la página | 6,14 | 8,83 | sí |
| T19 | `intermedia` sobre `superficie` | Cifra o rótulo de la banda intermedia en tarjeta | 6,71 | 8,25 | sí |

### E2 · No textual (umbral 3:1, WCAG 1.4.11)

| # | Par (frente sobre fondo) | Uso | Claro | Oscuro | Cumple |
|---|---|---|---|---|---|
| N1 | `linea` sobre `fondo` | Marco de tarjeta, panel y cabecera sobre la página | 16,32 | 12,50 | sí |
| N2 | `linea` sobre `superficie` | Marco de un control anidado en un panel | 17,82 | 11,67 | sí |
| N3 | `borde` sobre `fondo` | Borde de control en reposo sobre la página: opción, acción, filtro | 3,47 | 4,21 | sí |
| N4 | `borde` sobre `superficie` | Borde de campo de texto y de opción sobre superficie | 3,78 | 3,93 | sí |
| N5 | `tinta` sobre `fondo` | Relleno de lo seleccionado (segmento activo del control de tema, filtro activo) contra la página; glifos de acción | 16,32 | 15,97 | sí |
| N6 | `tinta` sobre `superficie` | Relleno de lo seleccionado dentro de un panel | 17,82 | 14,91 | sí |
| N7 | `foco` sobre `fondo` | Indicador de foco sobre la página | 6,98 | 11,70 | sí |
| N8 | `foco` sobre `superficie` | Indicador de foco sobre tarjeta o panel | 7,62 | 10,92 | sí |
| N9 | `acierto` sobre `fondo` | Borde y marca de acierto sobre la página | 5,97 | 10,00 | sí |
| N10 | `acierto` sobre `superficie` | Borde, barra y marca de acierto sobre superficie | 6,51 | 9,33 | sí |
| N11 | `acierto` sobre `aciertoFondo` | Marca de acierto dentro de la fila | 5,62 | 8,45 | sí |
| N12 | `error` sobre `fondo` | Borde y marca de error sobre la página | 6,78 | 8,18 | sí |
| N13 | `error` sobre `superficie` | Borde, barra y marca de error sobre superficie; campo con error | 7,40 | 7,64 | sí |
| N14 | `error` sobre `errorFondo` | Marca de error dentro de la fila | 6,28 | 7,31 | sí |
| N15 | `intermedia` sobre `fondo` | Barra y marca de la banda intermedia sobre la página | 6,14 | 8,83 | sí |
| N16 | `intermedia` sobre `superficie` | Barra y marca de la banda intermedia sobre superficie | 6,71 | 8,25 | sí |
| N17 | `acento` sobre `fondo` | Contorno de chip y marco de 2 px del panel de mezcla sobre la página | 5,40 | 9,48 | sí |
| N18 | `acento` sobre `superficie` | Borde izquierdo de la nota y marco del panel de mezcla sobre superficie | 5,90 | 8,84 | sí |
| N19 | `tintaSec` sobre `fondo` | Chevron y regla graduada (trazo 1,5 px) sobre la página | 7,25 | 7,51 | sí |

### E3 · Fuera de umbral por regla (informativo)

| # | Par | Condición | Uso | Claro | Oscuro |
|---|---|---|---|---|---|
| X1 | `filete` sobre `fondo` | Decorativo | Divisor interno de lista y de cajetín sobre la página | 1,69 | 1,50 |
| X2 | `filete` sobre `superficie` | Decorativo | Divisor dentro de tarjeta y panel; borde de casillas vacías de progreso | 1,85 | 1,40 |
| X3 | `filamento` sobre `superficie` | Decorativo | Campo de filamentos e ilustración de materia (`aria-hidden`) | 17,82 | 8,25 |
| X4 | `inactivo` sobre `fondo` | Exento (inactivo) | Texto y glifo de un control deshabilitado sobre la página | 3,47 | 4,21 |
| X5 | `inactivo` sobre `superficie` | Exento (inactivo) | Texto y glifo de un control deshabilitado sobre superficie | 3,78 | 3,93 |

### E4 · Bordes de app (independientes del tema)

| # | Par | Umbral | Uso | Razón | Cumple |
|---|---|---|---|---|---|
| A1 | `oscuro.tintaSec` sobre `iconoFondo` | 4,50:1 | Tagline del splash nativo (`App.js`) sobre el fondo de app | 7,51 | sí |
| A2 | `oscuro.tinta` sobre `iconoFondo` | 3,00:1 | Trazo de la "p" del ícono sobre su fondo (logotipo: informativo) | 15,97 | sí |
| A3 | `oscuro.acento` sobre `iconoFondo` | 3,00:1 | Punto teal del ícono sobre su fondo (informativo) | 9,48 | sí |


### Resumen de e

| Medida | Resultado |
|---|---|
| Filas de texto (T1–T19) bajo 4,5:1 | 0 |
| Filas no textuales (N1–N19) bajo 3:1 | 0 |
| Filas de borde de app (A1–A3) bajo su umbral | 0 |
| Holgura mínima | `borde` sobre `fondo` en claro: 3,47 contra 3,00 (N3) |
| Valor del boceto que no pasa y se cambió | Ninguno de color de texto ni de marca. `--hair` no pasa 3:1 como borde de control: se separa `borde` (f, fila 3) |

---

## f. Cambios respecto del boceto

| # | Boceto | Final | Motivo |
|---|---|---|---|
| 1 | Variables `[data-theme]` | Sin cambios en `fondo`, `superficie`, `tinta`, `tintaSec`, `linea`, `filete`, `acento`, `acierto`, `aciertoFondo`, `error`, `errorFondo`, `filamento` | Todos cumplen su umbral (e) |
| 2 | `--stage` y `--frame` | No se exportan | Son del tablero de presentación, no de la app |
| 3 | Borde de opción (`.opt`) y de acción (`.act`) en `--hair` | `borde` | Delimita un control: 3:1 (1.4.11). `filete` queda para divisores internos |
| 4 | Banda intermedia = tinta neutra; corte rojo en 65 | `intermedia` (acero); cortes 80 y 60 | D6: manda el código y la banda 60–79 debe distinguirse |
| 5 | Foco sin definir | `foco` | WCAG 1.4.11 |
| 6 | Deshabilitado = `--hair` y `--ink2` (`.sq.off`) | Borde `filete`, texto `inactivo` | Estado propio de la matriz |
| 7 | Tamaños 10,5 · 12 · 12,5 · 13,5 · 14 · 14,5 · 15,5 · 17 · 19 | 11 · 11 · 13 · 13 · 15 · 15 · 16 · 18 · 18 | Escala de enteros, mínimo 11 px |
| 8 | Porcentaje de resultado en 72 px y 60 px (`.big.am`) | 72 px único | El tamaño no codifica estado |
| 9 | Interlineado proporcional (1,25 a 1,5) | px absolutos | NativeWind no admite relativos en nativo |
| 10 | Espaciado de letras .04 a .08 em | +0,66 px (≈ .06 em) | Un valor para todos los rótulos |
| 11 | Fuentes desde Google Fonts | `expo-font` por plataforma | D4 |
| 12 | Radio 0 | 0 en todas las claves | D9 |

---

## g. Lo que queda para otras tareas

| Tema | Tarea |
|---|---|
| Marca o forma de acierto, error e intermedia; hover web; estado presionado | 1.2 |
| Distinción de 1.er y 2.do parcial sin pasteles | 1.3 |
| Glifos de trazo de 1,5 px | 1.4 |
| Aplicar los bloques d.1 y d.2 a `tailwind.config.js` y retirar `sombras.js` | 2.3 |
| `StatusBar`, splash nativo, `meta theme-color` y literales de `App.js` | Tareas de bordes de app (D8) |
