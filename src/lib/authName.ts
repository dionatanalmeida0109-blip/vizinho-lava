import type { Session } from '@supabase/supabase-js'

/**
 * Login "genérico" por nome + senha.
 *
 * O Supabase Auth exige e-mail, então o nome digitado é convertido em um
 * e-mail sintético (nunca recebe mensagens):
 *
 *   "João da Silva"  ->  "joao.da.silva@vizinhollava.local"
 *
 * Regra: minúsculas, sem acentos, espaços viram ".", e só ficam [a-z0-9._-].
 * O nome original (com acentos/maiúsculas) é guardado em user_metadata.name.
 *
 * Observação: como os e-mails são fictícios, a confirmação de e-mail precisa
 * estar DESATIVADA no projeto Supabase (Authentication > Providers > Email).
 */
export const NAME_EMAIL_DOMAIN = 'vizinhollava.local'

export function normalizeName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

export function nameToEmail(name: string): string {
  return `${normalizeName(name)}@${NAME_EMAIL_DOMAIN}`
}

/** Nome exibido: user_metadata.name, ou a parte antes do @ do e-mail sintético. */
export function displayName(session: Session | null): string {
  const meta = session?.user.user_metadata as { name?: string } | undefined
  return meta?.name || session?.user.email?.split('@')[0] || 'vizinho'
}
