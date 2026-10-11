# Settings · ficha 1.3

| Campo | Valor |
|---|---|
| Pantalla | `SettingsScreen` (`src/screens/SettingsScreen.js`), ruta `Settings` |
| Boceto | Sin figura: el boceto no dibuja esta pantalla. La ficha extiende su gramática (rótulos de sección en `acento`, paneles de marco `linea`, relleno `tinta` para lo seleccionado) |
| Comunes | `comun.md`: §3 barra interna, §4 marcas de estado, §5 estados (K1, K2, K3, K4, K7), §7 anchos, §8 dimensiones, §9 glifos |
| Navegador | Barra interna con título «pKapp · Ajustes» y volver (`comun.md` §3.3) |
| Variantes | Plegables cerrados o abiertos; con y sin preguntas propias; web (con respaldo) o nativo (sin respaldo) |
| Fuera de alcance | Diálogos del sistema (`confirm`, `avisar`) y el selector de archivos del navegador: su aspecto no es del sistema visual. El estado vacío de «Mis preguntas» tiene su ficha en `Vacios.md` |
| Propuestas | Sección f: `SET-P1` y `SET-P2`, pendientes. Sección h: conservado de main (D10). Comunes: `COMUN-P2` |

Convención de 1.3 (D10): las secciones a a e describen la pantalla con las propuestas de f aplicadas. La sección f.2 trae la variante sin el cambio de cada una, al mismo nivel de detalle, y es la que se implementa si el usuario no la aprueba. Base de comparación: el boceto para lo visual; `main` para funciones, datos, copy y orden de uso.

---

## a. Layout a 390 px

### a.1 Orden vertical

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3, con volver |
| 2 | Sección «Cuestionario» | `paso 4` | `paso 5` | `paso 8` | Rótulo de sección (margen inferior `paso 2`) y panel del ajuste (a.2) |
| 3 | Sección «Mis preguntas» | — | `paso 5` | `paso 8` | Rótulo (margen inferior `paso 2`), plegable (a.3) y, abierto, su cuerpo a `paso 2.5` del plegable |
| 4 | Sección «Tus datos» | — | `paso 5` | `paso 8` | Rótulo (margen inferior `paso 2`), plegable y, abierto, su cuerpo a `paso 2.5` del plegable |
| 5 | Sección «Acerca de» | — | `paso 5` | — | Rótulo (margen inferior `paso 2`) y panel (a.5) |
| 6 | Relleno inferior del scroll | — | — | `paso 8` más área segura inferior | Fin del scroll |

### a.2 Interior del panel «Cuestionario»

Panel con relleno `paso 3.5` en las cuatro caras. Una fila: bloque de texto flexible a la izquierda, control a la derecha, separados por `paso 3.5`, centrados en vertical.

| Pieza | Medidas | Contenido |
|---|---|---|
| Bloque de texto | Título y, debajo, descripción con margen superior `paso 1`; el título salta de línea si no entra | «Ocultar resultado hasta el final» y su descripción |
| Control segmentado | Dos opciones iguales, alto `paso 11`, relleno horizontal `paso 3`, ancho mínimo `paso 11` por opción; ancho por contenido | «No» y «Sí» (`SET-P1`) |

### a.3 Interior del plegable

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Cabecera (K3) | Fila de ancho completo; alto mínimo `paso 11`; relleno vertical `paso 3`, horizontal `paso 3.5` | Nombre del plegable a la izquierda; a la derecha, la palabra «Ver» u «Ocultar» y `glifo-chevron` (chico), separados `paso 2` |
| 2 | Cuerpo | A `paso 2.5` de la cabecera; ancho completo | Panel con el contenido (a.4) |

### a.4 Interior de los cuerpos

| Cuerpo | Medidas | Contenido |
|---|---|---|
| «Mis preguntas», con preguntas | Tarjetas separadas por `paso 2.5`; relleno `paso 3.5`; primera fila con tema a la izquierda y eliminar a la derecha; enunciado a dos líneas como máximo (margen superior `paso 1.5`); correcta en una línea con `glifo-acierto` (margen superior `paso 1.5`, separación `paso 2`) | Una tarjeta por pregunta propia, en el orden que devuelve `getUserQuestions` |
| «Mis preguntas», sin preguntas | Ver `Vacios.md` (V3) | Mensaje |
| «Tus datos», web | Panel con relleno `paso 3.5`; texto con margen inferior `paso 2.5`; botones de ancho completo y alto mínimo `paso 11`, separados `paso 2`; divisor `filete` con margen vertical `paso 3` entre los botones de respaldo y el de reseteo | Texto, «Descargar respaldo», «Importar respaldo», divisor, «Resetear estadísticas» |
| «Tus datos», nativo | Panel con relleno `paso 3.5` | Solo «Resetear estadísticas» |

