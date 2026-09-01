// Selección y persistencia del tema visual.
//
// Binario a propósito: el usuario prefiere activarlo con un switch y no que la
// app siga al sistema por su cuenta. El default es claro, así que nadie se
// encuentra la app oscura sin haberlo pedido.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from 'nativewind';
import { getSetting, saveSetting } from '../db/database';

const POR_DEFECTO = 'claro';

const TemaContext = createContext({ oscuro: false, setOscuro: () => {}, cargado: false });

// Con darkMode: 'class', NativeWind no toca la raíz del documento en web: las
// utilidades se emiten como `.dark\:x:is(.dark *)` y sin ese ancestro no aplican.
function aplicar(esOscuro, setColorScheme) {
  setColorScheme(esOscuro ? 'dark' : 'light');
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', esOscuro);
}

export function TemaProvider({ children }) {
  const { setColorScheme } = useColorScheme();
  const [oscuro, setOscuroState] = useState(false);
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      // Una clave ausente cae en el default. También cae acá 'sistema', que fue
      // un valor válido en una versión anterior de este change.
      const guardado = await getSetting('tema', POR_DEFECTO);
      const esOscuro = guardado === 'oscuro';
      if (!vivo) return;
      setOscuroState(esOscuro);
      aplicar(esOscuro, setColorScheme);
      setCargado(true);
    })();
    return () => { vivo = false; };
  }, []);

  async function setOscuro(valor) {
    setOscuroState(valor);
    aplicar(valor, setColorScheme);
    await saveSetting('tema', valor ? 'oscuro' : 'claro');
  }

  return (
    <TemaContext.Provider value={{ oscuro, setOscuro, cargado }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
