## Context

Ver `proposal.md` — Why para la motivación. Lo que condiciona el enfoque:

- **Stack**: Expo SDK 54 / RN 0.81.5 / react-native-web 0.21, React 19.1. Sin TypeScript, sin tests, sin linter. Lo que no se verifica a mano no se verifica.
- **Metro ya tiene un `resolveRequest` propio** (`metro.config.js`) que redirige `expo-sqlite` y `wa-sqlite` a un stub vacío en web. Es lo único que mantiene el build web en pie: si se pisa, el build rompe.
- **El inventario real es peor que la intuición**: 60 colores literales distintos, 16 tamaños de fuente y 9 radios de borde en 9 archivos. Hay huérfanos (`#6366f1`, `#ff6b6b`, `#c2974a`) y colores usados una sola vez que no responden a ningún rol.
- **Hallazgo que abarata todo**: nueve de los neutros en uso —`#f8fafc`, `#f1f5f9`, `#e2e8f0`, `#cbd5e1`, `#94a3b8`, `#64748b`, `#475569`, `#334155`, `#1e293b`— son exactamente la escala `slate` por defecto de Tailwind. El proyecto ya venía usando esa paleta sin declararla. Los neutros no hay que inventarlos, hay que dejar de copiarlos.
- **Ya existe una API de settings utilizable**: `getSetting(key, default)` / `saveSetting(key, value)`, con la misma firma en `database.web.js` y `database.native.js`, global entre materias. El tema entra ahí como una clave nueva y aditiva: sin migración, porque una clave ausente cae en su default.
- **`app.json` fuerza `"userInterfaceStyle": "light"`**, lo que anula el modo oscuro en nativo por debajo de cualquier token.
- **PWA**: `dist/` pesa 1,9 MB. El peso es criterio de aceptación, no una nota al pie.
- **App en producción sin tests**: la única red de seguridad es que el diff sea chico y revisable.

## Goals / Non-Goals

**Goals:**

- Dejar la paleta, la escala tipográfica y los radios declarados en un único lugar, con nombres que digan el rol y no el valor.
- Validar en el navegador —no en el papel— que NativeWind convive con este Metro, este Babel y este react-native-web antes de comprometer las 9 pantallas.
- Medir el costo real en peso del bundle con datos, no con estimaciones.
- Dejar el modo oscuro implementado y verificable de punta a punta, sin exponerlo hasta que toda la app responda al tema.
- Dejar el camino abierto para migrar el resto pantalla por pantalla, sin big bang.

**Non-Goals:**

- No se rediseña nada. Este change traduce la estética existente a tokens; no la mejora, no la moderniza, no la opina.
- No se construye una librería de componentes. Extraer `Card`, `Chip` o `Button` compartidos es trabajo posterior, informado por lo que muestre el piloto.
- No se toca `src/db/`, ni el formato de `localStorage`, ni la lógica de materias. La preferencia de tema usa la API de settings existente sin modificarla.
- No se expone el control de tema al usuario en este change. Se construye, se verifica y se deja tras un flag.

## Decisions

### D1 — NativeWind v4.2.6 con Tailwind v3.4, ambos pinneados

Se fija `nativewind@^4.2.6` y `tailwindcss@^3.4.19`.

El pin de Tailwind es lo importante: `npm install tailwindcss` hoy trae la v4, y NativeWind v4 solo soporta Tailwind v3 (`peerDependencies: tailwindcss >3.3.0`, satisfecho también por la v4, así que npm **no** va a avisar del error). El soporte de Tailwind v4 está en la preview de NativeWind v5, que no se adopta: es preview y esta es una app en producción.

*Alternativas consideradas.* **React Native Paper**: trae componentes accesibles y Snackbar/Dialog gratis, pero impone Material Design y arrastra fuentes de íconos; la estética de pKapp no es Material y adoptarla sería el rediseño que este change explícitamente no quiere. **Tamagui**: mejor rendimiento web y themes potentes, pero exige compilador y configuración pesada, y es el que más chance tiene de romper en Expo 54 sin TypeScript. **gluestack-ui v2**: razonable, pero arrastra igual el setup de NativeWind y suma una capa de componentes que este change no necesita todavía. **Tema propio sin librería**: resolvía los tokens con cero dependencias, pero deja a mano el trabajo de escala, variantes responsive y estados, que es justamente lo que se está comprando.

