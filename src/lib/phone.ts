/**
 * Telefone celular brasileiro como identificador fixo do usuário.
 * Formato canônico (id): "+55DD9XXXXXXXX" (E.164, 13 dígitos após o +).
 * Aceita entradas como "(41) 99876-5432", "41998765432" ou "+55 41 99876-5432".
 */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, '')
  if (d.length === 13 && d.startsWith('55')) d = d.slice(2)
  if (d.length !== 11) return null
  const ddd = d.slice(0, 2)
  if (!/^[1-9][1-9]$/.test(ddd)) return null // DDD válido: 11–99, sem zero
  if (d[2] !== '9') return null // celular: começa com 9
  return `+55${d}`
}

/** "+5541998765432" -> "+55 (41) 99876-5432" */
export function formatPhone(id: string): string {
  const d = id.replace(/\D/g, '').slice(2)
  return `+55 (${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}
