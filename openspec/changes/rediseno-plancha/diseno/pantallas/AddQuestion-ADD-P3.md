# AddQuestion · propuesta `ADD-P3` · selector de tema desplegable (tarea 3.9)

| Campo | Valor |
|---|---|
| Pantalla | `AddQuestionScreen` (`src/screens/AddQuestionScreen.js`), grupo «Tema» (`AddQuestion.md` a.1, bloque 2) |
| Estado | **Aprobada (usuario, 2026-10-11)**. Implementada en la tarea 3.9c; el usuario revisa la pantalla implementada antes del commit (`CONVENCIONES.md` C2). Sustituye a `ADD-P1` |
| Origen | Usuario, 2026-10-11, al ver las capturas de la 3.9: «3.9 no aprobado, el usuario debería scrollear demasiado, debemos ingeniar un desplegable o submenú» |
| `ADD-P1` | **Rechazada** (usuario, 2026-10-11). Con 27 temas (BCYT) los filtros K4 ponen el rótulo «Enunciado de la pregunta» a 1 174 px del borde superior a 390 px y a 1 382 px a 320 px (`evidencia/despues/3.9/agregar-390-claro.png`) |
| Variante sin el cambio | Ninguna: `ADD-P1` está rechazada y `ADD-P3` es la vigente (`CONVENCIONES.md` C2) |
| Cambia | Solo el selector de tema. Enunciado, opciones, explicación, guardado, validaciones y diálogos no cambian (D6) |
| Anexo | Integrada el 2026-10-11 (Diseñador) en `AddQuestion.md` (a a f e i), `comun.md` (§5.2, §5.3, §8, §9 y §12.3) y `tokens.md` (c.3); sección k. Este archivo queda como **anexo** de `AddQuestion.md`: conserva las alternativas evaluadas, la interacción, el componente, el contraste, las medidas y las figuras. Ante una diferencia rigen la ficha y `comun.md`. Alto máximo de la lista corregido el 2026-10-13 (tarea 5.2, `E-01`): `paso 72` con la lista plana y `paso 80` con rótulos de grupo; ver `AddQuestion.md` j. Apertura con la elegida fuera de vista corregida el mismo día (`E-01b`, aprobado por el usuario): alineada a fila con la elegida tercera, en vez de centrada; ver `AddQuestion.md` d.4 y j |
| Insumos | `comun.md` §5 (K3, K7), §6 (lámina), §9 (`glifo-chevron`), §12.2 (marca de parcial); `Settings.md` a.3 (plegable); `src/components/plancha/` |
| Figuras y medidas | `.orca/reports/add-p3/` (sección i). `maqueta-add-p3.html` reúne las 18; `generar.mjs`, `capturar.mjs` y `contraste.mjs` las regeneran desde `colores.js`, `glifos.js` y `topics.js` |

---

## Decisiones del Ingeniero y estado de la implementación (3.9c)

| Tema | Decisión |
|---|---|
| Dos toques (abrir y elegir) en lugar de uno | **Aceptado** (l, costo) |
| Parcial de cada tema (e.2) | **Hoy no es un dato**: no se agregan datos a los bancos. `AddQuestionScreen` pasa la lista **plana** (figura F11); `Desplegable` queda preparado para `grupos` (rótulos y `marca`) si algún día llega el dato |
| Componente | `Desplegable` en `src/components/plancha/Desplegable.js` (K3 `abierto` + lámina + filas K7); API en el encabezado de `plancha/index.js` |
| `FilaLista` | Prop `seleccionado` (regla K7 «elegida»: fondo `tinta`, texto `fondo`, `aria-selected`), más `rol`, `onKeyDown`, `registrar` y `tabIndex` |
| `Control.js` | `aria-haspopup`, `aria-controls` y `aria-selected`, más `tabIndex` (parada de Tab única en la lista); valores por defecto sin efecto en los usuarios actuales |
| Alto máximo de la lista abierta | `paso 72` (288 px, `max-h-72`) con la lista plana, que es la que se publica, y `paso 80` (320 px, `max-h-80`) con rótulos de grupo: sin token nuevo. Hasta `E-01` (5.2, 2026-10-13) era `paso 80` en los dos casos |
| Aceptación j.14 (grupos) | Sin el dato del parcial no hay rótulos de grupo: el e2e verifica la lista plana (ningún `group`) y el orden de `TOPICS`. La ruta agrupada de `Desplegable` no tiene consumidor ni e2e hasta que exista el dato |
| `MarcaParcial` (g.1) | Extraída a `src/components/plancha/MarcaParcial.js` en la tarea 5.2 (`B-02`, tanda g4a, 2026-10-13): la usan `Desplegable`, el `Segmento` de TopicSelect y la insignia del quiz. Hasta `B-02` estaba sin extraer: `Desplegable` dibujaba su marca internamente y no se tocaba `QuizScreen.js` |

---

## Resumen

| Aspecto | `ADD-P1` (rechazada) | `ADD-P3` |
|---|---|---|
| Cerrado | 27 filtros K4 con salto de línea: 20 filas a 390 px, 24 a 320 px | Una fila: un disparador K3 que muestra el tema elegido |
| Abierto | — | Lámina en línea bajo el disparador, con filas K7, de alto máximo `paso 72` (lista plana) o `paso 80` (con rótulos de grupo) y scroll vertical propio |
| Agrupado | No | Por parcial, si la materia tiene parciales y el dato existe (sección e) |
| Elegir un tema | Un toque | Dos toques: abrir y elegir (sección l, costo) |
| Teclado | K4: las 27 opciones son paradas de Tab | Una parada; flechas, Inicio, Fin, letras, Enter, Espacio y Escape |
| Alto del formulario a 390 px | 1 863 px (2,2 ventanas de 844) | 879 px (1,04 ventanas) |
| Componente | `Segmento` (K4) | `Desplegable` nuevo en `plancha/` (sección g): K3 + lámina + K7 |

---

## Alternativas evaluadas

