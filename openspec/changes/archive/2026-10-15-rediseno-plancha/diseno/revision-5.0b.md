# Revisión final de UI/UX · tarea 5.0b

| Campo | Valor |
|---|---|
| Rol | Diseñador senior (Fable 5.1, effort `max`) · 2026-10-12 · una sola revisión, sin segunda vuelta |
| Change | `openspec/changes/rediseno-plancha`, rama `rediseno`, HEAD `cf5f280` (5.0c); plataforma solo web (D10, retiro de nativo 5.0) |
| Mandato | `tasks.md` 5.0b: revisión holística; solo cambios pequeños con mejora sustancial para quien usa la app; jerarquía visual por superficie dentro de los tokens y de E1–E4; animaciones solo `opacity` y `transform`, ≤ 200 ms, con `prefers-reduced-motion`, sin JS cuadro a cuadro ni librerías, con costo en bytes; nada se implementa acá |
| Leído, en el orden del traspaso | `referencias-diseno/` (`REFERENCIAS.md`, `ref1`–`ref6`, `CONCEPTOS.md`, tableros del híbrido), `diseno/referencia/`, `CONVENCIONES.md` (C1–C10, E1–E5, CD-1–CD-27, G-1–G-4), `tokens.md`, `NOTAS.md`, `marca-prototipos.md`, `svg/` y `NOTAS-GLIFOS.md`, `design.md` D1–D11, `comun.md`, las 13 fichas de `pantallas/` y el anexo `AddQuestion-ADD-P3.md`, `maqueta/NOTAS-MAQUETA.md`, `evidencia/despues/` (3.4–3.9, 3.11b–h, 3.13, 3.14, 4.1, marca-v5), `src/components/plancha/index.js`, `QuizScreen.js`, `App.js`, `TemaContext.js`, `webStyles.js`, `confirm.js`, `scripts/inject-pwa.js`, los reportes 3.5-analisis, 5.0c-analisis, theme-color-inicial y aviso-navegador, y los invariantes de Engram 17, 24, 38, 40, 41, 42, 43, 44, 48, 50, 55, 60, 65, 67, 70 y 71 |
| Escribí | Este reporte; cuatro filas «(5.0b, sin documentar)» (§5); la columna de fuente de `iconoFondo` en `tokens.md` a.1 (deuda N3 de la 5.0c) |
| No toqué | `src/`, `App.js`, `scripts/`, `tools/`, `public/`, git; ningún valor decidido en las fichas; ninguna decisión cerrada (híbrido, V5, familia B, tokens y pares, D9, glifos, FAV-P2, DON-P5, BAN-P2, TOPIC-P6) |
| Peso de partida (D5) | Shell 251.215 B gzip tras 5.0; tope 256.379 B; holgura 5.164 B (`.orca/reports/rediseno-5.0.md`) |
| Resumen | 9 propuestas, `REV-1` a `REV-9`: 2 de prioridad alta (`REV-1`, movimiento del quiz; `REV-2`, arranque y cromo del navegador), 4 media (`REV-3` a `REV-6`), 3 baja (`REV-7` a `REV-9`). En §6: 2 FUERA DE SPEC (`FS-1`, `FS-2`) y 1 CAMBIO DE CRITERIO (`CC-1`) |

---

## 1. Lectura del criterio

**Qué define la estética de pKapp.** Es una hoja de dibujo técnico, no una app de tarjetas: marco de 1 px con cuatro marcas de esquina y cajetín al pie; rótulos mono en mayúsculas con espaciado; ids numerados («BCYT · 01»), regla graduada, retícula de información. Vectorialidad de trazo, nunca de relleno: ilustraciones de materia de 1,5 px (familia B «trama»), 37 glifos de terminación cuadrada y unión recta, el campo de fibras V5 dentro de una lámina y una sola vez. Monocromía fría: los neutros se ordenan por valor (`tinta`, `tintaSec`, `linea`, `borde`, `filete`) y hay un solo color de identidad, el teal apagado; verde, rojo y acero existen solo como estado y nunca solos (marca, texto y forma los sostienen). La jerarquía sale del valor y del grosor (1, 2 y 3 px), no del color ni del tamaño; la elevación, del filete, no de la sombra. Plex Mono para datos y rótulos, Plex Sans para lectura. Radio 0, sin sombras, sin transparencias, sin degradados.

**Por qué el híbrido y no los otros.** De las tres direcciones, la Plancha responde a la referencia más repetida del usuario (ref4–ref6: retículas de información, diagramación CAD biomédica) y es la más sobria; el Atlas pesaba «revista» y la Tractografía corría el riesgo de volver genérico su propio campo decorativo al repetirlo en cada pantalla. El híbrido toma de la Tractografía una sola firma (el campo de fibras de ref1–ref3, hoy V5) y la contiene en la lámina del selector.

