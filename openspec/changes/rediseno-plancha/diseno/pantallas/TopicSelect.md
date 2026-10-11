# TopicSelect · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `TopicSelectScreen` (`src/screens/TopicSelectScreen.js`), ruta `TopicSelect`, parámetro `mode` (`practice`, `exam`, `failed`) |
| Boceto | Figura 03 «Elegir tema» (`hibrido.html`); cubre solo `practice`. Las variantes `exam` y `failed` se definen acá |
| Comunes | `comun.md`: §3 barra interna, §5 estados (K1, K3, K4, K5, K6, K7), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra interna con título «pKapp · Elegir tema» y volver |
| Variantes | A: `practice`, o `failed` con fallos. B: `exam`. C: `failed` sin fallos. Cada una con o sin filtro de parcial (`materia.config.parciales`) |
| Fuera de alcance | Variante C (estado vacío): su lugar está fijado; su ficha es `Vacios.md` (V2) |
| Propuestas | Sección f: `TOPIC-P1` a `TOPIC-P5`. Sección h: conservado de main (D10). Comunes: `COMUN-P2` |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P3`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.5 |

---

## a. Layout a 390 px

### a.1 Variante A: practicar o repasar fallos

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3 |
| 2 | Panel de filtros | `paso 4` | `paso 5` | `paso 3` | Fuente, parcial (si la materia tiene parciales) y temporizador (a.3) |
| 3 | Tarjeta «Todos los temas mezclados» | — | `paso 5` | — | Glifo, rótulo «Mezcla», título y conteo (a.4) |
| 4 | Rótulo de sección | `paso 4` | `paso 5` | `paso 2` | «O elegí un tema específico:» |
| 5 | Lista de temas | — | `paso 5` | — | Filete superior `linea`; una fila por tema con al menos una pregunta |
| 6 | Relleno inferior del scroll | — | — | `paso 8` | Fin del scroll |

### a.2 Variante B: modo examen

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3 |
| 2 | Panel de filtros | `paso 4` | `paso 5` | `paso 3` | Igual que en A |
| 3 | Tarjeta «Modo Examen» | — | `paso 5` | — | Lámina de `comun.md` §6, contenido centrado, relleno `paso 4` |
| 4 | Relleno inferior del scroll | — | — | `paso 8` | Fin del scroll |

Interior de la tarjeta «Modo Examen», de arriba abajo: título (`titulo`), texto del sorteo (`cuerpo`, margen superior `paso 2`), disponibles (`cuerpo-fuerte`, margen superior `paso 3.5`), botón (margen superior `paso 5`, relleno horizontal `paso 8` y vertical `paso 3.5`, el de los otros botones K1).

### a.3 Interior del panel de filtros

| # | Parte | Medidas | Divisor | Contenido |
|---|---|---|---|---|
| 1 | Marco del panel | Relleno `paso 3.5` en las cuatro caras | — | Los grupos en orden |
| 2 | Grupo «Fuente» | Rótulo con margen inferior `paso 2` | Divisor `filete` debajo, margen vertical `paso 3.5` | Tres filtros |
| 3 | Grupo «Parcial» | Igual | Divisor `filete` debajo, margen vertical `paso 3.5` | «Examen» y un filtro por parcial; el grupo no existe si la materia no tiene parciales |
| 4 | Grupo «Temporizador» | Rótulo con margen inferior `paso 2` | — | Cuadrado menos, valor, cuadrado más; separación `paso 4` |

Filtros: alto `paso 11`, relleno horizontal `paso 3`, separación `paso 2` en horizontal y en vertical, con salto de línea.

### a.4 Interior de la tarjeta de mezcla y de una fila de tema

| Pieza | Medidas | Contenido |
|---|---|---|
| Tarjeta de mezcla | Relleno vertical `paso 3`, horizontal `paso 3.5`; separación `paso 3` entre glifo y texto | `glifo-aleatorio` y, en el bloque de texto, rótulo «Mezcla» (margen inferior `paso 1.5`), título y conteo (margen superior `paso 1`) |
| Fila de tema | Relleno vertical `paso 3`; separación `paso 3` entre columnas; alto mínimo `paso 11` | Índice, nombre con conteo debajo, chevron |

### a.5 Tablet (D10); desde 1024 px, sección «Escritorio»

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Panel, tarjeta y filas llenan la columna. Los filtros saltan de línea cuando no entran |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P3`, aprobada): `hoja`; `hoja-amplia` desde `amplio` | Igual | Panel con sus tres grupos en una fila; temas en 2 columnas (3 desde `amplio`) con flujo por columnas |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. Los filtros saltan de línea con `paso 2` entre ellos y el nombre salta dentro del filtro si no entra; en el temporizador, los dos cuadrados de `paso 11` conservan su lado y el valor queda entre ambos. En la tarjeta de mezcla y en cada fila de tema el nombre salta de línea; el glifo, el índice y el chevron conservan su ancho. En «Modo Examen» el texto del sorteo salta de línea y «Comenzar examen» conserva su alto y salta de línea si su texto no entra |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Barra interna | `comun.md` §3 | | | | | | |
| Panel de filtros | — | `superficie` | `linea`, `border` | — | Divisores `filete` | — | N1, N2, X2 |
| Rótulo de grupo | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| Filtro en reposo (K4) | `tinta` | `superficie` | `borde`, `border` | `cuerpo` | — | — | T2, N4 |
| Filtro seleccionado (K4) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | — | T7, N6 |
| Cuadrado menos y más (K5) | `tinta` | `superficie` | `linea`, `border` | — | — | `glifo-menos`, `glifo-mas` | N2, N6 |
| Cuadrado en el extremo (K5) | `inactivo` | `superficie` | `filete`, `border` | — | — | `glifo-menos` o `glifo-mas` | X5 |
| Valor del temporizador | `tinta` | `superficie` | — | `cuerpo-fuerte` | — | — | T2 |
| Tarjeta de mezcla (K6, acento) | `tinta` | `superficie` | `acento`, `border-2` | Título `item`; conteo `detalle` | — | `glifo-aleatorio` (grande), `acento` | T2, T4, N18 |
| Rótulo «Mezcla» | `acento` | `superficie` | — | `rotulo` | — | — | T6 |
| Rótulo de sección | `acento` | `fondo` | — | `rotulo` | — | — | T5 |
| Lista de temas | — | `fondo` | — | — | Superior `linea`; entre filas `filete` | — | N1, X1 |
| Índice de fila | `tintaSec` | `fondo` | — | `rotulo` | — | — | T3 |
| Nombre de tema | `tinta` | `fondo` | — | `item` | — | — | T1 |
| Conteo de tema | `tintaSec` | `fondo` | — | `detalle` | — | — | T3 |
| Chevron | `tintaSec` | `fondo` | — | — | — | `glifo-chevron` | N19 |
| Tarjeta «Modo Examen» (cuerpo) | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | — | — | N1, N2 |
| Título «Modo Examen» | `tinta` | `superficie` | — | `titulo` | — | — | T2 |
| Texto del sorteo | `tintaSec` | `superficie` | — | `cuerpo` | — | — | T4 |
| Disponibles | `acento` | `superficie` | — | `cuerpo-fuerte` | — | — | T6 |
| Botón «Comenzar examen» (K1) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | — | T7 |
| Estado vacío de `failed` | `Vacios.md` b | | | | | | |

