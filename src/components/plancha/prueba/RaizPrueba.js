// Raíz de la página de prueba de la e2e (tarea 2.9). Solo la monta la raíz del
// proyecto con EXPO_PUBLIC_PKAPP_PRUEBA=componentes. `?tema=oscuro` la abre en oscuro.
import '../../../../global.css';

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TemaProvider, useTema } from '../../../theme/TemaContext';
import { injectWebStyles } from '../../../utils/webStyles';
import PaginaComponentes from './PaginaComponentes';
import { MARCA_PAGINA_PRUEBA } from './marca';

function Pagina() {
  const { oscuro, setOscuro } = useTema();

  useEffect(() => {
    const pedido = new URLSearchParams(window.location.search).get('tema');
    setOscuro(pedido === 'oscuro');
  }, []);

  useEffect(() => { injectWebStyles(oscuro); }, [oscuro]);

  return (
    <View className="flex-1" dataSet={{ marca: MARCA_PAGINA_PRUEBA }}>
      <PaginaComponentes />
    </View>
  );
}

export default function RaizPrueba() {
  return (
    <SafeAreaProvider>
      <TemaProvider>
        <Pagina />
      </TemaProvider>
    </SafeAreaProvider>
  );
}
