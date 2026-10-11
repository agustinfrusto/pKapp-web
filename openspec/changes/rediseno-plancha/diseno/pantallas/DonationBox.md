# DonationBox · ficha 1.3

| Campo | Valor |
|---|---|
| Superficie | Componente `DonationBox` (`src/components/DonationBox.js`) y su variante de resultados, `DonationPrompt` (`src/screens/ResultsScreen.js`, ≈ l. 242). Un solo aspecto para las dos |
| Boceto | Sin figura: el boceto no dibuja el pedido de donación. La ficha extiende su gramática (lámina con marcas de esquina, marco `acento`, cajetín y controles K2 de acento) |
| Comunes | `comun.md`: §4 marcas de estado, §5 estados (K3, K7), §7 anchos, §8 dimensiones, §9 glifos |
| Lo usan | `MateriaSelect` (bloque 5 de `MateriaSelect.md` a.1, `origen="materias"`) y `Results` (bloque 4 de `Results.md` a.1, `origen: 'resultados'`) |
| Variantes | Persistente, sin descartar (MateriaSelect, todas las plataformas) y descartable (Results, solo web); texto normal y celebratorio (80 o más) |
| Fuera de alcance | La página de Mercado Pago (`Linking.openURL`) |
| Maqueta | Figura 09 de `diseno/maqueta/`: antes (`DON-P1`) y `DON-P5`, aprobada, lado a lado, con el pedido solo y en su contexto (MateriaSelect y Results). Las figuras 01, 05a y 05b ya dibujan `DON-P5`. Capturas: `maqueta-donacion-<ancho>-<tema>.png` |
| Propuestas | Sección f: `DON-P5`, aprobada (usuario, 2026-10-11), con un ajuste de oscuro (banda en `acentoBanda`); reemplaza a `DON-P1`, aprobada el 2026-10-10. `DON-P2` y `DON-P4`, descartadas; `DON-P3`, retirada (f.2). Tokens nuevos: `acentoFondo` y `acentoBanda`, en `tokens.md` (sección i). Sección h: conservado de main (D10). Comunes: `COMUN-P2` |

---

## a. Layout a 390 px

### a.1 Posición en cada pantalla

| Dónde | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| MateriaSelect | Regla corta y panel | `paso 6` | `paso 5` | — | Regla corta (a.2) y panel a ancho de columna, bajo la lista de materias |
| Results | Panel | — | `paso 5` | `paso 3` | Entre el trío y los botones; condicional (d.1) |

`DON-P5` no cambia esta tabla: mismo lugar, mismos márgenes (`DON-C4`, `DON-C6`).

### a.2 Interior del panel

Panel sin relleno propio, con marco `acento` de `border-2` y las cuatro marcas de esquina de `comun.md` §6 (lado `paso 2`, sobresalen `paso 1` del borde exterior del marco; el margen lateral `paso 5` les deja lugar). El interior son tres franjas apiladas: encabezado en banda `acentoBanda`, y cuerpo y pie en `acentoFondo`. Las marcas quedan fuera del marco: no tocan el objetivo de descartar, que va dentro, a ras del marco. Ninguna palabra nueva.

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Regla corta (solo MateriaSelect) | Filete `filete`, `border`; ancho dos quintos de la columna; centrada; margen inferior `paso 4` | Separa la lista del pedido, como hoy |
| 2 | Encabezado (banda) | Relleno `acentoBanda`; alto mínimo `paso 11`; relleno lateral `paso 3.5` y vertical `paso 2`; sin filete: el cambio de color lo delimita. En la variante descartable, el título deja libre `paso 11` a la derecha | Título en `fondo`; en la variante celebratoria, `glifo-trofeo` (chico) en `fondo` delante, separado `paso 2` |
| 3 | Descartar (solo Results) | Objetivo `paso 11` por `paso 11`, en la esquina superior derecha del panel, a ras del marco, dentro de la banda; glifo grande centrado | `glifo-cerrar` en `fondo` |
| 4 | Cuerpo (franja) | Relleno `acentoFondo`; relleno `paso 3.5` en las cuatro caras | Texto y montos |
| 4a | Texto | Margen inferior `paso 3.5` | Aviso de que la web no es de la Udelar |
| 4b | Montos | Fila con una celda por monto, de igual ancho; separación `paso 2`; alto y ancho mínimos `paso 11`; relleno `superficie` y borde `acento`; si no entran en una fila saltan de línea | Un monto por celda |
| 5 | Pie (franja) | Relleno `acentoFondo`; filete superior `filete`, `border`; relleno vertical `paso 2` y lateral `paso 3.5`; centrado | «Vía Mercado Pago» |

