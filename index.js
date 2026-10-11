import { registerRootComponent } from 'expo';
import App from './App';

// La e2e de componentes (tarea 2.9) arma un build aparte, con su propia caché de Metro,
// con esta variable y monta su página de prueba. Sin ella la condición se pliega al
// compilar y la página no entra al bundle de producción.
// scripts/verificar-bundle.mjs (último paso de `build:web`) falla si el bundle del shell
// contiene la marca de la página de prueba: cubre la variable olvidada y la caché envenenada.
if (process.env.EXPO_PUBLIC_PKAPP_PRUEBA === 'componentes') {
  registerRootComponent(require('./src/components/plancha/prueba/RaizPrueba').default);
} else {
  registerRootComponent(App);
}
