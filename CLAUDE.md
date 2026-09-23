# CLAUDE.md — Sharick Platform (Plataforma Educativa Multiidioma)

## 🎯 CONTEXTO DEL PROYECTO

Plataforma educativa interactiva de idiomas para la profesora **Sharick Prieto**.
Contendrá múltiples libros digitales interactivos: **Inglés A1** (primero), luego Portugués A1 y Español A1.

**IMPORTANTE — el libro 1 es sobre CUATRO PAÍSES: Colombia, Venezuela, Bolivia y
Panamá.** Los temas gramaticales estándar de A1 se mantienen, pero los ejemplos,
personajes, lugares, lecturas e ilustraciones salen de esos cuatro países, con
**Colombia como país base** (Cartagena, Bogotá, Medellín) y alrededor Caracas,
La Paz y Ciudad de Panamá. Nada de México, Argentina, Perú, Chile, Ecuador ni
Brasil. En `modules.json` el libro lleva `region: "Latin America"`,
`baseCountry: "Colombia"` y `countries: ["Colombia","Venezuela","Bolivia","Panamá"]`;
el Módulo 1 conserva `country: "Colombia"`. La portada dice "con Colombia,
Venezuela, Bolivia y Panamá como escenario" (`registry.json`).

### Distribución (3 formatos, 1 código):
1. **Web:** Cloudflare Pages (deploy automático con git push)
2. **Desktop:** Electron → `.exe` instalable (fase final)
3. **Iframe:** Embebible en la web de Sharick

---

## 🛠️ STACK TÉCNICO (NO NEGOCIABLE)

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| React | 18+ | Componentes, estado, interactividad |
| Vite | Última | Build tool, HMR |
| Tailwind CSS | v4 | Estilos utility-first |
| Anime.js | v4 (`animejs`) | TODAS las animaciones |
| React Router | v7 | Navegación SPA |
| lucide-react | v1 | Iconos de línea del menú y las tarjetas |
| localStorage | nativo | Progreso del estudiante (sin backend) |

**NO usar:** Redux, styled-components, CSS modules, Framer Motion, jQuery, Bootstrap.

### Build & Deploy
- Build output: `dist/` · Deploy: Cloudflare Pages (branch `main`, build `npm run build`, output `dist`)
- Electron en FASE FINAL. `vite.config.js` ya usa `base: './'`.

### Decisiones de implementación (ya tomadas)
- **Tailwind v4 sin `tailwind.config.js`:** v4 es CSS-first. Paleta, fuentes y sombras se
  declaran con `@theme` en `src/styles/global.css`. No crear `tailwind.config.js`.
- **Pesos de fuente:** `font-medium` / `font-semibold` / `font-bold`.
  Tailwind v4 NO genera utilidades numéricas tipo `font-600`.
- **HashRouter:** rutas con `#/` para que el mismo build sirva en Cloudflare Pages,
  dentro de un iframe y en Electron (`file://`) sin rewrites.
- **Nada de estado inicial oculto por clase CSS.** Las animaciones de entrada aplican
  `opacity` como **estilo inline** desde `usePageAnimation` / `popIn`. Motivo: react-pageflip
  provoca re-renders y React restauraría una clase `.anim-hidden`, dejando la hoja invisible.
- **Ancho de página fijo:** dentro del libro la hoja mide ~460–520px pase lo que pase, así que
  los breakpoints de viewport (`sm:`, `lg:`) NO sirven para el contenido de la página.
  Todas las rejillas internas van a **una sola columna** (excepto el vocabulario, a 2).

---

## 🎨 SISTEMA DE DISEÑO — LIBRO EDITORIAL IMPRESO

Referencia: libro educativo impreso profesional estilo **National Geographic Learning / Cambridge**.
Minimalista, cálido, acuarela. Doble página con pasada real.
El **tricolor de Colombia vive SOLO en la portada y el branding**, nunca en páginas interiores.

### Paleta (tokens `@theme` en global.css)

```css
/* Papel */
--color-paper:     #F7F2E9;  /* fondo de la hoja */
--color-box:       #F0E9DB;  /* cajas de contenido (beige) */
/* Tinta */
--color-navy:      #1B3A5C;  /* títulos serif */
--color-ink:       #33302B;  /* cuerpo */
--color-ink-soft:  #6B655C;  /* secundario */
/* Acentos DECORATIVOS — nunca como texto pequeño */
--color-coral:     #E05A47;
--color-sage:      #6B9080;
--color-gold:      #E9B44C;
/* Variantes legibles de esos acentos, para texto y fondos con texto */
--color-coral-ink: #B23A28;  /* labels UNIT/LESSON, números, botones */
--color-sage-ink:  #4F6F60;  /* labels EXERCISE/VOCABULARY */
--color-tip:       #E4EDE8;  /* fondo Cultural Tip */
/* Tricolor — SOLO portada */
--color-col-blue: #003DA5; --color-col-yellow: #FFD100; --color-col-red: #CE1126;
```