| Alternativa | Veredicto | Por qué |
|---|---|---|
| Desplegable en línea (disparador K3 y lámina K7 bajo él) | **Elegida** | No necesita capa flotante, telón, medida de posición ni trampa de foco; empuja el formulario mientras está abierta y no tapa ningún campo; usa K3 `abierto` (precedente: plegable de Ajustes), K7 y lámina |
| Menú flotante anclado | Descartada | Sin sombra ni telón (`tokens.md` a.2) lo único que lo separa de los campos que tapa es su borde; exige captura de toque exterior, medir hacia dónde abre y recortarlo contra la ventana |
| Hoja inferior | Descartada | Pide telón para separarse de la página y el sistema excluye la transparencia; a 768 y 1280 px queda una hoja flotante de 448 px; suma capa modal, trampa de foco y área segura |
| Submenú en dos pasos (parcial y después tema) | Descartada | Duplica los toques y obliga a saber en qué parcial cae un tema que el usuario ya conoce por nombre; 4 de las 6 materias no tienen parciales |
| `<select>` nativo | Descartada | La lista la dibuja el sistema: otra tipografía, otros colores y bordes, fuera de la Plancha; en oscuro depende de `color-scheme`; sin marca de parcial |
| Buscador dentro de la lista | Descartada (se reabre con más de ~40 temas) | Sección d.2: el tema se elige una vez por tanda de altas; máximo 27 filas en 2 grupos; no existe `glifo-buscar`; el teclado del teléfono taparía la lámina a 320 × 568; suma estado «sin resultados» y región viva. Para teclado físico rige la búsqueda por letras (d.3), sin campo |

---

## a. Layout a 390 px

### a.1 Orden vertical (solo cambia el bloque 2)

| # | Bloque | Margen superior | Margen lateral | Separación inferior | Contenido |
|---|---|---|---|---|---|
| 1 | Barra interna | — | — | — | `comun.md` §3, con volver |
| 2 | Grupo «Tema» | `paso 4` | `paso 5` | `paso 6` | Rótulo (margen inferior `paso 2`), disparador y, abierto, lámina a `paso 2` del disparador |
| 3 a 7 | Enunciado, opciones, explicación, «Guardar pregunta» y relleno inferior | — | — | — | Sin cambio (`AddQuestion.md` a.1) |

### a.2 Interior del grupo «Tema»

| Pieza | Medidas | Contenido |
|---|---|---|
| Disparador (K3, plegable) | Ancho completo de la columna; relleno `paso 3` en las cuatro caras (el del campo de texto: con el interlineado de `cuerpo` mide 48 px, igual que el campo de una opción); alto mínimo `paso 11`; `border`; fila con el nombre a la izquierda (flexible, salta de línea) y el chevron a la derecha, separados `paso 2` y centrado en vertical | Nombre del tema elegido (o el texto de ayuda) y `glifo-chevron` (chico) |
| Lámina | `comun.md` §6: cuerpo `superficie`, marco `linea` `border` y cuatro marcas de esquina; ancho completo; a `paso 2` del disparador (las marcas sobresalen `paso 1` y no lo tocan) | La región de scroll |
| Región de scroll | Relleno `paso 1` en las cuatro caras (el contorno de foco, `paso 0.5` de separación más `border-2`, mide justo `paso 1`: no se recorta ni en hover); alto máximo `paso 72` con la lista plana y `paso 80` con rótulos de grupo; scroll vertical con indicador visible; el scroll no se encadena a la página (`overscroll-contain`) | Rótulos de grupo y filas |
| Rótulo de grupo | Fila de ancho completo; relleno vertical `paso 2` y horizontal `paso 3`; fondo `fondo`; filete inferior `filete`; marca y texto separados `paso 1.5`; no es un control | Marca de parcial (`comun.md` §12.2: dos casillas de lado `paso 2.5`, separadas `paso 0.5`, llena la del parcial) y el rótulo del parcial |
| Fila de tema (K7) | Ancho completo; alto mínimo `paso 11`; relleno vertical `paso 2` y horizontal `paso 3` (el del filtro K4 que reemplaza); filete inferior `filete`, salvo en la última de cada grupo; el nombre salta de línea | Nombre del tema |

### a.3 Otros anchos (D10)

| Ancho | Columna | Particularidades |
|---|---|---|
| 768 px y 1280 px | `comun.md` §7: una columna `max-w-columna`, centrada y anclada arriba | Disparador y lámina llenan la columna; mismas medidas que a 390 px. Sin scroll horizontal en ningún estado |
| 360 px y 320 px | Ancho disponible menos margen lateral `paso 5` | El nombre salta de línea en el disparador y en las filas; chevron y casillas de la marca conservan su lado. A 320 × 568 la lámina abierta entra completa (borde inferior a 496 px de 568 con rótulos de grupo, figura F06, y a 464 px con la lista plana de `paso 72`) |
| Escritorio (desde 1024 px) | Una columna `lectura`, como el quiz (`ESC-P9` rechazada) | Disparador y lámina llenan la columna; abre hacia abajo y empuja el formulario, como a 390 px. Ver la sección «Escritorio» de `AddQuestion.md` |

---

## b. Elementos

| Elemento | Frente | Fondo | Borde | Paso tipográfico | Filete | Glifo | Par |
|---|---|---|---|---|---|---|---|
| Rótulo «Tema» | `tintaSec` | `fondo` | — | `rotulo` | — | — | T3 |
| Disparador en reposo (K3) | `tinta` | `superficie` | `borde`, `border` | `cuerpo` | — | `glifo-chevron` (chico), `tintaSec`, apuntando abajo | T2, N3, N4, N20 |
| Disparador sin coincidencia | `tintaSec` | `superficie` | `borde`, `border` | `cuerpo` | — | Igual | T4, N4, N20 |
| Disparador abierto (K3) | `tinta` | `superficie` | `linea`, `border` | `cuerpo` | — | `glifo-chevron` apuntando arriba, `tintaSec` | T2, N1, N2, N20 |
| Disparador deshabilitado | `inactivo` | `superficie` | `filete`, `border` | `cuerpo` | — | `inactivo` | X5 |
| Lámina | — | `superficie` | `linea`, `border`; marcas de esquina (§6) | — | — | — | N1, N2 |
| Rótulo de grupo | `tintaSec` | `fondo` | — | `rotulo` | `filete` inferior | Marca de parcial, `tintaSec` | T3, N19, X1, X2 |
| Fila en reposo (K7) | `tinta` | `superficie` | — | `cuerpo` | `filete` inferior | — | T2, X2 |
| Fila elegida (K7, regla nueva) | `fondo` | `tinta` | — | `cuerpo-fuerte` | — | — | T7, N6 |