Orden de lectura: título, texto, montos, pie.

### a.3 Otros anchos (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | El panel llena la columna y las tres franjas llenan su ancho; los montos siguen en una fila de celdas iguales |
| 1280 px | Igual | Igual | Igual. El panel no se estira a la ventana; el pedido de Results sigue entre el trío y los botones |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. El título salta de línea y la banda crece (nunca baja de `paso 11`); el título no pisa el objetivo de descartar. Las celdas de monto se angostan sin bajar de `paso 11` de ancho; el texto salta de línea |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Panel (cuerpo) | — | `acentoFondo` | `acento`, `border-2`; marcas de esquina `linea` (§6) | — | — | — | N17, N22, N1 |
| Regla corta | — | `fondo` | — | — | `filete`, `border` | — | X1 |
| Encabezado (banda) | — | `acentoBanda` | — | — | — | — | N23 |
| Título, variante normal | `fondo` | `acentoBanda` | — | `item` | — | — | T22 |
| Título, variante celebratoria | `fondo` | `acentoBanda` | — | `item` | — | `glifo-trofeo` (chico), `fondo` | T22, N21 |
| Descartar (K7 sobre la banda) | `fondo` | `acentoBanda` | — | — | — | `glifo-cerrar` (grande) | N21 |
| Cuerpo (franja) | — | `acentoFondo` | — | — | — | — | — |
| Texto del aviso | `tinta` | `acentoFondo` | — | `cuerpo` | — | — | T20 |
| Monto (K2 de acento) | `acento` | `superficie` | `acento`, `border` | `dato` | — | — | T6, N18, X6 |
| Pie «Vía Mercado Pago» (franja) | `tintaSec` | `acentoFondo` | — | `rotulo` | `filete`, `border`, superior | — | T21, X7 |

Los pares de f.6 están numerados en `tokens.md` e (T20–T22, N21–N24, X6–X7). La celebración la llevan la palabra y el glifo; el color del panel no cambia entre variantes. `glifo-trofeo` va con texto: decorativo, oculto a lectores (`aria-hidden`, `accessibilityElementsHidden`); sobre la banda toma el color de su texto, `fondo` (CD-11), porque `acierto` sobre la banda no se distingue (f.8). `glifo-cerrar` va solo: lleva nombre accesible (e). Todo control mide al menos `paso 11` de alto y de ancho, con `paso 2` como mínimo entre controles adyacentes.

### b.1 Qué hace destacar al bloque

El bloque se distingue de su entorno por el color de marca, no por el peso: marco, banda y tinte son del único color de `acento`, y ningún relleno es de `tinta`, de modo que «Volver a practicar» (K1) sigue siendo la acción primaria de Results (f.5). Sin glifo nuevo ni palabras nuevas.

| Recurso | Valor | Por qué |
|---|---|---|
| Marco | `acento`, `border-2` (N17 sobre `fondo`) | Es el marco de lo destacado (panel de mezcla de TopicSelect), y el pedido no convive con él en pantalla |
| Banda del encabezado | `acentoBanda`, con título y descartar en `fondo` | La única masa de color de la pantalla: ancla el panel desde arriba. En oscuro mide lo mismo contra la página que en claro (f.5) |
| Cuerpo y pie | `acentoFondo` | El panel deja de ser otra lámina blanca; apenas teñido |
| Montos | K2 de acento, relleno `superficie` | Las celdas blancas resaltan sobre el tinte y se leen como lo tocable; marco, sin relleno de color |
| Marcas de esquina | `comun.md` §6 sin cambio: `linea`, `border-2`, lado `paso 2` | Lo lee como lámina, la misma familia que la tarjeta de resultado y el trío de Results |
| Franjas | Banda, cuerpo y pie separados por el cambio de relleno y por `filete` | Estructura de cajetín de las tarjetas de materia |

Lo que no se usa y por qué: f.8.

---

