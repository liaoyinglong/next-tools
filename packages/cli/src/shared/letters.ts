/**
 *
 * -  input : A
 *    output : 0
 * -  input : Z
 *    output : 25
 * -  input : AA
 *    output : 26
 * -  input : a
 *    output : 0
 */
export function letterToNumber(letters: string | number) {
  if (typeof letters === "number" || !Number.isNaN(+letters)) {
    return +letters;
  }

  let n = 0;
  letters = letters.toUpperCase();
  for (let p = 0; p < letters.length; p++) {
    n = letters[p].charCodeAt(0) - 64 + n * 26;
  }

  return Math.max(0, n - 1);
}

/**
 * fork from https://github.com/matthewmueller/number-to-letter
 */
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const base = alphabet.length;
/**
 * numberToLetter(0)    // A
 * numberToLetter(25)   // Z
 * numberToLetter(26)   // AA
 * numberToLetter(51)   // AZ
 * numberToLetter(52)   // BA
 * numberToLetter(676)  // ZA
 * numberToLetter(701)  // ZZ
 * numberToLetter(702)  // AAA
 */
export function numberToLetter(n: number) {
  const digits: number[] = [];

  do {
    const v = n % base;
    digits.push(v);
    n = Math.floor(n / base);
  } while (n-- > 0);

  const chars: string[] = [];
  while (digits.length) {
    chars.push(alphabet[digits.pop()!]);
  }

  return chars.join("");
}
