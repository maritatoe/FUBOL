import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Database } from '../types/database.types'
import { Plus, X, Edit, Power } from 'lucide-react'
import clsx from 'clsx'

type Jugador = Database['public']['Tables']['jugadores']['Row']

export default function Jugadores() {
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form State
  const [nombre, setNombre] = useState('')
  const [posiciones, setPosiciones] = useState<string[]>([])
  const [puntajeBase, setPuntajeBase] = useState(5)

  const posOptions = ['ARQ', 'DEF', 'MED', 'DEL']

  useEffect(() => {
    fetchJugadores()
  }, [])

  async function fetchJugadores() {
    const { data, error } = await supabase.from('jugadores').select('*').order('nombre')
    if (error) console.error(error)
    else setJugadores(data || [])
    setLoading(false)
  }

  function handleAddOrEdit() {
    if (!nombre.trim() || posiciones.length === 0) return alert('Nombre y al menos una posición requerida')

    if (editingId) {
      supabase.from('jugadores').update({ nombre, posiciones, puntaje_base: puntajeBase }).eq('id', editingId).then(() => {
        setEditingId(null)
        setShowModal(false)
        fetchJugadores()
      })
    } else {
      supabase.from('jugadores').insert({ nombre, posiciones, puntaje_base: puntajeBase, rating: puntajeBase }).then(() => {
        setShowModal(false)
        fetchJugadores()
      })
    }
  }

  async function toggleActivo(j: Jugador) {
    await supabase.from('jugadores').update({ activo: !j.activo }).eq('id', j.id)
    fetchJugadores()
  }

  function openEdit(j: Jugador) {
    setNombre(j.nombre)
    setPosiciones(j.posiciones)
    setPuntajeBase(j.puntaje_base)
    setEditingId(j.id)
    setShowModal(true)
  }

  function openNew() {
    setNombre('')
    setPosiciones([])
    setPuntajeBase(5)
    setEditingId(null)
    setShowModal(true)
  }

  function togglePos(pos: string) {
    if (posiciones.includes(pos)) {
      setPosiciones(posiciones.filter(p => p !== pos))
    } else {
      setPosiciones([...posiciones, pos])
    }
  }

  if (loading) return <div className="p-4 flex justify-center text-gray-500">Cargando jugadores...</div>

  return (
    <div className="p-4 relative min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Plantel ({jugadores.length})</h2>
      </div>

      <div className="grid gap-3 pb-24">
        {jugadores.map((j) => (
          <div key={j.id} className={clsx("bg-white p-4 rounded-xl shadow-sm border-l-4 flex justify-between items-center", j.activo ? "border-green-500" : "border-gray-300 opacity-60")}>
            <div className="flex-1">
              <h3 className={clsx("font-semibold text-lg line-clamp-1", j.activo ? "text-gray-900" : "text-gray-500 line-through")}>{j.nombre}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                  {j.posiciones.join(', ')}
                </span>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 flex items-center rounded-sm">
                  ★ {Number(j.rating).toFixed(1)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => toggleActivo(j)} className={clsx("p-2 rounded-full", j.activo ? "text-green-600 bg-green-50" : "text-gray-400 bg-gray-100")}>
                <Power size={18} />
              </button>
              <button onClick={() => openEdit(j)} className="p-2 rounded-full text-blue-600 bg-blue-50">
                <Edit size={18} />
              </button>
            </div>
          </div>
        ))}
        {jugadores.length === 0 && (
          <div className="text-center text-gray-500 py-10">No hay jugadores registrados.</div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={openNew}
        className="fixed bottom-24 right-4 sm:right-[calc(50%-12rem)] md:right-[calc(50%-15rem)] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-xl transition-transform active:scale-95 z-30"
      >
        <Plus size={24} />
      </button>

      {/* Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-2xl shadow-xl transform transition-all pb-safe">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold">{editingId ? 'Editar Jugador' : 'Nuevo Jugador'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 bg-gray-100 p-2 rounded-full"><X size={20}/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre alias</label>
                <input 
                  type="text" 
                  value={nombre} 
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  placeholder="Ej: Leo Messi"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Posiciones (Múltiple)</label>
                <div className="flex gap-2">
                  {posOptions.map(p => (
                    <button
                      key={p}
                      onClick={() => togglePos(p)}
                      className={clsx(
                        "flex-1 py-2 rounded-lg font-bold border transition-colors",
                        posiciones.includes(p) ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-300 text-gray-500"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 space-x-2">
                  <span>Nivel Base:</span> 
                  <span className="text-blue-600 font-bold text-lg">{puntajeBase}</span>
                </label>
                <input 
                  type="range" 
                  min="1" max="10" step="0.5"
                  value={puntajeBase} 
                  onChange={(e) => setPuntajeBase(Number(e.target.value))}
                  className="w-full accent-blue-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Tronco (1)</span>
                  <span>Crack (10)</span>
                </div>
              </div>

              <button 
                onClick={handleAddOrEdit}
                className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl mt-4 active:scale-[0.98] transition-transform shadow-md shadow-blue-200"
              >
                {editingId ? 'Guardar Cambios' : 'Crear Jugador'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
