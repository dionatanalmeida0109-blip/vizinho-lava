import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AvisoCompartilhamento } from '../components/AvisoCompartilhamento'
import { SeletorPapel } from '../components/EscolhaPapel'
import { Apoio, Botao, BotaoLink, Campo, Formulario, GrupoBotoes, Marcar, Mensagem, Pagina, Tag, Titulo } from '../components/ui'
import { requestReset, signIn, signOut, signUp, type Role } from '../lib/localAuth'
import { RECURSOS } from '../lib/recursos'
import { AREA, NOME_PAPEL, ROTAS, chaveBloqueio } from '../lib/rotas'
import { formatPhone, mascaraCelular, normalizePhone } from '../lib/phone'
import { clearFailures, lockMessage, lockRemaining, registerFailure } from '../lib/loginLimiter'

type Modo = 'entrar' | 'criar' | 'esqueci'

const titulos: Record<Modo, string> = { entrar: 'Entrar', criar: 'Criar conta', esqueci: 'Trocar senha' }
/** Só DDD + número, sem +55 (teste só em Curitiba/Brasil). */
const TELEFONE = { type: 'tel', inputMode: 'numeric', placeholder: '(41) 99876-5432', maxLength: 15 } as const

/** Login, cadastro e troca de senha — a mesma tela para cliente e prestador. */
export default function Login({ papel = 'cliente' }: { papel?: Role }) {
  const session = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [modo, setModo] = useState<Modo>(params.get('modo') === 'criar' ? 'criar' : 'entrar')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [regiao, setRegiao] = useState('')
  const [mesmoWhats, setMesmoWhats] = useState(true)
  const [whats, setWhats] = useState('')
  const [concordo, setConcordo] = useState(false)
  const [recemCriado, setRecemCriado] = useState(false)
  const prestador = papel === 'prestador'

  // Cliente recém-cadastrado vai primeiro para "como funciona"; de lá, para o orçamento por foto.
  if (session && session.role === papel)
    return <Navigate to={recemCriado && !prestador ? ROTAS.comoFunciona : AREA[papel]} replace />
  if (session)
    return (
      <Pagina largura="estreita">
        <Titulo
          sub={<>
            {session.name} ({formatPhone(session.phone)}) está como <strong>{NOME_PAPEL[session.role]}</strong>.
            Para entrar como {NOME_PAPEL[papel].toLowerCase()}, saia primeiro.
          </>}
        >Você já está conectado</Titulo>
        <GrupoBotoes>
          <BotaoLink to={AREA[session.role]}>Continuar como {NOME_PAPEL[session.role].toLowerCase()}</BotaoLink>
          <Botao variante="secundario" onClick={signOut}>Sair</Botao>
        </GrupoBotoes>
      </Pagina>
    )

  function trocar(m: Modo) {
    setModo(m)
    setErro(null)
    setAviso(null)
    setSenha('')
  }

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setAviso(null)
    const phone = normalizePhone(telefone)
    if (!phone) return setErro('Celular inválido. Digite DDD + número, sem +55: (41) 99876-5432.')
    if (modo === 'criar' && !nome.trim()) return setErro('Digite seu nome.')
    let whatsapp = phone
    if (modo === 'criar' && prestador) {
      if (!regiao.trim()) return setErro('Informe a região de atendimento (bairro e cidade).')
      if (!mesmoWhats) {
        const w = normalizePhone(whats)
        if (!w) return setErro('WhatsApp inválido. Digite DDD + número, sem +55: (41) 99876-5432.')
        whatsapp = w
      }
      if (!concordo) return setErro('Confirme que entendeu como funciona o compartilhamento de serviço.')
    }
    const chave = chaveBloqueio(papel, phone)
    if (senha.length < 6) return setErro('A senha precisa ter pelo menos 6 caracteres.')

    if (modo === 'entrar') {
      const restante = lockRemaining(chave)
      if (restante > 0) return setErro(lockMessage(restante))
    }

    setEnviando(true)
    try {
      if (modo === 'entrar') {
        const r = await signIn(papel, phone, senha)
        if (!r.ok) {
          const { lockMs, left } = registerFailure(chave)
          return setErro(lockMs ? lockMessage(lockMs) : `Telefone ou senha incorretos. Restam ${left} tentativa${left > 1 ? 's' : ''}.`)
        }
        clearFailures(chave)
        navigate(AREA[papel], { replace: true })
      } else if (modo === 'criar') {
        setRecemCriado(true)
        const r = await signUp(papel, nome, phone, senha, prestador ? { regiao, whatsapp } : undefined)
        if (!r.ok) {
          setRecemCriado(false)
          return setErro('Esse telefone já tem conta. Use "Entrar".')
        }
        // Cliente novo: primeiro "como funciona", de lá vai para o orçamento por foto.
        navigate(prestador ? AREA[papel] : ROTAS.comoFunciona, { replace: true })
      } else {
        const r = await requestReset(papel, phone, senha)
        if (!r.ok)
          return setErro(r.reason === 'pending' ? 'Já existe um pedido aguardando aprovação para esse telefone.' : 'Telefone não cadastrado.')
        setAviso('Pedido enviado. Sua senha atual continua valendo até o pedido ser aprovado.')
        setSenha('')
      }
    } finally {
      setEnviando(false)
    }
  }

  const cadastroPrestador = modo === 'criar' && prestador
  return (
    <Pagina largura="estreita">
      {(RECURSOS.MOSTRAR_PRESTADOR || prestador) && <SeletorPapel atual={papel} />}
      <h1>{titulos[modo]} <Tag>{NOME_PAPEL[papel]}</Tag></h1>
      <Apoio>{prestador ? 'Para quem vai até a casa do vizinho lavar a louça.' : 'Para quem quer pedir a lavagem da louça.'}</Apoio>
      {cadastroPrestador && <AvisoCompartilhamento />}
      <Formulario onSubmit={enviar}>
        {modo === 'criar' && <Campo rotulo="Nome" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" required />}
        <Campo rotulo="Celular" {...TELEFONE} value={telefone} onChange={(e) => setTelefone(mascaraCelular(e.target.value))} autoComplete="tel-national" required />
        {cadastroPrestador && (
          <>
            <Campo rotulo="Região de atendimento" value={regiao} onChange={(e) => setRegiao(e.target.value)} placeholder="Ex.: Água Verde, Curitiba" required />
            <Marcar checked={mesmoWhats} onChange={setMesmoWhats}>Recebo os pedidos no WhatsApp deste mesmo celular</Marcar>
            {!mesmoWhats && (
              <Campo rotulo="WhatsApp que recebe os pedidos" {...TELEFONE} value={whats} onChange={(e) => setWhats(mascaraCelular(e.target.value))} required />
            )}
          </>
        )}
        <Campo
          rotulo={modo === 'esqueci' ? 'Nova senha' : 'Senha'}
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
          required
        />
        {cadastroPrestador && (
          <Marcar checked={concordo} onChange={setConcordo}>
            Entendi: é compartilhamento de serviço e o pagamento é combinado antes, não depois.
          </Marcar>
        )}
        <Mensagem tipo="erro">{erro}</Mensagem>
        <Mensagem tipo="ok">{aviso}</Mensagem>
        <Botao type="submit" disabled={enviando}>
          {enviando ? 'Aguarde…' : modo === 'esqueci' ? 'Pedir troca de senha' : titulos[modo]}
        </Botao>
      </Formulario>
      <nav className="trocas">
        {modo !== 'entrar' && <Botao variante="texto" onClick={() => trocar('entrar')}>Já tenho conta</Botao>}
        {modo !== 'criar' && <Botao variante="texto" onClick={() => trocar('criar')}>Criar conta</Botao>}
        {modo !== 'esqueci' && <Botao variante="texto" onClick={() => trocar('esqueci')}>Esqueci a senha</Botao>}
      </nav>
    </Pagina>
  )
}
