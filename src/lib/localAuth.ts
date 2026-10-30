/**
 * Autenticação 100% local (sem Supabase ou qualquer serviço externo).
 *
 * Tudo fica no localStorage DESTE navegador:
 *  - "users":          { [telefone]: { name, phone, password: {salt, hash}, createdAt } }
 *  - "session":        { phone } do usuário logado
 *  - "pending_resets": pedidos de troca de senha aguardando o desenvolvedor
 *  - "dev_password":   hash da senha do desenvolvedor (definida no 1º acesso a /dev/resets)
 *
 * O telefone (+55DD9XXXXXXXX) é o id fixo do usuário. A troca de senha só
 * acontece quando o desenvolvedor aprova o pedido em /dev/resets.
 *
 * Limitação: sem servidor, cada navegador/aparelho tem seus próprios usuários.
 */
import { hashPassword, verifyPassword, type PasswordHash } from './password'

export type User = { name: string; phone: string; password: PasswordHash; createdAt: number }
export type Session = { phone: string; name: string }
export type ResetStatus = 'pending' | 'approved' | 'denied'
export type ResetRequest = {
  id: string
  phone: string
  name: string
  newPassword: PasswordHash
  requestedAt: number
  status: ResetStatus
  decidedAt?: number
}

const K_USERS = 'users'
const K_SESSION = 'session'
const K_RESETS = 'pending_resets'
const K_DEV = 'dev_password'
export const AUTH_EVENT = 'vizinholava:auth'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

const users = () => load<Record<string, User>>(K_USERS, {})

export function getSession(): Session | null {
  const s = load<{ phone: string } | null>(K_SESSION, null)
  const u = s ? users()[s.phone] : undefined
  return u ? { phone: u.phone, name: u.name } : null
}
function setSession(phone: string | null) {
  if (phone) save(K_SESSION, { phone })
  else localStorage.removeItem(K_SESSION)
  window.dispatchEvent(new Event(AUTH_EVENT))
}
export const signOut = () => setSession(null)

export type AuthResult = { ok: true } | { ok: false; reason: 'exists' | 'invalid' | 'pending' }

export async function signUp(name: string, phone: string, password: string): Promise<AuthResult> {
  const all = users()
  if (all[phone]) return { ok: false, reason: 'exists' }
  all[phone] = { name: name.trim(), phone, password: await hashPassword(password), createdAt: Date.now() }
  save(K_USERS, all)
  setSession(phone)
  return { ok: true }
}

export async function signIn(phone: string, password: string): Promise<AuthResult> {
  const u = users()[phone]
  if (!u || !(await verifyPassword(password, u.password))) return { ok: false, reason: 'invalid' }
  setSession(phone)
  return { ok: true }
}

// ---------- Troca de senha com autorização do desenvolvedor ----------

const resets = () => load<ResetRequest[]>(K_RESETS, [])

/** Cria um pedido pendente. A senha atual continua valendo até a aprovação. */
export async function requestReset(phone: string, newPassword: string): Promise<AuthResult> {
  const u = users()[phone]
  if (!u) return { ok: false, reason: 'invalid' }
  const list = resets()
  if (list.some((r) => r.phone === phone && r.status === 'pending')) return { ok: false, reason: 'pending' }
  list.push({
    id: crypto.randomUUID(),
    phone,
    name: u.name,
    newPassword: await hashPassword(newPassword),
    requestedAt: Date.now(),
    status: 'pending',
  })
  save(K_RESETS, list)
  return { ok: true }
}

export const listResets = () => resets().sort((a, b) => b.requestedAt - a.requestedAt)

export function decideReset(id: string, approve: boolean) {
  const list = resets()
  const r = list.find((x) => x.id === id && x.status === 'pending')
  if (!r) return
  if (approve) {
    const all = users()
    if (all[r.phone]) {
      all[r.phone].password = r.newPassword
      save(K_USERS, all)
    }
  }
  r.status = approve ? 'approved' : 'denied'
  r.decidedAt = Date.now()
  save(K_RESETS, list)
}

// ---------- Senha do desenvolvedor (tela oculta /dev/resets) ----------

export const devPasswordIsSet = () => load<PasswordHash | null>(K_DEV, null) !== null

export async function setDevPassword(password: string) {
  save(K_DEV, await hashPassword(password))
}

export async function checkDevPassword(password: string): Promise<boolean> {
  const h = load<PasswordHash | null>(K_DEV, null)
  return h ? verifyPassword(password, h) : false
}