**Qué la volvería genérica.** Radios y sombras («tarjetas flotantes»), degradados o vidrio, íconos rellenos de set o emojis, color como decoración (chips multicolores, pasteles por categoría), píldoras, fondos con manchas, tipografía sin carácter en todo, animaciones de rebote o escala, ilustraciones 3D o generadas, mascotas y confeti en resultados, esqueletos con brillo, y el campo de fibras repetido como «hero». También lo contrario: un rigor tan literal (cotas, acotaciones) que convierta la herramienta en maqueta. Cada propuesta de §3 se midió contra esto: entra en esa gramática o no entra.

---

## 2. Jerarquía por superficie

Acción principal de cada superficie, qué sube y qué baja de énfasis y con qué recurso. «Sin cambios» se justifica en la última columna.

| Superficie (ficha) | Acción principal hoy | Sube | Baja | Recurso | Veredicto |
|---|---|---|---|---|---|
| MateriaSelect | Elegir una materia (tarjetas K6) | — | — | — | Sin cambios. La lámina es la única pieza de marca y va una sola vez; las seis tarjetas pesan igual porque son pares; el pedido DON-P5 queda al pie, fuera de la primera ventana en teléfono y bajo la rejilla en escritorio. En el carrusel, el pie con «Pausar» (K2) y los K5 pesa más que el texto del aviso, pero lo exige WCAG 2.2.2 (control visible) y lo decidió el usuario (BAN-P2) |
| Home | «Entrena Temas/Parciales» (K3 primaria) | — | — | — | Sin cambios de énfasis: el marco `linea` de 2 px frente a `borde` de 1 px es el recurso que el sistema reserva a la acción primaria (`tokens.md` c.2) y se lee en los dos temas; subirla a relleno `tinta` la convertiría en K1 y se leería como seleccionada (CD-5). La tarjeta de materia pesa más que la acción porque es lámina con marcas, pero es identidad y va una vez. En escritorio el rótulo «Plano / Acciones» no arranca alineado con la tarjeta lateral: `REV-5` |
| TopicSelect | Mezcla (K6 de acento) y filas de tema (K7) | — | — | — | Sin cambios: los filtros marcados usan la inversión reservada a lo seleccionado (CD-5) y van arriba por el orden de uso de `main` (D10); la mezcla es lo único con marco `acento` de 2 px y glifo en `acento`, y en escritorio el panel se compacta en una fila |
| Quiz | Responder (opciones K3); «Siguiente» o «Ver resultados» (K1 en barra fija) | Lo que aparece al responder y la pregunta siguiente entran con fundido: orientación sin mover el layout (`REV-1`) | «Reportar pregunta»: de K3 con marco a K7 sin marco (`REV-3`) | Movimiento; marco | El chip de origen en `acento` es dato de origen (D6, CD-8) y se conserva; la alerta de tiempo (`error`, marco 2 px) es la única señal roja fuera de las respuestas y debe seguir así |
| Examen en curso | Responder; elegida = inversión `tinta` | Igual que Quiz: el aviso «Resultado oculto hasta el final» entra con fundido (`REV-1`) | «Reportar pregunta» (`REV-3`) | Movimiento; marco | — |
| Results | «Volver a practicar» (K1) | — | — | — | Sin cambios: la lámina de resultado manda (`display` con marca), el trío lee los datos, el pedido DON-P5 es la masa de color que el usuario eligió y K1 sigue siendo el relleno más fuerte en los dos temas (`DonationBox.md` f.5). El orden de botones es de `main` (RESULTS-C3) |
| Revisión | Leer cada respuesta; «Volver» e «Inicio» | Enunciado de cada tarjeta: de `cuerpo` a `item` (`REV-4`) | «Reportar pregunta»: de `cuerpo-fuerte` a `cuerpo` (`REV-3`) | Peso y tamaño | Hoy el enunciado pesa lo mismo que las opciones apagadas y menos que «Reportar pregunta», que se repite en cada tarjeta. El borde izquierdo de 3 px por estado y la línea de estado ya separan acertada de fallada |
| Stats | Lectura: global y por tema | — | — | — | Sin cambios: `display` con marca, filas con valor en color de banda y barra con marcas de umbral; «Más falladas» en el mismo lenguaje (CD-7). La leyenda explica las tres marcas |
| Settings | Ajuste «Ocultar resultado» (K4 «No / Sí») | — | — | — | Sin cambios: el único control de estado va primero; «Resetear estadísticas» en `error` dentro del plegable (SET-P2); «Acerca de» es referencia y en escritorio va a la lateral |
| AddQuestion | «Guardar pregunta» (K1 al pie) | — | — | — | Sin cambios: campos en `borde`, letra K3, quitar en `tintaSec`; el disparador en `cuerpo` regular no compite con «Agregar opción» ni con K1 (ADD-P3) |
| DonationBox | Montos (K2 de acento) | — | — | — | Sin cambios: DON-P5 es decisión del usuario y f.5 ya mide su peso frente a K1 en los dos temas |
| Banners | Leer el aviso; descartar; «Pausar» | — | — | — | Sin cambios de énfasis (BAN-P2 decidida; los textos los cambia el usuario en 5.5). Lo nuevo es un aviso que ninguna ficha cubría: el de Instagram (`REV-6`) |
| Vacíos | Acción K2 («Practicar», «Agregar pregunta») | — | — | — | Sin cambios: lámina con glifo en `tintaSec`, título en `titulo`, acción K2 centrada (VAC-P1, VAC-P2) |
| Comunes (HeaderMarca, barra interna) | Control de tema; volver | — | — | — | Sin cambios |