El disparador lleva `cuerpo` y no `cuerpo-fuerte`: muestra un valor y no ejecuta una acción, así no compite con «Agregar opción» y «Guardar pregunta». No lleva `campo`: no se edita, y `campo` no se usa en texto que no se edita (`tokens.md` b.2).

Glifo con texto (chevron, marca de parcial): decorativo, oculto a lectores (`aria-hidden`, `accessibilityElementsHidden`). Ningún glifo solo: el disparador entero es el control.

### Decisiones estéticas (una línea cada una)

| Decisión | Justificación |
|---|---|
| Lista en línea, no flotante | Sin sombra ni telón, una capa flotante se separa del formulario solo por su borde; en línea no tapa campos y no depende de la posición |
| Lámina con marcas de esquina para la lista | Es la figura que se despliega del disparador; el marco `linea` y las marcas la separan del formulario sin sombra (REFERENCIAS: plancha, sin bloques genéricos) |
| Fila elegida por inversión `tinta`/`fondo`, sin tilde | Misma gramática que el filtro K4 que reemplaza y que la selección de K3 (§5.1); `glifo-acierto` significa «correcta» (§9) y no se reutiliza para «elegida» |
| Chevron `tintaSec` y no `acento` | Señal secundaria junto al nombre (`tinta`); mismo criterio que el chevron de las filas de lista (§9, N20). El `acento` de Ajustes acompaña a la palabra «Ver», que acá no existe |
| Rótulo de grupo en banda `fondo` | Un escalón bajo `superficie` separa los grupos sin color ni sombra; la marca de parcial es la de `PAR-P2`, que el usuario ya aprobó |
| Disparador en `cuerpo` regular | Es un valor, no una acción (ver arriba) |
| Alto máximo que deja una fila cortada al pie: `paso 72` con la lista plana y `paso 80` con rótulos (5.2, `E-01`) | Una fila cortada al pie, con su línea de texto partida, avisa que hay más. Con rótulos de grupo (BCYT con el dato): 4 + 33 + 6 × 44 + 19 = 320, o sea el rótulo, seis filas y 19 px de la séptima. Con la lista plana, que es la que se publica: 4 + 6 × 44 + 20 = 288. Con `paso 80` la lista plana dejaba siete filas y 8 px de relleno, sin texto. La lámina abierta entra en 568 px de alto |

---

## c. Matriz de estados

Hover solo con puntero (estado `hovered` de `Pressable`), sin `box-shadow` ni `rgba` ni cambio de layout. Toda clase de token Plancha se escribe en par (`x` y `dark:xD`).

### c.1 Controles

| Elemento | Reposo | Hover (web) | Presionado | Foco | Elegido o abierto | Deshabilitado |
|---|---|---|---|---|---|---|
| Disparador (K3) | Borde `borde`; texto `tinta`; chevron `tintaSec` abajo | Borde `linea` | Inversión: fondo `tinta`; texto y chevron `fondo`; borde `tinta` | Contorno `foco`, `border-2`, separado `paso 0.5` | Abierto: borde `linea`; chevron arriba; estado accesible expandido | Borde `filete`; texto y chevron `inactivo`; sin toque, hover ni foco; estado accesible deshabilitado |
| Fila (K7) | Texto `tinta`; filete inferior `filete` | Contorno web `linea`, `border` | Inversión total: fondo `tinta`; texto `fondo` | Contorno `foco`, `border-2`, separado `paso 0.5` | Elegida: fondo `tinta`; texto `fondo` en `cuerpo-fuerte`; estado accesible seleccionado; hover y presionado no la cambian | Texto `inactivo`; sin toque, hover ni foco; estado accesible deshabilitado (la API lo admite; AddQuestion no lo usa) |
| Rótulo de grupo | Estático | — | — | — | — | — (no es un control: sin hover, presionado ni foco) |

| Combinación | Resultado |
|---|---|
| Hover y foco a la vez | Gana el foco (un solo contorno) |
| Presionado con el disparador abierto | Inversión mientras dura el toque; al soltar cierra |
| Elegida y hover o presionado | Sin cambio: el relleno ya es el máximo |

### c.2 Estados de la pantalla (suman a `AddQuestion.md` c.2)

| Estado | Condición | Efecto |
|---|---|---|
| Inicial | Al abrir | Disparador cerrado con el nombre del primer tema de `TOPICS` (D6) |
| Abierto | Toque, Enter, Espacio o flecha sobre el disparador | Lámina en línea; el foco pasa a la fila elegida |
| Elegido | Toque, Enter o Espacio sobre una fila | `setTopic(valor)`; la lámina cierra; el foco vuelve al disparador |
| Cancelado | Escape, Tab, Shift+Tab, o toque sobre el disparador abierto | La lámina cierra; el tema no cambia |
| Guardando | `saving` | Disparador deshabilitado; si estaba abierto, cierra |
| Tras «Agregar otra» | `addUserQuestion` resuelve | Conserva el tema (invariante vigente) |
| Sin coincidencia | `topic` no está entre las opciones | Disparador con el texto de ayuda «Elegí un tema» en `tintaSec` |
| Sin temas | `TOPICS` vacío | Disparador deshabilitado con el texto de ayuda; no ocurre en las seis materias |

---

## d. Interacción

### d.1 Abrir y cerrar

