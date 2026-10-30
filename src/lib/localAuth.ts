/**
 * Autenticação 100% local (sem Supabase ou qualquer serviço externo).
 *
 * Tudo fica no localStorage DESTE navegador:
 *  - "users":          CLIENTES { [telefone]: { name, phone, password: {salt, hash}, createdAt } }
 *  - "prestadores":    PRESTADORES { [telefone]: { ...mesmo formato, regiao, whatsapp } }
 *  - "session":        { phone, role } de quem está logado (role ausente = cliente)
 *  - "pending_resets": pedidos de troca de senha aguardando o desenvolvedor
 *  - "dev_password":   hash da senha do desenvolvedor (definida no 1º acesso a /dev/resets)
 *
 * Dois tipos de conta, estilo Uber/99: cliente (pede a lavagem) e prestador
 * (vai lavar). São cadastros separados: o mesmo telefone pode ter os dois.
 * O telefone (+55DD9XXXXXXXX) é o id fixo do usuário em cada tipo. A troca de senha só
 * acontece quando o desenvolvedor aprova o pedido em /dev/resets.
 *
 * Limitação: sem servidor, cada navegador/aparelho tem seus próprios usuários.
 */
import { hashPassword, verifyPassword, type PasswordHash } from './password'

export type Role = 'cliente' | 'prestador'
export type PerfilPrestador = { regiao: string; whatsapp: string }
export type User = { name: string; phone: string; password: PasswordHash; createdAt: number } & Partial<PerfilPrestador>
export type Session = { phone: string; name: string; role: Role; perfil?: PerfilPrestador }
export type ResetStatus = 'pending' | 'approved' | 'denied'
export type ResetRequest = {
  id: string
  phone: string
  role?: Role // ausente = cliente (pedidos antigos)
  name: string
  newPassword: PasswordHash
  requestedAt: number
  status: ResetStatus
  decidedAt?: number
}

const K_USERS: Record<Role, string> = { cliente: 'users', prestador: 'prestadores' }
const K_SESSION = 'session'
const K_RESETS = 'pending_resets'
const K_DEV = 'dev_password'
export const AUTH_EVENT = 'vizinholava:auth'

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const v: unknown = JSON.parse(raw)
    // Dado corrompido/antigo no navegador não pode derrubar a tela de entrada.
    if (fallback !== null && (typeof v !== 'object' || v === null || Array.isArray(v) !== Array.isArray(fallback))) return fallback
    if (fallback === null && (typeof v !== 'object' || v === null)) return fallback
    return v as T
  } catch {
    return fallback
  }
}
function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

const users = (role: Role) => load<Record<string, User>>(K_USERS[role], {})

export function getSession(): Session | null {
  const s = load<{ phone: string; role?: Role } | null>(K_SESSION, null)
  if (!s || typeof s.phone !== 'string') return null
  const role: Role = s.role === 'prestador' ? 'prestador' : 'cliente'
  const u = users(role)[s.phone]
  if (!u || typeof u.name !== 'string') return null
  const perfil = role === 'prestador' ? { regiao: u.regiao ?? '', whatsapp: u.whatsapp ?? u.phone } : undefined
  return { phone: u.phone, name: u.name, role, perfil }
}
function setSession(phone: string | null, role: Role = 'cliente') {
  if (phone) save(K_SESSION, { phone, role })
  else localStorage.removeItem(K_SESSION)
  window.dispatchEvent(new Event(AUTH_EVENT))
}
export const signOut = () => setSession(null)

export type AuthResult = { ok: true } | { ok: false; reason: 'exists' | 'invalid' | 'pending' }

export async function signUp(
  role: Role, name: string, phone: string, password: string, perfil?: PerfilPrestador,
): Promise<AuthResult> {
  const all = users(role)
  if (all[phone]) return { ok: false, reason: 'exists' }
  all[phone] = {
    name: name.trim(), phone, password: await hashPassword(password), createdAt: Date.now(),
    ...(role === 'prestador' && perfil ? { regiao: perfil.regiao.trim(), whatsapp: perfil.whatsapp } : {}),
  }
  save(K_USERS[role], all)
  setSession(phone, role)
  return { ok: true }
}

export async function signIn(role: Role, phone: string, password: string): Promise<AuthResult> {
  const u = users(role)[phone]
  if (!u || !(await verifyPassword(password, u.password))) return { ok: false, reason: 'invalid' }
  setSession(phone, role)
  return { ok: true }
}

/** Prestador atualiza região e WhatsApp do próprio perfil. */
export function updatePerfilPrestador(phone: string, perfil: PerfilPrestador) {
  const all = users('prestador')
  if (!all[phone]) return
  all[phone].regiao = perfil.regiao.trim()
  all[phone].whatsapp = perfil.whatsapp
  save(K_USERS.prestador, all)
  window.dispatchEvent(new Event(AUTH_EVENT))
}

// ---------- Troca de senha com autorização do desenvolvedor ----------

const resets = () => load<ResetRequest[]>(K_RESETS, [])

/** Cria um pedido pendente. A senha atual continua valendo até a aprovação. */
export async function requestReset(role: Role, phone: string, newPassword: string): Promise<AuthResult> {
  const u = users(role)[phone]
  if (!u) return { ok: false, reason: 'invalid' }
  const list = resets()
  if (list.some((r) => r.phone === phone && (r.role ?? 'cliente') === role && r.status === 'pending'))
    return { ok: false, reason: 'pending' }
  list.push({
    id: crypto.randomUUID(),
    phone,
    role,
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
    const role = r.role ?? 'cliente'
    const all = users(role)
    if (all[r.phone]) {
      all[r.phone].password = r.newPassword
      save(K_USERS[role], all)
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
