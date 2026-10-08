# Contrato de workers (Orca orchestration)

Este documento lo lee **el Ingeniero**, no los workers. Un worker nunca abre este
archivo: recibe todo lo que necesita en su propia spec. Esa es la regla de oro del
gasto — un worker que tiene que explorar el repo para entender su tarea ya salió caro.

Guía viva del CLI: `orca skills get orchestration`. No documentar acá comandos que esa
guía no respalde.

---

## Los cuatro roles

| Rol | Agente | Modelo | Effort | Puede editar |
|---|---|---|---|---|
| **Ingeniero** | esta sesión (coordinador) | Opus | — | todo; único que commitea |
| **Investigador** | `claude` | Sonnet | `high` | `tools/ingesta/salidas/**` |
| **Diseñador** | `claude` | Sonnet | `medium` | `src/screens/**`, `src/components/**`, `src/theme/**`, `src/assets/**` |
| **Programador** | `claude` | Sonnet | `low` | lo que su spec nombre, nada más |

**Siempre la última versión de cada familia.** IDs vigentes: Opus `claude-opus-5-5`,
Sonnet `claude-sonnet-5-5`, Haiku `claude-haiku-5-5`. Cuando salga una versión nueva se
actualiza esta línea y nada más. No se usa el alias `sonnet`: el `--model` de Orca pasa IDs
opacos al proveedor y no está verificado que resuelva alias.

`antigravity` reemplaza al agente de Investigador o Programador **solo cuando el usuario lo
pide**. El Ingeniero es siempre Claude Code en Opus y nunca se delega.

Criterio detrás de cada elección:

- **Investigador en Sonnet con effort alto**: es el rol de mayor volumen (una explicación
  por pregunta) y el de mayor consecuencia, porque las explicaciones se estudian como
  verdad médica. Sonnet alto cubre el volumen con calidad; **la cola que `validar` marque
  en `explicaciones-dudosas.jsonl` la audita el Ingeniero en Opus**. Así la calidad de
  Opus cae donde está el riesgo real, no sobre cada pregunta.
- **Diseñador en Sonnet medio**: criterio visual acotado a una pantalla por tarea.

**Las decisiones estéticas son del Diseñador**: imágenes, íconos, colores, tipografía,
espaciado y jerarquía visual. El Ingeniero no las toma ni las anticipa en una spec:
deja el objetivo y las restricciones técnicas (tamaño, peso, contraste, tokens
existentes), y el Diseñador decide y justifica en su reporte.
- **Programador en Sonnet bajo**: trabaja con spec en mano y sin decisiones de diseño. Para
  lo puramente mecánico (renombrar, mover, aplicar un patrón ya documentado) baja a Haiku.

La extracción **no es un rol**. `tools/ingesta/extraer.py` es código determinista: lo corre
el Ingeniero como acción acotada y tria `abortados.jsonl`. Si un PDF necesita una vía de
parseo que el script no tiene, eso es una tarea de Programador.

> Niveles de effort: `low`, `medium`, `high`, `xhigh`, `max`. En Sonnet 5.5 están
> recalibrados respecto de Sonnet 5. Orca los pasa tal cual (primera prueba:
> `claude-sonnet-5-5` + `low`, requested = effective). `--effort` exige `--model`.

---

## Reutilizar terminales: solo entre tareas seguidas

`--model` y `--effort` **no se combinan con `--terminal`**: el modelo queda fijado al nacer
la terminal. Y Orca solo admite reusar una terminal para un dispatch **inmediatamente
siguiente**; `worker-retain` no sirve para mantener roles vivos, porque es una excepción
que pide el usuario para debugging.

Por eso la palanca de ahorro, que es el contexto caliente, se obtiene **agrupando**: las
tareas del mismo rol se encolan una detrás de otra y comparten la terminal. Un Investigador
que procesa cinco lotes seguidos en la misma terminal no relee cinco veces la guía de
estilo, el mapa de TOPICS ni el esquema de pregunta. Al planificar, el Ingeniero ordena las
tareas por rol siempre que las dependencias lo permitan.

Después de cada `worker_done` aceptado, exactamente una de estas:

1. Reusar la misma terminal (`worker-start --terminal <handle>`) si la tarea siguiente es
   del mismo rol y ya está lista.
2. `worker-release` en cualquier otro caso.
3. `worker-retain` solo si el usuario lo pide.

Liberar es limpieza post-settlement, nunca cancelación, y solo un settlement aceptado la
autoriza. Si Orca detecta interacción humana en la terminal, el release responde
`retained / user_takeover` y no la cierra: queda abierta para que el usuario la cierre.

---

## Secuencial, siempre

Nunca hay dos Dispatches vivos a la vez. El Ingeniero despacha uno, espera su settlement,
lo procesa, y recién entonces despacha el siguiente.

