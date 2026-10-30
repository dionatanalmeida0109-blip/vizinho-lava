/**
 * Link de pedidos do prestador, sem servidor: os dados públicos (nome, região,
 * WhatsApp) vão codificados na própria URL /p/<código>. O cliente que abre o
 * link fica com esse prestador escolhido (localStorage) e, no orçamento, pode
 * encaminhar o pedido direto para o WhatsApp dele.
 */
export type PrestadorPublico = { nome: string; regiao: string; whatsapp: string }

const K_ESCOLHIDO = 'prestador_escolhido'

function b64url(s: string) {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function deB64url(s: string) {
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function codificar(p: PrestadorPublico): string {
  return b64url(JSON.stringify({ n: p.nome, r: p.regiao, w: p.whatsapp }))
}

export function decodificar(codigo: string): PrestadorPublico | null {
  try {
    const o = JSON.parse(deB64url(codigo)) as { n?: unknown; r?: unknown; w?: unknown }
    if (typeof o.n !== 'string' || typeof o.r !== 'string' || typeof o.w !== 'string') return null
    if (!/^\+55[1-9]{2}9\d{8}$/.test(o.w)) return null
    return { nome: o.n.slice(0, 80), regiao: o.r.slice(0, 120), whatsapp: o.w }
  } catch {
    return null
  }
}

export function escolherPrestador(p: PrestadorPublico) {
  localStorage.setItem(K_ESCOLHIDO, JSON.stringify(p))
}
export function prestadorEscolhido(): PrestadorPublico | null {
  try {
    const raw = localStorage.getItem(K_ESCOLHIDO)
    return raw ? decodificar(codificar(JSON.parse(raw))) : null
  } catch {
    return null
  }
}
export function esquecerPrestador() {
  localStorage.removeItem(K_ESCOLHIDO)
}

/** wa.me usa o número só com dígitos (55DD9XXXXXXXX). */
export const linkWhatsApp = (numero: string, texto: string) =>
  `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`
