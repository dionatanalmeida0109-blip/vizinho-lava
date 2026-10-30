import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Apoio, Botao, BotaoExterno, Cartao, LinhaValor, Marcar, Nota, Pagina, Quantidade, Tag, Titulo } from '../components/ui'
import { ExplicacaoPreco } from '../components/ExplicacaoPreco'
import { signOut } from '../lib/localAuth'
import { formatPhone } from '../lib/phone'
import { estimarLouca } from '../lib/estimativa'
import { fotoComoBlob, fotoGuardada, guardarFoto, prepararFoto } from '../lib/foto'
import { ADICIONAIS, CHURRASCO } from '../lib/catalogo'
import { esquecerPrestador, linkWhatsApp, prestadorEscolhido } from '../lib/linkPrestador'
import {
  CONTAGEM_VAZIA, LISTA_PRODUTOS, PRECOS, PRODUTOS, UTENSILIOS,
  reais, subtotalLouca, type Contagem, type Produto,
} from '../lib/precos'
import { PROMOCAO, aplicarPromocao } from '../lib/promocao'
import { registrarPedido, type Pedido } from '../lib/pedidos'
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
  const [estimado, setEstimado] = useState(false)
  const [contagem, setContagem] = useState<Contagem>(CONTAGEM_VAZIA)
  const [semProdutos, setSemProdutos] = useState(false)
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [churras, setChurras] = useState<Record<string, number>>({})
  const [extras, setExtras] = useState<Record<string, boolean>>({})
  const [produtos, setProdutos] = useState<Record<Produto, boolean>>({ detergente: true, esponja: true })

  const [prestador, setPrestador] = useState(prestadorEscolhido)
  useEffect(() => { guardarFoto(foto) }, [foto])

  if (!session) return <Navigate to={ROTAS.loginCliente} replace />
  if (session.role === 'prestador') return <Navigate to={ROTAS.areaPrestador} replace />

  function sair() {
    guardarFoto(null)
    signOut()
    navigate(ROTAS.loginCliente, { replace: true })
  }

  /** Só anexa e mostra a foto; a contagem roda quando o cliente toca em "Analisar". */
  async function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    setAnexando(true)
    setErroFoto(null)
    try {
      setFoto(await prepararFoto(arquivo))
      setEstimado(false)
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
      setContagem(await estimarLouca(await fotoComoBlob(foto)))
      setEstimado(true)
    } catch {
      setEstimado(false)
      setErroFoto('Não deu para contar por essa foto. Preencha as quantidades abaixo.')
    } finally {
      setAnalisando(false)
      requestAnimationFrame(() => resumoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  function removerFoto() {
    setFoto(null)
    setEstimado(false)
    setErroFoto(null)
  }

  function ajustar(u: keyof Contagem, delta: number) {
    setContagem((c) => ({ ...c, [u]: Math.max(0, Math.min(999, c[u] + delta)) }))
  }
  function definir(u: keyof Contagem, valor: string) {
    const n = Math.max(0, Math.min(999, Math.floor(Number(valor) || 0)))
    setContagem((c) => ({ ...c, [u]: n }))
  }

  const subtotal = subtotalLouca(contagem)
  const taxas = semProdutos
    ? LISTA_PRODUTOS.filter((p) => produtos[p]).reduce((t, p) => t + PRODUTOS[p].centavos, 0)
    : 0
  const totalChurras = CHURRASCO.reduce((t, i) => t + (churras[i.id] ?? 0) * i.centavos, 0)
  const totalExtras = ADICIONAIS.reduce((t, i) => t + (extras[i.id] ? i.centavos : 0), 0)
  const servicos = subtotal + totalChurras + taxas + totalExtras
  /** Desconto aplicado só no final; a tabela continua com os preços base. */
  const promo = aplicarPromocao(servicos)
  const totalOriginal = promo.original
  const total = promo.final
  function textoPedido() {
    const linhas = [`Olá! Pedido de lavagem de louça pelo VizinhoLava.`, `Cliente: ${session!.name} (${formatPhone(session!.phone)})`, '']
    UTENSILIOS.filter((u) => contagem[u] > 0).forEach((u) => linhas.push(`${contagem[u]}× ${PRECOS[u].plural}: ${reais(contagem[u] * PRECOS[u].centavos)}`))
    CHURRASCO.filter((i) => (churras[i.id] ?? 0) > 0).forEach((i) => linhas.push(`${churras[i.id]}× ${i.nome}: ${reais(churras[i.id] * i.centavos)}`))
    ADICIONAIS.filter((i) => extras[i.id]).forEach((i) => linhas.push(`${i.nome}: ${reais(i.centavos)}`))
    if (semProdutos && taxas > 0) linhas.push(`Produtos do lavador: ${reais(taxas)}`)
    linhas.push('')
    if (promo.ativa)
      linhas.push(`Total estimado: era ${reais(totalOriginal)}, agora ${reais(total)} (${PROMOCAO.nome}: ${PROMOCAO.percentual}% de desconto)`)
    else linhas.push(`Total estimado: ${reais(total)}`)
    linhas.push('Valor final a confirmar no local. Pagamento combinado antes do serviço.')
    return linhas.join('\n')
  }
  /** Registra o pedido e encaminha para o prestador da região (link de pedidos → WhatsApp). */
  function solicitarPrestador() {
    const texto = textoPedido()
    setPedido(registrarPedido({ telefone: session!.phone, total, texto }))
    if (prestador) window.open(linkWhatsApp(prestador.whatsapp, texto), '_blank', 'noopener')
  }
  function ajustarChurras(id: string, delta: number) {
    setChurras((c) => ({ ...c, [id]: Math.max(0, Math.min(99, (c[id] ?? 0) + delta)) }))
  }

  return (
    <Pagina largura="larga" direita={<Botao variante="texto" onClick={sair}>Sair</Botao>}>
      <Titulo sub={<>{formatPhone(session.phone)} · Vamos montar o orçamento da sua louça.</>}>Olá, {session.name}!</Titulo>
      <Link className="banner" to={ROTAS.comoFunciona}>
        <strong>Entenda como funciona o trabalho</strong>
        <span>Preço de cada utensílio, churrasco e serviços à parte →</span>
      </Link>

      <Cartao titulo="1. Foto da louça">
        <Apoio>Tire uma foto da pia ou da louça empilhada. A foto fica só no seu aparelho.</Apoio>
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
                {analisando ? 'Analisando…' : '✅ Enviar e analisar foto'}
              </Botao>
              <Botao variante="texto" onClick={removerFoto} disabled={analisando}>Remover foto</Botao>
            </div>
          </div>
        )}
        {erroFoto && <Nota>{erroFoto}</Nota>}
        {analisando && <Nota>Contando utensílios…</Nota>}
        {estimado && !analisando && <Nota>Foto analisada: contagem preenchida abaixo e orçamento atualizado. Confira e ajuste.</Nota>}
        <p className="aviso-ia">
          <strong>Contagem é estimativa local</strong> (feita no seu aparelho, sem enviar a foto) e o
          lavador confirma no local. Você também pode preencher sem foto.
        </p>
      </Cartao>

      <ExplicacaoPreco />

      <Cartao titulo="2. Utensílios e tabela de preços">
        <table className="tabela">
          <thead>
            <tr><th>Item</th><th>Preço</th><th>Qtd.</th><th>Subtotal</th></tr>
          </thead>
          <tbody>
            {UTENSILIOS.map((u) => (
              <tr key={u}>
                <td>
                  {PRECOS[u].plural}
                  {PRECOS[u].nota && <small className="nota-item">{PRECOS[u].nota}</small>}
                </td>
                <td>{u === 'panela' ? `a partir de ${reais(PRECOS[u].centavos)}` : reais(PRECOS[u].centavos)}</td>
                <td>
                  <Quantidade
                    nome={PRECOS[u].nome}
                    rotulo={PRECOS[u].plural}
                    valor={contagem[u]}
                    onMenos={() => ajustar(u, -1)}
                    onMais={() => ajustar(u, 1)}
                    onDigitar={(v) => definir(u, v)}
                  />
                </td>
                <td>{reais(contagem[u] * PRECOS[u].centavos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Cartao>

      <Cartao titulo={<>3. Churrasco <Tag>preços maiores</Tag></>}>
        <Apoio>Gordura queimada, espetos e grelhas. Valor conforme a condição.</Apoio>
        <table className="tabela">
          <tbody>
            {CHURRASCO.map((i) => (
              <tr key={i.id}>
                <td>{i.nome}<small className="nota-item">a partir de {reais(i.centavos)}</small></td>
                <td>
                  <Quantidade
                    nome={i.nome}
                    rotulo={i.nome}
                    valor={churras[i.id] ?? 0}
                    onMenos={() => ajustarChurras(i.id, -1)}
                    onMais={() => ajustarChurras(i.id, 1)}
                  />
                </td>
                <td>{reais((churras[i.id] ?? 0) * i.centavos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Cartao>

      <Cartao titulo="4. Produtos de limpeza">
        <Marcar checked={semProdutos} onChange={setSemProdutos}>
          Não tenho os produtos adequados — o lavador leva os seus e cobra pela utilização.
        </Marcar>
        {semProdutos && (
          <ul className="taxas">
            {LISTA_PRODUTOS.map((p) => (
              <li key={p}>
                <Marcar checked={produtos[p]} onChange={(v) => setProdutos((s) => ({ ...s, [p]: v }))}>{PRODUTOS[p].nome}</Marcar>
                <span>{reais(PRODUTOS[p].centavos)}</span>
              </li>
            ))}
          </ul>
        )}
        {!semProdutos && (
          <Nota>Tabela: {LISTA_PRODUTOS.map((p) => `${PRODUTOS[p].nome} ${reais(PRODUTOS[p].centavos)}`).join(' · ')}. Só cobra se o lavador levar.</Nota>
        )}
      </Cartao>

      <Cartao titulo={<>Serviços à parte <Tag>não é louça</Tag></>}>
        <ul className="taxas">
          {ADICIONAIS.map((i) => (
            <li key={i.id}>
              <Marcar checked={!!extras[i.id]} onChange={(v) => setExtras((s) => ({ ...s, [i.id]: v }))}>{i.nome}</Marcar>
              <span>a partir de {reais(i.centavos)}</span>
            </li>
          ))}
        </ul>
        <Nota>Geladeira e serviços de diarista não estão incluídos.</Nota>
      </Cartao>

      <div ref={resumoRef} className="ancora-resumo" data-testid="resumo">
      <Cartao titulo="Orçamento base" destaque="resumo" aria-live="polite">
        <LinhaValor rotulo="Louça">{reais(subtotal)}</LinhaValor>
        {totalChurras > 0 && <LinhaValor rotulo="Churrasco">{reais(totalChurras)}</LinhaValor>}
        {totalExtras > 0 && <LinhaValor rotulo="Serviços à parte">{reais(totalExtras)}</LinhaValor>}
        {semProdutos && <LinhaValor rotulo="Produtos do lavador">{reais(taxas)}</LinhaValor>}
        {promo.ativa ? (
          <>
            <LinhaValor rotulo="Total pela tabela" testId="total-original">{reais(totalOriginal)}</LinhaValor>
            <LinhaValor rotulo={`${PROMOCAO.nome} (−${PROMOCAO.percentual}%)`} testId="desconto">− {reais(promo.desconto)}</LinhaValor>
            <div className="promo" data-testid="promo">
              <span className="rotulo">{PROMOCAO.nome}</span>
              <div>
                era <span className="era">{reais(totalOriginal)}</span>, agora{' '}
                <span className="agora" data-testid="total">{reais(total)}</span>
              </div>
              <span className="economia">Você economiza {reais(promo.desconto)}</span>
            </div>
          </>
        ) : (
          <LinhaValor rotulo="Total estimado" total testId="total">{reais(total)}</LinhaValor>
        )}
        <Nota>
          O lavador confirma o valor no local: a foto não mostra, por exemplo, gordura queimada no
          fundo da panela, e o valor da panela depende da condição dela.
        </Nota>
        <Nota>O pagamento (Pix) é combinado <strong>antes</strong> do serviço, fora do app.</Nota>
        {!pedido ? (
          <Botao
            className="solicitar"
            data-testid="solicitar"
            disabled={servicos === 0}
            onClick={solicitarPrestador}
          >
            {prestador ? `Solicitar prestador (${prestador.nome.split(' ')[0]})` : 'Solicitar prestador'}
          </Botao>
        ) : (
          <div className="pedido-ok" data-testid="pedido-ok" role="status">
            <strong>Pedido {pedido.id} solicitado: {reais(pedido.total)}</strong>
            <span>
              {prestador
                ? `Encaminhamos o pedido para ${prestador.nome} (${prestador.regiao}) no WhatsApp. Se a conversa não abriu, use o botão abaixo.`
                : 'Pedido guardado neste aparelho. Abra o link de pedidos do prestador da sua região para encaminhar.'}
              {' '}O lavador confirma o valor no local antes de começar.
            </span>
            <Botao variante="texto" onClick={() => setPedido(null)}>Alterar orçamento</Botao>
          </div>
        )}
        {servicos === 0 && !pedido && <Nota>Adicione pelo menos um item para solicitar.</Nota>}
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
          <Nota>Para encaminhar o pedido, abra o link de pedidos do prestador da sua região.</Nota>
        )}
      </Cartao>
      </div>
    </Pagina>
  )
}
