/**
 * Catálogo expandido: utensílios mais vendidos no Brasil (rankings da
 * Amazon.com.br, Mercado Livre e Magalu, out/2026) mapeados para as 4 bases
 * do VizinhoLava (ver ./precos.ts). Cada item guarda só a base e o multiplicador;
 * o preço em centavos é calculado, então mudar uma base atualiza tudo.
 * Itens "conforme a condição" são confirmados no local.
 */
import { PRECOS, type Utensilio } from './precos'

/** Preço derivado: base × multiplicador, arredondado ao centavo. */
const de = (ref: Utensilio, mult: number) => Math.round(PRECOS[ref].centavos * mult)

export type ItemCatalogo = {
  id: string
  nome: string
  exemplos: string
  base: Utensilio | 'churrasco' | 'extra'
  centavos: number
  regra: string
  condicao?: boolean
}

export type Categoria = { id: string; titulo: string; descricao: string; itens: ItemCatalogo[] }

export const CATEGORIAS: Categoria[] = [
  {
    id: 'louca',
    titulo: 'Pratos, bowls e potes',
    descricao: 'Peças de servir e guardar comida. Cobradas como prato.',
    itens: [
      { id: 'prato', nome: 'Prato (raso, fundo ou sobremesa)', exemplos: 'Aparelhos de jantar de porcelana e vidro', base: 'prato', centavos: de('prato', 1), regra: 'Preço de prato' },
      { id: 'bowl', nome: 'Bowl / tigela / cumbuca', exemplos: 'Conjunto de bowls de inox com tampa (Electrolux)', base: 'prato', centavos: de('prato', 1), regra: 'Preço de prato' },
      { id: 'pote', nome: 'Pote hermético / marmita', exemplos: 'Potes de vidro 640 ml com 4 travas; kit 12 potes Electrolux', base: 'prato', centavos: de('prato', 1), regra: 'Preço de prato (pote + tampa)' },
      { id: 'tabua', nome: 'Tábua de corte', exemplos: 'Tábua de vidro, plástico ou madeira', base: 'prato', centavos: de('prato', 1), regra: 'Preço de prato' },
      { id: 'microondas', nome: 'Prato / pote de micro-ondas', exemplos: 'Refratário de vidro para micro-ondas com tampa', base: 'prato', centavos: de('prato', 2), regra: '2× prato (comida ressecada)' },
    ],
  },
  {
    id: 'copos',
    titulo: 'Copos, xícaras e garrafas',
    descricao: 'Tudo que serve bebida. Cobrado como copo.',
    itens: [
      { id: 'copo', nome: 'Copo / taça', exemplos: 'Kit 6 copos de vidro', base: 'copo', centavos: de('copo', 1), regra: 'Preço de copo' },
      { id: 'xicara', nome: 'Xícara / caneca (com pires)', exemplos: 'Jogos de xícaras de porcelana', base: 'copo', centavos: de('copo', 1), regra: 'Preço de copo' },
      { id: 'cremeira', nome: 'Cremeira / ramequim', exemplos: 'Cremeira Luna 350 ml', base: 'copo', centavos: de('copo', 1), regra: 'Preço de copo' },
      { id: 'garrafa', nome: 'Garrafa térmica / squeeze', exemplos: 'Garrafa térmica Stanley 710 ml', base: 'copo', centavos: de('copo', 2), regra: '2× copo (tampa e vedação)' },
    ],
  },
  {
    id: 'talheres',
    titulo: 'Talheres e utensílios de mão',
    descricao: 'Peças pequenas. Cobradas como talher.',
    itens: [
      { id: 'talher', nome: 'Talher (garfo, faca, colher)', exemplos: 'Faqueiro Tramontina 24 peças', base: 'talher', centavos: de('talher', 1), regra: 'Preço de talher' },
      { id: 'utensilio', nome: 'Espátula / concha / pegador / pinça', exemplos: 'Kits de utensílios de silicone e inox; espátula Mimo Style', base: 'talher', centavos: de('talher', 1), regra: 'Preço de talher' },
      { id: 'faca', nome: 'Faca de cozinha / ralador / abridor', exemplos: 'Facas de chef, raladores', base: 'talher', centavos: de('talher', 2), regra: '2× talher (lâmina, cuidado extra)' },
    ],
  },
  {
    id: 'panelas',
    titulo: 'Panelas, assadeiras e formas',
    descricao: 'Peças de fogo e forno. Base de panela, conforme a condição.',
    itens: [
      { id: 'panela', nome: 'Panela / caçarola / fervedor', exemplos: 'Jogos de panelas Tramontina Turim e Sicília', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'frigideira', nome: 'Frigideira', exemplos: 'Frigideiras antiaderentes e cerâmicas', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'pressao', nome: 'Panela de pressão', exemplos: 'Tramontina Vancouver 4,5 L; Panelux 4,5 L', base: 'panela', centavos: de('panela', 1.5), regra: '1,5× panela (válvula e borracha)', condicao: true },
      { id: 'travessa', nome: 'Travessa / refratário / lasanheira', exemplos: 'Lasanheira Marinex 5 L; travessas de porcelana', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'assadeira', nome: 'Assadeira / forma de bolo', exemplos: 'Jogo de 3 assadeiras antiaderentes', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela', condicao: true },
      { id: 'forma-silicone', nome: 'Forma de silicone / tapete culinário', exemplos: 'Forma de 9 cavidades; tapete de silicone para forno', base: 'panela', centavos: de('panela', 0.5), regra: 'Meia panela (leve, sem crosta)' },
      { id: 'liquidificador', nome: 'Copo de liquidificador / mixer', exemplos: 'Liquidificadores Mondial e Oster; mixer Elgin', base: 'panela', centavos: de('panela', 1), regra: 'Preço de panela (desmontar a lâmina)' },
      { id: 'airfryer', nome: 'Cesto da air fryer', exemplos: 'Air fryer Philco, Mondial, Philips Walita', base: 'panela', centavos: de('panela', 1.5), regra: '1,5× panela (gordura)', condicao: true },
    ],
  },
  {
    id: 'churrasco',
    titulo: 'Churrasco',
    descricao: 'Preços maiores: gordura queimada, espetos e grelhas pedem mais tempo e esfregão.',
    itens: [
      { id: 'espeto', nome: 'Espeto', exemplos: 'Espetos de inox ou duplos', base: 'churrasco', centavos: de('talher', 10), regra: '10× talher (gordura grudada)', condicao: true },
      { id: 'garfo-trinchante', nome: 'Faca / garfo trinchante', exemplos: 'Kits de churrasco', base: 'churrasco', centavos: de('talher', 5), regra: '5× talher', condicao: true },
      { id: 'tabua-churrasco', nome: 'Tábua de churrasco', exemplos: 'Tábua de madeira com canaleta', base: 'churrasco', centavos: de('prato', 3), regra: '3× prato (gordura na madeira)', condicao: true },
      { id: 'travessa-churrasco', nome: 'Travessa / assadeira com gordura queimada', exemplos: 'Assadeiras de carne', base: 'churrasco', centavos: de('panela', 2), regra: '2× panela', condicao: true },
      { id: 'chapa', nome: 'Chapa / bifeteira de ferro', exemplos: 'Chapas de ferro fundido', base: 'churrasco', centavos: de('panela', 2.5), regra: '2,5× panela', condicao: true },
      { id: 'grelha', nome: 'Grelha / grade da churrasqueira', exemplos: 'Grelhas de inox ou ferro', base: 'churrasco', centavos: de('panela', 4), regra: '4× panela', condicao: true },
    ],
  },
]

/** Serviços à parte — não são louça. Geladeira NÃO entra (é escopo de diarista). */
export const ADICIONAIS: ItemCatalogo[] = [
  { id: 'fogao', nome: 'Limpeza do fogão', exemplos: 'Grades, queimadores e superfície (sem forno interno)', base: 'extra', centavos: 1500, regra: 'Serviço à parte', condicao: true },
  { id: 'micro-ondas', nome: 'Limpeza do micro-ondas', exemplos: 'Interior, prato giratório e porta', base: 'extra', centavos: 800, regra: 'Serviço à parte', condicao: true },
]

export const CHURRASCO = CATEGORIAS.find((c) => c.id === 'churrasco')!.itens

export const FONTES = [
  { nome: 'Amazon.com.br — Mais vendidos em Cozinha', url: 'https://www.amazon.com.br/gp/bestsellers/kitchen' },
  { nome: 'Mercado Livre — refratários e travessas', url: 'https://lista.mercadolivre.com.br/refratario' },
  { nome: 'Magalu — Utilidades domésticas', url: 'https://www.magazineluiza.com.br/utilidades-domesticas/l/ud/' },
]
