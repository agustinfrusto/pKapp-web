// Desplegable en línea (ADD-P3, AddQuestion-ADD-P3.md): un valor y una lista corta de la
// que elegir. Compone el disparador K3 (plegable `abierto`), la lámina (§6) y filas K7
// con la regla nueva «elegida». La lista abre en línea bajo el disparador y empuja el
// formulario: sin capa flotante, sin telón y sin medir posiciones.
//
// Props: `accessibilityLabel` (obligatoria: nombre del campo, compone el del disparador
//   «Tema: {nombre}» y el de la lista), `opciones` [{ valor, etiqueta, deshabilitado? }]
//   (lista plana) o `grupos` [{ id, etiqueta, marca?: { indice, de }, opciones }] (lista
//   agrupada: `marca` dibuja la marca de parcial del rótulo), `valor`, `alCambiar(valor)`
//   (una vez por elección), `textoDeAyuda` (disparador sin coincidencia), `deshabilitado`
//   (cierra y deshabilita), `className` (layout) y `testID`.
//
// Interacción (d.1 a d.3): el disparador abre con toque, Enter, Espacio y flechas; el foco
// pasa a la fila elegida. Una sola parada de Tab dentro de la lista (la fila con foco).
// Flechas, Inicio, Fin y Re Pág/Av Pág mueven el foco sin elegir; Enter, Espacio o toque
// eligen, cierran y devuelven el foco al disparador; Escape cierra sin cambiar; Tab y
// Shift+Tab cierran y siguen el orden del DOM; una letra salta a la fila que empieza con
// lo tipeado (búfer de 800 ms, sin distinguir mayúsculas ni tildes). Con Alt, Ctrl o
// Meta no se actúa.
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Glifo from '../Glifo';
import ControlMarco from './ControlMarco';
import FilaLista from './FilaLista';
import Lamina from './Lamina';
import MarcaParcial from './MarcaParcial';
import { GLIFO_CHICO, useTokens } from './Control';
import { avisar } from './guardias';

// Alto máximo de la región de scroll: paso 80 (320 px), escala por defecto de Tailwind.
const REGION = 'max-h-80 overscroll-contain';
const PAGINA = 7;
const MS_BUFFER = 800;
// Contorno de foco de una fila: 2 px de trazo y 2 px de separación (comun.md §5.1, fila
// «Foco»; la región de scroll no lo recorta, §5.3).
const MARGEN_FOCO = 4;

let contador = 0;

const normalizar = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const ES_CARACTER = /^[\p{L}\p{N} ]$/u;

