# BioCelular Quiz

App Android para auto-evaluación en **Biología Celular y Tisular** (2do parcial, U. de Montevideo).

Construido con **Expo / React Native**. Funciona offline tras la primera carga.

## Características

- **160 preguntas reales** extraídas de los parciales 2024 T1, 2024 T2, 2025 T1 y 2025 T2.
- **~35 preguntas adicionales** generadas a partir de los apuntes para cubrir temas que no salieron mucho en exámenes.
- **Filtro de fuente:** podés practicar solo con preguntas reales, solo con las generadas, o con todas.
- **Tres modos:**
  - **Práctica por tema:** elegís un tema específico.
  - **Examen:** 40 preguntas al azar (formato del parcial real).
  - **Repaso de fallos:** las que respondiste mal antes.
- **Explicaciones** tras cada respuesta (con referencias a los apuntes).
- **Estadísticas** por tema y lista de preguntas más falladas.
- **Agregar tus propias preguntas** al banco (se guardan en SQLite local).

## Temas cubiertos

Genética, ADN/ARN y síntesis proteica, tejidos (epitelial, conjuntivo, cartilaginoso, óseo, muscular, linfoideo), sangre y hemopoyesis, ciclo celular y reparación del ADN, contracción muscular, palancas, radioprotección, hemostasis y sistema inmune.

---

## Cómo correr esto en tu Mac M1 con macOS Tahoe

### 1. Setup inicial del entorno

macOS Tahoe + Node 24 (Homebrew) tiene un bug que cuelga `npm`. Usá **nvm** en su lugar:

```bash
# Si no tenés Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar nvm (gestor de versiones de Node)
brew install nvm

# Configurar nvm en zsh (default en Tahoe)
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "/opt/homebrew/opt/nvm/nvm.sh" ] && \. "/opt/homebrew/opt/nvm/nvm.sh"' >> ~/.zshrc
source ~/.zshrc

# Instalar Node LTS (evita el bug)
nvm install --lts
nvm use --lts

# Verificar
node -v   # debería decir v22.x
npm -v
```

### 2. Instalar dependencias del proyecto

```bash
cd biocelular-quiz
npm install
```

Esto baja Expo, React Native, navegación y SQLite.

### 3. Probar en tu celular (modo desarrollo)

```bash
npx expo start
```

Te muestra un QR. Escaneálo con:
- **Android:** la app **Expo Go** (Play Store, gratis).
- Tu celular y tu Mac tienen que estar en la misma red WiFi.

La app se abre directo en el celular, con hot-reload (editás código y se actualiza).

### 4. Generar el APK final

Cuando esté lista para tu novia (que se lo instale sin Expo Go):

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Logearte (creá cuenta gratis en expo.dev si no tenés)
eas login

# Configurar el proyecto (primera vez)
eas build:configure

# Generar APK (toma 10-15 minutos, se compila en la nube de Expo)
eas build -p android --profile preview
```

Al terminar te da un link para descargar el `.apk`. Le pasás ese link a tu novia, lo abre desde el celular, lo instala (puede que tenga que habilitar "instalar de fuentes desconocidas" en ajustes), y listo.

> **Tip:** la cuenta gratuita de Expo permite ~30 builds gratis por mes, más que suficiente.

---

## Estructura del proyecto

```
biocelular-quiz/
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
│       ├── ResultsScreen.js        # Resultados + revisión
│       ├── AddQuestionScreen.js    # Formulario para agregar Qs
│       ├── StatsScreen.js          # Estadísticas
│       └── SettingsScreen.js       # Ajustes
└── assets/                         # Iconos, splash (opcionales)
```

## Cómo funciona el filtrado de preguntas

Cada pregunta tiene un campo `source`:
- `"exam"` → pregunta real extraída de un parcial anterior (con campo `exam` indicando cuál).
- `"generated"` → pregunta generada a partir de los apuntes.
- `"user"` → pregunta agregada por el usuario en la app.

En `TopicSelectScreen` se ofrece un segmented control con 3 opciones:
- **Todas** (default).
- **Solo exámenes reales** → filtra `source === 'exam'`.
- **Solo generadas** → filtra `source === 'generated' || source === 'user'`.

El filtrado se hace antes de pasar el array a `QuizScreen`.

## Persistencia

Todo se guarda en SQLite local (no requiere internet ni cuenta). Dos tablas:

1. **`question_stats`**: cuántas veces se respondió cada pregunta y cuántas se acertó.
2. **`user_questions`**: preguntas agregadas por el usuario.

Si la usuaria borra los datos de la app, se pierde todo. No hay sincronización en la nube (no aplica para este caso de uso).

## Próximos pasos posibles

- Agregar preguntas de los temas anteriores al 2do parcial (agua, soluciones, biomembranas, bioenergética, glucólisis, ciclo de Krebs) por si necesita repaso del 1er parcial.
- Modo "spaced repetition" tipo Anki (más difícil, requiere algoritmo SM-2).
- Exportar las preguntas del usuario a JSON para hacer backup.
- Imágenes en las preguntas (las genealogías, los gráficos tensión-longitud, las palancas).

Esto último es lo más útil pero más laborioso. Si querés que lo agregue, decímelo.
