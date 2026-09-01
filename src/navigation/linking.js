// Configuracion de deep linking para web.
//
// Sin esto React Navigation nunca toca la History API: toda la app vive en "/"
// y el boton atras del navegador saca al usuario del sitio. Cada pantalla pasa
// a tener su propia URL, asi que atras/adelante del navegador recorren el stack.
//
// Solo se habilita en web: en nativo no hay `scheme` declarado en app.json y el
// deep linking del sistema no forma parte de este cambio.
import { Platform } from 'react-native';

// getPathFromState vuelca en el query string todo param que no aparezca en el
// path. Quiz recibe el array entero de preguntas y Results el de respuestas, asi
// que sin frenarlo la URL cargaria el banco completo. Devolver la cadena
// 'undefined' es la senal que usa getPathFromState para descartar el param.
const sinQuery = (claves) =>
  Object.fromEntries(claves.map((clave) => [clave, () => 'undefined']));

export const linking = {
  enabled: Platform.OS === 'web',
  prefixes: [],
  config: {
    screens: {
      MateriaSelect: '',
      Home: 'inicio',
      TopicSelect: 'temas/:mode',
      Quiz: {
        path: 'quiz',
        stringify: sinQuery(['questions', 'mode', 'topic', 'hideFeedback', 'timerMinutes']),
      },
      Results: {
        path: 'resultados',
        stringify: sinQuery(['answers', 'topic', 'mode']),
      },
      AddQuestion: 'agregar',
      Stats: 'estadisticas',
      Settings: 'ajustes',
    },
  },
};

export default linking;
