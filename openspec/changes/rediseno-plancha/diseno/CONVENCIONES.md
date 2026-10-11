# Convenciones del rediseño Plancha

| Campo | Valor |
|---|---|
| Change | `openspec/changes/rediseno-plancha` |
| Rama | `rediseno` |
| Pedido | Usuario, 2026-10-10: «el diseñador debe también aceptar tus cambios, lleguen a convenciones y que no muera en ti, devuélvele tus conclusiones y déjalo opinar» |
| Escribe | Diseñador: postura sobre C1 a C10 (§1), convenciones propias CD-1 a CD-27 (§2), gobernanza G-1 a G-4 (§3), alineaciones (§4) |
| Responde | Ingeniero: una respuesta por conclusión técnica (ids en §1) y confirmación de CD y G |
| Estado | C1 a C10 (`msg_ca7d8edfff64`), CD-1 a CD-27 y G-1 a G-4: acordadas por Ingeniero y Diseñador el 2026-10-10. Ninguna fila `abierta` ni `propuesta` |
| Lo leen | Programador y Analista, antes de cada tarea 3.x |
| Contexto | `design.md` (D2, D3, D6, D7, D9, D10), `tokens.md`, `pantallas/comun.md` |

---

## 0. Cómo se lee

| Término | Significado |
|---|---|
| Postura | `acepta`, `acepta con ajuste` u `objeta` (en parte): la del Diseñador frente al texto del Ingeniero |
| Estado | `acordada`: el Ingeniero aceptó el texto de la columna «Redacción» y rige para ambos. `abierta`: ajuste u objeción sin respuesta. `propuesta`: regla nueva del Diseñador que el Ingeniero aún no confirmó. Los dos últimos estados son para cambios futuros (G-2): hoy todas las filas están acordadas |
| Quién decide | Estética: Diseñador, vinculante. Contratos e invariantes: Ingeniero, con la objeción registrada. Sin acuerdo: usuario |
| Pregunta | Id del mensaje `question` enviado al coordinador por cada ajuste u objeción técnica |
| CD-n | Convención del Diseñador (§2). No usa `D1` a `D10`, que son las decisiones de `design.md` |

---

## 1. Conclusiones del Ingeniero (C1 a C10)

