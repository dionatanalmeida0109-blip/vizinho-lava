import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Apoio, BotaoLink, Cartao, Nota, Pagina, Titulo } from '../components/ui'
import { ExplicacaoPreco } from '../components/ExplicacaoPreco'
import { PROMOCAO } from '../lib/promocao'
import { ROTAS } from '../lib/rotas'
import { ADICIONAIS, CATEGORIAS } from '../lib/catalogo'
import { LISTA_PRODUTOS, PRECOS, PRODUTOS, UTENSILIOS, reais } from '../lib/precos'

export default function ComoFunciona() {
  const session = useAuth()
  if (!session) return <Navigate to={ROTAS.loginCliente} replace />

  return (
    <Pagina largura="larga" direita={<BotaoLink variante="topo" to={ROTAS.orcamento}>Fazer orçamento</BotaoLink>}>
        <Titulo sub={<>
          Cada utensílio tem um preço. Você tira a foto, o app estima a quantidade e monta um
          orçamento base. O lavador confirma o valor no local, antes de começar.
        </>}>Entenda como funciona o trabalho</Titulo>

        <ExplicacaoPreco tabela />

        <Cartao titulo="Os 4 preços base">
          <ul className="bases">
            {UTENSILIOS.map((u) => (
              <li key={u}>
                <strong>{PRECOS[u].nome}</strong>
                <span className="preco">{u === 'panela' ? `a partir de ${reais(PRECOS[u].centavos)}` : reais(PRECOS[u].centavos)}</span>
                <small>
                  {u === 'prato' && 'Pratos, tigelas e potes.'}
                  {u === 'copo' && 'Copos, taças e xícaras.'}
                  {u === 'talher' && 'Garfos, facas, colheres e conchas.'}
                  {u === 'panela' && 'Panelas, travessas e formas. O valor depende da condição da peça.'}
                </small>
              </li>
            ))}
          </ul>
          <Nota>
            Os outros itens seguem esses preços base: cada peça é cobrada como a base mais parecida,
            ou como um múltiplo dela quando dá mais trabalho.
          </Nota>
        </Cartao>

        {CATEGORIAS.map((cat) => (
          <Cartao key={cat.id} titulo={cat.titulo} destaque={cat.id === 'churrasco' ? 'churrasco' : undefined}>
            <Apoio>{cat.descricao}</Apoio>
            <table className="tabela catalogo">
              <thead><tr><th>Item</th><th>Como calcula</th><th>Preço</th></tr></thead>
              <tbody>
                {cat.itens.map((i) => (
                  <tr key={i.id}>
                    <td>{i.nome}{i.exemplos && <small className="nota-item">{i.exemplos}</small>}</td>
                    <td><small>{i.regra}</small></td>
                    <td>{i.condicao ? 'a partir de ' : ''}{reais(i.centavos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Cartao>
        ))}

        <Cartao titulo="Serviços à parte (não são louça)">
          <Apoio>Cobrados separadamente, só se você pedir.</Apoio>
          <table className="tabela catalogo">
            <tbody>
              {ADICIONAIS.map((i) => (
                <tr key={i.id}>
                  <td>{i.nome}{i.exemplos && <small className="nota-item">{i.exemplos}</small>}</td>
                  <td>a partir de {reais(i.centavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Nota>Fora do escopo: geladeira e qualquer serviço de diarista (faxina, banheiro, roupa). O VizinhoLava faz louça + fogão e micro-ondas.</Nota>
        </Cartao>

        <Cartao titulo="Produtos de limpeza do lavador">
          <Apoio>Só se você não tiver os produtos adequados: o lavador leva os dele e cobra pelo uso.</Apoio>
          <table className="tabela catalogo" data-testid="tabela-produtos">
            <tbody>
              {LISTA_PRODUTOS.map((p) => (
                <tr key={p}>
                  <td>{PRODUTOS[p].nome}</td>
                  <td>{reais(PRODUTOS[p].centavos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Cartao>

        <Cartao titulo="Como o valor é fechado" destaque="resumo">
          <ol className="fluxo">
            <li>Você tira a foto e ajusta as quantidades. Isso gera o orçamento base.</li>
            <li>No local, o lavador confere as peças. A foto não mostra, por exemplo, gordura queimada no fundo da panela.</li>
            {PROMOCAO.ativa && (
              <li>No fim do orçamento entra a {PROMOCAO.nome.toLowerCase()}: {PROMOCAO.percentual}% de desconto sobre o total (você vê o "era" e o "agora").</li>
            )}
            <li>Se você não tiver detergente ou esponja adequados, o lavador leva os dele e cobra pelo uso.</li>
            <li>Com o valor combinado, o pagamento (Pix) é feito fora do app.</li>
          </ol>
          <Nota>
            Valores de referência, ajustáveis.
          </Nota>
        </Cartao>

        <BotaoLink to={ROTAS.orcamento}>Fazer meu orçamento</BotaoLink>
    </Pagina>
  )
}
