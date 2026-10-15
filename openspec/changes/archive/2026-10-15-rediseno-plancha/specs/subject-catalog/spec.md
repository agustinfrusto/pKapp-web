## ADDED Requirements

### Requirement: Ilustración propia por materia

Toda materia registrada en `src/materias/index.js` SHALL tener una ilustración vectorial propia, monocroma y con el color tomado del tema activo. Registrar una materia sin ilustración SHALL considerarse incompleto.

#### Scenario: Selector en tema oscuro

- **WHEN** el usuario abre el selector de materias en tema oscuro
- **THEN** cada tarjeta muestra la ilustración de su materia en el color de trazo del tema oscuro, sin restos del claro

#### Scenario: Materia nueva

- **WHEN** se agrega una materia al registro
- **THEN** su carpeta incluye la ilustración, y el selector la muestra sin tocar código compartido

### Requirement: Conteos reales en el selector

El selector de materias SHALL mostrar para cada materia los conteos que surgen de su banco publicado. NO SHALL mostrar conteos ilustrativos ni rótulos de "en preparación" para una materia registrada.

#### Scenario: Tarjeta de una materia publicada

- **WHEN** el selector muestra la tarjeta de `dre` o de `ryd`
- **THEN** el conteo es el que genera `scripts/gen-conteos.mjs` para esa materia
