import type { Role } from './localAuth'

/** Área pós-login de cada tipo de conta. */
export const AREA: Record<Role, string> = { cliente: '/home', prestador: '/prestador' }
export const LOGIN: Record<Role, string> = { cliente: '/login', prestador: '/prestador/login' }

/** Chave do bloqueio por força bruta: clientes mantêm a chave antiga (só o telefone). */
export const chaveBloqueio = (role: Role, phone: string) => (role === 'cliente' ? phone : `prestador:${phone}`)

export const MENSAGEM_COMPARTILHAMENTO =
  'O VizinhoLava é um aplicativo de compartilhamento de serviço: o vizinho sai da casa dele para lavar a sua louça e quer receber pelo serviço. O pagamento é combinado antes, não depois.'
