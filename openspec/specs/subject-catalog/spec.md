# subject-catalog Specification

## Purpose
Define qué materias de ESFUNO ofrece la app y cómo se presenta cada una: su tarjeta
en el selector, el tamaño del examen simulado, si tiene parciales y cómo se carga su
banco de preguntas.

## Requirements

### Requirement: Materia Digestivo, Renal y Endócrino
La app SHALL ofrecer la materia Digestivo, Renal y Endócrino con id `dre`, nombre
"Digestivo, Renal y Endócrino", sigla "DRE", una tarjeta con imagen propia y un
banco de preguntas extraídas de exámenes reales.

#### Scenario: La materia aparece en el selector
- **WHEN** el usuario abre la pantalla de selección de materias
- **THEN** ve la tarjeta de Digestivo, Renal y Endócrino con su imagen y la cantidad
  de preguntas de su banco

#### Scenario: Examen simulado de tamaño real
- **WHEN** el usuario inicia un examen simulado de DRE
- **THEN** el examen tiene 50 preguntas, la misma cantidad que el tramo de DRE en
  los exámenes reales

#### Scenario: Sin filtro de parcial
- **WHEN** el usuario elige temas en DRE
- **THEN** no se ofrece el filtro de parcial, porque la materia no tiene parciales

### Requirement: Materia Reproductor y Desarrollo
La app SHALL ofrecer la materia Reproductor y Desarrollo con id `ryd`, nombre
"Reproductor y Desarrollo", sigla "RyD", una tarjeta con imagen propia y un banco
de preguntas extraídas de exámenes reales.

#### Scenario: La materia aparece en el selector
- **WHEN** el usuario abre la pantalla de selección de materias
- **THEN** ve la tarjeta de Reproductor y Desarrollo con su imagen y la cantidad de
  preguntas de su banco

#### Scenario: Examen simulado de tamaño real
- **WHEN** el usuario inicia un examen simulado de RyD
- **THEN** el examen tiene 20 preguntas, la misma cantidad que el tramo de RyD en
  los exámenes reales

#### Scenario: Sin filtro de parcial
- **WHEN** el usuario elige temas en RyD
- **THEN** no se ofrece el filtro de parcial, porque la materia no tiene parciales

### Requirement: Identificador de materia permanente
El id de una materia publicada MUST NOT cambiar, porque es la clave con la que el
navegador de cada usuario guarda su progreso.

#### Scenario: Progreso aislado por materia
- **WHEN** el usuario responde preguntas de `dre` o `ryd`
- **THEN** sus estadísticas se guardan bajo claves con ese id y no alteran las de
  ninguna otra materia

### Requirement: Banco cargado a demanda
El banco de preguntas de cada materia SHALL descargarse recién cuando el usuario la
elige, no al abrir la app.

#### Scenario: Abrir la app sin elegir materia
- **WHEN** el usuario abre la app y todavía no eligió materia
- **THEN** no se descarga el banco de `dre` ni el de `ryd`, y el selector igual
  muestra la cantidad de preguntas de cada una

### Requirement: Origen visible de las preguntas
Toda pregunta de `dre` y `ryd` SHALL declarar su origen como pregunta de examen
real e indicar de qué examen proviene.

#### Scenario: Pregunta extraída de un examen
- **WHEN** el usuario ve una pregunta de DRE o RyD
- **THEN** la pregunta figura como de examen real e identifica su examen de origen
