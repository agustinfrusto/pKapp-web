# Quiz · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `QuizScreen` (`src/screens/QuizScreen.js`), ruta `Quiz` |
| Boceto | Figura 04 «Quiz» (`hibrido.html`) |
| Comunes | `comun.md`: §4 marcas de estado, §5 estados (K1, K3, K7), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra propia; sin barra interna: implica `headerShown: false` para `Quiz` en `App.js` (`comun.md` §3). Es la propuesta `QUIZ-P1`, aprobada |
| Variantes | Origen `exam`, `generated` y `user`; con y sin explicación; con y sin temporizador; última pregunta |
| Fuera de alcance | Insignia de parcial (distinción de parciales) y quiz sin retroalimentación (`hideFeedback`, examen en curso): su lugar está fijado; sus fichas son `comun.md` §12 y `ExamenEnCurso.md` |
| Propuestas | Sección f: `QUIZ-P1` y `QUIZ-P4` a `QUIZ-P10`; `QUIZ-P4` enmendada por `B-04` (usuario, 2026-10-13). Sección f.1: `REV-1`, `REV-3`, `REV-8` y `REV-9` de la revisión 5.0b, aprobadas (usuario, 2026-10-12). Sección h: conservado de main (D10). Comunes: `COMUN-P2`. Sección i: cambios de la tarea 5.2 (Diseñador, 2026-10-13), con `B-04` (decisión del usuario) |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P4`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.4 |

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra del quiz | Área segura superior | Relleno `paso 5` | — | Cerrar, progreso, contador y tiempo (a.2). Filete inferior `linea` a ancho completo |
| 2 | Fila de contexto | `paso 4` | `paso 5` | `paso 3` | Insignia de parcial (`comun.md` §12.3), origen y tema. Entre el grupo de insignia y chip y la meta, `paso 2`: al lado si caben en la fila y debajo si la meta baja de línea (a.4, `REV-8`; medidas de la tabla tras a.2) |
| 3 | Caja del enunciado | — | `paso 5` | `paso 4` | Relleno interior `paso 3.5` en las cuatro caras (`CONVENCIONES.md` CD-17). Rótulo «Enunciado» (margen inferior `paso 1.5`) y enunciado de la pregunta |
| 4 | Opciones | — | `paso 5` | `paso 2.5` entre opciones | Una por entrada de `options`, letras A, B, C… |
| 5 | Nota de explicación | `paso 4` | `paso 5` | — | Solo si respondió, hay retroalimentación y la pregunta tiene `explanation` |
| 6 | «Reportar pregunta» | `paso 3.5` | Centrado | — | Solo si respondió. K7 sin marco (`REV-3`): `glifo-reportar` chico delante del texto en `cuerpo`; alto mínimo `paso 11`, relleno horizontal `paso 4` |
| 7 | Relleno inferior del scroll | — | — | `paso 24` más área segura inferior | Deja libre la barra inferior |
| 8 | Barra inferior (fija) | — | Relleno `paso 5` | — | Solo si respondió. Filete superior `linea` a ancho completo |

Movimiento (`REV-1`, c.5): al responder, los bloques 5 a 8 entran con un fundido de `opacity` de 150 ms (en la barra inferior, la lámina solo se funde y su contenido suma `translateY` de `paso 2` a 0); al cambiar de pregunta, los bloques 2 a 4 entran con el mismo fundido. El alto de cada bloque se reserva en el mismo cuadro: el movimiento nunca mueve el layout.

### a.2 Interior de la barra del quiz

Relleno vertical `paso 2`; fila de alto `paso 11`; separación `paso 3.5` entre piezas.

| # | Pieza | Medidas | Contenido |
|---|---|---|---|
| 1 | Cerrar | Objetivo `paso 11` por `paso 11`; glifo grande | `glifo-cerrar` |
| 2 | Progreso | Ocupa el espacio libre; alto `paso 2.5` | Casillas o barra continua (b) |
| 3 | Contador y tiempo | Columna a la derecha; contador arriba, tiempo abajo, sin separación entre ambos (columna sin `gap`; los separa solo el relleno `paso 0.5` del tiempo, c.4) | «NN / NN», con cero a la izquierda; si hay temporizador, glifo de reloj y «mm:ss» |

Medidas que fija la ficha (tarea 5.2, `B-05`, 2026-10-13). Siguen a la maqueta y a `CONVENCIONES.md` CD-17: dos de las tres no coinciden con el código, y esas dos son un cambio de clase de 2 y 4 px (sección i).

| Medida | Valor de la ficha | Maqueta (`generar.mjs`) | Código hoy (`QuizScreen.js`, por `testID`) | Qué hay que hacer |
|---|---|---|---|---|
| Relleno de la caja del enunciado (a.1 bloque 3) | `paso 3.5` (14 px) en las cuatro caras: relleno de tarjeta, CD-17 | `.q-enunciado`: 14 px en las cuatro caras | `enunciado-quiz`: `px-3.5 pb-4 pt-3.5`, o sea 16 px abajo. Parece una confusión con la separación inferior de la caja (`mb-4`, `paso 4`) | Código: `pb-4` → `pb-3.5` |
| Grupo de insignia y chip, y meta (a.1 bloque 2) | `paso 2` (8 px), al lado o debajo si la meta baja de línea: `paso 2` entre elementos de un grupo, CD-17 | `.q-ctx`: 8 px | Fila de contexto, `flex-row flex-wrap`: `gap-3` (12 px) entre `chip-origen` y `meta-pregunta` | Código: `gap-3` → `gap-2` |
| Contador y tiempo (a.2 bloque 3) | Sin separación: los separa el relleno `paso 0.5` del bloque del tiempo (c.4), que es el 2 px de la maqueta | `.q-cont`: 2 px | Columna `items-end` sin `gap`; `tiempo-quiz` con `p-0.5` o `border-2` | Ninguna |

### a.3 Interior de una opción y de la barra inferior

| Pieza | Medidas | Contenido |
|---|---|---|
| Opción | Fila; celda de letra de ancho `paso 11` con filete derecho; texto con relleno vertical `paso 3` y horizontal `paso 3` | Letra, texto y, tras responder, línea de estado con margen superior `paso 1` |
| Nota de explicación | Relleno `paso 3.5` en las cuatro caras; el rótulo es una fila con `glifo-explicacion` (chico) y el texto separados `paso 1.5`; la explicación va a `paso 1.5` bajo el rótulo | Rótulo «Nota / Explicación» y texto de la explicación |
| Barra inferior | Relleno superior `paso 3`; inferior área segura más `paso 4` | Un botón de ancho completo, relleno vertical `paso 3.5` y horizontal `paso 4`, texto a la izquierda y glifo a la derecha |

### a.4 Tablet (D10); desde 1024 px, sección «Escritorio»

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Las dos barras llevan su filete a todo el ancho; su contenido va dentro de la columna. El enunciado y las opciones llenan la columna |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P4`, aprobada): `lectura` | Igual | Barras a todo el ancho; el botón de la barra inferior mide `lectura`, no la ventana |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. En la barra del quiz, cerrar (`paso 11`), contador y tiempo conservan su tamaño y el progreso toma el espacio libre: las casillas se angostan mientras quepa cada una con su separación y, si no caben, el progreso pasa a la barra continua, que se acorta: nada corre bajo el contador ni el tiempo (`QUIZ-P4`, `B-04`; cuenta y medidas en b, «Regla del progreso»). A 320 px con temporizador, de 33 preguntas en adelante el progreso es la barra continua; a 360 px con temporizador, con 40 preguntas hay casillas. En la fila de contexto la meta salta de línea sin tope ni recorte (`REV-8`, fila siguiente): con el tema más largo del catálogo, dos líneas a 360 px y tres a 320 px. El enunciado y el texto de cada opción saltan de línea; la celda de letra conserva `paso 11`. La barra inferior conserva el botón de ancho completo |
| Meta «{shortName} · {tema}» (`REV-8`, aprobada 2026-10-12) | — | A la derecha de la fila de contexto si entra en la misma fila; si no, en su propia línea debajo, a todo el ancho de la columna y alineada a la derecha | Sin tope de líneas ni recorte (`QuizScreen.js`, `testID` `meta-pregunta`, sin `numberOfLines`; es la regla de D10: el tema nunca se recorta ni se abrevia): toma el ancho que dejan la insignia de parcial y el chip de origen y salta de línea las veces que haga falta. Con el tema más largo del catálogo («RyD · Eje hipotálamo-hipófiso-testicular y respuesta sexual», 59 caracteres) son dos líneas desde 360 px y tres a 320 px; a 390 px la meta corta queda en la fila del contexto y la larga baja a su propia línea. Lo afirma `anchosDelQuiz` (`tools/e2e/suites/quiz.js`) |

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
| «Reportar pregunta» (K7, `REV-3`) | `tinta` | `fondo` (el de la página; sin relleno propio) | — (sin marco) | `cuerpo` | — | `glifo-reportar` (chico), delante del texto, `tinta` | T1, N5 |
| Barra inferior | — | `fondo` | Superior `linea`, `border` | — | — | — | N1 |
| «Siguiente» o «Ver resultados» (K1) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | `glifo-siguiente` | T7 |

