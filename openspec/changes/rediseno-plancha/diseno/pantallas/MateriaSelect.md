# MateriaSelect · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `MateriaSelectScreen` (`src/screens/MateriaSelectScreen.js`), ruta `MateriaSelect` |
| Boceto | Figura 01 «Selección de materias» (`hibrido.html`) |
| Comunes | `comun.md`: §1 HeaderMarca, §2 control de tema, §5 estados (K6), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | `headerShown: false`; header propio (HeaderMarca) |
| Exclusivo | Campo de filamentos: solo en esta pantalla (D3) |
| Variantes | Nota del creador visible o no (reaparece cada siete días); tarjeta en reposo, cargando o no disponible |
| Fuera de alcance | Nota del creador y bloque de donación: su lugar está fijado; sus fichas son `Banners.md` y `DonationBox.md` |
| Propuestas | Sección f: `MATERIA-P1` y `MATERIA-P4` (el cajetín de una celda, usuario, 2026-10-11), y la marca `V5` «Fusiforme», elegida entre V0 y V1 a V6 (usuario, 2026-10-11). `MATERIA-P2` («Banco real») quedó reemplazada por `MATERIA-P4` (f.1). Sección h: conservado de main (D10). Comunes: `COMUN-P1`, `COMUN-P2` |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P1`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.4 |

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | HeaderMarca | — | Relleno `paso 5` | — | `comun.md` §1. Slot `izquierda`: texto «ESFUNO» (`rotulo`, `tintaSec`), una línea, alineado a la izquierda y centrado en vertical dentro de la fila de `comun.md` §1; control de tema a la derecha |
| 2 | Lámina | `paso 1.5` | `paso 5` | `paso 3` | Campo, regla y cajetín (a.2) |
| 3 | Nota del creador (`Banners.md` a.1 y a.2) | — | `paso 5` | `paso 3` | Condicional. Conserva su posición actual: debajo del bloque de marca, encima de la lista |
| 4 | Lista de materias | `paso 1.5` | `paso 5` | `paso 2.5` entre tarjetas | Una tarjeta por entrada de `MATERIA_LIST`, en su orden |
| 5 | Bloque de donación (`DonationBox.md` a.1) | `paso 6` | `paso 5` | — | `DonationBox` con `origen="materias"`, precedido por su regla corta, como hoy |
| 6 | Relleno inferior del scroll | — | — | `paso 10` | Fin del scroll |

### a.2 Interior de la lámina

| # | Parte | Medidas | Divisor | Contenido |
|---|---|---|---|---|
| 1 | Campo de filamentos | Alto `paso 28`; ancho completo de la lámina | Filete inferior `filete` | Variante V5 «Fusiforme» (abajo): trazos en `filamento`; un contorno en `acento` |
| 2 | Regla graduada | Alto `paso 2.5`; ancho completo | Filete inferior `filete` | Trazo en `tintaSec` |
| 3 | Cajetín | Relleno vertical `paso 2.5`, horizontal `paso 3.5`; distribución entre extremos | — | Izquierda: «pKapp». Derecha, alineado a la derecha: «Tus materias de ESFUNO» y debajo «Elegí una para empezar» |

La regla graduada es el dibujo `regla` de `src/assets/filamentos.js`, con `encuadre: 'none'` (`CONVENCIONES.md`, C7): una marca menor cada 10 unidades del dibujo y una mayor cada 50, la mayor más alta que la menor, ambas en `tintaSec` y apoyadas en el filete inferior. Las proporciones son las del boceto (figura 01, `hibrido.html`): son parte del dibujo y no pasos de la escala.

**Campo de filamentos: V5 «Fusiforme».** Elegida por el usuario el 2026-10-11 entre V0 y V1 a V6 (`marca-prototipos/marca-prototipos.md`). Reemplaza al campo del boceto (V0), que se conserva como respaldo. Cambia solo el dato `ilustracion` de `src/assets/filamentos.js`: `Ilustracion`, `Lamina`, `regla`, el cajetín, los tokens y el copy no cambian.

| Aspecto | Valor |
|---|---|
| Qué dibuja | Un músculo abstracto: un vientre arqueado y asimétrico de fibras que ondulan suave entre dos tendones, en fascículos. Es la silueta de un músculo y no una lámina anatómica; su referencia es Anatomía (sistema muscular) |
| Capas | Fascículos: cinco, de fibras con huecos entre ellos; el central, de tres, sigue como tendón y la onda cambia de fase entre fascículos (`filamento`, con el ritmo de opacidad y grosor de V0). Capa profunda: cuatro fibras cortas y tenues en los huecos, que dan volumen (`filamento`, trazo fino). Extremos: las fibras se despegan del tendón de a una, a distancias distintas. Contorno: una fibra del fascículo superior que converge sobre el tendón en los extremos y cruza el campo de borde a borde (`acento`) |
| Datos (D3) | 27 elementos, lista plana de `path` y `circle`; sin color en los datos; un solo `tono: 'acento'` (CD-16) |
| Encuadre | `none`, como V0 (C7, CD-16): el dibujo se estira al ancho de la lámina. viewBox de 348 × 118 sobre el alto `paso 28` (factor vertical 0,95, el de V0) |
| Estiramiento horizontal | 0,80× a 320; 0,92× con la lámina `lateral` de escritorio; 1,00× a 390; 1,28× con `columna`. Dentro del 1,4× de `design.md` D2: las ondas y los tendones conservan su lectura |
| «pKapp» y el trazo | «pKapp» es texto real en el cajetín y nunca va sobre el trazo (CD-16): T2 vale 17,82 en claro y 14,91 en oscuro; sobre el trazo valdría 1,75 y 2,50, que no cumple |
| Pares del dibujo | X3 (trazo, informativo) y N18 (contorno `acento`); ningún par nuevo, E1 a E4 intactas |
| Peso (D5) | Datos: 15.307 B crudos y 3.638 B gzip, +2.316 B gzip sobre V0 (`marca-prototipos.md` b). El shell lo mide la tarea con el método de `evidencia/base.md` (`.orca/reports/marca-v5.md`) |
| Accesibilidad y movimiento | Decorativo (`aria-hidden`); sin animación; el contorno `acento` no transmite estado y el dibujo se lee en escala de grises |
| Respaldo | V0: `marca-prototipos/V0-vigente.svg` (59 elementos, copia exacta del campo del boceto) y, en código, `ilustracionV0` de `src/assets/filamentos-v0.js`. Volver a V0 es cambiar solo ese dato |

### a.3 Interior de la tarjeta de materia

| # | Parte | Medidas | Divisor | Contenido |
|---|---|---|---|---|
| 1 | Celda de ilustración | Ancho `paso 16`; ilustración de lado `paso 12`, centrada | Filete derecho `filete` | Ilustración de la materia |
| 2 | Texto | Relleno vertical `paso 2`, horizontal `paso 3`; separación `paso 1` | — | Id y nombre |
| 3 | Cajetín | Una sola celda de ancho completo; relleno vertical `paso 1.5` y horizontal `paso 3` | Filete superior `filete` | Conteo de preguntas, alineado al inicio (`MATERIA-P4`) |

### a.4 Tablet (D10); desde 1024 px, sección «Escritorio»

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Lámina y tarjetas llenan la columna. El campo conserva su alto (`paso 28`) y se estira en horizontal |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P1`, aprobada): `hoja`; `hoja-amplia` desde `amplio` | Igual | Lámina y nota del creador en la región lateral; rejilla de 2 columnas (3 desde `amplio`). El fondo `fondo` ocupa todo el ancho |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. HeaderMarca: «ESFUNO» y el control de tema entran en la fila con su alto de siempre (`comun.md` §1.1). El campo conserva su alto (`paso 28`) y se estira al ancho de la lámina. En el cajetín de la lámina, «pKapp» queda a la izquierda y la meta a la derecha, y la meta salta de línea si no entra. En la tarjeta, el nombre salta de línea y el cajetín conserva su celda, con el texto saltando de línea si no entra; la celda de ilustración conserva `paso 16` |

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
| Estado «Cargando…» | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |
| Estado «Próximamente» | `inactivo` | `superficie` | `filete` (marco de la tarjeta) | `rotulo` | — | — | X5 |
| Nota del creador | `Banners.md` b | | | | | | |
| Bloque de donación | `DonationBox.md` b | | | | | | |