export default function Desplegable({
  accessibilityLabel, opciones, grupos, valor, alCambiar, textoDeAyuda,
  deshabilitado = false, className = '', testID,
}) {
  avisar(!accessibilityLabel, 'Desplegable sin accessibilityLabel');
  avisar(!opciones && !grupos, 'Desplegable sin opciones ni grupos');
  const tema = useTokens();
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const disparador = useRef(null);
  const filas = useRef([]);
  const centrar = useRef(false);
  const busqueda = useRef({ texto: '', t: 0 });
  const idLista = useRef(null);
  if (idLista.current === null) idLista.current = `desplegable-${++contador}`;

  const secciones = grupos ?? [{ id: 'plano', etiqueta: null, opciones: opciones ?? [] }];
  const planas = secciones.flatMap((s) => s.opciones);
  const habilitada = (i) => !planas[i].deshabilitado;
  const elegida = planas.findIndex((o) => o.valor === valor);
  const hayValor = elegida >= 0;
  const nombre = hayValor ? planas[elegida].etiqueta : (textoDeAyuda ?? '');
  const sinOpciones = planas.length === 0;
  // Con `deshabilitado` la lista no se dibuja ni un cuadro: el efecto de abajo solo
  // reconcilia el estado.
  const visible = abierto && !deshabilitado && !sinOpciones;

  // Una fila deshabilitada no recibe foco ni por puntero (comun.md §5.1): `tabindex="-1"`
  // admite el foco por clic, así que el `mousedown` se cancela. El toque no lo ve: la fila no
  // tiene `onPress`.
  const sinFoco = (nodo) => {
    if (nodo && !nodo.dataset.sinFoco && typeof nodo.addEventListener === 'function') {
      nodo.dataset.sinFoco = '1';
      nodo.addEventListener('mousedown', (e) => e.preventDefault());
    }
  };

  // Un `deshabilitado` que llega con la lista abierta (guardando) la cierra.
  useEffect(() => {
    if (deshabilitado && abierto) setAbierto(false);
  }, [deshabilitado, abierto]);

  // El foco sigue a la fila activa y el desplazamiento lo decide el componente: el
  // navegador alinearía al borde la fila a medias visible y recortaría su contorno. Al abrir,
  // la región deja centrada la elegida solo si no está a la vista (con su contorno) y la
  // página se mueve lo mínimo para mostrar la lámina completa; al navegar, la región se
  // desplaza lo justo para que la fila y su contorno queden dentro.
  useEffect(() => {
    if (!abierto) return;
    const fila = filas.current[activo];
    if (!fila || typeof fila.focus !== 'function') return;
    const alAbrir = centrar.current;
    centrar.current = false;
    fila.focus({ preventScroll: true });
    const region = fila.closest?.('[role="listbox"]');
    if (!region) return;
    const rf = fila.getBoundingClientRect();
    const rr = region.getBoundingClientRect();
    const sobra = rf.top - MARGEN_FOCO - rr.top;
    const falta = rf.bottom + MARGEN_FOCO - rr.bottom;
    const aLaVista = sobra >= 0 && falta <= 0;
    if (alAbrir && !aLaVista) {
      region.scrollTop += rf.top - rr.top - (region.clientHeight - rf.height) / 2;
    } else if (sobra < 0) {
      region.scrollTop += sobra;
    } else if (falta > 0) {
      region.scrollTop += falta;
    }
    if (alAbrir) {
      region.parentElement?.parentElement?.scrollIntoView?.({ block: 'nearest' });
    } else {
      // Ventana baja (zoom 200 %, teléfono horizontal): la fila con foco y su contorno
      // quedan dentro de la ventana, moviendo la página lo mínimo.
      fila.style.scrollMargin = `${MARGEN_FOCO}px`;
      fila.scrollIntoView?.({ block: 'nearest' });
    }
  }, [abierto, activo]);

  function devolverFoco() {
    if (disparador.current && typeof disparador.current.focus === 'function') disparador.current.focus();
  }

  function primeraDesde(i, paso) {
    for (let j = i; j >= 0 && j < planas.length; j += paso) if (habilitada(j)) return j;
    return null;
  }

  function abrir() {
    if (deshabilitado || sinOpciones) return;
    const inicial = hayValor && habilitada(elegida) ? elegida : primeraDesde(0, 1);
    if (inicial === null) return;
    centrar.current = true;
    setActivo(inicial);
    setAbierto(true);
  }

  function cerrar(conFoco) {
    setAbierto(false);
    if (conFoco) devolverFoco();
  }

  function elegir(i) {
    if (!habilitada(i)) return;
    const op = planas[i];
    cerrar(true);
    if (op.valor !== valor) alCambiar(op.valor);
  }

  // Siguiente fila habilitada desde `i`, sin vuelta en los extremos.
  const vecina = (i, paso) => primeraDesde(i + paso, paso) ?? i;

  // Re Pág / Av Pág: `PAGINA` filas en el sentido del gesto, sin pasar del extremo. Si el
  // destino está deshabilitado sigue en el mismo sentido y, solo si no queda ninguna,
  // vuelve hacia `i`; nunca retrocede de `i` ni sale en sentido contrario.
  const salto = (i, paso) => {
    const meta = Math.min(Math.max(i + paso * PAGINA, 0), planas.length - 1);
    const d = primeraDesde(meta, paso) ?? primeraDesde(meta, -paso);
    return d !== null && (d - i) * paso > 0 ? d : null;
  };

  function buscarPorTecla(tecla, i) {
    const b = busqueda.current;
    const ahora = Date.now();
    if (ahora - b.t > MS_BUFFER) b.texto = '';
    b.texto += tecla;
    b.t = ahora;
    const q = normalizar(b.texto);
    const desde = b.texto.length === 1 ? i + 1 : i;
    for (let k = 0; k < planas.length; k++) {
      const j = (desde + k) % planas.length;
      if (habilitada(j) && normalizar(planas[j].etiqueta).startsWith(q)) return j;
    }
    return null;
  }

  function alTeclearDisparador(e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!abierto) abrir();
    } else if (e.key === 'Escape' && abierto) {
      e.preventDefault();
      cerrar(true);
    }
  }

  function alTeclearFila(e, i) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const { key } = e;
    let destino = null;
    if (key === 'ArrowDown') destino = vecina(i, 1);
    else if (key === 'ArrowUp') destino = vecina(i, -1);
    else if (key === 'Home') destino = primeraDesde(0, 1);
    else if (key === 'End') destino = primeraDesde(planas.length - 1, -1);
    else if (key === 'PageDown') destino = salto(i, 1);
    else if (key === 'PageUp') destino = salto(i, -1);
    else if (key === 'Escape') {
      e.preventDefault();
      cerrar(true);
      return;
    } else if (key === 'Tab') {
      // El navegador mueve el foco (orden del DOM); la lista cierra después, para no
      // quitarle al foco su fila antes de que salga.
      setTimeout(() => cerrar(false), 0);
      return;
    } else if (key === ' ' && Date.now() - busqueda.current.t > MS_BUFFER) {
      e.preventDefault();
      elegir(i);
      return;
    } else if (ES_CARACTER.test(key)) {
      e.preventDefault();
      destino = buscarPorTecla(key, i);
    } else {
      return;
    }
    e.preventDefault();
    if (destino !== null && destino !== i) setActivo(destino);
  }

  let indice = -1;
  return (
    <View className={className} testID={testID}>
      <ControlMarco
        abierto={visible}
        popup="listbox"
        controla={idLista.current}
        deshabilitado={deshabilitado || sinOpciones}
        onPress={() => (visible ? cerrar(true) : abrir())}
        onKeyDown={alTeclearDisparador}
        registrar={(nodo) => { disparador.current = nodo; }}
        accessibilityLabel={`${accessibilityLabel}: ${nombre}`}
        className="w-full"
      >
        {({ texto, glifo, invertido, deshabilitado: inactivo }) => (
          <View className="-mx-1 flex-1 flex-row items-center justify-between gap-2 py-3">
            <Text
              className={`min-w-0 flex-1 font-plex-sans text-cuerpo ${
                hayValor || invertido || inactivo ? texto : 'text-tintaSec dark:text-tintaSecD'
              }`}
            >
              {nombre}
            </Text>
            {/* Chevron: abajo girado 90°, arriba girado 270° (comun.md §9). */}
            <View
              aria-hidden
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              className={visible ? '-rotate-90' : 'rotate-90'}
            >
              <Glifo
                id="glifo-chevron"
                size={GLIFO_CHICO}
                color={invertido || inactivo ? tema[glifo] : tema.tintaSec}
              />
            </View>
          </View>
        )}
      </ControlMarco>

      {visible && (
        <View className="mt-2">
          <Lamina testID="desplegable-lamina">
            <ScrollView
              nativeID={idLista.current}
              role="listbox"
              aria-label={accessibilityLabel}
              className={REGION}
              contentContainerClassName="p-1"
              showsVerticalScrollIndicator
            >
              {secciones.map((s) => {
                const cuerpo = s.opciones.map((op, k) => {
                  indice += 1;
                  const i = indice;
                  return (
                    <FilaLista
                      key={op.valor}
                      rol="option"
                      seleccionado={i === elegida}
                      deshabilitado={op.deshabilitado}
                      filete={k < s.opciones.length - 1}
                      tabIndex={i === activo && !op.deshabilitado ? 0 : -1}
                      registrar={(nodo) => {
                         filas.current[i] = nodo;
                         if (op.deshabilitado) sinFoco(nodo);
                       }}
                      onKeyDown={(e) => alTeclearFila(e, i)}
                      onPress={() => elegir(i)}
                    >
                      {({ texto, estado }) => (
                        <Text
                          className={`min-w-0 flex-1 px-3 py-2 text-cuerpo ${
                            estado === 'seleccionado' ? 'font-plex-sans-semibold' : 'font-plex-sans'
                          } ${texto}`}
                        >
                          {op.etiqueta}
                        </Text>
                      )}
                    </FilaLista>
                  );
                });
                if (!s.etiqueta) return <React.Fragment key={s.id}>{cuerpo}</React.Fragment>;
                return (
                  <View key={s.id} role="group" aria-label={s.etiqueta}>
                    <View className="flex-row items-center gap-1.5 border-b border-filete bg-fondo px-3 py-2 dark:border-fileteD dark:bg-fondoD">
                      {s.marca && <MarcaParcial indice={s.marca.indice} de={s.marca.de} />}
                      <Text className="font-plex-mono text-rotulo uppercase text-tintaSec dark:text-tintaSecD">
                        {s.etiqueta}
                      </Text>
                    </View>
                    {cuerpo}
                  </View>
                );
              })}
            </ScrollView>
          </Lamina>
        </View>
      )}
    </View>
  );
}
