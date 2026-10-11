# Maqueta de pantallas · rediseno-plancha

| Campo | Valor |
|---|---|
| Change | `openspec/changes/rediseno-plancha` (D3, D6, D7, D9, D10) |
| Rama | `rediseno` |
| Pedido | «me gustaría ver una maqueta por parte del diseñador de las pantallas» (usuario, 2026-10-10). Primera pasada: las seis pantallas de 1.2. Segunda pasada: lo aprobado desde entonces |
| Qué es | Las pantallas y superficies tal como las fijan las fichas aprobadas de 1.2 y 1.3. Las figuras E01 a E10, a 1366 y 1920 px, dibujan el escritorio de la tarea 3.10, aprobado por el usuario el 2026-10-11 (`ESC-P0` a `ESC-P8` y `ESC-P10` a `ESC-P12`; `ESC-P9`, rechazada: AddQuestion va en una columna `lectura`) (§8). El selector de tema de AddQuestion es el desplegable de `ADD-P3` (aprobada el 2026-10-11) y el campo de filamentos de MateriaSelect es V5 «Fusiforme» (elegida el 2026-10-11). No es un boceto nuevo: lo que se vea distinto de una ficha es un defecto de la maqueta, salvo lo listado en §6. El pedido de donación es `DON-P5`, aprobada el 2026-10-11 y todavía sin implementar (tarea 3.8); la figura 09 lo compara con `DON-P1`, el aspecto anterior |
| Fuentes | `pantallas/comun.md` y las trece fichas (1.2 y 1.3); `tokens.md`; `src/theme/colores.js` (`plancha`); `svg/<id>.svg` (familia B); `svg/glifos/` (35); `src/assets/filamentos.js` (campo V5); `src/materias/*`; `src/utils/mercadopago.js` (montos); `app.json` (versión) |
| Archivos | `maqueta.html`, `generar.mjs`, `capturar.mjs`, `verificar.mjs` (escritorio, §8), `maqueta-<ancho>-<tema>.png` (10: 390, 768, 1280, 1366 y 1920), `maqueta-donacion-<ancho>-<tema>.png` (6, recorte de la figura 09), este archivo. Los PNG quedan fuera de git por la regla de `.gitignore` (`openspec/changes/*/diseno/maqueta/*.png`): existen en disco y `capturar.mjs` los regenera |
| Fuera de alcance | Diálogos del sistema (`confirm`, `avisar`, V5 de `Vacios.md`) y el selector de archivos; la carga inicial de V1 y V2 (`VAC-P4`: solo la barra, es una ausencia); el tablero a 360 y 320 px: la maqueta dibuja 390, 768 y 1280, y a 1366 y 1920 el escritorio (§8). La variante de 320 px del botón «Cambiar materia» (`comun.md` §1.1) existe en el HTML (container query sobre el header) y se midió forzando el ancho de la pantalla (§4) |

---

## 0. Qué cambió desde la primera pasada