### D2 — Envolver Metro con `withNativeWind` primero y encadenar el `resolveRequest` propio después

El orden importa. `withNativeWind` devuelve una config con su propio resolver, y el `resolveRequest` actual está instalado sobre la config cruda. Si se envuelve al final, NativeWind lo pisa y el stub de `expo-sqlite` deja de aplicarse en web: el build rompe de una forma que solo se ve al exportar, no en `expo start`.

Por eso: `getDefaultConfig` → `withNativeWind` → recién ahí instalar el `resolveRequest` propio, encadenando al que NativeWind haya dejado mediante el patrón `originalResolveRequest` que el archivo ya usa. La verificación es concreta: `npm run build:web` completa y `dist/` no contiene `wa-sqlite`.

### D3 — Los neutros salen de la escala `slate` de Tailwind; solo se declaran los tokens propios

Como los nueve neutros en uso ya son `slate`, no se redeclaran: se consumen de la paleta por defecto. Se declara en `tailwind.config.js` únicamente lo que es de pKapp, agrupado por rol:

- **`brand`** (navy): `#0f1f33`, `#1a3f6f`, `#354d66`, `#607d99`, `#a8c8e0`, `#ccd9e6`.
- **`accent`** (teal): `#095c6b`, `#0d7a8a`, `#ddf2f5`.
- **`success`**: `#1a5216`, `#276221`, `#e8f5e7`.
- **`danger`**: `#8b1c1c`, `#b52828`, `#fceaea`.
- **`warning`**: `#78350f`, `#c67c00`, `#fef3c7`.

Los tokens se nombran por rol (`brand.strong`, `danger.surface`), no por valor. Un token llamado `navy700` obliga a renombrarlo el día que el navy cambie —y con dos temas, un nombre atado al valor directamente miente en uno de los dos.

Cada rol lleva su contraparte oscura. En oscuro el navy deja de ser el fondo y pasa a ser acento: las superficies salen de los `slate` altos (`800`, `900`) y el texto de los bajos, invirtiendo la relación sin inventar una paleta nueva. Los semánticos (`success`, `danger`, `warning`) necesitan variantes propias, porque los tonos oscuros pensados para texto sobre fondo claro no sobreviven al fondo oscuro.

Los ~20 colores de un solo uso se resuelven caso por caso durante el inventario: o se colapsan al token vecino de su rol, o se descartan. Cada colapso y cada descarte queda registrado con el valor que reemplaza, como exige el spec.

*Corregido durante la implementación*: este párrafo decía antes que `#6366f1` sobrevivía solo en el `adaptiveIcon` de `app.json`. Es falso —tiene 5 usos vivos como color de acción en `AddQuestionScreen` y `SettingsScreen`—, igual que la familia azul de importar/exportar de Ajustes. No se eliminan por huérfanos: se unifican al navy por estar fuera de la paleta, y esa unificación es un cambio visible que se declara. En sentido inverso, `#e0f2fe` y `#ede9fe` se conservan pese a ser de un solo uso: son las insignias de primer y segundo parcial, codifican información y unificarlas borraría la distinción que existen para comunicar. El mapa completo está en `evidencia/05-tokens.md`.

### D4 — Colapsar 16 tamaños de fuente a 7 y 9 radios a 5

Tipografía: `11, 12, 13, 14, 16, 20, 24` cubren el 95% de los usos. Los tamaños grandes de `ResultsScreen` y `StatsScreen` (`36, 56, 64`) se declaran aparte como escala *display*, porque son cifras de resultado y no texto. Los sueltos (`10, 15, 17, 18, 22, 28`) se reasignan al vecino más cercano; cada reasignación es un cambio visual de 1 o 2 px y por lo tanto **debe declararse** como diferencia intencional, o revertirse si se nota.

Radios: `8, 10, 12, 16, 999`. Los sueltos (`3, 4, 14, 18`) se reasignan bajo la misma regla.

### D5 — Las sombras siguen en `style`, no en clases

Es el punto más frágil de la traducción: RN expresa la elevación con `shadowColor/shadowOffset/shadowOpacity/shadowRadius` más `elevation`, y no hay una correspondencia limpia con las utilidades `shadow-*` de Tailwind entre web y nativo. Forzarla es la vía más rápida a que las cards se vean distinto en web.

