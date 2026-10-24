# Stats · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `StatsScreen` (`src/screens/StatsScreen.js`), ruta `Stats` |
| Boceto | Figura 06 «Estadísticas» (`hibrido.html`) |
| Comunes | `comun.md`: §3 barra interna, §4 marcas de estado, §5 estados (K7), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra interna con título «pKapp · Estadísticas» y volver |
| Variantes | Con datos; fila con práctica o «Sin practicar»; con y sin «Más falladas» |
| Fuera de alcance | Estado vacío «Sin estadísticas todavía» (`totalAnswered === 0`): su lugar está fijado; su ficha es `Vacios.md` (V1) |
| Propuestas | Sección f: `STATS-P1`, `STATS-P2` y `STATS-P5`. Sección h: conservado de main (D10). Comunes: `COMUN-P2`. Sección i: cambios de la tarea 5.2 (Diseñador, 2026-10-13) |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P7`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.5 |

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

La vista conserva el `RefreshControl`, que en web no hace nada: sin gesto ni indicador (c, «Tirar para actualizar en web»); la pantalla se recarga al enfocar (d.2).

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

La barra lleva dos marcas verticales, en el 60 % y en el 80 % de su ancho: trazo de 1 px (`w-px`, el `border` de `tokens.md` c.2), alto `paso 3.5`, centradas sobre la barra, de modo que sobresalen 3 px arriba y 3 px abajo. Esos dos sobresalidos, sobre `fondo`, son lo que identifica la marca (N1); el tramo que cruza el relleno es exento (X8, `tokens.md` e: `linea` sobre el relleno no llega a 3:1 y en oscuro la marca no se distingue dentro de él). La banda sigue sin depender del color solo: marca de banda, valor y leyenda la dicen con texto y forma (`STATS-P2`).

Fila «Sin practicar» (`accuracy === null`, V7 de `Vacios.md`): sin barra ni marca de banda; a la derecha del nombre, «Sin practicar» en `detalle` y `tintaSec` en el lugar del valor, y debajo, en el detalle de la fila, «{t} preguntas disponibles» (c).

### a.4 Interior de una fila de falladas

Filete superior `filete`; relleno vertical `paso 3`; primera línea con «#{n}» a la izquierda y, a la derecha, la marca de banda (glifo chico) delante del valor «{pct}% ({aciertos}/{respuestas})», separados `paso 1.5`; segunda línea con el enunciado a dos líneas como máximo (margen superior `paso 1.5`); tercera línea con el tema (margen superior `paso 1`).

### a.5 Tablet (D10); desde 1024 px, sección «Escritorio»

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Tarjeta, filas y barras llenan la columna; las marcas de umbral siguen en el 60 % y el 80 % del ancho de la barra |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P7`, aprobada): `hoja`; `hoja-amplia` desde `amplio` | Igual | Tarjeta global y leyenda en la región lateral; filas por tema en la principal (2 columnas desde `amplio`); «Más falladas» debajo, en columnas |
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
| Marca de umbral (60 y 80) | `linea`; trazo `w-px` (1 px) y alto `paso 3.5` | — | — | — | — | — | N1 y N2 (sobresalido), X8 (tramo sobre el relleno) |
| Detalle de fila | `tintaSec` | `fondo` | — | `detalle` | — | — | T3 |
| Índice de falladas «#{n}» | `tintaSec` | `fondo` | — | `rotulo` | — | — | T3 |
| Valor de falladas | Color de su banda | `fondo` | — | `rotulo-medio` | — | Marca de banda (chico) | T10, T18, T14 |
| Enunciado de falladas | `tinta` | `fondo` | — | `cuerpo` | — | — | T1 |
| Tema de falladas | `tintaSec` | `fondo` | — | `detalle` | — | — | T3 |
| Estado vacío | `Vacios.md` b | | | | | | |

---

## c. Matriz de estados

