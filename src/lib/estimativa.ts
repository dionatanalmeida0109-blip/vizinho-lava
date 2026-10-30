import type { Contagem } from './precos'

/**
 * "IA" local de contagem: estimativa grosseira feita 100% no aparelho,
 * sem rede e sem API externa. Reduz a foto num canvas, mede quanto da imagem
 * tem bordas/contornos (louça empilhada gera muitas bordas) e converte isso
 * num total aproximado de itens, dividido em proporções típicas de uma pia.
 * O cliente ajusta as quantidades e o lavador confirma no local.
 */
export async function estimarLouca(arquivo: Blob): Promise<Contagem> {
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
  const densidade = bordas / area // ~0 (foto lisa) a ~0.5 (muito detalhe)
  const total = Math.min(40, Math.max(4, Math.round(densidade * 80)))
  const fracClaro = claros / area // muita área clara → mais pratos/copos de louça

  const pratos = Math.max(1, Math.round(total * (0.25 + 0.15 * fracClaro)))
  const copos = Math.max(1, Math.round(total * 0.2))
  const panelas = Math.max(1, Math.round(total * 0.08))
  const talheres = Math.max(0, total - pratos - copos - panelas)
  return { prato: pratos, copo: copos, talher: talheres, panela: panelas }
}