### Regla del progreso

| Condición (`n` es el total de preguntas) | Forma | Casilla llena |
|---|---|---|
| `n ≤ 40` y cada casilla cabe con su separación: `n ≤ floor((ancho del progreso + 2) / 4)` | Una casilla por pregunta, separadas por `paso 0.5` | Las casillas de la 1 a la actual |
| `n` mayor que 40, o las casillas no caben | Una barra continua del mismo alto, relleno proporcional | Proporción `actual / total` |

Con más de 40 casillas, a ancho de teléfono cada una queda demasiado fina para leerse. Un examen completo de 75 y la práctica sin tema superan el tope. El tope de 40 se conserva: la cuenta de ancho (`B-04`, opción A, decisión del usuario, 2026-10-13) solo suma el caso en que hasta 40 casillas no caben. A 360 px o más no actúa: hasta 40 casillas caben siempre.

La cuenta: cada casilla mide como mínimo 2 px (el marco `border` de cada lado) y lleva 2 px de separación (`paso 0.5`); `n` casillas piden `4n − 2` px, porque la última no lleva separación detrás, de donde `n ≤ floor((ancho + 2) / 4)`. El ancho del progreso es el de la pieza Progreso de a.2 (`progreso-quiz`): el de la columna, menos `paso 11`, 2 × `paso 3.5` y la columna de contador y tiempo. Esa columna mide `paso 20` (80 px, ancho mínimo del valor del temporizador, `tokens.md` c.3) con temporizador y el ancho del contador «NN / NN» (50,8 px) sin él. A ancho de teléfono la columna es la ventana menos 2 × `paso 5`.

