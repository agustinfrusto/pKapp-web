// Inyecta los meta tags PWA en dist/index.html después del build de Expo Web.
// También copia los archivos de public/ al output.
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const PUBLIC = path.resolve(__dirname, '..', 'public');
const indexHtml = path.join(DIST, 'index.html');

if (!fs.existsSync(indexHtml)) {
  console.error('No se encontró dist/index.html. ¿Corriste expo export antes?');
  process.exit(1);
}

// 1. Copiar archivos de public/ a dist/
if (fs.existsSync(PUBLIC)) {
  for (const file of fs.readdirSync(PUBLIC)) {
    const src = path.join(PUBLIC, file);
    const dest = path.join(DIST, file);
    fs.copyFileSync(src, dest);
    console.log(`  copy: ${file}`);
  }
}

// 2. Inyectar tags PWA en index.html
let html = fs.readFileSync(indexHtml, 'utf8');

const pwaTags = `
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#1a3f6f">
    <link rel="apple-touch-icon" href="/icon-192.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="pKapp">
    <meta name="mobile-web-app-capable" content="yes">`;

if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', `${pwaTags}\n  </head>`);
  console.log('  PWA tags inyectados en index.html');
} else {
  console.log('  PWA tags ya presentes, skip.');
}

// 3. (Opcional) Cloudflare Web Analytics
// Para activarlo en Cloudflare Pages: settings → environment variables →
// agregar CF_ANALYTICS_TOKEN con el token del beacon.
const cfToken = process.env.CF_ANALYTICS_TOKEN;
if (cfToken && !html.includes('static.cloudflareinsights.com')) {
  const cfBeacon = `
    <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${cfToken}"}'></script>`;
  html = html.replace('</body>', `${cfBeacon}\n  </body>`);
  console.log('  Cloudflare Analytics beacon inyectado.');
} else if (cfToken) {
  console.log('  Cloudflare Analytics beacon ya presente, skip.');
}

fs.writeFileSync(indexHtml, html);

console.log('PWA post-build OK');
