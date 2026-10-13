# Estados vacíos · ficha 1.3

| Campo | Valor |
|---|---|
| Superficie | Todos los estados vacíos de la app, inventariados desde el código con `rg` de `return null`, `length === 0`, `size === 0`, `count === 0` y las ramas condicionales de `src/screens`, `src/components` y `App.js` |
| Boceto | Sin figura: el boceto no dibuja estados vacíos (`NOTAS.md`: «seguirían la misma gramática»). La ficha extiende la lámina con marcas de esquina de `comun.md` §6 |
| Comunes | `comun.md`: §3 barra interna, §5 estados (K2), §6 lámina, §7 anchos, §8 dimensiones (glifo de estado vacío), §9 glifos |
| Lo usan | `Stats` (V1), `TopicSelect` (V2 y V4), `Settings` (V3) |
| Variantes | Pantalla vacía (V1, V2), mensaje dentro de un plegable (V3), lista vacía (V4) |
| Fuera de alcance | Avisos del sistema (V5): su aspecto no es del sistema visual. Estados ya cubiertos por la ficha de su pantalla (V6 a V14 de a.1) |
| Propuestas | Sección f: `VAC-P1` a `VAC-P4`, aprobadas (usuario, 2026-10-10); `VAC-P2` con revisión del usuario al implementar; `VAC-P5`, aprobada (usuario, 2026-10-11). Sección f.2: `REV-2` de la revisión 5.0b (usuario, 2026-10-12), que se fija en `tokens.md` a.2 y alcanza a V19. Sección h: conservado de main (D10). Comunes: `COMUN-P2` |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P12`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.5 |

---

## a. Layout a 390 px

### a.1 Inventario desde el código

«Línea en `main`» es la cita del inventario de 1.3. «Línea actual» es la de `rediseno` el 2026-10-13 y cambia con cada edición: la clave estable es el símbolo de la «Condición» (p. ej. `rg -n totalAnswered src/screens/StatsScreen.js`), no el número.

Con tratamiento propio en esta ficha:

| Id | Estado | Dónde | Condición | Línea en `main` | Línea actual | Qué muestra hoy | Tratamiento |
|---|---|---|---|---|---|---|---|
| V1 | Sin estadísticas | `StatsScreen` | `totalAnswered === 0` | `StatsScreen.js:90` | `StatsScreen.js:124` | Emoji de gráfico, título y texto, centrados en la pantalla; admite tirar para actualizar | Lámina vacía (a.2) |
| V2 | Sin preguntas falladas | `TopicSelectScreen`, modo `failed` | `mode === 'failed' && failedIds.size === 0` | `TopicSelectScreen.js:177` | `TopicSelectScreen.js:224` | Emoji de diana, título y texto, centrados; sin filtros | Lámina vacía (a.2) |
| V3 | Sin preguntas propias | `SettingsScreen`, «Mis preguntas» abierto | `showQuestions && userQuestions.length === 0` | `SettingsScreen.js:114` | `SettingsScreen.js:163` | Tarjeta con un texto centrado | Mensaje compacto (a.3) |
| V4 | Sin temas con los filtros actuales | `TopicSelectScreen`, modos `practice` y `failed` con fallos | `filteredBase` vacía: ningún tema con `count > 0`; p. ej. «Solo mías» con un parcial distinto de «Examen», porque las preguntas propias no traen `parcial` (`TopicSelect.md` f.1, tabla 6) | `TopicSelectScreen.js:213` a `215` | `TopicSelectScreen.js:286` | La tarjeta de mezcla dice «0 preguntas» y, bajo el rótulo de sección, la lista queda vacía | Mensaje bajo el rótulo (a.4): el de `VAC-P3` o, con «Solo mías» y un parcial, el de `VAC-P5` |

Aviso del sistema, sin diseño propio:

| Id | Estado | Dónde | Condición | Línea en `main` | Línea actual | Qué muestra hoy |
|---|---|---|---|---|---|---|
| V5 | Sin preguntas al comenzar | `TopicSelectScreen.startQuiz` | `questions.length === 0` | `TopicSelectScreen.js:116` | `TopicSelectScreen.js:146` a `149` | `avisar('Sin preguntas', 'No hay preguntas disponibles con los filtros actuales.')` |

Elementos que se omiten sin dejar hueco, o pantalla sin render. Su fila de matriz ya vive en la ficha de su pantalla:

| Id | Estado | Dónde | Condición | Línea en `main` | Línea actual | Qué ocurre | Ficha que lo cubre |
|---|---|---|---|---|---|---|---|
| V6 | Sin «Más falladas» | `StatsScreen` | `failedStats.length === 0` | `StatsScreen.js:164` | `StatsScreen.js:274` | La sección no se renderiza | `Stats.md` a.1 y h |
| V7 | Tema sin práctica | `StatsScreen`, fila | `accuracy === null` | `StatsScreen.js:131` y `136` | `StatsScreen.js:214` y `235` | «Sin practicar» y sin barra | `Stats.md` b y c |
| V8 | Tema sin preguntas | `StatsScreen`, fila | `totalQuestions === 0` | `StatsScreen.js:126` | `StatsScreen.js:213` | La fila no se renderiza | `Stats.md` d.2 |
| V9 | Tema sin preguntas tras filtros | `TopicSelectScreen`, fila | `count === 0` | `TopicSelectScreen.js:215` | `TopicSelectScreen.js:258` | La fila no se renderiza | `TopicSelect.md` c |
| V10 | Pregunta sin explicación | `QuizScreen`, `ResultsScreen` | Sin `explanation` | `QuizScreen.js:293`, `ResultsScreen.js:145` | `QuizScreen.js:508`, `ResultsScreen.js:440` | La nota no se renderiza | `Quiz.md` a.1, `Revision.md` c.2 |
| V11 | Materia sin parciales | `TopicSelectScreen` | `!hasParciales` | `TopicSelectScreen.js:54` y `264` | `TopicSelectScreen.js:66` y `364` | El grupo «Parcial» no se renderiza | `TopicSelect.md` a.3 |
| V12 | Materia sin elegir | `HomeScreen`, `TopicSelectScreen` | `!materia` | `HomeScreen.js:33`, `TopicSelectScreen.js:140` | `HomeScreen.js:77`, `TopicSelectScreen.js:170` | `return null`; `App.js` vuelve al selector | Sin render: no hay pantalla que diseñar |
| V13 | Entrada en frío a quiz o resultados | `QuizScreen`, `ResultsScreen` | Sin `questions` o sin `answers` | `QuizScreen.js:168`, `ResultsScreen.js:75` | `QuizScreen.js:149` y `275`, `ResultsScreen.js:80` y `101` | `return null` y `navigation.reset` a `MateriaSelect` | Sin render: ídem |
| V14 | Materia cargando o no disponible | `MateriaSelectScreen`, tarjeta | `cargando`, `!available` | `MateriaSelectScreen.js:144` y `147` | `MateriaSelectScreen.js:178` a `181` | «Cargando…» y «Próximamente» | `MateriaSelect.md` b y c |
| V15 | Sin pedido de donación | `ResultsScreen` | `!showDonation` o descartado | `ResultsScreen.js:213`, `254` | `ResultsScreen.js:336` | El bloque no se renderiza | `DonationBox.md` c |
| V16 | Sin nota del creador, sin banner | `MateriaSelectScreen`, `HomeScreen` | Nota vista hace menos de siete días; materia sin `bancoReducido` | `MateriaSelectScreen.js:81`, `HomeScreen.js:59` | `RegionAvisos` en `MateriaSelectScreen.js:73`; `BancoReducidoBanner` en `HomeScreen.js:112` (definición `:189`) | El bloque no se renderiza | `Banners.md` c |
| V17 | Materia sin temas | `AddQuestionScreen` | `Object.keys(TOPICS).length === 0` | `AddQuestionScreen.js:19` y `20` | `AddQuestionScreen.js:197` a `205`; el deshabilitado, en `plancha/Desplegable.js:85` y `249` | El disparador del tema (`Desplegable`, grupo «Tema») queda deshabilitado con el texto de ayuda «Elegí un tema» y `topic` sin valor: no hay lista que abrir (`ADD-P3`) | `AddQuestion.md` c.2 («Sin temas») y d.1; no ocurre con las seis materias registradas; sin diseño propio en esta ficha |
| V18 | Materia sin preguntas propias | `TopicSelectScreen`, panel de filtros | `userQuestions.length === 0` | Nuevo (`TOPIC-P6`): en `main` el grupo se dibuja siempre, `TopicSelectScreen.js:321` | `TopicSelectScreen.js:102` y `352` | El grupo «Fuente» no se renderiza: ni rótulo, ni filtros, ni divisor ni hueco; el filtro vale «Todas». Es la regla de `VAC-C5` | `TopicSelect.md` a.3, c y f.1 |
| V19 (`REV-2`, aprobada 2026-10-12) | Arranque en web: antes del primer render y durante la carga | `scripts/inject-pwa.js` (`<style>` del `<head>` servido) y `App.js` | Siempre, en cada carga | `inject-pwa.js`, `pwaTags`; `App.js:93` a `155` (el splash, que se retira) | `scripts/inject-pwa.js:42` y `45` (`pwaTags`); el splash ya no está en `App.js` | Sin splash: el primer cuadro que React pinta es la app, en el tema guardado; ningún cuadro `manifestFondo`. Antes de montar, el lienzo del navegador es `claro.fondo` (`html { background-color }`) y, con la clase `dark` en `html`, `oscuro.fondo`; `color-scheme` es `light` o `dark` según esa clase, así que las barras de scroll y los diálogos del navegador siguen al tema de la app. Quien usa el tema oscuro ve lienzo claro hasta que React monta y lee el tema (decisión 4.1: el script síncrono sigue aplazado) | `tokens.md` a.2, filas «Fondo del documento y `color-scheme`» y bloque «Decisión · `theme-color` inicial»; f.2 |

### a.2 Lámina vacía (V1 y V2)

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3, con volver |
| 2 | Lámina vacía | `paso 6` | `paso 5` | — | Lámina de `comun.md` §6; relleno `paso 3.5`; contenido centrado |

Interior de la lámina, de arriba abajo:

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Glifo | Lado `paso 12`, centrado; margen superior `paso 4`; el trazo se compensa para quedar en el grosor de `tokens.md` c.2 (`comun.md` §8) | V1: `glifo-estadisticas`. V2: `glifo-repasar` |
| 2 | Título | Margen superior `paso 4`; centrado | Título del estado |
| 3 | Texto | Margen superior `paso 2`; centrado | Texto del estado |
| 4 | Acción (`VAC-P2`) | Margen superior `paso 5` y margen inferior `paso 4`; ancho por contenido; relleno horizontal `paso 8`; alto `paso 11` | K2 con el destino de d.2 |

V1 conserva su ScrollView con tirar para actualizar (`RefreshControl`, control nativo sin estilo propio): la lámina va dentro del scroll.

### a.3 Mensaje compacto (V3)

Dentro del cuerpo de «Mis preguntas» (`Settings.md` a.1, bloque 3), a `paso 2.5` del plegable.

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Panel | `superficie`, `linea`, `border`; relleno `paso 3.5`; contenido centrado | — |
| 2 | Texto | Centrado; una o más líneas; paso `detalle` (b) | Mensaje de V3 |
| 3 | Acción (`VAC-P2`) | Centrada bajo el texto; margen superior `paso 3`; ancho por contenido; relleno horizontal `paso 8`; alto `paso 11` | K2 «Agregar pregunta» |

### a.4 Lista de temas vacía (V4)

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Rótulo de sección | El de `TopicSelect.md` a.1, bloque 4 | «O elegí un tema específico:» |
| 2 | Mensaje (`VAC-P3` y `VAC-P5`) | Sin margen superior propio: queda a `paso 2` bajo el rótulo, que es la «Separación inferior» del bloque 4 de `TopicSelect.md` a.1 (8 px en total, no 16); lateral `paso 5`; alineado a la izquierda; una o más líneas | Un solo mensaje de V4, según los filtros (tabla siguiente) |

| Filtros marcados cuando la lista queda vacía | Mensaje |
|---|---|
| Fuente «Solo mías» y parcial distinto de «Examen» (`practice` o `failed` con fallos) | «Tus preguntas no tienen parcial. Elegí "Examen" para verlas.» (`VAC-P5`) |
| Cualquier otra combinación que deja cero temas (p. ej. `failed` con «Solo mías» y «Examen», sin ninguna propia fallada) | «No hay preguntas disponibles con los filtros actuales.» (`VAC-P3`) |

Los dos mensajes tienen el mismo lugar, medidas y paso: solo cambia el texto. Figuras de la maqueta: 12d (`VAC-P5`, BCYT) y 12e (`VAC-P3`, CyR).

La tarjeta de mezcla conserva su lugar y muestra «0 preguntas»; el toque sigue mostrando el aviso del sistema (V5).

### a.5 Otros anchos (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | La lámina llena la columna; no se centra en vertical en la ventana. La barra interna lleva su filete a todo el ancho |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P12`, aprobada): `lectura` para la lámina; la barra, en la hoja de su pantalla | Igual | Barra interna en la hoja de su pantalla; la lámina vacía mide `lectura` como tope, centrada y anclada arriba, y no se estira a la ventana |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. Título y texto saltan de línea; la acción conserva alto `paso 11` y salta de línea si su texto no entra |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Barra interna | `comun.md` §3 | | | | | | |
| Lámina vacía (cuerpo) | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | — | — | N1, N2 |
| Glifo del estado | `tintaSec` | `superficie` | — | — | — | `glifo-estadisticas` o `glifo-repasar` (`paso 12`) | N20 |
| Título | `tinta` | `superficie` | — | `titulo` | — | — | T2 |
| Texto | `tintaSec` | `superficie` | — | `cuerpo` | — | — | T4 |
| Acción (K2, `VAC-P2`) | `tinta` | `superficie` | `linea`, `border` | `cuerpo-fuerte` | — | — | T2, N2, N6 |
| Mensaje compacto (V3) | `tintaSec` | `superficie` | — | `detalle` | — | — | T4 |
| Panel del mensaje compacto | — | `superficie` | `linea`, `border` | — | — | — | N1 |
| Mensaje de lista vacía (V4, `VAC-P3` y `VAC-P5`) | `tintaSec` | `fondo` | — | `cuerpo` | — | — | T3 |

