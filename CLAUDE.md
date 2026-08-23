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
| localStorage | nativo | Progreso del estudiante (sin backend) |

**NO usar:** Redux, styled-components, CSS modules, Framer Motion, jQuery, Bootstrap.

### Build & Deploy
- Build output: `dist/`
- Deploy: Cloudflare Pages (repo conectado, branch `main`, build command `npm run build`, output `dist`)
- Electron se agrega en FASE FINAL. `vite.config.js` ya usa `base: './'` para rutas relativas.

### Decisiones de implementación (ya tomadas)
- **Tailwind v4 sin `tailwind.config.js`:** v4 es CSS-first. La paleta, las fuentes y las sombras
  se declaran con `@theme` en `src/styles/global.css`. No crear `tailwind.config.js`.
- **Pesos de fuente:** usar `font-medium` / `font-semibold` / `font-bold`.
  Tailwind v4 NO genera utilidades numéricas tipo `font-600`.
- **HashRouter:** las rutas usan `#/` para que funcionen igual en Cloudflare Pages,
  dentro de un iframe y en Electron (`file://`) sin configurar rewrites.

---

## 🎨 SISTEMA DE DISEÑO — "¡Hola English! Colombia Edition"

Estilo inspirado en los libros educativos ¡Hola English!: **minimalista, elegante, cálido, lúdico**. NADA de fondos oscuros. NADA de glassmorphism oscuro. Este proyecto es LUZ, CALIDEZ y COLOR COLOMBIANO.

### Paleta Oficial (tokens `@theme` en global.css)

```css
--color-col-blue:   #003DA5;  /* Azul Colombia — títulos, headings, énfasis, sidebar activo */
--color-col-yellow: #FFD100;  /* Amarillo tricolor — acentos, highlights, hover, decorativos */
--color-col-red:    #CE1126;  /* Rojo tricolor — botones CTA, detalles importantes */
--color-cream:      #faf8f4;  /* Fondo principal cálido (body) */
--color-ink:        #2c2c2c;  /* Texto principal */
```

