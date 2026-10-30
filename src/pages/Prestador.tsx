import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { signOut, updatePerfilPrestador } from '../lib/localAuth'
import { codificar } from '../lib/linkPrestador'
import { formatPhone, normalizePhone } from '../lib/phone'
import { MENSAGEM_COMPARTILHAMENTO } from '../lib/rotas'
import { PRECOS, UTENSILIOS, reais } from '../lib/precos'

/** Área do PRESTADOR (quem vai lavar). */
export default function Prestador() {
  const session = useAuth()
  const navigate = useNavigate()
  const [editando, setEditando] = useState(false)
  const [regiao, setRegiao] = useState(session?.perfil?.regiao ?? '')
  const [whats, setWhats] = useState(session?.perfil ? formatPhone(session.perfil.whatsapp) : '')
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  if (!session) return <Navigate to="/prestador/login" replace />
  if (session.role !== 'prestador') return <Navigate to="/home" replace />
  const perfil = session.perfil ?? { regiao: '', whatsapp: session.phone }

  const link = `${window.location.origin}/p/${codificar({ nome: session.name, regiao: perfil.regiao, whatsapp: perfil.whatsapp })}`

  function salvar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    const w = normalizePhone(whats)
    if (!w) return setErro('WhatsApp inválido. Use um celular com DDD.')
    if (!regiao.trim()) return setErro('Informe a região de atendimento.')
    updatePerfilPrestador(session!.phone, { regiao, whatsapp: w })
    setEditando(false)
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      window.prompt('Copie o seu link:', link)
    }
  }

  return (
    <div className="pagina">
      <header className="topo">
        <span className="marca">VizinhoLava <small className="tag">Prestador</small></span>
        <button className="link" type="button" onClick={() => { signOut(); navigate('/prestador/login', { replace: true }) }}>Sair</button>
      </header>
      <main className="orcamento">
        <h1>Olá, {session.name}!</h1>
        <p className="sub">Sua área de prestador.</p>

        <div className="compartilhamento" role="note">
          <strong>Compartilhamento de serviço</strong>
          <p>{MENSAGEM_COMPARTILHAMENTO}</p>
        </div>

        <section className="cartao">
          <h2>Meu perfil</h2>
          {!editando ? (
            <>
              <dl className="perfil">
                <dt>Nome</dt><dd>{session.name}</dd>
                <dt>Telefone</dt><dd>{formatPhone(session.phone)}</dd>
                <dt>Região de atendimento</dt><dd>{perfil.regiao || '—'}</dd>
                <dt>WhatsApp dos pedidos</dt><dd>{formatPhone(perfil.whatsapp)}</dd>
              </dl>
              <button className="secundario" type="button" onClick={() => setEditando(true)}>Editar região e WhatsApp</button>
            </>
          ) : (
            <form className="form" onSubmit={salvar}>
              <label>Região de atendimento<input value={regiao} onChange={(e) => setRegiao(e.target.value)} required /></label>
              <label>WhatsApp dos pedidos<input type="tel" inputMode="tel" value={whats} onChange={(e) => setWhats(e.target.value)} required /></label>
              {erro && <p className="erro" role="alert">{erro}</p>}
              <div className="acoes">
                <button className="cta" type="submit">Salvar</button>
                <button className="secundario" type="button" onClick={() => setEditando(false)}>Cancelar</button>
              </div>
            </form>
          )}
        </section>

        <section className="cartao">
          <h2>Como os pedidos chegam até você</h2>
          <ol className="fluxo">
            <li>Divulgue o seu link (no condomínio, no grupo do prédio, num QR code no elevador).</li>
            <li>O cliente abre o link, entra como cliente, tira a foto da louça e monta o orçamento.</li>
            <li>O pedido é encaminhado para o seu WhatsApp ({formatPhone(perfil.whatsapp)}) com os itens e o valor base.</li>
            <li>Combine o valor e o pagamento (Pix) <strong>antes</strong> de ir. No local, confira as peças — a foto não mostra gordura queimada no fundo da panela.</li>
          </ol>
          <label className="form">
            <span>Seu link de pedidos</span>
            <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Seu link de pedidos" />
          </label>
          <div className="acoes" style={{ marginTop: 12 }}>
            <button className="cta" type="button" onClick={copiar}>{copiado ? 'Link copiado!' : 'Copiar link'}</button>
          </div>
        </section>

        <section className="cartao">
          <h2>Tabela que o cliente vê</h2>
          <ul className="bases">
            {UTENSILIOS.map((u) => (
              <li key={u}>
                <strong>{PRECOS[u].nome}</strong>
                <span className="preco">{u === 'panela' ? `a partir de ${reais(PRECOS[u].centavos)}` : reais(PRECOS[u].centavos)}</span>
              </li>
            ))}
          </ul>
          <Link className="link-topo" to="/como-funciona">Ver a tabela completa (churrasco e serviços à parte) →</Link>
        </section>
      </main>
    </div>
  )
}
