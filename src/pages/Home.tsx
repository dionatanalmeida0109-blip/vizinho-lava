import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Apoio, Botao, BotaoExterno, Cartao, LinhaValor, Marcar, Nota, Pagina, Quantidade, Tag, Titulo } from '../components/ui'
import { signOut } from '../lib/localAuth'
import { formatPhone } from '../lib/phone'
import { estimarLouca } from '../lib/estimativa'
import { ADICIONAIS, CHURRASCO } from '../lib/catalogo'
import { esquecerPrestador, linkWhatsApp, prestadorEscolhido } from '../lib/linkPrestador'
import {
  CONTAGEM_VAZIA, LISTA_PRODUTOS, PRECOS, PRODUTOS, UTENSILIOS,
  reais, subtotalLouca, type Contagem, type Produto,
} from '../lib/precos'
import { PROMOCAO, aplicarPromocao } from '../lib/promocao'
import { ROTAS } from '../lib/rotas'

export default function Home() {
  const session = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [foto, setFoto] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [estimado, setEstimado] = useState(false)
  const [contagem, setContagem] = useState<Contagem>(CONTAGEM_VAZIA)
  const [semProdutos, setSemProdutos] = useState(false)
  const [churras, setChurras] = useState<Record<string, number>>({})
  const [extras, setExtras] = useState<Record<string, boolean>>({})
  const [produtos, setProdutos] = useState<Record<Produto, boolean>>({ detergente: true, esponja: true })

  const [prestador, setPrestador] = useState(prestadorEscolhido)
  useEffect(() => () => { if (foto) URL.revokeObjectURL(foto) }, [foto])

  if (!session) return <Navigate to={ROTAS.loginCliente} replace />
  if (session.role === 'prestador') return <Navigate to={ROTAS.areaPrestador} replace />

  function sair() {
    signOut()
    navigate(ROTAS.loginCliente, { replace: true })
  }

  async function aoEscolherFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setFoto(URL.createObjectURL(arquivo))
    setAnalisando(true)
    try {
      setContagem(await estimarLouca(arquivo))
      setEstimado(true)
    } catch {
      setContagem(CONTAGEM_VAZIA)
      setEstimado(false)
    } finally {
      setAnalisando(false)
    }
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
  const total = subtotal + totalChurras + taxas + totalExtras
  /** Desconto aplicado só no final; a tabela continua com os preços base. */
  const promo = aplicarPromocao(total)
  function textoPedido() {
    const linhas = [`Olá! Pedido de lavagem de louça pelo VizinhoLava.`, `Cliente: ${session!.name} (${formatPhone(session!.phone)})`, '']
    UTENSILIOS.filter((u) => contagem[u] > 0).forEach((u) => linhas.push(`${contagem[u]}× ${PRECOS[u].plural}: ${reais(contagem[u] * PRECOS[u].centavos)}`))
    CHURRASCO.filter((i) => (churras[i.id] ?? 0) > 0).forEach((i) => linhas.push(`${churras[i.id]}× ${i.nome}: ${reais(churras[i.id] * i.centavos)}`))
    ADICIONAIS.filter((i) => extras[i.id]).forEach((i) => linhas.push(`${i.nome}: ${reais(i.centavos)}`))
    if (semProdutos && taxas > 0) linhas.push(`Produtos do lavador: ${reais(taxas)}`)
    linhas.push('')
    if (promo.ativa)
      linhas.push(`Total estimado: era ${reais(promo.original)}, agora ${reais(promo.final)} (${PROMOCAO.nome}: ${PROMOCAO.percentual}% de desconto)`)
    else linhas.push(`Total estimado: ${reais(total)}`)
    linhas.push('Valor final a confirmar no local. Pagamento combinado antes do serviço.')
    return linhas.join('\n')
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
        <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={aoEscolherFoto} data-testid="foto" />
        <Botao onClick={() => inputRef.current?.click()} disabled={analisando}>
          📷 {foto ? 'Tirar outra foto' : 'Tirar foto da louça'}
        </Botao>
        {foto && <img className="preview" src={foto} alt="Foto da louça" />}
        {analisando && <Nota>Contando utensílios…</Nota>}
        {estimado && !analisando && <Nota>Contagem estimada a partir da foto. Confira e ajuste abaixo.</Nota>}
        <p className="aviso-ia">
          <strong>Contagem é estimativa local</strong> (feita no seu aparelho, sem enviar a foto) e o
          lavador confirma no local. Você também pode preencher sem foto.
        </p>
      </Cartao>

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
        <Nota>Geladeira não está incluída (serviço de diarista).</Nota>
      </Cartao>

      <Cartao titulo="Orçamento base" destaque="resumo" aria-live="polite">
        <LinhaValor rotulo="Louça">{reais(subtotal)}</LinhaValor>
        {totalChurras > 0 && <LinhaValor rotulo="Churrasco">{reais(totalChurras)}</LinhaValor>}
        {totalExtras > 0 && <LinhaValor rotulo="Serviços à parte">{reais(totalExtras)}</LinhaValor>}
        {semProdutos && <LinhaValor rotulo="Produtos do lavador">{reais(taxas)}</LinhaValor>}
        {promo.ativa ? (
          <>
            <LinhaValor rotulo="Total pela tabela" testId="total-original">{reais(promo.original)}</LinhaValor>
            <LinhaValor rotulo={`${PROMOCAO.nome} (−${PROMOCAO.percentual}%)`} testId="desconto">− {reais(promo.desconto)}</LinhaValor>
            <div className="promo" data-testid="promo">
              <span className="rotulo">{PROMOCAO.nome}</span>
              <div>
                era <span className="era">{reais(promo.original)}</span>, agora{' '}
                <span className="agora" data-testid="total">{reais(promo.final)}</span>
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
    </Pagina>
  )
}