Decisión: en el piloto las sombras se mantienen como objeto de estilo, exportado desde un módulo de tokens compartido y aplicado por `style={}`. Se traducen a clases solo si el piloto demuestra que el render es idéntico. Un token puede vivir fuera de Tailwind y seguir siendo un token.

### D6 — El piloto es `HomeScreen`, `SettingsScreen` y `DonationBox`

`HomeScreen` es la primera pantalla real que ve el usuario y concentra la variedad estructural del sistema: superficie, card con sombra, banner de aviso, chips y tres niveles de jerarquía tipográfica. Si los tokens le alcanzan, le alcanzan a casi todo. `DonationBox` suma el otro caso que importa: un componente compartido, chico, que valida que las clases funcionen fuera de una pantalla. `SettingsScreen` entra porque es la más densa en estilos después de las del quiz.

*Revisado durante la implementación*: el piloto de tres superficies cumplió su función —descubrir barato si NativeWind funciona en este stack— y después se migraron las 6 restantes, porque exponer el switch de tema lo exigía. Ver D13.

Deliberadamente **no** entran `QuizScreen` ni `ResultsScreen`, que son las más grandes y las que más duele romper. Entran en la segunda tanda, con los tokens ya probados.

Contrapartida asumida: el piloto no ejercita los tokens semánticos de acierto y error, que viven sobre todo en el quiz. Por eso D3 los deriva del inventario completo y no de lo que el piloto necesite — el spec ya lo exige, y esta es la razón concreta por la que lo exige.

### D7 — La paridad visual se verifica por captura, no a ojo

Antes de tocar cada archivo del piloto se toma una captura de la pantalla en el navegador a un viewport fijo, con el mismo estado de datos. Después de migrar se repite y se comparan las dos. "Se ve igual" mirando de reojo no es evidencia, sobre todo con diferencias de 1 px de padding o medio tono de gris, que son exactamente las que introduce una traducción de este tipo.

### D8 — Presupuesto de peso: 30 KB comprimidos, medido sobre lo que viaja por la red

*Revisado durante la implementación.* El presupuesto original era +3% sobre el crudo de
`dist/`. La medición lo dejó sin sentido por dos razones.

La primera: el costo de NativeWind es **fijo y de runtime**. Con cero pantallas migradas
el build ya estaba en +3,90% (+79 KB); migrar las tres superficies del piloto sumó apenas
3.242 bytes más, porque el CSS emitido creció casi lo mismo que encogió el JS al borrar
los `StyleSheet`. Un presupuesto que se agota antes de migrar la primera pantalla no mide
la migración: mide la decisión de adoptar la librería, que ya está tomada.

La segunda: el crudo de `dist/` es la métrica equivocada. Incluye ~600 KB de PNG que no
comprimen y que diluyen cualquier porcentaje. Lo que le cuesta al usuario es lo que viaja
por la red, y ahí el piloto cuesta **+19,7 KB gzip** sobre una línea de base de 369 KB.

Presupuesto nuevo: **+30 KB gzip** sobre la línea de base de 368.956 bytes. Deja unos
10 KB de margen para el CSS de las 6 pantallas restantes, que es la extrapolación de lo
que costaron las tres del piloto. Como control secundario, el crudo no debe superar
**+5%** (2.128.064 bytes).

Si el total gzip supera los 30 KB, el spec sigue bloqueando la migración del resto: el
presupuesto cambió de número, no de función.

### D9 — La purga se configura contra rutas explícitas y se verifica en el build, no en dev

El modo de fallo clásico de Tailwind es que el `content` de la config no cubra algún archivo: en desarrollo todo se ve bien y en producción faltan estilos. El `content` apunta explícitamente a `./App.js` y `./src/**/*.{js,jsx}`, y la verificación se hace sobre el build de producción, no sobre `expo start`.

### D10 — La convivencia sale gratis y se aprovecha

`className` y `style` coexisten en el mismo árbol sin conflicto, así que las 6 pantallas restantes no requieren ninguna acción: siguen con sus `StyleSheet.create` intactos hasta que les toque. Es lo que permite migrar de a una y lo que hace barato el rollback.

### D11 — El tema se resuelve con la variante `dark:` de Tailwind y una preferencia binaria

