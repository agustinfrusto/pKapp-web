# Fuentes IBM Plex

Cuatro pesos, registrados con estos nombres (`openspec/changes/rediseno-plancha/diseno/tokens.md` b.1):

| Nombre registrado | Familia | Peso |
|---|---|---|
| `PlexSans-Regular` | IBM Plex Sans | 400 |
| `PlexSans-SemiBold` | IBM Plex Sans | 600 |
| `PlexMono-Regular` | IBM Plex Mono | 400 |
| `PlexMono-Medium` | IBM Plex Mono | 500 |

- `*.woff2` — web. Subset latin; los 4 suman ≤ 100 KB (D4). Los carga `src/theme/fuentes.web.js`.
- `OFL.txt` — licencia SIL OFL 1.1 de IBM Plex.

## Origen

Paquetes npm oficiales de IBM, del repositorio `IBM/plex`: `@ibm/plex-sans@1.1.0` y
`@ibm/plex-mono@2.5.0`, carpeta `fonts/complete/woff2/`.

## Regenerar

Requiere `pip install fonttools brotli`. Con `$SRC` apuntando al `.woff2` completo de cada peso:

```sh
# woff2 (subset latin: ASCII, Latin-1, rayas, comillas, …, ≤, ≥)
pyftsubset "$SRC" \
  --unicodes="U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026,U+2264,U+2265" \
  --flavor=woff2 --layout-features='*' --no-hinting --desubroutinize \
  --output-file=PlexSans-Regular.woff2
```

El chequeo `node tools/ui/fuentes.mjs` (enganchado a `pree2e`) valida presupuesto y cobertura.
