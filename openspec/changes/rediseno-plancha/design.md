## Context

- Base: rama `rediseno` en `c1a9545` (igual a `main`, 1.6.0).
- Sistema visual vigente: NativeWind 4 + Tailwind 3. Colores en `src/theme/colores.js`
  (claro y oscuro), escalas de fuente y radios en `tailwind.config.js`, sombras en
  `src/theme/sombras.js`, tema en `src/theme/TemaContext.js` y header compartido en
  `src/components/HeaderMarca.js`.
- Superficies: 8 pantallas (`src/screens/*.js`) y 2 componentes (`DonationBox`,
  `HeaderMarca`).
- Insumos del Diseñador: `referencias-diseno/propuestas/hibrido/` (boceto de 6 pantallas,
  `NOTAS.md` y `svg/<id>.svg`) y `referencias-diseno/propuestas/favicon/`.

## Goals / Non-Goals

**Goals**: llevar el híbrido aprobado a las 10 superficies, en ambos temas, sin tocar datos
ni comportamiento.

**Non-Goals**: cambiar copy (salvo el que reemplaza emojis), umbrales, navegación, lógica
del quiz o bancos; agregar pantallas; animaciones.

## Decisions

### D1. Reparto de propiedad

| Pieza | Decide | Escribe |
|---|---|---|
| Valores de tokens (color, tipografía, espaciado, bordes) | Diseñador | Diseñador, en `src/theme/colores.js` y en la tabla de tokens |
| Escalas de `tailwind.config.js` (fuentes, radios, familias) | Diseñador (valores) | Programador |
| Layout y matriz de estados por pantalla | Diseñador | Diseñador, en `referencias-diseno/propuestas/hibrido/pantallas/<pantalla>.md` |
| Código de pantallas y componentes | — | Programador, contra la ficha de su pantalla |
| Dependencias, módulos por plataforma, `App.js`, `app.json`, `scripts/**` | Ingeniero (contrato) | Programador |
| Ilustraciones SVG | Diseñador (dibujo) | Programador (conversión a componente) |

El Diseñador no escribe código de pantallas aunque `src/screens/**` esté en su lista
editable. Una ficha por pantalla es lo que permite partir el trabajo en specs de una tarea
y que el Analista lea un diff contra algo verificable.

### D2. SVG con `react-native-svg`, detrás de una compuerta de peso

Las ilustraciones usan `currentColor` y tienen que seguir el tema. Un PNG por tema duplica
los assets y pierde nitidez; un SVG estático en `<Image>` no se renderiza en nativo.

- Se instala con `npx expo install react-native-svg` (versión fijada por el SDK 54).
- Un componente `Ilustracion` recibe `id`, `color` y `size`. El color sale del token del
  tema activo, nunca de un literal.
- **Compuerta**: si `react-native-svg` suma más de **25 KB gzip** al bundle web, se adopta
  el plan B: `Ilustracion.web.js` emite `<svg>` del DOM con `React.createElement` (lo admite
  react-native-web) y `react-native-svg` queda solo en nativo, con la misma resolución por
  plataforma que ya usa la capa de datos. Las dos variantes reciben las mismas props.
- El `<style>` interno de los SVG del boceto no se integra (`NOTAS.md`).

### D3. Ilustración por materia, en la materia

- Archivo nuevo: `src/materias/<id>/ilustracion.js`, que exporta los datos de trazo de la
  materia (paths y opacidades) sin JSX de plataforma. `Ilustracion` los dibuja.
- La materia sigue autocontenida; agregar una materia exige su ilustración (delta de
  `subject-catalog`).
- El campo emoji de `metadata.js` deja de usarse en la UI. Se borra si no le queda ningún
  uso (verificado con `rg`); si le queda alguno fuera de la UI, se conserva.
- El campo de filamentos vive en `src/assets/filamentos.js`, con el mismo formato de datos,
  y lo dibuja el mismo componente. Va solo en `MateriaSelectScreen`.

### D4. Fuentes: IBM Plex, cargadas por plataforma y sin bloquear

- Familias: Plex Sans 400/600 y Plex Mono 400/500. Se cargan con `expo-font`, instalado con
  `npx expo install expo-font`.
- Web: `woff2` con subset latin, que cubre á é í ó ú ü ñ ¿ ¡. Nativo: `ttf`. La selección va
  en un módulo por plataforma (`src/theme/fuentes.js` / `fuentes.web.js`), como `expo-sqlite`.
- **Presupuesto**: las 4 fuentes web suman **≤ 100 KB** en total. Se mide aparte del bundle
  y no consume D5.