Las marcas de esquina de la lámina vacía son decorativas (`aria-hidden`). El título es el nombre accesible del estado; el glifo del estado acompaña al título y es decorativo (`aria-hidden`, `accessibilityElementsHidden`). Toda acción mide al menos `paso 11` de alto y de ancho, con `paso 2` como mínimo entre controles adyacentes.

---

## c. Matriz de estados

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Lámina vacía | Estática (no es un control) | — | — | — | — | — |
| Acción (K2) | Texto `tinta`; borde `linea`; fondo `superficie` | Contorno web `linea`, `border` | Inversión: fondo `tinta`; texto `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — |
| Mensaje (V3 y V4) | Estático | — | — | — | — | — |
| Tirar para actualizar (V1) | Nativo, sin estilo propio | — | — | — | — | — |

| Estado | Condición | Qué se ve |
|---|---|---|
| Cargando | Primera carga sin resolver (`VAC-P4`) | Solo la barra interna sobre `fondo`; ni lámina vacía ni contenido |
| Vacío | La condición del inventario (a.1) | La lámina o el mensaje de su fila |
| Con datos | Cualquier otro | La pantalla de su ficha (`Stats.md`, `TopicSelect.md`, `Settings.md`) |

Origen de la pregunta, aciertos de rendimiento y banco reducido no aplican (—).

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| V1 | `getAllStats(materiaId)`: suma de `times_answered` en `totalAnswered` | Se recarga al enfocar (`useFocusEffect`) y por tirar para actualizar. Tras «Resetear estadísticas» vuelve a V1 |
| V2 | `getFailedQuestions(materiaId)`: `failedIds` | Solo en modo `failed`; el estado inicial de `failedIds` es un conjunto vacío hasta que resuelve la carga |
| V3 | `getUserQuestions(materiaId)` | Se recarga al enfocar y tras eliminar o importar |
| V4 | `filteredBase`: fuente, luego parcial, luego fallos, luego `dedupeQuestions` | Con filtros que dejan cero preguntas, `countByTopic` queda vacío. El mensaje lo decide el filtro: `VAC-P5` con `filteredBase` vacía, fuente `user` y parcial distinto de `all`; `VAC-P3` en cualquier otro caso |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Un estado vacío no esconde la salida | Las dos pantallas (V1, V2) conservan la barra interna con volver; el gesto de volver del sistema sigue activo |
| Destinos de la acción (`VAC-P2`) | V1 y V2: `TopicSelect` con `mode: 'practice'`. V3: `AddQuestion`. Cada una es un solo toque; no reemplaza ningún camino existente |
| Los textos | Los de `main`, sin cambio de palabras (e) |
| V2 y los filtros | V2 reemplaza a los filtros y a la mezcla; V4 deja los filtros y la mezcla visibles para poder cambiarlos |
| V4, qué mensaje | Uno solo a la vez, por la combinación de filtros (a.4). No depende del modo (`practice` o `failed`) ni de cuántas propias haya |
| V5 | El aviso del sistema se conserva tal cual, también con la combinación de `VAC-P5`: `avisar('Sin preguntas', 'No hay preguntas disponibles con los filtros actuales.')` |
| Sin emoji, radio ni sombra | Los dos emojis de estado vacío, el centrado por `flex-1` y `rounded-*` salen de estas superficies (`comun.md` §9, D9) |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/StatsScreen.js src/screens/TopicSelectScreen.js src/screens/SettingsScreen.js`: sin resultados.

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| Ninguno | — | — | Los estados vacíos no emiten eventos y la ficha no agrega ninguno. El pageview sintético lo emite `App.js` por cambio de ruta (`trackPageview`) y no se toca |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| V1, glifo | Emoji de gráfico | `glifo-estadisticas` | Reemplazo de emoji |
| V1, título | «Sin estadísticas todavía» | Igual | — |
| V1, texto | «Hacé algunos quizzes y volvé a esta pantalla para ver tu progreso.» | Igual | — |
| V2, glifo | Emoji de diana | `glifo-repasar` | Reemplazo de emoji |
| V2, título | «Sin preguntas falladas» | Igual | — |
| V2, texto | «Practicá un poco primero y volvé acá para repasar las que te cuesten.» | Igual | — |
| V3, texto | «No agregaste preguntas todavía. Usá "Agregar pregunta" en el menú principal.» | Igual | — |
| V4, mensaje general | No existe | «No hay preguntas disponibles con los filtros actuales.» | `VAC-P3`; es la cadena del aviso V5 |
| V4, mensaje con «Solo mías» y un parcial | No existe | «Tus preguntas no tienen parcial. Elegí "Examen" para verlas.» | `VAC-P5`; «Tus» como «tuyas» de Ajustes y «Examen», el rótulo del filtro de parcial (`TopicSelect.md` d.1). Comillas rectas, como V3 |
| Acción de V1 y V2 | No existe | «Practicar» | `VAC-P2` |
| Acción de V3 | No existe | «Agregar pregunta» | `VAC-P2`; es el rótulo de la acción de Home |

