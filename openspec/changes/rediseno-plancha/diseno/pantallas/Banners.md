# Banners · ficha 1.3

| Campo | Valor |
|---|---|
| Superficie | Tres avisos de las pantallas de entrada: banner de banco reducido (`BancoReducidoBanner`, `src/screens/HomeScreen.js:122`), nota del creador (`AboutBanner`, `src/screens/MateriaSelectScreen.js:67`) y nota de privacidad (`HomeScreen.js:107`) |
| Boceto | Sin figura: el boceto no dibuja estos avisos. La ficha usa la «nota» de `Quiz.md` b (borde izquierdo de acento, rótulo mono con glifo) y la extiende a dos avisos informativos |
| Comunes | `comun.md`: §5 estados (K2, K7), §7 anchos, §8 dimensiones, §9 glifos |
| Lo usan | `Home` (banco reducido y privacidad) y `MateriaSelect` (nota del creador) |
| Variantes | Banco reducido solo en materias con `bancoReducido` (hoy `cyr` y `neuro`); nota del creador visible o descartada (reaparece a los siete días); privacidad solo en web |
| Fuera de alcance | La lámina, la tarjeta de materia y la lista de acciones (`MateriaSelect.md`, `Home.md`) |
| Propuestas | Sección f: `BAN-P1`, pendiente. Sección h: conservado de main (D10). Comunes: `COMUN-P2` |

Convención de 1.3 (D10): las secciones a a e describen la superficie con las propuestas de f aplicadas. La sección f.2 trae la variante sin el cambio de cada una, al mismo nivel de detalle, y es la que se implementa si el usuario no la aprueba. Base de comparación: el boceto para lo visual; `main` para funciones, datos, copy y orden de uso.

---

## a. Layout a 390 px

### a.1 Posición en cada pantalla

Los lugares los fijaron las fichas de 1.2; esta ficha da el interior.

| Pantalla | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| Home | Banner de banco reducido (bloque 3 de `Home.md` a.1) | `paso 3` | `paso 5` | — | Solo si `materia.bancoReducido`; sigue visible (D6) |
| MateriaSelect | Nota del creador (bloque 3 de `MateriaSelect.md` a.1) | — | `paso 5` | `paso 3` | Condicional; debajo de la lámina y encima de la lista |
| Home | Nota de privacidad (bloque 6 de `Home.md` a.1) | `paso 6` | `paso 6` | — | Solo web; centrada |

### a.2 Interior de la nota (banco reducido y nota del creador)

Cuerpo con relleno `paso 3.5` en las cuatro caras.

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Encabezado | Fila; glifo chico y rótulo separados `paso 1.5`; margen inferior `paso 2`. En la nota del creador, el rótulo deja libre `paso 11` a la derecha | Glifo y rótulo |
| 2 | Descartar (solo nota del creador) | Objetivo `paso 11` por `paso 11`, en la esquina superior derecha del cuerpo, a ras del marco; glifo grande centrado | `glifo-cerrar` |
| 3 | Texto | Párrafos separados por `paso 3` | Mensaje |
| 4 | Contacto (`BAN-P1`, solo banco reducido) | Margen superior `paso 3`; alto `paso 11`; ancho por contenido; relleno horizontal `paso 4` | K2 de acento con `glifo-correo` |

### a.3 Interior de la nota de privacidad

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Texto | Centrado; dos oraciones, con salto de línea entre ellas | Aviso de almacenamiento local y analítica anónima |

