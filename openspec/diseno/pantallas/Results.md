# Results · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `ResultsScreen` (`src/screens/ResultsScreen.js`), ruta `Results` |
| Boceto | Figura 05 «Resultados» (`hibrido.html`) |
| Comunes | `comun.md`: §3 barra interna, §4 marcas de estado, §5 estados (K1, K2), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra interna con título «pKapp · Resultados», sin volver (`headerBackVisible: false`): el lugar del volver queda vacío y la fila conserva el alto `paso 11` (`MAQUETA-P1`, `comun.md` §3.5) |
| Variantes | Tramo alto, medio o bajo (a.2 de d); con y sin tira (hasta 40 respuestas); con y sin pedido de donación (solo web) |
| Fuera de alcance | Revisión de respuestas (`showReview`, vista alternativa) y pedido de donación: su lugar está fijado; sus fichas son `Revision.md` y `DonationBox.md` |
| Propuestas | Sección f: `RESULTS-P1` a `RESULTS-P3`. Sección h: conservado de main (D10). Comunes: `COMUN-P2` y `MAQUETA-P1` (aprobada, usuario, 2026-10-10). Sección i: cambios de la tarea 5.2 (Diseñador, 2026-10-13) |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P5`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.4 |

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3, sin volver; fila de alto `paso 11` con el lugar del volver vacío y el título en el margen lateral `paso 5` (`MAQUETA-P1`) |
| 2 | Tarjeta de resultado | `paso 4` | `paso 5` | `paso 3` | Lámina de `comun.md` §6; relleno `paso 4`; contenido alineado a la izquierda (a.2) |
| 3 | Trío | — | `paso 5` | `paso 3` | Lámina de `comun.md` §6 con tres celdas (a.3) |
| 4 | Pedido de donación (`DonationBox.md` a.1) | — | `paso 5` | `paso 3` | Condicional (d.2). Conserva su lugar actual: entre el trío y los botones |
| 5 | Botones | `paso 1.5` | `paso 5` | `paso 2.5` entre botones | Tres, en el orden actual |
| 6 | Relleno inferior del scroll | — | — | `paso 8` | Fin del scroll |

La acción «Revisar todas las respuestas» cambia la vista a la revisión en el mismo lugar, sin navegar: esa vista es la ficha `Revision.md`.

### a.2 Interior de la tarjeta de resultado

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Rótulo | Alineado a la izquierda; margen inferior `paso 3` | «Resultado» |
| 2 | Porcentaje | Fila: marca de tramo (glifo grande) a la izquierda, separación `paso 2`, y el porcentaje en `display`; centrado en vertical | Marca y valor del tramo (d.1) |
| 3 | Subtítulo | Margen superior `paso 2.5` | «{correctCount} de {total} correctas» |
| 4 | Mensaje | Margen superior `paso 1.5` | Mensaje del tramo de `getResultFeedback` |
| 5 | Tira | Margen superior `paso 4`, inferior `paso 2`; casillas separadas por `paso 0.5`, alineadas por la base | Una casilla por respuesta, en orden; solo con 40 respuestas o menos |
| 6 | Leyenda | Separación `paso 4` entre ítems; margen inferior `paso 3.5`. Delante de cada texto, una muestra de la casilla de la tira, separada `paso 1.5` y alineada por la base: la de «Correcta» de lado `paso 2`, en `acierto`; la de «Incorrecta» de `paso 2` de ancho y `paso 1` de alto, en `error` (la relación de alto 2 a 1 de la tira) | Solo si hay tira |
| 7 | Chip de tema | Relleno vertical `paso 0.5`, horizontal `paso 2`; ancho por contenido | `TOPICS[topic]` cuando `topic` es una clave de `TOPICS`; «Todos los temas» cuando no (`MAQUETA-P2`: bug de `main`, se corrige en 3.6) |

### a.3 Interior del trío

Tres celdas de igual ancho, relleno vertical `paso 3`, separadas por filete vertical `filete`, contenido centrado: cifra arriba (`cifra`) y rótulo debajo (`rotulo`, margen superior `paso 1.5`).

Forma del rótulo según el ancho de la ventana (`C-01`, tarea 5.2, 2026-10-13). El criterio es el ancho de la ventana y no el contenido medido (`comun.md` §1.1): las tres celdas muestran siempre la misma forma.

| Ancho de ventana | Rótulo de «Correctas» e «Incorrectas» | Rótulo de «Total» | Por qué |
|---|---|---|---|
| 375 px o más | En línea: glifo chico y palabra en una línea, separados `paso 1.5`. «✗ INCORRECTAS» mide 101,9 px (16 + 6 + 11 × 7,26) | Su palabra, sin glifo, a la altura de las otras dos | Con 375 px el rótulo más largo (101,9 px) deja 4,2 px por lado en su celda; a 390 px, 6,7; a 768 px sobra |
| Menos de 375 px (360 y 320 px) | Apilado: el glifo chico arriba, centrado; la palabra debajo, separada `paso 1`. El bloque mide `paso 4` + `paso 1` + 16 px = 36 px y la celda crece 20 px | Su palabra va en la misma línea que las otras dos: la línea del glifo queda vacía, así las tres palabras comparten línea | En línea, a 320 px el rótulo (101,9 px) pisa 4,9 px por lado los filetes de una celda de 92 px y a 360 px deja 1,7 px por lado. Apilado, la palabra más larga mide 79,9 px: 6,1 px por lado a 320 y 12,7 a 360 |

El apilado no es un salto de línea por desborde de cada celda: con «salta de línea si no entra» a 320 px «Correctas» (87,3 px en línea) quedaba en línea con 2,3 px por lado e «Incorrectas» apilada, dos formas en la misma fila. Con barra de desplazamiento clásica de 15 px, a 375 px el rótulo en línea deja 1,7 px por lado: no pisa el filete. Medido en el build de 5.0b; la forma apilada, emulada en el DOM (columna, `paso 1`, línea reservada en «Total»): las tres palabras comparten línea y la celda pasa de 74 a 94 px.

### a.4 Tablet (D10); desde 1024 px, sección «Escritorio»

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Tarjeta, trío y botones llenan la columna. La tira sigue la regla de 40 |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P5`, aprobada): `hoja` | Igual | Tarjeta de resultado en la región lateral; trío, pedido y los tres botones, apilados, en la principal |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. En la tarjeta, el mensaje y el chip de tema saltan de línea; con 40 respuestas o menos la tira reparte sus casillas en el ancho disponible y la leyenda salta de línea si no entra. En el trío cada celda conserva un tercio del ancho y el rótulo se apila (glifo arriba, palabra abajo) en las tres celdas a la vez bajo 375 px (a.3, `C-01`). Los tres botones siguen apilados, con el texto saltando dentro del botón si no entra |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Barra interna | `comun.md` §3 | | | | | | |
| Tarjeta de resultado (cuerpo) | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | — | — | N1, N2 |
| Rótulo «Resultado» | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| Porcentaje, tramo alto | `acierto` | `superficie` | — | `display` | — | `glifo-acierto` | T11, N10 |
| Porcentaje, tramo medio | `intermedia` | `superficie` | — | `display` | — | `glifo-intermedia` | T19, N16 |
| Porcentaje, tramo bajo | `error` | `superficie` | — | `display` | — | `glifo-error` | T15, N13 |
| Subtítulo | `tinta` | `superficie` | — | `titulo` | — | — | T2 |
| Mensaje | `tintaSec` | `superficie` | — | `cuerpo` | — | — | T4 |
| Casilla correcta de la tira | — | `acierto` | — | — | — | — | N10 |
| Casilla incorrecta de la tira | — | `error` | — | — | — | — | N13 |
| Leyenda | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| Muestra de «Correcta» en la leyenda | — | `acierto` | — | — | — | — | N10 |
| Muestra de «Incorrecta» en la leyenda | — | `error` | — | — | — | — | N13 |
| Chip de tema | `acento` | `superficie` | `acento`, `border` | `rotulo` | — | — | T6, N18 |
| Trío (cuerpo) | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | Divisores `filete` | — | N1, N2, X2 |
| Cifra de correctas | `acierto` | `superficie` | — | `cifra` | — | — | T11 |
| Cifra de incorrectas | `error` | `superficie` | — | `cifra` | — | — | T15 |
| Cifra del total | `tinta` | `superficie` | — | `cifra` | — | — | T2 |
| Rótulo «Correctas» | `tintaSec` | `superficie` | — | `rotulo` | — | `glifo-acierto` (chico) | T4, N10 |
| Rótulo «Incorrectas» | `tintaSec` | `superficie` | — | `rotulo` | — | `glifo-error` (chico) | T4, N13 |
| Rótulo «Total» | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| «Revisar todas las respuestas» (K2, acento) | `acento` | `superficie` | `acento`, `border` | `cuerpo-fuerte` | — | `glifo-revisar` (chico), delante del texto | T6, N18 |
| «Volver a practicar» (K1) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | `glifo-reintentar` (chico), delante del texto | T7 |
| «Inicio» (K2) | `tinta` | `superficie` | `linea`, `border` | `cuerpo-fuerte` | — | `glifo-inicio` (chico), delante del texto | T2, N2, N6 |
| Pedido de donación | `DonationBox.md` b | | | | | | |
| Revisión de respuestas | `Revision.md` b | | | | | | |