| id | Convención | Origen | Postura | Motivo | Redacción propuesta (acordada) |
|---|---|---|---|---|---|
| C1 | El boceto manda en lo visual (color, tipografía, marcos, disposición); `main` manda en funciones, datos, copy y orden de uso. Conservar de `main` algo que el boceto omite no es propuesta: las 7 reclasificadas (HOME-P1, HOME-P3, MATERIA-P3, QUIZ-P2, QUIZ-P3, STATS-P3, STATS-P4) van a «Conservado de main» | Ingeniero (D10, base de comparación) | Acepta con ajuste (`msg_1f52a85d931c`). La reclasificación de las 7: acepta. Acordada | Eran continuidad de uso, no mejoras mías. Dos vacíos. (1) «`main` manda» no dice quién fija el aspecto de lo conservado: QUIZ-P3 conserva el temporizador, pero su alerta (marco `error`, `glifo-reloj`) es diseño Plancha. (2) Disposición y orden de uso pueden chocar sin regla; el Ingeniero ya lo resolvió a favor del orden de uso en STATS-P3 y HOME-P1 | «El boceto manda en lo visual (color, tipografía, marcos, disposición); `main`, en funciones, datos, copy y orden de uso, y si chocan gana el orden de uso. Conservar de `main` lo que el boceto omite no es propuesta, pero su aspecto lo fija la ficha con tokens Plancha, nunca `main`.» |
| C2 | Toda propuesta, visual o de uso, la aprueba el usuario. La ficha describe la variante sin el cambio al mismo nivel de detalle. Ninguna 3.x arranca con propuestas pendientes | Usuario (2026-10-10, D10) | Acepta con ajuste (`msg_3724c5ed691a`). Acordada | No choca con «lo estético lo decide el Diseñador»: el usuario aprueba apartarse del boceto que él aprobó. D10 acota el bloqueo a «su ficha»; sin ese alcance, las propuestas de 1.3 (ADD-, SET-, DON-, REV-, EXA-, VAC-, BAN-, PAR-) bloquearían 3.2 y 3.3, que no las usan. Con la propuesta resuelta, dejar ambas variantes crea dos fuentes de verdad | «Solo el usuario aprueba o rechaza una propuesta, visual o de uso. Pendiente, la ficha describe ambas variantes con el mismo detalle; resuelta, conserva solo la vigente y registra id, decisión y fecha. Una tarea 3.x no arranca con propuestas pendientes en la ficha de su superficie ni en las secciones de `comun.md` que cita.» |
| C3 | Layout en 390, 768 y 1280 px; contenido en una columna con token propio (`columna`); objetivo táctil ≥ 44; hover solo con `@media (hover: hover)`; foco visible con `foco`; áreas seguras | Usuario (2026-10-10, D10: tráfico de tablet, PC, Mac, iPhone y Android) | Acepta con ajuste (`msg_22accde9b904`). Acordada | (1) «≥ 44» no dice ambas dimensiones ni la separación. (2) 390 es referencia, no mínimo: la disposición apilada del control de tema se estimó contra 360 px (reporte 1.2-correcciones §7). (3) El guardia de hover existe (`src/utils/webStyles.js:17`) pero pinta un halo `box-shadow` con `rgba` por rol, que no distingue K1 a K7; `scripts/inject-pwa.js:47-57` lo repite y ninguna tarea reescribía ninguno de los dos | «Layout verificado en 360, 390, 768 y 1280 px, sin recorte ni scroll horizontal desde 320 px; una sola columna (`columna`, 448), centrada y anclada arriba. Objetivo táctil de 44 × 44 pt como mínimo en ambas dimensiones y al menos `paso 2` entre controles adyacentes. Hover solo con puntero (estado `hovered` de `Pressable`; `@media (hover: hover)` para el contorno genérico), sin `box-shadow` ni `rgba`. Foco con `foco`; áreas seguras.» |
| C4 | Cada emoji pasa a un glifo SVG; el texto acompaña, no sustituye; el color de cada glifo sale de la estética Plancha y de la función del emoji. Excepciones: el campo `emoji` de `getResultFeedback` (no se renderiza) y el `icon` de materia (lo reemplaza la ilustración) | Usuario (2026-10-10) | Acepta (estético, mío). Acordada | Es el criterio que fijé en `comun.md` §9 («Función» y «Por qué este color»). Cuatro precisiones, que no cambian el texto y rigen como CD-11 a CD-14: la puntuación tipográfica es texto; el glifo con texto es decorativo; `glifo-reportar` queda en `tinta`, sin alternativa roja; el spec exime además el contenido de los bancos de preguntas | — |
| C5 | Cada glifo es un SVG con `stroke="currentColor"`, `fill="none"`, un viewBox común y sin `<text>`, `<style>`, colores literales, gradientes, filtros ni máscaras | Ingeniero (spec de 1.4) | Acepta con ajuste (`msg_344be74e91c0`). Acordada | Acepto las restricciones y retiro mi «grilla propia» del glifo chico. Vacíos: (1) 1,5 px es grosor visible, no unidades del viewBox (con el `0 0 16 16` de 1.4, a `paso 6` dibujaría 2,25 px y a `paso 12`, 4,5 px); (2) D3 es una lista plana de siete tipos, sin `<g>` ni `transform`; (3) ninguna tarea convertía los 34 SVG a datos ni entregaba el componente que los dibuja: 2.1 cubre solo ilustraciones | «Cada glifo es un SVG de un viewBox común, sin `<g>`, `<use>`, `<defs>`, `transform`, `<text>`, `<style>`, colores literales, gradientes, filtros ni máscaras, con `stroke="currentColor"`, `fill="none"` y `stroke-width` en el raíz. El componente mantiene 1,5 px visibles a cualquier tamaño.» |
| C6 | Los tokens Plancha viven en el export `plancha` de `colores.js`, con las mismas claves en claro y oscuro, y conviven con los legados hasta las 3.x. Ningún valor visual literal en pantallas ni fichas | Ingeniero (D1, D9); valores del Diseñador (1.1) | Acepta con ajuste (`msg_39f6dd93ceeb`). Acordada | Verificado: 19 claves iguales y en el mismo orden. Vacíos: (1) una clase `bg-fondo` sin su `dark:bg-fondoD` pinta el claro en oscuro y ningún build lo detecta; (2) «hasta las 3.x» no tenía dueño: nadie borraba las claves legadas; (3) «literal» no excluye a `tokens.md` ni a los archivos que no pueden importar `colores.js` | «Los tokens Plancha viven en el export `plancha` de `colores.js`, con las mismas claves en claro y oscuro, y se usan siempre en par (`x` y `dark:xD`). Conviven con los legados hasta que cada 3.x deja su archivo sin ellos; la última tarea los borra. Ningún valor visual literal en `src/screens`, `src/components` ni en las fichas; los archivos que no pueden importar `colores.js` llevan el valor de su token nombrado en un comentario.» |
| C7 | Los datos de cada ilustración no llevan color; el componente recibe `color` y `colorAcento` del tema; el contorno en acento del campo de filamentos es `tono: 'acento'`. Ampliación (`msg_6226ca9ba335`): `Ilustracion` acepta `size` o `ancho` más `alto`; los datos admiten `encuadre` (`'meet'` por defecto, `'slice'`, `'none'`); el campo usa `'none'`; la ilustración de materia se expone estática en `MATERIA_LIST` | Ingeniero (D2, D3) | Acepta con ajuste (`msg_28759a57b493`). Ampliación: acepta (`msg_9baa08f4ca89`). Acordada | Verificado: un único `tono: 'acento'` (`filamentos.js:66`); las seis `ilustracion.js` sin `tono` ni opacidad. `filamentos.js` lleva `strokeOpacity` en sus 59 elementos y `tokens.md` a.2 prohíbe «transparencias de color». `encuadre: 'none'` es el boceto (`hibrido.html:132`); el estiramiento queda entre 0,80× (320 px) y 1,28× (`columna`). Hueco: la regla graduada no estaba en los datos ni en ninguna tarea | «Los datos de una ilustración no llevan color: `Ilustracion` recibe `color` (`filamento`) y `colorAcento` (`acento`). Las de materia son monocromas y sin `tono`; solo el contorno del campo de filamentos usa `tono: 'acento'`. `strokeOpacity` vale únicamente en el campo de filamentos. El campo y la regla graduada usan `encuadre: 'none'`; la regla se exporta como `regla` desde `src/assets/filamentos.js`.» |
| C8 | MATERIA-P2: «Banco real» solo con la materia disponible y su conteo cargado (ni en Cargando ni en Próximamente). BCYT ya no tiene preguntas generadas: el rótulo es verdad en las seis | Ingeniero (3.2), sobre MATERIA-P2 aprobada | Acepta con ajuste (`msg_48205669baec`). Próximamente: acepta. Cargando: objeta (estético, mío). Acordada | Verificado: seis materias con `available: true`, `CONTEOS` igual a las `source: "exam"` y 0 `generated`. En Cargando, el único transitorio es el toque (`cargandoId`); quitar la celda salta el cajetín de dos celdas a una justo al tocar y el rótulo sigue siendo cierto. «Verdad en las seis» es un hecho de hoy: bcyt tuvo generadas hasta 1.7.0 | «“Banco real” aparece en la tarjeta de una materia disponible sin preguntas generadas; se conserva en Cargando y no aparece en Próximamente.» Próximamente: una sola celda a ancho completo y el mismo alto. El rótulo se deriva del dato: `gen-conteos.mjs` emite también las generadas (2.6, en `main`) |
| C9 | Barra interna del Stack: tarea 3.1b. Quiz sin header del Stack (QUIZ-P1 aprobada), con salida, área segura, volver del navegador y `beforeRemove` intactos | Ingeniero (3.1b), sobre `comun.md` §3 y QUIZ-P1 | Acepta con ajuste (`msg_ecc4999afb6f`). Acordada | La regla está bien. `tasks.md` 3.1b sumaba «su barra propia según `Quiz.md`» y 3.5 es `QuizScreen`: la barra del quiz caía en dos tareas sobre el mismo archivo. La banda actual ya trae `handleQuit` (`QuizScreen.js:164-175`) y `beforeRemove` está en `:64`: la salida no desaparece entre tareas | «3.1b fija en `App.js` la barra interna del Stack y el `headerShown: false` de Quiz, y suma el área segura superior a `QuizScreen`; la barra propia del quiz es de 3.5. En ambas, la salida, el volver del navegador y `beforeRemove` quedan intactos.» |
| C10 | Los contratos de diseño viven versionados en `openspec/changes/<change>/diseno/`; `referencias-diseno/` es material de trabajo sin versionar | Usuario (2026-10-10, tarea 1.7) | Objeta en parte (`msg_c79b09da4a5f`). La regla general: acepta. Acordada | `.gitignore:63` ignora `referencias-diseno/` entera, y de ahí dependían contratos versionados: `hibrido.html` (68 KB) es el «boceto manda» de C1, el insumo de `tokens.md` y la fuente de 2.1; `REFERENCIAS.md` (4,2 KB) es el brief y las exclusiones que cita `disenador.md:28`. En un clon nuevo o en otro worktree ninguno existía y C1 dejaba de ser auditable | «Los contratos de diseño y las fuentes que citan viven versionados en `openspec/changes/<change>/diseno/` (incluidos `hibrido.html` y `REFERENCIAS.md`, congelados en `diseno/referencia/`, +72 KB). `referencias-diseno/` queda para lo regenerable o ajeno: tableros PNG, `ref1-6.jpg` y conceptos descartados.» |