| Ventana | Temporizador | Ancho del progreso | Casillas que caben | Con 40 preguntas |
|---|---|---|---|---|
| 320 px | Con | 128 px (medido) | 32 | Barra continua |
| 320 px | Sin | 157 px (calculado) | 39 | Barra continua |
| 360 px | Con | 168 px (medido) | 42 | 40 casillas: rige el tope de 40 |
| 390 px | Con | 198 px (calculado) | 50 | 40 casillas: rige el tope de 40 |

Medido en BCYT, examen de 1er parcial (40 preguntas), con temporizador, build 5.0b; el resto, calculado con esas medidas.

---

## c. Matriz de estados

### c.1 Controles

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Cerrar (K7) | Glifo `tinta` | Contorno web `linea`, `border` | Inversión: glifo `fondo` sobre `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — |
| «Reportar pregunta» (K7, `REV-3`) | Sin marco; texto y glifo `tinta` sobre `fondo` (T1, N5) | Contorno web `linea`, `border` (N1) | Inversión total: fondo `tinta`; texto y glifo `fondo` (T7) | Contorno `foco`, `border-2`, separado `paso 0.5` (N7) | — | — |
| «Siguiente» (K1) | Fondo `tinta`; texto y glifo `fondo` | Contorno web `linea`, `border-2` | Inversión: fondo `superficie`; texto `tinta`; borde `linea` | Contorno `foco` | — | — |
| Opción (K3) | Ver c.2 | Borde `linea` | Inversión total | Contorno `foco` | `ExamenEnCurso.md` c.2 (sin retroalimentación) | Ver c.2: tras responder deja de recibir toque |

Ningún estado de esta tabla lleva transición: hover, presionado y foco cambian en el mismo cuadro (CD-2, CD-3). El único movimiento de la pantalla es el fundido de entrada de c.5.

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
| Movimiento (`REV-1`) | El marco, el relleno, la celda de letra y el texto de la opción tocada (y de la correcta, si difiere) cambian en el mismo cuadro del toque, sin animación; solo la línea de estado entra con el fundido de c.5 |

### c.3 Origen de la pregunta

Regla: una pregunta generada nunca se presenta como de examen real. El chip de examen es de silueta de marco con glifo de hoja y el nombre del examen; el de generada es de silueta rellena, con glifo propio y la palabra «Práctica». No comparten silueta, glifo ni texto.

| Origen | Condición | Texto | Glifo | Frente | Fondo | Borde | Par |
|---|---|---|---|---|---|---|---|
| Examen real | `source === 'exam'` y `exam` presente | `{exam}` | `glifo-origen-examen` | `acento` | `superficie` | `acento`, `border` | T6, N18 |
| Generada | `source === 'generated'` | «Práctica» | `glifo-origen-generada` | `fondo` | `tinta` | `tinta`, `border` | T7 |
| Propia | `source === 'user'` | «Tuya» | `glifo-origen-propia` | `tinta` | `superficie` | `linea`, `border` | T2, N2 |
| Sin dato | `source` ausente, o `exam` sin nombre | Sin chip (comportamiento actual) | — | — | — | — | — |

Decisión del usuario (2026-10-11, relevamiento de «generada»): la variante «Generada» se conserva tal cual. Hoy ningún banco publicado ni propio la produce (los seis son `source: 'exam'` y las propias, `user`), pero es el soporte deliberado de la regla de arriba y de D6; el chip «Práctica», su texto y `glifo-origen-generada` no cambian. La maqueta la dibuja en 04e.

Medidas del chip: relleno vertical `paso 0.5`, horizontal `paso 2`; glifo chico; separación `paso 1.5` entre glifo y texto. Una línea.

| Posición | Detalle |
|---|---|
| Fila de contexto | A la izquierda: insignia de parcial (`comun.md` §12.3, encima) y chip de origen. A la derecha: meta «{shortName} · {tema}», alineada a la derecha, sin tope de líneas ni recorte (`REV-8`): si no entra en la fila pasa a su propia línea debajo, a todo el ancho de la columna; con el tema más largo del catálogo, dos líneas desde 360 px y tres a 320 px (a.4) |

### c.4 Tiempo y progreso

| Elemento | Estado | Tratamiento |
|---|---|---|
| Tiempo | Normal (120 s o más) | Texto y glifo `tinta`; sin marco; el lugar del marco queda con relleno `paso 0.5` |
| Tiempo | Alerta (menos de 120 s) | Texto y glifo `error`; marco `error`, `border-2` en el lugar del relleno: el bloque no cambia de tamaño. El marco es la señal sin color |
| Progreso | Casilla vacía, llena, actual | La actual es la última llena |

Aciertos, errores e intermedia de rendimiento no aplican (—); banco reducido no aplica (—).

### c.5 Movimiento (`REV-1`, aprobada por el usuario el 2026-10-12)

Fundido de entrada, sin cambio de layout. Vale para el quiz y para el examen en curso (`ExamenEnCurso.md` a.2). Mandato de `tasks.md` 5.0b: solo `opacity` y `transform` que calcule el compositor, 200 ms como máximo, `prefers-reduced-motion` respetado, sin JS cuadro a cuadro ni librerías.

| Aspecto | Regla |
|---|---|
| Qué entra con fundido al responder | En cada opción marcada, la línea de estado (`MarcaEstado`); la nota «Nota / Explicación»; el aviso «Resultado oculto hasta el final» (examen en curso, `EXA-P1`); «Reportar pregunta»; la barra inferior. `opacity` de 0 a 1 en 150 ms, curva `cubic-bezier(0, 0, 0.2, 1)` (el `ease-out` de Tailwind). La barra inferior se reparte en dos nodos: su lámina (`barra-inferior`, con el filete y el fondo) anima solo `opacity` y no se mueve, así su alto se reserva en el mismo cuadro, como hoy; su contenido (`barra-inferior-contenido`) anima solo `transform`, de `translateY(8px)` (`paso 2`) a `none`, en los mismos 150 ms y con la misma curva (mecanismo, más abajo) |
| Qué entra con fundido al pasar de pregunta | El bloque fila de contexto + caja del enunciado + opciones (bloques 2 a 4 de a.1), con el mismo fundido, cada vez que cambia `currentIndex`. La barra del quiz (progreso, contador, tiempo) cambia sin animación; el scroll vuelve arriba sin animar, como hoy (`scrollTo` con `animated: false` en `handleNext` de `QuizScreen.js`; `rg -n 'animated: false' src/screens/QuizScreen.js`); «Ver resultados» navega con `replace`, sin animación |
| Qué no se anima | El cambio de estado de la opción tocada (marco, relleno, celda de letra y texto): respuesta inmediata al toque, en el mismo cuadro. Presionado, hover y foco: sin transición (CD-2, CD-3). El progreso, el temporizador y su alerta. Nada en salida: lo que desaparece, desaparece en el mismo cuadro |
| Ningún estado por opacidad | La opacidad es solo el fundido de entrada; en reposo todo está a opacidad 1. El estado lo siguen dando marco, relleno, marca y texto (CD-24, `comun.md` §4). Ninguna clase `opacity-*` nueva en `src/`: el `rg -n 'opacity-' src` del chequeo de 3.14 sigue dando solo el carrusel |
| Mecanismo (fijado por el Diseñador, 2026-10-12; barra alineada con la implementación, 2026-10-13) | **Web Animations API**, variante (a) de `diseno/revision-5.0b.md` §3.1. El hook `useEntrada(ref, clave, { soloDesplazar })` de `src/components/plancha/` (`useEntrada.js`; listado en `index.js:30`) que, en un efecto de layout sobre `[clave]` y con el nodo DOM del `View` (en react-native-web el `ref` del `View` es el elemento), llama `el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'cubic-bezier(0,0,0.2,1)' })`. La barra inferior se reparte en dos nodos y dos animaciones, de 150 ms y con la misma curva: la lámina (`barra-inferior`, que lleva el filete y el fondo) entra con ese fundido de `opacity` y no se mueve, así su alto sigue reservado en el mismo cuadro; su contenido (`barra-inferior-contenido`, el botón) llama al hook con `{ soloDesplazar: true }` y anima solo `transform`, de `translateY(8px)` (`paso 2`) a `none`, sin `opacity`. Sin `fill`: al terminar, el estilo vuelve al del elemento y no queda nada residual; si el elemento se desmonta o la clave cambia antes de los 150 ms, `cancel()`. Clave: `currentIndex` para el bloque de la pregunta; las piezas que aparecen al responder se montan en ese momento y animan al montar. Efecto de layout (no `useEffect`) para que el primer cuadro pintado ya sea el keyframe 0 y no haya un destello a opacidad 1 |
| Por qué (a) y no (b) | Con las clases `opacity-0` → `opacity-100` (variante (b), la del carrusel) el elemento se monta invisible y recién se hace visible en un render posterior: con movimiento reducido quedaría un cuadro invisible, y la barra necesitaría un segundo envoltorio o `transition-[opacity,transform]` para no transicionar también el hover y el presionado (CD-2, CD-3). Con (a) no hay clase intermedia ni residual, el mismo hook cubre `opacity` y `transform` (`soloDesplazar`, en el contenido de la barra), la reentrada al cambiar de pregunta no necesita `key` ni desmontar, y `document.getAnimations()` expone la animación tal cual la pide la aceptación |
| Movimiento reducido | Si `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, el hook no llama a `animate`: todo aparece de inmediato, como hasta la 5.0b. Mismo chequeo que el carrusel (`src/components/RegionAvisos.js:87`) |
| Solo web | Solo si `Platform.OS === 'web'` y `typeof el.animate === 'function'`; si no, nada (sin `Animated`, `requestAnimationFrame` ni temporizadores que cambien estilos). Los toques responden durante el fundido: la opacidad no bloquea eventos |
| Peso | ≈ 0,3 a 0,4 KB gzip de JS (el hook y cinco refs); 0 B de CSS. Entra en la holgura de D5 (5.164 B tras la 5.0); lo mide la 3.x con el build y la e2e |

