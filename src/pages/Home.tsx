import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { displayName } from '../lib/authName'

export default function Home() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) return <div className="pagina"><p className="sub">Carregando…</p></div>
  if (!session) return <Navigate to="/login" replace />

  async function sair() {
    await supabase?.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="pagina">
      <header className="topo">
        <span className="marca">VizinhoLava</span>
      </header>
      <main className="hero">
        <h1>Olá, {displayName(session)}!</h1>
        <p className="sub">Em breve: agendar alguém para lavar a sua louça.</p>
        <button className="secundario" type="button" onClick={sair}>Sair</button>
      </main>
    </div>
  )
}
