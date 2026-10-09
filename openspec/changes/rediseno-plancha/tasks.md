Rama: `rediseno`. Una tarea por despacho, en orden, un commit por tarea. Compuerta de
`src/**`: `npm run build:web && npm run e2e`.

## 0. Línea de base (Ingeniero)

- [ ] 0.1 En `rediseno`, `npm run build:web`. Registrar en `evidencia/base.md` el gzip de JS+CSS de `dist/` (método de D8 de `add-design-tokens-nativewind`) y el crudo como control
- [ ] 0.2 Capturar las 8 pantallas a 390 px en claro y oscuro (`npm run screenshots` si cubre ambos temas) y guardarlas en `evidencia/antes/`

## 1. Fichas de diseño (Diseñador, `claude-sonnet-5-5`, `max`)

- [ ] 1.1 Tabla de tokens final, claro y oscuro: colores con su nombre en `colores.js`, familias y escala tipográfica, radios, filetes y espaciado. Incluye la tabla de contraste de cada par texto/fondo en ambos temas (≥ 4,5:1 normal, ≥ 3:1 grande). Escribe `colores.js` y entrega los valores de `tailwind.config.js` en la tabla
- [ ] 1.2 Fichas de las pantallas del boceto (`MateriaSelect`, `Home`, `TopicSelect`, `Quiz`, `Results`, `Stats`) en `referencias-diseno/propuestas/hibrido/pantallas/<pantalla>.md`: layout, tokens por elemento y matriz de estados. Debe respetar D6: cortes 80/60 con la banda intermedia distinguible, conteos reales de `dre` y `ryd` y origen generado visible
- [ ] 1.3 Fichas de lo que el boceto no cubre: `AddQuestion`, revisión de respuestas, examen en curso, `Settings`, `DonationBox`, estados vacíos y el banner de banco reducido. Más la distinción entre 1.er y 2.do parcial sin pasteles
- [ ] 1.4 Glifos de trazo de 1,5 px para cada emoji que hoy usa la UI (inventario: `rg` de emojis en `src/screens`, `src/components` y `App.js`), en `referencias-diseno/propuestas/hibrido/svg/glifos/`
- [ ] 1.5 Auditoría del Ingeniero: fichas 1.1–1.4 contra el brief, `REFERENCIAS.md`, D6 y la tabla de contraste. Lo que no cumple vuelve al Diseñador. **Ninguna tarea 2.x ni 3.x arranca sin 1.5 aprobada**

## 2. Infraestructura (Programador, `claude-sonnet-5-5`, `low`)

- [ ] 2.1 `npx expo install react-native-svg`. Componente `src/components/Ilustracion.js` (D2/D3) y `src/materias/<id>/ilustracion.js` para las 6 materias, más `src/assets/filamentos.js`, convertidos desde `hibrido/svg/`. Medir el delta gzip del bundle: si supera 25 KB, implementar el plan B de D2 y volver a medir. Aceptación: build y e2e en verde, y el delta reportado con su medición
- [ ] 2.2 `npx expo install expo-font`. Fuentes Plex con subset latin (`woff2` web, `ttf` nativo, con licencia OFL) en `src/assets/fuentes/`, y `src/theme/fuentes.js` / `fuentes.web.js` según D4. Familias en `tailwind.config.js`. Aceptación: 4 `woff2` ≤ 100 KB en total y, con la red throttled a "Slow 3G", el primer render muestra texto con la fuente del sistema
- [ ] 2.3 Aplicar a `tailwind.config.js` las escalas de la tabla 1.1 (tipografía, radios) y vaciar o borrar `src/theme/sombras.js` según D9, sin migrar pantallas todavía. Aceptación: build y e2e en verde. Las pantallas pueden verse a medio camino: es esperable en la rama

## 3. Pantallas (Programador, `low`; una tarea por superficie, cada una contra su ficha)

- [ ] 3.1 `HeaderMarca` + control "Claro | Oscuro" (D7). Verificar el alto igual de header entre `MateriaSelect` y `Home`, y el estado único del tema
- [ ] 3.2 `MateriaSelectScreen`: lámina de filamentos e ilustraciones por materia con conteos reales
- [ ] 3.3 `HomeScreen`
- [ ] 3.4 `TopicSelectScreen`
- [ ] 3.5 `QuizScreen`, incluido el examen en curso y la revisión de respuestas
- [ ] 3.6 `ResultsScreen`, con los umbrales de D6 intactos
- [ ] 3.7 `StatsScreen`, con las bandas 80/60 distinguibles sin color
- [ ] 3.8 `SettingsScreen` y `DonationBox`
- [ ] 3.9 `AddQuestionScreen`

Aceptación común de 3.x: build y e2e en verde; captura en claro y oscuro a 390 px en
`evidencia/despues/`; cero emojis, `rounded-*` y `sombras.*` que contradigan la ficha
(`rg`); cero literales visuales; los `track(...)` sin cambios. Un diff de más de 50 líneas va
al Analista.

## 4. Bordes de la app (Programador, `low`)

- [ ] 4.1 Íconos y favicon desde `propuestas/favicon/` a `public/` y `src/assets/`. `manifest.json` con los propósitos `any`/`maskable` separados y los colores de D8. `inject-pwa.js` y `app.json` sin `#1a3f6f` ni `#6366f1`. Aceptación: `rg -i '1a3f6f|6366f1'` vacío fuera de `openspec/` y `referencias-diseno/`, y el meta `theme-color` sigue al tema activo

## 5. Cierre (Ingeniero)

- [ ] 5.1 Medir el bundle contra 0.1: ≤ +35 KB gzip (D5). Fuentes ≤ 100 KB (D4). Registrar en `evidencia/cierre.md`
- [ ] 5.2 Recorrer las 10 superficies en ambos temas contra sus fichas; verificar contraste, estados sin color y sin emojis
- [ ] 5.3 `openspec validate rediseno-plancha --strict`
- [ ] 5.4 Con orden del operador: merge de `rediseno` a `main`, versión minor en el commit siguiente (`openspec/commit.md`, paso 4) y archivo del change
