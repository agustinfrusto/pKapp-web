// Página de prueba de la región de avisos (tarea 3.14c). Se abre con `/?avisos` en un build
// hecho con EXPO_PUBLIC_PKAPP_PRUEBA=componentes (no se publica; ver PaginaComponentes.js).
//
// Cuatro regiones con avisos de muestra (uno, dos, tres y tres con uno no descartable) y la
// espera corta que Q4 de D11 reserva para esta página: `?espera=<ms>` (1500 por defecto).
// Los ids de muestra llevan el prefijo de su región (`tres-muestra-nota`): son únicos en la
// página. La excepción es `espejo-doble`: un aviso de `['materias', 'home']` en dos regiones
// montadas a la vez, con el mismo `id` a propósito (descarte compartido, 3.14d N5); y `ancla`,
// los mismos tres avisos en dos regiones (re-anclaje por `id`, 3.14e).
// Tras cada región hay un control, para comprobar a dónde va el foco cuando se descarta el
// último aviso. «Reiniciar» borra los descartes y vuelve a montar las regiones.
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import RegionAvisos, { olvidarDescartes } from '../../RegionAvisos';
import { BotonMarco, Columna } from '..';

const CORREO = 'pkappsoporte@gmail.com';

const NOTA = {
  id: 'muestra-nota',
  rotulo: 'Una nota del creador',
  glifo: 'glifo-mensaje',
  parrafos: ['¡Hola! Ya están las seis materias. Ahora estoy trabajando en la estética de la página, así que en las próximas semanas vas a ir viendo cambios en el diseño. ¡Gracias por la paciencia!'],
  pantallas: ['materias'],
  descartable: true,
};
const PROPIAS = {
  id: 'muestra-propias',
  rotulo: 'Novedades',
  glifo: 'glifo-explicacion',
  parrafos: ['Ya podés agregar tus propias preguntas y repasarlas con el filtro «Solo mías» del selector de temas.'],
  pantallas: ['materias'],
  descartable: true,
};
const CONTACTO = {
  id: 'muestra-contacto',
  rotulo: 'Ayudame a mejorar',
  glifo: 'glifo-mensaje',
  parrafos: ['Si encontraste un error en una pregunta o tenés una idea para la app, escribime a'],
  contacto: CORREO,
  pantallas: ['materias'],
  descartable: true,
};
const FIJA = {
  id: 'muestra-fija',
  rotulo: 'Aviso del sistema',
  glifo: 'glifo-mensaje',
  parrafos: ['Este mensaje no se puede descartar: se retira solo cuando vence su vigencia.'],
  pantallas: ['materias'],
  descartable: false,
};

// Un aviso de `['materias', 'home']`: `native-stack` deja MateriaSelect montada bajo Home, así
// que vive en dos regiones a la vez y comparte `id`. Descartarlo en una lo quita de la otra.
const DOBLE = {
  id: 'espejo-doble',
  rotulo: 'Aviso en dos pantallas',
  glifo: 'glifo-explicacion',
  parrafos: ['Se muestra en Materias y en Home: descartarlo en una lo quita de la otra.'],
  pantallas: ['materias', 'home'],
  descartable: true,
};

// Tres avisos de `['materias', 'home']` en dos regiones: descartar uno en una no tiene que
// cambiar la nota que la otra estaba mostrando (3.14e, re-anclaje por `id`).
const ANCLA = ['x', 'y', 'z'].map((k) => ({
  id: `ancla-${k}`,
  rotulo: `Aviso ${k.toUpperCase()}`,
  glifo: 'glifo-mensaje',
  parrafos: [`Aviso ${k.toUpperCase()} de la prueba del ancla.`],
  pantallas: ['materias', 'home'],
  descartable: true,
}));

const REGIONES = [
  { clave: 'uno', lista: [NOTA] },
  { clave: 'dos', lista: [NOTA, PROPIAS] },
  { clave: 'tres', lista: [NOTA, PROPIAS, CONTACTO] },
  { clave: 'fija', lista: [FIJA, PROPIAS, CONTACTO] },
];

function esperaDeLaUrl() {
  const v = Number(new URLSearchParams(window.location.search).get('espera'));
  return Number.isFinite(v) && v > 0 ? v : 1500;
}

export default function PaginaAvisos() {
  const [vuelta, setVuelta] = useState(0);
  const [espera] = useState(esperaDeLaUrl);

  function reiniciar() {
    Object.keys(localStorage).filter((k) => k.startsWith('pkapp_aviso_')).forEach((k) => localStorage.removeItem(k));
    olvidarDescartes();
    setVuelta((v) => v + 1);
  }

  return (
    <ScrollView className="flex-1 bg-fondo dark:bg-fondoD">
      <Columna testID="columna-avisos">
        <Text testID="pagina-avisos" className="py-3 font-plex-sans-semibold text-cuerpo text-tinta dark:text-tintaD">
          Región de avisos
        </Text>
        <BotonMarco testID="avisos-reiniciar" etiqueta="Reiniciar" onPress={reiniciar} className="mb-3 self-start" />
        {REGIONES.map(({ clave, lista }) => (
          <View key={`${clave}-${vuelta}`} testID={`bloque-${clave}`}>
            <RegionAvisos
              pantalla="materias"
              lista={lista.map((a) => ({ ...a, id: `${clave}-${a.id}` }))}
              espera={() => espera}
              testID={`avisos-${clave}`}
            />
            <BotonMarco testID={`despues-${clave}`} etiqueta={`Después de ${clave}`} onPress={() => {}} className="mb-6 self-start" />
          </View>
        ))}
        <View key={`espejo-${vuelta}`} testID="bloque-espejo">
          {['materias', 'home'].map((pantalla) => (
            <View key={pantalla} testID={`espejo-${pantalla}`}>
              <RegionAvisos pantalla={pantalla} lista={[DOBLE]} espera={() => espera} testID={`avisos-espejo-${pantalla}`} />
            </View>
          ))}
        </View>
        <View key={`ancla-${vuelta}`} testID="bloque-ancla">
          {['materias', 'home'].map((pantalla) => (
            <View key={pantalla} testID={`ancla-${pantalla}`}>
              <RegionAvisos pantalla={pantalla} lista={ANCLA} espera={() => espera} testID={`avisos-ancla-${pantalla}`} />
            </View>
          ))}
        </View>
      </Columna>
    </ScrollView>
  );
}
