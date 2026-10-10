// Ilustración de la materia bcyt: datos de trazo, sin JSX ni dependencias de plataforma.
// Contrato en openspec/changes/rediseno-plancha/design.md (D2/D3). El color lo pone Ilustracion.
export const ilustracion = {
  viewBox: '0 0 64 64',
  trazo: { ancho: 1.1, union: 'miter', extremo: 'square' },
  elementos: [
    { tipo: 'path', props: { d: 'M9 33 C7 19 19 8 33 9 C48 9 57 21 55 34 C54 48 43 57 31 55 C18 55 10 46 9 33Z' } },
    { tipo: 'circle', props: { cx: 31, cy: 30, r: 9.5 } },
    { tipo: 'circle', props: { cx: 33.5, cy: 27.5, r: 3 } },
    { tipo: 'ellipse', props: { cx: 16.5, cy: 38, rx: 5.5, ry: 2.6, transform: 'rotate(-40 16.5 38)' } },
    { tipo: 'path', props: { d: 'M13 41 L20 35' } },
    { tipo: 'ellipse', props: { cx: 47.5, cy: 21, rx: 5.5, ry: 2.6, transform: 'rotate(32 47.5 21)' } },
    { tipo: 'path', props: { d: 'M43.5 18.5 L51.5 23.5' } },
    { tipo: 'path', props: { d: 'M38 46 C41 44 44 44 47 46 M37 49.5 C40 47.5 44 47.5 48 49.5 M36.5 53 C40 51 44 51 47 53' } },
    { tipo: 'path', props: { d: 'M22 20 C25 17 28 18 30 16' } },
    { tipo: 'circle', props: { cx: 21, cy: 46, r: 0.9 } },
    { tipo: 'circle', props: { cx: 50, cy: 35, r: 0.9 } },
    { tipo: 'circle', props: { cx: 18, cy: 26, r: 0.9 } },
    { tipo: 'path', props: { d: 'M2 62 H62 M2 59 V62 M62 59 V62', strokeWidth: 0.6 } },
  ],
};
