# Fichas comunes · tarea 1.2

| Campo | Valor |
|---|---|
| Change | `openspec/changes/rediseno-plancha` (D6, D7, D9, D10) |
| Rama | `rediseno` |
| Insumos | `tokens.md` (1.1), `hibrido.html`, `NOTAS.md`, `src/components/HeaderMarca.js`, `src/screens/*Screen.js`, `App.js` |
| Lo usan | `MateriaSelect.md`, `Home.md`, `TopicSelect.md`, `Quiz.md`, `Results.md`, `Stats.md` |
| Resuelto en 1.3 | `AddQuestion.md`, `Revision.md`, `ExamenEnCurso.md`, `Settings.md`, `DonationBox.md`, `Vacios.md` y `Banners.md`; la distinción de parciales está en §12. Las referencias de las fichas de 1.2 apuntan a archivo y sección |
| Glifos | Se nombran en §9, con su función y el porqué de su color; se dibujan en 1.4 |
| Propuestas | §11 (`COMUN-P1`, `COMUN-P2`) y sección f de cada ficha. Aprobadas por el usuario el 2026-10-10 (D10). Lo conservado de `main` va en la sección h de cada ficha. Aprobadas el 2026-10-11: el escritorio de la tarea 3.10, en §7.2 (`ESC-P0`) y en la sección «Escritorio» de cada ficha (`ESC-P1` a `ESC-P8` y `ESC-P10` a `ESC-P12`; `ESC-P9`, rechazada), el selector de tema desplegable `ADD-P3` (§5.3 y `AddQuestion.md`; `ADD-P1`, rechazada), el grupo «Fuente» de TopicSelect, `TOPIC-P6` (`TopicSelect.md` f.1), y el relevamiento de «generada»: `HOME-P4` y `HOME-P5` (`Home.md`), `SET-P3` (`Settings.md`), `MATERIA-P4` (`MateriaSelect.md`; reemplaza a `MATERIA-P2`) y `VAC-P5` (`Vacios.md`), y el carrusel de avisos `BAN-P2` (`Banners.md` §3.14; `BAN-P3` y `BAN-P4`, no elegidas) |
| Orden de lectura | Primero este archivo; cada ficha lo cita por sección (§N) y por clase de control (K1 a K7) |

---

## 0. Convenciones de lectura

| Notación | Significado |
|---|---|
| `fondo`, `tinta`, `linea`… | Tokens de color de `tokens.md` a.1; cada uno resuelve en claro y en oscuro |
| `rotulo`, `cuerpo`, `titulo`… | Pasos tipográficos de `tokens.md` b.2 (siempre `text-*` más `font-plex-*`) |
| `border`, `border-2`, `border-l-3` | Grosores de `tokens.md` c.2 |
| `paso N` | Paso de espaciado de `tokens.md` c.3 (`p-N`, `m-N`, `gap-N`, `h-N`, `w-N`) |
| T#, N#, X# | Pares de contraste de `tokens.md` e |
| K1 a K7 | Clases de control de §5 |
| Fichas de 1.3 | `AddQuestion.md`, `Settings.md`, `DonationBox.md`, `Revision.md`, `ExamenEnCurso.md`, `Vacios.md` y `Banners.md`; sus propuestas llevan los prefijos `ADD-`, `SET-`, `DON-`, `REV-`, `EXA-`, `VAC-`, `BAN-` y `PAR-` |
| «—» | No aplica |
| `COMUN-P#`, `MATERIA-P#`, `HOME-P#`, `TOPIC-P#`, `QUIZ-P#`, `RESULTS-P#`, `STATS-P#` | Propuestas aprobadas por el usuario el 2026-10-10 (D10): §11 y sección f de cada ficha; `TOPIC-P6`, `HOME-P4`, `HOME-P5` y `MATERIA-P4` son del 2026-10-11, y `MATERIA-P2` quedó reemplazada por `MATERIA-P4`. Los ids son únicos en todo el change; 1.3 usa sus propios prefijos (`SET-P3` y `VAC-P5` también son del 2026-10-11) |
| `ESC-P0` a `ESC-P12` | Propuestas de escritorio (tarea 3.10), aprobadas por el usuario el 2026-10-11 (D10), salvo `ESC-P9`, rechazada: §7.2 y la sección «Escritorio» de cada ficha. No están entre las aprobadas del 2026-10-10 de arriba; bajo el corte `escritorio` rige la columna de la propia ficha |
| `ADD-P1`, `ADD-P3` | Selector de tema de AddQuestion: `ADD-P1` rechazada y `ADD-P3` aprobada por el usuario el 2026-10-11 (D10): §5.3 y `AddQuestion.md` f. `ADD-P2` es del 2026-10-10 |
| `TOPIC-C#`, `RESULTS-C#` y los `-C#` de 1.3 | Lo conservado de `main` (sección h de la ficha). No son propuestas ni pasan por aprobación (D10, base de comparación) |

| Prohibido en todas las fichas | Origen |
|---|---|
| Radios, sombras, gradientes, transparencias de color, opacidad como estado. Única excepción: `strokeOpacity` del campo de filamentos, solo en `MateriaSelect.md` (CD-24) | D9; `tokens.md` a.2 y c.1; `CONVENCIONES.md` CD-24 |
| Cursiva, subrayado, tachado | `tokens.md` b.3 |
| Emojis | spec `design-system`, «Interfaz sin emojis» |
| Valores hexadecimales, medidas sueltas y valores arbitrarios `[N]` | brief 1.2; `tokens.md` c.3 |
| Texto corrido por debajo de `detalle` | `tokens.md` b.3 |

---

## 1. HeaderMarca (MateriaSelect y Home)

Fila superior compartida. Reemplaza al bloque actual (fila, logo e imagen, bloque de dos líneas). El bloque de texto de dos líneas pasa a la lámina (MateriaSelect) y a la tarjeta de materia (Home).

| Bloque | Contenido | Tokens y pasos | Regla |
|---|---|---|---|
| Contenedor | Ancho completo | Fondo `fondo`; sin borde inferior | El primer bloque de cada pantalla trae su propio marco |
| Relleno | Superior, inferior y lateral | Superior: área segura superior más `paso 3.5`; inferior `paso 3.5`; lateral `paso 5` (`paso 8` desde el corte `escritorio`: §7.2) | D10, áreas seguras |
| Fila | Slot `izquierda`, control de tema | Alto fijo: `paso 11` de cada opción del control de tema más el `border` superior e inferior de su contenedor; distribución entre extremos; centrada en vertical | El alto no depende del contenido de `izquierda`. El botón «Cambiar materia» (`paso 11`) queda centrado en la fila |
| Slot `izquierda` | MateriaSelect: texto «ESFUNO» (`rotulo`, `tintaSec`, una línea, centrado en vertical; `MateriaSelect.md`, `MATERIA-P1`, aprobada). Home: botón «Cambiar materia» (ficha de Home; solo glifo bajo 360 px, §1.1) | — | Texto o botón, la fila mide lo mismo |
| Control de tema | Segmentado «Claro \| Oscuro», con glifo y texto en cada opción (§2) | Alto útil de cada opción `paso 11`; el contenedor suma su `border` arriba y abajo (§2.1) | Siempre a la derecha |

| Invariante D6 | Cómo se cumple |
|---|---|
| Altura igual de header entre MateriaSelect y Home | Alto del header = área segura superior + `paso 3.5` + (`paso 11` + `border` arriba y abajo del control de tema) + `paso 3.5` en las dos pantallas. Ningún texto, imagen ni botón lo estira. El primer bloque debajo arranca en la misma ordenada en ambas |
| Prohibido | Alto por contenido, `numberOfLines` como forma de igualar alturas, segundo texto dentro del header |

### 1.1 Ancho de la fila (D10, C3)

El alto de la fila no cambia con el ancho (tabla de arriba). Lo que cambia es el botón del slot `izquierda` de Home, para que no parta su texto ni quede pegado al control de tema. El criterio es el ancho de la ventana, no el contenido medido: dos pantallas del mismo ancho muestran lo mismo.

| Ancho de ventana | Botón «Cambiar materia» (Home) | Control de tema | Separación entre controles |
|---|---|---|---|
| 360 px o más | Glifo y texto en una línea; ancho por contenido; alto `paso 11` (K2); relleno horizontal `paso 3`: 174,3 × 44 px | Segmentado completo (§2) | Distribución entre extremos; nunca menos de `paso 2` |
| Menos de 360 px (hasta 320 px) | Solo `glifo-volver`: cuadrado de `paso 11` por `paso 11` (K2), glifo grande centrado; el texto no se muestra | Igual | Distribución entre extremos; nunca menos de `paso 2` |

| Regla | Detalle |
|---|---|
| Umbral | 360 px: es el ancho de teléfono más angosto de la matriz de D10 (360 y 320) en el que el botón con texto, el control de tema, el margen lateral `paso 5` y `paso 2` entre controles entran en una fila. Bajo ese ancho el texto saltaría de línea y el botón quedaría pegado al control |
| Relleno (5.2, `A1-01`, 2026-10-13) | `paso 3` y no el `paso 4` por defecto de §8: es el valor de la maqueta (174 × 44 px) y el que entra a 360 px con barra de desplazamiento clásica de 15 px (fila de 305 px; ranura del botón 179,1 px; botón 174,3 px: 4,8 px de holgura y 12,8 px hasta el control de tema). Con `paso 4` el botón pide 182,3 px y el texto saltaría a dos líneas. Medido sobre el build de 5.0b |
| Mismo control | Es el mismo botón: destino, gesto único y estados de K2 sin cambio. No hay segundo control ni cambia el flujo |
| Nombre accesible | «Cambiar materia», la cadena del texto visible; sin cadena nueva. Con el glifo como único contenido lleva `accessibilityLabel` con esa cadena (CD-12) y `accessibilityRole="button"` |
| Alto de la fila | Sin cambio: el cuadrado de `paso 11` queda centrado en la fila (D6, CD-19) |
| MateriaSelect | Sin variante: «ESFUNO» entra en la fila a 320 px junto al control de tema |
| Naturaleza | Desviación por invariante (D10 y C3: sin recorte, `paso 2` entre controles), no propuesta. Registrada en `Home.md` g |

---

## 2. Control «Claro | Oscuro» (D7)

Reemplaza al `Switch` y al emoji de sol o luna que lo acompaña hoy (`HeaderMarca.js:41`), que pasan a `glifo-claro` y `glifo-oscuro` (§9). Segmentado de dos opciones; no son dos botones sueltos. Cada opción lleva su glifo y su texto: el texto acompaña al glifo, no lo reemplaza.

### 2.1 Elementos

