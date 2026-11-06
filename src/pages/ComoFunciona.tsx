import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Apoio, BotaoLink, Cartao, Nota, Pagina, Titulo } from '../components/ui'
import { ExplicacaoPreco } from '../components/ExplicacaoPreco'
import { ROTAS } from '../lib/rotas'
import { LISTA_PRODUTOS, ORCAMENTO, PRODUTOS, reais } from '../lib/precos'

export default function ComoFunciona() {
  const session = useAuth()
  if (!session) return <Navigate to={ROTAS.loginCliente} replace />

  const voltar = session.role === 'prestador' ? ROTAS.areaPrestador : ROTAS.orcamento

  return (
    <Pagina largura="larga" direita={<BotaoLink variante="topo" to={voltar}>Voltar</BotaoLink>}>
      <Titulo sub={<>
        Preço natural entre {reais(ORCAMENTO.minCentavos)} e {reais(ORCAMENTO.maxCentavos)}.
        A IA sugere pela foto; o lavador confirma no local.
      </>}>Como funciona o trabalho</Titulo>

      <ExplicacaoPreco />

      <Cartao titulo="Os três volumes">
        <ul className="bases">
          {(Object.keys(ORCAMENTO.volumes) as Array<keyof typeof ORCAMENTO.volumes>).map((v) => (
            <li key={v}>
              <strong>{ORCAMENTO.volumes[v].rotulo}</strong>
              <span className="preco">{reais(ORCAMENTO.volumes[v].centavos)}</span>
              <small>Valor base de referência dentro da faixa natural.</small>
            </li>
          ))}
        </ul>
      </Cartao>

      <Cartao titulo="Produtos de limpeza do lavador">
        <Apoio>Só se o cliente não tiver os produtos adequados: o lavador leva os dele e cobra pelo uso.</Apoio>
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

      <Cartao titulo="Passo a passo" destaque="resumo">
        <ol className="fluxo">
          <li>O cliente tira a foto da pia. A análise roda <strong>só no aparelho</strong> (sem API paga).</li>
          <li>A IA sugere um <strong>valor base</strong> entre {reais(ORCAMENTO.minCentavos)} e {reais(ORCAMENTO.maxCentavos)}.</li>
          <li>Se faltar detergente/esponja, o cliente marca e o acréscimo entra no estimado.</li>
          <li>O pedido vai ao lavador (WhatsApp). No local, ele <strong>confirma ou ajusta</strong> o valor — a foto não mostra gordura queimada.</li>
          <li>O lavador registra os produtos que levou e fecha o total.</li>
          <li>O Pix é combinado <strong>antes</strong>, fora do app.</li>
        </ol>
        <Nota>Fora do escopo por enquanto: faxina completa, geladeira e serviços de diarista.</Nota>
      </Cartao>

      <BotaoLink to={voltar}>{session.role === 'prestador' ? 'Voltar à minha área' : 'Fazer meu orçamento'}</BotaoLink>
    </Pagina>
  )
}
