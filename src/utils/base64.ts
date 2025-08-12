/**
 * Custom Base64 encoder/decoder with customizable alphabet
 */
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-'

const decodeMap = new Map()
for (let i = 0; i < alphabet.length; i++) {
  decodeMap.set(alphabet[i], i)
}
/**
 * Convert number to base64 string
 */
function numberToBase64(num: number): string {
  if (num === 0) return alphabet[0]

  let result = ''
  let n = Math.abs(num)

  while (n > 0) {
    result = alphabet[n % 64] + result
    n = Math.floor(n / 64)
  }

  return num < 0 ? '-' + result : result
}

/**
 * Convert base64 string to number
 */
function base64ToNumber(str: string): number {
  if (!str) return 0

  let isNegative = false
  let input = str

  if (str.startsWith('-')) {
    isNegative = true
    input = str.slice(1)
  }

  let result = 0
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    const value = decodeMap.get(char)
    if (value === undefined) {
      throw new Error(`Invalid character '${char}' in base64 string`)
    }
    result = result * 64 + value
  }

  return isNegative ? -result : result
}

export { numberToBase64, base64ToNumber }