### Dónde quedó aplicada cada conclusión

| id | Aplicada en | Verificado |
|---|---|---|
| C1 | `design.md` D10 («Base de comparación») y Non-Goals; `proposal.md` «Open questions» 1 | `git diff` |
| C2 | Esta tabla (§1); las fichas de 1.2 ya siguen el ciclo de vida | Lectura de las fichas |
| C3 | `tasks.md` 3.1 (`webStyles.js`), aceptación común de 3.x (360 y 320 px, 44 × 44, `paso 2`) y 4.1 (`inject-pwa.js`) | `git diff` |
| C4 | `proposal.md` (emojis a glifo SVG); CD-11 a CD-14; `comun.md` §9 (`glifo-reportar`) | `rg` |
| C5 | `tasks.md` 2.5 (`glifos.js` y `Glifo`); `comun.md` §8 y §9 (viewBox común) | `rg` sin «grilla propia» |
| C6 | `tasks.md` 5.0 y aceptación común de 3.x (pares, sin legados); literales: esta tabla | `git diff` |
| C7 | `design.md` D2 y D3 (`encuadre`, `ancho '100%'`, `strokeOpacity`, acceso estático); `tasks.md` 3.2 (`regla`) | `git diff` |
| C8 | `tasks.md` 2.6 y 3.2; `MateriaSelect.md` c, d.1 y f | `rg 'Banco real'` |
| C9 | `tasks.md` 3.1b | `git diff` |
| C10 | `diseno/referencia/` (`hibrido.html` y `REFERENCIAS.md`); `design.md` Context | `cmp` con los originales; `git check-ignore` no lo ignora |

