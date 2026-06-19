# pKapp · versión web

[pkapp.uy](https://pkapp.uy)

App para ayudar a los estudiantes de Escuela Técnica de Medicina.
La construí para ayudar a mi pareja, le ha sido útil y espero que ayude a más personas.

> Es gratis, y va a serlo mientras pueda mantenerla

Construido con **Expo / React Native**. Esta es la **versión web** del proyecto: corre en cualquier navegador moderno y se puede instalar como **PWA** (Progressive Web App) en escritorio, Android e iOS.

> Si buscás la versión nativa (iOS / Android), está en [pKapp](https://github.com/agustinfrusto/pKapp).

## Capturas

<p align="center">
  <img src="docs/screenshots/01-materia-select.png" width="220" alt="Elegir materia" />
  <img src="docs/screenshots/02-home.png" width="220" alt="Menú principal" />
  <img src="docs/screenshots/03-topic-select.png" width="220" alt="Filtros y selección de tema" />
</p>
<p align="center">
  <img src="docs/screenshots/04-quiz.png" width="220" alt="Quiz con feedback" />
  <img src="docs/screenshots/05-results.png" width="220" alt="Resultados y revisión" />
  <img src="docs/screenshots/06-stats.png" width="220" alt="Estadísticas por tema" />
</p>

## Características

- **Multimateria** (ESFUNO): hoy con **Biología Celular y Tisular** (BCYT) y **Anatomía**, con estructura preparada para sumar los demás módulos.
- **858 preguntas reales** extraídas de parciales y exámenes oficiales (BCYT 2022/2024/2025 + Anatomía 2018-2025).
- **34 preguntas adicionales** generadas con Claude a partir de los apuntes (solo BCYT).
- **Filtros:** por fuente (examen real / generada) y por parcial, combinables.
- **Tres modos:**
  - **Práctica por tema:** elegís un tema específico o practicás por parcial.
  - **Examen:** preguntas al azar con tamaño igual al examen real (configurable por materia — BCYT: 75 / 40 por parcial; Anatomía: 50 / 25 por parcial).
  - **Repaso de fallos:** las que respondiste mal antes.
- **Explicaciones** tras cada respuesta o al final del cuestionario.
- **Estadísticas** por tema y lista de preguntas más falladas.
- **Agregar tus propias preguntas** al banco (se guardan localmente).
- **Timer** opcional para poner un tiempo a los cuestionarios (hasta dos horas).
- **PWA instalable** en cualquier dispositivo, con ícono propio y experiencia tipo app.

## Temas cubiertos

### Biología Celular y Tisular (BCYT)

**1er parcial:** Química del agua / pH / tampones · Aminoácidos y proteínas · Lípidos e hidratos de carbono · Enzimas y cinética · Metabolismo celular (glucólisis, Krebs, fosforilación oxidativa) · Membrana biológica · Organelos celulares · Microscopía · Transporte a través de membranas · Potencial de acción · División celular y cromosomas · Reparación del ADN y radiobiología.

**2do parcial:** Genética y herencia · ADN, ARN y síntesis proteica · Tejido epitelial · Tejido conjuntivo · Tejido cartilaginoso · Tejido óseo · Tejido muscular (histología) · Sangre y hemopoyesis · Tejido linfoideo · Ciclo celular y cáncer · Contracción muscular · Palancas y biomecánica · Radioprotección · Hemostasis y coagulación · Sistema inmune.

### Anatomía

Sistema nervioso central · Nervios periféricos y plexos · Sistema muscular · Osteología · Sistema vascular periférico · Cabeza y cuello · Tórax y mediastino · Abdomen · Pelvis y periné.

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
├── App.js                          # Navegación + splash + ThemeProvider
├── index.js                        # Entry point Expo
├── app.json                        # Config Expo (incluye sección web/PWA)
├── vercel.json                     # Config de deploy en Vercel
├── metro.config.js                 # Excluye expo-sqlite del bundle web
├── package.json
├── public/                         # Archivos servidos en la raíz del sitio web
│   ├── manifest.json               # Manifest PWA
│   ├── icon-192.png, icon-512.png, favicon.png
│   ├── _redirects                  # SPA fallback (Cloudflare Pages)
│   └── _headers                    # Security headers (Cloudflare Pages)
├── scripts/
│   ├── inject-pwa.js               # Post-build: inyecta meta tags PWA y CF Analytics
│   ├── inject-preload.js           # Post-build: inyecta preload del logo y materias
│   └── update-readme.js            # Auto-actualiza conteos en este README
├── docs/
│   └── screenshots/                # Capturas usadas en este README
├── src/
│   ├── materias/                   # Registry de materias (ESFUNO)
│   │   ├── index.js                # MATERIAS y MATERIA_LIST
│   │   ├── bcyt/                   # Biología Celular y Tisular
│   │   │   ├── index.js
│   │   │   ├── metadata.js         # id, nombre, icono, color, imagen
│   │   │   ├── config.js           # examSize, parciales, etc.
│   │   │   ├── topics.js           # TOPICS de BCYT
│   │   │   └── questions.js        # Banco de preguntas (419)
│   │   └── anatomia/               # Anatomía
│   │       ├── index.js
│   │       ├── metadata.js
│   │       ├── config.js
│   │       ├── topics.js
│   │       └── questions.js        # Banco de preguntas (473)
│   ├── materia/
│   │   └── MateriaContext.js       # Estado: materia activa, getter de data
│   ├── theme/
│   │   ├── colors.js               # Paletas light/dark
│   │   └── ThemeContext.js
│   ├── db/
│   │   ├── database.js             # Fallback (re-exporta database.web)
│   │   ├── database.native.js      # Implementación nativa (SQLite)
│   │   └── database.web.js         # Implementación web (localStorage)
│   ├── components/
│   │   ├── Analytics.js            # Stub nativo (devuelve null)
│   │   ├── Analytics.web.js        # Analytics en web
│   │   └── DonationBox.js          # Bloque de donación (Mercado Pago)
│   ├── utils/
│   │   ├── confirm.js              # Confirmaciones cross-platform
│   │   ├── migration.js            # Export/import de progreso entre dominios
│   │   └── webStyles.js            # Inyección de CSS para web (hover, etc.)
│   ├── assets/                     # Imágenes de materias e íconos
│   └── screens/
│       ├── MateriaSelectScreen.js  # Pantalla inicial: elegí materia
│       ├── HomeScreen.js           # Menú principal de la materia
│       ├── TopicSelectScreen.js    # Selector de tema + filtros + timer
│       ├── QuizScreen.js           # Quiz en sí
│       ├── ResultsScreen.js        # Resultados + revisión
│       ├── AddQuestionScreen.js    # Formulario para agregar preguntas
│       ├── StatsScreen.js          # Estadísticas
│       └── SettingsScreen.js       # Ajustes (tema, import/export, etc.)
└── assets/                         # Logo principal
```

---

## Diferencias con la versión nativa

| | Nativo (iOS / Android) | Web |
|--|--|--|
| **Persistencia** | SQLite (`expo-sqlite`) | `localStorage` |
| **Confirmaciones** | `Alert.alert` con múltiples botones | `window.confirm` (envuelto en `src/utils/confirm.js`) |
| **Analytics** | — | Cloudflare Web Analytics |
| **Distribución** | Stores (EAS Build) | Cloudflare Pages (deploy automático en cada `git push`) |

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

# build completo (output: dist/)
npm run build:web
```

### Deploy

El proyecto se sirve desde **Cloudflare Pages** en [pkapp.uy](https://pkapp.uy). Cada `git push` a `main` redeploya automáticamente.

Durante la ventana de migración también queda corriendo un deploy paralelo en **Vercel** (`pkapp-web.vercel.app`) para que los usuarios que tenían el dominio viejo puedan exportar su progreso. Config en `vercel.json`.

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

**Filtro de parcial** (3 opciones, los tamaños dependen de la materia):
- **Examen** (default) → sin filtro de parcial. En modo examen sortea `examSize` preguntas (BCYT: 75; Anatomía: 50).
- **1er Parcial** → filtra `parcial === 'primero'`. Sortea `examSizeParcial` preguntas (BCYT: 40; Anatomía: 25).
- **2do Parcial** → filtra `parcial === 'segundo'`. Sortea `examSizeParcial` preguntas.

Cada materia define sus tamaños en `src/materias/<id>/config.js`.

**Timer** (opcional):
- Stepper de 10 a 120 minutos, en saltos de 10.
- Cuando expira navega automáticamente a Resultados con las respuestas dadas hasta el momento.

---

## Uso de IA en el proyecto

Por transparencia, detallo en qué partes del proyecto se usó asistencia de IA (principalmente **Claude**, mayormente Opus 4.7).

### Contenido educativo

- **858 preguntas reales** extraídas de parciales y exámenes oficiales. Se usó IA como apoyo para transcribir y limpiar los PDFs originales, pero cada pregunta fue revisada manualmente contra el documento fuente.
- **34 preguntas generadas** a partir de los apuntes oficiales de BCYT. Están marcadas con `source: "generated"` y son auditables desde la app: en `TopicSelect` → filtro **Fuente: Solo generadas**.
- **Explicaciones:** redactadas o refinadas con IA tomando como referencia los resúmenes oficiales, priorizando precisión y consistencia con el material de estudio.

### Código

Asistencia para refactors, debugging, configuración del soporte web (PWA, split `database.native.js` / `database.web.js`), deploy en Cloudflare Pages y revisión de patrones.

### Lo que NO se delegó a IA

- La curaduría de qué preguntas reales incluir y de qué exámenes provienen.
- La validación de las preguntas generadas contra el material original.
- Las decisiones de diseño, arquitectura, UX y la revisión final de cada cambio.

---

## Licencia

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

