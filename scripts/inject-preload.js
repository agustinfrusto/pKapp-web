const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const assetsDir = path.join(distDir, 'assets', 'src', 'assets');
const indexHtmlPath = path.join(distDir, 'index.html');

const files = fs.readdirSync(assetsDir);
const logoFile = files.find(f => f.startsWith('logo.') && f.endsWith('.png'));

if (!logoFile) {
  console.error('Error: logo not found in', assetsDir);
  process.exit(1);
}

const logoHref = `/assets/src/assets/${logoFile}`;
const preloadTag = `  <link rel="preload" as="image" href="${logoHref}">`;

let html = fs.readFileSync(indexHtmlPath, 'utf-8');

if (html.includes('rel="preload"') && html.includes('logo')) {
  console.log('Preload already present, skipping.');
  process.exit(0);
}

html = html.replace('</head>', `${preloadTag}\n  </head>`);
fs.writeFileSync(indexHtmlPath, html, 'utf-8');
console.log(`Injected preload: ${logoHref}`);
