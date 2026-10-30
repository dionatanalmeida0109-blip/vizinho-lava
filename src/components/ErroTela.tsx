import { Component, type ReactNode } from 'react'
import { AcessoConta } from './AcessoConta'
import { Botao } from './ui'

/**
 * Se algo quebrar ao desenhar uma tela, o usuário ainda vê como entrar ou se
 * cadastrar (em vez de uma página em branco) e pode limpar os dados locais.
 * Fica FORA do BrowserRouter, por isso não usa <Link>.
 */
export default class ErroTela extends Component<{ children: ReactNode }, { erro: boolean }> {
  state = { erro: false }
  static getDerivedStateFromError() {
    return { erro: true }
  }
  componentDidCatch(e: unknown) {
    console.error('VizinhoLava: erro ao desenhar a tela', e)
  }
  limpar = () => {
    try {
      ;['session', 'prestador_escolhido'].forEach((k) => localStorage.removeItem(k))
    } catch {
      /* sem acesso ao armazenamento */
    }
    window.location.assign('/')
  }
  render() {
    if (!this.state.erro) return this.props.children
    return (
      <div className="pagina">
        <header className="topo"><a href="/" className="marca">VizinhoLava</a></header>
        <main className="login">
          <h1>Algo deu errado nesta tela</h1>
          <p className="sub">Você pode entrar ou criar sua conta normalmente:</p>
          <AcessoConta foraDoRoteador />
          <p className="sub-p">Se continuar, <Botao variante="texto" onClick={this.limpar}>saia da conta e recarregue</Botao>.</p>
        </main>
      </div>
    )
  }
}
