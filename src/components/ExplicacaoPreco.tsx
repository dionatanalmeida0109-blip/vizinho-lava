import { Cartao } from './ui'
import { ORCAMENTO, LISTA_PRODUTOS, PRODUTOS, reais } from '../lib/precos'

/** Como o preço é feito: base R$ 20–30 sugerida pela IA + produtos do lavador. */
export function ExplicacaoPreco() {
  return (
    <Cartao titulo="Como o preço é feito" data-testid="explicacao-preco">
      <p>
        O preço natural de uma lavagem de louça fica entre{' '}
        <strong>{reais(ORCAMENTO.minCentavos)}</strong> e{' '}
        <strong>{reais(ORCAMENTO.maxCentavos)}</strong>.
      </p>
      <p>
        A foto gera uma <strong>sugestão de valor base</strong> (IA local, no seu aparelho).
        O lavador confirma no local porque a foto não mostra, por exemplo, gordura queimada
        no fundo da panela — a IA precifica, o humano valida.
      </p>
      <p>
        Se você não tiver detergente ou esponja adequados, o lavador leva os dele e cobra
        pelo uso: {LISTA_PRODUTOS.map((p) => `${PRODUTOS[p].nome} ${reais(PRODUTOS[p].centavos)}`).join(' · ')}.
      </p>
    </Cartao>
  )
}
