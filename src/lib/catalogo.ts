/**
 * Tabela de utensílios que o cliente vê (/como-funciona e orçamento).
 * Só nomes curtos em português de peças reais de cozinha. A maioria segue as
 * 4 bases de ./precos.ts (base × multiplicador); alguns itens têm preço fixo
 * combinado com o dono. Exceções (não quebram, o risco é gordura/dano):
 * panela de pressão R$ 2,50 (com gordura R$ 3,00–4,00) e panela elétrica R$ 20,00.
 * Nenhum preço sai de percentual do valor de loja.
 * Itens "conforme a condição" são confirmados no local.
 */
import { PRECOS, type Utensilio } from './precos'

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
  /** Exceção de preço: valor máximo (centavos) conforme a condição, ex.: pressão com gordura. */
  ate?: number
  /** Por que o item tem preço próprio (mostrado em Como funciona). */
  porque?: string
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
      { id: 'cacarola', nome: 'Caçarola', base: 'panela', centavos: 150, regra: 'Preço fixo' },
      { id: 'fervedor', nome: 'Fervedor (leiteira)', base: 'panela', centavos: 150, regra: 'Preço fixo' },
      { id: 'frigideira', nome: 'Frigideira', base: 'panela', centavos: 150, regra: 'Preço fixo' },
      {
        id: 'pressao', nome: 'Panela de pressão', base: 'panela', centavos: 250, ate: 400, regra: 'Exceção: preço fixo',
        porque: 'Não quebra: o trabalho é a gordura, a válvula e a borracha. Limpa R$ 2,50; com gordura, R$ 3,00 a R$ 4,00.',
      },
      {
        id: 'eletrica', nome: 'Panela elétrica', base: 'panela', centavos: 2000, regra: 'Exceção: preço fixo',
        porque: 'Custa uns R$ 400 na loja, mas o que se lava é só a forma/cuba de fora (como no air fryer); a parte elétrica não vai na água. O risco é gordura e dano, não quebra — por isso o preço não sai do valor da loja.',
      },
      { id: 'travessa', nome: 'Travessa', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'assadeira', nome: 'Assadeira', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'forma', nome: 'Forma de bolo', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'liquidificador', nome: 'Copo do liquidificador', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela' },
      { id: 'airfryer', nome: 'Cesto da air fryer', base: 'panela', centavos: 300, regra: 'Preço fixo (gordura)', porque: 'Só o cesto/forma: gordura, sem risco de quebra.' },
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
      { id: 'grelha', nome: 'Grelha da churrasqueira', base: 'churrasco', centavos: 800, regra: 'Preço fixo' },
    ],
  },
]

/** Serviços à parte — não são louça. Geladeira e serviços de diarista NÃO entram. */
export const ADICIONAIS: ItemCatalogo[] = [
  { id: 'fogao', nome: 'Limpeza do fogão', exemplos: 'Grades, queimadores e superfície', base: 'extra', centavos: 1500, regra: 'Serviço à parte', condicao: true },
  { id: 'micro-ondas', nome: 'Limpeza do micro-ondas', exemplos: 'Por dentro, prato e porta', base: 'extra', centavos: 800, regra: 'Serviço à parte', condicao: true },
]

export const CHURRASCO = CATEGORIAS.find((c) => c.id === 'churrasco')!.itens

/** Todos os itens que o prestador pode contar depois de lavar (louça, churrasco e serviços). */
export const ITENS_CONTAGEM: { id: string; titulo: string; itens: ItemCatalogo[] }[] = [
  ...CATEGORIAS.map((c) => ({ id: c.id, titulo: c.titulo, itens: c.itens })),
  { id: 'adicionais', titulo: 'Serviços à parte', itens: ADICIONAIS },
]
