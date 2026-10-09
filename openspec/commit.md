# Procedimiento de commit y push

Lo ejecuta el Ingeniero. Reemplaza al antiguo rol de Auditor y Committer, con los mismos
parámetros.

## Entrada

La lista de archivos de la entrega (`files-modified` del Programador o del Diseñador, más
las specs y docs del propio Ingeniero que correspondan a esa unidad) y la orden explícita
del operador de commitear. Sin orden, no hay commit. El push requiere su propia orden
explícita en el mismo pedido.

## Pasos

1. `git add <cada archivo de la lista>`. Nunca `git add -A` ni `git add .`.
2. `git diff --cached --stat` y `git diff --cached`.
3. Rechazar si aparece alguno de estos:
   - logs de depuración agregados: `console.log`, `debugger`, `print(`. Excepción: en
     `tools/ingesta/**` los `print(` son salida operativa y no se rechazan; en el resto del
     repo, un `print(` o `console.log` agregado se rechaza;
   - error de sintaxis: `python3 -m py_compile <archivo.py>`; para todo `.js`, sin importar
     su carpeta (el parser Babel acepta también JS plano), con la ruta como argumento y
     nunca dentro del código: `node -e "require('@babel/parser').parse(require('fs').readFileSync(process.argv[1],'utf8'),{sourceType:'unambiguous',plugins:['jsx','flow']})" -- "<archivo>"`.
     No usar `node --check` (no entiende JSX). Si el comando falla con `MODULE_NOT_FOUND`
     (o `@babel/parser` no resuelve), es un fallo de herramienta, no un error de sintaxis:
     no rechazar ni desstagear el archivo; reportar `FALLO DE HERRAMIENTA: @babel/parser`
     y detenerse. Solo un `SyntaxError` del parser cuenta como error de sintaxis: cualquier
     otra salida distinta de cero es un fallo de herramienta; se reporta
     `FALLO DE HERRAMIENTA: <comando>` y se detiene, sin rechazar. Los archivos borrados en
     staging (estado `D` en `git diff --cached --name-status`) no pasan por el chequeo de
     sintaxis;
   - archivos fuera de la lista, secretos o `.env`;
   - un `questions.js` sin su encabezado legal.
   Al rechazar: `git restore --staged <archivos>`, el motivo en una línea, y la entrega
   vuelve a su autor.
4. Versión. Solo si la lista toca la app que se publica: `src/**`, `public/**`,
   `scripts/**`, `App.js`, `index.js`, `app.json`, `package.json`, `package-lock.json`,
   `babel.config.js`, `metro.config.js`, `tailwind.config.js` o `global.css`. Si toca
   solo `tools/**`, `openspec/**`, `.claude/**`, `.github/**`, `docs/**` o archivos de
   texto de la raíz (README, CLAUDE.md, licencias), no se bumpea: pasá al paso 5.
   a) Base: `git describe --tags --abbrev=0` (por ejemplo `v1.5.5`). Si no coincide con
      el `version` de `package.json` y de `app.json`, detenete con
      `RECHAZO: versión desfasada (<tag> / <package.json> / <app.json>)` y desstageá.
   b) Pendientes: este commit más `git log --format=%s <tag>..HEAD -- <rutas de la app>`.
      Si alguno es `feat` → minor (x.Y+1.0); si no → patch (x.y.Z+1). Un breaking change
      (`!` o `BREAKING CHANGE`) → major, y antes de commitear se pregunta al operador.
   c) `npm version <X.Y.Z> --no-git-tag-version` (edita package.json y
      package-lock.json), y para app.json, con la versión como argumento:
      `node -e "const f='app.json',fs=require('fs'),j=JSON.parse(fs.readFileSync(f,'utf8'));j.expo.version=process.argv[1];fs.writeFileSync(f,JSON.stringify(j,null,2)+'\n')" <X.Y.Z>`.
   d) `git add package.json package-lock.json app.json`, y `git diff --cached` de esos
      tres archivos muestra solo el cambio de versión.
   e) El mensaje del paso 5 termina con ` (X.Y.Z)`, y después del commit:
      `git tag vX.Y.Z`.
5. Si pasa: `git commit -m "tipo(alcance): mensaje"`.
   - tipo: feat, fix, docs, chore, refactor, test, style.
   - alcance: área del repo (ingesta, materias, ui, pwa, deps, openspec…).
   - mensaje: en español, en minúscula, imperativo, sin punto final.
   - Sin líneas de atribución ni `Co-Authored-By`.
6. `git push` solo si el operador lo ordenó explícitamente; con el push van los tags
   creados: `git push origin vX.Y.Z`.

## Prohibido

Reescribir historia (amend, rebase, reset); mergear ramas, salvo `rediseno` → `main` con
orden del operador; cambiar de rama sin orden; mover o borrar tags; `push --force`.

## Salida

El hash del commit, su mensaje y el tag si lo hubo, o `RECHAZO: <motivo>`.