| # | Cambio | Dónde |
|---|---|---|
| 1 | Ilustraciones de materia: ahora son las de la familia B (`svg/<id>.svg`); el generador las lee del mismo lugar, sin cambios de código | 01, 01b, 02 |
| 2 | Glifos: de 27 a 35. Se suman `glifo-mensaje`, `glifo-banco-reducido`, `glifo-trofeo`, `glifo-guardar`, `glifo-importar`, `glifo-correo`, `glifo-externo` y `glifo-eliminar`. Figura nueva 14 con el inventario completo | 14 y las figuras de 1.3 |
| 3 | `MAQUETA-P1` aplicada: la fila de la barra interna mide `paso 11` con y sin volver. Todas las barras miden lo mismo (77 px con su filete) y el título de Results no salta | 03a, 03b, 05a a 05c, 06 y las de 1.3 |
| 4 | `MAQUETA-P3` (desviación por invariante D10, `comun.md` §2.4) aplicada: cada opción del control de tema mide 44 px de alto útil; el contenedor suma su borde (46 px) y el header mide 74 px (14 + 46 + 14), igual en MateriaSelect y en Home | 01, 02 |
| 5 | Los bloques reservados «ver 1.3» pasan a los componentes de su ficha, en el lugar que fijaban `MateriaSelect.md`, `Home.md` y `Results.md`: nota del creador y donación (01), banner de banco reducido (02), pedido de donación (05a y 05b). 05c queda sin pedido: con 38 % no alcanza `DONATION_MIN_SCORE` | 01, 02, 05a a 05c |
| 6 | Marca de parcial en el filtro de parcial del selector (`PAR-P2`) | 03a |
| 7 | Figuras nuevas de 1.3, en los mismos anchos y temas: 07a a 14 (16 figuras) | §2 |
| 8 | `capturar.mjs`: 3 columnas a 768 y 1280 px (antes 2). Con 30 figuras, 2 columnas pasaban los 16 384 px de alto del PNG (20 519 px). Alturas de esa pasada: 14 544 px (390) y 15 325 px (768 y 1280). Reemplazadas por las del #10 | `capturar.mjs` |
| 9 | Corrección de la auditoría 1.5 (2026-10-10): bajo 360 px de ancho el botón «Cambiar materia» de Home es solo `glifo-volver` en un cuadrado de `paso 11`, con `aria-label` (`comun.md` §1.1, `Home.md` g). Alto mínimo `paso 8` del encabezado de la nota del creador, que deja el texto bajo el objetivo de descartar (`Banners.md` a.2, `MAQUETA-P4`). Nada cambia a 390, 768 y 1280 px salvo ese encabezado | 01, 13 y 02 bajo 360 px |
| 10 | Figura 09 (cuarta vuelta, 2026-10-11): el pedido de donación muestra dos columnas: «Antes» (`DON-P1`) y `DON-P5`, aprobada por el usuario con un ajuste de oscuro: la banda del encabezado baja a `acentoBanda` (#12) y mide 5,45:1 contra la página, como en claro (5,40:1); «Volver a practicar» queda 2,9 veces más fuerte. `DON-P2` y `DON-P4` salen de la figura (descartadas). Cada columna dibuja la celebratoria sola y las otras dos en su contexto: tarjeta de materia con la regla corta (MateriaSelect) y trío con los tres botones (Results, 60 a 79 %). La columna de `DON-P5` anota, en claro y en oscuro, cómo pesa la banda frente a «Volver a practicar». La figura ocupa dos columnas del tablero. `capturar.mjs`: 4 columnas en los tres anchos y un recorte de la figura 09 por ancho y tema. Alturas actuales: 14 360 px (390, oscuro) y 13 527 px (768 y 1280, oscuro), a 2 024 px del tope de 16 384 | 09 y `capturar.mjs` |
| 11 | La versión de «Acerca de» sale de `app.json`: al regenerar pasó de v1.7.4 a v1.7.5. Es el único otro cambio de la salida; el trío y los botones de Results pasaron a funciones compartidas con la figura 09 sin cambiar su HTML | 08a, 08b y 12c |
| 12 | `generar.mjs` deriva dos tokens nuevos de `acento`, `superficie` y `fondo` para dibujar `DON-P5`: `acentoFondo` (tinte B de la exploración: 12 % de `acento` sobre `superficie` en claro, #e2eef0, y 15 % en oscuro, #1d3037) y `acentoBanda` (igual que `acento` en claro, #0b6e80; 73 % de `acento` sobre `fondo` en oscuro, #4692a1). Los emite en el bloque generado, comentados como nuevos, pendientes: el archivo sigue sin escribir ningún color y el control de hexadecimales fuera del bloque generado pasa | 01, 05a, 05b y 09 |
| 13 | Las figuras 01, 05a y 05b dibujan `DON-P5` y no `DON-P1`: la ficha vigente es `DON-P5` y «lo que se vea distinto de una ficha es un defecto de la maqueta». Cambia el pedido de donación y su alto (+21 px); nada más en esas figuras | 01, 05a y 05b |
| 14 | `ADD-P3` (aprobada, usuario, 2026-10-11): el selector de tema de AddQuestion pasa a ser el desplegable: disparador K3 y, abierto, lámina con filas K7, en lista plana (el parcial de cada tema todavía no es un dato). 07a y 07b lo muestran cerrado (en 07b, deshabilitado porque guarda); figura nueva 07c con el selector abierto. Es lo único que cambia en 07a y 07b (comparado con el generador anterior, mismo `src/`) | 07a, 07b y 07c |
| 15 | Campo de filamentos V5 «Fusiforme» (elegida, usuario, 2026-10-11): el generador lo lee de `src/assets/filamentos.js`, donde ya está V5; sin cambios de código. V0 queda en `src/assets/filamentos-v0.js` | 01 y E01 |
| 16 | Escritorio aprobado (2026-10-11): E09 deja las dos columnas de `ESC-P9`, rechazada, y pasa a una columna `lectura`; se parte en E09a (selector cerrado) y E09b (abierto). `verificar.mjs` cuenta una lista abierta (`listbox`) como una sola parada de Tab. La leyenda de 1280 px dice «columna única, antes del escritorio» | E09a, E09b y 1280 px |
| 17 | `TOPIC-P6` dibujada (aprobada, usuario, 2026-10-11; tarea 3.13b): el grupo «Fuente» es «Todas» y «Solo mías» y solo existe con preguntas propias; el panel lleva de uno a tres grupos. 03a (BCYT, con parcial y con propias) dibuja los tres; 03b (CyR, modo examen, con propias), dos. Figuras nuevas: 03c, componente con los cuatro casos de `TopicSelect.md` f.1 (tabla 1), y E03c, el mismo panel en la hoja de escritorio, con el reparto del ancho de f.1 (tabla 4). Las figuras con propias suman las de muestra al conteo: CyR 115 (antes 113) y BCYT 387 (antes 385). 03a, 03b y E03a (a 1366) miden 52 px menos: una fila de filtros en lugar de dos | 03a, 03b, 03c, E03a, E03b y E03c |
| 18 | `VAC-P5` dibujada (aprobada, usuario, 2026-10-11): 12d pasa de «Solo generadas» en CyR a «Solo mías» con «1er Parcial» en BCYT, con el mensaje «Tus preguntas no tienen parcial. Elegí "Examen" para verlas.». Figura nueva 12e para el mensaje general de `VAC-P3`: repasar fallos con «Solo mías» y ninguna propia fallada (CyR) | 12d y 12e |
| 19 | `MATERIA-P4` dibujada (aprobada, usuario, 2026-10-11): el cajetín de la tarjeta de materia es una sola celda de ancho completo, en reposo, cargando y no disponible; «Banco real» (`MATERIA-P2`, reemplazada) ya no se dibuja. La tarjeta mide lo mismo (95 px a 390) | 01, 01b, 09 y E01 |
| 20 | `HOME-P4` y `HOME-P5` dibujadas (aprobadas, usuario, 2026-10-11): el conteo de Home dice «113 preguntas reales» (antes «113 preguntas reales · 0 preguntas extra», que partía en dos líneas desde 390 px) y la descripción de «Ajustes» dice «Ocultar resultado, resetear estadísticas». 02 mide 18 px menos a 390 | 02 y E02 |
| 21 | `SET-P3` dibujada (aprobada, usuario, 2026-10-11): el desglose de «Acerca de» omite «0 generadas»: «113 de exámenes · 2 tuyas». Solo cambia ese texto | 08a, 08b, 12c, E08a y E08b |
| 22 | Los filtros del panel son `radiogroup` con `radio` y `aria-checked` (antes botones con `aria-pressed`): la semántica de `Segmento` y la que fija `TopicSelect.md` f.1 (tabla 2). No cambia el aspecto | 03a, 03b, 03c, 12d, 12e, E03a, E03b y E03c |
| 23 | Con 50 figuras (antes 47: 33 de teléfono y tablet y 17 de escritorio) los tableros miden 14 389 y 14 405 px (390, claro y oscuro), 13 584 (768 y 1280), 9 604 (1366) y 9 657 (1920): el mínimo de margen al tope de 16 384 es de 1 979 px. `capturar.mjs` no cambia | `capturar.mjs` |

Las cifras de §4, las decisiones de §6 y las propuestas de §7 reemplazan a las de la primera pasada.

---

## 1. Cómo se usa

| Acción | Cómo |
|---|---|
| Abrir | `maqueta.html` en el navegador. Las fuentes Plex salen de Google Fonts; sin red cae a la del sistema (D4) |
| Ancho y tema | Selector de la barra superior (390, 768, 1280, 1366, 1920 · Claro, Oscuro) o el control «Claro \| Oscuro» de Home y MateriaSelect. El estado va en el hash: `maqueta.html#768-oscuro`, `maqueta.html#1920-claro` |
| Ir a una figura | Botones «Ir a» de la barra superior (01 a 14, con 03c, 07c y 12e; a 1366 y 1920 px, E01 a E10, con E03c) |
| Estados de control | Hover (solo con puntero), presionado y foco de teclado responden como `comun.md` §5 (`COMUN-P2`): pasar el puntero, mantener presionado, Tab |
| Regenerar | `node openspec/changes/rediseno-plancha/diseno/maqueta/generar.mjs` |
| Recapturar los PNG | `node openspec/changes/rediseno-plancha/diseno/maqueta/capturar.mjs [ancho ...]` (Chrome y cliente CDP de `tools/e2e/`; sin dependencias nuevas). Sin argumentos deja los diez tableros (390, 768, 1280, 1366 y 1920, en claro y oscuro) y, aparte, el recorte de la figura 09 a 390, 768 y 1280. Con anchos, solo esos: `capturar.mjs 1366 1920` |
| Verificar escritorio | `node openspec/changes/rediseno-plancha/diseno/maqueta/verificar.mjs`: 17 figuras en 1024, 1280, 1366 y 1920, en claro y oscuro (§8.3) |
| Origen de los colores | Bloque entre `>>> GENERADO` y `<<< FIN GENERADO` de `maqueta.html`, generado desde `plancha.claro` y `plancha.oscuro`. Ningún otro lugar del HTML ni de `generar.mjs` escribe un color |

El tablero numera 33 figuras: 26 pantallas, o estados de pantalla, y 7 de componente (01b, 03c, 04e, 09, 11c, 13 y 14). En el navegador arma las columnas que caben en la ventana; las capturas usan 4 columnas en los tres anchos. La figura 09 ocupa dos columnas. A 1366 y 1920 px el tablero muestra solo las 17 figuras de escritorio (E01 a E10, con variantes a, b y c) y las capturas usan 2 columnas; a 1280 px muestra la columna única anterior al escritorio, para comparar.

---

## 2. Qué muestra

| Fig. | Pantalla | Estado o variante | Datos | Ficha |
|---|---|---|---|---|
| 01 | MateriaSelect | Reposo, seis materias, campo V5 «Fusiforme», cajetín de una celda (`MATERIA-P4`); nota del creador visible y donación persistente con regla corta | Reales: `MATERIA_LIST`, `CONTEOS`, `svg/<id>.svg`, `filamentos.js`, `DONATION_AMOUNTS` | `MateriaSelect.md` a, b, f; `Banners.md`; `DonationBox.md` |
| 02 | Home | CyR con banner de banco reducido, con contacto en botón (`BAN-P1`), y nota de privacidad (web); conteo sin «preguntas extra» (`HOME-P4`) y «Ajustes» con su descripción nueva (`HOME-P5`) | Reales: 113 reales, sin extra, examen de 50 | `Home.md`; `Banners.md` |
| 03a | TopicSelect | `practice`, con los tres grupos: «Fuente» («Todas» y «Solo mías»), «Parcial» (marca de parcial, `PAR-P2`) y «Temporizador»; 27 temas | Reales: BCYT, conteo por tema tras `dedupeQuestions`, más 2 propias de muestra | `TopicSelect.md` A; `comun.md` §12.3; `TOPIC-P6`, caso 4 |
| 03b | TopicSelect | `exam`, con «Fuente» y «Temporizador» y sin grupo «Parcial» | Reales: CyR, 115 disponibles (113 del banco y 2 propias de muestra), sorteo de 50 | `TopicSelect.md` B (`TOPIC-P5`); `TOPIC-P6`, caso 2 |
| 04a | Quiz | Sin responder, sin temporizador, progreso por casillas | Real: `CYR-PROTOTIPO-1-Q25`, 05 / 15 | `Quiz.md` c.2 |
| 04b | Quiz | Respondida correcta, temporizador normal (14:32) | Igual | c.2, c.4 |
| 04c | Quiz | Respondida incorrecta (A), correcta marcada (C), opción apagada (B), explicación, reportar y «Siguiente» | Igual | c.2 |
| 04d | Quiz | Temporizador en alerta (01:42, marco `error`), barra continua de progreso | Real: `CYR-PROTOTIPO-1-Q27`, 18 / 113 | c.4, `QUIZ-P3`, `QUIZ-P4` |
| 05a | Results | Tramo alto: 83 %, 20 de 24, con tira; pedido de donación celebratorio, descartable | Muestra | `Results.md` d.1; `DonationBox.md` |
| 05b | Results | Tramo medio: 63 %, 15 de 24; pedido de donación normal, descartable | Muestra | d.1; `DonationBox.md` |
| 05c | Results | Tramo bajo: 38 %, 9 de 24; sin pedido | Muestra | d.1 |
| 06 | Stats | Las tres bandas, una fila «Sin practicar», «Más falladas» (8) | Reales: temas y disponibles de CyR; respuestas y aciertos de muestra | `Stats.md` |
| 01b | MateriaSelect | Matriz de estados de la tarjeta: reposo, presionado, foco, cargando, no disponible | CyR | `MateriaSelect.md` c |
| 04e | Quiz | Chips de origen: examen, generada, propia (la variante «Generada» se conserva por decisión del usuario, 2026-10-11) | Texto fijo | `Quiz.md` c.3 |
| 03c | Componente | Panel de filtros en los cuatro casos de `TopicSelect.md` f.1 (tabla 1): CyR y BCYT, con y sin propias; de uno a tres grupos, con los divisores solo entre grupos presentes | Reales: `config.parciales` de BCYT; las propias son de muestra | `TopicSelect.md` f.1 (`TOPIC-P6`, tablas 1 y 2) |
| 07a | AddQuestion | Formulario inicial: primer tema de CyR en el selector cerrado, cuatro opciones vacías, ninguna correcta | Reales: `TOPICS` de CyR | `AddQuestion.md` c.2 (`ADD-P3`) |
| 07b | AddQuestion | BCYT (27 temas): completa, correcta marcada, «Guardando...», selector deshabilitado | Reales: temas de BCYT; texto de la pregunta de muestra tomado de `2025-T1-Q15` | `AddQuestion.md` c.1, c.2 (`ADD-P2`, `ADD-P3`) |
| 07c | AddQuestion | BCYT (27 temas): selector de tema abierto, lista plana, primer tema elegido | Reales: temas de BCYT | `AddQuestion.md` a.2, c.1, c.2 (`ADD-P3`) |
| 08a | Settings | Plegables cerrados, «No» seleccionado, «2 preguntas propias» | Versión de `app.json` (1.7.5); banco de CyR; 2 propias de muestra | `Settings.md` c.2 (`SET-P1`) |
| 08b | Settings | Plegables abiertos, «Sí» seleccionado, dos tarjetas propias, respaldo web y «Resetear estadísticas» en `error` | Igual | `Settings.md` c.1, c.2 (`SET-P1`, `SET-P2`) |
| 09 | Componente | Pedido de donación, antes (`DON-P1`) y `DON-P5`, aprobada, lado a lado. En cada columna: celebratoria descartable (Results, desde 80 %); persistente con regla corta bajo una tarjeta de materia (MateriaSelect); normal descartable entre el trío y los botones (Results, 60 a 79 %). `DON-P5` lleva banda `acentoBanda`, cuerpo en `acentoFondo` (tokens nuevos, pendientes) y una anotación sobre su peso frente a «Volver a practicar» | Montos de `DONATION_AMOUNTS`; tarjeta de CyR y trío de 15 de 24, de muestra | `DonationBox.md` a, b, c y f (`DON-P5`) |
| 10a | Revisión | Filtro en «Todas», «Volver» arriba, cuatro respuestas (2 acertadas, 2 falladas) con nota | Texto real de CyR; cuáles fallan, de muestra | `Revision.md` c.2 (`REV-P1`, `REV-P2`, `REV-P3`) |
| 10b | Revisión | Filtro en «Incorrectas»: #2 y #4 con su número original | Igual | `Revision.md` c.2 (`REV-P1`) |
| 11a | Examen en curso | BCYT, 2.º parcial, sin responder, 12 / 40, sin temporizador | Real: `2025-T1-Q14` | `ExamenEnCurso.md` c.2 reposo; `comun.md` §12 (`PAR-P1`) |
| 11b | Examen en curso | BCYT, 1.er parcial, respondida: elegida rellena, resto apagado, «Resultado oculto hasta el final»; 31 / 75 con barra continua y 58:20 | Real: `P1-LC-004`; qué opción se elige, de muestra | `ExamenEnCurso.md` c.2 (`EXA-P1`, `PAR-P1`) |
| 11c | Componente | Marca de parcial: insignia 1.er y 2.º parcial; filtro en reposo y seleccionado | Rótulos de `config.parciales` de BCYT | `comun.md` §12.2, §12.3 (`PAR-P1`, `PAR-P2`) |
| 12a | Stats vacío | V1: lámina vacía, `glifo-estadisticas` de `paso 12`, «Practicar» | Copy de `Vacios.md` e | `Vacios.md` a.2 (`VAC-P1`, `VAC-P2`) |
| 12b | TopicSelect vacío | V2: repasar fallos sin falladas, `glifo-repasar`, «Practicar» | Igual | `Vacios.md` a.2 |
| 12c | Settings vacío | V3: «Mis preguntas» abierto sin preguntas propias, con «Agregar pregunta» | Igual | `Vacios.md` a.3 (`VAC-P2`) |
| 12d | TopicSelect vacío | V4: BCYT con «Solo mías» y «1er Parcial» (las propias no traen `parcial`), mezcla en «0 preguntas» y el mensaje de `VAC-P5` bajo el rótulo | Real: BCYT y su parcial; 2 propias de muestra | `Vacios.md` a.4 (`VAC-P5`) |
| 12e | TopicSelect vacío | V4: repasar fallos con «Solo mías» y ninguna propia fallada (CyR), mezcla en «0 preguntas» y el mensaje general | Muestra: qué preguntas fallaron | `Vacios.md` a.4 (`VAC-P3`) |
| 13 | Componente | Banner de banco reducido, nota del creador, nota de privacidad | Copy de `Banners.md` e | `Banners.md` b, c (`BAN-P1`) |
| 14 | Componente | Inventario de los 35 glifos, 11 grandes (`paso 6`) y 24 chicos (`paso 4`) | `svg/glifos/` | `comun.md` §9 |

### Propuestas aprobadas, dónde se ven

| Id | Figuras |
|---|---|
| `COMUN-P1` ilustración en `filamento` | 01, 01b, 02 |
| `COMUN-P2` presionado, hover y foco | 01b (estático) y todo control del HTML (interactivo) |
| `MATERIA-P1` «ESFUNO» | 01, 01b |
| `MATERIA-P4` cajetín de una celda, sin «Banco real» (aprobada, usuario, 2026-10-11; reemplaza a `MATERIA-P2`) | 01, 01b, 09 y E01 |
| `HOME-P1` seis acciones; `HOME-P2` «Plano / Acciones»; `HOME-P3` nota de privacidad | 02, 13 |
| `HOME-P4` conteo sin «preguntas extra» con cero; `HOME-P5` descripción de «Ajustes» (aprobadas, usuario, 2026-10-11) | 02 y E02 |
| `TOPIC-P1` a `TOPIC-P4` | 03a, 03b, 03c, 12d, 12e |
| `TOPIC-P5` tarjeta «Modo Examen» | 03b |
| `TOPIC-P6` grupo «Fuente» de «Todas» y «Solo mías», solo con propias; panel de uno a tres grupos (aprobada, usuario, 2026-10-11) | 03a, 03b, 03c, 12d, 12e, E03a, E03b y E03c |
| `QUIZ-P1` barra propia sin header | 04a a 04d, 11a, 11b |
| `QUIZ-P2` «Reportar pregunta» | 04b, 04c, 11b |
| `QUIZ-P3` temporizador y alerta | 04b (normal), 04d (alerta), 11b |
| `QUIZ-P4` casillas hasta 40, barra continua desde 41 | 04a a 04c (15 casillas), 04d (113: barra), 11a (40: casillas), 11b (75: barra) |
| `QUIZ-P5` a `QUIZ-P9` | 04a a 04d |
| `QUIZ-P10` opciones apagadas | 04b, 04c, 10a, 10b, 11a, 11b |
| `RESULTS-P1` a `RESULTS-P3` | 05a a 05c |
| `STATS-P1` dos marcas; `STATS-P2` leyenda; `STATS-P5` `display` | 06 |
| `STATS-P3` orden de `TOPICS`; `STATS-P4` «Más falladas» | 06 |
| `MAQUETA-P1` barra interna de igual alto | 03a, 03b, 05a a 05c, 06, 07, 08, 10, 12 |
| `MAQUETA-P3` opciones del control de tema de `paso 11` (desviación por invariante, no propuesta: `comun.md` §2.4) | 01, 02 |
| `ADD-P2` rótulos sin dos puntos; `ADD-P3` selector de tema desplegable (aprobada, usuario, 2026-10-11; reemplaza a `ADD-P1`, rechazada) | 07a, 07b, 07c, E09a y E09b |
| `V5` campo de filamentos «Fusiforme» (elegida, usuario, 2026-10-11) | 01 y E01 |
| `SET-P1` «No \| Sí»; `SET-P2` «Resetear estadísticas» en `error` | 08a, 08b |
| `SET-P3` desglose del banco sin «0 generadas» (aprobada, usuario, 2026-10-11) | 08a, 08b, 12c, E08a y E08b |
| `DON-P1` montos en K3 con marco `acento` | Reemplazada por `DON-P5`: solo en la columna «Antes» de 09 |
| `DON-P5` marco `acento` de `border-2`, banda `acentoBanda` en el encabezado, cuerpo en `acentoFondo` y montos K2 de acento con relleno `superficie` (aprobada, usuario, 2026-10-11) | 01, 05a, 05b y 09 (columna derecha) |
| `REV-P1` filtro; `REV-P2` «Volver» arriba; `REV-P3` rótulo de la nota | 10a, 10b |
| `EXA-P1` «Resultado oculto hasta el final» | 11b |
| `PAR-P1` insignia de dos casillas; `PAR-P2` marca en el filtro | 03a, 11a, 11b, 11c |
| `VAC-P1` lámina vacía; `VAC-P2` acción «Practicar» y «Agregar pregunta»; `VAC-P3` mensaje de V4 | 12a a 12c, 12e (`VAC-P3`) |
| `VAC-P5` mensaje de V4 con «Solo mías» y un parcial (aprobada, usuario, 2026-10-11) | 12d |
| `BAN-P1` contacto en botón | 02, 13 |

### Descartadas y retiradas

| Id | Estado |
|---|---|
| `DON-P2` marco `acento` de `border-2`, tres franjas y montos K2 de acento | Descartada (el usuario eligió `DON-P5`); ya no se dibuja |
| `DON-P4` rótulo «Donación» | Descartada por el usuario (2026-10-11); ya no se dibuja. La exploración de la segunda vuelta queda en `.orca/reports/` |
| `DON-P3` glifo propio | Retirada de la ficha (`DonationBox.md` f.2); nunca se dibujó |
| `ADD-P1` temas con salto de línea (filtros K4) | Rechazada (usuario, 2026-10-11): «el usuario debería scrollear demasiado»; ya no se dibuja |
| `ESC-P9` tema a la izquierda del enunciado en AddQuestion | Rechazada (usuario, 2026-10-11); ya no se dibuja: E09a y E09b usan una columna `lectura` |
| `MATERIA-P2` «Banco real» en una segunda celda del cajetín (con C8 y E5 de `CONVENCIONES.md`) | Reemplazada por `MATERIA-P4` (usuario, 2026-10-11); ya no se dibuja |

---

## 3. Datos

| Dato | Origen | Naturaleza |
|---|---|---|
| Materias, orden, nombre, `shortName`, id visible `{shortName} · {NN}` | `src/materias/index.js`, `metadata.js` | Real |
| Conteo por materia | `src/materias/conteos.js` | Real |
| Temas y su orden | `src/materias/<id>/topics.js` | Real |
| Conteo por tema, «preguntas disponibles», «Todos los temas mezclados» | `questions.js` con la copia de `dedupeQuestions` de `TopicSelectScreen.js` | Real |
| Parciales, `examSize`, `bancoReducido` | `src/materias/<id>/config.js` y `metadata.js` | Real |
| Enunciado, opciones, correcta, explicación, examen de origen, parcial | `src/materias/{cyr,bcyt}/questions.js` | Real |
| Preguntas de «Más falladas», preguntas propias (08), respuestas de la revisión (10) | `questions.js`, elegidas por tema | Real el texto; que sean falladas, propias o elegidas es de muestra |
| Resultados (20, 15 y 9 de 24), respuestas y aciertos por tema, aciertos de «Más falladas», tiempos del temporizador, posición en el quiz | `generar.mjs` (`STATS_MUESTRA`, `FALLADAS_MUESTRA`, `FIGURAS`) | Muestra |
| Montos de donación | `DONATION_AMOUNTS` de `src/utils/mercadopago.js` | Real |
| Versión de «Acerca de» | `expo.version` de `app.json` | Real |
| Conteo por origen de «Acerca de» | `source` de `questions.js` y las preguntas propias de muestra; el término «generadas» se dibuja solo si es mayor que cero (`SET-P3`) | Real más muestra |
| Preguntas propias de TopicSelect (03a, 03b, 03c, 12d, 12e, E03a, E03b y E03c) | `PROPIAS` (CyR, las de 08a) y `PROPIAS_BCYT` (los dos primeros temas de BCYT con banco), de `generar.mjs`. Se suman al banco ya deduplicado y no traen `parcial` | Real el texto; que sean propias es de muestra |
| Campo de filamentos | `src/assets/filamentos.js` | Real |
| Ilustraciones de materia | `diseno/svg/<id>.svg`, familia B (se descarta su bloque `<style>`; el color sale de `filamento`) | Real |
| Glifos | `diseno/svg/glifos/*.svg` | Real |

Con las seis materias publicadas sin preguntas generadas, todo `source` es `exam`: los chips «Práctica» y «Tuya» no aparecen en datos reales y se muestran en 04e. Por la misma razón, con datos reales ni el término «preguntas extra» de Home ni el de «generadas» de Ajustes se dibujan (`HOME-P4`, `SET-P3`), y V4 se provoca con «Solo mías» y un parcial (12d, `VAC-P5`) o con «Solo mías» en repasar fallos sin ninguna propia fallada (12e, `VAC-P3`). El filtro «Solo generadas» ya no existe (`TOPIC-P6`).

---

## 4. Verificación

Medido en Chrome headless sobre `maqueta.html`, en 390 claro, 390 oscuro, 768 claro y 1280 oscuro. Las filas marcadas «(09)» se midieron en la pasada de `DON-P5` (2026-10-11), en 390 claro y oscuro, 768 claro, 1280 claro y oscuro, y con el ancho de `.pantalla` forzado a 360 y 320 px. Las demás son de la pasada anterior y no se repitieron: salvo la figura 09, el pedido de donación de 01, 05a y 05b y la cadena de versión (§0, #10, #11 y #13), ninguna figura cambió. Las filas «(3.13b)» se midieron el 2026-10-11, tras la tarea 3.13b, en Chrome headless: 390, 360 y 320 px (claro) y, en escritorio, 1024, 1280, 1366 y 1920 px. Con esa pasada cambiaron las figuras de §0, #17 a #22; las otras 31 de las 47 anteriores quedaron byte a byte iguales.

| Chequeo | Método | Resultado |
|---|---|---|
| Hexadecimales fuera del bloque generado | `generar.mjs` falla si hay alguno | Ninguno |
| Errores de consola y excepciones | `capturar.mjs`, seis combinaciones | Ninguno |
| PNG (3.13b) | `capturar.mjs` | 6 tableros regenerados: 1688 × 14389 (390 claro) y 1688 × 14405 (390 oscuro), 3200 × 13584 (768, claro y oscuro) y 5248 × 13584 (1280, claro y oscuro); 50 figuras en el documento, de las que a estos anchos se ven las 33 de teléfono y tablet. 6 recortes de la figura 09, de sus dos columnas, sin cambio de tamaño: 808 × 1395 y 808 × 1413 (390), 1564 × 1373 y 1564 × 1391 (768), 2588 × 1373 y 2588 × 1391 (1280), claro y oscuro |
| (09) Objetivo táctil (D10) | Todo `button` de las seis secciones de pedido de la figura, tres por columna | 14 por columna; ninguno bajo 44 × 44 px, en las dos. 8 px entre montos. Celdas de monto de `DON-P5`: 73,5 px (390), 88 px (768 y 1280), 66 px (360) y 56 px (320) |
| (09) Desborde | Rectángulo de cada elemento del panel contra el del panel, y de cada pantalla contra el suyo | Ninguno desborda en ninguna de las dos columnas, a 390, 768, 1280, 360 y 320 px: sin scroll horizontal |
| (09) Descartar frente al título | Rectángulo del texto del título contra el del objetivo de descartar | Sin solape: libre desde 37,6 px (390 px, título en una línea) hasta 201,8 px. El objetivo queda a 2 px del borde superior y del derecho del panel en `DON-P5` (marco de 2 px) y a 1 px en `DON-P1`: a ras del marco |
| (09) Propiedades prohibidas | Estilo calculado de cada elemento de las seis secciones | 0 con radio, sombra, degradado, opacidad distinta de 1, cursiva o subrayado |
| (09) Emojis | `\p{Extended_Pictographic}` sobre el texto de las seis secciones | 0 |
| (09) Marco y relleno | Estilo calculado del panel y de su encabezado | `DON-P1`: marco de 1 px `acento`, relleno `superficie`. `DON-P5`: marco de 2 px `acento`; cuerpo en `acentoFondo` (claro `rgb(226, 238, 240)` = #e2eef0, oscuro `rgb(29, 48, 55)` = #1d3037); banda en `acentoBanda` (claro `rgb(11, 110, 128)` = #0b6e80, oscuro `rgb(70, 146, 161)` = #4692a1); título y glifo de descartar en `fondo` (claro `rgb(244, 245, 246)`, oscuro `rgb(11, 13, 16)`); celdas de monto en `superficie` |
| (09) Alto del panel | Medido a 390 px | Normal: 190 px `DON-P1` y 211 px `DON-P5` (+21). Celebratoria: 212 y 233 px. A 360 y 320 px el título salta de línea: banda de 61 px y panel descartable de 228 px (360) y 250 px (320) en `DON-P5` |
| (09) Banda frente a «Volver a practicar» | Razón de contraste y salto de luminosidad L* contra la página (desde `colores.js`); tamaño medido en el navegador a 390 px | Claro: banda 5,40 y K1 16,32 (0,33); L* 54,1 y 88,4 (0,61). Oscuro antes del ajuste, con `acento`: 9,48 y 15,97 (0,59); L* 70,1 y 88,6 (0,79): competía. Oscuro con `acentoBanda`: 5,45 y 15,97 (0,34); L* 52,9 y 88,6 (0,60); croma 24,3 contra 2,3. Banda de 346 × 44 px y K1 de 350 × 52 px. K1 queda 2,9 veces más fuerte contra la página en oscuro y 3,0 en claro. La figura 09 lo anota en la columna de `DON-P5`, en el tema que corresponde |
| Fuentes | `document.fonts` | Plex Sans 400 y 600, Plex Mono 400 y 500, cargadas |
| Radios, sombras, degradados, opacidad, cursiva, subrayado | Estilo calculado de cada elemento de `.pantalla`, en las cuatro combinaciones | 0 |
| Emojis | `\p{Extended_Pictographic}` sobre el texto del documento | 0 |
| Alto de header (D6, D10) | Medido en navegador | 74 px en MateriaSelect y en Home; opciones del control de tema de 44 px, contenedor de 46 px |
| Alto de la barra interna (`MAQUETA-P1`) | Medido en navegador, todas las barras | 77 px (fila de 76 px más el filete), un solo valor: con y sin volver |
| Objetivo táctil (D10) | Todo `button` habilitado de las pantallas | Ninguno bajo 44 × 44 px (en la primera pasada eran dos opciones del control de tema) |
| Columna (D10) | Medida en navegador | 390 px: ancho completo menos márgenes. 768 y 1280: 448 px centrada; barras y filetes a todo el ancho |
| Botón «Cambiar materia» y fila de HeaderMarca a 360, 359 y 320 px (`comun.md` §1.1) | Chrome headless sobre `maqueta.html`, con el ancho de `.pantalla` forzado | 360 px: botón con texto de 174 × 44 px, control de tema de 114 px y 32 px entre ambos; 359 y 320 px: botón de 44 × 44 px, `aria-label` «Cambiar materia» y al menos 122 px entre controles. Alto de header 74 px en todos. Ninguna de las 30 figuras desborda a 360 ni a 320 px; ningún botón bajo 44 × 44 px |
| Nota del creador (`MAQUETA-P4`) | Medido en navegador | Objetivo de descartar hasta 45 px desde el borde superior de la nota y primer párrafo desde 55 px: sin superposición |
| Selector, hash y control de tema | Clics por CDP, repetidos en esta pasada | El control de tema cambia el tema y `aria-checked`, el selector cambia el ancho, el hash se actualiza (`#768-oscuro`) y «Ir a 13» lleva la figura al borde superior |
| Glifos | Cuadrados `g-falta` y figura 14 | 35 de 35 dibujados; huella `cf64b601`, impresa por `generar.mjs` y escrita en `<meta name="generator">` |
| Glifo faltante | `MAQUETA_GLIFOS=<carpeta vacía> MAQUETA_SALIDA=<archivo> node generar.mjs`, repetido en esta pasada | 0 de 35 dibujados; los 35 salen como cuadrado de `filete` numerado y el panel al pie los lista; el tablero no se rompe |
| (3.13b) Panel de filtros, casos 1 a 4 de `TopicSelect.md` f.1 | Chrome headless sobre 03c, a 390, 360 y 320 px, en claro | Alto del panel: 98, 195, 247 y 344 px, los mismos en los tres anchos. «Fuente»: «Todas» de 67 px marcado y «Solo mías» de 91 px, a 8 px entre sí, en una sola fila en los tres anchos (166 px de 320, 290 y 250 útiles). Con 03a, la mezcla queda a 12 px (`paso 3`) bajo el panel. Sin desborde horizontal |
| (3.13b) Panel en escritorio | E03a, E03b y E03c a 1024, 1280, 1366 y 1920 px, en claro | Una sola fila (mismo borde superior) y 98 px de alto en los cuatro casos; «Parcial» en una línea desde 1024. «Fuente» 166 px, «Temporizador» 200 y «Parcial» el sobrante (498 a 1366; ancho natural 358); divisores verticales de 1 px con 14 px (`paso 3.5`) a cada lado; «Temporizador» a 14 px del borde derecho. Sin «Parcial», el sobrante queda a la derecha (527 px a 1366, 1015 a 1920); con «Temporizador» solo, a la izquierda y sin divisor |
| (3.13b) Alto de las figuras | Chrome headless, `.pantalla`, contra el HTML anterior | 03a y 03b: 52 px menos (2479 → 2427 y 604 → 552 a 390; 2427 → 2375 y 604 → 552 a 768 y 1280). E03a: 1366 → 1314 a 1366 y sin cambio a 1920 (979); E03b sin cambio (437). 02: 1150 → 1132 a 390, sin cambio a 768, 1280 y 1366, y 466 → 452 en E02 a 1920 |
| (3.13b) Cajetín de la tarjeta de materia | 01 y 01b a 390, 360 y 320 px | Una celda de ancho completo (348, 318 y 278 px) y 35 px de alto, igual en reposo, presionado, foco, cargando y no disponible; tarjeta de 95 px (117 a 320 en las de nombre de tres líneas, como antes). «Banco real» no está en el documento |
| (3.13b) Home | 02 a 390, 360 y 320 px | Conteo «113 preguntas reales» en una línea en los tres anchos (antes dos: «113 preguntas reales · 0 preguntas extra»). Descripción de «Ajustes»: una línea a 390 y dos a 360 y 320 (antes una a 390 y 360) |
| (3.13b) V4 | 12d y 12e a 390, 360 y 320 px | El mensaje de `VAC-P5` (60 caracteres) y el de `VAC-P3` (54) saltan a dos líneas en los tres anchos; `paso 2` bajo el rótulo y `paso 5` lateral; sin desborde |
| (3.13b) Ajustes | 08a, 08b y 12c | «113 de exámenes · 2 tuyas» con total 115; sin propias, «113 de exámenes · 0 tuyas» |
| (3.13b) Qué cambió | HTML nuevo contra el anterior, figura por figura | 31 de 47 figuras idénticas; 16 modificadas (01, 01b, 02, 03a, 03b, 08a, 08b, 09, 12c, 12d, E01, E02, E03a, E03b, E08a y E08b) y 3 nuevas (03c, 12e y E03c). Fuera de las figuras, solo el CSS del panel y de la celda y los tres botones de navegación nuevos |
| (3.13b) Verificador de escritorio | `verificar.mjs`, 17 figuras × 4 anchos × 2 temas | 136 combinaciones: sin desborde, sin objetivos bajo 44 × 44, sin propiedades prohibidas ni emojis, foco sin saltos hacia atrás |
| (3.13b) Capturas | `capturar.mjs` | 10 tableros y 6 recortes regenerados; sin errores de consola ni excepciones |

### Lo que se ve a 1280 px

| Hecho | Origen |
|---|---|
| El contenido ocupa 448 de 1280 px y el resto es `fondo` | Es la columna anterior al escritorio (`ESC-P0`, aprobada el 2026-10-11): se conserva para comparar. El escritorio se ve a 1366 y 1920 px (§8) |

---

## 5. Glifos

| Aspecto | Valor |
|---|---|
| Inventario | 35 ids de `comun.md` §9 |
| Dibujados al capturar | 35 de 35 en `svg/glifos/` (huella `cf64b601`). Ninguno faltaba |
| Nuevos desde la primera pasada | `glifo-mensaje`, `glifo-banco-reducido`, `glifo-trofeo`, `glifo-guardar`, `glifo-importar`, `glifo-correo`, `glifo-externo`, `glifo-eliminar` |
| Dónde se ven los nuevos | mensaje: 01, 13; banco-reducido: 02, 13; trofeo: 05a, 09; guardar: 07a, 08b; importar: 08b; correo: 02, 08b, 13; externo: 08b; eliminar: 08b. Todos, en 14 |
| Trazo | Los archivos traen `viewBox 0 0 16 16` y trazo 1,5 u en la raíz. La maqueta aplica `strokeWidth = 24 / lado`: 1 u a 24 px, 1,5 u a 16 px, 0,5 u a 48 px (estado vacío, `paso 12`); el trazo en pantalla es 1,5 px a cualquier lado |
| Lado | `paso 6` (24 px) para los grandes; `paso 4` (16 px) para los chicos; `paso 12` (48 px) en los estados vacíos; la marca de tramo de Results usa un glifo chico a 24 px (`Results.md` a.2) |
| Chevron de plegable | El mismo `glifo-chevron` girado 90° (cerrado, apunta abajo) y −90° (abierto, apunta arriba), en `acento` |
| Si falta alguno | Cuadrado de `filete` del lado del glifo, con el número del glifo en `rotulo`; el panel al pie del tablero lista «número = id». No ocurrió |

---

## 6. Lo que la ficha no fija y la maqueta resolvió

Estas decisiones las tomó la maqueta porque la ficha no las fijaba. La corrección de la auditoría 1.5 (2026-10-10) fijó en la ficha de su superficie las que cambian lo que se ve (columna «Estado»); las demás son del tablero y ninguna ficha las regula. Las 12 primeras vienen de la primera pasada; la 9 cambió porque las fichas de 1.3 ya existen. Ninguna es propuesta: no cambian el uso ni salen del boceto o de `main`.

| # | Dónde | Qué resolvió la maqueta | Por qué | Estado |
|---|---|---|---|---|
| 1 | MateriaSelect, regla graduada | Marca menor cada 10 px (3,5 px de alto) y mayor cada 50 (6,5 px), en `tintaSec`, apoyadas en el filete inferior | La ficha fija alto, color y filete; el espaciado sale del boceto (`hibrido.html`) | Fijada: `MateriaSelect.md` a.2 |
| 2 | MateriaSelect, campo | El SVG se estira al ancho de la lámina y a `paso 28` de alto (`preserveAspectRatio="none"`) | `MateriaSelect.md` a.4: «se estira en horizontal» | Ya en la ficha: `MateriaSelect.md` a.4 |
| 3 | Marcas de esquina | 8 px de lado; sobresalen 4 px del borde exterior | `comun.md` §6: lado `paso 2`, sobresale `paso 1` | Ya en la ficha: `comun.md` §6 (`paso 2` y `paso 1`) |
| 4 | Results, leyenda de la tira | Muestra de 8 × 8 en `acierto` y de 8 × 4 en `error` delante del texto | La ficha define el texto y no la muestra; proporción de la tira (`paso 6` y `paso 3`) | Fijada: `Results.md` a.2 #6 y b |
| 5 | Stats, «Más falladas», marca de banda | Delante del valor «{pct}% ({c}/{a})», a la derecha | La ficha se contradecía: a.4 la nombraba antes de «#{n}» y la tabla b, h y `comun.md` §4 la ponen delante del valor. a.4 quedó alineada con el valor (auditoría 1.5, B3) | Resuelta: `Stats.md` a.4 (delante del valor) |
| 6 | TopicSelect, «Comenzar examen» | Relleno vertical `paso 3.5` y horizontal `paso 8` | La ficha fija el horizontal; el vertical es el de los otros botones K1 | Fijada: `TopicSelect.md` a.2 |
| 7 | Quiz, nota | Glifo y rótulo en fila con `paso 1.5` de separación; texto con `paso 1.5` de margen superior | La ficha no fija esa separación | Fijada: `Quiz.md` a.3 |
| 8 | Quiz, alto de pantalla | 844 px mínimo, con la barra inferior pegada abajo | Solo del tablero: el alto de un teléfono | Del tablero: ninguna ficha la regula |
| 9 | Bloques «ver 1.3» (primera pasada) | Ya no hay: cada bloque es el componente de su ficha. Los componentes de 1.3 además se muestran aislados en 09 y 13 | Las fichas de 1.3 fijan lugar e interior | Resuelta en la primera pasada |
| 10 | Áreas seguras | Cero | La maqueta es web | Del tablero: ninguna ficha la regula |
| 11 | TopicSelect, tarjeta de mezcla | `paso 1.5` bajo el rótulo «Mezcla» y `paso 1` sobre el conteo | La ficha fija solo el primero | Fijada: `TopicSelect.md` a.4 |
| 12 | Stats, fila «Sin practicar» | «Sin practicar» en `detalle` y `tintaSec` a la derecha, sin barra, y «{t} preguntas disponibles» debajo | `Stats.md` c | Fijada: `Stats.md` a.3 |
| 13 | Settings, «Cuestionario» | Cada opción de «No \| Sí» mide 44 px de alto útil y el contenedor suma su borde (46 px) | La ficha fija «alto `paso 11`»; mismo criterio que `MAQUETA-P3` | Fijada: `Settings.md` a.2 |
| 14 | Settings, «Acerca de» | `paso 3` de margen encima del filete de cada franja | La ficha fija el relleno bajo el filete, no el espacio sobre él | Fijada: `Settings.md` a.5 |
| 15 | Settings, tarjeta de pregunta propia | La fila del tema mide 44 px por el objetivo de eliminar; sin márgenes negativos. Tema en `rotulo` que salta de línea si es largo | La ficha fija el objetivo y la fila, no cómo conviven | Fijada: `Settings.md` a.4 |
| 16 | AddQuestion, selector de tema | El nombre alineado a la izquierda dentro del filtro, que salta de línea; los filtros no se estiran | La ficha fija que el nombre salte de línea, no su alineación | Fijada: `AddQuestion.md` a.2 |
| 17 | Revisión, tarjetas | Cuatro respuestas de muestra en lugar de «hasta cientos»; la barra dice «pKapp · Resultados» | Alcanza para mostrar los dos estados y las dos vistas del filtro | Del tablero: muestra |
| 18 | Vacios V3, panel compacto | Texto en `detalle` centrado y botón K2 centrado debajo | `Vacios.md` a.3: «contenido centrado»; el paso del texto sale de b | Fijada: `Vacios.md` a.3 |
| 19 | Marca de parcial | Casilla de 10 px (`paso 2.5`) con borde de 1 px del color del contenedor; la llena, rellena con el mismo color | `comun.md` §12.2 fija medida, marco y relleno; el color es el del texto | Ya en la ficha: `comun.md` §12.2 |
| 20 | Donación en Results | 05a celebratoria y 05b normal; 05c sin pedido | `DONATION_MIN_SCORE` y `DONATION_WARM_SCORE` (`DonationBox.md` d.1); el «1 de cada 3» es de muestra | Del tablero: muestra; umbrales en `DonationBox.md` d.1 |
| 21 | Figuras 09, 11c, 13 y 14 | Varias variantes en una figura, con rótulo de estado, como 01b y 04e | Son componentes, no pantallas | Del tablero |
| 22 | Tablero, columnas | 4 columnas en la captura, en los tres anchos (antes 3 a 768 y 1280 px) | Con 2 el PNG pasaba el tope de alto (§0, #8); con 3 y una figura 09 de varias columnas también (§0, #10) | Del tablero |
| 23 | Figura 09, comparación | Dos columnas de pantalla: «Antes» (`DON-P1`) y `DON-P5`. Cada una con la celebratoria sola, la persistente bajo una tarjeta de CyR con su regla corta, y la descartable entre un trío de 15 de 24 y los tres botones de Results. Una anotación en la columna de `DON-P5`, sobre el contexto de Results, dice cómo pesa la banda frente a «Volver a practicar» en el tema activo | Para decidir si el pedido «se nota» y si compite con la acción primaria hay que verlo junto a lo que lo rodea; ninguna ficha fija esos vecinos en una figura | Del tablero: muestra |
| 24 | Figuras 03c y E03c | Los cuatro casos del panel de filtros, uno bajo otro, con un rótulo de caso: CyR sin propias, CyR con propias, BCYT sin propias y BCYT con propias. En escritorio, cada panel a ancho de hoja | La ficha define los casos (`TopicSelect.md` f.1, tabla 1) y no una figura; para ver el panel con de uno a tres grupos hay que mostrarlos juntos | Del tablero: muestra |

---

## 7. Propuestas nuevas

Surgieron al maquetar. No se aplicaron en la maqueta: se dibuja lo aprobado. El pedido de donación (`DON-P5`) no surgió al maquetar sino de un pedido del usuario; está aprobado y se dibuja en la maqueta.

### Estado de las anteriores

| Id | Estado | Cómo se ve |
|---|---|---|
| `MAQUETA-P1` | Aprobada (usuario, 2026-10-10); `comun.md` §3.5 | Aplicada en la maqueta (§0, #3) |
| `MAQUETA-P3` | Desviación por invariante (D10, 44 × 44 pt), no propuesta y sin estado de aprobación: `comun.md` §2.4; la recogen §1, §2.1 y §8 y `tokens.md` c.3 | Aplicada en la maqueta (§0, #4) |
| `MAQUETA-P2` | Bug, se corrige en 3.6: es un bug de `main`, no una propuesta. `Results.md` (a.1 #7, d.2): el chip muestra `TOPICS[topic]` si `topic` es una clave y «Todos los temas» si no | La figura 05b sigue dibujando la clave cruda hasta que la maqueta se regenere |
| `DON-P5` | Aprobada (usuario, 2026-10-11) con un ajuste de oscuro: la banda baja a `acentoBanda`; reemplaza a `DON-P1`. `DonationBox.md` f.1 | Aplicada en 01, 05a, 05b y 09 (§0, #10 y #13) |
| `DON-P2`, `DON-P4` | Descartadas | Ya no se dibujan |
| `DON-P3` | Retirada de la ficha (`DonationBox.md` f.2) | Nunca se dibujó |
| `TOPIC-P6` | Aprobada (usuario, 2026-10-11); `TopicSelect.md` f.1, con las cinco reglas derivadas confirmadas por el Ingeniero. El grupo «Fuente» pasa a «Todas» y «Solo mías», solo con preguntas propias, y el panel lleva de uno a tres grupos | Aplicada en 03a, 03b, 03c, 12d, 12e, E03a, E03b y E03c (§0, #17 y #22); medida con y sin propias (§4, filas 3.13b) |
| `HOME-P4`, `HOME-P5` | Aprobadas (usuario, 2026-10-11); `Home.md` f y f.1 | Aplicadas en 02 y E02 (§0, #20) |
| `SET-P3` | Aprobada (usuario, 2026-10-11); `Settings.md` f y f.1 | Aplicada en 08a, 08b, 12c, E08a y E08b (§0, #21) |
| `MATERIA-P4` | Aprobada (usuario, 2026-10-11); `MateriaSelect.md` f y f.2. Reemplaza a `MATERIA-P2`; retira C8 y E5 | Aplicada en 01, 01b, 09 y E01 (§0, #19) |
| `VAC-P5` | Aprobada (usuario, 2026-10-11); `Vacios.md` f y f.1 | Aplicada en 12d, con 12e para el mensaje general (§0, #18) |

### Nuevas

| Id | Qué cambia | Motivo | Tipo | Estado |
|---|---|---|---|---|
| `MAQUETA-P4` | En la nota del creador, el texto arranca debajo del objetivo de descartar: el encabezado reserva alto mínimo `paso 8`, que con el relleno superior `paso 3.5` supera el objetivo (`paso 11`) | El objetivo de `paso 11` pegado al marco baja hasta 44 px y el texto arranca a 38 px (`paso 3.5` + rótulo de 16 + `paso 2`): 6 px del objetivo se superponen con la primera línea. En el pedido de donación no ocurre: el título de 22 px lleva el texto a 44. Figuras 01 y 13 | defecto (D10, CD-10) | Resuelta como defecto en `Banners.md` a.2 #1: decisión del Ingeniero, no propuesta. Expresada con un paso existente (`paso 8`) y aplicada en la maqueta (§0, #9) |

### Tokens nuevos, pendientes de alta

Los da de alta el Ingeniero en `tokens.md` y `colores.js` con esta tabla (`DonationBox.md` sección i). Los valores son los que dibuja la maqueta, derivados de tokens existentes por `generar.mjs`.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `acentoFondo` | #e2eef0 (12 % de `acento` sobre `superficie`) | #1d3037 (15 % de `acento` sobre `superficie`) | Relleno del cuerpo y del pie del pedido de donación |
| `acentoBanda` | #0b6e80 (igual que `acento`) | #4692a1 (73 % de `acento` sobre `fondo`) | Relleno de la banda del encabezado del pedido de donación, con título y glifos en `fondo` |

### Observaciones sin acción propuesta

| Observación | Dónde |
|---|---|
| `ADD-P1` (aprobada con dudas) quedó rechazada (usuario, 2026-10-11): con BCYT los 27 temas ocupaban cerca de la mitad del alto de la pantalla antes del enunciado. Las figuras 07a a 07c dibujan `ADD-P3`, que la reemplaza | Figuras 07a a 07c |
| `VAC-P2` (aprobada con dudas, «revisión del usuario al implementar»): se ve en 12a, 12b y 12c como K2 de ancho por contenido, centrado, bajo el texto | Figuras 12a a 12c |
| `filamentos.js` modula cada trazo del campo con `strokeOpacity` (0,25 a 1 en V5). Ya declarado como única excepción en `comun.md` §0 y `CONVENCIONES.md` CD-24 | Figura 01 |
| Los glifos usan `viewBox 0 0 16 16`; `comun.md` §9 ya lo dice, y el desvío de la primera pasada (grilla de 24) quedó resuelto | Figuras 01 a 14 |
| El texto de la nota del creador es el del usuario (`Banners.md` e): la maqueta lo copia tal cual | Figuras 01 y 13 |

---

## 8. Escritorio (tarea 3.10)

Pedido del usuario (2026-10-11): «La UI debería adaptarse también a un monitor clásico horizontal». El escritorio (`ESC-P0` a `ESC-P8` y `ESC-P10` a `ESC-P12`, aprobados por el usuario el 2026-10-11, D10; `ESC-P9`, rechazada) está en `pantallas/comun.md` §7.2, `tokens.md` c.4 y la sección «Escritorio» de cada ficha. Esta maqueta lo dibuja con los mismos componentes que las figuras de teléfono y tablet: cambia solo la disposición, y el orden de DOM es el del teléfono.

### 8.1 Qué muestra

Las 17 figuras solo se ven a 1366 px (corte `escritorio`, desde 1024) y a 1920 px (corte `amplio`, desde 1440). Mismos datos que su figura de teléfono y tablet.

| Fig. | Superficie | Variante | Columna | Ficha · propuesta |
|---|---|---|---|---|
| E01 | MateriaSelect | Lámina y nota del creador a la izquierda; rejilla de 2 columnas (3 a 1920) y pedido de donación al pie | 01 | `MateriaSelect.md` · `ESC-P1` |
| E02 | Home | Tarjeta de materia y banner a la izquierda; seis acciones en 1 columna (2 a 1920) y nota de privacidad | 02 | `Home.md` · `ESC-P2` |
| E03a | TopicSelect | Practicar, BCYT con parcial, con propias y 27 temas: panel de tres grupos en una fila, mezcla y temas en 2 columnas (3 a 1920) | 03a | `TopicSelect.md` · `ESC-P3`, `TOPIC-P6` |
| E03b | TopicSelect | Modo examen, CyR con propias: panel de dos grupos, «Fuente» y «Temporizador», y tarjeta centrada con tope `lectura` | 03b | `TopicSelect.md` · `ESC-P3`, `TOPIC-P6` |
| E03c | TopicSelect | Componente: el panel en los cuatro casos de `TopicSelect.md` f.1 (tabla 1), cada uno a ancho de hoja | 03c | `TopicSelect.md` · `ESC-P3`, `TOPIC-P6` (tabla 4) |
| E04a | Quiz | Sin responder, en columna `lectura` | 04a | `Quiz.md` · `ESC-P4` |
| E04b | Quiz | Respondida incorrecta con explicación | 04c | `Quiz.md` · `ESC-P4` |
| E04c | Examen en curso | BCYT, 1.er parcial, respondida, sin retroalimentación | 11b | `ExamenEnCurso.md` · `ESC-P4` |
| E05a | Results | Tramo alto, pedido de donación celebratorio: tarjeta a la izquierda; trío, pedido y botones a la derecha | 05a | `Results.md` · `ESC-P5` |
| E05b | Results | Tramo bajo, sin pedido | 05c | `Results.md` · `ESC-P5` |
| E06 | Revisión | Encabezado, «Volver» y filtro a la izquierda; cuatro tarjetas y botones finales a la derecha | 10a | `Revision.md` · `ESC-P6` |
| E07 | Stats | Tarjeta global y leyenda a la izquierda; filas por tema (2 columnas a 1920); «Más falladas» debajo, en columnas | 06 | `Stats.md` · `ESC-P7` |
| E08a | Ajustes | Plegables cerrados; «Acerca de» a la derecha | 08a | `Settings.md` · `ESC-P8` |
| E08b | Ajustes | Plegables abiertos, «Sí» seleccionado | 08b | `Settings.md` · `ESC-P8` |
| E09a | AddQuestion | BCYT completa, correcta marcada, 27 temas: una columna `lectura`; selector de tema cerrado | 07b | `AddQuestion.md` · Escritorio (`ESC-P9` rechazada) |
| E09b | AddQuestion | BCYT, selector de tema abierto: la lámina empuja el formulario dentro de la columna | 07c | `AddQuestion.md` · Escritorio, `ADD-P3` |
| E10 | Stats vacío | V1: barra en la hoja de su pantalla y lámina `lectura` centrada | 12a | `Vacios.md` · `ESC-P12` |

El pedido de donación (`ESC-P10`) y los avisos (`ESC-P11`) se ven dentro de E01, E02 y E05a. La columna «Columna» da la figura equivalente con la columna única `columna`.

### 8.2 Cómo se compara

| Qué | Cómo |
|---|---|
| Antes | A 1280 px el tablero sigue mostrando las 31 figuras de teléfono y tablet con la columna única de `columna`: es la disposición anterior al escritorio, para comparar. La leyenda de cada figura dice «1280 px · columna única, antes del escritorio» |
| Después | A 1366 y 1920 px, E01 a E10. La leyenda dice «escritorio (ESC)» y «amplio (ESC)» |
| Misma pantalla | La columna «Columna» de §8.1 da la figura equivalente a 1280 |
| Corte | `verificar.mjs` también mide 1024 y 1280 forzando el ancho de la pantalla sobre el tramo `escritorio` |

### 8.3 Verificación

Medido con `verificar.mjs` en Chrome headless: 17 figuras en 1024, 1280, 1366 y 1920 px, en claro y oscuro (136 combinaciones; 128 antes de E03c). El alto útil de la ventana es el de la pantalla menos la barra de tareas y el cromo del navegador: ≈ 640 px a 1366 × 768 y ≈ 955 px a 1920 × 1080.

| Chequeo | Método | Resultado |
|---|---|---|
| Hexadecimales fuera del bloque generado | `generar.mjs` falla si hay alguno | Ninguno |
| Errores de consola y excepciones | `capturar.mjs` y `verificar.mjs` | Ninguno |
| Desborde horizontal | Rectángulo de cada elemento contra el de su pantalla | Ninguno en las 136 combinaciones: sin scroll horizontal desde el corte |
| Objetivo táctil (D10) | Todo `button` habilitado de las 17 figuras | Ninguno bajo 44 × 44 px |
| Propiedades prohibidas | Estilo calculado: radio, sombra, degradado, opacidad distinta de 1, cursiva, subrayado | 0 |
| Emojis | `\p{Extended_Pictographic}` sobre el texto de cada figura | 0 |
| Foco frente al orden visual | Cada par de paradas consecutivas en el DOM: no sube sin moverse a la derecha ni retrocede en la misma fila. Una lista abierta (`listbox`) cuenta como una parada: la fila elegida | 0 saltos hacia atrás en las 136 combinaciones |
| Regiones (`tokens.md` c.4) | Ancho medido | `hoja`: lateral 320 y principal 600 (también a 1024: la hoja de 952 entra con margen `paso 8`); `hoja-amplia`: lateral 320 y principal 1088; AddQuestion, una columna `lectura` de 600; Ajustes, principal 600 y lateral 320 |
| Medida de línea | Texto de prueba de 1467 caracteres en cada paso, en el ancho real | Enunciado (`titulo`) 64 caracteres por línea; opción (`cuerpo`) 73; nota y revisión (`cuerpo`) 77; descripción de acción (`detalle`) 77. Con `lectura` de 640 daban 70, 77, 86, 86 y 86 |
| Campo de filamentos | 320 de ancho sobre 348 del dibujo | 0,92×; `encuadre: 'none'` sin cambio (límite de `design.md` D2: ~1,4×) |
| Las figuras de teléfono y tablet | HTML de cada figura, sin espacios, entre el generador anterior y el de esta pasada, con el mismo `src/` | Idéntico salvo 07a y 07b (selector `ADD-P3`) y la figura nueva 07c; las E son las mismas, con E09 partida en E09a y E09b |
| PNG | Alto de la página con el HTML de esta pasada, en el viewport de `capturar.mjs` | Los PNG no se regeneraron (quedan fuera de git). Tableros: 390, 1688 × 14340; 768, 3200 × 13583; 1280, 5248 × 13583; 1366, 2808 × 9875; 1920, 3916 × 9430; 31 figuras de teléfono y tablet y 16 de escritorio. Todos bajo el tope de 16 384 px: el margen mínimo es de 2 044 px, a 390. Los regeneró la tarea 3.13b (§4): 390, 1688 × 14389 (claro) y 14405 (oscuro); 768 y 1280, 13584; 1366, 9604; 1920, 9657, con 33 figuras de teléfono y tablet y 17 de escritorio; margen mínimo de 1 979 px a 390 |

Alto del contenido, en ventanas útiles (claro). El alto de una figura de quiz no es comparable: la maqueta le fija el alto de una ventana. En E09a, «Vigente» es la figura 07b a 1280 px, con `ADD-P3` y la columna `columna` (el 2,7 y el 1,8 de `ADD-P1` ya no rigen).

| Figura | 1366 × 768 | Vigente (columna única) | 1920 × 1080 | Vigente (columna única) |
|---|---|---|---|---|
| E01 MateriaSelect | 1,1 | 2,1 | 0,6 | 1,4 |
| E02 Home | 1,1 | 1,6 | 0,5 | 1,1 |
| E03a TopicSelect, 27 temas, con propias | 2,1 | 3,7 | 1,0 | 2,5 |
| E03b Modo examen, con propias | 0,7 | 0,9 | 0,5 | 0,6 |
| E03c Panel de filtros, cuatro casos | 0,9 | 1,6 | 0,6 | 1,1 |
| E05a Results, tramo alto | 1,0 | 1,4 | 0,6 | 1,0 |
| E05b Results, tramo bajo | 0,7 | 1,1 | 0,4 | 0,7 |
| E06 Revisión, 4 respuestas | 3,4 | 4,2 | 2,3 | 2,8 |
| E07 Stats, 8 temas | 2,0 | 3,0 | 0,9 | 2,0 |
| E08a Ajustes, cerrados | 0,7 | 1,1 | 0,5 | 0,7 |
| E08b Ajustes, abiertos | 1,6 | 1,9 | 1,0 | 1,3 |
| E09a AddQuestion, 27 temas, selector cerrado | 1,4 | 1,5 | 0,9 | 1,0 |
| E09b AddQuestion, selector abierto | 1,9 | — | 1,3 | — |
| E10 Vacío V1 | 0,6 | 0,6 | 0,4 | 0,4 |

### 8.4 Lo que resolvió la maqueta

Decisiones del tablero, no propuestas. Las fija la ficha de su superficie en su sección «Escritorio».

| # | Dónde | Qué resolvió la maqueta | Estado |
|---|---|---|---|
| 1 | Cortes | `escritorio` (1366) y `amplio` (1920) se activan por el ancho del tablero (`data-ancho`): una media query respondería al ancho de la página y no al de cada figura | Del tablero |
| 2 | Quiz, alto | La figura fija el alto de una ventana (640 a 1366, 960 a 1920) para pegar la barra inferior abajo | Del tablero |
| 3 | Rejilla de MateriaSelect | Las tarjetas de una fila igualan su alto y su cajetín queda abajo | Fijada: `MateriaSelect.md` · Escritorio |
| 4 | Flujo por columnas | CSS `columns` con `break-inside: avoid`: el orden de DOM baja por la primera columna y sigue por la siguiente | Fijada: `comun.md` §7.2 |
| 5 | Panel de filtros en fila | El divisor entre grupos pasa a filete vertical `filete`; «Fuente» y «Temporizador» toman el ancho de su contenido y «Parcial», el sobrante (`TOPIC-P6`, regla R2 confirmada por el Ingeniero) | Fijada: `TopicSelect.md` · Escritorio y f.1 (tabla 4) |
| 6 | Estados vacíos | La barra usa la hoja de su pantalla y la lámina, `lectura` centrada | Fijada: `Vacios.md` · Escritorio |
| 7 | AddQuestion | En una columna `lectura` la lámina abierta del selector abre hacia abajo y empuja el formulario, como a 390 px; no hay región lateral | Fijada: `AddQuestion.md` · Escritorio |

### 8.5 Observaciones sin acción propuesta

| Observación | Dónde |
|---|---|
| Con 27 temas, TopicSelect y Estadísticas siguen pidiendo más de una ventana a 1366 × 768 (2,1 y 2,0): es el volumen de datos, no la disposición. A 1920 × 1080 caben en una ventana | E03a, E07 |
| La revisión mide 3,4 ventanas con cuatro respuestas de muestra: una tarjeta con cuatro opciones y nota ocupa ≈ 0,8 ventanas, y la lista crece con las respuestas igual que en teléfono | E06 |
| El pedido de donación de MateriaSelect a 1920 px mide el ancho de la región principal (1088): es `ESC-P10`; el ancho del texto no cambia | E01 |
| Una región lateral corta deja hueco debajo cuando la principal es larga (Stats, Revisión, Home). No se ancla (`comun.md` §7.2): anclar una región más alta que la ventana ocultaría su pie | E06, E07 |