---

## f. Propuestas aprobadas (D10)

Cambios respecto de `main` que el boceto no dibuja. El usuario aprobó `VAC-P1` a `VAC-P4` el 2026-10-10 (D10) y `VAC-P5` el 2026-10-11: rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| VAC-P1 | V1 y V2 se presentan como una lámina vacía (marco `linea` con marcas de esquina), anclada arriba de la columna, en lugar de texto suelto centrado en la pantalla | Es la misma gramática de lámina de las demás pantallas; en tablet y escritorio un texto centrado en vertical queda lejos de la barra | visual | aprobada (usuario, 2026-10-10) |
| VAC-P2 | Cada estado vacío con destino obvio suma un botón de marco: V1 y V2, «Practicar»; V3, «Agregar pregunta». No reemplaza ni quita ningún camino | Hoy el estado vacío es un callejón: el usuario debe volver a Home y buscar la acción. El destino es el mismo de siempre, con un toque | uso | aprobada (usuario, 2026-10-10), con dudas: revisión del usuario al implementar |
| VAC-P3 | Cuando los filtros dejan cero temas (V4), bajo el rótulo de sección aparece «No hay preguntas disponibles con los filtros actuales.» | Hoy la pantalla queda con un rótulo sin lista y una mezcla con «0 preguntas»; el motivo solo aparece al tocar. La cadena ya existe en el aviso del sistema | uso | aprobada (usuario, 2026-10-10) |
| VAC-P4 | Mientras la primera carga de V1 y V2 no resolvió, no se muestra la lámina vacía: solo la barra sobre `fondo`. Hoy los estados iniciales (`stats` y `failedIds` vacíos) pintan «Sin estadísticas todavía» y «Sin preguntas falladas» hasta que llegan los datos | Evita un parpadeo del estado vacío para quien sí tiene datos; no agrega pantalla ni cadena | uso | aprobada (usuario, 2026-10-10) |
| VAC-P5 | Cuando la lista queda vacía (V4) porque «Solo mías» y un parcial distinto de «Examen» están marcados a la vez, el mensaje bajo el rótulo de sección es «Tus preguntas no tienen parcial. Elegí "Examen" para verlas.» en lugar del de `VAC-P3`. Cualquier otra combinación vacía conserva el de `VAC-P3`. El aviso del sistema de V5 no cambia | Las preguntas propias no traen `parcial`: esa combinación da siempre cero y el mensaje general no dice por qué ni cómo salir. Con «Solo generadas» pasaba lo mismo y nadie tenía preguntas ahí; con «Solo mías» (`TopicSelect.md` f.1, `TOPIC-P6`) la combinación es probable | uso | aprobada (usuario, 2026-10-11) |

