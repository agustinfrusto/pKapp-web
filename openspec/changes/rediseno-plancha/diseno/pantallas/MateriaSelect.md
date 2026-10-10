# MateriaSelect · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `MateriaSelectScreen` (`src/screens/MateriaSelectScreen.js`), ruta `MateriaSelect` |
| Boceto | Figura 01 «Selección de materias» (`hibrido.html`) |
| Comunes | `comun.md`: §1 HeaderMarca, §2 control de tema, §5 estados (K6), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | `headerShown: false`; header propio (HeaderMarca) |
| Exclusivo | Campo de filamentos: solo en esta pantalla (D3) |
| Variantes | Nota del creador visible o no (reaparece cada siete días); tarjeta en reposo, cargando o no disponible |
| Fuera de alcance | Nota del creador y bloque de donación: su lugar está fijado; su ficha es 1.3 |
| Propuestas | Sección f: `MATERIA-P1` y `MATERIA-P2`. Sección h: conservado de main (D10). Comunes: `COMUN-P1`, `COMUN-P2` |

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | HeaderMarca | — | Relleno `paso 5` | — | `comun.md` §1. Slot `izquierda`: texto «ESFUNO» (`rotulo`, `tintaSec`), una línea, alineado a la izquierda y centrado en vertical dentro de la fila de alto `paso 11`; control de tema a la derecha |
| 2 | Lámina | `paso 1.5` | `paso 5` | `paso 3` | Campo, regla y cajetín (a.2) |
| 3 | Nota del creador (ver 1.3) | — | `paso 5` | `paso 3` | Condicional. Conserva su posición actual: debajo del bloque de marca, encima de la lista |
| 4 | Lista de materias | `paso 1.5` | `paso 5` | `paso 2.5` entre tarjetas | Una tarjeta por entrada de `MATERIA_LIST`, en su orden |
| 5 | Bloque de donación (ver 1.3) | `paso 6` | `paso 5` | — | `DonationBox` con `origen="materias"`, precedido por su regla corta, como hoy |
| 6 | Relleno inferior del scroll | — | — | `paso 10` | Fin del scroll |

### a.2 Interior de la lámina

| # | Parte | Medidas | Divisor | Contenido |
|---|---|---|---|---|
| 1 | Campo de filamentos | Alto `paso 28`; ancho completo de la lámina | Filete inferior `filete` | Trazos en `filamento`; un contorno en `acento` |
| 2 | Regla graduada | Alto `paso 2.5`; ancho completo | Filete inferior `filete` | Trazo en `tintaSec` |
| 3 | Cajetín | Relleno vertical `paso 2.5`, horizontal `paso 3.5`; distribución entre extremos | — | Izquierda: «pKapp». Derecha, alineado a la derecha: «Tus materias de ESFUNO» y debajo «Elegí una para empezar» |

### a.3 Interior de la tarjeta de materia

| # | Parte | Medidas | Divisor | Contenido |
|---|---|---|---|---|
| 1 | Celda de ilustración | Ancho `paso 16`; ilustración de lado `paso 12`, centrada | Filete derecho `filete` | Ilustración de la materia |
| 2 | Texto | Relleno vertical `paso 2`, horizontal `paso 3`; separación `paso 1` | — | Id y nombre |
| 3 | Cajetín | Dos celdas separadas por un filete vertical `filete`; relleno vertical `paso 1.5` y horizontal `paso 3` por celda | Filete superior `filete` | Izquierda: conteo de preguntas. Derecha: «Banco real» |

