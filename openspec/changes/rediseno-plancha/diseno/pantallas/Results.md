# Results · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `ResultsScreen` (`src/screens/ResultsScreen.js`), ruta `Results` |
| Boceto | Figura 05 «Resultados» (`hibrido.html`) |
| Comunes | `comun.md`: §3 barra interna, §4 marcas de estado, §5 estados (K1, K2), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra interna con título «pKapp · Resultados», sin volver (`headerBackVisible: false`): el lugar del volver queda vacío y la fila conserva el alto `paso 11` (`MAQUETA-P1`, `comun.md` §3.5) |
| Variantes | Tramo alto, medio o bajo (a.2 de d); con y sin tira (hasta 40 respuestas); con y sin pedido de donación (solo web) |
| Fuera de alcance | Revisión de respuestas (`showReview`, vista alternativa) y pedido de donación: su lugar está fijado; sus fichas son `Revision.md` y `DonationBox.md` |
| Propuestas | Sección f: `RESULTS-P1` a `RESULTS-P3`. Comunes: `COMUN-P2` y `MAQUETA-P1` (aprobada, usuario, 2026-10-10) |

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
| 6 | Leyenda | Separación `paso 4` entre ítems; margen inferior `paso 3.5` | Solo si hay tira |
| 7 | Chip de tema | Relleno vertical `paso 0.5`, horizontal `paso 2`; ancho por contenido | El valor de `topic` |

### a.3 Interior del trío

Tres celdas de igual ancho, relleno vertical `paso 3`, separadas por filete vertical `filete`, contenido centrado: cifra arriba (`cifra`) y rótulo debajo (`rotulo`, margen superior `paso 1.5`).

### a.4 Tablet y escritorio (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Tarjeta, trío y botones llenan la columna. La tira sigue la regla de 40 |
| 1280 px | Igual | Igual | Los tres botones siguen apilados: sin fila horizontal |

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

| Constante | Valor | Línea | Qué decide |
|---|---|---|---|
| `APROBADO_MIN_SCORE` | 60 | 15 | Con `percentage >= 60` se emite `simulacro_aprobado` |
| `DONATION_MIN_SCORE` | 60 | 18 | El pedido de donación solo puede aparecer con `percentage >= 60` |
| `DONATION_WARM_SCORE` | 80 | 19 | Con `percentage >= 80` el pedido usa el texto celebratorio |
| `DONATION_EVERY` | 3 | 21 | El pedido se muestra en 1 de cada 3 aprobados (el 1.º, el 4.º, el 7.º…) |

`getResultFeedback(percentage, esOscuro)` (líneas 290 a 305):

| Porcentaje | Mensaje | Tramo de color | Token | Marca |
|---|---|---|---|---|
| 90 o más | «¡Excelente!.» | Alto | `acierto` | `glifo-acierto` |
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
| Tema | `route.params.topic`, tal cual llega | Puede ser una clave de tema o «Todos los temas» |
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

| Evento | Línea | Payload | Cuándo | Fila que lo cubre |
|---|---|---|---|---|
| `simulacro_terminado` | `ResultsScreen.js:61` | `{ mode, score: percentage, total }` | Una vez al montar, si hay respuestas | Tarjeta de resultado y trío (porcentaje, total). No se mueve |
| `simulacro_aprobado` | `ResultsScreen.js:63` | `{ mode, score: percentage }` | Al montar, si `percentage >= APROBADO_MIN_SCORE` | Porcentaje, tramo alto o medio (d.1). No se mueve |
| `donacion_click` | `ResultsScreen.js:247` | `{ origen: 'resultados', monto: amt }` | Al tocar un monto del pedido de donación | Pedido de donación (`DonationBox.md` d.4). No se toca |

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
