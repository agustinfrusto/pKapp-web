# Banners · ficha 1.3

| Campo | Valor |
|---|---|
| Superficie | Tres avisos de las pantallas de entrada: banner de banco reducido (`BancoReducidoBanner`, `src/screens/HomeScreen.js:122`), nota del creador (`AboutBanner`, `src/screens/MateriaSelectScreen.js:67`; desde 3.14, la región de avisos `src/components/RegionAvisos.js` con la lista `src/avisos/avisos.js`: hoy tres mensajes) y nota de privacidad (`HomeScreen.js:107`). Además, fuera de React, el aviso de navegador interno de Instagram (`scripts/inject-pwa.js`): sección «Aviso de navegador interno», al final (`REV-6`) |
| Boceto | Sin figura: el boceto no dibuja estos avisos. La ficha usa la «nota» de `Quiz.md` b (borde izquierdo de acento, rótulo mono con glifo) y la extiende a dos avisos informativos |
| Comunes | `comun.md`: §5 estados (K2, K7), §7 anchos, §8 dimensiones, §9 glifos |
| Lo usan | `Home` (banco reducido y privacidad) y `MateriaSelect` (región de avisos de 3.14: en producción, desde el 2026-10-12, tres mensajes «Nota de pKapp» en el carrusel `BAN-P2`) |
| Variantes | Banco reducido solo en materias con `bancoReducido` (hoy `cyr` y `neuro`); región de avisos: cada mensaje visible o descartado (reaparece a los siete días por su propia clave), con uno vigente la nota sola y con dos o más el carrusel `BAN-P2` (3.14.6; en producción, tres); privacidad solo en web |
| Fuera de alcance | La lámina, la tarjeta de materia y la lista de acciones (`MateriaSelect.md`, `Home.md`) |
| Propuestas | Sección f: `BAN-P1`, aprobada (usuario, 2026-10-10). Sección h: conservado de main (D10). Comunes: `COMUN-P2`. Sección «3.14»: varios mensajes, `BAN-P2` aprobada (usuario, 2026-10-11) y `BAN-P3` y `BAN-P4` no elegidas. Sección «Aviso de navegador interno», al final: `REV-6` de la revisión 5.0b, aprobada (usuario, 2026-10-12) |
| Escritorio | Sección «Escritorio», al final: propuesta `ESC-P11`, aprobada (usuario, 2026-10-11). Rige desde el corte `escritorio`; bajo el corte rige a.4 |

---

## a. Layout a 390 px

### a.1 Posición en cada pantalla

Los lugares los fijaron las fichas de 1.2; esta ficha da el interior.

| Pantalla | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| Home | Banner de banco reducido (bloque 3 de `Home.md` a.1) | `paso 3` | `paso 5` | — | Solo si `materia.bancoReducido`; sigue visible (D6) |
| MateriaSelect | Región de avisos (bloque 3 de `MateriaSelect.md` a.1; 3.14, hoy tres mensajes en el carrusel `BAN-P2`) | — | `paso 5` | `paso 3` | Condicional (solo con mensajes vigentes); debajo de la lámina y encima de la lista |
| Home | Nota de privacidad (bloque 6 de `Home.md` a.1) | `paso 6` | `paso 6` | — | Solo web; centrada |
| Toda la app, fuera de React (web) | Aviso de navegador interno (`scripts/inject-pwa.js`, bloque `AVISO` y `SALIR_SCRIPT`; sección «Aviso de navegador interno» de esta ficha, `REV-6`) | — (lámina fija, anclada abajo) | `paso 5` | `paso 5` más área segura inferior | Solo dentro del navegador interno de Instagram (por `userAgent`; con Facebook no se pinta: decisión del Ingeniero, 2026-10-12), 1,5 s después de cargar y si la salida automática (`intent://` en Android, `instagram://extbrowser` en iOS) no funcionó; no vuelve en la sesión tras cerrarlo (`sessionStorage`). Lámina Plancha flotante con marcas de esquina (`comun.md` §6), ancho máximo `columna`, en el tema guardado de la app: rótulo mono con `glifo-externo`, título, explicación, K1 «Abrir en tu navegador», K2 «Copiar link» (estados copiado y error), nota al pie y cerrar K7 con `glifo-cerrar` |

### a.2 Interior de la nota (banco reducido y cada mensaje de la región de avisos)

Cuerpo con relleno `paso 3.5` en las cuatro caras.

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Encabezado | Fila; glifo chico y rótulo separados `paso 1.5`; margen inferior `paso 2`. En los mensajes descartables (hoy los tres de la región), el rótulo deja libre `paso 11` a la derecha y la fila reserva el alto del objetivo de descartar: alto mínimo `paso 8`, que sumado al relleno superior `paso 3.5` supera `paso 11`, de modo que el texto arranca bajo el objetivo y ninguna parte de este pisa la primera línea (D10, CD-10; `MAQUETA-P4`) | Glifo y rótulo |
| 2 | Descartar (solo mensajes descartables; hoy los tres de la región) | Objetivo `paso 11` por `paso 11`, en la esquina superior derecha del cuerpo, a ras del marco; glifo grande centrado | `glifo-cerrar` |
| 3 | Texto | Párrafos separados por `paso 3` | Mensaje |
| 4 | Contacto (`BAN-P1`; banco reducido y los mensajes con `contacto`, hoy `aviso-contenido`) | Margen superior `paso 3`; alto `paso 11`; ancho por contenido; relleno horizontal `paso 4` | K2 de acento con `glifo-correo` |

### a.3 Interior de la nota de privacidad

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Texto | Centrado; dos oraciones, con salto de línea entre ellas | Aviso de almacenamiento local y analítica anónima |

### a.4 Otros anchos (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | Las notas llenan la columna; la de privacidad queda centrada dentro de la columna |
| 1280 px (desde 1024 px) | Sección «Escritorio» de esta ficha (`ESC-P11`, aprobada): La de la pantalla que los aloja (`comun.md` §7.2) | Igual | Región de avisos y banner en la región lateral de su pantalla; la nota de privacidad, al pie de la principal |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` (privacidad: `paso 6`) | — | Sin scroll horizontal. El rótulo salta de línea sin pasar bajo el objetivo de descartar; el contacto salta de línea dentro del botón si el correo no entra |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Nota (cuerpo) | — | `superficie` | Izquierdo `acento`, `border-l-3`; resto `filete`, `border` | — | — | — | N18, X2 |
| Rótulo «Banco más reducido» | `acento` | `superficie` | — | `rotulo` | — | `glifo-banco-reducido` (chico), delante | T6, N18 |
| Rótulo «Nota de pKapp» (único rótulo de los mensajes de la región: D11 «Voz») | `acento` | `superficie` | — | `rotulo` | — | `glifo-mensaje` (chico), delante; el mismo en los tres mensajes (e, 3.14.9) | T6, N18 |
| Descartar (K7) | `tintaSec` | `superficie` | — | — | — | `glifo-cerrar` (grande) | N20 |
| Texto de la nota | `tinta` | `superficie` | — | `cuerpo` | — | — | T2 |
| Contacto (K2, acento, `BAN-P1`) | `acento` | `superficie` | `acento`, `border` | `cuerpo-fuerte` | — | `glifo-correo` (chico), delante del texto | T6, N18 |
| Nota de privacidad | `tintaSec` | `fondo` | — | `detalle` | — | — | T3 |

Los mensajes de la región de avisos y el banner de banco reducido son el mismo componente con otro rótulo y otro glifo: no se distinguen por color, sino por rótulo y glifo (`comun.md` §9). Los glifos del rótulo van con texto: decorativos, ocultos a lectores (`aria-hidden`, `accessibilityElementsHidden`). El glifo de descartar va solo y lleva nombre accesible (e). Todo control mide al menos `paso 11` de alto y de ancho, con `paso 2` como mínimo entre controles adyacentes.

---

## c. Matriz de estados

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado |
|---|---|---|---|---|---|---|
| Banner de banco reducido | Estático (no es un control) | — | — | — | — | — |
| Contacto (K2, acento) | Borde, texto y glifo `acento`; fondo `superficie` | Contorno web `acento`, `border` | Inversión: fondo `tinta`; texto y glifo `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — |
| Mensaje de la región | Estático, salvo descartar y, en `aviso-contenido`, el contacto | — | — | — | — | — |
| Descartar (K7) | Glifo `tintaSec` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; glifo `fondo` | Contorno `foco` | — | — |
| Nota de privacidad | Estática | — | — | — | — | — |

