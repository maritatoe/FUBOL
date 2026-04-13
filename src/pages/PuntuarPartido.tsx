import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { recalcularYActualizarRating } from '../lib/ratingLogic'
import { CheckCircle2 } from 'lucide-react'

export default function PuntuarPartido() {
  const { partidoId } = useParams()
  const navigate = useNavigate()
  const [jugadores, setJugadores] = useState<any[]>([])
  const [puntajes, setPuntajes] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchParticipantes()
  }, [])

  async function fetchParticipantes() {
    if (!partidoId) return
    const { data: partido, error } = await supabase
      .from('partidos')
      .select('fecha, formacion, equipos_partido(jugador_id, equipo, posicion_asignada, jugadores(nombre))')
      .eq('id', partidoId)
      .single()

    if (!error && partido && partido.equipos_partido) {
      setJugadores(partido.equipos_partido)
      // Initialize scores at 5
      const initScores: any = {}
      partido.equipos_partido.forEach((ep: any) => {
        initScores[ep.jugador_id] = 5
      })
      setPuntajes(initScores)
    }
    setLoading(false)
  }

  async function guardarPuntajes() {
    setSaving(true)
    try {
      const inserts = Object.keys(puntajes).map(jid => ({
        partido_id: partidoId!,
        jugador_id: jid,
        puntaje: puntajes[jid]
      }))

      // Guardar rendimientos
      const { error: errInsert } = await supabase.from('rendimiento').insert(inserts)
      if (errInsert) {
        // Podría fallar por UNIQUE constraint si ya se puntuaron
        if (errInsert.code === '23505') {
            alert('Este partido ya fue puntuado.')
            navigate('/ranking')
            return
        }
        throw errInsert
      }

      // Recalcular ratings de cada participante
      await Promise.all(Object.keys(puntajes).map(jid => recalcularYActualizarRating(jid)))

      alert('Puntajes guardados y rating actualizado')
      navigate('/ranking')
    } catch (err: any) {
      alert('Error guardando puntajes: ' + err.message)
    }
    setSaving(false)
  }

  if (loading) return <div className="p-4 text-center">Cargando jugadores a puntuar...</div>
  if (!jugadores.length) return <div className="p-4 text-center">Partido no encontrado o sin jugadores</div>

  const equipoA = jugadores.filter(j => j.equipo === 'A')
  const equipoB = jugadores.filter(j => j.equipo === 'B')

  const RenderEquipo = ({ eq, color, title }: { eq: any[], color: string, title: string }) => (
    <div className={`mb-6 p-4 rounded-xl shadow-sm border-t-4 ${color} bg-white`}>
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      {eq.map(j => (
        <div key={j.jugador_id} className="mb-4 pb-4 border-b last:border-0 last:pb-0 last:mb-0">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-gray-800">{j.jugadores.nombre}</div>
            <div className="text-xl font-black text-blue-600">{puntajes[j.jugador_id]}</div>
          </div>
          <input 
            type="range" 
            min="1" max="10" step="0.5"
            value={puntajes[j.jugador_id]}
            onChange={(e) => setPuntajes({...puntajes, [j.jugador_id]: Number(e.target.value)})}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-4 pb-24">
      <div className="bg-blue-600 text-white rounded-xl p-4 mb-6 shadow-md">
        <h2 className="text-lg font-bold">Post Partido</h2>
        <p className="text-sm text-blue-100 mt-1">Califica el rendimiento de cada jugador. Esto afectará su rating general según el algoritmo dinámico.</p>
      </div>

      <RenderEquipo eq={equipoA} color="border-blue-500" title="Barsa" />
      <RenderEquipo eq={equipoB} color="border-orange-500" title="Juve" />

      <button 
        onClick={guardarPuntajes}
        disabled={saving}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold p-4 rounded-xl shadow-lg border-b-4 border-green-700 active:translate-y-1 active:border-b-0 flex justify-center items-center gap-2 transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:active:border-b-4"
      >
        {saving ? 'Guardando/Procesando...' : <><CheckCircle2 size={24}/> Finalizar y Recalcular</>}
      </button>
    </div>
  )
}