## c. Matriz de estados

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado | Variante celebratoria |
|---|---|---|---|---|---|---|---|
| Monto (K2 de acento) | Fondo `superficie`; borde `acento`, `border`; texto `acento` | Contorno web `acento`, `border` | Inversión: fondo `tinta`; texto `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` (`foco` sobre `acentoFondo`: N24) | — | — | Igual |
| Descartar (K7 sobre la banda) | Glifo `fondo` sobre `acentoBanda` | Contorno web `fondo`, `border` | Inversión total sobre la banda: fondo `fondo`; glifo `acentoBanda` | Contorno `fondo`, `border-2`, hacia adentro del objetivo (`foco` sobre `acentoBanda` mide 1,29 en claro y 2,14 en oscuro; hacia afuera, a ras del marco, caería sobre el marco y la página) | — | — | Igual |
| Banda, panel y pie | Estáticos | — | — | — | — | — | Título con `glifo-trofeo` en `fondo`; texto celebratorio |

| Estado de la variante descartable | Efecto |
|---|---|
| Visible | `visible` en verdadero al montar el componente |
| Descartado | Un toque en descartar lo oculta; no emite evento |
| Al volver de la revisión | El componente se vuelve a montar con `visible` en verdadero, como hoy: el descarte no persiste (comportamiento de `main`, la ficha no lo cambia) |

Origen de la pregunta, aciertos de rendimiento y banco reducido no aplican (—).

---

## d. Datos e invariantes

### d.1 Cuándo aparece y qué muestra (D6, leídos de `src/screens/ResultsScreen.js` y `src/utils/mercadopago.js`)

| Constante | Valor | Línea | Qué decide |
|---|---|---|---|
| `DONATION_MIN_SCORE` | 60 | `ResultsScreen.js:18` | El pedido solo puede aparecer con `percentage >= 60` |
| `DONATION_WARM_SCORE` | 80 | `ResultsScreen.js:19` | Con `percentage >= 80` el pedido usa el texto celebratorio |
| `DONATION_COUNT_KEY` | `'pkapp_donation_count'` | `ResultsScreen.js:20` | Clave de `localStorage` con el conteo de aprobados |
| `DONATION_EVERY` | 3 | `ResultsScreen.js:21` | Se muestra en 1 de cada 3 aprobados (el 1.º, el 4.º, el 7.º…) |
| `DONATION_AMOUNTS` | Lista de montos | `src/utils/mercadopago.js` | Montos y orden de los botones; la ficha no copia los valores |
| `MP_LINKS` | Un enlace por monto | `src/utils/mercadopago.js` | Destino del toque |

`shouldShowDonation(percentage)` (`ResultsScreen.js:26`): solo en web con `localStorage`; devuelve falso con `percentage < DONATION_MIN_SCORE` sin contar; con porcentaje suficiente suma 1 al conteo y muestra si `(conteo - 1) % DONATION_EVERY === 0`. Se evalúa una sola vez al montar `Results`. Ningún valor cambia.

| Dónde | Cuándo se muestra |
|---|---|
| MateriaSelect | Siempre, en todas las plataformas, sin descartar |
| Results | Solo web; con el criterio de arriba; descartable |

### d.2 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Título | Cadena fija; la celebratoria es «¡Gran resultado!» con `glifo-trofeo` | Variante según `percentage >= DONATION_WARM_SCORE` |
| Texto | Cadena fija por variante (e) | — |
| Montos | `DONATION_AMOUNTS`, con el texto «${monto}» | Un botón por monto, en orden |
| Origen del evento | Prop `origen` de `DonationBox`; `'resultados'` fijo en `DonationPrompt` | — |

### d.3 Invariantes

| Invariante | Detalle |
|---|---|
| Umbrales | d.1: ningún valor cambia; la ficha no los mueve ni los renombra |
| Un toque abre el pago | `handleDonate(amt)` y `openLink(amt)`: emiten el evento y, en `requestAnimationFrame`, `Linking.openURL(MP_LINKS[amt])` con `catch` vacío |
| Aviso de no pertenencia | «NO ES DE UDELAR» se conserva en mayúsculas dentro del texto (copy de `main`); el paso tipográfico no lo altera |
| Sin emoji, radio ni sombra | El trofeo, el símbolo de cerrar, `rounded-*`, la familia `warning*` y `activeOpacity` salen del componente (`comun.md` §9, D9) |
| Sin tono cálido propio | La paleta Plancha no tiene tono de aviso cálido: el pedido destaca con el `acento` de marca (b.1) y no usa `intermedia` ni `error`, que son estados de rendimiento |
| Misma ficha, dos usos | El aspecto de `DonationBox` y de `DonationPrompt` es idéntico; difieren en descartar y en el texto celebratorio |

### d.4 Eventos `track(...)`

`rg -n 'track\(' src/components/DonationBox.js src/screens/ResultsScreen.js`

