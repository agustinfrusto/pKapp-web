# Quiz · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `QuizScreen` (`src/screens/QuizScreen.js`), ruta `Quiz` |
| Boceto | Figura 04 «Quiz» (`hibrido.html`) |
| Comunes | `comun.md`: §4 marcas de estado, §5 estados (K1, K3, K7), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra propia; sin barra interna: implica `headerShown: false` para `Quiz` en `App.js` (`comun.md` §3). Es la propuesta `QUIZ-P1`, aprobada |
| Variantes | Origen `exam`, `generated` y `user`; con y sin explicación; con y sin temporizador; última pregunta |
| Fuera de alcance | Insignia de parcial (distinción de parciales) y quiz sin retroalimentación (`hideFeedback`, examen en curso): su lugar está fijado; sus fichas son `comun.md` §12 y `ExamenEnCurso.md` |
| Propuestas | Sección f: `QUIZ-P1` y `QUIZ-P4` a `QUIZ-P10`. Sección h: conservado de main (D10). Comunes: `COMUN-P2` |

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra del quiz | Área segura superior | Relleno `paso 5` | — | Cerrar, progreso, contador y tiempo (a.2). Filete inferior `linea` a ancho completo |
| 2 | Fila de contexto | `paso 4` | `paso 5` | `paso 3` | Insignia de parcial (`comun.md` §12.3), origen y tema |
| 3 | Caja del enunciado | — | `paso 5` | `paso 4` | Rótulo «Enunciado» (margen inferior `paso 1.5`) y enunciado de la pregunta |
| 4 | Opciones | — | `paso 5` | `paso 2.5` entre opciones | Una por entrada de `options`, letras A, B, C… |
| 5 | Nota de explicación | `paso 4` | `paso 5` | — | Solo si respondió, hay retroalimentación y la pregunta tiene `explanation` |
| 6 | «Reportar pregunta» | `paso 3.5` | Centrado | — | Solo si respondió |
| 7 | Relleno inferior del scroll | — | — | `paso 24` más área segura inferior | Deja libre la barra inferior |
| 8 | Barra inferior (fija) | — | Relleno `paso 5` | — | Solo si respondió. Filete superior `linea` a ancho completo |

### a.2 Interior de la barra del quiz

Relleno vertical `paso 2`; fila de alto `paso 11`; separación `paso 3.5` entre piezas.

| # | Pieza | Medidas | Contenido |
|---|---|---|---|
| 1 | Cerrar | Objetivo `paso 11` por `paso 11`; glifo grande | `glifo-cerrar` |
| 2 | Progreso | Ocupa el espacio libre; alto `paso 2.5` | Casillas o barra continua (b) |
| 3 | Contador y tiempo | Columna a la derecha; contador arriba, tiempo abajo | «NN / NN», con cero a la izquierda; si hay temporizador, glifo de reloj y «mm:ss» |

### a.3 Interior de una opción y de la barra inferior

| Pieza | Medidas | Contenido |
|---|---|---|
| Opción | Fila; celda de letra de ancho `paso 11` con filete derecho; texto con relleno vertical `paso 3` y horizontal `paso 3` | Letra, texto y, tras responder, línea de estado con margen superior `paso 1` |
| Nota de explicación | Relleno `paso 3.5` en las cuatro caras; el rótulo es una fila con `glifo-explicacion` (chico) y el texto separados `paso 1.5`; la explicación va a `paso 1.5` bajo el rótulo | Rótulo «Nota / Explicación» y texto de la explicación |
| Barra inferior | Relleno superior `paso 3`; inferior área segura más `paso 4` | Un botón de ancho completo, relleno vertical `paso 3.5` y horizontal `paso 4`, texto a la izquierda y glifo a la derecha |

