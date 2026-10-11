# Revisión de respuestas · ficha 1.3

| Campo | Valor |
|---|---|
| Superficie | Vista de revisión de `ResultsScreen` (`src/screens/ResultsScreen.js`, rama `showReview`, ≈ l. 77 a 180), ruta `Results`. No navega: reemplaza la vista de resumen en el mismo lugar |
| Boceto | Figura 05 «Resultados» dibuja el botón «Revisar todas las respuestas» pero no esta vista. La ficha extiende la gramática del boceto (marco `linea`, rótulos mono, marcas de estado de `comun.md` §4) |
| Comunes | `comun.md`: §3 barra interna (sin volver), §4 marcas de estado, §5 estados (K1, K2, K4, K7), §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | La barra interna de `Results`, con título «pKapp · Resultados» y sin volver. La revisión no cambia el título |
| Variantes | Respuesta correcta o incorrecta; con y sin explicación; con y sin filtro (sin respuestas incorrectas no hay filtro); hasta cientos de respuestas |
| Fuera de alcance | Tarjeta de resultado, trío y botones del resumen (`Results.md`); pedido de donación (`DonationBox.md`; no se muestra en la revisión) |
| Propuestas | Sección f: `REV-P1`, `REV-P2` y `REV-P3`, pendientes. Sección h: conservado de main (D10). Comunes: `COMUN-P2` |

Convención de 1.3 (D10): las secciones a a e describen la superficie con las propuestas de f aplicadas. La sección f.2 trae la variante sin el cambio de cada una, al mismo nivel de detalle, y es la que se implementa si el usuario no la aprueba. Base de comparación: el boceto para lo visual; `main` para funciones, datos, copy y orden de uso.

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3, sin volver |
| 2 | Encabezado | `paso 4` | `paso 5` | `paso 3` | Título y resumen, alineados a la izquierda (a.2) |
| 3 | «Volver» de arriba (`REV-P2`) | — | `paso 5` | `paso 3` | K2 de alto `paso 11` y ancho por contenido, alineado a la izquierda |
| 4 | Filtro (`REV-P1`) | — | `paso 5` | `paso 3` | Dos filtros K4 de igual ancho, alto `paso 11`, separados por `paso 2` (criterio de `TOPIC-P1`), a todo el ancho de la columna; ausente si no hay respuestas incorrectas |
| 5 | Lista de respuestas | — | `paso 5` | `paso 2.5` entre tarjetas | Una tarjeta por respuesta, en orden de respuesta (a.3) |
| 6 | Botones finales | `paso 4` | `paso 5` | — | «Volver» (K2) e «Inicio» (K1), en fila de dos celdas iguales separadas por `paso 2.5` |
| 7 | Relleno inferior del scroll | — | — | `paso 8` más área segura inferior | Fin del scroll |

### a.2 Interior del encabezado

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Título | Alineado a la izquierda | «Revisión completa» |
| 2 | Resumen | Margen superior `paso 1` | «{correctCount} / {total} aciertos ({percentage}%)» |

### a.3 Interior de una tarjeta de respuesta

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Marco | Relleno `paso 3.5`; borde izquierdo `border-l-3` del color del estado de la respuesta | Cuerpo de la tarjeta |
| 2 | Encabezado | Fila entre extremos; margen inferior `paso 2` | «#{n}» a la izquierda; a la derecha, `glifo-acierto` o `glifo-error` (chico) y «Correcta» o «Incorrecta», separados `paso 1.5` |
| 3 | Enunciado | Margen inferior `paso 3` | Texto de la pregunta |
| 4 | Opciones | Separación `paso 2.5` entre filas | Una fila por opción (a.4) |
| 5 | Nota | Margen superior `paso 3`; solo con explicación | `glifo-explicacion` y texto; con rótulo si se aprueba `REV-P3` |
| 6 | «Reportar pregunta» | Margen superior `paso 2`; alto mínimo `paso 11` | K7 con `glifo-reportar` (chico) delante, separado `paso 2` |