---

## 3. Propuestas

Ninguna reabre una decisión cerrada. Las de documentación (`REV-7`, `REV-8`) no tocan código. El detalle de las que animan o cambian componentes va en 3.1 a 3.5.

| Id | Qué | Por qué | Superficie | Ficha y fila afectada | Variante sin el cambio | Coherencia | Contraste | Costo | Prioridad |
|---|---|---|---|---|---|---|---|---|---|
| `REV-1` | Movimiento del quiz: lo que aparece al responder (línea de estado de las opciones marcadas, nota, aviso «Resultado oculto», «Reportar pregunta», barra inferior) entra con fundido de `opacity` de 150 ms; la barra suma `translateY` de `paso 2` a 0. Al pasar de pregunta, el bloque contexto + enunciado + opciones entra con el mismo fundido. El estado de la opción tocada cambia en el mismo cuadro, sin animación (3.1) | Hoy todo aparece de golpe: la respuesta, la nota y la barra se materializan sin orden y la pregunta siguiente parece la misma pantalla con otro texto. Un fundido corto da respuesta al toque y orienta sin demorar nada ni mover el layout | Quiz, Examen en curso | `Quiz.md` a.1 (bloques 5 a 8), c.2, «Orden, teclado y foco»; fila nueva «Movimiento» en c; `ExamenEnCurso.md` a.2 (aviso `EXA-P1`) | Todo aparece de inmediato, como hoy | Mandato 5.0b; precedente BAN-P2 (`RegionAvisos.js:353`: `transition-opacity duration-150 motion-reduce:transition-none`, D11); CD-24 (la opacidad es solo fundido, ningún estado se expresa con ella); `marca-prototipos.md` f («solo `opacity`, hasta 200 ms, `prefers-reduced-motion` la quita») | Sin pares nuevos (la opacidad es transitoria y no codifica estado) | ≈ 0,3 a 0,4 KB gzip de JS; 0 B de CSS nuevo si reutiliza las clases del carrusel. Entra en la holgura de D5 (5.164 B) | **alta** |
| `REV-2` | Arranque y cromo del navegador: (1) sin cuadro oscuro al cargar (`splashDone` arranca en verdadero en web, o se retira el splash, código muerto tras 5.0); (2) `html` y `html.dark` con `background-color` = `fondo` de su tema en el `<style>` servido; (3) `color-scheme: light` en `html` y `dark` en `html.dark` (3.2) | Hoy quien usa el tema claro ve un cuadro `#0b0d10` en cada carga (V19, §5); con el tema oscuro, las barras de scroll de Windows, los diálogos `confirm`/`alert` de Chrome y el selector de archivo de «Importar respaldo» quedan claros, porque el documento no declara `color-scheme` | Toda la app (bordes de app, D8) | `tokens.md` a.2, bloque «Decisión · `theme-color` inicial»: dos filas nuevas («Fondo del documento», «`color-scheme`»); `Vacios.md` V19 | Hoy: cuadro oscuro al cargar; lienzo del navegador antes de montar; cromo claro en oscuro | D8 (bordes de app); decisión `theme-color` inicial (4.1) y sus hallazgos H1 y H2; D10 (escritorio con Windows) | Sin pares nuevos: cromo que dibuja el navegador; el fondo del documento es `fondo` | ≈ 0,1 KB en el HTML servido; −0,2 KB en el bundle si se retira el splash | **alta** |
| `REV-3` | «Reportar pregunta» sin marco: en Quiz pasa de K3 (marco `borde`, `cuerpo-fuerte`) a K7 sin filete con `glifo-reportar` chico delante y texto en `cuerpo`, `tinta`; en Revisión sigue K7 y el texto pasa de `cuerpo-fuerte` a `cuerpo` (3.3) | Reportar es una utilidad ocasional; con marco y negrita pesa como una opción de respuesta en el quiz y, en la revisión, más que el enunciado que repite en cada tarjeta. Sin marco y en regular queda un escalón por debajo de las opciones y de «Siguiente» | Quiz, Examen en curso, Revisión | `Quiz.md` a.1 bloque 6, b fila «Reportar pregunta (K3)», c.1, h `QUIZ-P2`; `Revision.md` a.3 fila 6, b fila «Reportar pregunta (K7)», c.1; `comun.md` §5.2, regla 2.9-4 (K7 con texto de acción: `cuerpo`) | Quiz: K3 con marco `borde`; Revisión: K7 en `cuerpo-fuerte` (hoy) | Mismo escalón que descartar y eliminar, que ya son K7 sin marco (§9); CD-11 (el glifo toma el color del texto); conserva E2/CD-14 (`tinta`, sin rojo). El escalón a `tintaSec` va aparte: `CC-1` (§6) | Quiz, sobre `fondo`: T1 16,32 / 15,97; glifo N5. Revisión, sobre `superficie`: T2 17,82 / 14,91; glifo N6. Hover contorno `linea` (N1, N2); presionado T7 | 0 B (componentes existentes) | media |
| `REV-4` | Revisión: el enunciado de cada tarjeta pasa de `cuerpo` (15/22, 400) a `item` (16/22, 600) en `tinta` | Hoy el enunciado se lee igual que una opción apagada: la pregunta no manda en su tarjeta. En el quiz va en `titulo`; la revisión es su eco compacto y necesita un paso por encima de las opciones (la correcta queda en `cuerpo-fuerte`, 15 px) | Revisión | `Revision.md` a.3 fila 3; b fila «Enunciado» | `cuerpo` en `tinta` (hoy) | `tokens.md` b.2 (`item`: nombre en lista, título de acción y de panel); `Quiz.md` b (enunciado en `titulo`) | T2 17,82 / 14,91, sin cambio | 0 B | media |
| `REV-5` | Home, escritorio: el rótulo «Plano / Acciones» arranca alineado con el marco superior de la tarjeta de materia: desde el corte `escritorio` su margen superior pasa de `paso 4` a `paso 1.5` (el de la tarjeta, bloque 2); la primera acción sigue a `paso 2` del rótulo. Bajo el corte no cambia nada | Deuda de 3.11: las regiones «alineadas arriba» de `comun.md` §7.2 arrancan en ordenadas distintas (con el header de 74 px de `NOTAS-MAQUETA.md` §0: la tarjeta arranca en y = 80 y el rótulo en y = 90; se ve en `evidencia/despues/3.11c/home-1366-claro.png`) | Home | `Home.md` a.1 bloque 4 (margen superior en escritorio); sección «Escritorio · Medidas», fila nueva «Rótulo»; `HOME-P2` (sin cambio bajo el corte) | Hoy (desalineado) | `comun.md` §7.2: regiones alineadas arriba; `ESC-P2` | Sin pares | ≈ 20 B (`escritorio:mt-1.5`) | media |
| `REV-6` | Aviso de Instagram con la lámina Plancha: aplicar en `rediseno` el bloque `AVISO` y el delta D1 a D7 de `.orca/reports/aviso-navegador-diseno.md` con tres ajustes: margen lateral e inferior `paso 5`; el tema sale del tema guardado de la app y no de `prefers-color-scheme`; H3 (Facebook) lo decide el Ingeniero (3.4) | Hoy el aviso es el marcador de posición (hoja a sangre, fuente del sistema, botón teal relleno, «✕» de texto, §5): la primera pantalla que ve quien llega desde Instagram no es la Plancha. El diseño ya existe, verificado en Chrome; falta aplicarlo y ajustarlo a `rediseno` | Toda la app (web, antes de React) | `Banners.md` a.1, fila (5.0b); sección nueva «Aviso de navegador interno» si se aprueba | El marcador de posición de hoy | `comun.md` §6 (lámina), §5.2 (K1, K2, K7), §9 (`glifo-externo`, `glifo-cerrar`); `Banners.md` a.2 (patrón de nota); `tokens.md` a.1 y b.2; hallazgos H1, H3 y H5 del reporte | Pares del reporte §9: T2 17,82 / 14,91; T4 7,91 / 7,01; T6 5,90 / 8,84; T7 16,32 / 15,97; N2 17,82 / 11,67; N20 7,91 / 7,01; N8 7,62 / 10,92; error T15 7,40 / 7,64 y N13 | +1,05 KB gzip en `index.html` (medido en el reporte §10), fuera del bundle JS y CSS; el Ingeniero decide si lo cuenta en D5 | media |
| `REV-7` | Hoja amplia a 1440 px: variante A (recomendada), corregir la cuenta de `tokens.md` c.4: entre 1440 y 1503 px las celdas de 3 columnas miden de 331 a 352 px (nunca menos que los 280 de una tarjeta de teléfono de 320), y desde 1504 miden 352; variante B, mover el corte `amplio` a 1504 px | La fórmula de c.4 presupone un contenido de 1440 px que solo existe con ventana de 1504 o más; el layout no se rompe, la ficha está mal contada | MateriaSelect, Home, TopicSelect, Stats (rejillas de escritorio) | `tokens.md` c.4, «De dónde sale cada valor», fila `hoja-amplia`; con B, también «Cortes» y `comun.md` §7.2 | Hoy (ficha con la cuenta de 352) | `ESC-P0`; D10 | Sin pares | A: 0 B. B: una constante (`CORTE_AMPLIO`) y recapturar 1440 | baja |
| `REV-8` | `QUIZ-P8`: la ficha adopta lo que hace la app: la meta «{shortName} · {tema}» no tiene tope de líneas y nunca se recorta; «hasta dos líneas» pasa a «hasta dos líneas desde 360 px y hasta tres a 320 px» (tema más largo: 59 caracteres con prefijo) | La ficha pide a la vez «hasta dos líneas» y «sin recorte», y el Analista de 3.5 mostró que no caben juntas a 320. El código ya resolvió a favor de «sin recorte» (§5); la ficha debe decirlo | Quiz | `Quiz.md` a.4 (fila 360 y 320), c.3 «Posición», f `QUIZ-P8`; la aserción `anchosDelQuiz` de la e2e | Hoy (ficha contradictoria, código sin tope) | D10 (sin recorte desde 320 px); CD-26 (ninguna rama abierta); `AddQuestion-ADD-P3.md` d.2 (los nombres de tema nunca se abrevian) | Sin pares | 0 B | baja |
| `REV-9` | Foco tras «Siguiente» con teclado: cuando la barra inferior desaparece al cambiar de pregunta, el foco pasa a la primera opción de la pregunta nueva (solo web; solo si el foco estaba en la barra o quedó en `body`) | Hoy, al activar «Siguiente» con Enter, el botón se desmonta y el foco cae en `body`: el siguiente Tab arranca desde el principio de la página. Es la convención ya acordada para controles que desaparecen (Engram 70) | Quiz, Examen en curso | `Quiz.md` «Orden, teclado y foco»: fila nueva «Tras “Siguiente” (teclado)»; d.2 | Hoy (foco en `body`) | Convención Engram 70; WCAG 2.4.3; `TopicSelect.md` f.1 (foco al desaparecer «Fuente») | Sin pares | ≈ 0,1 KB | baja |

