import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { AREA } from '../lib/rotas'

const passos = [
  { titulo: 'Você pede', texto: 'Escolhe o dia e o horário em poucos toques.' },
  { titulo: 'O vizinho vem', texto: 'Uma pessoa de confiança vai até a sua casa.' },
  { titulo: 'Louça limpa', texto: 'Pia vazia, cozinha em ordem. Só isso.' },
]

export default function Landing() {
  const session = useAuth()
  return (
    <div className="pagina">
      <header className="topo">
        <span className="marca">VizinhoLava</span>
        {session ? (
          <Link className="link-topo" to={AREA[session.role]}>Minha área</Link>
        ) : (
          <nav className="topo-acoes">
            <Link className="link-topo" to="/entrar">Entrar</Link>
            <Link className="botao-topo" to="/entrar?modo=criar">Cadastre-se</Link>
          </nav>
        )}
      </header>

      <main>
        <section className="hero">
          <h1>Alguém vai na sua casa lavar a louça.</h1>
          <p className="sub">
            Simples assim. Você chama, um vizinho de confiança aparece e deixa a pia limpa.
          </p>
          {session ? (
            <div className="acesso">
              <Link className="cta" to={AREA[session.role]}>
                Continuar como {session.role === 'prestador' ? 'prestador' : 'cliente'}
              </Link>
            </div>
          ) : (
            <div className="acesso">
              <Link className="cta" to="/entrar" data-testid="entrar">Entrar</Link>
              <Link className="secundario" to="/entrar?modo=criar" data-testid="cadastrar">Cadastre-se</Link>
            </div>
          )}
          <p className="sub-p">Ou escolha direto como você quer usar:</p>
          <div className="escolha">
            <Link className="opcao destaque" to="/login">
              <strong>Sou cliente</strong>
              <span>Quero contratar alguém para lavar a louça.</span>
            </Link>
            <Link className="opcao" to="/prestador/login">
              <strong>Sou prestador</strong>
              <span>Quero lavar louça na casa dos vizinhos e receber.</span>
            </Link>
          </div>
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
            <p className="nota">
              Começando por bairros densos como o Água Verde, onde muita gente mora perto.
            </p>
          </div>
        </section>
      </main>

      <footer className="rodape">
        <p>Pagamento via Pix, combinado diretamente — fora do app.</p>
      </footer>
    </div>
  )
}

