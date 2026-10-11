# TopicSelect · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `TopicSelectScreen` (`src/screens/TopicSelectScreen.js`), ruta `TopicSelect`, parámetro `mode` (`practice`, `exam`, `failed`) |
| Boceto | Figura 03 «Elegir tema» (`hibrido.html`); cubre solo `practice`. Las variantes `exam` y `failed` se definen acá |
| Comunes | `comun.md`: §3 barra interna, §5 estados (K1, K3, K4, K5, K6, K7), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra interna con título «pKapp · Elegir tema» y volver |
| Variantes | A: `practice`, o `failed` con fallos. B: `exam`. C: `failed` sin fallos. Cada una con o sin filtro de parcial (`materia.config.parciales`) y con o sin filtro de fuente (la materia tiene o no preguntas propias, `TOPIC-P6`): el panel lleva de uno a tres grupos |
| Fuera de alcance | Variante C (estado vacío): su lugar está fijado; su ficha es `Vacios.md` (V2) |
| Propuestas | Sección f: `TOPIC-P1` a `TOPIC-P5` (usuario, 2026-10-10) y `TOPIC-P6`, el grupo «Fuente» (usuario, 2026-10-11; f.1). Sección h: conservado de main (D10). Comunes: `COMUN-P2` |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P3`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.5 |

---

## a. Layout a 390 px

### a.1 Variante A: practicar o repasar fallos

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3 |
| 2 | Panel de filtros | `paso 4` | `paso 5` | `paso 3` | Fuente (si la materia tiene preguntas propias), parcial (si la materia tiene parciales) y temporizador (a.3) |
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
| 1 | Marco del panel | Relleno `paso 3.5` en las cuatro caras | — | Los grupos presentes, en orden |
| 2 | Grupo «Fuente» | Rótulo con margen inferior `paso 2` | Divisor `filete` debajo, margen vertical `paso 3.5` | Dos filtros, «Todas» y «Solo mías»; el grupo no existe si la materia no tiene preguntas propias (`TOPIC-P6`, f.1) |
| 3 | Grupo «Parcial» | Igual | Divisor `filete` debajo, margen vertical `paso 3.5` | «Examen» y un filtro por parcial; el grupo no existe si la materia no tiene parciales |
| 4 | Grupo «Temporizador» | Rótulo con margen inferior `paso 2` | — | Cuadrado menos, valor, cuadrado más; separación `paso 4`. Siempre está y siempre es el último |

Filtros: alto `paso 11`, relleno horizontal `paso 3`, separación `paso 2` en horizontal y en vertical, con salto de línea.

El divisor pertenece al grupo que lo precede: un grupo ausente no deja divisor ni hueco. Con n grupos hay n − 1 divisores; con «Temporizador» solo, ninguno (f.1, tabla 1).

### a.4 Interior de la tarjeta de mezcla y de una fila de tema

| Pieza | Medidas | Contenido |
|---|---|---|
| Tarjeta de mezcla | Relleno vertical `paso 3`, horizontal `paso 3.5`; separación `paso 3` entre glifo y texto | `glifo-aleatorio` y, en el bloque de texto, rótulo «Mezcla» (margen inferior `paso 1.5`), título y conteo (margen superior `paso 1`) |
| Fila de tema | Relleno vertical `paso 3`; separación `paso 3` entre columnas; alto mínimo `paso 11` | Índice, nombre con conteo debajo, chevron |

### a.5 Tablet (D10); desde 1024 px, sección «Escritorio»

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Panel, tarjeta y filas llenan la columna. Los filtros saltan de línea cuando no entran |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P3`, aprobada): `hoja`; `hoja-amplia` desde `amplio` | Igual | Panel con sus grupos presentes en una fila (`TOPIC-P6`, f.1); temas en 2 columnas (3 desde `amplio`) con flujo por columnas |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. El grupo «Fuente», de dos filtros cortos, entra en una línea (f.1, tabla 5). Los filtros saltan de línea con `paso 2` entre ellos y el nombre salta dentro del filtro si no entra; en el temporizador, los dos cuadrados de `paso 11` conservan su lado y el valor queda entre ambos. En la tarjeta de mezcla y en cada fila de tema el nombre salta de línea; el glifo, el índice y el chevron conservan su ancho. En «Modo Examen» el texto del sorteo salta de línea y «Comenzar examen» conserva su alto y salta de línea si su texto no entra |

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
| Filtro de fuente (K4) | Borde `borde`; texto `tinta` | Borde `linea` | Inversión: aspecto de seleccionado | Contorno `foco`, `border-2`, separado `paso 0.5` | Fondo `tinta`; texto `fondo` en `cuerpo-fuerte`; estado accesible seleccionado | — | Origen de la pregunta: «Todas» no filtra la base; «Solo mías» la deja en las preguntas propias del usuario (`source === 'user'`). El grupo existe solo con preguntas propias en la materia (f.1) |
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

