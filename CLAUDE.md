# CLAUDE.md — Sharick Platform (Plataforma Educativa Multiidioma)

## 🎯 CONTEXTO DEL PROYECTO

Plataforma educativa interactiva de idiomas para la profesora **Sharick Prieto**.
Contendrá múltiples libros digitales interactivos: **Inglés A1** (primero), luego Portugués A1 y Español A1.

**IMPORTANTE — enfoque LATINOAMERICANO.** Los temas gramaticales estándar de A1 se
mantienen, pero los ejemplos, personajes, lugares, lecturas e ilustraciones son de
**Latinoamérica**, con **Colombia como país base**: Cartagena, Bogotá y Medellín siguen
siendo el escenario principal, y alrededor entran México, Argentina, Perú, Venezuela,
Chile, Ecuador y Brasil. En `modules.json` el libro lleva `region: "Latin America"` y
`baseCountry: "Colombia"`; el Módulo 1 conserva `country: "Colombia"`.

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

### Nivel 2 — pantallas del módulo (`pages/ModuleGrid.jsx`)
**El Nivel 2 muestra una miniatura por PANTALLA, agrupadas por lección**, como
el índice visual de Express Publishing. No hay tarjetas de lección con
"5 pantallas": si el módulo tiene 13 pantallas, hay 13 miniaturas, en el orden
real del libro (portada → 1.1-s1 → 1.1-s2 → … → 1.2-s1 → …).

- **Rejilla** `.grid-pantallas` (definida en `global.css`): 2 columnas en móvil,
  3 desde 768px, 4 desde 1280px y 5 desde 1800px. Va en CSS y **no** con
  utilidades responsive porque Tailwind ordena un breakpoint `3xl` ANTES que
  `xl` y la regla de 4 columnas le ganaba a la de 5. Contenedor de 1480px
  (1820px en `3xl`), scroll vertical normal, tarjetas de ~335px.
- **Miniatura real** (`book/ScreenThumb.jsx`): renderiza ESA pantalla en 16:10
  con `pointer-events: none` y un progreso inerte, para que ninguna actividad
  se marque desde la miniatura. La escala se calcula con `ResizeObserver`
  (`ancho de la tarjeta / 1600`), así que sirve igual a 2 que a 5 columnas.
- **Etiqueta** en la esquina superior izquierda: cuadro coral con la lección en
  grande ("1.1") y debajo, pequeño, el número de pantalla ("2/5"). La portada
  lleva ★.
- **Título** debajo de la miniatura, en Playfair navy. Sale de `screen.title`;
  si falta, `screenTitle()` lo deduce de `section` + `exercise`.
- **Badges** abajo a la derecha, calculados por `screenBadges()` sobre ESA
  pantalla: 🔊 audio (`screen.audio`, diálogos con audio o actividad
  `listening`) · 🎮 juego (`diceGame`, `roulette`) · 🎬 video · ✏️ ejercicio
  escrito (`match`, `matchMarkers`, `fillBubbles`, `fillInSentence`,
  `multipleChoice`) · 🎙️ speaking (`speaking`, `recordPrompt`).
- **Check verde** arriba a la derecha si la pantalla está completada. Una
  pantalla CON actividad se completa al resolverla; una sin actividad, con
  verla (`visitedScreens` en `useProgress`).
- **Separador por lección**: línea punteada beige con el label
  "1.1 · LET'S SAY HI!" en coral mayúsculas a la izquierda, ocupando toda la
  fila. La primera tarjeta de cada lección lleva **borde coral de 2px**.
- **Progreso en la cabecera**: barra delgada coral + "8 de 13 pantallas
  completadas" en Nunito 600.
- Entrada con stagger de 40ms; hover scale 1.04; al abrir, la tarjeta hace zoom
  y navega a `…/lesson/<id>/screen/<n>`.
- **Al volver con [X]** la rejilla hace scroll hasta la tarjeta donde estaba el
  estudiante (`progress.currentPage`) y le lanza un pulso dorado.
