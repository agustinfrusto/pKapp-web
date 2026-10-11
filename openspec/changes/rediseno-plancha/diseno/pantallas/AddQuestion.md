# AddQuestion · ficha 1.3

| Campo | Valor |
|---|---|
| Pantalla | `AddQuestionScreen` (`src/screens/AddQuestionScreen.js`), ruta `AddQuestion` |
| Boceto | Sin figura: el boceto no dibuja esta pantalla. La ficha extiende su gramática (rótulos mono, controles de marco `borde`, relleno `tinta` para lo seleccionado) |
| Comunes | `comun.md`: §3 barra interna, §4 marcas de estado, §5 estados (K1, K3, K4, K7), §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra interna con título «pKapp · Agregar pregunta» y volver (`comun.md` §3.3) |
| Variantes | De 2 a 6 opciones; con y sin correcta marcada; guardando; con teclado abierto |
| Fuera de alcance | Diálogos del sistema (`confirm`, `avisar`): su texto está en d.2 y e; su aspecto no es del sistema visual |
| Propuestas | Sección f: `ADD-P1` y `ADD-P2`, pendientes. Sección h: conservado de main (D10). Comunes: `COMUN-P2` |

Convención de 1.3 (D10): las secciones a a e describen la pantalla con las propuestas de f aplicadas. La sección f.2 trae la variante sin el cambio de cada una, al mismo nivel de detalle, y es la que se implementa si el usuario no la aprueba. Base de comparación: el boceto para lo visual; `main` para funciones, datos, copy y orden de uso.

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3, con volver |
| 2 | Grupo «Tema» | `paso 4` | `paso 5` | `paso 6` | Rótulo (margen inferior `paso 2`) y selector de tema (a.2) |
| 3 | Grupo «Enunciado de la pregunta» | — | `paso 5` | `paso 6` | Rótulo (margen inferior `paso 2`) y campo multilínea |
| 4 | Grupo «Opciones de respuesta» | — | `paso 5` | `paso 6` | Rótulo, ayuda de marcado (margen inferior `paso 2.5`), filas de opción y «Agregar opción» |
| 5 | Grupo «Explicación (opcional)» | — | `paso 5` | `paso 6` | Rótulo (margen inferior `paso 2`) y campo multilínea |
| 6 | Botón «Guardar pregunta» | — | `paso 5` | — | K1 de ancho completo |
| 7 | Relleno inferior del scroll | — | — | `paso 8` más área segura inferior | Fin del scroll; con teclado abierto, la vista sube (`KeyboardAvoidingView`, solo iOS, como hoy) |

### a.2 Interior de los grupos

| Pieza | Medidas | Contenido |
|---|---|---|
| Selector de tema | Filtros K4 en fila con salto de línea; alto mínimo `paso 11`; relleno horizontal `paso 3`, vertical `paso 2`; separación `paso 2` en horizontal y en vertical; el nombre salta de línea dentro del filtro si no entra en el ancho de la columna | Un filtro por entrada de `TOPICS`, en su orden (`ADD-P1`) |
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
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Campos, filtros y botón llenan la columna. La barra interna lleva su filete a todo el ancho |
| 1280 px | Igual | Igual | Sin formulario en dos columnas: el orden vertical del teléfono se conserva. El botón mide el ancho de la columna, no el de la ventana |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. El campo de la opción se angosta (celda y quitar conservan `paso 11`); los filtros de tema saltan de línea y el nombre salta dentro del filtro |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Barra interna | `comun.md` §3 | | | | | | |
| Rótulo de grupo | `tintaSec` | `fondo` | — | `rotulo` | — | — | T3 |
| Ayuda de marcado | `tintaSec` | `fondo` | — | `detalle` | — | `glifo-acierto` (chico), `acierto` | T3, N9 |
| Filtro de tema en reposo (K4) | `tinta` | `superficie` | `borde`, `border` | `cuerpo` | — | — | T2, N4 |
| Filtro de tema seleccionado (K4) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | — | T7, N6 |
| Campo de texto (enunciado, opción, explicación) | `tinta` | `superficie` | `borde`, `border` | `campo` | — | — | T2, N4 |
| Texto de ayuda del campo (placeholder) | `tintaSec` | `superficie` | — | `campo` | — | — | T4 |
| Celda de letra en reposo (K3) | `tinta` | `superficie` | `borde`, `border` | `dato` | — | — | T2, N4 |
| Celda de letra de la correcta | `fondo` | `acierto` | `acierto`, `border-2` | — | — | `glifo-acierto` (chico) | T8, N10 |
| Quitar opción (K7) | `tintaSec` | `fondo` | — | — | — | `glifo-cerrar` (grande) | N19 |
| «Agregar opción» (K3) | `tinta` | `superficie` | `borde`, `border` | `cuerpo-fuerte` | — | `glifo-mas` (chico), `tinta` | T2, N4, N6 |
| «Guardar pregunta» (K1) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | `glifo-guardar` (chico), delante del texto | T7 |

