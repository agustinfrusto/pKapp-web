# Contrato de workers

Resumen operativo en `CLAUDE.md`; definiciones de cada rol en `.claude/agents/`. Este
documento fija el porqué y el detalle de coordinación. Un worker no lo lee: recibe todo
en su spec y en su archivo de rol.

Guía viva del CLI de Orca: `orca skills get orchestration`. No documentar acá comandos que
esa guía no respalde.

---

## Los seis roles

| Rol | Archivo | Modelo | Effort | Puede editar | git |
|---|---|---|---|---|---|
| **Ingeniero Arquitecto** | `ingeniero.md` | `opus` | `high` | `openspec/**`, `CLAUDE.md`, `.claude/agents/**` | solo lectura |
| **Diseñador UI/UX** | `disenador.md` | `sonnet` | `max` | `src/screens/**`, `src/components/**`, `src/theme/**`, `src/assets/**`, `referencias-diseno/**` | ninguno |
| **Programador Ejecutor** | `programador.md` | `sonnet` | `low` | lo que su spec nombre | ninguno |
| **Investigador** | `investigador.md` | `sonnet` | `high` | la carpeta de salida del pipeline (`tools/ingesta/salidas/**`) | ninguno |
| **Analista de código** | `analista.md` | `sonnet` | `high` | solo su reporte (`.orca/reports/<tarea>-analisis.md`) | solo lectura |
| **Auditor y Committer** | `auditor.md` | `haiku` | `low` | nada | `add` de la lista, `commit`, `push` con orden |

**Siempre la última versión de cada familia.** En el CLI de `claude`, los alias `opus`,
`sonnet` y `haiku` la resuelven solos (verificado en `claude --help`, 2.1.294). **En Orca,
siempre IDs explícitos**: Orca resuelve los alias por su cuenta y no a la última versión
(con `haiku` + `--effort low` rechazó el despacho porque tomó un Haiku sin soporte de
effort). IDs vigentes: `claude-opus-5-5`, `claude-sonnet-5-5`, `claude-haiku-5-5`; cuando
salga una versión nueva, se actualiza esta línea.

`antigravity` reemplaza al Programador **solo cuando el usuario lo pide**. El Ingeniero es
siempre Claude Code en Opus.

Criterios:

- **Ingeniero en Opus, solo para lo caro de pensar:** specs, contratos, invariantes y
  excepciones de arquitectura. No escribe código ni ejecuta git que modifique el repo, y
  rechaza auditar diffs de código de más de 50 líneas: cada token de Opus va a decisiones.
- **Diseñador en Sonnet con effort `max`:** su salida son tablas de tokens y estados, pocas
  pero decisivas. **Las decisiones estéticas son suyas**: imágenes, íconos, colores,
  tipografía, espaciado y jerarquía visual. El Ingeniero fija objetivo y restricciones
  técnicas (tamaño, peso, contraste, tokens existentes), no el gusto.
- **Programador en Sonnet `low`:** implementa contra una spec que ya resolvió el diseño;
  test-first, y responde solo con código o diffs. Sube a `medium` cuando la spec lo indica
  porque el algoritmo no es mecánico (por ejemplo, la geometría del lector de rellenos).
- **Auditor en Haiku:** revisa lo que un modelo chico puede revisar bien (logs olvidados,
  sintaxis, archivos fuera de la lista, encabezados legales) y commitea. No juzga diseño ni
  arquitectura.
- **Analista en Sonnet `high`:** revisa la lógica de los diffs de más de 50 líneas, que el
  Ingeniero no audita y el Auditor no puede juzgar. Lee contra la spec: cumplimiento,
  correctitud, contratos con todos sus llamadores, calidad de los tests e invariantes.
  Reemplaza a la revisión de Gentle AI, que el operador desactivó. `high` y no `max`: la
  tarea es leer unas cientos de líneas con razonamiento de casos borde, no generar diseño;
  `medium` se queda corto para encontrar bugs no evidentes. El que encuentra no arregla:
  los bloqueantes vuelven al Programador.

