// Página de prueba de la e2e (tareas 2.9 y 2.9b): renderiza cada componente de la Plancha
// y cada variante en estados fijos. Solo entra en un build hecho con
// EXPO_PUBLIC_PKAPP_PRUEBA=componentes (ver index.js de la raíz); en producción la rama se
// pliega y este archivo no se empaqueta (scripts/verificar-bundle.mjs lo comprueba).
//
// Cada control cuenta sus toques en `toques`: la e2e hace clic real y lee el contador.
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import {
  BotonRelleno, BotonMarco, ControlMarco, Segmento, CuadroPaso, TarjetaNavegable,
  FilaLista, Lamina, Desplegable, MarcaEstado, RotuloSeccion, Columna, Hoja, Regiones, FlujoColumnas,
} from '..';
import { useTokens } from '../Control';
import Glifo from '../../Glifo';
import DonationBox from '../../DonationBox';
import HeaderMarca from '../../HeaderMarca';
import BarraInterna from '../../BarraInterna';
import PaginaAvisos from './PaginaAvisos';

// Propiedades mínimas de navegación para las barras de prueba (sin volver, título fijo).
const BARRA = { options: { title: 'Barra' }, route: { name: 'Barra' }, navigation: {} };

const FILTRO = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'reales', etiqueta: 'Reales' },
  { valor: 'propias', etiqueta: 'Solo mías', deshabilitado: true },
];

const TEMA = [
  { valor: 'claro', etiqueta: 'Claro' },
  { valor: 'auto', etiqueta: 'Auto', deshabilitado: true },
  { valor: 'oscuro', etiqueta: 'Oscuro' },
];

// Desplegable plano: 12 filas con la 5.ª y la 10.ª deshabilitadas (saltos de Re Pág / Av Pág).
const DESP_PLANO = Array.from({ length: 12 }, (_, i) => ({
  valor: `f${i + 1}`, etiqueta: `Fila ${i + 1}`, deshabilitado: i === 4 || i === 9,
}));

// Desplegable con el bloque deshabilitado al final (la 8.ª a la 10.ª): Av Pág no tiene destino
// hacia abajo y vuelve a la última habilitada.
const DESP_BORDE = Array.from({ length: 10 }, (_, i) => ({
  valor: `b${i + 1}`, etiqueta: `Borde ${i + 1}`, deshabilitado: i >= 7,
}));

// Desplegable agrupado: dos grupos con marca de parcial; sin valor, muestra el texto de ayuda.
const DESP_GRUPOS = [
  { id: 'a', etiqueta: 'Grupo A', marca: { indice: 0, de: 3 },
    opciones: [{ valor: 'a1', etiqueta: 'Alfa uno' }, { valor: 'a2', etiqueta: 'Alfa dos', deshabilitado: true }] },
  { id: 'b', etiqueta: 'Grupo B', marca: { indice: 1, de: 3 },
    opciones: [{ valor: 'b1', etiqueta: 'Beta uno' }, { valor: 'b2', etiqueta: 'Beta dos' }] },
];

function Grupo({ titulo, children }) {
  return (
    <View className="gap-2 py-3">
      <RotuloSeccion>{titulo}</RotuloSeccion>
      <View className="flex-row flex-wrap items-start gap-2">{children}</View>
    </View>
  );
}

// El glifo de la tarjeta toma su color de `ilustracion` o de `glifo` (claves de `plancha`).
function Tarjeta({ testID, titulo, clave = 'ilustracion', ...resto }) {
  const tema = useTokens();
  return (
    <TarjetaNavegable testID={testID} accessibilityLabel={titulo} {...resto}>
      {(estado) => (
        <View className="flex-row items-center gap-2 p-3">
          <Glifo id="glifo-aleatorio" size={24} color={tema[estado[clave]]} />
          <Text className={`font-plex-sans-semibold text-cuerpo ${estado.texto}`}>{titulo}</Text>
        </View>
      )}
    </TarjetaNavegable>
  );
}

// Celdas del flujo por columnas: alto fijo (44 o 64) para que la e2e detecte una celda partida
// entre dos columnas (su caja mediría la unión de los dos trozos).
const CELDAS_FLUJO = Array.from({ length: 10 }, (_, i) => i + 1);