### a.5 Interior del panel «Acerca de»

Panel con relleno `paso 3.5`; los filetes `filete` separan las tres franjas.

| # | Franja | Medidas | Contenido |
|---|---|---|---|
| 1 | Identidad | Fila entre extremos con salto de línea, separación `paso 2` | «pKapp» con su versión a la izquierda; «Preparación para ESFUNO» a la derecha |
| 2 | Banco | Filete superior `filete`; relleno superior `paso 3`; fila entre extremos | Etiqueta «Banco de {materia}» a la izquierda y total a la derecha; debajo, el desglose por origen (margen superior `paso 1`) |
| 3 | Enlaces | Filete superior `filete`; relleno superior `paso 3`; fila con salto de línea, separación `paso 2` | Dos botones K2 de acento |

### a.6 Otros anchos (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Paneles, plegables y botones llenan la columna. La barra interna lleva su filete a todo el ancho |
| 1280 px | Igual | Igual | Las cuatro secciones siguen en una sola columna: sin panel lateral ni dos columnas. Los botones de respaldo siguen apilados |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. En «Cuestionario» el bloque de texto salta de línea y el segmentado conserva su ancho; los enlaces de «Acerca de» saltan de línea y el texto de cada uno salta dentro del botón si no entra |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Barra interna | `comun.md` §3 | | | | | | |
| Rótulo de sección | `acento` | `fondo` | — | `rotulo` | — | — | T5 |
| Panel (cuerpo) | — | `superficie` | `linea`, `border` | — | Divisores `filete` | — | N1, X2 |
| Título del ajuste | `tinta` | `superficie` | — | `item` | — | — | T2 |
| Descripción del ajuste | `tintaSec` | `superficie` | — | `detalle` | — | — | T4 |
| Segmentado, contenedor | — | `superficie` | `linea`, `border` | — | — | — | N2 |
| Segmentado, opción en reposo (K4) | `tinta` | `superficie` | — | `rotulo` | — | — | T2, N6 |
| Segmentado, opción seleccionada (K4) | `fondo` | `tinta` | — | `rotulo` | — | — | T7 |
| Plegable cerrado (K3) | `tinta` | `superficie` | `borde`, `border` | Nombre `item`; palabra `cuerpo-fuerte` | — | `glifo-chevron` (chico), `acento` | T2, T6, N3, N18 |
| Plegable abierto (K3) | `tinta` | `superficie` | `linea`, `border` | Igual | — | `glifo-chevron` girado (chico), `acento` | T2, T6, N1, N18 |
| Palabra «Ver» y «Ocultar» | `acento` | `superficie` | — | `cuerpo-fuerte` | — | — | T6 |
| Tarjeta de pregunta propia | — | `superficie` | `linea`, `border` | — | — | — | N1 |
| Tema de la pregunta propia | `acento` | `superficie` | — | `rotulo` | — | — | T6 |
| Eliminar pregunta (K7) | `tintaSec` | `superficie` | — | — | — | `glifo-eliminar` (grande) | N20 |
| Enunciado de la pregunta propia | `tinta` | `superficie` | — | `cuerpo` | — | — | T2 |
| Correcta de la pregunta propia | `acierto` | `superficie` | — | `detalle` | — | `glifo-acierto` (chico) | T11, N10 |
| Texto del respaldo | `tintaSec` | `superficie` | — | `detalle` | — | — | T4 |
| «Descargar respaldo» (K3) | `tinta` | `superficie` | `borde`, `border` | `cuerpo-fuerte` | — | `glifo-guardar` (chico), delante del texto | T2, N4, N6 |
| «Importar respaldo» (K1) | `fondo` | `tinta` | `tinta`, `border` | `cuerpo-fuerte` | — | `glifo-importar` (chico), delante del texto | T7 |
| «Resetear estadísticas» (K2 de peligro) | `error` | `superficie` | `error`, `border` | `cuerpo-fuerte` | — | — | T15, N13 |
| «pKapp» | `tinta` | `superficie` | — | `item` | — | — | T2 |
| Versión | `tintaSec` | `superficie` | — | `rotulo-medio` | — | — | T4 |
| «Preparación para ESFUNO» | `tintaSec` | `superficie` | — | `detalle` | — | — | T4 |
| Etiqueta del banco | `tintaSec` | `superficie` | — | `rotulo` | Superior de la franja `filete` | — | T4, X2 |
| Total del banco | `tinta` | `superficie` | — | `dato` | — | — | T2 |
| Desglose por origen | `tintaSec` | `superficie` | — | `detalle` | — | — | T4 |
| «Reportar un error» (K2, acento) | `acento` | `superficie` | `acento`, `border` | `cuerpo-fuerte` | — | `glifo-correo` (chico), delante del texto | T6, N18 |
| «Código fuente» (K2, acento) | `acento` | `superficie` | `acento`, `border` | `cuerpo-fuerte` | — | `glifo-externo` (chico), detrás del texto | T6, N18 |

