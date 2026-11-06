/**
 * Preço natural da lavagem de louça: R$ 20–30 (base sugerida pela IA local).
 * Produtos do lavador são acréscimo separado. Sem faixa 80–150.
 */
export const ORCAMENTO = {
  minCentavos: 2000,
  maxCentavos: 3000,
  /** Valores típicos por volume estimado na foto. */
  volumes: {
    pouca: { centavos: 2000, rotulo: 'Pouca louça' },
    media: { centavos: 2500, rotulo: 'Louça média' },
    cheia: { centavos: 3000, rotulo: 'Pia cheia' },
  },
} as const

export type VolumeOrcamento = keyof typeof ORCAMENTO.volumes

/** Mantido só como referência de utensílios (não define o total do serviço). */
export type Utensilio = 'prato' | 'copo' | 'talher' | 'panela'
export const PRECOS: Record<Utensilio, { nome: string; plural: string; centavos: number; nota?: string }> = {
  prato: { nome: 'Prato', plural: 'Pratos', centavos: 40 },
  copo: { nome: 'Copo', plural: 'Copos', centavos: 30 },
  talher: { nome: 'Talher', plural: 'Talheres', centavos: 12 },
  panela: {
    nome: 'Panela',
    plural: 'Panelas',
    centavos: 150,
    nota: 'Conforme a condição; lavador confirma.',
  },
}
export const UTENSILIOS: Utensilio[] = ['prato', 'copo', 'talher', 'panela']

/**
 * Taxas quando o cliente não tem os produtos e o lavador leva os seus.
 * Valores explícitos e modestos (fora do preço base da pia).
 */
export type Produto = 'detergente' | 'esponja'
export const PRODUTOS: Record<Produto, { nome: string; centavos: number }> = {
  esponja: { nome: 'Esponja (do lavador)', centavos: 200 },
  detergente: { nome: 'Detergente (do lavador)', centavos: 300 },
}
export const LISTA_PRODUTOS: Produto[] = ['esponja', 'detergente']

export type Contagem = Record<Utensilio, number>
export const CONTAGEM_VAZIA: Contagem = { prato: 0, copo: 0, talher: 0, panela: 0 }

export function reais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function limitarBase(centavos: number): number {
  const passo = 50 // R$ 0,50
  const arred = Math.round(centavos / passo) * passo
  return Math.min(ORCAMENTO.maxCentavos, Math.max(ORCAMENTO.minCentavos, arred))
}

export function subtotalProdutos(marcados: Partial<Record<Produto, boolean>>): number {
  return LISTA_PRODUTOS.filter((p) => marcados[p]).reduce((t, p) => t + PRODUTOS[p].centavos, 0)
}

/** @deprecated O total do serviço é a base R$ 20–30 + produtos; peça a peça não fecha o preço. */
export function subtotalLouca(c: Contagem): number {
  return UTENSILIOS.reduce((t, u) => t + c[u] * PRECOS[u].centavos, 0)
}
