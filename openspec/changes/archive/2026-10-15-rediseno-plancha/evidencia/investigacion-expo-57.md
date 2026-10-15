# Viabilidad de actualizar pKapp de Expo SDK 54 a SDK 57

Fecha: 2026-10-10 · Rol: Investigador · Repo: solo lectura (todo experimento corrió en copias de `git archive HEAD` fuera del repo).

Convención de marcas: **[V]** verificado (fuente primaria citada o medición propia) · **[I]** inferencia · **[H]** hueco, no verificado.

## 0. Conclusión

| Pregunta | Respuesta |
|---|---|
| ¿Se puede pasar la app web a SDK 57? | **Sí [V].** Con solo cambiar `package.json` (sin tocar código): `npm install` limpio, `expo export -p web` OK, bundle +0,24 % (raw) / +0,18 % (gzip), `npm run e2e` → «Todo OK». |
| ¿Con NativeWind 4 o 5? | **NativeWind 4.2.7** (`latest`, estable). NativeWind 5 sigue en `rc.0`, su propia guía dice «not intended for production use» [V]. |
| ¿Resuelve las 42 vulnerabilidades? | **No [V].** Con SDK 57 + NW 4 quedan 32 paquetes marcados (de 43 en una resolución limpia); con NW 5 + Tailwind 4 quedan 27. Las causas raíz restantes (`braces`, `node-forge`, `uuid`) no tienen parche publicado o las fija una dependencia del propio Expo. |
| ¿Qué rompe en pKapp? | Dos puntos concretos: `app.json` → `splash` (fuera del schema desde SDK 56) y `<StatusBar backgroundColor>` en `App.js:161` (prop eliminada en `expo-status-bar` 57). Ninguno afecta la web. |
| Momento | Después del merge del rediseño; no hay urgencia de seguridad (§4, §6). |

## 1. Tabla por SDK

Versiones tomadas de `bundledNativeModules.json` de cada release de `expo` (fuente primaria del conjunto soportado) y de los posts de cambios.

| | SDK 54 (actual) | SDK 55 | SDK 56 | SDK 57 |
|---|---|---|---|---|
| `expo` | 54.0.37 | 55.0.31 | 56.0.23 | 57.0.27 |
| react-native | 0.81.5 | 0.83.10 | 0.85.3 | 0.86.3 |
| react / react-dom | 19.1.0 | 19.2.0 | 19.2.3 | 19.2.3 |
| react-native-web | ~0.21.0 | ~0.21.0 | ~0.21.0 | ~0.21.0 |
| Arquitectura | New Arch por defecto, Legacy aún soportada | **Legacy eliminada** («SDK 54 is the final release to include Legacy Architecture support») | New Arch | New Arch |
| Node mínimo | — | ^20.19.4 / ^22.13 / ^24.3 / ^25 | ≥ 20.19.4 | ≥ 20.19.4 |
| Xcode / iOS mínimo | — | Xcode 26 · iOS 15.1 | Xcode 26.4 · **iOS 16.4** | Xcode 26.4 · iOS 16.4 |
| Motor JS nativo | Hermes | Hermes (Hermes v1 opt-in) | **Hermes v1 por defecto** | Hermes v1 |
| Metro / CLI | — | sin cambios anunciados | FS on-demand por defecto; watcher Node nativo reemplaza Watchman; `import.meta` habilitado | sin cambios anunciados |
| Reanimated / worklets | 4.1.x / 0.5.1 | 4.2.1 / 0.7.4 | 4.3.1 / 0.8.3 | 4.5.1 / 0.10.1 |
| react-native-svg | 15.12.1 | 15.15.3 | 15.15.4 | 15.15.4 |
| react-native-safe-area-context | ~5.6.0 | ~5.6.2 | ~5.7.0 | ~5.7.0 |
| react-native-screens | ~4.16.0 | ~4.23.0 | ~4.26.0 (`react-native >=0.84`) | ~4.26.0 (`react-native >=0.84`) |
| expo-font / expo-sqlite | ~14.0.12 / ~16.0.10 | ~55.0.8 / ~55.0.20 | ~56.0.7 / ~56.0.6 | ~57.0.4 / ~57.0.4 |
| expo-router | ~6.0.24 | ~55.0.18 | ~56.2.21 | ~57.0.25 |