- **No bloquear**: mientras cargan, la app renderiza con la fuente del sistema (swap). Nunca
  se muestra una pantalla en blanco esperando fuentes. Si la carga falla, la app sigue con
  la del sistema y sin error visible.
- Los archivos de fuente van con su licencia OFL en `src/assets/fuentes/`.

### D5. Presupuesto de peso del bundle

- Línea de base: el gzip del **shell** (el JS y el CSS que carga `dist/index.html`),
  medido en la tarea 0.1: **221.379 bytes** (`evidencia/base.md`). Los bancos lazy quedan
  fuera: crecen con el contenido, no con el diseño.
- Presupuesto del change: **+35 KB gzip** sobre esa base, o sea ≤ 256.379 bytes. Incluye `react-native-svg` o su
  plan B, las seis ilustraciones y el campo de filamentos.
- Al quitar sombras y la banda navy, el CSS debería bajar. Si el total supera los +35 KB, se
  detiene la migración de pantallas y se reporta con la medición, igual que en D8.

### D6. Invariantes de comportamiento que el rediseño no toca

| Invariante | Dónde vive hoy |
|---|---|
| Bandas de estadísticas: ≥ 80 acierto, ≥ 60 y < 80 intermedia, < 60 error | `StatsScreen.js` (≈ l. 194) |
| Umbrales de resultados y de donación | `ResultsScreen.js` (`getResultFeedback`, `DONATION_MIN_SCORE`, `APROBADO_MIN_SCORE`) |
| Preferencia de tema: clave `tema`, valores `claro` / `oscuro`, por defecto `claro` | `TemaContext.js` |
| Eventos de `track(...)` y sus payloads | pantallas |
| Altura igual de header entre `MateriaSelect` y `Home` | `HeaderMarca.js` |
| Origen generado y banco reducido visibles | spec `design-system` |

El boceto supone una banda roja < 65 % y saca la intermedia. Eso contradice el código: los
cortes son 80 y 60, y la banda 60–79 sigue siendo distinguible de las otras dos. Cómo se
distingue (tinta neutra con marca, forma, posición) lo decide el Diseñador.

### D7. Control de tema "Claro | Oscuro"

Reemplaza al `Switch` en `HeaderMarca` y conserva todo el spec `theming`: un gesto, visible
en las pantallas de entrada, estado único y persistencia. Es un control segmentado de dos
opciones con estado accesible (`accessibilityRole` y estado seleccionado); no son dos
botones sueltos.

### D8. Bordes de la app: manifest, meta y `app.json`

- `public/manifest.json`: `background_color` y `theme_color` = tinta del ícono (`#0B0D10`,
  el valor final lo da el Diseñador). Los íconos se separan por propósito: `icon-192` e
  `icon-512` con `any`, y `icon-maskable-512` con `maskable`.
- El `<meta name="theme-color">` en ejecución sigue el tema activo, como hoy (`App.js`,
  ≈ l. 110). El manifest fija el splash y el meta sigue el tema: no se contradicen.
- `scripts/inject-pwa.js` y `app.json` (`backgroundColor`, el fondo del ícono adaptativo)
  dejan de referir `#1a3f6f` y `#6366f1`.
- Favicon del `<head>`: la versión chica (`favicon-small.svg` o `favicon.png`).

### D9. Radios y sombras

El brief excluye las interfaces redondeadas. Los tokens de radio pasan a los valores que
fije el Diseñador (se espera 0) y `src/theme/sombras.js` se vacía o se borra: la elevación
se expresa con filete, no con sombra. Una pantalla migrada no conserva `rounded-*` ni
`sombras.*` que contradigan la ficha.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| `react-native-svg` pesado en web | Compuerta de D2 con plan B sin dependencia en web |
| Fuentes que retrasan el primer render | Swap y fallback del sistema (D4) |
| Divergencia larga entre `rediseno` y `main` | Hotfixes chicos en `main`; los conflictos se resuelven en el merge final |
| Pantallas sin ficha implementadas "a ojo" | Ninguna tarea de pantalla se despacha sin su ficha aprobada (tareas 1.x) |
| Contraste del acento teal en oscuro | Tabla de pares obligatoria en la tarea 1.1 |

## Migration Plan

Orden: fichas → infraestructura → una pantalla por tarea → bordes → cierre. Cada tarea es
un commit en `rediseno`. Rollback: revert del commit de la tarea. La app de `main` sigue
publicándose sin cambios hasta el merge.
