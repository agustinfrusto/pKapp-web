# Favicon e ícono de pKapp · "pK"

Tarea 1.6 de `rediseno-plancha`. Reemplaza a la versión con "p" sola. Pedido del usuario: «el favicon debe tener pK, en vez de solo la P». Por D10 (continuidad), mismos colores y misma gramática que la versión anterior.

## La idea
Un **par tipográfico**: "p" minúscula (altura x) y "K" mayúscula (altura de versal) sobre una línea de base común, como se escribe el nombre "pKapp". Papel `#E6E9ED` sobre tinta `#0B0D10`, sin degradados ni sombras, esquinas rectas. Las letras son polígonos, rectángulos y un aro: ninguna pieza usa `<text>` ni depende de una fuente.

| Elemento | Construcción | Por qué |
|---|---|---|
| p | Fuste + aro, como en la versión anterior. Fuste a ras del borde izquierdo del aro; descendente de 3 celdas | Es la "p" que el usuario ya conoce; el aro es el corte de arteria de la ilustración de Cardiovascular y Respiratorio |
| K | Fuste + chevron: brazo y pierna salen del fuste en un mismo punto, a 5 celdas del borde superior; cortes horizontales en la línea de versal y en la de base | Misma gramática de trazo recto y fuste; sin remates que se pierdan a 16 px |
| Trazo | 2 celdas en fustes y aro; brazo y pierna de la K de 2,5 celdas medidos en horizontal (≈ 2 en perpendicular) | Un solo grosor visual en toda la marca |
| Proporción | K de 11 celdas · altura x de 8 (0,73 de la K) · descendente de 3 · K de 6 de ancho · hueco p–K de 1 | La caja del nombre: la p no alcanza la K |
| Punto teal | Centro del aro, en maestra y maskable | El único color, igual que antes |
| Par, no ligadura | Las letras no se tocan | Compartir el fuste daría un aro con fuste ascendente, que se lee como "d" |

Descartado: K de 5 celdas de ancho (los brazos se cierran sobre el fuste y la K se empasta) y aro circular de 7 celdas en la chica (el hueco queda en cruz de 3 px).

## Tres fuentes
| Versión | Archivo | Para | Contenido | Retícula |
|---|---|---|---|---|
| Maestra | `favicon.svg` | 192 px o más | pK, punto teal, cuatro marcas de esquina, cota bajo las letras | celda de 20 u; caja de 15 × 14 (300 × 280 u) centrada |
| Chica | `favicon-small.svg` | 16 a 48 px | solo p y K | celda de 32 u sobre retícula de 16; caja de 14 × 14 con 1 celda de margen |
| Maskable | `icon-maskable.svg` | `purpose: maskable` | pK y punto, sin esquinas ni cota | celda de 19 u; radio máximo 194,9 u de 204,8 (círculo del 80 %) |

La chica está dibujada sobre la retícula de 16 celdas de 32 u: a 16, 32 y 48 px cada celda mide 1, 2 y 3 px, así que todos los bordes rectos caen sobre píxel. Para entrar en 14 celdas, su aro es un óvalo de 7 × 8; en maestra y maskable el aro es el círculo de la versión con "p".

## Cómo se lee "pK" a 16 px
Mapa de `favicon-16.png` en el reporte. Resumen:

| Parte | A 16 px | Lectura |
|---|---|---|
| Fuste de la p | 2 px de ancho, filas 4 a 14 | sólido, borde en píxel |
| Hueco del aro | 3 × 4 px; 3 × 2 px de tinta plena y dos filas a medio tono | abierto: se distingue de una "o" llena |
| Descendente | 3 px bajo la línea de base | separa la p de una "o" |
| Fuste de la K | 2 px de ancho, filas 1 a 11, 3 px sobre la p | versal contra minúscula |
| Brazo y pierna | diagonales de 2 px con antialiasing: el eje con 50 a 100 % de cobertura, el borde con 10 a 40 % | muesca entre brazo y pierna abierta en las filas 6 y 7 |
| Hueco p–K | 1 px (columna 8) | las letras no se tocan |

Límites:
- Los brazos de la K son lo más débil a 16 px: la K se reconoce por el fuste y la muesca, no por diagonales nítidas. Si en una pantalla de 1× se ven blandos, la salida es engrosarlos a 3 celdas (hecho en prueba: se lee más firme a 16 px y pesa de más en la maestra).
- Sobre pestaña oscura el cuadrado de tinta casi se funde con el fondo (1,61:1 contra `#35363A`); lo que se lee son las letras, que ocupan 14 de 16 px. Sobre pestaña clara contrasta 19,45:1 (blanca) y 14,84:1 (barra). No agregué borde para no gastar el margen de 1 px.

