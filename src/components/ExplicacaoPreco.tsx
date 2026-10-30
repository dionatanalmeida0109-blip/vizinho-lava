import { Cartao } from './ui'
import { PERCENTUAL_LAVAGEM, REPOSICAO } from '../lib/reposicao'
import { reais } from '../lib/precos'

/** Texto que explica a regra de preço (8% do valor de reposição). */
export function ExplicacaoPreco({ tabela = false }: { tabela?: boolean }) {
  return (
    <Cartao titulo="Por que esse preço?" data-testid="explicacao-preco">
      <p>
        Se um prato custa R$ 10,00 e quebra, você paga R$ 10,00 por um novo. Mas ninguém joga
        fora um prato de R$ 10,00 toda vez que usa: a gente lava. Por isso, lavar cada peça custa
        só {PERCENTUAL_LAVAGEM}% do valor de uma nova. No prato de R$ 10,00, são R$ 0,80.
      </p>
      <p>É um preço justo para você e para quem lava. Obrigado pela confiança!</p>
      {tabela && (
        <table className="tabela catalogo" data-testid="tabela-reposicao">
          <thead><tr><th>Item</th><th>Novo na loja</th><th>Lavagem ({PERCENTUAL_LAVAGEM}%)</th></tr></thead>
          <tbody>
            {REPOSICAO.map((r) => (
              <tr key={r.id}>
                <td>{r.item}</td>
                <td>{reais(r.reposicaoCentavos)}</td>
                <td>{reais(r.lavagemCentavos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Cartao>
  )
}
