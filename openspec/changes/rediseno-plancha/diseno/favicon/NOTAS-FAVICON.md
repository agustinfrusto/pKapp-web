# Favicon e ícono de pKapp · "pK"

| Campo | Valor |
|---|---|
| Tareas | 1.6 (íconos de la app instalada, 2026-10-10) y 4.2 (favicon de la pestaña, 2026-10-11) de `rediseno-plancha`, rama `rediseno` |
| Vigente | **Favicon de la pestaña y de favoritos: FAV-P2** (§ «4.2»). **Íconos de la app instalada (PWA): maestra y maskable de la 1.6, sin cambios** |
| Insumos | `tokens.md` a.1 (`iconoFondo`, `tinta`, `acento`) y e (E4); `CONVENCIONES.md` C2 y C10; `src/assets/fuentes/PlexSans-SemiBold.ttf` (el wordmark «pKapp») |

## Qué hay vigente

| Pieza | Fuente | Salidas | Generador | Vigente desde |
|---|---|---|---|---|
| Favicon de pestaña y favoritos | `FAV-P2.svg` (32 px) y `FAV-P2-16.svg` (16 px) | `FAV-P2-16.png`, `FAV-P2-32.png`, `FAV-P2-48.png` | `generar-42.py` | 2026-10-11 |
| Íconos `any` y apple-touch | `favicon.svg` (maestra) | `icon-192.png`, `icon-512.png`, `icon.png`, `apple-touch-icon.png` | `generar.py` | 2026-10-10 |
| Ícono maskable | `icon-maskable.svg` | `icon-maskable-512.png` | `generar.py` | 2026-10-10 |
| Lámina de los íconos PWA | `prueba.html` | `favicon-prueba.png` (nombre histórico) | `generar.py` | 2026-10-10; sin los paneles de pestaña desde la 4.2d |
| Prueba del favicon | `prueba-42.html` | `prueba-42-claro.png`, `prueba-42-oscuro.png`; medidas en `FAV-metricas.json` | `generar-42.py` | 2026-10-11 |

Una sola fuente por pieza: el favicon de la pestaña sale únicamente de `FAV-P2*.svg`; `favicon.svg` es la maestra de los íconos PWA y ya no tiene versión «chica». Los PNG están ignorados por `.gitignore` y se regeneran; los publicados viven en `public/` y `src/assets/`.

---

## Íconos de la app instalada (tarea 1.6, sin cambios)

Reemplazan a la versión con "p" sola. Pedido del usuario: «el favicon debe tener pK, en vez de solo la P». Por D10 (continuidad), mismos colores y misma gramática que la versión anterior. El usuario confirmó el 2026-10-11 que estos íconos están bien y que «pK» se conserva como isologo.

### La idea
Un **par tipográfico**: "p" minúscula (altura x) y "K" mayúscula (altura de versal) sobre una línea de base común, como se escribe el nombre "pKapp". Papel `#E6E9ED` sobre tinta `#0B0D10`, sin degradados ni sombras, esquinas rectas. Las letras son polígonos, rectángulos y un aro: ninguna pieza usa `<text>` ni depende de una fuente.

| Elemento | Construcción | Por qué |
|---|---|---|
| p | Fuste + aro. Fuste a ras del borde izquierdo del aro; descendente de 3 celdas | Es la "p" que el usuario ya conoce; el aro es el corte de arteria de la ilustración de Cardiovascular y Respiratorio |
| K | Fuste + chevron: brazo y pierna salen del fuste en un mismo punto, a 5 celdas del borde superior; cortes horizontales en la línea de versal y en la de base | Misma gramática de trazo recto y fuste; sin remates que se pierdan a 16 px |
| Trazo | 2 celdas en fustes y aro; brazo y pierna de la K de 2,5 celdas medidos en horizontal (≈ 2 en perpendicular) | Un solo grosor visual en toda la marca |
| Proporción | K de 11 celdas · altura x de 8 (0,73 de la K) · descendente de 3 · K de 6 de ancho · hueco p–K de 1 | La caja del nombre: la p no alcanza la K |
| Aro | Círculo de 8 celdas, trazo de 2 | El mismo círculo de la versión con "p", a escala de la retícula |
| Punto teal | Centro del aro: r 12 u en la maestra y 11,4 u (0,6 celdas) en el maskable | El único color |
| Marcas de esquina | A 56 u del borde, trazo de 6 u, `#98A2AE` | A 40 u la esquina exterior queda a 4,9 u del corte de un arco de radio 22,4 % (máscara de iOS) y sin holgura para su curva real; a 56 u queda a 27,5 u |
| Cota | Bajo pK (300 u), a 28 u del descendente, `#98A2AE` | Gramática de la Plancha |
| Par, no ligadura | Las letras no se tocan | Compartir el fuste daría un aro con fuste ascendente, que se lee como "d" |