Los tres botones tienen relleno vertical `paso 3.5` y texto centrado; el alto resultante supera `paso 11`. Cada uno lleva su glifo chico delante del texto, separado por `paso 2`; glifo y texto se centran como un grupo y el glifo toma el color del texto en todo estado (`comun.md` §9).

### Regla de la tira

| Total de respuestas | Tira y leyenda |
|---|---|
| Hasta 40 | Se muestran: una casilla por respuesta |
| Más de 40 | Se omiten; el bloque se cierra sin dejar hueco |

Con más de 40, a ancho de teléfono las casillas quedan demasiado finas. El detalle completo sigue en la revisión de respuestas (`Revision.md`).

---

## c. Matriz de estados

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado | Tramo alto | Tramo medio | Tramo bajo |
|---|---|---|---|---|---|---|---|---|---|
| «Revisar todas las respuestas» (K2, acento) | Texto y borde `acento`; fondo `superficie` | Contorno web `acento`, `border` | Inversión: fondo `tinta`; texto `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — | — | — | — |
| «Volver a practicar» (K1) | Fondo `tinta`; texto `fondo` | Contorno web `linea`, `border-2` | Inversión: fondo `superficie`; texto `tinta`; borde `linea` | Contorno `foco` | — | — | — | — | — |
| «Inicio» (K2) | Texto `tinta`; borde `linea`; fondo `superficie` | Contorno web `linea`, `border` | Inversión: fondo `tinta`; texto `fondo` | Contorno `foco` | — | — | — | — | — |
| Porcentaje y marca | Estático | — | — | — | — | — | `acierto` con `glifo-acierto` | `intermedia` con `glifo-intermedia` | `error` con `glifo-error` |
| Tira | Estática | — | — | — | — | — | Casillas altas `acierto` y bajas `error`; la forma (alto) distingue sin color | Igual | Igual |
| Trío | Estático | — | — | — | — | — | Cifras con su marca y su palabra | Igual | Igual |
| Pedido de donación | `DonationBox.md` c | `DonationBox.md` c | `DonationBox.md` c | `DonationBox.md` c | — | — | Texto celebratorio desde `DONATION_WARM_SCORE` | — | — |
| Barra interna | `comun.md` §3 | | | | | | | | |

Banco reducido y origen de la pregunta no aplican (—).

| Por qué se distinguen sin color | Detalle |
|---|---|
| Correctas e incorrectas | Palabra («Correctas», «Incorrectas»), glifo delante del rótulo y, en la tira, alto de casilla |
| Tramos del porcentaje | Glifo propio por tramo y mensaje propio por tramo; el color acompaña |

---

## d. Datos e invariantes

### d.1 Umbrales (D6, leídos de `src/screens/ResultsScreen.js`)

| Constante | Valor | Qué decide |
|---|---|---|
| `APROBADO_MIN_SCORE` | 60 | Con `percentage >= 60` se emite `simulacro_aprobado` |
| `DONATION_MIN_SCORE` | 60 | El pedido de donación solo puede aparecer con `percentage >= 60` |
| `DONATION_WARM_SCORE` | 80 | Con `percentage >= 80` el pedido usa el texto celebratorio |
| `DONATION_EVERY` | 3 | El pedido se muestra en 1 de cada 3 aprobados (el 1.º, el 4.º, el 7.º…) |

Son constantes de módulo: `rg -n 'APROBADO_MIN_SCORE|DONATION_' src/screens/ResultsScreen.js`. La ficha no cita números de línea (se desactualizan; tarea 5.2, `C-06`).

`getResultFeedback(percentage)` (función de módulo al final de `ResultsScreen.js`; devuelve `{ message, estado }`, y `estado` elige token y marca):

| Porcentaje | Mensaje | Tramo de color | Token | Marca |
|---|---|---|---|---|
| 90 o más | «¡Excelente!» | Alto | `acierto` | `glifo-acierto` |
| 75 o más y menos de 90 | «Muy bien. Vas por buen camino.» | Alto | `acierto` | `glifo-acierto` |
| 60 o más y menos de 75 | «A repasar solo un poco más.» | Medio | `intermedia` | `glifo-intermedia` |
| 50 o más y menos de 60 | «Seguí mejorando.» | Medio | `intermedia` | `glifo-intermedia` |
| Menos de 50 | «A estudiar fuerte. Vos podés.» | Bajo | `error` | `glifo-error` |

Los cortes 90, 75, 60 y 50 no cambian. La ficha solo traduce el tono de aviso que hoy usa el código (`warning.bold`) al token `intermedia`. Estos tramos no son los de Stats (80 y 60).

### d.2 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Respuestas | `route.params.answers` | Sin respuestas, la pantalla vuelve a `MateriaSelect` (`navigation.reset`) y no emite eventos |
| Correctas | `answers.filter(a => a.isCorrect).length` | — |
| Total | `answers.length` | — |
| Porcentaje | `Math.round(correctCount / total * 100)`; 0 si el total es 0 | — |
| Incorrectas | `total - correctCount` | — |
| Tema | `route.params.topic`; el chip muestra `TOPICS[topic]` si es una clave y «Todos los temas» si no | Hoy `main` muestra la clave cruda: bug que corrige la tarea 3.6 (`MAQUETA-P2`) |
| Modo | `route.params.mode` | Solo viaja en los eventos |
| Pedido de donación | `shouldShowDonation(percentage)`: solo web, con `percentage >= DONATION_MIN_SCORE`, contando en `localStorage` (`pkapp_donation_count`) | `DonationBox.md` d.1 |

### d.3 Invariantes

| Invariante | Detalle |
|---|---|
| Umbrales | d.1: ningún valor cambia; la ficha no los mueve ni los renombra |
| Orden de botones | «Revisar todas las respuestas», «Volver a practicar», «Inicio» |
| Acciones | «Volver a practicar» hace `navigation.goBack()`; «Inicio» navega a `Home`; «Revisar» alterna `showReview` en el mismo lugar |
| Estado sin color | Correctas e incorrectas distinguibles en escala de grises (§4) |
| Sin emoji, radio ni sombra | Los tres emojis de botón pasan a glifos (`comun.md` §9); el campo `emoji` de `getResultFeedback` (no se renderiza) se elimina; `rounded-*` y `sombras.cardAlta` salen de esta pantalla |
| Color por `style` | El color del porcentaje depende de un valor calculado; sale del token del tramo, no de un literal |

### d.4 Eventos `track(...)`

`rg -n 'track\(' src/screens/ResultsScreen.js`

| Evento | Dónde | Payload | Cuándo | Fila que lo cubre |
|---|---|---|---|---|
| `simulacro_terminado` | `ResultsScreen.js`, efecto de montaje | `{ mode, score: percentage, total }` | Una vez al montar, si hay respuestas | Tarjeta de resultado y trío (porcentaje, total). No se mueve |
| `simulacro_aprobado` | `ResultsScreen.js`, mismo efecto | `{ mode, score: percentage }` | Al montar, si `percentage >= APROBADO_MIN_SCORE` | Porcentaje, tramo alto o medio (d.1). No se mueve |
| `donacion_click` | `DonationBox.js` (el pedido de Results ya no tiene un manejador propio en `ResultsScreen.js`) | `{ origen: 'resultados', monto: amt }`, más `variante`, `tramo` y `uso` | Al tocar un monto del pedido de donación | Pedido de donación (`DonationBox.md` d.4, que documenta también `donacion_vista` y `donacion_cerrada`). No se toca |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Botón de revisión | Emoji de portapapeles y «Revisar todas las respuestas» | «Revisar todas las respuestas» con `glifo-revisar` | Reemplazo de emoji (`comun.md` §9) |
| Botón de reintento | Emoji de flechas circulares y «Volver a practicar» | «Volver a practicar» con `glifo-reintentar` | Reemplazo de emoji |
| Botón de inicio | Emoji de casa e «Inicio» | «Inicio» con `glifo-inicio` | Reemplazo de emoji |
| Mensajes de tramo | Los cinco de d.1; el de 75 a 89 es «¡Muy bien! Vas por buen camino.» | Los cinco de d.1; el de 75 a 89 es «Muy bien. Vas por buen camino.» | Texto del boceto aprobado por el usuario (`RESULTS-P2`); los otros cuatro no cambian |
| Rótulo de la tarjeta | No existe | «Resultado», sobre la fila de porcentaje | Texto del boceto aprobado por el usuario (`RESULTS-P1`) |
| Leyenda de la tira | No existe | «Correcta» e «Incorrecta» | Texto nuevo en esta pantalla; las palabras ya existen en la revisión |
| Nombre accesible de la tira | No existe | «Detalle por pregunta» | Cadena accesible del boceto |
| Total | «Total» | Igual | — |

El mensaje del tramo alto superior hoy termina en «!.» (signo y punto). La ficha lo copia tal cual; corregirlo es una decisión de copy del usuario.

---

## f. Propuestas aprobadas (D10)

Cambios del boceto respecto de `main`, o de `main` respecto del boceto. El usuario los aprobó el 2026-10-10 (D10): rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| RESULTS-P1 | La tarjeta de resultado arranca con el rótulo «Resultado» en `rotulo` y `tintaSec` (T4), alineado a la izquierda y sobre la fila de porcentaje, con margen inferior `paso 3`. Es el texto del boceto | Texto del boceto aprobado por el usuario; `main` no tiene el rótulo | visual | aprobada (usuario, 2026-10-10) |
| RESULTS-P2 | El mensaje del tramo de 75 a 89 dice «Muy bien. Vas por buen camino.», sin signos, como en el boceto; `main` dice «¡Muy bien! Vas por buen camino.». Los otros cuatro mensajes de d.1 no cambian | Texto del boceto aprobado por el usuario | visual | aprobada (usuario, 2026-10-10) |
| RESULTS-P3 | La tira tiene una casilla por respuesta cuando hay 40 o menos; con más, no se muestra, ni su leyenda. El boceto dibuja 24 casillas fijas | El total real varía; con más de 40 las casillas quedan demasiado finas a 390 px. El detalle completo sigue en la revisión de respuestas (`Revision.md`) | visual | aprobada (usuario, 2026-10-10) |

Propuestas comunes que alcanzan esta pantalla: `COMUN-P2` (estados de control) y `MAQUETA-P1` (barra interna de igual alto con y sin volver, `comun.md` §3.5; aprobada, usuario, 2026-10-10).

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta aprobada (f).

| Boceto | Ficha | Motivo |
|---|---|---|
| Porcentaje de un solo color y cifras ilustrativas | Tres tramos por `getResultFeedback`, con marca | D6 y spec «Estados semánticos distinguibles sin color» |
| Sin pedido de donación | Conserva su lugar (`DonationBox.md` a.1) | D6: el evento `donacion_click` con `origen: 'resultados'` sigue emitiéndose desde esta pantalla |
| Vista de revisión no dibujada (el botón sí está en el boceto) | Conserva la vista de `main` como destino del botón (`Revision.md`) | El botón del boceto necesita su destino; la ficha de la vista es `Revision.md` |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite o dibuja distinto. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| RESULTS-C1 | El pedido de donación entre el trío y los botones, solo en web, con sus umbrales (`DONATION_MIN_SCORE`, `DONATION_WARM_SCORE`) y su frecuencia (1 de cada 3 aprobados). El boceto no lo dibuja. Su aspecto es de `DonationBox.md` | D6: eventos y umbrales de donación; `DON-C3` y `DON-C6` | uso |
| RESULTS-C2 | La vista de revisión de respuestas como destino de «Revisar todas las respuestas», en el mismo lugar y sin navegar. El boceto dibuja el botón y no su destino | Flujo de `main`; `Revision.md` (`REV-C1`) | uso |
| RESULTS-C3 | El orden de los tres botones («Revisar todas las respuestas», «Volver a practicar», «Inicio») y sus acciones: alternar la revisión, `navigation.goBack()` y navegar a `Home` | Orden y gestos de `main` (d.3) | uso |
| RESULTS-C4 | Los cinco mensajes de `getResultFeedback` y sus cortes 90, 75, 60 y 50, salvo el texto del tramo de 75 a 89 (`RESULTS-P2`) | D6 y copy de `main` (d.1, e) | copy |
| RESULTS-C5 | Los eventos `simulacro_terminado`, `simulacro_aprobado` y `donacion_click` con sus payloads | D6: eventos y payloads (d.4) | dato |

---

## i. Cambios de la tarea 5.2

Recorrido final de la rama `rediseno-revision-ux`. No son propuestas nuevas: cierran una medida que faltaba o corrigen la ficha contra el código. Cada fila dice qué había, qué rige ahora y cómo se comprueba.

| Fecha | Id | Cambio | Antes | Después | Aceptación observable (Programador y e2e) |
|---|---|---|---|---|---|
| 2026-10-13 | `C-01` | Forma del rótulo del trío a 360 y 320 px: apilado en las tres celdas a la vez, por ancho de ventana (a.3 y a.4) | a.4, fila «360 px y 320 px»: «su rótulo salta de línea si no entra». A 320 px «✗ INCORRECTAS» (101,9 px) pisaba 4,9 px por lado los filetes de una celda de 92 px (`CeldaTrio` y `MarcaEstado`: fila sin salto) y a 360 px dejaba 1,7 px por lado | Bajo 375 px de ancho de ventana las marcas de «Correctas» e «Incorrectas» se apilan a la vez (glifo arriba, palabra abajo, `paso 1`) y «Total» deja libre la línea del glifo; desde 375 px, en línea. Criterio por ancho de ventana, como `comun.md` §1.1 | (1) 320 y 360 px: en «Correctas» e «Incorrectas» `glifo.abajo ≤ palabra.arriba`; las tres palabras con el mismo `arriba` (± 0,5 px); celda 20 px más alta. (2) 375, 390, 768 y 1366 px: glifo y palabra en una línea (centros verticales a ± 1 px) y «Total» a la altura de las otras. (3) En todo ancho la caja del rótulo cae dentro de su celda: `rótulo.izq ≥ celda.izq + borde` y `rótulo.der ≤ celda.der`; holgura ≥ 5 px por lado apilado y ≥ 4 px a 375 px. Implementación: en `ResultsScreen.js`, `useWindowDimensions` contra una constante nombrada de 375 (precedente: `ANCHO_CORTE` de `HomeScreen.js`), pasada a las tres `CeldaTrio`; `MarcaEstado` con una forma apilada (`flex-col items-center gap-1`); en «Total» una `View` de alto `paso 4` con `aria-hidden` antes de la palabra. La aserción de `resultados.js` («320 px: «Incorrectas» rompe con el glifo arriba…») pasa a las dos celdas y a 360 px |
| 2026-10-13 | `C-06` (nota) | d.1 y d.4 dejan de citar números de línea | `APROBADO_MIN_SCORE` «15», `DONATION_*` «18 a 21», `getResultFeedback(percentage, esOscuro)` «290 a 305», `track` «61» y «63», `donacion_click` en `ResultsScreen.js:247` | Constantes de módulo (`rg -n 'APROBADO_MIN_SCORE\|DONATION_' src/screens/ResultsScreen.js`); `getResultFeedback(percentage)`; `donacion_click` vive en `DonationBox.js` | Sin cambio de código |

---

## Escritorio · propuesta `ESC-P5` (tarea 3.10, aprobada por el usuario el 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); sin cambio en `amplio`. Teléfono y tablet no cambian |
| Bajo el corte | a.4 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E05a (tramo alto con pedido de donación) y E05b (tramo bajo, sin pedido), a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Umbrales y tramos de d.1, copy de e, eventos de d.4, orden y acciones de los botones (`RESULTS-C3`), pedido entre el trío y los botones (`RESULTS-C1`), elementos y pares de b |

### Disposición

| # | Región | Contenido, en orden de DOM | Escritorio | Amplio |
|---|---|---|---|---|
| 1 | Barra interna | Sin volver; el título en el margen de la hoja (`MAQUETA-P1`) | Contenido dentro de `hoja` | Igual |
| 2 | Lateral | Tarjeta de resultado (a.2) | Ancho `lateral`, anclada arriba a la izquierda | Igual |
| 3 | Principal | Trío (a.3), pedido de donación si toca (`DonationBox.md`) y los tres botones (b) | Ancho de la región principal. El pedido, entre el trío y los botones (`DON-C6`). Botones apilados, en su orden (`RESULTS-C3`) | Igual |

### Medidas

| Elemento | Medida |
|---|---|
| Tarjeta de resultado | Ancho `lateral`, relleno `paso 4`. La tira reparte sus casillas en ese ancho (hasta 40, `RESULTS-P3`); la leyenda y el chip de tema saltan de línea si no entran, como a 320 px (a.4) |
| Trío | Tres celdas iguales a ancho de la región principal; relleno vertical `paso 3` |
| Botones | Relleno vertical `paso 3.5` y texto centrado, a ancho de la región principal |
| Separación | Entre bloques, la de a.1 |

### Revisado

| Ancho de ventana | Qué se ve | Alto del contenido |
|---|---|---|
| 1024 (el corte) | Lateral y principal sin ajuste; sin scroll horizontal | — |
| 1366 × 768 | Tarjeta, trío, pedido de donación y los tres botones en una ventana | 1,0 ventanas (con `columna`: 1,4) |
| 1920 × 1080 | Igual, con margen | 0,6 ventanas (con `columna`: 1,0) |

### Orden, teclado y foco

| Aspecto | Regla |
|---|---|
| Orden de DOM | El del teléfono: barra, tarjeta, trío, pedido, «Revisar todas las respuestas», «Volver a practicar», «Inicio» |
| Tab | Descartar el pedido, montos, los tres botones, en ese orden |
| Cambia de lugar | La tarjeta de resultado queda a la izquierda del trío, del pedido y de los botones, no encima; el pedido sigue entre el trío y los botones |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P5` | Desde el corte `escritorio`, la tarjeta de resultado pasa a una región lateral y el trío, el pedido de donación y los botones a la principal | El resultado, el trío y las acciones caben en una ventana de 1366 × 768 sin desplazarse; el orden de las acciones y la posición del pedido no cambian | visual | aprobada (usuario, 2026-10-11) |
