import { useState, type FormEvent } from 'react'
import { checkDevPassword, decideReset, devPasswordIsSet, listResets, setDevPassword } from '../lib/localAuth'
import { formatPhone } from '../lib/phone'

/** Tela oculta do desenvolvedor (/dev/resets): aprova ou nega pedidos de troca de senha. Não há link para ela no app. */
export default function DevResets() {
  const [liberado, setLiberado] = useState(false)
  const [primeiroAcesso] = useState(() => !devPasswordIsSet())
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [pedidos, setPedidos] = useState(listResets)

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    if (primeiroAcesso) {
      if (senha.length < 8) return setErro('Defina uma senha de desenvolvedor com pelo menos 8 caracteres.')
      await setDevPassword(senha)
    } else if (!(await checkDevPassword(senha))) {
      return setErro('Senha de desenvolvedor incorreta.')
    }
    setSenha('')
    setPedidos(listResets())
    setLiberado(true)
  }

  function decidir(id: string, aprovar: boolean) {
    decideReset(id, aprovar)
    setPedidos(listResets())
  }

  if (!liberado)
    return (
      <div className="pagina">
        <main className="login">
          <h1>Área do desenvolvedor</h1>
          {primeiroAcesso && <p className="sub">Primeiro acesso neste navegador: defina a senha do desenvolvedor.</p>}
          <form className="form" onSubmit={entrar}>
            <label>
              Senha do desenvolvedor
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="off" required />
            </label>
            {erro && <p className="erro" role="alert">{erro}</p>}
            <button className="cta" type="submit">{primeiroAcesso ? 'Definir e entrar' : 'Entrar'}</button>
          </form>
        </main>
      </div>
    )

  const fmt = (t: number) => new Date(t).toLocaleString('pt-BR')
  const rotulo = { pending: 'Pendente', approved: 'Aprovado', denied: 'Negado' } as const

  return (
    <div className="pagina">
      <main>
        <h1>Pedidos de troca de senha</h1>
        {pedidos.length === 0 && <p className="sub">Nenhum pedido.</p>}
        <ul className="pedidos">
          {pedidos.map((p) => (
            <li key={p.id} className={`pedido ${p.status}`}>
              <div>
                <strong>{p.name}</strong> · {formatPhone(p.phone)}
                <br />
                <small>
                  {fmt(p.requestedAt)} · {rotulo[p.status]}
                  {p.decidedAt ? ` em ${fmt(p.decidedAt)}` : ''}
                </small>
              </div>
              {p.status === 'pending' && (
                <div className="acoes">
                  <button className="cta" type="button" onClick={() => decidir(p.id, true)}>Aprovar</button>
                  <button className="secundario" type="button" onClick={() => decidir(p.id, false)}>Negar</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