| Acción | Efecto |
|---|---|
| Tocar o hacer clic en el disparador cerrado | Abre. La lámina aparece en línea y empuja el formulario hacia abajo; no tapa campos |
| Tocar el disparador abierto | Cierra; el foco queda en el disparador |
| Elegir una fila | `topic` cambia, cierra y devuelve el foco al disparador |
| Escape | Cierra sin cambiar el tema; el foco vuelve al disparador |
| Tocar o enfocar otro control con puntero | No cierra: cerrar movería el formulario bajo el dedo. El disparador cierra por toque |
| Tab o Shift+Tab | Cierra sin cambiar el tema; el foco sigue el orden de DOM (Tab: el enunciado; Shift+Tab: el disparador) |
| `saving` | Cierra y deshabilita |
| Si la lámina no entra en la ventana al abrir | La página se desplaza lo mínimo para mostrarla completa (`block: 'nearest'`). A 320 × 568 no hace falta |
| Animación | Ninguna: abre y cierra de inmediato, sin transición de layout (`comun.md` §5.1 ya excluye la de hover). Nada que reducir con `prefers-reduced-motion` |

### d.2 Recorrido de la lista

| Aspecto | Regla |
|---|---|
| Orden | El de `Object.entries(TOPICS)`. Los grupos son tramos contiguos de ese orden: no reordenan, así el tema inicial sigue siendo el primero de `TOPICS` |
| Grupos | Un rótulo por parcial de `materia.config.parciales`, solo si el dato existe (sección e). Sin dato o sin parciales: lista plana, sin rótulos |
| Alto | El del contenido hasta `paso 72` con la lista plana y `paso 80` con rótulos de grupo; con más, scroll vertical dentro de la región. El tope deja una fila cortada al pie, con su línea de texto partida (5.2, `E-01`). Con 27 temas y rótulos: 1 262 px de contenido, el rótulo, seis filas y 19 px de la séptima; con la lista plana: 1 196 px, seis filas y 20 px de la séptima |
| Al abrir | Si la fila elegida no está a la vista, la región se desplaza hasta alinear al borde superior la fila dos lugares antes de la elegida: la elegida queda tercera, con dos filas de contexto arriba (5.2, `E-01b`, aprobado por el usuario, 2026-10-13; hasta entonces la dejaba centrada, F09). Los rótulos de grupo no cuentan como fila. Con el tema por defecto queda arriba |
| Rótulos de grupo | Se desplazan con la lista: sin posición pegajosa (`comun.md` §7.2, «Anclado») |
| Nombres largos | Saltan de línea en filas y disparador; nunca se abrevian con puntos suspensivos (`Histología del tubo digestivo…` y `Histología renal…` serían ambiguos) |
| Por qué sin buscador | El alta en serie conserva el tema: se elige una vez por tanda. El máximo es 27 filas en 2 grupos (12 y 15). El teclado físico busca por letras (d.3) |

### d.3 Teclado

| Dónde | Tecla | Efecto |
|---|---|---|
| Disparador | Enter, Espacio, Flecha abajo, Flecha arriba | Abre; el foco pasa a la fila elegida (a la primera si no hay elegida) |
| Disparador | Tab | Sigue al enunciado: la lista cerrada no tiene paradas |
| Lista | Flecha abajo, Flecha arriba | Foco a la fila siguiente o anterior, saltando rótulos y filas deshabilitadas; sin vuelta en los extremos |
| Lista | Inicio, Fin | Primera y última fila |
| Lista | Re Pág, Av Pág | Siete filas hacia arriba o abajo, sin pasar del extremo |
| Lista | Enter, Espacio | Elige la fila con foco, cierra y devuelve el foco al disparador |
| Lista | Escape | Cierra sin cambiar el tema y devuelve el foco al disparador |
| Lista | Letra o cifra | Salta a la siguiente fila cuyo nombre empieza con lo tipeado; sin distinguir mayúsculas ni tildes; el búfer se vacía tras 800 ms; con el búfer activo Espacio se agrega al búfer. En BCYT, «te» va a «Tejido epitelial» |
| Lista | Tab, Shift+Tab | Cierra sin cambiar el tema (d.1) |
| Cualquiera | Con Alt, Ctrl o Meta | No se actúa (Alt+← y Cmd+← son «atrás» del navegador) |

El foco sigue a la fila activa: una sola parada de Tab dentro de la lista (la fila con foco). La selección solo cambia con Enter, Espacio o toque: las flechas no cambian el tema. Es la diferencia con K4 (`comun.md` §5.2, regla 2.9-7), donde las flechas sí lo cambian.

### d.4 Lector de pantalla

| Pieza | Rol | Nombre | Estado |
|---|---|---|---|
| Disparador | `button` con `aria-haspopup="listbox"` y `aria-controls` hacia la lista | «Tema: {nombre del tema}» | `aria-expanded`; `aria-disabled` si guarda |
| Lista | `listbox` | «Tema» | — |
| Rótulo de grupo | `group` que contiene sus filas | «1er Parcial» o «2do Parcial» (`materia.config.parciales[].label`) | — |
| Fila | `option` | El nombre del tema | `aria-selected` (la elegida); `aria-disabled` si corresponde |
| Chevron, marca de parcial, marcas de esquina | Decorativos | — | `aria-hidden`, `accessibilityElementsHidden` |

Al elegir, el foco vuelve al disparador y el lector anuncia su nombre nuevo («Tema: Tejido óseo»): ese es el aviso del cambio. No hace falta región viva. La lista cerrada no existe en el árbol de accesibilidad.

### d.5 Puntero y tacto

| Aspecto | Regla |
|---|---|
| Tacto | Disparador de alto mínimo `paso 11` y de ancho completo; cada fila de alto mínimo `paso 11` y de ancho completo; el chevron no es un objetivo aparte. Entre disparador y lámina, `paso 2`; entre filas, filete (`comun.md` §5.1) |
| Puntero | Sin scroll horizontal en ningún ancho: el motivo de `ADD-P1` desaparece. La rueda desplaza la lista y no arrastra la página al llegar a un extremo; el indicador de scroll vertical queda visible; hover con contorno `linea` en la fila bajo el puntero |
| Teclado en el teléfono | La lámina no contiene campos: no se abre el teclado virtual |

---

## e. Datos e invariantes

### e.1 Origen de cada dato visible

