# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Estudiantes de edades mixtas (adolescentes, adultos y algunos niños) que empiezan inglés A1 con la profesora Sharick Prieto. Estudian sobre todo en casa, cada uno en su portátil o tablet, repasando las lecciones y haciendo las actividades a su ritmo. Sharick es la autora del contenido y también usa el modo profe de la Study Zone.

## Product Purpose

Libro digital interactivo de idiomas: el libro es la clase (lectura, audio, diálogos, actividades, juegos) y la Study Zone es la práctica por temas con quizzes que desbloquean el siguiente tema. Éxito: el estudiante avanza lección a lección sin profesor al lado y vuelve a practicar.

## Positioning

Un libro de inglés A1 con escenario latinoamericano propio: Colombia como país base (Cartagena, Bogotá, Medellín) más Venezuela (Caracas), Bolivia (La Paz) y Panamá (Ciudad de Panamá). Contenido en inglés; identidad visual latinoamericana. Estructura de libro de editorial (Express Publishing "Upload") con contenido escrito por Sharick.

## Operating Context

Navegación de 3 niveles: menú del libro → rejilla de lecciones del módulo → lector de pantallas fijas 1600x1000 escaladas al viewport, sin scroll. Se distribuye en web (Cloudflare Pages), iframe en la web de Sharick y, al final, app de escritorio (Electron). Progreso guardado en el navegador (localStorage); login demo de la Study Zone.

## Capabilities and Constraints

- Stack fijo: React 18, Vite, Tailwind v4 (CSS-first con `@theme`), Anime.js v4, React Router v7 con HashRouter, lucide-react.
- Estructura de 3 niveles y lienzo 1600x1000 sin scroll: intocables.
- Contenido y mecánicas de Sharick (textos, diálogos, actividades, respuestas): intocables salvo cambio explícito del cliente.
- Todo el contenido en JSON; nada hardcodeado en componentes.
- El contenido del libro va 100 % en inglés; la navegación general en español.
- Nada de México, Argentina, Perú, Chile, Ecuador ni Brasil en el escenario.
- Imágenes (Gemini) y audios mp3 en parte pendientes; los componentes muestran placeholders sin romperse.

## Brand Commitments

- Nombre del libro: "¡Hola English! A1". Autora: Prof. Sharick Prieto.
- Libro 1 sobre cuatro países: Colombia, Venezuela, Bolivia, Panamá.
- Paleta, tipografía, colores de diálogo y tricolor en portada NO son compromisos: el usuario pidió un cambio visual total (2026-09-29).

## Evidence on Hand

- Contenido del Módulo 1 (2 lecciones, 14 pantallas) en `src/books/english-a1/modules.json`.
- Study Zone Módulo 1 (6 temas) en `src/study/english-a1/module1.json`.
- Audios generados en `public/audio/`; ilustraciones parciales en `public/images/english/`.
- Sin testimonios, cifras de estudiantes ni instituciones: no inventarlos.

## Product Principles

1. El libro es la clase: cada pantalla se entiende sola, sin profesor al lado.
2. Una pantalla = lo que cabe sin scroll; si no cabe, se parte.
3. Latinoamérica es el escenario y la identidad, el inglés es la lengua.
4. Cada interacción responde (animación, feedback de acierto y error).
5. Funciona igual en web, iframe y escritorio con el mismo build.

## Accessibility & Inclusion

Edades mixtas y estudio individual en portátil o tablet: texto legible a distancia de pantalla (contraste AA mínimo), objetivos táctiles amplios en tablet y respeto de `prefers-reduced-motion`.