### a.4 Tablet y escritorio (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Lámina y tarjetas llenan la columna. El campo conserva su alto (`paso 28`) y se estira en horizontal |
| 1280 px | Igual | Igual | La lista sigue en una sola columna: sin grilla de tarjetas. El fondo `fondo` ocupa todo el ancho |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Control de tema | `comun.md` §2 | | | | | | |
| Texto del slot `izquierda` («ESFUNO») | `tintaSec` | `fondo` | — | `rotulo` | — | — | T3 |
| Lámina (cuerpo) | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | — | — | N1, N2 |
| Campo de filamentos | `filamento`; contorno `acento` | `superficie` | — | — | Inferior `filete` | — | X3; contorno N18 |
| Regla graduada | `tintaSec` | `superficie` | — | — | Inferior `filete` | — | N20 |
| Wordmark «pKapp» | `tinta` | `superficie` | — | `marca` | — | — | T2 |
| Meta del cajetín | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| Tarjeta de materia (cuerpo) | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | — | — | N1, N2 |
| Ilustración | `filamento` | `superficie` | — | — | Derecho `filete` | Ilustración de materia (D3), no glifo de §9 | X3 |
| Id de materia | `acento` | `superficie` | — | `rotulo` | — | — | T6 |
| Nombre de materia | `tinta` | `superficie` | — | `item` | — | — | T2 |
| Conteo, cifra | `tinta` | `superficie` | — | `rotulo-medio` | Superior `filete` | — | T2 |
| Conteo, palabra | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| Etiqueta «Banco real» | `tintaSec` | `superficie` | — | `rotulo` | Izquierdo `filete` (separa las dos celdas) | — | T4 |
| Estado «Cargando…» | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| Estado «Próximamente» | `inactivo` | `superficie` | `filete` (marco de la tarjeta) | `rotulo` | — | — | X5 |
| Nota del creador | ver 1.3 | | | | | | |
| Bloque de donación | ver 1.3 | | | | | | |

La ilustración y el campo son decorativos (`aria-hidden`). El nombre de la materia es el nombre accesible de la tarjeta.

---

## c. Matriz de estados

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado | Cargando | Banco reducido, origen, acierto, error, intermedia |
|---|---|---|---|---|---|---|---|---|
| Tarjeta de materia (K6) | Borde `linea`; fondo `superficie`; texto `tinta`; ilustración `filamento` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; texto, id, cajetín e ilustración `fondo` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | `materia.available` en falso: borde `filete`; texto, id e ilustración `inactivo`; celda del conteo «Próximamente»; «Banco real» sin cambio; sin toque | Celda del conteo «Cargando…» en `tintaSec`; «Banco real» sin cambio; marco y fondo como en reposo; la tarjeta no recibe toque | — |
| Otras tarjetas durante una carga | Sin cambio visual; el toque se ignora (`cargandoId`) | Igual que reposo | — | — | — | — | — | — |
| Control de tema | `comun.md` §2 | `comun.md` §2 | `comun.md` §2 | `comun.md` §2 | `comun.md` §2 | — | — | — |
| Nota del creador | ver 1.3 | ver 1.3 | ver 1.3 | ver 1.3 | — | — | — | — |
| Bloque de donación | ver 1.3 | ver 1.3 | ver 1.3 | ver 1.3 | — | — | — | — |