| Estado | Condición | Qué se ve |
|---|---|---|
| Banner visible | `materia.bancoReducido` en verdadero | La nota completa; no se puede descartar |
| Banner ausente | Materia sin `bancoReducido` | Nada: el bloque 4 de `Home.md` sube sin dejar hueco |
| Mensaje visible | Sin marca en su clave o con siete días o más desde ella (`reaparece: 7`) | El mensaje completo con descartar; con dos o más vigentes, dentro del carrusel `BAN-P2` (3.14.6) |
| Mensaje oculto | Descartado hace menos de siete días | Nada; descartados los tres, la región desaparece y la lista de materias sube sin dejar hueco |
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
| Marca de visto de cada mensaje | `localStorage`, la `clave` del mensaje (D11): `pkapp_aviso_nueva-estetica_visto`, `pkapp_about_seen_at_v3` (`nota-del-creador`; hasta el 2026-10-12, `pkapp_about_seen_at_v2`) y `pkapp_aviso_aviso-contenido_visto` | Valor `Date.now()` como cadena, escrito al descartar; cada clave es independiente de las otras |
| Intervalo de reaparición | `reaparece: 7` en cada mensaje (D11) | El mensaje reaparece cuando pasaron siete días o más desde su marca |
| Visibilidad de los mensajes | `avisosVigentes` en el inicializador de `useState`, antes del primer pintado (3.14.10, D11) | Visible si no hay marca o venció el intervalo; sin `localStorage`, nada está descartado |
| Nota de privacidad | `Platform.OS === 'web'` | Solo web |

### d.2 Invariantes

| Invariante | Detalle |
|---|---|
| Banco reducido visible (D6) | El banner mantiene su lugar entre la tarjeta de materia y la lista de acciones; no se descarta ni se pliega |
| Reaparición semanal | Descartar guarda la marca en la clave del mensaje; cada uno vuelve a los siete días. La ficha no cambia el intervalo; la clave de `nota-del-creador` pasó a `pkapp_about_seen_at_v3` el 2026-10-12 (D11) para que el texto nuevo lo vea también quien había descartado el anterior |
| Un gesto descarta | Un toque en descartar la oculta; no hay confirmación |
| Orden y ubicación | Los tres avisos conservan el lugar que fijan `Home.md` y `MateriaSelect.md` (D10) |
| Copy | Los textos del banner y de la privacidad son los de `main`; los de los mensajes de la región los aprueba el usuario (e; D11 «Voz», 2026-10-12) y viven en `src/avisos/avisos.js` |
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
| Mensajes de la región, rótulo | Emoji de saludo y «Una nota del creador» (`main`; en `rediseno`, «Una nota del creador» con `glifo-mensaje` hasta la 5.0b) | «Nota de pKapp» con `glifo-mensaje`, en los tres mensajes; el paso lo muestra en mayúsculas | Reemplazo de emoji; rótulo único en la voz de pKapp (D11 «Voz», usuario, 2026-10-12) |
| Mensaje 1, `nueva-estetica`, texto | — (nuevo el 2026-10-12) | «¡Hola! Soy pKapp y estrené una nueva estética. No sean malos conmigo: las apps también queremos cambiar de look a veces.» | Copy del usuario, aprobado el 2026-10-12 en la voz de pKapp (D11 «Voz»); vive en la lista de mensajes (`src/avisos/avisos.js`): `materias`, descartable, reaparece a los siete días |
| Mensaje 2, `nota-del-creador`, texto | «¡Hola! Ya están las seis materias. Ahora estoy trabajando en la estética de la página, así que en las próximas semanas vas a ir viendo cambios en el diseño. ¡Gracias por la paciencia!» (texto de `main` desde el commit `6dbb47a`, 1.7.3, y del mensaje hasta la 5.0b; antes, «Estoy sumando las materias que faltan…») | Dos párrafos: «Mi creador lleva meses trabajando en mí. Fue un trabajo arduo y ya me usaron más de 7000 personas: ¡fue una sorpresa para los dos!» y «¡Gracias a todos los que donaron! Sigo gratis y sin publicidad gracias a sus donaciones y aportes.» | Copy del usuario, aprobado el 2026-10-12 (D11 «Voz»); conserva el `id` (`testID`) y pasa a la clave `pkapp_about_seen_at_v3` para que lo vea todo el mundo |
| Mensaje 3, `aviso-contenido`, texto | — (nuevo el 2026-10-12) | «Mi creador es informático, no del área de la salud, así que puedo tener errores en las explicaciones: se generan analizando material de estudio público con ayuda de IA. Sus aportes serán recibidos en este correo:» y, debajo, el botón de contacto (`BAN-P1`) con `pkappsoporte@gmail.com` | Copy del usuario, aprobado el 2026-10-12 (D11 «Voz»); con él son tres mensajes en `materias`, el tope de D11, y la región muestra el carrusel `BAN-P2` |
| Descartar | Símbolo de cruz | `glifo-cerrar`; nombre accesible «Cerrar nota» | Reemplazo de símbolo; cadena accesible nueva, no visible |
| Contacto (`BAN-P1`) | Correo subrayado dentro de la oración (banner) | Botón con `glifo-correo` y el correo; nombre accesible «Escribir a pkappsoporte@gmail.com». También en el mensaje `aviso-contenido` (campo `contacto` de D11), debajo de su párrafo | `BAN-P1` |
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
| Región de avisos (MateriaSelect; hoy tres mensajes) | Lateral, debajo de la lámina, a `paso 3` | Ancho `lateral`; descartar de `paso 11` en la esquina, a ras del marco |
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
| Prototipo | `diseno/banners/banners.html`, generado por `generar-banners.mjs` desde `plancha`, los glifos reales y los datos reales: `BAN-P2` funcionando, en claro y en oscuro, a 320, 390 y 1366 px (región lateral de `ESC-P1` y `ESC-P2`), más la lámina de estados. El primer mensaje es el texto de la nota del creador vigente el 2026-10-11 (anterior a los tres mensajes de producción de e y 3.14.9); los otros dos son de muestra |
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

