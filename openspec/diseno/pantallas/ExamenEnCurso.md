# Examen en curso · ficha 1.3

| Campo | Valor |
|---|---|
| Pantalla | `QuizScreen` (`src/screens/QuizScreen.js`), ruta `Quiz`, con `route.params.hideFeedback` en verdadero: el quiz sin retroalimentación. Es el mismo componente de `Quiz.md`; esta ficha fija solo lo que cambia |
| Nombre | «Examen en curso» es el caso de uso. El ajuste «Ocultar resultado hasta el final» (`Settings.md`) lo lee `TopicSelectScreen` al iniciar cualquier quiz: aplica a práctica, examen y fallos, no solo al modo examen |
| Boceto | Figura 04 «Quiz» dibuja el quiz con retroalimentación y no este estado. La ficha extiende su gramática |
| Comunes | `comun.md`: §4 marcas de estado, §5 estados (K1, K3, K7), §7 anchos, §8 dimensiones, §9 glifos, §12 parciales |
| Navegador | Igual que `Quiz.md`: sin barra interna y con barra propia del quiz (`QUIZ-P1`, aprobada) |
| Variantes | Con y sin temporizador; con y sin parcial; origen examen, generada o propia; última pregunta; sin responder o respondida |
| Fuera de alcance | Lo que no cambia respecto de `Quiz.md`: barra del quiz, progreso, contador, tiempo, caja del enunciado, chip de origen, salida con confirmación |
| Propuestas | Sección f: `EXA-P1`, aprobada (usuario, 2026-10-10). Sección f.1: `REV-1` y `REV-3` de la revisión 5.0b, aprobadas (usuario, 2026-10-12), y `CC-1` (color de «Reportar pregunta»), aprobada (usuario, 2026-10-14), que se fijan en `Quiz.md`. Sección h: conservado de main (D10). Comunes: `COMUN-P2` y `PAR-P1` (`comun.md` §12), aprobadas |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P4`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.4 |

---

## a. Layout a 390 px

### a.1 Diferencias con `Quiz.md` a.1

| # de `Quiz.md` | Bloque | Con retroalimentación | Sin retroalimentación |
|---|---|---|---|
| 1 | Barra del quiz | Cerrar, progreso, contador y tiempo | Igual |
| 2 | Fila de contexto | Insignia de parcial (`comun.md` §12), origen y meta | Igual: el origen y el parcial siguen visibles (D6) |
| 3 | Caja del enunciado | Rótulo y enunciado | Igual |
| 4 | Opciones | Reposo, correcta, incorrecta y apagada | Reposo, elegida y apagada (c.2) |
| 5 | Nota de explicación | Si respondió y la pregunta tiene explicación | Nunca se muestra |
| 5b | Aviso de resultado oculto (`EXA-P1`) | No existe | Solo si respondió; ocupa el lugar de la nota |
| 6 | «Reportar pregunta» | Si respondió | Igual |
| 7 y 8 | Relleno inferior y barra inferior | Si respondió | Igual |

### a.2 Aviso de resultado oculto (`EXA-P1`)

| Pieza | Medidas | Contenido |
|---|---|---|
| Aviso | Margen superior `paso 4`, lateral `paso 5`; una línea (salta de línea si no entra), alineada a la izquierda; sin marco ni relleno. Entra con el fundido de `Quiz.md` c.5 al responder (`REV-1`): `opacity` de 0 a 1 en 150 ms, curva `cubic-bezier(0, 0, 0.2, 1)`, sin mover el layout; con `prefers-reduced-motion: reduce`, de inmediato. Con él entran «Reportar pregunta» y la barra inferior; la opción elegida se rellena en el mismo cuadro del toque | «Resultado oculto hasta el final» |

### a.3 Interior de la opción elegida

| Pieza | Medidas | Contenido |
|---|---|---|
| Fila | Igual que en `Quiz.md` a.3: celda de letra de ancho `paso 11` con filete derecho; texto con relleno vertical `paso 3` y horizontal `paso 3` | Letra y texto; sin línea de estado |
| Relleno | La fila entera va rellena con `tinta`: es el estado seleccionado del sistema (`comun.md` §5.1) | — |
| Marco | `border`, igual que en reposo: el cambio es de relleno, no de grosor, y el layout no se mueve al responder | — |

### a.4 Otros anchos (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Igual que `Quiz.md` a.4 |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P4`, aprobada): `lectura` | Igual | Igual que `Quiz.md`. El aviso queda dentro de la columna |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal; igual que `Quiz.md`. El aviso salta de línea |

