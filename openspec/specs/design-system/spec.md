# design-system Specification

## Purpose
Establece una fuente única de verdad para los valores visuales de pKapp —color, tipografía, espaciado, radios y elevación— y las reglas que gobiernan cómo las pantallas los consumen, de modo que la estética sobria y clínica de la app sea una propiedad verificable del sistema y no el resultado de copiar literales a mano en cada archivo.

## Requirements

### Requirement: Fuente única de valores visuales

El sistema SHALL declarar todos los valores visuales compartidos —colores, familias y escalas tipográficas, espaciados, radios de borde y niveles de elevación— en una única definición central. Las pantallas y componentes migrados SHALL referirse a esos valores por nombre y NO SHALL contener literales visuales propios.

#### Scenario: Cambiar el color de marca

- **WHEN** se modifica el valor del token de color de marca en la definición central
- **THEN** todas las superficies migradas reflejan el color nuevo sin editar ningún archivo de pantalla

#### Scenario: Literal visual en una pantalla migrada

- **WHEN** una pantalla ya migrada introduce un color, radio o espaciado como valor literal en vez de usar un token
- **THEN** eso se considera un defecto del change y debe reemplazarse por el token correspondiente

### Requirement: Cobertura completa del inventario visual

El conjunto de tokens SHALL derivarse del inventario de valores visuales de las nueve superficies existentes de la app, no solo de las incluidas en el piloto. Todo valor visual actualmente en uso SHALL tener un token que lo represente o una justificación registrada de por qué se descarta o se unifica con otro.

#### Scenario: Valor sin token al migrar una pantalla posterior

- **WHEN** una pantalla migrada después del piloto necesita un valor visual que ningún token cubre
- **THEN** eso indica que el inventario fue incompleto y el token faltante se agrega a la definición central, nunca como literal en la pantalla

#### Scenario: Colores duplicados con el mismo rol

- **WHEN** el inventario detecta varios literales distintos cumpliendo el mismo rol visual
- **THEN** se unifican en un único token y la decisión queda registrada junto con los valores que reemplaza

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

### Requirement: Significado estable de los estados semánticos

El sistema SHALL definir tokens semánticos con significado fijo para acierto, error y aviso. Ese significado NO SHALL variar entre pantallas: el mismo estado se comunica con el mismo token en toda la app.

#### Scenario: Respuesta correcta e incorrecta en el quiz

- **WHEN** el quiz marca una respuesta como correcta o incorrecta
- **THEN** usa los tokens semánticos de acierto y error, los mismos que cualquier otra superficie emplea para esos estados

### Requirement: Distinciones de contenido siempre visibles

El sistema visual NO SHALL borrar ni volver ambiguas las distinciones de contenido que la app hoy comunica al usuario, en particular el origen de una pregunta —extraída de un examen real frente a generada a partir de apuntes— y el aviso de banco reducido de una materia.

#### Scenario: Pregunta generada tras migrar una pantalla

- **WHEN** una pantalla migrada muestra una pregunta de origen generado
- **THEN** su origen sigue siendo distinguible a simple vista, sin presentarse como si fuera de un examen real

### Requirement: Contraste legible

Todo par de color de texto sobre fondo definido en los tokens SHALL alcanzar una relación de contraste de al menos 4.5:1 para texto normal y 3:1 para texto grande. Los pares que no lo alcancen SHALL corregirse o registrarse con su justificación antes de publicarse.

#### Scenario: Par de tokens con contraste insuficiente

- **WHEN** se mide un par texto/fondo de la paleta y queda por debajo del umbral
- **THEN** se ajusta el token o se registra la excepción con su motivo, y no se publica sin una de las dos cosas

### Requirement: Presupuesto de peso del build web

La adopción del sistema de estilos SHALL mantener el build web dentro de un presupuesto de peso declarado, medido contra la línea de base previa al change. Un aumento que exceda ese presupuesto SHALL bloquear la migración de las pantallas restantes hasta que se resuelva.

#### Scenario: El piloto excede el presupuesto

- **WHEN** el build web del piloto supera el presupuesto declarado respecto de la línea de base
- **THEN** la migración de las pantallas restantes queda bloqueada y el exceso se reporta con su medición

### Requirement: Convivencia durante la transición

Mientras la migración esté incompleta, las superficies migradas y las no migradas SHALL coexistir en la misma app sin degradarse entre sí. Una superficie no migrada SHALL seguir funcionando y viéndose exactamente como antes del change.

#### Scenario: Navegación entre una pantalla migrada y una que no

- **WHEN** el usuario navega desde una pantalla ya migrada hacia una que todavía no lo está
- **THEN** ambas se renderizan correctamente y la no migrada conserva su apariencia previa

### Requirement: Preservación del comportamiento no visual

El change SHALL limitarse a la presentación. NO SHALL alterar el progreso almacenado del usuario, el formato de los datos locales, la resolución de módulos por plataforma ni la capacidad de generar un build web funcional.

#### Scenario: Progreso del usuario tras actualizar

- **WHEN** un usuario con progreso guardado abre la versión con el sistema de tokens
- **THEN** su progreso, sus preguntas propias y sus ajustes siguen intactos y accesibles

#### Scenario: Build web tras integrar el sistema de estilos

- **WHEN** se genera el build web con el sistema de estilos ya integrado
- **THEN** el build se completa y la app resultante carga y funciona, con la resolución por plataforma de la capa de datos intacta

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