Estados del grupo «Fuente» según el dato (carga, sin propias, con propias, última propia eliminada): f.1, tabla 3. El filtro de fuente nunca está deshabilitado: «Solo mías» solo existe cuando hay propias que elegir.

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Modo | `route.params.mode` | `practice`, `exam` o `failed` |
| Filtros de fuente | `SOURCE_FILTERS`; `{ all: 'Todas', user: 'Solo mías' }` (`TOPIC-P6`) | `null` si `userQuestions.length === 0`: el grupo se omite, como el de parcial. El valor efectivo es `all` siempre que el grupo no se dibuje (f.1, tabla 3) |
| Filtros de parcial | `materia.config.parciales`; `{ all: 'Examen', ...p.id → p.label }` | `null` si la materia no tiene parciales: el grupo se omite |
| Opciones del temporizador | `TIMER_OPTIONS`: 0 y de 10 a 120 de a 10 | 0 se muestra «Sin límite»; el resto «{n} min» |
| Base filtrada | `filteredBase`: fuente, luego parcial, luego fallos (`failed`), luego `dedupeQuestions` | `user` deja `source === 'user'`; `all` no filtra. Las preguntas propias no traen `parcial`: con un parcial distinto de «Examen» no pasa ninguna (V4 con el mensaje de `VAC-P5`, `Vacios.md`) |
| Conteo por tema | `countByTopic` sobre `filteredBase` | Solo se listan temas con al menos una pregunta |
| Nombre de tema | `TOPICS[key]` de la materia | — |
| Tamaño del examen | `examSize` sin parcial; `examSizeParcial` con parcial; `Math.min(tamaño, preguntas)` | Texto del sorteo y de disponibles |
| Preguntas propias | `getUserQuestions(materiaId)`, cargadas al abrir la pantalla | Se suman a las de la materia y habilitan el grupo «Fuente». Hasta que la primera carga resuelve, el panel no se dibuja (f.1, tabla 3) |
| Fallos | `getFailedQuestions(materiaId)` | Solo en `failed` |
| Retroalimentación | `getSetting('hide_feedback', 'false')` | Se pasa como `hideFeedback` al quiz |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Un toque inicia el quiz | Tarjeta de mezcla, fila de tema o «Comenzar examen»: `startQuiz(topic)` con los mismos parámetros (`questions`, `mode`, `topic`, `hideFeedback`, `timerMinutes`). Sin cambio de gestos |
| Sin preguntas | `avisar('Sin preguntas', 'No hay preguntas disponibles con los filtros actuales.')`: diálogo del sistema, fuera del sistema visual |
| Filtros por defecto | Fuente «Todas» (solo con preguntas propias), parcial «Examen», temporizador «Sin límite» |
| Orden de temas | El de `Object.entries(TOPICS)` |
| Origen visible (D6) | El filtro de fuente separa las preguntas propias del resto del banco («Solo mías»); el origen de cada pregunta sigue visible en el chip del quiz (`Quiz.md` c.3). Los bancos publicados no tienen preguntas generadas que distinguir (`TOPIC-P6`) |
| Grupo condicional | «Fuente» existe solo con preguntas propias en la materia. Sin ellas: ni rótulo, ni filtros, ni divisor ni hueco (f.1) |
| Sin selección oculta | Si el grupo «Fuente» no se dibuja, el filtro de fuente vale «Todas»: ninguna elección que no se ve reduce la base, los conteos ni el sorteo del examen |
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
| Filtros de fuente | «Todas», «Solo preguntas reales», «Solo generadas» | «Todas» y «Solo mías»; el grupo, solo con preguntas propias | `TOPIC-P6`: el banco publicado no tiene preguntas generadas y «Solo generadas» solo mostraba las propias |
| Sección | «O elegí un tema específico:» | Igual | — |
| Conteos | «{n} preguntas» | Igual | — |
| Índice de fila | No existe | Posición con dos dígitos | Elemento del boceto, derivado de datos |
| Modo examen | «Modo Examen», texto del sorteo, «Disponibles: {n} preguntas», «Comenzar examen» | Iguales | — |

