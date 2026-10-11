// Suite «resultados» del arnés end-to-end (ver ../README.md).

const { entrarAMateria } = require('./comunes');

async function terminarUnQuizNoPregunta(pagina, base, t) {
  await entrarAMateria(pagina, base);
  await pagina.clic('Entrena Temas/Parciales');
  t.ok('modo práctica', await pagina.esperarUrl('/temas/practice'), true);

  // El tema más corto, para que el quiz sea de pocas preguntas.
  const tema = await pagina.evaluar(`(function () {
    const visibles = Array.from(document.querySelectorAll('[tabindex]'))
      .filter((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((n) => (n.innerText || '').trim().replace(/\\s+/g, ' '))
      .filter((t) => / \\d+ preguntas$/.test(t) && !t.includes('mezclados'));
    if (!visibles.length) return null;
    visibles.sort((a, b) =>
      parseInt(a.match(/(\\d+) preguntas$/)[1]) - parseInt(b.match(/(\\d+) preguntas$/)[1]));
    return visibles[0];
  })()`);
  if (!tema) { t.ok('se encontró algún tema', false, true); return; }

  const total = parseInt(tema.match(/(\d+) preguntas$/)[1], 10);
  t.nota(`  tema elegido: ${tema}`);
  // El innerText real trae un salto de línea antes del contador: se busca por
  // el nombre pelado o no matchea nada.
  // La fila de tema puede traer el número de orden delante («24 Palancas…»): se busca
  // por el nombre solo.
  await pagina.clic(tema.replace(/ \d+ preguntas$/, '').replace(/^\d+ /, ''));
  t.ok('el quiz arrancó', await pagina.esperarUrl('/quiz'), true);

  pagina.dialogos.length = 0;
  for (let i = 0; i < total + 2; i++) {
    if (await pagina.url() !== '/quiz') break;
    const opcionA = await pagina.evaluar(`(function () {
      const nodos = Array.from(document.querySelectorAll('[tabindex]')).filter((n) => {
        const r = n.getBoundingClientRect();
        return /^A\\s/.test((n.innerText || '').trim()) && r.width > 0 && r.height > 0;
      });
      if (!nodos.length) return null;
      nodos[0].scrollIntoView({ block: 'center' });
      const r = nodos[0].getBoundingClientRect();
      return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
    })()`);
    if (opcionA) await pagina.clicEn(opcionA.x, opcionA.y);
    await pagina.esperarA(async () =>
      !!(await pagina.ubicar('Siguiente')) || !!(await pagina.ubicar('Ver resultados')),
      { limite: 5000 });
    if (!await pagina.clic('Ver resultados')) await pagina.clic('Siguiente');
  }

  t.ok('terminar el quiz lleva a /resultados', await pagina.esperarUrl('/resultados'), true);
  t.ok('terminar el quiz NO pide confirmación', pagina.dialogos.length, 0);

  await pagina.evaluar('history.back()');
  await pagina.esperarA(async () => await pagina.url() !== '/resultados', { limite: 5000 });
  t.ok('el atrás desde resultados no pregunta', pagina.dialogos.length, 0);
}

module.exports = [
  { nombre: 'terminar un quiz no pide confirmación', correr: terminarUnQuizNoPregunta },
];