Fuentes: `https://unpkg.com/expo@54.0.37/bundledNativeModules.json`, `…@55.0.31…`, `…@56.0.23…`, `…@57.0.27…`; `https://expo.dev/changelog/sdk-55`, `https://expo.dev/changelog/sdk-56`, `https://expo.dev/changelog/sdk-57`; `npm view react-native-screens@4.26.0 peerDependencies`.

### 1.1 Cambios que rompen, por salto

| Salto | Cambio | Fuente | ¿Afecta a pKapp? |
|---|---|---|---|
| 54→55 | RN 0.83, React 19.2; Legacy Architecture eliminada; `newArchEnabled` y `edgeToEdgeEnabled` eliminados de `app.json`; `notification` en `app.json` lanza error en prebuild; Xcode 26 | https://expo.dev/changelog/sdk-55 | No: `app.json` no usa esas claves **[V]** (leído). |
| 54→55 | RN 0.82 (incluido en el salto): New Arch only; rechazos de promesas no capturados ahora hacen `console.error`; `Appearance.setColorScheme()` ya no acepta `null` | https://reactnative.dev/blog/2025/10/08/react-native-0.82 | No: no hay `setColorScheme(null)` en el código **[V]** (rg). |
| 54→55 | RN 0.83: sin cambios de usuario que rompan | https://reactnative.dev/blog/2025/12/10/react-native-0.83 | — |
| 55→56 | RN 0.84 y 0.85: Hermes v1 por defecto; iOS sin código Legacy; Node ≥ 20.19.4; `StyleSheet.absoluteFillObject` eliminado; preset de Jest movido a `@react-native/jest-preset` | https://reactnative.dev/blog/2026/02/11/react-native-0.84 · https://reactnative.dev/blog/2026/04/07/react-native-0.85 | No: sin `absoluteFillObject` ni Jest en el repo **[V]** (rg). |
| 55→56 | `expo/fetch` pasa a ser `globalThis.fetch` (opt-out `EXPO_PUBLIC_USE_RN_FETCH=1`); `expo` ya no depende de `@expo/vector-icons`; `expo-file-system` `copy()`/`move()` asíncronos; `expo-router` ya no depende de `react-navigation` | https://expo.dev/changelog/sdk-56 | `fetch`: ver §1.2. El resto no aplica (pKapp no usa `expo-router`; usa `@react-navigation/*` directo) **[V]**. |
| 55→56 | **`splash` de primer nivel ya no está en el schema de `app.json`** | `https://exp.host/--/api/v2/project/configuration/schema/55.0.0` → `has("splash")=true`; `…/56.0.0` → `false`. `expo-doctor` en la copia SDK 57: «should NOT have additional property 'splash'» | **Sí.** Migrar a la config plugin `expo-splash-screen` (https://docs.expo.dev/versions/v57.0.0/sdk/splash-screen/). |
| 55→56 | `expo-sqlite`: iOS mínimo 16.4; blobs como `ArrayBuffer` nativos | https://unpkg.com/expo-sqlite@57.0.4/CHANGELOG.md | La app usa solo `execAsync`/`runAsync`/`getAllAsync`/`getFirstAsync` con texto **[V]** (rg en `src/db/database.native.js`). Sin blobs. |
| 56→57 | RN 0.86: «no user-facing breaking changes» | https://reactnative.dev/blog/2026/06/11/react-native-0.86 | — |
| 56→57 | `expo-status-bar`: eliminadas las props `backgroundColor`, `networkActivityIndicatorVisible`, `translucent` y sus funciones | https://unpkg.com/expo-status-bar@57.0.1/CHANGELOG.md | **Sí (nativo):** `App.js:161` pasa `backgroundColor={chrome.cabecera}`. |
| 56→57 | `expo-font`: eliminado `Server.resetServerContext()` (solo SSR web) | https://unpkg.com/expo-font@57.0.4/CHANGELOG.md | No: `src/theme/fuentes.js` usa `Font.loadAsync`; sin SSR **[V]**. |
| 56→57 | Reanimated 4.3→4.5, worklets 0.8→0.10, gesture-handler 2.31→2.32; iOS 27 con ciclo de vida por escenas (opt-in) | https://expo.dev/changelog/sdk-57 | No: el código no importa Reanimated ni gesture-handler **[V]** (rg); entran solo como dependencia de NativeWind. |

### 1.2 Hallazgos de `expo-doctor` y `expo install --check`

| Proyecto | Resultado | Fuente |
|---|---|---|
| Actual (SDK 54, lockfile del repo) | 17/18. Falla «packages match versions»: `babel-preset-expo` esperado ~54.0.10, **instalado 55.0.25**; `react-native-safe-area-context` esperado ~5.6.0, instalado 5.8.1; `react-native-screens` esperado ~4.16.0, instalado 4.26.2 | `npx expo-doctor` en copia de `HEAD` **[V]** |
| SDK 57 (package.json alineado) | `expo install --check`: «Dependencies are up to date». `expo-doctor` 20/21; única falla: `splash` | `npx expo-doctor` en copia SDK 57 **[V]** |

Deriva existente (independiente de la actualización): `package.json` declara `babel-preset-expo ^55.0.21` con `expo ~54.0.0`. Es una de las dos causas del desvío que ve `expo-doctor` hoy; conviene corregirla aunque no se actualice.

### 1.3 Exportación web (`expo export -p web`)

| Aspecto | Resultado | Evidencia |
|---|---|---|
| Comando | Funciona sin cambios en SDK 57 | Copia SDK 57 + NativeWind 4.2.7: «Web Bundled 14521ms index.js (559 modules)», «Exported: dist» **[V]** |
| Salida | Misma estructura: `dist/_expo/static/{js/web,css}`, `dist/assets/src/assets/…`, `index.html` | `inject-pwa.js` e `inject-preload.js` corrieron sin error sobre el `dist` nuevo **[V]** |
| Peso | js+css: 2 042 000 → 2 046 835 B raw (+0,24 %); 484 086 → 484 940 B gzip (+0,18 %). El CSS tiene el mismo hash | Medición propia, 8 archivos por build **[V]** |
| `index.html` | `<script src=… defer>` sin cambios de forma (no `type="module"`) | `rg` sobre ambos `index.html` **[V]** |
| e2e propio (CDP) | `npm run e2e` (incluye `pree2e`): «Todo OK» sobre SDK 57 | Corrida propia en copia **[V]** |
| `metro.config.js` | El `resolveRequest` que stubbea `expo-sqlite` en web sigue funcionando (el export y el e2e pasan) | Idem **[V]** |
| `import.meta` (SDK 56) | Habilitado automáticamente; el build no muestra cambios en el tipo de script | Idem; efecto en runtime cubierto por el e2e **[V]** |

No verificado **[H]**: pKapp en SDK 55 y 56 por separado (el spike saltó 54→57 directo; la guía oficial recomienda un SDK por vez, https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/). Para la web el salto directo funcionó.

## 2. NativeWind

### 2.1 Versiones disponibles **[V]** (`npm view nativewind dist-tags`)

| Tag | Versión | Tailwind | Observación |
|---|---|---|---|
| `latest` | 4.2.7 | 3.x (peer `>3.3.0`; la guía v5 dice «V4 remains stable and uses Tailwind CSS 3») | peer `tailwindcss >3.3.0`; depende de `react-native-css-interop 0.2.7` (peers: `react-native-reanimated >=3.6.2`, `tailwindcss ~3`) |
| `preview` / `rc` | 5.0.0-rc.0 | **4.1.x** (`tailwindcss >4.1.11`, `react-native-css 3.1.0-rc.0`) | «pre-release… not intended for production use» |

Fuentes: https://www.nativewind.dev/v5/guides/migrate-from-v4 · https://www.nativewind.dev/v5/getting-started/installation

### 2.2 Compatibilidad de NativeWind 4 con SDK 55/56/57

| SDK | RN | NativeWind 4.2.7 |
|---|---|---|
| 54 | 0.81.5 | Es lo que corre hoy en producción web. |
| 57 | 0.86.3 | **Web: verificado** (build, bundle y e2e, §1.3). **Nativo: [H]**, no se compiló un dev build. |
| 55, 56 | 0.83, 0.85 | **[H]** no probado de forma aislada. La búsqueda web no halló un reporte que cubra NativeWind 4 + SDK 55; solo un blog de terceros sin verificar sobre un crash de Metro en Windows con `react-native-css-interop` 0.1.22 (pKapp usa 0.2.7) https://www.technetexperts.com/nativewind-metro-addedfiles-crash/amp/ |

### 2.3 NativeWind 5 + Tailwind 4: qué implica para los tokens del rediseño

Spike en copia (SDK 57 + `nativewind@5.0.0-rc.0` + `react-native-css@3.1.0-rc.0` + `tailwindcss@4.1.12`, mismo código de `src/`), siguiendo la guía oficial de migración. El `tailwind.config.js` se cargó con `@config "./tailwind.config.js"` en `global.css`.

| # | Observación | Resultado **[V]** |
|---|---|---|
| 1 | `presets: [require('nativewind/preset')]` | **Falla**: `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './preset' is not defined by "exports"`. Peor: `expo export` termina «Exported: dist» con **CSS de 0 B**. Fallo silencioso. |
| 2 | Sin esa línea | Export OK; CSS 19,7 KB (vs 22,6 KB en NW 4). Los tokens planos se generan (`bg-fondo`, `bg-brand`, `max-w-columna`, `text-cuerpo`, `font-plex-sans`, `rounded-lg`). |
| 3 | Variante `dark:` con claves terminadas en mayúscula (`accentD`, `fondoD`, `brandD`…) | **No se generan.** Clases `dark:*` únicas en el CSS: **47 en NW 4 → 5 en NW 5** (solo las de escala `slate`/`white`). |
| 4 | Sonda: agregar `accentd` (minúscula) y usar `dark:bg-accentd` | **Se genera.** `dark:bg-accentD` → 0 coincidencias; `dark:bg-accentd` y `.bg-accentd` → 1. Causa más probable: Tailwind 4 no resuelve claves de tema con mayúsculas **[I]** (una sonda, un caso). |
| 5 | Selector `dark` | Salida con `:is(.dark *)`: el `darkMode: 'class'` del config se respeta en la compilación **[V]**. Cómo se activa `.dark` en runtime web con `Appearance.setColorScheme`: **[H]** (no se corrió el e2e sobre este spike). |

Implicaciones para el rediseño **[I]**, derivadas de lo medido:

| Tema | Implicación |
|---|---|
| Convención `*D` (`dark:bg-fondoD`, `brandD`, `accentD`…) | Incompatible tal cual con Tailwind 4. Hay 124 clases `dark:` únicas en `src/` + `App.js`. Habría que renombrar a minúsculas/kebab (p. ej. `fondo-d`) en `tailwind.config.js` (o `@theme`) y en todas las pantallas. |
| `tailwind.config.js` como fuente única de tokens | Sigue cargándose vía `@config`, pero la guía v5 apunta a «Tailwind 4 CSS configuration» (`@theme`/`global.css`). La página de instalación no documenta `@config` **[H]**. |
| `tools/ui/escalas.mjs` | Usa `require('tailwindcss/resolveConfig')`, API de Tailwind 3. No verificado si existe en 4 **[H]**; las compuertas `pree2e` se reescribirían. |
| `babel.config.js`, `metro.config.js`, PostCSS | Cambian: sin `nativewind/babel` ni `jsxImportSource`; `withNativewind(config)` sin `input`; `postcss.config.mjs` nuevo; `lightningcss` fijado en 1.30.1 (https://www.nativewind.dev/v5/guides/migrate-from-v4). |
| Fallo silencioso | Como se vio (#1), un error de config produce un build «verde» con CSS vacío. Exigiría una compuerta que falle si el CSS pesa < N KB. |

Recomendación: **no mezclar NativeWind 5 con esta actualización** (§5).

## 3. Compatibilidad de dependencias con SDK 57

| Paquete | Hoy (`package.json`) | SDK 57 pide | Cambios relevantes | Estado |
|---|---|---|---|---|
| expo | ~54.0.0 | ~57.0.0 (57.0.27) | ver §1.1 | OK web **[V]** |
| react / react-dom | 19.1.0 | 19.2.3 | — | OK web **[V]** |
| react-native | 0.81.5 | 0.86.3 | ver §1.1 | OK web **[V]** |
| react-native-web | ^0.21.0 | ~0.21.0 | sin cambio | OK |
| nativewind | ^4.2.6 | ^4.2.7 | patch | OK web **[V]** |
| react-native-css-interop | ^0.2.6 | 0.2.7 (lo trae nativewind) | — | OK |
| tailwindcss | ^3.4.19 | 3.4.19 | — | OK |
| react-native-svg | 15.12.1 | 15.15.4 | 15.13.0 baja el piso a RN ≥ 0.78 y renombra `OnLayoutEvent`→`SvgOnLayoutEvent`; sin cambios de API JS ni de RN-web listados | OK web **[V]**; nativo **[H]** (https://github.com/software-mansion/react-native-svg/releases) |
| expo-font | ~14.0.12 | ~57.0.4 | solo cambia SSR (`Server.*`) | OK; `loadAsync` sin cambios **[V]** |
| expo-sqlite | ~16.0.10 | ~57.0.4 | iOS ≥ 16.4; blobs `ArrayBuffer`; nuevas APIs | Nativo **[H]** (sin dev build); web stubbeado **[V]** |
| expo-constants | ~18.0.13 | ~57.0.21 | iOS ≥ 16.4 | OK |
| expo-status-bar | ~3.0.9 | ~57.0.1 | **props `backgroundColor`/`translucent` eliminadas** | Cambiar `App.js:161` |
| react-native-safe-area-context | ~5.8.0 (adelantado al SDK 54) | ~5.7.0 | peers `*` | OK web **[V]**. Nota: `5.8.x` está por encima del 5.7.0 de SDK 57; `expo install --check` pasa con ~5.7.0. |
| react-native-screens | ~4.26.2 | ~4.26.0 | 4.26.0 declara `react-native >=0.84`; 4.26.2 declara `*` | OK |
| react-native-reanimated / worklets | ~4.1.1 / 0.5.1 | 4.5.1 / 0.10.1 | solo dependencia de NativeWind | OK web **[V]** |
| @react-navigation/native, native-stack | ^6.1.0, ^6.9.0 (v6) | Expo no los exige | peers `react: *`, `react-native: *` | Web OK **[V]**; nativo **[H]**. v6 está en mantenimiento **[I]**. |
| babel-preset-expo | ^55.0.21 (deriva) | ~57.0.14 | — | Alinear |
| App `app.json` | `splash` de primer nivel | plugin `expo-splash-screen` | — | Cambiar |

## 4. Vulnerabilidades (`npm audit`)

Método: `npm audit` sobre el lockfile actual (42: 16 moderate, 26 high) y `npm install --package-lock-only` + `npm audit` en copias con tres `package.json` (resolución limpia, sin lockfile, mismos `overrides`).

| Escenario | Paquetes marcados | moderate / high | Raíces que quedan |
|---|---|---|---|
| A. SDK 54 (resolución limpia) | 43 | 16 / 27 | — (el lockfile del repo da 42) |
| B. SDK 57 + NativeWind 4.2.7 + Tailwind 3 | **32** | 11 / 21 | `braces ≤3.0.3`, `node-forge ≤1.4.0`, `postcss-selector-parser <7.1.6`, `uuid <11.1.1` |
| C. SDK 57 + NativeWind 5 rc + Tailwind 4 | **27** | 7 / 20 | `braces`, `node-forge`, `uuid` |

| Se resuelve con SDK 57 (A→B) | Paquetes |
|---|---|
| Cadena Jest de RN | `@jest/environment`, `@jest/fake-timers`, `@jest/transform`, `babel-jest`, `jest-environment-node`, `jest-haste-map`, `jest-message-util`, `@istanbuljs/load-nyc-config`, `babel-plugin-istanbul`, `js-yaml`, `argparse`, `sprintf-js` |
| Expo | `expo-asset`, `expo-constants`, `image-size`, `postcss` (hoisted) |

| NO se resuelve | Por qué | Fuente |
|---|---|---|
| `braces ≤3.0.3` (DoS, high) | Lo piden `micromatch` y `chokidar`; el aviso no lista versión parcheada | https://github.com/advisories/GHSA-vfj7-8cjw-p6xm |
| `node-forge ≤1.4.0` (high) | Lo pide `@expo/cli` / `@expo/code-signing-certificates` (`^1.3.3`); sin parche publicado | https://github.com/advisories/GHSA-86w9-cpqp-85rv |
| `uuid <11.1.1` (moderate) | Lo pide `xcode` (`^7.0.3`), dependencia de `@expo/config-plugins` | https://github.com/advisories/GHSA-w5hq-g745-h8pq |
| `postcss-selector-parser` | Cadena Tailwind 3 → `postcss-nested`; **se resuelve solo con Tailwind 4** (escenario C), junto con `tailwindcss`, `chokidar`, `fast-glob`, `postcss-nested`, `react-native-css-interop` | medición propia |

Notas:
- Los totales cuentan paquetes marcados, no avisos distintos; cinco paquetes nuevos aparecen marcados en B solo por heredar una raíz (`@expo/inline-modules`, `@expo/local-build-cache-provider`, `@react-native/metro-config`, `@react-native/virtualized-lists`, `react-native-worklets`).
- «Todas de herramientas de build» **[I]**: los paquetes marcados son tooling Node (Metro, `@expo/cli`, Jest, PostCSS, Tailwind). Una búsqueda de cadenas en el bundle minificado no halló `node-forge`, `braces`, `uuid` ni `metro`, pero un bundle minificado no conserva rutas, así que no es prueba concluyente.
- `npm audit fix` sugiere `react-native@0.87.1` y `tailwindcss@4.3.3` como remedio de la cadena Jest/Tailwind. SDK 57 trae RN 0.86.3, no 0.87 **[V]**.
- Conclusión: la actualización **no** es un remedio de seguridad suficiente por sí sola.

## 5. Riesgos

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R1 | Nativo no verificado: no se compiló dev build iOS/Android (Hermes v1 por defecto, RN 0.86, `expo-sqlite` 57, NativeWind 4 en nativo, `@react-navigation` v6 sobre RN 0.86) | media | alto si se publica nativo; nulo en la web | Dev build antes de cualquier release nativo. El proyecto no tiene `ios/` ni `android/` (CNG), lo que simplifica la regeneración **[V]**. |
| R2 | iOS mínimo 16.4 y Xcode 26.4 (SDK 56+): se abandonan dispositivos con iOS < 16.4 | cierta | medio | Decisión de producto si hay build nativo. |
| R3 | Regresiones conocidas de Expo anunciadas: memoria al importar `react-native-worklets`/`reanimated` (SDK 56) y regresión de memoria/arranque de Hermes v1 (SDK 55, «recommending SDK 57 and expo@57.0.17 or later») | media | medio (solo nativo) | Usar ≥ 57.0.17 (la 57.0.27 lo cumple). https://expo.dev/changelog/sdk-55, https://expo.dev/changelog/sdk-56 |
| R4 | NativeWind 5 en `rc`, cambia tokens `*D`, config y compuertas; fallo silencioso con CSS vacío | alta si se adopta | alto | Diferir hasta estable (§6). |
| R5 | Colisión con el rediseño en `package.json`/`package-lock.json`/`app.json`/`App.js` | media | bajo | Hacerlo después del merge. |
| R6 | Salto directo 54→57 contra la recomendación oficial (un SDK por vez) | baja en web | medio en nativo | Para nativo, avanzar por SDK en una rama; para la web ya está validado. |

## 6. Estimación y orden recomendado

Estimaciones en horas de trabajo; las marcadas «web» están respaldadas por el spike **[V]**, las demás son **[I]**.

| # | Tarea | Esfuerzo | Riesgo | Alcance |
|---|---|---|---|---|
| T0 | Corregir deriva actual: `babel-preset-expo` a ~54.0.x, `safe-area-context`/`screens` al rango de SDK 54 (opcional, independiente) | 0,5 h | bajo | web |
| T1 | `package.json` a SDK 57 (`npx expo install expo@^57 --fix`), `nativewind ^4.2.7` | 1 h | bajo | web **[V]** |
| T2 | `app.json`: `splash` → plugin `expo-splash-screen` | 0,5 h | bajo | web + nativo |
| T3 | `App.js:161`: quitar `backgroundColor` de `StatusBar` (o reemplazar el fondo de barra en Android con el mecanismo vigente de SDK 57) | 0,5–1 h | bajo | nativo |
| T4 | `npm run build:web && npm run e2e` + comparar peso contra el presupuesto del shell | 1 h | bajo | web **[V]** |
| T5 | Corregir `.github` / CI / Cloudflare Pages si fijan Node < 20.19.4 (no hay `engines` ni `NODE_VERSION` en el repo) | 0,5 h | bajo | CI **[H]** |
| T6 | Dev build iOS/Android y humo (`expo-sqlite`, SVG, fuentes, navegación v6) | 1–2 días | medio | nativo **[H]** |
| T7 | (Aparte) NativeWind 5 + Tailwind 4: renombrar `*D`, mover tokens a `@theme`, reescribir `escalas.mjs`, babel/metro/postcss, compuerta CSS-vacío | 2–4 días | alto | solo tras `5.0.0` estable |

Orden: T0 → T1 → T2 → T3 → T4 (rama aparte) → T6 (si hay nativo) · T7 desacoplado.
Total web (T1–T5): ≈ 3–4 h. Total con humo nativo: ≈ 2–3 días.

### Momento sugerido respecto del rediseño **[I]**

1. **Después del merge del rediseño a `main`.** El rediseño modifica `tailwind.config.js`, `src/**` y `package.json` (agrega `expo-font`, `react-native-svg`, `pree2e` según el `diff` entre ambas ramas); la actualización toca otros archivos, pero mezclar ambas confunde la atribución de regresiones visuales.
2. Hacerlo en una rama propia desde `main` ya consolidado y validarla con el e2e del rediseño (que corre en `main` luego del merge).
3. No hay urgencia de seguridad (§4) ni deprecación web: la web no depende del SDK nativo.
4. **No adoptar NativeWind 5 ahora.** Reabrir cuando exista `5.0.0` estable y el rediseño tenga sus tokens congelados; en ese momento conviene decidir la convención de nombres de tokens oscuros pensando ya en Tailwind 4 (sin mayúsculas).

## 7. Qué no se verificó

| Hueco | Por qué |
|---|---|
| Build y ejecución nativa (iOS/Android) en SDK 55–57 | No se compiló dev build; sin Xcode/emulador en el alcance de solo lectura |
| NativeWind 4.2.7 en nativo con RN 0.86 | Solo se probó la web |
| SDK 55 y 56 como pasos intermedios | El spike fue directo 54→57 |
| Activación de `.dark` en runtime web con NativeWind 5 | No se corrió el e2e sobre el spike v5 |
| `@config` en NativeWind 5 como camino soportado | La documentación consultada no lo menciona; solo se midió que compila |
| Política de soporte de Expo (cuánto vive SDK 54) | No hallada en las fuentes consultadas |
| Efecto de CI/Cloudflare (versión de Node) | Fuera del repo |

## 8. Método y artefactos

- Spikes en `…/scratchpad/` (copias de `git archive HEAD` de la rama `rediseno`, tomadas ≈22:45–22:50 del 2026-10-10, es decir solo lo commiteado; el árbol de trabajo recibió cambios ajenos a esta tarea durante la corrida —`src/materias/*/ilustracion.js`, `tools/ui/*`— que no entran en las copias; este informe es lo único que se escribió en el repo): `base/app` (SDK 54, `npm ci`), `spike/app` (SDK 57 + NW 4.2.7), `spike5/app` (SDK 57 + NW 5 rc + TW 4).
- Herramientas: `npm view`, `unpkg.com` (`bundledNativeModules.json`, `CHANGELOG.md`, `package.json`), `exp.host` (schema de config), `npx expo-doctor`, `npx expo install --check`, `npm audit`.
- Los posts de cambios y de React Native se consultaron vía resumen de la herramienta de lectura web; las cifras críticas (versiones, schema, changelogs de paquetes) se contrastaron con el registro npm y los archivos publicados.

## 9. Fuentes

- Expo SDK 55: https://expo.dev/changelog/sdk-55
- Expo SDK 56: https://expo.dev/changelog/sdk-56
- Expo SDK 57: https://expo.dev/changelog/sdk-57
- Guía de actualización de SDK: https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/
- Splash screen SDK 57: https://docs.expo.dev/versions/v57.0.0/sdk/splash-screen/
- Schema de `app.json` por SDK: https://exp.host/--/api/v2/project/configuration/schema/56.0.0 (y 54, 55, 57)
- `bundledNativeModules.json`: https://unpkg.com/expo@57.0.27/bundledNativeModules.json (y 54.0.37, 55.0.31, 56.0.23)
- React Native 0.82: https://reactnative.dev/blog/2025/10/08/react-native-0.82
- React Native 0.83: https://reactnative.dev/blog/2025/12/10/react-native-0.83
- React Native 0.84: https://reactnative.dev/blog/2026/02/11/react-native-0.84
- React Native 0.85: https://reactnative.dev/blog/2026/04/07/react-native-0.85
- React Native 0.86: https://reactnative.dev/blog/2026/06/11/react-native-0.86
- NativeWind v5, migración: https://www.nativewind.dev/v5/guides/migrate-from-v4
- NativeWind v5, instalación: https://www.nativewind.dev/v5/getting-started/installation
- Changelogs de paquetes: https://unpkg.com/expo-sqlite@57.0.4/CHANGELOG.md · https://unpkg.com/expo-font@57.0.4/CHANGELOG.md · https://unpkg.com/expo-status-bar@57.0.1/CHANGELOG.md · https://unpkg.com/expo-constants@57.0.21/CHANGELOG.md
- react-native-svg releases: https://github.com/software-mansion/react-native-svg/releases
- Avisos: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm · https://github.com/advisories/GHSA-86w9-cpqp-85rv · https://github.com/advisories/GHSA-w5hq-g745-h8pq
