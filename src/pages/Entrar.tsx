import { Link } from 'react-router-dom'
import { MENSAGEM_COMPARTILHAMENTO } from '../lib/rotas'

/** Escolha do tipo de conta, estilo Uber/99. */
export default function Entrar() {
  return (
    <div className="pagina">
      <header className="topo"><Link to="/" className="marca">VizinhoLava</Link></header>
      <main className="login">
        <h1>Como você quer usar?</h1>
        <div className="escolha">
          <Link className="opcao" to="/login">
            <strong>Sou cliente</strong>
            <span>Quero pedir alguém para lavar a minha louça.</span>
          </Link>
          <Link className="opcao" to="/prestador/login">
            <strong>Sou prestador</strong>
            <span>Quero lavar louça na casa dos vizinhos e receber por isso.</span>
          </Link>
        </div>
        <p className="nota">{MENSAGEM_COMPARTILHAMENTO}</p>
      </main>
    </div>
  )
}