Descartado: K de 5 celdas de ancho (los brazos se cierran sobre el fuste y la K se empasta).

### Fuentes

| Versión | Archivo | Para | Contenido | Retícula |
|---|---|---|---|---|
| Maestra | `favicon.svg` | 192 px o más: `icon-192`, `icon-512`, `icon.png` (1024) y `apple-touch-icon` (180) | pK, punto teal, cuatro marcas de esquina, cota bajo las letras | celda de 20 u; caja de 15 × 14 (300 × 280 u) centrada: pK al 59 % del ancho |
| Maskable | `icon-maskable.svg` | `purpose: maskable` | pK y punto, sin esquinas ni cota | celda de 19 u; radio máximo 194,9 u de 204,8 (círculo del 80 %) |

### Piezas (todas generadas por `generar.py`)

| Archivo | Tamaño | Fuente | Uso |
|---|---|---|---|
| `apple-touch-icon.png` | 180 | `favicon.svg` | iOS (D10); sin esquinas redondeadas, las pone iOS |
| `icon-192.png`, `icon-512.png`, `icon.png` | 192, 512 y 1024 | `favicon.svg` | manifest `any`; `icon.png` es la fuente de 1024 |
| `icon-maskable-512.png` | 512 | `icon-maskable.svg` | manifest `maskable` |
| `favicon-prueba.png` | 500 × 680 | `prueba.html` (captura con Chrome) | lámina: 192 px, iOS 180 px, maskable en círculo con la guía del 80 % y en squircle |

Máscaras de la lámina: iOS con radio de 22,4 % (aproximación de la curva continua) y squircle de Android como superelipse de grado 4 (aproximación). Con ambas el contenido esencial queda dentro de la guía del 80 %.

Reproducir: `python3 -I generar.py` (necesita `rsvg-convert` y Google Chrome; con `--sin-lamina` omite Chrome). Dos corridas dan los mismos bytes. El script falla si el maskable sale del círculo del 80 % o si una fuente contiene `<text`. Desde la 4.2d no genera favicon de pestaña: sus siete piezas (dos SVG y cinco PNG) salen idénticas byte a byte a las de la 1.6.

### Colores para el manifest
- `themeColor`: **`#0B0D10`**
- `backgroundColor`: **`#0B0D10`**

Es la tinta del ícono: el splash de la PWA queda continuo. Los tokens `manifestTema`, `manifestFondo` e `iconoFondo` (`tokens.md`, a.1) y los pares A1 a A3 de E4 siguen vigentes (7,51, 15,97 y 9,48). La fila A2 de E4 ya dice «pK» (verificado el 2026-10-11).

### Cableado

| Archivo (esta carpeta) | Destino | Tarea |
|---|---|---|
| `icon-192.png`, `icon-512.png` | `public/manifest.json`, `purpose: any` | 4.1 |
| `icon-maskable-512.png` | `public/manifest.json`, `purpose: maskable` | 4.1 |
| `apple-touch-icon.png` | `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` en `scripts/inject-pwa.js` | 4.1 |
| `FAV-P2-16.png` | `public/favicon-16.png` (`<link rel="icon" sizes="16x16">`) | 4.2c |
| `FAV-P2-32.png` | `public/favicon-32.png` (`<link rel="icon" sizes="32x32">`) | 4.2c |
| `FAV-P2-48.png` | `public/favicon.png` y `src/assets/favicon.png` (`app.json`, `web.favicon`) | 4.2c |

El cableado de la 4.1 no cambia con la 4.2: solo se reemplazan tres archivos, con los mismos nombres. No usar `FAV-P2.svg` como `<link rel="icon">`: a 16 px el maestro vectorial vuelve a tener medios tonos; los PNG con `sizes` explícito son los que llevan el maestro de píxel.

---

## 4.2 · Favicon de la pestaña: FAV-P2 «Letras y punto» (vigente)