La ilustración y el campo son decorativos (`aria-hidden`). El nombre de la materia es el nombre accesible de la tarjeta.

---

## c. Matriz de estados

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado | Cargando | Banco reducido, origen, acierto, error, intermedia |
|---|---|---|---|---|---|---|---|---|
| Tarjeta de materia (K6) | Borde `linea`; fondo `superficie`; texto `tinta`; ilustración `filamento` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; texto, id, cajetín e ilustración `fondo` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | `materia.available` en falso: borde `filete`; texto, id e ilustración `inactivo`; la celda del cajetín dice «Próximamente»; sin toque | La celda del cajetín dice «Cargando…» en `tintaSec`; marco y fondo como en reposo; la tarjeta no recibe toque | — |
| Otras tarjetas durante una carga | Sin cambio visual; el toque se ignora (`cargandoId`) | Igual que reposo | — | — | — | — | — | — |
| Control de tema | `comun.md` §2 | `comun.md` §2 | `comun.md` §2 | `comun.md` §2 | `comun.md` §2 | — | — | — |
| Nota del creador | `Banners.md` c | `Banners.md` c | `Banners.md` c | `Banners.md` c | — | — | — | — |
| Bloque de donación | `DonationBox.md` c | `DonationBox.md` c | `DonationBox.md` c | `DonationBox.md` c | — | — | — | — |

