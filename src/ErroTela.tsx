import { Component, type ReactNode } from 'react'

/**
 * Se algo quebrar ao desenhar uma tela, o usuário ainda vê como entrar ou se
 * cadastrar (em vez de uma página em branco) e pode limpar os dados locais.
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
          <div className="acesso">
            <a className="cta" href="/entrar">Entrar</a>
            <a className="secundario" href="/entrar?modo=criar">Cadastre-se</a>
          </div>
          <p className="sub-p">Se continuar, <button className="link" type="button" onClick={this.limpar}>saia da conta e recarregue</button>.</p>
        </main>
      </div>
    )
  }
}
