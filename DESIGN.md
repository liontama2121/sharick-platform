---
name: "¡Hola English! A1 · La Chiva"
description: "El libro es un bus pintado latinoamericano: la carrocería de colores lleva la navegación y las ventanas enmarcan el estudio."
colors:
  rojo: "#d7263d"
  rojo-ink: "#b01e31"
  amarillo: "#f5b700"
  verde: "#1b998b"
  verde-ink: "#0f6e63"
  tip: "#e3f4f1"
  azul: "#1f3354"
  chasis: "#16243b"
  madera: "#8a5a2b"
  morado: "#6d3b8e"
  ink: "#1e2530"
  ink-soft: "#4f5b6b"
  carroceria: "#f3f5f8"
  paper: "#ffffff"
  paper-edge: "#e4e8ee"
  box: "#eef2f7"
  dialogo-a: "#2a5ca8"
  dialogo-b: "#c8283c"
  dialogo-c: "#0f7a6e"
  dialogo-d: "#6d3b8e"
  dialogo-e: "#f5b700"
typography:
  display:
    fontFamily: "Alfa Slab One, Rockwell, Georgia, serif"
    fontSize: "clamp(1.9rem, 3.6vw, 2.6rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.005em"
  headline:
    fontFamily: "Alfa Slab One, Rockwell, Georgia, serif"
    fontSize: "clamp(1.4rem, 2.4vw, 1.8rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "0.005em"
  title:
    fontFamily: "Alfa Slab One, Rockwell, Georgia, serif"
    fontSize: "1.15rem"
    fontWeight: 400
    lineHeight: 1.1
  rotulo-seccion:
    fontFamily: "Alfa Slab One, Rockwell, Georgia, serif"
    fontSize: "40px"
    fontWeight: 400
    lineHeight: 1
  body:
    fontFamily: "Lexend, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-lienzo:
    fontFamily: "Lexend, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Lexend, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    letterSpacing: "0.16em"
rounded:
  filete: "3px"
  placa-sm: "10px"
  placa: "12px"
  ventana-mini: "14px"
  ventana: "16px"
  panel-dialogo: "18px"
  ventana-pagina: "22px"
  banda: "24px"
  frente: "28px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "20px"
  lg: "40px"
  xl: "56px"
components:
  button-primary:
    backgroundColor: "{colors.rojo-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-amarillo:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.azul}"
    rounded: "{rounded.full}"
    padding: "14px 28px"
  button-azul:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-verde:
    backgroundColor: "{colors.verde-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.azul}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  button-round:
    backgroundColor: "{colors.rojo-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    size: "44px"
  button-round-lg:
    backgroundColor: "{colors.rojo-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    size: "56px"
  close-button:
    backgroundColor: "{colors.rojo-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    size: "64px"
  tool-button:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.azul}"
    rounded: "{rounded.full}"
    size: "60px"
  bottom-toolbar:
    backgroundColor: "{colors.azul}"
    height: "88px"
    padding: "0 24px"
  menu-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.azul}"
    rounded: "{rounded.ventana}"
    height: "90px"
  menu-button-placa-modulo:
    backgroundColor: "{colors.rojo-ink}"
    textColor: "{colors.paper}"
    width: "74px"
  menu-button-placa-recurso:
    backgroundColor: "{colors.verde-ink}"
    textColor: "{colors.paper}"
    width: "74px"
  lesson-tag-id:
    backgroundColor: "{colors.rojo-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.placa}"
    padding: "8px 16px"
  lesson-tag-title:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.paper}"
    padding: "8px 20px"
  rotulo-placa:
    backgroundColor: "{colors.amarillo}"
    textColor: "{colors.azul}"
    rounded: "{rounded.ventana}"
    padding: "16px 36px"
  ventana:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.ventana}"
  lesson-card-tag:
    backgroundColor: "{colors.rojo-ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.placa-sm}"
    size: "64px"
  lesson-card-badge:
    backgroundColor: "{colors.azul}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    size: "48px"
  dialogue-a:
    backgroundColor: "{colors.dialogo-a}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel-dialogo}"
    typography: "{typography.body-lienzo}"
    padding: "16px 24px"
  dialogue-e:
    backgroundColor: "{colors.dialogo-e}"
    textColor: "{colors.azul}"
    rounded: "{rounded.panel-dialogo}"
    typography: "{typography.body-lienzo}"
    padding: "16px 24px"
  content-box:
    backgroundColor: "{colors.box}"
    textColor: "{colors.ink}"
    rounded: "{rounded.placa}"
  cultural-tip:
    backgroundColor: "{colors.tip}"
    textColor: "{colors.ink}"