| Dato | Origen | Regla |
|---|---|---|
| Opciones | `Object.entries(materia.TOPICS)` de `useMateria()`, en su orden | Igual que hoy |
| Nombre visible | `TOPICS[topic]` | Igual que hoy |
| Tema inicial | `Object.keys(TOPICS)[0]` | Sin cambio (D6) |
| Rótulos de grupo | `materia.config.parciales`: `label` y cantidad de casillas | Solo con parciales y con el dato de e.2 |
| Parcial de cada tema | **No existe como dato** | Ver e.2 |

### e.2 Dato que falta: el parcial de cada tema

| Hecho | Detalle |
|---|---|
| Hoy | `TOPICS` es `{ clave: nombre }`. El agrupado de BCYT (12 temas del 1er parcial y 15 del 2do) vive solo en los comentarios `// --- 1er Parcial ---` y `// --- 2do Parcial ---` de `src/materias/bcyt/topics.js` (líneas 3 y 16) |
| Anatomía | Tiene `parciales` en su `config.js`, pero ningún tema declara el suyo. El Diseñador no lo infiere |
| Otras cuatro | `cyr`, `dre`, `neuro` y `ryd` tienen `parciales: null`: lista plana |
| Qué hace `Desplegable` sin el dato | Lista plana, sin rótulos. Es válido y es el comportamiento de las cuatro materias sin parciales; la lámina, el teclado y los roles no cambian |
| Decisión del Ingeniero (contrato de datos, no estética) | Agregar el parcial de cada tema como dato aditivo por materia (por ejemplo un export `TOPICS_PARCIAL` junto a `TOPICS`), sin cambiar la forma de `TOPICS` que leen TopicSelect, Quiz y Ajustes. Para Anatomía lo aporta el autor de los bancos |
| Recomendación | Agregarlo: es lo que vuelve útil la lista de 27 filas |
| Decisión del usuario (2026-10-11) | Lista plana mientras el parcial de cada tema no sea dato. Agregarlo queda como decisión del Ingeniero (contrato de datos) |

### e.3 Invariantes

| Invariante | Detalle |
|---|---|
| Tema por defecto (D6) | El primero de `TOPICS`; sin cambio |
| Validación y guardado (D6) | Sin cambio: `addUserQuestion(materiaId, { topic, … })` recibe el mismo `topic`; el tema no se valida (siempre hay uno) |
| Tema entre altas | «Agregar otra» conserva el tema; el desplegable muestra el mismo nombre |
| Gestos | **Cambia**: `AddQuestion.md` d.2 fija «un toque por tema»; con `ADD-P3` son dos (abrir y elegir) |
| Eventos `track(...)` | Ninguno, como hoy |
| Sin emoji, radio, sombra, transparencia ni opacidad | Las piezas nuevas no usan ninguno (CD-24) |

---

## f. Copy

| Elemento | Actual (`ADD-P1`) | Nuevo | Motivo |
|---|---|---|---|
| Rótulo del grupo | «Tema» | Igual | — |
| Texto de ayuda del disparador | No existe | «Elegí un tema» | Cadena nueva; solo con `topic` sin coincidencia o sin temas. Voseo, como «Escribí la pregunta acá...» |
| Nombre accesible del disparador | «Tema» (grupo de filtros) | «Tema: {nombre del tema}» | Cadena accesible nueva, no visible; compone el rótulo y el valor |
| Nombre accesible de la lista | — | «Tema» | Cadena accesible nueva, no visible |
| Nombre accesible de cada grupo | — | «1er Parcial», «2do Parcial» | Sin cadena nueva: es `materia.config.parciales[].label` |
| Nombre de cada tema | `TOPICS[clave]` | Igual | — |

---

## g. Componente compartido `Desplegable`

Hace falta uno nuevo: ninguna clase K1 a K7 resuelve «un valor y una lista corta de entre la que elegir». Compone piezas que ya existen, sin glifo ni token nuevo.

### g.1 Reutilización

| Pieza | Existente | Cambio necesario |
|---|---|---|
| Disparador | `ControlMarco` (K3) con `abierto` y `children` en función | Ninguno de aspecto. Hace falta emitir `aria-haspopup` y `aria-controls` (hoy `Control` solo emite `aria-checked`, `aria-pressed` y `aria-expanded`) |
| Lámina | `Lamina` | Ninguno |
| Fila | `FilaLista` (K7) con `filete` y `children` en función | Prop nueva `seleccionado`: aspecto invertido, `aria-selected` y rol `option` (`Control` ya acepta `rol`) |
| Marca de parcial | Hasta `B-02` (5.2, 2026-10-13) se armaba en línea en `QuizScreen.js` (insignia) | Extraerla a un componente `MarcaParcial` para que la usen el quiz, el filtro de TopicSelect y el rótulo de grupo. Hecho en 5.2 (`B-02`): `src/components/plancha/MarcaParcial.js` |
| Región de scroll | — | La define `Desplegable`: `ScrollView` de alto máximo `paso 72` con `opciones` (lista plana) y `paso 80` con `grupos`, y relleno `paso 1` |
| Glifo | `glifo-chevron` | Ninguno. Apunta abajo girado 90° y arriba girado 270° (`comun.md` §9, «Indicaciones de forma») |

### g.2 API

| Prop | Tipo | Obligatoria | Detalle |
|---|---|---|---|
| `accessibilityLabel` | string | Sí | Nombre del campo («Tema»); compone el nombre del disparador y de la lista. Guardia en desarrollo como el resto de `plancha/` |
| `opciones` | `[{ valor, etiqueta, deshabilitado? }]` | Una de las dos | Lista plana |
| `grupos` | `[{ id, etiqueta, marca?: { indice, de }, opciones }]` | Una de las dos | Lista agrupada; `marca` dibuja la marca de parcial |
| `valor` | string | Sí | Clave elegida; sin coincidencia muestra `textoDeAyuda` |
| `alCambiar(valor)` | función | Sí | Se llama una vez por elección, no por flecha |
| `textoDeAyuda` | string | No | Texto del disparador sin coincidencia |
| `deshabilitado` | boolean | No | Cierra y deshabilita |
| `className` | string | No | Solo layout (ancho, márgenes), como el resto de `plancha/` |
| `testID` | string | No | — |