Los tres campos y su ayuda van en `campo` (`tokens.md` b.2), no en `cuerpo`: es el paso de tamaño 16 o más que D10 exige a todo campo editable para que Safari de iPhone no amplíe la página al enfocarlo. Con el interlineado de `campo` y el relleno `paso 3`, el campo de opción queda por encima del alto de `paso 11`.

La celda de la correcta cambia la letra por el tilde, igual que hoy; el relleno `acierto` con glifo `fondo` es el mismo par que la celda de letra de la opción correcta del quiz (`Quiz.md` c.2, T8). El glifo de quitar va sobre `fondo`, fuera del campo: el par es N19 y el token (`tintaSec`) es el de `comun.md` §9.

Glifo con texto (guardar, agregar opción, ayuda de marcado): decorativo, oculto a lectores (`aria-hidden`, `accessibilityElementsHidden`). Glifo solo (quitar opción, tilde de la celda de la correcta): lleva nombre accesible (e). Objetivos táctiles de 44 × 44 pt en ambas dimensiones y `paso 2` como mínimo entre controles adyacentes.

---

## c. Matriz de estados

### c.1 Controles

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Filtro de tema (K4) | Borde `borde`; texto `tinta` | Borde `linea` | Inversión: aspecto de seleccionado | Contorno `foco`, `border-2`, separado `paso 0.5` | Fondo `tinta`; texto `fondo` en `cuerpo-fuerte`; estado accesible seleccionado | — |
| Campo de texto | Borde `borde`; fondo `superficie` | Borde `linea` | — | Contorno `foco`, `border-2`, separado `paso 0.5`; en un campo de texto `:focus-visible` aparece siempre que tiene el foco | — | — (sigue editable mientras guarda, como hoy) |
| Celda de letra (K3) | Borde `borde`; letra `tinta` | Borde `linea` | Inversión: fondo `tinta`; letra `fondo` | Contorno `foco` | Fondo `acierto`; borde `acierto`, `border-2`; `glifo-acierto` en `fondo`; estado accesible seleccionado | — |
| Quitar opción (K7) | Glifo `tintaSec` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; glifo `fondo` | Contorno `foco` | — | — (con dos opciones sigue activo y responde con el aviso de d.2) |
| «Agregar opción» (K3) | Borde `borde`; texto y glifo `tinta` | Borde `linea` | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` | Contorno `foco` | — | No se muestra con 6 opciones (comportamiento actual) |
| «Guardar pregunta» (K1) | Fondo `tinta`; texto y glifo `fondo` | Contorno web `linea`, `border-2` | Inversión: fondo `superficie`; texto `tinta`; borde `linea` | Contorno `foco` | — | Guardando: fondo `fondo`; texto «Guardando...» en `inactivo`; borde `filete`; sin glifo; estado accesible deshabilitado (X4) |

### c.2 Estados de la pantalla

| Estado | Condición | Efecto |
|---|---|---|
| Inicial | Al abrir | Tema: el primero de `TOPICS`; cuatro opciones vacías (letras A a D); ninguna correcta; campos vacíos |
| Con correcta marcada | `correctIndex` distinto de `null` | Solo esa celda en estado seleccionado; las demás muestran su letra |
| Quitar la marcada | `correctIndex === index` | La marca desaparece (`correctIndex` pasa a `null`); las letras de las opciones siguientes bajan un lugar |
| Quitar una anterior a la marcada | `correctIndex > index` | La marca sigue en la misma opción, que ahora tiene la letra anterior |
| Dos opciones | `options.length <= 2` y se toca quitar | No se quita; aviso del sistema «Mínimo 2 opciones» |
| Seis opciones | `options.length >= 6` | «Agregar opción» no se muestra |
| Guardando | `saving` | «Guardar pregunta» deshabilitado con «Guardando...» |
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
| Materia y temas | `useMateria()`: `materiaId`, `materia.TOPICS` | Sin `TOPICS` el selector queda sin filtros (no ocurre en las seis materias) |
| Tema inicial | `Object.keys(TOPICS)[0]` | — |
| Estado del formulario | `questionText`, `options` (cuatro vacías), `correctIndex` (`null`), `topic`, `explanation`, `saving` | Estado local; no persiste |
| Letra de opción | `String.fromCharCode(65 + idx)` | A, B, C… |
| Color de placeholder | `placeholderTextColor` recibe un solo color: sale del token `tintaSec` del tema activo (`useTema().oscuro`), nunca de un literal | Es un valor por `style`, no por clase |
| Guardado | `addUserQuestion(materiaId, { topic, question, options, correctIndex, explanation })` de `src/db/database` (módulos por plataforma: `database.web.js` y `database.native.js`) | Enunciado y explicación recortados; opciones vacías descartadas y `correctIndex` recalculado |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Límites de opciones | Mínimo 2, máximo 6. Quitar con 2: `avisar('Mínimo 2 opciones', 'Tiene que haber al menos 2 opciones de respuesta.')`. Agregar con 6: `avisar('Máximo 6 opciones', 'No se pueden agregar más de 6 opciones.')` (con el botón oculto es inalcanzable; se conserva el guardia) |
| Validaciones, en este orden | (1) enunciado vacío: `avisar('Falta la pregunta', 'Escribí el enunciado de la pregunta.')`; (2) menos de 2 opciones con texto: `avisar('Pocas opciones', 'Necesitás al menos 2 opciones con texto.')`; (3) correcta sin marcar: `avisar('Falta marcar la correcta', 'Marcá cuál es la respuesta correcta.')`; (4) correcta sin texto: `avisar('Opción correcta vacía', 'La opción marcada como correcta no tiene texto.')` |
| Guardado | Solo opciones con texto, recortadas, y `correctIndex` sobre la lista filtrada |
| Confirmación | `confirm('¡Pregunta guardada!', '¿Querés agregar otra?', …, { confirmLabel: 'Agregar otra', cancelLabel: 'Volver', onCancel: () => navigation.goBack() })` |
| Error | `avisar('Error', 'No se pudo guardar la pregunta.')` y `console.error` |
| Un solo correcto | Marcar una opción desmarca la anterior |
| Tema entre altas | «Agregar otra» no reinicia el tema |
| Gestos | Un toque por tema, por opción marcada y por guardado, como en `main` |
| Sin emoji, radio ni sombra | El emoji del botón, la celda circular (`rounded-full`), el borde discontinuo, `rounded-*` y la opacidad del botón al guardar salen de esta pantalla (`comun.md` §9, D9) |
| Origen | Las preguntas guardadas quedan con origen de usuario y se muestran como «Tuya» en el quiz (`Quiz.md` c.3) |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/AddQuestionScreen.js`: sin resultados.

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| Ninguno | — | — | La pantalla no emite eventos y la ficha no agrega ninguno. El pageview sintético lo emite `App.js` por cambio de ruta (`trackPageview`) y no se toca |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Rótulo de tema | «Tema:» | «Tema» | `ADD-P2`; criterio de `TOPIC-P3` |
| Rótulo del enunciado | «Enunciado de la pregunta:» | «Enunciado de la pregunta» | `ADD-P2` |
| Rótulo de opciones | «Opciones de respuesta:» | «Opciones de respuesta» | `ADD-P2` |
| Rótulo de la explicación | «Explicación (opcional):» | «Explicación (opcional)» | `ADD-P2` |
| Ayuda de marcado | «Marcá con (símbolo de tilde) cuál es la correcta» | «Marcá con», `glifo-acierto` y «cuál es la correcta» | Reemplazo de símbolo (`comun.md` §10) |
| Marca de correcta | Símbolo de tilde en lugar de la letra | `glifo-acierto` en lugar de la letra | Reemplazo de símbolo |
| Quitar opción | Símbolo de cruz | `glifo-cerrar`; nombre accesible «Quitar opción {letra}» | Reemplazo de símbolo; cadena accesible nueva, no visible |
| Agregar opción | «+ Agregar opción» (signo de texto) | «Agregar opción» con `glifo-mas` | Reemplazo de símbolo |
| Guardar | Emoji de disquete y «Guardar pregunta» | «Guardar pregunta» con `glifo-guardar` | Reemplazo de emoji |
| Guardando | «Guardando...» | Igual | — |
| Texto de ayuda del enunciado | «Escribí la pregunta acá...» | Igual | — |
| Texto de ayuda de una opción | «Opción {letra}» | Igual | — |
| Texto de ayuda de la explicación | «Explicación que se mostrará después de responder...» | Igual | — |
| Celda de letra | Sin nombre accesible | «Opción {letra}, marcar como correcta» | Cadena accesible nueva, no visible |
| Diálogos | Los de d.2 | Iguales | — |

