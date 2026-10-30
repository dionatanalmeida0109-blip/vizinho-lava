import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { nameToEmail, normalizeName } from '../lib/authName'
import { useAuth } from '../auth/AuthContext'
import { clearFailures, lockMessage, lockRemaining, registerFailure } from '../lib/loginLimiter'
import { SemConfig } from '../components/SemConfig'

function traduzErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'Nome ou senha incorretos.'
  if (/already registered|already exists/i.test(msg)) return 'Esse nome já tem conta. Use "Entrar".'
  if (/password/i.test(msg)) return 'Senha inválida (mínimo de 6 caracteres).'
  if (/email not confirmed/i.test(msg)) return 'Conta criada, mas a confirmação de e-mail está ativa no Supabase. Desative-a.'
  return msg
}

export default function Login() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (session) return <Navigate to="/home" replace />

  // Entrar: signIn. Criar conta: signUp com o mesmo nome+senha (nome vai em user_metadata.name).
  async function enviar(modo: 'entrar' | 'criar', e?: FormEvent) {
    e?.preventDefault()
    if (!supabase) return
    setErro(null)
    setAviso(null)
    if (!normalizeName(nome)) return setErro('Digite seu nome.')
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')

    const chave = normalizeName(nome)
    if (modo === 'entrar') {
      const restante = lockRemaining(chave)
      if (restante > 0) return setErro(lockMessage(restante))
    }

    setEnviando(true)
    const email = nameToEmail(nome)
    const { data, error } =
      modo === 'entrar'
        ? await supabase.auth.signInWithPassword({ email, password: senha })
        : await supabase.auth.signUp({ email, password: senha, options: { data: { name: nome.trim() } } })
    setEnviando(false)

    if (error) {
      // Só falhas de "Entrar" (senha/nome errados) contam para o bloqueio.
      if (modo === 'entrar' && /invalid login credentials/i.test(error.message)) {
        const { lockMs, left } = registerFailure(chave)
        if (lockMs) return setErro(lockMessage(lockMs))
        return setErro(`${traduzErro(error.message)} Restam ${left} tentativa${left > 1 ? 's' : ''}.`)
      }
      return setErro(traduzErro(error.message))
    }
    if (modo === 'entrar') clearFailures(chave)
    if (data.session) navigate('/home', { replace: true })
    else setAviso('Conta criada. Confirme o e-mail no Supabase ou desative a confirmação para entrar.')
  }

  return (
    <div className="pagina">
      <header className="topo">
        <Link to="/" className="marca">VizinhoLava</Link>
      </header>
      <main className="login">
        <h1>Entrar</h1>
        {!supabase ? (
          <SemConfig />
        ) : (
          <form className="form" onSubmit={(e) => enviar('entrar', e)}>
            <label>
              Nome
              <input value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="username" required />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {erro && <p className="erro" role="alert">{erro}</p>}
            {aviso && <p className="aviso" role="status">{aviso}</p>}
            <button className="cta" type="submit" disabled={enviando}>
              {enviando ? 'Aguarde…' : 'Entrar'}
            </button>
            <button className="secundario" type="button" disabled={enviando} onClick={() => enviar('criar')}>
              Criar conta
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
