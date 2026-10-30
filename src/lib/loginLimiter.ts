/**
 * Proteção simples contra força bruta, 100% local (localStorage).
 *
 * Após MAX_FAILS tentativas de "Entrar" com erro para o mesmo telefone
 * (id +55...), novas tentativas ficam bloqueadas por LOCK_MS.
 * Sucesso no login zera o contador.
 *
 * Limitação: é só no navegador (limpar o storage burla o bloqueio). Para
 * proteção real seria preciso um servidor.
 */
export const MAX_FAILS = 5
export const LOCK_MS = 5 * 60 * 1000

const PREFIX = 'vizinholava:login:'

type Entry = { fails: number; lockedUntil: number }

function read(key: string): Entry {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw) return JSON.parse(raw) as Entry
  } catch {
    /* storage indisponível ou corrompido */
  }
  return { fails: 0, lockedUntil: 0 }
}

function write(key: string, e: Entry) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(e))
  } catch {
    /* ignora */
  }
}

/** Milissegundos restantes de bloqueio (0 = liberado). */
export function lockRemaining(key: string, now = Date.now()): number {
  const e = read(key)
  if (e.lockedUntil > now) return e.lockedUntil - now
  if (e.lockedUntil) write(key, { fails: 0, lockedUntil: 0 }) // bloqueio expirou
  return 0
}

/** Registra uma falha; retorna o tempo de bloqueio (0 se ainda não bloqueou) e tentativas restantes. */
export function registerFailure(key: string, now = Date.now()): { lockMs: number; left: number } {
  const e = read(key)
  const fails = e.fails + 1
  if (fails >= MAX_FAILS) {
    write(key, { fails: 0, lockedUntil: now + LOCK_MS })
    return { lockMs: LOCK_MS, left: 0 }
  }
  write(key, { fails, lockedUntil: 0 })
  return { lockMs: 0, left: MAX_FAILS - fails }
}

export function clearFailures(key: string) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignora */
  }
}

export function lockMessage(ms: number): string {
  const min = Math.ceil(ms / 60000)
  return `Muitas tentativas sem sucesso. Por segurança, o login para este telefone está bloqueado. Tente novamente em ${min} minuto${min > 1 ? 's' : ''}.`
}