### Decisiones estéticas registradas (vinculantes)

| id | Decisión | Fila |
|---|---|---|
| E1 | Lo conservado de `main` se dibuja con tokens Plancha; el aspecto lo fija la ficha, no `main` | C1 |
| E2 | Acepto C4 tal cual; puntuación tipográfica = texto; glifo con texto = decorativo; `glifo-reportar` en `tinta`; contenido de bancos exento | C4 |
| E3 | Retiro la «grilla propia» del glifo chico: viewBox común; grosor visible de 1,5 px a todo tamaño | C5 |
| E4 | Ilustraciones de materia monocromas; `strokeOpacity` solo en el campo de filamentos; campo y regla con `encuadre: 'none'` | C7 |
| E5 | «Cargando» conserva las dos celdas del cajetín; «Próximamente» una sola celda a ancho completo y mismo alto | C8 |

---

## 2. Convenciones del Diseñador (origen: Diseñador; estado: acordada, Ingeniero y Diseñador, 2026-10-10)

Estado de CD-1 a CD-27: acordada (Ingeniero y Diseñador, 2026-10-10). Reglas transversales que el Programador y el Analista aplican en cada 3.x. «Vive hoy en» dice dónde está la especificación completa; las filas con «reporte» o «nuevo» no estaban en ningún contrato versionado. Los comandos se corren desde la raíz del repo.

