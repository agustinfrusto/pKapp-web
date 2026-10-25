# AddQuestion · ficha 1.3

| Campo | Valor |
|---|---|
| Pantalla | `AddQuestionScreen` (`src/screens/AddQuestionScreen.js`), ruta `AddQuestion` |
| Boceto | Sin figura: el boceto no dibuja esta pantalla. La ficha extiende su gramática (rótulos mono, controles de marco `borde`, relleno `tinta` para lo seleccionado) |
| Comunes | `comun.md`: §3 barra interna, §4 marcas de estado, §5 estados (K1, K3, K7 y §5.3 `Desplegable`), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos, §12.2 marca de parcial |
| Navegador | Barra interna con título «pKapp · Agregar pregunta» y volver (`comun.md` §3.3) |
| Variantes | De 2 a 6 opciones; con y sin correcta marcada; selector de tema cerrado o abierto; guardando; con teclado abierto |
| Fuera de alcance | Diálogos del sistema (`confirm`, `avisar`): su texto está en d.2 y e; su aspecto no es del sistema visual |
| Propuestas | Sección f: `ADD-P2` (aprobada, usuario, 2026-10-10) y `ADD-P3` (aprobada, usuario, 2026-10-11); `ADD-P1`, rechazada (usuario, 2026-10-11). Sección h: conservado de main (D10). Comunes: `COMUN-P2`. Sección j: cambios de la tarea 5.2 (Diseñador, 2026-10-13) |
| Anexo | `AddQuestion-ADD-P3.md`: alternativas evaluadas, interacción del desplegable, componente `Desplegable`, contraste, medidas y figuras de `ADD-P3`. Ante una diferencia rige el cuerpo de esta ficha y `comun.md` §5.3 |
| Escritorio | Sección «Escritorio», al final: `ESC-P9` rechazada (usuario, 2026-10-11); desde el corte `escritorio` el formulario va en una columna `lectura`, como el quiz. Bajo el corte rige a.3 |

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3, con volver |
| 2 | Grupo «Tema» | `paso 4` | `paso 5` | `paso 6` | Rótulo (margen inferior `paso 2`), disparador del tema y, abierto, lámina a `paso 2` del disparador (a.2) |
| 3 | Grupo «Enunciado de la pregunta» | — | `paso 5` | `paso 6` | Rótulo (margen inferior `paso 2`) y campo multilínea |
| 4 | Grupo «Opciones de respuesta» | — | `paso 5` | `paso 6` | Rótulo, ayuda de marcado (margen inferior `paso 2.5`), filas de opción y «Agregar opción» |
| 5 | Grupo «Explicación (opcional)» | — | `paso 5` | `paso 6` | Rótulo (margen inferior `paso 2`) y campo multilínea |
| 6 | Botón «Guardar pregunta» | — | `paso 5` | — | K1 de ancho completo |
| 7 | Relleno inferior del scroll | — | — | `paso 8` más área segura inferior | Fin del scroll |

### a.2 Interior de los grupos

| Pieza | Medidas | Contenido |
|---|---|---|
| Disparador del tema (K3, plegable) | Ancho completo de la columna; relleno `paso 3` en las cuatro caras (el del campo de texto: con el interlineado de `cuerpo` queda tan alto como el campo de una opción); alto mínimo `paso 11`; `border`; fila con el nombre a la izquierda (flexible, salta de línea) y el chevron a la derecha, separados `paso 2` y centrado en vertical | Nombre del tema elegido (o el texto de ayuda) y `glifo-chevron` (chico) |
| Lámina de opciones | `comun.md` §6: cuerpo `superficie`, marco `linea` `border` y cuatro marcas de esquina; ancho completo; a `paso 2` del disparador (las marcas sobresalen `paso 1` y no lo tocan) | La región de scroll |
| Región de scroll | Relleno `paso 1` en las cuatro caras (el contorno de foco, `paso 0.5` de separación más `border-2`, mide justo `paso 1`: no se recorta ni en hover); alto máximo `paso 72` con la lista plana y `paso 80` con rótulos de grupo (b y d.4); scroll vertical con indicador visible; el scroll no se encadena a la página (`overscroll-contain`) | Rótulos de grupo, si el dato existe (d.1), y filas |
| Rótulo de grupo | Fila de ancho completo; relleno vertical `paso 2` y horizontal `paso 3`; fondo `fondo`; filete inferior `filete`; marca y texto separados `paso 1.5`; no es un control | Marca de parcial (`comun.md` §12.2: dos casillas de lado `paso 2.5`, separadas `paso 0.5`, llena la del parcial) y el rótulo del parcial. Solo con el dato del parcial de cada tema (d.1) |
| Fila de tema (K7) | Ancho completo; alto mínimo `paso 11`; relleno vertical `paso 2` y horizontal `paso 3`; filete inferior `filete`, salvo en la última de cada grupo o de la lista; el nombre salta de línea | Nombre del tema |
| Campo multilínea | Alto mínimo `paso 20`; relleno `paso 3`; el alto crece con el contenido; texto alineado arriba | Enunciado y explicación |
| Fila de opción | Fila alineada arriba; separación `paso 2` entre piezas; filas separadas por `paso 2.5` | Celda de letra, campo y quitar |
| Celda de letra | Lado `paso 11` | Letra de la opción o, si es la correcta, `glifo-acierto` (chico) |
| Campo de opción | Flexible; alto mínimo `paso 11`; relleno `paso 3`; el alto crece con el contenido | Texto de la opción |
| Quitar opción | Objetivo `paso 11` por `paso 11`; glifo grande centrado | `glifo-cerrar` |
| «Agregar opción» | K3 de ancho completo; alto `paso 11`; a `paso 2.5` de la última fila; glifo chico delante del texto, separado `paso 2` | `glifo-mas` y el texto; solo con menos de 6 opciones |
| Ayuda de marcado | Fila con salto de línea; centrada en vertical; separación `paso 1` entre piezas | Texto, `glifo-acierto` (chico) y texto |

