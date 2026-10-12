# Glifos Plancha · tarea 1.4

| Campo | Valor |
|---|---|
| Change | `openspec/changes/rediseno-plancha` (D9, D10; spec `design-system`, «Interfaz sin emojis») |
| Rama | `rediseno` |
| Insumos | `pantallas/comun.md` §8 y §9; `tokens.md` a.1, c.2 y e; `hibrido.html` (flechas, chevron, aspa, tilde, más, menos, practicar, examen, repasar, estadísticas); `REFERENCIAS.md`; `svg/<materia>.svg` |
| Entrega | 37 archivos `<id>.svg` en esta carpeta (34 de 1.4, `glifo-eliminar` de 1.4b y `glifo-pausar` y `glifo-reanudar` de 3.14b, `BAN-P2`); `glifos-prueba.html` y `glifos-prueba.png` (los 35 de 1.4 y 1.4b); este archivo |
| Fuera de alcance | Ninguno. `glifo-eliminar` (fila de 1.3 en §9) se dibujó en 1.4b con las reglas de este archivo |
| Reglas del coordinador (C5) | `viewBox` común; `stroke-width` una sola vez en la raíz, en unidades del `viewBox`; un archivo por glifo, sin variantes grande o vacío; sin `g`, `use`, `defs` ni `transform`; puntos como círculo con trazo de radio ≥ 0,75; `glifo-reportar` en `tinta` |

---

## 1. Grilla y trazo

| Atributo | Valor | Por qué |
|---|---|---|
| `viewBox` | `0 0 16 16`, el mismo en los 37 | Grilla del glifo chico (`paso 4`): 1 u = 1 px. §8 pide «grilla propia» para el chico y es la más dura; grande y vacío son la misma figura ampliada (§3) |
| `fill` | `none` | §9: sin relleno |
| `stroke` | `currentColor` | §9: el color lo pone el contenedor con un token de a.1; el SVG no lleva color propio |
| `stroke-width` | `1.5`, solo en la raíz | c.2: trazo de glifo 1,5 px. Un solo grosor: ningún elemento lo sobrescribe |
| `stroke-linecap` | `square` | §9: terminación cuadrada; igual que las ilustraciones de materia y el boceto |
| `stroke-linejoin` | `miter` | Esquinas rectas (REFERENCIAS: sin «interfaces redondeadas») |
| `stroke-miterlimit` | `2` | Los ángulos de menos de 60° (puntas del destello y de la luna) se biselan en vez de salirse de la caja; los de 90° conservan el inglete |
| `aria-hidden` | `true` | Decorativos (comun.md §2.3): el nombre accesible lo da el texto |
| Elementos | `path`, `rect`, `circle` | Sin `text`, `style`, `g`, `use`, `defs`, `transform`, gradientes, filtros ni máscaras |
| Caja de tinta | A 0,72 u o más de cada borde | Medido por render a 32 px por unidad (§6): ninguna figura se recorta |

## 2. Reglas de forma