| Evento | Línea | Payload | Cuándo | Fila que lo cubre |
|---|---|---|---|---|
| `donacion_click` | `DonationBox.js:10` | `{ origen, monto: amt }` con `origen` recibido por prop (`'materias'` desde MateriaSelect) | Al tocar un monto | Monto (b, c). No se toca |
| `donacion_click` | `ResultsScreen.js:247` | `{ origen: 'resultados', monto: amt }` | Al tocar un monto del pedido de resultados | Monto (b, c). No se toca |
| `simulacro_terminado` | `ResultsScreen.js:61` | `{ mode, score: percentage, total }` | Al montar `Results` | No es de esta ficha: lo cubre `Results.md` d.4 |
| `simulacro_aprobado` | `ResultsScreen.js:63` | `{ mode, score: percentage }` | Al montar `Results`, con `percentage >= APROBADO_MIN_SCORE` | No es de esta ficha: lo cubre `Results.md` d.4 |

---

## e. Copy

| Elemento | Actual | Nuevo | Motivo |
|---|---|---|---|
| Título normal | «Ayuda a mantener esta aplicación» | Igual | — |
| Título celebratorio | «¡Gran resultado!» y emoji de trofeo | «¡Gran resultado!» con `glifo-trofeo` delante | Reemplazo de emoji; el glifo va delante como en los demás rótulos con glifo (§4) |
| Texto normal | «Esta web NO ES DE UDELAR y se mantiene por donaciones. Para hacerla posible:» | Igual | — |
| Texto celebratorio | «Si pKapp te está ayudando a llegar al examen, dale una mano para mantenerla (no es de Udelar):» | Igual | — |
| Montos | «${monto}» por cada entrada de `DONATION_AMOUNTS` | Igual | — |
| Pie | «Vía Mercado Pago» | Igual; el paso lo muestra en mayúsculas | Sin cambio de palabras |
| Descartar | Símbolo de cruz | `glifo-cerrar`; nombre accesible «Cerrar» | Reemplazo de símbolo; cadena accesible nueva, no visible |

---

## f. Propuestas (D10)

### f.1 Aprobadas

Cambios respecto de `main` que el boceto no dibuja. Rigen tal como están descritos en la ficha (a, b, c y e). No hay variantes alternativas.

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| DON-P5 | El pedido de donación lleva marco `acento` de `border-2`; encabezado en banda `acentoBanda` con el título y el descartar en `fondo`; cuerpo y pie en `acentoFondo`; montos K2 de acento con relleno `superficie`. Ajuste de oscuro: la banda baja de `acento` a `acentoBanda` (73 % de `acento` sobre `fondo`) para medir 5,45:1 contra la página, como en claro (5,40:1), y dejar a «Volver a practicar» como la acción más fuerte (f.5). Sin copy nuevo. Lugar, copy, montos, umbrales y eventos no cambian (f.7) | Pedido del usuario: «El bloque de donación tiene que ser un poco más llamativo, que no desentone con la estética de la página, pero sí buscá la manera de hacer que se note». Tras ver una primera propuesta: «Más llamativo» y «Tal vez un fondo con otro color»; de la exploración eligió «tinte b + banda de acento pero sin rótulo»; al ver la figura: «Aprobada, bajá la banda solo en oscuro» | visual | aprobada (usuario, 2026-10-11), con el ajuste de oscuro |
| DON-P1 | Los cuatro montos eran botones de marco (K3) en lugar de botones rellenos, con marco `acento` de `border` y cuerpo `superficie` | `main` los rellenaba con el tono de aviso; con los montos rellenos y K1 la acción primaria perdía jerarquía. Observación del usuario: «de todas maneras la caja de donaciones debe llamar ligeramente la atención, revisar» | visual | aprobada (usuario, 2026-10-10); reemplazada por `DON-P5` el 2026-10-11 |

### f.2 Descartadas y retiradas

| Id | Qué proponía | Motivo | Estado |
|---|---|---|---|
| DON-P2 | Marco `acento` de `border-2`, tres franjas con `filete` y montos K2 de acento, sin relleno ni palabras nuevas | Era el escalón anterior de `DON-P5`, que la contiene; el usuario la vio y pidió más presencia | descartada (el usuario eligió `DON-P5`) |
| DON-P4 | Rótulo «Donación» sobre el título | Se dibujó en la exploración de `DON-P5` para nombrar el bloque en la variante celebratoria; el usuario eligió la variante sin rótulo | descartada (usuario, 2026-10-11) |
| DON-P3 | Glifo propio de donación delante del título | No forma parte de `DON-P5`. Se retira para no dejar una propuesta abierta bajo el diseño aprobado (C2, CD-26). Reabrirla exige un id nuevo, un SVG en `svg/glifos/` (1.4) y una fila en `comun.md` §9; un símbolo cálido como el corazón sigue descartado, y sería de silueta técnica de trazo recto | retirada de la ficha |