| # | Aceptación observable | Cómo se observa |
|---|---|---|
| 1 | Inmediatamente tras responder, las piezas nuevas tienen animaciones de 150 ms cuyos keyframes solo tocan `opacity`; la excepción es el contenido de la barra inferior (`barra-inferior-contenido`), que solo toca `transform`, con el keyframe 0 en `translateY(8px)`. La lámina (`barra-inferior`) solo toca `opacity` | `document.getAnimations()` en el mismo tick del `click`: `effect.getTiming().duration` ≤ 200 y `effect.getKeyframes()` sin otra propiedad que `opacity`, o `transform` en `barra-inferior-contenido` |
| 2 | Con movimiento reducido no hay ninguna animación | `Emulation.setEmulatedMedia` con `prefers-reduced-motion: reduce`: `document.getAnimations()` vacío tras responder y tras «Siguiente» |
| 3 | La opción tocada cambia de estado en el mismo cuadro | Captura inmediata tras el `click`: marco, relleno y celda de letra ya en su estado final (c.2) |
| 4 | Tras «Siguiente», el scroll está arriba y el bloque de la pregunta entra con fundido | `scrollTop` 0; una animación sobre el bloque de la pregunta |
| 5 | Ningún `opacity` distinto de 1 en reposo | El chequeo de 3.14 sobre el estilo calculado, 200 ms después de cada acción |
| 6 | Shell dentro de D5 | Método de `evidencia/base.md`; tope 256.379 B |

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
| Movimiento (`REV-1`) | Solo `opacity` y `transform` calculados por el compositor, 150 ms, sin bloquear ni demorar un toque y sin mover el layout; con `prefers-reduced-motion: reduce`, ninguna animación; ningún estado se expresa con opacidad (c.5) |
| Foco tras «Siguiente» (web, teclado; `REV-9`) | Cuando la barra inferior se desmonta al cambiar de pregunta, el foco pasa a la primera opción de la pregunta nueva si estaba en «Siguiente» o quedó en `body` por el desmontaje; con puntero el foco no se mueve. Convención Engram 70 (el foco tras quitar un control va al primero habilitado); detalle en «Orden, teclado y foco» |
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
| QUIZ-P4 | Hasta 40 preguntas, una casilla por pregunta, separadas por `paso 0.5`, mientras quepa cada una con su separación (`n ≤ floor((ancho del progreso + 2) / 4)`, b «Regla del progreso», `B-04`); con más de 40, o si no caben, una barra continua del mismo alto con relleno proporcional. El boceto dibuja 24 casillas fijas | El total real va de una decena de preguntas (un tema) a cientos (todos los temas); a 390 px más de 40 casillas quedan demasiado finas para leerse. A 320 px con temporizador el progreso mide 128 px y 40 casillas piden 158: de 33 preguntas en adelante las últimas correrían bajo el reloj (`B-04`) | visual | aprobada (usuario, 2026-10-10); enmendada por `B-04` (usuario, 2026-10-13, opción A) |
| QUIZ-P5 | La caja del enunciado lleva el rótulo «Enunciado» en `rotulo` y `tintaSec` (T4), dentro de la caja y sobre el texto, con margen inferior `paso 1.5`; la caja crece lo que mide el rótulo. Es el texto del boceto | Texto del boceto aprobado por el usuario; `main` solo muestra el texto de la pregunta | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P6 | El rótulo de la nota dice «Nota / Explicación», en `rotulo` y `acento` (T6), con `glifo-explicacion` delante (el glifo lo exige la spec de emojis). Es el texto del boceto | Texto del boceto aprobado por el usuario; `main` dice «Explicación» | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P7 | La línea de estado de la opción elegida dice «Incorrecta · tu respuesta» (`rotulo`, `error`, T16) con `glifo-error` delante; la correcta conserva «Correcta». Si no entra en una línea a 390 px, salta de línea dentro de la celda de texto. Es el texto del boceto | Texto del boceto aprobado por el usuario; `main` solo marca la elegida como incorrecta | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P8 | A la derecha de la fila de contexto va la meta «{shortName} · {tema}» en `rotulo` y `tintaSec` (T3), alineada a la derecha, sin tope de líneas ni recorte: si no entra en la fila pasa a su propia línea debajo, a todo el ancho de la columna; con el tema más largo del catálogo, dos líneas desde 360 px y tres a 320 px (`REV-8`, 2026-10-12; hasta la 5.0b decía «hasta dos líneas», que no cabía junto con «sin recorte» a 320 px); `shortName` sale de `materia.shortName`. Es el texto del boceto | Texto del boceto aprobado por el usuario; `main` muestra solo el tema | visual | aprobada (usuario, 2026-10-10); enmendada por `REV-8` (usuario, 2026-10-12) |
| QUIZ-P9 | El contador es «NN / NN» con cero a la izquierda («01 / 24»), en `rotulo` y `tinta` (T1); con totales de tres dígitos el ancho crece con el contenido. Es el formato del boceto | Texto del boceto aprobado por el usuario; `main` no rellena con cero | visual | aprobada (usuario, 2026-10-10) |
| QUIZ-P10 | Tras responder con retroalimentación, las opciones que no son la elegida ni la correcta pasan a `tintaSec` con marco `filete`. En el boceto quedan en reposo | Conserva el efecto de `main` (opciones apagadas, hoy por opacidad) sin transparencia: la elegida y la correcta se destacan por contraste | visual | aprobada (usuario, 2026-10-10) |

