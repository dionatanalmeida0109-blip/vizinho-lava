/**
 * Tabela de preços base (valores em centavos).
 * Regra: lavagem = 8% do valor de reposição do item (ver ./reposicao.ts).
 * Todo o catálogo (como funciona, churrasco) é calculado a partir destas 4 bases.
 * Promoção fica em ./promocao.ts.
 */
import { lavagem } from './reposicao'

export type Utensilio = 'prato' | 'copo' | 'talher' | 'panela'

export const PRECOS: Record<Utensilio, { nome: string; plural: string; centavos: number; nota?: string }> = {
  prato: { nome: 'Prato', plural: 'Pratos', centavos: lavagem('prato') },
  copo: { nome: 'Copo', plural: 'Copos', centavos: lavagem('copo') },
  talher: { nome: 'Talher', plural: 'Talheres', centavos: lavagem('talher') },
  panela: {
    nome: 'Panela',
    plural: 'Panelas',
    centavos: lavagem('panela'),
    nota: 'Conforme a condição; lavador confirma.',
  },
}

export const UTENSILIOS: Utensilio[] = ['prato', 'copo', 'talher', 'panela']

/**
 * Taxas opcionais quando o cliente não tem os produtos adequados e o lavador
 * leva os seus: também 8% do preço do produto novo (ver ./reposicao.ts).
 */
export type Produto = 'detergente' | 'esponja'
export const PRODUTOS: Record<Produto, { nome: string; centavos: number }> = {
  esponja: { nome: 'Esponja (do lavador)', centavos: lavagem('esponja') },
  detergente: { nome: 'Detergente (do lavador)', centavos: lavagem('detergente') },
}
export const LISTA_PRODUTOS: Produto[] = ['esponja', 'detergente']

export type Contagem = Record<Utensilio, number>
export const CONTAGEM_VAZIA: Contagem = { prato: 0, copo: 0, talher: 0, panela: 0 }

export function reais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function subtotalLouca(c: Contagem): number {
  return UTENSILIOS.reduce((t, u) => t + c[u] * PRECOS[u].centavos, 0)
}