### f.3 Qué cambia con `DON-P5` respecto de `DON-P1` y por qué se nota más sin desentonar

Brief: «más llamativo», «que no desentone con la estética de la página», «que se note». Referencias (`REFERENCIAS.md`): composición en retícula de información y dibujo técnico; excluido lo colorido, lo genérico, lo redondeado y los emojis.

| Parte | `DON-P1` (antes) | `DON-P5` | Por qué se nota más | Por qué no desentona |
|---|---|---|---|---|
| Marco | `acento`, `border` | `acento`, `border-2` | Duplica el grosor del único borde de color de las láminas | `border-2` en `acento` es el marco de lo destacado (panel de mezcla de TopicSelect, `tokens.md` c.2); el pedido vive en MateriaSelect y Results, donde no convive con él. Mismas marcas de §6 |
| Encabezado | Título `tinta` sobre `superficie`, sin separación | Banda llena `acentoBanda`, título y descartar en `fondo` | Es la única masa de color de la pantalla y ancla el panel desde arriba | Es el color de marca que ya rotula las láminas; sin gradiente ni transparencia. Texto `fondo` sobre la banda: 5,40 y 5,45 |
| Cuerpo y pie | `superficie` | `acentoFondo` | El panel deja de ser otra lámina blanca: el matiz lo separa del trío y de la lámina de resultado | Tinte del color de marca con el patrón de `aciertoFondo` y `errorFondo`: apenas teñido |
| Montos | K3: borde `borde`, texto `tinta` | K2 de acento con relleno `superficie` | El color de marca queda en lo que se toca; las celdas blancas resaltan sobre el tinte | K2 de acento ya existe en Results («Revisar todas las respuestas»): marco, sin relleno de color. No es un botón primario |
| Estructura | Título, texto y montos en un solo bloque | Banda, cuerpo y pie | Más línea de dibujo: se lee como lámina con cajetín y no como la caja genérica de título, texto y botones | Es la estructura de la tarjeta de materia (fila y cajetín) y del trío de Results |
| Descartar | Esquina superior derecha, a ras del marco | Igual, dentro de la banda y en `fondo` | — | Objetivo de `paso 11` por `paso 11` sin cambio |
| Alto del panel | Relleno `paso 3.5` y `paso 3` entre montos y pie | Suma el relleno de las franjas y el filete del pie | — | Medido en la maqueta: `NOTAS-MAQUETA.md` §4. Results sigue entre el trío y los botones |

### f.4 Con qué está hecho `DON-P5`

| Aspecto | Cómo queda |
|---|---|
| Tokens existentes | Todo el pedido usa tokens existentes salvo dos: `acentoFondo` y `acentoBanda` (sección i) |
| Pasos de espaciado y tipografía | Solo los existentes (`tokens.md` c.3 y b.2): `item`, `cuerpo`, `dato`, `rotulo` |
| Glifos | Los del inventario de §9: `glifo-trofeo` y `glifo-cerrar` |
| Copy | Ninguna cadena nueva ni modificada (e) |

### f.5 Jerarquía frente a «Volver a practicar» y ajuste de la banda en oscuro

Con la banda en `acento`, en oscuro el pedido competía con K1: la banda medía 9,48:1 contra la página, 0,59 de los 15,97:1 de K1. El usuario aprobó `DON-P5` con un ajuste: en oscuro la banda baja a `acentoBanda`. En claro no cambia nada (`acentoBanda` vale lo mismo que `acento`).

| Medida contra la página | Claro | Oscuro antes del ajuste (`acento`) | Oscuro con `acentoBanda` |
|---|---|---|---|
| Razón de contraste de la banda | 5,40 | 9,48 | 5,45 |
| Razón de contraste de K1 (`tinta`, T7) | 16,32 | 15,97 | 15,97 |
| Banda sobre K1 | 0,33 | 0,59 | 0,34 |
| K1 sobre la banda (veces) | 3,0 | 1,7 | 2,9 |
| Salto de luminosidad L* de la banda | 54,1 | 70,1 | 52,9 |
| Salto de luminosidad L* de K1 | 88,4 | 88,6 | 88,6 |
| Banda sobre K1, por salto de L* | 0,61 | 0,79 | 0,60 |
| Croma C* de la banda | 25,6 | 30,7 | 24,3 |

