import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AvisoCompartilhamento } from '../components/AvisoCompartilhamento'
import { Botao, BotaoLink, Campo, Cartao, Formulario, GrupoBotoes, Mensagem, Pagina, Titulo } from '../components/ui'
import { signOut, updatePerfilPrestador } from '../lib/localAuth'
import { codificar } from '../lib/linkPrestador'
import { formatPhone, normalizePhone } from '../lib/phone'
import { ROTAS } from '../lib/rotas'
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

  if (!session) return <Navigate to={ROTAS.loginPrestador} replace />
  if (session.role !== 'prestador') return <Navigate to={ROTAS.orcamento} replace />
  const perfil = session.perfil ?? { regiao: '', whatsapp: session.phone }

  const link = `${window.location.origin}${ROTAS.linkPrestador(codificar({ nome: session.name, regiao: perfil.regiao, whatsapp: perfil.whatsapp }))}`

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

  function sair() {
    signOut()
    navigate(ROTAS.loginPrestador, { replace: true })
  }

  return (
    <Pagina largura="larga" tag="Prestador" direita={<Botao variante="texto" onClick={sair}>Sair</Botao>}>
      <Titulo sub="Sua área de prestador.">Olá, {session.name}!</Titulo>
      <AvisoCompartilhamento />

      <Cartao titulo="Meu perfil">
        {!editando ? (
          <>
            <dl className="perfil">
              <dt>Nome</dt><dd>{session.name}</dd>
              <dt>Telefone</dt><dd>{formatPhone(session.phone)}</dd>
              <dt>Região de atendimento</dt><dd>{perfil.regiao || '—'}</dd>
              <dt>WhatsApp dos pedidos</dt><dd>{formatPhone(perfil.whatsapp)}</dd>
            </dl>
            <Botao variante="secundario" onClick={() => setEditando(true)}>Editar região e WhatsApp</Botao>
          </>
        ) : (
          <Formulario onSubmit={salvar}>
            <Campo rotulo="Região de atendimento" value={regiao} onChange={(e) => setRegiao(e.target.value)} required />
            <Campo rotulo="WhatsApp dos pedidos" type="tel" inputMode="tel" value={whats} onChange={(e) => setWhats(e.target.value)} required />
            <Mensagem tipo="erro">{erro}</Mensagem>
            <GrupoBotoes>
              <Botao type="submit">Salvar</Botao>
              <Botao variante="secundario" onClick={() => setEditando(false)}>Cancelar</Botao>
            </GrupoBotoes>
          </Formulario>
        )}
      </Cartao>

      <Cartao titulo="Como os pedidos chegam até você">
        <ol className="fluxo">
          <li>Divulgue o seu link (no condomínio, no grupo do prédio, num QR code no elevador).</li>
          <li>O cliente abre o link, entra como cliente, tira a foto da louça e monta o orçamento.</li>
          <li>O pedido é encaminhado para o seu WhatsApp ({formatPhone(perfil.whatsapp)}) com os itens e o valor base.</li>
          <li>O valor do pedido é um <strong>orçamento estimado</strong> (pela foto). Combine a forma de pagamento (Pix) <strong>antes</strong> de ir.</li>
          <li>Depois de lavar, conte as peças lavadas na tela <strong>Contagem pós-lavagem</strong>: o app soma pela tabela e fecha o valor final.</li>
        </ol>
        <label className="form">
          <span>Seu link de pedidos</span>
          <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Seu link de pedidos" />
        </label>
        <div className="acoes" style={{ marginTop: 12 }}>
          <Botao onClick={copiar}>{copiado ? 'Link copiado!' : 'Copiar link'}</Botao>
        </div>
      </Cartao>

      <Cartao titulo="Contagem pós-lavagem" destaque="resumo">
        <p>Terminou de lavar? Marque quantas peças de cada item foram lavadas e o app calcula o valor final pela tabela.</p>
        <BotaoLink to={ROTAS.contagemPrestador} data-testid="ir-contagem">Abrir contagem pós-lavagem →</BotaoLink>
      </Cartao>

      <Cartao titulo="Tabela que o cliente vê">
        <ul className="bases">
          {UTENSILIOS.map((u) => (
            <li key={u}>
              <strong>{PRECOS[u].nome}</strong>
              <span className="preco">{u === 'panela' ? `a partir de ${reais(PRECOS[u].centavos)}` : reais(PRECOS[u].centavos)}</span>
            </li>
          ))}
        </ul>
        <BotaoLink variante="topo" to={ROTAS.comoFunciona}>Ver a tabela completa (churrasco e serviços à parte) →</BotaoLink>
      </Cartao>
    </Pagina>
  )
}