Propuestas comunes que alcanzan esta pantalla: `COMUN-P2` (estados de control).

### f.1 Propuestas de la revisión 5.0b (aprobadas por el usuario el 2026-10-12)

Origen: `diseno/revision-5.0b.md` §3 (`tasks.md` 5.0b.1, 5.0b.3, 5.0b.8 y 5.0b.9). Rigen tal como quedaron escritas en el cuerpo de la ficha (a a d y «Orden, teclado y foco»); la columna «Sin el cambio» describe la variante descartada (C2). Las implementa el Programador con la spec del Ingeniero.

| Id | Qué cambia | Sin el cambio | Motivo | Tipo | Estado |
|---|---|---|---|---|---|
| `REV-1` | Movimiento del quiz (c.5): lo que aparece al responder (líneas de estado, nota, aviso «Resultado oculto», «Reportar pregunta», barra inferior) entra con un fundido de `opacity` de 150 ms; el contenido de la barra suma `translateY` de `paso 2` a 0 y su lámina solo se funde; al pasar de pregunta, el bloque contexto + enunciado + opciones entra con el mismo fundido. La opción tocada cambia en el mismo cuadro. Mecanismo: Web Animations API. Con `prefers-reduced-motion`, nada. ≈ 0,4 KB | Todo aparece de inmediato, como hasta la 5.0b: la respuesta, la nota y la barra se materializan sin orden y la pregunta siguiente parece la misma pantalla con otro texto | Un fundido corto da respuesta al toque y orienta sin demorar nada ni mover el layout; precedente `BAN-P2` (`src/components/RegionAvisos.js:353`); dentro de CD-24 (la opacidad no codifica estado) | visual | aprobada (usuario, 2026-10-12) |
| `REV-3` | «Reportar pregunta» pasa de K3 (marco `borde`, `cuerpo-fuerte`, sobre `superficie`) a K7 sin marco: `glifo-reportar` chico delante, texto `cuerpo` en `tinta` sobre `fondo`, centrado, alto mínimo `paso 11`, relleno horizontal `paso 4`; hover contorno `linea`, presionado inversión total, foco `foco` (a.1 bloque 6, b, c.1, h `QUIZ-P2`). También en el examen en curso. Pares: T1 16,32 / 15,97; N5; hover N1; presionado T7. 0 B | K3 con marco `borde` y `cuerpo-fuerte`, como `QUIZ-P2` hasta la 5.0b | Reportar es una utilidad ocasional; con marco y negrita pesa como una opción de respuesta. Sin marco y en regular queda un escalón por debajo de las opciones y de «Siguiente», en el mismo escalón que descartar y eliminar (K7 sin marco). Conserva E2 y CD-14 (`tinta`, sin rojo); el escalón a `tintaSec` es `CC-1`, pendiente | visual | aprobada (usuario, 2026-10-12) |
| `REV-8` | `QUIZ-P8` adopta lo que hace la app: la meta no tiene tope de líneas ni recorte; si no entra en la fila del contexto pasa a su propia línea, a todo el ancho; con el tema más largo, dos líneas desde 360 px y tres a 320 px (a.4, c.3, f). Solo documentación; la aserción `anchosDelQuiz` de la e2e ya lo afirma y el Programador alinea su comentario | La ficha pedía «hasta dos líneas» y «sin recorte» a la vez, y el código resolvía a favor de «sin recorte» sin que la ficha lo dijera | El Analista de 3.5 mostró que las dos reglas no caben juntas a 320 px; D10 manda (sin recorte desde 320 px) y los nombres de tema nunca se abrevian (`AddQuestion-ADD-P3.md` d.2) | documentación | aprobada (usuario, 2026-10-12) |
| `REV-9` | Foco tras «Siguiente» con teclado: al desmontarse la barra inferior, el foco pasa a la primera opción de la pregunta nueva (solo web; solo si el foco estaba en la barra o quedó en `body`). ≈ 0,1 KB («Orden, teclado y foco», d.2) | Al activar «Siguiente» con Enter el botón se desmonta y el foco cae en `body`: el siguiente Tab arranca desde el principio de la página | Convención Engram 70 (foco tras quitar un control); WCAG 2.4.3; precedente `TopicSelect.md` f.1 | uso | aprobada (usuario, 2026-10-12) |

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
| QUIZ-P2 | «Reportar pregunta» bajo la explicación, solo tras responder, como botón sin marco (K7: texto `cuerpo` en `tinta`, `glifo-reportar` chico delante; aspecto fijado por `REV-3` el 2026-10-12, antes K3 de marco `borde` en `cuerpo-fuerte`). Función, lugar y condición se conservan; el aspecto es de la ficha (E1). El boceto no lo incluye | Está en uso en `main` y es el único camino para avisar de una pregunta errónea desde el quiz (`reportQuestion`, `src/utils/report.js`) | uso |
| QUIZ-P3 | Con temporizador activo, la barra muestra `glifo-reloj` y «mm:ss» bajo el contador; con menos de 120 s, texto y glifo pasan a `error` y el bloque lleva marco `error`, `border-2`. El boceto no tiene temporizador | El temporizador se configura en TopicSelect y corta el quiz al llegar a cero (`replace` a Results); la alerta es el aviso de que se acaba el tiempo | uso |