| Elemento | Relleno | Lectura |
|---|---|---|
| «Volver a practicar» (K1) | `tinta` | La acción primaria: único relleno `tinta` y contraste más alto en los dos temas |
| Banda | `acentoBanda` | Color apagado en oscuro: pesa lo mismo contra la página en los dos temas |
| Cuerpo | `acentoFondo` | Tinte suave: 1,08:1 (claro) y 1,41:1 (oscuro) sobre `fondo` |
| Montos | `superficie` con borde `acento` | Marco, no relleno: ninguna celda lleva relleno de color ni de `tinta` |

La banda sigue leyéndose como banda de acento: mismo matiz que `acento`, 3,84:1 sobre el cuerpo en oscuro (4,98:1 en claro) y por debajo del marco, que en oscuro conserva `acento` (9,48:1 contra la página). K1 queda 2,9 veces más fuerte que la banda contra la página en oscuro, como en claro (3,0).

### f.6 Razones de contraste de `DON-P5`

Calculadas con el script de `tokens.md` e sobre `src/theme/colores.js`, con `acentoFondo` en 12 % de `acento` sobre `superficie` en claro y 15 % en oscuro, y `acentoBanda` igual a `acento` en claro y 73 % de `acento` sobre `fondo` en oscuro; truncadas a dos decimales. Numerados en `tokens.md` e: T20–T22, N21–N24, X6–X7.

| # | Par (frente sobre fondo) | Dónde | Claro | Oscuro | Umbral | Cumple |
|---|---|---|---|---|---|---|
| T22 | `fondo` sobre `acentoBanda` | Título sobre la banda | 5,40 | 5,45 | 4,5:1 | sí |
| N21 | `fondo` sobre `acentoBanda` | `glifo-cerrar` y `glifo-trofeo` sobre la banda; hover y foco del descartar | 5,40 | 5,45 | 3:1 | sí |
| N23 | `acentoBanda` sobre `fondo` | Banda contra la página; glifo del descartar presionado | 5,40 | 5,45 | 3:1 | sí |
| T20 | `tinta` sobre `acentoFondo` | Texto del aviso | 15,04 | 11,26 | 4,5:1 | sí |
| T21 | `tintaSec` sobre `acentoFondo` | Pie «Vía Mercado Pago» | 6,68 | 5,30 | 4,5:1 | sí |
| N22 | `acento` sobre `acentoFondo` | Borde interior del marco | 4,98 | 6,68 | 3:1 | sí |
| N24 | `foco` sobre `acentoFondo` | Contorno de foco del monto | 6,43 | 8,25 | 3:1 | sí |
| X6 | `superficie` sobre `acentoFondo` | Celda de monto contra el panel: la delimita su borde `acento` | 1,18 | 1,32 | exento (decorativo) | — |
| X7 | `filete` sobre `acentoFondo` | Filete de la franja del pie | 1,56 | 1,05 | exento (decorativo) | — |
| T6 | `acento` sobre `superficie` | Texto del monto, sobre su celda | 5,90 | 8,84 | 4,5:1 | sí |
| N18 | `acento` sobre `superficie` | Borde del monto, sobre su celda | 5,90 | 8,84 | 3:1 | sí |
| N17 | `acento` sobre `fondo` | Borde exterior del marco | 5,40 | 9,48 | 3:1 | sí |
| T7 | `fondo` sobre `tinta` | Monto presionado | 16,32 | 15,97 | 4,5:1 | sí |
| — | `foco` sobre `acentoBanda` | Foco del descartar con el `foco` de siempre | 1,29 | 2,14 | 3:1 | no: por eso va en `fondo` |
| — | `tinta` sobre `acentoBanda` | Título en `tinta` sobre la banda | 3,01 | 2,92 | 4,5:1 | no: por eso va en `fondo` |

Título sobre la banda oscura: 5,45:1 (mínimo 4,5:1). Glifo de descartar y trofeo: 5,45:1 (mínimo 3:1). Holgura mínima: T22 en claro, 5,40 contra 4,5, y T21 en oscuro, 5,30 contra 4,5. La banda de oscuro puede bajar hasta 65 % de `acento` sobre `fondo` sin que el título deje de pasar 4,5:1; el tinte, subir hasta 37 % en claro y 22 % en oscuro.

