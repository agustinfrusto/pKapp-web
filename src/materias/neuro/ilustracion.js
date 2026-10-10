// Ilustración de la materia neuro: datos de trazo, sin JSX ni dependencias de plataforma.
// Contrato en openspec/changes/rediseno-plancha/design.md (D2/D3). El color lo pone Ilustracion.
export const ilustracion = {
  viewBox: '0 0 64 64',
  trazo: { ancho: 1.1, union: 'miter', extremo: 'square' },
  elementos: [
    { tipo: 'polygon', props: { points: '25,29 31,23 39,25 41,33 34,39 26,36' } },
    { tipo: 'circle', props: { cx: 33, cy: 31, r: 2.2 } },
    { tipo: 'path', props: { d: 'M25 29 L15 22 L9 14 M15 22 L6 24 M31 23 L28 12 L22 6 M28 12 L33 5 M39 25 L47 17 L55 14 M47 17 L52 8 M26 36 L15 41 L8 49 M15 41 L6 40' } },
    { tipo: 'path', props: { d: 'M41 33 L56 52' } },
    { tipo: 'rect', props: { x: 43.5, y: 35, width: 5, height: 3, transform: 'rotate(50 46 36.5)' } },
    { tipo: 'rect', props: { x: 48.5, y: 41, width: 5, height: 3, transform: 'rotate(50 51 42.5)' } },
    { tipo: 'circle', props: { cx: 9, cy: 14, r: 1 } },
    { tipo: 'circle', props: { cx: 6, cy: 24, r: 1 } },
    { tipo: 'circle', props: { cx: 22, cy: 6, r: 1 } },
    { tipo: 'circle', props: { cx: 33, cy: 5, r: 1 } },
    { tipo: 'circle', props: { cx: 55, cy: 14, r: 1 } },
    { tipo: 'circle', props: { cx: 52, cy: 8, r: 1 } },
    { tipo: 'circle', props: { cx: 8, cy: 49, r: 1 } },
    { tipo: 'circle', props: { cx: 6, cy: 40, r: 1 } },
  ],
};
