/** Hash de senha no navegador: PBKDF2-SHA256 (WebCrypto) com salt aleatório. Nunca guardamos a senha em texto. */
const ITER = 150_000

function toHex(buf: ArrayBuffer | Uint8Array): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
function fromHex(hex: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  return out
}

export type PasswordHash = { salt: string; hash: string }

async function derive(password: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITER }, key, 256)
  return toHex(bits)
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { salt: toHex(salt), hash: await derive(password, salt) }
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const h = await derive(password, fromHex(stored.salt))
  // comparação em tempo constante
  let diff = h.length ^ stored.hash.length
  for (let i = 0; i < h.length; i++) diff |= h.charCodeAt(i) ^ stored.hash.charCodeAt(i)
  return diff === 0
}
