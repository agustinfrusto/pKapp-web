# Switch binario en las cabeceras

Cambio de alcance pedido después del piloto: el control pasa de tres estados en Ajustes
a un **switch binario** en las cabeceras de `HomeScreen` y `MateriaSelectScreen`, arriba
a la derecha. Supersede lo que dicen `08-cierre.md` y `09-verificacion-visual.md` sobre
el control de tema.

## Por qué

Dos razones del usuario, en este orden:

1. **"El modo oscuro se pone automáticamente"**. Seguir al sistema es razonable en una
   app que se usa todo el día; en una de estudio que se abre a ratos, cambiar de aspecto
   sin que nadie lo pidiera se lee como un error. Default `claro`, y solo el usuario lo
   mueve.
2. **"Que se active rápidamente"**. Enterrado en Ajustes son dos toques. En la cabecera
   es uno, y está en las dos pantallas de entrada.

Exponerlo obligó a migrar las 9 pantallas en este mismo change: un switch visible con
pantallas sin migrar deja la app a medio oscurecer, que es lo que el flag existía para
evitar. Con las 9 migradas el flag perdió su función y se eliminó.

## Verificación

Posición medida en el navegador, no a ojo:

| | MateriaSelect | Home |
|---|---|---|
| Caja del switch | `x=374 y=14` | `x=366 y=14` |

En `MateriaSelectScreen` va en posición absoluta: esa pantalla no tiene fila superior y
en flujo normal empujaría el logo, que se verificó intacto en `y=24` con sus 240×90. El
desplazamiento vertical es `insets.top + 13` y no `+ 8` porque en Home el switch se
centra contra la píldora de "Cambiar materia", que es más alta; sin ese ajuste saltaba
5 px justo en la transición más frecuente de la app.

Comportamiento, con el sistema operativo en oscuro durante toda la prueba:

| Escenario | Resultado | Esperado |
|---|---|---|
| Primera visita, sistema en oscuro | claro | claro |
| El sistema cambia con la app abierta | claro | claro |
| El usuario enciende el switch | `dark` | `dark` |
| El sistema pasa a claro | `dark` | `dark` |
| Preferencia guardada `"sistema"`, ya inválida | claro, sin error | claro |
| Estado compartido entre pantallas | el switch de Home aparece marcado tras encenderlo en materias | — |
| Persistencia tras recargar | `{"tema":"oscuro"}` | — |

Cero errores de consola.

La quinta fila importa: `"sistema"` fue un valor válido en una versión intermedia de
este change. Un perfil que lo tenga guardado cae al default en vez de romper, que es lo
que exige el requisito de persistencia.