Revisión del usuario al implementar (`VAC-P2`): el usuario la aprobó con dudas y quiere verla implementada. Las tareas que la implementan, 3.7 (`StatsScreen`, V1), 3.4 (`TopicSelectScreen`, V2) y 3.8 (`SettingsScreen`, V3), se la muestran antes del commit de cada una.

### f.1 Aceptación observable (`VAC-P5`)

Para la tarea 3.x que implementa el cambio y para el e2e. Las propias se siembran como en `TopicSelect.md` f.2 (`localStorage['pkapp_user_questions:<materia>']`). Matriz: 390 y 1366 × 768, en claro y en oscuro.

| # | Comprobación | Esperado |
|---|---|---|
| 1 | BCYT con propias, `practice`, «Solo mías» y «1er Parcial» | V4: la mezcla dice «0 preguntas»; bajo «O elegí un tema específico:» aparece «Tus preguntas no tienen parcial. Elegí "Examen" para verlas.»; ninguna fila de tema; el panel sigue visible con «Solo mías» y «1er Parcial» marcados |
| 2 | Igual con «2do Parcial», y en Anatomía | El mismo mensaje |
| 3 | Desde la fila 1, marcar «Examen» | El mensaje desaparece y vuelven las filas de los temas con propias; con «Todas» y «1er Parcial» queda la lista del parcial, sin mensaje |
| 4 | BCYT, `failed` con fallos, «Solo mías» y «1er Parcial» | El mensaje de `VAC-P5` |
| 5 | CyR con propias, `failed` con fallos del banco y ninguna propia fallada, «Solo mías» | V4 con «No hay preguntas disponibles con los filtros actuales.» (`VAC-P3`); no el de `VAC-P5` |
| 6 | «Solo mías» en `practice` sin parcial, o un parcial sin «Solo mías» | Hay temas: ningún mensaje de V4 |
| 7 | Tocar la mezcla durante la fila 1 | Aviso del sistema de V5, sin cambio: título «Sin preguntas» y texto «No hay preguntas disponibles con los filtros actuales.» |
| 8 | Presentación | `cuerpo` en `tintaSec` sobre `fondo`; alineado a la izquierda; `paso 2` en total bajo el rótulo (8 px de la caja de texto del rótulo al borde superior del mensaje, que no lleva margen propio) y `paso 5` lateral; sin región viva; a 320 el texto salta de línea y `scrollWidth <= clientWidth` |
| 9 | Copy | La cadena exacta, con comillas rectas como V3, y solo en V4. Ningún texto nuevo en V1, V2, V3 ni V5 |
| 10 | Sin transparencia | Sin `box-shadow`, `rgba`, `border-radius` ni `opacity` nuevos |