Alturas en px, en claro. «Nota sola» es lo que medía la nota del creador en ese ancho antes de la 5.0b, con el texto del 2026-10-11.

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
| Uno solo | 1 nota vigente | La nota de a.2, sin pie, sin contador y sin roles de carrusel; con × si es descartable. Idéntica a la nota sola de `main` (D10); en producción se llega a él al descartar dos de los tres mensajes |
| Varios, avanzando | 2 o más, sin pausa, sin movimiento reducido | Nota activa y pie con «Pausar», contador y anterior y siguiente; `aria-live` en `off` |
| Varios, suspendido | Puntero encima | Igual que avanzando; no avanza. Al salir, espera completa |
| Pausado | Se pulsó «Pausar», se tomó el control manual o el foco de teclado entró | El botón dice «Reanudar» con `glifo-reanudar`; no avanza; `aria-live` en `polite` |
| Vuelta terminada | Se llegó a la última nota | Nota activa y pie sin «Pausar», con contador y anterior y siguiente; `aria-live` en `polite` |
| Movimiento reducido | `prefers-reduced-motion: reduce` | Como «Vuelta terminada», desde el primer cuadro: sin avance, sin fundido, sin «Pausar» |
| Descartado uno de varios | El usuario cierra una | Renumera («2 de 2»); el foco pasa a la nota que ocupa su lugar (la siguiente; si era la última, la anterior). Con una sola restante, vuelve «Uno solo» |
| Último descartado | El usuario cierra la última vigente | La región desaparece sin dejar hueco, como «Mensaje oculto» (c). El foco pasa al primer control que sigue en el DOM: la primera tarjeta de materia en MateriaSelect y la primera acción en Home |
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

Cadenas nuevas: «Pausar», «Reanudar» y «n de N» (visibles) y los nombres accesibles de arriba. «Cerrar nota» y el `testID` `nota-del-creador` se conservan: los usa la e2e (`materias.js`, `comunes.js`, `avisos.js`). Los `testID` de los otros dos mensajes de producción son sus `id`, `nueva-estetica` y `aviso-contenido` (3.14.9).

| Situación | Lo que oye quien usa lector (indicativo) |
|---|---|
| Entra con Tab | «Cerrar nota, botón»; luego, según la nota, el contacto; «Pausar avisos, botón»; «Nota anterior, botón»; «Nota siguiente, botón» |
| Recorre con el cursor virtual | «Avisos, región, carrusel»; «nota, 1 de 3, grupo»; el rótulo; el texto; los controles |
| La nota cambia sola (`BAN-P2`) | Nada: `aria-live` en `off` |
| Pulsa «Nota siguiente» | `polite`: «nota, 2 de 3, Nota de pKapp, Mi creador lleva meses trabajando en mí…» (`BAN-Q1`, cerrada en D11; con los mensajes de producción de e) |
| Pulsa «Pausar avisos» | El foco queda en el botón; al leerlo dice «Reanudar avisos» |
| Cierra una de varias | El foco pasa a la nota que ocupa su lugar: «nota, 1 de 2, grupo…» |
| Cierra la última | El foco pasa al primer control que sigue: «{materia}, botón» |
| Una sola nota | Como la nota sola («Uno solo», 3.14.6): el rótulo, el texto y «Cerrar nota, botón» |

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
| Nota del creador | **Sí**: es el mensaje `nota-del-creador` (en el prototipo, `nota-creador`) | Es lo que el sistema generaliza: texto del usuario, descartable con un toque, reaparece a los siete días, en MateriaSelect | MateriaSelect, debajo de la lámina (a.1); en escritorio, región lateral (`ESC-P11`) | Siete días, un toque descarta, `Cerrar nota`, `nota-del-creador`. Lo que sí cambió el 2026-10-12 (D11 «Voz»): el texto y el rótulo (e) y la clave, de `pkapp_about_seen_at_v2` a `pkapp_about_seen_at_v3` |
| Banner de banco reducido | **No: queda aparte**, con el mismo componente visual | D6 y la spec `design-system` («Distinciones de contenido siempre visibles»): siempre visible y sin descartar. Dentro de un conjunto que rota o se pagina dejaría de verse 2 de cada 3 veces. Además depende de `materia.bancoReducido` (metadata), no de la lista de mensajes | Home, entre la tarjeta de materia y las acciones (a.1) | Texto, contacto en botón, `glifo-banco-reducido`, sin ×, `home-banco-reducido` |
| Nota de privacidad | No | Pie estático de la principal, solo en web; no compite por atención | Al pie de la principal (`ESC-P11`) | Todo |

Mensajes en producción desde el 2026-10-12 (alineación con la implementación de la 5.0b; textos aprobados por el usuario en la voz de pKapp de D11 «Voz», citados en e). Son tres en `materias`, el tope de D11: la región de MateriaSelect muestra el carrusel `BAN-P2` desde el primer cuadro; en Home no hay mensajes.

| Orden | `id` (`testID`) | Rótulo | Glifo | Contacto | Clave del descarte | Pantallas | Descarte | Palabras y espera (fórmula de 3.14.3; cuenta el rótulo) |
|---|---|---|---|---|---|---|---|---|
| 1 | `nueva-estetica` | «Nota de pKapp» | `glifo-mensaje` | — | `pkapp_aviso_nueva-estetica_visto` (la de por defecto) | `materias` | Descartable; reaparece a los siete días | 24: 12,4 s |
| 2 | `nota-del-creador` | «Nota de pKapp» | `glifo-mensaje` | — | `pkapp_about_seen_at_v3` | `materias` | Descartable; reaparece a los siete días | 45: 19,7 s |
| 3 | `aviso-contenido` | «Nota de pKapp» | `glifo-mensaje` | `pkappsoporte@gmail.com` (`BAN-P1`) | `pkapp_aviso_aviso-contenido_visto` (la de por defecto) | `materias` | Descartable; reaparece a los siete días | 39: 17,6 s |

La vuelta hasta quedar en el tercero tarda 32,1 s (con los tres del prototipo eran 27 s). Un solo glifo para los tres (decisión del Diseñador, 2026-10-12): el glifo del rótulo marca el género del bloque, no su tema, y «Nota de pKapp» es un único rótulo, así que lleva un único glifo, el globo de diálogo que dice «habla pKapp»; `glifo-explicacion` (la bombilla) es el marcador de «Nota / Explicación» (`comun.md` §9: dato adicional sobre una pregunta) y en el carrusel haría leer a `aviso-contenido` como una explicación en vez de como una nota de la app. Queda en el inventario de D11 para un mensaje de otro género; con el rótulo único de D11 «Voz», hoy ningún mensaje lo usa.

