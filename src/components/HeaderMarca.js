// Header de MateriaSelect y Home (comun.md §1 y §2; D6, D7, D10).
//
// Una sola fila de alto fijo: el slot `izquierda`, que llena cada pantalla, y el
// control «Claro | Oscuro». El alto es el del control de tema y no depende del
// slot, así que las dos pantallas miden lo mismo (CD-19).
import React, { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTema } from '../theme/TemaContext';
import { plancha } from '../theme/colores';
import Glifo from './Glifo';
import { clasesDeAncho } from './plancha/Columna';

// Glifo chico: paso 4 de la escala de 4 px (tokens.md c.3, comun.md §8).
const PX_POR_PASO = 4;
const GLIFO_CHICO = 4 * PX_POR_PASO;

const OPCIONES = [
  { etiqueta: 'Claro', glifo: 'glifo-claro', oscuro: false },
  { etiqueta: 'Oscuro', glifo: 'glifo-oscuro', oscuro: true },
];

// Teclado del radiogroup (patrón APG): flechas mueven el foco y seleccionan, con vuelta.
// Espacio selecciona la opción con foco; Enter ya lo resuelve Pressable. Las dos opciones
// siguen siendo paradas de Tab.
const PASO_POR_TECLA = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const ESPACIO = ' ';

// Opción del segmentado (comun.md §2.1 y §2.2). El estado de cada opción sale de
// `marcada` y del estado `pressed`/`hovered` de Pressable; `dataSet` avisa a
// webStyles.js que el hover lo resuelve el componente y no el contorno genérico.
function Opcion({ etiqueta, glifo, marcada, onElegir, onTecla, registrar }) {
  const { oscuro } = useTema();
  const tema = oscuro ? plancha.oscuro : plancha.claro;

  return (
    <Pressable
      ref={registrar}
      className="h-11 min-w-11"
      accessibilityRole="radio"
      accessibilityState={{ checked: marcada }}
      aria-checked={marcada}
      onPress={marcada ? undefined : onElegir}
      onKeyDown={onTecla}
      dataSet={{ hoverPropio: '' }}
    >
      {({ pressed, hovered }) => {
        // Seleccionada y presionada comparten la inversión; hover no cambia la seleccionada.
        const invertida = marcada || pressed;
        const fondo = invertida ? 'bg-tinta dark:bg-tintaD' : 'bg-fondo dark:bg-fondoD';
        const borde = invertida
          ? 'border-tinta dark:border-tintaD'
          : hovered
            ? 'border-linea dark:border-lineaD'
            : 'border-fondo dark:border-fondoD';
        const texto = invertida ? 'text-fondo dark:text-fondoD' : 'text-tinta dark:text-tintaD';
        return (
          <View className={`flex-1 items-center justify-center gap-0.5 border px-2 ${fondo} ${borde}`}>
            <Glifo id={glifo} size={GLIFO_CHICO} color={invertida ? tema.fondo : tema.tinta} />
            <Text className={`font-plex-mono text-rotulo uppercase ${texto}`}>{etiqueta}</Text>
          </View>
        );
      }}
    </Pressable>
  );
}

// Un solo estado: `oscuro` de TemaContext, que ya lo persiste (clave `tema`).
function ControlTema() {
  const { oscuro, setOscuro } = useTema();
  const opciones = useRef([]);

  function alTeclear(e, indice) {
    // Con Alt, Ctrl o Meta no se actúa: Alt+← y Cmd+← son «atrás» del navegador.
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const paso = PASO_POR_TECLA[e.key];
    if (e.key !== ESPACIO && paso === undefined) return;
    e.preventDefault();
    const destino = paso === undefined ? indice : (indice + paso + OPCIONES.length) % OPCIONES.length;
    setOscuro(OPCIONES[destino].oscuro);
    if (opciones.current[destino]) opciones.current[destino].focus();
  }

  return (
    <View
      className="flex-row border border-linea bg-fondo dark:border-lineaD dark:bg-fondoD"
      accessibilityRole="radiogroup"
      accessibilityLabel="Modo oscuro"
    >
      {OPCIONES.map((op, i) => (
        <Opcion
          key={op.etiqueta}
          etiqueta={op.etiqueta}
          glifo={op.glifo}
          marcada={op.oscuro === oscuro}
          onElegir={() => setOscuro(op.oscuro)}
          onTecla={(e) => alTeclear(e, i)}
          registrar={(nodo) => { opciones.current[i] = nodo; }}
        />
      ))}
    </View>
  );
}

// `ancho` (comun.md §7.2, fila «Barras»): `columna` por defecto, idéntico a siempre. Con otro
// valor, desde `escritorio` el contenido va dentro de la hoja con margen `paso 8`; el fondo
// sigue a todo el ancho. Reusa los topes de Columna.
export default function HeaderMarca({ izquierda = null, ancho = 'columna', testID = 'header-marca' }) {
  const insets = useSafeAreaInsets();
  const clases = clasesDeAncho(ancho);

  return (
    <View
      testID={testID}
      className="w-full bg-fondo dark:bg-fondoD"
      style={{ paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }}
    >
      <View className={clases ? clases.exterior : 'w-full'}>
        <View className={`flex-row items-center justify-between gap-2 py-3.5 ${clases ? clases.interior : 'w-full max-w-columna self-center px-5'}`}>
          <View className="h-11 min-w-0 flex-1 items-start justify-center">{izquierda}</View>
          <ControlTema />
        </View>
      </View>
    </View>
  );
}
