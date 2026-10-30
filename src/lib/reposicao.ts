/**
 * Regra de preço do VizinhoLava: lavar cada utensílio custa 8% do valor de
 * reposição dele (o preço de comprar um novo). Se um prato de R$ 20 quebra,
 * você paga R$ 20; lavar por 8% disso é justo.
 *
 * Valores de reposição: preços de varejo "mais comuns" (entrada/intermediários)
 * pesquisados em 30/10/2026 em Havan e lojas similares:
 * - prato: prato raso porcelana 25 cm (Havan, linha Tramontina/Havan Casa) R$ 19,99
 * - copo: copo americano 190 ml Nadir (Havan) R$ 2,49
 * - talher: garfo de mesa inox Tramontina Ipanema/Búzios (Havan) R$ 4,99
 * - panela: panela antiaderente 20 cm Magnific Panelux (loja Panelux) R$ 54,90
 * - frigideira: frigideira antiaderente 24 cm (Havan, Fracalanza/Havan Casa) R$ 79,99
 * - caçarola: caçarola antiaderente 20 cm tampa vidro Panelux (Havan) R$ 79,99
 * - fervedor: fervedor alumínio Magnific Panelux 1,6 L (Havan) R$ 39,99
 * - panela de pressão: Panelux Classic 4,5 L alumínio (Havan) R$ 89,99
 * - cesto air fryer: cesto original Mondial AF-30 3,5 L (loja Mondial) R$ 62,91
 * - grelha churrasqueira: grelha moeda inox 38×48 cm Utilmil (Havan) R$ 149,99
 * - esponja: esponja dupla face Scotch-Brite, unidade (média de lojas) R$ 2,20
 * - detergente: detergente Ypê 500 ml (Carrefour) R$ 2,89
 *
 * Arredondamento: lavagem = 8% da reposição, arredondado aos 10 centavos.
 * Mudar um valor aqui atualiza o app inteiro (precos.ts e catalogo.ts leem daqui).
 */
export const PERCENTUAL_LAVAGEM = 8

export type ItemReposicao =
  | 'prato' | 'copo' | 'talher' | 'panela' | 'frigideira' | 'cacarola' | 'fervedor'
  | 'pressao' | 'airfryer' | 'grelha' | 'esponja' | 'detergente'

export const REPOSICAO_CENTAVOS: Record<ItemReposicao, { item: string; reposicaoCentavos: number; fonte: string }> = {
  prato: { item: 'Prato', reposicaoCentavos: 1999, fonte: 'Havan' },
  copo: { item: 'Copo', reposicaoCentavos: 249, fonte: 'Havan' },
  talher: { item: 'Talher (unidade)', reposicaoCentavos: 499, fonte: 'Havan' },
  panela: { item: 'Panela', reposicaoCentavos: 5490, fonte: 'Panelux' },
  frigideira: { item: 'Frigideira', reposicaoCentavos: 7999, fonte: 'Havan' },
  cacarola: { item: 'Caçarola', reposicaoCentavos: 7999, fonte: 'Havan' },
  fervedor: { item: 'Fervedor (leiteira)', reposicaoCentavos: 3999, fonte: 'Havan' },
  pressao: { item: 'Panela de pressão', reposicaoCentavos: 8999, fonte: 'Havan' },
  airfryer: { item: 'Cesto da air fryer', reposicaoCentavos: 6291, fonte: 'Mondial' },
  grelha: { item: 'Grelha da churrasqueira', reposicaoCentavos: 14999, fonte: 'Havan' },
  esponja: { item: 'Esponja', reposicaoCentavos: 220, fonte: 'média de lojas' },
  detergente: { item: 'Detergente', reposicaoCentavos: 289, fonte: 'Carrefour' },
}

/** 8% da reposição, arredondado aos 10 centavos. */
export function lavagemDe(reposicaoCentavos: number): number {
  return Math.round((reposicaoCentavos * PERCENTUAL_LAVAGEM) / 100 / 10) * 10
}

export const REPOSICAO = (Object.keys(REPOSICAO_CENTAVOS) as ItemReposicao[]).map((id) => ({
  id,
  item: REPOSICAO_CENTAVOS[id].item,
  reposicaoCentavos: REPOSICAO_CENTAVOS[id].reposicaoCentavos,
  lavagemCentavos: lavagemDe(REPOSICAO_CENTAVOS[id].reposicaoCentavos),
}))

/** Valor de lavagem (centavos) de um item de reposição. */
export const lavagem = (id: ItemReposicao) => lavagemDe(REPOSICAO_CENTAVOS[id].reposicaoCentavos)
