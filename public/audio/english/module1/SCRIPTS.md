# Guiones de grabación — Módulo 1 · Lección 1.2 "Spell it!"


> Mientras estos mp3 no existan, la app lee cada texto con la voz del navegador (ver `src/utils/speak.js`). Al copiar aquí el mp3 con el nombre exacto, el archivo grabado reemplaza la lectura automáticamente.

Guiones para que Sharick grabe los audios de la lección del abecedario y el
deletreo. Los textos que se leen van **en inglés, exactamente como aparecen
aquí**. Cada archivo se guarda en `public/audio/english/module1/` con el nombre
indicado; la app los busca en la ruta `/audio/english/module1/<archivo>.mp3`.
Si un archivo no existe, el reproductor muestra "Audio pendiente" y la página
sigue funcionando.

## Indicaciones de grabación

- **Formato:** mp3, mono, 44.1 kHz, 128 kbps o más. Sin música de fondo.
- **Nombres de archivo:** exactamente los de las tablas (minúsculas, guiones,
  sin espacios ni tildes). Un archivo por fila.
- **Voz:** clara, amable, acento neutro. Para los diálogos se necesitan **dos
  voces** (A y B), idealmente una masculina y una femenina, o dos personas
  distintas.
- **Ritmo:** lento y marcado. Al deletrear, cada letra separada por una pausa
  corta (~0.5 s). "Double L" se dice como una sola unidad: "double L".
- **Silencio:** ~0.5 s al inicio y al final de cada archivo; recortar ruidos.
- **Volumen:** parejo entre archivos (normalizar a −1 dB de pico, ~−16 LUFS).
- Los números de ítem ("One.", "Two.") se leen en voz alta.

## 1. Abecedario

Cada letra en su propio archivo: solo el nombre de la letra, con entonación de
final de frase.

| Archivo | Guion |
|---|---|
| `/audio/english/module1/letter-a.mp3` | A. |
| `/audio/english/module1/letter-b.mp3` | B. |
| `/audio/english/module1/letter-c.mp3` | C. |
| `/audio/english/module1/letter-d.mp3` | D. |
| `/audio/english/module1/letter-e.mp3` | E. |
| `/audio/english/module1/letter-f.mp3` | F. |
| `/audio/english/module1/letter-g.mp3` | G. |
| `/audio/english/module1/letter-h.mp3` | H. |
| `/audio/english/module1/letter-i.mp3` | I. |
| `/audio/english/module1/letter-j.mp3` | J. |
| `/audio/english/module1/letter-k.mp3` | K. |
| `/audio/english/module1/letter-l.mp3` | L. |
| `/audio/english/module1/letter-m.mp3` | M. |
| `/audio/english/module1/letter-n.mp3` | N. |
| `/audio/english/module1/letter-o.mp3` | O. |
| `/audio/english/module1/letter-p.mp3` | P. |
| `/audio/english/module1/letter-q.mp3` | Q. |
| `/audio/english/module1/letter-r.mp3` | R. |
| `/audio/english/module1/letter-s.mp3` | S. |
| `/audio/english/module1/letter-t.mp3` | T. |
| `/audio/english/module1/letter-u.mp3` | U. |
| `/audio/english/module1/letter-v.mp3` | V. |
| `/audio/english/module1/letter-w.mp3` | W. |
| `/audio/english/module1/letter-x.mp3` | X. |
| `/audio/english/module1/letter-y.mp3` | Y. |
| `/audio/english/module1/letter-z.mp3` | Z. |
| `/audio/english/module1/alphabet-full.mp3` | A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z. *(despacio, ~1 s entre letras)* |

## 2. Escucha de letras (Listen and write the letter)

Un archivo por ítem. Decir el número, pausa de 1 s, la letra, y dejar 2-3 s de
silencio al final para que el estudiante escriba.

| Archivo | Guion |
|---|---|
| `/audio/english/module1/spell-listen-1.mp3` | One. N. |
| `/audio/english/module1/spell-listen-2.mp3` | Two. E. |
| `/audio/english/module1/spell-listen-3.mp3` | Three. B. |
| `/audio/english/module1/spell-listen-4.mp3` | Four. J. |
| `/audio/english/module1/spell-listen-5.mp3` | Five. C. |
| `/audio/english/module1/spell-listen-6.mp3` | Six. Q. |
| `/audio/english/module1/spell-listen-7.mp3` | Seven. T. |
| `/audio/english/module1/spell-listen-8.mp3` | Eight. W. |

> **Nota (audio combinado):** si la pantalla necesita una sola pista con los 8
> ítems, se puede unir en `spell-listen-all.mp3` con 2-3 s de silencio entre
> ítems: "One. N. … Two. E. … Three. B. … Four. J. … Five. C. … Six. Q. …
> Seven. T. … Eight. W." Grabar primero los 8 archivos sueltos y luego
> concatenarlos (no volver a grabar).

## 3. Nombres deletreados (dos voces, A y B)

| Archivo | Guion |
|---|---|
| `/audio/english/module1/name-1.mp3` | One. **A:** Hi! What's your name? **B:** Ximena. **A:** How do you spell it? **B:** X – I – M – E – N – A. |
| `/audio/english/module1/name-2.mp3` | Two. **A:** What's your last name? **B:** Vallejo. **A:** How do you spell it? **B:** V – A – double L – E – J – O. |
| `/audio/english/module1/name-3.mp3` | Three. **A:** What's your first name? **B:** Luis. **A:** How do you spell it? **B:** L – U – I – S. **A:** Thank you. |

## 4. Pedir que deletreen (diálogo modelo, dos voces)

| Archivo | Guion |
|---|---|
| `/audio/english/module1/ask-spell.mp3` | **A:** Hi! What's your name? **B:** Juliana. **A:** And your last name? **B:** Morales. **A:** How do you spell that? **B:** M – O – R – A – L – E – S. *(deletrear despacio)* |

## 5. Superstars

Una sola voz. Primero el nombre con naturalidad, pausa de 1 s y luego el
deletreo despacio.

| Archivo | Guion |
|---|---|
| `/audio/english/module1/superstar-shakira.mp3` | Shakira. S – H – A – K – I – R – A. |
| `/audio/english/module1/superstar-maluma.mp3` | Maluma. M – A – L – U – M – A. |

## Estado de los audios del Módulo 1 (2026-10-12)

**Ya existen en esta carpeta (31 archivos, lecciones 1.1 y "Greeting people"):**
`1-1-a`, `1-1-b`, `1-1-c` · `greet-morning`, `greet-afternoon`,
`greet-evening`, `greet-night` · `listen-1` … `listen-5`, `listen-all` ·
`expr-bye`, `expr-goodbye`, `expr-great`, `expr-hello-im`,
`expr-hi-how-are-you`, `expr-hi-im`, `expr-hows-everything`,
`expr-hows-it-going`, `expr-im-fine`, `expr-im-ok`, `expr-nice-to-meet-you`,
`expr-not-bad`, `expr-pleasure`, `expr-see-you`, `expr-see-you-later`,
`expr-see-you-tomorrow`, `expr-so-so`, `expr-take-care` (todos `.mp3`).

**Pendientes para "Spell it!" (41 archivos, ninguno existe todavía):**
`letter-a` … `letter-z` (26) · `alphabet-full` (1) · `spell-listen-1` …
`spell-listen-8` (8) · `name-1` … `name-3` (3) · `ask-spell` (1) ·
`superstar-shakira`, `superstar-maluma` (2). Opcional: `spell-listen-all`.