### 3.1 `REV-1` · Movimiento del quiz

| Aspecto | Regla |
|---|---|
| Qué entra con fundido al responder | En cada opción marcada, la línea de estado (`MarcaEstado`); la nota «Nota / Explicación»; el aviso «Resultado oculto hasta el final» (examen en curso); «Reportar pregunta»; la barra inferior. `opacity` de 0 a 1 en 150 ms, curva `ease-out` de Tailwind (`cubic-bezier(0, 0, 0.2, 1)`). La barra suma `transform: translateY(paso 2)` a 0 en los mismos 150 ms: el alto que toma se reserva en el mismo cuadro, como hoy; solo se desplaza su contenido |
| Qué entra con fundido al pasar de pregunta | El bloque fila de contexto + caja del enunciado + opciones, con el mismo fundido, cuando cambia `currentIndex`. La barra del quiz (progreso, contador, tiempo) cambia sin animación; el scroll vuelve arriba sin animar, como hoy (`scrollTo` con `animated: false`); «Ver resultados» navega con `replace`, sin animación |
| Qué no se anima | El cambio de estado de la opción tocada (marco, relleno, celda de letra y texto): respuesta inmediata al toque. Presionado, hover y foco: sin transición (CD-2, CD-3, `webStyles.js`). El progreso, el temporizador y su alerta. Nada en salida: lo que desaparece, desaparece |
| Ningún estado por opacidad | La opacidad es solo el fundido de entrada; el estado lo siguen dando marco, relleno, marca y texto (CD-24, `comun.md` §4) |
| Mecanismo (lo elige el Programador dentro del criterio) | (a) Web Animations API: un hook `useEntrada(ref, clave)` en `plancha/` que, al montar o al cambiar `clave`, llama `el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'cubic-bezier(0,0,0.2,1)' })` (la barra suma `transform`); no hace nada si `matchMedia('(prefers-reduced-motion: reduce)').matches` o si `animate` no existe; solo web. (b) Clases: `opacity-0` → `opacity-100` con `transition-opacity duration-150 motion-reduce:transition-none`, las que ya emite `RegionAvisos.js:353`, disparadas por un cambio de clase tras montar |
| Garantías del mandato | Solo `opacity` y `transform`, calculadas por el compositor; sin cambio de layout; ≤ 200 ms; los toques responden durante el fundido (la opacidad no bloquea eventos); sin `Animated`, `requestAnimationFrame` ni librerías; con `prefers-reduced-motion: reduce`, ninguna animación |
| Peso | ≈ 0,3 a 0,4 KB gzip de JS (el hook y cinco refs); 0 B de CSS nuevo con (b). Lo mide la 3.x con el build y la e2e (D5) |
| Aceptación observable | (1) Tras responder, `document.getAnimations()` sobre las piezas nuevas devuelve animaciones de ≤ 200 ms cuyas `keyframes` solo tocan `opacity` o `transform`; (2) con `prefers-reduced-motion: reduce` emulado (`Emulation.setEmulatedMedia`), ninguna; (3) la opción tocada cambia de estado en el mismo cuadro: captura inmediata tras el `click` ya muestra marco y relleno finales; (4) `scrollTop` 0 tras «Siguiente»; (5) ningún `opacity` distinto de 1 en reposo (sigue el chequeo de 3.14); (6) shell dentro de D5 |