| Elemento | Frente | Fondo | Borde | Paso | Notas |
|---|---|---|---|---|---|
| Contenedor | — | `fondo` | `linea`, `border` | Alto `paso 11` de la opción más el `border` superior e inferior | N1. Agrupa las dos opciones; el borde queda fuera del alto útil, que cumple D10 (44 × 44) |
| Opción en reposo | `tinta` (texto y glifo) | `fondo` | — | `rotulo` | T1, N5. Glifo chico sobre el texto, centrados y separados por `paso 0.5`. Texto fuente «Claro» u «Oscuro» en caja normal; el paso lo pasa a mayúsculas |
| Opción seleccionada | `fondo` (texto y glifo) | `tinta` | — | `rotulo` | T7, N5. La inversión de valor se lee en escala de grises |
| Relleno horizontal | — | — | — | `paso 2` por opción | Ancho por contenido; cada opción mide al menos `paso 11` de ancho y `paso 11` de alto útil |
| Disposición | — | — | — | Glifo sobre texto, dentro del alto útil de la opción | Apilados, el control ocupa menos ancho que con el glifo delante del texto: junto al botón «Cambiar materia» de Home la fila entra en teléfonos más angostos que el de referencia (390 px) sin cortar texto |

### 2.2 Estados

El glifo toma en todo estado el color del texto de su opción.

| Opción | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Opción no seleccionada | `tinta` sobre `fondo` | Contorno web `linea`, `border` | Inversión: `fondo` sobre `tinta` (anticipa la selección) | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — (el control nunca se deshabilita) |
| Opción seleccionada | — | Sin cambio | — | Igual que la otra | `fondo` sobre `tinta` | — |

### 2.3 Comportamiento y accesibilidad

| Aspecto | Contrato |
|---|---|
| Gestos | Uno: tocar la opción no seleccionada llama `setOscuro(valor)` de `TemaContext`. Tocar la seleccionada no hace nada |
| Estado único | Las dos pantallas leen `useTema().oscuro`; no hay estado propio del control |
| Persistencia | Clave `tema`, valores `claro` y `oscuro`, por defecto `claro` (D6; `TemaContext.js`). Sin cambios |
| Rol | Contenedor `accessibilityRole="radiogroup"` con `accessibilityLabel="Modo oscuro"` (cadena actual). Cada opción `accessibilityRole="radio"` con `accessibilityState={{ checked }}`: el estado seleccionado |
| Nombre accesible | El texto visible de cada opción. El glifo es decorativo (`aria-hidden`, `accessibilityElementsHidden`) |
| Visibilidad | En HeaderMarca, o sea en MateriaSelect y Home (spec `theming`: pantallas de entrada) |

### 2.4 Desviación por invariante (D10)

No es propuesta ni lleva estado: el invariante no admite otra medida, así que no hay variante que aprobar. Se registra aquí para que la medida tenga dueño y origen.

| Id | Qué fija | Motivo | Origen |
|---|---|---|---|
| `MAQUETA-P3` | Cada opción del control mide `paso 11` de alto útil y `paso 11` de ancho mínimo; el contenedor suma su `border` arriba y abajo (§2.1). Con el mismo `paso 11` de la fila, el header mide lo mismo en MateriaSelect y en Home (§1) | Objetivo táctil de 44 × 44 pt en ambas dimensiones (D10, C3 de `CONVENCIONES.md`): en la primera pasada de la maqueta dos opciones quedaban por debajo | Surgió al maquetar (`diseno/maqueta/NOTAS-MAQUETA.md` §7). Recogida en §1, §2.1 y §8 y en `tokens.md` c.3 sin el id |

---

## 3. Barra interna del Stack (elemento compartido, tarea 3.1b)

Header del Stack de las pantallas internas. Reemplaza la banda de marca y el título del navegador. La implementa la tarea 3.1b; las tareas de las pantallas que la usan (3.4, 3.6, 3.7, 3.8 y 3.9) la heredan y no la reescriben.

| Dato | Valor |
|---|---|
| Dueña | Tarea 3.1b (`tasks.md`) |
| Dónde vive | Desde la 3.12 no es el `header` del native-stack: `conBarraInterna` (`src/components/BarraInterna.js`) la pone dentro de cada pantalla, antes del contenido. `App.js` solo declara `BARRA` por ruta (título, `ancho`, `sinVolver`) y `headerShown: false` (5.2, `A1-06`) |
| La usan | TopicSelect, Stats y Results (sin volver); `AddQuestion.md` a.1 y `Settings.md` a.1 |
| No la usan | MateriaSelect y Home (`headerShown: false`, HeaderMarca) y Quiz (`QUIZ-P1`: `headerShown: false` y barra propia) |
| Reemplaza | El `header` del native-stack (`headerStyle`, `headerTintColor`, `headerTitleStyle`) y la flecha de texto del `headerLeft` de web: los reemplaza la barra propia de la 3.12 (`headerShown: false`) |

### 3.1 Elementos

| Elemento | Frente | Fondo | Borde | Paso | Notas |
|---|---|---|---|---|---|
| Barra | — | `fondo` | Inferior `linea`, `border`, a ancho completo | Relleno vertical `paso 4`, lateral `paso 5`; fila de contenido de alto `paso 11` con y sin volver (`MAQUETA-P1`, 3.5) | N1. El contenido va dentro de la columna (§7) |
| Botón volver | `tinta`, `glifo-volver` | — | — | Objetivo `paso 11`; glifo `paso 6` | N5. Ausente en Results (`headerBackVisible: false`): su lugar queda vacío |
| Título | `tinta` | — | — | `titulo`; una línea | T1. Copy actual de `App.js` (3.3) |
| Separación | — | — | — | `paso 3.5` entre volver y título | — |

### 3.2 Matriz de estados

| Variante | Condición | Volver | Título | Filete |
|---|---|---|---|---|
| Con volver | Ruta con historial atrás y sin `headerBackVisible: false` (TopicSelect, Stats; AddQuestion y Settings: `AddQuestion.md` a.1, `Settings.md` a.1) | Visible (K7) | A la derecha del volver, separado `paso 3.5` | Inferior `linea`, `border`, a ancho completo |
| Sin volver | `headerBackVisible: false` (Results) | Ausente; su lugar queda vacío y la fila conserva el alto `paso 11`. El título arranca en el margen lateral `paso 5` | Igual | Igual |
| Quiz | `QUIZ-P1` aprobada: `headerShown: false` | — | — | Lo pone la barra del quiz (`Quiz.md`) |

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Barra (contenedor) | Fondo `fondo`; filete inferior `linea` | — | — | — | — | — (no es un control) |
| Título | `tinta`, `titulo`, una línea | — | — | — | — | — |
| Botón volver (K7) | Glifo `tinta` | Contorno web `linea`, `border` | Inversión: `fondo` sobre `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — (nunca se deshabilita) |

### 3.3 Títulos por ruta (copy actual de `App.js`)

| Ruta | Título |
|---|---|
| TopicSelect | «pKapp · Elegir tema» |
| Results | «pKapp · Resultados» |
| Stats | «pKapp · Estadísticas» |
| AddQuestion | «pKapp · Agregar pregunta» (`AddQuestion.md`) |
| Settings | «pKapp · Ajustes» (`Settings.md`) |
| Quiz | Sin título visible: `QUIZ-P1` aprobada (`headerShown: false`) |

### 3.4 Contrato de comportamiento (lo que 3.1b verifica)

| Aspecto | Contrato |
|---|---|
| Acción del volver | La de hoy: `navigation.goBack()`. Ni gestos nuevos ni menos |
| Gesto y hardware | El gesto de volver de iOS y el botón de hardware de Android no dependen de la barra y siguen activos |
| Navegador | El atrás del navegador no cambia: no pasa por la barra |
| Quiz | El guardia `beforeRemove` y su confirmación («Salir del quiz») quedan intactos: la barra interna no interviene en la salida del quiz |
| Pageview | `trackPageview` usa el nombre de ruta, no el título: no se altera |
| Áreas seguras | Relleno superior: área segura superior más `paso 4`. En apaisado, márgenes laterales no menores al área segura lateral |
| Columna | Filete y fondo de la barra a todo el ancho; volver y título dentro de la columna `columna` (§7.1); desde el corte `escritorio`, dentro de la hoja de la superficie (§7.2) |
| Alto | Igual con y sin volver: relleno `paso 4` arriba y abajo y fila de `paso 11` (`MAQUETA-P1`, 3.5). El título no cambia de lugar vertical al pasar de una pantalla con volver a Results |

### 3.5 Propuestas aprobadas (D10)

El usuario la aprobó el 2026-10-10 y rige tal como está descrita en 3.1, 3.2 y 3.4. No hay variante alternativa. Origen: `diseno/maqueta/NOTAS-MAQUETA.md` §7.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| MAQUETA-P1 | La barra interna mide lo mismo con y sin volver: fila de alto `paso 11` en las dos variantes. En Results el lugar del volver queda vacío y el título arranca en el margen lateral `paso 5` | Con volver la barra mide `paso 4` + `paso 11` + `paso 4`; sin volver, `paso 4` + una línea de título + `paso 4`, y al pasar de TopicSelect o Stats a Results el título saltaba `paso 5`. Figuras 03a, 05a y 06 de la maqueta | visual | aprobada (usuario, 2026-10-10) |

---

## 4. Marcas de estado (acierto, error, intermedia)

Regla: ningún estado se comunica solo por color (spec `design-system`; `tokens.md` a.3: ΔE 4 entre `acierto` y `error` en oscuro con deuteranopía). Cada estado lleva marca, forma y texto propios.

| Estado | Color | Marca (glifo) | Forma | Texto | Posición |
|---|---|---|---|---|---|
| Acierto | `acierto`; relleno `aciertoFondo` | `glifo-acierto` | Marco `border-2`; casilla alta en tiras | «Correcta» (opción), «Correctas» (trío) | Delante del texto |
| Error | `error`; relleno `errorFondo` | `glifo-error` | Marco `border-2`; casilla baja (mitad de alto) en tiras | «Incorrecta» (opción), «Incorrectas» (trío) | Delante del texto |
| Intermedia | `intermedia` | `glifo-intermedia` | Sin relleno de fila; relleno de barra entre las marcas 60 y 80 (`STATS-P1`) | El valor numérico | Delante del valor |

| Banda de rendimiento | Dónde | Cortes (los fija el código; D6) | Color | Marca |
|---|---|---|---|---|
| Estadísticas | `StatsScreen.js` (`acierto()`) | ≥ 80, 60–79, < 60 | `acierto`, `intermedia`, `error` | `glifo-acierto`, `glifo-intermedia`, `glifo-error`; marcas de umbral en la barra |
| Resultados | `ResultsScreen.js` (`getResultFeedback`) | ≥ 75, 50–74, < 50 (tramos de color) | `acierto`, `intermedia`, `error` | Igual que arriba, junto al porcentaje |

| Par de marca | Contraste |
|---|---|
| Marca de acierto sobre `fondo`, `superficie`, `aciertoFondo` | N9, N10, N11 |
| Marca de error sobre `fondo`, `superficie`, `errorFondo` | N12, N13, N14 |
| Marca de intermedia sobre `fondo`, `superficie` | N15, N16 |

| Separación entre la marca y el texto (5.2, `D-04`, 2026-10-13) | Valor |
|---|---|
| Glifo chico delante del texto: rótulo del trío, línea de estado de la revisión, valor de «Más falladas» y de cada fila de Stats, correcta de «Mis preguntas», nota y chip del quiz, encabezado de aviso | `paso 1.5` (6 px): es el de `MarcaEstado` |
| Glifo grande delante del porcentaje (`display`; `Results.md` a.2) | `paso 2` (8 px) |
| Rótulo de la tarjeta global de Stats (glifo chico; `Stats.md` a.2, armado a mano) | `paso 2` (8 px) |

---

## 5. Estados de control

### 5.1 Reglas generales (D10)

| Regla | Detalle |
|---|---|
| Objetivo táctil | Todo control interactivo mide como mínimo `paso 11` de alto y de ancho (D10: 44 × 44 pt). Si el trazo visible es menor (un glifo), el control mide `paso 11` igual, con el glifo centrado |
| Separación táctil | Entre controles adyacentes, al menos `paso 2`; las filas de lista se separan por filete |
| Hover | Solo bajo `@media (hover: hover)`. Sin transición de tamaño ni de layout. El halo con `rgba` de `webStyles.js` sale al migrar (`tokens.md` a.2) |
| Presionado | Inversión `tinta`/`fondo` (nativo: callback de estado de `Pressable`; web: `:active`). `activeOpacity` sale: opacidad es transparencia |
| Foco | Contorno `foco`, `border-2`, separado `paso 0.5`; visible solo con teclado (`:focus-visible`); no mueve el layout; N7 y N8 |
| Deshabilitado | Sin hover, presionado ni foco; no recibe toque; borde `filete`; texto y glifo `inactivo` (X4 y X5, exentos). Lleva `accessibilityState={{ disabled: true }}` |
| Seleccionado | Relleno `tinta` y texto `fondo`; `accessibilityState` con el estado seleccionado |
| Áreas seguras | Superior: HeaderMarca y barra interna suman el área segura superior. Inferior: barras fijas suman el área segura inferior más `paso 4`. Laterales (apaisado): márgenes laterales no menores al área segura lateral |
| Plataforma | Nada depende de un gesto ni de una fuente de un solo sistema; las fuentes caen al sistema mientras cargan (D4) |

### 5.2 Clases de control

| Clase | Qué es | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|---|
| K1 | Botón relleno | Fondo `tinta`; texto `fondo` (T7); borde `tinta`, `border` | Contorno web `linea`, `border-2`, sin separación | Inversión: fondo `superficie` (lo fijan las matrices c de las fichas); texto `tinta`; borde `linea` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | Fondo del contenedor, el de la página o el del panel donde está; texto `inactivo`; borde `filete` |
| K2 | Botón de marco | Fondo `superficie` (`fondo` en «Cambiar materia» de Home y en «Volver» de Revisión, por ficha); texto `tinta`; borde `linea`, `border`. Variante de acento: texto y borde `acento` (T6). Variante de peligro: texto y borde `error` (`SET-P2`) | Contorno web del color del borde, `border` | Inversión: fondo `tinta`; texto `fondo`; borde `tinta` (de peligro: fondo `error`, texto `fondo`, T9) | Igual que K1 | — | Borde `filete`; texto `inactivo`; el fondo no cambia |
| K3 | Control de marco `borde` (acción, opción, filtro) | Fondo `superficie`; texto `tinta` (T2); borde `borde`, `border` (N3, N4) | Borde pasa a `linea`, mismo grosor | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` | Igual que K1 | Fondo `tinta`; texto `fondo`; borde `tinta` (§5.1), salvo lo que fije la ficha (regla 2.9-2) | Borde `filete`; texto `inactivo` |
| K4 | Filtro o segmento de un grupo | Igual que K3 | Igual que K3 | Igual que K3 (anticipa el seleccionado) | Igual que K1 | Fondo `tinta`; texto `fondo` en `cuerpo-fuerte`; borde `tinta` (T7, N5) | Igual que K3 |
| K5 | Cuadrado de paso (menos, más) | Igual que K2 (fondo `superficie`), lado `paso 11`, glifo `tinta` | Igual que K2 | Igual que K2 | Igual que K1 | — | Borde `filete`; glifo `inactivo` |
| K6 | Tarjeta navegable | Borde `linea`, `border`; fondo `superficie`; marcas de esquina (§6). Variante de acento (tarjeta de mezcla de `TopicSelect.md`): borde `acento`, `border-2`; glifo `acento`; sin marcas | Contorno web `linea`, `border` (de acento: `acento`, `border`) | Inversión total: fondo `tinta`; texto, glifo e ilustración `fondo` | Igual que K1 | — | Borde `filete`; texto e ilustración `inactivo`; las marcas de esquina no cambian (`linea`, §6) |
| K7 | Fila de lista, fila de selector o botón de glifo | Sin marco; filete inferior `filete` en listas; texto `tinta`. Botón de glifo: `tinta` (cerrar del quiz) o `tintaSec` (descartar, eliminar y quitar, N19 y N20) | Contorno web `linea`, `border` | Inversión total | Igual que K1 | Solo la fila elegida de un selector (regla 2.9-10): fondo `tinta`; texto `fondo` en `cuerpo-fuerte` | Texto y glifo `inactivo` |