---

## i. Cambios de la tarea 5.2

Recorrido final de la rama `rediseno-revision-ux`. No son propuestas nuevas: cierran una medida que faltaba, corrigen la ficha contra el código o bajan una decisión del usuario sobre una propuesta aprobada (`B-04`). Cada fila dice qué había, qué rige ahora y cómo se comprueba.

| Fecha | Id | Cambio | Antes | Después | Aceptación observable (Programador y e2e) |
|---|---|---|---|---|---|
| 2026-10-13 | `B-04` (decisión del usuario, opción A; enmienda `QUIZ-P4`) | El progreso del quiz dibuja casillas mientras quepa cada una con su separación y, si no caben, la barra continua que `QUIZ-P4` ya define. La cuenta, sus medidas y su tabla están en b «Regla del progreso»; a.4 (fila «360 px y 320 px»), `QUIZ-P4` (f) y «Medidas» de Escritorio dicen lo mismo | Casillas siempre que `n ≤ 40`, sin mirar el ancho (`TOPE_DE_CASILLAS`; `rg -n 'TOPE_DE_CASILLAS' src/screens/QuizScreen.js`). A 320 px con temporizador el progreso mide 128 px y 40 casillas piden 158: la última termina 30 px después de la caja y 16 px dentro del bloque del tiempo, así que las últimas 4 casillas corren bajo el reloj; el contador queda libre y no hay scroll ni recorte | Casillas si `n ≤ 40` y `n ≤ floor((ancho del progreso + 2) / 4)`; si no, la barra continua (`barra-progreso`). A 360 px o más nada cambia (con temporizador, a 360 px caben 42 y rige el tope de 40). A 320 px con temporizador: casillas hasta 32 preguntas y barra continua de 33 a 40 | (1) 320 px, temporizador, 33 a 40 preguntas: `barra-progreso` visible, sin `casilla-llena` ni `casilla-vacia`, y su borde derecho no pasa del izquierdo de `tiempo-quiz`. (2) 320 px, temporizador, 32 preguntas o menos: casillas, y el borde derecho de la última no pasa del de `progreso-quiz`. (3) 360 px, temporizador, 40 preguntas: 40 casillas, la última dentro de `progreso-quiz`. (4) 390 px: casillas hasta 40 y barra desde 41, como hasta ahora. (5) Sin scroll horizontal a 320 y 360 px. (6) 320 px sin temporizador con 40 preguntas queda a menos de 1 px del límite (158 contra 157,2): no es aserción de la e2e. El mecanismo lo fija la spec del Ingeniero; `progresoPorCasillas` y `anchosDelQuiz` (`tools/e2e/suites/quiz.js`) suman los casos. Datos de prueba: BCYT, examen de 1er parcial (40 preguntas), con temporizador |
| 2026-10-13 | `B-05` (nota) | a.1 (bloques 2 y 3) y a.2 (bloque 3) fijan tres medidas que faltaban, con la tabla que sigue a a.2 | Sin medida: el relleno de la caja del enunciado, el espacio entre el chip de origen y la meta, y el de contador y tiempo. La maqueta usa 14 px en las cuatro caras, 8 px y 2 px | Enunciado: `paso 3.5` en las cuatro caras (CD-17); chip y meta: `paso 2`; contador y tiempo: sin separación propia (los separa el `paso 0.5` del tiempo). Son las medidas de la maqueta; ningún umbral depende de ellas | `enunciado-quiz`: relleno de 14 px en las cuatro caras; separación entre `chip-origen` y `meta-pregunta` de 8 px. Código: `QuizScreen.js` `pb-4` → `pb-3.5` en la caja del enunciado y `gap-3` → `gap-2` en la fila de contexto (`rg -n 'enunciado-quiz\|gap-3' src/screens/QuizScreen.js`) |
| 2026-10-13 | `B-06` (nota) | c.5 deja de citar un número de línea para el `scrollTo` | «`QuizScreen.js:219`»; el `scrollTo` está hoy unas 45 líneas más abajo | `scrollTo` con `animated: false` en `handleNext`, con su comando `rg` | Sin cambio de código |
| 2026-10-13 | `B-07` (nota) | La barra inferior se describe como está implementada: lámina y contenido, dos animaciones | Una sola animación con `opacity` y `transform` para la barra (c.5 «Mecanismo», «Qué entra con fundido al responder» y «Por qué (a) y no (b)»; a.1; aceptación 1; `REV-1`) | La lámina (`barra-inferior`) anima solo `opacity` y su contenido (`barra-inferior-contenido`, `soloDesplazar`) solo `transform`, de `translateY(8px)` a `none`. El efecto visible no cambia | Sin cambio de código: `movimientoDelQuiz` (`tools/e2e/suites/quiz.js`) ya afirma el reparto |

