// Inyecta los meta tags PWA en dist/index.html después del build de Expo Web.
// También copia los archivos de public/ al output.
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', process.env.PKAPP_DIST || 'dist');
const PUBLIC = path.resolve(__dirname, '..', 'public');
const indexHtml = path.join(DIST, 'index.html');

// El theme-color inicial es claro.fondo (tokens.md a.2): la app arranca en claro; en ejecución App.js lo cambia con el tema.
const { plancha } = require('../src/theme/colores');

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

// Con public/favicon.ico presente, Expo no declara link al .ico y copia el nuestro a dist/. Si
// Expo volviera a declarar <link rel="icon" href="/favicon.ico"> (sin sizes), se quita aquí: es
// defensa. El nuestro lleva sizes="16x16 32x32 48x48" detrás del href, no lo toca la regex y no
// cuenta como link ajeno, así que una segunda corrida sobre el mismo dist/ es idempotente.
html = html.replace(/<link\s+rel="icon"\s+href="\/favicon\.ico"\s*\/?>/g, '');
const esLinkAjeno = (tag) => !/sizes="16x16 32x32 48x48"/.test(tag);
if ((html.match(/<link[^>]*href="\/favicon\.ico"[^>]*>/g) || []).some(esLinkAjeno)) {
  console.error('inject-pwa: el index.html de Expo declara /favicon.ico de otra forma; actualizá la regex.');
  process.exit(1);
}

const pwaTags = `
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="${plancha.claro.fondo}">
    <style>html{background-color:${plancha.claro.fondo};color-scheme:light}html.dark{background-color:${plancha.oscuro.fondo};color-scheme:dark}</style>
    <link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="pKapp">
    <meta name="mobile-web-app-capable" content="yes">`;

if (!html.includes('rel="manifest"')) {
  // Expo ya emite un theme-color (web.themeColor de app.json): se quita para que quede UNA
  // sola, la inyectada, que es la que App.js actualiza en ejecución.
  html = html.replace(/<meta\s+name="theme-color"[^>]*>\s*/g, '');
  html = html.replace('</head>', `${pwaTags}\n  </head>`);
  console.log('  PWA tags inyectados en index.html');
} else {
  console.log('  PWA tags ya presentes, skip.');
}

// 2.6 Salida del navegador interno de Instagram/Facebook. Script en línea,
// antes del bundle: si el user agent es de esos navegadores, intenta abrir la
// misma URL en el navegador del dispositivo y, si la página sigue visible a
// los 1,5 s, muestra un aviso de respaldo. La redirección automática ocurre
// una sola vez por sesión y solo si la marca en sessionStorage quedó guardada
// (se relee tras escribirla): con el storage inutilizable no hay redirección,
// solo el aviso. «Abrir en tu navegador» solo existe donde hay un mecanismo
// para abrir afuera (Android, Instagram en iOS).
//
// AVISO es el único bloque a reemplazar cuando el Diseñador entregue el aviso
// final: textos y CSS. La lógica usa #pkapp-salir, los <button> de su interior
// (el de cierre lleva aria-label="Cerrar") y un <input> con el link de respaldo.
const AVISO = {
  titulo: 'Abrí pKapp en tu navegador',
  abrir: 'Abrir en tu navegador',
  copiar: 'Copiar link',
  copiado: 'Link copiado',
  aMano: 'Copialo a mano',
  manual: '⋯ → Abrir en el navegador externo',
  cerrar: 'Cerrar',
  css:
    '#pkapp-salir{position:fixed;left:0;right:0;bottom:0;z-index:2147483647;box-sizing:border-box;padding:16px;' +
    'background:#f4f5f6;color:#14181d;border-top:1px solid #14181d;' +
    'font:16px/1.4 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '#pkapp-salir:focus{outline:0}' +
    '#pkapp-salir *{box-sizing:border-box;margin:0;border-radius:0;box-shadow:none}' +
    '#pkapp-salir p{margin:0 0 8px}#pkapp-salir .t{font-weight:700}' +
    '#pkapp-salir .f{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}' +
    '#pkapp-salir input{display:block;width:100%;min-height:44px;margin:0 0 8px;padding:0 8px;font:inherit;' +
    'color:inherit;background:transparent;border:1px solid currentColor}' +
    '#pkapp-salir input[hidden]{display:none}' +
    '#pkapp-salir button{min-width:44px;min-height:44px;padding:0 16px;font:inherit;cursor:pointer;' +
    'background:transparent;color:#0b6e80;border:1px solid #0b6e80}' +
    '#pkapp-salir button.p{background:#0b6e80;color:#f4f5f6}' +
    '#pkapp-salir button.x{position:absolute;top:4px;right:4px;width:44px;padding:0;border:0;color:#14181d}' +
    '@media (prefers-color-scheme:dark){#pkapp-salir{background:#0b0d10;color:#e6e9ed;border-top-color:#e6e9ed}' +
    '#pkapp-salir button{color:#5cc3d6;border-color:#5cc3d6}' +
    '#pkapp-salir button.p{background:#5cc3d6;color:#0b0d10}#pkapp-salir button.x{color:#e6e9ed}}',
};

