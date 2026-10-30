/** Pedidos solicitados ficam guardados só neste aparelho (sem servidor). */
export type Pedido = { id: string; criadoEm: string; telefone: string; total: number; texto: string }
const CHAVE = 'vizinholava:pedidos'

export function listarPedidos(): Pedido[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as Pedido[]
  } catch {
    return []
  }
}

export function registrarPedido(p: Omit<Pedido, 'id' | 'criadoEm'>): Pedido {
  const pedido: Pedido = { ...p, id: Math.random().toString(36).slice(2, 8).toUpperCase(), criadoEm: new Date().toISOString() }
  localStorage.setItem(CHAVE, JSON.stringify([pedido, ...listarPedidos()].slice(0, 20)))
  return pedido
}