| Pantalla | Orden en teléfono | Orden en escritorio |
|---|---|---|
| MateriaSelect | HeaderMarca, lámina, **avisos** (1 a 3; hoy 3, el carrusel `BAN-P2`), lista de materias | Lateral: lámina y **avisos**. Principal: rejilla y pedido de donación |
| Home | HeaderMarca, tarjeta de materia, banner de banco reducido (si la materia lo tiene), **avisos** (si hay mensajes para Home; hoy ninguno), «Plano / Acciones» | Lateral: tarjeta, banner y **avisos**. Principal: acciones y nota de privacidad |

| Consecuencia | Detalle |
|---|---|
| Mensajes en Home | En un teléfono de 390 px, con banco reducido, un mensaje en Home baja las acciones de y = 455 a y = 625 (+170) y dos mensajes, a y = 698 (+243). La ficha lo admite; conviene reservarlo para lo que valga esa altura |
| Contextual por materia | Un aviso solo de una materia dentro del sistema pediría un campo `materias`; no se pide ahora. El banco reducido se resuelve aparte y no lo necesita |

### 3.14.10 Datos: el contrato es `design.md` D11

El contrato de datos lo fija `design.md` D11: la lista `AVISOS` en `src/avisos/avisos.js`, `validarAvisos` en el build (tipos, valores cerrados, ids únicos, fechas y como máximo 3 avisos vigentes a la vez por pantalla) y `avisosVigentes`, pura y síncrona, en el inicializador de `useState`. Esta ficha no repite los campos.

| Pedido de la primera pasada | Dónde quedó en D11 |
|---|---|
| `clave` opcional | Campo `clave`; la nota del creador usó `pkapp_about_seen_at_v2` (D10) y desde el 2026-10-12 usa `pkapp_about_seen_at_v3` (D11); los otros dos mensajes, la clave por defecto `pkapp_aviso_<id>_visto` |
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
| Texto de una nota a 320 px | Hasta 6 líneas (nota del creador con el texto del prototipo del 2026-10-11); a 390 px, 4. Con los textos de producción de e el conteo cambia; la reserva de alto no depende de él (3.14.2) |
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

---

## Aviso de navegador interno · `REV-6` aprobada (usuario, 2026-10-12)

| Campo | Valor |
|---|---|
| Estado | **`REV-6` aprobada** (usuario, 2026-10-12; `CONVENCIONES.md` C2; `tasks.md` 5.0b.6). Propuesta de `diseno/revision-5.0b.md` §3 y §3.4 sobre el diseño de `.orca/reports/aviso-navegador-diseno.md` (2026-10-11, verificado en Chrome headless en siete anchos). Esta sección es la fuente para el Programador: el reporte no se versiona y la ficha prevalece (G-1) |
| Dónde vive | `scripts/inject-pwa.js`: bloque `AVISO` (copy y CSS) y `SALIR_SCRIPT` (lógica), inyectados en `index.html` antes del bundle, para todos los visitantes. Fuera de React y de NativeWind: CSS en línea con variables, sin clases Tailwind; los hex se leen de `plancha` al generar el HTML, como el meta `theme-color` |
| Cuándo se pinta | Solo con `userAgent` de Instagram (decisión del Ingeniero, 2026-10-12: con Facebook, `FBAN`, `FBAV` o `FB_IAB`, no se pinta, porque ahí «Abrir en tu navegador» no tiene mecanismo); 1,5 s después de cargar, si `document.visibilityState` sigue `visible` (la salida automática no funcionó); no si `sessionStorage['pkapp-salir-cerrado']` existe ni si ya hay `#pkapp-salir`. La salida automática previa (`intent://` en Android, `instagram://extbrowser` en iOS) y su marca de sesión son lógica de `SALIR_SCRIPT` que esta ficha no cambia; qué conserva con Facebook lo fija la spec del Ingeniero |
| Qué cambia respecto del marcador de posición (hasta la 5.0b) | Hoja a sangre con filete superior, fuente del sistema de 16 px, botones de borde `acento` («Abrir» relleno `acento`), «Link copiado» como texto suelto, «✕» de texto y `prefers-color-scheme` → lámina Plancha flotante con marcas de esquina, K1/K2/K7, rótulo mono con `glifo-externo`, explicación, `glifo-cerrar`, estados copiado y error en el propio botón, y el tema guardado de la app |
| Ajustes a la propuesta del reporte (`revision-5.0b.md` §3.4) | Margen lateral e inferior `paso 5` (20 px), no 16: rige `comun.md` §7, no el margen de `main` (H5). Tema desde el tema guardado de la app, no desde `prefers-color-scheme` (H1): la app no sigue al sistema. Solo Instagram (H3) |
| Sin cambio (ya implementado en `rediseno`; lo afirma `tools/e2e/suites/navegador.js`) | Nombre accesible por `aria-labelledby` al título; el foco entra al aviso al abrirse (`tabIndex = -1`) y vuelve al elemento anterior al cerrarlo; Escape cierra; `role="dialog"` sin `aria-modal` (no es modal); los botones son `<button>`; cerrar con `aria-label="Cerrar"`; `<input readonly>` con el link como respaldo si la copia falla; `role="status"` en el texto que cambia |
| Pendiente de dispositivo (no se fijan valores sin él) | H2: el rótulo del menú «⋯» de Instagram en iOS no está verificado; por eso `manual` no lo cita. H8: iPhone real con el WKWebView de Instagram (`:active`, que `instagram://extbrowser` abra Safari, `env(safe-area-inset-bottom)`, `ui-monospace`). Cuando haya captura, el Diseñador fija la variante de `manual` |
| Peso | +1,05 KB gzip en `index.html` (reporte §10: 4 322 B / 1 634 B gzip el objeto `AVISO`, contra 1 205 / 583 del marcador; solo el CSS, 3 233 / 1 139). Fuera del bundle JS y CSS; si cuenta en D5 lo decide el Ingeniero |

### Ubicación y forma

| Decisión | Valor | Por qué (una línea) |
|---|---|---|
| Forma | Lámina flotante anclada abajo, no modal: sin velo, sin trampa de foco, no bloquea el scroll ni el uso de la app | Sugiere; la app sí funciona dentro de Instagram. Una hoja a sangre recortaría las marcas de esquina con el borde del viewport; a pantalla completa sería un muro |
| Posición | `position: fixed`, fuera del flujo; `#root` no cambia de tamaño. Tapa el pie de la app hasta que se cierra (H4 del reporte, aceptado) | No participa del layout de React Native Web |
| Margen lateral e inferior | `paso 5` (20 px); el inferior suma `env(safe-area-inset-bottom, 0px)` | `comun.md` §7 (margen lateral de pantalla) y §5.1 (área segura inferior) |
| Ancho máximo | `columna` (448 px), centrada con `margin: 0 auto` | Mismo token que la columna de contenido (`tokens.md` c.3) |
| Marco | 1 px `linea`; cuatro marcas de esquina de 8 × 8 (`paso 2`), `border-2` `linea` en los dos lados externos, que sobresalen `paso 1` del marco | `comun.md` §6; CD-22; decorativas (`aria-hidden`) |
| Radios, sombras, gradientes, transparencias | Ninguno | D9; `tokens.md` a.2 y c.1 |
| Animación | Ninguna: aparece y desaparece en el mismo cuadro | Cero CSS extra; sin salto de layout; no es una superficie de React y no entra en `REV-1` |
| Hover | No definido | Solo se pinta en navegadores internos táctiles: se omiten las reglas `@media (hover: hover)` de K1, K2 y K7 |
| Capa | `z-index: 2147483647` | Por encima de todo lo que pinte React |