### 3.2 `REV-2` · Arranque y cromo del navegador

| # | Cambio | Dónde | Efecto |
|---|---|---|---|
| 1 | `splashDone` arranca en verdadero en web (`useState(Platform.OS === 'web')`). Con nativo retirado (5.0), el contenedor del splash y su `Animated.sequence` son código muerto: retirarlos es decisión del Ingeniero | `App.js:93` | Ningún cuadro `manifestFondo` en el tema claro; en oscuro, ningún cuadro con el logo invisible |
| 2 | `<style>html{background-color:<claro.fondo>}html.dark{background-color:<oscuro.fondo>}</style>` en el `<head>` servido, con los valores desde `plancha` (como ya hace el meta `theme-color`) | `scripts/inject-pwa.js`, `pwaTags` | El lienzo del navegador antes de montar es el `fondo` de la app y, en Safari 26, también el tinte de la pestaña (H2 del reporte 4.1). El tema guardado no se conoce hasta montar: quien usa oscuro sigue viendo lienzo claro hasta entonces, como hoy; el script síncrono que lo leería sigue aplazado (decisión 4.1) |
| 3 | `html{color-scheme:light}html.dark{color-scheme:dark}` en el mismo `<style>` (o en `global.css`) | Ídem | Barras de scroll (Windows; macOS con barras visibles), `window.confirm` y `window.alert` en Chrome y Edge, el selector de archivo de «Importar respaldo» y el resaltado de selección siguen al tema de la app. `TemaContext.aplicar` ya alterna la clase `dark` en `html` |

