# Home · ficha 1.2

| Campo | Valor |
|---|---|
| Pantalla | `HomeScreen` (`src/screens/HomeScreen.js`), ruta `Home` |
| Boceto | Figura 02 «Inicio de materia» (`hibrido.html`) |
| Comunes | `comun.md`: §1 HeaderMarca, §2 control de tema, §5 estados (K2, K3), §6 lámina, §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | `headerShown: false`; header propio (HeaderMarca) |
| Variantes | Con y sin banner de banco reducido (`materia.bancoReducido`); con y sin nota de privacidad (solo web) |
| Fuera de alcance | Banner de banco reducido: su lugar está fijado; su ficha es 1.3 |
| Propuestas | Sección f: `HOME-P2`. Sección h: conservado de main (D10). Comunes: `COMUN-P1`, `COMUN-P2` |

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | HeaderMarca | — | Relleno `paso 5` | — | `comun.md` §1. Slot `izquierda`: botón «Cambiar materia». Control de tema a la derecha |
| 2 | Tarjeta de materia | `paso 1.5` | `paso 5` | — | Ilustración, id, nombre y conteos (a.2) |
| 3 | Banner de banco reducido (ver 1.3) | `paso 3` | `paso 5` | — | Solo si `materia.bancoReducido`. Sigue visible (D6) |
| 4 | Rótulo de sección | `paso 4` | `paso 5` | `paso 2` | «Plano / Acciones», entre la tarjeta de materia (o el banner, si hay) y la lista |
| 5 | Lista de acciones | — | `paso 5` | `paso 2.5` entre acciones | Seis acciones, en el orden actual |
| 6 | Nota de privacidad | `paso 6` | `paso 6` | — | Solo en web; centrada |
| 7 | Relleno inferior del scroll | — | — | `paso 8` | Fin del scroll |

La primera ordenada útil debajo del header es la misma que en MateriaSelect (`comun.md` §1).

### a.2 Interior de la tarjeta de materia

| # | Parte | Medidas | Divisor | Contenido |
|---|---|---|---|---|
| 1 | Celda de ilustración | Ancho `paso 24`; ilustración de lado `paso 16`, centrada | Filete derecho `filete` | Ilustración de la materia |
| 2 | Texto | Relleno vertical `paso 2`, horizontal `paso 3` | — | Id, nombre (margen superior `paso 1.5`), conteos (margen superior `paso 1.5`) |

### a.3 Interior de una acción

| # | Parte | Medidas | Divisor | Contenido |
|---|---|---|---|---|
| 1 | Cuadro de glifo | Lado `paso 10`; glifo de lado `paso 6`, centrado | Marco `filete`, `border` | Glifo de la acción |
| 2 | Texto | Flexible; separación `paso 3.5` a cada lado | — | Título y descripción (separados por `paso 1`) |
| 3 | Chevron | Glifo chico | — | `glifo-chevron` |

Relleno interno de la acción: `paso 3.5` en las cuatro caras.

