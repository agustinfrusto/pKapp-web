// Fundido de entrada (Quiz.md c.5, REV-1): `opacity` de 0 a 1 en 150 ms con la Web Animations
// API, calculado por el compositor. Sin `fill`: al terminar no queda estilo residual.
//
// `useEntrada(ref, clave, { soloDesplazar })` anima el nodo de `ref` cada vez que cambia `clave`
// (salvo en el montaje de la pantalla). Una pieza que aparece al responder usa como clave el
// estado que la monta: su ref ya está puesto cuando corre el efecto, y si aún no existe no hace
// nada. `soloDesplazar` anima `translateY(8px)` a `none`, sin `opacity` (el contenido de la
// barra inferior: su lámina entra con fundido y no se mueve, así su alto sigue reservado en el
// mismo cuadro).
//
// No hace nada fuera de la web, con `prefers-reduced-motion: reduce` ni sin `el.animate`.
// Sin librerías de animación, cuadro a cuadro en JS ni temporizadores. Efecto de layout: el primer
// cuadro pintado ya es el keyframe 0, sin destello a opacidad 1.
import { useLayoutEffect, useRef } from 'react';
import { Platform } from 'react-native';

const DURACION_MS = 150;
const CURVA = 'cubic-bezier(0,0,0.2,1)';

const FUNDIDO = [{ opacity: 0 }, { opacity: 1 }];
const SOLO_DESPLAZAMIENTO = [
  { transform: 'translateY(8px)' },
  { transform: 'none' },
];

export default function useEntrada(ref, clave, { soloDesplazar = false } = {}) {
  const montaje = useRef(true);
  useLayoutEffect(() => {
    if (montaje.current) {
      montaje.current = false;
      return undefined;
    }
    if (Platform.OS !== 'web') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const el = ref.current;
    if (!el || typeof el.animate !== 'function') return undefined;
    const animacion = el.animate(soloDesplazar ? SOLO_DESPLAZAMIENTO : FUNDIDO, {
      duration: DURACION_MS,
      easing: CURVA,
    });
    return () => animacion.cancel();
  }, [clave]);
}
