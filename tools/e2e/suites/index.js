// Reúne las suites por superficie. Cada archivo exporta una lista de
// { nombre, correr }; `comunes.js` solo guarda ayudantes y no corre nada.
//
// Una superficie nueva se agrega acá: un archivo y una línea.

const SUPERFICIES = [
  'materias', 'home', 'temas', 'quiz', 'resultados', 'estadisticas', 'ajustes', 'agregar',
];

const porSuperficie = {};
for (const nombre of SUPERFICIES) porSuperficie[nombre] = require('./' + nombre);

// Sin `--suite`, el orden es el que tenía `tools/e2e/suites.js` antes de partirse por
// superficie: el Chrome es uno solo y algunas suites asumen lo que dejó la anterior.
// Las suites que no estén acá (las de tareas nuevas) corren después, en el orden de
// SUPERFICIES.
const ORDEN = [
  'elegir materia sin rebotar al selector',
  'el selector muestra seis materias',
  'atrás y adelante del navegador',
  'confirmación al abandonar un quiz',
  'la X del quiz pregunta una sola vez',
  'URLs profundas abiertas en frío',
  'terminar un quiz no pide confirmación',
  'dre: examen de 50 sin filtro de parcial',
  'ryd: examen de 20 sin filtro de parcial',
  'HeaderMarca: control Claro | Oscuro',
  'HeaderMarca: mismo alto en MateriaSelect y Home',
  'HeaderMarca: sin scroll horizontal y corte de 360 px',
  'Barra interna: mismo alto con y sin volver, quiz sin barra',
  'Barra interna: el volver hace goBack',
  'Barra interna: quiz sin barra y el atrás confirma',
  'HeaderMarca: teclado del control Claro | Oscuro',
  'HeaderMarca: control negativo del desborde',
  'HeaderMarca: hover sin halo ni box-shadow',
  'Ilustracion: svg del DOM conserva atributos y estructura',
];

const rango = (suite) => {
  const i = ORDEN.indexOf(suite.nombre);
  return i === -1 ? ORDEN.length : i;
};

const todas = SUPERFICIES.flatMap((nombre) => porSuperficie[nombre])
  .map((suite, i) => ({ suite, i }))
  .sort((a, b) => rango(a.suite) - rango(b.suite) || a.i - b.i)
  .map(({ suite }) => suite);

module.exports = { SUPERFICIES, porSuperficie, todas };
