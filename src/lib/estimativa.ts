import { limitarBase, ORCAMENTO, type Contagem, type VolumeOrcamento } from './precos'

/**
 * "IA" local de orçamento: 100% no aparelho, sem rede e sem API.
 * Reduz a foto, mede densidade de bordas (louça empilhada) e área clara,
 * e sugere um valor BASE dentro de R$ 20–30. O lavador confirma no local
 * (a foto não mostra gordura queimada no fundo da panela).
 */
export type EstimativaOrcamento = {
  baseCentavos: number
  volume: VolumeOrcamento
  rotulo: string
  /** Contagem grosseira só para o cliente conferir o volume — não fecha o preço. */
  contagem: Contagem
  densidade: number
}

export async function estimarOrcamento(arquivo: Blob): Promise<EstimativaOrcamento> {
  const bitmap = await createImageBitmap(arquivo)
  const L = 96
  const escala = L / Math.max(bitmap.width, bitmap.height)
  const w = Math.max(8, Math.round(bitmap.width * escala))
  const h = Math.max(8, Math.round(bitmap.height * escala))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('canvas indisponível')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close?.()
  const { data } = ctx.getImageData(0, 0, w, h)

  const cinza = new Float32Array(w * h)
  for (let i = 0; i < w * h; i++) {
    cinza[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
  }
  let bordas = 0
  let claros = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const gx = cinza[i + 1] - cinza[i - 1]
      const gy = cinza[i + w] - cinza[i - w]
      if (Math.hypot(gx, gy) > 40) bordas++
      if (cinza[i] > 170) claros++
    }
  }
  const area = (w - 2) * (h - 2)
  const densidade = bordas / area
  const fracClaro = claros / area

  // Densidade tipicamente 0–0.45 → mapeia para 20–30 reais.
  const bruto = ORCAMENTO.minCentavos + densidade * (ORCAMENTO.maxCentavos - ORCAMENTO.minCentavos) / 0.35
  const baseCentavos = limitarBase(bruto)

  let volume: VolumeOrcamento = 'media'
  if (baseCentavos <= 2200) volume = 'pouca'
  else if (baseCentavos >= 2800) volume = 'cheia'

  const totalItens = Math.min(40, Math.max(4, Math.round(densidade * 80)))
  const pratos = Math.max(1, Math.round(totalItens * (0.25 + 0.15 * fracClaro)))
  const copos = Math.max(1, Math.round(totalItens * 0.2))
  const panelas = Math.max(1, Math.round(totalItens * 0.08))
  const talheres = Math.max(0, totalItens - pratos - copos - panelas)

  return {
    baseCentavos,
    volume,
    rotulo: ORCAMENTO.volumes[volume].rotulo,
    contagem: { prato: pratos, copo: copos, talher: talheres, panela: panelas },
    densidade,
  }
}

/** Compat: ainda devolve só a contagem (para telas antigas). Prefira estimarOrcamento. */
export async function estimarLouca(arquivo: Blob): Promise<Contagem> {
  return (await estimarOrcamento(arquivo)).contagem
}
