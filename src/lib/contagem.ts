/**
 * Contagem pós-lavagem (prestador): o valor REAL do serviço.
 * O orçamento pela foto é só estimado; depois de lavar, o prestador marca
 * quantas peças de cada item foram lavadas e o app soma pela tabela fixa
 * (./catalogo.ts e ./precos.ts). Fica guardado só neste aparelho.
 */
import { ITENS_CONTAGEM, type ItemCatalogo } from './catalogo'
import { LISTA_PRODUTOS, PRODUTOS, type Produto } from './precos'
import { aplicarPromocao, type ResultadoPromo } from './promocao'

export const TODOS_ITENS: ItemCatalogo[] = ITENS_CONTAGEM.flatMap((g) => g.itens)

/** Quantidade lavada por item (id do catálogo). */
export type Quantidades = Record<string, number>
/** Preço unitário escolhido para itens com faixa (ex.: pressão com gordura). */
export type PrecosEscolhidos = Record<string, number>

/** Opções de preço de um item com faixa (de R$ 0,50 em R$ 0,50). */
export function opcoesPreco(i: ItemCatalogo): number[] {
  if (!i.ate) return [i.centavos]
  const op: number[] = []
  for (let c = i.centavos; c <= i.ate; c += 50) op.push(c)
  return op
}

export function precoUnitario(i: ItemCatalogo, escolhidos: PrecosEscolhidos): number {
  const p = escolhidos[i.id]
  return p && opcoesPreco(i).includes(p) ? p : i.centavos
}

export type Fechamento = {
  linhas: { id: string; nome: string; qtd: number; unitario: number; subtotal: number }[]
  produtos: { id: Produto; nome: string; centavos: number }[]
  pecas: number
  promo: ResultadoPromo
}

export function fechar(q: Quantidades, escolhidos: PrecosEscolhidos, usados: Record<Produto, boolean>): Fechamento {
  const linhas = TODOS_ITENS.filter((i) => (q[i.id] ?? 0) > 0).map((i) => {
    const unitario = precoUnitario(i, escolhidos)
    return { id: i.id, nome: i.nome, qtd: q[i.id], unitario, subtotal: q[i.id] * unitario }
  })
  const produtos = LISTA_PRODUTOS.filter((p) => usados[p]).map((p) => ({ id: p, nome: PRODUTOS[p].nome, centavos: PRODUTOS[p].centavos }))
  const bruto = linhas.reduce((t, l) => t + l.subtotal, 0) + produtos.reduce((t, p) => t + p.centavos, 0)
  return { linhas, produtos, pecas: linhas.reduce((t, l) => t + l.qtd, 0), promo: aplicarPromocao(bruto) }
}

export type ContagemSalva = { id: string; criadoEm: string; pedido?: string; cliente?: string; total: number; texto: string }
const CHAVE = 'vizinholava:contagens'

export function listarContagens(): ContagemSalva[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? '[]') as ContagemSalva[]
  } catch {
    return []
  }
}

export function salvarContagem(c: Omit<ContagemSalva, 'id' | 'criadoEm'>): ContagemSalva {
  const nova: ContagemSalva = { ...c, id: Math.random().toString(36).slice(2, 8).toUpperCase(), criadoEm: new Date().toISOString() }
  localStorage.setItem(CHAVE, JSON.stringify([nova, ...listarContagens()].slice(0, 50)))
  return nova
}