- Los juegos tienen **dos entradas**: la tarjeta "🎮 Games · Module N" al final
  de la rejilla y un botón flotante 🎮 junto al [🏠], abajo a la izquierda.
- Botón circular coral [X] arriba a la derecha → Nivel 1.

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
│   ├── book/     BookViewer · BookPage · BookCover · PageContent ·
│   │             CornerFlip · ScreenThumb
│   ├── nav/      MenuButton · RoundButton
│   ├── decor/    Swirl · Leaf · TropicalFlower · WaterWave · SunBurst
│   ├── content/  VocabularyBox · CulturalTip · Checklist
│   ├── activities/ ExerciseBlock · MatchActivity · MultipleChoice · FillBubbles ·
│   │              FillInSentence · ListeningActivity · SpeakingPrompt ·
│   │              RecordPrompt · DiceGame
│   ├── media/    AudioPlayer · DialogueBlock · RoutineBlock
│   ├── layout/   ReaderBar
│   ├── cards/    BookCard
│   └── ui/       Button · PillButton · ProgressBar · FeedbackToast ·
│                 SectionLabel · AnalogClock · ImagePlaceholder (SmartImage)
├── pages/        Home · BookMenu · ModuleGrid · LessonReader
├── books/        index.js · registry.json · english-a1/modules.json
├── hooks/        useProgress · usePageAnimation · useFeedback · useLevelIntro
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

## 📖 CONTENIDO — MÓDULO 1 (6 lecciones · 12 páginas, 6 → 17)

**⚠️ Contenido de Sharick. Títulos y mecánicas exactos.**

