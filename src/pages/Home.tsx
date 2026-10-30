import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { signOut } from '../lib/localAuth'
import { formatPhone } from '../lib/phone'

export default function Home() {
  const session = useAuth()
  const navigate = useNavigate()

  if (!session) return <Navigate to="/login" replace />

  function sair() {
    signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="pagina">
      <header className="topo">
        <span className="marca">VizinhoLava</span>
      </header>
      <main className="hero">
        <h1>Olá, {session.name}!</h1>
        <p className="sub">{formatPhone(session.phone)}</p>
        <p className="sub">Em breve: agendar alguém para lavar a sua louça.</p>
        <button className="secundario" type="button" onClick={sair}>Sair</button>
      </main>
    </div>
  )
}
