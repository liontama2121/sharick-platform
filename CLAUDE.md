# CLAUDE.md — Sharick Platform (Plataforma Educativa Multiidioma)

## 🎯 CONTEXTO DEL PROYECTO

Plataforma educativa interactiva de idiomas para la profesora **Sharick Prieto**.
Contendrá múltiples libros digitales interactivos: **Inglés A1** (primero), luego Portugués A1 y Español A1.

**IMPORTANTE:** Todo el contenido del libro de Inglés A1 está enfocado 100% en **CULTURA COLOMBIANA**. Los temas gramaticales estándar de A1 se mantienen, pero todos los ejemplos, lecturas, imágenes y contextos son sobre Colombia.

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
| react-pageflip | v2 | Pasada de página del libro |
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

### Estructura de una página del libro (`BookPage` + `PageContent`)
1. `UNIT X` en coral + título grande serif navy (`unitTitle`)
2. `LESSON X` en coral + nombre de lección serif (`title`) + floritura dorada (`Swirl`)
3. Cajas beige (`.box-beige`, radio 12px): vocabulario, diálogos, dado
4. Botones pill blancos con icono (`PillButton`): 🔊 Listen · 🎙️ Record · ▶️ Practice
5. Divisor `.divider-dotted` entre secciones
6. `EXERCISE N` verde con hojita + instrucción bold + items numerados en coral,
   con **líneas para completar** (`.rule-fill`, input underline, sin caja)
7. `CULTURAL TIP`: caja verde salvia con solecito dorado y corazón
8. Ilustración grande, radio 20px (placeholder mientras no exista el archivo)
9. Pie: número en círculo coral + número **escrito en letras** (`numberToWords`),
   a la izquierda en páginas pares y a la derecha en impares
10. Decoración: flor tropical SVG en la esquina inferior + onda de acuarela

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
| Sidebar items | hover | translateX 6px, 200ms |
| Respuesta correcta | celebración | scale [1,1.15,1] + verde suave, 500ms |
| Respuesta incorrecta | shake | translateX [-8,8,-5,5,0], 400ms |
| ProgressBar | fill + número contando | 800ms `inOutQuad` |
| Dado | roll | rotate 720 + bounce, 900ms `outElastic(1, .6)` |
| Burbujas / frases | pop-in | scale [0.8,1], stagger 120ms |
| Pasada de página | react-pageflip | 800ms |

Todo respeta `prefers-reduced-motion`.

---

## 📁 ESTRUCTURA

```
src/
├── App.jsx                    ← HashRouter + Shell (sidebar / header / main)
├── components/
│   ├── book/     BookViewer · BookPage · BookCover · PageContent
│   ├── decor/    Swirl · Leaf · TropicalFlower · WaterWave · SunBurst
│   ├── content/  VocabularyBox · CulturalTip · Checklist
│   ├── activities/ ExerciseBlock · MatchActivity · MultipleChoice · FillBubbles ·
│   │              FillInSentence · ListeningActivity · SpeakingPrompt ·
│   │              RecordPrompt · DiceGame
│   ├── media/    AudioPlayer · DialogueBlock · RoutineBlock
│   ├── layout/   Sidebar · Header · MainContent
│   ├── cards/    BookCard
│   └── ui/       Button · PillButton · ProgressBar · FeedbackToast ·
│                 SectionLabel · AnalogClock · ImagePlaceholder (SmartImage)
├── pages/        Home · TopicPage (lector del libro)
├── books/        index.js · registry.json · english-a1/modules.json
├── hooks/        useProgress · usePageAnimation · useFeedback
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

## 📖 CONTENIDO — MÓDULO 1 (12 páginas, 6 → 17)

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

Las páginas siguientes se agregan al array `pages` de `modules.json` con su `pageNumber`.
Mantener las páginas **pares a la izquierda** e impares a la derecha para que las
dobles páginas queden balanceadas.

### Esquema de página
```json
{
  "id": "m1-p06", "pageNumber": 6,
  "unitTitle": "...", "lessonLabel": "Lesson 1", "title": "...",
  "navTitle": "texto corto para el sidebar",
  "hideHeader": false, "showUnit": true, "intro": "...",
  "sections": [ ... ]
}
```
Tipos de sección: `vocabulary` · `dialogues` · `routine` · `illustration` · `culturalTip` ·
`checklist` · `actions` · `divider` · `activity`.
Actividades (`section.activity`): `match` · `fillInSentence` · `fillBubbles` · `listening` ·
`multipleChoice` · `speaking` · `recordPrompt` · `diceGame`.

---

## 💾 PROGRESO (useProgress)

localStorage key `sharick-progress`. Id de actividad = `` `${page.id}-${section.id ?? section.activity}` ``
(p. ej. `m1-p09-match`). Guarda el mejor puntaje. El store usa `useSyncExternalStore`, así que el
ProgressBar del sidebar reacciona al instante.

---

## 🖼️ IMÁGENES Y AUDIO

- Estilo Gemini: *"Editorial illustration for a printed language textbook, National Geographic
  Learning style. Soft watercolor, warm cream background #F7F2E9, navy #1B3A5C, coral #E05A47,
  sage green #6B9080, golden yellow #E9B44C. Minimalist, elegant, rounded shapes,
  Colombian culture focus."*
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

1. **Contenido de Sharick es sagrado** — títulos exactos, mecánicas exactas
   (dado 1-2/3-4/5-6, reloj analógico normal, match A/B/C).
2. **Todo en JSON** — cero contenido hardcodeado en componentes.
3. **Todo animado** — Anime.js en cada interacción.
4. **Papel cálido, cero dark mode.** Tricolor solo en portada.
5. **Mobile responsive** — react-pageflip pasa a una sola hoja en vertical.
6. **Español en la UI de instrucciones, inglés en el contenido de aprendizaje.**
7. Redactar diálogos/ejercicios PROPIOS — nunca copiar texto de otros libros.
8. Commits frecuentes y descriptivos en español.