// Disposición de escritorio (comun.md §7.2): bloques fijos que la e2e mide a cada ancho.
// Van después de la columna de arriba, que sigue siendo la `columna` de siempre.
function PruebaEscritorio() {
  return (
    <>
      <Columna testID="col-lectura" ancho="lectura">
        <Text className="font-plex-sans text-cuerpo text-tinta dark:text-tintaD">Lectura</Text>
      </Columna>
      <Hoja testID="hoja-izquierda">
        <Regiones testID="regiones-izquierda">
          <Regiones.Lateral testID="lateral-izquierda">
            <BotonMarco testID="foco-a1" etiqueta="A1" onPress={() => {}} />
            <BotonMarco testID="foco-a2" etiqueta="A2" onPress={() => {}} />
          </Regiones.Lateral>
          <Regiones.Principal testID="principal-izquierda">
            <BotonMarco testID="foco-a3" etiqueta="A3" onPress={() => {}} />
            <BotonMarco testID="foco-a4" etiqueta="A4" onPress={() => {}} />
          </Regiones.Principal>
        </Regiones>
      </Hoja>
      <Hoja testID="hoja-derecha">
        <Regiones testID="regiones-derecha">
          <Regiones.Principal testID="principal-derecha">
            <BotonMarco testID="foco-b1" etiqueta="B1" onPress={() => {}} />
            <BotonMarco testID="foco-b2" etiqueta="B2" onPress={() => {}} />
          </Regiones.Principal>
          <Regiones.Lateral testID="lateral-derecha">
            <BotonMarco testID="foco-b3" etiqueta="B3" onPress={() => {}} />
          </Regiones.Lateral>
        </Regiones>
      </Hoja>
      <Hoja testID="hoja-amplia" ancho="hoja-amplia">
        <FlujoColumnas testID="flujo">
          {CELDAS_FLUJO.map((n) => (
            <View
              key={n}
              testID={`flujo-${n}`}
              className={`${n % 2 ? 'h-11' : 'h-16'} justify-center border border-linea dark:border-lineaD`}
            >
              <Text className="font-plex-sans text-cuerpo text-tinta dark:text-tintaD">{`Celda ${n}`}</Text>
            </View>
          ))}
        </FlujoColumnas>
      </Hoja>
      <HeaderMarca testID="header-columna" izquierda={<Text>Marca</Text>} />
      <HeaderMarca testID="header-hoja" ancho="hoja" izquierda={<Text>Marca</Text>} />
      <BarraInterna testID="barra-columna" {...BARRA} />
      <BarraInterna testID="barra-hoja-amplia" ancho="hoja-amplia" {...BARRA} />
    </>
  );
}

// `/?avisos` abre la página de la región de avisos (tarea 3.14c), aparte de la de componentes:
// así sus temporizadores no se mezclan con el recorrido por Tab de las demás pruebas.
export default function PaginaComponentes() {
  const avisos = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('avisos');
  return avisos ? <PaginaAvisos /> : <PaginaBase />;
}

