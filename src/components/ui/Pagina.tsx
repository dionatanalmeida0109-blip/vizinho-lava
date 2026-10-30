import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Tag } from './Texto'

/**
 * Casca de toda tela: cabeçalho (marca + ações à direita) e conteúdo.
 * - largura "estreita": formulários (login, cadastro, escolha)
 * - largura "larga": telas de conteúdo (orçamento, área do prestador, como funciona)
 * - largura "livre": página inicial
 */
type Props = {
  children: ReactNode
  largura?: 'estreita' | 'larga' | 'livre'
  /** Etiqueta ao lado da marca (ex.: "Prestador"). */
  tag?: string
  /** Ações do lado direito do cabeçalho. */
  direita?: ReactNode
  /** false = sem cabeçalho (telas internas, ex.: /dev/resets). */
  topo?: boolean
  rodape?: ReactNode
}

const MAIN: Record<NonNullable<Props['largura']>, string | undefined> = { estreita: 'login', larga: 'orcamento', livre: undefined }

export function Pagina({ children, largura = 'larga', tag, direita, topo = true, rodape }: Props) {
  return (
    <div className="pagina">
      {topo && (
        <header className="topo">
          <Link to="/" className="marca">
            VizinhoLava{tag && <> <Tag>{tag}</Tag></>}
          </Link>
          {direita}
        </header>
      )}
      <main className={MAIN[largura]}>{children}</main>
      {rodape && <footer className="rodape">{rodape}</footer>}
    </div>
  )
}

/** Ações do cabeçalho agrupadas (ex.: Entrar + Cadastre-se). */
export function AcoesTopo({ children }: { children: ReactNode }) {
  return <nav className="topo-acoes">{children}</nav>
}
