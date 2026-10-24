// Métricas del embudo de donación (Umami). Solo web; `track` es no-op sin Umami.
import { useEffect, useRef } from 'react';
import { track } from './track';

const SIMULACROS_KEY = 'pkapp_simulacros';
const VISTA_MIN_RATIO = 0.5;   // mitad del bloque visible
const VISTA_MIN_MS = 1000;     // durante 1 s seguido

// Simulacros terminados en este dispositivo, en rangos (sin ids ni datos personales).
export function rangoUso(n) {
  if (n <= 0) return '0';
  if (n === 1) return '1';
  if (n <= 5) return '2-5';
  if (n <= 20) return '6-20';
  return '21+';
}

function leerSimulacros() {
  try {
    if (typeof localStorage === 'undefined') return 0;
    const n = Math.floor(Number(localStorage.getItem(SIMULACROS_KEY)));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

// Rango de uso con los simulacros terminados hasta ahora.
export function usoActual() {
  return rangoUso(leerSimulacros());
}

// Rango de uso en Results: incluye el simulacro que se acaba de terminar, que
// `contarSimulacro` suma después. Así Results y MateriaSelect, justo después,
// caen en el mismo rango.
export function usoTrasTerminar() {
  return rangoUso(leerSimulacros() + 1);
}

// Suma un simulacro terminado. Llamar una sola vez por simulacro.
export function contarSimulacro() {
  try {
    localStorage.setItem(SIMULACROS_KEY, String(leerSimulacros() + 1));
  } catch {}
}

// Manda `donacion_vista` cuando el bloque (ref a un View) queda al menos 50 %
// visible durante 1 s seguido; una sola vez por montaje, o por `yaEnviada`
// (ref del padre) si el bloque se remonta dentro del mismo pedido. Si sale de
// la vista antes de 1 s, el reloj se reinicia. `datos` puede ser una función:
// se evalúa al enviar, no al montar.
export function useDonacionVista(ref, datos, yaEnviada) {
  const datosRef = useRef(datos);
  datosRef.current = datos;
  const propia = useRef(false);
  const enviada = yaEnviada || propia;

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const el = ref.current;
    if (!el || enviada.current) return undefined;
    let timer = null;
    const observer = new IntersectionObserver((entradas) => {
      const e = entradas[entradas.length - 1];
      const visible = e.isIntersecting && e.intersectionRatio >= VISTA_MIN_RATIO;
      if (visible && timer === null) {
        timer = setTimeout(() => {
          enviada.current = true;
          observer.disconnect();
          const d = datosRef.current;
          track('donacion_vista', typeof d === 'function' ? d() : d);
        }, VISTA_MIN_MS);
      } else if (!visible && timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    }, { threshold: [0, VISTA_MIN_RATIO, 1] });
    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);
}
