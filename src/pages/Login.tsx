import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { requestReset, signIn, signUp } from '../lib/localAuth'
import { normalizePhone } from '../lib/phone'
import { clearFailures, lockMessage, lockRemaining, registerFailure } from '../lib/loginLimiter'

type Modo = 'entrar' | 'criar' | 'esqueci'

const titulos: Record<Modo, string> = { entrar: 'Entrar', criar: 'Criar conta', esqueci: 'Trocar senha' }

export default function Login() {
  const session = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState<Modo>('entrar')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (session) return <Navigate to="/home" replace />

  function trocar(m: Modo) {
    setModo(m)
    setErro(null)
    setAviso(null)
    setSenha('')
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setAviso(null)
    const phone = normalizePhone(telefone)
    if (!phone) return setErro('Telefone inválido. Use um celular com DDD: (41) 99876-5432.')
    if (modo === 'criar' && !nome.trim()) return setErro('Digite seu nome.')
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')

    if (modo === 'entrar') {
      const restante = lockRemaining(phone)
      if (restante > 0) return setErro(lockMessage(restante))
    }

    setEnviando(true)
    try {
      if (modo === 'entrar') {
        const r = await signIn(phone, senha)
        if (!r.ok) {
          const { lockMs, left } = registerFailure(phone)
          return setErro(lockMs ? lockMessage(lockMs) : `Telefone ou senha incorretos. Restam ${left} tentativa${left > 1 ? 's' : ''}.`)
        }
        clearFailures(phone)
        navigate('/home', { replace: true })
      } else if (modo === 'criar') {
        const r = await signUp(nome, phone, senha)
        if (!r.ok) return setErro('Esse telefone já tem conta. Use "Entrar".')
        navigate('/home', { replace: true })
      } else {
        const r = await requestReset(phone, senha)
        if (!r.ok)
          return setErro(r.reason === 'pending' ? 'Já existe um pedido aguardando aprovação para esse telefone.' : 'Telefone não cadastrado.')
        setAviso('Pedido enviado. Sua senha atual continua valendo até o pedido ser aprovado.')
        setSenha('')
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="pagina">
      <header className="topo">
        <Link to="/" className="marca">VizinhoLava</Link>
      </header>
      <main className="login">
        <h1>{titulos[modo]}</h1>
        <form className="form" onSubmit={enviar}>
          {modo === 'criar' && (
            <label>
              Nome
              <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" required />
            </label>
          )}
          <label>
            Celular
            <input
              type="tel"
              inputMode="tel"
              placeholder="+55 (41) 99876-5432"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              autoComplete="tel"
              required
            />
          </label>
          <label>
            {modo === 'esqueci' ? 'Nova senha' : 'Senha'}
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
              required
            />
          </label>
          {erro && <p className="erro" role="alert">{erro}</p>}
          {aviso && <p className="aviso" role="status">{aviso}</p>}
          <button className="cta" type="submit" disabled={enviando}>
            {enviando ? 'Aguarde…' : modo === 'esqueci' ? 'Pedir troca de senha' : titulos[modo]}
          </button>
        </form>
        <nav className="trocas">
          {modo !== 'entrar' && <button type="button" className="link" onClick={() => trocar('entrar')}>Já tenho conta</button>}
          {modo !== 'criar' && <button type="button" className="link" onClick={() => trocar('criar')}>Criar conta</button>}
          {modo !== 'esqueci' && <button type="button" className="link" onClick={() => trocar('esqueci')}>Esqueci a senha</button>}
        </nav>
      </main>
    </div>
  )
}