---

# Design System: ¡Hola English! A1 · La Chiva

## Overview

**Creative North Star: "La Chiva"**

El libro es un bus pintado latinoamericano, la chiva de Colombia con el mismo oficio de rotulado de los diablos rojos de Panamá y los micros de La Paz, que recorre Colombia, Venezuela, Bolivia y Panamá. La carrocería de colores lleva la navegación (techo azul, faldón rojo, parachoques azul, placas rotuladas) y cada página o lección es una ventana con marco de madera e interior blanco limpio, donde ocurre el estudio. El estudiante reconoce la chiva, entiende que se sube a un viaje por cuatro países y ve cada lección como una ventana.

El color es pintura plana: bandas saturadas de rojo, amarillo, verde y azul noche, separadas por filetes finos de color contrario y por guardas pintadas a mano (rombos, dientes, ajedrez, franjas) que se dibujan en SVG como patrón repetido. Encima de cada plano grande va un grano finísimo (`.grain`) para que la pintura no se vea digital. La densidad es la de un libro escolar: pantallas fijas de 1600x1000 sin scroll y, fuera del lector, bloques anchos y generosos con objetivos táctiles grandes.

Rechazos confirmados por el build: la hoja crema editorial con acuarela (el mundo anterior; su paleta coral/sage/gold/navy ya no existe) y la app gamificada de caricatura. El interior de la ventana es blanco, nunca crema.

**Key Characteristics:**
- Carrocería = navegación; ventana = contenido. El color fuerte vive en el marco, el interior es blanco y tranquilo.
- Pintura plana con grano, filetes de color contrario y guardas pintadas en lugar de degradados.
- Rotulado en slab gruesa con sombra plana de color, como los nombres pintados de las chivas.
- Bordes gruesos de color (3-6px) y radios amplios en lugar de sombras duras.
- Todo movimiento con Anime.js, con la chiva como personaje en la llegada del Home.

## Colors

Pintura de bus: cuatro colores planos y saturados sobre carrocería blanca fría, con madera en los marcos y azul noche como tinta.

### Primary
- **Rojo Carrocería** (rojo): la pintura roja de las formas grandes que no llevan texto; el sol del atardecer en `DayArc`, la carrocería del `ChivaBus`, filetes.
- **Rojo Rótulo** (rojo-ink): la versión legible del rojo. Carrocería del frente en Home, Nivel 1 y portada; placa "Module N"; tag de lección; `CloseButton` y `RoundButton`; botón primario; títulos de sección ("Reading", "Listening"). Soporta texto blanco encima (6.9:1).

### Secondary
- **Amarillo Filete** (amarillo): el filete que separa bandas, el borde de placas y botones redondos, la placa del nombre del libro, los botones de la barra inferior, el filete interior de `.ventana`, la sombra por defecto de `.rotulo` y la selección de texto. Relleno solamente; sobre amarillo el texto va siempre en azul.

### Tertiary
- **Verde Chiva** (verde): la banda de ventanas del Nivel 2, la barra de progreso, franjas del bus.
- **Verde Rótulo** (verde-ink): placa de recursos en el Nivel 1, banner Study Zone, anillo de progreso, labels de estado verdes (6.1:1 sobre blanco).
- **Verde Agua Claro** (tip): fondo del Cultural Tip, de la tarjeta Games del Nivel 2 y de la pista del anillo de progreso.
- **Morado Pintura** (morado): acento de pintura, color del diálogo D y color admitido por `Filete`.