El glifo de cada botón toma el color de su texto en todo estado (`comun.md` §9). Glifo con texto (botones, plegables, correcta de la pregunta propia): decorativo, oculto a lectores (`aria-hidden`, `accessibilityElementsHidden`). Glifo solo (eliminar pregunta): lleva nombre accesible (e). Todo control mide al menos `paso 11` de alto y de ancho, con `paso 2` como mínimo entre controles adyacentes; los dos segmentos de «No \| Sí» son un solo control (grupo de opciones), como el control de tema de `comun.md` §2.

---

## c. Matriz de estados

### c.1 Controles

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado o abierto | Deshabilitado |
|---|---|---|---|---|---|---|
| Opción del segmentado (K4) | Texto `tinta` sobre `superficie` | Contorno web `linea`, `border` | Inversión: fondo `tinta`; texto `fondo` (anticipa la selección) | Contorno `foco`, `border-2`, separado `paso 0.5` | Fondo `tinta`; texto `fondo`; `accessibilityState` seleccionado. Tocar la seleccionada no hace nada | — |
| Plegable (K3) | Borde `borde`; texto `tinta`; palabra «Ver» y chevron `acento` apuntando abajo | Borde `linea` | Inversión total: fondo `tinta`; nombre, palabra y chevron `fondo` | Contorno `foco` | Abierto: borde `linea`; palabra «Ocultar»; chevron apuntando arriba; `accessibilityState` expandido | — |
| Eliminar pregunta (K7) | Glifo `tintaSec` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; glifo `fondo` | Contorno `foco` | — | — |
| «Descargar respaldo» (K3) | Borde `borde`; texto y glifo `tinta` | Borde `linea` | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` | Contorno `foco` | — | — |
| «Importar respaldo» (K1) | Fondo `tinta`; texto y glifo `fondo` | Contorno web `linea`, `border-2` | Inversión: fondo `superficie`; texto y glifo `tinta`; borde `linea` | Contorno `foco` | — | — |
| «Resetear estadísticas» (K2 de peligro) | Borde y texto `error`; fondo `superficie` | Contorno web `error`, `border` | Inversión: fondo `error`; texto `fondo` (T9) | Contorno `foco` | — | — |
| Enlaces de «Acerca de» (K2, acento) | Borde, texto y glifo `acento` | Contorno web `acento`, `border` | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` | Contorno `foco` | — | — |
| Barra interna, volver | `comun.md` §3 | `comun.md` §3 | `comun.md` §3 | `comun.md` §3 | — | — |

### c.2 Estados de datos

| Estado | Condición | Efecto |
|---|---|---|
| Ocultar resultado activado | `hideFeedback` en verdadero | La opción «Sí» queda seleccionada; el quiz que se inicia después no muestra retroalimentación (`ExamenEnCurso.md`) |
| Ocultar resultado desactivado | `hideFeedback` en falso (valor por defecto) | La opción «No» queda seleccionada |
| Cero preguntas propias | `userQuestions.length === 0` | Nombre «0 preguntas propias»; abierto, mensaje de `Vacios.md` (V3) |
| Una pregunta propia | `userQuestions.length === 1` | Nombre «1 pregunta propia» (singular) |
| Varias | Dos o más | «{n} preguntas propias» |
| Web | `Platform.OS === 'web'` | El cuerpo de «Tus datos» incluye el bloque de respaldo |
| Nativo | Cualquier otro | El cuerpo de «Tus datos» solo trae «Resetear estadísticas» |
| Plegables | Estado local `showQuestions` y `showData` | Cerrados al abrir la pantalla; no persisten |

