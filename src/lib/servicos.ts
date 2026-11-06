/**
 * Histórico unificado de serviços fechados (demo local).
 * Cliente e lavador leem do mesmo aparelho nesta demo.
 */
import type { Produto } from './precos'

export type Servico = {
  id: string
  criadoEm: string
  pedidoId?: string
  clienteTelefone?: string
  clienteNome?: string
  lavadorNome?: string
  baseSugerida: number
  baseConfirmada: number
  produtos: Produto[]
  total: number
  notas?: string
  texto: string
}

const CHAVE = 'vizinholava:servicos'

export function listarServicos(): Servico[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as Servico[]
  } catch {
    return []
  }
}

export function salvarServico(s: Omit<Servico, 'id' | 'criadoEm'>): Servico {
  const novo: Servico = {
    ...s,
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    criadoEm: new Date().toISOString(),
  }
  localStorage.setItem(CHAVE, JSON.stringify([novo, ...listarServicos()].slice(0, 50)))
  return novo
}
