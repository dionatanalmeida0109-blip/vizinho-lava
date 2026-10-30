import { useState, type FormEvent } from 'react'
import { checkDevPassword, decideReset, devPasswordIsSet, listResets, setDevPassword } from '../lib/localAuth'
import { formatPhone } from '../lib/phone'
import { Botao, Campo, Formulario, GrupoBotoes, Mensagem, Pagina, Titulo } from '../components/ui'

/** Tela oculta do desenvolvedor (/dev/resets): aprova ou nega pedidos de troca de senha. Não há link para ela no app. */
export default function DevResets() {
  const [liberado, setLiberado] = useState(false)
  const [primeiroAcesso] = useState(() => !devPasswordIsSet())
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [pedidos, setPedidos] = useState(listResets)

  async function entrar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    if (primeiroAcesso) {
      if (senha.length < 8) return setErro('Defina uma senha de desenvolvedor com pelo menos 8 caracteres.')
      await setDevPassword(senha)
    } else if (!(await checkDevPassword(senha))) {
      return setErro('Senha de desenvolvedor incorreta.')
    }
    setSenha('')
    setPedidos(listResets())
    setLiberado(true)
  }

  function decidir(id: string, aprovar: boolean) {
    decideReset(id, aprovar)
    setPedidos(listResets())
  }

  if (!liberado)
    return (
      <Pagina largura="estreita" topo={false}>
        <Titulo sub={primeiroAcesso ? 'Primeiro acesso neste navegador: defina a senha do desenvolvedor.' : undefined}>Área do desenvolvedor</Titulo>
        <Formulario onSubmit={entrar}>
          <Campo rotulo="Senha do desenvolvedor" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="off" required />
          <Mensagem tipo="erro">{erro}</Mensagem>
          <Botao type="submit">{primeiroAcesso ? 'Definir e entrar' : 'Entrar'}</Botao>
        </Formulario>
      </Pagina>
    )

  const fmt = (t: number) => new Date(t).toLocaleString('pt-BR')
  const rotulo = { pending: 'Pendente', approved: 'Aprovado', denied: 'Negado' } as const

  return (
    <Pagina largura="livre" topo={false}>
        <Titulo sub={pedidos.length === 0 ? 'Nenhum pedido.' : undefined}>Pedidos de troca de senha</Titulo>
        <ul className="pedidos">
          {pedidos.map((p) => (
            <li key={p.id} className={`pedido ${p.status}`}>
              <div>
                <strong>{p.name}</strong> · {formatPhone(p.phone)} · {p.role === 'prestador' ? 'Prestador' : 'Cliente'}
                <br />
                <small>
                  {fmt(p.requestedAt)} · {rotulo[p.status]}
                  {p.decidedAt ? ` em ${fmt(p.decidedAt)}` : ''}
                </small>
              </div>
              {p.status === 'pending' && (
                <GrupoBotoes>
                  <Botao onClick={() => decidir(p.id, true)}>Aprovar</Botao>
                  <Botao variante="secundario" onClick={() => decidir(p.id, false)}>Negar</Botao>
                </GrupoBotoes>
              )}
            </li>
          ))}
        </ul>
    </Pagina>
  )
}
