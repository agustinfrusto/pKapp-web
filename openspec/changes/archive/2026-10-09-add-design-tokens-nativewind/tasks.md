## 1. Línea de base y evidencia previa

- [x] 1.1 Ejecutar `npm run build:web` sobre el código actual, sin tocar nada, y registrar el tamaño de `dist/` con `du -sb dist` en el registro del change; ese número es la línea de base contra la que se mide el presupuesto de D8
- [x] 1.2 Capturar el estado visual previo de `HomeScreen` en el navegador a un viewport fijo (declarar cuál) y con un estado de datos declarado, y guardar la captura como evidencia de la comparación posterior
- [x] 1.3 Capturar del mismo modo el estado visual previo de `SettingsScreen`, incluyendo las secciones colapsables abiertas, que es donde vive la mayor parte de sus estilos
- [x] 1.4 Capturar del mismo modo el estado visual previo de `DonationBox`, verificando que la captura incluya la variante que la pantalla muestra por defecto
- [x] 1.5 Verificar que el árbol de git está limpio antes de empezar, de modo que el rollback del Migration Plan sea un revert acotado a los archivos de este change

## 2. Inventario visual y definición de tokens del tema claro

- [x] 2.1 Extraer el inventario completo de colores, tamaños de fuente, radios y sombras de las 9 superficies (`src/screens/*.js`, `src/components/*.js`, `App.js`) a un archivo de trabajo, y verificar que los totales coinciden con los 60 colores, 16 tamaños y 9 radios que declara el design
- [x] 2.2 Confirmar contra la escala `slate` por defecto de Tailwind que los nueve neutros identificados en el design coinciden exactamente, y registrar cualquiera que no coincida para tratarlo como token propio
- [x] 2.3 Asignar cada color del inventario a un rol (`brand`, `accent`, `success`, `danger`, `warning`, neutro) o marcarlo para descarte, dejando registro por escrito del valor que reemplaza cada colapso, como exige el requisito de cobertura completa del inventario
- [x] 2.4 Resolver los ~20 colores de un solo uso y confirmar que `#6366f1`, `#ff6b6b` y `#c2974a` quedan marcados para eliminar, verificando con `grep` que ninguno tiene otro uso vivo en `src/`
- [x] 2.5 Definir la escala tipográfica de 7 pasos más la escala *display*, y listar explícitamente cada reasignación de los tamaños sueltos (`10, 15, 17, 18, 22, 28`) como diferencia visual intencional declarada
- [x] 2.6 Definir la escala de radios de 5 pasos y listar del mismo modo las reasignaciones de `3, 4, 14, 18`
- [x] 2.7 Medir el contraste de cada par texto/fondo del tema claro y verificar que alcanza 4.5:1 en texto normal y 3:1 en texto grande; corregir el token o registrar la excepción con su motivo para cada par que no llegue

## 3. Instalación y configuración

- [x] 3.1 Instalar `nativewind@^4.2.6` y `tailwindcss@^3.4.19` y verificar con `npm ls tailwindcss` que la versión efectivamente instalada es 3.x y no 4.x
- [x] 3.2 Crear `tailwind.config.js` con el preset de NativeWind, `darkMode` en modo clase, los tokens claros de D3 y un `content` explícito apuntando a `./App.js` y `./src/**/*.{js,jsx}`, y verificar que el archivo se parsea corriendo `npx tailwindcss --help` sin error de config
- [x] 3.3 Crear `global.css` con las directivas de Tailwind e importarlo desde `App.js`
- [x] 3.4 Agregar el preset de NativeWind a `babel.config.js` y verificar que `expo start --web` levanta sin error de transformación
- [x] 3.5 Reescribir `metro.config.js` siguiendo el orden de D2 —`getDefaultConfig`, luego `withNativeWind`, y recién después instalar el `resolveRequest` propio encadenado al que NativeWind haya dejado— conservando el patrón `originalResolveRequest` que el archivo ya usa
- [x] 3.6 Crear el módulo de tokens compartido que exporta las sombras como objetos de estilo según D5, para consumo por `style={}` desde componentes que no aceptan `className`

## 4. GATE de integración

- [x] 4.1 Ejecutar `npm run build:web` **antes de migrar ninguna pantalla** y verificar que completa sin error; si falla acá, el problema es la integración y no la migración, y se aísla antes de seguir
- [x] 4.2 Verificar con `grep -r wa-sqlite dist/` que el resultado es vacío, confirmando que el `resolveRequest` propio sobrevivió al envoltorio de `withNativeWind`
- [x] 4.3 Servir el `dist/` generado y verificar en el navegador que la app carga, navega entre pantallas y muestra el progreso guardado intacto
- [x] 4.4 Aplicar una clase de utilidad de prueba a un elemento cualquiera, confirmar en el build de producción —no en `expo start`— que el estilo se aplica, y revertir la prueba; esto verifica que la purga de D9 no está borrando clases vivas
- [x] 4.5 **GATE**: si 4.1, 4.2, 4.3 o 4.4 fallan, detener el change y revertir los archivos de configuración en vez de intentar migrar pantallas sobre una integración rota

## 5. Migración en tema claro

