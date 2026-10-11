# Stats · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `StatsScreen` (`src/screens/StatsScreen.js`), ruta `Stats` |
| Boceto | Figura 06 «Estadísticas» (`hibrido.html`) |
| Comunes | `comun.md`: §3 barra interna, §4 marcas de estado, §5 estados (K7), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra interna con título «pKapp · Estadísticas» y volver |
| Variantes | Con datos; fila con práctica o «Sin practicar»; con y sin «Más falladas» |
| Fuera de alcance | Estado vacío «Sin estadísticas todavía» (`totalAnswered === 0`): su lugar está fijado; su ficha es `Vacios.md` (V1) |
| Propuestas | Sección f: `STATS-P1`, `STATS-P2` y `STATS-P5`. Sección h: conservado de main (D10). Comunes: `COMUN-P2` |

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3 |
| 2 | Tarjeta global | `paso 4` | `paso 5` | `paso 3` | Lámina de `comun.md` §6; relleno `paso 4`; contenido centrado (a.2) |
| 3 | Rótulo «Por tema» | `paso 4` | `paso 5` | `paso 2` | Rótulo de sección |
| 4 | Leyenda de bandas | — | `paso 5` | `paso 2` | Tres ítems en una fila, separados por `paso 4` |
| 5 | Filas por tema | — | `paso 5` | — | Una fila por tema con preguntas, en el orden de `TOPICS` (a.3) |
| 6 | Rótulo «Más falladas» | `paso 6` | `paso 5` | `paso 2` | Solo si hay preguntas falladas |
| 7 | Lista de falladas | — | `paso 5` | — | Hasta 10 (a.4) |
| 8 | Relleno inferior del scroll | — | — | `paso 8` | Fin del scroll |

La vista admite tirar para actualizar (`RefreshControl`); es un control nativo y no lleva estilo propio.

### a.2 Interior de la tarjeta global

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Rótulo | Fila centrada: marca de banda (glifo chico) y texto, separación `paso 2` | «Aciertos globales» |
| 2 | Porcentaje | Margen superior `paso 3` | Valor global en `display`, con el color de su banda |
| 3 | Detalle | Margen superior `paso 2` | «{totalCorrect} aciertos de {totalAnswered} respuestas» |

### a.3 Interior de una fila por tema

| # | Parte | Medidas | Divisor | Contenido |
|---|---|---|---|---|
| 1 | Encabezado | Relleno superior `paso 3`; fila con nombre flexible a la izquierda y valor a la derecha; valor alineado a la base del nombre | Filete superior `filete` | Nombre y, a la derecha, marca de banda (glifo chico, separación `paso 1.5`) y porcentaje |
| 2 | Barra | Alto `paso 2`; margen superior `paso 2`, inferior `paso 1.5`; ancho completo | — | Relleno proporcional y dos marcas de umbral |
| 3 | Detalle | Relleno inferior `paso 3` | — | Resumen de respuestas |

La barra lleva dos marcas verticales, en el 60 % y en el 80 % de su ancho: alto `paso 3.5`, centradas sobre la barra, de modo que sobresalen arriba y abajo.

Fila «Sin practicar» (`accuracy === null`, V7 de `Vacios.md`): sin barra ni marca de banda; a la derecha del nombre, «Sin practicar» en `detalle` y `tintaSec` en el lugar del valor, y debajo, en el detalle de la fila, «{t} preguntas disponibles» (c).

### a.4 Interior de una fila de falladas

Filete superior `filete`; relleno vertical `paso 3`; primera línea con «#{n}» a la izquierda y, a la derecha, la marca de banda (glifo chico) delante del valor «{pct}% ({aciertos}/{respuestas})», separados `paso 1.5`; segunda línea con el enunciado a dos líneas como máximo (margen superior `paso 1.5`); tercera línea con el tema (margen superior `paso 1`).