Origen de la pregunta, aciertos de rendimiento y banco reducido no aplican (—); el desglose por origen del banco es dato, no estado (d.1).

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Ajuste de retroalimentación | `getSetting('hide_feedback', 'false')`; verdadero si el valor es `'true'` | Se recarga al enfocar la pantalla (`useFocusEffect`) |
| Preguntas propias | `getUserQuestions(materiaId)` | Se recargan al enfocar y tras eliminar o importar |
| Tema de una pregunta propia | `TOPICS[q.topic]`, o la clave si no hay nombre | — |
| Correcta de una pregunta propia | `q.options[q.correctIndex]` | — |
| Versión | `Constants.expoConfig?.version`, o «?» | Sale de `app.json`; al subir la versión ahí se actualiza |
| Materia | `materia?.name`, o «preguntas» | Va en «Banco de {materia}» |
| Conteo por origen | `QUESTIONS` filtradas por `source === 'exam'` y `source === 'generated'`, más `userQuestions.length` | El total es la suma de los tres |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Un gesto guarda el ajuste | Tocar una opción llama `handleToggleHideFeedback(value)` y `saveSetting('hide_feedback', value)`; no hay botón de guardar |
| El ajuste vale en todos los modos | Lo lee `TopicSelectScreen` al iniciar cualquier quiz; la ficha no lo limita al modo examen |
| Eliminar pregunta propia | `confirm('Eliminar pregunta', '¿Seguro? Esta acción no se puede deshacer.', …, { confirmLabel: 'Eliminar', destructive: true })`, luego `deleteUserQuestion(materiaId, id)` y recarga |
| Resetear estadísticas | `confirm('Resetear estadísticas', '¿Seguro que querés borrar todas las estadísticas? Esto no se puede deshacer.', …, { confirmLabel: 'Borrar', destructive: true })`, luego `resetStats(materiaId)` y `avisar('Listo', 'Estadísticas borradas.')`. Alcanza solo a la materia activa |
| Descargar respaldo | `downloadBackup()`; si devuelve falso, `avisar('Error', 'No se pudo generar el respaldo.')` |
| Importar respaldo | `pickAndImportBackup(cb)`: `avisar(r.ok ? 'Listo' : 'Error', r.message)` y, si `r.ok`, recarga. No pisa claves existentes (comportamiento de `importBackupFromText`) |
| Solo web | Descargar e importar respaldo no existen en nativo |
| Origen visible (D6) | El desglose «exámenes · generadas · tuyas» muestra los tres orígenes por separado |
| Sin emoji, radio ni sombra | Los cuatro emojis, los símbolos de plegado y de salida, `rounded-*`, las píldoras de los enlaces y `activeOpacity` salen de esta pantalla (`comun.md` §9, D9) |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/SettingsScreen.js`: sin resultados.

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| Ninguno | — | — | La pantalla no emite eventos y la ficha no agrega ninguno. El pageview sintético lo emite `App.js` por cambio de ruta (`trackPageview`) y no se toca |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Títulos de sección | «Cuestionario», «Mis preguntas», «Tus datos», «Acerca de» | Iguales; el paso los muestra en mayúsculas | Sin cambio de palabras |
| Ajuste | «Ocultar resultado hasta el final» y «Respondé sin ver si acertás. Al terminar, revisás todo junto.» | Iguales | — |
| Control del ajuste | `Switch` sin texto | «No» y «Sí»; nombre accesible del grupo «Ocultar resultado hasta el final» | `SET-P1` |
| Plegable de preguntas | «{n} pregunta propia» o «{n} preguntas propias» | Igual | — |
| Plegable de datos | «Respaldo y reseteo» | Igual | — |
| Abrir y cerrar | Triángulo y «Ver» u «Ocultar» | «Ver» u «Ocultar» con `glifo-chevron` | Reemplazo de símbolo |
| Eliminar | Signo de multiplicación | `glifo-eliminar`; nombre accesible «Eliminar pregunta» | Reemplazo de símbolo; cadena accesible nueva, no visible |
| Texto del respaldo | «Descargá un respaldo de tu progreso para no perderlo o pasarlo a otro dispositivo.» | Igual | — |
| Descargar | Emoji de disquete y «Descargar respaldo» | «Descargar respaldo» con `glifo-guardar` | Reemplazo de emoji |
| Importar | Emoji de carpeta y «Importar respaldo» | «Importar respaldo» con `glifo-importar` | Reemplazo de emoji |
| Resetear | «Resetear estadísticas» | Igual | — |
| Identidad | «pKapp v{versión}» y «Preparación para ESFUNO» | Iguales | — |
| Banco | «Banco de {materia}», total y «{n} de exámenes · {n} generadas · {n} tuyas» | Iguales | — |
| Reportar | Emoji de sobre y «Reportar un error» | «Reportar un error» con `glifo-correo` | Reemplazo de emoji |
| Código | «Código fuente» y flecha de salida | «Código fuente» con `glifo-externo` | Reemplazo de símbolo |

---

## f. Propuestas pendientes (D10)

Cambios respecto de `main` que el boceto no dibuja. Quedan pendientes hasta que el usuario las apruebe; el cuerpo de la ficha (a a e) las describe aplicadas.

### f.1 Propuestas

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| SET-P1 | El `Switch` de «Ocultar resultado hasta el final» pasa a un control segmentado de dos opciones, «No» y «Sí», de la misma clase K4 que el control «Claro \| Oscuro» (D7). Un toque en la opción no seleccionada cambia el ajuste, como hoy | El `Switch` es un elemento circular de plataforma que no admite radio 0 ni los tokens (`tokens.md` c.1); D7 ya resolvió el mismo problema con el control de tema. El estado se lee con palabra e inversión de valor, no solo por posición | visual | pendiente |
| SET-P2 | «Resetear estadísticas» usa `error` en borde y texto (K2 de peligro). Es la única acción destructiva e irreversible de la pantalla | `main` la distingue con tono de peligro y el usuario ya la reconoce así. Es una excepción a la reserva de `error` (incorrecta, banda baja, validación y alerta de tiempo: `tokens.md` a.1 y CD-8 de `CONVENCIONES.md`); por eso necesita aprobación | visual | pendiente |

### f.2 Variante sin el cambio

| Id | Si no se aprueba | Detalle |
|---|---|---|
| SET-P1 | `Switch` de plataforma con colores de tokens | A la derecha del bloque de texto, con el mismo alto de fila y la misma separación `paso 3.5`. `trackColor`: apagado `borde`, encendido `tinta`; `thumbColor` `superficie`; fondo de iOS `borde`. Pares: pulgar `superficie` sobre pista `borde` (N4) y sobre `tinta` (N6). Estado: posición del pulgar, sin palabra. Área táctil de `paso 11` de alto y de ancho (el interruptor visible mide menos y se amplía con `hitSlop`). Hover sin cambio; presionado lo resuelve la plataforma; foco: el de la plataforma, sin contorno `foco` propio. `accessibilityRole` interruptor con `accessibilityLabel` «Ocultar resultado hasta el final» y estado marcado. El control conserva la forma circular de plataforma: es una excepción a `tokens.md` c.1 que esta variante deja declarada |
| SET-P2 | K2 neutro | Texto `tinta` (T2) y borde `linea`, `border` (N2) sobre `superficie`. Hover: contorno web `linea`, `border`. Presionado: inversión, fondo `tinta`; texto `fondo`; borde `tinta` (T7). Foco: contorno `foco`. Misma ubicación (detrás del divisor, último de «Tus datos») y mismo texto; la advertencia la da la confirmación del sistema, como hoy |

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Sin figura de esta pantalla | Pantalla compuesta con la gramática del boceto | El boceto no la cubre; `main` fija funciones, datos y orden (D10) |
| (`main`) píldoras de enlace con `rounded-full` | Botones K2 cuadrados | `tokens.md` c.1: sin radios ni elementos circulares |
| (`main`) tarjetas sin marco, elevadas solo por contraste de fondo | Paneles con marco `linea` | `tokens.md` a.1 y D9: la elevación la da el marco, no la sombra ni el contraste de fondo |
| (`main`) lista de «Mis preguntas» con la correcta solo con tono de acierto | Correcta con `glifo-acierto` y texto | Spec `design-system`: el estado no se comunica solo por color (§4) |
| (`main`) eliminar de 30 | Objetivo `paso 11` | D10: objetivo táctil mínimo de 44 × 44 pt |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| SET-C1 | Las cuatro secciones y su orden: Cuestionario, Mis preguntas, Tus datos, Acerca de | Orden de uso de `main`; el ajuste configurable va arriba a propósito | uso |
| SET-C2 | «Mis preguntas» y «Tus datos» son plegables, cerrados al abrir la pantalla; un toque los abre o los cierra | Función de `main` | uso |
| SET-C3 | El ajuste se guarda al tocarlo, sin botón de guardar, y vale para todos los modos | Función de `main` | uso |
| SET-C4 | Respaldo solo en web; reseteo en todas las plataformas; confirmaciones del sistema para eliminar y resetear | Función y copy de `main` | uso |
| SET-C5 | «Importar respaldo» como acción rellena (K1) y «Descargar respaldo» como acción de marco (K3) | Jerarquía de `main` | visual |
| SET-C6 | El desglose del banco por origen: exámenes, generadas y tuyas | D6: origen visible | dato |
| SET-C7 | Eliminar una pregunta propia desde su tarjeta, con confirmación | Función de `main` | uso |
| SET-C8 | La versión sale de `app.json` | Dato de `main`; la ficha no escribe la cifra | dato |