| Pág | Contenido |
|-----|-----------|
| 6 | LESSON 1 · **"Let's say hi to Colombia!"** + VOCABULARY (greetings) |
| 7 | Ilustración Cartagena + CULTURAL TIP (¿usted o parcero?) |
| 8 | Reading · Dialogue A (formal) y B (informal) |
| 9 | Dialogue C (presenta a un tercero) + EXERCISE 1 (match A/B/C) |
| 10 | EXERCISE 2 (fill in sentence) + EXERCISE 3 (speaking: preséntate y despídete) |
| 11 | Ilustración + EXERCISE 4 (record prompt) |
| 12 | LESSON 2 · **"Hello parcero!"** + rutina del día (mañana/tarde/noche/dormir) |
| 13 | Ilustración + VOCABULARY (times of the day) + CULTURAL TIP (las onces) |
| 14 | EXERCISE 1 (fill bubbles con **reloj analógico clásico**) |
| 15 | EXERCISE 2 (listening + preguntas) |
| 16 | EXERCISE 3 (**dado de emociones**: 1-2 I'm fine · 3-4 Not bad · 5-6 So-so) |
| 17 | Can-do check + ilustración de cierre |

Cada **lección es UNA doble página**. Las siguientes se agregan al array
`lessons` de `modules.json`. Mantener las páginas **pares a la izquierda** e
impares a la derecha para que las dobles páginas queden balanceadas.

| Lección | Páginas | Contenido |
|---------|---------|-----------|
| cover | — | Portada del libro (va sola) |
| 1.1 | 6–7 | Let's say hi to Colombia! · vocabulario · Cultural Tip |
| 1.2 | 8–9 | Dialogues A, B y C · Exercise 1 (match) |
| 1.3 | 10–11 | Exercises 2 a 5 (fill in, speaking, record, **ruleta**) |
| 1.4 | 12–13 | Hello, amigo! · times of the day · Cultural Tips |
| 1.5 | 14–15 | Exercise 1 (relojes) · Exercise 2 (listening) |
| 1.6 | 16–17 | Exercise 3 (el dado) · Can-do check |

### Esquema de lección y pantalla
```json
{
  "id": "1.1", "shortTitle": "Let's say hi!", "resources": ["audio","game"],
  "screens": [
    { "id": "1.1-s1", "title": "Reading · Dialogues A-C",
      "pageNumber": 6, "section": "Reading",
      "layout": "dialogues-left-image-right",
      "audio": "/audio/english/module1/1-1-dialogues.mp3",
      "exercise": { "number": 1, "skill": "listen",
                    "instruction": "Listen and read the dialogues (A-C)." },
      "dialogues": [ { "letter": "A", "audio": "…",
                       "lines": [ { "speaker": "Camila", "text": "Hi! I'm Camila." } ] } ],
      "illustration": { "src": "…", "alt": "…",
                        "markers": [ { "n": 1, "x": 20, "y": 62, "label": "Camila & Mateo" } ] },
      "activity": { "activity": "matchMarkers",
                    "pairs": [ { "dialogue": "A", "marker": 1 } ] } }
  ]
}
```
La portada es `{ "id": "cover", "type": "cover", "screens": [{ "layout": "cover" }] }`.

**Layouts** (`layout`): `dialogues-left-image-right` · `two-columns` ·
`image-top-activity-bottom` · `activity-full` · `dialogues-only` · `cover`.
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
| `diceGame` | DiceGame | Dado de emociones: 1-2 I'm fine · 3-4 Not bad · 5-6 So-so | salieron los 3 rangos |
| `roulette` | RouletteWheel | Ruleta de consignas de speaking | salieron todos los segmentos |
| `match` | MatchActivity | Emparejar diálogo ↔ personas | todos los pares |
| `fillBubbles` | FillBubbles | Saludo según el reloj analógico | todas las burbujas |
| `fillInSentence` | FillInSentence | Frases con hueco, input con línea | todas las frases |
| `listening` | ListeningActivity | Audio + preguntas de opción múltiple | todas correctas |
| `multipleChoice` | MultipleChoice | Preguntas sueltas de opción múltiple | todas correctas |
| `speaking` | SpeakingPrompt | Checklist de frases modelo + grabación | todas marcadas |
| — | MemoryGame · QuickQuiz · WordScramble | solo en el hub de Games, ver más abajo | — |
| `recordPrompt` | RecordPrompt | Preguntas numeradas para responder en voz alta | todas respondidas |

### Ruleta (`roulette`)
Rueda SVG de 240px (280px en desktop) con 6-8 segmentos de colores alternados
navy / coral / salvia / dorado, puntero coral arriba y botón pill "¡Girar!".

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
  Latin American culture focus: Colombia como base, más México, Argentina, Perú, Venezuela, Chile, Ecuador y Brasil."*
- Mientras no exista el archivo, `SmartImage` muestra un marco punteado con emoji y
  **la ruta exacta** que falta (`compact` para miniaturas: solo emoji).
- Audio: si falta el mp3, `AudioPlayer` muestra "Audio próximamente" sin romper nada.

---

## 🚦 ESTADO

- **HECHO:** setup, formato libro con pasada de página, sistema editorial completo,
  todas las actividades, contenido del Módulo 1 (12 páginas).
- **PENDIENTE:** imágenes (Gemini), audios (mp3), páginas siguientes y módulos 2-4,
  deploy en Cloudflare Pages y Electron.

---

## ✅ REGLAS DE ORO

1. **Contenido de Sharick es sagrado** — mecánicas exactas (dado 1-2/3-4/5-6,
   reloj analógico normal, match A/B/C) y títulos exactos, salvo cambio explícito
   del cliente. Cambios ya aprobados: "Hello parcero!" → **"Hello, amigo!"** (lección 1.4),
   al pasar el libro a enfoque latinoamericano.
2. **Todo en JSON** — cero contenido hardcodeado en componentes.
3. **Todo animado** — Anime.js en cada interacción.
4. **Papel cálido, cero dark mode.** Tricolor solo en portada.
5. **Mobile responsive** — react-pageflip pasa a una sola hoja en vertical.
6. **Español en la UI de instrucciones, inglés en el contenido de aprendizaje.**
7. Redactar diálogos/ejercicios PROPIOS — nunca copiar texto de otros libros.
8. Commits frecuentes y descriptivos en español.