### a.5 Tablet y escritorio (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Tarjeta, filas y barras llenan la columna; las marcas de umbral siguen en el 60 % y el 80 % del ancho de la barra |
| 1280 px | Igual | Igual | Las filas siguen en una columna: sin tabla ni dos columnas |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. En cada fila por tema el nombre salta de línea y el valor (marca y porcentaje) conserva su ancho a la derecha; la barra llena el ancho y las marcas siguen en el 60 % y el 80 %. La leyenda de bandas salta de línea si sus tres ítems no entran en una fila. En «Más falladas» la primera línea conserva «#{n}» y el valor; el enunciado y el tema saltan de línea |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Barra interna | `comun.md` §3 | | | | | | |
| Tarjeta global (cuerpo) | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | — | — | N1, N2 |
| Rótulo «Aciertos globales» | `tintaSec` | `superficie` | — | `rotulo` | — | Marca de banda (chico) | T4 |
| Porcentaje global, banda alta | `acierto` | `superficie` | — | `display` | — | `glifo-acierto` | T11, N10 |
| Porcentaje global, banda intermedia | `intermedia` | `superficie` | — | `display` | — | `glifo-intermedia` | T19, N16 |
| Porcentaje global, banda baja | `error` | `superficie` | — | `display` | — | `glifo-error` | T15, N13 |
| Detalle global | `tintaSec` | `superficie` | — | `cuerpo` | — | — | T4 |
| Rótulo de sección | `acento` | `fondo` | — | `rotulo` | — | — | T5 |
| Leyenda de bandas | `tintaSec` | `fondo` | — | `rotulo` | — | `glifo-acierto`, `glifo-intermedia`, `glifo-error` (chico) | T3 |
| Nombre de tema | `tinta` | `fondo` | — | `item` | Superior de la fila `filete` | — | T1, X1 |
| Porcentaje de fila, banda alta | `acierto` | `fondo` | — | `dato` | — | `glifo-acierto` | T10, N9 |
| Porcentaje de fila, banda intermedia | `intermedia` | `fondo` | — | `dato` | — | `glifo-intermedia` | T18, N15 |
| Porcentaje de fila, banda baja | `error` | `fondo` | — | `dato` | — | `glifo-error` | T14, N12 |
| «Sin practicar» | `tintaSec` | `fondo` | — | `detalle` | — | — | T3 |
| Pista de la barra | — | `superficie` | `filete`, `border` | — | — | — | X1, X2 |
| Relleno de la barra | — | `acierto`, `intermedia` o `error` según banda | — | — | — | — | N10, N16, N13 |
| Marca de umbral (60 y 80) | `linea` | — | — | — | — | — | N1 |
| Detalle de fila | `tintaSec` | `fondo` | — | `detalle` | — | — | T3 |
| Índice de falladas «#{n}» | `tintaSec` | `fondo` | — | `rotulo` | — | — | T3 |
| Valor de falladas | Color de su banda | `fondo` | — | `rotulo-medio` | — | Marca de banda (chico) | T10, T18, T14 |
| Enunciado de falladas | `tinta` | `fondo` | — | `cuerpo` | — | — | T1 |
| Tema de falladas | `tintaSec` | `fondo` | — | `detalle` | — | — | T3 |
| Estado vacío | `Vacios.md` b | | | | | | |

---

## c. Matriz de estados

Las filas de esta pantalla no son controles: no hay hover, presionado, foco, seleccionado ni deshabilitado salvo en la barra interna.

| Elemento | Reposo | Banda alta (80 o más) | Banda intermedia (60 a 79) | Banda baja (menos de 60) | Sin practicar |
|---|---|---|---|---|---|
| Color del valor | `tinta` o `tintaSec` según elemento | `acierto` | `intermedia` | `error` | `tintaSec` |
| Marca delante del valor | — | `glifo-acierto` | `glifo-intermedia` | `glifo-error` | Ninguna |
| Relleno de la barra | — | `acierto` | `intermedia` | `error` | Sin barra |
| Posición del relleno | — | Pasa la marca del 80 % | Entre la marca del 60 % y la del 80 % | No llega a la marca del 60 % | — |
| Detalle | — | «{c} aciertos en {a} respuestas · {t} preguntas disponibles» | Igual | Igual | «{t} preguntas disponibles» |

| Por qué se distinguen sin color | Detalle |
|---|---|
| Marca | Tilde, dos trazos paralelos y aspa: tres siluetas distintas (`comun.md` §4) |
| Posición | El extremo del relleno cae en un tramo distinto respecto de las dos marcas de umbral |
| Leyenda | Los tres ítems de a.1 repiten cada marca con su rango numérico |
| Valor | El porcentaje siempre se muestra en cifras |

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Botón volver de la barra | `comun.md` §3 | `comun.md` §3 | `comun.md` §3 | `comun.md` §3 | — | — |
| Tirar para actualizar | Nativo, sin estilo propio | — | — | — | — | — |

Origen de la pregunta, banco reducido y acierto o error de una opción no aplican (—).

---

## d. Datos e invariantes

### d.1 Bandas (D6, leídas de `src/screens/StatsScreen.js`)

Función `acierto(percentage, esOscuro)`, líneas 192 a 197:

| Condición | Banda | Token | Marca |
|---|---|---|---|
| `percentage >= 80` | Alta | `acierto` | `glifo-acierto` |
| `percentage >= 60` y menor de 80 | Intermedia | `intermedia` | `glifo-intermedia` |
| Menos de 60 | Baja | `error` | `glifo-error` |

Los cortes 80 y 60 no cambian. La ficha solo traduce el tono de aviso que hoy usa el código (`warning.bold`) al token `intermedia`. Las mismas bandas se aplican al porcentaje global, al de cada fila y al de «Más falladas».

