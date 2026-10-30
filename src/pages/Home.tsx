import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { signOut } from '../lib/localAuth'
import { formatPhone } from '../lib/phone'
import { estimarLouca } from '../lib/estimativa'
import {
  CONTAGEM_VAZIA, LISTA_PRODUTOS, PRECOS, PRODUTOS, UTENSILIOS,
  reais, subtotalLouca, type Contagem, type Produto,
} from '../lib/precos'

export default function Home() {
  const session = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [foto, setFoto] = useState<string | null>(null)
  const [analisando, setAnalisando] = useState(false)
  const [estimado, setEstimado] = useState(false)
  const [contagem, setContagem] = useState<Contagem>(CONTAGEM_VAZIA)
  const [semProdutos, setSemProdutos] = useState(false)
  const [produtos, setProdutos] = useState<Record<Produto, boolean>>({ detergente: true, esponja: true })

  useEffect(() => () => { if (foto) URL.revokeObjectURL(foto) }, [foto])

  if (!session) return <Navigate to="/login" replace />

  function sair() {
    signOut()
    navigate('/login', { replace: true })
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
  const total = subtotal + taxas

  return (
    <div className="pagina">
      <header className="topo">
        <span className="marca">VizinhoLava</span>
        <button className="link" type="button" onClick={sair}>Sair</button>
      </header>
      <main className="orcamento">
        <h1>Olá, {session.name}!</h1>
        <p className="sub">{formatPhone(session.phone)} · Vamos montar o orçamento da sua louça.</p>

        <section className="cartao">
          <h2>1. Foto da louça</h2>
          <p className="sub-p">Tire uma foto da pia ou da louça empilhada. A foto fica só no seu aparelho.</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={aoEscolherFoto}
            data-testid="foto"
          />
          <button className="cta" type="button" onClick={() => inputRef.current?.click()} disabled={analisando}>
            📷 {foto ? 'Tirar outra foto' : 'Tirar foto da louça'}
          </button>
          {foto && <img className="preview" src={foto} alt="Foto da louça" />}
          {analisando && <p className="nota">Contando utensílios…</p>}
          {estimado && !analisando && (
            <p className="nota">Contagem estimada a partir da foto. Confira e ajuste abaixo.</p>
          )}
          <p className="aviso-ia">
            <strong>Contagem é estimativa local</strong> (feita no seu aparelho, sem enviar a foto) e o
            lavador confirma no local. Você também pode preencher sem foto.
          </p>
        </section>

        <section className="cartao">
          <h2>2. Utensílios e tabela de preços</h2>
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
                    <div className="qtd">
                      <button type="button" aria-label={`Menos ${PRECOS[u].nome}`} onClick={() => ajustar(u, -1)}>−</button>
                      <input
                        inputMode="numeric"
                        aria-label={`Quantidade de ${PRECOS[u].plural}`}
                        value={contagem[u]}
                        onChange={(e) => definir(u, e.target.value)}
                      />
                      <button type="button" aria-label={`Mais ${PRECOS[u].nome}`} onClick={() => ajustar(u, 1)}>+</button>
                    </div>
                  </td>
                  <td>{reais(contagem[u] * PRECOS[u].centavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="cartao">
          <h2>3. Produtos de limpeza</h2>
          <label className="check">
            <input type="checkbox" checked={semProdutos} onChange={(e) => setSemProdutos(e.target.checked)} />
            Não tenho os produtos adequados — o lavador leva os seus e cobra pela utilização.
          </label>
          {semProdutos && (
            <ul className="taxas">
              {LISTA_PRODUTOS.map((p) => (
                <li key={p}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={produtos[p]}
                      onChange={(e) => setProdutos((s) => ({ ...s, [p]: e.target.checked }))}
                    />
                    {PRODUTOS[p].nome}
                  </label>
                  <span>{reais(PRODUTOS[p].centavos)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="cartao resumo" aria-live="polite">
          <h2>Orçamento base</h2>
          <div className="linha"><span>Louça</span><span>{reais(subtotal)}</span></div>
          {semProdutos && <div className="linha"><span>Produtos do lavador</span><span>{reais(taxas)}</span></div>}
          <div className="linha total"><span>Total estimado</span><span data-testid="total">{reais(total)}</span></div>
          <p className="nota">
            O lavador confirma o valor no local: a foto não mostra, por exemplo, gordura queimada no
            fundo da panela, e o valor da panela depende da condição dela.
          </p>
          <p className="nota">O pagamento (Pix) é combinado fora do app.</p>
        </section>
      </main>
    </div>
  )
}
