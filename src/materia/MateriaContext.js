// Contexto de materia: expone la materia activa y permite cambiarla.
// La preferencia NO se persiste — siempre se pasa por MateriaSelectScreen al abrir.
//
// El banco de preguntas se carga bajo demanda (ver src/materias/index.js), así
// que elegir materia es asíncrono: `elegirMateria` devuelve una promesa que
// resuelve cuando la materia ya está disponible, y `cargando` deja mostrar el
// estado en la tarjeta mientras baja el chunk.

import React, { createContext, useContext, useState, useMemo, useRef, useCallback } from 'react';
import { cargarMateria } from '../materias';

const MateriaContext = createContext({
  materiaId: null,
  materia:   null,
  cargando:  false,
  elegirMateria: async () => null,
  materiaIdRef: { current: null },
});

export function MateriaProvider({ children }) {
  const [materiaId, setMateriaId] = useState(null);
  const [materia, setMateria] = useState(null);
  const [cargando, setCargando] = useState(false);
  // Espejo sincronico del id elegido. El guardia de App.js corre en
  // onStateChange, que puede dispararse antes de que React commitee el estado
  // si la pantalla de seleccion navega en el mismo tick en que elige la materia.
  // Leyendo el ref nunca ve un null viejo, asi que no rebota al usuario al
  // selector apenas toca una materia.
  //
  // No alcanza con el requestAnimationFrame de handlePick: rAF corre antes del
  // pintado, pero React 19 agenda el render por su propio scheduler y puede no
  // haber commiteado todavia. El ref es lo que hace que el guardia no dependa
  // de ese orden.
  const materiaIdRef = useRef(null);

  const elegirMateria = useCallback(async (id) => {
    setCargando(true);
    try {
      const cargada = await cargarMateria(id);
      if (!cargada) return null;
      // El ref se fija ANTES que el estado y en el mismo tick sincronico: es lo
      // que lee el guardia de App.js. No sacar de acá.
      materiaIdRef.current = id;
      // Los dos estados se fijan juntos: ninguna pantalla debe ver un materiaId
      // apuntando a una materia que todavía no está.
      setMateriaId(id);
      setMateria(cargada);
      return cargada;
    } finally {
      setCargando(false);
    }
  }, []);

  const value = useMemo(() => ({
    materiaId,
    materia,
    cargando,
    elegirMateria,
    materiaIdRef,
  }), [materiaId, materia, cargando, elegirMateria]);

  return <MateriaContext.Provider value={value}>{children}</MateriaContext.Provider>;
}

export function useMateria() {
  return useContext(MateriaContext);
}