| Combinación | Resultado |
|---|---|
| Hover y foco a la vez | Gana el foco (un solo contorno) |
| Seleccionado y hover | Sin cambio: el relleno ya es el máximo |
| Presionado en un seleccionado | Sin cambio |

Reglas que fija la tarea 2.9 (componentes compartidos de `src/components/plancha/`) para lo que las matrices de arriba dejaban abierto. Las 3.x las aplican y no las vuelven a decidir.

| Regla | Qué fija | Fuente |
|---|---|---|
| 2.9-1 Fondo | K1 presionado: `superficie`. K1 deshabilitado: el del contenedor. K2 y K5 en todo estado menos presionado: `superficie` por defecto y `fondo` donde la ficha lo pide (Home, «Cambiar materia»; Revisión, «Volver»). K3, K4 y K6: `superficie`. Un control declara su fondo; no lo hereda de un contenedor que no lo fija | Matrices c de Results, Quiz, TopicSelect, Settings, Revisión, ExamenEnCurso y AddQuestion (K1); Results, Vacíos, Banners y Settings (K2 en `superficie`); Home y Revisión (K2 en `fondo`) |
| 2.9-2 Seleccionado de K3 | Por defecto: fondo `tinta`, texto `fondo`, borde `tinta` y estado accesible seleccionado. Excepciones de la ficha: celda de letra marcada (fondo y borde `acierto`, `border-2`, `glifo-acierto` en `fondo`: `AddQuestion.md` c) y plegable abierto, que está expandido y no seleccionado (borde `linea`, sin relleno, estado accesible expandido: `Settings.md` c) | §5.1; CD-5; `ExamenEnCurso.md` b (opción elegida) |
| 2.9-3 K4 deshabilitada | Cada opción de un grupo puede deshabilitarse, con el aspecto de K3 deshabilitado, sin toque, hover ni foco. Si la opción marcada se deshabilita, gana el aspecto deshabilitado y conserva su estado accesible marcado | §5.2 K4; CD-5 |
| 2.9-4 Paso tipográfico | K1, K2 y K3 con texto de acción: `cuerpo-fuerte`. K3 como opción, letra o plegable: el paso de la ficha (`cuerpo`, `dato`, `item`) con el color de estado de la clase. K4 como filtro: `cuerpo` y, seleccionado, `cuerpo-fuerte`; presionado invierte colores y conserva `cuerpo` (el peso no cambia al presionar: sin salto de ancho; 5.2, `B-09`). K4 como segmentado dentro de un contenedor (`SET-P1`): `rotulo` en reposo y seleccionado. K7 como fila de selector: `cuerpo` y, elegida, `cuerpo-fuerte` (2.9-10). K7 con texto de acción («Reportar pregunta» en Quiz, Examen en curso y Revisión): `cuerpo` en `tinta` (`REV-3`, aprobada por el usuario el 2026-10-12). Marca de estado (§4): `rotulo` en la línea de estado, el rótulo del trío y la leyenda (texto del estado o `tintaSec`, según la ficha); `detalle` en la correcta de «Mis preguntas»; `dato` en las filas de Estadísticas; `display` en el porcentaje, con el glifo a `paso 6` | `tokens.md` b.2; tablas b de Results, Quiz, TopicSelect, Settings, Revisión, AddQuestion y Stats |
| 2.9-5 Relleno y alto | En §8 | §8 |
| 2.9-6 K6 deshabilitada | Las marcas de esquina no cambian: siguen en `linea` (§6). Cambian el borde (`filete`) y el texto, el id y la ilustración (`inactivo`) | §6; `MateriaSelect.md` c |
| 2.9-7 Teclado de K4 | El del control de tema (§2.3): flechas izquierda y arriba (anterior) y derecha y abajo (siguiente) mueven el foco y la selección, con vuelta y saltando las opciones deshabilitadas; Espacio y Enter seleccionan la opción con foco; con Alt, Ctrl o Meta no se actúa; todas las opciones siguen siendo paradas de Tab. Rol `radiogroup` y `radio` | `SET-P1` (el segmentado de Ajustes es «de la misma clase K4 que el control Claro \| Oscuro»); §2.3; `HeaderMarca.js` |
| 2.9-8 Controles que repintan a sus hijos | K3, K6 y K7 entregan a su contenido el estado (`estado`, `invertido`, `deshabilitado`) y las claves de color del texto, del glifo y de la ilustración, porque un descendiente libre no hereda el color. Ilustración de K6: `filamento` en reposo y hover, `fondo` presionada, `inactivo` deshabilitada | §5.2 K6 y K7; `COMUN-P1`; CD-15; `MateriaSelect.md` c |
| 2.9-9 Hover y foco | El contorno de hover y el de foco van en el mismo elemento y el foco prevalece: un solo contorno. K3 y K4 como filtro cambian el color del borde y no suman contorno; K4 como segmentado, K1, K2, K5, K6 y K7 suman el contorno de la tabla. Ninguno mueve el layout | §5.1; CD-3; CD-4; `Settings.md` c (segmentado) |
| 2.9-10 K7 elegida | Una fila K7 de un selector (el `Desplegable`, §5.3) puede estar elegida: fondo `tinta`, texto `fondo` en `cuerpo-fuerte` y estado accesible seleccionado. Hover y presionado no la cambian: el relleno ya es el máximo. No lleva tilde: `glifo-acierto` significa «correcta» (§9) y no se reutiliza para «elegida». El disparador del selector es un K3 abierto, que está expandido y no seleccionado (2.9-2) | §5.1; `AddQuestion.md` b y c.1; usuario, 2026-10-11 (`ADD-P3`) |

### 5.3 Desplegable (`ADD-P3`, aprobada por el usuario el 2026-10-11)

Elegir un valor entre una lista corta, sin cambiar de pantalla. Ninguna clase K1 a K7 lo resuelve sola: el `Desplegable` compone K3, lámina (§6) y K7, sin glifo ni token nuevo. Lo usa AddQuestion (`AddQuestion.md` a.2). La lista es en línea, no flotante: sin sombra ni telón, una capa flotante se separaría del formulario solo por su borde.