Las filas de esta pantalla no son controles: no hay hover, presionado, foco, seleccionado ni deshabilitado salvo en la barra interna y, con datos, en el contenedor desplazable, que es la otra parada de Tab (5.2, `E-03`; ver i).

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
| Contenedor desplazable, con datos (5.2, `E-03`) | Sin contorno | — | — | Contorno `foco`, `border-2`, `outline-offset` −`paso 0.5` (hacia adentro), solo `:focus-visible`; par N7 | — | — |
| Tirar para actualizar | Sin efecto en web: sin gesto ni indicador (detalle en la fila siguiente) | — | — | — | — | — |
| (5.0b, sin documentar) Tirar para actualizar en web | Sin efecto: el `RefreshControl` de react-native-web renderiza un `View` sin gesto ni indicador, así que en la única plataforma vigente (web, D10 y retiro de nativo 5.0) el gesto no existe y la pantalla se recarga solo al enfocar (`useFocusEffect`, d.2). Vale igual para V1 de `Vacios.md` (`VAC-C3`). Sin cambio en esta tarea | — | — | — | — | — |

Origen de la pregunta, banco reducido y acierto o error de una opción no aplican (—).

---

## d. Datos e invariantes

### d.1 Bandas (D6, leídas de `src/screens/StatsScreen.js`)

Función de módulo `acierto(percentage)` de `StatsScreen.js` (`rg -n 'function acierto' src/screens/StatsScreen.js`):

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
| Fila por tema | `totalQuestions`, `answered`, `correct`, `accuracy` | Solo se muestra si `totalQuestions > 0`; `accuracy` es `null` si no respondió. `totalQuestions` cuenta sin repetidas (`dedupeQuestions` sobre banco y propias, el mismo conjunto que TopicSelect, F-3); `answered` y `correct` se calculan contra la lista cruda |
| Más falladas | Respuestas que cumplen `esFallada` (`database.web.js`: errada alguna vez y menos de 2 aciertos seguidos desde el último error; sin `racha`, la regla vieja), ordenadas por acierto ascendente, hasta 10 | Se omiten las preguntas que ya no existen |

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

---

## i. Cambios de la tarea 5.2

Recorrido final de la rama `rediseno-revision-ux`. No son propuestas nuevas: cierran una medida que faltaba o corrigen la ficha contra el código. Cada fila dice qué había, qué rige ahora y cómo se comprueba.

| Fecha | Id | Cambio | Antes | Después | Aceptación observable (Programador y e2e) |
|---|---|---|---|---|---|
| 2026-10-13 | `C-05` | La marca de umbral se conserva tal como está dibujada y su par sobre el relleno se registra como exento (X8) | b: marca `linea`, solo el par N1; sin grosor. `linea` sobre el relleno no figuraba en `tokens.md` e: 2,73 / 2,65 / 2,40 en claro y 1,24 / 1,41 / 1,52 en oscuro | b: trazo `w-px` y alto `paso 3.5`, pares N1, N2 y X8. `tokens.md` e suma X8 (exento: lo identifica su sobresalido, redundante con el valor y la leyenda). No hay cambio de dibujo ni de código | Sin cambio de código: `stats-umbral-60-*` y `stats-umbral-80-*` siguen midiendo 14 px de alto, 1 px de ancho, `linea`, centrados y sobresaliendo 3 px arriba y abajo (`estadisticas.js`). Descartado: partir la marca en dos muescas fuera de la barra (más DOM y más aserciones para un tramo de 8 px, el alto de la barra, que en claro se ve y en oscuro ya no se distingue) |
| 2026-10-13 | `C-06` (nota) | d.1 deja de citar números de línea | «Función `acierto(percentage, esOscuro)`, líneas 192 a 197» | `acierto(percentage)`, función de módulo | Sin cambio de código |
| 2026-10-13 | `E-03` | c y «Orden, teclado y foco» (Escritorio): con datos, el contenedor desplazable es una parada de Tab con contorno propio | «La pantalla no tiene controles salvo el volver de la barra». Chrome 130 o más trata un contenedor desplazable sin controles dentro como parada de Tab: con datos era una segunda parada tras «Volver», con el contorno por defecto del navegador (`auto 1px`, `rgb(0, 95, 204)` en claro y `rgb(153, 200, 255)` en oscuro), fuera de la paleta y de CD-4 | Con datos, dos paradas: el volver de la barra y el contenedor desplazable, que deja desplazar con el teclado. Contorno `foco` (`#095c6b` claro, `#7fd6e3` oscuro), `border-2`, `outline-offset` −`paso 0.5` hacia adentro, solo `:focus-visible`. Las filas siguen sin ser controles. Sin pares nuevos: `foco` sobre `fondo` es N7 | Con datos, Tab desde «Volver» enfoca el contenedor desplazable: contorno `solid 2px` `foco` y `outline-offset: -2px`; con el puntero no aparece; Shift+Tab vuelve a «Volver». Sin datos (`Vacios.md` V1) su acción queda dentro del scroll y no hay segunda parada. Implementado fuera de este árbol (tanda del Programador): sin verificar acá |

