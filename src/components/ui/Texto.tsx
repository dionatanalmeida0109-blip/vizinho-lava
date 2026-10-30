import type { ReactNode } from 'react'

/** Título da tela + subtítulo opcional. */
export function Titulo({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <>
      <h1>{children}</h1>
      {sub && <p className="sub">{sub}</p>}
    </>
  )
}

/** Etiqueta pequena (ex.: "Prestador", "preços maiores"). */
export const Tag = ({ children }: { children: ReactNode }) => <small className="tag">{children}</small>

/** Texto de apoio em cinza dentro de cartões/formulários. */
export const Apoio = ({ children }: { children: ReactNode }) => <p className="sub-p">{children}</p>

/** Observação curta em verde escuro. */
export const Nota = ({ children }: { children: ReactNode }) => <p className="nota">{children}</p>

/** Caixa de aviso em destaque (laranja claro). */
export function CaixaAviso({ titulo, children }: { titulo?: ReactNode; children: ReactNode }) {
  return (
    <div className="caixa-aviso" role="note">
      {titulo && <strong>{titulo}</strong>}
      <p>{children}</p>
    </div>
  )
}