| Pieza | Clase | Regla |
|---|---|---|
| Disparador | K3 | Ancho completo; relleno `paso 3`; alto mínimo `paso 11`; el valor elegido (o el texto de ayuda) en `cuerpo` y `glifo-chevron` (chico, `tintaSec`) a la derecha: abajo cerrado, arriba abierto. Abierto está expandido y no seleccionado (regla 2.9-2): borde `linea`, sin relleno |
| Lámina | §6 | Cuerpo `superficie`, marco `linea` y cuatro marcas de esquina; en línea, a `paso 2` del disparador; empuja lo que sigue y no tapa campos |
| Región de scroll | — | Relleno `paso 1` (el contorno de foco, `paso 0.5` más `border-2`, no se recorta); alto máximo `paso 72` con la lista plana y `paso 80` con rótulos de grupo (5.2, `E-01`, 2026-10-13: el tope deja una fila cortada al pie, ver «Alto»); scroll vertical propio con indicador visible, que no se encadena a la página |
| Rótulo de grupo | — | Opcional. Relleno vertical `paso 2` y horizontal `paso 3`; fondo `fondo`; filete inferior `filete`; `rotulo` en `tintaSec`; con la marca de parcial de §12.2 delante, separada `paso 1.5`. No es un control |
| Fila | K7 | Ancho completo; alto mínimo `paso 11`; relleno vertical `paso 2` y horizontal `paso 3`; filete inferior `filete`, salvo en la última; el nombre salta de línea y no se abrevia. Elegida: regla 2.9-10 |

| Aspecto | Regla |
|---|---|
| Abrir | Toque, clic, Enter, Espacio o flecha abajo o arriba sobre el disparador. La lámina aparece en línea, sin animación, y el foco pasa a la fila elegida (a la primera si no hay elegida) |
| Cerrar | Tocar el disparador abierto; elegir una fila (el foco vuelve al disparador); Escape o Tab y Shift+Tab (sin cambiar el valor; con Tab el foco sigue el orden de DOM). Tocar otro control con puntero no cierra: cerrar movería el formulario bajo el dedo |
| Elegir | Toque, Enter o Espacio sobre una fila: llama una vez a `alCambiar(valor)`. Las flechas no cambian el valor (es la diferencia con K4, regla 2.9-7) |
| Al abrir | Si la fila elegida no está a la vista con su contorno de foco, la región se desplaza hasta alinear al borde superior la fila dos lugares antes de la elegida: la elegida queda tercera, con dos filas de contexto arriba (5.2, `E-01b`, aprobado por el usuario, 2026-10-13; antes la dejaba centrada). Los rótulos de grupo no cuentan como fila. Con la elegida a la vista, la región queda arriba. Si el desplazamiento llega al final de la lista, la región se detiene ahí. Si la lámina no entra en la ventana, la página se desplaza lo mínimo para mostrarla completa |
| Alto | El del contenido hasta `paso 72` (288 px) con la lista plana y `paso 80` (320 px) con rótulos de grupo; con más, scroll vertical propio. El tope deja una fila cortada al pie, con su línea de texto partida, que avisa que hay más (5.2, `E-01`, 2026-10-13; antes, `paso 80` en los dos casos). La cuenta está en `tokens.md` c.3. Rige con la lista abierta arriba o alineada a fila («Al abrir») y con filas de un renglón; con nombres de dos renglones el corte cae donde caiga y queda solo el indicador de scroll (límites medidos: `AddQuestion.md` j). Sin posición pegajosa: los rótulos de grupo se desplazan con la lista |
| Deshabilitado | El disparador sin toque, hover ni foco (borde `filete`; texto y chevron `inactivo`); si estaba abierto, cierra |
| Fuera de alcance | Multiselección, buscador (se reabre con más de unas 40 opciones) y opciones con ilustración |

| Dónde | Tecla | Efecto |
|---|---|---|
| Disparador | Enter, Espacio, Flecha abajo, Flecha arriba | Abre; el foco pasa a la fila elegida |
| Disparador | Tab | Sigue al control siguiente: la lista cerrada no tiene paradas |
| Lista | Flecha abajo, Flecha arriba | Foco a la fila siguiente o anterior, saltando rótulos y filas deshabilitadas; sin vuelta en los extremos |
| Lista | Inicio, Fin | Primera y última fila |
| Lista | Re Pág, Av Pág | Siete filas hacia arriba o abajo, sin pasar del extremo |
| Lista | Enter, Espacio | Elige la fila con foco, cierra y devuelve el foco al disparador |
| Lista | Escape | Cierra sin cambiar el valor y devuelve el foco al disparador |
| Lista | Letra o cifra | Salta a la siguiente fila cuyo nombre empieza con lo tipeado, sin distinguir mayúsculas ni tildes; el búfer se vacía tras 800 ms y, con el búfer activo, Espacio se agrega al búfer |
| Lista | Tab, Shift+Tab | Cierra sin cambiar el valor |
| Cualquiera | Con Alt, Ctrl o Meta | No se actúa (Alt+← y Cmd+← son «atrás» del navegador) |

El foco sigue a la fila activa: dentro de la lista hay una sola parada de Tab. La selección cambia solo con Enter, Espacio o toque.

| Pieza | Rol | Nombre | Estado |
|---|---|---|---|
| Disparador | `button` con `aria-haspopup="listbox"` y `aria-controls` hacia la lista | «{campo}: {valor}» | `aria-expanded`; `aria-disabled` si está deshabilitado |
| Lista | `listbox` | El nombre del campo | — |
| Rótulo de grupo | `group` que contiene sus filas | El texto del rótulo | — |
| Fila | `option` | El nombre del valor | `aria-selected` (la elegida); `aria-disabled` si corresponde |
| Chevron, marca de parcial, marcas de esquina | Decorativos | — | `aria-hidden`, `accessibilityElementsHidden` |

Al elegir, el foco vuelve al disparador y el lector de pantalla anuncia su nombre nuevo: ese es el aviso del cambio, sin región viva. Con puntero, la rueda desplaza la lista sin arrastrar la página al llegar a un extremo y el hover dibuja el contorno `linea` en la fila. La lámina no contiene campos: no abre el teclado virtual.

---

## 6. Lámina o tarjeta con marcas de esquina

La usan: lámina y tarjetas de MateriaSelect, tarjeta de materia de Home, tarjeta de resultado y trío de Results, tarjeta global de Stats.

| Elemento | Frente | Fondo | Borde | Paso | Notas |
|---|---|---|---|---|---|
| Cuerpo | — | `superficie` | `linea`, `border` | — | N1, N2 |
| Marca de esquina | — | — | `linea`, `border-2`, solo los dos lados que miran hacia afuera | Lado `paso 2`; sobresale `paso 1` | Cuatro por tarjeta; decorativas (`aria-hidden`, `accessibilityElementsHidden`). El margen lateral `paso 5` les deja lugar |
| Divisor interno | — | — | `filete`, `border` | — | X1, X2. Decorativo |

---

## 7. Anchos (D10)

### 7.1 Teléfono y tablet (bajo el corte `escritorio`)

Rige bajo el corte `escritorio` (1024 px): teléfono y tablet. Una sola columna. Nada se estira a todo el ancho. El orden vertical del teléfono se conserva. Es la disposición que implementaron las tareas 3.x; desde el corte rige §7.2 (`ESC-P0`, aprobada el 2026-10-11).

| Ancho | Columna | Alineación | Fondo | Barras a sangre |
|---|---|---|---|---|
| 390 px (teléfono) | Ancho completo menos margen lateral `paso 5` | — | `fondo` | Barra interna y barra inferior del quiz: a ancho completo |
| 768 px (tablet) | Una columna; ancho máximo `max-w-columna` | Centrada en horizontal; anclada arriba | `fondo` a todo el ancho | Filete a todo el ancho; contenido dentro de la columna |
| 1024 px y más (escritorio) | Rige §7.2: `lectura`, `hoja` o `hoja-amplia` según la superficie | Centrada en horizontal; anclada arriba | `fondo` a todo el ancho | Filete a todo el ancho; contenido dentro de la hoja |
| 360 px y 320 px (teléfono angosto) | Ancho completo menos margen lateral `paso 5` | — | `fondo` | Igual que 390 px |

| Regla | Detalle |
|---|---|
| Ancho mínimo | Sin recorte ni scroll horizontal desde 320 px (C3 de `CONVENCIONES.md`). Los textos, las tarjetas y los filtros saltan de línea; ningún control baja de `paso 11` ni queda a menos de `paso 2` de su vecino |
| Fichas | Cada ficha lista en su tabla de anchos lo que salta de línea o cambia a 360 px y 320 px. Lo que no figura ahí no cambia respecto de 390 px |
| Token de ancho | `columna` (`tokens.md` c.3 y d.1), clase `max-w-columna`. Ninguna ficha usa otra clase `max-w-*` de Tailwind que no sea un token de `tokens.md` |
| Otro ancho | Los de escritorio son otros tokens con nombre propio (`tokens.md` c.4), no variantes de `columna` |
| Sin segunda columna | Rige bajo el corte `escritorio` (teléfono y tablet). Desde el corte deja de valer: §7.2 |
| Texto | Mismo paso tipográfico en todos los anchos |
| Tarjetas y lámina | Crecen con la columna; el campo de filamentos conserva su alto (§8) |
| Apaisado en teléfono | Con ancho de 768 o más aplica la fila de tablet |

### 7.2 Escritorio · `ESC-P0` (tarea 3.10, aprobada por el usuario el 2026-10-11)

Pedido del usuario (2026-10-11): «La UI debería adaptarse también a un monitor clásico horizontal». Con la columna `columna`, en 1920 px quedaba más de tres cuartos del ancho vacío.

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Rige desde el corte `escritorio`; bajo el corte rige §7.1, que es lo que implementaron las tareas 3.x. 3.11 aplica esta sección |
| Cortes | `escritorio` desde 1024 px y `amplio` desde 1440 px (`tokens.md` c.4). El criterio es el ancho de la ventana, no el contenido medido |
| Revisado | 1024 (el corte), 1280, 1366 × 768 y 1920 × 1080. Figuras E01 a E10 de la maqueta, a 1366 y 1920 px en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| No cambia | Teléfono y tablet; flujos, datos, gestos y copy; orden de DOM; color, tipografía, grosores y glifos; objetivos de `paso 11`; estados de control (§5); áreas seguras |
| Aprobación | Cada `ESC-P1` a `ESC-P12` se aprobó por separado (sección «Escritorio» de su ficha); todas dependen de `ESC-P0`. El usuario aprobó `ESC-P0` a `ESC-P8` y `ESC-P10` a `ESC-P12` el 2026-10-11 y rechazó `ESC-P9`: AddQuestion va en una columna `lectura`, como el quiz |

**Composición.**

