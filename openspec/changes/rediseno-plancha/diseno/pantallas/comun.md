# Fichas comunes · tarea 1.2

| Campo | Valor |
|---|---|
| Change | `openspec/changes/rediseno-plancha` (D6, D7, D9, D10) |
| Rama | `rediseno` |
| Insumos | `tokens.md` (1.1), `hibrido.html`, `NOTAS.md`, `src/components/HeaderMarca.js`, `src/screens/*Screen.js`, `App.js` |
| Lo usan | `MateriaSelect.md`, `Home.md`, `TopicSelect.md`, `Quiz.md`, `Results.md`, `Stats.md` |
| Resuelto en 1.3 | `AddQuestion.md`, `Revision.md`, `ExamenEnCurso.md`, `Settings.md`, `DonationBox.md`, `Vacios.md` y `Banners.md`; la distinción de parciales está en §12. Las referencias de las fichas de 1.2 apuntan a archivo y sección |
| Glifos | Se nombran en §9, con su función y el porqué de su color; se dibujan en 1.4 |
| Propuestas | §11 (`COMUN-P1`, `COMUN-P2`) y sección f de cada ficha. Aprobadas por el usuario el 2026-10-10 (D10). Lo conservado de `main` va en la sección h de cada ficha |
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
| `COMUN-P#`, `MATERIA-P#`, `HOME-P#`, `TOPIC-P#`, `QUIZ-P#`, `RESULTS-P#`, `STATS-P#` | Propuestas aprobadas por el usuario el 2026-10-10 (D10): §11 y sección f de cada ficha. Los ids son únicos en todo el change; 1.3 usa sus propios prefijos |

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
| Relleno | Superior, inferior y lateral | Superior: área segura superior más `paso 3.5`; inferior `paso 3.5`; lateral `paso 5` | D10, áreas seguras |
| Fila | Slot `izquierda`, control de tema | Alto fijo: `paso 11` de cada opción del control de tema más el `border` superior e inferior de su contenedor; distribución entre extremos; centrada en vertical | El alto no depende del contenido de `izquierda`. El botón «Cambiar materia» (`paso 11`) queda centrado en la fila |
| Slot `izquierda` | MateriaSelect: vacío. Home: botón «Cambiar materia» (ficha de Home) | — | Vacío o con botón, la fila mide lo mismo |
| Control de tema | Segmentado «Claro \| Oscuro», con glifo y texto en cada opción (§2) | Alto útil de cada opción `paso 11`; el contenedor suma su `border` arriba y abajo (§2.1) | Siempre a la derecha |

| Invariante D6 | Cómo se cumple |
|---|---|
| Altura igual de header entre MateriaSelect y Home | Alto del header = área segura superior + `paso 3.5` + (`paso 11` + `border` arriba y abajo del control de tema) + `paso 3.5` en las dos pantallas. Ningún texto, imagen ni botón lo estira. El primer bloque debajo arranca en la misma ordenada en ambas |
| Prohibido | Alto por contenido, `numberOfLines` como forma de igualar alturas, segundo texto dentro del header |

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

---

## 3. Barra interna del Stack (elemento compartido, tarea 3.1b)

Header del Stack de las pantallas internas. Reemplaza la banda de marca y el título del navegador. La implementa la tarea 3.1b; las tareas de las pantallas que la usan (3.4, 3.6, 3.7, 3.8 y 3.9) la heredan y no la reescriben.

