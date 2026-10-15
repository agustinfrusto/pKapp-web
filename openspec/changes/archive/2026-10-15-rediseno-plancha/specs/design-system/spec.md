## MODIFIED Requirements

### Requirement: Paridad visual en cada migración

Migrar una superficie al sistema de tokens SHALL preservar su apariencia. La superficie migrada SHALL verse igual que antes de migrarla, salvo por diferencias que el change declare explícitamente como intencionales.

Un change de rediseño declarado reemplaza la paridad con la versión previa por la conformidad con la ficha aprobada de cada superficie. La ficha es la declaración de las diferencias intencionales: lo que la superficie muestre fuera de su ficha SHALL tratarse como defecto.

#### Scenario: Comparación antes y después del piloto

- **WHEN** se compara una superficie del piloto contra su versión previa en el navegador
- **THEN** no se observan diferencias de color, espaciado, tipografía ni jerarquía visual que no estén declaradas como intencionales

#### Scenario: Diferencia visual no declarada

- **WHEN** aparece una diferencia visual que el change no declaró
- **THEN** se trata como defecto y se corrige antes de dar el piloto por terminado, en vez de aceptarla como el nuevo aspecto

#### Scenario: Superficie rediseñada que se aparta de su ficha

- **WHEN** una superficie rediseñada muestra un elemento, estado o valor que su ficha aprobada no contempla
- **THEN** se trata como defecto y vuelve a la tarea de esa superficie, en vez de aceptarse como parte del rediseño

## ADDED Requirements

### Requirement: Estados semánticos distinguibles sin color

Los estados de acierto, error y la banda intermedia de rendimiento SHALL distinguirse por un rasgo además del color: forma, posición, marca o texto. Una persona que no distingue rojo de verde SHALL poder leer el mismo estado que cualquier otra.

#### Scenario: Respuesta incorrecta en escala de grises

- **WHEN** la pantalla del quiz o de resultados se ve sin color
- **THEN** la respuesta incorrecta sigue siendo distinguible de la correcta

#### Scenario: Bandas de estadísticas

- **WHEN** las estadísticas muestran temas con ≥ 80 %, entre 60 % y 79 % y < 60 %
- **THEN** las tres bandas se distinguen entre sí sin depender solo del color, y sus cortes siguen siendo 80 y 60

### Requirement: Interfaz sin emojis

La interfaz de la app NO SHALL usar emojis como íconos, rótulos ni decoración. Cada emoji que la interfaz muestra SHALL reemplazarse por un glifo vectorial (SVG) dibujado con el lenguaje del sistema visual y sus referencias de diseño; el texto puede acompañar al glifo, pero no lo sustituye. El contenido de los bancos de preguntas queda fuera de este requisito.

#### Scenario: Búsqueda de emojis en la UI

- **WHEN** se buscan caracteres emoji en `src/screens/`, `src/components/` y `App.js`
- **THEN** no aparece ninguno

#### Scenario: Emoji retirado de un botón

- **WHEN** una superficie migrada muestra un control que antes llevaba un emoji
- **THEN** en su lugar aparece el glifo SVG que le asigna su ficha, en el color del tema activo

### Requirement: Presupuesto de recursos visuales

Las fuentes y las ilustraciones SHALL respetar un presupuesto de peso declarado por el change que las incorpora, medido aparte del bundle de código. Mientras se cargan las fuentes propias, la app SHALL renderizar con la fuente del sistema y NO SHALL mostrar una pantalla vacía.

#### Scenario: Primera carga con red lenta

- **WHEN** la app abre antes de que terminen de descargarse las fuentes
- **THEN** el contenido se muestra con la fuente del sistema y cambia a la propia cuando termina la descarga

#### Scenario: Falla la carga de una fuente

- **WHEN** una fuente propia no se puede cargar
- **THEN** la app sigue funcionando con la fuente del sistema, sin mostrar un error