---

## b. Elementos

Solo se listan los que cambian. Los demás son los de `Quiz.md` b.

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Opción en reposo (K3) | `tinta` | `superficie` | `borde`, `border` | `cuerpo` | Celda de letra: derecho `filete` | — | T2, N4 |
| Opción elegida (seleccionado) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | Celda de letra: letra `fondo`; derecho `filete` | — | T7, N5 |
| Opción apagada | `tintaSec` | `superficie` | `filete`, `border` | `cuerpo` | Celda de letra: letra `tintaSec`, derecho `filete` | — | T4, X2 |
| Aviso de resultado oculto | `tintaSec` | `fondo` | — | `rotulo` | — | — | T3 |
| Insignia de parcial | `comun.md` §12 | | | | | | |
| Nota de explicación | No se muestra | | | | | | |
| «Reportar pregunta» (K7, `REV-3`, `CC-1`) | Igual que `Quiz.md` b: sin marco, `cuerpo` en `tintaSec` sobre `fondo`, `glifo-reportar` chico delante, en `tintaSec` (T3, N19) | | | | | | |
| «Siguiente» o «Ver resultados» (K1) | Igual que `Quiz.md` b | | | | | | |

Glifo con texto (reportar, siguiente): decorativo, oculto a lectores (`aria-hidden`, `accessibilityElementsHidden`). Cerrar (K7) va solo y lleva el nombre accesible de `Quiz.md` e. Todo control mide al menos `paso 11` de alto y de ancho, con `paso 2` como mínimo entre controles adyacentes.

---

## c. Matriz de estados

### c.1 Controles

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Opción (K3) | Ver c.2 | Borde `linea` | Inversión total | Contorno `foco`, `border-2`, separado `paso 0.5` | Ver c.2: elegida | Tras responder deja de recibir toque (c.2) |
| «Reportar pregunta» (K7, `REV-3`, `CC-1`) | Sin marco; texto y glifo `tintaSec` sobre `fondo` (T3, N19) | Contorno web `linea`, `border` (N1) | Inversión total: fondo `tinta`; texto y glifo `fondo` (T7) | Contorno `foco`, `border-2`, separado `paso 0.5` (N7) | — | — |
| «Siguiente» (K1) | Fondo `tinta`; texto y glifo `fondo` | Contorno web `linea`, `border-2` | Inversión: fondo `superficie`; texto `tinta`; borde `linea` | Contorno `foco` | — | — |
| Cerrar (K7) | Glifo `tinta` | Contorno web `linea`, `border` | Inversión: glifo `fondo` sobre `tinta` | Contorno `foco` | — | — |

### c.2 Opción según el estado de la respuesta (completa la fila «Sin retroalimentación» de `Quiz.md` c.2)

| Estado | Condición | Marco | Fondo | Celda de letra | Texto | Línea de estado |
|---|---|---|---|---|---|---|
| Reposo | Sin responder | `borde`, `border` | `superficie` | Letra `tinta`; filete derecho `filete` | `cuerpo`, `tinta` | — |
| Elegida | Respondida; `idx` igual a `selectedIndex` | `tinta`, `border` | `tinta` | Letra `fondo`; filete derecho `filete` | `cuerpo-fuerte`, `fondo` (T7) | — |
| Apagada | Respondida; no es la elegida | `filete`, `border` | `superficie` | Letra `tintaSec`; filete derecho `filete` | `cuerpo`, `tintaSec` (T4) | — |

| Regla | Detalle |
|---|---|
| La correcta no se revela | Con `hideFeedback`, ni la correcta ni la elegida llevan color de acierto o error, glifo de estado ni palabra de estado, aunque la respuesta sea incorrecta |
| Se lee sin color | La elegida se distingue por el relleno completo y el peso; las demás, por `tintaSec` y marco `filete`. No hay ningún color semántico en juego |
| Un toque | Tras responder, ninguna opción recibe toque ni cambia la respuesta |
| Una sola seleccionada | `accessibilityState` de selección en la elegida; el resto, sin él |