#### Aclaración de la fila 8: «`paso 2` bajo el rótulo» son 8 px en total (consulta 3.13c-c, 2026-10-11)

| Aspecto | Detalle |
|---|---|
| Pregunta | `rediseno-3.13c-b.md` §3: el contenedor del rótulo trae `mb-2` y el mensaje `mt-2`, y el texto queda a 16 px del rótulo. ¿La ficha pedía 8 px en total? |
| Respuesta | **Sí: 8 px en total (`paso 2`).** Se miden de la caja de texto del rótulo (`RotuloSeccion`, de 16 px de alto y sin relleno) al borde superior del mensaje |
| Por qué | El `paso 2` es uno solo: la «Separación inferior `paso 2`» del bloque 4 de `TopicSelect.md` a.1. Con temas, separa el rótulo del filete superior de la lista; en V4, del mensaje. El «Margen superior `paso 2`» que a.4 daba al mensaje nombraba esa misma separación desde el otro lado y se leía como una segunda. La maqueta lo dibuja así: el rótulo con 8 px de relleno inferior y el mensaje sin margen (figuras 12d y 12e, medido a 390 px: 8 px y mensaje de dos líneas) |
| Cifra | **8 px.** Hoy la pantalla da 16 (`mb-2` del contenedor del rótulo más `mt-2` del mensaje): el doble |
| Pantalla | **Cambia, una clase:** quitar `mt-2` del `Text` del mensaje en `TopicSelectScreen.js` (el de la lista vacía, bajo el rótulo; hoy línea 287). Queda el `mb-2` del contenedor del rótulo (línea 282): es el `paso 2` de la ficha y vale igual con la lista y sin ella. Nada más cambia: ni el color, ni la tipografía, ni el margen lateral |
| e2e | `V8 … paso 2` (`temas.js`, `presentacionDeVacP5`) hoy compara el `margin-top` propio del mensaje con `8px`; por eso pasa con 16 px a la vista. Debe medir la distancia: borde superior del mensaje menos borde inferior del texto del rótulo igual a 8 px (con margen de 1 px), y el `margin-top` del mensaje en `0px` |
| Sin cambio | La lista con temas (V1 a V3 de `TopicSelect.md`) no cambia; escritorio tampoco (mismo código bajo el rótulo, a ancho de hoja) |