Aceptación: (1) secuencia de cuadros al cargar en claro sin ningún cuadro `#0b0d10` (`Page.startScreencast` del arnés); (2) `getComputedStyle(document.documentElement).colorScheme` vale `light` y `dark` según el tema, y `backgroundColor` es el `fondo` del tema; (3) la suite `pwa.js` sigue en verde (un solo meta `theme-color`, que no cambia).

### 3.3 `REV-3` y `REV-4` · Jerarquía en Quiz y Revisión

| Elemento | Hoy | Propuesto | Pares |
|---|---|---|---|
| «Reportar pregunta», Quiz | K3: marco `borde`, `cuerpo-fuerte`, `tinta`, centrado bajo la nota | K7 sin filete (`FilaLista`): `glifo-reportar` chico delante, texto `cuerpo` en `tinta`; centrado; alto mínimo `paso 11`, relleno horizontal `paso 4`; hover contorno `linea`; presionado inversión total; foco `foco` | T1 16,32 / 15,97; N5; hover N1; presionado T7 |
| «Reportar pregunta», Revisión | K7, `cuerpo-fuerte`, `tinta` | K7, `cuerpo`, `tinta`; lo demás sin cambio | T2 17,82 / 14,91; N6; hover N2; presionado T7 |
| Enunciado, Revisión | `cuerpo` (15/22, 400), `tinta` | `item` (16/22, 600), `tinta`; la correcta queda en `cuerpo-fuerte`, las apagadas en `cuerpo` `tintaSec` | T2 17,82 / 14,91 |

`comun.md` §5.2, regla 2.9-4, suma «K7 con texto de acción (reportar): `cuerpo`». `QUIZ-P2` (conservado de `main`) conserva función, lugar y condición; cambia el aspecto, que es de la ficha (E1).

### 3.4 `REV-6` · Aviso de Instagram

| Ajuste al reporte `aviso-navegador-diseno.md` | Valor | Por qué |
|---|---|---|
| Margen lateral e inferior | `paso 5` (20 px) en vez de 16 | H5 del reporte: en `rediseno` rige `comun.md` §7, no los 16 px de `main` |
| Tema | Variables oscuras solo si el tema guardado de la app es `oscuro` (campo `tema` de la clave `pkapp_settings` de `localStorage`, `database.web.js:9`; ausente o inválida: claro), en lugar de `prefers-color-scheme` | H1 del reporte: la app no sigue al sistema (`TemaContext.js`, por defecto claro); con `prefers-color-scheme` un celular en oscuro vería la lámina oscura sobre una app clara |
| Facebook (H3) | O el aviso se limita a Instagram, o el rótulo dice «Navegador interno» cuando el UA es Facebook | Decisión del Ingeniero: dentro de Facebook «Abrir en tu navegador» no hace nada |
| Sin cambio | Lámina con marcas (§6), K1 «Abrir en tu navegador», K2 «Copiar link» con estados copiado (`acento`, 2 px) y error (`error`, 2 px), K7 cerrar con `glifo-cerrar`, rótulo mono con `glifo-externo`, copy, pila de fuentes sin precarga (opción A), aceptación §13 | Ya verificado en Chrome headless en 7 anchos |
| Pendiente de dispositivo | H2 (rótulo del menú de iOS), H8 (iPhone real, WKWebView, `env(safe-area-inset-bottom)`) | Sin iPhone no hay dato; no propongo valores |