Uso en AddQuestion (reemplaza el `Segmento` de `AddQuestionScreen.js`: hoy, en el árbol de trabajo de la 3.9, líneas 195 a 200):

```jsx
<Desplegable
  accessibilityLabel="Tema"
  grupos={gruposDeTemas(materia)}   // o `opciones` si no hay dato de parcial
  valor={topic}
  alCambiar={setTopic}
  textoDeAyuda="Elegí un tema"
  deshabilitado={saving}
  className="w-full"
/>
```

### g.3 Dónde vive y quién más lo usaría

| Pregunta | Respuesta |
|---|---|
| ¿Dónde vive? | En `plancha/`: compone K3, K7 y lámina, y su contrato de teclado y roles es de la Plancha, no de la pantalla. Solo AddQuestion lo usa hoy; anticiparlo no cuesta una API distinta: un segundo consumidor no la cambia |
| Otros candidatos hoy | Ninguno: Ajustes usa un segmentado de 2, TopicSelect filtros de 3 y el temporizador es K5, y Revisión un filtro de pocas opciones. No hay otra elección única con más de ~6 opciones |
| Fuera de alcance | Multiselección, buscador, opciones con ilustración. No se prevén props para ellos |

---

## h. Contraste (calculado desde `colores.js`)

Fórmula y truncado de `tokens.md` e. Ningún par nuevo: todos son pares ya medidos (E1 a E4). Reproducir: `node .orca/reports/add-p3/contraste.mjs`.

| # | Par (frente sobre fondo) | Uso en `ADD-P3` | Umbral | Claro | Oscuro | Cumple |
|---|---|---|---|---|---|---|
| T1 | `tinta` sobre `fondo` | Texto sobre la página (barra, ayuda) | 4,50:1 | 16,32 | 15,97 | sí |
| T2 | `tinta` sobre `superficie` | Nombre del tema en el disparador; fila en reposo | 4,50:1 | 17,82 | 14,91 | sí |
| T3 | `tintaSec` sobre `fondo` | Rótulo «Tema»; rótulo de grupo (banda `fondo`) | 4,50:1 | 7,25 | 7,51 | sí |
| T4 | `tintaSec` sobre `superficie` | Texto de ayuda «Elegí un tema» | 4,50:1 | 7,91 | 7,01 | sí |
| T7 | `fondo` sobre `tinta` | Fila elegida y presionada; disparador presionado | 4,50:1 | 16,32 | 15,97 | sí |
| N1 | `linea` sobre `fondo` | Marco y marcas de esquina de la lámina contra la página | 3,00:1 | 16,32 | 12,50 | sí |
| N2 | `linea` sobre `superficie` | Borde del disparador abierto; contorno de hover de una fila | 3,00:1 | 17,82 | 11,67 | sí |
| N3 | `borde` sobre `fondo` | Borde del disparador en reposo contra la página | 3,00:1 | 3,47 | 4,21 | sí |
| N4 | `borde` sobre `superficie` | Borde del disparador contra su relleno | 3,00:1 | 3,78 | 3,93 | sí |
| N6 | `tinta` sobre `superficie` | Relleno de la fila elegida contra la lámina | 3,00:1 | 17,82 | 14,91 | sí |
| N7 | `foco` sobre `fondo` | Contorno de foco del disparador | 3,00:1 | 6,98 | 11,70 | sí |
| N8 | `foco` sobre `superficie` | Contorno de foco de una fila dentro de la lámina | 3,00:1 | 7,62 | 10,92 | sí |
| N19 | `tintaSec` sobre `fondo` | Marca de parcial del rótulo de grupo | 3,00:1 | 7,25 | 7,51 | sí |
| N20 | `tintaSec` sobre `superficie` | Chevron del disparador | 3,00:1 | 7,91 | 7,01 | sí |
| X2 | `filete` sobre `superficie` | Filete entre filas (decorativo) | — | 1,85 | 1,40 | exento |
| X5 | `inactivo` sobre `superficie` | Texto y chevron deshabilitados | — | 3,78 | 3,93 | exento |

Pares bajo umbral: 0. `tokens.md` e no cambia (CD-27).

---

## i. Revisado, figuras y medidas

Medidas con Chrome headless sobre `maqueta-add-p3.html` (BCYT, 27 temas, tema por defecto). Alturas desde el borde superior de la pantalla, con la barra interna y sin área segura ni barras del navegador. Archivo fuente: `medidas.json`.

### i.1 Medidas

| Medida | `ADD-P1` | `ADD-P3` cerrado | Cambio |
|---|---|---|---|
| Alto del grupo «Tema» a 390 px | 1 056 px | 72 px (rótulo 16, `paso 2`, disparador 48) | −984 px |
| Ordenada de «Enunciado de la pregunta» a 390 px | 1 174 px | 190 px | −984 px |
| Ordenada de «Enunciado de la pregunta» a 320 px | 1 382 px | 190 px | −1 192 px |
| Alto del formulario a 390 px | 1 863 px | 879 px | −53 % |
| Alto del formulario a 320 px | 2 071 px | 879 px | −58 % |
| Ventanas a 390 × 844 | 2,2 | 1,04 | — |
| Ventanas a 320 × 568 | 3,6 | 1,5 | — |
| Filas de filtros | 20 (390 px), 24 (320 px) | 1 | — |

| Medida con la lámina abierta | Valor |
|---|---|
| Alto de la lámina | 322 px con rótulos (región de 320 y 2 de marco); 290 px con la lista plana (región de 288), desde `E-01` |
| Cuánto empuja al formulario | 330 px con rótulos (lámina y `paso 2`): el enunciado pasa de 190 a 520 px; 298 px con la lista plana: de 190 a 488 px |
| Filas visibles en BCYT | Una fila cortada al pie. Con rótulos y `paso 80`: rótulo del 1.er parcial, 6 filas completas y 19 px de la séptima. Con la lista plana y `paso 72`: 6 filas completas y 20 px de la séptima (con `paso 80` eran 7 y 8 px de la octava) |
| Alto de cada fila | 44 px con su filete (alto mínimo `paso 11`). La maqueta registró 45 con el filete aparte; en la app son 44 (`E-01`) |
| Entra completa a 320 × 568 | Sí: borde inferior a 496 px con rótulos; 464 px con la lista plana |
| Materia sin parciales, 320 px (DRE, 9 temas) | Disparador de 70 px (el nombre salta a dos líneas); con `paso 80`, lámina de 322 px y 5 filas completas; con `paso 72` (`E-01`), lámina de 290 px y 4 filas completas más 40 de los 61 px de la quinta, cortada en su segundo renglón |
| 1280 × 800 | Columna de 408 px útiles; lámina termina a 496 px con rótulos y a 464 px con la lista plana |