- **Investigador en Sonnet `high`:** hace las etapas de modelo del pipeline (validación
  ciega y explicaciones). Es el rol de más volumen y de más consecuencia, porque las
  explicaciones se estudian como verdad médica. La cola que `validar` marca en
  `explicaciones-dudosas.jsonl` la audita el Ingeniero en Opus: la calidad de Opus cae
  donde está el riesgo, no sobre cada pregunta. La validación ciega y las explicaciones van
  en sesiones separadas, para que la ciega nunca haya visto la clave.

La extracción **no es un rol**. `tools/ingesta/extraer.py` es código determinista: lo corre
el Ingeniero como acción acotada y tria `abortados.jsonl`.

> Niveles de effort: `low`, `medium`, `high`, `xhigh`, `max`. `--effort` exige `--model`.

---

## Contexto limpio por unidad de trabajo

Cada unidad (una spec, una implementación, un commit) arranca en un proceso nuevo y
termina con `FIN · ejecutar /clear`. Ninguna sesión arrastra historial a la siguiente.

Consecuencia para Orca: **no se reusan terminales** (`--terminal`). Cada despacho es
`worker-start` con terminal nueva. Se pierde el contexto caliente entre tareas del mismo
rol, pero se gana que ninguna tarea pague por el historial de otra, y que un error de una
no contamine la próxima.

Después de cada `worker_done` aceptado: `worker-release`. `worker-retain`, solo si el
usuario lo pide. Si Orca detecta interacción humana, el release responde
`retained / user_takeover` y la terminal queda abierta para que el usuario la cierre.

`--model` y `--effort` no se combinan con `--terminal`: el modelo queda fijado al nacer la
terminal. Otra razón para no reusar.

---

## Secuencial, siempre

Nunca hay dos Dispatches vivos a la vez. El Ingeniero despacha uno, espera su settlement,
lo procesa, y recién entonces despacha el siguiente.

Esto no es sobre todo un ahorro de tokens (dos workers cuestan casi lo mismo en fila que en
paralelo, cada uno paga su propio contexto igual). Se hace porque la cadena del proyecto es
genuinamente secuencial —la spec precede a la implementación, y esta al commit— y porque el Ingeniero sostiene un solo hilo en su
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

Un Run ligado vuelve a entregar la misma Delivery hasta que se la acusa: después de
procesar sus mensajes, la espera siguiente lleva `--ack <deliveryId>`. Si no, devuelve
de nuevo el `worker_done` anterior.

Un timeout o un resultado vacío es un checkpoint, no un fallo. Nunca se interpreta ausencia
como que el worker murió: solo prueba positiva de salida autoriza `worker-stop` o
`worker-abandon`. Tras tres esperas vacías, enumerar con `worker-list --include-remote --json`
y actuar sobre el `projection.nextAction` literal de cada fila.

---

## Memoria (Engram)

- Solo el Ingeniero escribe, y solo tres cosas: decisiones de arquitectura irreversibles,
  invariantes de negocio y contratos de API, y convenciones globales del proyecto.
- Cada entrada tiene 2 o 3 oraciones como máximo.
- Nunca código, logs de terminal ni resultados de tests.
- El Programador lee, sin escribir. El Diseñador, el Investigador, el Analista y el
  Auditor no tienen acceso.

---

## Pipeline con compuertas y reparto

```
Ingeniero ──spec──▶ Programador ──compuerta en verde──▶ revisión de lógica ──▶ Auditor ──commit──▶ /clear
                          ▲                                    │                   │
                          └──────── bloqueante ────────────────┘                   │
                          └── spec imposible o contradictoria ─────────────────────┴──▶ Ingeniero (excepción)
```

**Compuerta local:** sin ella en verde, la entrega no es elegible para revisión.

**Revisión de lógica**, según el tamaño del diff de código (sin contar docs ni fixtures
generados):