---

## Escritorio · propuesta `ESC-P4` (tarea 3.10, aprobada por el usuario el 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); sin cambio en `amplio`. Teléfono y tablet no cambian |
| Bajo el corte | a.4 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E04a (sin responder) y E04b (respondida con explicación), a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Datos de d.1, copy de e, orden y gestos de d.2 (un toque responde; salida con confirmación), elementos y pares de b, estados de c, regla del progreso (`QUIZ-P4`, enmendada por `B-04`; a `lectura` la cuenta de ancho no actúa) |

### Disposición

| # | Región | Contenido, en orden de DOM | Escritorio | Amplio |
|---|---|---|---|---|
| 1 | Barra del quiz | Cerrar, progreso, contador y tiempo (a.2) | Filete a todo el ancho; el contenido, dentro de `lectura` | Igual |
| 2 | Fila de contexto | Insignia de parcial, chip de origen y meta (a.1) | Dentro de `lectura` | Igual |
| 3 | Caja del enunciado | Rótulo y enunciado | Llena `lectura` | Igual |
| 4 | Opciones | Una por entrada de `options` | Llenan `lectura`; `paso 2.5` entre opciones | Igual |
| 5 | Nota, «Reportar pregunta» | Solo si respondió (a.1) | Dentro de `lectura` | Igual |
| 6 | Barra inferior | «Siguiente» o «Ver resultados» | Fija abajo; filete a todo el ancho; el botón mide `lectura` | Igual |

