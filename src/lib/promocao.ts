/**
 * Promoção aplicada no FINAL do orçamento por foto: o cliente vê o total
 * original riscado ("era") e o total com desconto ("agora").
 * Para encerrar a promoção, mude `ativa` para false. Valores provisórios de teste,
 * antes da divulgação oficial (banner/panfleto).
 */
export const PROMOCAO = {
  ativa: true,
  nome: 'Promoção de lançamento',
  percentual: 20,
} as const

export type ResultadoPromo = { original: number; desconto: number; final: number; ativa: boolean }

/** Aplica o desconto sobre o total (em centavos, arredondado ao centavo). */
export function aplicarPromocao(totalCentavos: number): ResultadoPromo {
  if (!PROMOCAO.ativa || totalCentavos <= 0) return { original: totalCentavos, desconto: 0, final: totalCentavos, ativa: false }
  const desconto = Math.round((totalCentavos * PROMOCAO.percentual) / 100)
  return { original: totalCentavos, desconto, final: totalCentavos - desconto, ativa: true }
}
