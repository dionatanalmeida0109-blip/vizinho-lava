import { useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AvisoCompartilhamento } from '../components/AvisoCompartilhamento'
import { Apoio, BotaoLink, Pagina, Titulo } from '../components/ui'
import { decodificar, escolherPrestador } from '../lib/linkPrestador'
import { formatPhone } from '../lib/phone'
import { ROTAS } from '../lib/rotas'

/** /p/:codigo — cliente abriu o link de pedidos de um prestador. */
export default function PrestadorLink() {
  const { codigo = '' } = useParams()
  const session = useAuth()
  const p = decodificar(codigo)

  if (!p)
    return (
      <Pagina largura="estreita" topo={false}>
        <Titulo sub="Peça um novo link ao prestador.">Link inválido</Titulo>
        <BotaoLink to={ROTAS.inicio}>Ir para o início</BotaoLink>
      </Pagina>
    )

  escolherPrestador(p)
  const cliente = session?.role === 'cliente'

  return (
    <Pagina largura="estreita">
      <Titulo sub={<>Atende em {p.regiao} · WhatsApp {formatPhone(p.whatsapp)}</>}>{p.nome}</Titulo>
      <AvisoCompartilhamento comTitulo={false} />
      <Apoio>Monte o orçamento pela foto da louça e envie o pedido direto para o WhatsApp de {p.nome.split(' ')[0]}.</Apoio>
      <BotaoLink to={cliente ? ROTAS.orcamento : ROTAS.loginCliente}>{cliente ? 'Fazer orçamento' : 'Entrar como cliente'}</BotaoLink>
    </Pagina>
  )
}
