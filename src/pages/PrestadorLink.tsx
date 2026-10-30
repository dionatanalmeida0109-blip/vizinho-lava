import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { decodificar, escolherPrestador } from '../lib/linkPrestador'
import { formatPhone } from '../lib/phone'
import { MENSAGEM_COMPARTILHAMENTO } from '../lib/rotas'

/** /p/:codigo — cliente abriu o link de pedidos de um prestador. */
export default function PrestadorLink() {
  const { codigo = '' } = useParams()
  const session = useAuth()
  const p = decodificar(codigo)

  if (!p)
    return (
      <div className="pagina">
        <main className="login">
          <h1>Link inválido</h1>
          <p className="sub">Peça um novo link ao prestador.</p>
          <Link className="cta" to="/">Ir para o início</Link>
        </main>
      </div>
    )

  escolherPrestador(p)
  const destino = session?.role === 'cliente' ? '/home' : '/login'

  return (
    <div className="pagina">
      <header className="topo"><Link to="/" className="marca">VizinhoLava</Link></header>
      <main className="login">
        <h1>{p.nome}</h1>
        <p className="sub">Atende em {p.regiao} · WhatsApp {formatPhone(p.whatsapp)}</p>
        <div className="compartilhamento" role="note"><p>{MENSAGEM_COMPARTILHAMENTO}</p></div>
        <p className="sub-p">Monte o orçamento pela foto da louça e envie o pedido direto para o WhatsApp de {p.nome.split(' ')[0]}.</p>
        <Link className="cta" to={destino}>{session?.role === 'cliente' ? 'Fazer orçamento' : 'Entrar como cliente'}</Link>
      </main>
    </div>
  )
}
