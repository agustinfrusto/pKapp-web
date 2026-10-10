Rama: `rediseno`. Una tarea por despacho, en orden, un commit por tarea. Compuerta de
`src/**`: `npm run build:web && npm run e2e`.

## 0. Línea de base (Ingeniero)

- [x] 0.1 En `rediseno`, `npm run build:web`. Registrar en `evidencia/base.md` el gzip del shell (base de D5) y el crudo como control. Shell gzip: 221.379 bytes
- [ ] 0.2 (después de 2.4) Capturar las pantallas a 390 px en claro y oscuro desde un build de `main` y guardarlas en `evidencia/antes/`. Bloqueada el 2026-10-09: `npm run screenshots` se cuelga (`evidencia/base.md`)

## 1. Fichas de diseño (Diseñador, `claude-sonnet-5-5`, `max`)

- [x] 1.1 Tabla de tokens final, claro y oscuro: colores con su nombre en `colores.js`, familias y escala tipográfica, radios, filetes y espaciado. Incluye la tabla de contraste de cada par texto/fondo en ambos temas (≥ 4,5:1 normal, ≥ 3:1 grande). Escribe `colores.js` y entrega los valores de `tailwind.config.js` en la tabla. Entregado en `diseno/tokens.md` y el export `plancha` (19 claves); contraste recalculado por el Ingeniero, holgura mínima 3,47 (N3)
- [x] 1.2 (propuestas resueltas por el usuario el 2026-10-10: 7 conservadas de main por D10, 24 aprobadas; MATERIA-P1 dice "ESFUNO") Fichas de las pantallas del boceto (`MateriaSelect`, `Home`, `TopicSelect`, `Quiz`, `Results`, `Stats`) en `openspec/changes/rediseno-plancha/diseno/pantallas/<pantalla>.md`: layout, tokens por elemento y matriz de estados. Debe respetar D6: cortes 80/60 con la banda intermedia distinguible, conteos reales de `dre` y `ryd` y origen generado visible. Y D10: layout en 390, 768 y 1280 px, sin rupturas de uso respecto de `main`
- [ ] 1.3 Fichas de lo que el boceto no cubre: `AddQuestion`, revisión de respuestas, examen en curso, `Settings`, `DonationBox`, estados vacíos y el banner de banco reducido. Más la distinción entre 1.er y 2.do parcial sin pasteles
- [ ] 1.4 Glifos SVG de trazo de 1,5 px, dibujados con las referencias de diseño, para cada emoji que hoy usa la UI (ninguno se retira por texto solo; color elegido por la estética Plancha y por la función del emoji reemplazado, con tokens de `diseno/tokens.md`; pedidos del usuario 2026-10-10) y para cada glifo del inventario de `diseno/pantallas/comun.md` §9 (inventario: `rg` de emojis en `src/screens`, `src/components` y `App.js`), en `openspec/changes/rediseno-plancha/diseno/svg/glifos/`
- [x] 1.6 Ícono con "pK" (pedido del usuario, 2026-10-10): rehacer favicon, ícono y maskable en `openspec/changes/rediseno-plancha/diseno/favicon/` con "pK" en vez de la "p" sola, legible a 16 px. La 4.1 integra estas piezas. Entregado: 3 SVG sin `<text>`, 9 PNG con tamaños verificados (incluido `apple-touch-icon.png` 180) y lámina con pestaña clara y oscura, iOS, círculo y squircle. Sin cambios de color. Pendiente al cerrar 1.2: en `tokens.md` E4, fila A2, "p" pasa a "pK"
- [x] 1.7 (Ingeniero, al cerrar 1.2; orden del usuario 2026-10-10) Mover los contratos de diseño fuera de `referencias-diseno/`, que vuelve a ignorarse entera: `propuestas/hibrido/{tokens.md,NOTAS.md,pantallas/,svg/}` y `propuestas/favicon/{*.svg,generar.py,prueba.html,NOTAS-FAVICON.md}` pasan a `openspec/changes/rediseno-plancha/diseno/` (`favicon/` como subcarpeta; sus PNG generados, ignorados). Actualizar rutas en `.gitignore`, `proposal.md`, `design.md`, `tasks.md`, `openspec/workers.md` (rutas editables del Diseñador) y el comentario de `src/theme/colores.js`. Aceptación: `rg 'propuestas/(hibrido|favicon)'` vacío fuera de `openspec/changes/archive/` y `.orca/`; `git check-ignore referencias-diseno/propuestas/hibrido/tokens.md` lo reporta ignorado
- [ ] 1.5 Auditoría del Ingeniero: fichas 1.1–1.4 y 1.6 contra el brief, `REFERENCIAS.md`, D6 y la tabla de contraste. Lo que no cumple vuelve al Diseñador. **Ninguna tarea 2.x ni 3.x arranca sin 1.5 aprobada**

## 2. Infraestructura (Programador, `claude-sonnet-5-5`, `low`)

