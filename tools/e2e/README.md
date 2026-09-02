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

Para correr solo algunas suites, se pasan textos que se buscan en su nombre:

```sh
npm run e2e -- quiz          # las tres suites que mencionan "quiz"
npm run e2e -- "en frío"
```

Variables opcionales: `CHROME_PATH` (si Chrome no está en la ruta habitual),
`E2E_PUERTO_WEB` (8099), `E2E_PUERTO_CDP` (9222).

## Qué hay adentro

| Archivo | Qué hace |
|---|---|
| `correr.js` | Punto de entrada: levanta todo, corre las suites, reporta. |
| `suites.js` | Las comprobaciones. Es lo que se toca al agregar casos. |
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