El texto de ayuda del campo (placeholder) lleva el color del token `tintaSec` en los dos temas.

---

## f. Propuestas pendientes (D10)

Cambios respecto de `main` que el boceto no dibuja. Quedan pendientes hasta que el usuario las apruebe; el cuerpo de la ficha (a a e) las describe aplicadas.

### f.1 Propuestas

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| ADD-P1 | Los temas pasan de una fila con scroll horizontal a filtros K4 con salto de línea: todos quedan a la vista y se elige con un toque, sin deslizar | Con puntero (PC y Mac) el scroll horizontal no tiene gesto visible, porque el indicador está oculto. A 390 px el tema elegido puede quedar fuera de pantalla. Costo: la lista ocupa varias filas antes del enunciado; en la materia con más temas y nombres largos (`bcyt`) es lo más alto de la pantalla | uso | pendiente |
| ADD-P2 | Los rótulos de grupo van en `rotulo` y `tintaSec` (T3), sin dos puntos: «Tema», «Enunciado de la pregunta», «Opciones de respuesta», «Explicación (opcional)». El paso los muestra en mayúsculas | Misma gramática de rótulos mono que el resto de las pantallas; los dos puntos ya salieron en TopicSelect (`TOPIC-P3`, aprobada) | visual | pendiente |

### f.2 Variante sin el cambio

| Id | Si no se aprueba | Detalle |
|---|---|---|
| ADD-P1 | Una sola fila de filtros K4 con scroll horizontal | Fila única de alto `paso 11` dentro de un scroll horizontal sin indicador (como hoy); separación `paso 2`; relleno final `paso 5` para que el último filtro no quede pegado al borde; margen inferior del grupo `paso 6`. Cada filtro conserva los tokens de b (reposo `borde` y `tinta`, seleccionado `tinta` y `fondo`) y los estados de c.1. Los nombres largos no saltan de línea: el filtro crece en ancho. El filtro siguiente asoma cortado en el borde de la columna como indicio de que hay más; sin degradado (a.2 de `tokens.md`). El elegido no se desplaza solo a la vista |
| ADD-P2 | Rótulos con dos puntos y en `cuerpo-fuerte` | Rótulo en `cuerpo-fuerte` y `tintaSec` (T3), en caja normal y con dos puntos: «Tema:», «Enunciado de la pregunta:», «Opciones de respuesta:», «Explicación (opcional):». Margen inferior `paso 1.5` en lugar de `paso 2`; el resto de las medidas de a.1 no cambia. La ayuda de marcado sigue en `detalle` (T3) |

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
