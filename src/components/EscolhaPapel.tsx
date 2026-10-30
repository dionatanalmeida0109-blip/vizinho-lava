import { Link } from 'react-router-dom'
import type { Role } from '../lib/localAuth'
import { LOGIN } from '../lib/rotas'

/** Cartões "Sou cliente" / "Sou prestador" que levam ao login de cada tipo. */
export function EscolhaPapel({ criar = false, destaque, textos }: {
  /** Abre o login já em "Criar conta". */
  criar?: boolean
  /** Cartão preenchido em verde. */
  destaque?: Role
  textos: Record<Role, string>
}) {
  const q = criar ? '?modo=criar' : ''
  return (
    <div className="escolha">
      {(['cliente', 'prestador'] as Role[]).map((r) => (
        <Link key={r} className={r === destaque ? 'opcao destaque' : 'opcao'} to={`${LOGIN[r]}${q}`}>
          <strong>{r === 'cliente' ? 'Sou cliente' : 'Sou prestador'}</strong>
          <span>{textos[r]}</span>
        </Link>
      ))}
    </div>
  )
}

/** Alternador em pílula Cliente | Prestador no topo do login. */
export function SeletorPapel({ atual }: { atual: Role }) {
  return (
    <nav className="papeis" aria-label="Tipo de conta">
      {(['cliente', 'prestador'] as Role[]).map((r) => (
        <Link key={r} to={LOGIN[r]} className={r === atual ? 'ativo' : ''} aria-current={r === atual ? 'page' : undefined}>
          {r === 'cliente' ? 'Sou cliente' : 'Sou prestador'}
        </Link>
      ))}
    </nav>
  )
}
