# pKapp

App para ayudar a los estudiantes de Medicina y Escuela Técnica de Medicina.

Construido con **Expo / React Native**. Funciona offline.

## Características

- **404 preguntas reales** extraídas de 7 exámenes: 2022 T1 y T2 (prototipos), 2024 T1, T2 y T3 (recuperatorio feb. 2025), 2025 T1 y T2.
- **34 preguntas adicionales** generadas con Claude a partir de los apuntes para cubrir temas con menor presencia en exámenes.
- **Filtros:** por fuente (examen real / generada) y por parcial (1er / 2do), combinables.
- **Tres modos:**
  - **Práctica por tema:** elegís un tema específico o un parcial de 40 preguntas como el real (1er o 2do)
  - **Examen:** 75 preguntas al azar (igual que el examen real).
  - **Repaso de fallos:** las que respondiste mal antes.
- **Explicaciones** tras cada respuesta o al final del cuestionario.
- **Estadísticas** por tema y lista de preguntas más falladas.
- **Agregar tus propias preguntas** al banco (se guardan en SQLite local).

## Temas cubiertos

**1er parcial:** Química del agua / pH / tampones · Aminoácidos y proteínas · Lípidos e hidratos de carbono · Enzimas y cinética · Metabolismo celular (glucólisis, Krebs, fosforilación oxidativa) · Membrana biológica · Organelos celulares · Microscopía · Transporte a través de membranas · Potencial de acción · División celular y cromosomas · Reparación del ADN y radiobiología.

**2do parcial:** Genética y herencia · ADN, ARN y síntesis proteica · Tejido epitelial · Tejido conjuntivo · Tejido cartilaginoso · Tejido óseo · Tejido muscular (histología) · Sangre y hemopoyesis · Tejido linfoideo · Ciclo celular y cáncer · Contracción muscular · Palancas y biomecánica · Radioprotección · Hemostasis y coagulación · Sistema inmune.

---

## Estructura del proyecto

```
aPK/
├── App.js                          # Navegación (stack navigator)
├── index.js                        # Entry point Expo
├── app.json                        # Config Expo
├── eas.json                        # Config EAS Build
├── package.json
├── src/
│   ├── data/
│   │   └── questions.js            # Banco de preguntas (hardcoded)
│   ├── db/
│   │   └── database.js             # Wrapper SQLite (stats + custom Qs)
│   └── screens/
│       ├── HomeScreen.js           # Menú principal
│       ├── TopicSelectScreen.js    # Selector de tema + filtro de fuente
│       ├── QuizScreen.js           # Quiz en sí
│       ├── ResultsScreen.js        # Resultados + revisión Ho
│       ├── AddQuestionScreen.js    # Formulario para agregar Qs
│       ├── StatsScreen.js          # Estadísticas
│       └── SettingsScreen.js       # Ajustes
└── assets/                         # Iconos, splash (opcionales)
```

## ⚖️ Licencia 

> **El contenido de estudio (preguntas, explicaciones, material didáctico)
> está bajo licencia [CC BY-NC-SA 4.0](LICENSE-CONTENT).
> Esto significa que NO está permitido el uso comercial.**

Este proyecto usa licencias separadas:

| Componente | Licencia | Uso comercial |
|------------|----------|---------------|
| Código fuente | [MIT](LICENSE) | ✅ Permitido |
| Contenido educativo | [CC BY-NC-SA 4.0](LICENSE-CONTENT) | ❌ Prohibido |

### ¿Qué significa esto en la práctica?

**Podés:**
- Forkear el repo y usar el código para hacer tu propia app
- Estudiar con la app gratuitamente
- Compartirla con otros estudiantes
- Contribuir con mejoras

**No podés:**
- Vender la app o el material en plataformas de pago
- Incluir el contenido en cursos pagos sin autorización
- Usar las preguntas en productos comerciales

## Cómo funciona el filtrado de preguntas

Cada pregunta tiene un campo `source`:
- `"exam"` → pregunta real extraída de un parcial anterior (con campo `exam` indicando cuál).
- `"generated"` → pregunta generada a partir de los apuntes.
- `"user"` → pregunta agregada por el usuario.

En `TopicSelectScreen` hay dos filtros combinables:

**Filtro de fuente** (3 opciones):
- **Todas** (default).
- **Solo preguntas reales** → filtra `source === 'exam'`.
- **Solo generadas** → filtra `source === 'generated' || source === 'user'`.

**Filtro de parcial** (3 opciones):
- **Ambos** (default).
- **1er Parcial** → filtra `parcial === 'primero'`.
- **2do Parcial** → filtra `parcial === 'segundo'`.

El filtrado se aplica antes de pasar el array a `QuizScreen`. En `QuizScreen` cada pregunta muestra un badge indicando a qué parcial pertenece.

## Persistencia

Todo se guarda en SQLite local. Dos tablas:

1. **`question_stats`**: cuántas veces se respondió cada pregunta y cuántas se acertó.
2. **`user_questions`**: preguntas agregadas por el usuario.

Si el usuario borra los datos de la app, se pierde todo. No hay sincronización en la nube (no aplica para este caso de uso).

## Próximos pasos posibles

- Posibilidad de setear un timer en los cuestionarios.
- Imágenes en las preguntas (las genealogías, los gráficos tensión-longitud, las palancas).
- Agregar las preguntas de 2022 que dependen de imágenes (4 por turno), una vez que se incorporen las imágenes al proyecto.