### a.4 Interior de una opción

| Pieza | Medidas | Contenido |
|---|---|---|
| Fila | Celda de letra de ancho `paso 11` con filete derecho; texto con relleno vertical `paso 2.5` y horizontal `paso 3` | Letra, texto y, si la opción es la correcta o la elegida y falló, línea de estado |
| Línea de estado | Margen superior `paso 1`; glifo chico y texto separados `paso 1.5` | «Correcta» o «Incorrecta · tu respuesta» |

### a.5 Otros anchos (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Tarjetas, filtro y botones llenan la columna. La barra interna lleva su filete a todo el ancho |
| 1280 px | Igual | Igual | Sin dos columnas de tarjetas: el orden vertical se conserva. Los botones finales siguen en una fila de dos celdas |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. El texto de enunciados, opciones y notas salta de línea; la celda de letra conserva `paso 11`; el encabezado de la tarjeta salta de línea si «#{n}» y el estado no entran juntos |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Barra interna | `comun.md` §3 | | | | | | |
| Título «Revisión completa» | `tinta` | `fondo` | — | `titulo` | — | — | T1 |
| Resumen | `tintaSec` | `fondo` | — | `cuerpo` | — | — | T3 |
| «Volver» de arriba (K2) | `tinta` | `fondo` | `linea`, `border` | `cuerpo-fuerte` | — | `glifo-volver` (grande), `tinta` | T1, N1, N5 |
| Filtro, opción en reposo (K4) | `tinta` | `superficie` | `borde`, `border` | `cuerpo` | — | — | T2, N3 |
| Filtro, opción seleccionada (K4) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | — | T7, N5 |
| Tarjeta de respuesta (cuerpo) | — | `superficie` | `linea`, `border`; izquierdo `acierto` o `error`, `border-l-3` | — | — | — | N1, N9, N12 |
| Índice «#{n}» | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| Estado de la respuesta, correcta | `acierto` | `superficie` | — | `rotulo` | — | `glifo-acierto` (chico) | T11, N10 |
| Estado de la respuesta, incorrecta | `error` | `superficie` | — | `rotulo` | — | `glifo-error` (chico) | T15, N13 |
| Enunciado | `tinta` | `superficie` | — | `cuerpo` | — | — | T2 |
| Opción apagada | `tintaSec` | `superficie` | `filete`, `border` | `cuerpo` | Celda de letra: derecho `filete` | — | T4, X2 |
| Opción correcta | `tinta` | `aciertoFondo` | `acierto`, `border-2` | `cuerpo-fuerte` | Celda de letra: fondo `acierto`, letra `fondo`, derecho `acierto` | `glifo-acierto` (chico) en la línea de estado | T13, T12, T8, N11 |
| Opción incorrecta elegida | `tinta` | `errorFondo` | `error`, `border-2` | `cuerpo` | Celda de letra: fondo `error`, letra `fondo`, derecho `error` | `glifo-error` (chico) en la línea de estado | T17, T16, T9, N14 |
| Línea de estado de la opción | `acierto` o `error` | `aciertoFondo` o `errorFondo` | — | `rotulo` | — | `glifo-acierto` o `glifo-error` | T12, T16, N11, N14 |
| Nota de explicación | `tinta` | `superficie` | Izquierdo `acento`, `border-l-3`; resto `filete`, `border` | `cuerpo` | — | `glifo-explicacion` (chico), `acento` | T2, N18 |
| Rótulo «Nota / Explicación» (`REV-P3`) | `acento` | `superficie` | — | `rotulo` | — | `glifo-explicacion` (chico), delante | T6, N18 |
| «Reportar pregunta» (K7) | `tinta` | `superficie` | — | `cuerpo-fuerte` | — | `glifo-reportar` (chico), `tinta` | T2, N6 |
| «Volver» final (K2) | `tinta` | `fondo` | `linea`, `border` | `cuerpo-fuerte` | — | `glifo-volver` (grande), `tinta` | T1, N1, N5 |
| «Inicio» (K1) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | — | T7 |

