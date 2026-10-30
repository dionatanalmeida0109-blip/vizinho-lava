/**
 * Prepara a foto da louça para ficar visível e sobreviver à volta da câmera.
 * No celular, abrir a câmera pode descarregar a página; por isso a foto é
 * reduzida (JPEG ~1280px) e guardada no sessionStorage deste aparelho.
 * Nada é enviado para a rede.
 */
const CHAVE = 'vizinholava:foto'
const LADO = 1280

function lerComoDataUrl(arquivo: Blob): Promise<string> {
  return new Promise((ok, falha) => {
    const r = new FileReader()
    r.onload = () => ok(String(r.result))
    r.onerror = () => falha(r.error)
    r.readAsDataURL(arquivo)
  })
}

function carregarImagem(src: string): Promise<HTMLImageElement> {
  return new Promise((ok, falha) => {
    const img = new Image()
    img.onload = () => ok(img)
    img.onerror = () => falha(new Error('imagem inválida'))
    img.src = src
  })
}

/** Lê o arquivo e devolve um data URL JPEG reduzido (ou o original se não der para reduzir). */
export async function prepararFoto(arquivo: Blob): Promise<string> {
  const original = await lerComoDataUrl(arquivo)
  try {
    const img = await carregarImagem(original)
    const escala = Math.min(1, LADO / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * escala))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * escala))
    const ctx = canvas.getContext('2d')
    if (!ctx) return original
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.82)
  } catch {
    return original
  }
}

export function guardarFoto(dataUrl: string | null) {
  try {
    if (dataUrl) sessionStorage.setItem(CHAVE, dataUrl)
    else sessionStorage.removeItem(CHAVE)
  } catch {
    /* sem espaço: a foto continua só na tela */
  }
}

export function fotoGuardada(): string | null {
  try {
    return sessionStorage.getItem(CHAVE)
  } catch {
    return null
  }
}

export async function fotoComoBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob()
}