| Dato | Valor |
|---|---|
| Dueña | Tarea 3.1b (`tasks.md`) |
| Dónde vive | `App.js`: `screenOptions` del Stack (aspecto común) y `options` por ruta (título y volver visible o no) |
| La usan | TopicSelect, Stats y Results (sin volver); `AddQuestion.md` a.1 y `Settings.md` a.1 |
| No la usan | MateriaSelect y Home (`headerShown: false`, HeaderMarca) y Quiz (`QUIZ-P1`: `headerShown: false` y barra propia) |
| Reemplaza | `headerStyle`, `headerTintColor` y `headerTitleStyle` actuales y la flecha de texto del `headerLeft` de web |

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
| Columna | Filete y fondo de la barra a todo el ancho; volver y título dentro de la columna `columna` (§7) |
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
| K1 | Botón relleno | Fondo `tinta`; texto `fondo` (T7); borde `tinta`, `border` | Contorno web `linea`, `border-2`, sin separación | Inversión: fondo del contenedor; texto `tinta`; borde `linea` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | Fondo del contenedor; texto `inactivo`; borde `filete` |
| K2 | Botón de marco | Fondo del contenedor; texto `tinta`; borde `linea`, `border`. Variante de acento: texto y borde `acento` (T6) | Contorno web del color del borde, `border` | Inversión: fondo `tinta`; texto `fondo`; borde `tinta` | Igual que K1 | — | Borde `filete`; texto `inactivo` |
| K3 | Control de marco `borde` (acción, opción, filtro) | Fondo `superficie`; texto `tinta` (T2); borde `borde`, `border` (N3, N4) | Borde pasa a `linea`, mismo grosor | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` | Igual que K1 | Según ficha | Borde `filete`; texto `inactivo` |
| K4 | Filtro o segmento de un grupo | Igual que K3 | Igual que K3 | Igual que K3 (anticipa el seleccionado) | Igual que K1 | Fondo `tinta`; texto `fondo` en `cuerpo-fuerte`; borde `tinta` (T7, N5) | Igual que K3 |
| K5 | Cuadrado de paso (menos, más) | Igual que K2, lado `paso 11`, glifo `tinta` | Igual que K2 | Igual que K2 | Igual que K1 | — | Borde `filete`; glifo `inactivo` |
| K6 | Tarjeta navegable | Borde `linea`, `border`; fondo `superficie`; marcas de esquina (§6) | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; texto, glifo e ilustración `fondo` | Igual que K1 | — | Borde `filete`; texto e ilustración `inactivo` |
| K7 | Fila de lista o botón de glifo | Sin marco; filete inferior `filete` en listas; texto `tinta` | Contorno web `linea`, `border` | Inversión total | Igual que K1 | — | Texto y glifo `inactivo` |

| Combinación | Resultado |
|---|---|
| Hover y foco a la vez | Gana el foco (un solo contorno) |
| Seleccionado y hover | Sin cambio: el relleno ya es el máximo |
| Presionado en un seleccionado | Sin cambio |

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

Una sola columna en los tres anchos. Nada se estira a todo el ancho. El orden vertical del teléfono se conserva.

| Ancho | Columna | Alineación | Fondo | Barras a sangre |
|---|---|---|---|---|
| 390 px (teléfono) | Ancho completo menos margen lateral `paso 5` | — | `fondo` | Barra interna y barra inferior del quiz: a ancho completo |
| 768 px (tablet) | Una columna; ancho máximo `max-w-columna` | Centrada en horizontal; anclada arriba | `fondo` a todo el ancho | Filete a todo el ancho; contenido dentro de la columna |
| 1280 px (escritorio) | Igual que tablet: el mismo token `columna` | Igual | Igual | Igual |

| Regla | Detalle |
|---|---|
| Token de ancho | `columna` (`tokens.md` c.3 y d.1), clase `max-w-columna`. Ninguna ficha usa otra clase `max-w-*` de Tailwind |
| Otro ancho | Si escritorio necesitara un ancho distinto, sería otro token con nombre propio en `tokens.md`, no una variante de `columna` |
| Sin segunda columna | No hay grilla en tablet ni en escritorio |
| Texto | Mismo paso tipográfico en los tres anchos |
| Tarjetas y lámina | Crecen con la columna; el campo de filamentos conserva su alto (§8) |
| Apaisado en teléfono | Con ancho de 768 o más aplica la fila de tablet |

---

## 8. Dimensiones de componente

Pasos que fijan tamaños de componente. Todos figuran en `tokens.md` c.3: los pasos `11`, `12`, `16`, `20`, `24` y `28` se aceptaron como parte de la escala por defecto y están en la lista «en uso» con su rol.

| Componente | Dimensión | Paso |
|---|---|---|
| Fila de control y objetivo táctil mínimo | Alto (y ancho de cuadrados) | `paso 11` |
| Opción del control de tema | Alto útil; el contenedor suma su `border` arriba y abajo | `paso 11` |
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

Todos los glifos comparten un viewBox (spec de 1.4). El componente mantiene el grosor de c.2 a cualquier lado: `stroke-width` = 1,5 × lado del viewBox / lado en px (`CONVENCIONES.md`, CD-9).

Los valores del boceto se trasladan al paso más cercano de la escala (`tokens.md` c.3, «Valor del boceto» y «Paso final»): es traslado de medida, no propuesta. Lo que sí cambia el aspecto o el uso va a §11 y a la sección f de cada ficha.

---

## 9. Inventario de glifos

Un id por glifo; se dibujan en 1.4 (y `glifo-eliminar` en 1.4b), sin relleno, en `currentColor`, en un único `viewBox 0 0 16 16` (grande, chico y vacío son el mismo archivo) y con el trazo de c.2 compensado por el componente (`svg/glifos/NOTAS-GLIFOS.md` §1 y §3). Cada emoji o símbolo de texto que la interfaz muestra hoy tiene su glifo: ninguno se retira solo con texto (spec `design-system`, «Interfaz sin emojis»). El texto puede acompañar al glifo, no lo reemplaza. La fuente del inventario es `rg` de emojis y símbolos en `src/screens`, `src/components` y `App.js`. La columna «Reemplaza» es la única de las fichas que nombra emojis.

| Criterio de color | Detalle |
|---|---|
| Qué conserva | El color de un glifo conserva la función que cumplía el símbolo que reemplaza: estado, acción, aviso, origen o decoración |
| Con qué | Solo tokens de `tokens.md` a.1; ningún glifo introduce un token nuevo |
| Estética | Color solo donde hay un estado semántico o la marca (`acento`); el resto va en `tinta` o `tintaSec`. El glifo toma el color del texto o del estado del control que lo contiene |
| Par de contraste | Cada glifo cita su fila de `tokens.md` e: N# para glifos (≥ 3:1), T# cuando el par ya está medido como texto, X# para inactivos exentos |

| Id | Reemplaza | Lo usa | Tamaño | Función | Color y par | Por qué este color |
|---|---|---|---|---|---|---|
| `glifo-volver` | `←` (`HomeScreen.js:47`, `App.js:177`, `ResultsScreen.js:168`) | Home (botón «Cambiar materia»); barra interna (TopicSelect, Stats; AddQuestion y Settings: `AddQuestion.md` a.1, `Settings.md` a.1); Results, revisión («Volver» de arriba con `REV-P2` y «Volver» final: `Revision.md` b) | grande | Acción: volver a la pantalla anterior | `tinta` sobre `fondo` (N5); presionado `fondo` sobre `tinta` (T7) | Era la flecha de texto del botón, del color de su texto. Es navegación sin carga de estado: `tinta` la deja al nivel del rótulo del botón y reserva el acento para marca e identidad |
| `glifo-chevron` | `›` (`HomeScreen.js:159`); `▲` y `▼` de los plegables (`SettingsScreen.js:110` y `158`), girado | Home (acciones); TopicSelect (filas de tema); Settings «Ver» y «Ocultar», girado (`Settings.md` a.3) | chico | Decoración funcional: la fila abre otra pantalla; en Settings, plegado o desplegado | `tintaSec` sobre `fondo` (N19) y sobre `superficie` (N20); en Settings, `acento` sobre `superficie` (N18) | En listas es una señal secundaria: se ve sin competir con el nombre de la fila (`tinta`) y por eso va un escalón abajo. El plegable de Ajustes era texto de acento, una acción: conserva ese rol con `acento` |
| `glifo-cerrar` | `✕` (`QuizScreen.js:175`, `MateriaSelectScreen.js:92`, `ResultsScreen.js:263`, `AddQuestionScreen.js:203`) | Quiz (salir); nota del creador (`Banners.md` a.2) y pedido de donación (`DonationBox.md` a.2); AddQuestion, quitar opción (`AddQuestion.md` a.2) | grande, objetivo `paso 11` | Acción: salir, descartar o quitar | Quiz: `tinta` sobre `fondo` (N5). Notas, donación y opciones: `tintaSec` sobre `superficie` (N20) | En el quiz es la única salida visible y pierde el progreso, con confirmación: va en `tinta` y no en `error`, que está reservado a respuesta incorrecta y banda baja (a.1). Descartar una nota o quitar una opción es menor: un escalón abajo, `tintaSec` |
| `glifo-siguiente` | `→` (`QuizScreen.js:323`) | Quiz («Siguiente», «Ver resultados») | grande | Acción: avanzar | `fondo` sobre `tinta` (T7, el par de N5) | Vive dentro del botón relleno (K1): hereda el color del texto y se lee con él como una sola acción primaria |
| `glifo-acierto` | `✓` (`QuizScreen.js:262`, `ResultsScreen.js:105` y `138`, `AddQuestionScreen.js:175` y `186`) | Quiz (opción correcta); Results (marca del tramo alto, trío, revisión: `Revision.md` a.3); Stats (banda alta, leyenda); AddQuestion (correcta marcada: `AddQuestion.md` a.2); Settings («Mis preguntas», correcta de cada tarjeta: `Settings.md` a.4) | chico | Estado: correcta, banda alta | `acierto` sobre `fondo` (N9), `superficie` (N10) y `aciertoFondo` (N11) | Verde sobrio del boceto y el mismo token del marco y del relleno de la opción correcta: no suma un color. No depende solo del color: la silueta (tilde) y el texto «Correcta» lo sostienen en escala de grises (spec) |
| `glifo-error` | `✗` (`QuizScreen.js:266`, `ResultsScreen.js:105` y `139`) | Quiz (opción incorrecta); Results (marca del tramo bajo, trío, revisión: `Revision.md` a.3); Stats (banda baja, leyenda, «Más falladas») | chico | Estado: incorrecta, banda baja | `error` sobre `fondo` (N12), `superficie` (N13) y `errorFondo` (N14) | Rojo sobrio del boceto, reservado a respuesta incorrecta y banda de menos de 60. La silueta (aspa) y la palabra «Incorrecta» sostienen el estado sin color |
| `glifo-intermedia` | Ninguno: hoy la banda lleva tono de aviso sin marca (`StatsScreen.js:195`, `ResultsScreen.js:299`) | Stats (banda 60–79, leyenda); Results (tramo medio) | chico | Estado: rendimiento intermedio | `intermedia` sobre `fondo` (N15) y `superficie` (N16) | El ámbar de `main` no existe en la paleta Plancha. El acero separa la banda del verde y del rojo en protanopía y deuteranopía (`tokens.md` a.3); la forma (dos trazos) hace el resto |
| `glifo-menos` | `−` (`TopicSelectScreen.js:314`) | TopicSelect (temporizador) | chico | Acción: reducir el tiempo | `tinta` sobre `superficie` (N6); en el extremo, `inactivo` sobre `superficie` (X5, exento) | Acción neutra dentro de un cuadrado de marco `linea`. El extremo se apaga con `inactivo` y borde `filete` (estado «deshabilitado»): no depende solo del color, porque el borde también cambia |
| `glifo-mas` | `+` (`TopicSelectScreen.js:326`) | TopicSelect (temporizador); AddQuestion («Agregar opción»: `AddQuestion.md` a.2) | chico | Acción: aumentar el tiempo | Igual que `glifo-menos` | Igual que `glifo-menos` |
| `glifo-claro` | ☀️ (`HeaderMarca.js:41`) | Control «Claro \| Oscuro» (HeaderMarca: MateriaSelect y Home), opción «Claro» | chico | Estado y acción: modo claro activo y elegirlo | El del texto de su opción: `tinta` sobre `fondo` (N5); seleccionada, `fondo` sobre `tinta` (T7) | El emoji era el indicador del `Switch`, con su propio color. Ahora el estado lo da la inversión `tinta`/`fondo` del segmento y el glifo hereda ese color: el control no suma un segundo indicador de color que compita con los estados semánticos |
| `glifo-oscuro` | 🌙 (`HeaderMarca.js:41`) | Control «Claro \| Oscuro» (HeaderMarca), opción «Oscuro» | chico | Estado y acción: modo oscuro activo y elegirlo | Igual que `glifo-claro` | Igual que `glifo-claro` |
| `glifo-explicacion` | 💡 (`QuizScreen.js:295`, `ResultsScreen.js:148`) | Quiz (rótulo «Nota / Explicación»); Results, revisión (`Revision.md` a.3) | chico | Aviso: dato adicional sobre la pregunta | `acento` sobre `superficie` (N18) | La bombilla marcaba «dato extra». En Plancha ese rol es de la nota, cuyo rótulo y borde izquierdo ya son `acento` (a.1): el glifo comparte color con su rótulo y la nota se lee como una pieza |
| `glifo-reloj` | ⏱ (`QuizScreen.js:191`) | Quiz (cuenta regresiva) | chico | Aviso: tiempo restante, alerta con menos de 120 s | `tinta` sobre `fondo` (N5); con menos de 120 s, `error` sobre `fondo` (N12) y marco `error`, `border-2` | En `main` el tiempo pasa a rojo claro bajo 120 s: `error` conserva ese aviso y el marco suma la señal sin color. Con tiempo de sobra el reloj es neutro para no competir con el enunciado |
| `glifo-reportar` | 🚩 (`QuizScreen.js:306`, `ResultsScreen.js:158`) | Quiz («Reportar pregunta»); Results, revisión (`Revision.md` a.3) | chico | Aviso: señalar un problema en la pregunta | `tinta` sobre `superficie` (N6) | La bandera roja avisaba de un problema. Acá es una utilidad secundaria que aparece junto a «Correcta» o «Incorrecta»: un glifo rojo se leería como otro estado de error de la respuesta. La forma y el texto llevan el aviso. Sin alternativa roja (`CONVENCIONES.md`, CD-14) |
| `glifo-origen-examen` | 📄 (`QuizScreen.js:219`) | Quiz (chip de origen `exam`) | chico | Origen: pregunta de examen real | `acento` sobre `superficie` (N18), en chip de marco `acento` | El examen real es la procedencia que más importa y toma el único color de marca. Marco y glifo del mismo color forman una pieza, y el fondo vacío lo separa de la generada |
| `glifo-origen-generada` | ✨ (`QuizScreen.js:222`) | Quiz (chip de origen `generated`) | chico | Origen: pregunta generada | `fondo` sobre `tinta` (T7, el par de N5), en chip relleno | D6 pide que una generada nunca se presente como de examen real: el chip va relleno en `tinta`, silueta opuesta al marco del examen, y no comparte color con él: la diferencia no depende del matiz |
| `glifo-origen-propia` | 👤 (`QuizScreen.js:225`) | Quiz (chip de origen `user`) | chico | Origen: pregunta del propio usuario | `tinta` sobre `superficie` (N6), en chip de marco `linea` | Es contenido del usuario: no certifica ni advierte, así que va neutro. Se distingue de las otras dos por silueta y texto, sin color |
| `glifo-practicar` | `practicar.png` (`HomeScreen.js:9`) | Home («Entrena Temas/Parciales») | grande, en cuadro de acción | Decoración funcional: identifica el destino de la acción | `tinta` sobre `superficie` (N6), en cuadro de marco `filete` | Los PNG de `main` eran a color y distintos por acción. El color no debe distinguir destinos, para eso está el título: los seis glifos van en `tinta` y se leen como un lote. La jerarquía entre acción primaria y secundarias la da el marco (`linea`, `border-2` frente a `borde`), no el glifo |
| `glifo-examen` | `examen.png` (`HomeScreen.js:10`) | Home («Modo examen») | grande, en cuadro de acción | Decoración funcional | Igual que `glifo-practicar` | Igual que `glifo-practicar` |
| `glifo-repasar` | `repasar.png` (`HomeScreen.js:11`); 🎯 (`TopicSelectScreen.js:180`) | Home («Repasar fallos»); TopicSelect, estado vacío de `failed` (`Vacios.md` a.2) | grande en cuadro de acción; en el estado vacío, `paso 12` | Decoración funcional | Igual que `glifo-practicar`; en el estado vacío, `tintaSec` sobre `fondo` (N19) | Igual que `glifo-practicar`. En el estado vacío es una ilustración sin acción: `tintaSec` la deja detrás del título (`tinta`) |
| `glifo-estadisticas` | `estadisticas.png` (`HomeScreen.js:12`); 📊 (`StatsScreen.js:97`) | Home («Mis estadísticas»); Stats, estado vacío (`Vacios.md` a.2) | grande en cuadro de acción; en el estado vacío, `paso 12` | Decoración funcional | Igual que `glifo-repasar` | Igual que `glifo-repasar` |
| `glifo-agregar` | `agregar.png` (`HomeScreen.js:13`) | Home («Agregar pregunta») | grande, en cuadro de acción | Decoración funcional | Igual que `glifo-practicar` | Igual que `glifo-practicar` |
| `glifo-ajustes` | `ajustes.png` (`HomeScreen.js:14`) | Home («Ajustes») | grande, en cuadro de acción | Decoración funcional | Igual que `glifo-practicar` | Igual que `glifo-practicar` |
| `glifo-aleatorio` | 🎲 (`TopicSelectScreen.js:205`) | TopicSelect («Todos los temas mezclados») | grande | Decoración funcional: identifica el modo de mezcla | `acento` sobre `superficie` (N18) | La mezcla es la acción destacada de la pantalla y su tarjeta ya lleva marco `acento`: el glifo comparte ese color para anclar la tarjeta, y el título sigue en `tinta` (T2) |
| `glifo-revisar` | 📋 (`ResultsScreen.js:220`) | Results («Revisar todas las respuestas») | chico | Acción: abrir el detalle respuesta por respuesta | `acento` sobre `superficie` (N18), como el texto del botón K2 de acento; presionado, `fondo` sobre `tinta` (T7) | El botón es la acción secundaria de acento del boceto: el glifo toma el color de su texto y se lee con él |
| `glifo-reintentar` | 🔄 (`ResultsScreen.js:228`) | Results («Volver a practicar») | chico | Acción: repetir la práctica | `fondo` sobre `tinta` (T7, el par de N5) | El botón es la acción primaria rellena (K1): el glifo hereda `fondo` y se lee con el texto |
| `glifo-inicio` | 🏠 (`ResultsScreen.js:236`) | Results («Inicio») | chico | Acción: volver al inicio | `tinta` sobre `superficie` (N6) | Acción terciaria neutra (K2 de marco `linea`): el glifo sigue al texto en `tinta` |
| `glifo-mensaje` | 👋 (`MateriaSelectScreen.js:86`) | MateriaSelect, nota del creador (`Banners.md` a.2) | chico | Aviso: mensaje informativo del creador | `acento` sobre `superficie` (N18) | La nota es el único bloque informativo de la pantalla de entrada y su rótulo y borde son `acento`: el glifo la acompaña. El saludo era cálido, sin función de alerta |
| `glifo-banco-reducido` | 📉 (`HomeScreen.js:129`) | Home, banner de banco reducido (`Banners.md` a.2) | chico | Aviso: el banco de la materia tiene menos preguntas | `acento` sobre `superficie` (N18) | Es un aviso informativo y no una falla: `error` lo haría parecer un problema de uso, e `intermedia` se confundiría con la banda de rendimiento. Va en `acento`, como la nota; la forma (tendencia descendente) y el texto llevan el aviso |
| `glifo-trofeo` | 🏆 (`ResultsScreen.js:260`) | Results, pedido de donación con resultado alto (`DonationBox.md` a.2) | chico | Decoración funcional: celebración del resultado | `acierto` sobre `superficie` (N10) | El texto celebratorio aparece desde `DONATION_WARM_SCORE` (80), que es el corte de la banda alta: `acierto` repite el color de esa banda y no suma un dorado fuera de paleta |
| `glifo-guardar` | 💾 (`AddQuestionScreen.js:238`, `SettingsScreen.js:175`) | AddQuestion («Guardar pregunta»); Settings («Descargar respaldo») (`AddQuestion.md` b; `Settings.md` b) | chico | Acción: guardar o descargar | El del texto del botón: K1 `fondo` sobre `tinta` (T7) o K3 `tinta` sobre `superficie` (N6) | Era un adorno neutro delante del texto de un botón: el glifo toma el color del botón y no agrega matiz |
| `glifo-importar` | 📂 (`SettingsScreen.js:184`) | Settings («Importar respaldo») (`Settings.md` b) | chico | Acción: cargar un archivo | Igual que `glifo-guardar` | Igual que `glifo-guardar` |
| `glifo-correo` | ✉️ (`SettingsScreen.js:223`) | Settings («Reportar un error», `Settings.md` b); Banners, contacto del banner de banco reducido, solo con `BAN-P1` (`Banners.md` a.2) | chico | Acción: abrir un correo | `acento` sobre `fondo` (N17) o `superficie` (N18) | El enlace era de acento en `main`: el glifo conserva esa función de enlace de contacto con el mismo token que su texto |
| `glifo-externo` | `↗` (`SettingsScreen.js:230`) | Settings («Código fuente») (`Settings.md` b) | chico | Aviso: el enlace sale de la app | `acento` sobre `fondo` (N17) o `superficie` (N18) | Marca que el enlace abre otro sitio: va del color del enlace para leerse como parte de él |
| `glifo-eliminar` | `×` (`SettingsScreen.js:131`) | Settings, «Mis preguntas»: eliminar una pregunta propia (`Settings.md` b) | grande, objetivo `paso 11` | Acción: eliminar un dato guardado, con confirmación del sistema | `tintaSec` sobre `superficie` (N20); presionado, `fondo` sobre `tinta` (T7) | Es la única acción que borra un dato del usuario desde una tarjeta. Va en el mismo tono que descartar o quitar (`glifo-cerrar`) para no competir con el enunciado de la tarjeta, y se separa de él por silueta: borrar un dato guardado y descartar una nota no pueden leerse como la misma acción. No usa `error`, reservado a respuesta incorrecta, banda baja y validación (a.1); la confirmación del sistema ya advierte que no se puede deshacer |

### Indicaciones de forma para 1.4

El dibujo lo decidió 1.4 dentro de estas reglas (`svg/glifos/NOTAS-GLIFOS.md`): un viewBox común para todos los glifos (el componente mantiene 1,5 px visibles a cualquier lado, `CONVENCIONES.md` CD-9), terminación cuadrada, ángulos rectos donde el motivo lo permita, un solo grosor (c.2).

| Glifo | Indicación |
|---|---|
| `glifo-volver`, `glifo-siguiente` | Flecha horizontal de trazo recto con punta en ángulo, las del boceto: volver apunta a la izquierda, siguiente a la derecha |
| `glifo-chevron` | Dos trazos en ángulo recto abiertos hacia la izquierda; el mismo glifo girado 90 y 270 grados sirve a los plegables |
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

La insignia no es un control: no tiene hover, presionado, foco ni deshabilitado. El filtro conserva la matriz de `TopicSelect.md` c.

### 12.4 Propuestas aprobadas (D10)

El usuario las aprobó el 2026-10-10 y rigen tal como están descritas en 12.2 y 12.3. No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| PAR-P1 | La insignia de parcial del quiz y del examen en curso pasa del par de pasteles a una marca de dos casillas más el texto de siempre, sin color propio | `parcial.1` y `parcial.2` no existen en Plancha y la paleta excluye lo colorido. El par comunica una categoría que el texto solo no hace evidente de un vistazo; la posición de la casilla llena sí, sin color y con la misma tinta en los dos | visual | aprobada (usuario, 2026-10-10) |
| PAR-P2 | El filtro de parcial del selector lleva la misma marca delante del texto | La marca que el usuario elige en el selector es la que ve en la pregunta. Hoy el filtro no lleva pastel y se distingue solo por texto | visual | aprobada (usuario, 2026-10-10) |