Hoy las seis materias tienen `available` en verdadero; el estado «Próximamente» es la rama del código y se conserva.

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Lista y orden de materias | `MATERIA_LIST` de `src/materias/index.js` | El orden no cambia; esta ficha no lo fija |
| Conteo de preguntas | `CONTEOS[materia.id]` de `src/materias/conteos.js` (generado por `scripts/gen-conteos.mjs`), expuesto como `materia.preguntas` | Nunca escrito a mano en la ficha ni en la pantalla. Sin rótulo de materia no publicada: `dre` y `ryd` muestran su conteo real como las demás (spec `subject-catalog`) |
| Id visible | `materia.shortName` y la posición de la materia en `MATERIA_LIST`, con dos dígitos, separados por « · » | Derivado de datos; no es prosa |
| Nombre | `materia.name` | — |
| Ilustración | `src/materias/<id>/ilustracion.js` (D3), dibujada por `Ilustracion` con `filamento` | Una por materia registrada |
| Campo de filamentos | `src/assets/filamentos.js` (D3) | Solo en esta pantalla |
| Disponibilidad | `materia.available` | — |
| Textos del cajetín de la lámina | Cadenas fijas de la pantalla | Copy actual del header |
| Texto del slot `izquierda` | Cadena fija «ESFUNO» | Texto definido por el usuario para el boceto aprobado |
| Etiqueta «Banco real» | Cadena fija, igual en las seis tarjetas | También en las de banco reducido (`cyr` y `neuro`) |
| Tema | `useTema()` | `comun.md` §2 |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| La pantalla aparece siempre al abrir la app | No se persiste la última materia (`MateriaContext`) |
| Un toque elige la materia | `handlePick`: sin efecto si `!available` o hay otra carga (`cargandoId`) |
| Error de carga | `avisar('No se pudo abrir la materia', 'Revisá tu conexión y probá de nuevo.')`: diálogo del sistema, fuera del sistema visual |
| Altura de header igual a Home | `comun.md` §1 |
| Sin emoji, radio ni sombra | `materia.icon`, `materia.color`, `materia.image` y `sombras.card` salen de esta pantalla |
| Flujo | Selector, luego Home; mismo número de gestos que en `main` |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/MateriaSelectScreen.js src/components/DonationBox.js`

| Evento | Línea | Payload | Cuándo | Fila que lo cubre |
|---|---|---|---|---|
| `materia_elegida` | `MateriaSelectScreen.js:23` | `{ materia: materia.id }` | Al tocar una tarjeta disponible sin carga en curso, antes de `setCargandoId` | Tarjeta de materia (c, d.2). No se mueve |
| `donacion_click` | `DonationBox.js:10` (componente; la ficha es 1.3) | `{ origen: 'materias', monto: amt }` | Al tocar un monto del bloque de donación | Bloque de donación (b, c). No se toca |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Marca | Imagen `logo.png` | Texto «pKapp» | `comun.md` §10 |
| Texto del header | «Tus materias de ESFUNO» y «Elegí una para empezar» | Iguales; pasan al cajetín de la lámina | Ubicación |
| Slot `izquierda` del header | No existe | «ESFUNO» | Texto del boceto aprobado por el usuario |
| Conteo | «{N} preguntas» | La misma frase: cifra en `rotulo-medio`, palabra en `rotulo`. El paso las muestra en mayúsculas | Sin cambio de palabras |
| Etiqueta del cajetín | No existe | «Banco real», segunda celda del cajetín | Texto del boceto aprobado por el usuario |
| Id de materia | No existe | `{shortName} · {NN}` | Elemento del boceto, derivado de datos |
| Carga | «Cargando…» | Igual | — |
| No disponible | «Próximamente» | Igual, sin cursiva | `tokens.md` b.3 |
| Control de tema | Switch y emoji | «Claro» y «Oscuro», cada una con su glifo (`glifo-claro`, `glifo-oscuro`) | `comun.md` §2 |

---

## f. Propuestas aprobadas (D10)

Cambios del boceto respecto de `main`, o de `main` respecto del boceto. El usuario los aprobó el 2026-10-10 (D10): rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| MATERIA-P1 | El slot `izquierda` de HeaderMarca muestra el texto «ESFUNO» en `rotulo` y `tintaSec` (T3), una línea, alineado a la izquierda y centrado en vertical dentro de la fila de alto `paso 11`. El alto del header no cambia (`comun.md` §1) | Texto del boceto aprobado por el usuario, con la cadena «ESFUNO»; `main` deja el slot vacío | visual | aprobada (usuario, 2026-10-10) |
| MATERIA-P2 | El cajetín de cada tarjeta tiene dos celdas separadas por un filete vertical `filete`: el conteo («{N} preguntas») a la izquierda y «Banco real» a la derecha, con relleno vertical `paso 1.5` y horizontal `paso 3` por celda y el filete superior `filete` de hoy. «Banco real» aparece en las seis tarjetas, también en las de banco reducido (`cyr` y `neuro`) | Texto del boceto aprobado por el usuario; `main` solo muestra el conteo | visual | aprobada (usuario, 2026-10-10) |

Propuestas comunes que alcanzan esta pantalla: `COMUN-P1` (ilustración de materia en `filamento`) y `COMUN-P2` (estados de control).

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta aprobada (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Rótulo de estado en lugar del conteo, en `dre` y `ryd` | Conteo real de `CONTEOS` | Spec `subject-catalog`: manda el dato |
| Id desde el identificador en mayúsculas («ANATOMIA») | `shortName` | Dato de `metadata.js`; conserva la tilde de «Anatomía» |
| Miniatura de 52 en celda de 68 | Pasos `12` y `16` | Escala de tokens (`comun.md` §8) |
| Ausencia del bloque de donación | Se conserva en su lugar (ver 1.3) | D6: el evento `donacion_click` con `origen: 'materias'` sigue emitiéndose desde esta pantalla |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite o dibuja distinto. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| MATERIA-P3 | La nota del creador (condicional, debajo de la lámina, reaparece cada siete días) en el lugar fijado en a.1. El boceto no la incluye. Su aspecto es de 1.3 | Está en uso en `main` y es el canal del creador con quien usa la app | uso |