const SALIR_SCRIPT = `(function(){try{
var ua=navigator.userAgent;
if(!/Instagram|FBAN|FBAV|FB_IAB/.test(ua))return;
var A=${JSON.stringify(AVISO)};
var and=/Android/.test(ua),ios=/iPhone|iPad|iPod/.test(ua)&&/Instagram/.test(ua);
function get(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function set(k){try{sessionStorage.setItem(k,'1');return sessionStorage.getItem(k)==='1'}catch(e){return false}}
function salir(){var E=encodeURIComponent(location.href);
if(and)location.href='intent://'+location.host+location.pathname+location.search+'#Intent;scheme=https;S.browser_fallback_url='+E+';end';
else if(ios)location.href='instagram://extbrowser/?url='+E}
function mk(t,c,x,f){var b=document.createElement(t);if(c)b.className=c;b.textContent=x||'';if(f)b.onclick=f;return b}
function aviso(){
if(get('pkapp-salir-cerrado')||document.getElementById('pkapp-salir'))return;
var prev=document.activeElement,d=document.createElement('div'),s=document.createElement('style');
d.id='pkapp-salir';d.setAttribute('role','dialog');d.setAttribute('aria-labelledby','pkapp-salir-t');d.tabIndex=-1;
s.textContent=A.css;d.appendChild(s);
var t=mk('p','t',A.titulo);t.id='pkapp-salir-t';d.appendChild(t);
var f=mk('div','f'),st=mk('p');st.setAttribute('role','status');
var li=document.createElement('input');li.readOnly=true;li.hidden=true;li.setAttribute('aria-label',A.copiar);
function ok(){li.hidden=true;st.textContent=A.copiado}
function no(){st.textContent=A.aMano;li.value=location.href;li.hidden=false;li.focus();li.select()}
function leg(){li.value=location.href;li.hidden=false;li.select();var r=false;try{r=document.execCommand('copy')}catch(e){}r?ok():no()}
function esc(e){if(e.key==='Escape')cerrar()}
function cerrar(){set('pkapp-salir-cerrado');document.removeEventListener('keydown',esc);
if(d.parentNode)d.parentNode.removeChild(d);if(prev&&prev.focus)try{prev.focus()}catch(e){}}
if(and||ios)f.appendChild(mk('button','p',A.abrir,salir));
f.appendChild(mk('button','',A.copiar,function(){var c=navigator.clipboard;
if(c&&c.writeText)c.writeText(location.href).then(ok,leg);else leg()}));
d.appendChild(f);d.appendChild(st);d.appendChild(li);d.appendChild(mk('p','',A.manual));
var x=mk('button','x','✕',cerrar);x.setAttribute('aria-label',A.cerrar);d.appendChild(x);
document.addEventListener('keydown',esc);document.body.appendChild(d);d.focus()}
if(!get('pkapp-salir')&&set('pkapp-salir'))salir();
setTimeout(function(){try{
if(document.visibilityState!=='visible')return;
if(document.body)aviso();else document.addEventListener('DOMContentLoaded',aviso)}catch(e){}},1500);
}catch(e){}})();`;

const salirTag = `
    <script>${SALIR_SCRIPT}</script>`;

if (!html.includes('id="pkapp-salir"') && !html.includes('pkapp-salir-cerrado')) {
  html = html.replace('</head>', `${salirTag}\n  </head>`);
}

// 3 y 4. Analítica: solo en el build de producción de Cloudflare Pages
// (CF_PAGES_BRANCH === 'main'). Previews de otras ramas y builds locales no
// inyectan Umami ni el beacon, para no contar visitas que no son de producción.
const rama = process.env.CF_PAGES_BRANCH;
const esProduccion = rama === 'main';

if (!esProduccion) {
  console.log(`  analítica omitida: ${rama ? `rama ${rama}` : 'build local'}`);
} else {
  // 3. (Opcional) Cloudflare Web Analytics
  // Para activarlo en Cloudflare Pages: Settings, Environment variables,
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

  // 4. Umami (analítica de eventos, sin cookies). El website-id es público.
  const UMAMI_SRC = 'https://cloud.umami.is/script.js';
  const UMAMI_WEBSITE_ID = '6dcfe8fe-3b80-48dc-a324-57ccc4fa9bae';
  if (!html.includes('data-website-id')) {
    const umamiTag = `    <script defer src="${UMAMI_SRC}" data-website-id="${UMAMI_WEBSITE_ID}"></script>`;
    html = html.replace('</head>', `${umamiTag}\n  </head>`);
    console.log('  Umami analytics inyectado.');
  } else {
    console.log('  Umami analytics ya presente, skip.');
  }
}

fs.writeFileSync(indexHtml, html);

console.log('PWA post-build OK');
