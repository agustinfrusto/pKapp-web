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
// los 1,5 s, muestra un aviso de respaldo SOLO dentro de Instagram (con
// Facebook «Abrir en tu navegador» no tiene mecanismo: no se pinta). La
// redirección automática ocurre una sola vez por sesión y solo si la marca en
// sessionStorage quedó guardada (se relee tras escribirla): con el storage
// inutilizable no hay redirección, solo el aviso. «Abrir en tu navegador» solo
// existe donde hay un mecanismo para abrir afuera (Android, Instagram en iOS).
//
// AVISO es la lámina Plancha de diseno/pantallas/Banners.md («Aviso de navegador
// interno», REV-6): copy, SVG de los glifos (desde src/assets/glifos.js) y CSS con
// variables. Los hex salen de `plancha` al generar el HTML; el tema oscuro cuelga
// de la clase `o` que pone SALIR_SCRIPT al leer pkapp_settings, no de
// prefers-color-scheme. La lógica usa #pkapp-salir, los <button> de su interior
// (el de cierre lleva aria-label="Cerrar") y un <input> con el link de respaldo.

// glifos.js es un módulo ES generado; se evalúa su objeto GLIFOS sin transpilar.
const GLIFOS = new Function(
  fs.readFileSync(path.resolve(__dirname, '..', 'src', 'assets', 'glifos.js'), 'utf8')
    .replace('export const GLIFOS', 'const GLIFOS') + '\nreturn GLIFOS;'
)();

// Mismo trazo que dibuja la app: ancho 1,5 u en viewBox 16, compensado por lado (CD-9).
function glifoSvg(nombre, lado) {
  const g = GLIFOS[nombre];
  if (!g || !g.elementos.every((e) => e.tipo === 'path')) {
    console.error(`inject-pwa: el glifo ${nombre} no es un conjunto de path; actualizá glifoSvg.`);
    process.exit(1);
  }
  const ancho = +(g.trazo.ancho * 16 / lado).toFixed(2);
  const trazos = g.elementos.map((e) => `<path d="${e.props.d}"/>`).join('');
  return `<svg viewBox="${g.viewBox}" width="${lado}" height="${lado}" fill="none" stroke="currentColor" ` +
    `stroke-width="${ancho}" stroke-linecap="${g.trazo.extremo}" stroke-linejoin="${g.trazo.union}" ` +
    `stroke-miterlimit="${g.trazo.limiteInglete}" aria-hidden="true" focusable="false">${trazos}</svg>`;
}

const VARIABLES_AVISO = {
  fondo: '--fo', superficie: '--su', tinta: '--ti', tintaSec: '--ts', linea: '--li',
  filete: '--fi', acento: '--ac', foco: '--fc', error: '--er',
};
const variablesAviso = (tema) => Object.keys(VARIABLES_AVISO)
  .map((token) => `${VARIABLES_AVISO[token]}:${plancha[tema][token]}`).join(';');

const SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif';
const FUENTE_400 = `"PlexSans-Regular",${SANS}`;
const FUENTE_600 = `"PlexSans-SemiBold",${SANS}`;
const FUENTE_MONO = '"PlexMono-Regular",ui-monospace,"SF Mono",Menlo,Consolas,"Roboto Mono","Courier New",monospace';

const AVISO = {
  rotulo: 'Navegador de Instagram',
  titulo: 'Abrí pKapp en tu navegador',
  explicacion: 'Así guardás tu progreso y podés instalarla.',
  abrir: 'Abrir en tu navegador',
  copiar: 'Copiar link',
  copiado: 'Copiado',
  pegar: 'Pegalo en la barra de direcciones de tu navegador.',
  manual: 'Si no se abre, tocá ⋯ y elegí abrirla en tu navegador.',
  aMano: 'No se pudo copiar. Mantené presionado el link para copiarlo.',
  cerrar: 'Cerrar',
  glifoExterno: glifoSvg('glifo-externo', 16),
  glifoCerrar: glifoSvg('glifo-cerrar', 24),
  css:
    `#pkapp-salir{${variablesAviso('claro')};position:fixed;left:20px;right:20px;` +
    'bottom:calc(20px + env(safe-area-inset-bottom,0px));max-width:448px;margin:0 auto;z-index:2147483647;' +
    'box-sizing:border-box;padding:14px;background:var(--su);color:var(--ti);border:1px solid var(--li);' +
    `font:400 15px/22px ${FUENTE_400};-webkit-text-size-adjust:100%;text-size-adjust:100%}` +
    `#pkapp-salir.o{${variablesAviso('oscuro')}}` +
    '#pkapp-salir:focus{outline:0}' +
    '#pkapp-salir *{box-sizing:border-box;margin:0;border-radius:0;box-shadow:none}' +
    '#pkapp-salir i{position:absolute;width:8px;height:8px;border:0 solid var(--li);pointer-events:none}' +
    '#pkapp-salir .a{top:-5px;left:-5px;border-width:2px 0 0 2px}' +
    '#pkapp-salir .b{top:-5px;right:-5px;border-width:2px 2px 0 0}' +
    '#pkapp-salir .c{bottom:-5px;left:-5px;border-width:0 0 2px 2px}' +
    '#pkapp-salir .d{bottom:-5px;right:-5px;border-width:0 2px 2px 0}' +
    '#pkapp-salir .h{display:flex;align-items:center;min-height:32px;margin-bottom:8px;padding-right:44px;color:var(--ac)}' +
    '#pkapp-salir .h svg{flex:none;margin-right:6px}' +
    `#pkapp-salir .r{font:400 11px/16px ${FUENTE_MONO};letter-spacing:.66px;text-transform:uppercase}` +
    `#pkapp-salir .t{font:600 16px/22px ${FUENTE_600};color:var(--ti)}` +
    '#pkapp-salir .e{margin-top:4px;color:var(--ts)}' +
    '#pkapp-salir .f{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}' +
    '#pkapp-salir .f button{flex:1 1 auto;min-width:116px;min-height:44px;padding:0 16px;white-space:nowrap;' +
    `font:600 15px/22px ${FUENTE_600};cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;` +
    'background:var(--su);color:var(--ti);border:1px solid var(--li)}' +
    '#pkapp-salir .f button.p{flex:2 1 auto;background:var(--ti);color:var(--fo);border-color:var(--ti)}' +
    '#pkapp-salir .f button.p:active{background:var(--su);color:var(--ti);border-color:var(--li)}' +
    '#pkapp-salir .f button:active{background:var(--ti);color:var(--fo);border-color:var(--ti)}' +
    '#pkapp-salir .f button.k{background:var(--su);color:var(--ac);border:2px solid var(--ac)}' +
    '#pkapp-salir .f button.n{background:var(--su);color:var(--er);border:2px solid var(--er)}' +
    '#pkapp-salir .x{position:absolute;top:0;right:0;display:flex;align-items:center;justify-content:center;' +
    'width:44px;height:44px;padding:0;border:0;background:transparent;color:var(--ts);cursor:pointer;' +
    'touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
    '#pkapp-salir .x:active{background:var(--ti);color:var(--fo)}' +
    '#pkapp-salir .m{margin-top:12px;padding-top:12px;border-top:1px solid var(--fi);' +
    `font:400 13px/18px ${FUENTE_400};color:var(--ts)}` +
    '#pkapp-salir input{display:block;width:100%;min-height:44px;margin-top:8px;padding:0 12px;' +
    `font:400 13px/18px ${FUENTE_400};color:var(--ti);background:var(--fo);border:1px solid var(--fi)}` +
    '#pkapp-salir input[hidden]{display:none}' +
    '#pkapp-salir button:focus-visible,#pkapp-salir input:focus-visible{outline:2px solid var(--fc);outline-offset:2px}',
};

