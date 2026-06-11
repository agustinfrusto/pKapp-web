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

const materiasDir = path.join(assetsDir, 'materias');
const materiaFiles = fs.existsSync(materiasDir)
  ? fs.readdirSync(materiasDir).filter(f => f.endsWith('.png'))
  : [];

let html = fs.readFileSync(indexHtmlPath, 'utf-8');

if (html.includes('rel="preload"') && html.includes('logo')) {
  console.log('Preload already present, skipping.');
  process.exit(0);
}

const preloadTags = [
  `  <link rel="preload" as="image" href="/assets/src/assets/${logoFile}" fetchpriority="high">`,
  ...materiaFiles.map(f => `  <link rel="preload" as="image" href="/assets/src/assets/materias/${f}">`),
].join('\n');

html = html.replace('</head>', `${preloadTags}\n  </head>`);
fs.writeFileSync(indexHtmlPath, html, 'utf-8');
console.log(`Injected preloads: logo + ${materiaFiles.length} materia images`);
