import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AvisoCompartilhamento } from '../components/AvisoCompartilhamento'
import { Botao, BotaoLink, Campo, Cartao, Formulario, GrupoBotoes, Mensagem, Nota, Pagina, Tag, Titulo } from '../components/ui'
import { signOut, updatePerfilPrestador } from '../lib/localAuth'
import { codificar } from '../lib/linkPrestador'
import { formatPhone, normalizePhone } from '../lib/phone'
import { ROTAS } from '../lib/rotas'
import { ORCAMENTO, reais } from '../lib/precos'
import { listarPedidos } from '../lib/pedidos'
import { listarServicos } from '../lib/servicos'

/** Área do PRESTADOR (quem vai lavar). */
export default function Prestador() {
  const session = useAuth()
  const navigate = useNavigate()
  const [editando, setEditando] = useState(false)
  const [regiao, setRegiao] = useState(session?.perfil?.regiao ?? '')
  const [whats, setWhats] = useState(session?.perfil ? formatPhone(session.perfil.whatsapp) : '')
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [pedidos] = useState(() => listarPedidos())
  const [servicos] = useState(() => listarServicos())

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
      <Titulo sub="Sua área de prestador · Água Verde e região.">Olá, {session.name}!</Titulo>
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
          <li>Divulgue o seu link (condomínio, grupo do prédio, QR no elevador).</li>
          <li>O cliente tira a foto da louça; a IA local sugere um valor base entre {reais(ORCAMENTO.minCentavos)} e {reais(ORCAMENTO.maxCentavos)}.</li>
          <li>O pedido chega no seu WhatsApp ({formatPhone(perfil.whatsapp)}) com a sugestão.</li>
          <li>Combine o Pix <strong>antes</strong> de ir. No local, confirme o valor — a foto não mostra gordura queimada.</li>
          <li>Na tela <strong>Confirmar serviço</strong>, ajuste a base, marque produtos que levou e feche o total.</li>
        </ol>
        <label className="form">
          <span>Seu link de pedidos</span>
          <input readOnly value={link} onFocus={(e) => e.target.select()} aria-label="Seu link de pedidos" />
        </label>
        <div className="acoes" style={{ marginTop: 12 }}>
          <Botao onClick={copiar}>{copiado ? 'Link copiado!' : 'Copiar link'}</Botao>
        </div>
      </Cartao>

      <Cartao titulo="Confirmar serviço no local" destaque="resumo">
        <p>Chegou na casa? Confirme o valor base (R$ 20–30), registre produtos usados e feche o total.</p>
        <BotaoLink to={ROTAS.contagemPrestador} data-testid="ir-contagem">Abrir confirmação no local →</BotaoLink>
      </Cartao>

      <Cartao titulo="Histórico neste aparelho">
        {pedidos.length === 0 && servicos.length === 0 ? (
          <Nota>Ainda não há pedidos nem serviços fechados neste aparelho.</Nota>
        ) : (
          <ul className="historico">
            {pedidos.slice(0, 10).map((p) => (
              <li key={p.id}>
                <div>
                  <strong>Pedido {p.id}</strong> <Tag>{p.status}</Tag>
                  <small>{p.nomeCliente ?? formatPhone(p.telefone)} · {new Date(p.criadoEm).toLocaleString('pt-BR')}</small>
                </div>
                <span>{reais(p.finalCentavos ?? p.total)}</span>
              </li>
            ))}
            {servicos.slice(0, 10).map((s) => (
              <li key={`s-${s.id}`}>
                <div>
                  <strong>Serviço {s.id}</strong> <Tag>concluído</Tag>
                  <small>{new Date(s.criadoEm).toLocaleString('pt-BR')}</small>
                </div>
                <span>{reais(s.total)}</span>
              </li>
            ))}
          </ul>
        )}
        <BotaoLink variante="topo" to={ROTAS.comoFunciona}>Ver como o preço funciona →</BotaoLink>
      </Cartao>
    </Pagina>
  )
}