| Elemento | Regla |
|---|---|
| Hoja | El contenido va centrado en un ancho máximo con nombre: `lectura`, `hoja` o `hoja-amplia` (tabla de superficies). Margen lateral `paso 8`. Fondos y filetes de barra a todo el ancho |
| Regiones | Una región **lateral** de ancho fijo `lateral` y una **principal**, flexible, separadas por `paso 8` y alineadas arriba. Entre sus bloques apilados rige la separación vertical de a.1 de cada ficha. Sin región lateral, el contenido ocupa la hoja de su superficie: `lectura` en el quiz y en AddQuestion, y `hoja` o `hoja-amplia` en TopicSelect |
| Rejilla | Celdas de igual ancho separadas por `paso 4`: 2 columnas desde `escritorio` y 3 desde `amplio`. Orden de lectura fila a fila |
| Listas de filas | Temas, «Más falladas» y, desde `amplio`, filas por tema de Estadísticas: fluyen por columnas separadas por `paso 8` (no `paso 4`: eso es la rejilla de celdas). El orden baja por la primera columna y sigue por la siguiente |
| Barras | HeaderMarca, barra interna y barra del quiz: filete y fondo a todo el ancho; el contenido, dentro de la hoja de la superficie, con el alto de teléfono (D6: HeaderMarca igual en MateriaSelect y Home) |
| Barra inferior del quiz | Fija abajo, a todo el ancho; el botón mide `lectura` |
| Tarjetas y paneles | Llenan su celda o su región |
| Campo de filamentos | Solo en la región lateral de MateriaSelect: se estira 0,92× (`tokens.md` c.4), `encuadre` sin cambio |

**Orden, teclado y foco.**

| Aspecto | Regla |
|---|---|
| Orden de DOM | El del teléfono, sin excepción. La región lateral antecede a la principal en el DOM cuando va a la izquierda y la sigue cuando va a la derecha (Ajustes): el orden visual, de izquierda a derecha y de arriba abajo, es el orden de DOM |
| Foco | Tab recorre el orden de DOM, que es el visual: sin saltos hacia atrás. El contorno `foco` (§5.1) no se recorta: ninguna región ni celda corta con `overflow` |
| Lectores de pantalla | Las regiones son contenedores de disposición, sin rol ni nombre accesible propios y sin paradas nuevas. Nada se oculta ni cambia de orden |
| Hover | Solo con puntero (§5.1) y sin cambio de layout: el hueco entre celdas (`paso 4`) supera al contorno de hover |
| Objetivos | `paso 11` como mínimo y `paso 2` entre controles adyacentes: escritorio no los reduce (D10) |
| Reflujo | Bajo el corte `escritorio` rige §7.1: sin recorte ni scroll horizontal desde 320 px, también con zoom del navegador |
| Anclado | Ninguna región se ancla (sin posición pegajosa): todo se desplaza con la página, como en tablet |

**Superficies.**

| Superficie | Contenido | Disposición en escritorio | Desde amplio | Id |
|---|---|---|---|---|
| MateriaSelect | `hoja`; `hoja-amplia` | Lateral: lámina y nota del creador. Principal: rejilla de 2 columnas y, debajo, la regla corta y el pedido de donación | Rejilla de 3 columnas | `ESC-P1` |
| Home | `hoja`; `hoja-amplia` | Lateral: tarjeta de materia y banner de banco reducido. Principal: «Plano / Acciones», las seis acciones en una columna y la nota de privacidad | Acciones en 2 columnas | `ESC-P2` |
| TopicSelect | `hoja`; `hoja-amplia` | Sin región lateral: el panel con sus grupos (de uno a tres: fuente, parcial y temporizador; `TOPIC-P6`) en una fila, la mezcla a ancho de hoja y los temas en 2 columnas con flujo por columnas. Modo examen: tarjeta «Modo Examen» centrada, con tope `lectura` | Temas en 3 columnas | `ESC-P3` |
| Quiz y examen en curso | `lectura` | Una columna; barras y botón «Siguiente» al ancho de `lectura` | Sin cambio | `ESC-P4` |
| Results | `hoja` | Lateral: tarjeta de resultado. Principal: trío, pedido de donación y los tres botones, apilados y en su orden | Sin cambio | `ESC-P5` |
| Revisión | `hoja` | Lateral: encabezado, «Volver» y filtro. Principal: tarjetas de respuesta y botones finales. Misma hoja que el resumen de Results | Sin cambio | `ESC-P6` |
| Stats | `hoja`; `hoja-amplia` | Lateral: tarjeta global, «Por tema» y leyenda. Principal: filas por tema. Debajo, a ancho de hoja: «Más falladas» en 2 columnas | Filas por tema en 2 columnas; falladas en 3 | `ESC-P7` |
| Settings | `hoja` | Principal: Cuestionario, Mis preguntas y Tus datos. Lateral, a la derecha: «Acerca de» | Sin cambio | `ESC-P8` |
| AddQuestion | `lectura` | Una columna, como el quiz: tema (desplegable, §5.3), enunciado, opciones, explicación y «Guardar pregunta», en su orden; la barra, a todo el ancho | Sin cambio | — (`ESC-P9` rechazada) |
| DonationBox | La de su región | Llena su región; en Results, la principal | Sin cambio | `ESC-P10` |
| Banners | La de su región | Nota del creador y banner en la región lateral; privacidad al pie de la principal | Sin cambio | `ESC-P11` |
| Estados vacíos | La de su pantalla; lámina en `lectura` | Barra interna en la hoja de su pantalla (no salta al llegar los datos); lámina vacía en una columna `lectura`, centrada y anclada arriba | Sin cambio | `ESC-P12` |

**Qué cambia de lugar (D10).** Todo lo demás conserva su lugar relativo del teléfono.

| Elemento | Teléfono | Escritorio |
|---|---|---|
| Lámina y nota del creador (MateriaSelect) | Arriba de la lista | A la izquierda de la lista; la nota sigue debajo de la lámina |
| Tarjeta de materia y banner (Home) | Arriba de las acciones | A la izquierda de las acciones |
| Grupos del panel de filtros (TopicSelect) | Apilados | En una fila; el panel sigue arriba de la mezcla y de los temas |
| Lista de temas (TopicSelect) | Una columna | Columnas, en el mismo orden |
| Tarjeta de resultado (Results) | Arriba del trío | A la izquierda del trío, del pedido de donación y de los botones; el pedido sigue entre el trío y los botones |
| Tarjeta global y leyenda (Stats) | Arriba de las filas | A la izquierda de las filas |
| «Acerca de» (Settings) | Debajo de las demás secciones | A la derecha de las demás secciones |
| Encabezado, «Volver» y filtro (Revisión) | Arriba de las tarjetas | A la izquierda de las tarjetas; los botones finales siguen al final de la lista |

