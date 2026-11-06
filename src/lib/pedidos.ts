import type { Produto, VolumeOrcamento } from './precos'

/** Pedidos e histórico ficam só neste aparelho (demo local, sem servidor). */
export type StatusPedido = 'solicitado' | 'confirmado' | 'concluido' | 'cancelado'

export type Pedido = {
  id: string
  criadoEm: string
  telefone: string
  nomeCliente?: string
  /** Valor BASE sugerido pela IA (centavos), R$ 20–30. */
  baseCentavos: number
  /** Total cobrado / estimado = base + produtos (centavos). */
  total: number
  volume?: VolumeOrcamento
  produtos?: Produto[]
  texto: string
  status: StatusPedido
  /** Valor final confirmado pelo lavador (centavos). */
  finalCentavos?: number
  confirmadoEm?: string
  notasLavador?: string
}

const CHAVE = 'vizinholava:pedidos'

export function listarPedidos(): Pedido[] {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as Pedido[]
    return bruto.map(normalizar)
  } catch {
    return []
  }
}

function normalizar(p: Pedido): Pedido {
  const base = p.baseCentavos ?? p.total ?? 2500
  return {
    ...p,
    baseCentavos: base,
    total: p.total ?? base,
    status: p.status ?? 'solicitado',
    produtos: p.produtos ?? [],
  }
}

export function registrarPedido(
  p: Omit<Pedido, 'id' | 'criadoEm' | 'status'> & { status?: StatusPedido },
): Pedido {
  const pedido: Pedido = {
    ...p,
    id: Math.random().toString(36).slice(2, 8).toUpperCase(),
    criadoEm: new Date().toISOString(),
    status: p.status ?? 'solicitado',
    produtos: p.produtos ?? [],
  }
  localStorage.setItem(CHAVE, JSON.stringify([pedido, ...listarPedidos()].slice(0, 40)))
  return pedido
}

export function atualizarPedido(id: string, patch: Partial<Pedido>): Pedido | null {
  const lista = listarPedidos()
  const i = lista.findIndex((x) => x.id === id)
  if (i < 0) return null
  const atualizado = { ...lista[i], ...patch }
  lista[i] = atualizado
  localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, 40)))
  return atualizado
}

export function pedidoPorId(id: string): Pedido | null {
  return listarPedidos().find((p) => p.id.toUpperCase() === id.trim().toUpperCase()) ?? null
}