Esto no es sobre todo un ahorro de tokens (dos workers cuestan casi lo mismo en fila que en
paralelo, cada uno paga su propio contexto igual). Se hace porque la cadena del proyecto es
genuinamente secuencial —la extracción produce lo que consume el Investigador, y lo que él
entrega lo integra el Programador— y porque el Ingeniero sostiene un solo hilo en su
contexto en vez de tres.

---

## Anatomía de una spec

Toda spec de tarea es autocontenida y nombra las cinco cosas. Sin esto el worker explora, y
explorar es el gasto que estamos tratando de evitar.

- **Objetivo**: los archivos, componente o entorno en alcance.
- **Cambio**: el resultado concreto a producir.
- **Restricciones**: invariantes, reglas de compatibilidad y qué no tocar.
- **Propiedad**: qué puede editar este worker y dónde está el límite con otros.
- **Aceptación observable**: el test, salida o evidencia que prueba que terminó.

Toda spec hereda además los invariantes de `openspec/config.yaml` —todo local, sin cuentas,
gratis siempre— y la regla de que el encabezado legal de cada `questions.js` no se toca.

Tamaño: una tarea por spec. Si una spec necesita la palabra "y" para describir su cambio,
son dos tareas.

---

## Pulses

El Ingeniero tiene que estar al tanto sin pagar por estarlo. Cuatro señales distintas, que
no hay que confundir:

| Qué | Cómo | Qué prueba |
|---|---|---|
| Vivo | `--type heartbeat`, a la cadencia del preámbulo | que el proceso respira, **nada más** |
| Avanzando | `--type status --phase "<etapa n/total>"` | progreso, en una línea |
| Terminado | `--type worker_done` con `--outcome` | el resultado |
| Trabado | `--type escalation` o `--type question` | que necesita una decisión |

Un heartbeat **no** es un pulse de progreso: prueba liveness y nada más. El pulse de
progreso real es `--phase`, que cabe en una línea y no arrastra contexto.

En el inbox, `phase`, `outcome`, `filesModified` y `reportPath` viajan dentro de `payload`,
que es un **string JSON**: hay que parsearlo. Un worker puede saltearse pulses de fase e ir
directo al `worker_done`; si el seguimiento por fase importa, la spec tiene que marcarlo
como obligatorio.

La regla que mantiene esto barato: **el detalle va a un archivo, no al inbox.** El worker
escribe su reporte y lo apunta con `--report-path`; en el `worker_done` manda tres oraciones.
El Ingeniero lee el reporte completo solo si las tres oraciones no alcanzan.

Los reportes van a `.orca/reports/<tarea>.md`, que está gitignoreado: son registro de
trabajo, no parte del proyecto.

El Ingeniero espera con:

```
orca orchestration check --wait --types "worker_done,escalation,question" --timeout-ms 900000 --json
```

Un timeout o un resultado vacío es un checkpoint, no un fallo. Nunca se interpreta ausencia
como que el worker murió: solo prueba positiva de salida autoriza `worker-stop` o
`worker-abandon`. Tras tres esperas vacías, enumerar con `worker-list --include-remote --json`
y actuar sobre el `projection.nextAction` literal de cada fila.

---

## Lo que solo hace el Ingeniero

- Escribir y reescribir las specs.
- Correr el pipeline de ingesta (`extraer`, `enriquecer`, `validar`, `emitir`) y triar sus
  salidas.
- Auditar el código y el contenido que entregan los workers.
- Auditar la cola de `explicaciones-dudosas.jsonl` en Opus.
- **Commitear y pushear, y solo cuando el usuario lo pide explícitamente.**
- Decidir modelo y effort de cada tarea.

Ningún worker commitea. Ningún worker pushea. Un worker que cree que su trabajo está listo
manda `worker_done` y se queda quieto.

---

## Arranque de un ciclo

```
orca orchestration run-create --objective "<objetivo>" --json
orca orchestration worker-start --spec "<spec autocontenida>" --worktree current \
  --agent claude --model <id> --effort <nivel> --json
orca orchestration check --wait --types "worker_done,escalation,question" --timeout-ms 900000 --json
```

`worker-start` devuelve `consumer_fenced` si la terminal que lo invoca no es la coordinadora
ligada al Run. El `run-create` sale de la terminal del Ingeniero, y esa terminal queda
coordinadora por el resto del ciclo.

---

## A futuro: preguntas con imagen

No está planificado todavía. Cuando se encare, el punto de partida es este: hoy
`tools/ingesta/extraer.py` no extrae imágenes (sus seis funciones son texto y anotaciones)
y el esquema de pregunta no tiene campo de imagen. Hará falta extracción de imágenes, una
convención de identificador imagen↔pregunta y el campo en el esquema y en la UI del quiz.