Hoy las seis materias tienen `available` en verdadero; el estado «Próximamente» es la rama del código y se conserva. El cajetín es una sola celda en los tres estados (reposo, «Cargando…» y «Próximamente»): cambia el texto y no la estructura ni el alto, así que el toque no hace saltar la tarjeta (`MATERIA-P4`).

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
| Campo de filamentos | `src/assets/filamentos.js` (D3): variante V5; el respaldo V0 está en `src/assets/filamentos-v0.js` | Solo en esta pantalla |
| Disponibilidad | `materia.available` | — |
| Textos del cajetín de la lámina | Cadenas fijas de la pantalla | Copy actual del header |
| Texto del slot `izquierda` | Cadena fija «ESFUNO» | Texto definido por el usuario para el boceto aprobado |
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
| `donacion_click` | `DonationBox.js:10` (componente; ficha en `DonationBox.md` d.4) | `{ origen: 'materias', monto: amt }` | Al tocar un monto del bloque de donación | Bloque de donación (b, c). No se toca |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Marca | Imagen `logo.png` | Texto «pKapp» | `comun.md` §10 |
| Texto del header | «Tus materias de ESFUNO» y «Elegí una para empezar» | Iguales; pasan al cajetín de la lámina | Ubicación |
| Slot `izquierda` del header | No existe | «ESFUNO» | Texto del boceto aprobado por el usuario |
| Conteo | «{N} preguntas» | La misma frase: cifra en `rotulo-medio`, palabra en `rotulo`. El paso las muestra en mayúsculas | Sin cambio de palabras |
| Id de materia | No existe | `{shortName} · {NN}` | Elemento del boceto, derivado de datos |
| Carga | «Cargando…» | Igual | — |
| No disponible | «Próximamente» | Igual, sin cursiva | `tokens.md` b.3 |
| Control de tema | Switch y emoji | «Claro» y «Oscuro», cada una con su glifo (`glifo-claro`, `glifo-oscuro`) | `comun.md` §2 |

---

## f. Propuestas aprobadas (D10)

Cambios del boceto respecto de `main`, o de `main` respecto del boceto. El usuario aprobó `MATERIA-P1` el 2026-10-10 (D10) y resolvió `MATERIA-P4` y la fila `V5` el 2026-10-11: rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| MATERIA-P1 | El slot `izquierda` de HeaderMarca muestra el texto «ESFUNO» en `rotulo` y `tintaSec` (T3), una línea, alineado a la izquierda y centrado en vertical dentro de la fila de `comun.md` §1. El alto del header no cambia (`comun.md` §1) | Texto del boceto aprobado por el usuario, con la cadena «ESFUNO»; `main` deja el slot vacío | visual | aprobada (usuario, 2026-10-10) |
| MATERIA-P4 | El cajetín de cada tarjeta tiene una sola celda, de ancho completo, con el conteo («{N} preguntas»): sin segunda celda ni filete vertical. Relleno vertical `paso 1.5`, horizontal `paso 3` y filete superior `filete`, como hoy; el conteo conserva su lugar a la izquierda. El texto «Banco real» deja de existir. La misma celda dice «Cargando…» y «Próximamente» en esos estados, sin cambiar de estructura ni de alto | Con las seis materias disponibles y sin preguntas generadas, «Banco real» aparecía en todas las tarjetas: no distinguía una de otra, y en `cyr` y `neuro` (banco reducido, que Home avisa con «Banco más reducido») afirmaba «real». «Real» solo informaba frente a «generada»; ningún banco publicado la tiene | visual | aprobada (usuario, 2026-10-11) |
| V5 | El campo de filamentos de la lámina deja de ser el del boceto (V0) y pasa a ser V5 «Fusiforme»: fibras que ondulan suave entre dos tendones, en fascículos, con una fibra en `acento` (a.2). V0 se conserva como respaldo | Pedido del usuario (2026-10-11): una marca memorable, del mismo estilo, que forme una figura con los vectores. V5 la dibuja como un músculo abstracto con el mismo lenguaje de trazo fino y una sola fibra en `acento` (`marca-prototipos.md` a) | visual | elegida (usuario, 2026-10-11) |