| Campo | Valor |
|---|---|
| Decisión | **FAV-P2**, el usuario, **2026-10-11**: «Vamos con su recomendación» (la del Diseñador en el reporte de la 4.2). La eligió entre FAV-P0 (sin cambio) y FAV-P1 a FAV-P4, tras verlas en pestañas y favoritos de un Chrome 155 real (4.2b). Resuelta: según `CONVENCIONES.md` C2 la ficha conserva solo la vigente |
| Pedido | Usuario, 2026-10-11: «quiero que el favicon que aparece en el navegador tenga más que ver con el encabezado donde dice pKapp»; referencia, la marca V5 «Fusiforme». Aclaración: «Los demás íconos están bien, me gusta pK como isologo pero se ve mal en el navegador» |
| Alcance | Solo el favicon de pestaña y favoritos (16, 32 y 48 px). No cambian `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` ni `icon-maskable-512.png` |
| Estado | Vigente. Integración: 4.2c (el Programador copia los tres PNG; ver «Cableado»). Cierre de la carpeta: 4.2d |
| Prueba | `prueba-42.html`; con `?tema=claro` o `?tema=oscuro` muestra un solo tema. Capturas: `prueba-42-claro.png` y `prueba-42-oscuro.png`. Chrome con los colores medidos en Chrome 155; Safari con colores aproximados: son maquetas |
| Reproducir | `python3 -I generar-42.py` (necesita `rsvg-convert` y Chrome; con `--sin-capturas` omite Chrome). Dos corridas dan los mismos bytes y un archivo solo se escribe si sus bytes cambian |

### Qué es

| Eje | Encabezado (V5 y wordmark) | FAV-P2 |
|---|---|---|
| Tipografía | «pKapp» en Plex Sans SemiBold (`marca`, `tokens.md` b.2) | «p» y «K» de Plex Sans SemiBold como contornos, ajustadas a la retícula |
| Trazo | Marco de 1 px y esquinas rectas; fibras de 0,5 a 1,6 px con unión miter y remate recto | Fustes y trazos de 2 px a 16 px (4 px a 32 px); esquinas rectas; 0 medios tonos a 16 px |
| Peso | SemiBold: fuste de 128 u sobre 698 u de versal (0,18) | El mismo 0,18: 2 px sobre 11 a 16 px, 4 px sobre 22 a 32 px; brazo y pierna de la K algo más anchos que el fuste en horizontal, como en Plex (1,15) |
| Color | Tinta y papel, y `acento` como único color | Tinta, papel y el punto teal del isologo en el aro |
| Fondo | `superficie` con marco `linea` | Cuadrado de tinta, igual que los íconos PWA |

### Construcción

| Parte | 16 px · `FAV-P2-16.svg` (píxel, 1 celda = 1 px) | 32 y 48 px · `FAV-P2.svg` (contorno, 1 celda = 1 px a 32 px) |
|---|---|---|
| Origen | Dibujo por píxel con las proporciones de Plex Sans SemiBold | «p» y «K» de `src/assets/fuentes/PlexSans-SemiBold.ttf` (IBM Plex Sans, SIL OFL 1.1) como `<path>`; ninguna pieza usa `<text>` ni depende de la fuente. Comprimidas ≈ 25 % en horizontal respecto del wordmark: el par natural mide 1,32:1 y el cuadrado, 1:1 |
| «p» | 7 × 11: altura x 8, descendente 3, fuste 2, hueco 3 × 4, esquinas derechas del aro cortadas | 14 × 22: altura x 16, descendente 6, fuste 4, hueco 6 × 8, aro de Plex |
| «K» | 6 × 11: fuste 2, brazo y pierna de 2 a 3 px | 12,4 × 22: fuste 4, brazo y pierna de ≈ 4,2 |
| Hueco p–K y margen | 1 px y 1 px | 2 px y 2 px (el doble: mismo reparto en ambos tamaños) |
| Punto teal | Rectángulo de 1 × 2 en el hueco del aro | Círculo de radio 2 en el centro del hueco |
| Colores | Cuadrado `#0B0D10` (`iconoFondo`), letras `#E6E9ED` (`tinta` oscuro), punto `#5CC3D6` (`acento` oscuro): los de los íconos PWA | Ídem |
| Medios tonos | 0 de 92 px de trazo | 127 de 410: son los de curvas y diagonales |
| Por qué dos maestros | A 16 px el contorno literal da trazos de 1,5 px y medios tonos en toda la letra | A 32 px el contorno ajustado conserva el aro y la unión de la K de Plex |

### Lectura por pestaña

Razones WCAG truncadas a 2 decimales (`tokens.md` e). Colores de la interfaz de Chrome 155 con la ventana activa, medidos en la captura real (4.2b). Safari no se midió.