### f.2 Propuesta de la revisión 5.0b que alcanza a esta ficha (aprobada por el usuario el 2026-10-12)

Se fija en `tokens.md` a.2 (bloque «Decisión · `theme-color` inicial»); acá queda lo que cambia en V19. «Sin el cambio» describe la variante descartada (C2).

| Id | Qué cambia en esta ficha | Sin el cambio | Tipo | Estado |
|---|---|---|---|---|
| `REV-2` (`tasks.md` 5.0b.2) | V19 (a.1): el arranque en web no pinta ningún cuadro oscuro (splash de `App.js` retirado, decisión del Ingeniero), el lienzo del navegador antes de montar es `claro.fondo` y `color-scheme` sigue al tema | Primer cuadro con el contenedor del splash (`manifestFondo`, logo a opacidad 0) en cada carga; `html` y `body` sin fondo declarado; sin `color-scheme`, con el cromo del navegador claro también en oscuro | visual (bordes de app, D8) | aprobada (usuario, 2026-10-12) |

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Sin figura de estados vacíos | Estados compuestos con la gramática del boceto | El boceto no los cubre; `main` fija textos y condiciones (D10) |
| (`main`) emoji de 64 | `glifo-estadisticas` o `glifo-repasar` de `paso 12` | Spec «Interfaz sin emojis»; escala de tokens (`comun.md` §8) |
| (`main`) contenido centrado en vertical en la pantalla | Anclado arriba de la columna | `comun.md` §7: una sola columna, centrada en horizontal y anclada arriba, en los tres anchos |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| VAC-C1 | V1 y V2 reemplazan el contenido de la pantalla: sin filtros, mezcla ni listas debajo | Flujo de `main` | uso |
| VAC-C2 | Títulos y textos de V1, V2 y V3 sin cambio de palabras | Copy de `main` | copy |
| VAC-C3 | V1 conserva tirar para actualizar | Función de `main` | uso |
| VAC-C4 | V4 y V5: la mezcla sigue activa con cero preguntas y el toque muestra el aviso del sistema | Comportamiento de `main` | uso |
| VAC-C5 | Los elementos ausentes (V6 a V11 y V15 a V16) se omiten sin dejar hueco ni marcador | Comportamiento de `main` | uso |
| VAC-C6 | V12 y V13: pantalla sin render y redirección al selector | Es la protección frente a URLs de entrada en frío (`App.js`, `QuizScreen`, `ResultsScreen`) | uso |