### 3.5 Verificación común a toda propuesta aprobada

| Chequeo | Regla |
|---|---|
| Contraste | Ningún par nuevo en `REV-1` a `REV-9`: E1 a E4 intactas (CD-27). `CC-1` de §6 usa pares existentes (T3, T4, N19, N20) |
| Sin transparencia como estado | `rg -n 'opacity-' src` solo en fundidos de entrada (`opacity-0`/`opacity-100` con `transition-opacity`) y en el carrusel; ninguna en reposo (CD-24) |
| Movimiento | Solo `opacity` y `transform`; ≤ 200 ms; `motion-reduce:` o `matchMedia` en todo lo que anima; sin `Animated` en web (`rg -n 'Animated\.' src` vacío tras retirar el splash) |
| Peso | Shell medido con el método de `evidencia/base.md`; tope 256.379 B |
| Capturas | 320, 390, 768, 1366 × 768 y 1920 × 1080 en claro y oscuro para cada superficie tocada; a `evidencia/despues/<tarea>/` |

---

## 4. Deudas de «Estado al lanzar»

| Superficie | Deuda | Resolución |
|---|---|---|
| Quiz | `QUIZ-P8`: «hasta dos líneas» y «sin recorte» a la vez; 59 caracteres no entran en dos líneas a 320 px | `REV-8`: la ficha adopta lo que ya hace el código (sin tope, sin recorte, tres líneas a 320). Hecho hoy: fila (5.0b) en `Quiz.md:56` que describe el comportamiento actual |
| Quiz | La opción respondida no es un componente propio de `plancha/` | Se mantiene: deuda de código sin efecto visual (HANDOFF, para 6.0); `REV-1` la deja igual y no la agrava |
| DonationBox | No se apoya en `Control.js` (K1 a K7) | Se mantiene: deuda de código sin efecto visual; DON-P5 es decisión cerrada y nada que proponer desde diseño |
| Home (escritorio, 3.11) | El rótulo «Plano / Acciones» no alinea arriba con la tarjeta lateral | `REV-5` |
| Hoja amplia (escritorio) | Celdas de ≈ 331 px a 1440, no 352 | `REV-7` (A: corregir la cuenta de la ficha; B: corte `amplio` en 1504) |
| Bordes de app · H1 | Fotograma oscuro del splash en web | `REV-2` (1). Confirmado en código: `splashDone` arranca en falso y el efecto corre tras el primer pintado (`App.js:93`, `116` a `121`) |
| Bordes de app · H2 | `html`/`body` sin fondo antes de montar (tinte de Safari 26) | `REV-2` (2); se suma `color-scheme` (`REV-2` (3)), que el reporte 4.1 no había relevado |
| Bordes de app · H3 | Barra de estado de iOS con `black-translucent` | Se mantiene: sin prueba en iPhone no hay dato; cuando exista, el valor lo fija el Diseñador en `tokens.md` a.2 |
| Bordes de app · H4 | Paréntesis histórico en `tokens.md` a.2 (`StatusBar`) | Se mantiene como corrección de documentación pendiente (una línea de a.2, fuera de la propiedad de esta tarea); con nativo retirado y `REV-2`, la fila `StatusBar` queda además sin uso en web |
| Aviso de Instagram en iOS | Aviso de respaldo sin pulir | `REV-6`. Hecho hoy: fila (5.0b) en `Banners.md:27` con lo que hace el marcador de posición |
| `tokens.md` | `iconoFondo` citaba `android.adaptiveIcon.backgroundColor` de `app.json` | **Hecho**: `tokens.md:43` cita los íconos PWA y el favicon de `diseno/favicon/` y la aserción de `pwa.js`. El comentario de `src/theme/colores.js:35` («fondo del ícono adaptativo») lo corrige un Programador |

---

## 5. Anotado sin documentar

Filas «(5.0b, sin documentar)» agregadas a las fichas; describen lo que hace hoy la app, sin cambiarlo.

