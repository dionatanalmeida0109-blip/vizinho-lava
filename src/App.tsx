import { useState } from 'react'

const passos = [
  { titulo: 'Você pede', texto: 'Escolhe o dia e o horário em poucos toques.' },
  { titulo: 'O vizinho vem', texto: 'Uma pessoa de confiança vai até a sua casa.' },
  { titulo: 'Louça limpa', texto: 'Pia vazia, cozinha em ordem. Só isso.' },
]

function App() {
  const [interesse, setInteresse] = useState(false)

  return (
    <div className="pagina">
      <header className="topo">
        <span className="marca">VizinhoLava</span>
      </header>

      <main>
        <section className="hero">
          <h1>Alguém vai na sua casa lavar a louça.</h1>
          <p className="sub">
            Simples assim. Você chama, um vizinho de confiança aparece e deixa a pia limpa.
          </p>
          <button className="cta" type="button" onClick={() => setInteresse(true)}>
            Quero contratar
          </button>
          {interesse && (
            <p className="aviso" role="status">
              Obrigado! Em breve você poderá agendar por aqui.
            </p>
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

export default App