### a.3 Otros anchos (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7.1: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Campos, disparador, lámina y botón llenan la columna. La barra interna lleva su filete a todo el ancho |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha: una columna `lectura` | Igual | Sin formulario en dos columnas: el orden vertical del teléfono se conserva, como en el quiz. El botón mide el ancho de la columna, no el de la ventana |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. El campo de la opción se angosta (celda y quitar conservan `paso 11`); el nombre del tema salta de línea en el disparador y en las filas; el chevron y las casillas de la marca de parcial conservan su lado. A 320 × 568 la lámina abierta entra completa en la ventana (figura F06 del anexo) |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Barra interna | `comun.md` §3 | | | | | | |
| Rótulo de grupo | `tintaSec` | `fondo` | — | `rotulo` | — | — | T3 |
| Ayuda de marcado | `tintaSec` | `fondo` | — | `detalle` | — | `glifo-acierto` (chico), `acierto` | T3, N9 |
| Disparador del tema en reposo (K3) | `tinta` | `superficie` | `borde`, `border` | `cuerpo` | — | `glifo-chevron` (chico), `tintaSec`, apuntando abajo | T2, N3, N4, N20 |
| Disparador sin coincidencia | `tintaSec` | `superficie` | `borde`, `border` | `cuerpo` | — | Igual | T4, N4, N20 |
| Disparador abierto (K3) | `tinta` | `superficie` | `linea`, `border` | `cuerpo` | — | `glifo-chevron` apuntando arriba, `tintaSec` | T2, N1, N2, N20 |
| Disparador deshabilitado | `inactivo` | `superficie` | `filete`, `border` | `cuerpo` | — | `inactivo` | X5 |
| Lámina de opciones | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | — | — | N1, N2 |
| Rótulo de grupo del selector | `tintaSec` | `fondo` | — | `rotulo` | `filete` inferior | Marca de parcial, `tintaSec` | T3, N19, X1, X2 |
| Fila de tema en reposo (K7) | `tinta` | `superficie` | — | `cuerpo` | `filete` inferior | — | T2, X2 |
| Fila de tema elegida (K7, regla 2.9-10) | `fondo` | `tinta` | — | `cuerpo-fuerte` | — | — | T7, N6 |
| Campo de texto (enunciado, opción, explicación) | `tinta` | `superficie` | `borde`, `border` | `campo` | — | — | T2, N4 |
| Texto de ayuda del campo (placeholder) | `tintaSec` | `superficie` | — | `campo` | — | — | T4 |
| Celda de letra en reposo (K3) | `tinta` | `superficie` | `borde`, `border` | `dato` | — | — | T2, N4 |
| Celda de letra de la correcta | `fondo` | `acierto` | `acierto`, `border-2` | — | — | `glifo-acierto` (chico) | T8, N10 |
| Quitar opción (K7) | `tintaSec` | `fondo` | — | — | — | `glifo-cerrar` (grande) | N19 |
| «Agregar opción» (K3) | `tinta` | `superficie` | `borde`, `border` | `cuerpo-fuerte` | — | `glifo-mas` (chico), `tinta` | T2, N4, N6 |
| «Guardar pregunta» (K1) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | `glifo-guardar` (chico), delante del texto | T7 |

Los tres campos y su ayuda van en `campo` (`tokens.md` b.2), no en `cuerpo`: es el paso de tamaño 16 o más que D10 exige a todo campo editable para que Safari de iPhone no amplíe la página al enfocarlo. Con el interlineado de `campo` y el relleno `paso 3`, el campo de opción queda por encima del alto de `paso 11`.

El disparador lleva `cuerpo` y no `cuerpo-fuerte`: muestra un valor y no ejecuta una acción, así no compite con «Agregar opción» y «Guardar pregunta». Tampoco lleva `campo`: no se edita, y `campo` no se usa en texto que no se edita (`tokens.md` b.2).

La celda de la correcta cambia la letra por el tilde, igual que hoy; el relleno `acierto` con glifo `fondo` es el mismo par que la celda de letra de la opción correcta del quiz (`Quiz.md` c.2, T8). El glifo de quitar va sobre `fondo`, fuera del campo: el par es N19 y el token (`tintaSec`) es el de `comun.md` §9.

Glifo con texto (guardar, agregar opción, ayuda de marcado, chevron del disparador, marca de parcial): decorativo, oculto a lectores (`aria-hidden`, `accessibilityElementsHidden`). Glifo solo (quitar opción, tilde de la celda de la correcta): lleva nombre accesible (e). El disparador entero es el control: ningún glifo suyo es un objetivo aparte. Objetivos táctiles de 44 × 44 pt en ambas dimensiones y `paso 2` como mínimo entre controles adyacentes.

### Decisiones estéticas del selector de tema (una línea cada una)

| Decisión | Justificación |
|---|---|
| Lista en línea, no flotante | Sin sombra ni telón, una capa flotante se separa del formulario solo por su borde; en línea no tapa campos y no depende de la posición |
| Lámina con marcas de esquina para la lista | Es la figura que se despliega del disparador; el marco `linea` y las marcas la separan del formulario sin sombra (`REFERENCIAS.md`: plancha, sin bloques genéricos) |
| Fila elegida por inversión `tinta`/`fondo`, sin tilde | Misma gramática que el filtro K4 que reemplaza y que la selección de K3 (§5.1); `glifo-acierto` significa «correcta» (§9) y no se reutiliza para «elegida» |
| Chevron `tintaSec` y no `acento` | Señal secundaria junto al nombre (`tinta`); mismo criterio que el chevron de las filas de lista (§9, N20). El `acento` de Ajustes acompaña a la palabra «Ver», que acá no existe |
| Rótulo de grupo en banda `fondo` | Un escalón bajo `superficie` separa los grupos sin color ni sombra; la marca de parcial es la de `PAR-P2`, que el usuario ya aprobó |
| Disparador en `cuerpo` regular | Es un valor, no una acción |
| Alto máximo que deja una fila cortada al pie: `paso 72` con la lista plana y `paso 80` con rótulos de grupo (5.2, `E-01`) | Una fila cortada al pie, con su línea de texto partida, avisa que hay más sin depender del indicador de scroll, que macOS e iOS no muestran en reposo. Con filas de 44 px: 4 + 6 × 44 + 20 = 288 en lista plana; 4 + 33 + 6 × 44 + 19 = 320 con rótulos (el rótulo suma 33 px). Con `paso 80` en lista plana entraban siete filas y 8 px de relleno de la octava: la lista parecía terminar. La lámina abierta entra en la ventana de 320 × 568 |

---

## c. Matriz de estados

