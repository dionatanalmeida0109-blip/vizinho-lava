/**
 * Confirmação do lavador no local: ajusta o valor BASE (R$ 20–30) e marca
 * produtos que levou. O preço natural do serviço é a faixa base + produtos.
 */
import { LISTA_PRODUTOS, PRODUTOS, limitarBase, type Produto } from './precos'
import { salvarServico, listarServicos, type Servico } from './servicos'
import { atualizarPedido } from './pedidos'

export type FechamentoBase = {
  baseCentavos: number
  produtos: { id: Produto; nome: string; centavos: number }[]
  total: number
}

export function fecharBase(
  baseCentavos: number,
  usados: Partial<Record<Produto, boolean>>,
): FechamentoBase {
  const base = limitarBase(baseCentavos)
  const produtos = LISTA_PRODUTOS.filter((p) => usados[p]).map((p) => ({
    id: p,
    nome: PRODUTOS[p].nome,
    centavos: PRODUTOS[p].centavos,
  }))
  const total = base + produtos.reduce((t, p) => t + p.centavos, 0)
  return { baseCentavos: base, produtos, total }
}

export type ContagemSalva = Servico
export const listarContagens = listarServicos

export function salvarContagem(args: {
  pedido?: string
  cliente?: string
  clienteNome?: string
  lavadorNome?: string
  baseSugerida: number
  baseConfirmada: number
  produtos: Produto[]
  total: number
  notas?: string
  texto: string
}): Servico {
  const servico = salvarServico({
    pedidoId: args.pedido,
    clienteTelefone: args.cliente,
    clienteNome: args.clienteNome,
    lavadorNome: args.lavadorNome,
    baseSugerida: args.baseSugerida,
    baseConfirmada: args.baseConfirmada,
    produtos: args.produtos,
    total: args.total,
    notas: args.notas,
    texto: args.texto,
  })
  if (args.pedido) {
    atualizarPedido(args.pedido, {
      status: 'concluido',
      finalCentavos: args.total,
      confirmadoEm: servico.criadoEm,
      notasLavador: args.notas,
    })
  }
  return servico
}