- [x] 5.1 Migrar `src/components/DonationBox.js` de `StyleSheet.create` a clases de utilidad, empezando por el archivo chico para exponer temprano los problemas de traducción, y verificar que renderiza sin warnings en consola
- [x] 5.2 Migrar `src/screens/HomeScreen.js` del mismo modo, manteniendo en `style={}` las sombras y todo lo que llegue a componentes que no aceptan `className`
- [x] 5.3 Migrar `src/screens/SettingsScreen.js` del mismo modo, verificando que los `Switch` y las secciones colapsables conservan su comportamiento además de su aspecto
- [x] 5.4 Verificar con `grep` que ninguno de los tres archivos migrados conserva colores, radios o tamaños literales, y que ningún nombre de clase se construye por concatenación de strings, como exige la regla derivada de D9
- [x] 5.5 Confirmar que el banner de banco reducido y cualquier distinción de origen de contenido visible en las pantallas migradas siguen siendo distinguibles a simple vista

## 6. GATE de paridad y presupuesto

- [x] 6.1 Recapturar las tres superficies al mismo viewport y con el mismo estado de datos que el grupo 1, y comparar contra las capturas previas
- [x] 6.2 Clasificar cada diferencia encontrada como declarada en 2.5/2.6 o como no declarada, y corregir todas las no declaradas antes de continuar
- [x] 6.3 Revisar las diferencias declaradas que sí se notan en la comparación y revertir esos tokens a su valor original, incorporándolos como token propio en vez de forzar la escala
- [x] 6.4 Ejecutar `npm run build:web`, medir el tamaño comprimido de los assets y verificar que el aumento respecto de la línea de base de 1.1 no supera los 30 KB gzip, con el crudo como control secundario por debajo de +5%
- [x] 6.5 Verificar que las pantallas todavía no migradas siguen renderizando con su apariencia previa, navegando por todas ellas en el build de producción
- [x] 6.6 **GATE**: si queda alguna diferencia visual no declarada, si el presupuesto de peso se excede o si alguna pantalla no migrada se degradó, detener acá y no empezar el modo oscuro; el motivo se registra con su medición. El presupuesto se excedió y el usuario lo revisó (D8) antes de continuar

## 7. Modo oscuro

- [x] 7.1 Definir la contraparte oscura de cada token de color según D3 —superficies desde los `slate` altos, texto desde los bajos, navy como acento y no como fondo— y verificar que todo rol del tema claro tiene su par en oscuro, sin roles huérfanos
- [x] 7.2 Medir el contraste de cada par texto/fondo del tema oscuro contra los mismos umbrales de 2.7, y corregir el token o registrar la excepción con su motivo para cada par que no llegue
- [x] 7.3 Implementar el proveedor de tema en `App.js` con los dos estados de D11, verificando que fija el esquema activo de NativeWind, que aplica la clase a la raíz en web y que el default para un usuario sin preferencia es claro
- [x] 7.4 Persistir la preferencia con `getSetting('tema', 'claro')` y `saveSetting('tema', valor)` según D12, y verificar que elegir un tema, cerrar y reabrir la app lo conserva, y que un perfil sin la clave —o con un valor que ya no existe— arranca sin error
- [x] 7.5 Verificar que la app **no** cambia de tema al cambiar el esquema del sistema operativo: la elección del usuario es la única que manda
- [x] 7.6 Agregar el switch de tema en las cabeceras de `HomeScreen` y `MateriaSelectScreen` según D13, arriba a la derecha, y verificar por medición que cambia el tema al instante sin recargar y que las dos cajas caen a la misma altura
- [x] 7.7 Verificar que el estado es único: encender el tema desde una pantalla deja el control de la otra ya marcado, y apagarlo desde cualquiera lo apaga en toda la app
- [x] 7.8 Corregir `"userInterfaceStyle"` en `app.json` de `"light"` a `"automatic"` según D14, y verificar que sin ese cambio el tema oscuro no tomaba efecto en nativo
- [x] 7.9 Hacer que la `StatusBar` de `App.js` y el `themeColor` de la PWA correspondan al tema activo, y verificar que en oscuro no queda un borde claro delatando el tema anterior
- [x] 7.10 Agregar la variante oscura del hover inyectado en `src/utils/webStyles.js`, hoy fijo en `rgba(26,63,111,0.55)`, y verificar en el navegador que el hover sigue siendo perceptible sobre fondo oscuro
- [x] 7.11 Revisar las superficies migradas en tema oscuro y confirmar que no queda ningún elemento en colores claros; el oscuro no se verifica por paridad, porque no tiene versión previa contra la cual compararse
- [x] 7.12 Ejecutar `npm run build:web` y verificar que el peso comprimido sigue dentro de los 30 KB del presupuesto de 6.4 después de sumar las variantes oscuras

## 8. Cierre

- [x] 8.1 Registrar en el change el resultado de las mediciones —peso final, diferencias visuales declaradas y aceptadas, excepciones de contraste en ambos temas— de modo que las decisiones queden con datos y no de memoria
- [x] 8.2 Verificar que `openspec validate add-design-tokens-nativewind --strict` pasa y que todos los requisitos de ambos specs tienen su verificación cumplida o su excepción registrada
- [x] 8.3 Migrar las 6 pantallas restantes y exponer el switch, en vez de dejarlo para un change posterior: el pedido de un control accesible lo exigía, y verificar con `grep` que no queda ningún `StyleSheet.create` en pantallas ni componentes