### c.1 Controles

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Disparador del tema (K3) | Borde `borde`; texto `tinta`; chevron `tintaSec` abajo | Borde `linea` | Inversión: fondo `tinta`; texto y chevron `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | Abierto, que está expandido y no seleccionado (regla 2.9-2): borde `linea`; chevron arriba; estado accesible expandido | Borde `filete`; texto y chevron `inactivo`; sin toque, hover ni foco; estado accesible deshabilitado (mientras guarda) |
| Fila de tema (K7) | Texto `tinta`; filete inferior `filete` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; texto `fondo` | Contorno `foco`, `border-2`, separado `paso 0.5` | Elegida (regla 2.9-10): fondo `tinta`; texto `fondo` en `cuerpo-fuerte`; estado accesible seleccionado; hover y presionado no la cambian | Texto `inactivo`; sin toque, hover ni foco; estado accesible deshabilitado (la API lo admite; AddQuestion no lo usa) |
| Rótulo de grupo | Estático | — | — | — | — | — (no es un control: sin hover, presionado ni foco) |
| Campo de texto | Borde `borde`; fondo `superficie` | Borde `linea` | — | Contorno `foco`, `border-2`, separado `paso 0.5`; en un campo de texto `:focus-visible` aparece siempre que tiene el foco | — | — (sigue editable mientras guarda, como hoy) |
| Celda de letra (K3) | Borde `borde`; letra `tinta` | Borde `linea` | Inversión: fondo `tinta`; letra `fondo` | Contorno `foco` | Fondo `acierto`; borde `acierto`, `border-2`; `glifo-acierto` en `fondo`; estado accesible seleccionado | — |
| Quitar opción (K7) | Glifo `tintaSec` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; glifo `fondo` | Contorno `foco` | — | — (con dos opciones sigue activo y responde con el aviso de d.2) |
| «Agregar opción» (K3) | Borde `borde`; texto y glifo `tinta` | Borde `linea` | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` | Contorno `foco` | — | No se muestra con 6 opciones (comportamiento actual) |
| «Guardar pregunta» (K1) | Fondo `tinta`; texto y glifo `fondo` | Contorno web `linea`, `border-2` | Inversión: fondo `superficie`; texto `tinta`; borde `linea` | Contorno `foco` | — | Guardando: fondo `fondo`; texto «Guardando...» en `inactivo`; borde `filete`; sin glifo; estado accesible deshabilitado (X4) |

| Combinación | Resultado |
|---|---|
| Hover y foco a la vez | Gana el foco (un solo contorno) |
| Presionado con el disparador abierto | Inversión mientras dura el toque; al soltar cierra |
| Elegida y hover o presionado | Sin cambio: el relleno ya es el máximo |

### c.2 Estados de la pantalla

| Estado | Condición | Efecto |
|---|---|---|
| Inicial | Al abrir | Disparador cerrado con el nombre del primer tema de `TOPICS` (D6); cuatro opciones vacías (letras A a D); ninguna correcta; campos vacíos |
| Selector abierto | Toque, Enter, Espacio o flecha sobre el disparador | Lámina en línea; el foco pasa a la fila elegida |
| Tema elegido | Toque, Enter o Espacio sobre una fila | `setTopic(valor)`; la lámina cierra; el foco vuelve al disparador |
| Selector cancelado | Escape, Tab, Shift+Tab, o toque sobre el disparador abierto | La lámina cierra; el tema no cambia |
| Sin coincidencia | `topic` no está entre las opciones | Disparador con el texto de ayuda «Elegí un tema» en `tintaSec` |
| Sin temas | `TOPICS` vacío | Disparador deshabilitado con el texto de ayuda; no ocurre en las seis materias |
| Con correcta marcada | `correctIndex` distinto de `null` | Solo esa celda en estado seleccionado; las demás muestran su letra |
| Quitar la marcada | `correctIndex === index` | La marca desaparece (`correctIndex` pasa a `null`); las letras de las opciones siguientes bajan un lugar |
| Quitar una anterior a la marcada | `correctIndex > index` | La marca sigue en la misma opción, que ahora tiene la letra anterior |
| Dos opciones | `options.length <= 2` y se toca quitar | No se quita; aviso del sistema «Mínimo 2 opciones» |
| Seis opciones | `options.length >= 6` | «Agregar opción» no se muestra |
| Guardando | `saving` | «Guardar pregunta» deshabilitado con «Guardando...»; el disparador del tema se deshabilita y, si estaba abierto, cierra |
| Guardada | `addUserQuestion` resuelve | Diálogo del sistema «¡Pregunta guardada!»: «Agregar otra» limpia enunciado, opciones (vuelven a cuatro vacías), correcta y explicación y conserva el tema; «Volver» llama `navigation.goBack()` |
| Error al guardar | `addUserQuestion` rechaza | Aviso del sistema «Error» |

Origen de la pregunta, aciertos de rendimiento, banco reducido y estado vacío no aplican (—).

| Por qué la correcta se distingue sin color | Detalle |
|---|---|
| Glifo | La celda muestra el tilde en lugar de la letra (§4) |
| Relleno | La celda va rellena; las demás, vacías |
| Estado accesible | `accessibilityState` con el estado seleccionado |

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Materia y temas | `useMateria()`: `materiaId`, `materia.TOPICS` | Sin `TOPICS` el disparador queda deshabilitado con el texto de ayuda (no ocurre en las seis materias) |
| Opciones del selector | `Object.entries(materia.TOPICS)`, en su orden | Igual que hoy; los grupos, si los hay, son tramos contiguos de ese orden y no lo reordenan |
| Nombre visible | `TOPICS[topic]` | Igual que hoy |
| Tema inicial | `Object.keys(TOPICS)[0]` | Sin cambio (D6) |
| Parcial de cada tema | **No existe como dato** | Ver «Dato que falta» abajo |
| Rótulos de grupo | `materia.config.parciales`: `label` y cantidad de casillas | Solo con parciales y con el dato del parcial de cada tema |
| Estado del formulario | `questionText`, `options` (cuatro vacías), `correctIndex` (`null`), `topic`, `explanation`, `saving` | Estado local; no persiste |
| Letra de opción | `String.fromCharCode(65 + idx)` | A, B, C… |
| Color de placeholder | `placeholderTextColor` recibe un solo color: sale del token `tintaSec` del tema activo (`useTema().oscuro`), nunca de un literal | Es un valor por `style`, no por clase |
| Guardado | `addUserQuestion(materiaId, { topic, question, options, correctIndex, explanation })` de `src/db/database` (`database.web.js`) | Enunciado y explicación recortados; opciones vacías descartadas y `correctIndex` recalculado |

