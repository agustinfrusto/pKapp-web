// Región de avisos (design.md D11, ficha Banners.md §3.14, propuesta `BAN-P2`).
//
// Muestra los avisos vigentes de una pantalla. Con uno solo es la nota de siempre (sin
// pie ni roles de carrusel). Con 2 o 3, un marco común, una nota visible a la vez en la
// misma celda de rejilla (la región mide la más alta), y un pie con «Pausar»/«Reanudar»,
// anterior, «n de N» y siguiente. Avanza sola una vuelta y se queda en la última:
//   - el puntero (mouse) encima suspende; al salir espera completa de la nota visible;
//   - el foco de teclado dentro pausa de forma persistente (solo «Reanudar» la retoma);
//   - la pestaña oculta o la región fuera de la vista no avanzan;
//   - `prefers-reduced-motion: reduce`: sin avance, sin fundido y sin «Pausar»;
//   - `aria-live`: `off` mientras avanza sola, `polite` cuando la gobierna el usuario.
// El fundido es un cambio de clase (`opacity`, 150 ms); el avance, un `setTimeout` por nota.
//
// Props:
//   pantalla  'materias' | 'home': qué avisos de `lista` le corresponden
//   lista     arreglo de avisos (por defecto `AVISOS`); solo la página de prueba pasa otra
//   espera    (aviso) => ms; por defecto la fórmula de la ficha (`esperaPorDefecto`). Solo la
//             página de prueba (`EXPO_PUBLIC_PKAPP_PRUEBA=componentes`) pasa una más corta
//   testID    de la región con varios avisos (por defecto `avisos`); con uno es el `id` del aviso
//   className solo de layout (margen); por defecto `mb-3`
import React, { useEffect, useRef, useState } from 'react';
import {
  Linking, Platform, Text, View, useWindowDimensions,
} from 'react-native';
import {
  AVISOS, avisosVigentes, claveDe, descartarAviso, esperaPorDefecto,
} from '../avisos/avisos';
import Glifo from './Glifo';
import {
  BotonMarco, CuadroPaso, FilaLista, RotuloSeccion,
} from './plancha';
import { useTokens } from './plancha/Control';

// Escala de 4 px por paso (tokens.md c.3, comun.md §8).
const GLIFO_CHICO = 4 * 4;
const ANCHO_CORTE = 360; // bajo él, «Pausar» y «Reanudar» van solo con el glifo (comun.md §1.1)
const UMBRAL_VISTA = 0.25;

const FOCO_SIGUIENTE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

const MARCO =
  'relative border border-l-3 border-filete border-l-acento bg-superficie dark:border-fileteD dark:border-l-acentoD dark:bg-superficieD';
const FILETE_PIE = 'border-t border-filete dark:border-fileteD';

