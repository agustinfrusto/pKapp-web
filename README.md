# pKapp

App para ayudar a los estudiantes de Medicina y Escuela Técnica de Medicina.

Construido con **Expo / React Native**. Funciona offline.

## Características

- **160 preguntas reales** extraídas de los parciales 2024 T1, 2024 T2, 2025 T1 y 2025 T2 (Hasta el momento)
- **~35 preguntas adicionales** generadas con Claude a partir de los apuntes para cubrir temas que no salieron mucho en exámenes.
- **Filtro de fuente:** podés practicar solo con preguntas reales, solo con las generadas, o con todas.
- **Tres modos:**
  - **Práctica por tema:** elegís un tema específico.
  - **Examen:** 40 preguntas al azar (formato del parcial real).
  - **Repaso de fallos:** las que respondiste mal antes.
- **Explicaciones** tras cada respuesta o al final del cuestionario
- **Estadísticas** por tema y lista de preguntas más falladas.
- **Agregar tus propias preguntas** al banco (se guardan en SQLite local).

## Temas cubiertos

Genética, ADN/ARN y síntesis proteica, tejidos (epitelial, conjuntivo, cartilaginoso, óseo, muscular, linfoideo), sangre y hemopoyesis, ciclo celular y reparación del ADN, contracción muscular, palancas, radioprotección, hemostasis y sistema inmune.

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

En `TopicSelectScreen` se ofrece un segmented control con 3 opciones:
- **Todas** (default).
- **Solo exámenes reales** → filtra `source === 'exam'`.
- **Solo generadas** → filtra `source === 'generated' || source === 'user'`.

El filtrado se hace antes de pasar el array a `QuizScreen`.

## Persistencia

Todo se guarda en SQLite local. Dos tablas:

1. **`question_stats`**: cuántas veces se respondió cada pregunta y cuántas se acertó.
2. **`user_questions`**: preguntas agregadas por el usuario.

Si el usuario borra los datos de la app, se pierde todo. No hay sincronización en la nube (no aplica para este caso de uso).

## Próximos pasos posibles

- Posibilidad de setear un timer en los cuestionarios
- Agregar preguntas del primer parcial y examenes.
- Exportar las preguntas del usuario a JSON para hacer backup.
- Imágenes en las preguntas (las genealogías, los gráficos tensión-longitud, las palancas).

Si hay uso de la app que lo justifique extraeré imagenes de los materiales y los incluiré en las preguntas que asi lo requieran.
Abierto a feedback y sugerencias