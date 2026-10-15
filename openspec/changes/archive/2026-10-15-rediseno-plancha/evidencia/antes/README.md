# Capturas "antes" (tarea 0.2)

Línea base de la app actual para comparar con el rediseño Plancha.

| Dato | Valor |
|---|---|
| Fuente | rama `main`, commit `a08ed80` |
| Versión | 1.7.1 (package.json y app.json) |
| Fecha | 2026-10-10 |
| Build | `npm run build:web` en `pKapp-worktrees/main` |
| Total | 60 PNG = 6 pantallas × 5 anchos × 2 temas |
| Escala | 2× (anchos CSS 320, 360, 390, 768, 1280; alto CSS 691) |

Nombres: `<pantalla>-<ancho>-<tema>.png` (tema: `claro` u `oscuro`).

Pantallas: `01-materia-select`, `02-home`, `03-topic-select`, `04-quiz`, `05-results`, `06-stats`.

## Comando

Script de capturas de la tarea 2.4 (aún sin commitear), copiado fuera del repo y
apuntado al `dist/` y `src/` de `main`:

```sh
for t in claro oscuro; do
  node scripts/capturar-screenshots.js --tema $t --ancho 320,360,390,768,1280 \
    --salida openspec/changes/rediseno-plancha/evidencia/antes
done
```

Tema oscuro verificado: el script exige la clase `dark` en `<html>` antes de capturar.