### 2.1 Estados de control

| id | Convención | Vive hoy en | Cómo se verifica |
|---|---|---|---|
| CD-1 | Toda superficie interactiva es una clase K1 a K7 de `comun.md` §5.2. Ninguna pantalla define estados propios fuera de esa matriz | `comun.md` §5.2 | Cada control del diff nombra su clase; sus estados coinciden con la fila |
| CD-2 | Presionado = inversión `tinta`/`fondo` (nativo: callback de `Pressable`; web: `:active`). La opacidad no es un estado | `comun.md` §5.1; COMUN-P2 | `rg -n activeOpacity src App.js` vacío al cierre (hoy 21 líneas) |
| CD-3 | Hover (web, con puntero) = contorno o borde `linea`. Sin cambio de tamaño ni de layout, sin `box-shadow` ni `rgba` | `comun.md` §5.1; COMUN-P2 | `rg -n 'box-shadow\|rgba' src scripts` sin halos de hover; captura con puntero |
| CD-4 | Foco = contorno `foco`, `border-2`, separado `paso 0.5`, solo por teclado, sin mover el layout. Si coincide con hover, gana el foco: un solo contorno | `comun.md` §5.1; N7, N8 | Tab en web: el contorno aparece y no desplaza a los vecinos |
| CD-5 | Deshabilitado = borde `filete`, texto y glifo `inactivo`, sin toque, hover, presionado ni foco, con `accessibilityState={{ disabled: true }}`. Seleccionado = relleno `tinta` y texto `fondo`, con `accessibilityState` de selección; hover y presionado no lo cambian | `comun.md` §5.1, §5.2 | Cada control con estado lleva su `accessibilityState` |

### 2.2 Estados semánticos

| id | Convención | Vive hoy en | Cómo se verifica |
|---|---|---|---|
| CD-6 | Un estado semántico lleva color, marca y texto o valor; nunca solo color. Acierto = `glifo-acierto`; error = `glifo-error`; intermedia = `glifo-intermedia` | `comun.md` §4; spec `design-system` | Captura en escala de grises: los tres estados se distinguen |
| CD-7 | El mismo estado usa el mismo token y la misma marca en toda la app, también en «Más falladas». Los cortes los fija el código: Stats 80 y 60; Results 75 y 50 en los tramos de color y 90, 75, 60 y 50 en los mensajes. Ninguna ficha ni pantalla inventa un corte | `comun.md` §4; D6; reporte 1.2 | Los cortes de la pantalla coinciden con `StatsScreen.js` y `ResultsScreen.js` |
| CD-8 | Reserva de color. `acierto`: correcta, banda alta, cifra de aciertos y `glifo-trofeo`. `error`: incorrecta, banda baja, validación y alerta de tiempo. `intermedia`: banda media. `acento`: identidad (id de materia, chips, nota, mezcla, contorno del campo). Todo lo demás va en `tinta` o `tintaSec` | `tokens.md` a.1 «Uso»; `comun.md` §9; reporte 1.2 | Revisión por color en 5.2: ningún token semántico fuera de su función |

### 2.3 Glifos

