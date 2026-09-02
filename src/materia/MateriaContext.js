// Contexto de materia: expone la materia activa y permite cambiarla.
// La preferencia NO se persiste — siempre se pasa por MateriaSelectScreen al abrir.

import React, { createContext, useContext, useState, useMemo, useRef } from 'react';
import { getMateria } from '../materias';

const MateriaContext = createContext({
  materiaId: null,
  materia:   null,
  setMateriaId: () => {},
  materiaIdRef: { current: null },
});

export function MateriaProvider({ children }) {
  const [materiaId, setMateriaIdState] = useState(null);
  // Espejo sincronico del id elegido. El guardia de App.js corre en
  // onStateChange, que puede dispararse antes de que React commitee el estado
  // si la pantalla de seleccion navega en el mismo tick en que elige la materia.
  // Leyendo el ref nunca ve un null viejo, asi que no rebota al usuario al
  // selector apenas toca una materia.
  const materiaIdRef = useRef(null);

  const setMateriaId = (id) => {
    materiaIdRef.current = id;
    setMateriaIdState(id);
  };

  const materia = materiaId ? getMateria(materiaId) : null;

  const value = useMemo(() => ({
    materiaId,
    materia,
    setMateriaId,
    materiaIdRef,
  }), [materiaId, materia]);

  return <MateriaContext.Provider value={value}>{children}</MateriaContext.Provider>;
}

export function useMateria() {
  return useContext(MateriaContext);
}
