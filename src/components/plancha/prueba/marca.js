// Marca de la página de prueba (tarea 2.9b). La monta RaizPrueba como atributo de datos.
// scripts/verificar-bundle.mjs lee esta constante y falla `build:web` si el bundle del
// shell la contiene: es la defensa contra una página de prueba como raíz de producción.
// Una cadena literal sobrevive a la minificación; el nombre de un componente no.
export const MARCA_PAGINA_PRUEBA = 'pkapp-pagina-de-prueba';
