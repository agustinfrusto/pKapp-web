# Migración a Cloudflare Pages

Pasos para migrar el deploy de Vercel a Cloudflare Pages cuando estés listo.

## Pre-requisitos

- Cuenta en [Cloudflare](https://dash.cloudflare.com) (gratuita)
- Repo `pKapp-web` en GitHub
- Acceso al panel DNS de `pkapp.uy` (HLW)

## Pasos

### 1. Crear el proyecto en Cloudflare Pages

1. Dashboard de Cloudflare → **Pages** → **Create a project** → **Connect to Git**
2. Autorizar acceso a GitHub y elegir `pKapp-web`
3. Configurar build:
   - **Framework preset:** None
   - **Build command:** `npx expo export --platform web && node scripts/inject-pwa.js`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (default)
4. Click **Save and Deploy**
5. En ~2 min tu app está en `pkapp-web.pages.dev`

> Los archivos `public/_redirects` y `public/_headers` ya están listos
> en el repo. Cloudflare los detecta automáticamente y aplica SPA fallback
> + security headers (equivalentes a los que teníamos en `vercel.json`).

### 2. (Opcional pero recomendado) Cloudflare Web Analytics

1. Cloudflare Dashboard → **Analytics & Logs** → **Web Analytics** → **Add a site**
2. Poner `pkapp.uy` (o `pkapp-web.pages.dev` para probar)
3. Te da un **token** (formato hex de ~32 caracteres)
4. En el proyecto de Pages → **Settings** → **Environment variables** → agregar:
   - `CF_ANALYTICS_TOKEN` = `<tu token>`
5. Trigger un nuevo deploy → el script `inject-pwa.js` lo inyecta automáticamente

### 3. Probar en `pkapp-web.pages.dev`

- Verificar que carga
- Verificar que el SPA routing funciona (deep links)
- Verificar que el manifest PWA y los íconos cargan
- Verificar que los headers de seguridad están presentes (DevTools → Network → cualquier request → Response Headers)
- Verificar que Cloudflare Analytics empieza a contar

### 4. Cambiar el DNS de `pkapp.uy`

**Opción A — Sin tocar nameservers (más simple)**

En el panel de HLW → DNS Manager → editar la zona `pkapp.uy`:

- **Cambiar el A record:**
  - Borrar el A actual (`pkapp.uy. → 76.76.21.21`)
  - Agregar un CNAME: `pkapp.uy. → pkapp-web.pages.dev`
  - (Si el panel no permite CNAME en raíz, usar A apuntando a IPs de Cloudflare. Cloudflare te las muestra al agregar el dominio en Pages.)
- **El CNAME de www** ya apunta a `cname.vercel-dns.com`: cambiarlo a `pkapp-web.pages.dev`

**Opción B — Mover nameservers a Cloudflare (mejor, pero HLW da problemas)**

Solo intentar si la opción A no funciona. Cloudflare te muestra nameservers tipo:
- `gabi.ns.cloudflare.com`
- `tom.ns.cloudflare.com`

En HLW → Nameservers → poner esos dos.

### 5. Agregar el dominio en Cloudflare Pages

En tu proyecto de Pages → **Custom domains** → **Set up a custom domain**:
- Poner `pkapp.uy`
- Cloudflare verifica el DNS
- Emite certificado HTTPS automáticamente (~5 min)

Repetir para `www.pkapp.uy` si querés que también responda.

### 6. Verificar todo

- `https://pkapp.uy` carga
- HTTPS válido (candadito verde)
- Stats existentes siguen ahí (mismo dominio = mismo localStorage)
- Cloudflare Analytics empieza a contar visitantes

### 7. Limpiar Vercel

- En Vercel → proyecto → **Settings** → **Domains** → quitar `pkapp.uy`
- Dejar `pkapp-web.vercel.app` activo unas semanas más por si hay usuarios antiguos
- Cuando ya no haya tráfico significativo, podés borrar el proyecto

## Comparación de equivalencias

| Vercel | Cloudflare Pages |
|--------|------------------|
| `vercel.json` rewrites | `public/_redirects` |
| `vercel.json` headers | `public/_headers` |
| `@vercel/analytics` | `CF_ANALYTICS_TOKEN` env var |
| Settings → Domains | Pages → Custom domains |
| Settings → Environment Variables | Pages → Settings → Environment variables |
| Auto preview deploys por PR | Mismo (auto preview en Pages) |
| Auto deploy en push a main | Mismo |

## Lo que NO se migra automáticamente

- **Vercel Analytics histórico**: se queda en el dashboard de Vercel, no se transfiere. Cloudflare empieza desde cero.
- **`@vercel/analytics`** sigue en `package.json`. Al final de la migración se puede desinstalar:
  ```bash
  npm uninstall @vercel/analytics
  ```
  Y eliminar `src/components/Analytics.web.js` (o dejarlo vacío).

## Rollback

Si algo sale mal:
1. Cambiar el DNS de `pkapp.uy` de vuelta a `76.76.21.21` (Vercel)
2. Re-agregar el dominio en Vercel → Settings → Domains
3. Esperar propagación (~15 min)
4. Listo