---

## c. Matriz de estados

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado | Estado de dato |
|---|---|---|---|---|---|---|---|
| Filtro de fuente (K4) | Borde `borde`; texto `tinta` | Borde `linea` | Inversión: aspecto de seleccionado | Contorno `foco`, `border-2`, separado `paso 0.5` | Fondo `tinta`; texto `fondo` en `cuerpo-fuerte`; estado accesible seleccionado | — | Origen de la pregunta: «Todas», «Solo preguntas reales» y «Solo generadas» filtran la base; «Solo generadas» incluye también las preguntas del usuario |
| Filtro de parcial (K4) | Igual | Igual | Igual | Igual | Igual | — | Insignias de parcial en el quiz: `comun.md` §12.2 y §12.3 |
| Cuadrado menos (K5) | Borde `linea`; glifo `tinta` | Contorno web `linea`, `border` | Inversión | Contorno `foco` | — | Borde `filete`; glifo `inactivo`; con el valor en «Sin límite» | — |
| Cuadrado más (K5) | Igual | Igual | Igual | Igual | — | Igual, con el valor en el máximo de la lista | — |
| Valor del temporizador | Estático | — | — | — | — | — | «Sin límite» o «{n} min» |
| Tarjeta de mezcla (K6) | Borde `acento`, `border-2`; fondo `superficie` | Contorno web `acento`, `border` | Inversión total: fondo `tinta`; texto y glifo `fondo` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — | Con cero preguntas sigue activa; el toque muestra el aviso del sistema (comportamiento actual) |
| Fila de tema (K7) | Texto `tinta`; filete inferior `filete` | Contorno web `linea`, `border` | Inversión total | Contorno `foco` | — | — | Solo aparece con al menos una pregunta tras los filtros |
| Botón «Comenzar examen» (K1) | Fondo `tinta`; texto `fondo` | Contorno web `linea`, `border-2` | Inversión: fondo `superficie`; texto `tinta`; borde `linea` | Contorno `foco` | — | — | — |
| Botón volver de la barra | `comun.md` §3 | `comun.md` §3 | `comun.md` §3 | `comun.md` §3 | — | — | — |
| Estado vacío de `failed` | `Vacios.md` c | `Vacios.md` c | `Vacios.md` c | `Vacios.md` c | — | — | Sin preguntas falladas |

