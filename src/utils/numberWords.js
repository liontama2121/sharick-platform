const ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
]
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety']

/**
 * Número de página escrito en letras, como en los libros impresos.
 * 36 -> "THIRTY-SIX"
 */
export function numberToWords(n) {
  if (n == null || Number.isNaN(n)) return ''
  const num = Math.abs(Math.trunc(n))

  let words
  if (num < 20) words = ONES[num]
  else if (num < 100) {
    const t = TENS[Math.floor(num / 10)]
    const o = num % 10
    words = o ? `${t}-${ONES[o]}` : t
  } else {
    const h = `${ONES[Math.floor(num / 100)]} hundred`
    const rest = num % 100
    words = rest ? `${h} ${numberToWords(rest).toLowerCase()}` : h
  }

  return words.toUpperCase()
}

export default numberToWords
