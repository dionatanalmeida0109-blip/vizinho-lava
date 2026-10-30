import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Home from './pages/Home'
import ComoFunciona from './pages/ComoFunciona'
import Entrar from './pages/Entrar'
import Prestador from './pages/Prestador'
import PrestadorLink from './pages/PrestadorLink'
import DevResets from './pages/DevResets'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login key="cliente" papel="cliente" />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/prestador/login" element={<Login key="prestador" papel="prestador" />} />
          <Route path="/prestador" element={<Prestador />} />
          <Route path="/p/:codigo" element={<PrestadorLink />} />
          <Route path="/home" element={<Home />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/dev/resets" element={<DevResets />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