### a.4 Otros anchos (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Las notas llenan la columna; la de privacidad queda centrada dentro de la columna |
| 1280 px | Igual | Igual | Igual: sin avisos a los costados |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` (privacidad: `paso 6`) | — | Sin scroll horizontal. El rótulo salta de línea sin pasar bajo el objetivo de descartar; el contacto salta de línea dentro del botón si el correo no entra |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Nota (cuerpo) | — | `superficie` | Izquierdo `acento`, `border-l-3`; resto `filete`, `border` | — | — | — | N18, X2 |
| Rótulo «Banco más reducido» | `acento` | `superficie` | — | `rotulo` | — | `glifo-banco-reducido` (chico), delante | T6, N18 |
| Rótulo «Una nota del creador» | `acento` | `superficie` | — | `rotulo` | — | `glifo-mensaje` (chico), delante | T6, N18 |
| Descartar (K7) | `tintaSec` | `superficie` | — | — | — | `glifo-cerrar` (grande) | N20 |
| Texto de la nota | `tinta` | `superficie` | — | `cuerpo` | — | — | T2 |
| Contacto (K2, acento, `BAN-P1`) | `acento` | `superficie` | `acento`, `border` | `cuerpo-fuerte` | — | `glifo-correo` (chico), delante del texto | T6, N18 |
| Nota de privacidad | `tintaSec` | `fondo` | — | `detalle` | — | — | T3 |

La nota del creador y el banner de banco reducido son el mismo componente con otro rótulo y otro glifo: no se distinguen por color, sino por rótulo y glifo (`comun.md` §9). Los glifos del rótulo van con texto: decorativos, ocultos a lectores (`aria-hidden`, `accessibilityElementsHidden`). El glifo de descartar va solo y lleva nombre accesible (e). Todo control mide al menos `paso 11` de alto y de ancho, con `paso 2` como mínimo entre controles adyacentes.

---

## c. Matriz de estados

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Banner de banco reducido | Estático (no es un control) | — | — | — | — | — |
| Contacto (K2, acento) | Borde, texto y glifo `acento`; fondo `superficie` | Contorno web `acento`, `border` | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — |
| Nota del creador | Estática, salvo descartar | — | — | — | — | — |
| Descartar (K7) | Glifo `tintaSec` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; glifo `fondo` | Contorno `foco` | — | — |
| Nota de privacidad | Estática | — | — | — | — | — |

| Estado | Condición | Qué se ve |
|---|---|---|
| Banner visible | `materia.bancoReducido` en verdadero | La nota completa; no se puede descartar |
| Banner ausente | Materia sin `bancoReducido` | Nada: el bloque 4 de `Home.md` sube sin dejar hueco |
| Nota del creador visible | Sin marca de visto o con siete días o más desde ella | La nota completa con descartar |
| Nota del creador oculta | Descartada hace menos de siete días | Nada: la lista de materias sube sin dejar hueco |
| Privacidad visible | `Platform.OS === 'web'` | Las dos oraciones centradas |
| Privacidad ausente | Nativo | Nada |

Origen de la pregunta, aciertos de rendimiento y estado vacío no aplican (—).

---

## d. Datos e invariantes

### d.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Banner de banco reducido | `materia.bancoReducido` (`src/materias/<id>/metadata.js`) | Hoy `cyr` y `neuro` |
| Correo de contacto | Cadena fija `pkappsoporte@gmail.com` | Abre `mailto:` con `Linking.openURL` dentro de `requestAnimationFrame` y `catch` vacío |
| Marca de visto de la nota | `localStorage`, clave `pkapp_about_seen_at` (`ABOUT_KEY`) | Valor `Date.now()` como cadena, escrito al descartar |
| Intervalo de reaparición | `ABOUT_INTERVAL_MS`: siete días en milisegundos | La nota reaparece cuando `Date.now() - seenAt >= intervalo` |
| Visibilidad de la nota | Efecto al montar: visible si no hay `localStorage` (nativo), no hay marca o venció el intervalo | Inicia oculta y se resuelve tras el primer render; en nativo, descartar la oculta solo hasta que se vuelve a montar |
| Nota de privacidad | `Platform.OS === 'web'` | Solo web |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Banco reducido visible (D6) | El banner mantiene su lugar entre la tarjeta de materia y la lista de acciones; no se descarta ni se pliega |
| Reaparición semanal | Descartar guarda la marca; la nota vuelve a los siete días. La ficha no cambia el intervalo ni la clave |
| Un gesto descarta | Un toque en descartar la oculta; no hay confirmación |
| Orden y ubicación | Los tres avisos conservan el lugar que fijan `Home.md` y `MateriaSelect.md` (D10) |
| Copy | Los textos son los de `main`; el contenido de la nota del creador lo decide el usuario |
| Sin emoji, radio ni sombra | El emoji de descenso, el de saludo, el símbolo de cerrar, el subrayado del correo, `rounded-*` y el fondo propio del botón salen de estas superficies (`comun.md` §9, D9; subrayado: `tokens.md` b.3) |

### d.3 Eventos `track(...)`

`rg -n 'track\(' src/screens/HomeScreen.js src/screens/MateriaSelectScreen.js`

| Evento | Línea | Payload | Fila que lo cubre |
|---|---|---|---|
| `materia_elegida` | `MateriaSelectScreen.js:23` | `{ materia: materia.id }` | No es de estos avisos: lo cubre `MateriaSelect.md` d.3 (tarjeta de materia). Ninguno de los tres avisos emite eventos y la ficha no agrega ninguno |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Banner, rótulo | Emoji de descenso y «Banco más reducido» | «Banco más reducido» con `glifo-banco-reducido`; el paso lo muestra en mayúsculas | Reemplazo de emoji |
| Banner, texto | «Esta materia tiene menos preguntas que las anteriores porque tuve acceso a menos prototipos de examen.» y, en otro párrafo, «Si tenés material para aportar, escribime a pkappsoporte@gmail.com.» | Iguales; con `BAN-P1`, el correo pasa de enlace en la oración a botón y la oración termina en «escribime a» | `BAN-P1` |
| Nota del creador, rótulo | Emoji de saludo y «Una nota del creador» | «Una nota del creador» con `glifo-mensaje`; el paso lo muestra en mayúsculas | Reemplazo de emoji |
| Nota del creador, texto | «¡Hola! Estoy sumando las materias que faltan (Digestivo, Renal y Endócrino, y Reproductor y Desarrollo) y dándole una lavada de cara a la página. Van llegando de a poco, ¡gracias por la paciencia!» | Igual | Copy del usuario |
| Descartar | Símbolo de cruz | `glifo-cerrar`; nombre accesible «Cerrar nota» | Reemplazo de símbolo; cadena accesible nueva, no visible |
| Contacto (`BAN-P1`) | Correo subrayado dentro de la oración | Botón con `glifo-correo` y el correo; nombre accesible «Escribir a pkappsoporte@gmail.com» | `BAN-P1` |
| Nota de privacidad | «Tus estadísticas y preguntas se guardan localmente en tu navegador.» y, en otra línea, «Se usan analíticas anónimas (sin cookies ni datos personales).» | Iguales | — |

---

## f. Propuestas pendientes (D10)

Cambios respecto de `main` que el boceto no dibuja. Quedan pendientes hasta que el usuario las apruebe; el cuerpo de la ficha (a a e) las describe aplicadas.

### f.1 Propuestas

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| BAN-P1 | En el banner de banco reducido, el correo de contacto pasa de enlace subrayado dentro de la oración a un botón de marco de acento (K2) con `glifo-correo`, debajo del texto. La oración termina en «escribime a» y el botón dice «pkappsoporte@gmail.com» | El sistema no admite subrayado (`tokens.md` b.3) y un enlace en línea mide una línea de texto, bajo el objetivo táctil de 44 × 44 pt (D10 y C3 de `CONVENCIONES.md`). Como botón es un objetivo propio y se distingue por forma | uso | pendiente |

### f.2 Variante sin el cambio

| Id | Si no se aprueba | Detalle |
|---|---|---|
| BAN-P1 | Enlace en la oración | Se omite el bloque 4 de a.2. El texto sigue igual que en `main`: segundo párrafo «Si tenés material para aportar, escribime a pkappsoporte@gmail.com.» con el correo como fragmento de texto en `acento` y `cuerpo-fuerte` (T6), sin subrayado; se distingue del resto por color y peso. Toque: `Linking.openURL('mailto:…')`, igual que hoy. Hover (web): contorno `acento`, `border` alrededor del fragmento. Presionado: inversión del fragmento (fondo `tinta`; texto `fondo`). Foco: contorno `foco`, `border-2`, separado `paso 0.5`. Objetivo táctil: el alto de la línea, bajo `paso 11` (excepción de enlace en línea) |

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Sin figura de estos avisos | Notas con la gramática del boceto | El boceto no los cubre; `main` fija textos, condiciones y lugares (D10) |
| (`main`) descartar de 24 con fondo propio y esquinas redondeadas | Objetivo `paso 11`, glifo `tintaSec` sin fondo | D10: objetivo táctil mínimo de 44 × 44 pt; `tokens.md` c.1: sin radios |
| (`main`) tarjeta con borde neutro y título de marca | Cuerpo `superficie` con borde izquierdo `acento` y rótulo mono | `comun.md` §9 fija `acento` para estos avisos; el borde izquierdo es el de la nota de `Quiz.md` b |
| (`main`) nota de privacidad en 11 | `detalle` | `tokens.md` b.3: el texto corrido parte de 13; ya fijado en `HOME-P3` |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| BAN-C1 | El banner de banco reducido en las materias con `bancoReducido`, siempre visible y sin descartar, con su explicación y su pedido de material | D6: banco reducido visible (spec `design-system`, «distinciones de contenido» del origen y del aviso de banco reducido) | dato |
| BAN-C2 | La nota del creador: condicional, descartable con un toque y reaparece a los siete días | Canal del creador con quien usa la app (`MATERIA-P3`) | uso |
| BAN-C3 | La nota de privacidad al pie de Home, solo en web, con las dos oraciones | Aviso de analíticas de la app (`HOME-P3`) | copy |
| BAN-C4 | El contacto por correo `pkappsoporte@gmail.com` abre `mailto:` | Función de `main` | uso |