| Regla | Detalle | Por qué |
|---|---|---|
| Retícula | Todo trazo horizontal o vertical va sobre una media unidad: `y` = n,5 en horizontales, `x` = n,5 en verticales | A 16 px y 1×: un píxel sólido y dos al 25 %. Sobre un entero serían dos al 75 % |
| Excepciones de retícula | Cruz de `agregar`, rayos cardinales de `claro` y pie de `trofeo` quedan sobre 8 | Son el eje de una figura simétrica; a 1× pasan a dos píxeles al 75 %, sin efecto a 2× o más |
| Ángulos | 90° y 45° entre trazos. Salvo: solapa de `correo` (≈ 104° entre brazos) lados del cuenco de `trofeo` (14° de la vertical) y lados del cuerpo de `eliminar` (11° de la vertical) | Dibujo técnico: proyecciones ortogonales (REFERENCIAS: CAD biomédico) |
| Círculos | Solo donde el objeto es redondo: `claro`, `oscuro`, `reloj`, `repasar`, sello de `origen-examen`, cabeza de `origen-propia`, puntos de `aleatorio` | D9: radio 0 en controles; el círculo es el motivo, no el contorno |
| Rectángulos | `rect` sin `rx` | D9 |
| Puntos | `circle` con trazo, radio 0,75 u: disco macizo de 3 u | C5: sin relleno; con r ≥ 0,75 el trazo cubre el centro |
| Aire entre trazos | 1,5 u entre bordes (3 u entre ejes); mínimo 1 u (rayos de `claro`, marcas de `repasar`) | A 16 px, menos de 1 px de aire se lee como un solo trazo |
| Extremo sobre vértice | Un trazo que termina sobre el vértice de otro se acorta 0,75 u: la terminación cuadrada llega al vértice y no sobresale | Sin «dientes» en `volver`, `siguiente`, `reintentar`, `banco-reducido`, `externo`, solapa de `correo`, paredes de `inicio`, asas de `trofeo` |
| Puntas de flecha | V abierta a 45°: brazos de 5 u en `volver` y `siguiente`; 2,5 u en `reintentar`; 3,5 u en `banco-reducido`; 4 u en `externo` | Las del boceto |
| Centro | Figuras centradas en (8, 8) con tolerancia de 0,5 u; el eje único de una figura sin marco va en 8,5 | Ver retícula |
| Giro | `chevron` queda centrado en (8, 8) en las dos direcciones: gira 90° y 270° sobre el centro sin desplazarse | Plegables de Ajustes (§9) |

## 3. Tamaños y compensación del trazo

| Uso | Lado | Escala | `strokeWidth` (u) | Trazo en pantalla | Glifos |
|---|---|---|---|---|---|
| Chico | 16 px (`paso 4`) | ×1 | 1,5 | 1,5 px | 26: los de §9 con tamaño «chico» |
| Grande | 24 px (`paso 6`) | ×1,5 | 1 | 1,5 px | 11: `volver`, `cerrar`, `siguiente`, `practicar`, `examen`, `repasar`, `estadisticas`, `agregar`, `ajustes`, `aleatorio`, `eliminar` |
| Vacío | 48 px (`paso 12`) | ×3 | 0,5 | 1,5 px | `repasar` y `estadisticas` en estado vacío (1.3) |

| Regla | Detalle |
|---|---|
| Fórmula | `strokeWidth = 24 / lado`, con `lado` en px |
| Quién la aplica | El componente `Glifo` (3.x), sobre un solo archivo por glifo. Ningún archivo trae variante grande o vacío |
| Efecto | A 24 y 48 px la figura gana aire entre trazos (las casillas de `practicar` pasan de macizas a huecas). Se diseñó con el trazo más grueso, a 16 px: lo que se lee ahí se lee en los otros dos |

## 4. Inventario

Orden de §9. «Color» es el de §9; el SVG no lo lleva.