*Revisado durante la implementación.* La versión original tenía tres estados
(`claro`, `oscuro`, `sistema`) con `sistema` por defecto, para poder distinguir "el
usuario quiere claro" de "el usuario no eligió". Al verlo funcionando el usuario pidió
lo contrario: **dos estados y nada de seguir al sistema**, activable con un switch.

El argumento que lo decide es que la app se ponía oscura sola. Seguir al sistema es
razonable en una app que se usa todo el día; en una de estudio que se abre a ratos, que
cambie de aspecto sin que nadie lo haya pedido se lee como un error. El default es
`claro` y solo el usuario lo mueve.

Eso simplifica el proveedor: ya no hace falta suscribirse a `Appearance` ni distinguir
preferencia de esquema efectivo.

NativeWind implementa la variante `dark:` sobre `darkMode: 'class'`, así el modo oscuro
queda expresado en el mismo lugar que el resto de los estilos —`bg-white dark:bg-slate-800`—
en vez de en un `if` disperso por los componentes. Con `darkMode` en modo clase
NativeWind **no toca la raíz del documento en web**: las utilidades se emiten como
`.dark\:x:is(.dark *)` y sin ese ancestro no aplican, así que el proveedor pone la clase
a mano.

*Alternativa considerada*: un contexto de React propio que devuelva objetos de estilo
según el tema. Funciona, pero obliga a que cada componente consulte el contexto y arme
sus estilos a mano, que es el trabajo manual que este change vino a eliminar.

### D12 — La preferencia se guarda con la API de settings existente, sin tocar el esquema de datos

`getSetting('tema', 'claro')` y `saveSetting('tema', valor)` ya existen con firma
idéntica en web y nativo. Una clave nueva y aditiva sobre un valor por defecto no rompe
nada guardado: los usuarios que actualicen no tienen la clave y caen en `claro`. Un
valor guardado que ya no es válido —`sistema`, de una versión intermedia de este
change— cae en el mismo default en vez de romper.

Esto es deliberado y no incidental. La invariante del proyecto es que romper el formato
de `localStorage` le borra el progreso a usuarios que no tienen cuenta ni respaldo
automático. Un tema visual no justifica ni el riesgo ni una migración.

### D13 — El control vive en las cabeceras de entrada, no en Ajustes

*Revisado durante la implementación.* El plan original lo ponía en Ajustes detrás de un
flag, porque con pantallas sin migrar el control dejaba la app a medio oscurecer. El
usuario pidió que estuviera "arriba a la derecha" y a un gesto de distancia, así que se
migraron las 9 pantallas en este mismo change y el flag dejó de tener función.

Queda en la cabecera de `HomeScreen` y en la de `MateriaSelectScreen`, que son las dos
pantallas de entrada. En Home comparte fila con el botón de cambiar materia; en
selección de materias va en posición absoluta, porque esa pantalla no tiene fila
superior y en flujo normal empujaría el logo.

Lleva un ícono al lado que cambia con el estado —🌙 o ☀️— porque un switch suelto en una
cabecera no dice qué hace.

*Alternativa considerada*: dejarlo solo en Ajustes. Se descartó porque es el ajuste que
más se alterna, y enterrarlo a dos toques contradice el pedido de que se active rápido.

### D14 — Los bordes de la app se tratan como parte del tema, no como detalles

Hay tres cosas que viven fuera del árbol de componentes y que delatan el tema si se olvidan:

- **`app.json`**: `"userInterfaceStyle": "light"` fuerza el esquema claro en nativo y deja el control sin efecto. Pasa a `"automatic"`. El `themeColor` de la PWA, hoy navy fijo, define el color del chrome del navegador en la app instalada.
- **`App.js`**: la `StatusBar` de expo y el fondo del splash están fijos en navy.
- **`src/utils/webStyles.js`**: el hover inyectado usa `rgba(26,63,111,0.55)`, un navy que sobre fondo oscuro deja de leerse. Necesita su variante.

Se listan acá porque son el residuo típico de una migración de tema: todo lo que se ve dentro de la app queda bien y algo en el marco sigue claro.

## Risks / Trade-offs