| id | Convención | Vive hoy en | Cómo se verifica |
|---|---|---|---|
| CD-9 | Grosor visible del trazo de un glifo: 1,5 px a cualquier tamaño (`stroke-width` = 1,5 × lado del viewBox / lado en px; con el `0 0 16 16` de 1.4 queda `24 / lado`). Un solo grosor, terminación `square` y unión `miter` | `tokens.md` c.2; `comun.md` §8; `svg/glifos/NOTAS-GLIFOS.md` §3; `tasks.md` 2.5 | Captura a `paso 4`, `paso 6` y `paso 12`: el mismo grosor |
| CD-10 | Lados: grande `paso 6`; chico `paso 4`; estado vacío `paso 12`; cuadro de acción de Home `paso 10`. El control que lo contiene mide `paso 11` y el glifo va centrado | `comun.md` §5.1, §8 | — |
| CD-11 | El color del glifo es el del texto o estado del control que lo contiene (`currentColor`). Ningún glifo introduce un token; el color aparece solo con un estado semántico o con la marca (`acento`) | `comun.md` §9, «Criterio de color» | Cada glifo cita su par N#, T# o X# |
| CD-12 | Glifo con texto: decorativo, oculto a lectores (`aria-hidden`, `accessibilityElementsHidden`). Glifo solo-icono: lleva `accessibilityLabel` con la acción que ejecuta | `comun.md` §2.3 (solo control de tema); reporte | `glifo-cerrar`, `glifo-volver` y los glifos solos del diff, con su nombre accesible |
| CD-13 | La puntuación tipográfica (`·`, `≥`, `–`, `/`, `%`, `« »`) es texto y no pasa a glifo. Pasan a glifo el emoji y el símbolo con función de ícono: los de la columna «Reemplaza» de `comun.md` §9. El contenido de los bancos queda fuera | `comun.md` §9; spec `design-system`; nuevo | `rg -n '\p{Extended_Pictographic}' src/screens src/components App.js` y `rg -n '[\x{00D7}\x{2190}-\x{2199}\x{203A}\x{2212}\x{2713}\x{2715}\x{2717}\x{25B2}\x{25BC}]' src/screens src/components App.js` vacíos (hoy 9 y 8 archivos) |
| CD-14 | `glifo-reportar` va en `tinta`: una bandera roja se leería como otro estado de error junto a «Correcta» o «Incorrecta». No queda alternativa pendiente | `comun.md` §9 | Ver CD-26 |

### 2.4 Ilustración

| id | Convención | Vive hoy en | Cómo se verifica |
|---|---|---|---|
| CD-15 | Ilustración de materia: monocroma, en `filamento`, decorativa, sin `tono` ni `strokeOpacity`. En presionado va en `fondo` y en deshabilitado en `inactivo`: un solo color | `comun.md` §5.2 (K6); COMUN-P1; spec `subject-catalog`; `design.md` D2 | `rg -n 'tono\|strokeOpacity' src/materias` vacío |
| CD-16 | El campo de filamentos va solo en MateriaSelect, dentro de la lámina, de alto `paso 28`; nunca de fondo ni bajo texto. Es el único con `strokeOpacity`, con `tono: 'acento'` y con `encuadre: 'none'`; la regla graduada lleva el mismo encuadre | `NOTAS.md`; `design.md` D2 y D3 | `rg -n 'strokeOpacity\|tono' src` solo en `src/assets/filamentos.js` |

### 2.5 Medidas y layout

| id | Convención | Vive hoy en | Cómo se verifica |
|---|---|---|---|
| CD-17 | Separaciones: `paso 0.5` entre casillas; `paso 1` entre rótulo y valor; `paso 2` entre elementos de un grupo y mínimo entre controles adyacentes; `paso 2.5` entre opciones y entre tarjetas; `paso 6` entre bloques; `paso 8` entre secciones; margen lateral `paso 5`; relleno de tarjeta, panel y nota `paso 3.5` | `tokens.md` c.3; `comun.md` §5.1; reporte | Ningún margen ni relleno fuera de la escala |
| CD-18 | Sin valores arbitrarios (`mb-[18px]`, `py-[11px]`) ni medidas sueltas: solo pasos y tokens. Un valor del boceto se traslada al paso más cercano y no es propuesta | `tokens.md` c.3; `comun.md` §8 | `rg -n '\[[0-9]+px\]' src App.js` vacío al cierre |
| CD-19 | Alto de HeaderMarca en MateriaSelect y Home = área segura superior + `paso 3.5` + (`paso 11` de cada opción del control de tema + `border` arriba y abajo de su contenedor) + `paso 3.5`. Ni el contenido ni `numberOfLines` lo igualan | `comun.md` §1; D6 | Capturas de ambas: el primer bloque arranca en la misma ordenada |
| CD-20 | Una columna `max-w-columna` (448), centrada y anclada arriba en 768 y 1280; fondos y filetes de barra a todo el ancho; ninguna otra clase `max-w-*` | `comun.md` §7; `tokens.md` c.3 | `rg -n 'max-w-' src` solo `max-w-columna` |
| CD-21 | Áreas seguras: HeaderMarca y barra interna suman la superior; las barras fijas, la inferior más `paso 4`; en apaisado, márgenes laterales no menores al área segura lateral | `comun.md` §5.1 | Captura con muesca |
| CD-22 | Lámina o tarjeta con marcas de esquina: cuatro, `linea`, `border-2`, solo los dos lados hacia afuera, lado `paso 2`, sobresalen `paso 1`; decorativas | `comun.md` §6 | — |

