# AddQuestion · ficha 1.3

| Campo | Valor |
|---|---|
| Pantalla | `AddQuestionScreen` (`src/screens/AddQuestionScreen.js`), ruta `AddQuestion` |
| Boceto | Sin figura: el boceto no dibuja esta pantalla. La ficha extiende su gramática (rótulos mono, controles de marco `borde`, relleno `tinta` para lo seleccionado) |
| Comunes | `comun.md`: §3 barra interna, §4 marcas de estado, §5 estados (K1, K3, K7 y §5.3 `Desplegable`), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos, §12.2 marca de parcial |
| Navegador | Barra interna con título «pKapp · Agregar pregunta» y volver (`comun.md` §3.3) |
| Variantes | De 2 a 6 opciones; con y sin correcta marcada; selector de tema cerrado o abierto; guardando; con teclado abierto |
| Fuera de alcance | Diálogos del sistema (`confirm`, `avisar`): su texto está en d.2 y e; su aspecto no es del sistema visual |
| Propuestas | Sección f: `ADD-P2` (aprobada, usuario, 2026-10-10) y `ADD-P3` (aprobada, usuario, 2026-10-11); `ADD-P1`, rechazada (usuario, 2026-10-11). Sección h: conservado de main (D10). Comunes: `COMUN-P2` |
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
| 7 | Relleno inferior del scroll | — | — | `paso 8` más área segura inferior | Fin del scroll; con teclado abierto, la vista sube (`KeyboardAvoidingView`, solo iOS, como hoy) |

### a.2 Interior de los grupos

| Pieza | Medidas | Contenido |
|---|---|---|
| Disparador del tema (K3, plegable) | Ancho completo de la columna; relleno `paso 3` en las cuatro caras (el del campo de texto: con el interlineado de `cuerpo` queda tan alto como el campo de una opción); alto mínimo `paso 11`; `border`; fila con el nombre a la izquierda (flexible, salta de línea) y el chevron a la derecha, separados `paso 2` y centrado en vertical | Nombre del tema elegido (o el texto de ayuda) y `glifo-chevron` (chico) |
| Lámina de opciones | `comun.md` §6: cuerpo `superficie`, marco `linea` `border` y cuatro marcas de esquina; ancho completo; a `paso 2` del disparador (las marcas sobresalen `paso 1` y no lo tocan) | La región de scroll |
| Región de scroll | Relleno `paso 1` en las cuatro caras (el contorno de foco, `paso 0.5` de separación más `border-2`, mide justo `paso 1`: no se recorta ni en hover); alto máximo `paso 80`; scroll vertical con indicador visible; el scroll no se encadena a la página (`overscroll-contain`) | Rótulos de grupo, si el dato existe (d.1), y filas |
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
| `paso 80` de alto máximo | Seis filas completas y la séptima a medias en la materia de 27 temas: la fila cortada avisa que hay más; la lámina abierta entra en la ventana de 320 × 568 |

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
| Guardado | `addUserQuestion(materiaId, { topic, question, options, correctIndex, explanation })` de `src/db/database` (módulos por plataforma: `database.web.js` y `database.native.js`) | Enunciado y explicación recortados; opciones vacías descartadas y `correctIndex` recalculado |

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
| Origen | Las preguntas guardadas quedan con origen de usuario y se muestran como «Tuya» en el quiz (`Quiz.md` c.3) |

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
| Alto de la lista | Hasta `paso 80`; con más contenido, scroll vertical propio. En la materia de 27 temas se ven seis filas completas y la séptima a medias |
| Al abrir | La región se desplaza hasta la fila elegida y la deja centrada si no está a la vista; con el tema por defecto queda arriba. Si la lámina no entra en la ventana, la página se desplaza lo mínimo para mostrarla completa; a 320 × 568 no hace falta |
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
| Scroll propio de la lista | En materias de más de siete temas la lista desplaza dentro de su región; queda acotado a la elección y no al formulario |
| Un componente nuevo, una regla nueva y un paso en uso | `Desplegable`; K7 «elegida» (regla 2.9-10); `paso 80` |
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
| Selector de tema | Disparador a ancho de columna; la lámina abierta llena la columna, abre hacia abajo y empuja el formulario, como a 390 px; alto máximo `paso 80` |
| Fila de opción | Celda de letra y quitar de `paso 11`; el campo toma el resto de la columna |
| «Guardar pregunta» | K1 de ancho de columna, al pie |

### Revisado

| Ancho de ventana | Qué se ve | Alto del contenido |
|---|---|---|
| 1024 (el corte) | Una columna sin ajuste; sin scroll horizontal | 1,4 ventanas |
| 1366 × 768 | Tema, enunciado y las opciones en la primera ventana; explicación y «Guardar pregunta» piden un poco de desplazamiento. Con el selector abierto la lámina entra completa | 1,4 ventanas; 1,9 con el selector abierto |
| 1920 × 1080 | Todo en una ventana; abierto, también entra | 0,9 ventanas; 1,3 con el selector abierto |

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