### Layout y medidas (390 px)

```
 ┌                                       ┐   marcas: 8×8, border-2 linea, sobresalen 4 px del marco
   [ext] NAVEGADOR DE INSTAGRAM        [×]    rótulo 11/16 mono + glifo-externo · cerrar 44×44 a ras del marco
   Abrí pKapp en tu navegador                 título 16/22 SemiBold
   Así guardás tu progreso y podés            explicación 15/22 tintaSec
   instalarla.
   [ Abrir en tu navegador ] [ Copiar link ]  K1 | K2, alto 44, separación 8 (una fila cuando el contenido lo permite)
   ───────────────────────────────────────    filete 1 px
   Si no se abre, tocá ⋯ y elegí abrirla…     nota 13/18 tintaSec
 └                                       ┘   marco 1 px linea · relleno 14 · margen 20 a los bordes
```

| Elemento | Valor | Paso Plancha |
|---|---|---|
| Lámina | `position: fixed; left: 20px; right: 20px; bottom: calc(20px + env(safe-area-inset-bottom, 0px)); max-width: 448px; margin: 0 auto; box-sizing: border-box` | `paso 5`, `columna` |
| Cuerpo | Fondo `superficie`; borde 1 px `linea`; relleno 14 px en las cuatro caras; `font: 400 15px/22px` de la pila sans; `text-size-adjust: 100%` | `paso 3.5`, `cuerpo` |
| Marcas de esquina | Cuatro `<i aria-hidden>` de 8 × 8, `position: absolute`, `top/bottom/left/right: -5px` (4 px fuera del marco más el borde de 1 px), `border: 0 solid linea` con `border-width` de 2 px solo en los dos lados externos (`2px 0 0 2px`, `2px 2px 0 0`, `0 0 2px 2px`, `0 2px 2px 0`); `pointer-events: none` | `paso 2`; sobresalen `paso 1` |
| Encabezado | Fila (`display: flex; align-items: center`); `glifo-externo` de 16 px y rótulo separados 6 px; alto mínimo 32 px; margen inferior 8 px; `padding-right: 44px` para que el título nunca pase bajo el objetivo de cerrar | `paso 1.5`, `paso 8`, `paso 2`, `paso 11` |
| Rótulo | Plex Mono 11/16, espaciado +0,66 px, mayúsculas por CSS (`text-transform: uppercase`), `acento` | `rotulo` |
| Título | Plex Sans SemiBold 16/22, `tinta`; lleva el `id` que nombra el diálogo (`aria-labelledby`) | `item` |
| Explicación | Plex Sans 15/22, `tintaSec`; margen superior 4 px | `cuerpo`, `paso 1` |
| Fila de botones | Margen superior 12 px; separación 8 px; `flex-wrap: wrap` | `paso 3`, `paso 2` |
| K1 «Abrir en tu navegador» y K2 «Copiar link» | Alto mínimo 44 px; relleno `0 16px`; Plex Sans SemiBold 15/22; `white-space: nowrap`; `min-width: 116px`; K1 `flex: 2 1 auto`, K2 `flex: 1 1 auto`; `touch-action: manipulation`; sin resaltado de toque del sistema | `paso 11`, `paso 4`, `cuerpo-fuerte` |
| Cerrar (K7) | 44 × 44 px, `position: absolute; top: 0; right: 0`, a ras del marco; `glifo-cerrar` de 24 px centrado; sin relleno ni borde | `paso 11`; glifo grande `paso 6` |
| Nota | Margen superior 12 px; borde superior 1 px `filete`; `padding-top: 12px`; Plex Sans 13/18, `tintaSec`. Es el párrafo con `role="status"`: su texto cambia tras copiar y tras un error | `paso 3`, `detalle` |
| Link de respaldo (`<input readonly>`, solo tras un error de copia) | Margen superior 8 px; ancho completo; alto mínimo 44 px (es un control: D10); relleno horizontal 12 px; fondo `fondo`; borde 1 px `filete`; Plex Sans 13/18, `tinta`; recibe el foco y queda seleccionado al mostrarse; oculto (`hidden`) en reposo | `paso 2`, `paso 11`, `paso 3`, `detalle` |
| Trazo de los glifos | `stroke-width` = 1,5 × 16 / lado (`tokens.md` c.2, CD-9): cerrar a 24 px, `1`; externo a 16 px, `1.5`. Extremo cuadrado, unión `miter`, límite 2; `currentColor`; `aria-hidden` y `focusable="false"` | `comun.md` §8 y §9 |

Sin radios, sombras, gradientes, transparencias, cursiva ni subrayado en ningún descendiente (`#pkapp-salir * { border-radius: 0; box-shadow: none }`).

### Tipografía y pila de respaldo

| Rol | Paso | Familia registrada | Tamaño/alto | Peso CSS | Color |
|---|---|---|---|---|---|
| Rótulo | `rotulo` | `PlexMono-Regular` | 11/16, +0,66 px, mayúsculas | 400 | `acento` |
| Título | `item` | `PlexSans-SemiBold` | 16/22 | 600 | `tinta` |
| Explicación | `cuerpo` | `PlexSans-Regular` | 15/22 | 400 | `tintaSec` |
| Botones | `cuerpo-fuerte` | `PlexSans-SemiBold` | 15/22 | 600 | Según control |
| Nota y link de respaldo | `detalle` | `PlexSans-Regular` | 13/18 | 400 | `tintaSec` / `tinta` |

| Pila | Valor |
|---|---|
| Sans (400) | `"PlexSans-Regular", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Sans (600) | `"PlexSans-SemiBold", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Mono | `"PlexMono-Regular", ui-monospace, "SF Mono", Menlo, Consolas, "Roboto Mono", "Courier New", monospace` |

El nombre registrado va primero: cuando el `@font-face` de la app ya cargó, el aviso toma Plex sin tocarse; antes, y en WebViews viejos, cae a la pila del sistema (la de `tokens.md` d.1, extendida con nombres para WebViews). El peso se declara en CSS (600) porque el sistema no lo da por la familia. Sin precarga de woff2 (opción A del reporte §6: 0 B; la B, solo `PlexMono-Regular.woff2` de 10 088 B en la rama de Instagram, la decide el Ingeniero; la C y el `preload` global, descartadas).

### Tokens y tema

Variables CSS en `#pkapp-salir`; el bloque oscuro solo las redefine. Los hex se leen de `plancha` al generar el HTML.

