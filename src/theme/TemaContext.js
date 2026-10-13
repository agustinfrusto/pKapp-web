// Selección y persistencia del tema visual.
//
// Binario a propósito: el usuario prefiere activarlo con un switch y no que la
// app siga al sistema por su cuenta. El default es claro, así que nadie se
// encuentra la app oscura sin haberlo pedido.
import React, { createContext, useContext, useLayoutEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useColorScheme } from 'nativewind';
import { getSettingSync, saveSetting } from '../db/database';

const POR_DEFECTO = 'claro';

const TemaContext = createContext({ oscuro: false, setOscuro: () => {}, cargado: false });

// Con darkMode: 'class', NativeWind no toca la raíz del documento en web: las
// utilidades se emiten como `.dark\:x:is(.dark *)` y sin ese ancestro no aplican.
function aplicar(esOscuro, setColorScheme) {
  setColorScheme(esOscuro ? 'dark' : 'light');
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', esOscuro);
}

// El tema guardado se lee de forma síncrona: el primer cuadro que React pinta ya es el
// tema elegido. Una clave ausente cae en el default; también cae acá 'sistema', que fue
// un valor válido en una versión anterior de este change.
function temaGuardadoOscuro() {
  try {
    return getSettingSync('tema', POR_DEFECTO) === 'oscuro';
  } catch {
    return POR_DEFECTO === 'oscuro';
  }
}

// En web, SafeAreaProvider monta su contenedor en un commit anterior al de este proveedor:
// la clase `dark` tiene que estar puesta antes de cualquier commit, no solo antes de este.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', temaGuardadoOscuro());
}

export function TemaProvider({ children }) {
  const { setColorScheme } = useColorScheme();
  const [oscuro, setOscuroState] = useState(temaGuardadoOscuro);
  const [cargado, setCargado] = useState(false);

  // Antes del primer cuadro pintado: la clase `dark` de html y el esquema de NativeWind.
  useLayoutEffect(() => {
    aplicar(oscuro, setColorScheme);
    setCargado(true);
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
