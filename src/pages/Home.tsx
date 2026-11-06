import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  Apoio, Botao, BotaoExterno, Cartao, LinhaValor, Marcar, Nota, Pagina, Tag, Titulo,
} from '../components/ui'
import { ExplicacaoPreco } from '../components/ExplicacaoPreco'
import { signOut } from '../lib/localAuth'
import { formatPhone } from '../lib/phone'
import { estimarOrcamento, type EstimativaOrcamento } from '../lib/estimativa'
import { fotoComoBlob, fotoGuardada, guardarFoto, prepararFoto } from '../lib/foto'
import { esquecerPrestador, linkWhatsApp, prestadorEscolhido } from '../lib/linkPrestador'
import {
  LISTA_PRODUTOS, ORCAMENTO, PRODUTOS,
  reais, subtotalProdutos, type Produto,
} from '../lib/precos'
import { listarPedidos, registrarPedido, type Pedido } from '../lib/pedidos'
import { listarServicos } from '../lib/servicos'
import { ROTAS } from '../lib/rotas'

export default function Home() {
  const session = useAuth()
  const navigate = useNavigate()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galeriaRef = useRef<HTMLInputElement>(null)
  const resumoRef = useRef<HTMLDivElement>(null)
  const [foto, setFoto] = useState<string | null>(fotoGuardada)
  const [anexando, setAnexando] = useState(false)
  const [erroFoto, setErroFoto] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [estimativa, setEstimativa] = useState<EstimativaOrcamento | null>(null)
  const [baseManual, setBaseManual] = useState<number | null>(null)
  const [semProdutos, setSemProdutos] = useState(false)
  const [produtos, setProdutos] = useState<Record<Produto, boolean>>({ detergente: true, esponja: true })
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [prestador, setPrestador] = useState(prestadorEscolhido)
  const [historico, setHistorico] = useState(() => listarPedidos())
  const [servicos, setServicos] = useState(() => listarServicos())

  useEffect(() => { guardarFoto(foto) }, [foto])

  if (!session) return <Navigate to={ROTAS.loginCliente} replace />
  if (session.role === 'prestador') return <Navigate to={ROTAS.areaPrestador} replace />

  function sair() {
    guardarFoto(null)
    signOut()
    navigate(ROTAS.loginCliente, { replace: true })
  }

  async function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setAnexando(true)
    setErroFoto(null)
    try {
      setFoto(await prepararFoto(arquivo))
      setEstimativa(null)
      setBaseManual(null)
      setPedido(null)
    } catch {
      setErroFoto('Não consegui abrir essa foto. Tente outra ou escolha da galeria.')
    } finally {
      setAnexando(false)
      e.target.value = ''
    }
  }

  async function analisarFoto() {
    if (!foto) return
    setAnalisando(true)
    setErroFoto(null)
    try {
      const est = await estimarOrcamento(await fotoComoBlob(foto))
      setEstimativa(est)
      setBaseManual(est.baseCentavos)
      setPedido(null)
    } catch {
      setEstimativa(null)
      setErroFoto('Não deu para analisar essa foto. Escolha o volume abaixo ou tente outra.')
    } finally {
      setAnalisando(false)
      requestAnimationFrame(() => resumoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  function removerFoto() {
    setFoto(null)
    setEstimativa(null)
    setBaseManual(null)
    setErroFoto(null)
  }

  function escolherVolume(v: keyof typeof ORCAMENTO.volumes) {
    const centavos = ORCAMENTO.volumes[v].centavos
    setBaseManual(centavos)
    setEstimativa((e) => e ? { ...e, baseCentavos: centavos, volume: v, rotulo: ORCAMENTO.volumes[v].rotulo } : {
      baseCentavos: centavos,
      volume: v,
      rotulo: ORCAMENTO.volumes[v].rotulo,
      contagem: { prato: 0, copo: 0, talher: 0, panela: 0 },
      densidade: 0,
    })
    setPedido(null)
  }

  const base = baseManual ?? estimativa?.baseCentavos ?? 0
  const taxas = semProdutos ? subtotalProdutos(produtos) : 0
  const total = base + taxas
  const produtosMarcados = semProdutos ? LISTA_PRODUTOS.filter((p) => produtos[p]) : []

  function textoPedido() {
    const linhas = [
      'Olá! Pedido de lavagem de louça pelo VizinhoLava.',
      `Cliente: ${session!.name} (${formatPhone(session!.phone)})`,
      '',
      `Sugestão de valor base (IA local): ${reais(base)}${estimativa ? ` · ${estimativa.rotulo}` : ''}`,
      'Faixa natural: R$ 20 a R$ 30. O lavador confirma no local.',
    ]
    if (produtosMarcados.length) {
      linhas.push(`Produtos do lavador: ${produtosMarcados.map((p) => `${PRODUTOS[p].nome} ${reais(PRODUTOS[p].centavos)}`).join(', ')}`)
    }
    linhas.push('', `Total estimado: ${reais(total)}`, 'Pagamento via Pix, combinado antes, fora do app.')
    return linhas.join('\n')
  }

  function solicitarPrestador() {
    if (base < ORCAMENTO.minCentavos) return
    const texto = textoPedido()
    const novo = registrarPedido({
      telefone: session!.phone,
      nomeCliente: session!.name,
      baseCentavos: base,
      total,
      volume: estimativa?.volume,
      produtos: produtosMarcados,
      texto,
    })
    setPedido(novo)
    setHistorico(listarPedidos())
    if (prestador) window.open(linkWhatsApp(prestador.whatsapp, texto), '_blank', 'noopener')
  }

  return (
    <Pagina largura="larga" direita={<Botao variante="texto" onClick={sair}>Sair</Botao>}>
      <Titulo sub={<>{formatPhone(session.phone)} · Tire a foto da pia e receba a sugestão de orçamento.</>}>
        Olá, {session.name}!
      </Titulo>
      <Link className="banner" to={ROTAS.comoFunciona}>
        <strong>Como funciona o preço</strong>
        <span>Base R$ 20–30 · IA sugere · lavador confirma →</span>
      </Link>

      <Cartao titulo="1. Foto da louça">
        <Apoio>Encaminhe a foto para um orçamento estimado. A análise roda só no seu aparelho.</Apoio>
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={aoEscolherFoto} data-testid="foto" />
        <input ref={galeriaRef} type="file" accept="image/*" hidden onChange={aoEscolherFoto} data-testid="foto-galeria" />
        <div className="acoes-foto">
          <Botao variante={foto ? 'secundario' : 'primario'} onClick={() => cameraRef.current?.click()} disabled={anexando || analisando}>
            📷 {foto ? 'Tirar outra foto' : 'Tirar foto da louça'}
          </Botao>
          <Botao variante="secundario" onClick={() => galeriaRef.current?.click()} disabled={anexando || analisando}>
            🖼️ Escolher da galeria
          </Botao>
        </div>
        {anexando && <Nota>Anexando foto…</Nota>}
        {foto && (
          <div className="foto-anexada" data-testid="foto-anexada">
            <img className="preview" src={foto} alt="Foto da louça anexada" />
            <div className="acoes-foto">
              <Botao onClick={analisarFoto} disabled={analisando} data-testid="analisar">
                {analisando ? 'Analisando…' : '✨ Analisar e sugerir preço'}
              </Botao>
              <Botao variante="texto" onClick={removerFoto} disabled={analisando}>Remover foto</Botao>
            </div>
          </div>
        )}
        {erroFoto && <Nota>{erroFoto}</Nota>}
        {analisando && <Nota>Estimando volume e valor base…</Nota>}
        <p className="aviso-ia">
          <strong>Sugestão local</strong> (sem enviar a foto). O lavador confirma no local —
          a foto não mostra gordura queimada no fundo da panela.
        </p>
      </Cartao>

      <ExplicacaoPreco />

      <Cartao titulo="2. Volume e valor base">
        <Apoio>Escolha o volume se preferir sem foto, ou ajuste depois da análise.</Apoio>
        <div className="volumes" role="group" aria-label="Volume da louça">
          {(Object.keys(ORCAMENTO.volumes) as Array<keyof typeof ORCAMENTO.volumes>).map((v) => (
            <button
              key={v}
              type="button"
              className={`volume ${base === ORCAMENTO.volumes[v].centavos ? 'ativo' : ''}`}
              onClick={() => escolherVolume(v)}
              data-testid={`volume-${v}`}
            >
              <strong>{ORCAMENTO.volumes[v].rotulo}</strong>
              <span>{reais(ORCAMENTO.volumes[v].centavos)}</span>
            </button>
          ))}
        </div>
        {estimativa && (
          <Nota>
            IA sugeriu <strong>{reais(estimativa.baseCentavos)}</strong> ({estimativa.rotulo}).
            Você pode trocar o chip acima; o lavador ainda valida no local.
          </Nota>
        )}
      </Cartao>

      <Cartao titulo="3. Produtos de limpeza">
        <Marcar checked={semProdutos} onChange={(v) => { setSemProdutos(v); setPedido(null) }}>
          Não tenho os produtos adequados — o lavador leva os seus e cobra pela utilização.
        </Marcar>
        {semProdutos && (
          <ul className="taxas">
            {LISTA_PRODUTOS.map((p) => (
              <li key={p}>
                <Marcar
                  checked={produtos[p]}
                  onChange={(v) => { setProdutos((s) => ({ ...s, [p]: v })); setPedido(null) }}
                >
                  {PRODUTOS[p].nome}
                </Marcar>
                <span>{reais(PRODUTOS[p].centavos)}</span>
              </li>
            ))}
          </ul>
        )}
        {!semProdutos && (
          <Nota>
            Tabela: {LISTA_PRODUTOS.map((p) => `${PRODUTOS[p].nome} ${reais(PRODUTOS[p].centavos)}`).join(' · ')}.
            Só cobra se o lavador levar.
          </Nota>
        )}
      </Cartao>

      <div ref={resumoRef} className="ancora-resumo" data-testid="resumo">
        <Cartao titulo="Orçamento estimado" destaque="resumo" aria-live="polite">
          {base > 0 ? (
            <>
              <LinhaValor rotulo={`Valor base${estimativa ? ` · ${estimativa.rotulo}` : ''}`}>
                {reais(base)}
              </LinhaValor>
              {taxas > 0 && <LinhaValor rotulo="Produtos do lavador">{reais(taxas)}</LinhaValor>}
              <LinhaValor rotulo="Total estimado" total testId="total">{reais(total)}</LinhaValor>
              <Nota>
                Sugestão da IA / do volume escolhido. O lavador confirma o valor no local
                (faixa natural {reais(ORCAMENTO.minCentavos)}–{reais(ORCAMENTO.maxCentavos)}).
              </Nota>
              <Nota>Pagamento (Pix) combinado <strong>antes</strong> do serviço, fora do app.</Nota>
            </>
          ) : (
            <Nota>Analise a foto ou escolha um volume para ver o orçamento.</Nota>
          )}

          {!pedido ? (
            <Botao
              className="solicitar"
              data-testid="solicitar"
              disabled={base < ORCAMENTO.minCentavos}
              onClick={solicitarPrestador}
            >
              {prestador ? `Solicitar prestador (${prestador.nome.split(' ')[0]})` : 'Solicitar prestador'}
            </Botao>
          ) : (
            <div className="pedido-ok" data-testid="pedido-ok" role="status">
              <strong>Pedido {pedido.id}: {reais(pedido.total)}</strong>
              <span>
                {prestador
                  ? `Encaminhamos para ${prestador.nome} (${prestador.regiao}) no WhatsApp.`
                  : 'Pedido guardado neste aparelho. Abra o link do prestador da região para encaminhar.'}
                {' '}No local, o lavador confirma o valor base e os produtos usados.
              </span>
              <Botao variante="texto" onClick={() => setPedido(null)}>Alterar orçamento</Botao>
            </div>
          )}

          {prestador ? (
            <div className="enviar">
              <BotaoExterno href={linkWhatsApp(prestador.whatsapp, textoPedido())} target="_blank" rel="noreferrer">
                Enviar pedido para {prestador.nome.split(' ')[0]} no WhatsApp
              </BotaoExterno>
              <small>
                {prestador.nome} · {prestador.regiao} ·{' '}
                <Botao variante="texto" onClick={() => { esquecerPrestador(); setPrestador(null) }}>trocar prestador</Botao>
              </small>
            </div>
          ) : (
            <Nota>Para encaminhar, abra o link de pedidos do prestador da sua região.</Nota>
          )}
        </Cartao>
      </div>

      <Cartao titulo="Histórico neste aparelho">
        {historico.length === 0 && servicos.length === 0 ? (
          <Nota>Ainda não há pedidos nem serviços fechados neste aparelho.</Nota>
        ) : (
          <ul className="historico" data-testid="historico">
            {historico.slice(0, 8).map((p) => (
              <li key={p.id}>
                <div>
                  <strong>Pedido {p.id}</strong>
                  <Tag>{p.status}</Tag>
                  <small>{new Date(p.criadoEm).toLocaleString('pt-BR')}</small>
                </div>
                <span>{reais(p.finalCentavos ?? p.total)}</span>
              </li>
            ))}
            {servicos.slice(0, 8).map((s) => (
              <li key={`s-${s.id}`}>
                <div>
                  <strong>Serviço {s.id}</strong>
                  <Tag>concluído</Tag>
                  <small>{new Date(s.criadoEm).toLocaleString('pt-BR')}</small>
                </div>
                <span>{reais(s.total)}</span>
              </li>
            ))}
          </ul>
        )}
        <Botao variante="texto" onClick={() => { setHistorico(listarPedidos()); setServicos(listarServicos()) }}>
          Atualizar histórico
        </Botao>
      </Cartao>
    </Pagina>
  )
}