| Token Plancha | Variable | Claro | Oscuro | Uso en el aviso |
|---|---|---|---|---|
| `fondo` | `--fo` | `#f4f5f6` | `#0b0d10` | Texto de K1 y de las inversiones; fondo del link de respaldo |
| `superficie` | `--su` | `#ffffff` | `#12161b` | Cuerpo de la lámina; fondo de K2 y de K1 presionado |
| `tinta` | `--ti` | `#14181d` | `#e6e9ed` | Título; relleno de K1; relleno de K2 y de cerrar presionados; texto del link de respaldo |
| `tintaSec` | `--ts` | `#4a525c` | `#98a2ae` | Explicación, nota, `glifo-cerrar` |
| `linea` | `--li` | `#14181d` | `#c9d0d8` | Marco, marcas de esquina, borde de K2 |
| `filete` | `--fi` | `#b9bfc6` | `#2b323a` | Divisor de la nota; borde del link de respaldo |
| `acento` | `--ac` | `#0b6e80` | `#5cc3d6` | Rótulo, `glifo-externo`, K2 copiado |
| `foco` | `--fc` | `#095c6b` | `#7fd6e3` | Contorno de foco: 2 px, separado 2 px |
| `error` | `--er` | `#a32424` | `#f08c8c` | K2 en estado de error de copia |

| Tema | Regla |
|---|---|
| Fuente del tema | El tema guardado de la app: campo `tema` del objeto JSON de `localStorage['pkapp_settings']` (`src/db/database.web.js:9`). `'oscuro'` → variables oscuras; `'claro'`, clave ausente, inválida o `localStorage` inaccesible → claro, el tema por defecto de la app (`src/theme/TemaContext.js`, `POR_DEFECTO`) |
| Mecanismo | Las variables oscuras cuelgan de la clase `o` en `#pkapp-salir` (`#pkapp-salir.o { … }`), que `SALIR_SCRIPT` pone al crear el nodo si leyó `'oscuro'`; **no** de `@media (prefers-color-scheme: dark)`. La app no sigue al sistema (H1): con `prefers-color-scheme` un celular en oscuro vería la lámina oscura sobre una app clara |
| Qué se ve | Lámina en el mismo tema que la app que tapa. Es esperable que un visitante que llega desde Instagram no tenga la clave (almacenamiento aparte del navegador real): ve claro, igual que la app |

### Matriz de estados

Celdas «claro / oscuro». Sin hover (solo táctil). Presionado = `:active`; foco = `:focus-visible`.

| Componente | Estado | Fondo | Borde | Texto o glifo | Notas |
|---|---|---|---|---|---|
| Lámina | Reposo | `superficie` | 1 px `linea` | `tinta` | Cuatro marcas `linea`; el contenedor recibe el foco al abrirse sin contorno (`#pkapp-salir:focus { outline: 0 }`: foco programático, no de teclado) |
| Rótulo y `glifo-externo` | Reposo | — | — | `acento` | Decorativos (`aria-hidden`) |
| K1 «Abrir en tu navegador» | Reposo | `tinta` | 1 px `tinta` | `fondo` | T7 |
| K1 | Presionado | `superficie` | 1 px `linea` | `tinta` | Inversión a `superficie` (regla 2.9-1 de `comun.md` §5.2) |
| K1 | Foco | = reposo | Contorno 2 px `foco`, separado 2 px | = reposo | N8 |
| K1 | Hover, deshabilitado, cargando | n/a | n/a | n/a | Sin hover táctil; nunca se deshabilita; `instagram://` no emite señal observable: la nota cubre «si no se abre». Si el UA de Instagram no es Android ni iOS, K1 no se crea (no hay mecanismo) y K2 toma la fila |
| K2 «Copiar link» | Reposo | `superficie` | 1 px `linea` | `tinta` | T2, N2 |
| K2 | Presionado | `tinta` | 1 px `tinta` | `fondo` | Inversión |
| K2 | Copiado (clase `k`) | `superficie` | 2 px `acento` | `acento` | Etiqueta «Copiado»; variante de acento de K2 (T6, N18); 2 px = estado (`tokens.md` c.2); permanente hasta cerrar |
| K2 | Error de copia (clase `n`) | `superficie` | 2 px `error` | `error` | Etiqueta sin cambio; T15, N13; el texto del error va en la nota y aparece el link de respaldo |
| Cerrar (K7) | Reposo | Sin relleno | — | `tintaSec` | 44 × 44 a ras del marco; nombre accesible «Cerrar»; N20 |
| Cerrar | Presionado | `tinta` | — | `fondo` | Inversión total |
| Cerrar | Foco | = reposo | Contorno 2 px `foco`, separado 2 px | = reposo | N8 |
| Nota | Reposo | — | Superior 1 px `filete` | `tintaSec` | `detalle`; texto `manual` |
| Nota | Tras copiar | — | Igual | Igual | Texto `pegar` |
| Nota | Tras un error de copia | — | Igual | Igual | Texto `aMano`; debajo, el link de respaldo |
| Link de respaldo | Error | `fondo` | 1 px `filete` | `tinta` | Con foco y seleccionado; T1, X2 |

Estado semántico sin color solo (CD-6): el copiado y el error cambian el grosor del marco (1 a 2 px) y el texto de la nota; el copiado además cambia la etiqueta.

### Copy

Voseo imperativo en título, nota y mensajes; infinitivo en botones. Sin emojis ni signos de exclamación.

| Clave de `AVISO` | Texto | Dónde | Notas |
|---|---|---|---|
| `rotulo` | `Navegador de Instagram` | Rótulo del encabezado; mayúsculas por CSS | Solo Instagram: no hace falta la variante «Navegador interno» de Facebook |
| `titulo` | `Abrí pKapp en tu navegador` | Título (`item`); nombre accesible del diálogo | Sin cambio respecto del marcador |
| `explicacion` | `Así guardás tu progreso y podés instalarla.` | Explicación (`cuerpo`) | Una oración, un beneficio |
| `abrir` | `Abrir en tu navegador` | K1 | Fijado por el brief de 2.6 y la e2e |
| `copiar` | `Copiar link` | K2 | Ídem |
| `copiado` | `Copiado` | Etiqueta de K2 en estado copiado | Más corto que «Copiar link»: no fuerza reflujo de la fila (antes, «Link copiado» como texto suelto) |
| `pegar` | `Pegalo en la barra de direcciones de tu navegador.` | Nota, tras copiar | Copiar no termina la tarea: dice el paso que sigue |
| `manual` | `Si no se abre, tocá ⋯ y elegí abrirla en tu navegador.` | Nota (`detalle`) en reposo | No cita el rótulo del menú de Instagram (H2). El «⋯» (U+22EF) no está en el subset latin de Plex: se pinta con la fuente del sistema; queda como texto porque cita el menú de Instagram, no un control de pKapp (H7) |
| `aMano` | `No se pudo copiar. Mantené presionado el link para copiarlo.` | Nota, tras un error de copia; con el link de respaldo debajo | Antes, «Copialo a mano» |
| `cerrar` | `Cerrar` | `aria-label` de K7 | La e2e lo busca por ese atributo |

Variante de `manual` si se verifica el rótulo en un iPhone (H2): `Si no se abre, tocá ⋯ y elegí «Abrir en el navegador externo».` Pendiente; no se aplica sin captura.

### Cierre y foco