### Neutral
- **Azul Noche** (azul): tinta de rótulos y títulos (13:1 sobre blanco), techo y parachoques, barra inferior, bordes de 6px de los paneles de carrocería, badges de la tarjeta de lección.
- **Chasis** (chasis): azul más profundo del letterbox detrás del lienzo del lector (`.chasis`, con grano).
- **Madera** (madera): marcos de ventana (`.ventana`, miniaturas del Nivel 2) y tablones `.madera`.
- **Tinta** (ink): cuerpo de texto (15:1).
- **Tinta Suave** (ink-soft): texto secundario, pistas, contadores (6.9:1).
- **Carrocería Blanca** (carroceria): fondo general de la app y del costado del bus en el Nivel 2.
- **Interior de Ventana** (paper): la hoja de estudio y el relleno de las barras del menú.
- **Borde de Hoja** (paper-edge): línea fría de separación del papel.
- **Caja Celeste** (box): cajas de contenido y avisos (`.box-beige`, nota de progreso del Home).

### Colores de diálogo
Colores fijos por letra (`BUBBLE_COLORS`): A dialogo-a, B dialogo-b, C dialogo-c, D dialogo-d, E dialogo-e. Texto blanco en A-D; E lleva texto y letra en azul. La letra exterior usa el mismo color que el panel. Todos ≥ 4.5:1.

### Named Rules
**La Regla de la Tinta Legible.** `rojo`, `verde` y `amarillo` puros son rellenos, iconos y filetes, nunca texto pequeño. El texto de color usa `rojo-ink` o `verde-ink`; sobre amarillo, siempre `azul`.

**La Regla del Marco Pintado.** El color saturado pertenece a la carrocería y al marco. Dentro de la ventana manda el blanco (`paper`) con cajas en `box` o `tip`; el color fuerte entra solo en paneles de diálogo, placas y botones.

**La Regla del Tricolor Guardado.** `col-blue`, `col-yellow` y `col-red` siguen en `@theme` como dato de registro, pero ninguna superficie los usa; la portada es la chiva, no la bandera.

## Typography

**Display Font:** Alfa Slab One (con Rockwell, Georgia, serif)
**Body Font:** Lexend (con ui-sans-serif, system-ui, sans-serif)

**Character:** una slab gruesa de un solo peso, del oficio del rotulador de buses, contra una sans redonda y abierta pensada para lectores que empiezan. La slab grita el nombre; Lexend explica.

### Hierarchy
- **Display** (400, clamp(1.9rem, 3.6vw, 2.6rem), 1.1): `h1` global. En los rótulos del frente sube a clamp(1.7rem, 4.6vw, 3rem) en Home, 3.6rem en la placa "Module N" y 104px en la portada del lienzo.
- **Headline** (400, clamp(1.4rem, 2.4vw, 1.8rem), 1.1): `h2` de secciones fuera del lector ("Módulos", "Recursos", "La ruta del libro").
- **Title** (400, 1.15rem, 1.1): `h3` y nombres en las barras del menú (1.1rem).
- **Rótulo de sección** (400, 40px, 1): "Reading" / "Listening" dentro del lienzo, en `rojo-ink` con sombra amarilla y guarda de dientes debajo.
- **Body** (400, 1rem, 1.5): texto de navegación y Study Zone; semibold (600) para nombres y énfasis.
- **Body del lienzo** (400, 20px, 1.5 o 1.4 en compacto): líneas de diálogo y contenido de las pantallas 1600x1000; el hablante en 600.
- **Label** (700, 0.78rem, 0.16em, MAYÚSCULAS): contadores y estados en línea ("You rolled 4", "3 juegos", "Jugado ✓", el tiempo de un reloj), en `verde-ink`, `rojo-ink` o `ink-soft`.

### Named Rules
**La Regla del Peso Único.** Alfa Slab One tiene un solo peso (400) y `font-synthesis-weight: none` está activo en `h1-h4` y `.font-display`. Nunca `font-bold` sobre la display.

