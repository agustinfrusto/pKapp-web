## Why

La base técnica del sistema visual ya está: tokens en `src/theme/colores.js` y
`tailwind.config.js`, NativeWind en las 10 superficies y tema claro/oscuro con su control
expuesto. La estética sigue siendo la genérica que el operador quiere sacar: navy de
identidad, tarjetas redondeadas, sombras, emojis como íconos y pasteles por parcial
(`referencias-diseno/REFERENCIAS.md`, "Lo que no quiero").

La dirección ya está aprobada: el **híbrido Plancha + campo de filamentos**
(`referencias-diseno/propuestas/hibrido/`). Este change la lleva a la app.

## What Changes

- **Gramática Plancha en toda la app**: marco de 1 px con marcas de esquina, cajetín al pie,
  rótulos en mono, esquinas rectas y sin sombras. Las pantallas internas pierden la banda
  navy y pasan a una barra con filete inferior. El navy deja de ser la identidad.
- **Campo de filamentos** solo en el selector de materias, como figura dentro de una
  lámina. Nunca va como fondo ni debajo de texto.
- **Ilustración vectorial monocroma por materia** (las seis), que reemplaza el emoji de
  `metadata.js` en la UI.
- **Tipografía propia**: IBM Plex Sans 400/600 y Plex Mono 400/500, con presupuesto de peso
  propio.
- **Sin emojis en la interfaz**: cada uno pasa a un glifo SVG de trazo; el texto acompaña, no sustituye. El contenido de los
  `questions.js` no se toca.
- **Control de tema** en forma de selector de texto "Claro | Oscuro". Conserva clave,
  valores y alcance.
- **Estados semánticos por forma además de color** en quiz, resultados y estadísticas.
- **Ícono, favicon y manifest** nuevos (`openspec/changes/rediseno-plancha/diseno/favicon/`). El navy
  `#1a3f6f` y el `#6366f1` salen de `app.json`, del manifest y de `inject-pwa.js`.
- **Pantallas que el boceto no cubre**: el Diseñador las resuelve antes de implementarlas
  (agregar pregunta, revisión de respuestas, examen en curso, ajustes, donaciones y estados
  vacíos).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `design-system`: la paridad visual admite un rediseño declarado. Se agregan tres
  requisitos: estados semánticos no dependientes solo del color, interfaz sin emojis y
  presupuesto de peso para fuentes e ilustraciones.
- `subject-catalog`: toda materia registrada tiene su ilustración, y el selector muestra
  conteos reales.

## Impact

- **Dependencias nuevas**: `react-native-svg` y `expo-font`, instaladas con
  `npx expo install`. No se agrega ninguna otra.
- **Archivos**: las 8 pantallas, los 2 componentes, `src/theme/**`, `tailwind.config.js`,
  `App.js`, `app.json`, `public/manifest.json`, `scripts/inject-pwa.js`, `src/assets/**`
  y un archivo nuevo de ilustración por materia.
- **Sin cambios**: progreso guardado, esquema SQLite, clave `tema`, ids de materia y de
  topic, bancos de preguntas, umbrales de puntaje y lógica del quiz.
- **Rama**: todo en `rediseno`. El merge a `main` se hace consolidado y con orden del
  operador. En la rama no se versiona (`openspec/commit.md`, paso 4).

## Open questions (operador)

1. ~~**Copy de resultados**~~: resuelta el 2026-10-10. El usuario aprobó RESULTS-P2 ("Muy
   bien. Vas por buen camino.", sin "¡") junto con el resto de las propuestas de copy.
