import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ADICIONAIS, CATEGORIAS, FONTES } from '../lib/catalogo'
import { PRECOS, UTENSILIOS, reais } from '../lib/precos'

export default function ComoFunciona() {
  const session = useAuth()
  if (!session) return <Navigate to="/login" replace />

  return (
    <div className="pagina">
      <header className="topo">
        <span className="marca">VizinhoLava</span>
        <Link className="link-topo" to="/home">Fazer orçamento</Link>
      </header>
      <main className="orcamento">
        <h1>Entenda como funciona o trabalho</h1>
        <p className="sub">
          Cada utensílio tem um preço. Você tira a foto, o app estima a quantidade e monta um
          orçamento base. O lavador confirma o valor no local, antes de começar.
        </p>

        <section className="cartao">
          <h2>Os 4 preços base</h2>
          <ul className="bases">
            {UTENSILIOS.map((u) => (
              <li key={u}>
                <strong>{PRECOS[u].nome}</strong>
                <span className="preco">{u === 'panela' ? `a partir de ${reais(PRECOS[u].centavos)}` : reais(PRECOS[u].centavos)}</span>
                <small>
                  {u === 'prato' && 'Pratos, bowls, potes e outras peças de servir.'}
                  {u === 'copo' && 'Copos, taças, xícaras e o que serve bebida.'}
                  {u === 'talher' && 'Garfos, facas, colheres e utensílios de mão.'}
                  {u === 'panela' && 'Panelas, assadeiras e formas. O valor depende da condição da peça.'}
                </small>
              </li>
            ))}
          </ul>
          <p className="nota">
            Os outros itens seguem esses preços base: cada peça é cobrada como a base mais parecida,
            ou como um múltiplo dela quando dá mais trabalho.
          </p>
        </section>

        {CATEGORIAS.map((cat) => (
          <section key={cat.id} className={`cartao ${cat.id === 'churrasco' ? 'churrasco' : ''}`}>
            <h2>{cat.titulo}</h2>
            <p className="sub-p">{cat.descricao}</p>
            <table className="tabela catalogo">
              <thead><tr><th>Item</th><th>Como calcula</th><th>Preço</th></tr></thead>
              <tbody>
                {cat.itens.map((i) => (
                  <tr key={i.id}>
                    <td>{i.nome}<small className="nota-item">{i.exemplos}</small></td>
                    <td><small>{i.regra}</small></td>
                    <td>{i.condicao ? 'a partir de ' : ''}{reais(i.centavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}

        <section className="cartao">
          <h2>Serviços à parte (não são louça)</h2>
          <p className="sub-p">Cobrados separadamente, só se você pedir.</p>
          <table className="tabela catalogo">
            <tbody>
              {ADICIONAIS.map((i) => (
                <tr key={i.id}>
                  <td>{i.nome}<small className="nota-item">{i.exemplos}</small></td>
                  <td>a partir de {reais(i.centavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="nota">
            Geladeira não está incluída: é serviço de diarista, fora do escopo do VizinhoLava.
          </p>
        </section>

        <section className="cartao resumo">
          <h2>Como o valor é fechado</h2>
          <ol className="fluxo">
            <li>Você tira a foto e ajusta as quantidades. Isso gera o orçamento base.</li>
            <li>No local, o lavador confere as peças. A foto não mostra, por exemplo, gordura queimada no fundo da panela.</li>
            <li>Se você não tiver detergente ou esponja adequados, o lavador leva os dele e cobra pelo uso.</li>
            <li>Com o valor combinado, o pagamento (Pix) é feito fora do app.</li>
          </ol>
          <p className="nota">
            Lista de itens baseada nos utensílios mais vendidos em {FONTES.map((f, i) => (
              <span key={f.url}>{i > 0 && (i === FONTES.length - 1 ? ' e ' : ', ')}<a href={f.url} target="_blank" rel="noreferrer">{f.nome.split(' — ')[0]}</a></span>
            ))} (out/2026). Valores de referência, ajustáveis.
          </p>
        </section>

        <Link className="cta" to="/home">Fazer meu orçamento</Link>
      </main>
    </div>
  )
}