### d.2 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Estadísticas | `getAllStats(materiaId)` | Se recargan al enfocar la pantalla (`useFocusEffect`) |
| Preguntas propias | `getUserQuestions(materiaId)` | Se suman a las de la materia |
| Total respondido | Suma de `times_answered` | — |
| Aciertos totales | Suma de `times_correct` | — |
| Porcentaje global | `Math.round(totalCorrect / totalAnswered * 100)`; 0 si no hay respuestas | — |
| Temas | `Object.keys(TOPICS)` de la materia | Orden del código; el boceto los ordenaba por porcentaje y no se adopta |
| Fila por tema | `totalQuestions`, `answered`, `correct`, `accuracy` | Solo se muestra si `totalQuestions > 0`; `accuracy` es `null` si no respondió |
| Más falladas | Respuestas con `times_answered > 0` y `times_correct < times_answered`, ordenadas por acierto ascendente, hasta 10 | Se omiten las preguntas que ya no existen |

### d.3 Invariantes

| Invariante | Detalle |
|---|---|
| Cortes 80 y 60 | d.1 |
| Tres bandas distinguibles sin color | Marca, posición respecto de las marcas de umbral y leyenda (c) |
| Estado vacío | `totalAnswered === 0` muestra «Sin estadísticas todavía»: `Vacios.md` (V1) |
| Orden de filas | El de `TOPICS` |
| Sin emoji, radio ni sombra | El emoji del estado vacío, `rounded-*` y `sombras.cardAlta` salen de esta pantalla |
| Color por `style` | El color depende de un valor calculado; sale del token de su banda, no de un literal |

### d.4 Eventos `track(...)`

`rg -n 'track\(' src/screens/StatsScreen.js`: sin resultados.

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| Ninguno | — | — | La pantalla no emite eventos y la ficha no agrega ninguno. El pageview sintético lo emite `App.js` por cambio de ruta y no se toca |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Títulos de sección | «Por tema», «Más falladas» | Iguales; el paso los muestra en mayúsculas | Sin cambio de palabras |
| Rótulo global | «Aciertos globales» | Igual | — |
| Sin práctica | «Sin practicar» (cursiva) | Igual, sin cursiva | `tokens.md` b.3 |
| Leyenda de bandas | No existe | «≥ 80 %», «60–79 %», «< 60 %» (cifras y signos, sin palabras) | Texto nuevo que explica las marcas; el boceto traía «marca en 80 %» |
| Tema de falladas | Cursiva | Igual, sin cursiva | `tokens.md` b.3 |
| Detalles | «{c} aciertos en {a} respuestas · {t} preguntas disponibles», «{t} preguntas disponibles», «{c} aciertos de {a} respuestas» | Iguales | — |

---

## f. Propuestas aprobadas (D10)

Cambios del boceto respecto de `main`, o de `main` respecto del boceto. El usuario los aprobó el 2026-10-10 (D10): rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| STATS-P1 | La barra de cada fila lleva dos marcas verticales, en el 60 % y en el 80 % de su ancho. El boceto trae una sola, en el 80 % | Con los cortes 80 y 60 (D6) la banda intermedia queda entre las dos marcas: se lee por posición, sin depender del color | visual | aprobada (usuario, 2026-10-10) |
| STATS-P2 | El rótulo de sección dice «Por tema» y una leyenda de tres ítems explica las bandas con su marca y su rango («≥ 80 %», «60–79 %», «< 60 %»). El boceto escribe «Por tema · marca en 80 %» | Con dos marcas y tres bandas, «marca en 80 %» deja de describir la barra; la leyenda hace legible cada marca sin color | visual | aprobada (usuario, 2026-10-10) |
| STATS-P5 | El porcentaje global usa el paso `display`, el mismo de Results. El boceto lo dibuja en un tamaño menor (60) | El tamaño no codifica estado (`tokens.md` f, fila 8): un solo paso para el porcentaje evita una segunda escala tipográfica | visual | aprobada (usuario, 2026-10-10) |

Propuestas comunes que alcanzan esta pantalla: `COMUN-P2` (estados de control).

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta aprobada (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Barras neutras; solo 80 o más con color y menos de 65 con otro | Tres bandas con cortes 80 y 60 y token propio por banda | D6: manda el código |
| Porcentaje global en tono neutro | Color y marca de su banda | D6: las tres bandas se distinguen y sus cortes son 80 y 60 (spec `design-system`) |
| Datos ilustrativos | Datos reales de la base local | Dato real |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite o dibuja distinto. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| STATS-P3 | Las filas por tema siguen el orden de los temas de la materia (el de TopicSelect). El boceto las ordena de mayor a menor porcentaje | Continuidad (D10): el usuario ubica cada tema por su posición, la misma en TopicSelect y en Stats | uso |
| STATS-P4 | Bajo las filas por tema sigue la lista «Más falladas» (hasta 10, por acierto ascendente), con el valor «{pct}% ({aciertos}/{respuestas})» a la derecha y la marca de banda delante de él. El dato, el orden y la cantidad son los de `main`; el aspecto es Plancha (`CONVENCIONES.md`, C1 y CD-7): el valor toma el color y la marca de su banda (d.1), no el rojo único de `main`. Una fallada con 80 % o más lleva `glifo-acierto`: es la banda de su porcentaje, el mismo estado que en el resto de la app. El boceto termina en las filas por tema | Está en uso en `main`. CD-7 (acordada) fija el mismo token y la misma marca por estado, también en «Más falladas» | uso |