function almacen() {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

const esWeb = Platform.OS === 'web' && typeof document !== 'undefined';

// Regiones montadas, cada una con su función de «releer». `native-stack` deja MateriaSelect
// montada bajo Home: un aviso de varias pantallas vive en más de una región a la vez, y
// descartarlo en una tiene que quitarlo de las demás (sin `testID` duplicado).
const regiones = new Set();

// Descartes de la sesión, por clave de almacenamiento. Valen aunque el almacenamiento no
// persista (sin `localStorage`, cuota, modo privado) y los comparten todas las regiones: un
// aviso descartado en una no vuelve a aparecer en otra al releer.
const descartadosEnSesion = new Set();

// Para la página de prueba: «Reiniciar» borra también lo descartado en memoria.
export function olvidarDescartes() {
  descartadosEnSesion.clear();
}

function vigentesDe(lista, pantalla) {
  return avisosVigentes(lista, pantalla, Date.now(), almacen())
    .filter((a) => !descartadosEnSesion.has(claveDe(a)));
}

// `:focus-visible` como selector: sin soporte (Safari < 15.4) `matches` lanza. `siFalla` es lo que
// se asume entonces: para la pausa, que el foco de teclado cuente como tal (BAN-Q2); para el
// contorno, que no (un clic en la nota no debe dibujarlo).
function esFocoVisible(el, siFalla) {
  try {
    return !!el.matches?.(':focus-visible');
  } catch {
    return siFalla;
  }
}

function movimientoReducido() {
  return esWeb && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Primer control visible que sigue a `raiz` en el DOM y no está dentro de ella.
function controlSiguiente(raiz) {
  const todos = document.querySelectorAll(FOCO_SIGUIENTE);
  for (const el of todos) {
    if (raiz.contains(el)) continue;
    if (!(raiz.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
    if (el.getClientRects().length === 0 || getComputedStyle(el).visibility === 'hidden') continue;
    return el;
  }
  return null;
}

export default function RegionAvisos({
  pantalla, lista = AVISOS, espera = esperaPorDefecto, testID = 'avisos', className = 'mb-3',
}) {
  const tema = useTokens();
  const { width } = useWindowDimensions();
  // Se resuelve al montar, antes del primer pintado: decidirlo en un efecto dejaba la nota
  // oculta un cuadro y todo lo de abajo saltaba cuando aparecía.
  const [avisos, setAvisos] = useState(() => vigentesDe(lista, pantalla));
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [puntero, setPuntero] = useState(false);
  const [fuera, setFuera] = useState(false);
  const [oculta, setOculta] = useState(() => esWeb && document.hidden);
  const [reducido, setReducido] = useState(movimientoReducido);
  const [contorno, setContorno] = useState(null);

  const raiz = useRef(null);
  const notas = useRef({});
  const esperaRef = useRef(espera);
  esperaRef.current = espera;
  const foco = useRef(null); // { id } de la nota que debe recibir el foco tras descartar
  // Solo el avance automático que TERMINA la vuelta con el foco en «Pausar» la marca (§3.14.8).
  const pausaConFoco = useRef(false);
  const releerPropio = useRef(null);
  const visible = useRef(null); // `id` de la nota que se está viendo

  visible.current = avisos[indice]?.id;
  const n = avisos.length;
  const varios = n > 1;
  const ultima = indice >= n - 1;
  // Hay vuelta por hacer: 2 o más, sin movimiento reducido y sin llegar a la última.
  const activo = varios && !reducido && !ultima;
  const avanzando = activo && !pausado;
  const corre = avanzando && !puntero && !fuera && !oculta;

  // Un temporizador por nota, rearmado en cada cambio; solo cambia cuál es la activa.
  useEffect(() => {
    if (!corre) return undefined;
    const t = setTimeout(() => {
      if (esWeb && raiz.current) {
        const pausa = raiz.current.querySelector(`[data-testid="${testID}-pausar"]`);
        const terminaLaVuelta = indice + 1 >= avisos.length - 1;
        pausaConFoco.current = terminaLaVuelta && !!pausa && document.activeElement === pausa;
      }
      setIndice((i) => i + 1);
    }, esperaRef.current(avisos[indice]));
    return () => clearTimeout(t);
  }, [corre, indice, avisos, testID]);

  // Al terminar la vuelta con el foco en «Pausar», el foco pasa a «Nota anterior».
  useEffect(() => {
    if (!esWeb || activo || !pausaConFoco.current) return;
    pausaConFoco.current = false;
    raiz.current?.querySelector(`[data-testid="${testID}-anterior"]`)?.focus();
  }, [activo, testID]);

  // Foco tras descartar una de varias: la nota que ocupa su lugar.
  useEffect(() => {
    if (!foco.current) return;
    const nodo = notas.current[foco.current.id];
    foco.current = null;
    nodo?.focus?.();
  }, [avisos]);

  // Un descarte en otra región montada: vuelve a resolver los avisos de esta. La nota que se
  // veía sigue activa (se re-ancla por `id`); solo si ya no está, se acota el índice.
  useEffect(() => {
    const releer = () => {
      const vigentes = vigentesDe(lista, pantalla);
      const ancla = visible.current;
      setAvisos((previos) => (previos.length === vigentes.length
        && previos.every((a, k) => a.id === vigentes[k].id) ? previos : vigentes));
      setIndice((i) => {
        const k = vigentes.findIndex((a) => a.id === ancla);
        return k >= 0 ? k : Math.max(0, Math.min(i, vigentes.length - 1));
      });
    };
    releerPropio.current = releer;
    regiones.add(releer);
    return () => { regiones.delete(releer); };
  }, [lista, pantalla]);

  // Condiciones del entorno que gobiernan el avance (solo con varios avisos).
  useEffect(() => {
    if (!esWeb || !varios || !raiz.current) return undefined;
    const el = raiz.current;
    const alEntrar = (e) => { if (e.pointerType === 'mouse') setPuntero(true); };
    const alSalir = (e) => { if (e.pointerType === 'mouse') setPuntero(false); };
    // Foco de teclado dentro: pausa persistente. Un clic de puntero no la dispara.
    const alEnfocar = (e) => {
      if (esFocoVisible(e.target, true)) setPausado(true);
    };
    const alCambiarVisibilidad = () => setOculta(document.hidden);
    el.addEventListener('pointerenter', alEntrar);
    el.addEventListener('pointerleave', alSalir);
    el.addEventListener('focusin', alEnfocar);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    let mq = null;
    const alCambiarMovimiento = () => setReducido(movimientoReducido());
    if (typeof window.matchMedia === 'function') {
      mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', alCambiarMovimiento);
    }
    let obs = null;
    if ('IntersectionObserver' in window) {
      obs = new IntersectionObserver((entradas) => {
        // «Fuera de la vista»: menos del 25 % de la región visible.
        setFuera(entradas[entradas.length - 1].intersectionRatio < UMBRAL_VISTA);
      }, { threshold: UMBRAL_VISTA });
      obs.observe(el);
    }
    return () => {
      el.removeEventListener('pointerenter', alEntrar);
      el.removeEventListener('pointerleave', alSalir);
      el.removeEventListener('focusin', alEnfocar);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      mq?.removeEventListener('change', alCambiarMovimiento);
      obs?.disconnect();
    };
  }, [varios]);

  if (n === 0) return null;

  function descartar(aviso) {
    descartarAviso(aviso, Date.now(), almacen());
    if (aviso.descartable) descartadosEnSesion.add(claveDe(aviso));
    regiones.forEach((releer) => { if (releer !== releerPropio.current) releer(); });
    const restantes = avisos.filter((a) => a !== aviso);
    if (restantes.length === 0) {
      // Sin hueco: la región desaparece y el foco pasa al primer control que sigue.
      const destino = esWeb && raiz.current ? controlSiguiente(raiz.current) : null;
      setAvisos([]);
      if (destino) requestAnimationFrame(() => destino.focus());
      return;
    }
    const k = Math.min(indice, restantes.length - 1);
    foco.current = { id: restantes[k].id };
    setAvisos(restantes);
    setIndice(k);
  }

  function paso(delta) {
    // Tomar el control manual detiene el avance; el foco se queda en el botón.
    pausaConFoco.current = false;
    setPausado(true);
    setIndice((i) => (i + delta + n) % n);
  }

  const solo = !varios;
  const vivo = avanzando ? 'off' : 'polite';
  const soloGlifo = width < ANCHO_CORTE;
  const rotuloPausa = pausado ? 'Reanudar' : 'Pausar';
  const glifoPausa = pausado ? 'glifo-reanudar' : 'glifo-pausar';

  const regionProps = solo ? {} : {
    role: 'region',
    'aria-label': 'Avisos',
    'aria-roledescription': 'carrusel',
  };

  return (
    <View
      ref={raiz}
      testID={solo ? avisos[0].id : testID}
      className={`${MARCO} ${className}`}
      {...regionProps}
    >
      <View
        className={solo ? undefined : 'grid'}
        aria-live={solo ? undefined : vivo}
        aria-atomic={solo ? undefined : false}
      >
        {avisos.map((aviso, k) => (
          <Nota
            key={aviso.id}
            aviso={aviso}
            tema={tema}
            solo={solo}
            posicion={k}
            total={n}
            activa={solo || k === indice}
            contorno={contorno === aviso.id}
            registrar={(nodo) => { if (nodo) notas.current[aviso.id] = nodo; else delete notas.current[aviso.id]; }}
            alContornear={(si) => setContorno(si ? aviso.id : null)}
            alDescartar={() => descartar(aviso)}
          />
        ))}
      </View>

      {solo ? null : (
        <View className={`flex-row items-center gap-2 px-3.5 py-2 ${FILETE_PIE}`}>
          {activo ? (
            soloGlifo ? (
              <CuadroPaso
                testID={`${testID}-pausar`}
                glifo={glifoPausa}
                accessibilityLabel={`${rotuloPausa} avisos`}
                onPress={() => setPausado((p) => !p)}
              />
            ) : (
              <BotonMarco
                testID={`${testID}-pausar`}
                glifo={glifoPausa}
                etiqueta={rotuloPausa}
                accessibilityLabel={`${rotuloPausa} avisos`}
                onPress={() => setPausado((p) => !p)}
              />
            )
          ) : null}
          <View className="ml-auto flex-row items-center gap-2">
            {/* K5 con el chevron girado 180°: el cuadrado es simétrico, gira entero. */}
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <CuadroPaso
                testID={`${testID}-anterior`}
                glifo="glifo-chevron"
                accessibilityLabel="Nota anterior"
                onPress={() => paso(-1)}
              />
            </View>
            <Text
              testID={`${testID}-contador`}
              accessibilityLabel={`Nota ${indice + 1} de ${n}`}
              className="min-w-11 text-center font-plex-mono text-rotulo uppercase text-tintaSec dark:text-tintaSecD"
            >
              {`${indice + 1} de ${n}`}
            </Text>
            <CuadroPaso
              testID={`${testID}-siguiente`}
              glifo="glifo-chevron"
              accessibilityLabel="Nota siguiente"
              onPress={() => paso(1)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

// Una nota (Banners.md §3.14.2): el botón de cerrar a ras del marco, rótulo con glifo, párrafos y contacto.
// En DOM el botón de cerrar va primero (en pantalla está arriba a la derecha: orden de foco = visual).
function Nota({
  aviso, tema, solo, posicion, total, activa, contorno, registrar, alContornear, alDescartar,
}) {
  const grupo = solo ? {} : {
    role: 'group',
    'aria-roledescription': 'nota',
    'aria-label': `${posicion + 1} de ${total}`,
  };
  const celda = solo ? '' : `col-start-1 row-start-1 transition-opacity duration-150 motion-reduce:transition-none ${
    activa ? 'opacity-100' : 'invisible opacity-0'}`;

  function alEnfocar(e) {
    if (e.target === e.currentTarget && esFocoVisible(e.target, false)) alContornear(true);
  }

  // El botón de cerrar va primero en el DOM y con `zIndex`: sin él, el encabezado (que le sigue) lo tapa.
  return (
    <View
      ref={registrar}
      testID={solo ? undefined : aviso.id}
      className={`relative p-3.5 ${celda}`}
      style={contorno ? CONTORNO_FOCO(tema) : undefined}
      tabIndex={-1}
      onFocus={alEnfocar}
      onBlur={() => alContornear(false)}
      {...grupo}
    >
      {aviso.descartable ? (
        <View className="absolute right-0 top-0" style={{ zIndex: 1 }}>
          <FilaLista tono="sec" glifo="glifo-cerrar" accessibilityLabel="Cerrar nota" onPress={alDescartar} />
        </View>
      ) : null}
      <View className={`mb-2 min-h-8 flex-row items-center gap-1.5 ${aviso.descartable ? 'pr-11' : ''}`}>
        <Glifo id={aviso.glifo} size={GLIFO_CHICO} color={tema.acento} />
        <RotuloSeccion color="acento">{aviso.rotulo}</RotuloSeccion>
      </View>
      {aviso.parrafos.map((p, k) => (
        <Text
          // eslint-disable-next-line react/no-array-index-key
          key={k}
          className={`font-plex-sans text-cuerpo text-tinta dark:text-tintaD ${k > 0 ? 'mt-3' : ''}`}
        >
          {p}
        </Text>
      ))}
      {aviso.contacto ? (
        <BotonMarco
          className="mt-3 self-start"
          tono="acento"
          glifo="glifo-correo"
          etiqueta={aviso.contacto}
          accessibilityLabel={`Escribir a ${aviso.contacto}`}
          onPress={() => requestAnimationFrame(() => Linking.openURL(`mailto:${aviso.contacto}`).catch(() => {}))}
        />
      ) : null}
    </View>
  );
}

// Contorno de foco hacia adentro, separado paso 1 (Banners.md §3.14.8): 2 px de `foco`.
const CONTORNO_FOCO = (tema) => ({
  outlineStyle: 'solid', outlineWidth: 2, outlineColor: tema.foco, outlineOffset: -6,
});
