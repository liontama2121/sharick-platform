/* ═══════════════════════════════════════════════════════════════════════
   Lectura en voz alta de respaldo (Web Speech API).

   Mientras no exista el mp3 de un ítem, el libro lee su `audioText` con la
   mejor voz en inglés del navegador: en Edge, las voces neuronales
   "Microsoft … Online (Natural)"; en Chrome, "Google US English". Cuando
   Sharick grabe el mp3, el archivo tiene prioridad y esto ya no se usa.

   - Diálogos "A: … B: …": cada hablante con su propia voz.
   - Deletreos "X–I–M–E–N–A" / "M – O – R": letra por letra, más despacio.
   ═══════════════════════════════════════════════════════════════════════ */

const synth = () => (typeof window !== 'undefined' ? window.speechSynthesis : null)

export const canSpeak = () => !!synth() && typeof window.SpeechSynthesisUtterance !== 'undefined'

/* Las voces cargan de forma asíncrona en Chrome */
let cache = []
function voices() {
  const s = synth()
  if (!s) return []
  const list = s.getVoices()
  if (list.length) cache = list
  return cache
}
if (canSpeak()) synth().addEventListener?.('voiceschanged', voices)

/** Voces en inglés, de la más natural a la menos. */
function englishVoices() {
  const score = (v) =>
    (/^en-US/i.test(v.lang) ? 4 : /^en/i.test(v.lang) ? 2 : 0) +
    (/natural|neural|online/i.test(v.name) ? 6 : 0) +
    (/google/i.test(v.name) ? 3 : 0)
  return voices()
    .filter((v) => /^en/i.test(v.lang))
    .sort((a, b) => score(b) - score(a))
}

/* "X–I–M–E–N–A" o "M – O – R – A" → "X. I. M. E. N. A." */
function spellOut(text) {
  return text.replace(/\b([A-Za-z]|double [A-Z])(\s*[–-]\s*(?=[A-Za-z]))/g, '$1. ')
}

/** Corta un texto en turnos de habla: [{ speaker, text }]. */
function turns(text) {
  const parts = text.split(/\b([AB]):\s*/)
  if (parts.length < 3) return [{ speaker: 'A', text }]
  const out = []
  if (parts[0].trim()) out.push({ speaker: 'N', text: parts[0].trim() })
  for (let i = 1; i < parts.length; i += 2) out.push({ speaker: parts[i], text: parts[i + 1].trim() })
  return out
}

export function stopSpeaking() {
  synth()?.cancel()
}

/**
 * Lee `text` en voz alta. Devuelve false si el navegador no puede.
 * opts: { rate, onEnd }
 */
export function speak(text, { rate = 0.88, onEnd } = {}) {
  if (!canSpeak() || !text) return false
  const s = synth()
  s.cancel()
  const list = englishVoices()
  /* Narrador y hablante A con una voz, B con otra distinta */
  const voiceFor = { N: list[0], A: list[0], B: list.find((v) => v !== list[0]) ?? list[0] }

  const chunks = turns(text)
  chunks.forEach((c, i) => {
    const spelled = /[A-Za-z]\s*[–-]\s*[A-Za-z]/.test(c.text)
    const u = new SpeechSynthesisUtterance(spellOut(c.text))
    u.lang = 'en-US'
    if (voiceFor[c.speaker]) u.voice = voiceFor[c.speaker]
    u.rate = spelled ? Math.min(rate, 0.7) : rate
    if (i === chunks.length - 1 && onEnd) {
      u.onend = onEnd
      u.onerror = onEnd
    }
    s.speak(u)
  })
  return true
}

/* ── ¿Existe el mp3? ───────────────────────────────────────────────────
   El servidor de desarrollo (y algunos hostings) responde a un archivo que
   no existe con el index.html y estado 200: el <audio> nunca da error. Se
   pregunta una vez por archivo (HEAD) y se mira que sea audio de verdad. */
const exists = new Map()
export function audioExists(src) {
  if (!src) return Promise.resolve(false)
  if (!exists.has(src)) {
    exists.set(
      src,
      fetch(src, { method: 'HEAD' })
        .then((r) => r.ok && /^audio\//i.test(r.headers.get('content-type') ?? ''))
        .catch(() => false),
    )
  }
  return exists.get(src)
}