| Contexto | Cuadrado de tinta contra... | Razón |
|---|---|---|
| Pestaña clara | franja `#D6E2FB` | 14,94 |
| Pestaña clara, activa | `#FFFFFF` | 19,45 |
| Pestaña oscura | franja `#1F2020` | 1,19 |
| Pestaña oscura, activa | `#3C3C3C` | 1,76 |
| Dentro del cuadrado | letras `#E6E9ED` (A2) y punto `#5CC3D6` (A3) | 15,97 y 9,48 |

Lectura: sobre pestaña clara es un bloque de tinta; sobre oscura el cuadrado casi no existe y quedan las letras y el punto, flotando.

### Compatibilidad con los íconos PWA

| Par | FAV-P2 |
|---|---|
| Fondo `#0B0D10` = `iconoFondo` y `manifestFondo` | igual |
| Letras `#E6E9ED` = `tinta` oscuro | igual |
| Punto teal en el aro | igual (maestra y maskable lo llevan) |
| Proporciones (altura x 8, versal 11, descendente 3, hueco 1 a 16 px) | igual |
| Forma de letra | Plex; los íconos PWA, geométrica: la diferencia se aprecia desde unos 96 px |
| Veredicto | No desentona |

### Verificado en Chrome real (4.2b)

| Escala | Qué pasa |
|---|---|
| 2× | Chrome pinta el PNG de 32 px a 1:1: diferencia media 0,24 de 255 con la fuente (el teal sale desplazado en la captura porque queda en el perfil de la pantalla; convertido a sRGB vuelve al original). La maqueta es fiel |
| 1× (`--force-device-scale-factor=1`) | Chrome **no usa el PNG de 16 px**: dibuja el de 32 px reducido a 16 px. El maestro de píxel no llega a esa pantalla y FAV-P2 queda con 38 de 107 px de trazo en medio tono (36 %), como el favicon anterior |

### Descartadas

Cada una, en una línea. El análisis completo está en el reporte de la 4.2 (`.orca/reports/rediseno-4.2-favicon.md`, no versionado).

| Opción | Motivo |
|---|---|
| FAV-P0 · el de la 4.1 | 49 de 110 px de trazo en medio tono a 16 px, hueco del aro de 3 × 2 px y brazos de la K fuera de píxel; letras geométricas, no las del wordmark. Lo reemplaza FAV-P2 |
| FAV-P1 · letras sin punto | Es FAV-P2 sin el punto del isologo; era la salida si el punto resultaba ruidoso a 16 px |
| FAV-P3 · K en acento | Acento en otra pieza que en el isologo de los íconos PWA |
| FAV-P4 · lámina clara | Invierte la polaridad de los íconos PWA; en oscuro es un parche blanco de 11 a 16:1 |
| Contorno literal de Plex a 16 px | Versal de 8 px y trazos de 1,5 px; medios tonos en toda la letra |
| Fibra teal de 1 px en la base | Cuesta una fila (la descendente baja a 2 px) y se lee como barra de carga |
| Calado: tinta con contorno de papel, sin cuadrado | En pestaña clara es lo más limpio; en oscura queda un parche de papel con forma de letras |
| Marco de 1 px, como la lámina | Las letras bajan a 12 × 12 px: versal de 9 y hueco de 2 px, con medios tonos en todo |
| Cuadrado teal | El teal solo rellena una banda (`acentoBanda`, DON-P5): un cuadrado entero sería lo más colorido de la app y se aleja de la tinta de los íconos PWA |
| Plex Sans Condensed SemiBold | Brazo y pierna de la K salen más finos a 32 px y suma una fuente que la app no carga |
| SVG adaptable con `prefers-color-scheme` | El esquema del sistema no es el tema de la app ni el de la pestaña (misma razón que descartó dos `theme-color`, `tokens.md` a.2) |

### Pendiente (no hecho: otra tarea)

| Tema | Detalle |
|---|---|
| Maestro de 32 px que se reduzca limpio a 16 | A 1× Chrome/macOS reduce el PNG de 32 px y no usa el de 16 (4.2b). Un maestro de 32 px diseñado para reducirse limpio a 16 sería otra tarea, sin fecha. Costo medido sobre FAV-P2: con el maestro de 16 duplicado píxel a píxel como PNG de 32, la reducción deja 14 % de medios tonos (contra 36 %), pero el favicon de 2× perdería el contorno de Plex |
| Safari, Windows y Linux | No se probaron: el pedido de la 4.2b era Chrome |