### 2.6 Tipografía y superficie

| id | Convención | Vive hoy en | Cómo se verifica |
|---|---|---|---|
| CD-23 | Un paso tipográfico = `text-*` más `font-plex-*`, siempre juntos. El peso lo da la familia; interlineado en px; mayúsculas solo con `uppercase` en `rotulo`, con el texto fuente en caja normal. Sin cursiva, subrayado ni tachado; mínimo 11 px. Todo campo de texto editable y su placeholder van en `campo` (16 px o más): Safari de iPhone amplía la página al enfocar un campo menor (D10) | `tokens.md` b.2, b.3 | `rg -n 'font-(bold\|semibold\|medium)\|italic\|underline\|line-through' src App.js` vacío al cierre; cada `TextInput` del diff lleva `text-campo` |
| CD-24 | Sin radios, sombras, gradientes ni transparencias de color: la elevación es filete. Única excepción: `strokeOpacity` del campo de filamentos (CD-16) | `tokens.md` a.2, c.1; D9 | `rg -n 'rounded-\|sombras\.' src App.js` vacío al cierre |

### 2.7 Datos y proceso

| id | Convención | Vive hoy en | Cómo se verifica |
|---|---|---|---|
| CD-25 | Los datos visibles se derivan: conteos de `CONTEOS`, id de `shortName` y posición, nombre de `materia.name`. Ni la ficha ni la pantalla llevan cifras escritas a mano | `MateriaSelect.md` d.1; reporte | Ninguna cifra de conteo en fichas ni en `src/screens` |
| CD-26 | Ninguna ficha deja una rama abierta: toda alternativa condicional («si el usuario prefiere…», «si se rechaza…») se cierra antes de una tarea 3.x | C2; reporte 1.2-decisiones | `rg -n -i 'si el usuario prefiere\|si se rechaza' openspec/changes/rediseno-plancha/diseno/pantallas/` vacío |
| CD-27 | Tocar un token de `plancha` obliga a recalcular E1 a E4 con el script de `tokens.md` e y a actualizar sus tablas. Un par bajo 4,5:1 (texto) o 3:1 (no textual) no entra | `tokens.md` e | Resumen de e en cero filas bajo umbral |

---

## 3. Gobernanza (origen: Diseñador; estado: acordada, Ingeniero y Diseñador, 2026-10-10)

Estado de G-1 a G-4: acordada (Ingeniero y Diseñador, 2026-10-10).

| id | Regla | Origen |
|---|---|---|
| G-1 | Este documento prevalece sobre las fichas, y estas sobre los reportes de `.orca/` (ignorados por git). Una ficha que contradice una convención vigente es defecto de la ficha y la corrige el Diseñador | Diseñador |
| G-2 | Una convención cambia cuando ambos roles la aceptan: cualquiera la propone con argumento y evidencia. Lo estético lo cierra el Diseñador; lo técnico, el Ingeniero, con la objeción registrada; sin acuerdo, decide el usuario | Diseñador (pedido del usuario, 2026-10-10) |
| G-3 | Una fila `abierta` o `propuesta` no sirve para auditar una 3.x hasta que el Ingeniero la confirme. La parte estética de una fila rige desde que el Diseñador la registra | Diseñador |
| G-4 | Un cambio del Ingeniero que toque una ficha, una propuesta o un token vuelve al Diseñador antes de pasar a convención. Un cambio del Diseñador que toque un contrato (`design.md`, `tasks.md`, `colores.js`) vuelve al Ingeniero | Diseñador (pedido del usuario, 2026-10-10) |