**Dato que falta: el parcial de cada tema.**

| Hecho | Detalle |
|---|---|
| Hoy | `TOPICS` es `{ clave: nombre }`. El agrupado de BCYT (12 temas del 1er parcial y 15 del 2do) vive solo en los comentarios `// --- 1er Parcial ---` y `// --- 2do Parcial ---` de `src/materias/bcyt/topics.js` |
| Anatomía | Tiene `parciales` en su `config.js`, pero ningún tema declara el suyo. El Diseñador no lo infiere |
| Otras cuatro | `cyr`, `dre`, `neuro` y `ryd` tienen `parciales: null`: lista plana |
| Qué rige | **Lista plana, sin rótulos de grupo, mientras el parcial de cada tema no sea dato.** Es válida y es el comportamiento de las cuatro materias sin parciales; la lámina, el teclado y los roles no cambian |
| Cuando el dato exista | Un grupo por parcial, con la marca de `comun.md` §12.2 y el rótulo `materia.config.parciales[].label`. El orden de las filas no cambia y el tema inicial sigue siendo el primero de `TOPICS` |
| Quién lo decide | Ingeniero (contrato de datos, no estética): un export aditivo por materia (por ejemplo `TOPICS_PARCIAL` junto a `TOPICS`), sin cambiar la forma de `TOPICS` que leen TopicSelect, Quiz y Ajustes. Para Anatomía lo aporta el autor de los bancos |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Límites de opciones | Mínimo 2, máximo 6. Quitar con 2: `avisar('Mínimo 2 opciones', 'Tiene que haber al menos 2 opciones de respuesta.')`. Agregar con 6: `avisar('Máximo 6 opciones', 'No se pueden agregar más de 6 opciones.')` (con el botón oculto es inalcanzable; se conserva el guardia) |
| Validaciones, en este orden | (1) enunciado vacío: `avisar('Falta la pregunta', 'Escribí el enunciado de la pregunta.')`; (2) menos de 2 opciones con texto: `avisar('Pocas opciones', 'Necesitás al menos 2 opciones con texto.')`; (3) correcta sin marcar: `avisar('Falta marcar la correcta', 'Marcá cuál es la respuesta correcta.')`; (4) correcta sin texto: `avisar('Opción correcta vacía', 'La opción marcada como correcta no tiene texto.')` |
| Guardado | Solo opciones con texto, recortadas, y `correctIndex` sobre la lista filtrada |
| Confirmación | `confirm('¡Pregunta guardada!', '¿Querés agregar otra?', …, { confirmLabel: 'Agregar otra', cancelLabel: 'Volver', onCancel: () => navigation.goBack() })` |
| Error | `avisar('Error', 'No se pudo guardar la pregunta.')` y `console.error` |
| Un solo correcto | Marcar una opción desmarca la anterior |
| Tema por defecto y entre altas | El primero de `TOPICS` (D6). «Agregar otra» no reinicia el tema y el disparador muestra el mismo nombre |
| Validación del tema | Ninguna: siempre hay uno. `addUserQuestion` recibe el mismo `topic` |
| Gestos | Un toque por opción marcada y por guardado, como en `main`. **El tema son dos toques, abrir y elegir** (`ADD-P3`, aprobada el 2026-10-11): el costo se paga una vez por tanda, porque «Agregar otra» conserva el tema |
| Sin emoji, radio ni sombra | El emoji del botón, la celda circular (`rounded-full`), el borde discontinuo, `rounded-*` y la opacidad del botón al guardar salen de esta pantalla (`comun.md` §9, D9). Las piezas del selector no usan sombra, transparencia ni opacidad (CD-24) |
| Origen | Las preguntas guardadas quedan con origen de usuario y se muestran como «Tuya» en el quiz (`Quiz.md` c.3). Con la primera de la materia, TopicSelect suma el grupo «Fuente» con «Solo mías» (`TopicSelect.md` f.1, `TOPIC-P6`) |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/AddQuestionScreen.js`: sin resultados.

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| Ninguno | — | — | La pantalla no emite eventos y la ficha no agrega ninguno. El pageview sintético lo emite `App.js` por cambio de ruta (`trackPageview`) y no se toca |

### d.4 Selector de tema: interacción

| Aspecto | Dónde está |
|---|---|
| Abrir y cerrar, recorrido de la lista, teclado, roles y puntero | `comun.md` §5.3 (`Desplegable`) |
| Lo propio de esta pantalla | Al guardar, el desplegable cierra y se deshabilita (c.2). Tras «Agregar otra» conserva el tema. Con la lista cerrada, Tab pasa del disparador al enunciado y Shift+Tab a la barra interna. No hay búsqueda por texto: el tema se elige una vez por tanda de altas y el máximo es de 27 filas |
| Alto de la lista | Hasta `paso 72` con la lista plana (la que se publica) y `paso 80` con rótulos de grupo; con más contenido, scroll vertical propio. El tope deja una fila cortada al pie, con su línea de texto partida, que avisa que hay más (5.2, `E-01`; aceptación 20). Rige con la lista abierta arriba o alineada a fila («Al abrir», `E-01b`) y con filas de un renglón; los límites medidos están en j |
| Al abrir | Si la fila elegida no está a la vista con su contorno de foco, la región se desplaza hasta alinear al borde superior la fila dos lugares antes de la elegida: la elegida queda tercera, con dos filas de contexto arriba y, con filas de un renglón, tres enteras bajo ella y la siguiente cortada al pie (5.2, `E-01b`, aprobado por el usuario, 2026-10-13; antes la dejaba centrada). Los rótulos de grupo no cuentan como fila. Con la elegida a la vista, y con el tema por defecto, la región queda arriba. Si el desplazamiento llega al final de la lista (en BCYT, de la 24.ª fila en adelante), la región se detiene ahí y no hay fila cortada. Si la lámina no entra en la ventana, la página se desplaza lo mínimo para mostrarla completa; a 320 × 568 no hace falta (aceptación 20) |
| Animación | Ninguna: abre y cierra de inmediato, sin transición de layout |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Rótulo de tema | «Tema:» | «Tema» | `ADD-P2`; criterio de `TOPIC-P3` |
| Rótulo del enunciado | «Enunciado de la pregunta:» | «Enunciado de la pregunta» | `ADD-P2` |
| Rótulo de opciones | «Opciones de respuesta:» | «Opciones de respuesta» | `ADD-P2` |
| Rótulo de la explicación | «Explicación (opcional):» | «Explicación (opcional)» | `ADD-P2` |
| Texto de ayuda del disparador | No existe | «Elegí un tema» | `ADD-P3`; cadena nueva, solo con `topic` sin coincidencia o sin temas. Voseo, como «Escribí la pregunta acá...» |
| Nombre accesible del disparador | No existe | «Tema: {nombre del tema}» | `ADD-P3`; cadena accesible nueva, no visible: compone el rótulo y el valor |
| Nombre accesible de la lista | No existe | «Tema» | `ADD-P3`; cadena accesible nueva, no visible |
| Nombre accesible de cada grupo | No existe | «1er Parcial», «2do Parcial» | `ADD-P3`; sin cadena nueva: es `materia.config.parciales[].label`, solo con el dato de d.1 |
| Ayuda de marcado | «Marcá con (símbolo de tilde) cuál es la correcta» | «Marcá con», `glifo-acierto` y «cuál es la correcta» | Reemplazo de símbolo (`comun.md` §10) |
| Marca de correcta | Símbolo de tilde en lugar de la letra | `glifo-acierto` en lugar de la letra | Reemplazo de símbolo |
| Quitar opción | Símbolo de cruz | `glifo-cerrar`; nombre accesible «Quitar opción {letra}» | Reemplazo de símbolo; cadena accesible nueva, no visible |
| Agregar opción | «+ Agregar opción» (signo de texto) | «Agregar opción» con `glifo-mas` | Reemplazo de símbolo |
| Guardar | Emoji de disquete y «Guardar pregunta» | «Guardar pregunta» con `glifo-guardar` | Reemplazo de emoji |
| Guardando | «Guardando...» | Igual | — |
| Nombre del tema | `TOPICS[clave]` | Igual | — |
| Texto de ayuda del enunciado | «Escribí la pregunta acá...» | Igual | — |
| Texto de ayuda de una opción | «Opción {letra}» | Igual | — |
| Texto de ayuda de la explicación | «Explicación que se mostrará después de responder...» | Igual | — |
| Celda de letra | Sin nombre accesible | «Opción {letra}, marcar como correcta» | Cadena accesible nueva, no visible |
| Campo de texto (enunciado, cada opción y explicación) | Sin cadena accesible: el nombre accesible es su texto de ayuda | Igual: el nombre accesible de cada campo es su texto de ayuda visible («Escribí la pregunta acá...», «Opción {letra}» o «Explicación que se mostrará después de responder...»); sin cadena accesible aparte | Aceptado, sin código (tarea 5.2, `D-12`, 2026-10-13): una cadena aparte divergiría del texto visible (WCAG 2.5.3, etiqueta en el nombre) |
| Diálogos | Los de d.2 | Iguales | — |

El texto de ayuda del campo (placeholder) lleva el color del token `tintaSec` en los dos temas.

---

## f. Propuestas (D10)

Cambios respecto de `main` que el boceto no dibuja. `ADD-P2` la aprobó el usuario el 2026-10-10 y `ADD-P3`, el 2026-10-11 (D10): rigen tal como están descritas acá y en el cuerpo de la ficha (a a e). `ADD-P1` la rechazó el 2026-10-11 y no rige. No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| ADD-P1 | Los temas pasaban de una fila con scroll horizontal a filtros K4 con salto de línea: todos a la vista y un toque por tema | Con puntero (PC y Mac) el scroll horizontal no tiene gesto visible. Costo, que la rechazó: con 27 temas (BCYT) los filtros dejaban el rótulo «Enunciado de la pregunta» más abajo de la primera ventana, a 390 × 844 y a 320 × 568, y el formulario medía 2,2 ventanas a 390 × 844 | uso | **rechazada** (usuario, 2026-10-11): «el usuario debería scrollear demasiado» |
| ADD-P2 | Los rótulos de grupo van en `rotulo` y `tintaSec` (T3), sin dos puntos: «Tema», «Enunciado de la pregunta», «Opciones de respuesta», «Explicación (opcional)». El paso los muestra en mayúsculas | Misma gramática de rótulos mono que el resto de las pantallas; los dos puntos ya salieron en TopicSelect (`TOPIC-P3`, aprobada) | visual | aprobada (usuario, 2026-10-10) |
| ADD-P3 | El selector de tema deja de ser un grupo de filtros K4 y pasa a ser un **desplegable en línea**: un disparador K3 de una fila con el tema elegido y, abierto, una lámina con filas K7 (componente `Desplegable`, `comun.md` §5.3). **Lista plana mientras el parcial de cada tema no sea dato** (d.1); con el dato, agrupada por parcial | `ADD-P1` rechazada: el tema se elige una vez por tanda de altas, así que su segundo toque se paga una vez. El grupo «Tema» pasa a una fila y el formulario, de 2,2 a 1,04 ventanas a 390 × 844 (anexo, i.1) | uso | **aprobada** (usuario, 2026-10-11), con los dos toques por tema aceptados |

Costos que el usuario aceptó con `ADD-P3` (detalle en el anexo, sección l):

| Costo | Detalle |
|---|---|
| Dos toques por cambio de tema | Rompe «un toque por tema» de `main` y de `ADD-P1`. Se paga una vez por tanda: «Agregar otra» conserva el tema |
| Scroll propio de la lista | En materias de más de seis temas (siete hasta `E-01`, 2026-10-13) la lista desplaza dentro de su región; queda acotado a la elección y no al formulario |
| Un componente nuevo, una regla nueva y un paso en uso | `Desplegable`; K7 «elegida» (regla 2.9-10); `paso 80`. Desde `E-01` (2026-10-13) la lista plana usa `paso 72` y el `80` queda para los rótulos de grupo (j) |
| Un dato que no existe | El parcial de cada tema (d.1). Sin él la lista es plana |
| Reescritura del e2e de temas | Sección i |

Revisión del usuario al implementar (`ADD-P3`): el usuario la aprobó y dijo que la revisará implementada («ADD-P3 esta bien, despues te digo cuando la vea implementada»). La tarea 3.9 (`AddQuestionScreen`) se la muestra, en claro y oscuro y en la materia de nombres de tema más largos, antes del commit.

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Sin figura de esta pantalla | Pantalla compuesta con la gramática del boceto | El boceto no la cubre; `main` fija funciones, datos y orden (D10) |
| (`main`) celda de letra circular de 36 y quitar de 30 | Cuadrados de lado `paso 11` | D10: objetivo táctil mínimo de 44 × 44 pt; `tokens.md` c.1: sin elementos circulares |
| (`main`) botón «Agregar opción» con borde discontinuo | Borde continuo `borde`, `border` | `tokens.md` c.2: solo grosores continuos de 1, 2 y 3 |
| (`main`) botón con opacidad al guardar | Estado deshabilitado de K1 | `tokens.md` a.2: la opacidad es transparencia |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| ADD-C1 | Los cuatro campos y su orden: tema, enunciado, opciones y explicación opcional, con «Guardar pregunta» al final del scroll | Es el recorrido que el usuario ya conoce; D10 conserva el orden y la ubicación de las acciones | uso |
| ADD-C2 | De 2 a 6 opciones, con arranque en 4 vacías y los avisos «Mínimo 2 opciones» y «Máximo 6 opciones» | Regla de datos de `main` | dato |
| ADD-C3 | Una sola correcta, marcada con un toque en la celda de letra; el tilde reemplaza a la letra; quitar la marcada la desmarca | Función de `main` | uso |
| ADD-C4 | Validaciones por diálogo del sistema, en el orden de d.2, sin marcar campos | Copy y orden de `main`; el diálogo es del sistema | copy |
| ADD-C5 | Tras guardar, diálogo «¡Pregunta guardada!» con «Agregar otra» (limpia todo salvo el tema) y «Volver» | Flujo de alta en serie de `main` | uso |
| ADD-C6 | Enunciado y explicación en campos multilínea; opciones en campos que crecen con el texto | Función de `main` | uso |

---

## i. Aceptación observable (`ADD-P3`; sección j del anexo)

Para la 3.x y el e2e. El e2e `tools/e2e/suites/agregar.js` codificaba `ADD-P1` (`radiogroup` con todos los temas a la vista: `LEER_TEMAS`, `temasALaVista` y el bloque «K4 filtro de tema»): se reescribe contra esta sección.

| # | Comprobación | Esperado |
|---|---|---|
| 1 | 390 × 844, tema por defecto, cerrado | «Enunciado de la pregunta» queda a menos de la cuarta parte del alto de la ventana; el grupo «Tema» ocupa una sola fila de disparador |
| 2 | Estructura cerrada | Un `button` con `aria-haspopup="listbox"` y `aria-expanded="false"`; ningún `radiogroup` de temas; ningún `option` en el DOM |
| 3 | Abrir (toque) | `aria-expanded="true"`; un `listbox` con una `option` por cada clave de `TOPICS`, en su orden; exactamente una con `aria-selected="true"`: la del tema actual |
| 4 | Elegir una fila | La lista desaparece; el disparador muestra el nombre; `aria-expanded="false"`; el foco queda en el disparador |
| 5 | Teclado: abrir | Enter, Espacio y Flecha abajo abren y llevan el foco a la fila elegida |
| 6 | Teclado: recorrer | Flecha abajo y arriba mueven el foco sin cambiar `aria-selected`; Inicio y Fin; sin vuelta en los extremos |
| 7 | Teclado: cerrar | Escape cierra sin cambiar el tema y devuelve el foco al disparador; Tab cierra y el foco queda en el enunciado; Shift+Tab, en el disparador |
| 8 | Letras | En BCYT, «t» y «e» seguidas dejan el foco en «Tejido epitelial» |
| 9 | Objetivos | Disparador y cada fila miden al menos 44 × 44 (`paso 11`) a 320 |
| 10 | Sin desborde | A 320, `scrollWidth <= clientWidth` de la pantalla en cerrado y abierto; el nombre largo de DRE salta de línea |
| 11 | Entra en ventana | A 320 × 568, abierta, el borde inferior de la lámina queda dentro de la ventana, sin desplazar la página |
| 12 | Guardando | Con `saving`: disparador deshabilitado (`disabled` o `aria-disabled`), lista cerrada |
| 13 | Datos (D6) | El tema inicial es `Object.keys(TOPICS)[0]`; tras «Agregar otra» el disparador conserva el nombre; `addUserQuestion` recibe el mismo `topic` elegido |
| 14 | Lista plana | Mientras el parcial de cada tema no sea dato: sin `group` ni rótulos de grupo, y las `option` en el orden de `TOPICS`. Con el dato (BCYT): dos `group` con los nombres «1er Parcial» y «2do Parcial» y el mismo orden de `option` |
| 15 | Foco sin recorte | El contorno de foco de una fila (color `foco`, `border-2`) queda dentro de la región de scroll en claro y en oscuro |
| 16 | Sin transparencia | Ninguna pieza nueva usa `box-shadow`, `rgba`, `border-radius` ni `opacity` |
| 17 | Estados y colores | Disparador y filas toman los tokens de c.1 en los dos temas |
| 18 | Escritorio | A 1024, 1366 × 768 y 1920 × 1080: una sola columna `lectura`, centrada y anclada arriba, sin segunda columna ni región lateral; la barra interna con el filete a todo el ancho; sin scroll horizontal; con el selector abierto, la lámina entra completa en la ventana |
| 19 | Orden de foco | Tab recorre el orden de DOM, que es el visual, en todos los anchos: disparador, enunciado, cada opción, «Agregar opción», explicación y «Guardar pregunta» |
| 20 | Fila cortada al pie (5.2, `E-01`; con la elegida fuera de vista, `E-01b`) | BCYT (27 temas), lista plana. **(a) Abierta arriba** (tema por defecto, sin desplazar), a 320 × 568, 390 × 844, 768 × 1024, 1366 × 768 y 1920 × 1080, con las barras de scroll ocultas como en el arnés (`--hide-scrollbars`; con barra clásica de 15 px a 320 los nombres saltan antes, j): la región mide 288 px (`clientHeight`) y `scrollHeight > clientHeight`; seis `option` quedan enteras dentro de ella y la séptima asoma entre 19 y 26 px de sus 44 (con `paso 72`, 20: la línea de texto cortada). A 320 × 568 la lámina mide 290 px y su borde inferior queda a 464 px. **(b) Elegida fuera de vista** (de la 7.ª a la 23.ª fila; a 390 × 844, la 20.ª), con las mismas barras: al abrir, la elegida es la tercera `option` de la región; las dos anteriores quedan enteras dentro de ella, la primera con su borde superior en el de la región (±1,5 px) y la elegida a 88 px de ese borde (dos filas de 44); bajo la elegida hay tres `option` enteras y la siguiente asoma entre 19 y 26 px de sus 44 (con `paso 72`, 24: la línea de texto cortada). Con la 20.ª, `scrollTop` vale 752. **(c) Elegida entre las últimas** (de la 24.ª a la 27.ª): la región queda en el final de la lista (`scrollTop` = `scrollHeight` − `clientHeight`, 908) y no hay fila cortada: no hay más abajo. **(d) Con rótulos de grupo** (cuando el dato exista): abierta arriba, la región mide 320 px y, tras el rótulo y seis filas enteras, la séptima asoma entre 19 y 26 px (con `paso 80`, 19); con la elegida fuera de vista rige la misma alineación y la fila cortada asoma 23 px si el rótulo del 2.º parcial está a la vista (sin él, 12 px de relleno sin tinta: límite medido, j) |

---

## j. Cambios de la tarea 5.2

Recorrido final de la rama `rediseno-revision-ux`. No son propuestas nuevas: cierran una medida que faltaba o corrigen la ficha contra el código. Cada fila dice qué había, qué rige ahora y cómo se comprueba.

| Fecha | Id | Cambio | Antes | Después | Aceptación observable (Programador y e2e) |
|---|---|---|---|---|---|
| 2026-10-13 | `D-12` (nota) | e: el nombre accesible de los tres campos de texto es su texto de ayuda visible | e listaba las cadenas accesibles del disparador, la lista, la celda de letra y quitar opción; no decía nada del enunciado, las opciones ni la explicación | Sin cadena accesible aparte: el lector anuncia «Escribí la pregunta acá...», «Opción {letra}» o «Explicación que se mostrará después de responder...». Una cadena distinta divergiría del texto visible (WCAG 2.5.3) | Sin cambio de código: los campos no llevan `accessibilityLabel` y conservan su `placeholder` |
| 2026-10-13 | `E-01` | a.2, b, d.4 y f: el alto máximo de la lista del desplegable pasa de `paso 80` a `paso 72` con la lista plana; con rótulos de grupo sigue `paso 80`. La regla dice «una fila cortada al pie» en lugar de contar filas | `paso 80` (320 px) en los dos casos, con la promesa de seis filas y la séptima a medias. Esa cuenta solo vale con rótulos (4 + 33 + 6 × 44 + 19). Con la lista plana que se publica entraban siete filas y 8 px de la octava, que son relleno sin texto: la lista parecía terminar y la única pista era el indicador de scroll, que macOS e iOS no muestran en reposo | Lista plana: `paso 72` (288 px = 4 + 6 × 44 + 20): seis filas enteras y 20 px de la séptima, con su línea de texto partida. Con rótulos: `paso 80` (320 px = 4 + 33 + 6 × 44 + 19): rótulo, seis filas y 19 px de la séptima. `paso 72` con rótulos deja 31 px (texto entero) y ningún otro paso de la escala corta la línea con la lista plana (`tokens.md` c.3). La cuenta rige con la lista abierta arriba y filas de un renglón; los límites medidos están debajo | Aceptación 20 (i). Código: `max-h-72` con la lista plana y `max-h-80` con grupos; el e2e que topa la región en 320 px («la región mide a lo sumo 320 px», `agregar.js`) pasa a 288 |
| 2026-10-13 | `E-01b`, aprobado por el usuario | d.4 «Al abrir», `comun.md` §5.3 y aceptación 20: con la elegida fuera de vista, la región se alinea al borde de una fila y la deja tercera, con dos filas de contexto arriba, en vez de centrarla. Reemplaza el «centrada» de `ADD-P3` (F09) | La región se desplazaba hasta dejar la elegida centrada. Con la lista plana el borde inferior caía a 34 de 44 px de una fila, con el texto entero y relleno debajo: 125 de 127 casos sin pista (BCYT, 90 de 90), y la única pista era el indicador de scroll, que macOS e iOS no muestran en reposo | La región alinea al borde superior la fila dos lugares antes de la elegida y la elegida queda tercera. Con `paso 72` y filas de un renglón, bajo ella hay tres filas enteras y la siguiente asoma 24 de sus 44 px (línea de texto partida, 8 px de capitales). Lista plana: 108 de 121 casos con pista (89 %; BCYT 85 de 85, Neuro 18 de 22) y 92 casos más llegan al final de la lista, donde no hay más abajo. Con `paso 80` en la lista plana la alineación deja 12 px sin tinta: las cifras suponen `E-01` | Aceptación 20 (i), casos b a d. Código: `Desplegable.js` alinea al abrir la fila dos lugares antes de la activa; el e2e que fija la elegida «centrada en la región» (`agregar.js`) pasa a «tercera, con dos filas de contexto y la fila cortada al pie». Especificación: `.orca/reports/rediseno-5.2-e01b-ficha.md` |

Límites medidos de `E-01` y `E-01b` (Chrome 155, IBM Plex Sans 15/22, las seis listas reales, barras de scroll ocultas como en el arnés; `.orca/reports/rediseno-5.2-e01-ficha.md` y `rediseno-5.2-e01b-ficha.md`):

| Caso, lista plana con `paso 72` | Qué cae en el borde inferior | Medido |
|---|---|---|
| Abre arriba, nombres de un renglón: BCYT y Anatomía a todos los anchos; las seis materias desde 408 px | 20 de 44 px de la séptima: línea de texto cortada | Cumple: 22 de 30 combinaciones materia × ancho |
| Abre arriba, nombres que saltan a dos renglones (CyR, DRE, Neuro y RyD a 320, 360 y 390 px; filas de 61 px) | Donde sumen las alturas: texto entero, relleno o línea cortada | 4 de 12 casos cortan la línea; el resto, sin pista |
| Abre con la elegida fuera de vista, alineada a fila (d.4, «Al abrir»; `E-01b`), nombres de un renglón: BCYT a todos los anchos y Neuro desde 320 px de lámina | 24 de 44 px de la fila que sigue a las tres enteras bajo la elegida: línea de texto cortada, 8 px de capitales | Cumple: BCYT 85 de 85 y Neuro 17 de 17. Centrada, como abría hasta `E-01b`: BCYT 0 de 90 y Neuro 1 de 27 |
| Ídem, nombres que saltan a dos renglones (CyR, DRE, RyD y Neuro a 280 px de lámina) | Donde sumen las alturas: 44 de 61 px (línea cortada), texto entero o relleno | 6 de 19 casos cortan la línea (DRE 3 de 6, CyR 2 de 3, Neuro 1 de 5, RyD 0 de 5); el resto, sin pista |
| Ídem, la elegida entre las últimas (en BCYT, de la 24.ª a la 27.ª; en Anatomía, de la 7.ª a la 9.ª) | La región se detiene en el final de la lista | Sin fila cortada: no hay más abajo. 92 de 213 casos con la elegida fuera de vista (centrada, 86) |
| Con rótulos de grupo (`paso 80`, BCYT; cuando el dato exista), alineada a fila | 23 de 44 px de la fila siguiente si el rótulo del 2.º parcial está a la vista; sin él, 12 px sin tinta | 6 de 16 casos cortan la línea (de la 9.ª a la 14.ª fila); centrada, 0 de 17 (3 con solo descendentes) |
| Barra de scroll clásica de 15 px (Windows y Linux) | Quita 15 px de ancho y los nombres saltan antes: cambian 7 de 30 combinaciones | Abierta arriba: dejan de cortar BCYT a 320 de ancho y CyR a 390; DRE a 360 empieza a cortar: 21 de 30. Alineada a fila: 102 de 123 casos (BCYT 77 de 85: a 280 px de lámina, 9 de 17, porque saltan nombres a dos renglones). La barra es visible y avisa por sí sola |

Donde no hay pista (nombres a dos renglones y, con rótulos de grupo, la elegida cuyo corte no tiene el rótulo del 2.º parcial a la vista) la única pista es el indicador de scroll, que macOS e iOS no muestran en reposo. Ninguno se resuelve con otro paso de la escala (el corte depende de la suma de alturas y de dónde queda el desplazamiento); no hay propuesta vigente. `E-01b` presupone `E-01`: con `paso 80` en la lista plana la alineación deja 12 px de relleno sin tinta en los 90 casos con más abajo.

---

## Escritorio · columna `lectura` (tarea 3.10; `ESC-P9` rechazada por el usuario el 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2): AddQuestion va en una columna `lectura`, como el quiz («aprobado, AddQuestion en la columna de 600»). `ESC-P9`, que ponía el tema en una columna izquierda, **rechazada**. Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Por qué | `ESC-P9` respondía a `ADD-P1` («la lista de temas es lo más alto de la pantalla»). Con `ADD-P3` el tema mide una fila: una columna izquierda quedaría casi vacía frente a la derecha y el formulario no necesita región lateral |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); sin cambio en `amplio`. Teléfono y tablet no cambian |
| Bajo el corte | a.3 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E09a (completa, 27 temas, selector cerrado) y E09b (selector abierto), a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Los cuatro campos y su orden (`ADD-C1`), de 2 a 6 opciones (`ADD-C2`), validaciones y diálogos (d.2), el selector de tema de a.2 y su interacción (d.4), copy de e, elementos y pares de b, estados de c, campos en el paso `campo` (`CD-23`) |

### Disposición

| # | Región | Contenido, en orden de DOM | Escritorio | Amplio |
|---|---|---|---|---|
| 1 | Barra interna | Con volver (`comun.md` §3) | Filete y fondo a todo el ancho; el contenido, dentro de `lectura` | Igual |
| 2 | Formulario | Grupo «Tema» (disparador y, abierto, lámina), «Enunciado de la pregunta», «Opciones de respuesta», «Explicación (opcional)» y «Guardar pregunta», en ese orden y con la separación de a.1 | Una columna `lectura`, centrada y anclada arriba | Igual |

### Medidas

| Elemento | Medida |
|---|---|
| Columna | `lectura`; margen lateral `paso 8` cuando la ventana no la deja entera (`comun.md` §7.2) |
| Selector de tema | Disparador a ancho de columna; la lámina abierta llena la columna, abre hacia abajo y empuja el formulario, como a 390 px; alto máximo `paso 72` con la lista plana y `paso 80` con rótulos de grupo (`E-01`) |
| Fila de opción | Celda de letra y quitar de `paso 11`; el campo toma el resto de la columna |
| «Guardar pregunta» | K1 de ancho de columna, al pie |

### Revisado

| Ancho de ventana | Qué se ve | Alto del contenido |
|---|---|---|
| 1024 (el corte) | Una columna sin ajuste; sin scroll horizontal | 1,4 ventanas |
| 1366 × 768 | Tema, enunciado y las opciones en la primera ventana; explicación y «Guardar pregunta» piden un poco de desplazamiento. Con el selector abierto la lámina entra completa | 1,4 ventanas; 1,9 con el selector abierto |
| 1920 × 1080 | Todo en una ventana; abierto, también entra | 0,9 ventanas; 1,3 con el selector abierto |

Los altos con el selector abierto se midieron en 3.10 con `paso 80`. Con la lista plana (`paso 72`, `E-01`, 2026-10-13) la lámina mide 32 px menos (hasta 0,04 ventanas a 768 de alto) y sigue entrando completa.

### Orden, teclado y foco

| Aspecto | Regla |
|---|---|
| Orden de DOM | El del teléfono: barra, tema, enunciado, opciones, explicación, guardar |
| Tab | Disparador del tema, enunciado, letra, campo y quitar de cada opción, «Agregar opción», explicación, «Guardar pregunta»: de arriba abajo, sin saltos hacia atrás; con la lista abierta, una sola parada dentro de ella |
| Cambia de lugar | Nada: el tema sigue encima del enunciado |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P9` | Desde el corte `escritorio`, el selector de tema ocupa una columna izquierda y el resto del formulario una derecha | Respondía a `ADD-P1` (la lista de temas es lo más alto de la pantalla). Con `ADD-P3` el tema mide una fila y la columna izquierda queda casi vacía | uso | **rechazada** (usuario, 2026-10-11) |
