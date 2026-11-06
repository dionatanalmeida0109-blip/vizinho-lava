import { useAuth } from '../auth/AuthContext'
import { AcessoConta } from '../components/AcessoConta'
import { EscolhaPapel } from '../components/EscolhaPapel'
import { AcoesTopo, Apoio, BotaoLink, GrupoBotoes, Pagina } from '../components/ui'
import { RECURSOS } from '../lib/recursos'
import { AREA, ROTAS } from '../lib/rotas'

const passos = [
  { titulo: 'Foto e orçamento', texto: 'Tire a foto da pia. A IA local sugere um valor entre R$ 20 e R$ 30.' },
  { titulo: 'O vizinho confirma', texto: 'No local, o lavador valida o preço — a foto não mostra gordura queimada.' },
  { titulo: 'Louça limpa', texto: 'Pia vazia. Pix combinado antes, fora do app. Só isso.' },
]

export default function Landing() {
  const session = useAuth()
  const topo = session ? (
    <BotaoLink variante="topo" to={AREA[session.role]}>Minha área</BotaoLink>
  ) : (
    <AcoesTopo>
      <BotaoLink variante="topo" to={RECURSOS.MOSTRAR_PRESTADOR ? ROTAS.entrar : ROTAS.loginCliente}>Entrar</BotaoLink>
      <BotaoLink variante="topo-destaque" to={RECURSOS.MOSTRAR_PRESTADOR ? ROTAS.cadastro : `${ROTAS.loginCliente}?modo=criar`}>Cadastre-se</BotaoLink>
    </AcoesTopo>
  )

  return (
    <Pagina largura="livre" direita={topo} rodape={<p>Pagamento via Pix, combinado diretamente — fora do app.</p>}>
      <section className="hero">
        <h1>Alguém vai na sua casa lavar a louça.</h1>
        <p className="sub">Simples assim. Você chama, um vizinho de confiança aparece e deixa a pia limpa.</p>
        {session ? (
          <GrupoBotoes tipo="acesso">
            <BotaoLink to={AREA[session.role]}>Continuar como {session.role === 'prestador' ? 'prestador' : 'cliente'}</BotaoLink>
          </GrupoBotoes>
        ) : (
          <AcessoConta />
        )}
        {RECURSOS.MOSTRAR_PRESTADOR ? (
          <>
            <Apoio>Ou escolha direto como você quer usar:</Apoio>
            <EscolhaPapel
              destaque="cliente"
              textos={{ cliente: 'Quero contratar alguém para lavar a louça.', prestador: 'Quero lavar louça na casa dos vizinhos e receber.' }}
            />
          </>
        ) : (
          !session && <Apoio>Crie sua conta, veja como funciona e faça o orçamento pela foto da louça.</Apoio>
        )}
      </section>

      <section className="passos" aria-label="Como funciona">
        {passos.map((p, i) => (
          <div className="passo" key={p.titulo}>
            <span className="numero">{i + 1}</span>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </div>
        ))}
      </section>

      <section className="condominio">
        <div className="qr" aria-hidden="true">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 7, 17].includes(i) ? 'on' : ''} />
          ))}
        </div>
        <div>
          <h2>No seu condomínio</h2>
          <p>
            Um QR code no elevador ou na portaria. Aponte a câmera e peça — o vizinho que lava
            já está no prédio ou na rua ao lado.
          </p>
          <p className="nota">Começando por bairros densos como o Água Verde, onde muita gente mora perto.</p>
        </div>
      </section>
    </Pagina>
  )
}