const SALIR_SCRIPT = `(function(){try{
var ua=navigator.userAgent;
if(!/Instagram|FBAN|FBAV|FB_IAB/.test(ua))return;
var A=${JSON.stringify(AVISO)};
var and=/Android/.test(ua),ios=/iPhone|iPad|iPod/.test(ua)&&/Instagram/.test(ua),ig=/Instagram/.test(ua);
function get(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function set(k){try{sessionStorage.setItem(k,'1');return sessionStorage.getItem(k)==='1'}catch(e){return false}}
function salir(){var E=encodeURIComponent(location.href);
if(and)location.href='intent://'+location.host+location.pathname+location.search+'#Intent;scheme=https;S.browser_fallback_url='+E+';end';
else if(ios)location.href='instagram://extbrowser/?url='+E}
function mk(t,c,x,f){var b=document.createElement(t);if(c)b.className=c;b.textContent=x||'';if(f)b.onclick=f;return b}
function oscuro(){try{var c=JSON.parse(localStorage.getItem('pkapp_settings'));return !!c&&c.tema==='oscuro'}catch(e){return false}}
function aviso(){
if(get('pkapp-salir-cerrado')||document.getElementById('pkapp-salir'))return;
var prev=document.activeElement,d=document.createElement('div'),s=document.createElement('style');
d.id='pkapp-salir';d.setAttribute('role','dialog');d.setAttribute('aria-labelledby','pkapp-salir-t');d.tabIndex=-1;
if(oscuro())d.className='o';
s.textContent=A.css;d.appendChild(s);
['a','b','c','d'].forEach(function(k){var i=document.createElement('i');i.className=k;i.setAttribute('aria-hidden','true');d.appendChild(i)});
var h=mk('div','h');h.innerHTML=A.glifoExterno;h.appendChild(mk('span','r',A.rotulo));d.appendChild(h);
var t=mk('p','t',A.titulo);t.id='pkapp-salir-t';d.appendChild(t);d.appendChild(mk('p','e',A.explicacion));
var f=mk('div','f'),n=mk('p','m',A.manual),cp;n.setAttribute('role','status');
var li=document.createElement('input');li.readOnly=true;li.hidden=true;li.setAttribute('aria-label',A.copiar);
function ok(){li.hidden=true;cp.textContent=A.copiado;cp.className='k';n.textContent=A.pegar}
function no(){cp.textContent=A.copiar;cp.className='n';n.textContent=A.aMano;li.value=location.href;li.hidden=false;li.focus();li.select()}
function leg(){li.value=location.href;li.hidden=false;li.select();var r=false;try{r=document.execCommand('copy')}catch(e){}r?ok():no()}
function esc(e){if(e.key==='Escape')cerrar()}
function cerrar(){set('pkapp-salir-cerrado');document.removeEventListener('keydown',esc);
if(d.parentNode)d.parentNode.removeChild(d);if(prev&&prev.focus)try{prev.focus()}catch(e){}}
if(and||ios)f.appendChild(mk('button','p',A.abrir,salir));
cp=mk('button','',A.copiar,function(){var c=navigator.clipboard;
if(c&&c.writeText)c.writeText(location.href).then(ok,leg);else leg()});f.appendChild(cp);
d.appendChild(f);d.appendChild(n);d.appendChild(li);
var x=mk('button','x','',cerrar);x.innerHTML=A.glifoCerrar;x.setAttribute('aria-label',A.cerrar);d.appendChild(x);
document.addEventListener('keydown',esc);document.body.appendChild(d);d.focus()}
if(!get('pkapp-salir')&&set('pkapp-salir'))salir();
if(!ig)return;
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
