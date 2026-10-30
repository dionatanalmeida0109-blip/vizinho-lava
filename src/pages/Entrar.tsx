import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { EscolhaPapel } from '../components/EscolhaPapel'
import { Apoio, Nota, Pagina, Titulo } from '../components/ui'
import { RECURSOS } from '../lib/recursos'
import { MENSAGEM_COMPARTILHAMENTO, ROTAS } from '../lib/rotas'

/** Escolha do tipo de conta, estilo Uber/99. ?modo=criar abre o cadastro. */
export default function Entrar() {
  const [params] = useSearchParams()
  const criar = params.get('modo') === 'criar'
  // Prestador escondido: /entrar vai direto para o login do cliente.
  if (!RECURSOS.MOSTRAR_PRESTADOR) return <Navigate to={`${ROTAS.loginCliente}${criar ? '?modo=criar' : ''}`} replace />
  return (
    <Pagina largura="estreita">
      <Titulo>{criar ? 'Criar conta: como você quer usar?' : 'Entrar: como você quer usar?'}</Titulo>
      <EscolhaPapel
        criar={criar}
        textos={{ cliente: 'Quero pedir alguém para lavar a minha louça.', prestador: 'Quero lavar louça na casa dos vizinhos e receber por isso.' }}
      />
      <Apoio>
        {criar
          ? <>Já tem conta? <Link to={ROTAS.entrar}>Entrar</Link></>
          : <>Ainda não tem conta? <Link to={ROTAS.cadastro}>Cadastre-se</Link></>}
      </Apoio>
      <Nota>{MENSAGEM_COMPARTILHAMENTO}</Nota>
    </Pagina>
  )
}
