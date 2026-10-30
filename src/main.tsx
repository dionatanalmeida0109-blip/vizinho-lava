import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErroTela from './ErroTela.tsx'

// PWA: quando uma versão nova do app assume, recarrega uma vez para não
// continuar mostrando a tela antiga guardada em cache.
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  let recarregou = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recarregou) return
    recarregou = true
    window.location.reload()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErroTela>
      <App />
    </ErroTela>
  </StrictMode>,
)