---

## f. Propuestas aprobadas (D10)

Cambios del boceto respecto de `main`, o de `main` respecto del boceto. El usuario aprobó `TOPIC-P1` a `TOPIC-P5` el 2026-10-10 (D10) y `TOPIC-P6` el 2026-10-11: rigen tal como están descritos acá, en f.1 y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| TOPIC-P1 | Los filtros de fuente y de parcial van separados por `paso 2` en horizontal y en vertical. El boceto los dibuja pegados, con el borde compartido | Objetivo táctil de D10: con filtros contiguos y sin separación se confunde el toque; separados, cada uno es un objetivo propio y el salto de línea no depende de bordes superpuestos | visual | aprobada (usuario, 2026-10-10) |
| TOPIC-P2 | La tarjeta «Todos los temas mezclados» lleva el rótulo «Mezcla» en `rotulo` y `acento` (T6) sobre el título, con margen inferior `paso 1.5`, y `glifo-aleatorio` a su izquierda. El rótulo es el texto del boceto; el glifo reemplaza al emoji del dado (spec «Interfaz sin emojis») | Texto del boceto aprobado por el usuario; `main` no tiene el rótulo | visual | aprobada (usuario, 2026-10-10) |
| TOPIC-P3 | Los rótulos de grupo van sin dos puntos: «Fuente», «Parcial», «Temporizador», en `rotulo` y `tintaSec`. Es el texto del boceto; `main` los escribe con dos puntos | Texto del boceto aprobado por el usuario | visual | aprobada (usuario, 2026-10-10) |
| TOPIC-P4 | Cada fila de tema muestra el conteo como «{n} preguntas» bajo el nombre (`detalle`, `tintaSec`). El boceto lo muestra como cifra suelta entre el nombre y el chevron | Copy actual: «preguntas» acompaña a la cifra en `main` | visual | aprobada (usuario, 2026-10-10) |
| TOPIC-P5 | La variante `exam` reemplaza la tarjeta de mezcla y la lista de temas por una tarjeta «Modo Examen» bajo el mismo panel de filtros: lámina de `comun.md` §6 con marcas de esquina y contenido centrado (título, texto del sorteo, disponibles en `acento`, botón «Comenzar examen» K1). El boceto solo dibuja la variante `practice` | Cobertura: el modo examen existe en `main` y el boceto no lo dibuja; la tarjeta extiende el lenguaje de lámina | visual | aprobada (usuario, 2026-10-10) |
| TOPIC-P6 | El grupo «Fuente» pasa de tres filtros («Todas», «Solo preguntas reales», «Solo generadas») a dos, «Todas» y «Solo mías» («Solo mías» deja las preguntas propias del usuario, `source === 'user'`), y solo se dibuja si la materia tiene al menos una pregunta propia. Sin ellas no hay rótulo, filtros, divisor ni hueco, y el filtro vale «Todas». Si «Solo mías» está marcado y las propias pasan a cero, el grupo desaparece y el filtro vuelve a «Todas». El panel lleva de uno a tres grupos y los divisores van solo entre grupos presentes | Ningún banco publicado tiene preguntas generadas (los seis son `source: 'exam'`): «Solo preguntas reales» filtraba el banco entero y «Solo generadas» solo mostraba las preguntas propias, con un nombre que ya no es cierto | uso | aprobada (usuario, 2026-10-11) |

Propuestas comunes que alcanzan esta pantalla: `COMUN-P2` (estados de control).

### f.1 `TOPIC-P6` · grupo «Fuente»