function PaginaBase() {
  const [filtro, setFiltro] = useState('todas');
  const [tema, setTema] = useState('claro');
  const [toques, setToques] = useState({});
  const [despPlano, setDespPlano] = useState('f1');
  const [despGrupos, setDespGrupos] = useState(null);
  const [despBorde, setDespBorde] = useState('b1');
  const tocar = (id) => () => setToques((t) => ({ ...t, [id]: (t[id] || 0) + 1 }));

  return (
    <ScrollView className="flex-1 bg-fondo dark:bg-fondoD">
      <Columna testID="columna">
        <Text testID="pagina-componentes" className="font-plex-sans-semibold text-cuerpo text-tinta dark:text-tintaD">
          Componentes de la Plancha
        </Text>

        <Grupo titulo="K1 botón relleno">
          <BotonRelleno testID="k1" etiqueta="Siguiente" glifo="glifo-siguiente" onPress={tocar('k1')} />
          <BotonRelleno testID="k1-deshabilitado" etiqueta="Siguiente" onPress={tocar('k1-deshabilitado')} deshabilitado />
          <BotonRelleno testID="k1-grande" etiqueta="Grande" tamano="grande" onPress={tocar('k1-grande')} />
          <BotonRelleno testID="k1-amplio" etiqueta="Amplio" relleno="amplio" onPress={tocar('k1-amplio')} />
          <BotonRelleno testID="k1-detras" etiqueta="Detrás" glifo="glifo-siguiente" glifoPosicion="detras" onPress={tocar('k1-detras')} />
          <BotonRelleno
            testID="k1-extremo" etiqueta="Extremo" glifo="glifo-siguiente" glifoPosicion="extremo"
            className="w-full" onPress={tocar('k1-extremo')}
          />
        </Grupo>

        <Grupo titulo="K2 botón de marco">
          <BotonMarco testID="k2" etiqueta="Volver" glifo="glifo-volver" onPress={tocar('k2')} />
          <BotonMarco testID="k2-fondo" etiqueta="Cambiar" fondo="fondo" onPress={tocar('k2-fondo')} />
          <BotonMarco testID="k2-acento" etiqueta="Revisar" tono="acento" onPress={tocar('k2-acento')} />
          <BotonMarco testID="k2-peligro" etiqueta="Resetear" tono="peligro" onPress={tocar('k2-peligro')} />
          <BotonMarco testID="k2-deshabilitado" etiqueta="Volver" onPress={tocar('k2-deshabilitado')} deshabilitado />
          <BotonMarco testID="k2-detras" etiqueta="Código" glifo="glifo-externo" glifoPosicion="detras" onPress={tocar('k2-detras')} />
          <BotonMarco testID="k2-grande" etiqueta="Grande" tamano="grande" relleno="amplio" onPress={tocar('k2-grande')} />
        </Grupo>

        <Grupo titulo="K3 control de marco">
          <ControlMarco testID="k3" etiqueta="Reportar" onPress={tocar('k3')} seleccionado={false} />
          <ControlMarco testID="k3-seleccionado" etiqueta="Elegida" onPress={tocar('k3-seleccionado')} seleccionado />
          <ControlMarco testID="k3-deshabilitado" etiqueta="Reportar" onPress={tocar('k3-deshabilitado')} deshabilitado />
          <ControlMarco
            testID="k3-acierto" glifo="glifo-acierto" tono="acierto" seleccionado
            accessibilityLabel="Letra correcta" onPress={tocar('k3-acierto')}
          />
          <ControlMarco testID="k3-abierto" etiqueta="Plegable" abierto onPress={tocar('k3-abierto')} />
          <ControlMarco testID="k3-cerrado" etiqueta="Plegable" abierto={false} onPress={tocar('k3-cerrado')} />
          <ControlMarco testID="k3-primaria" etiqueta="Primaria" enfasis="primaria" onPress={tocar('k3-primaria')} />
          <ControlMarco testID="k3-grande" etiqueta="Grande" tamano="grande" relleno="amplio" onPress={tocar('k3-grande')} />
        </Grupo>

        <Grupo titulo="K4 segmento">
          <Segmento
            opciones={FILTRO}
            valor={filtro}
            alCambiar={(v) => { tocar(`k4:${v}`)(); setFiltro(v); }}
            accessibilityLabel="Filtro de prueba"
          />
          <Segmento
            forma="segmentado"
            opciones={TEMA}
            valor={tema}
            alCambiar={(v) => { tocar(`k4s:${v}`)(); setTema(v); }}
            accessibilityLabel="Segmentado de prueba"
          />
        </Grupo>

        <Grupo titulo="K5 cuadrado de paso">
          <CuadroPaso testID="k5" glifo="glifo-mas" onPress={tocar('k5')} accessibilityLabel="Más tiempo" />
          <CuadroPaso testID="k5-fondo" glifo="glifo-mas" fondo="fondo" onPress={tocar('k5-fondo')} accessibilityLabel="Más fondo" />
          <CuadroPaso testID="k5-deshabilitado" glifo="glifo-menos" onPress={tocar('k5-deshabilitado')} deshabilitado accessibilityLabel="Menos tiempo" />
        </Grupo>

        <Grupo titulo="K6 tarjeta navegable">
          <View className="w-full px-1 py-1">
            <Tarjeta testID="k6" titulo="Tarjeta" onPress={tocar('k6')} />
          </View>
          <View className="w-full px-1 py-1">
            <Tarjeta testID="k6-deshabilitado" titulo="Tarjeta apagada" onPress={tocar('k6-deshabilitado')} deshabilitado />
          </View>
          <View className="w-full px-1 py-1">
            <Tarjeta testID="k6-acento" titulo="Tarjeta de acento" variante="acento" clave="glifo" onPress={tocar('k6-acento')} />
          </View>
        </Grupo>

        <Grupo titulo="K7 fila de lista">
          <View className="w-full">
            <FilaLista testID="k7" onPress={tocar('k7')} filete>
              {({ texto }) => <Text className={`font-plex-sans text-cuerpo ${texto}`}>Fila</Text>}
            </FilaLista>
            <FilaLista testID="k7-deshabilitado" onPress={tocar('k7-deshabilitado')} deshabilitado>
              {({ texto }) => <Text className={`font-plex-sans text-cuerpo ${texto}`}>Fila apagada</Text>}
            </FilaLista>
          </View>
          <FilaLista testID="k7-glifo" onPress={tocar('k7-glifo')} glifo="glifo-volver" accessibilityLabel="Volver" />
          <FilaLista testID="k7-sec" onPress={tocar('k7-sec')} glifo="glifo-cerrar" tono="sec" accessibilityLabel="Quitar" />
          <FilaLista testID="k7-sec-texto" onPress={tocar('k7-sec-texto')} tono="sec">
            {({ texto }) => <Text className={`font-plex-sans text-cuerpo ${texto}`}>Quitar fila</Text>}
          </FilaLista>
        </Grupo>

        <Grupo titulo="Desplegable">
          <View className="w-full">
            <Desplegable
              testID="desp-plano"
              accessibilityLabel="Plano"
              opciones={DESP_PLANO}
              valor={despPlano}
              alCambiar={(v) => { tocar(`desp-plano:${v}`)(); setDespPlano(v); }}
            />
          </View>
          <View className="w-full">
            <Desplegable
              testID="desp-grupos"
              accessibilityLabel="Agrupado"
              grupos={DESP_GRUPOS}
              valor={despGrupos}
              textoDeAyuda="Elegí una opción"
              alCambiar={(v) => { tocar(`desp-grupos:${v}`)(); setDespGrupos(v); }}
            />
          </View>
          <View className="w-full">
            <Desplegable
              testID="desp-borde"
              accessibilityLabel="Borde"
              opciones={DESP_BORDE}
              valor={despBorde}
              alCambiar={(v) => { tocar(`desp-borde:${v}`)(); setDespBorde(v); }}
            />
          </View>
        </Grupo>

        <Grupo titulo="Pedido de donación (3.8)">
          <View className="w-full px-1 py-1">
            <DonationBox testID="don-normal" origen="prueba-normal" />
          </View>
          <View className="w-full px-1 py-1">
            <DonationBox testID="don-descartable" origen="prueba-descartable" descartable />
          </View>
          <View className="w-full px-1 py-1">
            <DonationBox testID="don-celebratoria" origen="prueba-celebratoria" celebratoria descartable />
          </View>
        </Grupo>

        <Grupo titulo="Lámina">
          <View className="w-full px-1 py-1">
            <Lamina testID="lamina">
              <View className="p-4"><Text className="font-plex-sans text-cuerpo text-tinta dark:text-tintaD">Cuerpo</Text></View>
              <Lamina.Divisor />
              <View className="p-4"><Text className="font-plex-sans text-cuerpo text-tinta dark:text-tintaD">Pie</Text></View>
            </Lamina>
          </View>
        </Grupo>

        <Grupo titulo="Marcas de estado">
          <MarcaEstado testID="marca-acierto" estado="acierto" texto="Correcta" />
          <MarcaEstado testID="marca-error" estado="error" texto="Incorrecta" />
          <MarcaEstado testID="marca-intermedia" estado="intermedia" texto="72 %" />
          <MarcaEstado testID="marca-detalle" estado="acierto" texto="Correctas" paso="detalle" />
          <MarcaEstado testID="marca-dato" estado="error" texto="12" paso="dato" />
          <MarcaEstado testID="marca-display" estado="intermedia" texto="72" paso="display" />
          <MarcaEstado testID="marca-sec" estado="acierto" texto="Correctas" colorTexto="tintaSec" />
        </Grupo>

        <Grupo titulo="Rótulos">
          <RotuloSeccion testID="rotulo-tintaSec">Secundario</RotuloSeccion>
          <RotuloSeccion testID="rotulo-acento" color="acento">Acento</RotuloSeccion>
        </Grupo>

        <Text testID="toques" className="font-plex-sans text-detalle text-tintaSec dark:text-tintaSecD">
          {JSON.stringify(toques)}
        </Text>
      </Columna>
      <PruebaEscritorio />
    </ScrollView>
  );
}
