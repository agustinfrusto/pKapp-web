# Peso del build (tareas 4.x y 6.4)

## Mediciones

| Momento | `dist/` crudo | Δ crudo | Transferido (gzip) | Δ gzip |
|---|---|---|---|---|
| Línea de base | 2.026.728 | — | 368.956 | — |
| Integración, 0 pantallas migradas | 2.105.696 | +3,90% | — | — |
| Piloto, 3 superficies migradas | 2.108.938 | **+4,06%** | 388.701 | **+5,35%** |

Presupuesto D8: +3% sobre el crudo = 2.087.529 bytes. **Excedido por 21.409 bytes.**

## Qué dicen los números

El costo es **fijo, de runtime, y no lo causa la migración**: con cero pantallas
migradas el build ya estaba +3,90%. Migrar las tres superficies del piloto solo sumó
3.242 bytes más, porque el CSS emitido creció (7,4 KB → 12,5 KB) casi lo mismo que
encogió el JS al borrar los `StyleSheet`.

Los +82 KB crudos son, casi enteros, el runtime de `react-native-css-interop` más los
enganches de Reanimated que arrastra. Eso no se recupera migrando más pantallas: al
contrario, cada pantalla nueva suma CSS.

La medición comprimida es la que importa para lo que viaja por la red, y ahí el costo
real son **+19,7 KB gzip**. En porcentaje se ve peor (+5,35%) porque el crudo está
diluido por ~600 KB de PNG que no comprimen; en bytes absolutos es bastante menos de
lo que sugiere el número crudo.

## Extrapolación a las 6 pantallas restantes

El JS no va a crecer más —el runtime ya está pago— pero el CSS sí: las tres
superficies del piloto generaron 12,5 KB crudos / 3,0 KB gzip. Seis pantallas más,
varias bastante más grandes, probablemente lleven el CSS a unos 25-30 KB crudos
(6-8 KB gzip). El total quedaría cerca de **+100 KB crudos / +25 KB gzip**.

El presupuesto del 3% no se alcanza por ninguna vía que conserve NativeWind.

## Presupuesto revisado

El presupuesto original (+3% crudo) quedó excedido por 21.409 bytes. Decisión del
usuario: subirlo. D8 se revisó a **+30 KB gzip** sobre la línea de base de 368.956,
con el crudo como control secundario por debajo de +5%.

| Métrica | Presupuesto | Piloto | Margen |
|---|---|---|---|
| gzip | +30.000 | +19.745 | 10.255 bytes |
| crudo | +5% (2.128.064) | 2.108.938 (+4,06%) | 19.126 bytes |

El margen de 10 KB gzip es, según la extrapolación de arriba, aproximadamente lo que
va a costar el CSS de las 6 pantallas restantes. El presupuesto sigue siendo capaz de
bloquear: si esa extrapolación falla, se nota.
