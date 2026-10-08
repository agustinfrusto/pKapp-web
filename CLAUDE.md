# pKapp — protocolo de agentes

Contexto del proyecto e invariantes: `openspec/config.yaml`. Contrato de roles completo:
`openspec/workers.md`. Este archivo es el resumen operativo que carga cada sesión.

## Estilo de salida (todos los roles)

Sin cortesías, preámbulos ni resúmenes conversacionales. Información densa: tablas,
listas, código o diffs.

## Roles

| Rol | Definición | Modelo | Effort | Entrega |
|---|---|---|---|---|
| Ingeniero Arquitecto | `.claude/agents/ingeniero.md` | `opus` | `high` | specs, contratos, invariantes |
| Diseñador UI/UX | `.claude/agents/disenador.md` | `sonnet` | `max` | layouts, tokens, matrices de estados |
| Programador Ejecutor | `.claude/agents/programador.md` | `sonnet` | `low` | código test-first, diffs |
| Investigador | `.claude/agents/investigador.md` | `sonnet` | `high` | validación ciega y explicaciones |
| Auditor y Committer | `.claude/agents/auditor.md` | `haiku` | `low` | revisión del diff en staging y commit |

`opus`, `sonnet` y `haiku` son alias del CLI de Claude Code que siempre apuntan a la última
versión de cada familia. En Orca se usan IDs explícitos (`claude-sonnet-5-5`, etc.): Orca no
resuelve los alias a la última versión.

## Invocación

Cada unidad de trabajo arranca en un proceso nuevo, con el contexto limpio:

```sh
claude --agent ingeniero   --model opus   --effort high
claude --agent disenador   --model sonnet --effort max
claude --agent programador --model sonnet --effort low
claude --agent investigador --model sonnet --effort high
claude --agent auditor     --model haiku  --effort low
```

Sin sesión interactiva, con la spec como entrada:

```sh
claude -p --agent programador --model sonnet --effort low "$(< .orca/specs/<tarea>.md)"
```

Despachado desde Orca (ver `openspec/workers.md`), el rol se carga desde la spec:

```sh
orca orchestration worker-start --agent claude --model claude-sonnet-5-5 --effort low \
  --worktree current --spec "$(< .orca/specs/<tarea>.md)" --json
```

## Pipeline con compuertas

```
Ingeniero ──spec──▶ Programador ──compuerta local en verde──▶ Auditor ──commit──▶ /clear
                          │                                       │
                          └── spec imposible o contradictoria ────┴──▶ Ingeniero (excepción)
```

1. **Spec:** el Ingeniero escribe la Open Spec con su aceptación observable.
2. **Implementación:** el Programador escribe el test, lo ve fallar, implementa y corre la
   compuerta del área. Sin compuerta en verde, la entrega no es elegible para revisión.
   - `tools/ingesta/**` → `python3 tools/ingesta/pruebas/correr_pruebas.py`
   - `src/**`, `App.js`, `scripts/**` → `npm run build:web && npm run e2e`
3. **Commit:** el Auditor revisa el diff en staging y commitea, solo cuando el operador lo
   ordena. El push también requiere una orden explícita.
4. **Excepciones:** el Ingeniero interviene solo si la spec no se puede cumplir tal como
   está escrita. Un bug vuelve al Programador.

## Fin de tarea

Al cerrar cualquier unidad (spec entregada, implementación entregada o commit hecho), el
rol termina con `FIN · ejecutar /clear` y el operador ejecuta `/clear` antes de la
siguiente unidad. Ninguna sesión arrastra historial a la próxima tarea.

## Memoria (Engram)

- Solo el Ingeniero escribe, y solo tres cosas: decisiones de arquitectura irreversibles,
  invariantes de negocio y contratos de API, y convenciones globales del proyecto.
- Cada entrada tiene 2 o 3 oraciones como máximo.
- Nunca código, logs de terminal ni resultados de tests.
- El Programador lee, sin escribir. El Diseñador, el Investigador y el Auditor no tienen acceso.

## Reglas que no cambian

- Commit y push solo con orden explícita del operador.
- Lo estético lo decide el Diseñador. El Ingeniero audita que cumpla el brief, no el gusto.
- El rediseño vive en la rama `rediseno`, y se mergea a `main` solo consolidado y con
  orden del operador.
- Cada `questions.js` conserva su encabezado legal.