### i.2 Figuras (`.orca/reports/add-p3/`)

| Id | Archivo | Qué muestra |
|---|---|---|
| F01 | `add-p3-F01-390-claro-cerrado.png` | 390 × 844, claro, cerrado |
| F02 | `add-p3-F02-390-claro-abierto.png` | 390 × 844, claro, abierto, tema por defecto |
| F03 | `add-p3-F03-390-oscuro-cerrado.png` | 390 × 844, oscuro, cerrado |
| F04 | `add-p3-F04-390-oscuro-abierto.png` | 390 × 844, oscuro, abierto |
| F05 | `add-p3-F05-320-claro-cerrado.png` | 320 × 568, claro, cerrado |
| F06 | `add-p3-F06-320-claro-abierto.png` | 320 × 568, claro, abierto: entra completa |
| F07 | `add-p3-F07-320-oscuro-cerrado.png` | 320 × 568, oscuro, cerrado |
| F08 | `add-p3-F08-320-oscuro-abierto.png` | 320 × 568, oscuro, abierto |
| F09 | `add-p3-F09-390-claro-abierto-elegido.png` | Abierto con «Genética y herencia» elegida: lista desplazada, rótulo del 2.do parcial a la vista. Muestra la apertura centrada, vigente hasta `E-01b` (2026-10-13): no se recaptura |
| F10 | `add-p3-F10-390-oscuro-abierto-foco.png` | Oscuro, foco de teclado en una fila distinta de la elegida |
| F11 | `add-p3-F11-320-claro-abierto-sin-parciales.png` | DRE: sin rótulos de grupo y nombres que saltan de línea |
| F12, F13 | `add-p3-F12-estados-claro.png`, `add-p3-F13-estados-oscuro.png` | Matriz de estados del disparador, del rótulo de grupo y de la fila |
| F14, F15 | `add-p3-F14-390-claro-completo-addp3.png`, `add-p3-F15-390-claro-completo-addp1.png` | Formulario completo a 390 px: `ADD-P3` y `ADD-P1` |
| F16, F17 | `add-p3-F16-320-claro-completo-addp3.png`, `add-p3-F17-320-claro-completo-addp1.png` | Igual a 320 px |
| F18 | `add-p3-F18-1280-claro-abierto-hover.png` | 1280 × 800, claro, abierto, hover con puntero en una fila |

`.orca/` está ignorado por git (`.gitignore:82`): las figuras no se versionan. Si el usuario aprueba y el Ingeniero quiere conservarlas, las copia a `evidencia/` o regenera con `node .orca/reports/add-p3/generar.mjs && node .orca/reports/add-p3/capturar.mjs`.

---

## j. Aceptación observable (para la 3.x y el e2e)

Ejercen el e2e `tools/e2e/suites/agregar.js`: `LEER_TEMAS`, `temasALaVista` y el bloque «K4 filtro de tema» codifican `ADD-P1` (`radiogroup` con todos los temas a la vista) y se reescriben. La versión vigente de esta lista es la de `AddQuestion.md` i: la escribe sin medidas sueltas y suma el escritorio (18), el orden de foco (19) y la fila cortada al pie (20, `E-01` y `E-01b`).

| # | Comprobación | Esperado |
|---|---|---|
| 1 | 390 × 844, tema por defecto, cerrado | «Enunciado de la pregunta» a menos de 200 px del borde superior; el grupo «Tema» mide 72 px |
| 2 | Estructura cerrada | Un `button` con `aria-haspopup="listbox"` y `aria-expanded="false"`; ningún `radiogroup` de temas; ningún `option` en el DOM |
| 3 | Abrir (toque) | `aria-expanded="true"`; un `listbox` con una `option` por cada clave de `TOPICS`, en su orden; exactamente una con `aria-selected="true"`: la del tema actual |
| 4 | Elegir una fila | La lista desaparece; el disparador muestra el nombre; `aria-expanded="false"`; el foco queda en el disparador |
| 5 | Teclado: abrir | Enter, Espacio y Flecha abajo abren y llevan el foco a la fila elegida |
| 6 | Teclado: recorrer | Flecha abajo y arriba mueven el foco sin cambiar `aria-selected`; Inicio y Fin; sin vuelta en los extremos |
| 7 | Teclado: cerrar | Escape cierra sin cambiar el tema y devuelve el foco al disparador; Tab cierra y el foco queda en el enunciado; Shift+Tab, en el disparador |
| 8 | Letras | En BCYT, «t» y «e» seguidas dejan el foco en «Tejido epitelial» |
| 9 | Objetivos | Disparador y cada fila miden al menos 44 px de alto y de ancho (a 320 px) |
| 10 | Sin desborde | A 320 px, `scrollWidth <= clientWidth` de la pantalla en cerrado y abierto; el nombre largo de DRE salta de línea |
| 11 | Entra en ventana | A 320 × 568, abierta, el borde inferior de la lámina queda a menos de 568 px |
| 12 | Guardando | Con `saving`: disparador deshabilitado (`disabled` o `aria-disabled`), lista cerrada |
| 13 | Datos (D6) | El tema inicial es `Object.keys(TOPICS)[0]`; tras «Agregar otra» el disparador conserva el nombre; `addUserQuestion` recibe el mismo `topic` elegido |
| 14 | Grupos (BCYT, con el dato) | Dos `group` con los nombres «1er Parcial» y «2do Parcial»; el orden de las `option` no cambia |
| 15 | Foco sin recorte | El contorno de foco de una fila (color `foco`, 2 px) queda dentro de la región de scroll en claro y en oscuro |
| 16 | Sin transparencia | Ninguna pieza nueva usa `box-shadow`, `rgba`, `border-radius` ni `opacity` |
| 17 | Estados y colores | Disparador y filas toman los tokens de c.1 en los dos temas |

