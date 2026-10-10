# Híbrido: Plancha + campo de filamentos

Archivos: `hibrido.html` (seis pantallas a 390 px, claro y oscuro; `#oscuro` y `#claro` muestran un solo tablero), `svg/<id>.svg` (seis ilustraciones), `tablero-oscuro.png` y `tablero-claro.png`.

## Qué cambió respecto de los bocetos
- **Concepto completo:** seis pantallas (selector, inicio de materia, elegir tema, quiz, resultados, estadísticas) con la misma gramática: marco de 1 px con marcas de esquina, cajetín al pie, rótulos mono, esquinas rectas.
- **Cabecera fuera del patrón navy:** las pantallas internas ya no llevan banda navy; llevan una barra con filete inferior. El navy actual deja de existir como identidad.
- **Seis materias** con ilustración propia. `dre` (riñón en corte) y `ryd` (blastocisto y estadios de segmentación) son nuevas. Las tarjetas de `dre` y `ryd` dicen "En preparación" porque la app aún no las tiene; no inventé conteos.
- **Interruptor de tema:** el sol emoji pasa a un selector de texto "Claro | Oscuro".
- **Emojis de la app actual** (🎲, 📋, 🔄, 🏠, 💡, el sol y los íconos de acción) desaparecen: texto, o glifos de trazo de 1,5 px para las cuatro acciones del inicio.
- **Resultados:** el porcentaje pasa a mono grande; añadí una tira de 24 casillas donde el error es más bajo **y** rojo (estado por forma, no solo por color). Retiré el "¡" del mensaje ("Muy bien. Vas por buen camino."): es copy, decide el usuario.
- **Estadísticas:** las barras son tinta neutra; solo ≥ 80 % va en verde y < 65 % en rojo (hoy hay también ámbar, que se pierde). Una marca en 80 % lo hace legible. Ese umbral es una suposición mía: verificar contra el código.
- **Datos de estadísticas y resultados:** son ilustrativos (coherentes entre sí: 76/97 = 78 %), no datos reales.

## Cómo se resolvió el encuentro filamentos / Plancha
El campo de filamentos **no es un fondo ni una cabecera a sangre**: es la imagen de una lámina, dentro del mismo marco con marcas de esquina que usan las tarjetas, con una regla graduada como pie y un cajetín debajo donde vive el nombre. Así el campo es "la figura" de un plano más, y la Plancha lo contiene. Consecuencias:
- El texto nunca va encima de las líneas: el wordmark y los rótulos están en el cajetín, sobre superficie plana. No hay problema de contraste.
- Las líneas son monocromas: acero `#8FB4C9` en oscuro y tinta `#14181D` en claro. El único color es un contorno en el acento teal de la app, que hace de eco al contorno verde de ref1.
- Aparece **solo** en el selector, como se pidió.

## Qué queda abierto
- **Implementación del campo:** en el boceto son 58 paths SVG con opacidades distintas (≈ 6 KB). Necesita `react-native-svg` (no está en `package.json`), o una imagen SVG/PNG estática. Decisión del Ingeniero.
- **Fuentes:** IBM Plex Sans 400/600 + Plex Mono 400/500, ~70 KB estimados; no medidos. Hoy la app no carga fuentes propias.
- **Los SVG de materia usan `currentColor`;** abiertos solos, siguen el modo del sistema por un `<style>` interno (que no debe ir al integrarlos).
- **Ilustraciones `dre` y `ryd`:** son esquemas simples; si el usuario quiere más detalle (grabado, despiece), requiere más trabajo de dibujo.
- **Parciales:** hoy 1er y 2do parcial se distinguen por pasteles; en el híbrido solo por texto. Falta decidir si necesitan algo más.
- **Pantallas no cubiertas:** revisión de respuestas, modo examen en curso, agregar pregunta y estados vacíos; seguirían la misma gramática.
- **Subrayado, tachado y estados del Atlas** no se usan: el híbrido no tiene el riesgo de `textDecorationStyle: double`.
