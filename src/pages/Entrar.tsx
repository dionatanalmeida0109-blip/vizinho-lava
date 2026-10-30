import { Link, useSearchParams } from 'react-router-dom'
import { MENSAGEM_COMPARTILHAMENTO } from '../lib/rotas'

/** Escolha do tipo de conta, estilo Uber/99. */
export default function Entrar() {
  const [params] = useSearchParams()
  const criar = params.get('modo') === 'criar'
  const q = criar ? '?modo=criar' : ''
  return (
    <div className="pagina">
      <header className="topo"><Link to="/" className="marca">VizinhoLava</Link></header>
      <main className="login">
        <h1>{criar ? 'Criar conta: como você quer usar?' : 'Entrar: como você quer usar?'}</h1>
        <div className="escolha">
          <Link className="opcao" to={`/login${q}`}>
            <strong>Sou cliente</strong>
            <span>Quero pedir alguém para lavar a minha louça.</span>
          </Link>
          <Link className="opcao" to={`/prestador/login${q}`}>
            <strong>Sou prestador</strong>
            <span>Quero lavar louça na casa dos vizinhos e receber por isso.</span>
          </Link>
        </div>
        <p className="sub-p">
          {criar ? <>Já tem conta? <Link to="/entrar">Entrar</Link></> : <>Ainda não tem conta? <Link to="/entrar?modo=criar">Cadastre-se</Link></>}
        </p>
        <p className="nota">{MENSAGEM_COMPARTILHAMENTO}</p>
      </main>
    </div>
  )
}
