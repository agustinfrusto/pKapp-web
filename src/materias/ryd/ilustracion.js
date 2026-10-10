// Ilustración de la materia ryd: datos de trazo, sin JSX ni dependencias de plataforma.
// Contrato en openspec/changes/rediseno-plancha/design.md (D2/D3). El color lo pone Ilustracion.
export const ilustracion = {
  viewBox: '0 0 64 64',
  trazo: { ancho: 1.1, union: 'miter', extremo: 'square' },
  elementos: [
    { tipo: 'circle', props: { cx: 32, cy: 27, r: 22 } },
    { tipo: 'circle', props: { cx: 32, cy: 27, r: 18, strokeWidth: 0.6 } },
    { tipo: 'circle', props: { cx: 24, cy: 20, r: 3.4 } },
    { tipo: 'circle', props: { cx: 30, cy: 16.5, r: 3.4 } },
    { tipo: 'circle', props: { cx: 21, cy: 27, r: 3.4 } },
    { tipo: 'circle', props: { cx: 36, cy: 21, r: 3.4 } },
    { tipo: 'circle', props: { cx: 27, cy: 26, r: 3.4 } },
    { tipo: 'path', props: { d: 'M44 24 L56 12', strokeWidth: 0.7 } },
    { tipo: 'circle', props: { cx: 57, cy: 11, r: 1 } },
    { tipo: 'circle', props: { cx: 8, cy: 57, r: 3.5 } },
    { tipo: 'circle', props: { cx: 23, cy: 57, r: 3.5 } },
    { tipo: 'path', props: { d: 'M23 53.5 V60.5', strokeWidth: 0.7 } },
    { tipo: 'circle', props: { cx: 40, cy: 55.5, r: 2.5 } },
    { tipo: 'circle', props: { cx: 45, cy: 55.5, r: 2.5 } },
    { tipo: 'circle', props: { cx: 42.5, cy: 59.5, r: 2.5 } },
    { tipo: 'circle', props: { cx: 55, cy: 57, r: 3.5 } },
    { tipo: 'circle', props: { cx: 54, cy: 56, r: 0.8 } },
    { tipo: 'circle', props: { cx: 56.5, cy: 58.5, r: 0.8 } },
    { tipo: 'circle', props: { cx: 54.5, cy: 58.5, r: 0.8 } },
  ],
};
