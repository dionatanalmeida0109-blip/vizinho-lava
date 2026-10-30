import { CaixaAviso } from './ui'
import { MENSAGEM_COMPARTILHAMENTO } from '../lib/rotas'

/** Aviso padrão: compartilhamento de serviço, pagamento combinado antes. */
export function AvisoCompartilhamento({ comTitulo = true }: { comTitulo?: boolean }) {
  return <CaixaAviso titulo={comTitulo ? 'Compartilhamento de serviço' : undefined}>{MENSAGEM_COMPARTILHAMENTO}</CaixaAviso>
}
