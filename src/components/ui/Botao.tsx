import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

/**
 * Botões do app. Use SEMPRE estes componentes em vez de escrever a classe na mão.
 * - primario: ação principal da tela (verde cheio)
 * - secundario: ação alternativa (contorno verde)
 * - texto: botão com cara de link (sublinhado)
 * - topo / topo-destaque: links do cabeçalho (texto / pílula verde)
 */
export type Variante = 'primario' | 'secundario' | 'texto' | 'topo' | 'topo-destaque'

const CLASSE: Record<Variante, string> = {
  primario: 'cta',
  secundario: 'secundario',
  texto: 'link',
  topo: 'link-topo',
  'topo-destaque': 'botao-topo',
}
const classe = (v: Variante, extra?: string) => (extra ? `${CLASSE[v]} ${extra}` : CLASSE[v])

type ComVariante = { variante?: Variante }

/** <button>. type="button" por padrão (use type="submit" em formulários). */
export function Botao({ variante = 'primario', className, type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & ComVariante) {
  return <button type={type} className={classe(variante, className)} {...props} />
}

/** Navegação interna (react-router) com visual de botão. */
export function BotaoLink({ variante = 'primario', className, ...props }: LinkProps & ComVariante) {
  return <Link className={classe(variante, className)} {...props} />
}

/** Link externo (WhatsApp, fontes) ou fora do roteador, com visual de botão. */
export function BotaoExterno({ variante = 'primario', className, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & ComVariante) {
  return <a className={classe(variante, className)} {...props} />
}

/** Grupo de botões lado a lado. "acesso" = botões grandes da entrada; "acoes" = compactos. */
export function GrupoBotoes({ tipo = 'acoes', children }: { tipo?: 'acesso' | 'acoes'; children: ReactNode }) {
  return <div className={tipo}>{children}</div>
}
