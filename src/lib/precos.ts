/**
 * Tabela de preços base (valores em centavos), abaixo do mercado.
 * Todo o catálogo (como funciona, churrasco) é calculado a partir destas 4 bases:
 * mudar um valor aqui atualiza o app inteiro. Promoção fica em ./promocao.ts.
 */
export type Utensilio = 'prato' | 'copo' | 'talher' | 'panela'

export const PRECOS: Record<Utensilio, { nome: string; plural: string; centavos: number; nota?: string }> = {
  prato: { nome: 'Prato', plural: 'Pratos', centavos: 40 },
  copo: { nome: 'Copo', plural: 'Copos', centavos: 25 },
  talher: { nome: 'Talher', plural: 'Talheres', centavos: 8 },
  panela: {
    nome: 'Panela',
    plural: 'Panelas',
    centavos: 150,
    nota: 'Conforme a condição; lavador confirma.',
  },
}

export const UTENSILIOS: Utensilio[] = ['prato', 'copo', 'talher', 'panela']

/**
 * Taxas opcionais quando o cliente não tem os produtos adequados e o lavador
 * leva os seus. Valores de referência (provisórios) — ajuste aqui.
 */
export type Produto = 'detergente' | 'esponja'
export const PRODUTOS: Record<Produto, { nome: string; centavos: number }> = {
  detergente: { nome: 'Uso de detergente do lavador', centavos: 100 },
  esponja: { nome: 'Uso de esponja do lavador', centavos: 150 },
}
export const LISTA_PRODUTOS: Produto[] = ['detergente', 'esponja']

export type Contagem = Record<Utensilio, number>
export const CONTAGEM_VAZIA: Contagem = { prato: 0, copo: 0, talher: 0, panela: 0 }

export function reais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function subtotalLouca(c: Contagem): number {
  return UTENSILIOS.reduce((t, u) => t + c[u] * PRECOS[u].centavos, 0)
}
