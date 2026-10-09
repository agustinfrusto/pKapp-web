## Why

La estética de pKapp ya es la correcta —navy sobrio sobre slate claro, tono clínico— pero no está codificada en ningún lado: vive copiada a mano en ~1.500 líneas de `StyleSheet.create` repartidas en 9 archivos, con 60 colores literales distintos, 16 tamaños de fuente y 9 radios de borde, muchos de ellos repetidos (`#1a3f6f` 18 veces, `#607d99` 16, `#94a3b8` 13). Cambiar un tono implica editar nueve archivos y confiar en que no se escapó ninguno, y cada pantalla nueva reinventa su card, su chip y su botón. Sin una fuente única de verdad, la coherencia visual depende de la memoria del que edita.

## What Changes

- Se adopta **NativeWind v4** (Tailwind para React Native) como sistema de estilos. No impone estética propia: la paleta actual de pKapp se declara como tokens en `tailwind.config.js` y los componentes la consumen por nombre.
- Se define un **conjunto de tokens** derivado del inventario completo de colores, tipografías, espaciados y radios de las 9 pantallas, no solo de las del piloto. Cubre color de marca, superficies, texto, bordes y estados semánticos (correcto, incorrecto, aviso).
- Se migran **las 9 superficies** de `StyleSheet.create` a clases de utilidad. El plan original era un piloto de tres, pero exponer el switch obliga a que toda la app responda al tema: media app en oscuro es peor que no tener la función.
- Se agrega **modo oscuro**: cada token de color recibe su contraparte oscura y se suma un switch de tema en las cabeceras de Home y de selección de materias, que persiste entre sesiones.
- El control es **binario y arranca en claro**. La app no sigue la preferencia del sistema operativo: ponerse oscura sola, en una app de estudio que se abre a ratos, se lee como un error y no como una cortesía.
- Se establece la **paridad visual** como criterio de aceptación del piloto: la migración no rediseña, traduce. Cualquier diferencia visual respecto de la versión actual es un defecto, salvo las que el change declare de forma explícita.
- Se integra NativeWind con el `metro.config.js` existente **sin romper** el `resolveRequest` propio que hoy redirige `expo-sqlite` a un stub en web. Esa resolución es lo que mantiene el build web funcionando.
- Queda **fuera** la verificación de paridad de las cuatro vistas del quiz: sortea preguntas al azar, así que dos capturas nunca muestran el mismo contenido y el diff mediría contenido en vez de estilo.

## Capabilities

### New Capabilities

- `design-system`: fuente única de verdad para los valores visuales de la app (color, tipografía, espaciado, radios, elevación) y las reglas que gobiernan cómo las pantallas los consumen. Cubre la obligación de no usar literales visuales en las pantallas, la paridad visual en cada migración, el presupuesto de peso del bundle y el contraste mínimo exigido.
- `theming`: selección y persistencia del tema visual de la app. Cubre el control binario y dónde alcanza, la persistencia entre sesiones, la coherencia del estado entre las pantallas que lo muestran, y la regla de que el control no se expone hasta que todas las superficies respondan al tema.

### Modified Capabilities

Ninguna. `openspec/specs/` no tiene capacidades publicadas todavía.

## Impact

- **Dependencias nuevas**: `nativewind@^4.2.6` y `tailwindcss@^3.4.19`. NativeWind v4 exige Tailwind v3; Tailwind v4 solo lo soporta la preview de NativeWind v5, que no se adopta acá.
- **Configuración**: `babel.config.js` (preset de NativeWind), `metro.config.js` (envolver con `withNativeWind` preservando el `resolveRequest` actual), `tailwind.config.js` y un `global.css` nuevos.
- **Código**: las 8 pantallas de `src/screens/` y `src/components/DonationBox.js`.
- **Tema**: se agrega un proveedor de tema en `App.js` y el switch en las cabeceras de Home y de selección de materias. La preferencia se guarda con la API `getSetting`/`saveSetting` ya existente, idéntica en web y nativo, así que no hace falta migración de datos: una clave ausente cae en su valor por defecto.
- **Configuración de plataforma**: `app.json` fuerza hoy `"userInterfaceStyle": "light"`, que impide el modo oscuro en nativo y debe pasar a `"automatic"`. El `themeColor` de la PWA y la `StatusBar` de `App.js` también dependen del tema activo.
- **Estilos web inyectados**: `src/utils/webStyles.js` tiene el navy del hover hardcodeado y necesita su variante oscura, o el hover se pierde contra fondo oscuro.
- **Build**: `npm run build:web` debe seguir produciendo un `dist/` funcional; hoy pesa 1,9 MB y ese número es la línea de base contra la que se mide el costo.
- **Riesgo acotado**: el plugin de babel/metro es el punto de fallo más probable en Expo SDK 54 / RN 0.81. El piloto existe para descubrirlo con dos archivos migrados y no con nueve.
- **Sin impacto en datos**: no toca `src/db/`, ni el formato de `localStorage`, ni la lógica de materias. Es un cambio de presentación.