| `archivo:línea` | Ficha y sección | Qué documenta |
|---|---|---|
| `openspec/changes/rediseno-plancha/diseno/pantallas/Quiz.md:56` | a.4, tabla de anchos | La meta «{shortName} · {tema}» no tiene tope de líneas ni recorte: tres líneas a 320 px con el tema más largo (59 caracteres), dos desde 360 px |
| `openspec/changes/rediseno-plancha/diseno/pantallas/Stats.md:120` | c, matriz de controles | «Tirar para actualizar» no existe en web: el `RefreshControl` de react-native-web renderiza un `View` inerte; la pantalla recarga solo al enfocar (vale para V1 de `Vacios.md`) |
| `openspec/changes/rediseno-plancha/diseno/pantallas/Banners.md:27` | a.1, posición en cada pantalla | El aviso «Abrí pKapp en tu navegador» de `inject-pwa.js`: cuándo aparece, qué dibuja hoy el marcador de posición y que sigue a `prefers-color-scheme` |
| `openspec/changes/rediseno-plancha/diseno/pantallas/Vacios.md:52` | a.1, inventario (V19) | Arranque en web: primer cuadro con el contenedor del splash (`manifestFondo`), lienzo del navegador antes de montar, sin `color-scheme` |

Además, `openspec/changes/rediseno-plancha/diseno/tokens.md:43`: columna de fuente de `iconoFondo` corregida (deuda N3, §4).

---

## 6. FUERA DE SPEC / CAMBIO DE CRITERIO

Aparte del cuerpo de la revisión. Las decide el usuario.

| Id | Tipo | Qué | Motivo | Costo | Coherencia y pares |
|---|---|---|---|---|---|
| `FS-1` | FUERA DE SPEC | Diálogo Plancha en web para `confirm` y `avisar` (`src/utils/confirm.js`): hoy son `window.confirm` y `window.alert`. Un componente `Dialogo` modal: lámina de §6 con marcas, título en `item`, texto en `cuerpo`, K1 «Aceptar» (K2 de peligro, `error`, para «Salir», «Eliminar» y «Borrar»), K2 «Cancelar», foco atrapado, Escape cancela, `role="dialog"` y `aria-modal`, el resto de la página inerte; sin velo (D9: sin transparencias; precedente: el `Desplegable` también evita el velo). Lo usan la salida del quiz, «Sin preguntas», las cuatro validaciones y los avisos de AddQuestion, «¡Pregunta guardada!», eliminar pregunta, resetear estadísticas y los avisos de respaldo | Las fichas los excluyen como «diálogos del sistema», y por eso son el último bloque genérico de la app: una caja gris del navegador en el momento más sensible (salir del quiz, borrar datos), con otra tipografía y sin tema. Con `REV-2` (3) al menos siguen el tema; con `FS-1` pasan a la Plancha | ≈ 1,5 a 2 KB gzip (componente y 16 llamadas en las pantallas: 8 en AddQuestion, 5 en Settings, 1 en Quiz, 1 en TopicSelect, 1 en MateriaSelect); la e2e intercepta hoy los diálogos del navegador (`Page.javascriptDialogOpening`, `tools/e2e/cdp.js:125`) y se reescribe. Por el costo en e2e, lo recomiendo después del merge (6.x) | §6, §5.2 (K1, K2 de peligro, SET-P2), `tokens.md` b.2; pares existentes T2, T4, T7, T15, N13, N2, N8 |
| `FS-2` | FUERA DE SPEC | Atajos de teclado en el quiz (escritorio, solo web): A a F o 1 a 6 responden la opción con esa letra; Enter o flecha derecha activan «Siguiente» o «Ver resultados» cuando la barra está visible; con Alt, Ctrl o Meta no se actúa; sin cambio visual (la celda de letra ya es la pista). Salir sigue pidiendo el toque en cerrar y su confirmación | Buena parte de las visitas llega desde escritorio con Windows (D10); responder y avanzar sin el ratón acorta cada pregunta a dos teclas. Ninguna ficha cubre teclas de respuesta: es un cambio de uso aditivo, no una propuesta dentro de las fichas | ≈ 0,4 KB; un `keydown` en `QuizScreen` que ignora los campos de texto (no hay ninguno en el quiz); e2e con `Input.dispatchKeyEvent` | D10 (puntero y teclado); `comun.md` §5.3 y regla 2.9-7 (vocabulario de teclas ya acordado); `REV-9` |
| `CC-1` | CAMBIO DE CRITERIO | Sobre `REV-3`: «Reportar pregunta» y su `glifo-reportar` en `tintaSec` en vez de `tinta` (Quiz, Examen en curso y Revisión), el mismo escalón que descartar, eliminar y quitar (§9, N19 y N20) | Contradice la letra de E2 y CD-14 («`glifo-reportar` va en `tinta`»), no su motivo (que no sea rojo para no leerse como error). Con `tintaSec` la utilidad queda un escalón más abajo que las opciones y que el enunciado, como el resto de las acciones menores | 0 B | Quiz, sobre `fondo`: T3 7,25 / 7,51, glifo N19; Revisión, sobre `superficie`: T4 7,91 / 7,01, glifo N20. Si se aprueba, `CONVENCIONES.md` E2 y CD-14 y `comun.md` §9 se enmiendan por G-2 (lo estético lo cierra el Diseñador; queda registrado) |
