// Aspecto compartido de K3 y K4 (comun.md §5.2): fondo `superficie`, borde `borde`.
// El hover cambia el color del borde a `linea`, sin cambiar el grosor. `abierto` es el
// plegable expandido de K3: borde `linea`, mismo fondo, sin inversión.
const INVERTIDO = {
  caja: 'bg-tinta border-tinta dark:bg-tintaD dark:border-tintaD',
  texto: 'text-fondo dark:text-fondoD',
  glifo: 'fondo',
};

export const ASPECTO_MARCO_BORDE = {
  reposo: {
    caja: 'bg-superficie border-borde dark:bg-superficieD dark:border-bordeD',
    texto: 'text-tinta dark:text-tintaD',
    glifo: 'tinta',
  },
  hover: {
    caja: 'bg-superficie border-linea dark:bg-superficieD dark:border-lineaD',
    texto: 'text-tinta dark:text-tintaD',
    glifo: 'tinta',
  },
  presionado: INVERTIDO,
  seleccionado: INVERTIDO,
  abierto: {
    caja: 'bg-superficie border-linea dark:bg-superficieD dark:border-lineaD',
    texto: 'text-tinta dark:text-tintaD',
    glifo: 'tinta',
  },
  deshabilitado: {
    caja: 'bg-superficie border-filete dark:bg-superficieD dark:border-fileteD',
    texto: 'text-inactivo dark:text-inactivoD',
    glifo: 'inactivo',
  },
};