Las opciones se pintan con la misma gramática de estados que el quiz (`Quiz.md` c.2): correcta, incorrecta elegida y apagada. La revisión no tiene estado de reposo, hover ni presionado: sus filas no son controles.

Glifo con texto (estado de la respuesta, línea de estado de la opción, nota, reportar, volver): decorativo, oculto a lectores (`aria-hidden`, `accessibilityElementsHidden`); la palabra es el nombre accesible. Todo control mide al menos `paso 11` de alto y de ancho, con `paso 2` como mínimo entre controles adyacentes.

---

## c. Matriz de estados

### c.1 Controles

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| «Volver» (K2), arriba y al final | Texto y glifo `tinta`; borde `linea`; fondo `fondo` | Contorno web `linea`, `border` | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — |
| «Inicio» (K1) | Fondo `tinta`; texto `fondo` | Contorno web `linea`, `border-2` | Inversión: fondo `superficie`; texto `tinta`; borde `linea` | Contorno `foco` | — | — |
| Opción del filtro (K4) | Borde `borde`; texto `tinta` | Borde `linea` | Inversión: aspecto de seleccionado | Contorno `foco` | Fondo `tinta`; texto `fondo` en `cuerpo-fuerte`; estado accesible seleccionado | — |
| «Reportar pregunta» (K7) | Texto y glifo `tinta` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; texto y glifo `fondo` | Contorno `foco` | — | — |
| Barra interna | `comun.md` §3 | `comun.md` §3 | `comun.md` §3 | `comun.md` §3 | — | — |

### c.2 Estado de cada respuesta

| Estado | Condición | Marco de la tarjeta | Encabezado | Opciones |
|---|---|---|---|---|
| Acertada | `answer.isCorrect` | Borde izquierdo `acierto`, `border-l-3` | `glifo-acierto` y «Correcta» (`acierto`) | La correcta en estado correcta; las demás, apagadas |
| Fallada | `!answer.isCorrect` | Borde izquierdo `error`, `border-l-3` | `glifo-error` y «Incorrecta» (`error`) | La elegida en estado incorrecta; la correcta en estado correcta; las demás, apagadas |

| Estado de la vista | Condición | Efecto |
|---|---|---|
| Todas | Filtro en «Todas» (por defecto) o sin filtro | Se listan todas las respuestas |
| Solo incorrectas | Filtro en «Incorrectas» (`REV-P1`) | Se listan las falladas; cada tarjeta conserva su «#{n}» original |
| Sin incorrectas | `correctCount === total` | El filtro no se muestra y la lista es la completa |
| Con retroalimentación oculta antes | El quiz corrió con `hideFeedback` | La revisión es donde el usuario ve por primera vez aciertos y errores; no cambia nada en la vista |
| Sin explicación | `answer.question.explanation` vacío | La tarjeta no tiene nota |

| Por qué se distinguen sin color | Detalle |
|---|---|
| Palabra | «Correcta» e «Incorrecta» en el encabezado y en la línea de estado de la opción |
| Glifo | Tilde y aspa, delante de la palabra |
| Marco | `border-2` en las opciones marcadas; apagadas con `border` |
| Peso | La correcta pasa a `cuerpo-fuerte` |