## Qué cambió respecto de la versión con "p"
| Aspecto | Con "p" | Con "pK" |
|---|---|---|
| Marca | p sola | p minúscula + K mayúscula, hueco de 1 celda |
| Aro | círculo ⌀ 212 u, trazo 52 | maestra y maskable: círculo de 8 celdas, trazo de 2; chica: óvalo de 7 × 8 |
| Chica | p ampliada ×1,3, sin retícula | retícula de 16 celdas: bordes rectos en píxel a 16, 32 y 48 px |
| Maestra | p al 41 % del ancho | pK al 59 % del ancho (300 de 512 u) |
| Marcas de esquina | a 40 u del borde | a 56 u: a 40 u la esquina exterior queda a 4,9 u del corte de un arco de radio 22,4 % (máscara de iOS) y sin holgura para su curva real; a 56 u queda a 27,5 u |
| Cota | bajo la p (212 u) | bajo pK (300 u), a 28 u del descendente |
| Punto teal | r 14 u | r 12 u en la maestra y 11,4 u en el maskable (0,6 celdas) |
| Maskable | p ×1,08 | pK, radio máximo 194,9 u |
| Colores | tinta `#0B0D10`, papel `#E6E9ED`, gris `#98A2AE`, teal `#5CC3D6` | sin cambios |
| Piezas | 7 PNG | 8 PNG: se suma `apple-touch-icon.png` (D10) |

## Piezas (todas generadas por `generar.py`)
| Archivo | Tamaño | Fuente | Uso |
|---|---|---|---|
| `favicon-16.png`, `favicon-32.png`, `favicon.png` | 16, 32 y 48 | `favicon-small.svg` | pestaña; el de 32 es el de pantallas de alta densidad |
| `apple-touch-icon.png` | 180 | `favicon.svg` | iOS (D10); sin esquinas redondeadas, las pone iOS |
| `icon-192.png`, `icon-512.png`, `icon.png` | 192, 512 y 1024 | `favicon.svg` | manifest `any`; `icon.png` es la fuente de 1024 |
| `icon-maskable-512.png` | 512 | `icon-maskable.svg` | manifest `maskable` |
| `favicon-prueba.png` | 1340 × 680 | `prueba.html` (captura con Chrome) | lámina: 16, 32 y 48 px en pestaña clara y oscura; 192 px, iOS 180 px, maskable en círculo y en squircle |

Máscaras de la lámina: iOS con radio de 22,4 % (aproximación de la curva continua) y squircle de Android como superelipse de grado 4 (aproximación). Con ambas el contenido esencial queda dentro de la guía del 80 %.

Reproducir: `python3 -I generar.py` (necesita `rsvg-convert` y Google Chrome; con `--sin-lamina` omite Chrome). Dos corridas dan los mismos bytes. El script falla si el maskable sale del círculo del 80 % o si una fuente contiene `<text`.

## Colores propuestos para el manifest
- `themeColor`: **`#0B0D10`**
- `backgroundColor`: **`#0B0D10`**

Sin cambios respecto de la versión con "p": es la tinta del ícono y el splash de la PWA queda continuo. Los tokens `manifestTema`, `manifestFondo` e `iconoFondo` (`tokens.md`, a.1) y los pares A1 a A3 de E4 siguen vigentes (15,97, 7,51 y 9,48). Pendiente menor: la columna «Uso» de A2 dice «la "p" del ícono» y debería decir «pK».

## Para el Programador (tarea 4.1)
- `public/manifest.json` declara hoy `"purpose": "any maskable"` en los dos íconos (l. 17 y 23): `icon-192` e `icon-512` con `any`, y `icon-maskable-512.png` con `maskable`.
- `scripts/inject-pwa.js` l. 31 enlaza `apple-touch-icon` a `/icon-192.png`: pasarlo a `apple-touch-icon.png` (180 × 180).
- Favicon del `<head>`: `favicon-16.png` y `favicon-32.png` con `sizes` explícito (o `favicon-small.svg`), no el maestro: el detalle del maestro se pierde a 16 px, y las piezas chicas están alineadas a la retícula.
- `app.json` l. 27 apunta `favicon` a `./src/assets/favicon.png`: reemplazar por el `favicon.png` de 48 px de esta carpeta.
- `app.json` conserva `backgroundColor` `#1a3f6f` (l. 11 y 34), `#6366f1` (l. 22) y `themeColor` `#1a3f6f` (l. 33): decisión de integración, no los toqué.
