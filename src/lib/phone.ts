/**
 * Celular brasileiro como identificador fixo do usuário.
 * Na tela a pessoa digita só o número local: DDD + celular, sem +55
 * (o app de teste roda só no Brasil, em Curitiba). Ex.: "(41) 99876-5432" ou "41998765432".
 * Por dentro o id continua "+55DD9XXXXXXXX" (E.164), para manter as contas já
 * criadas e o link do WhatsApp (wa.me) funcionando.
 */
export function normalizePhone(input: string): string | null {
  const d = input.replace(/\D/g, '')
  if (d.length !== 11) return null // DDD (2) + celular (9)
  if (!/^[1-9][1-9]$/.test(d.slice(0, 2))) return null // DDD válido: 11–99, sem zero
  if (d[2] !== '9') return null // celular: começa com 9
  return `+55${d}`
}

/** Máscara enquanto digita: "41998765432" -> "(41) 99876-5432" (no máximo 11 dígitos). */
export function mascaraCelular(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

/** "+5541998765432" -> "(41) 99876-5432" (sem o +55 na tela). */
export function formatPhone(id: string): string {
  return mascaraCelular(id.replace(/\D/g, '').slice(2))
}