| Estado de la pantalla | Condición | Efecto |
|---|---|---|
| Sin responder | `answered` en falso | Sin aviso, sin «Reportar pregunta» y sin barra inferior |
| Respondida | `answered` en verdadero | Opción elegida rellena, resto apagado; aviso de `EXA-P1`; «Reportar pregunta»; barra inferior con «Siguiente» o «Ver resultados» |
| Última pregunta | `isLast` | La barra inferior dice «Ver resultados» |
| Tiempo agotado | `timeLeft === 0` | `replace` a `Results` con las respuestas hasta ahí, sin confirmar (`Quiz.md` d.2) |

Origen de la pregunta, acierto o error de una opción, banda intermedia y banco reducido no aplican en la opción (—): el origen es el chip de `Quiz.md` c.3.

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| `hideFeedback` | `route.params.hideFeedback`, que `TopicSelectScreen.startQuiz` arma con `getSetting('hide_feedback', 'false') === 'true'` | Queda fijo al iniciar el quiz: el ajuste no se cambia durante él |
| Resto de los datos | `Quiz.md` d.1 | Sin cambio |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Sin retroalimentación | Con `hideFeedback` no hay marca de acierto o error, ni explicación, ni se revela la correcta. La explicación y el estado se ven en la revisión (`Revision.md`) |
| Un toque responde | `handleSelectOption` sigue registrando con `recordAnswer(materiaId, currentQuestion.id, isCorrect)`: las estadísticas cuentan igual que con retroalimentación |
| Origen visible (D6) | El chip de origen y la insignia de parcial siguen visibles: ocultar el resultado no oculta de dónde viene la pregunta |
| Temporizador | Sin cambio (`QUIZ-P3`): `glifo-reloj`, alerta con menos de 120 s, `replace` a `Results` al llegar a cero |
| Salida | El guardia `beforeRemove` y «Salir del quiz» no cambian |
| Movimiento y foco tras «Siguiente» | `Quiz.md` c.5 y d.2 (`REV-1`, `REV-9`): el aviso de `EXA-P1`, «Reportar pregunta» y la barra entran con el fundido de 150 ms; al cambiar de pregunta entra el bloque de la pregunta; con teclado, el foco tras «Siguiente» pasa a la primera opción de la pregunta nueva. La opción elegida se rellena en el mismo cuadro |
| Resultados | Los umbrales de `Results.md` d.1 no cambian |
| Sin emoji, radio ni sombra | `Quiz.md` d.2; además, la opacidad con la que `main` apaga las opciones (`opacity-50`) sale (`tokens.md` a.2) |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/QuizScreen.js`: sin resultados.

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| Ninguno | — | — | La pantalla no emite eventos y la ficha no agrega ninguno. `reportQuestion` (`src/utils/report.js`) no es analítica |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Aviso de resultado oculto | No existe | «Resultado oculto hasta el final» | `EXA-P1`; retoma el nombre del ajuste («Ocultar resultado hasta el final») |
| Estado de la elegida | Borde de acento y relleno claro, sin texto | Fila rellena con `tinta`, sin texto | Seleccionado del sistema (`comun.md` §5.1) |
| Resto | `Quiz.md` e | Igual | — |

---

## f. Propuestas aprobadas (D10)

Cambios respecto de `main` que el boceto no dibuja. El usuario los aprobó el 2026-10-10 (D10): rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| EXA-P1 | Tras responder sin retroalimentación aparece una línea, «Resultado oculto hasta el final», en el lugar donde iría la nota de explicación | Hoy el toque sobre una opción no muestra respuesta alguna y nada explica por qué: quien activó el ajuste semanas atrás puede creer que la app no registró el toque. La línea no agrega gestos | uso | aprobada (usuario, 2026-10-10) |

### f.1 Propuestas de la revisión 5.0b (aprobadas por el usuario el 2026-10-12; `CC-1`, el 2026-10-14)

Se fijan en `Quiz.md` f.1 (mismo componente); acá queda lo que alcanza a este estado. «Sin el cambio» describe la variante descartada (C2).

| Id | Qué cambia en el examen en curso | Sin el cambio | Tipo | Estado |
|---|---|---|---|---|
| `REV-1` | El aviso «Resultado oculto hasta el final» (a.2), «Reportar pregunta» y la barra inferior entran con el fundido de `Quiz.md` c.5 al responder; el bloque de la pregunta, al cambiar de pregunta. La opción elegida se rellena en el mismo cuadro | Todo aparece de inmediato, como hasta la 5.0b | visual | aprobada (usuario, 2026-10-12) |
| `REV-3` | «Reportar pregunta» pasa a K7 sin marco, `cuerpo` en `tinta` (hasta `CC-1`, fila siguiente), con `glifo-reportar` chico delante (b, c.1) | K3 con marco `borde` y `cuerpo-fuerte` | visual | aprobada (usuario, 2026-10-12) |
| `CC-1` | «Reportar pregunta» y `glifo-reportar` pasan de `tinta` a `tintaSec` en reposo (b, c.1; texto T3 y glifo N19, sobre `fondo`); hover, presionado y foco sin cambio. Se fija en `Quiz.md` f.1 | `tinta`, como `REV-3` | visual (cambio de criterio) | aprobada (usuario, 2026-10-14) |

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Quiz solo con retroalimentación | Estado sin retroalimentación con elegida y apagadas | `main` lo tiene (`hideFeedback`) y D10 conserva las funciones |
| (`main`) opciones no elegidas atenuadas por opacidad | `tintaSec` y marco `filete` | `tokens.md` a.2: la opacidad es transparencia; mismo tratamiento que `QUIZ-P10` |
| (`main`) elegida con borde y relleno de acento | Relleno `tinta` y texto `fondo` | Regla de seleccionado del sistema (`comun.md` §5.1 y CD-5): el acento es identidad (CD-8) |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| EXA-C1 | Sin retroalimentación no hay marcas de acierto o error, ni explicación, ni se revela la correcta | Es el propósito del ajuste: «Respondé sin ver si acertás. Al terminar, revisás todo junto.» | uso |
| EXA-C2 | Las opciones no elegidas se apagan al responder | Efecto de `main`, hoy por opacidad | visual |
| EXA-C3 | «Reportar pregunta» sigue disponible tras responder | Es el único camino de reporte desde el quiz (`QUIZ-P2`) | uso |
| EXA-C4 | Avance idéntico: un toque responde, «Siguiente» o «Ver resultados» solo tras responder, sin volver atrás ni cambiar la respuesta | Orden y cantidad de gestos de `main` (D10) | uso |
| EXA-C5 | Origen de la pregunta e insignia de parcial visibles | D6: origen visible | dato |
| EXA-C6 | Las respuestas se registran en las estadísticas como siempre | Dato de `main` | dato |

---

## Escritorio · propuesta `ESC-P4` (tarea 3.10, aprobada por el usuario el 2026-10-11)

La propuesta es la de `Quiz.md` (sección «Escritorio»): el examen en curso es el mismo componente con `hideFeedback`.

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); sin cambio en `amplio`. Teléfono y tablet no cambian |
| Bajo el corte | a.4 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E04c (respondida, 1.er parcial, barra continua, sin retroalimentación), a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Lo de b, c y d de esta ficha: opción elegida, opciones apagadas, aviso `EXA-P1`, insignia de parcial (`PAR-P1`), orden y gestos |

### Disposición

| Elemento | Escritorio |
|---|---|
| Barra, contexto, enunciado, opciones, reporte y barra inferior | Los de `Quiz.md` · Escritorio: columna `lectura`, centrada y anclada arriba, barras a todo el ancho |
| Aviso «Resultado oculto hasta el final» (`EXA-P1`) | Dentro de `lectura`, en el lugar de la nota, a `paso 4` de las opciones |
| Opción elegida y apagadas | Sin cambio (c.2): relleno `tinta` y marco `filete` |

### Revisado

| Ancho de ventana | Qué se ve | Alto del contenido |
|---|---|---|
| 1366 × 768 y 1920 × 1080 | Respondida: opciones, aviso, «Reportar pregunta» y «Siguiente» en una ventana | Cabe |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P4` | La de `Quiz.md`: columna `lectura` desde el corte `escritorio` | Misma pantalla, mismo ancho de lectura | visual | aprobada (usuario, 2026-10-11) |
