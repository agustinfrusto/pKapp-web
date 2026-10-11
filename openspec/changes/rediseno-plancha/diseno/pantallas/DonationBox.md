# DonationBox · ficha 1.3

| Campo | Valor |
|---|---|
| Superficie | Componente `DonationBox` (`src/components/DonationBox.js`) y su variante de resultados, `DonationPrompt` (`src/screens/ResultsScreen.js`, ≈ l. 242). Un solo aspecto para las dos |
| Boceto | Sin figura: el boceto no dibuja el pedido de donación. La ficha extiende su gramática (panel de marco `linea`, rótulos y controles K3) |
| Comunes | `comun.md`: §4 marcas de estado, §5 estados (K3, K7), §7 anchos, §8 dimensiones, §9 glifos |
| Lo usan | `MateriaSelect` (bloque 5 de `MateriaSelect.md` a.1, `origen="materias"`) y `Results` (bloque 4 de `Results.md` a.1, `origen: 'resultados'`) |
| Variantes | Persistente, sin descartar (MateriaSelect, todas las plataformas) y descartable (Results, solo web); texto normal y celebratorio (80 o más) |
| Fuera de alcance | La página de Mercado Pago (`Linking.openURL`) |
| Propuestas | Sección f: `DON-P1`, pendiente. Sección h: conservado de main (D10). Comunes: `COMUN-P2` |

Convención de 1.3 (D10): las secciones a a e describen la superficie con las propuestas de f aplicadas. La sección f.2 trae la variante sin el cambio de cada una, al mismo nivel de detalle, y es la que se implementa si el usuario no la aprueba. Base de comparación: el boceto para lo visual; `main` para funciones, datos, copy y orden de uso.

---

## a. Layout a 390 px

### a.1 Posición en cada pantalla

| Dónde | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| MateriaSelect | Regla corta y panel | `paso 6` | `paso 5` | — | Regla corta (a.2) y panel a ancho de columna, bajo la lista de materias |
| Results | Panel | — | `paso 5` | `paso 3` | Entre el trío y los botones; condicional (d.1) |

### a.2 Interior del panel

Panel con relleno `paso 3.5` en las cuatro caras.

| # | Parte | Medidas | Contenido |
|---|---|---|---|
| 1 | Regla corta (solo MateriaSelect) | Filete `filete`, `border`; ancho dos quintos de la columna; centrada; margen inferior `paso 4` | Separa la lista del pedido, como hoy |
| 2 | Encabezado | Una línea o más; margen inferior `paso 2`. En la variante descartable, el título deja libre `paso 11` a la derecha | Título; en la variante celebratoria, `glifo-trofeo` (chico) delante, separado `paso 2` |
| 3 | Descartar (solo Results) | Objetivo `paso 11` por `paso 11`, en la esquina superior derecha del panel, a ras del marco; glifo grande centrado | `glifo-cerrar` |
| 4 | Texto | Margen inferior `paso 3.5` | Aviso de que la web no es de la Udelar |
| 5 | Montos | Fila con una celda por monto, de igual ancho; separación `paso 2`; alto y ancho mínimos `paso 11`; si no entran en una fila saltan de línea; margen inferior `paso 3` | Un monto por celda |
| 6 | Pie | Centrado | «Vía Mercado Pago» |

### a.3 Otros anchos (D10)

| Ancho | Columna | Alineación | Particularidades |
|---|---|---|---|
| 768 px | `comun.md` §7: una columna, ancho máximo `max-w-columna` | Centrada en horizontal, anclada arriba | El panel llena la columna; los montos siguen en una fila de celdas iguales |
| 1280 px | Igual | Igual | Igual. El panel no se estira a la ventana; el pedido de Results sigue entre el trío y los botones |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | — | Sin scroll horizontal. Las celdas de monto se angostan sin bajar de `paso 11` de ancho; el título y el texto saltan de línea |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Panel (cuerpo) | — | `superficie` | `linea`, `border` | — | — | — | N1 |
| Regla corta | — | `fondo` | — | — | `filete`, `border` | — | X1 |
| Título, variante normal | `tinta` | `superficie` | — | `item` | — | — | T2 |
| Título, variante celebratoria | `tinta` | `superficie` | — | `item` | — | `glifo-trofeo` (chico), `acierto` | T2, N10 |
| Descartar (K7) | `tintaSec` | `superficie` | — | — | — | `glifo-cerrar` (grande) | N20 |
| Texto del aviso | `tinta` | `superficie` | — | `cuerpo` | — | — | T2 |
| Monto (K3) | `tinta` | `superficie` | `borde`, `border` | `dato` | — | — | T2, N4 |
| Pie «Vía Mercado Pago» | `tintaSec` | `superficie` | — | `rotulo` | — | — | T4 |