### f.7 Qué no cambia con `DON-P5`

| Invariante | Estado |
|---|---|
| `DONATION_MIN_SCORE`, `DONATION_WARM_SCORE`, `DONATION_EVERY`, `DONATION_COUNT_KEY` | Sin cambio (d.1) |
| Copy | Ninguna cadena modificada ni agregada (e); `DON-C1` y `DON-C2` |
| Montos | `DONATION_AMOUNTS`, en una fila y en su orden (`DON-C1`) |
| Eventos | `donacion_click` con `origen` y `monto`, sin cambio (d.4, `DON-C5`) |
| Destino del toque | `MP_LINKS[monto]` por `Linking.openURL` (d.3) |
| Lugar en pantalla | MateriaSelect tras la regla corta; Results entre el trío y los botones (`DON-C4`, `DON-C6`) |
| «Volver a practicar» | Sigue siendo la acción más fuerte de Results: único relleno `tinta` y contraste más alto en los dos temas (f.5) |
| D9 | Sin radios, sombras, gradientes, transparencias de color ni opacidad como estado |
| Emojis | Ninguno: `glifo-trofeo` y `glifo-cerrar` del inventario de §9 |
| D10 | Objetivos de `paso 11` por `paso 11`; `paso 2` entre montos; el título no pisa el objetivo de descartar; sin scroll horizontal desde 320 px (medido: `NOTAS-MAQUETA.md` §4) |

### f.8 Recursos que `DON-P5` no usa

Explorados en la maqueta o descartados por contrato.

| Recurso | Motivo |
|---|---|
| Banda en `acento` en oscuro | Mide 9,48:1 contra la página, 0,59 de K1: compite con «Volver a practicar». Reemplazada por `acentoBanda` (f.5) |
| Título y descartar en `tinta` sobre la banda | `tinta` sobre `acentoBanda` mide 3,01 y 2,92: no llega a 4,5:1 |
| Banda en un token existente de oscuro | `intermedia` y `filamento` (acero) y `tintaSec` (gris) pierden el matiz de acento o son de estado (CD-8); `borde` es gris y no llega a 3:1 contra la página |
| Relleno `tinta` en el encabezado o en el panel | La inversión `tinta`/`fondo` es seleccionado, presionado y K1; en Results competiría con «Volver a practicar» |
| Relleno `acento` en el panel entero | Obliga a pasar todo el texto a `fondo` (`tinta` sobre `acento` mide 3,01 y 1,68) y es la mayor masa de color de la pantalla |
| `aciertoFondo` o `errorFondo` como relleno | Pasan AA (`tinta` 15,39 y 15,12 en claro) pero son semánticos (CD-8): el verde se lee «correcta» y el rosado «incorrecta» |
| `fondo` como relleno | Es el color de la página: el panel parece hueco entre láminas `superficie` |
| `filete`, `borde` o `intermedia` como relleno | `tintaSec` sobre `filete` mide 4,27 en claro (menos de 4,5); `borde` no llega a 3:1 con ningún texto; `intermedia` es la banda de rendimiento (CD-8) |
| Montos con relleno de color (`acento` o `tinta`) | Un botón relleno es la acción primaria (K1): en Results se leería como una segunda sobre «Volver a practicar» |
| `glifo-trofeo` en `acierto` sobre la banda | `acierto` sobre la banda no se distingue; el glifo toma el color del texto de la banda, `fondo` (CD-11) |
| Título en `acento` | CD-8: `acento` es identidad, y compite con las cabeceras de pantalla |
| Título en `titulo` | En Results empata con el subtítulo del resultado («20 de 24 correctas»), y a 390 px el título de la variante descartable salta de línea junto al objetivo de descartar |
| Montos en `cifra` | Es el paso de las cifras del trío y rompe la fila de montos a 320 px |
| Marcas de esquina en `acento` | §6 y CD-22 las fijan en `linea`; en `linea` atan el panel a la familia de láminas |
| Rótulo «Donación» (`DON-P4`) | Descartado por el usuario: agrega una palabra y el título ya nombra el pedido |
| `glifo-mensaje` o `glifo-externo` | `glifo-mensaje` es el de la nota del creador y compartiría marcador con ella en MateriaSelect; `glifo-externo` se lee como enlace tocable y el pie no lo es |
| Borde izquierdo `acento` | Gramática de la nota (`Banners.md`): el pedido se leería como otra nota del creador |
| Cambiar el lugar del pedido | `DON-C4` y `DON-C6` (D10) |
| Sombra o marco desplazado | D9 |

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Sin figura de este componente | Panel con la gramática del boceto | El boceto no lo cubre; `main` fija funciones, datos y copy (D10) |
| (`main`) fondo y borde de la familia de aviso (`warning*`) | Panel con marco `acento`, banda `acentoBanda` y cuerpo `acentoFondo` | La paleta Plancha no tiene tono cálido (`tokens.md` a.1); un tono de estado (`intermedia`, `error`) se leería como rendimiento. El `acento` conserva el énfasis sin ese riesgo (b.1) |
| (`main`) descartar con ampliación táctil de 8 | Objetivo `paso 11` | D10: objetivo táctil mínimo de 44 × 44 pt |
| (`main`) texto sobre el relleno de aviso | Texto `tinta` o `fondo` según el relleno | Pares medidos de `tokens.md` e |

