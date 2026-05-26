# pKapp · versión web

App para ayudar a los estudiantes de Medicina y Escuela Técnica de Medicina.
La construí para ayudar a mi pareja, le ha sido util y espero que ayude a más personas

Construido con **Expo / React Native**. Esta es la **versión web** del proyecto: corre en cualquier navegador moderno y se puede instalar como **PWA** (Progressive Web App) en escritorio, Android e iOS.

> Si buscás la versión nativa (iOS / Android), está en [pKapp](https://github.com/agustinfrusto/pKapp).

## Características

- **404 preguntas reales** extraídas de 7 exámenes: 2022 T1 y T2 (prototipos), 2024 T1, T2 y T3 (recuperatorio feb. 2025), 2025 T1 y T2.
- **34 preguntas adicionales** generadas con Claude a partir de los apuntes para cubrir temas con menor presencia en exámenes.
- **Filtros:** por fuente (examen real / generada) y por parcial (1er / 2do), combinables.
- **Tres modos:**
  - **Práctica por tema:** elegís un tema específico o practicás por parcial (1er o 2do, 40 preguntas).
  - **Examen:** 75 preguntas al azar (igual que el examen real).
  - **Repaso de fallos:** las que respondiste mal antes.
- **Explicaciones** tras cada respuesta o al final del cuestionario.
- **Estadísticas** por tema y lista de preguntas más falladas.
- **Agregar tus propias preguntas** al banco (se guardan localmente).
- **Timer** opcional para poner un tiempo a los cuestionarios (hasta dos horas).
- **PWA instalable** en cualquier dispositivo, con ícono propio y experiencia tipo app.

## Temas cubiertos

**1er parcial:** Química del agua / pH / tampones · Aminoácidos y proteínas · Lípidos e hidratos de carbono · Enzimas y cinética · Metabolismo celular (glucólisis, Krebs, fosforilación oxidativa) · Membrana biológica · Organelos celulares · Microscopía · Transporte a través de membranas · Potencial de acción · División celular y cromosomas · Reparación del ADN y radiobiología.

**2do parcial:** Genética y herencia · ADN, ARN y síntesis proteica · Tejido epitelial · Tejido conjuntivo · Tejido cartilaginoso · Tejido óseo · Tejido muscular (histología) · Sangre y hemopoyesis · Tejido linfoideo · Ciclo celular y cáncer · Contracción muscular · Palancas y biomecánica · Radioprotección · Hemostasis y coagulación · Sistema inmune.

---

## Cómo instalar la PWA

**Desktop (Chrome / Edge):** click en el ícono de "Instalar" (📥) en la barra de direcciones.

**Android (Chrome):** menú (⋮) → "Add to Home screen" / "Instalar aplicación".

**iOS (Safari):** botón Compartir → "Add to Home Screen". Una vez instalada, los datos persisten correctamente (escapando de las limitaciones de ITP).

## Navegadores recomendados

| Navegador | Persistencia | Veredicto |
|-----------|--------------|-----------|
| Chrome / Edge / Firefox (desktop) | Excelente | **Recomendado** |
| Chrome / Edge (Android) | Excelente | **Recomendado** |
| Safari (desktop) | Buena | Funciona pero ITP puede borrar datos tras semanas sin uso |
| Safari / Chrome (iOS) | Limitada en navegador, excelente como PWA instalada | **Instalar como PWA** |

---

## Estructura del proyecto

```
pKapp/
├── App.js                          # Navegación (stack navigator) + splash
├── index.js                        # Entry point Expo
├── app.json                        # Config Expo (incluye sección web/PWA)
├── vercel.json                     # Config de deploy en Vercel
├── metro.config.js                 # Excluye expo-sqlite del bundle web
├── package.json
├── public/                         # Archivos servidos en la raíz del sitio web
│   ├── manifest.json               # Manifest PWA
│   ├── icon-192.png
│   ├── icon-512.png
│   └── favicon.png
├── scripts/
│   └── inject-pwa.js               # Post-build: inyecta meta tags PWA en dist/
├── src/
│   ├── data/
│   │   └── questions.js            # Banco de preguntas (hardcoded)
│   ├── db/
│   │   ├── database.js             # Fallback (re-exporta database.web)
│   │   ├── database.native.js      # Implementación nativa (SQLite)
│   │   └── database.web.js         # Implementación web (localStorage)
│   ├── components/
│   │   ├── Analytics.js            # Stub nativo (devuelve null)
│   │   └── Analytics.web.js        # Vercel Analytics en web
│   ├── utils/
│   │   └── confirm.js              # Confirmaciones cross-platform
│   └── screens/
│       ├── HomeScreen.js           # Menú principal
│       ├── TopicSelectScreen.js    # Selector de tema + filtro + timer
│       ├── QuizScreen.js           # Quiz en sí
│       ├── ResultsScreen.js        # Resultados + revisión
│       ├── AddQuestionScreen.js    # Formulario para agregar preguntas
│       ├── StatsScreen.js          # Estadísticas
│       └── SettingsScreen.js       # Ajustes
└── assets/                         # Íconos, splash
```

---

## Diferencias con la versión nativa

| | Nativo (iOS / Android) | Web |
|--|--|--|
| **Persistencia** | SQLite (`expo-sqlite`) | `localStorage` |
| **Confirmaciones** | `Alert.alert` con múltiples botones | `window.confirm` (envuelto en `src/utils/confirm.js`) |
| **Analytics** | — | Vercel Analytics |
| **Distribución** | Stores (EAS Build) | Vercel (deploy automático en cada `git push`) |

La capa de DB usa los sufijos `.native.js` / `.web.js` para que Metro elija el archivo correcto según la plataforma. Cualquier import desde `'../db/database'` se resuelve automáticamente.

### Sobre la persistencia en web

Todo se guarda en `localStorage` del navegador. Los datos persisten entre sesiones, pero:
- Son locales a cada navegador (no se sincronizan entre dispositivos).
- Si el usuario borra los datos del sitio o usa modo incógnito, se pierden.
- En iOS Safari (sin instalar la PWA), Apple borra `localStorage` tras 7 días de inactividad (ITP). Instalando la app desde el home screen, este límite desaparece.

---

## Desarrollo

```bash
# instalar dependencias
npm install

# correr en navegador
npx expo start --web

# generar build estático (output: dist/)
npx expo export --platform web

# build completo (con inyección de meta tags PWA)
npx expo export --platform web && node scripts/inject-pwa.js
```

### Deploy

El proyecto está conectado a **Vercel**. Cada `git push` a `main` redeploya automáticamente. La config está en `vercel.json`.

---

## Cómo funciona el filtrado de preguntas

Cada pregunta tiene un campo `source`:
- `"exam"` → pregunta real extraída de un parcial anterior (con campo `exam` indicando cuál).
- `"generated"` → pregunta generada a partir de los apuntes.
- `"user"` → pregunta agregada por el usuario.

En `TopicSelectScreen` hay tres controles combinables:

**Filtro de fuente** (3 opciones):
- **Todas** (default).
- **Solo preguntas reales** → filtra `source === 'exam'`.
- **Solo generadas** → filtra `source === 'generated' || source === 'user'`.

**Filtro de parcial** (3 opciones):
- **Examen** (default) → sin filtro de parcial. En modo examen sortea 75 preguntas.
- **1er Parcial** → filtra `parcial === 'primero'`. En modo examen sortea 40 preguntas.
- **2do Parcial** → filtra `parcial === 'segundo'`. En modo examen sortea 40 preguntas.

**Timer** (opcional):
- Stepper de 10 a 120 minutos, en saltos de 10.
- Cuando expira navega automáticamente a Resultados con las respuestas dadas hasta el momento.

---

## Uso de IA en el proyecto

Por transparencia, dejo registro de en qué partes del proyecto utilicé asistencia de IA (principalmente **Claude**):

- **Contenido educativo:** 34 de las 438 preguntas fueron generadas a partir del material de estudio (están marcadas con `source: "generated"` y se pueden filtrar desde la app). Las explicaciones de varias preguntas también fueron refinadas con apoyo de IA tomando como referencia los resúmenes oficiales.
- **Código:** asistencia para refactors, debugging, configuración del soporte web (PWA, separación `database.native.js` / `database.web.js`), deploy en Vercel y revisión de patrones.
- **Decisiones de diseño, arquitectura y revisión final:** mías.

Esto no reemplaza ni invalida el trabajo de los autores académicos del material original (las preguntas reales de examen están claramente identificadas y atribuidas a sus respectivos parciales).

---

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

