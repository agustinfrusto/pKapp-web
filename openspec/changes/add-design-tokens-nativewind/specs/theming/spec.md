## Purpose

Gobierna la selección y persistencia del tema visual de pKapp: qué opciones tiene el usuario, dónde alcanza el control, cómo se recuerda su elección entre sesiones y bajo qué condición el control puede exponerse, de modo que nadie termine con la mitad de la app en claro y la otra mitad en oscuro.

## ADDED Requirements

### Requirement: Control de tema binario y de alcance inmediato

La app SHALL ofrecer un control de tema binario —claro u oscuro— alcanzable en un solo gesto desde las pantallas de entrada, sin entrar a Ajustes. El estado por defecto para un usuario que nunca lo tocó SHALL ser claro: nadie SHALL encontrarse la app en oscuro sin haberlo pedido.

La app NO SHALL cambiar de tema por su cuenta siguiendo la preferencia del sistema operativo.

#### Scenario: Usuario activa el tema oscuro

- **WHEN** el usuario activa el control de tema
- **THEN** todas las superficies pasan a su paleta oscura de inmediato, sin recargar la app

#### Scenario: Usuario que nunca tocó el control

- **WHEN** un usuario abre la app por primera vez, sin preferencia guardada
- **THEN** la app se muestra en tema claro, sea cual sea la preferencia del sistema operativo

#### Scenario: El control está donde se lo necesita

- **WHEN** el usuario está en cualquiera de las pantallas de entrada de la app
- **THEN** el control de tema es visible y accionable ahí mismo, sin navegar a otra pantalla

### Requirement: Persistencia de la preferencia de tema

La preferencia de tema SHALL persistir entre sesiones en el dispositivo del usuario y SHALL ser global a todas las materias. Su ausencia o invalidez NO SHALL producir un error: una preferencia no guardada, o guardada con un valor que ya no existe, SHALL resolverse al valor por defecto.

#### Scenario: Reapertura de la app

- **WHEN** el usuario elige un tema, cierra la app y la vuelve a abrir
- **THEN** la app arranca con el tema que había elegido

#### Scenario: Usuario con progreso previo al change

- **WHEN** un usuario con datos guardados de antes de este change abre la versión nueva, o con una preferencia guardada que ya no es válida
- **THEN** la app arranca sin error con el tema por defecto, y su progreso, sus preguntas propias y sus demás ajustes quedan intactos

### Requirement: Un solo estado de tema en toda la app

El tema activo SHALL ser uno solo para toda la app. Un control que aparezca en más de una pantalla SHALL reflejar el mismo estado y escribir sobre la misma preferencia.

#### Scenario: El control aparece en dos pantallas

- **WHEN** el usuario activa el tema oscuro desde una pantalla y navega a otra que también tiene el control
- **THEN** el control de la segunda pantalla ya aparece activado, y apagarlo ahí apaga el tema en toda la app

### Requirement: Cobertura total antes de exponer el control

El control de tema NO SHALL exponerse al usuario mientras exista alguna superficie de la app que no responda al tema activo: media app en oscuro es peor resultado que no tener la función.

#### Scenario: Migración incompleta

- **WHEN** quedan superficies sin migrar al sistema de tokens
- **THEN** el control de tema no aparece en la interfaz del usuario, aunque el sistema de temas esté implementado

#### Scenario: Migración completa

- **WHEN** todas las superficies responden al tema activo
- **THEN** el control puede exponerse, y esa exposición es un cambio deliberado y verificado, no un efecto secundario

### Requirement: Legibilidad equivalente en ambos temas

El tema oscuro SHALL cumplir los mismos umbrales de contraste que el claro: al menos 4.5:1 para texto normal y 3:1 para texto grande. Un par de tokens que cumpla en un tema y no en el otro NO SHALL publicarse sin corregirse o registrar su excepción.

#### Scenario: Par de tokens que solo cumple en claro

- **WHEN** un par texto/fondo alcanza el umbral en el tema claro pero no en el oscuro
- **THEN** se ajusta el token de la variante oscura o se registra la excepción con su motivo, y no se publica sin una de las dos cosas

### Requirement: Coherencia del tema en los bordes de la app

Los elementos de presentación que viven fuera del árbol de componentes —barra de estado, color de tema declarado de la aplicación instalable y estilos web inyectados— SHALL corresponderse con el tema activo.

#### Scenario: Tema oscuro activo

- **WHEN** el usuario tiene el tema oscuro activo
- **THEN** la barra de estado y los estilos inyectados para web corresponden al tema oscuro, sin que quede un borde claro delatando el tema anterior

#### Scenario: Configuración de plataforma que fuerza un tema

- **WHEN** la configuración de la plataforma fija un esquema de color y le impide a la app pintar el suyo
- **THEN** esa configuración se corrige, porque de lo contrario el control de tema queda sin efecto