### Reglas de uso de color
- Fondo body: `cream` (#faf8f4) SIEMPRE. Nunca blanco puro de fondo general.
- Cards y elementos principales: blanco `#ffffff` con `shadow-soft` (`0 4px 20px rgba(0,61,165,0.08)`), o la utilidad `.card-soft`.
- Títulos grandes: utilidad `.text-tricolor` (gradiente azul → amarillo → rojo con `bg-clip-text`).
- Gradientes por módulo (definidos en `modules.json`, no en componentes):
  - Module 1: `from-[#FFD100] to-[#CE1126]`
  - Module 2: `from-[#003DA5] to-[#FFD100]`
  - Module 3: `from-[#CE1126] to-[#003DA5]`
  - Module 4: `from-[#FFD100] to-[#003DA5]`

### Tipografía
- **Títulos:** `Fredoka` (500/600/700) → utilidad `font-title`
- **Cuerpo:** `Sora` (400/500/600) → utilidad `font-body` (por defecto en `body`)
- Jerarquía: h1 ~2.5-3rem · h2 ~2rem · h3 ~1.3rem · body 1rem

### Layout Principal

```
┌──────────────────────────────────────────────────────┐
│ SIDEBAR (izq, 280px)     │   CONTENIDO PRINCIPAL     │
│ • Logo plataforma        │ • Título grande (Fredoka) │
│ • Selector de libro      │ • Descripción             │
│ • Módulos (acordeón)     │ • Imagen grande           │
│ • Temas por módulo       │ • Contenido de la página  │
│ • Barra de progreso      │ • Actividades interactivas│
│                          │ • Navegación ant/sig      │
└──────────────────────────────────────────────────────┘
```

- Sidebar colapsable en mobile (hamburger en `Header.jsx`)
- Bordes redondeados generosos: `rounded-2xl` en cards, `rounded-full` en pills/botones
- Botones CTA: fondo `col-red`, texto blanco, `rounded-full`, hover con scale 1.05
- Espaciado generoso: padding 40-50px en secciones desktop

---

## ✨ ANIMACIONES (Anime.js v4) — ESPECIFICACIÓN

Importar: `import { animate, stagger } from 'animejs'`
En v4 la propiedad es `ease` (no `easing`): `'outQuad'`, `'outBack'`, `'outElastic(1, .6)'`.

Helpers compartidos en `src/hooks/useFeedback.js` (`celebrate`, `shake`, `popIn`, `hoverFloat`)
y `src/hooks/usePageAnimation.js` (`usePageAnimation`, `usePageSlide`).

| Elemento | Animación | Specs |
|----------|-----------|-------|
| Entrada de página | fadeIn + translateY | `[20, 0]`, opacity `[0,1]`, 600ms, `outQuad`, stagger 80ms sobre `[data-anim]` |
| Cards de módulo/tema | hover float | scale 1.05, translateY -8, 300ms |
| Sidebar items | hover | translateX 6px, color → col-yellow, 200ms |
| Respuesta correcta | celebración | scale [1, 1.15, 1] + fondo verde suave, 500ms |
| Respuesta incorrecta | shake | translateX [-8, 8, -5, 5, 0], 400ms + borde col-red |
| ProgressBar | fill animado | width animada + número contando, 800ms `inOutQuad` |
| Dado (DiceGame) | roll | rotate 720deg + scale bounce, 900ms, `outElastic(1, .6)` |
| Speech bubbles | pop-in | scale [0.8, 1] + opacity, stagger 120ms |
| Transición entre páginas | slide | entrada translateX [30, 0] + fade |

Regla: **TODA interacción visible tiene feedback animado.** Nada aparece de golpe.
Todos los helpers respetan `prefers-reduced-motion`.

---

## 📁 ESTRUCTURA DE CARPETAS

```
sharick-platform/
├── CLAUDE.md
├── package.json
├── vite.config.js               ← base './' para Electron/iframe
├── index.html                   ← carga Fredoka + Sora desde Google Fonts
├── public/
│   ├── images/english/module1..4/
│   └── audio/english/module1/
├── src/
│   ├── main.jsx
│   ├── App.jsx                  ← HashRouter + Shell (sidebar/header/main)
│   ├── components/
│   │   ├── layout/    Sidebar · Header · MainContent · PageNavigation
│   │   ├── cards/     BookCard · ModuleCard · TopicCard
│   │   ├── activities/ ActivityShell · MatchActivity · MultipleChoice ·
│   │   │               FillBubbles · ListeningActivity · SpeakingPrompt · DiceGame
│   │   ├── media/     AudioPlayer · DialogueBlock · RoutineBlock
│   │   └── ui/        ProgressBar · Button · FeedbackToast ·
│   │                  ImagePlaceholder (SmartImage) · AnalogClock
│   ├── pages/         Home · BookHome · TopicPage
│   ├── books/
│   │   ├── index.js             ← loader + helpers (findPage, activityId, …)
│   │   ├── registry.json        ← índice de libros
│   │   └── english-a1/modules.json  ← TODO el contenido del libro
│   ├── hooks/         useProgress · usePageAnimation · useFeedback
│   └── styles/global.css        ← Tailwind v4 + @theme + utilidades
```

### Agregar un libro nuevo
1. Añadirlo a `src/books/registry.json`.
2. Crear `src/books/<id>/modules.json`.
3. Importarlo en el mapa `CONTENT` de `src/books/index.js`.

### Agregar un tipo de sección o actividad
1. Crear el componente en `components/activities/` (o `media/`).
2. Registrarlo en el mapa `ACTIVITIES` (o en el renderer) de `src/pages/TopicPage.jsx`.
3. Usarlo desde el JSON. **Nunca hardcodear contenido en componentes.**

---

## 📖 CONTENIDO — MÓDULO 1: GREETINGS AND INTRODUCTIONS

**⚠️ CONTENIDO QUE PIDIÓ SHARICK. No cambiar títulos ni mecánicas.**

### PÁGINA 1 — "Let's say hi to Colombia!"
- 3 diálogos con audio (A formal, B informal, C presentando a un tercero), nombres colombianos,
  ambientados en Cartagena.
- Actividad 1 (`match`): emparejar cada diálogo con las personas correctas.
- Actividad 2 (`speaking`): presentarse y despedirse, con frases modelo y grabación opcional.

### PÁGINA 2 — "Hello parcero!"
**⚠️ El título ES "Hello parcero!". NO cambiarlo.**
- Sección `routine`: mañana / tarde / noche / al dormir, con su saludo.
- Actividad 1 (`fillBubbles`): completar la burbuja según la hora.
  **Reloj analógico clásico** (`AnalogClock.jsx`) — Sharick lo pidió explícitamente.
- Actividad 2 (`listening`): audio + preguntas de comprensión (con transcripción).
- Actividad 3 (`diceGame`): "How are you REALLY doing?" — dado de emociones.
  - 1-2 → "I'm fine" · 3-4 → "Not bad" · 5-6 → "So-so..."

### Páginas siguientes
Sharick las enviará progresivamente. Se agregan al array `pages` de `modules.json`
sin tocar código, siempre que usen tipos de sección ya soportados.

---

## 📊 ESQUEMA modules.json

Raíz: `{ bookId, bookName, country, modules: [ ... ] }`.
Cada módulo: `{ moduleId, moduleName, gradient, icon, description, pages: [ ... ] }`.
Cada página: `{ id, title, subtitle, backgroundImage, imageAlt, intro, sections: [ ... ] }`.

Tipos de sección soportados hoy:
- `dialogues` → `items[{ id, label, context, audio, characters, lines[{speaker,text}] }]`
- `routine` → `items[{ time, label, greeting, note, clockTime, emoji, image }]`
- `activity` con `activity`: `match` · `speaking` · `fillBubbles` · `listening` · `diceGame` · `multipleChoice`

Los ids de actividad se derivan como `` `${page.id}-${section.id ?? section.activity}` ``
(p. ej. `m1-p1-match`) — ver `activityId()` en `src/books/index.js`.

---

## 💾 PROGRESO (useProgress hook)

localStorage key: `sharick-progress`
```json
{
  "english-a1": {
    "currentPage": "m1-p2",
    "completedActivities": ["m1-p1-match"],
    "scores": { "m1-p1-match": 100 },
    "lastVisit": "2026-08-23"
  }
}
```
- Se guarda automáticamente al completar una actividad; se conserva el mejor puntaje.
- El hook usa un store de módulo + `useSyncExternalStore`, así el ProgressBar del sidebar
  reacciona al instante cuando se completa una actividad en el contenido principal.

---

## 🖼️ IMÁGENES Y AUDIO

- Imágenes finales con Gemini. Prompt de estilo: *"Illustration style inspired by ¡Hola English!
  educational books. Modern, minimalist, warm aesthetic. Vector-based. Colombian tricolor
  #003DA5 blue, #FFD100 yellow, #CE1126 red. Soft shadows, rounded elements, friendly.
  Colombian culture focus."*
- Mientras no existan, `SmartImage` (`ui/ImagePlaceholder.jsx`) muestra un gradiente + emoji +
  **la ruta exacta del archivo que falta**, para saber qué generar y dónde ponerlo.
- Audio: si el mp3 no existe, `AudioPlayer` muestra "Audio próximamente" sin romper la página.

---

## 🚦 FASES DE DESARROLLO

- **FASE 1 — HECHA:** setup, layout, routing, registry, useProgress.
- **FASE 2 — HECHA:** todos los componentes de actividades + animaciones.
- **FASE 3 — HECHA:** contenido de las páginas 1 y 2 del Módulo 1.
- **FASE 4 — PENDIENTE:** deploy en Cloudflare Pages y, después, Electron para el `.exe`.
- **PENDIENTE de Sharick:** imágenes (Gemini), audios (mp3) y el contenido de las
  páginas siguientes y de los módulos 2-4.

---

## ✅ REGLAS DE ORO

1. **Contenido de Sharick es sagrado** — títulos exactos ("Let's say hi to Colombia!",
   "Hello parcero!"), mecánicas exactas (dado 1-2/3-4/5-6, reloj normal, match A/B/C).
2. **Todo en JSON** — cero contenido hardcodeado en componentes.
3. **Todo animado** — Anime.js en cada interacción.
4. **Fondo cream, cero dark mode.**
5. **Mobile responsive** — los estudiantes usarán celular.
6. **Español en la UI de instrucciones, inglés en el contenido de aprendizaje.**
7. Redactar diálogos/ejercicios PROPIOS — nunca copiar texto de otros libros.
8. Commits frecuentes y descriptivos en español.
