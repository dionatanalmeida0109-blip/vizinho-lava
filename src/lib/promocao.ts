/**
 * Promoção desligada: o preço natural já é R$ 20–30.
 * Mantido o helper para não quebrar imports; `ativa: false` = sem desconto.
 */
export const PROMOCAO = {
  ativa: false,
  nome: 'Promoção de lançamento',
  percentual: 0,
} as const

export type ResultadoPromo = { original: number; desconto: number; final: number; ativa: boolean }

export function aplicarPromocao(totalCentavos: number): ResultadoPromo {
  if (!PROMOCAO.ativa || totalCentavos <= 0) {
    return { original: totalCentavos, desconto: 0, final: totalCentavos, ativa: false }
  }
  const desconto = Math.round((totalCentavos * PROMOCAO.percentual) / 100)
  return { original: totalCentavos, desconto, final: totalCentavos - desconto, ativa: true }
}