---

## Escritorio · propuesta `ESC-P7` (tarea 3.10, aprobada por el usuario el 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); `amplio` pone las filas por tema en 2 columnas y las falladas en 3. Teléfono y tablet no cambian |
| Bajo el corte | a.5 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E07, a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Bandas y cortes 80 y 60 de d.1, datos de d.2, copy de e, orden de las filas (`STATS-P3`), «Más falladas» (`STATS-P4`), elementos y pares de b, estados de c |

### Disposición

| # | Región | Contenido, en orden de DOM | Escritorio | Amplio |
|---|---|---|---|---|
| 1 | Barra interna | `comun.md` §3 | Contenido dentro de `hoja` | Dentro de `hoja-amplia` |
| 2 | Lateral | Tarjeta global (a.2), rótulo «Por tema» y leyenda de bandas (`STATS-P2`), con la separación de a.1 | Ancho `lateral`; la leyenda es la clave de las marcas de las filas y queda junto a la tarjeta | Igual |
| 3 | Principal | Filas por tema (a.3), en el orden de `TOPICS` | Una columna | 2 columnas con flujo por columnas, `paso 8` entre ellas |
| 4 | Debajo, a ancho de hoja | Rótulo «Más falladas» y lista de hasta 10 (a.4) | 2 columnas con flujo por columnas | 3 columnas |

El estado vacío (V1) es `Vacios.md` (`ESC-P12`).

### Medidas

| Elemento | Medida |
|---|---|
| Tarjeta global | Ancho `lateral`, relleno `paso 4`; el porcentaje en `display` con su marca de banda (`STATS-P5`) |
| Fila por tema | Llena su columna; barra de alto `paso 2` con las marcas del 60 % y el 80 % de su ancho (`STATS-P1`); sin cambio el encabezado ni el detalle |
| Fila de falladas | Llena su columna; enunciado a dos líneas como máximo |
| Leyenda | Los tres ítems en una línea en el ancho `lateral` |

### Revisado

| Ancho de ventana | Qué se ve | Alto del contenido |
|---|---|---|
| 1024 (el corte) | Lateral y principal sin ajuste; sin scroll horizontal | — |
| 1366 × 768 | Tarjeta, leyenda y las primeras filas en la primera ventana; entera pide desplazarse | 2,0 ventanas (con `columna`: 3,0) |
| 1920 × 1080 | Tarjeta, leyenda, filas por tema en 2 columnas y falladas en 3, en una ventana | 0,9 ventanas (con `columna`: 2,0) |

### Orden, teclado y foco

| Aspecto | Regla |
|---|---|
| Orden de DOM | El del teléfono: barra, tarjeta, «Por tema», leyenda, filas, «Más falladas», lista |
| Foco | Con datos, dos paradas de Tab: el volver de la barra y, después, el contenedor desplazable (5.2, `E-03`). El contenedor lleva contorno `foco`, `border-2`, `outline-offset` −`paso 0.5` (hacia adentro: ocupa todo el ancho de la ventana y uno hacia afuera se recortaría), solo con `:focus-visible`, y deja desplazar con el teclado. Las filas no son controles (c) |
| Cambia de lugar | La tarjeta global y la leyenda quedan a la izquierda de las filas, no encima |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P7` | Desde el corte `escritorio`, la tarjeta global y la leyenda pasan a una región lateral; las filas por tema, a la principal; «Más falladas», debajo a ancho de hoja y en columnas | La materia con más temas pide tres ventanas en una columna. Las filas por tema conservan su orden (`STATS-P3`: misma posición que en TopicSelect) y la clave de bandas queda a la vista junto al porcentaje global | visual | aprobada (usuario, 2026-10-11) |
