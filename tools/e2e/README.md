# Arnés end-to-end para la web

Maneja la app buildeada en un Chrome headless y verifica la navegación web:
que el botón atrás del navegador no saque al usuario de pKapp, que las URLs
profundas recargadas en frío no dejen la pantalla en blanco, y que nadie pierda
el progreso de un quiz sin confirmarlo.

Son las tres cosas que se rompen sin hacer ruido: la app sigue compilando, los
componentes siguen renderizando, y el problema solo aparece navegando de verdad.

## Uso

```sh
npm run build:web     # el arnés corre contra dist/, no contra el dev server
npm run e2e
```

Sale con código 1 si alguna comprobación falla, así que sirve en CI.

Para correr una sola superficie, `--suite <nombre>` (repetible):

```sh
npm run e2e -- --suite quiz
npm run e2e -- --suite home --suite temas
```

Superficies: `materias`, `home`, `temas`, `quiz`, `resultados`, `estadisticas`,
`ajustes`, `agregar`. Sin `--suite` corre todas.

Para correr solo algunas suites, se pasan textos que se buscan en su nombre:

```sh
npm run e2e -- quiz          # las tres suites que mencionan "quiz"
npm run e2e -- "en frío"
```

Variables opcionales:

| Variable | Por defecto | Qué fija |
|---|---|---|
| `CHROME_PATH` | ruta habitual | Binario de Chrome. |
| `PKAPP_DIST` | `dist` | Carpeta de salida de `build:web` y la que sirve el arnés. |
| `PKAPP_PUERTO` | `8099` (capturador: `8199`) | Puerto del servidor estático. |
| `PKAPP_PUERTO_CDP` | `9222` (capturador: `9322`) | Puerto de depuración de Chrome. |

`E2E_PUERTO_WEB` y `E2E_PUERTO_CDP` siguen valiendo si `PKAPP_*` no está.
Con un puerto ocupado el arnés corta con un mensaje claro; no se cuelga.

## Compuerta en paralelo

Dos o tres Programadores en el mismo worktree no pueden compartir `dist/` ni los
puertos. Cada uno corre la compuerta con su propio juego de variables:

```sh
# Programador A
PKAPP_DIST=dist-a PKAPP_PUERTO=8301 PKAPP_PUERTO_CDP=9401 \
  npm run build:web && PKAPP_DIST=dist-a PKAPP_PUERTO=8301 PKAPP_PUERTO_CDP=9401 npm run e2e

# Programador B, a la vez
export PKAPP_DIST=dist-b PKAPP_PUERTO=8302 PKAPP_PUERTO_CDP=9402
npm run build:web && npm run e2e
```

(`export` evita repetir las variables en cada comando.) Las carpetas `dist-*/`
están en `.gitignore`. `npm run e2e:paralelo` verifica el mecanismo: corre dos
compuertas a la vez con juegos distintos y exige que ambas terminen en verde.

Quedan compartidos y no se pisan en la práctica: `src/materias/conteos.js` que
regenera `scripts/gen-conteos.mjs` (mismo contenido en ambas) y la caché de Metro.

## Qué hay adentro

| Archivo | Qué hace |
|---|---|
| `correr.js` | Punto de entrada: levanta todo, corre las suites, reporta. |
| `suites/` | Las comprobaciones, un archivo por superficie, más `comunes.js` (ayudantes) e `index.js`. Es lo que se toca al agregar casos. |
| `pruebas/paralelo.js` | Prueba de la compuerta en paralelo (`npm run e2e:paralelo`). |
| `cdp.js` | Cliente del DevTools Protocol y ayudantes para react-native-web. |
| `entorno.js` | Servidor estático con fallback SPA y Chrome headless. |

## Dos cosas que no son obvias

**Los clicks van por coordenadas, no por `el.click()`.** react-native-web no
escucha el evento `click` de los Touchable: usa su sistema de responders sobre
eventos de puntero. Un `.click()` sintético no dispara nada. Por eso `cdp.js`
pide un click real al navegador con `Input.dispatchMouseEvent`.

**Se descartan los elementos de tamaño cero.** Las pantallas anteriores del
stack siguen montadas en el DOM con rect 0x0, y su texto matchea igual. Sin ese
filtro se termina clickeando un botón de una pantalla que ya no se ve.

Relacionado: buscar un texto que en el DOM tiene un salto de línea en el medio
(por ejemplo `"Tejido óseo\n11 preguntas"`) no matchea si se lo busca
normalizado con espacio. Conviene buscar por la parte estable del texto.

## Al agregar comprobaciones

Esperá por condición, no por tiempo. `pagina.esperarUrl(...)`,
`pagina.esperarTexto(...)` y `pagina.esperarA(fn)` reintentan hasta cumplirse o
agotar el límite. La carga de materias baja un chunk aparte y los tiempos varían
entre máquinas: un `sleep` fijo que anda hoy falla en otra máquina o en CI.
