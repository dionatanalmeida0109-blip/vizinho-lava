import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { requestReset, signIn, signOut, signUp, type Role } from '../lib/localAuth'
import { AREA, LOGIN, MENSAGEM_COMPARTILHAMENTO, chaveBloqueio } from '../lib/rotas'
import { formatPhone, normalizePhone } from '../lib/phone'
import { clearFailures, lockMessage, lockRemaining, registerFailure } from '../lib/loginLimiter'

type Modo = 'entrar' | 'criar' | 'esqueci'

const titulos: Record<Modo, string> = { entrar: 'Entrar', criar: 'Criar conta', esqueci: 'Trocar senha' }

const nomePapel: Record<Role, string> = { cliente: 'Cliente', prestador: 'Prestador' }

export default function Login({ papel = 'cliente' }: { papel?: Role }) {
  const session = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState<Modo>('entrar')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [regiao, setRegiao] = useState('')
  const [mesmoWhats, setMesmoWhats] = useState(true)
  const [whats, setWhats] = useState('')
  const [concordo, setConcordo] = useState(false)
  const prestador = papel === 'prestador'

  if (session && session.role === papel) return <Navigate to={AREA[papel]} replace />
  if (session)
    return (
      <div className="pagina">
        <header className="topo"><Link to="/" className="marca">VizinhoLava</Link></header>
        <main className="login">
          <h1>Você já está conectado</h1>
          <p className="sub">
            {session.name} ({formatPhone(session.phone)}) está como <strong>{nomePapel[session.role]}</strong>.
            Para entrar como {nomePapel[papel].toLowerCase()}, saia primeiro.
          </p>
          <div className="acoes">
            <Link className="cta" to={AREA[session.role]}>Continuar como {nomePapel[session.role].toLowerCase()}</Link>
            <button className="secundario" type="button" onClick={signOut}>Sair</button>
          </div>
        </main>
      </div>
    )

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
    let whatsapp = phone
    if (modo === 'criar' && prestador) {
      if (!regiao.trim()) return setErro('Informe a região de atendimento (bairro e cidade).')
      if (!mesmoWhats) {
        const w = normalizePhone(whats)
        if (!w) return setErro('WhatsApp inválido. Use um celular com DDD: (41) 99876-5432.')
        whatsapp = w
      }
      if (!concordo) return setErro('Confirme que entendeu como funciona o compartilhamento de serviço.')
    }
    const chave = chaveBloqueio(papel, phone)
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')

    if (modo === 'entrar') {
      const restante = lockRemaining(chave)
      if (restante > 0) return setErro(lockMessage(restante))
    }

    setEnviando(true)
    try {
      if (modo === 'entrar') {
        const r = await signIn(papel, phone, senha)
        if (!r.ok) {
          const { lockMs, left } = registerFailure(chave)
          return setErro(lockMs ? lockMessage(lockMs) : `Telefone ou senha incorretos. Restam ${left} tentativa${left > 1 ? 's' : ''}.`)
        }
        clearFailures(chave)
        navigate(AREA[papel], { replace: true })
      } else if (modo === 'criar') {
        const r = await signUp(papel, nome, phone, senha, prestador ? { regiao, whatsapp } : undefined)
        if (!r.ok) return setErro('Esse telefone já tem conta. Use "Entrar".')
        navigate(AREA[papel], { replace: true })
      } else {
        const r = await requestReset(papel, phone, senha)
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
        <nav className="papeis" aria-label="Tipo de conta">
          {(['cliente', 'prestador'] as Role[]).map((r) => (
            <Link key={r} to={LOGIN[r]} className={r === papel ? 'ativo' : ''} aria-current={r === papel ? 'page' : undefined}>
              {r === 'cliente' ? 'Sou cliente' : 'Sou prestador'}
            </Link>
          ))}
        </nav>
        <h1>{titulos[modo]} <small className="tag">{nomePapel[papel]}</small></h1>
        <p className="sub-p">
          {prestador ? 'Para quem vai até a casa do vizinho lavar a louça.' : 'Para quem quer pedir a lavagem da louça.'}
        </p>
        {modo === 'criar' && prestador && (
          <div className="compartilhamento" role="note">
            <strong>Compartilhamento de serviço</strong>
            <p>{MENSAGEM_COMPARTILHAMENTO}</p>
          </div>
        )}
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
          {modo === 'criar' && prestador && (
            <>
              <label>
                Região de atendimento
                <input value={regiao} onChange={(e) => setRegiao(e.target.value)} placeholder="Ex.: Água Verde, Curitiba" required />
              </label>
              <label className="check">
                <input type="checkbox" checked={mesmoWhats} onChange={(e) => setMesmoWhats(e.target.checked)} />
                Recebo os pedidos no WhatsApp deste mesmo celular
              </label>
              {!mesmoWhats && (
                <label>
                  WhatsApp que recebe os pedidos
                  <input type="tel" inputMode="tel" placeholder="+55 (41) 99876-5432" value={whats} onChange={(e) => setWhats(e.target.value)} required />
                </label>
              )}
            </>
          )}
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
          {modo === 'criar' && prestador && (
            <label className="check">
              <input type="checkbox" checked={concordo} onChange={(e) => setConcordo(e.target.checked)} />
              Entendi: é compartilhamento de serviço e o pagamento é combinado antes, não depois.
            </label>
          )}
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