Origen de la pregunta, banco reducido y banda intermedia no aplican (—).

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Respuestas | `route.params.answers`: `{ question, selectedIndex, isCorrect }` | Sin respuestas, `Results` vuelve a `MateriaSelect` y no renderiza esta vista |
| Resumen | `correctCount`, `total` y `percentage` de `Results` (`Results.md` d.2) | El mismo valor que muestra la tarjeta de resultado |
| Índice | `idx + 1` en la lista completa | Con el filtro no se renumera |
| Enunciado, opciones y correcta | `answer.question.question`, `.options` y `.correctIndex` | La letra sale de `String.fromCharCode(65 + optIdx)` |
| Opción elegida | `answer.selectedIndex` | Incorrecta solo si es la elegida y la respuesta falló |
| Explicación | `answer.question.explanation` | Se muestra siempre que exista, aunque el quiz haya corrido con `hideFeedback` |
| Reporte | `reportQuestion(answer.question, materia?.name)` | Abre `mailto:` con el id y el enunciado (`src/utils/report.js`) |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Misma pantalla, otra vista | `showReview` alterna entre el resumen y la revisión sin navegar y sin cambiar el título de la barra |
| Una sola emisión de eventos | `simulacro_terminado` y `simulacro_aprobado` se emiten al montar `Results`; alternar `showReview` no los repite |
| Sin tope de respuestas | La revisión lista todas; el tope de 40 es solo de la tira de `Results` (`RESULTS-P3`) |
| Orden | El de respuesta |
| Acciones | «Volver» alterna `showReview` a falso; «Inicio» navega a `Home` con `requestAnimationFrame(() => navigation.navigate('Home'))`; «Reportar pregunta» no cambia de vista |
| Estado sin color | Correcta e incorrecta distinguibles en escala de grises (§4) |
| Sin emoji, radio ni sombra | Los símbolos de tilde y aspa, la bombilla, la bandera, la flecha de volver, `rounded-*` y `activeOpacity` salen de la vista (`comun.md` §9, D9) |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/ResultsScreen.js`

| Evento | Línea | Payload | Cuándo | Fila que lo cubre |
|---|---|---|---|---|
| `simulacro_terminado` | `ResultsScreen.js:61` | `{ mode, score: percentage, total }` | Una vez al montar `Results` | No es de esta vista y no se repite al abrirla: lo cubre `Results.md` d.4 |
| `simulacro_aprobado` | `ResultsScreen.js:63` | `{ mode, score: percentage }` | Al montar `Results`, con `percentage >= APROBADO_MIN_SCORE` | Igual: `Results.md` d.4 |
| `donacion_click` | `ResultsScreen.js:247` | `{ origen: 'resultados', monto: amt }` | Al tocar un monto del pedido | No está en esta vista: lo cubre `DonationBox.md` d.4 |

La revisión no emite eventos y la ficha no agrega ninguno.

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Título | «Revisión completa» | Igual | — |
| Resumen | «{c} / {t} aciertos ({p}%)» | Igual | — |
| Índice | «#{n}» | Igual | — |
| Estado de la respuesta | Tilde o aspa y «Correcta» o «Incorrecta» | `glifo-acierto` o `glifo-error` y «Correcta» o «Incorrecta» | Reemplazo de símbolo |
| Estado de la opción | Solo tilde o aspa, sin texto | `glifo-acierto` y «Correcta»; `glifo-error` y «Incorrecta · tu respuesta» | Lo exige `comun.md` §4 (cada estado lleva marca y texto); son las palabras de `Quiz.md` c.2 (`QUIZ-P7`, aprobada) y del encabezado de la tarjeta |
| Explicación | Emoji de bombilla y texto | `glifo-explicacion` y texto; con `REV-P3`, rótulo «Nota / Explicación» | Reemplazo de emoji; `REV-P3` |
| Reportar | Emoji de bandera y «Reportar pregunta» | «Reportar pregunta» con `glifo-reportar` | Reemplazo de emoji |
| Volver | Flecha de texto y «Volver» | «Volver» con `glifo-volver` | Reemplazo de símbolo |
| Inicio | «Inicio» | Igual | — |
| Filtro | No existe | «Todas» e «Incorrectas»; nombre accesible del grupo «Mostrar» | `REV-P1`; cadena accesible nueva, no visible |
| Volver de arriba | No existe | «Volver» | `REV-P2` |

---

## f. Propuestas pendientes (D10)

Cambios respecto de `main` que el boceto no dibuja. Quedan pendientes hasta que el usuario las apruebe; el cuerpo de la ficha (a a e) las describe aplicadas.

### f.1 Propuestas

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| REV-P1 | Sobre la lista va un filtro de dos opciones, «Todas» e «Incorrectas». «Incorrectas» muestra solo las falladas, con su número original. Si no hay falladas, el filtro no aparece | Un examen completo tiene hasta decenas de respuestas y lo que se estudia son las falladas; hoy hay que recorrer todo el scroll. No cambia el orden de uso: por defecto se ve la lista completa, como hoy | uso | pendiente |
| REV-P2 | «Volver» (a la vista de resumen) también va arriba de la lista, además de los botones del final | La barra interna de `Results` no tiene volver (`headerBackVisible: false`); con decenas de respuestas, el único camino de regreso queda al final del scroll | uso | pendiente |
| REV-P3 | La nota de explicación lleva el rótulo «Nota / Explicación» con `glifo-explicacion` delante, como en el quiz (`QUIZ-P6`, aprobada). `main` solo muestra la bombilla y el texto | Mismo componente y mismo rótulo que el quiz: una explicación se lee igual en los dos lugares | visual | pendiente |

### f.2 Variante sin el cambio

| Id | Si no se aprueba | Detalle |
|---|---|---|
| REV-P1 | Lista completa, sin filtro | Se omite el bloque 4 de a.1: el bloque 3 (o el 2, si tampoco se aprueba `REV-P2`) cierra con `paso 3` y la lista arranca debajo. Todas las tarjetas se muestran, en orden, con los tokens de b y c.2. Sin estado «Solo incorrectas» ni cadena «Mostrar» |
| REV-P2 | «Volver» solo al final | Se omite el bloque 3 de a.1: el encabezado cierra con `paso 3` y sigue el filtro o la lista. «Volver» final (K2) e «Inicio» (K1) quedan como en el bloque 6, con los mismos tokens, estados y objetivo `paso 11` |
| REV-P3 | Nota sin rótulo | La nota conserva el marco (izquierdo `acento`, `border-l-3`; resto `filete`, `border`) y el relleno `paso 3`. Dentro, una fila con `glifo-explicacion` (chico, `acento`, N18) y el texto en `cuerpo` y `tinta` (T2), separados `paso 2`, alineados arriba. Sin rótulo, sin margen inferior de rótulo |

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Vista de revisión no dibujada (el botón sí está en la figura 05) | Vista compuesta con la gramática del boceto | El botón del boceto necesita su destino; `main` fija el contenido (D10) |
| (`main`) opción marcada solo con tilde o aspa | Línea de estado con glifo y palabra | Spec `design-system`: estado distinguible sin color; `comun.md` §4: cada estado lleva marca y texto |
| (`main`) borde izquierdo de 4 | `border-l-3` | `tokens.md` c.2: solo grosores de 1, 2 y 3 |
| (`main`) opciones no marcadas sin atenuar | Opciones apagadas (`tintaSec`, marco `filete`) | Mismo tratamiento que el quiz (`QUIZ-P10`, aprobada), sin transparencia (`tokens.md` a.2) |
| (`main`) encabezado centrado | Encabezado a la izquierda | Gramática del boceto: rótulos y título a la izquierda (`Results.md` a.2) |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| REV-C1 | La revisión es una vista alternativa de `Results`, en el mismo lugar y sin navegar: «Revisar todas las respuestas» la abre y «Volver» regresa | Flujo de `main`; el botón del boceto necesita este destino | uso |
| REV-C2 | Por cada respuesta: número, estado, enunciado, todas las opciones, la correcta, la elegida si falló y la explicación si existe | Datos de `main`; es la única vista que muestra todas las opciones de cada pregunta | dato |
| REV-C3 | «Reportar pregunta» en cada respuesta, con `reportQuestion` | Es el camino de reporte desde los resultados | uso |
| REV-C4 | «Volver» e «Inicio» al final, en ese orden | Orden y ubicación de las acciones (D10) | uso |
| REV-C5 | La revisión muestra la explicación aunque el quiz haya corrido sin retroalimentación | Es el propósito del ajuste: «Al terminar, revisás todo junto» | uso |
| REV-C6 | Resumen «{c} / {t} aciertos ({p}%)» | Dato y copy de `main` | dato |
