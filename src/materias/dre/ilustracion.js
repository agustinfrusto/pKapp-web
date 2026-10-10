// Ilustración de la materia dre: datos de trazo, sin JSX ni dependencias de plataforma.
// Contrato en openspec/changes/rediseno-plancha/design.md (D2/D3). El color lo pone Ilustracion.
export const ilustracion = {
  viewBox: '0 0 64 64',
  trazo: { ancho: 1.1, union: 'miter', extremo: 'square' },
  elementos: [
    { tipo: 'path', props: { d: 'M44 7 C27 4 11 16 11 32 C11 48 27 60 44 56 C48 55 48 50 44 47 C38 43 38 37 44 33 C50 29 49 24 44 20 C40 16 41 8 44 7Z' } },
    { tipo: 'path', props: { d: 'M18 21 L36 30 M16 33 L35 34 M20 46 L37 40', strokeWidth: 0.7 } },
    { tipo: 'path', props: { d: 'M44 33 L58 27 M44 40 L55 52 L55 60', strokeWidth: 0.9 } },
    { tipo: 'circle', props: { cx: 30, cy: 32, r: 1 } },
    { tipo: 'path', props: { d: 'M4 7 H9 M4 56 H9 M6.5 7 V56', strokeWidth: 0.6 } },
  ],
};
