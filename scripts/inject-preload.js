const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '..', process.env.PKAPP_DIST || 'dist');
const assetsDir = path.join(distDir, 'assets', 'src', 'assets');
const indexHtmlPath = path.join(distDir, 'index.html');

const materiasDir = path.join(assetsDir, 'materias');
const materiaFiles = fs.existsSync(materiasDir)
  ? fs.readdirSync(materiasDir).filter(f => f.endsWith('.png'))
  : [];

if (materiaFiles.length === 0) {
  console.error(`inject-preload: no hay imágenes de materia en ${materiasDir}`);
  process.exit(1);
}

let html = fs.readFileSync(indexHtmlPath, 'utf-8');

if (html.includes('rel="preload" as="image" href="/assets/src/assets/materias/')) {
  console.log('Preload already present, skipping.');
  process.exit(0);
}

const preloadTags = materiaFiles
  .map(f => `  <link rel="preload" as="image" href="/assets/src/assets/materias/${f}">`)
  .join('\n');

html = html.replace('</head>', `${preloadTags}\n  </head>`);
fs.writeFileSync(indexHtmlPath, html, 'utf-8');
console.log(`Injected preloads: ${materiaFiles.length} materia images`);
