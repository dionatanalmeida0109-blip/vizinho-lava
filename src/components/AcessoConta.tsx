import { BotaoExterno, BotaoLink, GrupoBotoes } from './ui'
import { RECURSOS } from '../lib/recursos'
import { ROTAS } from '../lib/rotas'

const ENTRAR = RECURSOS.MOSTRAR_PRESTADOR ? ROTAS.entrar : ROTAS.loginCliente
const CADASTRO = RECURSOS.MOSTRAR_PRESTADOR ? ROTAS.cadastro : `${ROTAS.loginCliente}?modo=criar`

/**
 * Botões grandes "Entrar" e "Cadastre-se" da entrada do app.
 * foraDoRoteador: usa <a> comum (tela de erro, que fica fora do BrowserRouter).
 */
export function AcessoConta({ foraDoRoteador = false }: { foraDoRoteador?: boolean }) {
  if (foraDoRoteador)
    return (
      <GrupoBotoes tipo="acesso">
        <BotaoExterno href={ENTRAR}>Entrar</BotaoExterno>
        <BotaoExterno variante="secundario" href={CADASTRO}>Cadastre-se</BotaoExterno>
      </GrupoBotoes>
    )
  return (
    <GrupoBotoes tipo="acesso">
      <BotaoLink to={ENTRAR} data-testid="entrar">Entrar</BotaoLink>
      <BotaoLink variante="secundario" to={CADASTRO} data-testid="cadastrar">Cadastre-se</BotaoLink>
    </GrupoBotoes>
  )
}
