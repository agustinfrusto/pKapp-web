# Banners · ficha 1.3

| Campo | Valor |
|---|---|
| Superficie | Tres avisos de las pantallas de entrada: banner de banco reducido (`BancoReducidoBanner`, `src/screens/HomeScreen.js:122`), nota del creador (`AboutBanner`, `src/screens/MateriaSelectScreen.js:67`) y nota de privacidad (`HomeScreen.js:107`) |
| Boceto | Sin figura: el boceto no dibuja estos avisos. La ficha usa la «nota» de `Quiz.md` b (borde izquierdo de acento, rótulo mono con glifo) y la extiende a dos avisos informativos |
| Comunes | `comun.md`: §5 estados (K2, K7), §7 anchos, §8 dimensiones, §9 glifos |
| Lo usan | `Home` (banco reducido y privacidad) y `MateriaSelect` (nota del creador) |
| Variantes | Banco reducido solo en materias con `bancoReducido` (hoy `cyr` y `neuro`); nota del creador visible o descartada (reaparece a los siete días); privacidad solo en web |
| Fuera de alcance | La lámina, la tarjeta de materia y la lista de acciones (`MateriaSelect.md`, `Home.md`) |
| Propuestas | Sección f: `BAN-P1`, aprobada (usuario, 2026-10-10). Sección h: conservado de main (D10). Comunes: `COMUN-P2`. Sección «3.14», al final: varios mensajes, `BAN-P2` aprobada (usuario, 2026-10-11) y `BAN-P3` y `BAN-P4` no elegidas |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P11`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.4 |

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
| 1 | Encabezado | Fila; glifo chico y rótulo separados `paso 1.5`; margen inferior `paso 2`. En la nota del creador, el rótulo deja libre `paso 11` a la derecha y la fila reserva el alto del objetivo de descartar: alto mínimo `paso 8`, que sumado al relleno superior `paso 3.5` supera `paso 11`, de modo que el texto arranca bajo el objetivo y ninguna parte de este pisa la primera línea (D10, CD-10; `MAQUETA-P4`) | Glifo y rótulo |
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
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P11`, aprobada): La de la pantalla que los aloja (`comun.md` §7.2) | Igual | Nota del creador y banner en la región lateral de su pantalla; la nota de privacidad, al pie de la principal |
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
| Marca de visto de la nota | `localStorage`, clave `pkapp_about_seen_at_v2` (`ABOUT_KEY`) | Valor `Date.now()` como cadena, escrito al descartar |
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
| Banner, texto | «Esta materia tiene menos preguntas que las anteriores porque tuve acceso a menos prototipos de examen.» y, en otro párrafo, «Si tenés material para aportar, escribime a pkappsoporte@gmail.com.» | Iguales; el correo pasa de enlace en la oración a botón y la oración termina en «escribime a» | `BAN-P1` |
| Nota del creador, rótulo | Emoji de saludo y «Una nota del creador» | «Una nota del creador» con `glifo-mensaje`; el paso lo muestra en mayúsculas | Reemplazo de emoji |
| Nota del creador, texto | «¡Hola! Ya están las seis materias. Ahora estoy trabajando en la estética de la página, así que en las próximas semanas vas a ir viendo cambios en el diseño. ¡Gracias por la paciencia!» (vigente en `MateriaSelectScreen.js` desde el commit `6dbb47a`, 1.7.3; esta ficha citaba el texto anterior, «Estoy sumando las materias que faltan…») | Igual | Copy del usuario: lo decide él. Si se aprueba la sección 3.14, vive en la lista de mensajes |
| Descartar | Símbolo de cruz | `glifo-cerrar`; nombre accesible «Cerrar nota» | Reemplazo de símbolo; cadena accesible nueva, no visible |
| Contacto (`BAN-P1`) | Correo subrayado dentro de la oración | Botón con `glifo-correo` y el correo; nombre accesible «Escribir a pkappsoporte@gmail.com» | `BAN-P1` |
| Nota de privacidad | «Tus estadísticas y preguntas se guardan localmente en tu navegador.» y, en otra línea, «Se usan analíticas anónimas (sin cookies ni datos personales).» | Iguales | — |

---

## f. Propuestas aprobadas (D10)