### Medidas

| Elemento | Medida |
|---|---|
| Columna | `lectura`, centrada y anclada arriba; margen lateral `paso 8` cuando la ventana no la deja entera |
| Medida de línea | Medida en la maqueta: enunciado (`titulo`) ≈ 64 caracteres; opción (`cuerpo`) ≈ 73; nota (`cuerpo`) ≈ 77 (`tokens.md` c.4) |
| Progreso | Regla sin cambio (`QUIZ-P4`, con la cuenta de ancho de `B-04`, b): a `lectura` el progreso supera de sobra los 158 px que piden 40 casillas, así que rige solo el tope: casillas hasta 40, barra continua desde 41; con más ancho, las casillas son más anchas |
| Relleno inferior | `paso 24` más área segura inferior, como en a.1 |
| Sin región lateral | La pantalla no tiene contenido fuera de la columna: una cosa por vez. Agregar una región lateral solo para llenar el ancho sumaría ruido |

### Revisado

| Ancho de ventana | Qué se ve | Alto del contenido |
|---|---|---|
| 1024 (el corte) | Columna `lectura` entera con margen; sin scroll horizontal | — |
| 1366 × 768 | Sin responder, cabe entera; respondida con nota de tres o cuatro líneas, el botón queda a la vista porque la barra inferior es fija | 1,1 ventanas con la nota |
| 1920 × 1080 | Cabe entera, también con nota | 0,8 ventanas |

### Orden, teclado y foco

| Aspecto | Regla |
|---|---|
| Orden de DOM | El del teléfono, sin cambio |
| Tab | Cerrar, opciones A, B, C…, «Reportar pregunta», «Siguiente»: el de siempre |
| Cambia de lugar | Nada: solo el ancho de la columna |
| Tras «Siguiente» con teclado (`REV-9`; rige en todo ancho, solo web) | Al activar «Siguiente» con Enter o Espacio, la barra inferior se desmonta y el foco pasa a la primera opción de la pregunta nueva (`opcion-quiz-0`), solo si el foco estaba en «Siguiente» o quedó en `body` por el desmontaje; con puntero el foco no se mueve y no aparece contorno (`:focus-visible`). «Ver resultados» navega con `replace` y no aplica. Precedente: `TopicSelect.md` f.1 (foco al desaparecer «Fuente»); convención Engram 70; WCAG 2.4.3. Aceptación: Enter sobre «Siguiente» deja `document.activeElement` dentro de `opcion-quiz-0` y el Tab siguiente va a la opción B |
| Movimiento (`REV-1`; rige en todo ancho) | El fundido de c.5 no cambia el orden ni mueve el foco: las piezas que entran son paradas de Tab desde el primer cuadro (la opacidad no las saca del árbol de accesibilidad) y el contorno de foco de la primera opción entra con su bloque, sin animación propia |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P4` | Desde el corte `escritorio`, el quiz y el examen en curso se centran en una columna `lectura` (en lugar de `columna`), con las barras a todo el ancho | Es la pantalla donde más se lee. A `lectura` el texto queda entre 64 y 77 caracteres por línea y las opciones largas saltan menos de línea; no hay región lateral porque el quiz presenta una cosa por vez | visual | aprobada (usuario, 2026-10-11) |
