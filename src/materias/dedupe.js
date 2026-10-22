// ESFUNO reutiliza preguntas entre exámenes, así que la misma pregunta aparece
// una vez por cada examen donde salió. Al practicar cruzando exámenes, dejamos
// una sola copia (mismo enunciado + opciones + respuesta correcta). Preserva el
// primer ejemplar; los datos por examen quedan intactos.
export function dedupeQuestions(list) {
  const seen = new Set();
  const out = [];
  for (const q of list) {
    const opts = (q.options || []).map(o => String(o).toLowerCase().replace(/\s+/g, ' ').trim());
    const correct = opts[q.correctIndex] || '';
    const key =
      String(q.question).toLowerCase().replace(/\s+/g, ' ').trim() +
      '||' + [...opts].sort().join('|') +
      '||' + correct;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}