### a.4 Tablet y escritorio (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Las dos barras llevan su filete a todo el ancho; su contenido va dentro de la columna. El enunciado y las opciones llenan la columna |
| 1280 px | Igual | Igual | Igual. El botón de la barra inferior mide el ancho de la columna, no el de la ventana |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. En la barra del quiz, cerrar (`paso 11`), contador y tiempo conservan su tamaño y el progreso toma el espacio libre: las casillas se angostan o la barra continua se acorta, sin cambiar la regla de 40 (`QUIZ-P4`). En la fila de contexto la meta salta hasta dos líneas. El enunciado y el texto de cada opción saltan de línea; la celda de letra conserva `paso 11`. La barra inferior conserva el botón de ancho completo |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Barra del quiz | — | `fondo` | Inferior `linea`, `border` | — | — | — | N1 |
| Cerrar (K7) | `tinta` | `fondo` | — | — | — | `glifo-cerrar` | N5 |
| Casilla de progreso vacía | — | `fondo` | `filete`, `border` | — | — | — | X1 |
| Casilla de progreso llena | — | `tinta` | `tinta`, `border` | — | — | — | N5 |
| Barra de progreso continua | Relleno `tinta` | `fondo` | `filete`, `border` | — | — | — | N5, X1 |
| Contador | `tinta` | `fondo` | — | `rotulo` | — | — | T1 |
| Tiempo en reposo | `tinta` | `fondo` | — | `rotulo-medio` | — | `glifo-reloj` | T1 |
| Tiempo en alerta | `error` | `fondo` | `error`, `border-2` | `rotulo-medio` | — | `glifo-reloj` | T14, N12 |
| Meta de la pregunta: «{shortName} · {tema}» | `tintaSec` | `fondo` | — | `rotulo` | — | — | T3 |
| Insignia de parcial | `comun.md` §12.2 | | | | | | |
| Chip de origen | Ver c.3 | | | `rotulo` | — | Ver c.3 | Ver c.3 |
| Caja del enunciado | `tinta` | `superficie` | `linea`, `border` | `titulo` | — | — | T2, N1, N2 |
| Rótulo «Enunciado» | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| Opción en reposo (K3) | `tinta` | `superficie` | `borde`, `border` | `cuerpo` | Celda de letra: derecho `filete` | — | T2, N4 |
| Letra de opción | `tinta` | `superficie` | — | `dato` | — | — | T2 |
| Línea de estado de la opción | `acierto` o `error` | `aciertoFondo` o `errorFondo` | — | `rotulo` | — | `glifo-acierto` o `glifo-error` | T12, T16, N11, N14 |
| Nota de explicación | `tinta` | `superficie` | Izquierdo `acento`, `border-l-3`; resto `filete`, `border` | `cuerpo` | — | — | T2, N18 |
| Rótulo «Nota / Explicación» | `acento` | `superficie` | — | `rotulo` | — | `glifo-explicacion` (chico), delante del texto, `acento` | T6, N18 |
| «Reportar pregunta» (K3) | `tinta` | `superficie` | `borde`, `border` | `cuerpo-fuerte` | — | `glifo-reportar` | T2, N4 |
| Barra inferior | — | `fondo` | Superior `linea`, `border` | — | — | — | N1 |
| «Siguiente» o «Ver resultados» (K1) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | `glifo-siguiente` | T7 |

### Regla del progreso

| Total de preguntas | Forma | Casilla llena |
|---|---|---|
| Hasta 40 | Una casilla por pregunta, separadas por `paso 0.5` | Las casillas de la 1 a la actual |
| Más de 40 | Una barra continua del mismo alto, relleno proporcional | Proporción `actual / total` |

Con más de 40 casillas, a ancho de teléfono cada una queda demasiado fina para leerse. Un examen completo de 75 y la práctica sin tema superan el tope.

---

## c. Matriz de estados