| Propuestas de §7.2 | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P0` | Cortes `escritorio` y `amplio`, tokens `lectura`, `lateral`, `hoja` y `hoja-amplia`, margen lateral `paso 8`, regiones y rejilla de esta sección; la regla «sin segunda columna» deja de valer desde el corte | Pedido del usuario (2026-10-11): Umami muestra mucho tráfico de Windows de escritorio, y en 1920 px la columna de `columna` deja más de tres cuartos del ancho vacío. Se usa el ancho sin tocar flujos, datos ni gestos | visual | aprobada (usuario, 2026-10-11) |
| `ESC-P9` | Tema en una columna izquierda de AddQuestion y el resto del formulario en una derecha | Respondía a `ADD-P1` («la lista de temas es lo más alto de la pantalla»). Con `ADD-P3` el tema mide una fila y la columna izquierda queda casi vacía | uso | **rechazada** (usuario, 2026-10-11) |

---

## 8. Dimensiones de componente

Pasos que fijan tamaños de componente. Todos figuran en `tokens.md` c.3: los pasos `11`, `12`, `16`, `20`, `24`, `28`, `72` y `80` se aceptaron como parte de la escala por defecto y están en la lista «en uso» con su rol (`80`: `ADD-P3`, 2026-10-11; `72`: `E-01`, 2026-10-13).

| Componente | Dimensión | Paso |
|---|---|---|
| Fila de control y objetivo táctil mínimo | Alto (y ancho de cuadrados) | `paso 11` |
| Opción del control de tema | Alto útil; el contenedor suma su `border` arriba y abajo | `paso 11` |
| Botón «Cambiar materia» sin texto (Home, menos de 360 px; §1.1) | Lado | `paso 11` |
| Cuadro del glifo de acción (Home) | Lado | `paso 10` |
| Glifo grande (volver, cerrar, siguiente, acción) | Lado | `paso 6` |
| Glifo chico (marcas inline, chevron, reloj, origen) | Lado; mismo viewBox que el grande | `paso 4` |
| Glifo de estado vacío (`Vacios.md` a.2) | Lado; el trazo se compensa para quedar en el grosor de c.2 | `paso 12` |
| Celda de ilustración en tarjeta de selector | Ancho | `paso 16` |
| Ilustración en tarjeta de selector | Lado | `paso 12` |
| Celda de ilustración en tarjeta de materia (Home) | Ancho | `paso 24` |
| Ilustración en tarjeta de materia (Home) | Lado | `paso 16` |
| Campo de filamentos | Alto | `paso 28` |
| Regla graduada | Alto | `paso 2.5` |
| Casilla de progreso del quiz | Alto | `paso 2.5` |
| Casilla correcta de la tira de resultados | Alto | `paso 6` |
| Casilla incorrecta de la tira de resultados | Alto | `paso 3` |
| Barra de estadísticas | Alto | `paso 2` |
| Marca de umbral en la barra | Alto | `paso 3.5` |
| Celda de letra de una opción | Ancho | `paso 11` |
| Valor del temporizador | Ancho mínimo | `paso 20` |
| Relleno inferior del scroll del quiz | Alto, más área segura inferior | `paso 24` |
| Botón de acción grande, K1 o K2 (Results, Quiz «Siguiente», TopicSelect «Comenzar examen», AddQuestion «Guardar») | Relleno vertical; el alto resultante supera `paso 11` | `paso 3.5` |
| Botón estándar, K1, K2 o K3 de acción (Banners, Vacíos, Revisión, Settings, Home, AddQuestion «Agregar opción») | Alto mínimo | `paso 11` |
| Botón, relleno horizontal | Por defecto | `paso 4` |
| Botón «Cambiar materia» con texto (Home, desde 360 px; §1.1) | Relleno horizontal | `paso 3` |
| Botón, relleno horizontal ampliado («Comenzar examen» de TopicSelect y acción de Vacíos) | Relleno horizontal | `paso 8` |
| Filtro K4 (TopicSelect, Revisión) y opción del segmentado (Settings) | Relleno horizontal; alto mínimo `paso 11` | `paso 3` |
| Disparador del desplegable (K3, AddQuestion) | Relleno en las cuatro caras; alto mínimo `paso 11` | `paso 3` |
| Fila del desplegable (K7) | Relleno vertical; relleno horizontal; alto mínimo `paso 11` | `paso 2`; `paso 3` |
| Región de scroll del desplegable | Relleno; alto máximo | `paso 1`; `paso 72` con la lista plana, `paso 80` con rótulos de grupo (`E-01`) |
| Tarjeta navegable K6 | Sin relleno propio: el contenido fija el suyo (tarjeta de materia, `MateriaSelect.md` a.3; tarjeta de mezcla, vertical `paso 3` y horizontal `paso 3.5`) | — |
| Glifo de una marca de estado con paso `display` (porcentaje de Results y de Estadísticas) | Lado | `paso 6` |

Todos los glifos comparten un viewBox (spec de 1.4). El componente mantiene el grosor de c.2 a cualquier lado: `stroke-width` = 1,5 × lado del viewBox / lado en px (`CONVENCIONES.md`, CD-9).

Los valores del boceto se trasladan al paso más cercano de la escala (`tokens.md` c.3, «Valor del boceto» y «Paso final»): es traslado de medida, no propuesta. Lo que sí cambia el aspecto o el uso va a §11 y a la sección f de cada ficha.

---

## 9. Inventario de glifos

Un id por glifo; se dibujan en 1.4 (`glifo-eliminar` en 1.4b; `glifo-pausar` y `glifo-reanudar`, de `BAN-P2`, en 3.14b), sin relleno, en `currentColor`, en un único `viewBox 0 0 16 16` (grande, chico y vacío son el mismo archivo) y con el trazo de c.2 compensado por el componente (`svg/glifos/NOTAS-GLIFOS.md` §1 y §3). Cada emoji o símbolo de texto que la interfaz muestra hoy tiene su glifo: ninguno se retira solo con texto (spec `design-system`, «Interfaz sin emojis»). El texto puede acompañar al glifo, no lo reemplaza. La fuente del inventario es `rg` de emojis y símbolos en `src/screens`, `src/components` y `App.js`. La columna «Reemplaza» es la única de las fichas que nombra emojis.

| Criterio de color | Detalle |
|---|---|
| Qué conserva | El color de un glifo conserva la función que cumplía el símbolo que reemplaza: estado, acción, aviso, origen o decoración |
| Con qué | Solo tokens de `tokens.md` a.1; ningún glifo introduce un token nuevo |
| Estética | Color solo donde hay un estado semántico o la marca (`acento`); el resto va en `tinta` o `tintaSec`. El glifo toma el color del texto o del estado del control que lo contiene |
| Par de contraste | Cada glifo cita su fila de `tokens.md` e: N# para glifos (≥ 3:1), T# cuando el par ya está medido como texto, X# para inactivos exentos |

| Id | Reemplaza | Lo usa | Tamaño | Función | Color y par | Por qué este color |
|---|---|---|---|---|---|---|
| `glifo-volver` | `←` (`HomeScreen.js:47`, `App.js:181`, `ResultsScreen.js:168`) | Home (botón «Cambiar materia»; bajo 360 px, único contenido del botón: §1.1); barra interna (TopicSelect, Stats; AddQuestion y Settings: `AddQuestion.md` a.1, `Settings.md` a.1); Results, revisión («Volver» de arriba con `REV-P2` y «Volver» final: `Revision.md` b) | grande | Acción: volver a la pantalla anterior | `tinta` sobre `fondo` (N5); presionado `fondo` sobre `tinta` (T7) | Era la flecha de texto del botón, del color de su texto. Es navegación sin carga de estado: `tinta` la deja al nivel del rótulo del botón y reserva el acento para marca e identidad |
| `glifo-chevron` | `›` (`HomeScreen.js:159`); `▲` y `▼` de los plegables (`SettingsScreen.js:110` y `158`), girado | Home (acciones); TopicSelect (filas de tema); Settings «Ver» y «Ocultar», girado (`Settings.md` a.3); AddQuestion (disparador del tema, abajo cerrado y arriba abierto, girado: `AddQuestion.md` a.2) | chico | Decoración funcional: la fila abre otra pantalla; en Settings, plegado o desplegado; en AddQuestion, lista cerrada o abierta | `tintaSec` sobre `fondo` (N19) y sobre `superficie` (N20); en Settings, `acento` sobre `superficie` (N18) | En listas es una señal secundaria: se ve sin competir con el nombre de la fila (`tinta`) y por eso va un escalón abajo. El plegable de Ajustes era texto de acento, una acción: conserva ese rol con `acento` |
| `glifo-cerrar` | `✕` (`QuizScreen.js:175`, `MateriaSelectScreen.js:92`, `ResultsScreen.js:263`, `AddQuestionScreen.js:203`) | Quiz (salir); nota del creador (`Banners.md` a.2) y pedido de donación (`DonationBox.md` a.2); AddQuestion, quitar opción (`AddQuestion.md` a.2) | grande, objetivo `paso 11` | Acción: salir, descartar o quitar | Quiz: `tinta` sobre `fondo` (N5). Notas: `tintaSec` sobre `superficie` (N20). Pedido de donación (`DON-P5`): `fondo` sobre `acentoBanda` (T22, N21). Quitar opción de AddQuestion: `tintaSec` sobre `fondo` (N19), fuera del campo (`AddQuestion.md` b) | En el quiz es la única salida visible y pierde el progreso, con confirmación: va en `tinta` y no en `error`, que está reservado a respuesta incorrecta y banda baja (a.1). Descartar una nota o quitar una opción es menor: un escalón abajo, `tintaSec` |
| `glifo-siguiente` | `→` (`QuizScreen.js:323`) | Quiz («Siguiente», «Ver resultados») | grande | Acción: avanzar | `fondo` sobre `tinta` (T7, el par de N5) | Vive dentro del botón relleno (K1): hereda el color del texto y se lee con él como una sola acción primaria |
| `glifo-acierto` | `✓` (`QuizScreen.js:262`, `ResultsScreen.js:105` y `138`, `AddQuestionScreen.js:175` y `186`) | Quiz (opción correcta); Results (marca del tramo alto, trío, revisión: `Revision.md` a.3); Stats (banda alta, leyenda); AddQuestion (correcta marcada: `AddQuestion.md` a.2); Settings («Mis preguntas», correcta de cada tarjeta: `Settings.md` a.4) | chico | Estado: correcta, banda alta | `acierto` sobre `fondo` (N9), `superficie` (N10) y `aciertoFondo` (N11) | Verde sobrio del boceto y el mismo token del marco y del relleno de la opción correcta: no suma un color. No depende solo del color: la silueta (tilde) y el texto «Correcta» lo sostienen en escala de grises (spec) |
| `glifo-error` | `✗` (`QuizScreen.js:266`, `ResultsScreen.js:105` y `139`) | Quiz (opción incorrecta); Results (marca del tramo bajo, trío, revisión: `Revision.md` a.3); Stats (banda baja, leyenda, «Más falladas») | chico | Estado: incorrecta, banda baja | `error` sobre `fondo` (N12), `superficie` (N13) y `errorFondo` (N14) | Rojo sobrio del boceto, reservado a respuesta incorrecta y banda de menos de 60. La silueta (aspa) y la palabra «Incorrecta» sostienen el estado sin color |
| `glifo-intermedia` | Ninguno: hoy la banda lleva tono de aviso sin marca (`StatsScreen.js:195`, `ResultsScreen.js:299`) | Stats (banda 60–79, leyenda); Results (tramo medio) | chico | Estado: rendimiento intermedio | `intermedia` sobre `fondo` (N15) y `superficie` (N16) | El ámbar de `main` no existe en la paleta Plancha. El acero separa la banda del verde y del rojo en protanopía y deuteranopía (`tokens.md` a.3); la forma (dos trazos) hace el resto |
| `glifo-menos` | `−` (`TopicSelectScreen.js:314`) | TopicSelect (temporizador) | chico | Acción: reducir el tiempo | `tinta` sobre `superficie` (N6); en el extremo, `inactivo` sobre `superficie` (X5, exento) | Acción neutra dentro de un cuadrado de marco `linea`. El extremo se apaga con `inactivo` y borde `filete` (estado «deshabilitado»): no depende solo del color, porque el borde también cambia |
| `glifo-mas` | `+` (`TopicSelectScreen.js:326`, `AddQuestionScreen.js:213`) | TopicSelect (temporizador); AddQuestion («Agregar opción»: `AddQuestion.md` a.2) | chico | Acción: aumentar el tiempo | Igual que `glifo-menos` | Igual que `glifo-menos` |
| `glifo-claro` | ☀️ (`HeaderMarca.js:41`) | Control «Claro \| Oscuro» (HeaderMarca: MateriaSelect y Home), opción «Claro» | chico | Estado y acción: modo claro activo y elegirlo | El del texto de su opción: `tinta` sobre `fondo` (N5); seleccionada, `fondo` sobre `tinta` (T7) | El emoji era el indicador del `Switch`, con su propio color. Ahora el estado lo da la inversión `tinta`/`fondo` del segmento y el glifo hereda ese color: el control no suma un segundo indicador de color que compita con los estados semánticos |
| `glifo-oscuro` | 🌙 (`HeaderMarca.js:41`) | Control «Claro \| Oscuro» (HeaderMarca), opción «Oscuro» | chico | Estado y acción: modo oscuro activo y elegirlo | Igual que `glifo-claro` | Igual que `glifo-claro` |
| `glifo-explicacion` | 💡 (`QuizScreen.js:295`, `ResultsScreen.js:148`) | Quiz (rótulo «Nota / Explicación»); Results, revisión (`Revision.md` a.3) | chico | Aviso: dato adicional sobre la pregunta | `acento` sobre `superficie` (N18) | La bombilla marcaba «dato extra». En Plancha ese rol es de la nota, cuyo rótulo y borde izquierdo ya son `acento` (a.1): el glifo comparte color con su rótulo y la nota se lee como una pieza |
| `glifo-reloj` | ⏱ (`QuizScreen.js:191`) | Quiz (cuenta regresiva) | chico | Aviso: tiempo restante, alerta con menos de 120 s | `tinta` sobre `fondo` (N5); con menos de 120 s, `error` sobre `fondo` (N12) y marco `error`, `border-2` | En `main` el tiempo pasa a rojo claro bajo 120 s: `error` conserva ese aviso y el marco suma la señal sin color. Con tiempo de sobra el reloj es neutro para no competir con el enunciado |
| `glifo-reportar` | 🚩 (`QuizScreen.js:306`, `ResultsScreen.js:158`) | Quiz y examen en curso («Reportar pregunta», K7 sin marco desde `REV-3`: `Quiz.md` b); Results, revisión (`Revision.md` a.3) | chico | Aviso: señalar un problema en la pregunta | Quiz: `tinta` sobre `fondo` (N5). Revisión: `tinta` sobre `superficie` (N6) | La bandera roja avisaba de un problema. Acá es una utilidad secundaria que aparece junto a «Correcta» o «Incorrecta»: un glifo rojo se leería como otro estado de error de la respuesta. La forma y el texto llevan el aviso. Sin alternativa roja (`CONVENCIONES.md`, CD-14) |
| `glifo-origen-examen` | 📄 (`QuizScreen.js:219`) | Quiz (chip de origen `exam`) | chico | Origen: pregunta de examen real | `acento` sobre `superficie` (N18), en chip de marco `acento` | El examen real es la procedencia que más importa y toma el único color de marca. Marco y glifo del mismo color forman una pieza, y el fondo vacío lo separa de la generada |
| `glifo-origen-generada` | ✨ (`QuizScreen.js:222`) | Quiz (chip de origen `generated`) | chico | Origen: pregunta generada | `fondo` sobre `tinta` (T7, el par de N5), en chip relleno | D6 pide que una generada nunca se presente como de examen real: el chip va relleno en `tinta`, silueta opuesta al marco del examen, y no comparte color con él: la diferencia no depende del matiz |
| `glifo-origen-propia` | 👤 (`QuizScreen.js:225`) | Quiz (chip de origen `user`) | chico | Origen: pregunta del propio usuario | `tinta` sobre `superficie` (N6), en chip de marco `linea` | Es contenido del usuario: no certifica ni advierte, así que va neutro. Se distingue de las otras dos por silueta y texto, sin color |
| `glifo-practicar` | `practicar.png` (`HomeScreen.js:9`) | Home («Entrena Temas/Parciales») | grande, en cuadro de acción | Decoración funcional: identifica el destino de la acción | `tinta` sobre `superficie` (N6), en cuadro de marco `filete` | Los PNG de `main` eran a color y distintos por acción. El color no debe distinguir destinos, para eso está el título: los seis glifos van en `tinta` y se leen como un lote. La jerarquía entre acción primaria y secundarias la da el marco (`linea`, `border-2` frente a `borde`), no el glifo |
| `glifo-examen` | `examen.png` (`HomeScreen.js:10`) | Home («Modo examen») | grande, en cuadro de acción | Decoración funcional | Igual que `glifo-practicar` | Igual que `glifo-practicar` |
| `glifo-repasar` | `repasar.png` (`HomeScreen.js:11`); 🎯 (`TopicSelectScreen.js:180`) | Home («Repasar fallos»); TopicSelect, estado vacío de `failed` (`Vacios.md` a.2) | grande en cuadro de acción; en el estado vacío, `paso 12` | Decoración funcional | Igual que `glifo-practicar`; en el estado vacío, `tintaSec` sobre `superficie` (N20: la lámina vacía, `Vacios.md` b) | Igual que `glifo-practicar`. En el estado vacío es una ilustración sin acción: `tintaSec` la deja detrás del título (`tinta`) |
| `glifo-estadisticas` | `estadisticas.png` (`HomeScreen.js:12`); 📊 (`StatsScreen.js:97`) | Home («Mis estadísticas»); Stats, estado vacío (`Vacios.md` a.2) | grande en cuadro de acción; en el estado vacío, `paso 12` | Decoración funcional | Igual que `glifo-repasar` | Igual que `glifo-repasar` |
| `glifo-agregar` | `agregar.png` (`HomeScreen.js:13`) | Home («Agregar pregunta») | grande, en cuadro de acción | Decoración funcional | Igual que `glifo-practicar` | Igual que `glifo-practicar` |
| `glifo-ajustes` | `ajustes.png` (`HomeScreen.js:14`) | Home («Ajustes») | grande, en cuadro de acción | Decoración funcional | Igual que `glifo-practicar` | Igual que `glifo-practicar` |
| `glifo-aleatorio` | 🎲 (`TopicSelectScreen.js:205`) | TopicSelect («Todos los temas mezclados») | grande | Decoración funcional: identifica el modo de mezcla | `acento` sobre `superficie` (N18) | La mezcla es la acción destacada de la pantalla y su tarjeta ya lleva marco `acento`: el glifo comparte ese color para anclar la tarjeta, y el título sigue en `tinta` (T2) |
| `glifo-revisar` | 📋 (`ResultsScreen.js:220`) | Results («Revisar todas las respuestas») | chico | Acción: abrir el detalle respuesta por respuesta | `acento` sobre `superficie` (N18), como el texto del botón K2 de acento; presionado, `fondo` sobre `tinta` (T7) | El botón es la acción secundaria de acento del boceto: el glifo toma el color de su texto y se lee con él |
| `glifo-reintentar` | 🔄 (`ResultsScreen.js:228`) | Results («Volver a practicar») | chico | Acción: repetir la práctica | `fondo` sobre `tinta` (T7, el par de N5) | El botón es la acción primaria rellena (K1): el glifo hereda `fondo` y se lee con el texto |
| `glifo-inicio` | 🏠 (`ResultsScreen.js:236`) | Results («Inicio») | chico | Acción: volver al inicio | `tinta` sobre `superficie` (N6) | Acción terciaria neutra (K2 de marco `linea`): el glifo sigue al texto en `tinta` |
| `glifo-mensaje` | 👋 (`MateriaSelectScreen.js:86`) | MateriaSelect, nota del creador (`Banners.md` a.2) | chico | Aviso: mensaje informativo del creador | `acento` sobre `superficie` (N18) | La nota es el único bloque informativo de la pantalla de entrada y su rótulo y borde son `acento`: el glifo la acompaña. El saludo era cálido, sin función de alerta |
| `glifo-banco-reducido` | 📉 (`HomeScreen.js:129`) | Home, banner de banco reducido (`Banners.md` a.2) | chico | Aviso: el banco de la materia tiene menos preguntas | `acento` sobre `superficie` (N18) | Es un aviso informativo y no una falla: `error` lo haría parecer un problema de uso, e `intermedia` se confundiría con la banda de rendimiento. Va en `acento`, como la nota; la forma (tendencia descendente) y el texto llevan el aviso |
| `glifo-trofeo` | 🏆 (`ResultsScreen.js:260`) | Results, pedido de donación con resultado alto (`DonationBox.md` a.2) | chico | Decoración funcional: celebración del resultado | `fondo` sobre `acentoBanda` (T22, N21), delante del título de la banda del pedido (`DON-P5`, `DonationBox.md` b) | El texto celebratorio aparece desde `DONATION_WARM_SCORE` (80), que es el corte de la banda alta. El trofeo no usa `acierto`, reservado a la banda alta y a lo correcto (CD-8), ni suma un dorado fuera de paleta: va en `fondo` sobre la banda del pedido (5.2, `C-08`) |
| `glifo-guardar` | 💾 (`AddQuestionScreen.js:238`, `SettingsScreen.js:175`) | AddQuestion («Guardar pregunta»); Settings («Descargar respaldo») (`AddQuestion.md` b; `Settings.md` b) | chico | Acción: guardar o descargar | El del texto del botón: K1 `fondo` sobre `tinta` (T7) o K3 `tinta` sobre `superficie` (N6) | Era un adorno neutro delante del texto de un botón: el glifo toma el color del botón y no agrega matiz |
| `glifo-importar` | 📂 (`SettingsScreen.js:184`) | Settings («Importar respaldo») (`Settings.md` b) | chico | Acción: cargar un archivo | Igual que `glifo-guardar` | Igual que `glifo-guardar` |
| `glifo-correo` | ✉️ (`SettingsScreen.js:223`) | Settings («Reportar un error», `Settings.md` b); Banners, contacto del banner de banco reducido, solo con `BAN-P1` (`Banners.md` a.2) | chico | Acción: abrir un correo | `acento` sobre `fondo` (N17) o `superficie` (N18) | El enlace era de acento en `main`: el glifo conserva esa función de enlace de contacto con el mismo token que su texto |
| `glifo-externo` | `↗` (`SettingsScreen.js:230`) | Settings («Código fuente») (`Settings.md` b) | chico | Aviso: el enlace sale de la app | `acento` sobre `fondo` (N17) o `superficie` (N18) | Marca que el enlace abre otro sitio: va del color del enlace para leerse como parte de él |
| `glifo-eliminar` | `×` (`SettingsScreen.js:131`) | Settings, «Mis preguntas»: eliminar una pregunta propia (`Settings.md` b) | grande, objetivo `paso 11` | Acción: eliminar un dato guardado, con confirmación del sistema | `tintaSec` sobre `superficie` (N20); presionado, `fondo` sobre `tinta` (T7) | Es la única acción que borra un dato del usuario desde una tarjeta. Va en el mismo tono que descartar o quitar (`glifo-cerrar`) para no competir con el enunciado de la tarjeta, y se separa de él por silueta: borrar un dato guardado y descartar una nota no pueden leerse como la misma acción. No usa `error`, reservado a respuesta incorrecta, banda baja y validación (a.1); la confirmación del sistema ya advierte que no se puede deshacer |
| `glifo-pausar` | Ninguno: control nuevo de `BAN-P2` (`Banners.md` §3.14) | Banners, botón «Pausar» del pie de la región de avisos (`Banners.md` §3.14.2 y §3.14.7); bajo 360 px, único contenido del botón | chico | Acción: detener el avance automático de las notas | El del texto de su botón: K2 `tinta` sobre `superficie` (T2, N6); presionado, `fondo` sobre `tinta` (T7) | Es una acción neutra dentro de un botón de marco `linea`: el glifo toma el color del texto y no suma matiz. La palabra «Pausar» y la forma (dos verticales) llevan el significado; el glifo no usa color propio |
| `glifo-reanudar` | Ninguno: control nuevo de `BAN-P2` (`Banners.md` §3.14) | Banners, el mismo botón con el avance detenido: «Reanudar» | chico | Acción: retomar el avance automático | Igual que `glifo-pausar` | Igual que `glifo-pausar`: el botón conserva su lugar y su marco y cambian el glifo y el texto |

### Indicaciones de forma para 1.4

El dibujo lo decidió 1.4 dentro de estas reglas (`svg/glifos/NOTAS-GLIFOS.md`): un viewBox común para todos los glifos (el componente mantiene 1,5 px visibles a cualquier lado, `CONVENCIONES.md` CD-9), terminación cuadrada, ángulos rectos donde el motivo lo permita, un solo grosor (c.2).

| Glifo | Indicación |
|---|---|
| `glifo-volver`, `glifo-siguiente` | Flecha horizontal de trazo recto con punta en ángulo, las del boceto: volver apunta a la izquierda, siguiente a la derecha |
| `glifo-chevron` | Dos trazos en ángulo recto abiertos hacia la izquierda; el mismo glifo girado 90 y 270 grados sirve a los plegables y al disparador del desplegable |
| `glifo-cerrar` | Dos diagonales que se cruzan, la aspa del boceto |
| `glifo-acierto`, `glifo-error` | Las del boceto (tilde y aspa) |
| `glifo-intermedia` | Dos trazos horizontales paralelos: no se confunde con `glifo-menos` (un trazo) ni con tilde o aspa |
| `glifo-menos`, `glifo-mas` | Un trazo horizontal; dos trazos en cruz |
| `glifo-claro` | Círculo central y ocho trazos radiales cortos y rectos |
| `glifo-oscuro` | Creciente de trazo único, dos arcos que cierran en puntas; sin estrellas |
| `glifo-explicacion` | Bulbo de trazo simple con base de dos trazos horizontales cortos; sin rayos |
| `glifo-reloj` | Círculo con dos manecillas rectas en ángulo recto y un trazo corto arriba |
| `glifo-reportar` | Asta vertical y banderín rectangular de trazo simple |
| `glifo-origen-examen`, `glifo-origen-generada`, `glifo-origen-propia` | Tres siluetas distintas entre sí: hoja con esquina doblada, destello de cuatro puntas, busto de trazo simple |
| `glifo-practicar`, `glifo-examen`, `glifo-repasar`, `glifo-estadisticas` | Los cuatro del boceto: lista con casillas, hoja con renglones, diana concéntrica, ejes con tres barras |
| `glifo-agregar` | Sin dibujo en el boceto, mismo lenguaje del cuadro de acción: cuadrado de trazo con una cruz centrada |
| `glifo-ajustes` | Sin dibujo en el boceto, mismo lenguaje: dos reglas horizontales con un cursor cuadrado cada una (controles deslizantes), sin engranaje |
| `glifo-aleatorio` | Cuadrado de trazo con cinco puntos en disposición de dado |
| `glifo-revisar` | Tablilla rectangular con pinza superior y tres renglones; la pinza la separa de `glifo-examen` |
| `glifo-reintentar` | Dos flechas de trazo recto que cierran un lazo rectangular, en sentido horario |
| `glifo-inicio` | Casa de frente: techo a dos aguas de trazo recto y puerta rectangular |
| `glifo-mensaje` | Cuadro de diálogo rectangular con cola recta abajo a la izquierda y dos renglones |
| `glifo-banco-reducido` | Línea quebrada descendente con punta de flecha sobre un eje en L; distinta de las tres barras de `glifo-estadisticas` |
| `glifo-trofeo` | Copa de trazo recto: cuenco trapezoidal, dos asas rectangulares, pie y base |
| `glifo-guardar` | Cuadrado con la esquina superior derecha cortada, ventana superior y etiqueta inferior |
| `glifo-importar` | Carpeta de trazo recto: rectángulo con pestaña superior izquierda |
| `glifo-correo` | Sobre rectangular con solapa en V |
| `glifo-externo` | Cuadrado abierto en su esquina superior derecha y flecha diagonal que sale por ella |
| `glifo-eliminar` | Papelera de trazo recto: cuerpo trapezoidal con dos trazos verticales interiores, tapa horizontal más ancha que el cuerpo y asa corta sobre la tapa; sin aspa, para no confundirse con `glifo-cerrar` |
| `glifo-pausar` | Dos trazos verticales paralelos e iguales, de 11 u; no se confunde con `glifo-intermedia` (dos horizontales) |
| `glifo-reanudar` | Triángulo de trazo: lado vertical a la izquierda y punta a la derecha, diagonales a 45°; no se confunde con `glifo-siguiente` (flecha con asta) |

### Excepciones: sin glifo propio

Los dos únicos casos en que un emoji no recibe glifo del inventario.

| Reemplaza | Lugar | Qué ocurre | Motivo |
|---|---|---|---|
| 🏆, 🎉, 👍, 😬, 💪 (`ResultsScreen.js:293` a `304`, campo `emoji` de `getResultFeedback`) | Results | El campo se elimina del literal | No se renderiza hoy; la spec exige cero emojis en `src/screens/` |
| Íconos `icon` de materia, p. ej. 🧬 (`src/materias/*/metadata.js`, `MateriaSelectScreen.js:132`) | MateriaSelect y Home | La ilustración de materia (D3) ocupa su lugar | D3: el campo deja de usarse en la UI |

---

## 10. Copy común

| Dónde | Actual | Nuevo | Motivo |
|---|---|---|---|
| Control de tema | Emoji de sol o luna y `Switch` con rótulo accesible «Activar modo oscuro» | «Claro» y «Oscuro» (texto visible) con `glifo-claro` y `glifo-oscuro`; rótulo accesible del grupo «Modo oscuro» | D7 y spec «Interfaz sin emojis» |
| Logo | Imagen `logo.png` | Texto «pKapp» (`marca`), solo en el cajetín del selector | NOTAS.md; la marca es la misma |
| Flechas y símbolos de texto | `←`, `→`, `›` y los demás símbolos del inventario | Glifos de §9, con el texto que ya acompañaba | Reemplazo de símbolo |

---

## 11. Propuestas aprobadas (D10)

El usuario las aprobó el 2026-10-10 y rigen tal como están descritas. No hay variantes alternativas. La base de comparación es la de `design.md` D10: el boceto para lo visual, `main` para funciones, datos, copy y orden de uso.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| COMUN-P1 | La ilustración de cada materia (tarjeta del selector y tarjeta de materia de Home) se dibuja en `filamento`: tinta en claro y acero en oscuro. El boceto la dibuja en `tinta` | Una sola familia de trazo con el campo de filamentos (`tokens.md` a.1 y X3); en oscuro la ilustración baja de brillo frente al texto del nombre | visual | aprobada (usuario, 2026-10-10) |
| COMUN-P2 | Presionado: inversión `tinta`/`fondo` en toda clase de control (K1 a K7). Hover (solo web con puntero): contorno o borde `linea`. Foco de teclado: contorno `foco`, `border-2`, separado `paso 0.5`. El boceto es estático y no muestra estos estados | El presionado actual usa opacidad (`activeOpacity`) y el hover un halo con `rgba` (`webStyles.js`): ambos son transparencia, que el sistema excluye (`tokens.md` a.2). El foco cumple 3:1 (N7 y N8) | visual | aprobada (usuario, 2026-10-10) |
| `REV-3` (revisión 5.0b; lo que alcanza a esta ficha) | La regla 2.9-4 suma «K7 con texto de acción (reportar): `cuerpo` en `tinta`», y §9 registra que `glifo-reportar` va sobre `fondo` (N5) en el quiz y sobre `superficie` (N6) en la revisión. El resto de `REV-3` se fija en `Quiz.md`, `ExamenEnCurso.md` y `Revision.md`. Sin el cambio: «Reportar pregunta» como K3 de marco en el quiz y K7 en `cuerpo-fuerte` en la revisión | Reportar es una utilidad ocasional: sin marco y en regular queda un escalón por debajo de las opciones, de «Siguiente» y del enunciado, en el mismo escalón que descartar y eliminar. Conserva E2 y CD-14 (`tinta`) | visual | aprobada (usuario, 2026-10-12) |

No son propuestas: el control «Claro \| Oscuro» (D7, aprobado en el change), el traslado de medidas a la escala (§8) y los glifos que reemplazan a los emojis (pedido del usuario, 2026-10-10).

---

## 12. Distinción de 1.er y 2.do parcial (tarea 1.3)

`main` distingue el parcial de una pregunta con un par de pasteles (`parcial.1` y `parcial.2` de `src/theme/colores.js`). El par codifica información, no decora, y la paleta Plancha no tiene pasteles (`tokens.md` a.1; `REFERENCIAS.md`: nada colorido). El boceto lo deja solo en texto y `NOTAS.md` pregunta si necesita algo más. Esta sección responde para toda la app. Ningún dato ni corte cambia: el parcial sale de `question.parcial` (`primero` o `segundo`) y su rótulo de `materia.config.parciales`; hoy solo `anatomia` y `bcyt` tienen parciales.

### 12.1 Dónde aparece hoy

| Dónde | Archivo | Qué muestra | Cómo se distingue hoy |
|---|---|---|---|
| Quiz y examen en curso | `QuizScreen.js:200` a `212` | Insignia «1er Parcial» o «2do Parcial» sobre el tema, solo si la pregunta tiene `parcial` | Par de pasteles |
| Selector de tema, filtro | `TopicSelectScreen.js:263` a `291` | Filtro «Examen», «1er Parcial», «2do Parcial» (solo con `materia.config.parciales`) | Solo el texto |
| Selector de tema, modo examen | `TopicSelectScreen.js:156` a `159` | Texto del sorteo «…de {rótulo del parcial}» | Solo el texto |

No aparece en `Results`, la revisión, `Stats`, `Settings` ni `Home`.

### 12.2 Marca de parcial (`PAR-P1`)

| Pieza | Regla |
|---|---|
| Marca | Una fila de dos casillas, una por parcial de la materia. Si una materia sumara un tercer parcial, la regla se extiende a tres casillas con la tercera llena |
| Casilla llena | La del parcial de la pregunta: la primera con `primero`, la segunda con `segundo` |
| Casilla vacía | La otra |
| Lectura | Por posición: la casilla llena a la izquierda es el 1.er parcial y la de la derecha, el 2.do. Los dos llevan la misma cantidad de tinta: ninguno se lee como «más» que el otro, porque es una categoría y no un orden de mérito |
| Medidas | Casilla de lado `paso 2.5`, separadas por `paso 0.5`; la vacía con marco `border` y la llena con relleno; la fila se centra en vertical con el texto. Es el lenguaje de las casillas de progreso del quiz (`Quiz.md` b) |
| Color | El del texto de su contenedor: `tinta` sobre `fondo` o `superficie`, y `fondo` sobre `tinta` en un contenedor seleccionado. Nunca `acierto`, `error` ni `intermedia`: son estados de rendimiento |
| Texto | El de la materia, «1er Parcial» o «2do Parcial» (`materia.config.parciales[].label`), en `rotulo`; el paso lo muestra en mayúsculas. La marca acompaña al texto, no lo reemplaza |
| Sin parcial | Pregunta sin `parcial`, o materia con `parciales: null`: ni marca ni texto, y la fila de contexto no deja hueco |
| Accesibilidad | La marca es decorativa (`aria-hidden`, `accessibilityElementsHidden`); el nombre accesible es el texto |
| Pares | Marca `tinta` sobre `fondo` (N5) y sobre `superficie` (N6); `fondo` sobre `tinta` (T7); texto `tinta` sobre `fondo` (T1) |

### 12.3 Aplicación

| Dónde | Cómo se aplica | Tokens y pasos |
|---|---|---|
| Quiz y examen en curso: insignia (`Quiz.md` a.1, bloque 2; `ExamenEnCurso.md`) | A la izquierda de la fila de contexto, encima del chip de origen; marca y texto en una línea, separados por `paso 1.5`; margen inferior `paso 1` hasta el chip. Sin marco ni relleno | Texto `rotulo`, `tinta` sobre `fondo` (T1); marca `tinta` (N5) |
| Selector de tema: filtro de parcial (`TopicSelect.md` a.3, bloque 3; `PAR-P2`) | Marca delante del texto de cada filtro de parcial, separada por `paso 2`; «Examen» no lleva marca | K4 de `TopicSelect.md` b y c: en reposo, marca `tinta` sobre `superficie` (N6); seleccionado, marca `fondo` sobre `tinta` (T7). Alto `paso 11` y estados sin cambio |
| Selector de tema: sorteo del modo examen | Sin marca: es una oración («…de 1er Parcial») | `TopicSelect.md` e, sin cambio |
| Selector de tema de AddQuestion: rótulo de grupo del desplegable (`AddQuestion.md` a.2; `ADD-P3`) | Marca delante del rótulo de cada parcial, separada `paso 1.5`; solo cuando el parcial de cada tema sea dato (si no, lista plana y sin marca) | `tintaSec` sobre `fondo` (N19), en banda `fondo` con filete inferior `filete`; no es un control: sin estados |

La insignia no es un control: no tiene hover, presionado, foco ni deshabilitado. El filtro conserva la matriz de `TopicSelect.md` c.

### 12.4 Propuestas aprobadas (D10)

El usuario las aprobó el 2026-10-10 y rigen tal como están descritas en 12.2 y 12.3. No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| PAR-P1 | La insignia de parcial del quiz y del examen en curso pasa del par de pasteles a una marca de dos casillas más el texto de siempre, sin color propio | `parcial.1` y `parcial.2` no existen en Plancha y la paleta excluye lo colorido. El par comunica una categoría que el texto solo no hace evidente de un vistazo; la posición de la casilla llena sí, sin color y con la misma tinta en los dos | visual | aprobada (usuario, 2026-10-10) |
| PAR-P2 | El filtro de parcial del selector lleva la misma marca delante del texto | La marca que el usuario elige en el selector es la que ve en la pregunta. Hoy el filtro no lleva pastel y se distingue solo por texto | visual | aprobada (usuario, 2026-10-10) |
