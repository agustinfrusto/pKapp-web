// Ilustración de la materia cyr: datos de trazo, sin JSX ni dependencias de plataforma.
// Contrato en openspec/changes/rediseno-plancha/design.md (D2/D3). El color lo pone Ilustracion.
export const ilustracion = {
  viewBox: '0 0 64 64',
  trazo: { ancho: 1.1, union: 'miter', extremo: 'square' },
  elementos: [
    { tipo: 'circle', props: { cx: 32, cy: 32, r: 26 } },
    { tipo: 'circle', props: { cx: 32, cy: 32, r: 21, strokeDasharray: '1.5 2' } },
    { tipo: 'circle', props: { cx: 32, cy: 32, r: 15 } },
    { tipo: 'circle', props: { cx: 32, cy: 32, r: 11.5, strokeWidth: 0.6 } },
    { tipo: 'path', props: { d: 'M32 4 V10 M32 54 V60 M4 32 H10 M54 32 H60', strokeWidth: 0.7 } },
    { tipo: 'path', props: { d: 'M32 28 V36 M28 32 H36', strokeWidth: 0.6 } },
    { tipo: 'path', props: { d: 'M50 14 L58 6', strokeWidth: 0.6 } },
  ],
};