| Id | Tam. | Figura | Color (§9) | Se distingue de |
|---|---|---|---|---|
| `glifo-volver` | grande | Flecha a la izquierda: asta de 11 u y V de 5 u a 45° | `tinta` (N5); presionado `fondo` sobre `tinta` (T7) | `siguiente`: espejo. `chevron`: sin asta |
| `glifo-chevron` | chico | Dos trazos a 90°, vértice a la derecha | `tintaSec` (N19, N20); en Ajustes `acento` (N18) | Sin asta: no es flecha |
| `glifo-cerrar` | grande | Aspa de 11 u | `tinta` (N5); notas y donación `tintaSec` (N20) | `error`: misma aspa por §9, de 9 u |
| `glifo-siguiente` | grande | Flecha a la derecha | `fondo` sobre `tinta` (T7) | `volver`: espejo |
| `glifo-acierto` | chico | Tilde: dos brazos a 45° y 90° entre sí, el largo de 7 u y el corto de 4, vértice abajo | `acierto` (N9, N10, N11) | Una sola quebrada: `error` cruza, `intermedia` es paralela |
| `glifo-error` | chico | Aspa de 9 u | `error` (N12, N13, N14) | Dos diagonales que se cruzan |
| `glifo-intermedia` | chico | Dos horizontales paralelas de 9 u, ejes a 3 u | `intermedia` (N15, N16) | `menos`: un trazo |
| `glifo-menos` | chico | Una horizontal de 10 u | `tinta` (N6); extremo `inactivo` (X5) | `intermedia`: dos trazos |
| `glifo-mas` | chico | Cruz de 10 u | Igual que `menos` | Sin marco: `agregar` lo lleva |
| `glifo-claro` | chico | Círculo de r 2,5 y ocho rayos radiales de 1,5 u | El de su opción: `tinta` (N5); seleccionada `fondo` sobre `tinta` (T7) | `repasar`: cuatro marcas y punto central |
| `glifo-oscuro` | chico | Creciente de dos arcos (r 5,5 y r 4,25) que cierran en puntas biseladas | Igual que `claro` | Sin estrellas |
| `glifo-explicacion` | chico | Bulbo de r 4,5, cuello de 3 u, cierre y trazo de base | `acento` (N18) | Sin rayos: `claro` los lleva |
| `glifo-reloj` | chico | Círculo de r 5, dos manecillas a 90° y corona en T | `tinta` (N5); con menos de 120 s `error` (N12) | La corona lo separa de `repasar` |
| `glifo-reportar` | chico | Asta y banderín rectangular de 10 × 7 u | `tinta` (N6) | — |
| `glifo-origen-examen` | chico | Hoja de 9 × 13 u con esquina doblada y sello circular | `acento` (N18), chip de marco `acento` | Contorno cerrado con sello; `generada` es maciza y `propia` es círculo sobre arco |
| `glifo-origen-generada` | chico | Destello de cuatro puntas, 13 u | `fondo` sobre `tinta` (T7), chip relleno | Silueta de estrella: ni hoja ni busto |
| `glifo-origen-propia` | chico | Cabeza (círculo de r 2,5) y hombros (arco abierto de r 5) | `tinta` (N6), chip de marco `linea` | Busto: círculo sobre arco |
| `glifo-practicar` | grande | Tres casillas de 2 u con su renglón | `tinta` (N6) | Sin marco exterior |
| `glifo-examen` | grande | Hoja con esquina doblada y dos renglones | `tinta` (N6) | `origen-examen`: sello. `revisar`: pinza |
| `glifo-repasar` | grande | Diana: anillo de r 4, punto central y cuatro marcas que cruzan el anillo | `tinta` (N6); vacío `tintaSec` (N19) | `claro`: ocho rayos y sin anillo doble |
| `glifo-estadisticas` | grande | Ejes en L y tres barras de 3,5, 6,5 y 9,5 u | Igual que `repasar` | `banco-reducido`: quebrada |
| `glifo-agregar` | grande | Cuadrado de 11 u con cruz centrada | `tinta` (N6) | `aleatorio`: puntos |
| `glifo-ajustes` | grande | Dos reglas con un cursor cuadrado de 4 u cada una | `tinta` (N6) | Sin engranaje (§9) |
| `glifo-aleatorio` | grande | Cuadrado de 13 u con cinco puntos de dado | `acento` (N18) | `agregar`: cruz |
| `glifo-revisar` | chico | Tablilla de 9 × 12 u con pinza superior y tres renglones | `acento` (N18); presionado `fondo` sobre `tinta` (T7) | La pinza la separa de `examen` |
| `glifo-reintentar` | chico | Dos flechas en L que cierran un lazo, en sentido horario | `fondo` sobre `tinta` (T7) | Dos puntas opuestas en esquinas opuestas |
| `glifo-inicio` | chico | Casa: techo a dos aguas a 45° y puerta de 3 u | `tinta` (N6) | — |
| `glifo-mensaje` | chico | Globo rectangular con cola recta abajo a la izquierda y dos renglones | `acento` (N18) | — |
| `glifo-banco-reducido` | chico | Ejes en L y quebrada descendente con punta en L | `acento` (N18) | `estadisticas`: barras |
| `glifo-trofeo` | chico | Copa: cuenco trapezoidal, dos asas rectangulares, pie y base | `acierto` (N10) | — |
| `glifo-guardar` | chico | Cuadrado con la esquina superior derecha cortada, ventana y etiqueta | El del botón: `fondo` sobre `tinta` (T7) o `tinta` sobre `superficie` (N6) | `importar`: carpeta |
| `glifo-importar` | chico | Carpeta: rectángulo con pestaña superior izquierda | Igual que `guardar` | `guardar`: cuadrado |
| `glifo-correo` | chico | Sobre de 13 × 9 u con solapa en V | `acento` (N17, N18) | — |
| `glifo-externo` | chico | Cuadrado abierto arriba a la derecha y flecha diagonal que sale | `acento` (N17, N18) | `siguiente`: flecha horizontal |
| `glifo-eliminar` | grande | Papelera: tapa de 13 u con asa de 3 u, cuerpo trapezoidal de 11 u arriba y 7 u abajo, y dos trazos interiores de 4 u | `tintaSec` (N20); presionado `fondo` sobre `tinta` (T7) | `cerrar`: sin aspa. `guardar`: sin ventana ni esquina cortada |
| `glifo-pausar` | chico | Dos verticales de 11 u, ejes a 5 u (x = 5,5 y 10,5) | El del botón K2: `tinta` (T2, N6); presionado `fondo` sobre `tinta` (T7) | `intermedia`: sus dos trazos son horizontales |
| `glifo-reanudar` | chico | Triángulo: lado vertical de 11 u en x = 5,5 y punta en (11, 8), diagonales a 45° | Igual que `pausar` | `siguiente`: flecha con asta. `chevron`: ángulo abierto |