Cambios respecto de `main` que el boceto no dibuja. El usuario los aprobó el 2026-10-10 (D10): rigen tal como están descritos acá y en el cuerpo de la ficha (a a e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| BAN-P1 | En el banner de banco reducido, el correo de contacto pasa de enlace subrayado dentro de la oración a un botón de marco de acento (K2) con `glifo-correo`, debajo del texto. La oración termina en «escribime a» y el botón dice «pkappsoporte@gmail.com» | El sistema no admite subrayado (`tokens.md` b.3) y un enlace en línea mide una línea de texto, bajo el objetivo táctil de 44 × 44 pt (D10 y C3 de `CONVENCIONES.md`). Como botón es un objetivo propio y se distingue por forma | uso | aprobada (usuario, 2026-10-10) |

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

---

## Escritorio · propuesta `ESC-P11` (tarea 3.10, aprobada por el usuario el 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | Aprobada (usuario, 2026-10-11; D10, `CONVENCIONES.md` C2). Base común: `comun.md` §7.2 (`ESC-P0`, aprobada) |
| Rige desde | Corte `escritorio` (`tokens.md` c.4); sin cambio en `amplio`. Teléfono y tablet no cambian |
| Bajo el corte | a.4 de esta ficha: una sola columna `columna`, centrada y anclada arriba. Es la que implementa la 3.x de esta pantalla; 3.11 aplica esta sección desde el corte |
| Figuras | Maqueta: E01 (nota del creador) y E02 (banner de banco reducido y nota de privacidad), a 1366 y 1920 px, en claro y en oscuro (`diseno/maqueta/NOTAS-MAQUETA.md` §8) |
| Sin cambio | Textos, condiciones, lugares relativos y estados de c (`BAN-C1` a `BAN-C4`), contacto en botón (`BAN-P1`), elementos y pares de b |

### Disposición

| Aviso | Región | Escritorio |
|---|---|---|
| Nota del creador (MateriaSelect) | Lateral, debajo de la lámina, a `paso 3` | Ancho `lateral`; descartar de `paso 11` en la esquina, a ras del marco |
| Banner de banco reducido (Home) | Lateral, debajo de la tarjeta de materia, a `paso 3` | Ancho `lateral`; el botón de contacto en una línea; sin descartar |
| Nota de privacidad (Home, solo web) | Principal, al pie, a `paso 6` | Centrada en la región principal |

### Medidas

| Elemento | Medida |
|---|---|
| Nota (cuerpo) | Relleno `paso 3.5` y borde izquierdo `acento` de `border-l-3`, sin cambio (a.2) |
| Rótulo | Salta de línea sin pasar bajo el objetivo de descartar (a.2) |
| Texto | A `lateral` el párrafo ocupa más líneas; ninguna cadena cambia |

### Propuesta

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ESC-P11` | Desde el corte `escritorio`, la nota del creador y el banner de banco reducido van en la región lateral de su pantalla; la nota de privacidad, al pie de la principal | Siguen debajo del bloque de marca o de materia (`MATERIA-P3`, `BAN-C1`) y dejan de empujar la lista o las acciones hacia abajo | visual | aprobada (usuario, 2026-10-11) |

---

## 3.14 · Varios mensajes en los banners · `BAN-P2` aprobada (usuario, 2026-10-11)

| Campo | Valor |
|---|---|
| Estado | **`BAN-P2` aprobada** (usuario, 2026-10-11, `CONVENCIONES.md` C2): «Mi elección es el automático con botón de pausa». `BAN-P3` y `BAN-P4`, no elegidas (3.14.3). Rige tal como está descrita en 3.14.1 a 3.14.12 |
| Pedido | Usuario, 2026-10-11: «Debemos implementar un sistema de banners, donde puedan aparecer secuencialmente más de un mensaje. A veces necesito comunicar más de una cosa. Tal vez un carrusel automático.» |
| Ids | `BAN-P1` ya existe (contacto en botón, aprobada el 2026-10-10): los ids de esta sección siguen la numeración y son únicos en el change |
| Contrato de datos | `design.md` D11: lista `AVISOS` en `src/avisos/avisos.js`, validación en el build y respuestas a `BAN-Q1` a `BAN-Q5` (3.14.10) |
| Prototipo | `diseno/banners/banners.html`, generado por `generar-banners.mjs` desde `plancha`, los glifos reales y los datos reales: `BAN-P2` funcionando, en claro y en oscuro, a 320, 390 y 1366 px (región lateral de `ESC-P1` y `ESC-P2`), más la lámina de estados. El primer mensaje es el texto vigente de la nota del creador; los otros dos son de muestra |
| Capturas | `diseno/banners/capturas/banners-{320,390,1366,lateral,estados}-{claro,oscuro}.png`: diez tableros, regenerables con `capturar-banners.mjs` (como `maqueta/*.png`, no se versionan) |
| Verificación | `verificar-banners.mjs`: 75 comprobaciones en verde (3.14.12) |
| Decisión | `BAN-P2`. El Diseñador había recomendado `BAN-P3` (3.14.5) |
| Sin cambio | Tokens y pares (E1 a E4 intactas, CD-27), tipografía, grosores, sin radios ni sombras; contacto en botón (`BAN-P1`); lugares de a.1 y `ESC-P11`; nada de lo que hoy se ve deja de verse (D10). Glifos nuevos: `glifo-pausar` y `glifo-reanudar`, ya en el inventario (`comun.md` §9, `NOTAS-GLIFOS.md`) |

### 3.14.1 Restricciones del Ingeniero y cómo las cumple `BAN-P2`

| Restricción | `BAN-P2`, carrusel automático |
|---|---|
| WCAG 2.2.2: control visible de pausa y reanudación | «Pausar» y «Reanudar» en el pie, con texto desde 360 px |
| Se detiene con foco o puntero dentro y no se reanuda solo mientras siga ahí | Puntero: suspende y, al salir, espera completa. Foco de teclado: pausa persistente, solo «Reanudar» la retoma (`BAN-Q2`, cerrada en D11) |
| `prefers-reduced-motion` | Sin avance ni fundido; se comporta como «Vuelta terminada» (3.14.6) y no muestra «Pausar» |
| Sin anuncios automáticos del lector | `aria-live` en `off` mientras avanza solo; `polite` solo cuando lo gobierna el usuario (`BAN-Q1`, cerrada en D11) |
| Objetivos de 44 × 44 y `paso 2` entre controles | Todos de `paso 11`; `paso 2` entre ellos (medido) |
| Orden de foco = visual = DOM | Cerrar, contacto, «Pausar», anterior, siguiente (medido: sin saltos hacia atrás) |
| Animación: solo `opacity` o `transform`, ≤ 200 ms | Fundido de entrada de 150 ms, solo `opacity` |
| Nada salta | Alto reservado: las notas comparten una celda y la región mide la más alta, sin JS ni medidas a mano (medido: constante al avanzar) |
| Sin JS cuadro a cuadro ni librerías | Un `setTimeout` por nota, de 8 a 25 s, que solo cambia cuál es la activa (`BAN-Q3`, cerrada en D11) |
| D10 | La nota del creador entra al sistema sin perder nada; el banco reducido queda aparte |
| D5 (shell ≤ 256.379 B; hoy 247.471 B; margen 8.908 B) | ≈ 2,0 a 3,0 KB gzip y 2 glifos |

El peso es estimación del Diseñador: cota medida en el prototipo (JS plano, gzip nivel 9) de 1,2 KB la lógica del carrusel y 0,4 KB lo común, multiplicada por 1,5 a 2 por JSX y hooks. La mide 3.x con el build (D5).

### 3.14.2 Anatomía común

El mensaje es la nota de a.2, sin cambio. Lo nuevo es el marco compartido y el pie.

| Pieza | Regla | Tokens y pasos |
|---|---|---|
| Nota (mensaje) | Cuerpo `superficie`; borde izquierdo `acento`, `border-l-3`; resto `filete`, `border`; relleno `paso 3.5`; rótulo `rotulo` en `acento` con glifo chico delante; párrafos `cuerpo` en `tinta`, separados por `paso 3`; contacto K2 de acento con `glifo-correo` (`BAN-P1`); Cerrar K7 en la esquina (a.2) | N18, T6, T2, X2 |
| Orden en el DOM | Cerrar, rótulo, párrafos, contacto. El × va primero porque en pantalla está arriba a la derecha: orden de foco = visual | — |
| Marco compartido | Un solo marco para todas las notas y el pie; las notas ocupan la misma celda de rejilla (`col-start-1 row-start-1`) y la que no está activa queda `invisible`: la región mide la más alta. Sin medidas a mano: aguanta zoom, espaciado de texto (WCAG 1.4.12) y cambio de ancho | — |
| Pie | Fila bajo un filete `filete`, `border`; relleno vertical `paso 2` y horizontal `paso 3.5`; controles de `paso 11`; `paso 2` entre ellos. Alto: 61 px (8 + 44 + 8 + 1) | X2 |
| Contador | «1 de 3», `rotulo` en `tintaSec`, ancho mínimo `paso 11`, centrado entre anterior y siguiente. Lo muestra en mayúsculas el paso | T4 |
| Anterior y siguiente | K5 (cuadrado de paso, `comun.md` §5.2) con `glifo-chevron` chico: el de siguiente tal cual y el de anterior girado 180° (el glifo se centra en (8, 8): `NOTAS-GLIFOS.md` §2, «Giro»). Dan la vuelta; nunca se deshabilitan | N2, N6 |
| Pausar y Reanudar | K2 de `paso 11`, relleno horizontal `paso 4`, glifo chico delante del texto `cuerpo-fuerte`. Bajo 360 px solo el glifo, de `paso 11` por `paso 11` (precedente: «Cambiar materia», `comun.md` §1.1) | T2, N2, N6 |
| Posición en el pie | «Pausar» a la izquierda; anterior, contador y siguiente a la derecha. Sin «Pausar», el grupo queda a la derecha | — |
| Glifos nuevos | `glifo-pausar`: dos verticales de 11 u en x = 5,5 y 10,5. `glifo-reanudar`: triángulo de lado vertical de 11 u (x = 5,5) y vértice en (11, 8), diagonales a 45°. Mismo `viewBox 0 0 16 16`, trazo de `NOTAS-GLIFOS.md` §1 y retícula de §2. Archivos en `diseno/svg/glifos/`, copia de los de `diseno/banners/glifos/`; inventario en `comun.md` §9 y `NOTAS-GLIFOS.md` §4 | N6 |

### 3.14.3 Las propuestas

#### `BAN-P2` · Carrusel automático accesible · aprobada (usuario, 2026-10-11)

| Aspecto | Detalle |
|---|---|
| Qué | Una región con una nota visible a la vez. Avanza sola: recorre las notas una vez, en orden, y se queda en la última. Pie con «Pausar» («Reanudar»), anterior, «n de N» y siguiente |
| Por qué | Es lo que pidió el usuario: comunica todo en un solo lugar, sin pedir una acción y sin crecer con la cantidad de mensajes |
| Espera por nota | 4 s más 0,35 s por palabra, entre 8 y 25 s. Con las tres del prototipo: 16,9 s (37 palabras), 10,3 s (18) y 10,6 s (19). El lector adulto medio (238 palabras por minuto, Brysbaert 2019) necesita 9,3 s, 4,5 s y 4,8 s: margen de ×1,8 a ×2,3. La vuelta hasta quedar en la última tarda 27 s |
| Puntero | Encima: suspende, sin cambiar el botón. Al salir: espera completa de la nota visible |
| Foco de teclado | Dentro: pausa persistente; el botón pasa a «Reanudar» y solo él la retoma, aunque el foco salga (`BAN-Q2`, cerrada en D11) |
| Otras condiciones | No avanza con la pestaña oculta ni con la región fuera de la vista. Pulsar anterior o siguiente la pausa (tomar el control manual). Al llegar a la última no hay nada que pausar: «Pausar» desaparece y, si tenía el foco, pasa a «Nota anterior» |
| Movimiento reducido | Sin avance, sin fundido y sin «Pausar»: queda el estado «Vuelta terminada» (3.14.6) desde el primer cuadro |
| Costo | 2 glifos nuevos; 3 estados de control nuevos (avanzando, pausado, terminado); un temporizador por nota y un observador de visibilidad; la espera es una función con la fórmula de esta fila que el componente recibe por prop con ese valor por defecto (`BAN-Q4`, cerrada en D11); ≈ 2,0 a 3,0 KB gzip |
| Riesgos de uso (aceptados al elegirla) | **Leer una nota que se va:** sí, mitigado por la espera proporcional, la pausa por puntero y por foco y el botón visible. **Notas 2 y 3 poco vistas:** cada una está a la vista 1/N del tiempo y la pantalla de entrada se mira unos segundos (NN/g: un panel que rotaba cada 5 s se vio cerca del 20 % del tiempo y se tomó por publicidad). **Lector de pantalla:** el cursor virtual no emite foco, así que el avance puede cambiar la nota mientras se lee; mitigan la espera larga y la única vuelta, no lo eliminan. **Competencia:** el movimiento arriba de la pantalla compite con elegir materia. **Saltos de layout:** no (alto reservado) |

#### `BAN-P3` · Un mensaje a la vez, avance manual · no elegida

Era la recomendada del Diseñador (la misma región sin temporizador: +61 a +73 px y pantalla quieta) y el usuario prefirió el avance automático con pausa (2026-10-11); su pantalla sigue como el estado «Vuelta terminada» de `BAN-P2` (3.14.6).

#### `BAN-P4` · Apilados, cada uno descartable · no elegida

Todas las notas visibles, cada una con su ×; no elegida: sumaba +326 a +348 px con tres notas y dejaba la primera tarjeta de materia fuera de la primera pantalla de un teléfono.

### 3.14.4 Alturas medidas en el prototipo (`BAN-P2`)

Alturas en px, en claro. «Nota sola» es lo que mide hoy la nota del creador en ese ancho.

| Medida | Hoy (nota sola) | `BAN-P2` |
|---|---|---|
| Región con 3 notas, 390 px (MateriaSelect) | 158 | 231 (+73) |
| 1.ª tarjeta de materia, y en 390 px | 439 | 512 |
| Región con 2 notas, 390 px (Home) | — | 231 |
| 1.ª acción de Home, y en 390 px (con banco reducido) | 455 | 698 |
| Región con 3 notas, 320 px | 202 | 263 (+61) |
| 1.ª tarjeta de materia, y en 320 px | 515 | 576 |
| Región con 3 notas, lateral de 320 px (1366) | 180 | 241 (+61) |
| Región lateral completa, MateriaSelect (1366) | 368 | 429 |
| Región con 2 notas, lateral (Home, 1366) | — | 231 |
| Región lateral completa, Home (1366) | 334 | 577 |
| Blanco bajo el texto más corto (320 / 390 / 1366) | — | 66 / 34 / 44 |
| Movimiento | Ninguno | Fundido de 150 ms, un temporizador |
| Mecanismo de pausa (2.2.2) | No hace falta | Sí |
| Glifos nuevos | 0 | 2 |
| Peso estimado (gzip) | — | 2,0 a 3,0 KB |
| Mensajes que se ven sin tocar nada | 1 | 1 por vez, todos en 27 s |

La región lateral de «Hoy» es la de `ESC-P1` (368) y la de `ESC-P2` (334), medidas en el prototipo con el texto vigente.

### 3.14.5 Decisión

| Aspecto | Detalle |
|---|---|
| Decisión | **`BAN-P2`: carrusel automático con botón de pausa** (usuario, 2026-10-11) |
| Recomendación del Diseñador | `BAN-P3`: un mensaje a la vez, con avance manual. Sumaba +61 a +73 px sobre la nota sola, no tenía temporizador y dejaba el avance automático como incremento posterior |
| Riesgos que acepta | Los de 3.14.3: la 2.ª y la 3.ª las ve menos gente, el cursor virtual del lector y el movimiento arriba de la pantalla. Las mitigaciones son las reglas de esta sección |
| Tope | 3 avisos vigentes por pantalla (D11) |

### 3.14.6 Matriz de estados

Hover solo con puntero (`hovered` de `Pressable`): contorno de `border`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Clase | Reposo | Hover (web) | Foco | Presionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Pausar y Reanudar | K2 | Fondo `superficie`; texto y glifo `tinta`; borde `linea`, `border` (T2, N2, N6) | Contorno `linea`, `border` | Contorno `foco`, `border-2`, separado `paso 0.5` (N8) | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` (T7) | — (nunca) |
| Nota anterior y siguiente | K5 | Lado `paso 11`; fondo `superficie`; glifo `tinta`; borde `linea` (N2, N6) | Contorno `linea`, `border` | Contorno `foco` | Inversión: fondo `tinta`; glifo `fondo` | — (dan la vuelta; nunca) |
| Cerrar | K7 | Glifo `tintaSec` (N20); a ras del marco, `paso 11` por `paso 11` | Contorno `linea`, `border` | Contorno `foco` | Inversión total: fondo `tinta`; glifo `fondo` | — |
| Contacto | K2 de acento | Sin cambio (`BAN-P1`) | Contorno `acento` | Contorno `foco` | Inversión | — |
| Contador | Texto | `rotulo` en `tintaSec` (T4) | — | — | — | — |
| Pie | Contenedor | Fondo `superficie`; filete superior `filete` (X2) | — | — | — | — |
| Nota (cuerpo) | No es un control | Estática | — | — | — | — |

| Estado de la región | Condición | Qué se ve |
|---|---|---|
| Uno solo | 1 nota vigente | La nota de a.2, sin pie, sin contador y sin roles de carrusel; con × si es descartable. Idéntica a hoy (D10) |
| Varios, avanzando | 2 o más, sin pausa, sin movimiento reducido | Nota activa y pie con «Pausar», contador y anterior y siguiente; `aria-live` en `off` |
| Varios, suspendido | Puntero encima | Igual que avanzando; no avanza. Al salir, espera completa |
| Pausado | Se pulsó «Pausar», se tomó el control manual o el foco de teclado entró | El botón dice «Reanudar» con `glifo-reanudar`; no avanza; `aria-live` en `polite` |
| Vuelta terminada | Se llegó a la última nota | Nota activa y pie sin «Pausar», con contador y anterior y siguiente; `aria-live` en `polite` |
| Movimiento reducido | `prefers-reduced-motion: reduce` | Como «Vuelta terminada», desde el primer cuadro: sin avance, sin fundido, sin «Pausar» |
| Descartado uno de varios | El usuario cierra una | Renumera («2 de 2»); el foco pasa a la nota que ocupa su lugar (la siguiente; si era la última, la anterior). Con una sola restante, vuelve «Uno solo» |
| Último descartado | El usuario cierra la última vigente | La región desaparece sin dejar hueco, como «Nota del creador oculta» (c). El foco pasa al primer control que sigue en el DOM: la primera tarjeta de materia en MateriaSelect y la primera acción en Home |
| Sin descartar | `descartable` en falso | Sin ×; el encabezado no reserva `paso 11` (a.2) |
| Ninguno vigente | Lista vacía, fuera de vigencia o todo descartado | Nada, sin hueco |

### 3.14.7 Copy de controles y lectura con lector de pantalla

| Elemento | Texto visible | Nombre accesible | Rol y estado |
|---|---|---|---|
| Región (2 o más) | — | «Avisos» | `region`; `aria-roledescription` «carrusel» |
| Contenedor de notas | — | — | `aria-live`: `off` mientras `BAN-P2` avanza solo; `polite` en el resto; `aria-atomic` en falso |
| Cada nota | El rótulo y el texto | «1 de 3» | `group`; `aria-roledescription` «nota». Las no activas, con `invisible` (`visibility: hidden`): salen del árbol de accesibilidad y de Tab, pero siguen midiendo para la reserva de alto |
| Pausar | «Pausar» (bajo 360 px solo el glifo) | «Pausar avisos» | `button`; sin `aria-pressed`: el nombre cambia con la acción (APG) |
| Reanudar | «Reanudar» (bajo 360 px solo el glifo) | «Reanudar avisos» | `button` |
| Anterior | `glifo-chevron` girado | «Nota anterior» | `button` |
| Siguiente | `glifo-chevron` | «Nota siguiente» | `button` |
| Contador | «1 de 3» (en mayúsculas por el paso) | «Nota 1 de 3» | Texto estático |
| Cerrar | `glifo-cerrar` | «Cerrar nota» (la nota visible) | `button` |
| Contacto | El correo | «Escribir a {correo}» | `button`; sin cambio (`BAN-P1`) |
| Glifos del rótulo, del pie y del × | — | — | Decorativos: `aria-hidden`, `accessibilityElementsHidden` (CD-12) |

Cadenas nuevas: «Pausar», «Reanudar» y «n de N» (visibles) y los nombres accesibles de arriba. «Cerrar nota» y el `testID` `nota-del-creador` se conservan: los usa la e2e (`materias.js`, `comunes.js`).

| Situación | Lo que oye quien usa lector (indicativo) |
|---|---|
| Entra con Tab | «Cerrar nota, botón»; luego, según la nota, el contacto; «Pausar avisos, botón»; «Nota anterior, botón»; «Nota siguiente, botón» |
| Recorre con el cursor virtual | «Avisos, región, carrusel»; «nota, 1 de 3, grupo»; el rótulo; el texto; los controles |
| La nota cambia sola (`BAN-P2`) | Nada: `aria-live` en `off` |
| Pulsa «Nota siguiente» | `polite`: «nota, 2 de 3, Novedades, Ya podés agregar…» (`BAN-Q1`, cerrada en D11) |
| Pulsa «Pausar avisos» | El foco queda en el botón; al leerlo dice «Reanudar avisos» |
| Cierra una de varias | El foco pasa a la nota que ocupa su lugar: «nota, 1 de 2, grupo…» |
| Cierra la última | El foco pasa al primer control que sigue: «{materia}, botón» |
| Una sola nota | Como hoy: el rótulo, el texto y «Cerrar nota, botón» |

### 3.14.8 Teclado, foco y movimiento

| Tecla | Dónde | Efecto |
|---|---|---|
| Tab y Shift+Tab | La región | Recorre: Cerrar, contacto, «Pausar» o «Reanudar», anterior, siguiente. Orden de DOM = visual: de arriba abajo y de izquierda a derecha |
| Enter y Espacio | Cualquier control | Lo activa |
| Flechas, Inicio, Fin y Escape | — | Sin efecto: son botones, no un compuesto con teclas propias (como el stepper del temporizador) |

| Acción | Dónde queda el foco |
|---|---|
| Pausar o Reanudar | En el mismo botón |
| Anterior o siguiente | En el mismo botón |
| Cerrar con varias notas | En la nota que ocupa su lugar: contenedor con `tabIndex = -1` y contorno `foco` hacia adentro, separado `paso 1` (como el × de `DON-P5`) |
| Cerrar la última | En el primer control que sigue en el DOM |
| Termina la vuelta con el foco en «Pausar» | En «Nota anterior» |

| Aspecto del movimiento (criterio de 6.0) | Valor |
|---|---|
| Propiedad | `opacity`, de 0 a 1, en la nota que entra; la que sale se oculta al instante. Sin `transform`. La opacidad es solo el fundido: ningún estado se expresa con ella (CD-24) |
| Duración | 150 ms (`duration-150`), curva por defecto de Tailwind |
| Layout | No se mueve: notas en una celda de rejilla; región de alto constante |
| Disparo | Un cambio de clase por estado (activa o no); sin `Animated`, `requestAnimationFrame` ni librerías |
| Temporizador | Un `setTimeout` por nota, de 8 a 25 s, rearmado en cada cambio; no calcula cuadros (`BAN-Q3`, cerrada en D11) |
| Movimiento reducido | Sin transición ni avance: `motion-reduce:transition-none` y `matchMedia` |
| Implementable en NativeWind 4 y Tailwind 3 | `grid`, `col-start-1`, `row-start-1`, `invisible`, `opacity-0`, `transition-opacity`, `duration-150`, `motion-reduce:`; sin pseudo-elementos, gradientes, filtros ni blend modes |

### 3.14.9 Convivencia con la nota del creador y el banco reducido

| Pieza | ¿Entra al sistema? | Por qué | Lugar | Qué no cambia |
|---|---|---|---|---|
| Nota del creador | **Sí**: es el mensaje `nota-creador` | Es lo que el sistema generaliza: texto del usuario, descartable con un toque, reaparece a los siete días, en MateriaSelect | MateriaSelect, debajo de la lámina (a.1); en escritorio, región lateral (`ESC-P11`) | Texto (el que decida el usuario), clave `pkapp_about_seen_at_v2`, siete días, un toque descarta, `Cerrar nota`, `nota-del-creador` |
| Banner de banco reducido | **No: queda aparte**, con el mismo componente visual | D6 y la spec `design-system` («Distinciones de contenido siempre visibles»): siempre visible y sin descartar. Dentro de un conjunto que rota o se pagina dejaría de verse 2 de cada 3 veces. Además depende de `materia.bancoReducido` (metadata), no de la lista de mensajes | Home, entre la tarjeta de materia y las acciones (a.1) | Texto, contacto en botón, `glifo-banco-reducido`, sin ×, `home-banco-reducido` |
| Nota de privacidad | No | Pie estático de la principal, solo en web; no compite por atención | Al pie de la principal (`ESC-P11`) | Todo |

| Pantalla | Orden en teléfono | Orden en escritorio |
|---|---|---|
| MateriaSelect | HeaderMarca, lámina, **avisos** (1 a 3), lista de materias | Lateral: lámina y **avisos**. Principal: rejilla y pedido de donación |
| Home | HeaderMarca, tarjeta de materia, banner de banco reducido (si la materia lo tiene), **avisos** (si hay mensajes para Home), «Plano / Acciones» | Lateral: tarjeta, banner y **avisos**. Principal: acciones y nota de privacidad |

| Consecuencia | Detalle |
|---|---|
| Mensajes en Home | En un teléfono de 390 px, con banco reducido, un mensaje en Home baja las acciones de y = 455 a y = 625 (+170) y dos mensajes, a y = 698 (+243). La ficha lo admite; conviene reservarlo para lo que valga esa altura |
| Contextual por materia | Un aviso solo de una materia dentro del sistema pediría un campo `materias`; no se pide ahora. El banco reducido se resuelve aparte y no lo necesita |

### 3.14.10 Datos: el contrato es `design.md` D11

El contrato de datos lo fija `design.md` D11: la lista `AVISOS` en `src/avisos/avisos.js`, `validarAvisos` en el build (tipos, valores cerrados, ids únicos, fechas y como máximo 3 avisos vigentes a la vez por pantalla) y `avisosVigentes`, pura y síncrona, en el inicializador de `useState`. Esta ficha no repite los campos.

| Pedido de la primera pasada | Dónde quedó en D11 |
|---|---|
| `clave` opcional | Campo `clave`; la nota del creador usa `pkapp_about_seen_at_v2` (D10) |
| Tope de 3 notas vigentes por pantalla | `validarAvisos`, evaluado en cada fecha de borde; una lista inválida rompe el build |
| `pantallas` cerrado a `materias` y `home` | Campo `pantallas`, cerrado a esas dos |
| `glifo` cerrado a los dos del inventario | Campo `glifo`: `glifo-mensaje` o `glifo-explicacion` |
| Conjunto resuelto en el primer render, de forma síncrona | `avisosVigentes` en el inicializador de `useState`, antes del primer pintado |
| Conservar `Cerrar nota` y `nota-del-creador` | `id` de la nota del creador: `nota-del-creador` (es el `testID`); «Cerrar nota» está en 3.14.7 |

| Id | Pregunta | Respuesta (D11) |
|---|---|---|
| `BAN-Q1` | ¿Se admite `aria-live="polite"` solo cuando el avance lo gobierna el usuario? | **Sí.** `polite` solo cuando el avance lo gobierna el usuario; `off` mientras avanza solo |
| `BAN-Q2` | ¿Pausa persistente con el foco de teclado? | **Sí.** Solo «Reanudar» la retoma |
| `BAN-Q3` | ¿Un `setTimeout` por nota cumple «sin temporizadores que cambien estilos» de 6.0? | **Sí.** Un `setTimeout` por nota que solo cambia la activa; el fundido es CSS |
| `BAN-Q4` | ¿Gancho de prueba para escalar las esperas? | **Ningún gancho en producción.** La espera es una función con la fórmula de 3.14.3 que el componente recibe por prop con ese valor por defecto; solo la página de prueba de componentes (`EXPO_PUBLIC_PKAPP_PRUEBA=componentes`, que no se publica) pasa una más corta. El prototipo usa `?rapido` y `?x4`: son solo del prototipo |
| `BAN-Q5` | ¿Se miden `aviso_visto` y `aviso_cerrado`? | **No.** Sin eventos nuevos de analítica |

### 3.14.11 Medidas por ancho

| Ancho de ventana | Región | Pie | «Pausar» | Fila del pie (de lo útil) |
|---|---|---|---|---|
| 320 px | 280 | Anterior, contador y siguiente: 148 | Solo glifo, 44 | 200 de 248 |
| 360 px | 320 | Ídem | Glifo y texto: «Pausar» 106; «Reanudar» 125 | 281 de 288 (el peor caso, con «Reanudar») |
| 390 px | 350 | Ídem | Ídem | 281 de 318 |
| 768 px (tablet) | `columna` | Ídem | Ídem | Holgado |
| Desde 1024 px (escritorio) | `lateral`, 320 | Ídem | Ídem | 281 de 288 |

| Medida | Valor |
|---|---|
| Alto del pie | 61 px: relleno `paso 2`, controles de `paso 11` y filete de 1 px |
| Reserva de alto | La de la nota más alta del conjunto; ninguna medida escrita a mano |
| Texto de una nota a 320 px | Hasta 6 líneas (nota del creador); a 390 px, 4 |
| Sin scroll horizontal | Desde 320 px, también con zoom del navegador: el reflujo es vertical |

### 3.14.12 Verificación y aceptación observable

`node openspec/changes/rediseno-plancha/diseno/banners/generar-banners.mjs`, luego `capturar-banners.mjs` y `verificar-banners.mjs` (Chrome headless del arnés e2e, sin dependencias). Resultado del 2026-10-11 tras la 3.14b: **75 comprobaciones en verde** (las propias de `BAN-P3` y `BAN-P4` salieron con las propuestas no elegidas; sus pruebas de descartar y de anterior y siguiente pasaron a `BAN-P2`).

| Grupo | Qué comprueba | Resultado |
|---|---|---|
| Estáticas, 320 / 390 / 1366 × claro / oscuro (42) | Sin desborde horizontal; sin emojis; objetivos de 44 × 44; `paso 2` entre controles; sin radios, sombras, imagen de fondo, opacidad en reposo, cursiva ni subrayado; orden de foco = visual; transición solo `opacity` y ≤ 200 ms | Verde |
| Alto reservado (3) | La región de `BAN-P2` mide lo mismo en cuatro pasos con vuelta, a cada ancho | Verde |
| `BAN-P2` (22) | Avanza sola y recorre las tres en orden; se queda en la última; sin «Pausar» al terminar; puntero detiene y reanuda; foco de teclado pausa y el botón pasa a «Reanudar»; sigue en pausa al salir el foco; «Reanudar» con Enter; clic en «Pausar»; no avanza fuera de la vista; `aria-live` `off` y `polite`; anterior y siguiente con vuelta; descartar renumera y el foco pasa a la nota que ocupa su lugar; con una sola vuelve la nota de hoy | Verde |
| Movimiento reducido (4) | No avanza, sin transición, sin «Pausar», `polite` | Verde |
| Último descartado (3) | Con una sola queda la nota de hoy sin pie; la región desaparece; el foco pasa al primer control que sigue | Verde |
| Tarjeta de materia (1) | Cajetín de 29 px y tarjeta de 89 px a 390, como los tokens y la app (`MateriaSelect.md` f.2, 3) | Verde |

Aceptación observable de la 3.x que implemente la propuesta aprobada (las comprobaciones del prototipo son su guía):

| # | Aceptación | Cómo se observa |
|---|---|---|
| 1 | Con una nota la región es idéntica a hoy: sin pie, sin contador, sin roles de carrusel | e2e actual de la nota del creador sin cambios |
| 2 | Con 2 o más el alto de la región no cambia al avanzar | Medir el alto en cada paso |
| 3 | Objetivos de 44 × 44 y `paso 2` entre controles, a 320 px | Medir cajas |
| 4 | Orden de foco = visual | Tab y posición de cada parada |
| 5 | `BAN-P2`: avanza sola; puntero y foco la detienen; «Pausar» y «Reanudar»; una vuelta; sin avance con movimiento reducido, con la pestaña oculta ni fuera de la vista | e2e con esperas escaladas |
| 6 | Transición solo `opacity`, ≤ 200 ms, y ninguna con movimiento reducido | Estilo calculado |
| 7 | Descartar: renumera; foco a la nota que ocupa su lugar o, si era la última, al primer control siguiente; sin hueco | e2e |
| 8 | El banner de banco reducido sigue visible en Home, sin ×, en su lugar | e2e (`home-banco-reducido`) |
| 9 | Sin radios, sombras, gradientes, transparencias de color ni emojis | Revisión por color de 5.2 |

### 3.14.13 Lo que se descartó

| Variante | Por qué no |
|---|---|
| Cola: la siguiente aparece al cerrar la actual | Acopla leer con descartar: ver la 2.ª obliga a ocultar la 1.ª durante siete días |
| Casillas o puntos de posición además del contador | Con 3 notas como máximo no suman información y cuestan ancho a 320 px |
| Barra de tiempo restante | Animaría `transform` más de 200 ms (criterio de 6.0) |
| Deslizar para pasar de nota | El sistema no depende de gestos (`comun.md` §5.1, «Plataforma»); los botones bastan |
| Avance automático solo con CSS (`animation` con retrasos) | No comparte estado con el contador ni con el lector, y no se detiene con el foco |
| Alto variable, sin reserva | La región y todo lo de abajo saltarían al avanzar |
| Banco reducido dentro del conjunto | Lo ocultaría 2 de cada 3 veces: contradice D6 |
| Bucle infinito | Más movimiento sin ganancia: la pantalla de entrada se mira unos segundos |

### 3.14.14 Fuentes consultadas (2026-10-11)

| Fuente | Qué se tomó |
|---|---|
| WCAG 2.2, SC 2.2.2 «Pause, Stop, Hide», Understanding (https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) | «Auto-updating» es contenido que se actualiza o desaparece por un intervalo; no tiene la excepción de cinco segundos; una función que solo detiene mientras hay foco y reanuda al salir no cuenta como mecanismo |
| WAI-ARIA Authoring Practices, patrón «Carousel» (https://www.w3.org/WAI/ARIA/apg/patterns/carousel/) | Se detiene con foco y con puntero y no reanuda salvo pedido del usuario; `aria-live` en `off` al rotar y `polite` si no; el control de rotación, primero en la secuencia de Tab; el nombre del botón cambia con la acción |
| Nielsen Norman Group, artículo sobre carruseles y acordeones de avance automático (https://www.nngroup.com/articles/auto-forwarding/) | Un panel que rotaba cada 5 s se vio cerca del 20 % del tiempo; el movimiento hizo que se tomara por publicidad; recomienda cambiar solo cuando el usuario lo pide |
| Brysbaert (2019), Journal of Memory and Language, resumen en https://www.bps.org.uk/research-digest/most-comprehensive-review-date-finds-average-persons-reading-speed-slower | 238 palabras por minuto en adultos leyendo no ficción en inglés; menos en quien lee en segunda lengua |
| WCAG 2.2, SC 2.5.8 «Target Size (Minimum)» (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | Mínimo de 24 × 24 px; el proyecto usa 44 × 44 (D10) |

Desvío de la APG, deliberado: el control de rotación va al final de la región y no primero en el DOM, porque el orden de foco debe ser el visual (restricción del Ingeniero) y el × y el pie van abajo. Lo compensan la pausa persistente al entrar el foco y la espera proporcional; el cursor virtual del lector queda como riesgo residual de `BAN-P2` (3.14.3).

### 3.14.15 Propuestas

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `BAN-P2` | La nota del creador pasa a ser un mensaje de una lista; con 2 o más mensajes para la pantalla, una región los muestra de a uno, avanza sola una vuelta con «Pausar» y «Reanudar», contador y anterior y siguiente | Pedido del usuario (2026-10-11): comunicar más de una cosa y, quizás, con un carrusel automático | uso | **aprobada** (usuario, 2026-10-11) |
| `BAN-P3` | Igual que `BAN-P2` sin avance automático: solo cambia con anterior y siguiente | Comunicar varias cosas sin sumar altura ni movimiento; es `BAN-P2` sin temporizador | uso | no elegida (usuario, 2026-10-11); era la recomendada |
| `BAN-P4` | Con 2 o más mensajes para la pantalla, se apilan, cada uno con su × y su regla de reaparición | Comunicar varias cosas sin esconder ninguna ni sumar mecanismo | uso | no elegida (usuario, 2026-10-11) |