---

## h. Conservado de main (D10)

Elementos de `main` que el boceto omite. No son propuestas: `main` es la base de funciones, datos, copy y orden de uso (`design.md`, D10, «Base de comparación»). Se conservan por D10, sin aprobación.

| Id | Qué se conserva | Motivo | Tipo |
|---|---|---|---|
| DON-C1 | Los montos de `DONATION_AMOUNTS` en una fila y en su orden, y el pie «Vía Mercado Pago» | Función y copy de `main` | uso |
| DON-C2 | El aviso de que la web no es de la Udelar, en las dos variantes de texto y con «NO ES DE UDELAR» en mayúsculas | Copy de `main`; es una aclaración de pertenencia | copy |
| DON-C3 | En Results: solo web, desde `DONATION_MIN_SCORE`, 1 de cada 3 aprobados, celebratorio desde `DONATION_WARM_SCORE`, y descartable | D6: umbrales de donación | uso |
| DON-C4 | En MateriaSelect: persistente, sin descartar, en todas las plataformas, precedido por la regla corta | Función de `main` | uso |
| DON-C5 | Un toque emite `donacion_click` con `origen` y `monto`, y abre el enlace de Mercado Pago del monto | D6: eventos y payloads | dato |
| DON-C6 | El pedido de Results conserva su lugar entre el trío y los botones | D10: orden y ubicación relativa | uso |

---

## i. Tokens nuevos

Cada token lleva su valor en claro y en oscuro, su uso y los pares de f.6 que cubre. Los valores en hexadecimal, listos para copiar a `tokens.md` a.1 y a `plancha.claro` y `plancha.oscuro` de `src/theme/colores.js`, están en `.orca/reports/rediseno-donationbox-presencia-4.md` (tabla «Tokens nuevos»): `CONVENCIONES.md` C6 no admite valores literales en las fichas. También están en el bloque generado de `maqueta.html` (variables `--acentoFondo` y `--acentoBanda`) y en `NOTAS-MAQUETA.md` §7.

| Token | Claro | Oscuro | Uso | Pares |
|---|---|---|---|---|
| `acentoFondo` | 12 % de `acento` sobre `superficie` | 15 % de `acento` sobre `superficie` | Relleno del cuerpo y del pie del pedido de donación | T20, T21, N22, N24, X6, X7 |
| `acentoBanda` | Igual que `acento` | 73 % de `acento` sobre `fondo` | Relleno de la banda del encabezado del pedido de donación; título y glifos encima en `fondo` | T22, N21, N23 |

| Regla del alta | Detalle |
|---|---|
| Estado | Dados de alta en `tokens.md` a.1 y e (2026-10-11). En `src/theme/colores.js` los suma la tarea 3.8 |
| Claves | Sumar las dos a `plancha.claro` y `plancha.oscuro`, con las mismas claves en ambos temas y en par (`x` y `dark:xD`) (C6) |
| Contraste | CD-27: filas T20–T22, N21–N24 y X6–X7 en `tokens.md` e; la 3.8 las verifica con el script de e sobre `colores.js` |
| `border-2` | Sumar el pedido de donación a los usos de `border-2` de `tokens.md` c.2 |
| Reserva (CD-8) | Solo el pedido de donación: ninguno es fondo de estados ni de otras láminas |
| Techo | `acentoFondo`: hasta 37 % en claro y 22 % en oscuro sin bajar de 4,5:1 (`tintaSec`). `acentoBanda` en oscuro: hasta 65 % de `acento` sobre `fondo` con el título en `fondo` a 4,5:1 |