### c.1 Controles

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Cerrar (K7) | Glifo `tinta` | Contorno web `linea`, `border` | Inversión: glifo `fondo` sobre `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — |
| «Reportar pregunta» (K3) | Borde `borde`; texto `tinta` | Borde `linea` | Inversión: fondo `tinta`; texto y glifo `fondo` | Contorno `foco` | — | — |
| «Siguiente» (K1) | Fondo `tinta`; texto y glifo `fondo` | Contorno web `linea`, `border-2` | Inversión: fondo `superficie`; texto `tinta`; borde `linea` | Contorno `foco` | — | — |
| Opción (K3) | Ver c.2 | Borde `linea` | Inversión total | Contorno `foco` | `ExamenEnCurso.md` c.2 (sin retroalimentación) | Ver c.2: tras responder deja de recibir toque |

### c.2 Opción según el estado de la respuesta

| Estado | Condición | Marco | Fondo | Celda de letra | Texto | Línea de estado |
|---|---|---|---|---|---|---|
| Reposo | Sin responder | `borde`, `border` | `superficie` | Letra `tinta`; filete derecho `filete` | `cuerpo`, `tinta` | — |
| Correcta | Respondida; `idx` igual a `correctIndex`; con retroalimentación | `acierto`, `border-2` | `aciertoFondo` | Fondo `acierto`; letra `fondo`; filete derecho `acierto`, `border-2` | `cuerpo-fuerte`, `tinta` (T13) | `glifo-acierto` y «Correcta», `rotulo`, `acierto` (T12) |
| Incorrecta | Respondida; es la elegida y no la correcta; con retroalimentación | `error`, `border-2` | `errorFondo` | Fondo `error`; letra `fondo`; filete derecho `error`, `border-2` | `cuerpo`, `tinta` (T17) | `glifo-error` y «Incorrecta · tu respuesta», `rotulo`, `error` (T16); si no entra en una línea a 390 px, salta de línea dentro de la celda de texto |
| Apagada | Respondida; ni correcta ni elegida; con retroalimentación | `filete`, `border` | `superficie` | Letra `tintaSec`; filete derecho `filete` | `cuerpo`, `tintaSec` (T4) | — |
| Sin retroalimentación | Respondida con `hideFeedback` | `ExamenEnCurso.md` c.2 | `ExamenEnCurso.md` c.2 | `ExamenEnCurso.md` c.2 | `ExamenEnCurso.md` c.2 | `ExamenEnCurso.md` c.2 |

| Por qué se distinguen sin color | Detalle |
|---|---|
| Glifo | Tilde en la correcta y aspa en la incorrecta (§4) |
| Texto | «Correcta» e «Incorrecta · tu respuesta» |
| Peso | La correcta pasa a `cuerpo-fuerte` |
| Ambas a la vez | Si la elegida es incorrecta, la correcta también se marca: aparecen las dos líneas de estado |

### c.3 Origen de la pregunta

Regla: una pregunta generada nunca se presenta como de examen real. El chip de examen es de silueta de marco con glifo de hoja y el nombre del examen; el de generada es de silueta rellena, con glifo propio y la palabra «Práctica». No comparten silueta, glifo ni texto.

| Origen | Condición | Texto | Glifo | Frente | Fondo | Borde | Par |
|---|---|---|---|---|---|---|---|
| Examen real | `source === 'exam'` y `exam` presente | `{exam}` | `glifo-origen-examen` | `acento` | `superficie` | `acento`, `border` | T6, N18 |
| Generada | `source === 'generated'` | «Práctica» | `glifo-origen-generada` | `fondo` | `tinta` | `tinta`, `border` | T7 |
| Propia | `source === 'user'` | «Tuya» | `glifo-origen-propia` | `tinta` | `superficie` | `linea`, `border` | T2, N2 |
| Sin dato | `source` ausente, o `exam` sin nombre | Sin chip (comportamiento actual) | — | — | — | — | — |

Medidas del chip: relleno vertical `paso 0.5`, horizontal `paso 2`; glifo chico; separación `paso 1.5` entre glifo y texto. Una línea.

| Posición | Detalle |
|---|---|
| Fila de contexto | A la izquierda: insignia de parcial (`comun.md` §12.3, encima) y chip de origen. A la derecha: meta «{shortName} · {tema}», alineada a la derecha, hasta dos líneas |

### c.4 Tiempo y progreso

| Elemento | Estado | Tratamiento |
|---|---|---|
| Tiempo | Normal (120 s o más) | Texto y glifo `tinta`; sin marco; el lugar del marco queda con relleno `paso 0.5` |
| Tiempo | Alerta (menos de 120 s) | Texto y glifo `error`; marco `error`, `border-2` en el lugar del relleno: el bloque no cambia de tamaño. El marco es la señal sin color |
| Progreso | Casilla vacía, llena, actual | La actual es la última llena |

Aciertos, errores e intermedia de rendimiento no aplican (—); banco reducido no aplica (—).

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Parámetros | `route.params`: `questions`, `mode`, `topic`, `hideFeedback`, `timerMinutes` | Sin `questions`, la pantalla vuelve a `MateriaSelect` (`navigation.reset`) |
| Pregunta | `questions[currentIndex]` | — |
| Enunciado | `currentQuestion.question` | — |
| Opciones | `currentQuestion.options`; letra `String.fromCharCode(65 + idx)` | A, B, C… |
| Correcta | `currentQuestion.correctIndex` | — |
| Tema | `TOPICS[currentQuestion.topic]`, o la clave si no hay nombre | Va después del id de materia, separado por « · » |
| Id de materia | `materia.shortName` (`useMateria()`) | Antecede al tema en la meta de la fila de contexto |
| Origen | `currentQuestion.source` y `currentQuestion.exam` | c.3 |
| Parcial | `currentQuestion.parcial` | `comun.md` §12.1 |
| Explicación | `currentQuestion.explanation` | Se muestra si respondió, `!hideFeedback` y existe |
| Contador | `currentIndex + 1` y `preguntas.length` | Dos dígitos con cero a la izquierda (formato del boceto); con totales de tres dígitos el ancho crece con el contenido |
| Tiempo | `timeLeft` en segundos; formato `mm:ss` | Cuenta regresiva desde `timerMinutes * 60` |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Origen distinguible a simple vista | c.3. Las tres variantes se separan por silueta, glifo y texto; una generada no usa nada del chip de examen (D6, spec `design-system`) |
| Un toque responde | `handleSelectOption`: registra con `recordAnswer(materiaId, id, isCorrect)` y no admite un segundo toque |
| Estado sin color | La correcta y la incorrecta se leen en escala de grises (§4, c.2) |
| Salida con confirmación | `beforeRemove` y `confirm('Salir del quiz', '¿Seguro que querés salir? Se perderá el progreso de este quiz.', …, { confirmLabel: 'Salir', destructive: true })`: diálogo del sistema, fuera del sistema visual |
| Cerrar | `handleQuit` navega a `Home`; la confirmación la pone el guardia |
| Fin del quiz | Última pregunta: «Ver resultados» navega con `navigation.replace('Results', …)`. Tiempo agotado: el mismo `replace`, sin confirmar |
| Gestos | Un toque por respuesta y uno por «Siguiente», como en `main` |
| Sin emoji, radio ni sombra | Los emojis de origen, explicación, reporte y tiempo pasan a glifos (`comun.md` §9, con su función y el porqué de su color); `rounded-*` y `sombras.card` salen de esta pantalla |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/QuizScreen.js`: sin resultados.

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| Ninguno | — | — | La pantalla no emite eventos y la ficha no agrega ninguno. `reportQuestion` (`src/utils/report.js`) no es analítica |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Origen examen | Emoji de hoja y `{exam}` | `{exam}` con `glifo-origen-examen` | Reemplazo de emoji |
| Origen generada | Emoji de destello y «Práctica» | «Práctica» con `glifo-origen-generada` | Reemplazo de emoji |
| Origen propia | Emoji de persona y «Tuya» | «Tuya» con `glifo-origen-propia` | Reemplazo de emoji |
| Explicación | Emoji de bombilla y «Explicación» | «Nota / Explicación» con `glifo-explicacion` | Reemplazo de emoji; texto del boceto aprobado por el usuario |
| Reporte | Emoji de bandera y «Reportar pregunta» | «Reportar pregunta» con `glifo-reportar` | Reemplazo de emoji |
| Tiempo | Emoji de cronómetro y «mm:ss» | `glifo-reloj` y «mm:ss» | Reemplazo de emoji |
| Siguiente | «Siguiente →» (flecha de texto) | «Siguiente» con `glifo-siguiente` | Reemplazo de símbolo |
| Última pregunta | «Ver resultados» | Igual, con `glifo-siguiente` | — |
| Cerrar | Carácter de cruz | `glifo-cerrar`; nombre accesible «Salir» | Reemplazo de símbolo; cadena accesible del boceto |
| Estado de opción | Solo tilde o aspa, sin texto | `glifo-acierto` y «Correcta»; `glifo-error` y «Incorrecta · tu respuesta» | Texto nuevo en el quiz; las palabras ya existen en la revisión de resultados. Respalda T12 y T16 |
| Contador | «{n} / {total}» | «NN / NN», con cero a la izquierda | Texto del boceto aprobado por el usuario |
| Rótulo del enunciado | No existe | «Enunciado», dentro de la caja, sobre el texto | Texto del boceto aprobado por el usuario |
| Meta de la pregunta | Tema | «{shortName} · {tema}» | Texto del boceto aprobado por el usuario |