---

## k. Integración (hecha el 2026-10-11)

| Archivo | Sección | Cambio | Quién |
|---|---|---|---|
| `pantallas/AddQuestion.md` | Cabecera, a.1, a.2, a.3 | El bloque 2 y la fila «Selector de tema» pasan a a.1 y a.2 de la ficha; a.3 suma la fila de 320 × 568 | Hecha (Diseñador) |
| `pantallas/AddQuestion.md` | b, c.1, c.2 | Las filas de filtro K4 de tema se reemplazan por las de b y c de este archivo | Hecha (Diseñador) |
| `pantallas/AddQuestion.md` | d.1, d.2, d.4 | «Sin `TOPICS` el selector queda sin filtros» pasa a «disparador deshabilitado»; la fila «Gestos» dice «dos toques por tema»; d.4 apunta a `comun.md` §5.3 | Hecha (Diseñador) |
| `pantallas/AddQuestion.md` | e | Las cuatro filas de copy de f | Hecha (Diseñador) |
| `pantallas/AddQuestion.md` | f | `ADD-P1`: rechazada (usuario, 2026-10-11). `ADD-P3`: aprobada (usuario, 2026-10-11) | Hecha (Diseñador) |
| `pantallas/AddQuestion.md` | i | La aceptación de j, sin medidas sueltas, más el escritorio (18) y el orden de foco (19) | Hecha (Diseñador) |
| `pantallas/AddQuestion.md` | «Escritorio» | `ESC-P9` rechazada; una columna `lectura` | Hecha (Diseñador) |
| `pantallas/comun.md` | §5.2 | K7: estado «elegida» (fila de selector), regla 2.9-10, y su excepción en la regla 2.9-4 | Hecha (Diseñador) |
| `pantallas/comun.md` | §5.3 (nueva) | `Desplegable`: disparador K3 abierto, lámina, filas K7; abrir y cerrar, recorrido, teclado, roles y puntero | Hecha (Diseñador) |
| `pantallas/comun.md` | §8 | `Desplegable`, región de scroll: alto máximo `paso 80`; desde `E-01` (2026-10-13), `paso 72` con la lista plana | Hecha (Diseñador) |
| `pantallas/comun.md` | §9 y §12.3 | `glifo-chevron`, columna «Lo usa»: AddQuestion (disparador del tema); rótulo de grupo con marca de parcial | Hecha (Diseñador) |
| `tokens.md` | c.3, lista de pasos en uso | `80` (320 px): alto máximo de la lista del desplegable. Sale de la escala por defecto de Tailwind; `spacing` no cambia. Desde `E-01` (2026-10-13) suma `72` (288 px) para la lista plana, y el `80` queda para los rótulos de grupo | Hecha (Diseñador) |
| `src/components/plancha/` | — | `Desplegable.js` nuevo y export en `index.js`; `FilaLista.js` con `seleccionado`; `Control.js` con `aria-haspopup`, `aria-controls` y `aria-selected`; `MarcaParcial` extraída de `QuizScreen.js` (recomendado; hecha en 5.2, `B-02`, 2026-10-13) | Programador (3.9) |
| `src/screens/AddQuestionScreen.js` | `Grupo «Tema»` | `Segmento` por `Desplegable`; el resto no cambia | Programador (3.9) |
| `tools/e2e/suites/agregar.js` | Temas | Reescribir según `AddQuestion.md` i | Programador (3.9) |
| `src/materias/*/topics.js` | Dato de parcial | Decisión del Ingeniero (e.2) | Ingeniero |

---

## l. Propuesta, costo y relación con `ESC-P9`

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `ADD-P3` | El selector de tema deja de ser un grupo de filtros K4 y pasa a ser un desplegable en línea: un disparador K3 de una fila con el tema elegido y, abierto, una lámina con filas K7 agrupadas por parcial cuando el dato existe | `ADD-P1` rechazada (usuario, 2026-10-11): 27 filtros ponían el enunciado 984 px más abajo (1 174 px frente a 190). El tema se elige una vez por tanda de altas, así que su segundo toque se paga una vez | uso | aprobada (usuario, 2026-10-11) |

| Costo | Detalle |
|---|---|
| Dos toques por cambio de tema | Rompe «un toque por tema» de `AddQuestion.md` d.2. Se paga una vez por tanda: «Agregar otra» conserva el tema |
| Scroll propio de la lista | En materias de más de ~6 temas (~7 hasta `E-01`, 2026-10-13) la lista desplaza dentro de su región (hasta ~4 ventanas de la región en BCYT). Queda acotado a la elección, no al formulario |
| Un componente nuevo y una regla nueva | `Desplegable` y K7 «elegida»; un paso en uso (`paso 80`; desde `E-01`, 2026-10-13, la lista plana usa `paso 72`) |
| Un dato que no existe | El parcial de cada tema (e.2). Sin él la lista es plana |
| Reescritura del e2e de temas | Sección j |

| Relación | Detalle |
|---|---|
| `ESC-P9` (3.10) | **Rechazada** (usuario, 2026-10-11). Su motivo era `ADD-P1`: «la lista de temas es lo más alto de la pantalla». Con `ADD-P3` el grupo mide una fila y la columna izquierda de `ESC-P9` quedaría con 72 px frente a una derecha de unos 660 px (de 190 a 848 px en F14): AddQuestion va en una columna `lectura`, como el quiz. `ADD-P3` funciona igual en todos los anchos |
| `ESC-P0` | Sin cambio: ningún token ni ancho nuevo; `paso 72` (lista plana) y `paso 80` (rótulos de grupo) aplican en todos los anchos |
| Variante sin el cambio | Ninguna (cabecera) |

FIN · ejecutar /clear
