import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Home from './pages/Home'
import ComoFunciona from './pages/ComoFunciona'
import DevResets from './pages/DevResets'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/dev/resets" element={<DevResets />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