---

## Escritorio · propuesta `ESC-P12` (tarea 3.10, aprobada por el usuario el 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); sin cambio en `amplio`. Teléfono y tablet no cambian |
| Bajo el corte | a.5 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E10 (V1, estadísticas sin datos), a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Inventario y condiciones (a.1), textos (e), acciones y destinos (`VAC-P2`), carga sin parpadeo (`VAC-P4`), elementos y pares de b, estados de c, `VAC-C1` a `VAC-C6` |

### Disposición

| # | Bloque | Contenido | Escritorio |
|---|---|---|---|
| 1 | Barra interna | `comun.md` §3, con volver | En la hoja de su pantalla (la del estado con datos), para que no salte cuando llegan los datos |
| 2 | Lámina vacía (V1 y V2) | Glifo, título, texto y acción (a.2) | Columna `lectura` centrada en horizontal y anclada arriba; margen superior `paso 6` |
| 3 | Mensaje compacto (V3) | Dentro del cuerpo de «Mis preguntas» (`Settings.md`) | En la región principal de Ajustes, sin cambio |
| 4 | Mensaje de lista vacía (V4) | Bajo el rótulo de sección de TopicSelect | Bajo el rótulo, a ancho de hoja y alineado a la izquierda |

### Medidas

| Elemento | Medida |
|---|---|
| Lámina | Ancho `lectura` como tope; relleno `paso 3.5` y marcas de esquina de §6 sin cambio |
| Acción | K2 de alto `paso 11` y relleno horizontal `paso 8`, centrada (a.2) |
| Posición | Anclada arriba: la lámina no se centra en vertical en la ventana |

### Revisado

| Ancho de ventana | Qué se ve |
|---|---|
| 1366 × 768 y 1920 × 1080 | La lámina vacía debajo de la barra, centrada; la pantalla entera cabe (0,6 y 0,4 ventanas) |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P12` | Desde el corte `escritorio`, la lámina vacía mide como tope `lectura`, centrada, y la barra interna usa la hoja de su pantalla | Una lámina de la hoja entera (`hoja` o `hoja-amplia`) sería un marco vacío de ancho exagerado; la barra no cambia de lugar al llegar los datos | visual | aprobada (usuario, 2026-10-11) |
