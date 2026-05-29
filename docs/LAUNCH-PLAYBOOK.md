# Playbook de lanzamiento de pkapp.uy

Plan paso a paso para el lanzamiento post-parcial BCYT (sábado).

## 📅 Sábado — día del parcial
**No tocar nada.** Estudiantes usando `pkapp-web.vercel.app` con sus stats.

## 📅 Domingo — switch a v1.0

### 1. Pushear código nuevo

```bash
git push origin main
git push --tags
```

Esto deploya automáticamente:
- Vercel → `pkapp-web.vercel.app` (con código v1.0 + banner de migración)
- Cloudflare Pages → `pkapp-web.pages.dev` (con código v1.0)

### 2. Validar que `pkapp.uy` muestre el código nuevo
- Abrir `https://pkapp.uy`
- Debe verse Materia Select con BCYT y Anatomía
- Verificar tabs, navegación, hover effects, etc.

### 3. Comunicar el lanzamiento
- Mensaje a tus canales:
  > 🎉 ¡Renovamos pKapp! Ahora con dominio propio: **pkapp.uy**
  >
  > Novedades: agregamos Anatomía, mejoras visuales, modo oscuro, timer.
  >
  > Si querías guardar tu progreso de BCYT, abrí pkapp-web.vercel.app y hacé "Exportar progreso" en Ajustes antes de pasarte. Si no, podés empezar desde cero (recomendado para Anatomía).

### 4. (Opcional) Migrar el hosting a Cloudflare Pages
Si querés bajar el bandwidth de Vercel:

- En Cloudflare → DNS → cambiar el A record:
  - **De:** `pkapp.uy` → `76.76.21.21` (Vercel)
  - **A:** `pkapp.uy` → CNAME `pkapp-web.pages.dev`
- Cambiar a Proxied (naranja) si querés CDN/WAF
- En Vercel → Settings → Domains → quitar `pkapp.uy`

## 📅 Domingo + 2 semanas — forzar migración

Los rezagados que sigan en `vercel.app` reciben redirect automático.

### Activar el redirect 301

Editar `vercel.json` y agregar la sección `redirects`:

```json
{
  "buildCommand": "npx expo export --platform web && node scripts/inject-pwa.js",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "https://pkapp.uy/$1",
      "permanent": true,
      "has": [
        {
          "type": "host",
          "value": "pkapp-web.vercel.app"
        }
      ]
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
      ]
    }
  ]
}
```

Push y se activa.

### Verificar que el redirect funciona

```bash
curl -I https://pkapp-web.vercel.app
# Debería responder:
# HTTP/2 308  (o 301)
# location: https://pkapp.uy/
```

## 📅 +1 mes — apagar Vercel (opcional)

Si ya el 99% del tráfico está en `pkapp.uy`:
- Vercel → proyecto → Settings → Delete project
- O dejarlo dormido sin auto-deploy

---

## Rollback rápido si algo se rompe

### Si el switch a Cloudflare DNS rompe pkapp.uy
- En Cloudflare → DNS → volver el A record a `76.76.21.21` (Vercel)
- Re-agregar `pkapp.uy` como custom domain en Vercel
- Propagación: ~5 min

### Si el redirect rompe vercel.app
- Editar `vercel.json` → quitar la sección `redirects`
- Push → en 1 min se desactiva

---

## Checklist mental

- [ ] Sábado: dejé todo intacto
- [ ] Domingo: pusheado a main, todo verde
- [ ] Domingo: `pkapp.uy` carga la versión nueva
- [ ] Domingo: comuniqué a usuarios
- [ ] +2 semanas: activé redirect
- [ ] +1 mes: decidí qué hacer con Vercel