**La Regla del Rótulo.** El rotulado importante (nombre del libro, placa de módulo, tag de lección, títulos de sección, letras de diálogo) usa `.rotulo`: slab con sombra plana desplazada 0.07em. El color de la sombra sale de `--rotulo-sombra`: amarillo por defecto; blanco sobre la placa amarilla; azul sobre rojo o verde; rojo sobre azul.

**La Regla Sin Kicker.** El título habla solo. El label en mayúsculas acompaña a un valor o a un estado dentro de una fila; nunca se apila como antetítulo encima de un `h1`/`h2`.

## Layout

- **Lector:** lienzo fijo de 1600x1000 escalado al viewport con `transform: scale()`, letterbox en `.chasis`. Nunca hay scroll dentro de una pantalla; lo que no cabe se parte en otra. Dentro del lienzo las rejillas son de una sola columna (vocabulario a 2), porque los breakpoints de viewport no aplican al contenido.
- **Home:** columna centrada de máx. 1024px (`max-w-5xl`), gutter 16px en móvil y 32px desde `sm`; bloques separados por 48-56px.
- **Nivel 1:** columna de máx. 1080px; frente del bus arriba y dos columnas de barras (módulos | recursos) desde `lg`, gap 20px entre columnas y 12px entre barras.
- **Nivel 2:** costado del bus de máx. 1480px (1820px desde el breakpoint `3xl` = 1800px). Rejilla `.grid-pantallas`: 1 columna bajo 560px, 2 desde 560px, 3 desde 768px, 4 desde 1280px, 5 desde 1800px; gap 40px horizontal y 56px vertical para que tags y badges vecinos no se toquen. Va en CSS y no en utilidades responsive porque Tailwind ordena `3xl` antes que `xl`.
- **Ritmo:** múltiplos de 4px; los saltos usados son 8 / 12 / 20 / 40 / 56px.

## Elevation & Depth

Sistema híbrido: la profundidad principal la dan los bordes gruesos de color y el apilado de bandas pintadas; las sombras son difusas, frías y azuladas (rgba(20, 30, 50, …)), nunca negras ni desplazadas en duro. La única sombra plana dura es la del texto rotulado, que es pintura, no elevación.

### Shadow Vocabulary
- **Página** (`box-shadow: 0 22px 50px rgba(20, 30, 50, 0.28)`): paneles grandes de carrocería (frente del Home y del Nivel 1, costado del Nivel 2).
- **Lift** (`box-shadow: 0 10px 24px rgba(20, 30, 50, 0.22)`): ventanas, placas rotuladas, botones redondos grandes, miniaturas, hover de las barras del menú.
- **Suave** (`box-shadow: 0 2px 8px rgba(20, 30, 50, 0.1)`): botones, barras del menú en reposo, placa del número de página.
- **Tag / badge** (`0 10px 22px rgba(20,30,50,.28)` y `0 8px 18px rgba(20,30,50,.25)`): piezas que sobresalen medio afuera de la tarjeta de lección.
- **Filete de ventana** (`inset 0 0 0 2px var(--color-amarillo)`): el filete amarillo interior de `.ventana`, combinado con Lift.

### Named Rules
**La Regla del Borde Antes que la Sombra.** Un panel se separa del fondo con un borde de color de 3-6px (azul, madera o amarillo); la sombra solo lo acompaña.

**La Regla de la Pintura con Grano.** Todo plano grande de color de carrocería (`bg-azul`, `bg-rojo-ink`, `bg-verde`, `bg-verde-ink`) lleva `.grain` encima.

## Shapes

Formas de carrocería: rectángulos de esquinas amplias y círculos. Paneles del frente y del costado a 24-28px; página-ventana a 22px; `.ventana` y barras del menú a 16px; paneles de diálogo a 18px con filete interior a 13px (inset 6px); miniaturas a 14px; placas y tags a 10-12px; guardas cortas a 3px. Botones: siempre círculo o pastilla. Bordes gruesos: 6px en carrocería y marco de ventana, 5px en miniaturas, 4px en placas y botones redondos grandes, 3px en tags, badges y barras del menú.