- **El plugin de Babel/Metro de NativeWind no funciona en Expo SDK 54 / RN 0.81** → Es el riesgo principal y la razón de ser del piloto: se descubre con dos archivos migrados y cuatro de configuración, no con nueve pantallas reescritas. Si aparece, el rollback es revertir esos seis archivos.
- **`withNativeWind` pisa el `resolveRequest` que redirige `expo-sqlite`** → D2 fija el orden de composición, y la verificación es un `npm run build:web` que complete con `dist/` sin rastros de `wa-sqlite`. Es un fallo silencioso en dev, así que verificarlo en el build es obligatorio y no opcional.
- **`className` no funciona en componentes de terceros** (headers de React Navigation, `Image`, `Animated`) → Esos siguen con `style`, consumiendo los mismos tokens desde el módulo compartido. El sistema tiene que servir a los dos mundos desde el principio.
- **La purga borra clases que sí se usan** → D9 lo ataca con `content` explícito y verificación sobre el build de producción. Riesgo residual: clases armadas por concatenación de strings, que Tailwind no puede ver. Regla derivada: en el código migrado no se construyen nombres de clase dinámicamente.
- **Las reasignaciones de tipografía y radio de D4 cambian el aspecto 1-2 px** → Chocan de frente con la paridad visual que exige el spec. Se resuelve declarándolas explícitamente como diferencias intencionales; las que se noten en la comparación de capturas se revierten a su valor original, que entra como token propio.
- **Se instala Tailwind v4 sin querer** → npm no lo va a impedir, porque el rango de peer dependency de NativeWind lo admite. El pin en `package.json` es la única defensa, y conviene verificar la versión efectiva después de instalar.
- **Migrar tres pantallas y abandonar** → Habría sido el peor resultado: tres sistemas de estilo conviviendo en vez de dos, y un modo oscuro construido que nadie puede usar. Dejó de aplicar: las 9 están migradas y no queda ningún `StyleSheet.create` en pantallas ni componentes.
- **El modo oscuro duplica la superficie de verificación de contraste y de paridad** → Cada token de color pasa a tener dos valores que medir y cada pantalla migrada, dos aspectos que comparar. Es costo asumido, no evitable: es lo que cuesta el modo oscuro. La mitigación es que el piloto son tres superficies y no nueve.
- **El control queda tras el flag y se olvida ahí** → Un modo oscuro terminado que nunca se enciende es trabajo tirado. Por eso destaparlo es una tarea explícita del change siguiente y no una nota al margen de este.
- **La paridad visual y el modo oscuro tiran para lados opuestos** → El spec exige que la migración no cambie el aspecto, pero el tema oscuro es por definición un aspecto nuevo. Se resuelve verificando la paridad **solo contra el tema claro**, que es el que existe hoy; el oscuro no tiene contra qué compararse y se verifica por contraste y por revisión, no por paridad.

## Migration Plan

1. Medir y registrar la línea de base de peso de `dist/` antes de tocar nada.
2. Instalar las dependencias pinneadas y verificar la versión efectiva de Tailwind.
3. Configurar Babel, Metro (en el orden de D2), `tailwind.config.js` y `global.css`.
4. Verificar el build web **antes** de migrar ninguna pantalla: si rompe acá, rompió la integración y no la migración. Aislar el fallo es más barato que desenredarlo después.
5. Capturar el estado visual previo de `HomeScreen`, `SettingsScreen` y `DonationBox`.
6. Migrar las tres superficies en tema claro, comparar capturas contra el previo, medir el peso.
7. Recién con la paridad en claro verificada, agregar las variantes oscuras, el proveedor de tema, la persistencia y el control tras su flag.
8. Decidir con datos: si la paridad y el presupuesto se cumplen, se planifica el change de las 6 pantallas restantes, que termina destapando el control; si no, se revierte.

**Rollback**: revertir los archivos del change y desinstalar dos dependencias. No hay migración de datos ni cambio de formato. La clave `tema` puede quedar guardada en el dispositivo sin consecuencia: nada la lee después del revert y no colisiona con ninguna otra. Es la propiedad que hace que este change se pueda intentar sin red.

## Open Questions

- **Extracción de componentes compartidos** (`Card`, `Chip`, `Button`): el piloto va a mostrar qué patrones se repiten de verdad. Decidirlo ahora sería adivinar; se resuelve con la evidencia de las siguientes migraciones.
