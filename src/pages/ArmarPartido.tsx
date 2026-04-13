import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database.types'
import { armarEquiposInteligente, EquipoArmado } from '../lib/teamBuilderLogic'
import { Users, Shuffle, Save, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'

type Jugador = Database['public']['Tables']['jugadores']['Row']

export default function ArmarPartido() {
  const [activos, setActivos] = useState<Jugador[]>([])
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  
  const [resultado, setResultado] = useState<{equipoA: EquipoArmado, equipoB: EquipoArmado, diferencia: number} | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)
  
  const navigate = useNavigate()

  useEffect(() => {
    fetchActivos()
  }, [])

  async function fetchActivos() {
    const { data } = await supabase.from('jugadores').select('*').eq('activo', true).order('rating', { ascending: false })
    if (data) {
      setActivos(data)
      // Por defecto seleccionar los mejores N según la formación actual para facilitar? Mejor no, dejar que el usuario seleccione.
    }
    setLoading(false)
  }

  function toggleSeleccion(id: string) {
    const newSet = new Set(seleccionados)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSeleccionados(newSet)
    setResultado(null)
  }

  function armar(variacion = false) {
    setBuildError(null)
    const justPlayers = activos.filter(j => seleccionados.has(j.id))
    try {
      const mode = `${justPlayers.length / 2}v${justPlayers.length / 2}`
      const res = armarEquiposInteligente(justPlayers, mode, variacion)
      setResultado(res)
    } catch (err: any) {
      setBuildError(err.message)
    }
  }

  async function guardarPartido() {
    if (!resultado) return
    const formacion = `${seleccionados.size / 2}v${seleccionados.size / 2}`
    const { data: partido, error: pErr } = await supabase.from('partidos').insert({
      formacion
    }).select().single()

    if (pErr || !partido) return alert('Error al crear partido')

    const insertA = resultado.equipoA.jugadores.map(j => ({
      partido_id: partido.id,
      jugador_id: j.id,
      equipo: 'A' as const,
      posicion_asignada: j.posicion_asignada
    }))

    const insertB = resultado.equipoB.jugadores.map(j => ({
      partido_id: partido.id,
      jugador_id: j.id,
      equipo: 'B' as const,
      posicion_asignada: j.posicion_asignada
    }))

    const { error: eqErr } = await supabase.from('equipos_partido').insert([...insertA, ...insertB])
    
    if (eqErr) alert('Error guardando jugadores: ' + eqErr.message)
    else {
        alert('¡Partido guardado con éxito!')
        navigate('/puntuar/' + partido.id)
    }
  }

  if (loading) return <div className="p-4 text-center">Cargando...</div>

  return (
    <div className="p-4 pb-24">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Armar Partido</h2>

        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold text-gray-700 text-sm">Activos Disponibles:</span>
          <span className={clsx("font-bold text-sm px-2 py-0.5 rounded-full", seleccionados.size > 0 && seleccionados.size % 2 === 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
            Seleccionados: {seleccionados.size} {seleccionados.size > 0 && seleccionados.size % 2 === 0 ? `(${seleccionados.size / 2}v${seleccionados.size / 2})` : '(Debe ser par)'}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4 max-h-48 overflow-y-auto p-1">
          {activos.map(j => (
            <div 
              key={j.id} 
              onClick={() => toggleSeleccion(j.id)}
              className={clsx(
                "p-2 rounded-xl text-center border-2 transition-all cursor-pointer font-medium text-xs sm:text-sm",
                seleccionados.has(j.id) ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-200 bg-white hover:border-blue-300"
              )}
            >
              <div className="line-clamp-1">{j.nombre}</div>
              <div className="text-[10px] text-gray-500">{j.posiciones[0]} | ★{j.rating.toFixed(1)}</div>
            </div>
          ))}
        </div>

        {buildError && (
          <div className="p-3 bg-red-50 text-red-700 border-l-4 border-red-500 rounded flex gap-2 items-center text-sm mb-4">
            <AlertTriangle size={18}/> {buildError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={() => armar()} 
            className="flex-1 bg-blue-600 active:bg-blue-700 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Users size={20}/> Armar Original
          </button>
          <button 
            onClick={() => armar(true)} 
            className="bg-purple-600 active:bg-purple-700 text-white p-3 rounded-xl px-4 shadow-md transition-all active:scale-95 flex items-center justify-center"
            title="Añadir variación en los ratings para cambiar equipos"
          >
            <Shuffle size={20}/>
          </button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className={clsx("p-3 rounded-xl text-center font-bold border flex items-center justify-center gap-2", 
              resultado.diferencia <= 2 ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
            )}>
              {resultado.diferencia <= 2 ? "¡Equipos Muy Parejos!" : "Equipos algo desbalanceados"} 
              <span className="text-sm font-normal">(Dif: {resultado.diferencia.toFixed(2)})</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Equipo A */}
            <div className="bg-white rounded-2xl p-4 shadow-md border-t-8 border-t-blue-500 relative">
              <h3 className="font-black text-xl text-blue-900 absolute -top-4 bg-white px-3 rounded-full border border-blue-200 shadow-sm left-1/2 -translate-x-1/2">Barsa</h3>
              <div className="text-center text-xs font-bold text-gray-500 mt-2 mb-3 bg-gray-50 rounded-lg py-1">Overall: ★{resultado.equipoA.totalRating}</div>
              
              <div className="space-y-2">
                {resultado.equipoA.jugadores.map((j) => (
                  <div key={j.id} className="flex justify-between items-center text-sm border-b pb-1">
                    <span className="font-bold text-gray-700">{j.posicion_asignada}</span>
                    <span className="truncate ml-2 flex-1 text-gray-900">{j.nombre}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipo B */}
            <div className="bg-white rounded-2xl p-4 shadow-md border-t-8 border-t-orange-500 relative">
              <h3 className="font-black text-xl text-orange-900 absolute -top-4 bg-white px-3 rounded-full border border-orange-200 shadow-sm left-1/2 -translate-x-1/2">Juve</h3>
              <div className="text-center text-xs font-bold text-gray-500 mt-2 mb-3 bg-gray-50 rounded-lg py-1">Overall: ★{resultado.equipoB.totalRating}</div>
              
              <div className="space-y-2">
                {resultado.equipoB.jugadores.map((j) => (
                  <div key={j.id} className="flex justify-between items-center text-sm border-b pb-1">
                    <span className="font-bold text-gray-700">{j.posicion_asignada}</span>
                    <span className="truncate ml-2 flex-1 text-gray-900">{j.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button onClick={guardarPartido} className="w-full mt-4 bg-green-500 text-white font-bold p-4 rounded-xl shadow-lg border-b-4 border-green-700 active:translate-y-1 active:border-b-0 flex justify-center items-center gap-2">
            <Save size={20}/> Confirmar y Guardar Partido
          </button>
        </div>
      )}

    </div>
  )
}
