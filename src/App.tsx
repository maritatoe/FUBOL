import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'

// Lazy load (or import directly for simpler MVP)
import Jugadores from './pages/Jugadores'
import ArmarPartido from './pages/ArmarPartido'
import Historial from './pages/Historial'
import Ranking from './pages/Ranking'
import PuntuarPartido from './pages/PuntuarPartido'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        {/* Redirección por defecto */}
        <Route index element={<Navigate to="/jugadores" replace />} />
        
        <Route path="jugadores" element={<Jugadores />} />
        <Route path="armar" element={<ArmarPartido />} />
        <Route path="historial" element={<Historial />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="puntuar/:partidoId" element={<PuntuarPartido />} />
      </Route>
    </Routes>
  )
}

export default App