Decisión del usuario (2026-10-11). Define cuándo existe el grupo, qué pasa cuando el dato cambia y cómo se reparte el panel con uno, dos o tres grupos. Reemplaza la cláusula «“Solo generadas” incluye las preguntas del usuario» de `TOPIC-C5`, el invariante «Origen visible» anterior (d.2) y, en `ESC-P3`, el reparto del ancho sobrante entre «Fuente» y «Parcial» (sección «Escritorio», Disposición #2).

Cinco reglas las derivó el Diseñador para poder implementar la decisión, y las confirmó el Ingeniero (2026-10-11): la carga sin parpadeo (tabla 3, caso 1), «Todas» al reaparecer el grupo (tabla 3, caso 6), el foco al desaparecer (tabla 3, aspectos del caso 5), el reparto del ancho en escritorio (tabla 4, «Fuente» y «Temporizador» por contenido y «Parcial» el sobrante) y el ancho del panel con un solo grupo (tabla 4, «Ancho del panel»). Rigen como el resto de `TOPIC-P6`.

Figuras de la maqueta (3.13b): 03a (caso 4, con propias), 03b (caso 2, modo examen), 03c (los cuatro casos), 12d y 12e (V4, `Vacios.md`), y a escritorio E03a, E03b y E03c.

**Tabla 1 · Qué grupos tiene el panel**

| Caso | Fuente | Parcial | Temporizador | Divisores | Con los datos de hoy |
|---|---|---|---|---|---|
| 1 | no | no | sí | 0 | Materia sin parciales y sin preguntas propias |
| 2 | sí | no | sí | 1 | Materia sin parciales, con preguntas propias |
| 3 | no | sí | sí | 1 | Materia con parciales (`bcyt` y `anatomia`), sin preguntas propias |
| 4 | sí | sí | sí | 2 | Materia con parciales, con preguntas propias |

**Tabla 2 · El grupo «Fuente»**

| Pieza | Valor |
|---|---|
| Rótulo | «Fuente», `rotulo`, `tintaSec` (T4), sin dos puntos (`TOPIC-P3`) |
| Filtros | Dos, de clase K4, en este orden: «Todas» (`all`, marcado al entrar) y «Solo mías» (`user`) |
| Aspecto, medidas y estados | Los de K4 en b y c; `paso 2` entre filtros (`TOPIC-P1`). Ninguno se deshabilita |
| Condición | La materia activa tiene al menos una pregunta propia (`getUserQuestions(materiaId)`) |
| Accesibilidad | Grupo `radiogroup` con `accessibilityLabel` «Fuente»; cada filtro, `radio` con su texto visible y su estado marcado |
| Teclado | Una parada de Tab por filtro; las flechas alternan «Todas» y «Solo mías» con vuelta (`comun.md` §5.2, 2.9-7) |

**Tabla 3 · Estados del grupo según el dato**

| # | Condición | Qué se ve | Filtro efectivo |
|---|---|---|---|
| 1 | La primera carga de las preguntas propias no resolvió (los tres modos) | Solo la barra interna sobre `fondo`: ni panel ni contenido. Es el criterio de `VAC-P4` aplicado al panel, para que no cambie de tamaño cuando llega el dato | — |
| 2 | La carga resolvió y la materia no tiene preguntas propias (o la carga falló) | El panel sin el grupo: ni rótulo, ni filtros, ni divisor ni hueco | «Todas» |
| 3 | La carga resolvió y hay una o más preguntas propias | El grupo, con «Todas» marcado | «Todas» |
| 4 | «Solo mías» marcado | Base, conteos, mezcla, temas y «Disponibles» sobre las propias; parcial y temporizador conservan su valor | «Solo mías» |
| 5 | «Solo mías» marcado y la materia pasa a cero preguntas propias | En ese mismo render el grupo ya no está y el filtro vuelve a «Todas»: base, conteos, mezcla, temas y «Disponibles» se recalculan sobre todo el banco, con el parcial vigente | «Todas» |
| 6 | Vuelve a haber una pregunta propia | El grupo, con «Todas» marcado: la elección anterior no se recuerda | «Todas» |

| Aspecto del caso 5 | Regla |
|---|---|
| Por qué «Todas» | Un filtro activo sin control a la vista dejaría el banco reducido sin que el usuario pudiera verlo ni deshacerlo (d.2, «Sin selección oculta») |
| Foco | Si estaba en «Solo mías», pasa al primer control que queda en el panel: el primer filtro de parcial o, sin parciales, el cuadrado «menos» |
| Aviso | Sin región viva: la lista cambia como con cualquier otro filtro |
| Cuándo ocurre | Las propias se leen al abrir la pantalla y el borrado vive en Ajustes (`Settings.md`): dentro de un mismo montaje solo pasa si la pantalla recarga las propias estando abierta. La regla es el estado derivado, no un caso aparte: vale igual |

**Tabla 4 · Disposición cuando falta un grupo**

| Ancho | Regla |
|---|---|
| Teléfono y tablet (bajo `escritorio`) | Grupos apilados. Entre cada par de grupos presentes, divisor horizontal `filete` con `paso 3.5` de margen vertical. Sin «Fuente», el panel abre con «Parcial» o, sin parciales, con «Temporizador» |
| Escritorio (desde `escritorio`) | Grupos presentes en una fila, separados por un filete vertical `filete` con `paso 3.5` a cada lado entre cada par. «Fuente» y «Temporizador» toman el ancho de su contenido y «Parcial», el sobrante. Sin «Parcial», el sobrante queda vacío a la derecha del último grupo. «Temporizador» solo (caso 1) va a la izquierda, sin divisor |
| Ancho del panel | No cambia: el de la columna (`comun.md` §7.1) o el de la hoja (`ESC-P0`: los paneles llenan su región). Un grupo menos no estrecha el panel ni lo reordena |
| Orden de DOM | Fuente, Parcial, Temporizador, con los que haya |

**Tabla 5 · Medidas** (Chrome headless, IBM Plex Sans 15 px, relleno `paso 3` y borde `border`)

| Pieza | Medida |
|---|---|
| Filtro «Todas» | 66 px en reposo, 67 px marcado |
| Filtro «Solo mías» | 91 px en reposo, 93 px marcado |
| Grupo «Fuente» (dos filtros y `paso 2`) | 167 px como máximo, contra 383 px del grupo de tres filtros |
| Ancho útil del panel en teléfono | 320 px (ventana de 390), 290 px (360) y 250 px (320): el grupo entra en una línea en los tres |
| Alto del grupo «Fuente» en teléfono | 68 px (una fila) más su divisor de 29 px; antes, 120 px (dos filas) más 29 px |
| Alto del panel en teléfono, por caso de la tabla 1 | 98, 195, 247 y 344 px (casos 1 a 4) a 390, 360 y 320; la mezcla queda a 12 px (`paso 3`) debajo |
| Escritorio, tres grupos en `hoja` (922 px útiles) | «Fuente» 166 + «Parcial» 358 (ancho natural, con la marca de `PAR-P2`) + «Temporizador» 200 + dos divisores de 29 = 782 px: una sola fila, sin salto de línea. Medido en la maqueta a 1024, 1280, 1366 y 1920 |
| Alto del panel en escritorio | 98 px en los cuatro casos: una sola fila (borde, relleno `paso 3.5` y 68 px de grupo) |

**Tabla 6 · Combinaciones con otros filtros**

| Combinación | Resultado |
|---|---|
| «Solo mías» y parcial «Examen» | Las propias de todos los temas |
| «Solo mías» y un parcial | Cero preguntas: las propias no traen `parcial`. V4 de `Vacios.md` con su mensaje propio, «Tus preguntas no tienen parcial. Elegí "Examen" para verlas.» (`VAC-P5`, aprobada por el usuario el 2026-10-11); la mezcla sigue activa con «0 preguntas» y el toque muestra el aviso del sistema (V5, sin cambio: `VAC-C4`). Es lo que ya hacía «Solo generadas», ahora con el motivo a la vista |
| «Solo mías» en `failed` | Las propias falladas; sin ninguna, V4 |
| «Solo mías» en `exam` | El sorteo sale de las propias: `Math.min(tamaño, propias)`; el texto del sorteo y «Disponibles» siguen la regla de d.1 |

### f.2 Aceptación observable (`TOPIC-P6`)

Para la 3.x que lo implemente y para el e2e. `tools/e2e/suites/temas.js` codificaba el grupo de tres filtros y ancla el panel en el grupo «Fuente» (`medirTemas` y `DESPLAZAR_Y_MEDIR_PANEL`): sin preguntas propias ese grupo no existe, así que el arnés ancla el panel en «Temporizador», que siempre está. Se reescriben las comprobaciones sobre el orden y el marcado de los tres filtros, «Solo preguntas reales», V4 con «Solo generadas», el K4 de fuente y el panel de escritorio: el arnés repartía el sobrante por igual entre «Fuente» y «Parcial» y, en la materia sin parciales (V11), daba todo el sobrante a «Fuente»; ahora rigen la tabla 4 y las filas 15 y 16. Las propias se siembran en `localStorage['pkapp_user_questions:<materia>']` (filas con `id`, `topic`, `question`, `options` en JSON, `correct_index`, `explanation` y `created_at`) antes de abrir la pantalla; el perfil limpio (`LIMPIAR_DATOS`) no las trae.

Matriz: los cuatro casos de la tabla 1 (BCYT y RyD, con y sin propias) en 390 y en 1366 × 768, en claro y en oscuro. Las filas 1 a 4 y 15 a 17 se corren en toda la matriz.

| # | Comprobación | Esperado |
|---|---|---|
| 1 | Sin propias, BCYT, `practice`, 390 | Grupos «Parcial» y «Temporizador», en ese orden de DOM, con un divisor horizontal; ningún `radiogroup` «Fuente» ni texto «Solo mías», «Solo generadas» o «Solo preguntas reales» |
| 2 | Sin propias, RyD, `practice`, 390 | Un solo grupo, «Temporizador»; ningún divisor; el panel mide 98 px (borde, relleno, rótulo y control) y la mezcla queda a `paso 3` |
| 3 | Con propias, BCYT, 390 | Tres grupos en el orden «Fuente», «Parcial», «Temporizador» y dos divisores; el `radiogroup` «Fuente» tiene dos `radio`: «Todas» con `aria-checked="true"` y «Solo mías» con `false`, en una sola fila y a `paso 2` entre sí |
| 4 | Con propias, RyD, 390 | Dos grupos, «Fuente» y «Temporizador», con un divisor |
| 5 | «Solo mías» marcado (filas 3 y 4) | `aria-checked` pasa a «Solo mías»; el conteo de la mezcla es el de las propias tras `dedupeQuestions`; las filas son solo los temas con propias, en el orden de `TOPICS`, y suman el conteo de la mezcla; volver a «Todas» devuelve el del banco más las propias |
| 6 | «Solo mías» y «1er Parcial» (BCYT) | V4: la mezcla dice «0 preguntas» y bajo el rótulo de sección aparece el mensaje de `VAC-P5` («Tus preguntas no tienen parcial. Elegí "Examen" para verlas.»), no el de `VAC-P3`; panel y mezcla siguen visibles y el toque en la mezcla muestra el aviso de V5, sin cambio. Con «2do Parcial», lo mismo |
| 7 | `exam` con «Solo mías» | «Disponibles: N preguntas» con N igual a las propias; el texto del sorteo nombra `Math.min(examSize, N)` |
| 8 | `failed` con propias | Sin fallos: V2, sin panel, mezcla ni lista (`VAC-C1`). Con una propia fallada, «Solo mías» deja solo esa |
| 9 | Carga, los tres modos | En el instante de la primera lectura de `pkapp_user_questions:` el DOM de la pantalla no tiene panel, mezcla, filas ni tarjeta de examen; al resolver, el panel aparece completo en un paso y la mezcla no cambia de lugar después |
| 10 | La carga falla (opciones corruptas) | El panel aparece sin «Fuente» y el filtro vale «Todas» |
| 11 | Última propia eliminada con «Solo mías» marcado | El grupo no se dibuja y la base es la del banco entero. Hoy no hay camino que lo ejerza en un mismo montaje (Ajustes borra, TopicSelect lee al abrirse): lo verifica la lectura del Analista, que el valor efectivo se deriva de la presencia de propias y ningún estado deja `user` activo sin su grupo. Si la pantalla recarga las propias al enfocar, el e2e vacía la clave y vuelve a enfocar |
| 12 | Teclado | Tab recorre «Todas», «Solo mías» (si hay propias), los filtros de parcial, menos, más, la mezcla y los temas; Flecha derecha en «Todas» marca «Solo mías» y mueve el foco; otra vez, vuelve a «Todas» |
| 13 | Objetivos | A 320, «Todas» y «Solo mías» miden al menos 44 × 44 (`paso 11`), a `paso 2` entre sí y sin salto de línea |
| 14 | Sin desborde | `scrollWidth <= clientWidth` a 320, 360, 390, 768, 1024, 1366 y 1920, con y sin propias |
| 15 | Escritorio, 1366 × 768, con propias, BCYT | Tres grupos en una fila (mismo borde superior) y dos divisores verticales (`panel-divisor-vertical`) con `paso 3.5` a cada lado; «Fuente» mide a lo sumo su contenido (unos 167 px), «Parcial» no salta de línea y «Temporizador» termina a `paso 3.5` del borde derecho del panel; el panel mide la hoja |
| 16 | Escritorio, 1366 × 768, sin propias | BCYT: «Parcial» y «Temporizador» con un divisor. RyD: «Temporizador» solo, a la izquierda y sin divisor; el panel sigue midiendo la hoja (952 px) |
| 17 | Estados y colores, claro y oscuro | «Solo mías» toma los tokens de K4 de b y c: reposo `tinta` sobre `superficie` con borde `borde`; marcado `fondo` sobre `tinta` en `cuerpo-fuerte`; hover con borde `linea`; foco `foco`, `border-2`; rótulo «Fuente» en `tintaSec`; divisores `filete` |
| 18 | Copy | Ningún texto de la pantalla dice «generadas» ni «Solo preguntas reales»; el comentario de cabecera de `TopicSelectScreen.js` y la opción «Generadas» de `PaginaComponentes.js` dejan de nombrarlas |
| 19 | Sin transparencia | Sin `box-shadow`, `rgba`, `border-radius` ni `opacity` nuevos |

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
| TOPIC-C2 | Los valores de partida de los filtros: fuente «Todas», parcial «Examen» y temporizador «Sin límite»; el grupo «Parcial» solo existe con parciales (y el grupo «Fuente», solo con preguntas propias: `TOPIC-P6`) | Valores de partida de `main` (d.2) | uso |
| TOPIC-C3 | Las opciones del temporizador (`TIMER_OPTIONS`): «Sin límite» y de 10 a 120 minutos de a 10; el cuadrado del extremo se apaga. El boceto dibuja un solo valor | Dato de `main` (d.1) | dato |
| TOPIC-C4 | La tarjeta «Modo Examen» de la variante `exam`: título, texto del sorteo según `examSize` o `examSizeParcial`, «Disponibles: {n} preguntas» y «Comenzar examen». Su contenido es de `main`; su lámina es `TOPIC-P5` | Función y copy de `main` (d.1, e) | uso |
| TOPIC-C5 | El orden de los temas (el de `TOPICS`), solo con los que tienen al menos una pregunta tras los filtros. La cláusula de `main` «“Solo generadas” incluye las preguntas del usuario» la sustituye `TOPIC-P6`: «Solo mías» deja solo las propias | Orden de uso y datos de `main` (c, d.1) | dato |

---

## Escritorio · propuesta `ESC-P3` (tarea 3.10, aprobada por el usuario el 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); `amplio` suma una columna a la lista de temas. Teléfono y tablet no cambian |
| Bajo el corte | a.5 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E03a (practicar, BCYT con parcial y con propias, 27 temas), E03b (modo examen, CyR con propias) y E03c (el panel en los cuatro casos de f.1, tabla 1), a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Las tres variantes por `mode`, el toque único que inicia el quiz (d.2), filtros y valores de partida (d.1), copy de e, elementos y pares de b, estados de c, `TOPIC-C1` a `TOPIC-C5` |
| Ajustado por `TOPIC-P6` | La composición del panel (de uno a tres grupos) y el reparto del ancho sobrante entre grupos: f.1, tablas 1 y 4. Fila 2 de la Disposición, fila de 1024 de «Revisado» y la regla de Tab |

### Disposición

| # | Región | Contenido, en orden de DOM | Escritorio | Amplio |
|---|---|---|---|---|
| 1 | Barra interna | `comun.md` §3 | Contenido dentro de `hoja` | Dentro de `hoja-amplia` |
| 2 | Panel de filtros | Fuente (si la materia tiene preguntas propias), Parcial (si la materia tiene parciales) y Temporizador (a.3) | A ancho de hoja; los grupos presentes en una fila, con un filete vertical `filete` entre cada par. Fuente y Temporizador toman el ancho de su contenido y Parcial, el sobrante (`TOPIC-P6`, f.1, tabla 4); los filtros saltan de línea dentro de su grupo solo si no entran | Igual; los filtros entran en una línea |
| 3 | Tarjeta de mezcla (A) o «Modo Examen» (B) | a.4 y a.2 | Mezcla a ancho de hoja. «Modo Examen» (`TOPIC-P5`): centrada, con tope `lectura` | Igual |
| 4 | Rótulo de sección (A) | «O elegí un tema específico:» | Sin cambio | Sin cambio |
| 5 | Lista de temas (A) | Una fila por tema con al menos una pregunta (a.4), en el orden de `TOPICS` | Filete superior `linea` a ancho de hoja; 2 columnas con flujo por columnas, `paso 8` entre ellas | 3 columnas |

La variante C (estado vacío de `failed`) es `Vacios.md` (`ESC-P12`).

### Medidas

| Elemento | Medida |
|---|---|
| Panel | Relleno `paso 3.5` y `paso 2` entre filtros (`TOPIC-P1`), como en a.3; el divisor entre grupos pasa de horizontal a vertical, con `paso 3.5` a cada lado. Con n grupos presentes, n − 1 divisores; sin ningún grupo ausente dejando divisor (f.1, tabla 4) |
| Fila de tema | Alto mínimo `paso 11`, índice, nombre con conteo y chevron, como en a.4 |
| Flujo de la lista | El orden baja por la primera columna y sigue por la siguiente: con 27 temas, 01 a 14 y 15 a 27 en escritorio; 01 a 09, 10 a 18 y 19 a 27 desde `amplio` |
| Mezcla | K6 de acento sin cambio; llena su ancho |

### Revisado

| Ancho de ventana | Qué se ve | Alto del contenido |
|---|---|---|
| 1024 (el corte) | Panel con los grupos presentes en una fila y 2 columnas de temas; sin scroll horizontal. Con los tres grupos, una sola fila sin salto de línea: 781 de 922 px (f.1, tabla 5) | — |
| 1366 × 768 | Panel, mezcla y los primeros temas en la primera ventana; en la materia de 27 temas, la lista entera pide desplazarse | 2,1 ventanas (con `columna`: 3,8) |
| 1920 × 1080 | Panel, mezcla y los 27 temas (3 columnas de 9) en una ventana | 1,0 ventanas (con `columna`: 2,5) |

Los altos se midieron en la maqueta regenerada el 2026-10-11 (3.13b), con `TOPIC-P6`: E03a mide 1314 px a 1366, 52 px menos que con el grupo de tres filtros (una fila de filtros en lugar de dos), y 979 px a 1920, sin cambio (el grupo de tres filtros ya entraba en una fila). E03b no cambia (437 px).

### Orden, teclado y foco

| Aspecto | Regla |
|---|---|
| Orden de DOM | El del teléfono: barra, panel, mezcla, rótulo, temas 01 a NN |
| Tab | Volver, filtros de fuente (si hay preguntas propias), de parcial (si hay parciales), menos y más, mezcla, temas en orden: el foco baja por una columna y pasa a la siguiente, como la lectura. Un grupo ausente no deja paradas |
| Cambia de lugar | Los grupos del panel pasan de apilados a una fila; el panel sigue arriba de la mezcla y de los temas |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P3` | Desde el corte `escritorio`, los tres grupos del panel de filtros van en una fila a ancho de hoja y la lista de temas pasa a columnas (2; 3 desde `amplio`) con flujo por columnas; el modo examen centra su tarjeta con tope `lectura` | La materia con más temas (27) pide casi cuatro ventanas en una columna. Los grupos de filtros son hermanos y caben en fila; los temas se leen como un índice, de arriba abajo y por columnas | visual | aprobada (usuario, 2026-10-11) |

El texto de `ESC-P3` queda como se aprobó. `TOPIC-P6` (usuario, 2026-10-11) ajusta dos cosas: «los tres grupos» son de uno a tres según haya preguntas propias y parciales, y el ancho sobrante lo toma «Parcial» y no se reparte con «Fuente», que pasó de 383 a 167 px (f.1, tablas 1, 4 y 5). El resto de `ESC-P3` rige sin cambio.