La celebración la llevan la palabra y el glifo; el color del panel no cambia entre variantes. `glifo-trofeo` va con texto: decorativo, oculto a lectores (`aria-hidden`, `accessibilityElementsHidden`). `glifo-cerrar` va solo: lleva nombre accesible (e). Todo control mide al menos `paso 11` de alto y de ancho, con `paso 2` como mínimo entre controles adyacentes.

---

## c. Matriz de estados

Hover solo con puntero, por el estado `hovered` de `Pressable`: contorno o borde `linea`, sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

| Elemento | Reposo | Hover (web) | Presionado | Foco | Seleccionado | Deshabilitado | Variante celebratoria |
|---|---|---|---|---|---|---|---|
| Monto (K3) | Borde `borde`; texto `tinta` | Borde `linea` | Inversión: fondo `tinta`; texto `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | — | — | Igual |
| Descartar (K7) | Glifo `tintaSec` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; glifo `fondo` | Contorno `foco` | — | — | Igual |
| Panel | Estático | — | — | — | — | — | Título con `glifo-trofeo`; texto celebratorio |
| Pie | Estático | — | — | — | — | — | Igual |

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
| Sin tono cálido propio | La paleta Plancha no tiene tono de aviso cálido: el pedido es neutro y no usa `intermedia` ni `error`, que son estados de rendimiento |
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

## f. Propuestas pendientes (D10)

Cambios respecto de `main` que el boceto no dibuja. Quedan pendientes hasta que el usuario las apruebe; el cuerpo de la ficha (a a e) las describe aplicadas.

### f.1 Propuestas

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| DON-P1 | Los cuatro montos son botones de marco (K3) en lugar de botones rellenos. El pedido deja de ser el bloque más pesado de la pantalla | `main` los rellena con el tono de aviso. En Results, con los montos rellenos y «Volver a practicar» (K1) habría una hilera de botones de relleno `tinta` y la acción primaria perdería jerarquía. Costo: el pedido llama menos la atención que hoy y puede bajar los toques | visual | pendiente |

### f.2 Variante sin el cambio

| Id | Si no se aprueba | Detalle |
|---|---|---|
| DON-P1 | Montos K1 rellenos | Cada monto: fondo `tinta`, texto `fondo` en `dato` (T7), borde `tinta`, `border`; alto `paso 11`; celdas iguales separadas por `paso 2`, como en a.2. Hover (web): contorno `linea`, `border-2`. Presionado: inversión, fondo `superficie`; texto `tinta`; borde `linea`. Foco: contorno `foco`, `border-2`, separado `paso 0.5`. Panel, título, texto y pie no cambian. En Results la pantalla pasa a tener una hilera de botones rellenos y, debajo, «Volver a practicar» (K1): `Results.md` no cambia, el pedido sigue entre el trío y los botones |

---

## g. Desviaciones del boceto

Solo quedan acá las que no admiten otra variante: las fija un invariante (D6, spec o D10), el dato real o la escala de tokens (`comun.md` §8). Todo lo demás es propuesta (f) o conservado de main (h).

| Boceto | Ficha | Motivo |
|---|---|---|
| Sin figura de este componente | Panel con la gramática del boceto | El boceto no lo cubre; `main` fija funciones, datos y copy (D10) |
| (`main`) fondo y borde de la familia de aviso (`warning*`) | Panel `superficie` con marco `linea` | La paleta Plancha no tiene tono cálido (`tokens.md` a.1); un tono de estado (`intermedia`, `error`) se leería como rendimiento |
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