| Diff | Revisa | Resultado |
|---|---|---|
| hasta 50 líneas | Ingeniero | aprobado o vuelve al Programador |
| más de 50 y hasta ~600 | Analista (`claude-sonnet-5-5`, `high`) | APROBADO, CON ADVERTENCIAS o RECHAZADO |
| más de ~600 | nadie: se parte en tandas | el Analista responde `PARTIR` |

Un RECHAZADO vuelve al Programador con el reporte. Las advertencias del Analista las
decide el Ingeniero: se arreglan antes del commit o quedan registradas como deuda. Recién
con la revisión cerrada se lanza al Auditor.

| Área tocada | Compuerta |
|---|---|
| `tools/ingesta/**` | `python3 tools/ingesta/pruebas/correr_pruebas.py` |
| `src/**`, `App.js`, `scripts/**` | `npm run build:web && npm run e2e` |
| solo docs y specs | revisión estructural del Ingeniero |

El repo no tiene tests unitarios de la app. En `src/`, el "test que falla primero" del
Programador es una comprobación del arnés e2e o del build que el cambio vuelve verde.

**Ingeniero:**
- Escribe y reescribe specs, contratos e invariantes.
- Corre el pipeline de ingesta (`extraer`, `enriquecer`, `validar`, `emitir`) y tria sus salidas.
- Coordina Orca: despacha, procesa pulses y decide modelo y effort por tarea.
- Audita contenido: claves de preguntas, la cola de `explicaciones-dudosas.jsonl` y las
  propuestas del Diseñador contra el brief, las referencias y las restricciones técnicas.
  Lo que no cumple vuelve al Diseñador con el motivo.
- Audita código solo en diffs de hasta 50 líneas; los más largos los revisa el Analista.
- Interviene en código solo por excepción de arquitectura.
- No ejecuta git que modifique el repo.

**Analista:**
- Recibe la spec, la lista de archivos y el reporte del Programador.
- Lee el diff del árbol de trabajo, nunca del staging, y no edita nada fuera de su reporte.
- El que encuentra no arregla: cada hallazgo lleva escenario concreto y evidencia.

**Auditor:**
- Recibe la lista de archivos de la entrega y la orden del operador.
- Stagea exactamente esa lista (nunca `git add -A`), revisa el diff y commitea con
  `tipo(alcance): mensaje`.
- Pushea solo con orden explícita.
- El rediseño visual se commitea en la rama `rediseno`, y el merge a `main` solo se hace
  consolidado y con orden del operador. Lo que no es diseño va a `main`.

Ningún otro rol toca git. Un worker que cree que su trabajo está listo manda
`worker_done` y se detiene.

---

## Arranque de un ciclo

```
orca orchestration run-create --objective "<objetivo>" --json
orca orchestration worker-start --spec "<spec autocontenida>" --worktree current \
  --agent claude --model <claude-opus-5-5|claude-sonnet-5-5|claude-haiku-5-5> --effort <nivel> --json
orca orchestration check --wait --types "worker_done,escalation,question" --timeout-ms 900000 --json
```

Toda spec despachada por Orca arranca con `ROL: leé .claude/agents/<rol>.md y seguí ese
contrato`: Orca lanza un `claude` genérico y no puede pasarle `--agent`.

`worker-start` devuelve `consumer_fenced` si la terminal que lo invoca no es la coordinadora
ligada al Run (con `run-use --id <run>` se vuelve a ligar). El `run-create` sale de la terminal del Ingeniero, y esa terminal queda
coordinadora por el resto del ciclo.

---

## A futuro: preguntas con imagen

No está planificado todavía. Cuando se encare, el punto de partida es este: hoy
`tools/ingesta/extraer.py` no extrae imágenes (sus seis funciones son texto y anotaciones)
y el esquema de pregunta no tiene campo de imagen. Hará falta extracción de imágenes, una
convención de identificador imagen↔pregunta y el campo en el esquema y en la UI del quiz.
