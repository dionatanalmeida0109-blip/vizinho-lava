import { BotaoExterno, BotaoLink, GrupoBotoes } from './ui'
import { ROTAS } from '../lib/rotas'

/**
 * Botões grandes "Entrar" e "Cadastre-se" da entrada do app.
 * foraDoRoteador: usa <a> comum (tela de erro, que fica fora do BrowserRouter).
 */
export function AcessoConta({ foraDoRoteador = false }: { foraDoRoteador?: boolean }) {
  if (foraDoRoteador)
    return (
      <GrupoBotoes tipo="acesso">
        <BotaoExterno href={ROTAS.entrar}>Entrar</BotaoExterno>
        <BotaoExterno variante="secundario" href={ROTAS.cadastro}>Cadastre-se</BotaoExterno>
      </GrupoBotoes>
    )
  return (
    <GrupoBotoes tipo="acesso">
      <BotaoLink to={ROTAS.entrar} data-testid="entrar">Entrar</BotaoLink>
      <BotaoLink variante="secundario" to={ROTAS.cadastro} data-testid="cadastrar">Cadastre-se</BotaoLink>
    </GrupoBotoes>
  )
}
