// Contexto de materia: expone la materia activa y permite cambiarla.
// La preferencia NO se persiste — siempre se pasa por MateriaSelectScreen al abrir.

import React, { createContext, useContext, useState, useMemo } from 'react';
import { getMateria } from '../materias';

const MateriaContext = createContext({
  materiaId: null,
  materia:   null,
  setMateriaId: () => {},
});

export function MateriaProvider({ children }) {
  const [materiaId, setMateriaIdState] = useState(null);

  const setMateriaId = (id) => {
    setMateriaIdState(id);
  };

  const materia = materiaId ? getMateria(materiaId) : null;

  const value = useMemo(() => ({
    materiaId,
    materia,
    setMateriaId,
  }), [materiaId, materia]);

  return <MateriaContext.Provider value={value}>{children}</MateriaContext.Provider>;
}

export function useMateria() {
  return useContext(MateriaContext);
}