Motivos pintados (`decor/Filete.jsx`), usados como bandas de ancho completo que rellenan su caja:
- **rombos** (rojo · amarillo · verde con puntos blancos): bajo el techo azul y sobre el parachoques.
- **dientes** (azul · amarillo · rojo): sobre el faldón rojo y bajo los títulos de sección.
- **ajedrez** (azul · amarillo): Study Zone.
- **franjas**: bandas horizontales con filetes blancos.
`Guarda` es la versión corta (96px x 10px) de rombos bajo títulos; `Leaf` es un rombo verde con rombo amarillo dentro que acompaña a los labels.

## Components

### Buttons
Pastillas y círculos de pintura, táctiles y seguros.
- **Shape:** pastilla completa (9999px).
- **Primary:** `rojo-ink` con texto blanco, Lexend 600; tamaños sm 8px 16px, md 10px 20px, lg 14px 28px. Variantes `azul`, `verde` (`verde-ink`), `amarillo` (texto azul, la acción principal de Study Zone) y `ghost` (blanco, borde azul al 15 %, hover a `rojo-ink`).
- **Hover / Focus:** Anime.js scale 1.04 en 200ms `outQuad` y brillo +5-15 %. Foco global: contorno azul de 3px con offset 2px.
- **Deshabilitado:** opacidad 45 %, cursor no permitido.

### Botones redondos
- **RoundButton:** círculo `rojo-ink` con icono lucide blanco; md 44px con sombra suave, lg 56px con borde amarillo de 4px y Lift. Cierra o vuelve a Home; se superpone a los marcos.
- **CloseButton:** círculo `rojo-ink` de 64px con borde amarillo de 4px, esquina superior derecha de la página → Nivel 2.
- Hover y foco: scale 1.1 en 200ms.

### Barra inferior (parachoques)
Banda `azul` con grano de 88px, guarda de rombos de 10px en el borde superior. Botones amarillos circulares de 60px (68px para "lección siguiente") con icono azul; deshabilitados en blanco al 15 % con icono al 45 %. Hover scale 1.1 en 180ms.

### Barras del menú (Nivel 1)
Barra blanca de 90px de alto, radio 16px, borde azul de 3px. A la izquierda una placa de 74px con grano: `rojo-ink` para módulos (número rotulado con sombra azul) y `verde-ink` para recursos (icono lucide). Nombre en Alfa Slab 1.1rem azul, pista en 0.78rem `ink-soft`. Hover: translateX 6px en 260ms y sombra Lift. Sin contenido: borde azul al 20 %, placa al 50 %, "Próximamente" en `rojo-ink` y toast al tocar.

### Ventana y página
`.ventana`: interior blanco, marco de madera de 6px, radio 16px, filete amarillo interior y Lift. `PageFrame` la usa a 22px con el número de página en una placa amarilla circular de 36px con número azul.

### Placas rotuladas
- **Nombre del libro:** placa amarilla con borde azul de 4-6px y radio 16-28px, rótulo azul con sombra blanca. En Home entra colgada (rotate [-6, 2, -0.8, 0], translateY [-34, 0], 1150ms `outQuart`, origen arriba) mientras las guardas se pintan con `clipPath` en 1000ms.
- **LessonTag:** placa partida con borde amarillo de 3px: id en `rojo-ink` (34px, sombra azul) + título corto en `azul` (30px, sombra roja).
- **Placa "Module N":** `rojo-ink` con borde amarillo de 4px, rótulo blanco hasta 3.6rem.

