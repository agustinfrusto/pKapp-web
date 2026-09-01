## Purpose

Establece una fuente única de verdad para los valores visuales de pKapp —color, tipografía, espaciado, radios y elevación— y las reglas que gobiernan cómo las pantallas los consumen, de modo que la estética sobria y clínica de la app sea una propiedad verificable del sistema y no el resultado de copiar literales a mano en cada archivo.

## ADDED Requirements

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

#### Scenario: Comparación antes y después del piloto

- **WHEN** se compara una superficie del piloto contra su versión previa en el navegador
- **THEN** no se observan diferencias de color, espaciado, tipografía ni jerarquía visual que no estén declaradas como intencionales

#### Scenario: Diferencia visual no declarada

- **WHEN** aparece una diferencia visual que el change no declaró
- **THEN** se trata como defecto y se corrige antes de dar el piloto por terminado, en vez de aceptarla como el nuevo aspecto

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
