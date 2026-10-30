import type { Role } from './localAuth'

/** Todas as rotas do app num lugar só. Use estas constantes nos links. */
export const ROTAS = {
  inicio: '/',
  entrar: '/entrar',
  cadastro: '/entrar?modo=criar',
  loginCliente: '/login',
  loginPrestador: '/prestador/login',
  orcamento: '/home',
  comoFunciona: '/como-funciona',
  areaPrestador: '/prestador',
  linkPrestador: (codigo: string) => `/p/${codigo}`,
  devResets: '/dev/resets',
} as const

/** Área pós-login de cada tipo de conta. */
export const AREA: Record<Role, string> = { cliente: ROTAS.orcamento, prestador: ROTAS.areaPrestador }
export const LOGIN: Record<Role, string> = { cliente: ROTAS.loginCliente, prestador: ROTAS.loginPrestador }
export const NOME_PAPEL: Record<Role, string> = { cliente: 'Cliente', prestador: 'Prestador' }

/** Chave do bloqueio por força bruta: clientes mantêm a chave antiga (só o telefone). */
export const chaveBloqueio = (role: Role, phone: string) => (role === 'cliente' ? phone : `prestador:${phone}`)

export const MENSAGEM_COMPARTILHAMENTO =
  'O VizinhoLava é um aplicativo de compartilhamento de serviço: o vizinho sai da casa dele para lavar a sua louça e quer receber pelo serviço. O pagamento é combinado antes, não depois.'
