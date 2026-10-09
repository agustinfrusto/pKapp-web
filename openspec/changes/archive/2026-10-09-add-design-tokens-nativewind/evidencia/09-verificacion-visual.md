# Verificación visual automatizada (tareas 1.2–1.4, 4.3, 6.1–6.3, 7.5)

Hecha con Playwright sobre Chromium 151, instalado fuera del repo. Los dos builds
—`HEAD` reconstruido y el migrado— se sirven en paralelo y se recorren con la misma
secuencia de navegación, para que el diff mida la migración y no ruido.

- **Viewport declarado**: 430×932, `deviceScaleFactor: 1`.
- **Estado de datos declarado**: perfil nuevo, sin progreso. Materia
  *Cardiovascular y Respiratorio*, elegida porque tiene `bancoReducido: true` y por
  lo tanto renderiza el banner migrado.
- **Recorrido**: MateriaSelect → materia → Home → Ajustes, abriendo los dos
  desplegables. Se quita el foco antes de capturar: el anillo de foco depende del
  orden del DOM y no es una diferencia de estilo.

**Limitación registrada**: `fullPage` no sirve acá. El `ScrollView` de
react-native-web mantiene el documento a altura fija y scrollea internamente, así que
la captura llega hasta el pliegue. `DonationBox` vive solo en `MateriaSelectScreen` y
queda por debajo, así que su paridad no está cubierta por estas capturas.

## Regresiones encontradas y corregidas

### El logo pasó de 300×120 a 480×320

Medido, no estimado: `getBoundingClientRect` daba 300×120 en la línea de base y
480×320 —el tamaño intrínseco del PNG— en el build migrado. El header crecía ~200 px
y empujaba toda la pantalla.

Causa: **NativeWind no aplica `width`/`height` por `className` al `Image` de
react-native-web**. Es el riesgo que el design anticipó como "componentes de terceros
que no aceptan className", y se corrige igual que los íconos, que ya lo hacían: las
dimensiones van en `style`.

Tras la corrección el diff de Home bajó de 27,03% a 4,05%.

### Tres íconos como recuadros blancos en oscuro

`agregar.png`, `ajustes.png` y `repasar.png` son **RGB sin canal alfa**: tienen fondo
blanco opaco. En claro se funden con la card blanca y nadie lo notó nunca; sobre card
oscura son recuadros. Los otros tres son RGBA pero son line art oscuro, que sobre
fondo oscuro tampoco se lee.

Solución: baldosa clara detrás de todo ícono, solo en oscuro. Resuelve la
inconsistencia y la legibilidad sin tocar los assets. **Es una decisión de diseño
original, no una traducción**: el tema oscuro no tiene versión previa con la cual
compararse.

## Paridad en tema claro (6.2)

| Pantalla | px distintos | Veredicto |
|---|---|---|
| MateriaSelect | 0 (0,00%) | Sin migrar, y no se degradó. Confirma la convivencia. |
| Home | 16.217 (4,05%) | Todo declarado |
| Ajustes | 19.837 (4,95%) | Todo declarado |

Clasificación de cada tramo con diferencia:

- **Home**: el título del aviso pasó de 15 a 14 px, lo que corre 2 px todo lo que
  está debajo —de ahí que la mejor alineación vertical dé `dy=-2`—. El resto son los
  textos secundarios más oscuros por la corrección de contraste.
- **Ajustes**: los dos bloques grandes (y 543-584 y y 593-635) son los botones de
  descargar e importar respaldo, que pasaron de la familia azul al navy. Los tramos
  chicos son textos: "Acerca de", el total del banco (indigo→navy), y los atenuados
  que se oscurecieron.

**Ninguna diferencia sin declarar.**

## Diferencias declaradas que sí se notan (6.3)

Una sola merece tu criterio: el corrimiento de 2 px en Home, causado por la
reasignación de 15→14 px del título del aviso. No lo revertí porque 2 px en una
pantalla sin nada al lado con qué comparar no se percibe, y revertirlo obliga a
mantener el 15 como token propio. Si preferís lo contrario, es un valor en
`tailwind.config.js`.

Los otros dos cambios visibles son deliberados y a favor: el indigo fuera de paleta
unificado al navy, y el texto secundario legible.

## Tema oscuro (7.5)

**Estos resultados corresponden a la versión de tres estados, superada.** Se conservan
porque documentan la corrección de NativeWind descrita abajo, que sigue vigente. La
verificación del comportamiento binario actual está en `11-switch-binario.md`.

| # | Escenario | Resultado |
|---|---|---|
| 1 | Arranca con el sistema en claro | sin clase `dark` |
| 2 | El sistema pasa a oscuro **con la app abierta** | `dark` |
| 3 | El sistema vuelve a claro | sin clase |
| 4 | El usuario eligió oscuro, recarga | `dark` |
| 5 | El sistema insiste en claro | sigue `dark` |
| 6 | Persistencia | `{"tema":"oscuro"}` en `pkapp_settings` |

### Corrección necesaria

La primera versión no funcionaba: las 26 reglas `dark:` estaban en el CSS y
`prefers-color-scheme` daba `true`, pero **nadie ponía la clase `dark` en el árbol**.
Con `darkMode: 'class'` NativeWind espera control explícito y no toca la raíz del
documento en web. El proveedor aplica la clase al elemento raíz, que es donde el
selector `:is(.dark *)` la necesita. Esa corrección sigue vigente en la versión
binaria; lo que se eliminó después fue la suscripción a `Appearance`.

## Lo que sigue sin cubrir

- El comportamiento nativo de `userInterfaceStyle: automatic` en iOS/Android: no hay
  simulador y este repo es la versión web.
- La paridad de `DonationBox`, por la limitación de `fullPage` descrita arriba.
