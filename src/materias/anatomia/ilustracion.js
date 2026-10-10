// Ilustración de la materia anatomia: datos de trazo, sin JSX ni dependencias de plataforma.
// Contrato en openspec/changes/rediseno-plancha/design.md (D2/D3). El color lo pone Ilustracion.
export const ilustracion = {
  viewBox: '0 0 64 64',
  trazo: { ancho: 1.1, union: 'miter', extremo: 'square' },
  elementos: [
    { tipo: 'rect', props: { x: 28.5, y: 5, width: 7, height: 5 } },
    { tipo: 'rect', props: { x: 28.5, y: 12, width: 7, height: 5 } },
    { tipo: 'rect', props: { x: 28.5, y: 19, width: 7, height: 5 } },
    { tipo: 'rect', props: { x: 28.5, y: 26, width: 7, height: 5 } },
    { tipo: 'rect', props: { x: 28.5, y: 33, width: 7, height: 5 } },
    { tipo: 'rect', props: { x: 28.5, y: 40, width: 7, height: 5 } },
    { tipo: 'rect', props: { x: 28.5, y: 47, width: 7, height: 5 } },
    { tipo: 'rect', props: { x: 28.5, y: 54, width: 7, height: 5 } },
    { tipo: 'path', props: { d: 'M28.5 14 C18 13 12 21 13 29 M35.5 14 C46 13 52 21 51 29' } },
    { tipo: 'path', props: { d: 'M28.5 21 C16 20 9 30 11 40 M35.5 21 C48 20 55 30 53 40' } },
    { tipo: 'path', props: { d: 'M28.5 28 C17 28 11 37 13 46 M35.5 28 C47 28 53 37 51 46' } },
    { tipo: 'path', props: { d: 'M28.5 35 C20 36 15 42 17 50 M35.5 35 C44 36 49 42 47 50' } },
    { tipo: 'path', props: { d: 'M4 5 H9 M4 59 H9 M6.5 5 V59', strokeWidth: 0.6 } },
  ],
};