Propuestas comunes que alcanzan esta pantalla: `COMUN-P1` (ilustración de materia en `filamento`) y `COMUN-P2` (estados de control).

### f.1 Reemplazada

| Id | Qué proponía | Estado |
|---|---|---|
| MATERIA-P2 | Cajetín de dos celdas separadas por un filete vertical `filete`: el conteo a la izquierda y «Banco real» a la derecha, con la condición «materia disponible sin preguntas generadas» (derivada de `GENERADAS`; convención C8 y decisión estética E5 de `CONVENCIONES.md`). «Banco real» era texto del boceto aprobado el 2026-10-10 | reemplazada por `MATERIA-P4` (usuario, 2026-10-11, relevamiento de «generada», variante A). C8 y E5 retiradas |

### f.2 Aceptación observable (`MATERIA-P4`)

Para la tarea 3.x que lo implementa y para el e2e (`materias.js`). En la pantalla, el cajetín ya es `flex-1`: quitar la segunda celda lo lleva a ancho completo. Matriz: las seis materias, 390, 360 y 320, en claro y en oscuro; 1366 × 768 para la rejilla.

| # | Comprobación | Esperado |
|---|---|---|
| 1 | Las seis tarjetas en reposo | El cajetín tiene una sola celda: el texto «Banco real» no está en el DOM de la pantalla y no hay filete vertical dentro del cajetín |
| 2 | La celda | Mide el ancho del cajetín, de borde a borde dentro del marco; el conteo es «{N} preguntas», con N igual a `CONTEOS[materia.id]`, a `paso 3` del borde izquierdo; cifra en `rotulo-medio` y `tinta`, palabra en `rotulo` y `tintaSec` |
| 3 | Alto | El cajetín y la tarjeta miden lo mismo que con dos celdas: cajetín de 35 px con su filete superior y tarjeta de 95 px a 390, con el nombre en una línea |
| 4 | «Cargando…», al tocar una tarjeta con el banco frenado | La misma celda dice «Cargando…» en `tintaSec`; la tarjeta no cambia de alto, conserva marco y fondo y no recibe toque. Una sola celda |
| 5 | «Próximamente» (rama de código: sin camino con los datos de hoy, ninguna materia tiene `available` en falso) | La misma celda dice «Próximamente» en `inactivo`; borde `filete`; sin toque; mismo alto. Lo verifica la lectura del Analista |
| 6 | Presionado, foco y hover | Sin cambio (K6): inversión total con la celda y su texto invertidos, contorno `foco`, borde `linea` |
| 7 | 360 y 320; 1366 × 768 | Sin desborde; la celda conserva el ancho completo de la tarjeta, en el teléfono y en la rejilla de escritorio |
| 8 | Código | `bancoReal` y su derivación (`materia.available && !materia.generadas`) dejan de existir en `MateriaSelectScreen.js`; `materia.generadas` no tiene otro lector en las pantallas |