### a.4 Tablet y escritorio (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | La tarjeta de materia y las acciones llenan la columna. La nota de privacidad queda centrada dentro de la columna |
| 1280 px | Igual | Igual | Las seis acciones siguen en una sola columna: sin grilla, para conservar el orden |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Control de tema | `comun.md` §2 | | | | | | |
| Botón «Cambiar materia» (K2) | `tinta` | `fondo` | `linea`, `border` | `cuerpo-fuerte` | — | `glifo-volver` (grande), `tinta` | T1, N1, N5 |
| Tarjeta de materia (cuerpo) | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | — | — | N1, N2 |
| Ilustración | `filamento` | `superficie` | — | — | Derecho `filete` | Ilustración de materia (D3) | X3 |
| Id de materia | `acento` | `superficie` | — | `rotulo` | — | — | T6 |
| Nombre de materia | `tinta` | `superficie` | — | `titulo` | — | — | T2 |
| Conteos | `tintaSec` | `superficie` | — | `detalle` | — | — | T4 |
| Banner de banco reducido | ver 1.3 | | | | | | |
| Rótulo de sección «Plano / Acciones» | `acento` | `fondo` | — | `rotulo` | — | — | T5 |
| Acción primaria (K3) | `tinta` | `superficie` | `linea`, `border-2` | Título `item`; descripción `detalle` | — | Del cuadro de glifo (abajo) | T2, T4, N1, N2 |
| Acción secundaria (K3) | `tinta` | `superficie` | `borde`, `border` | Título `item`; descripción `detalle` | — | Del cuadro de glifo (abajo) | T2, T4, N3, N4 |
| Descripción de acción | `tintaSec` | `superficie` | — | `detalle` | — | — | T4 |
| Cuadro de glifo | `tinta` | `superficie` | `filete`, `border` | — | — | `glifo-practicar`, `glifo-examen`, `glifo-repasar`, `glifo-estadisticas`, `glifo-agregar`, `glifo-ajustes` | N6, X2 |
| Chevron | `tintaSec` | `superficie` | — | — | — | `glifo-chevron` (chico) | N20 |
| Nota de privacidad | `tintaSec` | `fondo` | — | `detalle` | — | — | T3 |

| Acción | Orden | Título | Glifo | Destino |
|---|---|---|---|---|
| Primaria | 1 | «Entrena Temas/Parciales» | `glifo-practicar` | `TopicSelect` con `mode: 'practice'` |
| Secundaria | 2 | «Modo examen» | `glifo-examen` | `TopicSelect` con `mode: 'exam'` |
| Secundaria | 3 | «Repasar fallos» | `glifo-repasar` | `TopicSelect` con `mode: 'failed'` |
| Secundaria | 4 | «Mis estadísticas» | `glifo-estadisticas` | `Stats` |
| Secundaria | 5 | «Agregar pregunta» | `glifo-agregar` | `AddQuestion` (ver 1.3) |
| Secundaria | 6 | «Ajustes» | `glifo-ajustes` | `Settings` (ver 1.3) |

---

## c. Matriz de estados

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado | Banco reducido | Origen de la pregunta |
|---|---|---|---|---|---|---|---|---|
| Botón «Cambiar materia» (K2) | `tinta` sobre `fondo`; borde `linea` | Contorno web `linea`, `border` | Inversión: `fondo` sobre `tinta`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — | — | — |
| Acción primaria (K3) | Borde `linea`, `border-2`; fondo `superficie` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; texto y glifos `fondo` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — | — | — |
| Acción secundaria (K3) | Borde `borde`, `border` | Borde pasa a `linea` | Inversión total | Igual que primaria | — | — | — | — |
| Tarjeta de materia | Estática (no es un control) | — | — | — | — | — | — | Conteo de preguntas reales y de preguntas extra, ambos visibles (d.1) |
| Banner de banco reducido | ver 1.3 | ver 1.3 | ver 1.3 | ver 1.3 | — | — | Visible solo con `materia.bancoReducido` | — |
| Nota de privacidad | Estática | — | — | — | — | — | — | — |
| Control de tema | `comun.md` §2 | `comun.md` §2 | `comun.md` §2 | `comun.md` §2 | `comun.md` §2 | — | — | — |

