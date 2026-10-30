import { Cartao } from './ui'
import { CATEGORIAS } from '../lib/catalogo'
import { reais } from '../lib/precos'

const EXCECOES = CATEGORIAS.flatMap((c) => c.itens).filter((i) => i.porque)

/** Como o preço é feito: tabela fixa por peça + exceções com preço próprio. */
export function ExplicacaoPreco({ excecoes = false }: { excecoes?: boolean }) {
  return (
    <Cartao titulo="Como o preço é feito" data-testid="explicacao-preco">
      <p>
        Cada peça tem um <strong>preço fixo de lavagem</strong> na tabela (prato, copo, talher,
        panela e as peças parecidas). O preço não é uma porcentagem do valor da peça na loja.
      </p>
      <p>
        Pela foto você recebe um <strong>orçamento estimado</strong>. O valor final é a contagem
        do que foi lavado de verdade: o lavador conta as peças no local, marca no app e o app soma
        pela mesma tabela.
      </p>
      {excecoes && (
        <>
          <p><strong>Exceções com preço próprio</strong> (peças que não quebram; o trabalho e o risco são gordura e dano):</p>
          <ul className="excecoes" data-testid="excecoes">
            {EXCECOES.map((i) => (
              <li key={i.id}>
                <strong>{i.nome}: {reais(i.centavos)}{i.ate ? ` (até ${reais(i.ate)} com gordura)` : ''}</strong>
                <br /><small>{i.porque}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </Cartao>
  )
}