Aciertos, errores, banda intermedia y banco reducido no aparecen en esta pantalla (—).

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Modo | `route.params.mode` | `practice`, `exam` o `failed` |
| Filtros de fuente | `SOURCE_FILTERS` | `all` «Todas», `exam` «Solo preguntas reales», `generated` «Solo generadas» |
| Filtros de parcial | `materia.config.parciales`; `{ all: 'Examen', ...p.id → p.label }` | `null` si la materia no tiene parciales: el grupo se omite |
| Opciones del temporizador | `TIMER_OPTIONS`: 0 y de 10 a 120 de a 10 | 0 se muestra «Sin límite»; el resto «{n} min» |
| Base filtrada | `filteredBase`: fuente, luego parcial, luego fallos (`failed`), luego `dedupeQuestions` | `generated` incluye `source === 'user'` |
| Conteo por tema | `countByTopic` sobre `filteredBase` | Solo se listan temas con al menos una pregunta |
| Nombre de tema | `TOPICS[key]` de la materia | — |
| Tamaño del examen | `examSize` sin parcial; `examSizeParcial` con parcial; `Math.min(tamaño, preguntas)` | Texto del sorteo y de disponibles |
| Preguntas propias | `getUserQuestions(materiaId)` | Se suman a las de la materia |
| Fallos | `getFailedQuestions(materiaId)` | Solo en `failed` |
| Retroalimentación | `getSetting('hide_feedback', 'false')` | Se pasa como `hideFeedback` al quiz |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Un toque inicia el quiz | Tarjeta de mezcla, fila de tema o «Comenzar examen»: `startQuiz(topic)` con los mismos parámetros (`questions`, `mode`, `topic`, `hideFeedback`, `timerMinutes`). Sin cambio de gestos |
| Sin preguntas | `avisar('Sin preguntas', 'No hay preguntas disponibles con los filtros actuales.')`: diálogo del sistema, fuera del sistema visual |
| Filtros por defecto | Fuente «Todas», parcial «Examen», temporizador «Sin límite» |
| Orden de temas | El de `Object.entries(TOPICS)` |
| Origen visible | El filtro de fuente sigue exponiendo la distinción real, generada y propia con el copy actual |
| Sin emoji, radio ni sombra | El emoji de la mezcla, `rounded-*` y `sombras.cardSuave` salen de esta pantalla |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/TopicSelectScreen.js`: sin resultados.

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| Ninguno | — | — | La pantalla no emite eventos y la ficha no agrega ninguno |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Mezcla | Emoji de dado y «Todos los temas mezclados» | «Todos los temas mezclados» con `glifo-aleatorio` | Reemplazo de emoji |
| Rótulo de la mezcla | No existe | «Mezcla», sobre el título | Texto del boceto aprobado por el usuario |
| Temporizador | Caracteres «−» y «+» | `glifo-menos` y `glifo-mas` | Reemplazo de símbolo |
| Rótulos de grupo | «Fuente:», «Parcial:», «Temporizador:» | «Fuente», «Parcial», «Temporizador», sin dos puntos; el paso los muestra en mayúsculas | Texto del boceto aprobado por el usuario |
| Sección | «O elegí un tema específico:» | Igual | — |
| Conteos | «{n} preguntas» | Igual | — |
| Índice de fila | No existe | Posición con dos dígitos | Elemento del boceto, derivado de datos |
| Modo examen | «Modo Examen», texto del sorteo, «Disponibles: {n} preguntas», «Comenzar examen» | Iguales | — |

---

## f. Propuestas aprobadas (D10)

Cambios del boceto respecto de `main`, o de `main` respecto del boceto. El usuario los aprobó el 2026-10-10 (D10): rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| TOPIC-P1 | Los filtros de fuente y de parcial van separados por `paso 2` en horizontal y en vertical. El boceto los dibuja pegados, con el borde compartido | Objetivo táctil de D10: con filtros contiguos y sin separación se confunde el toque; separados, cada uno es un objetivo propio y el salto de línea no depende de bordes superpuestos | visual | aprobada (usuario, 2026-10-10) |
| TOPIC-P2 | La tarjeta «Todos los temas mezclados» lleva el rótulo «Mezcla» en `rotulo` y `acento` (T6) sobre el título, con margen inferior `paso 1.5`, y `glifo-aleatorio` a su izquierda. El rótulo es el texto del boceto; el glifo reemplaza al emoji del dado (spec «Interfaz sin emojis») | Texto del boceto aprobado por el usuario; `main` no tiene el rótulo | visual | aprobada (usuario, 2026-10-10) |
| TOPIC-P3 | Los rótulos de grupo van sin dos puntos: «Fuente», «Parcial», «Temporizador», en `rotulo` y `tintaSec`. Es el texto del boceto; `main` los escribe con dos puntos | Texto del boceto aprobado por el usuario | visual | aprobada (usuario, 2026-10-10) |
| TOPIC-P4 | Cada fila de tema muestra el conteo como «{n} preguntas» bajo el nombre (`detalle`, `tintaSec`). El boceto lo muestra como cifra suelta entre el nombre y el chevron | Copy actual: «preguntas» acompaña a la cifra en `main` | visual | aprobada (usuario, 2026-10-10) |
| TOPIC-P5 | La variante `exam` reemplaza la tarjeta de mezcla y la lista de temas por una tarjeta «Modo Examen» bajo el mismo panel de filtros: lámina de `comun.md` §6 con marcas de esquina y contenido centrado (título, texto del sorteo, disponibles en `acento`, botón «Comenzar examen» K1). El boceto solo dibuja la variante `practice` | Cobertura: el modo examen existe en `main` y el boceto no lo dibuja; la tarjeta extiende el lenguaje de lámina | visual | aprobada (usuario, 2026-10-10) |

Propuestas comunes que alcanzan esta pantalla: `COMUN-P2` (estados de control).

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta aprobada (f).

| Boceto | Ficha | Motivo |
|---|---|---|
| Cuadrado de 36 | Lado `paso 11` | D10: objetivo táctil mínimo de 44 × 44 pt |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite o dibuja distinto. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| TOPIC-C1 | Las tres variantes por `mode` (`practice`, `exam`, `failed`) y el toque único que inicia el quiz: tarjeta de mezcla, fila de tema o «Comenzar examen», con los mismos parámetros. El boceto solo dibuja `practice` | `main` es la base de funciones (d.2) | uso |
| TOPIC-C2 | Los valores de partida de los filtros: fuente «Todas», parcial «Examen» y temporizador «Sin límite»; el grupo «Parcial» solo existe con parciales | Valores de partida de `main` (d.2) | uso |
| TOPIC-C3 | Las opciones del temporizador (`TIMER_OPTIONS`): «Sin límite» y de 10 a 120 minutos de a 10; el cuadrado del extremo se apaga. El boceto dibuja un solo valor | Dato de `main` (d.1) | dato |
| TOPIC-C4 | La tarjeta «Modo Examen» de la variante `exam`: título, texto del sorteo según `examSize` o `examSizeParcial`, «Disponibles: {n} preguntas» y «Comenzar examen». Su contenido es de `main`; su lámina es `TOPIC-P5` | Función y copy de `main` (d.1, e) | uso |
| TOPIC-C5 | El orden de los temas (el de `TOPICS`), solo con los que tienen al menos una pregunta tras los filtros, y «Solo generadas» incluye las preguntas del usuario | Orden de uso y datos de `main` (c, d.1) | dato |

---

## Escritorio · propuesta `ESC-P3` (tarea 3.10, aprobada por el usuario el 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); `amplio` suma una columna a la lista de temas. Teléfono y tablet no cambian |
| Bajo el corte | a.5 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E03a (practicar, con parcial, 27 temas) y E03b (modo examen), a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Las tres variantes por `mode`, el toque único que inicia el quiz (d.2), filtros y valores de partida (d.1), copy de e, elementos y pares de b, estados de c, `TOPIC-C1` a `TOPIC-C5` |

### Disposición

| # | Región | Contenido, en orden de DOM | Escritorio | Amplio |
|---|---|---|---|---|
| 1 | Barra interna | `comun.md` §3 | Contenido dentro de `hoja` | Dentro de `hoja-amplia` |
| 2 | Panel de filtros | Fuente, Parcial (si la materia tiene parciales) y Temporizador (a.3) | A ancho de hoja; los grupos en una fila, separados por un filete vertical `filete`. Fuente y Parcial reparten el ancho sobrante y Temporizador toma el de su contenido; los filtros saltan de línea dentro de su grupo | Igual; los filtros entran en una línea |
| 3 | Tarjeta de mezcla (A) o «Modo Examen» (B) | a.4 y a.2 | Mezcla a ancho de hoja. «Modo Examen» (`TOPIC-P5`): centrada, con tope `lectura` | Igual |
| 4 | Rótulo de sección (A) | «O elegí un tema específico:» | Sin cambio | Sin cambio |
| 5 | Lista de temas (A) | Una fila por tema con al menos una pregunta (a.4), en el orden de `TOPICS` | Filete superior `linea` a ancho de hoja; 2 columnas con flujo por columnas, `paso 8` entre ellas | 3 columnas |

La variante C (estado vacío de `failed`) es `Vacios.md` (`ESC-P12`).

### Medidas

| Elemento | Medida |
|---|---|
| Panel | Relleno `paso 3.5` y `paso 2` entre filtros (`TOPIC-P1`), como en a.3; el divisor entre grupos pasa de horizontal a vertical, con `paso 3.5` a cada lado |
| Fila de tema | Alto mínimo `paso 11`, índice, nombre con conteo y chevron, como en a.4 |
| Flujo de la lista | El orden baja por la primera columna y sigue por la siguiente: con 27 temas, 01 a 14 y 15 a 27 en escritorio; 01 a 09, 10 a 18 y 19 a 27 desde `amplio` |
| Mezcla | K6 de acento sin cambio; llena su ancho |

### Revisado

| Ancho de ventana | Qué se ve | Alto del contenido |
|---|---|---|
| 1024 (el corte) | Panel con grupos que saltan de línea y 2 columnas de temas; sin scroll horizontal | — |
| 1366 × 768 | Panel, mezcla y los primeros temas en la primera ventana; en la materia de 27 temas, la lista entera pide desplazarse | 2,1 ventanas (con `columna`: 3,8) |
| 1920 × 1080 | Panel, mezcla y los 27 temas (3 columnas de 9) en una ventana | 1,0 ventanas (con `columna`: 2,5) |

### Orden, teclado y foco

| Aspecto | Regla |
|---|---|
| Orden de DOM | El del teléfono: barra, panel, mezcla, rótulo, temas 01 a NN |
| Tab | Volver, filtros de fuente, de parcial, menos y más, mezcla, temas en orden: el foco baja por una columna y pasa a la siguiente, como la lectura |
| Cambia de lugar | Los grupos del panel pasan de apilados a una fila; el panel sigue arriba de la mezcla y de los temas |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P3` | Desde el corte `escritorio`, los tres grupos del panel de filtros van en una fila a ancho de hoja y la lista de temas pasa a columnas (2; 3 desde `amplio`) con flujo por columnas; el modo examen centra su tarjeta con tope `lectura` | La materia con más temas (27) pide casi cuatro ventanas en una columna. Los grupos de filtros son hermanos y caben en fila; los temas se leen como un índice, de arriba abajo y por columnas | visual | aprobada (usuario, 2026-10-11) |
