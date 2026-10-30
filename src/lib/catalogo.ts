/**
 * Tabela de utensílios que o cliente vê (/como-funciona e orçamento).
 * Só nomes curtos em português de peças reais de cozinha. A maioria segue as
 * 4 bases de ./precos.ts (base × multiplicador); os itens com valor de reposição
 * próprio (frigideira, caçarola, fervedor, pressão, cesto air fryer, grelha)
 * custam 8% da reposição (./reposicao.ts).
 * Itens "conforme a condição" são confirmados no local.
 */
import { PRECOS, type Utensilio } from './precos'
import { lavagem } from './reposicao'

/** Preço derivado: base × multiplicador, arredondado ao centavo. */
const de = (ref: Utensilio, mult: number) => Math.round(PRECOS[ref].centavos * mult)

export type ItemCatalogo = {
  id: string
  nome: string
  /** Detalhe curto opcional (sem marcas). */
  exemplos?: string
  base: Utensilio | 'churrasco' | 'extra'
  centavos: number
  regra: string
  condicao?: boolean
}

export type Categoria = { id: string; titulo: string; descricao: string; itens: ItemCatalogo[] }

export const CATEGORIAS: Categoria[] = [
  {
    id: 'louca',
    titulo: 'Pratos, tigelas e potes',
    descricao: 'Mesmo preço do prato.',
    itens: [
      { id: 'prato', nome: 'Prato', base: 'prato', centavos: de('prato', 1), regra: 'Preço de prato' },
      { id: 'tigela', nome: 'Tigela', base: 'prato', centavos: de('prato', 1), regra: 'Preço de prato' },
      { id: 'pote', nome: 'Pote com tampa', base: 'prato', centavos: de('prato', 1), regra: 'Preço de prato' },
      { id: 'tabua', nome: 'Tábua de corte', base: 'prato', centavos: de('prato', 1), regra: 'Preço de prato' },
    ],
  },
  {
    id: 'copos',
    titulo: 'Copos e xícaras',
    descricao: 'Mesmo preço do copo.',
    itens: [
      { id: 'copo', nome: 'Copo', base: 'copo', centavos: de('copo', 1), regra: 'Preço de copo' },
      { id: 'taca', nome: 'Taça', base: 'copo', centavos: de('copo', 1), regra: 'Preço de copo' },
      { id: 'xicara', nome: 'Xícara ou caneca', base: 'copo', centavos: de('copo', 1), regra: 'Preço de copo' },
      { id: 'garrafa', nome: 'Garrafa', base: 'copo', centavos: de('copo', 2), regra: '2× copo (tampa)' },
    ],
  },
  {
    id: 'talheres',
    titulo: 'Talheres',
    descricao: 'Mesmo preço do talher.',
    itens: [
      { id: 'talher', nome: 'Talher (garfo, faca ou colher)', base: 'talher', centavos: de('talher', 1), regra: 'Preço de talher' },
      { id: 'concha', nome: 'Concha, espátula ou escumadeira', base: 'talher', centavos: de('talher', 1), regra: 'Preço de talher' },
      { id: 'faca', nome: 'Faca de cozinha', base: 'talher', centavos: de('talher', 2), regra: '2× talher (lâmina)' },
      { id: 'ralador', nome: 'Ralador', base: 'talher', centavos: de('talher', 2), regra: '2× talher' },
    ],
  },
  {
    id: 'panelas',
    titulo: 'Panelas e formas',
    descricao: 'Conforme a condição; o lavador confirma no local.',
    itens: [
      { id: 'panela', nome: 'Panela', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'cacarola', nome: 'Caçarola', base: 'panela', centavos: lavagem('cacarola'), regra: '8% da reposição' },
      { id: 'fervedor', nome: 'Fervedor (leiteira)', base: 'panela', centavos: lavagem('fervedor'), regra: '8% da reposição' },
      { id: 'frigideira', nome: 'Frigideira', base: 'panela', centavos: lavagem('frigideira'), regra: '8% da reposição' },
      { id: 'pressao', nome: 'Panela de pressão', base: 'panela', centavos: lavagem('pressao'), regra: '8% da reposição' },
      { id: 'travessa', nome: 'Travessa', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'assadeira', nome: 'Assadeira', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'forma', nome: 'Forma de bolo', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'liquidificador', nome: 'Copo do liquidificador', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela' },
      { id: 'airfryer', nome: 'Cesto da air fryer', base: 'panela', centavos: lavagem('airfryer'), regra: '8% da reposição' },
    ],
  },
  {
    id: 'churrasco',
    titulo: 'Churrasco',
    descricao: 'Preços maiores: gordura queimada, espetos e grelhas pedem mais tempo.',
    itens: [
      { id: 'espeto', nome: 'Espeto', base: 'churrasco', centavos: 80, regra: 'Preço fixo', condicao: true },
      { id: 'garfo-trinchante', nome: 'Faca ou garfo de churrasco', base: 'churrasco', centavos: 40, regra: 'Preço fixo', condicao: true },
      { id: 'tabua-churrasco', nome: 'Tábua de churrasco', base: 'churrasco', centavos: de('prato', 3), regra: '3× prato', condicao: true },
      { id: 'travessa-churrasco', nome: 'Travessa com gordura queimada', base: 'churrasco', centavos: de('panela', 2), regra: '2× panela', condicao: true },
      { id: 'chapa', nome: 'Chapa de ferro', base: 'churrasco', centavos: de('panela', 2.5), regra: '2,5× panela', condicao: true },
      { id: 'grelha', nome: 'Grelha da churrasqueira', base: 'churrasco', centavos: lavagem('grelha'), regra: '8% da reposição' },
    ],
  },
]

/** Serviços à parte — não são louça. Geladeira e serviços de diarista NÃO entram. */
export const ADICIONAIS: ItemCatalogo[] = [
  { id: 'fogao', nome: 'Limpeza do fogão', exemplos: 'Grades, queimadores e superfície', base: 'extra', centavos: 1500, regra: 'Serviço à parte', condicao: true },
  { id: 'micro-ondas', nome: 'Limpeza do micro-ondas', exemplos: 'Por dentro, prato e porta', base: 'extra', centavos: 800, regra: 'Serviço à parte', condicao: true },
]

export const CHURRASCO = CATEGORIAS.find((c) => c.id === 'churrasco')!.itens