- [ ] 2.1 `npx expo install react-native-svg`. Componente `src/components/Ilustracion.js` (D2/D3) y `src/materias/<id>/ilustracion.js` para las 6 materias, más `src/assets/filamentos.js`, convertidos desde `diseno/svg/`. Medir el delta gzip del bundle: si supera 25 KB, implementar el plan B de D2 y volver a medir. Aceptación: build y e2e en verde, y el delta reportado con su medición
- [ ] 2.2 `npx expo install expo-font`. Fuentes Plex con subset latin (`woff2` web, `ttf` nativo, con licencia OFL) en `src/assets/fuentes/`, y `src/theme/fuentes.js` / `fuentes.web.js` según D4. Familias en `tailwind.config.js`. Aceptación: 4 `woff2` ≤ 100 KB en total y, con la red throttled a "Slow 3G", el primer render muestra texto con la fuente del sistema
- [ ] 2.3 Aplicar a `tailwind.config.js` las escalas de la tabla 1.1 (tipografía, radios) y vaciar o borrar `src/theme/sombras.js` según D9, sin migrar pantallas todavía. Aceptación: build y e2e en verde. Las pantallas pueden verse a medio camino: es esperable en la rama
- [ ] 2.4 Reparar `scripts/capturar-screenshots.js`, que hoy se cuelga en "1. Materia Select". Agregar argumentos de tema (`claro` / `oscuro`, aplicado por la preferencia `tema` y no por el SO), de ancho (por defecto 390) y de carpeta de salida (por defecto `docs/screenshots/`, sin cambiar su comportamiento actual). Aceptación: con `--tema oscuro --salida <dir>` guarda las 6 capturas en `<dir>` con el tema oscuro aplicado, y sin argumentos produce las mismas 6 capturas en claro que antes

## 3. Pantallas (Programador, `low`; una tarea por superficie, cada una contra su ficha)

- [ ] 3.1 `HeaderMarca` + control "Claro | Oscuro" (D7). Verificar el alto igual de header entre `MateriaSelect` y `Home`, y el estado único del tema
- [ ] 3.1b Barra interna del Stack (`screenOptions` y `options` de `App.js`): título, volver y filete inferior según `pantallas/comun.md`; `Quiz` con `headerShown: false` y su barra propia según `pantallas/Quiz.md`. Verificar que el volver del navegador y la confirmación de `beforeRemove` del quiz siguen iguales
- [ ] 3.2 `MateriaSelectScreen`: lámina de filamentos e ilustraciones por materia con conteos reales. MATERIA-P2: la celda «Banco real» se muestra solo con la materia disponible y su conteo cargado (ni en Cargando ni en Próximamente); su estilo es el de la ficha
- [ ] 3.3 `HomeScreen`
- [ ] 3.4 `TopicSelectScreen`
- [ ] 3.5 `QuizScreen`, incluido el examen en curso y la revisión de respuestas
- [ ] 3.6 `ResultsScreen`, con los umbrales de D6 intactos
- [ ] 3.7 `StatsScreen`, con las bandas 80/60 distinguibles sin color
- [ ] 3.8 `SettingsScreen` y `DonationBox`
- [ ] 3.9 `AddQuestionScreen`

Aceptación común de 3.x: build y e2e en verde; captura en claro y oscuro a 390, 768 y
1280 px en `evidencia/despues/` (D10); ningún recorrido cambia de flujo ni de cantidad de
gestos respecto de `main`; cero emojis, `rounded-*` y `sombras.*` que contradigan la ficha
(`rg`); cero literales visuales; los `track(...)` sin cambios. Un diff de más de 50 líneas va
al Analista.

## 4. Bordes de la app (Programador, `low`)

- [ ] 4.1 Íconos y favicon desde `diseno/favicon/` a `public/` y `src/assets/`, incluido `apple-touch-icon.png` (180 px): el `<link rel="apple-touch-icon">` de `inject-pwa.js` pasa de `/icon-192.png` a `/apple-touch-icon.png`. `manifest.json` con los propósitos `any`/`maskable` separados y los colores de D8. `inject-pwa.js` y `app.json` sin `#1a3f6f` ni `#6366f1`; los valores salen de `plancha.manifestTema`, `manifestFondo` e `iconoFondo` (`tokens.md`, a.1). En `App.js`, el splash y la `StatusBar` usan tokens `plancha` (contenido oscuro en claro y claro en oscuro, `tokens.md` a.2) y no quedan literales de color. Aceptación: `rg -i '1a3f6f|6366f1'` vacío fuera de `openspec/` y `referencias-diseno/`, y el meta `theme-color` sigue al tema activo

## 5. Cierre (Ingeniero)

- [ ] 5.1 Medir el bundle contra 0.1: ≤ +35 KB gzip (D5). Fuentes ≤ 100 KB (D4). Registrar en `evidencia/cierre.md`
- [ ] 5.2 Recorrer las 10 superficies en ambos temas contra sus fichas; verificar contraste, estados sin color y sin emojis
- [ ] 5.3 `openspec validate rediseno-plancha --strict`
- [ ] 5.4 Con orden del operador: merge de `rediseno` a `main`, versión minor en el commit siguiente (`openspec/commit.md`, paso 4) y archivo del change