### Tarjeta de lección (Nivel 2)
Miniatura de doble página con marco de madera de 5px y radio 14px (activa: marco `rojo-ink` + anillo amarillo de 4px). Tag `rojo-ink` de 64px con borde amarillo, medio afuera arriba a la izquierda, número rotulado con sombra azul y "n pantallas" debajo; anillo de progreso `verde-ink` sobre pista `tip`, o ✓ en círculo `verde-ink` al 100 %. Hasta 3 badges `azul` de 48px con borde amarillo de 3px, medio afuera abajo a la derecha. Hover: scale 1.05 y el tag rota -3° en 260ms. Al volver del lector, pulso de anillo amarillo (260ms entra / 950ms sale). Todo sobre la banda verde con grano entre filetes amarillos de 4px.

### Paneles de diálogo
Panel de pintura del color de su letra, radio 18px, filete interior de 2px al 40 % del color de texto (inset 6px), punta rotada a la izquierda y letra rotulada de 38px fuera del panel. Nombres de hablante en columna propia alineada a la derecha. Reproduciendo: halo de 6px del color al 30 %; seleccionado: anillo amarillo de 4px.

### Rótulo de sección
`SectionHeading`: rótulo de 40px en `rojo-ink` con sombra amarilla y guarda de dientes de 96px x 12px debajo.

### Frente de la chiva (Home, Nivel 1, portada)
Panel `rojo-ink` con grano, borde azul de 6px y radio 24-28px, apilado de arriba abajo: techo azul, guarda de rombos, contenido con la placa amarilla, guarda de dientes (`rojo-ink` · amarillo · azul), parachoques azul. El costado del Nivel 2 repite el techo y el faldón sobre fondo `carroceria`.

### Ruta de la chiva (Home)
`RouteChiva`: carretera azul con raya amarilla discontinua y paradas numeradas en círculos del color del país con borde blanco de 4px (48px en Home, 56px en la portada; número azul sobre amarillo), colgadas de un poste azul. La carretera se traza (scaleX, 1100ms `outExpo`), el `ChivaBus` recorre las paradas (720ms `inOutSine` por tramo, ruedas girando) y cada letrero gira rotateY [90, 0] con `outBack(1.4)`. Hover sobre un país: la chiva maneja hasta él. Móvil: solo letreros en cascada. Movimiento reducido: bus estacionado, todo visible.

### DayArc
El día como cuatro paneles planos (amarillo claro #FCE7A6, celeste #CFE3F5, naranja #F4A259, azul noche) separados por filetes blancos, con soles amarillos y rojo y luna; los arcos se dibujan y los textos entran con stagger. Colores propios del componente, no tokens.

## Do's and Don'ts

### Do:
- **Do** pintar la navegación como carrocería: techo `azul`, guarda de rombos, cuerpo `rojo-ink`, guarda de dientes, parachoques `azul`, todo con `.grain`.
- **Do** enmarcar el contenido en ventanas: interior `paper`, marco `madera` de 5-6px, filete amarillo interior.
- **Do** usar `.rotulo` con `--rotulo-sombra` de color contrario para nombres, placas, tags y títulos de sección.
- **Do** separar bandas de color con un filete o una guarda de `Filete.jsx`, nunca con un degradado.
- **Do** escribir texto de color en `rojo-ink`, `verde-ink` o `azul`; sobre amarillo, siempre `azul`.
- **Do** animar cada interacción con Anime.js (`ease`, no `easing`) y respetar `prefers-reduced-motion`.
- **Do** usar iconos lucide de línea en botones, placas y badges.

### Don't:
- **Don't** volver al papel crema, la acuarela ni los tokens coral / sage / gold / navy: ese mundo fue reemplazado.
- **Don't** usar `rojo`, `verde` o `amarillo` puros como color de texto pequeño.
- **Don't** aplicar negrita a Alfa Slab One ni volver a cargar Playfair Display, Nunito Sans, Fredoka o Sora.
- **Don't** poner un label en mayúsculas encima de un título como antetítulo.
- **Don't** usar el tricolor de Colombia en superficies; la identidad es la chiva, no la bandera.
- **Don't** separar paneles solo con sombras negras o desplazadas en duro; el borde de color va primero.
- **Don't** meter scroll dentro del lienzo 1600x1000: si no cabe, otra pantalla.