| Gesto | Resultado | Persistencia |
|---|---|---|
| Abrirse | El foco entra al contenedor (`tabIndex = -1`), sin contorno; se recuerda el elemento con foco anterior | — |
| Tocar cerrar (K7) o Escape | Se quita el nodo; la app queda tal cual; el foco vuelve al elemento anterior | `sessionStorage['pkapp-salir-cerrado'] = '1'` |
| Recargar o navegar dentro de la app | No reaparece | Misma sesión |
| Abrir pKapp otra vez desde Instagram | Reaparece (WebView nuevo, `sessionStorage` vacío; sin verificar en dispositivo) | Intencional: depende del navegador, no del tiempo (la nota del creador vuelve a los siete días porque es contenido) |
| Tocar fuera de la lámina | No cierra; el toque llega a la app | Sin velo |
| Tocar «Abrir en tu navegador» o «Copiar link» | La lámina no se cierra: quien usa la app todavía necesita la nota | — |
| Volver a Instagram tras una salida exitosa | La lámina sigue ahí; sin autocierre | — |
| Tab | Orden K1, K2, link de respaldo (solo tras un error) y cerrar: el del árbol de «Estructura para el Programador» y del código (`scripts/inject-pwa.js`; decisión del Ingeniero, 2026-10-12, sobre el hallazgo 6b del análisis 5.0b.6; alineación con la implementación). Sin trampa de foco: Tab sale a la app | — |

### Contraste y objetivos táctiles

Fórmula y truncado a 2 decimales como `tokens.md` e; recalculados el 2026-10-12 desde `src/theme/colores.js`. Todos son pares existentes de E1 a E3: ningún par nuevo (CD-27).

| Par | Id | Claro | Oscuro | Mínimo | Criterio |
|---|---|---|---|---|---|
| Título: `tinta` sobre `superficie` | T2 | 17,82 | 14,91 | 4,5 | 1.4.3 |
| Explicación y nota: `tintaSec` sobre `superficie` | T4 | 7,91 | 7,01 | 4,5 | 1.4.3 |
| Rótulo y `glifo-externo`: `acento` sobre `superficie` | T6, N18 | 5,90 | 8,84 | 4,5 / 3 | 1.4.3 / 1.4.11 |
| K1: `fondo` sobre `tinta` | T7 | 16,32 | 15,97 | 4,5 | 1.4.3 |
| K1 presionado y K2 reposo: `tinta` sobre `superficie` | T2 | 17,82 | 14,91 | 4,5 | 1.4.3 |
| K2 presionado y cerrar presionado: `fondo` sobre `tinta` | T7 | 16,32 | 15,97 | 4,5 | 1.4.3 |
| K2 copiado: `acento` sobre `superficie` | T6, N18 | 5,90 | 8,84 | 4,5 / 3 | 1.4.3 / 1.4.11 |
| K2 error: `error` sobre `superficie` | T15, N13 | 7,40 | 7,64 | 4,5 / 3 | 1.4.3 / 1.4.11 |
| Borde de K2 y marco: `linea` sobre `superficie` | N2 | 17,82 | 11,67 | 3 | 1.4.11 |
| Marco contra la página de la app: `linea` sobre `fondo` | N1 | 16,32 | 12,50 | 3 | 1.4.11: la lámina se separa de la app por el marco, no por el relleno (`superficie` sobre `fondo`: 1,09 / 1,07, exento, como X6) |
| `glifo-cerrar`: `tintaSec` sobre `superficie` | N20 | 7,91 | 7,01 | 3 | 1.4.11 |
| Foco: `foco` sobre `superficie` | N8 | 7,62 | 10,92 | 3 | 1.4.11, 2.4.7 |
| Link de respaldo: `tinta` sobre `fondo` | T1 | 16,32 | 15,97 | 4,5 | 1.4.3 |
| Divisor `filete` sobre `superficie` (decorativo) | X2 | 1,85 | 1,40 | exento | — |

Objetivos táctiles (D10, 44 × 44 pt; WCAG 2.5.8 AA 24 × 24, 2.5.5 AAA 44 × 44):

| Objetivo | Tamaño | Separación al vecino |
|---|---|---|
| K1 | ≥ 189 × 44 px en una fila; apilado, el ancho del contenido | 8 px (`paso 2`) a K2 |
| K2 | ≥ 116 × 44 px en una fila; apilado, el ancho del contenido | 8 px a K1 |
| Cerrar | 44 × 44 px | No pisa texto: el encabezado reserva `padding-right: 44px` y el título arranca a 54 px del borde interior (14 + 32 + 8), bajo el objetivo |
| Link de respaldo | Ancho completo × ≥ 44 px | 8 px a la nota |

### Anchos y alturas

Una fila de botones cuando el contenido (ancho de ventana − 40 de márgenes − 2 de borde − 28 de relleno) alcanza los 313 px de K1 + separación + K2 (189 + 8 + 116): desde ~383 px de ventana; por debajo, apilados (decide el contenido con `flex-wrap`, sin consulta de medios). `min-width: 116px` fija el ancho de K2 en reposo y en «Copiado»: el layout no cambia al copiar. El viewport real del navegador interno es menor que la pantalla.

| Ancho de ventana | Botones | Qué se ve |
|---|---|---|
| 320 px | Apilados | Lámina de 280 px; la explicación salta a dos líneas |
| 360 y 375 px | Apilados | Con 16 px de margen (reporte) 375 daba una fila; con `paso 5` el contenido queda en 305 px y apila |
| 390 px y más | Una fila | Desde 488 px de ventana la lámina mide `columna` (448) y queda centrada |

Alturas: el reporte las midió con margen de 16 px y `main` detrás (217 px desde 390 px en una fila; 287 a 360; 309 a 320; con el link de respaldo, hasta 371). Con `paso 5` el Programador las vuelve a medir en la 3.x (aceptación 3) y las registra en `evidencia/despues/`; esta ficha no las fija a mano.

### Estructura para el Programador

El DOM que el CSS espera. `SALIR_SCRIPT` ya crea `#pkapp-salir`, el `<style>`, el título con `id`, la fila de botones, el párrafo de estado, el `<input>` de respaldo, la nota y el botón de cerrar; cambia lo marcado.

```
div#pkapp-salir [role=dialog] [aria-labelledby=pkapp-salir-t] [tabindex=-1] (.o con tema oscuro)
├─ style                              AVISO.css
├─ i.a  i.b  i.c  i.d  [aria-hidden]  marcas de esquina (nuevo)
├─ div.h                              glifo-externo (innerHTML) + span.r = AVISO.rotulo (nuevo)
├─ p.t#pkapp-salir-t                  AVISO.titulo
├─ p.e                                AVISO.explicacion (nuevo)
├─ div.f
│  ├─ button.p                        AVISO.abrir   (K1; solo con mecanismo de salida)
│  └─ button                          AVISO.copiar  (K2; .k copiado, .n error)
├─ p.m [role=status]                  AVISO.manual, luego pegar o aMano (una sola nota: reemplaza al párrafo de estado suelto)
├─ input[readonly][hidden]            link de respaldo (ya existe; con un selector propio para el estilo)
└─ button.x [aria-label=AVISO.cerrar] glifo-cerrar (innerHTML; sin el carácter «✕»)
```