Las seis acciones no tienen estado deshabilitado en el código actual; ninguna se agrega.

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Materia | `useMateria().materia`; si es `null` la pantalla no renderiza nada | Sin cambio |
| Nombre | `materia.name` | — |
| Id | `materia.shortName` y la posición de la materia en `MATERIA_LIST`, con dos dígitos, separados por « · » | Derivado de datos |
| Conteo de preguntas reales | `QUESTIONS` filtradas por `q.source === 'exam'` (`examCount`) | Se muestra siempre junto al conteo extra |
| Conteo de preguntas extra | `QUESTIONS` filtradas por `q.source === 'generated'` (`generatedCount`) | Las preguntas del usuario no se cuentan acá (comportamiento actual) |
| Preguntas del modo examen | `Math.min(materia.config?.examSize \|\| 75, QUESTIONS.length)` | Texto de la descripción del modo examen |
| Banner | `materia.bancoReducido` | Hoy `cyr` y `neuro` |
| Nota de privacidad | `Platform.OS === 'web'` | Solo web |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Altura de header igual a MateriaSelect | `comun.md` §1 |
| Banco reducido visible | El banner mantiene su lugar entre la tarjeta de materia y las acciones (D6) |
| Orden y cantidad de acciones | Seis, en el orden de la tabla de b. El boceto traía cuatro: no se quitan «Agregar pregunta» ni «Ajustes» |
| Navegación | Cada acción navega con `requestAnimationFrame(() => navigation.navigate(...))` y los mismos parámetros |
| Gestos | Un toque por acción; «Cambiar materia» vuelve a `MateriaSelect` con un toque |
| Origen visible | Preguntas reales y extra se muestran por separado: no se funden en un solo número |
| Sin emoji, radio ni sombra | Los seis PNG de `src/assets/*.png`, la baldosa clara en oscuro y `sombras.card` salen de esta pantalla |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/HomeScreen.js`: sin resultados.

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| Ninguno | — | — | La pantalla no emite eventos y la ficha no agrega ninguno. El pageview sintético lo emite `App.js` por cambio de ruta (`trackPageview`) y no se toca |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Botón de volver | «← Cambiar materia» (flecha de texto) | «Cambiar materia» con `glifo-volver` | Reemplazo de símbolo |
| Nombre y conteos | En el header: nombre y «{examCount} preguntas reales · {generatedCount} preguntas extra» | Los mismos textos, dentro de la tarjeta de materia | Ubicación |
| Id de materia | No existe | `{shortName} · {NN}` | Elemento del boceto, derivado de datos |
| Rótulo de sección | No existe | «Plano / Acciones» | Texto del boceto, aprobado por el usuario |
| Acciones: títulos y descripciones | Seis pares de texto | Iguales | — |
| Nota de privacidad | «Tus estadísticas y preguntas se guardan localmente en tu navegador. Se usan analíticas anónimas (sin cookies ni datos personales).» | Igual | — |

---

## f. Propuestas aprobadas (D10)

Cambios del boceto respecto de `main`, o de `main` respecto del boceto. El usuario los aprobó el 2026-10-10 (D10): rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| HOME-P2 | Sobre la lista de acciones va el rótulo de sección «Plano / Acciones» (texto del boceto), en `rotulo` y `acento` (T5), con margen superior `paso 4`, lateral `paso 5` e inferior `paso 2`, entre la tarjeta de materia (o el banner, si hay) y la lista | Texto del boceto aprobado por el usuario; `main` no lo tiene | visual | aprobada (usuario, 2026-10-10) |

Propuestas comunes que alcanzan esta pantalla: `COMUN-P1` (ilustración de materia en `filamento`) y `COMUN-P2` (estados de control).

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta aprobada (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| «113 preguntas» como dato único | «{examCount} preguntas reales · {generatedCount} preguntas extra» | D6: origen visible; manda el dato y el copy actual |
| Sin banner de banco reducido | Banner en su lugar (ver 1.3) | D6: banco reducido visible |
| Glifo de 26 en cuadro de 40 | Glifo `paso 6` en cuadro `paso 10` | Escala de tokens (`comun.md` §8): conserva el trazo de c.2 |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite o dibuja distinto. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| HOME-P1 | Seis acciones en la lista; el boceto muestra cuatro. «Agregar pregunta» (`glifo-agregar`) y «Ajustes» (`glifo-ajustes`) siguen en los lugares 5 y 6, con el tratamiento secundario (K3, `borde`) | Están en uso en `main` y son la única entrada a `AddQuestion` y `Settings` | uso |
| HOME-P3 | La nota de privacidad («Tus estadísticas y preguntas se guardan localmente en tu navegador…») al pie, solo en web, centrada en `detalle` y `tintaSec`. El boceto no la incluye | Está en uso en `main` y es el aviso de analíticas de la app | uso |