---

## f. Propuestas aprobadas (D10)

Cambios del boceto respecto de `main`, o de `main` respecto del boceto. El usuario los aprobó el 2026-10-10 (D10): rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| QUIZ-P1 | `Quiz` oculta el header del Stack (`headerShown: false`) y su barra propia (cerrar, progreso, contador y tiempo) ocupa su lugar. En `main` conviven el título «pKapp · Quiz» del Stack y la banda de progreso. Condiciones: (1) la barra propia conserva toda acción de salida que existe hoy: `glifo-cerrar`, que llama `handleQuit` y navega a `Home`, con objetivo `paso 11`; (2) respeta el área segura superior (a.1, bloque 1); (3) no cambia el volver del navegador ni la confirmación de `beforeRemove` («Salir del quiz») | El boceto (figura 04) muestra una sola barra; dos barras apiladas le quitan altura al enunciado en teléfono. Hoy `Quiz` ya no muestra volver en el Stack (`headerBackVisible: false`): no desaparece ninguna salida visible | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P4 | Hasta 40 preguntas, una casilla por pregunta, separadas por `paso 0.5`; con más, una barra continua del mismo alto con relleno proporcional. El boceto dibuja 24 casillas fijas | El total real va de una decena de preguntas (un tema) a cientos (todos los temas); a 390 px más de 40 casillas quedan demasiado finas para leerse | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P5 | La caja del enunciado lleva el rótulo «Enunciado» en `rotulo` y `tintaSec` (T4), dentro de la caja y sobre el texto, con margen inferior `paso 1.5`; la caja crece lo que mide el rótulo. Es el texto del boceto | Texto del boceto aprobado por el usuario; `main` solo muestra el texto de la pregunta | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P6 | El rótulo de la nota dice «Nota / Explicación», en `rotulo` y `acento` (T6), con `glifo-explicacion` delante (el glifo lo exige la spec de emojis). Es el texto del boceto | Texto del boceto aprobado por el usuario; `main` dice «Explicación» | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P7 | La línea de estado de la opción elegida dice «Incorrecta · tu respuesta» (`rotulo`, `error`, T16) con `glifo-error` delante; la correcta conserva «Correcta». Si no entra en una línea a 390 px, salta de línea dentro de la celda de texto. Es el texto del boceto | Texto del boceto aprobado por el usuario; `main` solo marca la elegida como incorrecta | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P8 | A la derecha de la fila de contexto va la meta «{shortName} · {tema}» en `rotulo` y `tintaSec` (T3), alineada a la derecha y hasta dos líneas; `shortName` sale de `materia.shortName`. Es el texto del boceto | Texto del boceto aprobado por el usuario; `main` muestra solo el tema | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P9 | El contador es «NN / NN» con cero a la izquierda («01 / 24»), en `rotulo` y `tinta` (T1); con totales de tres dígitos el ancho crece con el contenido. Es el formato del boceto | Texto del boceto aprobado por el usuario; `main` no rellena con cero | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P10 | Tras responder con retroalimentación, las opciones que no son la elegida ni la correcta pasan a `tintaSec` con marco `filete`. En el boceto quedan en reposo | Conserva el efecto de `main` (opciones apagadas, hoy por opacidad) sin transparencia: la elegida y la correcta se destacan por contraste | visual | aprobada (usuario, 2026-10-10) |

Propuestas comunes que alcanzan esta pantalla: `COMUN-P2` (estados de control).

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta aprobada (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Chip solo para examen | Tres variantes de origen | D6: origen visible; una pregunta generada no se presenta como de examen real (spec `design-system`) |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite o dibuja distinto. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| QUIZ-P2 | «Reportar pregunta» bajo la explicación, solo tras responder, como botón de marco neutro (K3: `borde`, texto `tinta`) con `glifo-reportar`. El boceto no lo incluye | Está en uso en `main` y es el único camino para avisar de una pregunta errónea desde el quiz (`reportQuestion`, `src/utils/report.js`) | uso |
| QUIZ-P3 | Con temporizador activo, la barra muestra `glifo-reloj` y «mm:ss» bajo el contador; con menos de 120 s, texto y glifo pasan a `error` y el bloque lleva marco `error`, `border-2`. El boceto no tiene temporizador | El temporizador se configura en TopicSelect y corta el quiz al llegar a cero (`replace` a Results); la alerta es el aviso de que se acaba el tiempo | uso |