| # | Cambio en `SALIR_SCRIPT` (hoy en `scripts/inject-pwa.js`, bloque 2.6) | Tipo |
|---|---|---|
| D1 | Agregar las cuatro `<i>` con clases `a b c d` y `aria-hidden="true"` tras el `<style>` | Obligatorio: sin ellas no hay lámina |
| D2 | Antes del título, `div.h` con `innerHTML = AVISO.glifoExterno` y `span.r = AVISO.rotulo`; después del título, `p.e = AVISO.explicacion` | Obligatorio |
| D3 | La nota lleva la clase `m` y `role="status"`; el párrafo de estado suelto desaparece: tras copiar, `cp.textContent = AVISO.copiado; cp.className = 'k'; n.textContent = AVISO.pegar` | Obligatorio (el CSS cuelga de `.m`; una sola nota) |
| D4 | Con rechazo de `writeText` o `execCommand` en `false`: `cp.className = 'n'; n.textContent = AVISO.aMano` y mostrar el `<input>` de respaldo con el link, con foco y seleccionado (ya lo hace `no()`); «Copiado» solo si `execCommand` devolvió `true` (ya lo hace `leg()`) | Obligatorio |
| D5 | El botón de cerrar sin texto: `x.innerHTML = AVISO.glifoCerrar`, conservando `aria-label` | Obligatorio: un carácter U+2715 no es el `glifo-cerrar` de la Plancha (CD-13) |
| D6 | Al crear el nodo, leer `localStorage['pkapp_settings']`, parsear y, si `tema === 'oscuro'`, `d.className = 'o'`; cualquier error → claro | Obligatorio (tema de la app) |
| D7 | La prueba del UA para pintar el aviso pasa de `/Instagram\|FBAN\|FBAV\|FB_IAB/` a solo Instagram; qué conserva la salida automática con Facebook lo fija la spec del Ingeniero | Obligatorio para el aviso |
| D8 | `aria-labelledby`, `tabIndex = -1`, `d.focus()`, Escape y la devolución del foco se conservan tal cual (ya verificados por la e2e) | Sin cambio |

Glifos como SVG en línea (`viewBox 0 0 16 16`, `fill="none"`, `stroke="currentColor"`, `stroke-linecap="square"`, `stroke-linejoin="miter"`, `stroke-miterlimit="2"`, `aria-hidden="true"`, `focusable="false"`): `glifo-externo` a 16 px con `stroke-width="1.5"` y `glifo-cerrar` a 24 px con `stroke-width="1"`, con los trazos de `src/assets/glifos.js` (los mismos que la app dibuja). El literal CSS completo, verificado en Node y en Chrome con margen de 16 px, está en el reporte §10: es un punto de partida; si difiere de esta ficha, manda la ficha (G-1).

### Aceptación observable (para la spec y `tools/e2e/suites/navegador.js`)

| # | Comprobación | Esperado |
|---|---|---|
| 1 | Todos los `button` de `#pkapp-salir` miden ≥ 44 × 44 | `true` (ya en la e2e) |
| 2 | Hay cuatro marcas de esquina: `#pkapp-salir i[aria-hidden="true"]` | 4 |
| 3 | Alto de `#pkapp-salir` con viewport emulado (`Emulation.setDeviceMetricsOverride`) a 320 × 568, 360 × 740, 375 × 667, 390 × 844 y 430 × 932 | Se mide y se registra en `evidencia/despues/<tarea>/`; a 390 px y más, una fila de botones; a 375 px y menos, apilados |
| 4 | Nada pasa el borde derecho de la lámina: `button, p, span, .f` con `right <= lámina.right` | `true` en reposo, copiado y error |
| 5 | Los botones no cambian de fila al copiar ni tras un error de copia | Misma posición de K2 medida dentro de la lámina (`K2.top − lámina.top`) antes y después, en copiado y en error. La lámina está anclada abajo y crece hacia arriba: si K2 bajara a una segunda fila, su `top` absoluto no cambiaría (se movería K1), y tras un error el link de respaldo la agranda; por eso el `top` absoluto no sirve de medida (hallazgos 2 y 6a del análisis 5.0b.6; alineación con `tools/e2e/suites/navegador.js`, `topK2EnLamina`) |
| 6 | Tras copiar: etiqueta y nota | `Copiado` y el texto de `pegar`; K2 con borde de 2 px `acento` |
| 7 | Tras un error de copia | K2 con borde de 2 px `error`; la nota dice el texto de `aMano`; el `<input>` visible con la URL, con foco y seleccionado |
| 8 | Ningún descendiente con radio o sombra | `border-radius` `0px` y `box-shadow` `none` en todos |
| 9 | Fondo de la lámina según el tema guardado | Con `pkapp_settings.tema = 'oscuro'` sembrado antes de cargar: `rgb(18, 22, 27)`; sin la clave o con `'claro'`: `rgb(255, 255, 255)`; `prefers-color-scheme` emulado no cambia nada |
| 10 | Con UA de Facebook (`FBAN`, `FBAV`, `FB_IAB`) | No existe `#pkapp-salir` a los 2,2 s |
| 11 | Cerrar quita el aviso y no vuelve en la sesión; Escape cierra; el foco vuelve | Ya en la e2e |
| 12 | Sin emojis ni símbolos de texto: `innerText` de `#pkapp-salir` sin «✕» | El cierre es un SVG |

### Lo que cambia en la e2e (`tools/e2e/suites/navegador.js`, para el Programador)

| Prueba de hoy | Cambio |
|---|---|
| `facebookIosSoloCopiar` («aviso sin botón de abrir») | Pasa a afirmar que con UA de Facebook no se pinta el aviso (fila 10) |
| `suiteSalidaAndroid('facebook android')` | Según lo que la spec del Ingeniero fije para la salida automática con Facebook; esta ficha no la toca |
| `suiteCopiar`: «Link copiado» y «Copialo a mano» | Pasan a «Copiado» (etiqueta de K2) y al texto de `aMano` en la nota; el link seleccionable sigue siendo el `<input>` |
| `avisoAccesible`: nombre por `aria-labelledby`, foco, Escape | Sin cambio |
| Nuevas | Filas 2, 4 a 9 y 12 |

### Propuesta

| Id | Qué cambia | Sin el cambio | Motivo | Tipo | Estado |
|---|---|---|---|---|---|
| `REV-6` (revisión 5.0b, `tasks.md` 5.0b.6) | El aviso de navegador interno se dibuja con la lámina Plancha de esta sección (marcas de esquina, K1/K2/K7, rótulo mono con `glifo-externo`, explicación, `glifo-cerrar`, estados copiado y error), con margen `paso 5`, el tema guardado de la app y solo dentro de Instagram | El marcador de posición de 2.6: hoja a sangre con fuente del sistema, botones `acento`, «Link copiado» suelto, «✕» de texto y `prefers-color-scheme`; se pintaba también dentro de Facebook, donde «Abrir en tu navegador» no hace nada | La primera pantalla que ve quien llega desde Instagram no era la Plancha; el diseño ya existía, verificado en Chrome, y faltaba aplicarlo a `rediseno` | visual | aprobada (usuario, 2026-10-12); H2 y H8 pendientes de iPhone real |
