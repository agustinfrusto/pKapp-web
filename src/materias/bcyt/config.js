// Config específica de BCYT: tamaños de examen y parciales.
// Para una materia sin parciales, dejar `parciales: null` y la UI omite ese filtro.
export const config = {
  examSize:        75, // modo Examen sin filtro de parcial
  examSizeParcial: 40, // modo Examen filtrando por un parcial específico
  parciales: [
    { id: 'primero', label: '1er Parcial' },
    { id: 'segundo', label: '2do Parcial' },
  ],
};