---

## 4. Alineaciones de documentos con estas convenciones

| Documento | Decía | Dice o debe decir | Dueño | Fila | Estado |
|---|---|---|---|---|---|
| `comun.md` §8 y §9 («Indicaciones de forma») | «El glifo chico … se dibuja sobre su propia grilla»; «cuadrícula de 24 para el glifo grande y propia para el chico» | Un viewBox común; el componente mantiene 1,5 px visibles (CD-9) | Diseñador | C5 | Aplicada (2026-10-10) |
| `comun.md` §9, `glifo-reportar` | «si el usuario prefiere el rojo, `error` sobre `superficie`» | Sin alternativa roja: `tinta` (CD-14) | Diseñador | C4 | Aplicada (2026-10-10) |
| `MateriaSelect.md` c, d.1 y f | «Banco real» sin cambio en Cargando y Próximamente; «cadena fija, igual en las seis tarjetas»; «aparece en las seis» | Cargando conserva las dos celdas; Próximamente, celda única a ancho completo; condición derivada del dato | Diseñador | C8 | Aplicada (2026-10-10) |
| `design.md` D10, Non-Goals, Context y D2/D3 | Sin regla de choque; «cambiar copy (salvo …)»; boceto sin versionar; ilustración con `id` | Orden de uso gana; copy aprobado; `diseno/referencia/`; contrato de datos con `encuadre` | Ingeniero | C1, C7, C10 | Aplicada (verificada con `git diff`) |
| `proposal.md` línea 23 y «Open questions» 1 | «los reemplazan texto o glifos»; «¡» de RESULTS-P2 abierto | Glifo SVG con texto que acompaña; cerrada: RESULTS-P2 aprobada | Ingeniero | C1, C4 | Aplicada (verificada con `git diff`) |
| `tasks.md` 3.1, 3.1b, 3.2, aceptación común de 3.x, 4.1, 5.0 | `webStyles.js` y `inject-pwa.js` sin dueño; 3.1b con la barra del quiz; 3.2 «ni en Cargando»; 390, 768 y 1280 px; sin retiro de legados | 3.1 y 4.1 reescriben los halos; 3.1b solo `App.js` e inset; 3.2 conserva Cargando; 360 y 320 px, `paso 2`, pares, sin legados; 5.0 | Ingeniero | C3, C6, C8, C9 | Aplicada (verificada con `git diff`) |
| `tasks.md` 2.5, 2.6 y 3.2 (`regla`) | Sin tarea para `glifos.js`, `Glifo`, las generadas ni la regla graduada | Tareas 2.5 y 2.6; `regla` exportada desde `filamentos.js` en 3.2 | Ingeniero | C5, C7, C8 | Aplicada (verificada con `git diff`) |
| `.gitignore` | `referencias-diseno/` entera | Sin cambio: `diseno/referencia/` no está ignorado | Ingeniero | C10 | No hace falta (`git check-ignore` sin salida) |
| `svg/glifos/NOTAS-GLIFOS.md` §7, fila 1 | «Desvío de §9»: `viewBox` de 16 frente a la «cuadrícula de 24 para el glifo grande» | Sin desvío: `comun.md` §8 y §9 ya piden un viewBox común. 1.4 coincide con C5 y CD-9 (`24 / lado`) | Diseñador | C5 | Resuelta por la alineación de `comun.md` |

Cerradas por la tarea 1.4b (2026-10-10) y retiradas de la tabla: `tokens.md` c.2 (1,5 px visibles, CD-9), `tokens.md` a.2 y `comun.md` §0 (excepción de `strokeOpacity`, CD-24) y `glifo-eliminar` (SVG dibujado: 35 de 35). Sin alineaciones pendientes.
