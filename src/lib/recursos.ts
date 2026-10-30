/**
 * Liga/desliga partes do app sem apagar código.
 * MOSTRAR_PRESTADOR=false: a entrada mostra só o caminho do cliente. O login,
 * o cadastro e a área do prestador continuam funcionando pelo endereço direto
 * (/prestador/login, /prestador, /p/:codigo).
 */
export const RECURSOS = {
  MOSTRAR_PRESTADOR: false,
} as const