Puntos del arnés a reescribir en `tools/e2e/suites/materias.js`: `LEER_SELECTOR` (busca «Banco real» y su celda por el `borderLeft`: pasa a leer la celda que contiene la cifra); la aserción de «dos celdas, “Banco real” a la derecha y separada por un filete» (`C8 y MATERIA-P2`); «cada tarjeta conserva sus dos celdas» a 360 y 320 y en la rejilla de escritorio; «el cajetín queda abajo», que se mide con la celda del conteo y no con `bancoCelda`; y la comprobación de «Cargando…» que «conserva» «Banco real». Afirman en cambio las filas 1 a 4 y 7.

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta aprobada (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Rótulo de estado en lugar del conteo, en `dre` y `ryd` | Conteo real de `CONTEOS` | Spec `subject-catalog`: manda el dato |
| Id desde el identificador en mayúsculas («ANATOMIA») | `shortName` | Dato de `metadata.js`; conserva la tilde de «Anatomía» |
| Miniatura de 52 en celda de 68 | Pasos `12` y `16` | Escala de tokens (`comun.md` §8) |
| Ausencia del bloque de donación | Se conserva en su lugar (`DonationBox.md` a.1) | D6: el evento `donacion_click` con `origen: 'materias'` sigue emitiéndose desde esta pantalla |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite o dibuja distinto. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| MATERIA-P3 | La nota del creador (condicional, debajo de la lámina, reaparece cada siete días) en el lugar fijado en a.1. El boceto no la incluye. Su aspecto es de `Banners.md` | Está en uso en `main` y es el canal del creador con quien usa la app | uso |

---

## Escritorio · propuesta `ESC-P1` (tarea 3.10, aprobada por el usuario el 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); `amplio` suma una columna a la rejilla. Teléfono y tablet no cambian |
| Bajo el corte | a.4 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E01, a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Datos de d.1, copy de e, evento `materia_elegida` (d.3), elementos y pares de contraste de b, estados de c, orden y gestos de d.2 |

### Disposición

| # | Región | Contenido, en orden de DOM | Escritorio | Amplio |
|---|---|---|---|---|
| — | HeaderMarca | «ESFUNO» y control de tema (`comun.md` §1) | Dentro de `hoja`; alto y relleno vertical de teléfono (D6: igual que Home) | Dentro de `hoja-amplia` |
| 1 | Lateral | Lámina (a.2) y, debajo a `paso 3`, la nota del creador (`Banners.md`), si corresponde | Ancho `lateral`, anclada arriba a la izquierda | Igual |
| 2 | Principal | Una tarjeta por materia, en el orden de `MATERIA_LIST` (a.3) | Rejilla de 2 columnas, `paso 4` entre celdas; orden fila a fila: 1 2 / 3 4 / 5 6 | Rejilla de 3 columnas: 1 2 3 / 4 5 6 |
| 3 | Principal, debajo de la rejilla | Regla corta y `DonationBox` (`DonationBox.md` a.1), a `paso 6` de la rejilla | Llena la región principal | Igual |
| 4 | Relleno inferior | Fin del scroll | `paso 10` | Igual |

### Medidas

| Elemento | Medida |
|---|---|
| Lámina | Ancho `lateral`. El campo de filamentos conserva su alto (`paso 28`) y `encuadre: 'none'`: se estira 0,92× (`tokens.md` c.4). En el cajetín, «pKapp» queda a la izquierda y la meta salta de línea, como a 360 px (a.4) |
| Nota del creador | Ancho `lateral`: el texto salta de línea más veces. Descartar de `paso 11` sin cambio (`Banners.md` a.2) |
| Tarjeta de materia | Llena su celda. El nombre salta de línea si no entra; la celda de ilustración conserva `paso 16` y el cajetín su celda (a.3). Las tarjetas de una fila igualan su alto y el cajetín queda abajo |
| Marcas de esquina | Sin cambio (§6): `paso 4` entre celdas deja libres las de las tarjetas vecinas |
| Pedido de donación | Llena la región principal; los cuatro montos, en una fila de celdas iguales (`DON-C1`) |

### Revisado

| Ancho de ventana | Qué se ve | Alto del contenido |
|---|---|---|
| 1024 (el corte) | Lámina de ancho `lateral` y rejilla de 2 columnas con celdas no menores que las de un teléfono de 320 (a.4); sin scroll horizontal | — |
| 1366 × 768 | Lámina, nota y las seis materias en la primera ventana; el pedido de donación asoma al pie | 1,1 ventanas (con `columna`: 2,1) |
| 1920 × 1080 | Las seis materias en 2 filas; la pantalla entera cabe | 0,6 ventanas (con `columna`: 1,4) |

### Orden, teclado y foco

| Aspecto | Regla |
|---|---|
| Orden de DOM | El del teléfono: HeaderMarca, lámina, nota, tarjetas 1 a 6, regla corta y montos |
| Tab | Control de tema, descartar nota, tarjetas (fila a fila), montos: sin saltos hacia atrás |
| Cambia de lugar | La nota del creador (`MATERIA-P3`): sigue debajo de la lámina; deja de estar encima de la lista y queda a su izquierda, en el mismo lugar del DOM |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P1` | Desde el corte `escritorio`, la lámina y la nota del creador pasan a una región lateral y las seis tarjetas a una rejilla de 2 columnas (3 desde `amplio`); el pedido de donación queda al pie de la región principal | La lista de una columna de `columna` deja libre más de la mitad del ancho. La rejilla muestra las seis materias sin desplazarse y la lámina conserva el ancho validado a 360 px | visual | aprobada (usuario, 2026-10-11) |