## 5. Distinción a 16 px

| Grupo | Rasgo que los separa | Sin color |
|---|---|---|
| `acierto`, `error`, `intermedia` | Una quebrada con vértice abajo, dos diagonales que se cruzan, dos horizontales paralelas | Legibles en la fila de escala de grises de la lámina |
| `origen-examen`, `origen-generada`, `origen-propia` | Contorno cerrado con sello, estrella maciza, círculo sobre arco | Ídem; el chip suma marco `acento`, relleno `tinta` y marco `linea` (§9) |
| `examen`, `origen-examen`, `revisar` | Dos renglones, sello, pinza con tres renglones | — |
| `cerrar`, `error` | Misma figura por §9; difieren en extensión (11 u y 9 u), tamaño de uso y color | Único par idéntico por indicación de §9 |
| `cerrar`, `eliminar` | Aspa frente a papelera: tapa más ancha que el cuerpo, asa y dos trazos interiores | Ninguna aspa en `eliminar`: borrar un dato guardado y descartar una nota no se leen como la misma acción (§9) |
| `pausar`, `intermedia` | Dos verticales frente a dos horizontales | Distintos por orientación y por lugar de uso: botón del carrusel frente a banda de rendimiento |
| `reanudar`, `siguiente`, `chevron` | Triángulo cerrado frente a flecha con asta y a ángulo abierto | Silueta cerrada; acompaña siempre a la palabra «Reanudar» |

## 6. Verificación

| Chequeo | Comando o método | Resultado |
|---|---|---|
| 37 archivos | `fd -e svg . openspec/changes/rediseno-plancha/diseno/svg/glifos \| wc -l` | 37 |
| Nombres contra §9 | Ids de la tabla de §9 contra los nombres de archivo | 37 de 37 coinciden (`glifo-eliminar`, fila de 1.3, dibujado en 1.4b; `glifo-pausar` y `glifo-reanudar`, de 3.14b) |
| Prohibidos | `rg -l --pcre2 '<text\|<style\|#[0-9a-fA-F]{3,6}\|fill="(?!none)' *.svg` | Vacío |
| Estructura (C5) | `rg -il '<g[ >]\|<use\|<defs\|transform\|gradient\|filter\|mask' *.svg` | Vacío |
| `currentColor`, `viewBox`, `fill` | `rg --files-without-match` de cada atributo | Vacío en los tres; un solo `viewBox` (`0 0 16 16`) y un solo `stroke-width` (`1.5`, en la raíz) |
| Elementos | `rg -o '<(path\|rect\|circle)'` | 59 `path`, 9 `rect`, 11 `circle`; radio mínimo 0,75 |
| Caja de tinta | Render con `rsvg-convert` a 32 px por unidad y cálculo de la caja | Margen mínimo 0,72 u; ninguna figura toca el borde |
| Lámina | `glifos-prueba.html` capturado con Chrome headless a 2× | 35 glifos a 16 y 24 px, claro y oscuro, en el color de §9, con razón de contraste. La lámina no se regeneró en 3.14b: `glifo-pausar` y `glifo-reanudar` se ven en `diseno/banners/banners.html` (lámina de estados), claro y oscuro |
| Lectura a 1× | Captura de la lámina a 1×, 35 glifos a 16 px; los dos de 3.14b, en la lámina de estados del prototipo | Legibles en ambos temas |