**Contraste (verificado sobre `paper` #F7F2E9):** navy 10.4:1 · ink 11.9:1 · coral-ink 5.3:1 ·
sage-ink 5.0:1 · blanco sobre coral-ink 6.0:1. Coral, sage y gold "puros" están por debajo de
4.5:1 — úsalos solo para rellenos, iconos y florituras, **jamás para texto**.

### Tipografía
- **Títulos:** `Playfair Display` (700/800) → utilidad `font-display`, siempre en navy
- **Cuerpo:** `Nunito Sans` (400/600/700) → `font-body` (por defecto en `body`)
- **Labels:** utilidad `.label-caps` — sans bold, MAYÚSCULAS, `letter-spacing .16em`, 0.78rem
  (UNIT 1 · LESSON 2 · VOCABULARY · EXERCISE 3 · CULTURAL TIP)
- **Fredoka y Sora están eliminadas del proyecto.**

### Formato de página — pantalla completa tipo Express Publishing
Referencia: libro interactivo **Express Publishing "Upload"**. Se replica la
estructura; el color y la tipografía son los nuestros.

- **Nada de doble página ni de pasada de hoja.** Cada pantalla es un lienzo fijo
  de **1600x1000** escalado al viewport con `transform: scale()`
  (`page/PageStage.jsx`), con letterbox cream. **Nunca hay scroll**: si el
  contenido no cabe, se parte en otra pantalla.
- Una lección tiene varias pantallas (`screens` en el JSON). Se pasa de una a
  otra desde la barra inferior, con transición de Anime.js (sale translateX -60
  + fade, entra translateX [60,0] + fade, 400ms).

Anatomía (todo en `src/components/page/`):
| Componente | Qué es |
|---|---|
| `PageStage` | lienzo 1600x1000 escalado al viewport |
| `PageFrame` | marco coral de 3px, radio 20px, número de página en círculo |
| `LessonTag` | [1.1] coral + [título corto] navy, con cuadritos pixel art |
| `CloseButton` | círculo coral de 64px con borde blanco → Nivel 2 |
| `SectionHeading` | "Reading" / "Listening"… en Playfair coral con subrayado dorado |
| `ExerciseInstruction` | número grande coral + icono de habilidad + instrucción |
| `DialogueBubble` | caja de color con la letra fuera; nombres en columna propia |
| `IllustrationWithMarkers` | ilustración + marcadores numerados por % |
| `BottomToolbar` | 88px: home, reiniciar, ←/→ pantalla, índice, juegos, fullscreen, ◀/▶ lección |
| `ScreenRenderer` | elige el layout y coloca todo |

Colores fijos de los diálogos por letra: A `#8E7CC3` · B `#E05A47` ·
C `#3F86B8` · D `#6B9080` · E `#E9B44C` (E lleva texto navy, el resto blanco).

`media/AudioPlayer.jsx` es un reproductor real estilo casete: barra
arrastrable, play / pause / stop y atajo de barra espaciadora. Si el mp3 no
existe se queda deshabilitado con "Audio pendiente" — nunca rompe la página.

### Decoración SVG reutilizable (`src/components/decor/`)
`Swirl` (floritura ~ dorada) · `Leaf` (hojita de los labels) ·
`TropicalFlower` (variantes `bird` / `heliconia` / `leaves`) ·
`WaterWave` (onda inferior) · `SunBurst` (solecito del Cultural Tip)

---

## ✨ ANIMACIONES (Anime.js v4)

`import { animate, stagger } from 'animejs'` — en v4 la propiedad es `ease`, no `easing`.
Helpers: `src/hooks/useFeedback.js` (`celebrate`, `shake`, `popIn`, `hoverFloat`) y
`src/hooks/usePageAnimation.js` (`usePageAnimation`, `usePageSlide`).

| Elemento | Animación | Specs |
|----------|-----------|-------|
| Entrada de página | fadeIn + translateY | `[20,0]`, 600ms `outQuad`, stagger 80ms sobre `[data-anim]` |
| Cards | hover float | scale 1.05, translateY -8, 300ms |
| Barras del menú (Nivel 1) | hover | translateX 6px, 260ms |
| Tarjetas del Nivel 2 | entrada + hover | stagger 40ms · scale 1.04 |
| Vuelta al Nivel 2 | scroll + pulso dorado | anillo gold, 260ms entra / 950ms sale |
| Cambio de nivel | fade + scale | 0.985→1, 350ms `outQuad` |
| Respuesta correcta | celebración | scale [1,1.15,1] + verde suave, 500ms |
| Respuesta incorrecta | shake | translateX [-8,8,-5,5,0], 400ms |
| ProgressBar | fill + número contando | 800ms `inOutQuad` |
| Dado | roll | rotate 720 + bounce, 900ms `outElastic(1, .6)` |
| Ruleta | giro | rotate 1800°+ , 3500ms, transición CSS `cubic-bezier(.16,.72,.16,1)` |
| Burbujas / frases | pop-in | scale [0.8,1], stagger 120ms |
| Cambio de pantalla | slide + fade | sale translateX -60, entra [60,0], 400ms `outQuad` |

Todo respeta `prefers-reduced-motion`.

---

## 🧭 NAVEGACIÓN DE 3 NIVELES

Estructura de libro digital de editorial (referencia: Express Publishing
"Upload"). Se copia la ESTRUCTURA, no su diseño: el estilo editorial cream /
navy / coral / salvia con Playfair Display se mantiene tal cual.
**No hay sidebar**: cada nivel trae su propia cabecera.

```
/                                                 Home · selector de libros
/book/:bookId                                     NIVEL 1 · menú del libro
/book/:bookId/games                               Selector de módulo para jugar
/book/:bookId/module/:moduleId                    NIVEL 2 · lecciones del módulo
/book/:bookId/module/:moduleId/games              Juegos de ese módulo
/book/:bookId/module/:moduleId/lesson/:lessonId   NIVEL 3 · libro abierto
/book/:bookId/module/:moduleId/lesson/:lessonId/screen/:screenNo
                                                  NIVEL 3 en una pantalla concreta
/study/login · /study/teacher · /study/:bookId · /study/:bookId/arcade
/study/:bookId/:topicId · /study/:bookId/:topicId/quiz
                                                  STUDY ZONE (con sesión, ver abajo)
```

La pantalla vive en la URL: el Nivel 2 abre cualquier miniatura directamente
(`…/lesson/1.1/screen/2`), el refresco no pierde el sitio y al salir con [X]
la rejilla sabe dónde estaba el estudiante.

### Nivel 1 — menú principal (`pages/BookMenu.jsx`)
Pantalla completa, dos columnas de barras horizontales (`nav/MenuButton.jsx`,
alto 90px, radio 12px, fondo `box`, hover translateX 6px):
- **Izquierda, módulos:** cuadro coral con el número en Playfair blanco.
  Después Self-Check y Cultural & Cross-Curricular Section.
- **Derecha, recursos:** cuadro verde salvia con icono lucide —
  Workbook · Reader · Video · Games · Quizzes · Word List.
- Lo que no tiene contenido se ve atenuado y avisa "Próximamente" con un toast.
- Botón circular coral [X] arriba a la derecha → Home.

### Nivel 2 — lecciones del módulo (`pages/ModuleGrid.jsx`)
**El Nivel 2 muestra UNA miniatura por LECCIÓN**, como el índice visual de
Express Publishing: portada (★) y después [1.1] [1.2] [1.3]… Sin tarjetas por
pantalla ni separadores. Los datos salen de `getModuleLessonCards()` en
`books/index.js`; la tarjeta es `book/LessonCard.jsx` y la miniatura
`book/LessonSpread.jsx`.

- **Look Express Publishing**: la vista entera va dentro de un marco coral de
  3px con radio 20px (como las páginas). Arriba a la izquierda, un **banner
  rojo** (gradiente coral-ink → coral, esquina inferior derecha de 64px, patrón
  de cuadritos pixel a la izquierda) con "Module N" en Playfair 800 blanco;
  debajo, nombre del módulo, descripción y barra de progreso (contada por
  pantallas de todas las lecciones). `CloseButton` (64px, borde blanco) arriba
  a la derecha; 🏠 y 🎮 (`RoundButton size="lg"`) superpuestos a la esquina
  inferior izquierda del marco.
- **Miniatura = doble página** (`LessonSpread`): la lección se ve como un
  spread — página izquierda = pantalla 1, derecha = pantalla 2 — renderizadas
  de verdad con `ScreenRenderer`, escaladas al ancho de media tarjeta
  (`ResizeObserver`), `pointer-events: none` y progreso inerte
  (`INERT_PROGRESS`). Línea de lomo + sombra al centro. Si la lección tiene una
  sola pantalla, va como página única centrada. Proporción `SPREAD_RATIO`
  = 2:1 (las pantallas son 16:10; un spread real sería 3.2:1, demasiado plano).
  `lesson.thumbnailScreens: [0, 1]` elige qué dos pantallas forman el spread
  (por defecto las dos primeras).
- **Tag sobresaliente** (`data-tag`): cuadro coral de 64px medio afuera de la
  esquina superior izquierda, sombra fuerte, número de lección en Playfair 800
  y "5 pantallas" pequeño debajo; la portada lleva ★. Detrás salen 6 cuadritos
  pixel coral/dorado (`TAG_PIXELS`). En la esquina del tag, el **progreso de
  la lección**: anillo salvia parcial (3/5) o ✓ verde al 100 % (`ProgressRing`).
- **Badges circulares** (máx. 3): círculos coral de 48px con borde blanco de
  3px e icono lucide blanco, medio afuera de la esquina inferior derecha, en
  fila hacia la izquierda. Se calculan con `lessonBadges()` = unión de
  `screenBadges()` de TODAS las pantallas, en orden audio · written · game ·
  speaking · video: 🔊 (`screen.audio` / `audioTracks`, diálogos o bloques con audio,
  `listening`, `listenCircle`) · ✏️ (`match`, `matchMarkers`, `matchHeadings`, `fillBubbles`,
  `fillInSentence`, `multipleChoice`) · 🎮 (`diceGame`, `roulette`) · 🎙️
  (`speaking`, `recordPrompt`) · 🎬 video.
- **Rejilla** `.grid-pantallas` (definida en `global.css`): 2 columnas en móvil,
  3 desde 768px, 4 desde 1280px y 5 desde 1800px. Va en CSS y **no** con
  utilidades responsive porque Tailwind ordena un breakpoint `3xl` ANTES que
  `xl` y la regla de 4 columnas le ganaba a la de 5. Gap de 40px (`gap-10`)
  para que tags y badges de tarjetas vecinas no se toquen.
- Entrada con stagger de 40ms; hover scale 1.05 + el tag se inclina -3°
  (Anime.js); al abrir, la tarjeta hace zoom y navega a
  `…/lesson/<id>/screen/1`. Dentro se navega con ← → de la toolbar.
- **Al volver con [X]** la rejilla hace scroll hasta la lección de
  `progress.currentPage` (`findLessonOfScreen`) y le lanza un pulso dorado.
- La tarjeta "🎮 Games · Module N" cierra la rejilla (tag salvia con mando).
- El **índice ☰ del lector** (`IndexOverlay` en `LessonReader`) usa el mismo
  grid con `LessonCard compact` y resalta la lección actual (`current`).

### Nivel 3 — doble página (`pages/LessonReader.jsx`)
El libro de siempre (react-pageflip + esquinas), con una barra mínima
(`layout/ReaderBar.jsx`): [🏠] → Nivel 1 · "Module 1 · 1.2" · [X] → Nivel 2.
Al pasar página se actualizan la URL y la etiqueta. Al intentar avanzar más
allá de la última hoja aparece el overlay "¡Módulo completado!".

### Transiciones
`hooks/useLevelIntro.js`: fade + scale 0.985→1 en 350ms al entrar a un nivel.

---

## 📁 ESTRUCTURA

```
src/
├── App.jsx                    ← HashRouter con los 3 niveles
├── components/
│   ├── book/     BookCover · ScreenThumb · LessonSpread · LessonCard
│   ├── nav/      MenuButton · RoundButton
│   ├── decor/    Swirl · Leaf · TropicalFlower · WaterWave · SunBurst
│   ├── content/  VocabularyBox · CulturalTip · Checklist · GreetingsList
│   ├── activities/ ExerciseBlock · MatchActivity · MatchMarkers · MatchSlots ·
│   │              MatchHeadings · MultipleChoice · FillBubbles ·
│   │              FillInSentence · ListeningActivity · SpeakingPrompt ·
│   │              RecordPrompt · DiceGame
│   ├── media/    AudioPlayer · AudioButton (🎧 por frase) · DialogueBlock · RoutineBlock
│   ├── layout/   ReaderBar
│   ├── cards/    BookCard
│   └── ui/       Button · PillButton · ProgressBar · FeedbackToast ·
│                 SectionLabel · AnalogClock · ImagePlaceholder (SmartImage)
│   └── study/    StudyShell · RequireSession · StudyExercise ·
│                 exercises/ FillInEx · MatchEx · ScrambleEx
├── pages/        Home · BookMenu · ModuleGrid · LessonReader · GamesPicker · ModuleGames
│   └── study/    StudyLogin · StudyMap · StudyTopic · StudyQuiz · StudyArcade · StudyTeacher
├── books/        index.js · registry.json · english-a1/modules.json · english-a1/games.json
├── study/        index.js · strings.js · english-a1/module1.json
├── services/     authService.js (login · logout · getSession · subscribe · listUsers)
├── data/         users.json (DEMO ONLY)
├── hooks/        useProgress · usePageAnimation · useFeedback · useLevelIntro · useDragDrop ·
│                 useSession · useStudyProgress
├── utils/        numberWords.js
└── styles/       global.css
```

### Agregar un libro
1. Añadirlo a `registry.json` · 2. Crear `<id>/modules.json` · 3. Importarlo en `CONTENT` de `books/index.js`.

### Agregar un tipo de sección o actividad
Crear el componente y registrarlo en `components/book/PageContent.jsx`
(mapa `ACTIVITIES` para actividades, un `if` por `section.type` para el resto).
**Nunca hardcodear contenido en componentes.**

---

## 📖 CONTENIDO — MÓDULO 1 (portada + 2 lecciones · 12 pantallas, págs. 6 → 16)

**⚠️ Contenido de Sharick. Títulos, diálogos y mecánicas exactos** (documento
oficial de Sharick con referencias visuales de Express Publishing).

### Lección 1.1 · **"Let's say Hi!"** (5 pantallas)

| Pantalla | Pág | Contenido |
|---|---|---|
| 1.1-s1 | 6 | Reading · Exercise 1 "Listen and read the dialogues (A-C)." Diálogos A/B/C + `audioTracks` (1-1-a/b/c.mp3) + ilustración `grupos-4-paises.png` |
| 1.1-s2 | 7 | Exercise 2 "Match the dialogues (A-C) to the pictures (1-3)." `matchMarkers` con `style: "slots"` — cajitas [1][ _ ] sobre la ilustración, fichas A/B/C arrastrables. **Respuestas: 1→B, 2→C, 3→A** |
| 1.1-s3 | 8 | Exercise 3 "Match the headings to the dialogues." `matchHeadings` — píldoras roja/dorada/azul a slots grises sobre cada diálogo |
| 1.1-s4 | 9 | Speaking · Exercise 4 "Introduce yourself and say goodbye." (`speaking`) |
| 1.1-s5 | 10 | Speaking · Exercise 5 Spin & Speak (`roulette`) |

**Diálogos de 1.1 (texto EXACTO, con tildes: Lucía, Sofía, Andrés):**
- **A** (morado #8E7CC3): Camila/Mateo se conocen — "Hi! I'm Camila." · "Hey, Camila.
  I'm Mateo." · "It's a pleasure to meet you, Mateo." · "Nice to meet you too."
- **B** (coral #E05A47): Valentina presenta a Lucía a Diego — "Hello, Diego. What's up?"
  · "Not much. And you?" · "I'm good. This is my friend Lucía. Lucía, this is Diego." ·
  "Hi, Lucía. Great to meet you." · "Hi, Diego. Nice to meet you too."
- **C** (azul #3F86B8): Sofía/Andrés se despiden — "Goodbye, Andrés." · "Bye, Sofía.
  Take care!" · "See you soon!"

La ilustración `grupos-4-paises.png` muestra tres grupos: **1** trío conociéndose
(→ B), **2** despedida (→ C), **3** pareja conociéndose (→ A). Los `markers`
del JSON (x/y en %) posicionan las cajitas.

### Lección 1.2 · **"Greeting people"** (6 pantallas)

| Pantalla | Pág | Contenido |
|---|---|---|
| 1.2-s1 | 11 | Vocabulary · Exercise 1 "Read, listen and repeat." Bloque `greetings`: Good morning / afternoon / evening / night, cada uno con 🎧 (`greet-*.mp3`); Good night con nota (+) "We use this when we go to sleep." · ilustración `greetings-day.png` |
| 1.2-s2 | 12 | Exercise 2 "Look at the clock. Say the greeting." `fillBubbles` con `clock: "digital"` (LCD, `ui/DigitalClock`): **8:00 am · 1:30 pm · 9:45 pm · 10:11 pm** → morning / afternoon / evening / night · viñetas `clock-scene-1..4.png` |
| 1.2-s3 | 13 | Listening · Exercise 3 "Listen and circle the correct answer." `listenCircle`: 5 ítems a/b con 🎧 (`listen-1..5.mp3`), la correcta siempre la **a** |
| 1.2-s4 | 14 | Speaking · Exercise 4 "Look at the expressions. Choose and say to your classmate." `expressions`: 3 bloques (Greet people + Respond · Introduce yourself + Respond · Say goodbye), cada expresión con 🎧 (`expr-*.mp3`) |
| 1.2-s5 | 15 | Exercise 5 **Roll and speak!** `diceGame` en modo categoría: 1-2 Say hi! · 3-4 Say goodbye! · 5-6 Introduce yourself! — **sin frases de ejemplo** (Sharick: son respuestas del estudiante). Dado al centro, `greeting-person.png` / `goodbye-person.png` a los lados |
| 1.2-s6 | 16 | Can-do check (greet at any time of day · respond to greetings · introduce myself · say goodbye) + CULTURAL TIP "onces" en inglés |

**Listening 1.2-s3 (texto EXACTO):** 1 "Hi, Julián! How's it going?" → I'm pretty good,
thanks. · 2 "Goodbye, Carolina!" → Bye, take care! · 3 "Kevin, this is my friend, Ana."
→ Nice to meet you, Ana. · 4 "Good morning, Carolina!" → Good morning, Julián! ·
5 "What's your name?" → I'm Ana. Estos ítems también van en los quizzes de Study (T2-T6).

Las lecciones siguientes se agregan al array `lessons` de `modules.json`.

### Esquema de lección y pantalla
```json
{
  "id": "1.1", "shortTitle": "Let's say Hi!", "resources": ["audio","game"],
  "screens": [
    { "id": "1.1-s2", "title": "Match · Dialogues to pictures",
      "pageNumber": 7, "section": "Reading",
      "layout": "dialogues-left-image-right",
      "audioTracks": [ { "label": "Dialogue A", "src": "/audio/english/module1/1-1-a.mp3" } ],
      "exercise": { "number": 2, "skill": "read",
                    "instruction": "Match the dialogues (A-C) to the pictures (1-3)." },
      "dialogues": [ { "letter": "A", "audio": "…",
                       "lines": [ { "speaker": "Camila", "text": "Hi! I'm Camila." } ] } ],
      "illustration": { "src": "…", "alt": "…",
                        "markers": [ { "n": 1, "x": 22, "y": 58, "label": "Trío conociéndose" } ] },
      "activity": { "activity": "matchMarkers", "style": "slots",
                    "pairs": [ { "marker": 1, "dialogue": "B" } ] } }
  ]
}
```
`audio` (una pista) o `audioTracks` (varias, con pills y encadenado automático)
ponen el `AudioPlayer` en la cabecera de la pantalla.
La portada es `{ "id": "cover", "type": "cover", "screens": [{ "layout": "cover" }] }`.

**Layouts** (`layout`): `dialogues-left-image-right` · `two-columns` ·
`image-top-activity-bottom` · `activity-full` · `dialogues-only` · `cover`.
`dialogues-left-image-right` dibuja la actividad si la hay (`matchMarkers`,
`matchHeadings`) y, si no, los diálogos a la izquierda y la ilustración a la
derecha.
Los bloques de contenido (`blocks`) reutilizan `vocabulary`, `culturalTip`,
`routine`, `checklist` y `text`.

`title` es el rótulo corto que sale bajo la miniatura del Nivel 2. Si falta,
`screenTitle()` lo deduce, pero conviene escribirlo a mano.

**Regla de oro del formato:** una pantalla = lo que cabe sin scroll. Si algo se
sale, se parte en otra pantalla, no se encoge el texto.

---



## 🎲 ACTIVIDADES LÚDICAS DISPONIBLES

Todas se declaran desde `modules.json` con `{"type":"activity","activity":"<nombre>"}`
y se registran en el mapa `ACTIVITIES` de `components/book/PageContent.jsx`.

| `activity` | Componente | Qué hace | Se completa cuando |
|---|---|---|---|
| `diceGame` | DiceGame | Dado. Si los `ranges` no traen `phrases` es **modo categoría** (Roll and speak!: pestaña grande con la consigna, `sideImages` a los lados) | salieron los 3 rangos |
| `roulette` | RouletteWheel | Ruleta de consignas de speaking | salieron todos los segmentos |
| `match` | MatchActivity | Emparejar diálogo ↔ personas | todos los pares |
| `matchMarkers` | MatchMarkers · **MatchSlots** (`style: "slots"`) | Diálogos ↔ grupos de la ilustración. Con `slots`: cajitas [1][ _ ] junto a cada grupo y fichas A/B/C arrastrables desde una bandeja | todos los pares |
| `matchHeadings` | MatchHeadings | Títulos (píldoras `red` / `yellow` / `blue`) ↔ diálogos, con un slot gris sobre cada caja | todos los títulos |
| `fillBubbles` | FillBubbles | Saludo según el reloj (analógico, o `clock: "digital"` + `columns` = rejilla con relojes LCD) | todas las burbujas |
| `listenCircle` | ListenAndCircle | Ítems con 🎧 y opciones a/b; la elegida se rodea con un círculo a mano | todas correctas |
| `expressions` | ExpressionCards | Bloques de expresiones con 🎧; tocar la frase = dicha | una de cada bloque |
| `fillInSentence` | FillInSentence | Frases con hueco, input con línea | todas las frases |
| `listening` | ListeningActivity | Audio + preguntas de opción múltiple | todas correctas |
| `multipleChoice` | MultipleChoice | Preguntas sueltas de opción múltiple | todas correctas |
| `speaking` | SpeakingPrompt | Checklist de frases modelo + grabación | todas marcadas |
| — | MemoryGame · QuickQuiz · WordScramble | solo en el hub de Games, ver más abajo | — |
| `recordPrompt` | RecordPrompt | Preguntas numeradas para responder en voz alta | todas respondidas |

### Drag & drop (`hooks/useDragDrop.js`)
`MatchSlots` y `MatchHeadings` arrastran con **Pointer Events** (mouse, dedo y
lápiz) y traducen las coordenadas a las del lienzo escalado dividiendo por la
escala real del contenedor. El fantasma sigue al puntero; al soltar se busca
`document.elementFromPoint` → `[data-drop]`. Un gesto que se mueve menos de
6px cuenta como toque → **click-click** (toca la ficha, toca el slot). Los
elementos arrastrables llevan `touch-none`. Acierto: `celebrate` + borde
salvia; fallo: `shake`, toast y la ficha vuelve a la bandeja.

```json
{ "activity": "matchHeadings",
  "headings": [
    { "text": "Say Hi & introduce yourself", "color": "red",    "target": "A" },
    { "text": "Say Hi & introduce a friend", "color": "yellow", "target": "B" },
    { "text": "Say goodbye",                 "color": "blue",   "target": "C" } ] }
```

### Ruleta (`roulette`)
Rueda SVG de **460px** (domina la pantalla) con 6-8 segmentos de colores alternados
navy / coral / salvia / dorado, etiquetas grandes en dos líneas (las de la mitad de
abajo giradas para no leerse de cabeza), puntero coral arriba y botón "🎡 Spin!".

```json
{ "type": "activity", "activity": "roulette", "title": "Spin & Speak!",
  "instructions": "…",
  "segments": [ { "label": "Your name", "prompt": "Say: My name is ___." } ] }
```

Dos detalles de implementación que hay que respetar:
- **El giro va con transición CSS y el pulso con Anime.js, sobre elementos
  distintos.** Si los dos animan el mismo nodo, anime reconstruye el `transform`
  y pierde la rotación: la rueda acierta el segmento pero se queda quieta.
- **El aterrizaje va por `setTimeout`, no por `onComplete`.** Ese callback no
  llegó a dispararse y la ruleta se quedaba en "Girando…" para siempre.

---

## 🎮 SECCIÓN GAMES (por módulo)

**Los juegos van por módulo, no en un hub global.** Cada módulo tiene su
pantalla con solo sus juegos, hechos con su propio vocabulario y sus diálogos.

```
/book/:bookId/games                    selector: "¿De qué módulo quieres jugar?"
/book/:bookId/module/:moduleId/games   juegos de ese módulo
```

### Cuatro entradas
1. **Nivel 2** — tarjeta especial al final de la rejilla, "🎮 Games · Module N",
   en verde salvia suave, con "3 de 6 jugados · ⭐ 7".
2. **Nivel 3** — icono 🎮 en la barra superior, solo si el módulo tiene juegos.
3. **Nivel 1** — el botón Games abre `pages/GamesPicker.jsx`, con una barra por
   módulo (los que no tienen juegos salen como "Próximamente").
4. **Fin de módulo** — el overlay "¡Módulo completado!" trae
   "🎮 Jugar los juegos del módulo".

### Pantallas y piezas
- `pages/ModuleGames.jsx` — cabecera "Module N · Nombre", [X] al Nivel 2 y
  rejilla de `games/GameCard.jsx` (3 / 1 columnas, hover scale 1.04, badge
  "Jugado ✓", estrellas y mejor puntaje). Sin filtro de pills: ya no hace falta.
- `games/GameShell.jsx` abre cada juego a pantalla completa con [X] y Escape.
  **Los juegos viven fuera del flipbook**, así que no compiten con las esquinas.
- `games/GameResult.jsx` cierra la partida: estrellas con pop-in escalonado,
  confeti de la paleta y "Jugar otra vez" / "Volver a Games".

### Juegos
| `type` | Componente | Origen |
|---|---|---|
| `diceGame` · `roulette` · `match` | los del libro | se reutilizan tal cual; el JSON les pasa `label: "Game"` |
| `memory` | `games/MemoryGame.jsx` | parejas inglés ↔ español, giro 3D, intentos y tiempo |
| `quiz` | `games/QuickQuiz.jsx` | 10 preguntas con barra de tiempo por pregunta |
| `scramble` | `games/WordScramble.jsx` | ordenar palabras (o letras si es una sola palabra) |

### `books/<libro>/games.json`
```json
{ "modules": {
  "1": { "games": [
    { "id": "memory-m1", "type": "memory", "icon": "🃏",
      "title": "Memory Cards", "blurb": "…",
      "data": { "pairs": [["Good morning","Buenos días"]] } }
  ]},
  "2": { "games": [] }
} }
```
Agregar un juego = agregar un objeto al módulo que corresponda, **usando solo
contenido de ese módulo**. Si es un tipo nuevo, registrarlo además en
`renderGame()` de `ModuleGames.jsx`.

### Progreso de juegos
En `sharick-progress`, agrupado por módulo:
`games["1"] = { played: [ids], stars: {id: n}, bestScores: {id: n} }`.
El hook expone `recordGame(moduleId, gameId, {score, stars})`,
`getGameResult(moduleId, gameId)` y `getModuleGameStats(moduleId, ids)`.

**Ojo con el fin de partida:** el aviso `onFinish` va detrás de un `useRef`,
no de un estado. El store de progreso notifica de forma síncrona, así que un
guard basado en estado se re-entra antes de commitear y provoca un bucle de
renders que tumba la app (se registraron 51 partidas en una sola).

---

## 🎓 STUDY ZONE (práctica por temas con progresión bloqueada)

Filosofía del libro JuanCode: **el LIBRO es la clase** (teoría, navegación
libre, sin login) y **STUDY es la práctica por TEMAS con candados**: el tema
N+1 se abre solo al APROBAR el quiz del tema N (nota mínima `passScore`, 80).
**Toda la UI de Study va en INGLÉS** y sale de `study/strings.js` (`S`);
el contenido, de `study/<libro>/moduleN.json`.

### Entradas
- **Home** (`pages/Home.jsx`): banner navy "Study Zone" debajo de las cards de
  libros (florituras doradas, cuadritos pixel, features 📚 ✏️ 🏆 🎮) con el
  botón dorado "Start Studying →" → `/study/login` sin sesión, `/study/english-a1`
  con sesión.
- **Nivel 1**: el botón **Workbook** lleva a `/study/english-a1`
  (`resources[].route` admite rutas absolutas que empiezan por `/`).

### Login por roles (`services/authService.js`)
- `/study/login` (`pages/study/StudyLogin.jsx`): card centrada, Username +
  Password, "Sign in", error con shake. Recuerda a dónde iba (`state.from`).
- **⚠️ DEMO ONLY — sin backend.** Usuarios en `src/data/users.json`
  (`{ username, password, role: teacher|student, name }`): `sharick/teacher2026`
  (teacher), `demo/demo1234`, `ana/ana123`, `luis/luis123`, `maria/maria123`,
  `carlos/carlos123`. Sesión en localStorage `sharick-session`
  = `{ username, role, name }`.
- **Plan de migración → Cloudflare D1 + Pages Functions**: `login()` → POST
  /api/login (hash + cookie HttpOnly), `logout()` → POST /api/logout,
  `getSession()` → GET /api/session, `listUsers()` → GET /api/users (teacher).
  La INTERFAZ (`login / logout / getSession / subscribe / listUsers`) no
  cambia: los componentes no se tocan, solo la implementación.
- `hooks/useSession.js` expone la sesión reactiva; `components/study/
  RequireSession.jsx` protege rutas (`role="teacher"` para el modo profe).

### Progreso por usuario (`hooks/useStudyProgress.js`)
localStorage `sharick-study-{username}` =
`{ passed: {t1: 95}, attempts: {t1: 2}, manualUnlocks: ['t3'], arcadeBest, updatedAt }`.
`recordQuiz(topicId, score, passScore)` guarda la mejor nota aprobada;
`isUnlocked(topics, i)` = primero, o anterior aprobado, o `manualUnlocks`.
`readStudy / writeStudy / toggleManualUnlock` sirven al modo profe para OTROS
usuarios.

### Contenido (`study/english-a1/module1.json`)
Tema = `{ id, title, summary, learn[], exercises[], quiz: { passScore, questions[] } }`.
- `learn[]`: `text` · `phrases` (`items: [{en, es, note}]`) · `dialogue`
  (`letter`, `title`, `lines`, colores de `BUBBLE_COLORS`) · `tip`.
- `exercises[]` (5-8, intentos ilimitados, feedback inmediato):
  `multipleChoice` (`q, options, correct`, reutiliza `activities/MultipleChoice`) ·
  `fillIn` (`sentence` con `___`, `answer`, `accept[]`, `hint`) ·
  `match` (`pairs: [[en, es]]`) · `scramble` (`answer`, `hint`).
  Se registran en `STUDY_EXERCISES` de `components/study/StudyExercise.jsx`.
- `quiz.questions[]`: 8-10 de opción múltiple (`q, options, correct`).
- Módulo 1: T1 Greetings · T2 Introducing yourself · T3 Introducing others ·
  T4 Saying goodbye · T5 Times of the day · T6 How are you?. Módulos 2-4
  registrados vacíos en `study/index.js` → "Coming soon".

### Pantallas
Todas van dentro de `components/study/StudyShell.jsx`: marco coral, banner
navy con "Hi, {name}! 👋", toolbar 🏠 ☰ Log out y 🛡️ Teacher mode si
`role === 'teacher'`.
- **Mapa** `/study/:bookId` (`StudyMap`): selector de módulo (vacíos =
  Coming soon), barra "n of 6 topics passed", botón 🎮 Arcade (se activa con
  el primer quiz aprobado) y camino de temas: ✅ Passed (mejor nota) ·
  🔓 Available · 🔒 Locked (tooltip "Pass the quiz of …"). Al aprobar todos:
  banner "Module 1 mastered! 🏆" + "Go to Games".
- **Tema** `/study/:bookId/:topicId?tab=learn|practice|quiz` (`StudyTopic`):
  tabs Learn · Practice (contador n/total) · Final Quiz ("Start quiz" /
  "Retake quiz" + "Next topic →"). Tema bloqueado por URL → vuelve al mapa.
- **Quiz** `/study/:bookId/:topicId/quiz` (`StudyQuiz`): preguntas y opciones
  barajadas en cada intento, una a la vez, SIN feedback hasta el final.
  ≥ passScore: confeti + "Topic unlocked: …"; si era el último, "Module N
  mastered!". < passScore: "Retake quiz" ilimitado. Revisión de respuestas
  al final. `recordQuiz` va en un `useEffect` con guard en ref (el store
  notifica en síncrono).
- **Arcade** `/study/:bookId/arcade` (`StudyArcade`): 15 preguntas al azar
  de los temas DESBLOQUEADOS (`topicQuestionPool`: quiz + multipleChoice de
  práctica), 20 s por pregunta con barra dorada animada (Anime.js), puntaje y
  récord por usuario (`arcadeBest`, "New record! 🏆").
- **Modo profe** `/study/teacher` (`StudyTeacher`, solo `teacher`; reemplaza
  el PIN): tabla estudiantes × temas con ✓ nota / 🔓 / 🔒 y checkbox "Unlock
  manually" por tema (escribe `manualUnlocks` en `sharick-study-{username}`).
  Con localStorage el profe solo ve el progreso de ESE navegador; con D1 será
  progreso real multi-dispositivo.

---

## 💾 PROGRESO (useProgress)

localStorage key `sharick-progress`. Id de actividad = `` `${screen.id}-${activity.id ?? activity.activity}` ``
(p. ej. `1.1-s1-matchMarkers`). Guarda el mejor puntaje. El store usa
`useSyncExternalStore`, así que las barras reaccionan al instante.

Además de `completedActivities` guarda `visitedScreens` (las pantallas que el
estudiante ya abrió, para el check verde del Nivel 2 en las que no llevan
actividad) y `currentPage` (la última pantalla vista, para el scroll + pulso
dorado al volver a la rejilla). Los escribe `visitScreen(screenId)` desde
`LessonReader`.

---

## 🖼️ IMÁGENES Y AUDIO

- Estilo Gemini: *"Editorial illustration for a printed language textbook, National Geographic
  Learning style. Soft watercolor, warm cream background #F7F2E9, navy #1B3A5C, coral #E05A47,
  sage green #6B9080, golden yellow #E9B44C. Minimalist, elegant, rounded shapes,
  Latin American culture focus: Colombia como base, más Venezuela, Bolivia y Panamá."*
- Escenas futuras: solo de esos cuatro países (Cartagena, Bogotá, Medellín,
  Caracas, La Paz, Ciudad de Panamá).
- Mientras no exista el archivo, `SmartImage` muestra un marco punteado con emoji y
  **la ruta exacta** que falta (`compact` para miniaturas: solo emoji).
- Audio: si falta el mp3, `AudioPlayer` muestra "Audio próximamente" sin romper nada.

---

## 🚦 ESTADO

- **HECHO:** setup, formato de pantalla completa, sistema editorial completo,
  todas las actividades, contenido del Módulo 1 (12 pantallas), juegos por
  módulo, Nivel 2 con miniaturas de doble página, Study Zone con login demo,
  6 temas del Módulo 1, quiz con candados, arcade y modo profe.
- **PENDIENTE:** imágenes (Gemini), audios (mp3), módulos 2-4 (libro y Study),
  migración del login/progreso de Study a Cloudflare D1 + Pages Functions,
  deploy en Cloudflare Pages y Electron.

---

## ✅ REGLAS DE ORO

1. **Contenido de Sharick es sagrado** — mecánicas exactas (dado 1-2/3-4/5-6,
   reloj analógico normal, match A/B/C) y títulos exactos, salvo cambio explícito
   del cliente. Cambios ya aprobados: lección 1.2 → **"Greeting people"** (documento
   oficial, 2026-09-23; antes "Hello, amigo!"), ruleta "Your city" → "Your country"
   y "Let's say hi to Colombia!" → **"Let's say Hi!"** (lección 1.1, documento
   oficial de Sharick, 2026-09-13).
2. **Todo en JSON** — cero contenido hardcodeado en componentes.
3. **Todo animado** — Anime.js en cada interacción.
4. **Papel cálido, cero dark mode.** Tricolor solo en portada.
5. **Mobile responsive** — react-pageflip pasa a una sola hoja en vertical.
6. **El contenido del libro va 100 % en inglés** (instrucciones, labels, hints,
   placeholders, toasts y botones dentro de la página). El español solo queda en
   la UI general de navegación (tooltips de la toolbar, Nivel 1/2, Games).
7. Redactar diálogos/ejercicios PROPIOS — nunca copiar texto de otros libros.
8. Commits frecuentes y descriptivos en español.