## 7. Decisiones y desvíos

| # | Decisión | Motivo | Efecto |
|---|---|---|---|
| 1 | `viewBox 0 0 16 16` en lugar de 24 | El coordinador fija un único `viewBox`; §8 exige grilla propia para el chico y ésa es la más dura: el trazo de 1,5 px es el 9 % del lado | **Desvío de §9** («cuadrícula de 24 para el glifo grande»): el grande es la misma figura ×1,5 con trazo 1 u. Pasar a 24 es mecánico: coordenadas ×1,5 y `stroke-width` 1,5 |
| 2 | `cerrar` y `error` comparten figura | §9 pide «la aspa del boceto» en ambos | Se separan por extensión, tamaño de uso y color |
| 3 | `practicar` sin tilde en la primera casilla | El boceto la dibujaba con trazo de 1,2: c.2 exige un solo grosor | Casillas de 2 u: a 16 px casi macizas, a 24 px huecas |
| 4 | `origen-examen` lleva sello y `examen` renglones | §9 pide hoja con esquina doblada para las dos: sin esto serían la misma silueta a 16 px | Distinguibles a 16 px |
| 5 | `aleatorio` en cuadrado de 13 u | Los puntos de r 0,75 (disco de 3 u) no caben con aire en 11 u | El más grande del set junto a `claro`; solo vive en TopicSelect |
| 6 | `reloj` con corona en T | §9: «un trazo corto arriba» | Se lee cronómetro (cuenta regresiva) |
| 7 | `reportar` en `tinta` | C5 cierra la alternativa roja | Sin cambio en el SVG |
| 8 | Color por glifo: el de §9 | Fija función y token de a.1; el SVG no lleva color | Ver «Color» de §4 |
| 9 | `eliminar` con cuerpo trapezoidal a 11° de la vertical | §9 pide cuerpo trapezoidal: a 45° sería un cono y vertical, un rectángulo. Con 2 u de inclinación en 10 u los trazos interiores (de 7,5 a 11,5 en y) quedan a 1 u o más de aire de las paredes | Segunda excepción de ángulos, con `trofeo` (§2). Margen de tinta 0,75 u, medido por render |
| 10 | `pausar` y `reanudar` (3.14b, `BAN-P2` aprobada el 2026-10-11) | Controles del carrusel de avisos: el inventario de 1.4 no tenía glifo de pausa ni de reanudar | Dos verticales de 11 u (la misma extensión que `cerrar`) y un triángulo de lado vertical de 11 u con diagonales a 45°, sobre la retícula de §2. Entran en `comun.md` §9. Caja de tinta calculada: margen mínimo de 1,75 u |

## 8. Para la implementación (3.x)

| Aspecto | Contrato |
|---|---|
| Conversión | Atributos de la raíz a props de `Svg` (`viewBox`, `fill`, `stroke`, `strokeWidth`, `strokeLinecap`, `strokeLinejoin`, `strokeMiterlimit`); hijos a `Path`, `Rect` y `Circle` |
| Color | `stroke` toma el color del contenedor (`currentColor`) |
| Trazo | `strokeWidth = 24 / lado` |
| Giro | `glifo-chevron` con `rotate(90)` o `rotate(270)` sobre el centro |
| Accesibilidad | `aria-hidden` y `accessibilityElementsHidden`: el texto acompaña al glifo |
| Pendiente | Ninguno. `glifo-eliminar` se dibujó en 1.4b con las reglas de §1 a §3; el componente aplica `24 / lado` como a los demás. `glifo-pausar` y `glifo-reanudar` entran a `src/assets/glifos.js` con la tarea de `BAN-P2` |
